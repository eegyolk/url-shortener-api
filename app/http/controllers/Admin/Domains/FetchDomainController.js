const path = require("path");

const ValidationException = require("../../../../exceptions/ValidationException");
const HttpCode = require("../../../../helpers/HttpCode");
const Logger = require("../../../../helpers/Logger");
const ResponseObject = require("../../../../helpers/ResponseObject");
const Tokenize = require("../../../../helpers/Tokenize");
const Validation = require("../../../../helpers/Validation");
const FetchDomainService = require("../../../../services/Admin/Domains/FetchDomainService");

const fetchDomain = async (req, res) => {
  const { params, query, session } = req;

  try {
    const getTypeResult = FetchDomainService.getType(params.value);
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

    let fetchDomainResult = {};
    if (FetchDomainService.types.ALL === getTypeResult.type) {
      const validation = new Validation(query, FetchDomainService.rules.all);
      validation.validate();

      fetchDomainResult = await FetchDomainService.all(query);
    } else if (FetchDomainService.types.SINGLE === getTypeResult.type) {
      const validation = new Validation(query, FetchDomainService.rules.single);
      validation.validate();

      fetchDomainResult = await FetchDomainService.single(query);
    } else if (FetchDomainService.types.SEARCH === getTypeResult.type) {
      const validation = new Validation(query, FetchDomainService.rules.search);
      validation.validate();

      fetchDomainResult = await FetchDomainService.search(query);
    } else if (FetchDomainService.types.FILTER === getTypeResult.type) {
      const validation = new Validation(query, FetchDomainService.rules.filter);
      validation.validate();

      fetchDomainResult = await FetchDomainService.filter(query);
    }
    if (fetchDomainResult.hasOwnProperty("error")) {
      const responseObject = new ResponseObject(
        HttpCode.INTERNAL_SERVER_ERROR,
        0,
        undefined,
        fetchDomainResult.error.code,
        fetchDomainResult.error.message
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
      fetchDomainResult
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
        msg: `Error occurred in ${path.basename(__filename)}:fetchDomain()`,
      },
      req.log
    );
  }
};

module.exports = {
  fetchDomain,
};
