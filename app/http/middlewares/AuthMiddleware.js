const path = require("path");

const HttpCode = require("../../helpers/HttpCode");
const Logger = require("../../helpers/Logger");
const ResponseObject = require("../../helpers/ResponseObject");

const checkAuth = function (req, res, next) {
  try {
    const { session } = req;

    if (session.auth) {
      next();
    } else {
      const responseObject = new ResponseObject(
        HttpCode.FORBIDDEN,
        0,
        undefined,
        1,
        "No permission to access this resource"
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
  checkAuth,
};
