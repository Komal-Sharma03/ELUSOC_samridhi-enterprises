import assert from "node:assert/strict";
import rateLimiter, { ipRequestStore } from "../middleware/rateLimiter.js";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const createResponse = () => {
  const headers = {};

  return {
    headers,
    setHeader(name, value) {
      headers[name] = value;
    },
  };
};

const callLimiter = (limiter, ip) =>
  new Promise((resolve) => {
    const req = {
      ip,
      socket: {
        remoteAddress: ip,
      },
    };
    const res = createResponse();

    limiter(req, res, (err) => {
      resolve({ err, headers: res.headers });
    });
  });

const limiter = rateLimiter({
  max: 2,
  windowMs: 50,
  message: "Rate limit reached",
});

ipRequestStore.clear();

const firstRequest = await callLimiter(limiter, "203.0.113.10");
assert.equal(firstRequest.err, undefined);
assert.equal(firstRequest.headers["X-RateLimit-Limit"], 2);
assert.equal(firstRequest.headers["X-RateLimit-Remaining"], 1);
assert.ok(firstRequest.headers["X-RateLimit-Reset"]);

const secondRequest = await callLimiter(limiter, "203.0.113.10");
assert.equal(secondRequest.err, undefined);
assert.equal(secondRequest.headers["X-RateLimit-Remaining"], 0);

const blockedRequest = await callLimiter(limiter, "203.0.113.10");
assert.equal(blockedRequest.err.statusCode, 429);
assert.equal(blockedRequest.err.message, "Rate limit reached");
assert.equal(blockedRequest.headers["X-RateLimit-Remaining"], 0);
assert.ok(blockedRequest.headers["Retry-After"]);

const otherIpRequest = await callLimiter(limiter, "203.0.113.11");
assert.equal(otherIpRequest.err, undefined);
assert.equal(otherIpRequest.headers["X-RateLimit-Remaining"], 1);

await wait(60);

const resetRequest = await callLimiter(limiter, "203.0.113.10");
assert.equal(resetRequest.err, undefined);
assert.equal(resetRequest.headers["X-RateLimit-Remaining"], 1);

console.log("Rate limiter verification passed.");
