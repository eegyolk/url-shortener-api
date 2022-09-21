const path = require("path");

const HttpCode = require("../../../helpers/HttpCode");
const Logger = require("../../../helpers/Logger");
const ResponseObject = require("../../../helpers/ResponseObject");
const Tokenize = require("../../../helpers/Tokenize");
const MeService = require("../../../services/Authentication/MeService");

const getMe = async (req, res) => {
  const { session } = req;

  try {
    const getMeResult = await MeService.getMe(session.auth.user.id);
    if (getMeResult.hasOwnProperty("error")) {
      const responseObject = new ResponseObject(
        HttpCode.OK,
        0,
        undefined,
        getMeResult.error.code,
        getMeResult.error.message
      );
      res.status(responseObject.getHttpCode()).json(responseObject.getData());
      return;
    }

    const csrfToken = Tokenize.makeAuthCSRF(Date.now(), user);
    req.session.auth = {
      user: user,
      csrf: csrfToken,
    };
    req.session.save();
    res.cookie("XSRF-TOKEN", csrfToken, {
      httpOnly: false,
      maxAge: 1000 * 60 * 60, // 1 hour validity
    });

    const responseObject = new ResponseObject(HttpCode.OK, 1, user);
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
        msg: `Error occurred in ${path.basename(__filename)}:getMe()`,
      },
      req.log
    );
  }
};

module.exports = {
  getMe,
};
