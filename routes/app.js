const express = require("express");

// Middleware
const RateLimitMiddleware = require("../app/Http/Middleware/RateLimitMiddleware");
const VerificationProcedureMiddleware = require("../app/Http/Middleware/VerificationProcedureMiddleware");

// Controllers
const SystemInfoController = require("../app/Http/Controllers/SystemInfoController");

router = express.Router();

router.get(
  "/",
  [VerificationProcedureMiddleware.selfCheck, RateLimitMiddleware.homePage],
  SystemInfoController.systemInfo
);

module.exports = router;
