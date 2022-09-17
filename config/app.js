const EventEmitter = require("events");

module.exports = {
  name: process.env.APP_NAME || "url.shortener",
  env: process.env.APP_ENV || "local",
  secretKey:
    process.env.APP_SECRET_KEY ||
    new EventEmitter().emit("error", new Error("APP_SECRET_KEY is missing!")),
  protocol: process.env.APP_PROTOCOL || "http",
  domain: process.env.APP_DOMAIN || "localhost",
  port: process.env.APP_PORT || 3000,
  debug: process.env.APP_DEBUG || false,
  supportEmail:
    process.env.APP_SUPPORT_EMAIL ||
    new EventEmitter().emit(
      "error",
      new Error("APP_SUPPORT_EMAIL is missing!")
    ),
};
