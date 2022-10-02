const path = require("path");

const ValidationException = require("../../../../exceptions/ValidationException");
const HttpCode = require("../../../../helpers/HttpCode");
const Logger = require("../../../../helpers/Logger");
const ResponseObject = require("../../../../helpers/ResponseObject");
const Tokenize = require("../../../../helpers/Tokenize");
const Validation = require("../../../../helpers/Validation");
const FetchUTMParameterService = require("../../../../services/Admin/UTM/FetchUTMParameterService");

const fetchUTMParameter = async (req, res) => {
  const { params, query, session } = req;

  try {
    const getTypeResult = FetchUTMParameterService.getType(params.value);
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

    let fetchUTMParameterResult = {};
    if (FetchUTMParameterService.types.ALL === getTypeResult.type) {
      const validation = new Validation(
        query,
        FetchUTMParameterService.rules.all
      );
      validation.validate();

      fetchUTMParameterResult = await FetchUTMParameterService.all(query);
    } else if (FetchUTMParameterService.types.SINGLE === getTypeResult.type) {
      const validation = new Validation(
        query,
        FetchUTMParameterService.rules.single
      );
      validation.validate();

      fetchUTMParameterResult = await FetchUTMParameterService.single(query);
    } else if (FetchUTMParameterService.types.SEARCH === getTypeResult.type) {
      const validation = new Validation(
        query,
        FetchUTMParameterService.rules.search
      );
      validation.validate();

      fetchUTMParameterResult = await FetchUTMParameterService.search(query);
    } else if (FetchUTMParameterService.types.FILTER === getTypeResult.type) {
      const validation = new Validation(
        query,
        FetchUTMParameterService.rules.filter
      );
      validation.validate();

      fetchUTMParameterResult = await FetchUTMParameterService.filter(query);
    }
    if (fetchUTMParameterResult.hasOwnProperty("error")) {
      const responseObject = new ResponseObject(
        HttpCode.INTERNAL_SERVER_ERROR,
        0,
        undefined,
        fetchUTMParameterResult.error.code,
        fetchUTMParameterResult.error.message
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
      fetchUTMParameterResult
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
        )}:fetchUTMParameter()`,
      },
      req.log
    );
  }
};

module.exports = {
  fetchUTMParameter,
};
