const path = require("path");

const ValidationException = require("../../exceptions/ValidationException");
const HttpCode = require("../../helpers/HttpCode");
const Logger = require("../../helpers/Logger");
const ResponseObject = require("../../helpers/ResponseObject");
const Tokenize = require("../../helpers/Tokenize");
const Validation = require("../../helpers/Validation");
const VerificationService = require("../../services/VerificationService");

const verify = async (req, res) => {
  const { body } = req;
  const rules = VerificationService.rules.verify;

  try {
    const validation = new Validation(body, rules);
    validation.validate();

    const result = await VerificationService.validateBase64(
      body.verificationBase64
    );
    if (!result) {
      const responseObject = new ResponseObject(
        HttpCode.OK,
        0,
        undefined,
        VerificationService.errors[1].code,
        VerificationService.errors[1].message
      );
      res.status(responseObject.getHttpCode()).json(responseObject.getData());
      return;
    }

    const responseObject = new ResponseObject(HttpCode.OK, 1, result);
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
        msg: `Error occurred in ${path.basename(__filename)}:verify()`,
      },
      req.log
    );
  }
};

const sendNew = async (req, res) => {
  const { body, app } = req;
  const rules = VerificationService.rules.sendNew;

  try {
    const validation = new Validation(body, rules);
    validation.validate();

    const result = await VerificationService.validateEmailAddress(
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

    const verificationToken = await VerificationService.regenVerificationToken(
      result,
      body.emailAddress
    );
    if (!verificationToken) {
      throw new Error("Unable to update user record");
    }

    VerificationService.sendVerificationLink(
      app.locals.event.mailer,
      result,
      verificationToken
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
        msg: `Error occurred in ${path.basename(__filename)}:sendNew()`,
      },
      req.log
    );
  }
};

module.exports = {
  verify,
  sendNew,
};
