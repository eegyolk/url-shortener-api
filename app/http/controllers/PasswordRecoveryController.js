const path = require("path");

const ValidationException = require("../../exceptions/ValidationException");
const HttpCode = require("../../helpers/HttpCode");
const IPResolver = require("../../helpers/IPResolver");
const Logger = require("../../helpers/Logger");
const ResponseObject = require("../../helpers/ResponseObject");
const Tokenize = require("../../helpers/Tokenize");
const Validation = require("../../helpers/Validation");
const PasswordRecoveryService = require("../../services/PasswordRecoveryService");

const forgotPassword = async (req, res) => {
  const { body, app, headers, ip } = req;
  const rules = PasswordRecoveryService.rules.forgotPassword;

  try {
    const validation = new Validation(body, rules);
    validation.validate();

    const result = await PasswordRecoveryService.validateEmailAddress(
      body.emailAddress
    );
    if (result.hasOwnProperty("error")) {
      const responseObject = new ResponseObject(
        HttpCode.OK,
        0,
        undefined,
        result.error.code,
        result.error.message
      );
      res.status(responseObject.getHttpCode()).json(responseObject.getData());
      return;
    }

    const resetPasswordToken =
      await PasswordRecoveryService.createResetPasswordToken(result);
    if (!resetPasswordToken) {
      throw new Error("Unable to update user record");
    }

    PasswordRecoveryService.sendResetPasswordLink(
      app.locals.event.mailer,
      result,
      resetPasswordToken
    );

    const ipAddress = IPResolver.ipAddress(ip, headers);
    const csrfToken = Tokenize.makeCSRF(ipAddress, headers);

    res.cookie("XSRF-TOKEN", csrfToken, {
      httpOnly: false,
      maxAge: 1000 * 60 * 5, // 5 mins validity
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
      err.message
    );
    res.status(responseObject.getHttpCode()).json(responseObject.getData());

    Logger.log(
      Logger.LEVEL.ERROR,
      {
        err,
        msg: `Error occurred in ${path.basename(__filename)}:sendNew()`,
      },
      req.log
    );
  }
};

module.exports = {
  forgotPassword,
};
