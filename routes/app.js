const express = require("express");

// Middlewares
const AuthMiddleware = require("../app/http/middlewares/AuthMiddleware");
const CSRFMiddleware = require("../app/http/middlewares/CSRFMiddleware");

// Controllers
const CSRFCookieController = require("../app/http/controllers/CSRFCookieController");
const MeController = require("../app/http/controllers/MeController");
const SignInController = require("../app/http/controllers/SignInController");

router = express.Router();

router.get("/", (req, res) => {
  res.send("For app component only");
});

router.get("/csrf-cookie", CSRFCookieController.getCSRFCookie);
router.post("/sign-in", CSRFMiddleware.checkCSRF, SignInController.signIn);
router.get(
  "/me",
  [CSRFMiddleware.checkAuthCSRF, AuthMiddleware.checkAuth],
  MeController.getMe
);

module.exports = router;
