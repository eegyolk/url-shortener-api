const express = require("express");

router = express.Router();

router.get("/", (req, res, next) => {
  res.send("For app component only");
});

module.exports = router;
