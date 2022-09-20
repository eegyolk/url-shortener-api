const path = require("path");

const ValidationException = require("../../../exceptions/ValidationException");
const HttpCode = require("../../../helpers/HttpCode");
const IPResolver = require("../../../helpers/IPResolver");
const Logger = require("../../../helpers/Logger");
const ResponseObject = require("../../../helpers/ResponseObject");
const Tokenize = require("../../../helpers/Tokenize");
const Validation = require("../../../helpers/Validation");
const ResetPasswordService = require("../../../services/PasswordRecovery/ResetPasswordService");

const resetPassword = async (req, res) => {
  const { body, headers, ip } = req;
  const rules = ResetPasswordService.rules;

  try {
    const validation = new Validation(body, rules);
    validation.validate();

    const validateBase64Result = await ResetPasswordService.validateBase64(
      body.resetBase64
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

    const updatePasswordResult = await ResetPasswordService.updatePassword(
      validateBase64Result.user,
      body.password
    );
    if (updatePasswordResult.hasOwnProperty("error")) {
      const responseObject = new ResponseObject(
        HttpCode.INTERNAL_SERVER_ERROR,
        0,
        undefined,
        updatePasswordResult.error.code,
        updatePasswordResult.error.message
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
        msg: `Error occurred in ${path.basename(__filename)}:resetPassword()`,
      },
      req.log
    );
  }
};

module.exports = {
  resetPassword,
};
