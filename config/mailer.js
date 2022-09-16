const EventEmitter = require("events");

module.exports = {
  gmail: {
    username:
      process.env.GMAIL_USERNAME ||
      new EventEmitter().emit("error", new Error("GMAIL_USERNAME is missing!")),
    password:
      process.env.GMAIL_PASSWORD ||
      new EventEmitter().emit("error", new Error("GMAIL_PASSWORD is missing!")),
  },
};
