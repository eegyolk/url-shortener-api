const moment = require("moment");

const appConfig = require("../../config/app");
const urlShortenerAppConfig = require("../../config/urlShortenerApp");
const Tokenize = require("../helpers/Tokenize");
const Users = require("../models/Users");

const rules = {
  forgotPassword: { emailAddress: "required|email" },
};

const errors = {
  1: {
    code: "ERR-FORGOTPASSWORD-01",
    message: "Email address does not exists",
  },
  2: {
    code: "ERR-FORGOTPASSWORD-02",
    message: "Email address is already verified",
  },
  3: {
    code: "ERR-FORGOTPASSWORD-03",
    message: "Account was deactivated",
  },
};

const validateEmailAddress = async emailAddress => {
  const user = await Users.query()
    .select("id", "full_name", "email_address", "verified_at", "deleted_at")
    .where("email_address", emailAddress);

  if (user.length === 0) {
    return { error: errors[1] };
  }

  if (!user[0].verified_at) {
    return { error: errors[2] };
  }

  if (user[0].deleted_at) {
    return { error: errors[3] };
  }

  return user[0];
};

const createResetPasswordToken = async user => {
  const temp = Object.assign({}, user);

  if (temp.hasOwnProperty("id")) {
    delete temp.id;
  }
  if (temp.hasOwnProperty("verified_at")) {
    delete temp.verified_at;
  }
  if (temp.hasOwnProperty("deleted_at")) {
    delete temp.deleted_at;
  }

  const { token, base64 } = Tokenize.makeLinkToken(temp);

  const patched = await Users.query()
    .patch({
      reset_token: token,
      reset_base64: base64,
      updated_at: moment().format(),
    })
    .findById(user.id);
  if (!patched) {
    return;
  }

  return base64;
};

const sendResetPasswordLink = (mailerEvent, user, resetBase64) => {
  const fullName = user.full_name;
  const emailAddress = user.email_address;

  const urlShortenerAppLink = `${urlShortenerAppConfig.protocol}://${
    urlShortenerAppConfig.domain
  }${urlShortenerAppConfig.port ? `:${urlShortenerAppConfig.port}` : ""}`;

  mailerEvent.emit(
    emailAddress,
    `Hi ${fullName}, welcome to ${appConfig.name}, reset password instructions`,
    "reset-password-link",
    {
      appName: appConfig.name,
      appSupportEmail: appConfig.supportEmail,
      fullName,
      verificationLink: `${urlShortenerAppLink}/reset?q=${encodeURIComponent(
        resetBase64
      )}`,
    }
  );
};

module.exports = {
  rules,
  errors,
  validateEmailAddress,
  createResetPasswordToken,
  sendResetPasswordLink,
};
