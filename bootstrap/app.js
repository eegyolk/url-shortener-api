require("dotenv").config();

const cors = require("cors");
const session = require("express-session");
const { Model } = require("objection");
const FileStore = require("session-file-store")(session);
const { v4: uuidv4 } = require("uuid");

const MailerEvent = require("../app/events/MailerEvent");
const appConfig = require("../config/app");
const corsConfig = require("../config/cors");
const dbConfig = require("../config/db");
const logConfig = require("../config/log");
const sessionFileStoreConfig = require("../config/session-file-store");
const sessionConfig = require("../config/session");
const apiRoutes = require("../routes/api");
const appRoutes = require("../routes/app");
const webRoutes = require("../routes/web");

module.exports.appConfig = appConfig;
module.exports.logConfig = logConfig;

module.exports.extendApp = ({ app }) => {
  // load knex instance to objection
  Model.knex(dbConfig.db);

  // initialize event
  const mailerEvent = new MailerEvent();
  mailerEvent.init();
  // make events accessible globally
  global.G_EVENTS = {
    mailer: mailerEvent,
  };

  // application middleware for session
  if (appConfig.env === "prod") {
    app.set("trust proxy", 1); // trust first proxy
    sessionConfig.cookie.secure = true; // serve secure cookies
    sessionConfig.proxy = true; // trust first proxy
  }
  const fileStore = new FileStore(sessionFileStoreConfig);
  app.use(session({ store: fileStore, ...sessionConfig }));
  // make session store accessible globally
  global.G_SESSION_STORE = fileStore;

  // application middleware for logging
  app.use((req, res, next) => {
    req.log = logConfig.child({ reqId: uuidv4() });
    req.log.info({ req, body: req.body }, "access-log");
    next();
  });

  // application middleware for cors
  const corsOptionsDelegate = (req, callback) => {
    const corsOptions = {
      origin: false,
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    };

    corsOptions.origin =
      corsConfig.allowedOrigin.indexOf(req.headers["origin"]) !== -1;

    callback(null, corsOptions);
  };
  app.use(cors(corsOptionsDelegate));

  // implements routes
  app.use("/api", apiRoutes);
  app.use("/app", appRoutes);
  app.use("/web", webRoutes);
};
