const path = require("path");

const sessionConfig = require("../../../../config/session");
const HttpCode = require("../../../helpers/HttpCode");
const IPResolver = require("../../../helpers/IPResolver");
const Logger = require("../../../helpers/Logger");
const ResponseObject = require("../../../helpers/ResponseObject");
const Tokenize = require("../../../helpers/Tokenize");
const SignOutService = require("../../../services/Authentication/SignOutService");

const signOut = async (req, res) => {
  const { session, headers, ip } = req;
  const { id, auth } = session;

  try {
    const clearSessionResult = await SignOutService.clearSession(id);
    if (clearSessionResult.hasOwnProperty("error")) {
      const responseObject = new ResponseObject(
        HttpCode.INTERNAL_SERVER_ERROR,
        0,
        undefined,
        1,
        JSON.stringify(clearSessionResult.error)
      );
      res.status(responseObject.getHttpCode()).json(responseObject.getData());
      return;
    }

    req.session.destroy();

    const updateUserResult = await SignOutService.updateUser(auth.user.id);
    if (updateUserResult.hasOwnProperty("error")) {
      const responseObject = new ResponseObject(
        HttpCode.INTERNAL_SERVER_ERROR,
        0,
        undefined,
        updateUserResult.error.code,
        updateUserResult.error.message
      );
      res.status(responseObject.getHttpCode()).json(responseObject.getData());
      return;
    }

    const ipAddress = IPResolver.ipAddress(ip, headers);
    const csrfToken = Tokenize.makeCSRF(ipAddress, headers);

    res.cookie("XSRF-TOKEN", csrfToken, {
      httpOnly: false,
      maxAge: 1000 * 60 * 5, // 5 mins validity
    });
    res.clearCookie(sessionConfig.name);

    const responseObject = new ResponseObject(HttpCode.OK, 1);
    res.status(responseObject.getHttpCode()).json(responseObject.getData());
  } catch (err) {
    const responseObject = new ResponseObject(
      HttpCode.INTERNAL_SERVER_ERROR,
      0,
      undefined,
      1,
      "Something went wrong while the server process the request."
    );
    res.status(responseObject.getHttpCode()).json(responseObject.getData());

    Logger.log(
      Logger.LEVEL.ERROR,
      {
        err,
        msg: `Error occurred in ${path.basename(__filename)}:signOut()`,
      },
      req.log
    );
  }
};

module.exports = {
  signOut,
};
