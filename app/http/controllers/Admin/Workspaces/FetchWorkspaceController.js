const path = require("path");

const ValidationException = require("../../../../exceptions/ValidationException");
const HttpCode = require("../../../../helpers/HttpCode");
const Logger = require("../../../../helpers/Logger");
const ResponseObject = require("../../../../helpers/ResponseObject");
const Tokenize = require("../../../../helpers/Tokenize");
const Validation = require("../../../../helpers/Validation");
const FetchWorkspaceService = require("../../../../services/Admin/Workspaces/FetchWorkspaceService");

const fetchWorkspace = async (req, res) => {
  const { params, query, session } = req;

  try {
    const getTypeResult = FetchWorkspaceService.getType(params.value);
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

    let fetchWorkspaceResult = {};
    if (FetchWorkspaceService.types.ALL === getTypeResult.type) {
      const validation = new Validation(query, FetchWorkspaceService.rules.all);
      validation.validate();

      fetchWorkspaceResult = await FetchWorkspaceService.all(query);
    } else if (FetchWorkspaceService.types.SINGLE === getTypeResult.type) {
      const validation = new Validation(
        query,
        FetchWorkspaceService.rules.single
      );
      validation.validate();

      fetchWorkspaceResult = await FetchWorkspaceService.single(query);
    } else if (FetchWorkspaceService.types.SEARCH === getTypeResult.type) {
      const validation = new Validation(
        query,
        FetchWorkspaceService.rules.search
      );
      validation.validate();

      fetchWorkspaceResult = await FetchWorkspaceService.search(query);
    } else if (FetchWorkspaceService.types.FILTER === getTypeResult.type) {
      const validation = new Validation(
        query,
        FetchWorkspaceService.rules.filter
      );
      validation.validate();

      fetchWorkspaceResult = await FetchWorkspaceService.filter(query);
    }
    if (fetchWorkspaceResult.hasOwnProperty("error")) {
      const responseObject = new ResponseObject(
        HttpCode.INTERNAL_SERVER_ERROR,
        0,
        undefined,
        fetchWorkspaceResult.error.code,
        fetchWorkspaceResult.error.message
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
      fetchWorkspaceResult
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
        msg: `Error occurred in ${path.basename(__filename)}:fetchWorkspace()`,
      },
      req.log
    );
  }
};

module.exports = {
  fetchWorkspace,
};
