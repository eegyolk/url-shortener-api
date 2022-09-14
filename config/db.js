module.exports = {
  db: require("knex")({
    client: process.env.DB_DRIVER,
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_DATABASE,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      connectionTimeout: 30000,
    },
    pool: {
      min: 0,
      max: parseInt(process.env.DB_POOL_MAX_CONNECTION) || 10,
      acquireTimeoutMillis: 15000,
      createTimeoutMillis: 15000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 15000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100,
      propagateCreateError: false,
    },
    acquireConnectionTimeout: 15000,
    afterCreate: function (conn, done) {
      conn.query('SET timezone="UTC";', function (err) {
        if (err) {
          done(err, conn);
        } else {
          conn.query("SELECT set_limit(0.01);", function (err) {
            done(err, conn);
          });
        }
      });
    },
  }),
};
