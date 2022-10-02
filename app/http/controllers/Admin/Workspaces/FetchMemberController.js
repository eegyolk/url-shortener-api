const path = require("path");

const ValidationException = require("../../../../exceptions/ValidationException");
const HttpCode = require("../../../../helpers/HttpCode");
const Logger = require("../../../../helpers/Logger");
const ResponseObject = require("../../../../helpers/ResponseObject");
const Tokenize = require("../../../../helpers/Tokenize");
const Validation = require("../../../../helpers/Validation");
const FetchMemberService = require("../../../../services/Admin/Workspaces/FetchMemberService");

const fetchMember = async (req, res) => {
  const { params, query, session } = req;

  try {
    const getTypeResult = FetchMemberService.getType(params.value);
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

    let fetchMemberResult = {};
    if (FetchMemberService.types.ALL === getTypeResult.type) {
      const validation = new Validation(query, FetchMemberService.rules.all);
      validation.validate();

      fetchMemberResult = await FetchMemberService.all(query);
    } else if (FetchMemberService.types.SINGLE === getTypeResult.type) {
      const validation = new Validation(query, FetchMemberService.rules.single);
      validation.validate();

      fetchMemberResult = await FetchMemberService.single(query);
    } else if (FetchMemberService.types.SEARCH === getTypeResult.type) {
      const validation = new Validation(query, FetchMemberService.rules.search);
      validation.validate();

      fetchMemberResult = await FetchMemberService.search(query);
    } else if (FetchMemberService.types.FILTER === getTypeResult.type) {
      const validation = new Validation(query, FetchMemberService.rules.filter);
      validation.validate();

      fetchMemberResult = await FetchMemberService.filter(query);
    }
    if (fetchMemberResult.hasOwnProperty("error")) {
      const responseObject = new ResponseObject(
        HttpCode.INTERNAL_SERVER_ERROR,
        0,
        undefined,
        fetchMemberResult.error.code,
        fetchMemberResult.error.message
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
      fetchMemberResult
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
        msg: `Error occurred in ${path.basename(__filename)}:fetchMember()`,
      },
      req.log
    );
  }
};

module.exports = {
  fetchMember,
};
