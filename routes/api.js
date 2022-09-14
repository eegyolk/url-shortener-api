const express = require("express");

router = express.Router();

router.get("/", (req, res, next) => {
  res.send("For api component only");
});

module.exports = router;
