const path = require("path");

const ValidationException = require("../../exceptions/ValidationException");
const HttpCode = require("../../helpers/HttpCode");
const IPResolver = require("../../helpers/IPResolver");
const Logger = require("../../helpers/Logger");
const ResponseObject = require("../../helpers/ResponseObject");
const Tokenize = require("../../helpers/Tokenize");
const Validation = require("../../helpers/Validation");
const SignUpService = require("../../services/SignUpService");

const signUp = async (req, res) => {
  const { body, app, headers, ip } = req;
  const rules = SignUpService.rules;

  try {
    const validation = new Validation(body, rules);
    validation.validate();

    const isEmailAddressExists = await SignUpService.isEmailAddressExists(
      body.emailAddress
    );
    if (isEmailAddressExists) {
      const responseObject = new ResponseObject(
        HttpCode.OK,
        0,
        undefined,
        SignUpService.errors[1].code,
        SignUpService.errors[1].message
      );
      res.status(responseObject.getHttpCode()).json(responseObject.getData());
      return;
    }

    const newUser = await SignUpService.createUser(body);
    if (!newUser) {
      throw new Error("Unable to create user record");
    }

    const ipAddress = IPResolver.ipAddress(ip, headers);
    const csrfToken = Tokenize.makeCSRF(ipAddress, headers);

    res.cookie("XSRF-TOKEN", csrfToken, {
      httpOnly: false,
      maxAge: 1000 * 60 * 5, // 5 mins validity
    });

    SignUpService.sendVerificationLink(
      app.locals.event.mailer,
      body,
      newUser.verification_base64
    );

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
        msg: `Error occurred in ${path.basename(__filename)}:signUp()`,
      },
      req.log
    );
  }
};

module.exports = {
  signUp,
};
