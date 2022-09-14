const path = require("path");

const HttpCode = require("../../helpers/HttpCode");
const IPResolver = require("../../helpers/IPResolver");
const Logger = require("../../helpers/Logger");
const ResponseObject = require("../../helpers/ResponseObject");
const Tokenize = require("../../helpers/Tokenize");

const getCSRFCookie = async (req, res) => {
  const { headers, ip } = req;

  try {
    const ipAddress = IPResolver.ipAddress(ip, headers);
    const csrfToken = Tokenize.makeCSRF(ipAddress, headers);

    // This token will expire in 5secs
    res.cookie("XSRF-TOKEN", csrfToken, {
      httpOnly: false,
      maxAge: 1000 * 5,
    });
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
