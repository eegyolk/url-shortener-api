const hbs = require("nodemailer-express-handlebars");
const nodemailer = require("nodemailer");
const path = require("path");
const mailerConfig = require("../../config/mailer");

const sendMail = async (recipient, subject, template, context) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: mailerConfig.gmail.username,
      pass: mailerConfig.gmail.password,
    },
  });

  const handlebarOptions = {
    viewEngine: {
      extName: ".hbs",
      defaultLayout: false,
      partialsDir: path.join(__dirname, "../../resources/views/"),
    },
    viewPath: path.join(__dirname, "../../resources/views/"),
    extName: ".hbs",
  };
  transporter.use("compile", hbs(handlebarOptions));

  const mailOptions = {
    from: mailerConfig.gmail.username,
    to: recipient,
    subject,
    template,
    context,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendMail,
};
