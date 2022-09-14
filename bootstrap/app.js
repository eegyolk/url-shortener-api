require("dotenv").config();

const { Model } = require("objection");
const { v4: uuidv4 } = require("uuid");

const appConfig = require("../config/app");
const dbConfig = require("../config/db");
const logConfig = require("../config/log");
const apiRoutes = require("../routes/api");
const appRoutes = require("../routes/app");
const webRoutes = require("../routes/web");

module.exports.appConfig = appConfig;
module.exports.logConfig = logConfig;

module.exports.extendApp = ({ app }) => {
  // load knex instance to objection
  Model.knex(dbConfig.db);

  // attach configuration in app so it can be accessed anywhere
  app.locals.config = {
    app: appConfig,
    db: dbConfig.db,
  };

  // application middleware for logging
  app.use((req, res, next) => {
    req.log = logConfig.child({ reqId: uuidv4() });
    req.log.info({ req, body: req.body }, "access-log");
    next();
  });

  // implements routes
  app.use("/api", apiRoutes);
  app.use("/app", appRoutes);
  app.use("/web", webRoutes);
};
