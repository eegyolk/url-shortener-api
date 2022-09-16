const EventEmitter = require("events");
const NodeMailer = require("../helpers/NodeMailer");

function MailerEvent() {
  this.eventEmitter = new EventEmitter();
  this.eventEmitter.setMaxListeners(0);
  this.name = "mailer-event";
}

MailerEvent.prototype.init = function () {
  this.eventEmitter.on(this.name, async payload => {
    const { recipient, subject, template, context } = payload;

    await NodeMailer.sendMail(recipient, subject, template, context);
  });
};

MailerEvent.prototype.emit = function (recipient, subject, template, context) {
  const payload = {
    recipient,
    subject,
    template,
    context,
  };

  this.eventEmitter.emit(this.name, payload);
};

module.exports = MailerEvent;
