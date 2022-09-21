const path = require("path");

const ValidationException = require("../../../exceptions/ValidationException");
const HttpCode = require("../../../helpers/HttpCode");
const IPResolver = require("../../../helpers/IPResolver");
const Logger = require("../../../helpers/Logger");
const ResponseObject = require("../../../helpers/ResponseObject");
const Tokenize = require("../../../helpers/Tokenize");
const Validation = require("../../../helpers/Validation");
const ForgotPasswordService = require("../../../services/PasswordRecovery/ForgotPasswordService");

const forgotPassword = async (req, res) => {
  const { body, headers, ip } = req;
  const rules = ForgotPasswordService.rules;

  try {
    const validation = new Validation(body, rules);
    validation.validate();

    const validateEmailAddressResult =
      await ForgotPasswordService.validateEmailAddress(body.emailAddress);
    if (validateEmailAddressResult.hasOwnProperty("error")) {
      const responseObject = new ResponseObject(
        HttpCode.OK,
        0,
        undefined,
        validateEmailAddressResult.error.code,
        validateEmailAddressResult.error.message
      );
      res.status(responseObject.getHttpCode()).json(responseObject.getData());
      return;
    }

    const createResetPasswordTokenResult =
      await ForgotPasswordService.createResetPasswordToken(
        validateEmailAddressResult.user
      );
    if (createResetPasswordTokenResult.hasOwnProperty("error")) {
      const responseObject = new ResponseObject(
        HttpCode.INTERNAL_SERVER_ERROR,
        0,
        undefined,
        createResetPasswordTokenResult.error.code,
        createResetPasswordTokenResult.error.message
      );
      res.status(responseObject.getHttpCode()).json(responseObject.getData());
      return;
    }

    ForgotPasswordService.sendResetPasswordLink(
      G_EVENTS.mailer,
      validateEmailAddressResult.user,
      createResetPasswordTokenResult.base64
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
      "Something went wrong while the server process the request."
    );
    res.status(responseObject.getHttpCode()).json(responseObject.getData());

    Logger.log(
      Logger.LEVEL.ERROR,
      {
        err,
        msg: `Error occurred in ${path.basename(__filename)}:forgotPassword()`,
      },
      req.log
    );
  }
};

module.exports = {
  forgotPassword,
};
