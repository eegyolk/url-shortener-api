const express = require("express");

// Middlewares
const AuthMiddleware = require("../app/http/middlewares/AuthMiddleware");
const CSRFMiddleware = require("../app/http/middlewares/CSRFMiddleware");
const RealPasswordMiddleware = require("../app/http/middlewares/RealPasswordMiddleware");

// Controllers
const CSRFCookieController = require("../app/http/controllers/CSRFCookieController");
const SignInController = require("../app/http/controllers/SignInController");
const MeController = require("../app/http/controllers/MeController");

const SignUpController = require("../app/http/controllers/AccountRegistry/SignUpController");
const VerificationController = require("../app/http/controllers/VerificationController");

const ForgotPasswordController = require("../app/http/controllers/PasswordRecovery/ForgotPasswordController");
const ResetPasswordController = require("../app/http/controllers/PasswordRecovery/ResetPasswordController");

router = express.Router();

router.get("/", (req, res) => {
  res.send("For app component only");
});

router.get("/csrf-cookie", CSRFCookieController.getCSRFCookie);
router.post("/sign-in", CSRFMiddleware.checkCSRF, SignInController.signIn);

// Account Registry - Begin
router.post(
  "/sign-up",
  [CSRFMiddleware.checkCSRF, RealPasswordMiddleware.resolve],
  SignUpController.signUp
);
router.post(
  "/verify-email",
  CSRFMiddleware.checkCSRF,
  VerificationController.verify
);
router.post(
  "/send-verif-link",
  CSRFMiddleware.checkCSRF,
  VerificationController.sendNew
);
// Account Registry - End

// Password Recovery - Begin
router.post(
  "/forgot-password",
  CSRFMiddleware.checkCSRF,
  ForgotPasswordController.forgotPassword
);
router.post(
  "/reset-password",
  [CSRFMiddleware.checkCSRF, RealPasswordMiddleware.resolve],
  ResetPasswordController.resetPassword
);
// Password Recovery - End

router.get(
  "/me",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  MeController.getMe
);

module.exports = router;
