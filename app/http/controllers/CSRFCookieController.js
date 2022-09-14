const path = require("path");

const HttpCode = require("../../Helpers/HttpCode");
const IPResolver = require("../../Helpers/IPResolver");
const Logger = require("../../Helpers/Logger");
const ResponseObject = require("../../Helpers/ResponseObject");
const Tokenize = require("../../helpers/Tokenize");

const getCSRFCookie = async (req, res) => {
  try {
    const { headers, ip } = req;

    const ipAddress = IPResolver.ipAddress(ip, headers);
    const csrfToken = Tokenize.makeCSRF(ipAddress, headers);

    res.cookie("XSRF-TOKEN", csrfToken);
    res.status(204).send();
  } catch (err) {
    const responseObject = new ResponseObject(
      HttpCode.INTERNAL_SERVER_ERROR,
      "",
      0,
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
