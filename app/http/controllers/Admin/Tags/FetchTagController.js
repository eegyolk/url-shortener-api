const path = require("path");

const ValidationException = require("../../../../exceptions/ValidationException");
const HttpCode = require("../../../../helpers/HttpCode");
const Logger = require("../../../../helpers/Logger");
const ResponseObject = require("../../../../helpers/ResponseObject");
const Tokenize = require("../../../../helpers/Tokenize");
const Validation = require("../../../../helpers/Validation");
const FetchTagService = require("../../../../services/Admin/Tags/FetchTagService");

const fetchTag = async (req, res) => {
  const { params, query, session } = req;

  try {
    const getTypeResult = FetchTagService.getType(params.value);
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

    let fetchTagResult = {};
    if (FetchTagService.types.ALL === getTypeResult.type) {
      const validation = new Validation(query, FetchTagService.rules.all);
      validation.validate();

      fetchTagResult = await FetchTagService.all(query);
    } else if (FetchTagService.types.SINGLE === getTypeResult.type) {
      const validation = new Validation(query, FetchTagService.rules.single);
      validation.validate();

      fetchTagResult = await FetchTagService.single(query);
    } else if (FetchTagService.types.SEARCH === getTypeResult.type) {
      const validation = new Validation(query, FetchTagService.rules.search);
      validation.validate();

      fetchTagResult = await FetchTagService.search(query);
    } else if (FetchTagService.types.FILTER === getTypeResult.type) {
      const validation = new Validation(query, FetchTagService.rules.filter);
      validation.validate();

      fetchTagResult = await FetchTagService.filter(query);
    }
    if (fetchTagResult.hasOwnProperty("error")) {
      const responseObject = new ResponseObject(
        HttpCode.INTERNAL_SERVER_ERROR,
        0,
        undefined,
        fetchTagResult.error.code,
        fetchTagResult.error.message
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

    const responseObject = new ResponseObject(HttpCode.OK, 1, fetchTagResult);
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
        msg: `Error occurred in ${path.basename(__filename)}:fetchTag()`,
      },
      req.log
    );
  }
};

module.exports = {
  fetchTag,
};
