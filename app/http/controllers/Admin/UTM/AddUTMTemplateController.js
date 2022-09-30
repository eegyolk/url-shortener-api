const path = require("path");

const ValidationException = require("../../../../exceptions/ValidationException");
const HttpCode = require("../../../../helpers/HttpCode");
const Logger = require("../../../../helpers/Logger");
const ResponseObject = require("../../../../helpers/ResponseObject");
const Tokenize = require("../../../../helpers/Tokenize");
const Validation = require("../../../../helpers/Validation");
const AddUTMTemplateService = require("../../../../services/Admin/UTM/AddUTMTemplateService");

const addUTMTemplate = async (req, res) => {
  const { body, session } = req;
  const rules = AddUTMTemplateService.rules;

  try {
    const validation = new Validation(body, rules);
    validation.validate();

    const addUTMTemplateResult = await AddUTMTemplateService.addUTMTemplate(
      body
    );
    if (addUTMTemplateResult.hasOwnProperty("error")) {
      const responseObject = new ResponseObject(
        [
          "ERR-ADDPARAMETERTEMPLATE-01",
          "ERR-ADDPARAMETERTEMPLATE-02",
          "ERR-ADDPARAMETERTEMPLATE-03",
        ].includes(addUTMTemplateResult.error.code)
          ? HttpCode.OK
          : HttpCode.INTERNAL_SERVER_ERROR,
        0,
        undefined,
        addUTMTemplateResult.error.code,
        addUTMTemplateResult.error.message
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
      addUTMTemplateResult
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
        msg: `Error occurred in ${path.basename(__filename)}:addUTMTemplate()`,
      },
      req.log
    );
  }
};

module.exports = {
  addUTMTemplate,
};
