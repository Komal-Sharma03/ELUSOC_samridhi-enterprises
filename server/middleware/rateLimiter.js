import catchAsyncErrors from "./catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";

// In-memory cache for IP request tracking. This store is process-local, so limits
// are not shared across multiple server instances or deployments.
const ipRequestStore = new Map();

const pruneExpiredEntries = (now) => {
  for (const [ip, data] of ipRequestStore.entries()) {
    if (now > data.resetTime) {
      ipRequestStore.delete(ip);
    }
  }
};

const setRateLimitHeaders = (res, limit, remaining, resetTime) => {
  res.setHeader("X-RateLimit-Limit", limit);
  res.setHeader("X-RateLimit-Remaining", Math.max(0, remaining));
  res.setHeader("X-RateLimit-Reset", Math.ceil(resetTime / 1000));
};

/**
 * Custom lightweight rate limiting middleware to prevent API abuse and brute-force.
 * Uses an in-memory, process-local fixed window per client IP.
 * If the app runs behind a reverse proxy, configure Express `trust proxy` so
 * req.ip resolves to the real client IP.
 *
 * @param {Object} options Configuration options
 * @param {number} options.windowMs Time window in milliseconds (default 15 minutes)
 * @param {number} options.max Maximum requests allowed in the window (default 100)
 * @param {string} options.message Error message to send when limit is exceeded
 */
const rateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 mins
  const max = options.max || 100;
  const message = options.message || "Too many requests from this IP, please try again later.";

  return catchAsyncErrors(async (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress;
    const now = Date.now();
    pruneExpiredEntries(now);

    let clientData = ipRequestStore.get(ip);

    if (!clientData) {
      clientData = {
        count: 0,
        resetTime: now + windowMs,
      };
      ipRequestStore.set(ip, clientData);
    }

    clientData.count += 1;
    setRateLimitHeaders(res, max, max - clientData.count, clientData.resetTime);

    if (clientData.count > max) {
      res.setHeader("Retry-After", Math.ceil((clientData.resetTime - now) / 1000));
      return next(new ErrorHandler(message, 429));
    }

    next();
  });
};

export { ipRequestStore };
export default rateLimiter;
