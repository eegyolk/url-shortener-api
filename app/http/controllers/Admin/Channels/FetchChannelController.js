const path = require("path");

const ValidationException = require("../../../../exceptions/ValidationException");
const HttpCode = require("../../../../helpers/HttpCode");
const Logger = require("../../../../helpers/Logger");
const ResponseObject = require("../../../../helpers/ResponseObject");
const Tokenize = require("../../../../helpers/Tokenize");
const Validation = require("../../../../helpers/Validation");
const FetchChannelService = require("../../../../services/Admin/Channels/FetchChannelService");

const fetchChannel = async (req, res) => {
  const { params, query, session } = req;

  try {
    const getTypeResult = FetchChannelService.getType(params.value);
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

    let fetchChannelResult = {};
    if (FetchChannelService.types.ALL === getTypeResult.type) {
      const validation = new Validation(query, FetchChannelService.rules.all);
      validation.validate();

      fetchChannelResult = await FetchChannelService.all(query);
    } else if (FetchChannelService.types.SINGLE === getTypeResult.type) {
      const validation = new Validation(
        query,
        FetchChannelService.rules.single
      );
      validation.validate();

      fetchChannelResult = await FetchChannelService.single(query);
    } else if (FetchChannelService.types.SEARCH === getTypeResult.type) {
      const validation = new Validation(
        query,
        FetchChannelService.rules.search
      );
      validation.validate();

      fetchChannelResult = await FetchChannelService.search(query);
    } else if (FetchChannelService.types.FILTER === getTypeResult.type) {
      const validation = new Validation(
        query,
        FetchChannelService.rules.filter
      );
      validation.validate();

      fetchChannelResult = await FetchChannelService.filter(query);
    }
    if (fetchChannelResult.hasOwnProperty("error")) {
      const responseObject = new ResponseObject(
        HttpCode.INTERNAL_SERVER_ERROR,
        0,
        undefined,
        fetchChannelResult.error.code,
        fetchChannelResult.error.message
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
      fetchChannelResult
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
        msg: `Error occurred in ${path.basename(__filename)}:fetchChannel()`,
      },
      req.log
    );
  }
};

module.exports = {
  fetchChannel,
};
