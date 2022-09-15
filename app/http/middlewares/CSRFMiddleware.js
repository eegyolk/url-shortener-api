const path = require("path");

const HttpCode = require("../../helpers/HttpCode");
const IPResolver = require("../../helpers/IPResolver");
const Logger = require("../../helpers/Logger");
const ResponseObject = require("../../helpers/ResponseObject");
const Tokenize = require("../../helpers/Tokenize");

const checkCSRF = function (req, res, next) {
  try {
    const { headers, ip } = req;

    const ipAddress = IPResolver.ipAddress(ip, headers);
    const csrfToken = Tokenize.makeCSRF(ipAddress, headers);
    const xsrfToken = headers["x-xsrf-token"];

    if (csrfToken === xsrfToken) {
      next();
    } else {
      const responseObject = new ResponseObject(
        HttpCode.TOKEN_MISMTACH,
        0,
        undefined,
        1,
        "CSRF token missing or incorrect"
      );
      res.status(responseObject.getHttpCode()).json(responseObject.getData());
    }
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
        msg: `Error occurred in ${path.basename(__filename)}:getHistory()`,
      },
      req.log
    );
  }
};

const checkAuthCSRF = function (req, res, next) {
  try {
    const { session, headers } = req;
    const xsrfToken = headers["x-xsrf-token"];

    if (session.auth.csrf === xsrfToken) {
      next();
    } else {
      const responseObject = new ResponseObject(
        HttpCode.TOKEN_MISMTACH,
        0,
        undefined,
        1,
        "CSRF token missing or incorrect"
      );
      res.status(responseObject.getHttpCode()).json(responseObject.getData());
    }
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
        msg: `Error occurred in ${path.basename(__filename)}:getHistory()`,
      },
      req.log
    );
  }
};

module.exports = {
  checkCSRF,
  checkAuthCSRF,
};
