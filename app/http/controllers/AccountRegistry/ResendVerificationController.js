const path = require("path");

const ValidationException = require("../../../exceptions/ValidationException");
const HttpCode = require("../../../helpers/HttpCode");
const IPResolver = require("../../../helpers/IPResolver");
const Logger = require("../../../helpers/Logger");
const ResponseObject = require("../../../helpers/ResponseObject");
const Tokenize = require("../../../helpers/Tokenize");
const Validation = require("../../../helpers/Validation");
const ResendVerificationService = require("../../../services/AccountRegistry/ResendVerificationService");

const resendVerification = async (req, res) => {
  const { body, headers, ip } = req;
  const rules = ResendVerificationService.rules;

  try {
    const validation = new Validation(body, rules);
    validation.validate();

    const validateEmailAddressResult =
      await ResendVerificationService.validateEmailAddress(body.emailAddress);
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

    const regenVerificationTokenResult =
      await ResendVerificationService.regenVerificationToken(
        validateEmailAddressResult.user
      );
    if (regenVerificationTokenResult.hasOwnProperty("error")) {
      const responseObject = new ResponseObject(
        HttpCode.INTERNAL_SERVER_ERROR,
        0,
        undefined,
        regenVerificationTokenResult.error.code,
        regenVerificationTokenResult.error.message
      );
      res.status(responseObject.getHttpCode()).json(responseObject.getData());
      return;
    }

    ResendVerificationService.sendVerificationLink(
      G_EVENTS.mailer,
      validateEmailAddressResult.user,
      regenVerificationTokenResult.verificationBase64
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
        msg: `Error occurred in ${path.basename(__filename)}:sendNew()`,
      },
      req.log
    );
  }
};

module.exports = {
  resendVerification,
};
