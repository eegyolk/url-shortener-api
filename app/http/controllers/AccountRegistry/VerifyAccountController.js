const path = require("path");

const ValidationException = require("../../../exceptions/ValidationException");
const HttpCode = require("../../../helpers/HttpCode");
const IPResolver = require("../../../helpers/IPResolver");
const Logger = require("../../../helpers/Logger");
const ResponseObject = require("../../../helpers/ResponseObject");
const Tokenize = require("../../../helpers/Tokenize");
const Validation = require("../../../helpers/Validation");
const VerifyAccountService = require("../../../services/AccountRegistry/VerifyAccountService");

const verifyAccount = async (req, res) => {
  const { body, headers, ip } = req;
  const rules = VerifyAccountService.rules;

  try {
    const validation = new Validation(body, rules);
    validation.validate();

    const validateBase64Result = await VerifyAccountService.validateBase64(
      body.verificationBase64
    );
    if (validateBase64Result.hasOwnProperty("error")) {
      const responseObject = new ResponseObject(
        HttpCode.OK,
        0,
        undefined,
        validateBase64Result.error.code,
        validateBase64Result.error.message
      );
      res.status(responseObject.getHttpCode()).json(responseObject.getData());
      return;
    }

    const clearTokenResult = await VerifyAccountService.clearToken(
      validateBase64Result.user.id
    );
    if (clearTokenResult.hasOwnProperty("error")) {
      const responseObject = new ResponseObject(
        HttpCode.INTERNAL_SERVER_ERROR,
        0,
        undefined,
        clearTokenResult.error.code,
        clearTokenResult.error.message
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

    const responseObject = new ResponseObject(HttpCode.OK, 1, {
      emailAddress: validateBase64Result.user.email_address,
    });
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
        msg: `Error occurred in ${path.basename(__filename)}:verify()`,
      },
      req.log
    );
  }
};

module.exports = {
  verifyAccount,
};
