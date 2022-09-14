const bunyan = require("bunyan");
const path = require("path");

const resolveLogDirPath = () => {
  return process.env.LOG_DIR_PATH
    ? process.env.LOG_DIR_PATH
    : path.join(__dirname, "../storage/logs");
};

module.exports = bunyan.createLogger({
  name: "url-shortener-api",
  serializers: {
    err: bunyan.stdSerializers.err,
    req: bunyan.stdSerializers.req,
    res: bunyan.stdSerializers.res,
  },
  streams: [
    {
      level: "info",
      type: "file",
      path: path.join(resolveLogDirPath(), "info.log"),
    },
    {
      level: "debug",
      type: "file",
      path: path.join(resolveLogDirPath(), "debug.log"),
    },
    {
      level: "error",
      type: "file",
      path: path.join(resolveLogDirPath(), "error.log"),
    },
  ],
});
