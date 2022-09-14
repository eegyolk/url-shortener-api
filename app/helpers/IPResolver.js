const Environment = require("./Environment");

const ipAddress = (ip, headers) => {
  if (
    [Environment.ENV.LOCAL, Environment.ENV.TEST].includes(
      Environment.currentEnv
    )
  ) {
    return ip;
  } else {
    const realIps = headers["x-real-ip"].split(",");
    return realIps[0];
  }
};

module.exports = {
  ipAddress,
};
