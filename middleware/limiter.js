const { rateLimit } = require("express-rate-limit");
const locals = require("../utils/locals.json");
const RedisStore = require("rate-limit-redis");
const client = require("../utils/redis-client");

module.exports.createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 25, // Limit each IP to 5 create account requests per `window` (here, per hour)
  message: locals.error_429,
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  store: new RedisStore({
    sendCommand: (...args) => client.call(...args),
  }),
});

module.exports.loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 7 minutes
  limit: 25, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  store: new RedisStore({
    sendCommand: (...args) => client.call(...args),
  }),
});
