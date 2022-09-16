const crypto = require("crypto-js");
const jwt = require("jsonwebtoken");
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

const makeAuthCSRF = (timestamp, userData) => {
  const tempUserData = Object.keys(userData)
    .sort()
    .map(item => userData[item]);

  tempUserData.push(timestamp);

  const hash = crypto.HmacSHA512(
    `${tempUserData.join(",")}`,
    appConfig.secretKey
  );

  return hash.toString(crypto.enc.Base64);
};

const makeVerificationToken = data => {
  const token = jwt.sign(data, appConfig.secretKey, {
    expiresIn: "1d",
  });
  const md5 = crypto.MD5(token);

  return { token, md5: md5.toString() };
};

module.exports = {
  makeCSRF,
  makeAuthCSRF,
  makeVerificationToken,
};
