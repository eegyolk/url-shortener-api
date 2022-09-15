const path = require("path");

const HttpCode = require("../../helpers/HttpCode");
const IPResolver = require("../../helpers/IPResolver");
const Logger = require("../../helpers/Logger");
const ResponseObject = require("../../helpers/ResponseObject");
const Tokenize = require("../../helpers/Tokenize");

const getCSRFCookie = async (req, res) => {
  const { session, headers, ip } = req;

  try {
    if (session.auth) {
      const csrfToken = Tokenize.makeAuthCSRF(Date.now(), session.auth.user);
      req.session.auth = {
        user,
        csrf: csrfToken,
      };
      req.session.save(function (err) {
        if (err) {
          throw new Error("Unable to save session");
        }
      });
      res.cookie("XSRF-TOKEN", csrfToken, {
        httpOnly: false,
        maxAge: 1000 * 60 * 60, // 1 hour validity
      });
    } else {
      const ipAddress = IPResolver.ipAddress(ip, headers);
      const csrfToken = Tokenize.makeCSRF(ipAddress, headers);

      res.cookie("XSRF-TOKEN", csrfToken, {
        httpOnly: false,
        maxAge: 1000 * 5, // 5 secs validity
      });
    }

    res.status(204).send();
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
  getCSRFCookie,
};
