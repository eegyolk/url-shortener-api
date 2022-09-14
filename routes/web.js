const express = require("express");

router = express.Router();

router.get("/", (req, res, next) => {
  res.send("Welcome");
});

module.exports = router;
