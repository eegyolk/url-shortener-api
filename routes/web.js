const express = require("express");

router = express.Router();

router.get("/", (req, res, next) => {
  res.send("For web component only");
});

module.exports = router;
