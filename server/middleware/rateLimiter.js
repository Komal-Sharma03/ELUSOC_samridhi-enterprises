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
  const message = options.message || "Too many requests. Please try again later.";

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

// Per-endpoint/IP (and optional per-email) throttle using the same in-memory store.
// This keeps logic consistent across the codebase and avoids global limiter conflicts.
const createAuthOtpLimiter = (options = {}) => {
  const windowMs = options.windowMs;
  const maxByIp = options.maxByIp;
  const maxByEmail = options.maxByEmail;
  const message = options.message || "Too many requests. Please try again later.";
  const enableEmail = Boolean(options.enableEmail);
  const logInDev = Boolean(options.logInDev);

  if (!windowMs || !maxByIp) {
    throw new Error("createAuthOtpLimiter requires windowMs and maxByIp");
  }

  return catchAsyncErrors(async (req, res, next) => {
    const now = Date.now();
    pruneExpiredEntries(now);

    const ip = req.ip || req.socket.remoteAddress;
    const email = req?.body?.email;

    // IP-based limiting
    const ipKey = `ip:${ip}`;
    let ipData = ipRequestStore.get(ipKey);
    if (!ipData) {
      ipData = { count: 0, resetTime: now + windowMs };
      ipRequestStore.set(ipKey, ipData);
    }
    ipData.count += 1;
    setRateLimitHeaders(res, maxByIp, maxByIp - ipData.count, ipData.resetTime);

    if (ipData.count > maxByIp) {
      res.setHeader("Retry-After", Math.ceil((ipData.resetTime - now) / 1000));
      if (logInDev && process.env.NODE_ENV === "development") {
        console.warn("[rate-limit] ip", { endpoint: req.originalUrl, ip });
      }
      return next(new ErrorHandler(message, 429));
    }

    // Optional email-based limiting
    if (enableEmail && typeof email === "string" && email.trim()) {
      const emailKey = `email:${email.trim().toLowerCase()}`;
      const maxEmail = Number(maxByEmail) || maxByIp;

      let emailData = ipRequestStore.get(emailKey);
      if (!emailData) {
        emailData = { count: 0, resetTime: now + windowMs };
        ipRequestStore.set(emailKey, emailData);
      }

      emailData.count += 1;
      if (emailData.count > maxEmail) {
        res.setHeader("Retry-After", Math.ceil((emailData.resetTime - now) / 1000));
        if (logInDev && process.env.NODE_ENV === "development") {
          console.warn("[rate-limit] email", {
            endpoint: req.originalUrl,
            email: email.trim().toLowerCase(),
          });
        }
        return next(new ErrorHandler(message, 429));
      }
    }

    next();
  });
};

export { ipRequestStore };
export { createAuthOtpLimiter };

export default rateLimiter;

