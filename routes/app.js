const express = require("express");

// Middlewares
const CSRFMiddleware = require("../app/http/middlewares/CSRFMiddleware");

// Controllers
const CSRFCookieController = require("../app/http/controllers/CSRFCookieController");
const SignInController = require("../app/http/controllers/SignInController");

router = express.Router();

router.get("/", (req, res, next) => {
  res.send("For app component only");
});

router.get("/csrf-cookie", CSRFCookieController.getCSRFCookie);
router.post("/sign-in", CSRFMiddleware.checkCSRF, SignInController.signIn);

module.exports = router;
