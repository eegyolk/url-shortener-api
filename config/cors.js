module.exports = {
  allowedOrigin: process.env.CORS_ALLOWED_ORIGIN.split(",").map(item =>
    item.toString().trim()
  ),
};
