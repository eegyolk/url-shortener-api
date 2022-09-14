const appConfig = require("../../config/app");

module.exports.ENV = {
  LOCAL: "local",
  DEV: "dev",
  STAGE: "stage",
  PROD: "prod",
  TEST: "test",
};

module.exports.currentEnv = appConfig.env;
