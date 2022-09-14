const EventEmitter = require("events");

module.exports = {
  env: process.env.APP_ENV || "local",
  secretKey:
    process.env.APP_SECRET_KEY ||
    new EventEmitter().emit("error", new Error("APP_SECRET_KEY is missing!")),
  protocol: process.env.APP_PROTOCOL || "http",
  domain: process.env.APP_DOMAIN || "localhost",
  port: process.env.APP_PORT || 3000,
  debug: process.env.APP_DEBUG || false,
};
