const path = require("path");

const ValidationException = require("../../../../exceptions/ValidationException");
const HttpCode = require("../../../../helpers/HttpCode");
const Logger = require("../../../../helpers/Logger");
const ResponseObject = require("../../../../helpers/ResponseObject");
const Tokenize = require("../../../../helpers/Tokenize");
const Validation = require("../../../../helpers/Validation");
const DeleteUTMTemplateService = require("../../../../services/Admin/UTM/DeleteUTMTemplateService");

const deleteUTMTemplate = async (req, res) => {
  const { body, session } = req;
  const rules = DeleteUTMTemplateService.rules;

  try {
    const validation = new Validation(body, rules);
    validation.validate();

    const deleteUTMTemplateResult =
      await DeleteUTMTemplateService.deleteUTMTemplate(body);
    if (deleteUTMTemplateResult.hasOwnProperty("error")) {
      const responseObject = new ResponseObject(
        ["ERR-DELETEUTMPARAMETERTEMPLATE-01"].includes(
          deleteUTMTemplateResult.error.code
        )
          ? HttpCode.OK
          : HttpCode.INTERNAL_SERVER_ERROR,
        0,
        undefined,
        deleteUTMTemplateResult.error.code,
        deleteUTMTemplateResult.error.message
      );
      res.status(responseObject.getHttpCode()).json(responseObject.getData());
      return;
    }

    const csrfToken = Tokenize.makeAuthCSRF(Date.now(), session.auth.user);
    req.session.auth = {
      user: session.auth.user,
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

    const responseObject = new ResponseObject(
      HttpCode.OK,
      1,
      deleteUTMTemplateResult
    );
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
        msg: `Error occurred in ${path.basename(
          __filename
        )}:deleteUTMTemplate()`,
      },
      req.log
    );
  }
};

module.exports = {
  deleteUTMTemplate,
};
