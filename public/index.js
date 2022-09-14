const express = require("express"),
  app = express(),
  compression = require("compression");

const bootstrap = require("../bootstrap/app"),
  env = bootstrap.appConfig.env,
  protocol = bootstrap.appConfig.protocol,
  domain = bootstrap.appConfig.domain,
  port = bootstrap.appConfig.port,
  log = bootstrap.logConfig;

app.use(compression({ threshold: 0 }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

bootstrap.extendApp({ app });

if (env !== "test") {
  app.listen(port, () => {
    console.log(
      `Server listening at port ${port} with process id ${
        process.pid
      }. Access the app using this link: ${protocol}://${domain}${
        port ? `:${port}` : ""
      }`
    );
  });

  process.on("uncaughtException", (err, origin) => {
    log.error({ err, msg: "uncaught-exception" });

    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  process.on("uncaughtExceptionMonitor", (err, origin) => {
    log.error({ err, msg: "uncaught-exception-monitor" });
  });

  process.on("unhandledRejection", (reason, promise) => {
    log.error({ err: reason, msg: "unhandled-rejection" });

    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });
} else {
  module.exports = app;
}
