const path = require("path");

const ValidationException = require("../../../exceptions/ValidationException");
const HttpCode = require("../../../helpers/HttpCode");
const Logger = require("../../../helpers/Logger");
const ResponseObject = require("../../../helpers/ResponseObject");
const Tokenize = require("../../../helpers/Tokenize");
const Validation = require("../../../helpers/Validation");
const SignInService = require("../../../services/Authentication/SignInService");

const signIn = async (req, res) => {
  const { body } = req;
  const rules = SignInService.rules;

  try {
    const validation = new Validation(body, rules);
    validation.validate();

    const getUserByEmailAddressResult =
      await SignInService.getUserByEmailAddress(body.emailAddress);

    const validatePasswordResult = SignInService.validatePassword(
      body.password,
      getUserByEmailAddressResult.hasOwnProperty("user")
        ? getUserByEmailAddressResult.user.password
        : "password"
    );

    if (validatePasswordResult.hasOwnProperty("error")) {
      const responseObject = new ResponseObject(
        HttpCode.OK,
        0,
        undefined,
        validatePasswordResult.error.code,
        validatePasswordResult.error.message
      );
      res.status(responseObject.getHttpCode()).json(responseObject.getData());
      return;
    }

    if (getUserByEmailAddressResult.hasOwnProperty("error")) {
      const responseObject = new ResponseObject(
        HttpCode.OK,
        0,
        undefined,
        getUserByEmailAddressResult.error.code,
        getUserByEmailAddressResult.error.message
      );
      res.status(responseObject.getHttpCode()).json(responseObject.getData());
      return;
    }

    const clearLastSessionResult = await SignInService.clearLastSession(
      getUserByEmailAddressResult.user.session_id
    );
    if (clearLastSessionResult.hasOwnProperty("error")) {
      const responseObject = new ResponseObject(
        HttpCode.INTERNAL_SERVER_ERROR,
        0,
        undefined,
        clearLastSessionResult.error.code,
        clearLastSessionResult.error.message
      );
      res.status(responseObject.getHttpCode()).json(responseObject.getData());
      return;
    }

    const updatedUserResult = await SignInService.updateUser(
      getUserByEmailAddressResult.user.id,
      req.session.id
    );
    if (updatedUserResult.hasOwnProperty("error")) {
      const responseObject = new ResponseObject(
        HttpCode.INTERNAL_SERVER_ERROR,
        0,
        undefined,
        updatedUserResult.error.code,
        updatedUserResult.error.message
      );
      res.status(responseObject.getHttpCode()).json(responseObject.getData());
      return;
    }

    const csrfToken = Tokenize.makeAuthCSRF(Date.now(), updatedUserResult);
    req.session.auth = {
      user: updatedUserResult,
      csrf: csrfToken,
    };
    req.session.save();
    res.cookie("XSRF-TOKEN", csrfToken, {
      httpOnly: false,
      maxAge: 1000 * 60 * 60, // 1 hour validity
    });

    const responseObject = new ResponseObject(HttpCode.OK, 1);
    res.status(responseObject.getHttpCode()).json(responseObject.getData());
  } catch (err) {
    if (err instanceof ValidationException) {
      res.status(err.getStatus()).json(err.getErrors());
      return;
    }

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
        msg: `Error occurred in ${path.basename(__filename)}:signIn()`,
      },
      req.log
    );
  }
};

module.exports = {
  signIn,
};
