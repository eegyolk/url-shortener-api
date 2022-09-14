const express = require("express");

const SignInController = require("../app/http/controllers/SignInController");

router = express.Router();

router.get("/", (req, res, next) => {
  res.send("For app component only");
});

router.post("/sign-in", SignInController.signIn);

module.exports = router;
