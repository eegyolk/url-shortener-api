require("dotenv").config();

const { Model } = require("objection");

const appConfig = require("../config/app");
const dbConfig = require("../config/db");

const webRoutes = require("../routes/web");

module.exports.appConfig = appConfig;

module.exports.extendApp = function ({ app }) {
  // load knex instance to objection
  Model.knex(dbConfig.db);

  // attach configuration in app so it can be accessed anywhere
  app.locals.config = {
    app: appConfig,
    db: dbConfig.db,
  };

  // implements routes
  app.use(webRoutes);
};
