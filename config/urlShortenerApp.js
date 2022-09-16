const EventEmitter = require("events");

module.exports = {
  protocol: process.env.URL_SHORTENER_APP_PROTOCOL || "http",
  domain:
    process.env.URL_SHORTENER_APP_DOMAIN ||
    new EventEmitter().emit(
      "error",
      new Error("URL_SHORTENER_APP_DOMAIN is missing!")
    ),
  port: process.env.URL_SHORTENER_APP_PORT || "9030",
};
