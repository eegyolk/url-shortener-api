const path = require("path");

const HttpCode = require("../../../helpers/HttpCode");
const Logger = require("../../../helpers/Logger");
const ResponseObject = require("../../../helpers/ResponseObject");
const Tokenize = require("../../../helpers/Tokenize");
const MeService = require("../../../services/Authentication/MeService");

const getMe = async (req, res) => {
  const { session } = req;

  try {
    const user = await MeService.getMe(session.auth.user.id);
    if (!user) {
      throw new Error("Unable to find user record");
    }

    if (!user.verified_at) {
      const responseObject = new ResponseObject(
        HttpCode.OK,
        0,
        undefined,
        MeService.errors[1].code,
        MeService.errors[1].message
      );
      res.status(responseObject.getHttpCode()).json(responseObject.getData());
      return;
    }

    if (user.deleted_at) {
      const responseObject = new ResponseObject(
        HttpCode.OK,
        0,
        undefined,
        MeService.errors[2].code,
        MeService.errors[2].message
      );
      res.status(responseObject.getHttpCode()).json(responseObject.getData());
      return;
    }

    const csrfToken = Tokenize.makeAuthCSRF(Date.now(), user);
    req.session.auth = {
      user: user,
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

    const responseObject = new ResponseObject(HttpCode.OK, 1, user);
    res.status(responseObject.getHttpCode()).json(responseObject.getData());
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
        msg: `Error occurred in ${path.basename(__filename)}:getMe()`,
      },
      req.log
    );
  }
};

module.exports = {
  getMe,
};
