const crypto = require("crypto-js");
const path = require("path");

const HttpCode = require("../../helpers/HttpCode");
const Logger = require("../../helpers/Logger");
const ResponseObject = require("../../helpers/ResponseObject");

const resolve = function (req, res, next) {
  const { body, headers } = req;
  try {
    const password = body.password;
    const csrf = headers["x-xsrf-token"];
    const realPassword = crypto.AES.decrypt(password, csrf);

    req.body.password = realPassword.toString(crypto.enc.Utf8);

    next();
  } catch (err) {
    const responseObject = new ResponseObject(
      HttpCode.INTERNAL_SERVER_ERROR,
      0,
      undefined,
      1,
      err.message
    );
    res.status(responseObject.getHttpCode()).json(responseObject.getData());

    Logger.log(
      Logger.LEVEL.ERROR,
      {
        err,
        msg: `Error occurred in ${path.basename(__filename)}:resolve()`,
      },
      req.log
    );
  }
};

module.exports = {
  resolve,
};
