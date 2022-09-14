const path = require("path");

module.exports = {
  cookie: {
    domain: process.env.SESSION_COOKIE_DOMAIN || "localhost",
    httpOnly: true, // TODO: review for production
    maxAge: 0, // TODO: review for production
    path: "/", // TODO: review for production
    sameSite: false, // TODO: review for production
    secure: false, // Set to true in production since we'll going to use https connection
  },
  name: "url-shortener-api.sid",
  proxy: false,
  resave: true,
  rolling: false,
  saveUninitialized: false,
  secret: process.env.APP_SECRET_KEY,
  unset: "destroy",
};
