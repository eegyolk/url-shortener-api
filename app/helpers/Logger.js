const appConfig = require("../../config/app");
const logConfig = require("../../config/log");
const Environment = require("./Environment");

const enableLogging = () => {
  let enable = false;

  if (
    [Environment.ENV.LOCAL, Environment.ENV.DEV].includes(
      Environment.currentEnv
    )
  ) {
    enable = true;
  }

  if (
    [
      Environment.ENV.STAGE,
      Environment.ENV.PROD,
      Environment.ENV.TEST,
    ].includes(Environment.currentEnv)
  ) {
    enable = false;
  }

  if (!!JSON.parse(String(appConfig.debug).toLowerCase())) {
    enable = true;
  }

  return enable;
};

module.exports.LEVEL = {
  DEBUG: 20,
  INFO: 30,
  ERROR: 50,
  FATAL: 60,
};

module.exports.log = function (level, messageObject, loggerObject = null) {
  let logger = logConfig;
  if (loggerObject) {
    logger = loggerObject;
  }

  const { err, msg } = messageObject;

  switch (level) {
    case this.LEVEL.DEBUG:
      if (enableLogging()) {
        logger.debug(msg);
      }
      break;
    case this.LEVEL.INFO:
      if (enableLogging()) {
        logger.debug(msg);
      }
      break;
    case this.LEVEL.FATAL:
      if (enableLogging()) {
        logger.fatal(msg);
      }
      break;
    case this.LEVEL.ERROR:
      if (enableLogging()) {
        logger.error({ err }, msg);
      }
      break;
    default:
      if (enableLogging()) {
        logger.debug("Something went wrong.");
      }
      break;
  }
};
