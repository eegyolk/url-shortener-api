const express = require("express");

// Middlewares
const AuthMiddleware = require("../app/http/middlewares/AuthMiddleware");
const CSRFMiddleware = require("../app/http/middlewares/CSRFMiddleware");
const RealPasswordMiddleware = require("../app/http/middlewares/RealPasswordMiddleware");

// Controllers
const CSRFCookieController = require("../app/http/controllers/CSRFCookieController");

const SignInController = require("../app/http/controllers/Authentication/SignInController");
const MeController = require("../app/http/controllers/Authentication/MeController");
const SignOutController = require("../app/http/controllers/Authentication/SignOutController");

const SignUpController = require("../app/http/controllers/AccountRegistry/SignUpController");
const VerifyAccountController = require("../app/http/controllers/AccountRegistry/VerifyAccountController");
const ResendVerificationController = require("../app/http/controllers/AccountRegistry/ResendVerificationController");

const ForgotPasswordController = require("../app/http/controllers/PasswordRecovery/ForgotPasswordController");
const ResetPasswordController = require("../app/http/controllers/PasswordRecovery/ResetPasswordController");

router = express.Router();

router.get("/", (req, res) => {
  res.send("For app component only");
});
router.get("/csrf-cookie", CSRFCookieController.getCSRFCookie);

// Authentication - Begin
router.post("/sign-in", CSRFMiddleware.checkCSRF, SignInController.signIn);
router.get(
  "/me",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  MeController.getMe
);
router.post(
  "/sign-out",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  SignOutController.signOut
);
// Authentication - End

// Account Registry - Begin
router.post(
  "/sign-up",
  [CSRFMiddleware.checkCSRF, RealPasswordMiddleware.resolve],
  SignUpController.signUp
);
router.post(
  "/verify-account",
  CSRFMiddleware.checkCSRF,
  VerifyAccountController.verifyAccount
);
router.post(
  "/resend-verification",
  CSRFMiddleware.checkCSRF,
  ResendVerificationController.resendVerification
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

module.exports = router;
