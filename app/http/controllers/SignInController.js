const path = require("path");

const ValidationException = require("../../exceptions/ValidationException");
const HttpCode = require("../../helpers/HttpCode");
const Logger = require("../../helpers/Logger");
const ResponseObject = require("../../helpers/ResponseObject");
const Tokenize = require("../../helpers/Tokenize");
const Validation = require("../../helpers/Validation");
const SignInService = require("../../services/SignInService");

const signIn = async (req, res) => {
  const { body } = req;
  const rules = SignInService.rules;

  try {
    const validation = new Validation(body, rules);
    validation.validate();

    const user = await SignInService.getUserByEmailAddress(body.emailAddress);
    if (!user) {
      const responseObject = new ResponseObject(
        HttpCode.OK,
        0,
        undefined,
        SignInService.errors[1].code,
        SignInService.errors[1].message
      );
      res.status(responseObject.getHttpCode()).json(responseObject.getData());
      return;
    }

    const isValid = SignInService.validatePassword(
      body.password,
      user.password
    );
    if (!isValid) {
      const responseObject = new ResponseObject(
        HttpCode.OK,
        0,
        undefined,
        SignInService.errors[1].code,
        SignInService.errors[1].message
      );
      res.status(responseObject.getHttpCode()).json(responseObject.getData());
      return;
    }

    if (user.deleted_at) {
      const responseObject = new ResponseObject(
        HttpCode.OK,
        0,
        undefined,
        SignInService.errors[2].code,
        SignInService.errors[2].message
      );
      res.status(responseObject.getHttpCode()).json(responseObject.getData());
      return;
    }

    const updatedUser = await SignInService.updateUser(user.id);
    if (!updatedUser) {
      throw new Error("Unable to update user record");
    }

    const csrfToken = Tokenize.makeAuthCSRF(Date.now(), updatedUser);
    req.session.auth = {
      user: updatedUser,
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

    const responseObject = new ResponseObject(HttpCode.OK, 1, updatedUser);
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
  signIn,
};
