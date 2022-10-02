const path = require("path");

const ValidationException = require("../../../../exceptions/ValidationException");
const HttpCode = require("../../../../helpers/HttpCode");
const Logger = require("../../../../helpers/Logger");
const ResponseObject = require("../../../../helpers/ResponseObject");
const Tokenize = require("../../../../helpers/Tokenize");
const Validation = require("../../../../helpers/Validation");
const FetchUTMTemplateService = require("../../../../services/Admin/UTM/FetchUTMTemplateService");

const fetchUTMTemplate = async (req, res) => {
  const { params, query, session } = req;

  try {
    const getTypeResult = FetchUTMTemplateService.getType(params.value);
    if (getTypeResult.hasOwnProperty("error")) {
      const responseObject = new ResponseObject(
        HttpCode.INTERNAL_SERVER_ERROR,
        0,
        undefined,
        getTypeResult.error.code,
        getTypeResult.error.message
      );
      res.status(responseObject.getHttpCode()).json(responseObject.getData());
      return;
    }

    let fetchUTMTemplateResult = {};
    if (FetchUTMTemplateService.types.ALL === getTypeResult.type) {
      const validation = new Validation(
        query,
        FetchUTMTemplateService.rules.all
      );
      validation.validate();

      fetchUTMTemplateResult = await FetchUTMTemplateService.all(query);
    } else if (FetchUTMTemplateService.types.SINGLE === getTypeResult.type) {
      const validation = new Validation(
        query,
        FetchUTMTemplateService.rules.single
      );
      validation.validate();

      fetchUTMTemplateResult = await FetchUTMTemplateService.single(query);
    } else if (FetchUTMTemplateService.types.SEARCH === getTypeResult.type) {
      const validation = new Validation(
        query,
        FetchUTMTemplateService.rules.search
      );
      validation.validate();

      fetchUTMTemplateResult = await FetchUTMTemplateService.search(query);
    } else if (FetchUTMTemplateService.types.FILTER === getTypeResult.type) {
      const validation = new Validation(
        query,
        FetchUTMTemplateService.rules.filter
      );
      validation.validate();

      fetchUTMTemplateResult = await FetchUTMTemplateService.filter(query);
    }
    if (fetchUTMTemplateResult.hasOwnProperty("error")) {
      const responseObject = new ResponseObject(
        HttpCode.INTERNAL_SERVER_ERROR,
        0,
        undefined,
        fetchUTMTemplateResult.error.code,
        fetchUTMTemplateResult.error.message
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
      fetchUTMTemplateResult
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
        )}:fetchUTMTemplate()`,
      },
      req.log
    );
  }
};

module.exports = {
  fetchUTMTemplate,
};
