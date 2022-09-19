const express = require("express");

// Middlewares
const AuthMiddleware = require("../app/http/middlewares/AuthMiddleware");
const CSRFMiddleware = require("../app/http/middlewares/CSRFMiddleware");
const RealPasswordMiddleware = require("../app/http/middlewares/RealPasswordMiddleware");

// Controllers
const CSRFCookieController = require("../app/http/controllers/CSRFCookieController");
const ForgotPasswordController = require("../app/http/controllers/PasswordRecovery/ForgotPasswordController");
const ResetPasswordController = require("../app/http/controllers/PasswordRecovery/ResetPasswordController");
const MeController = require("../app/http/controllers/MeController");
const SignInController = require("../app/http/controllers/SignInController");
const SignUpController = require("../app/http/controllers/SignUpController");
const VerificationController = require("../app/http/controllers/VerificationController");

router = express.Router();

router.get("/", (req, res) => {
  res.send("For app component only");
});

router.get("/csrf-cookie", CSRFCookieController.getCSRFCookie);
router.post("/sign-in", CSRFMiddleware.checkCSRF, SignInController.signIn);
router.post(
  "/forgot-password",
  CSRFMiddleware.checkCSRF,
  ForgotPasswordController.forgotPassword
);
router.post(
  "/reset-password",
  CSRFMiddleware.checkCSRF,
  ResetPasswordController.resetPassword
);

router.post(
  "/sign-up",
  [CSRFMiddleware.checkCSRF, RealPasswordMiddleware.resolve],
  SignUpController.signUp
);
router.post("/verify", CSRFMiddleware.checkCSRF, VerificationController.verify);
router.post(
  "/send-verif-link",
  CSRFMiddleware.checkCSRF,
  VerificationController.sendNew
);

router.get(
  "/me",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  MeController.getMe
);

module.exports = router;
