const path = require("path");

module.exports = {
  cookie: {
    domain: process.env.SESSION_COOKIE_DOMAIN || "localhost",
    httpOnly: true,
    maxAge:
      3600000 *
      parseInt(
        process.env.SESSION_COOKIE_MAX_AGE
          ? process.env.SESSION_COOKIE_MAX_AGE
          : 1
      ),
    path: "/", // TODO: review for production
    sameSite: false, // TODO: review for production
    secure: false, // Set to true in production since we'll going to use https connection
  },
  name: "urshap.connect.sid",
  proxy: false,
  resave: true,
  rolling: false,
  saveUninitialized: false,
  secret: process.env.APP_SECRET_KEY,
  unset: "destroy",
};
