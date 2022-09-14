const crypto = require("crypto-js");
const appConfig = require("../../config/app");

const makeCSRF = (resolvedIp, headers) => {
  const tempHeaders = Object.keys(headers)
    .sort()
    .map(item => {
      if (
        [
          "accept",
          "accept-language",
          "host",
          "origin",
          "accept-encoding",
          "connection",
          "referer",
          "user-agent",
        ].includes(item)
      ) {
        return headers[item];
      } else {
        return;
      }
    })
    .filter(item => item !== undefined);

  tempHeaders.push(resolvedIp);

  const hash = crypto.HmacSHA512(
    `${tempHeaders.join(",")}`,
    appConfig.secretKey
  );

  return hash.toString(crypto.enc.Base64);
};

module.exports = {
  makeCSRF,
};
