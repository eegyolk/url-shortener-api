const path = require("path");

const ValidationException = require("../../../../exceptions/ValidationException");
const HttpCode = require("../../../../helpers/HttpCode");
const Logger = require("../../../../helpers/Logger");
const ResponseObject = require("../../../../helpers/ResponseObject");
const Tokenize = require("../../../../helpers/Tokenize");
const Validation = require("../../../../helpers/Validation");
const FetchLinkService = require("../../../../services/Admin/Links/FetchLinkService");

const fetchLink = async (req, res) => {
  const { params, query, session } = req;

  try {
    const getTypeResult = FetchLinkService.getType(params.value);
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

    let fetchLinkResult = {};
    if (FetchLinkService.types.ALL === getTypeResult.type) {
      const validation = new Validation(query, FetchLinkService.rules.all);
      validation.validate();

      fetchLinkResult = await FetchLinkService.all(query);
    } else if (FetchLinkService.types.SINGLE === getTypeResult.type) {
      const validation = new Validation(query, FetchLinkService.rules.single);
      validation.validate();

      fetchLinkResult = await FetchLinkService.single(query);
    } else if (FetchLinkService.types.SEARCH === getTypeResult.type) {
      const validation = new Validation(query, FetchLinkService.rules.search);
      validation.validate();

      fetchLinkResult = await FetchLinkService.search(query);
    } else if (FetchLinkService.types.FILTER === getTypeResult.type) {
      const validation = new Validation(query, FetchLinkService.rules.filter);
      validation.validate();

      fetchLinkResult = await FetchLinkService.filter(query);
    }
    if (fetchLinkResult.hasOwnProperty("error")) {
      const responseObject = new ResponseObject(
        HttpCode.INTERNAL_SERVER_ERROR,
        0,
        undefined,
        fetchLinkResult.error.code,
        fetchLinkResult.error.message
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

    const responseObject = new ResponseObject(HttpCode.OK, 1, fetchLinkResult);
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
        msg: `Error occurred in ${path.basename(__filename)}:fetchLink()`,
      },
      req.log
    );
  }
};

module.exports = {
  fetchLink,
};
