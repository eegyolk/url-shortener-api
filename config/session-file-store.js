const path = require("path");

module.exports = {
  path:
    process.env.SESSION_FILE_DIR_PATH ||
    path.join(__dirname, "../storage/sessions"),
  ttl: 3600 * parseInt(process.env.SESSION_TTL ? process.env.SESSION_TTL : 1),
  secret: process.env.APP_SECRET_KEY,
};
