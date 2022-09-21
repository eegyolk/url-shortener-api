const jwt = require("jsonwebtoken");
const moment = require("moment");

const appConfig = require("../../../config/app");
const urlShortenerAppConfig = require("../../../config/urlShortenerApp");
const Tokenize = require("../../helpers/Tokenize");
const Users = require("../../models/Users");

const rules = {
  emailAddress: "required|email",
};

const errors = {
  1: {
    code: "ERR-RESENDVERIFICATION-01",
    message: "Email address does not exists",
  },
  2: {
    code: "ERR-RESENDVERIFICATION-02",
    message: "Email address is already verified",
  },
  3: {
    code: "ERR-RESENDVERIFICATION-03",
    message: "Unable to update user record",
  },
};

const validateEmailAddress = async emailAddress => {
  const user = await Users.query()
    .select("id", "full_name", "email_address", "verified_at")
    .where("email_address", emailAddress)
    .whereNull("deleted_at");

  if (user.length === 0) {
    return { error: errors[1] };
  }

  if (user[0].verified_at) {
    return { error: errors[2] };
  }

  return { user: user[0] };
};

const regenVerificationToken = async user => {
  const temp = Object.assign({}, user);

  if (temp.hasOwnProperty("id")) {
    delete temp.id;
  }
  if (temp.hasOwnProperty("verified_at")) {
    delete temp.verified_at;
  }

  const { token, base64 } = Tokenize.makeLinkToken(temp);

  const patched = await Users.query()
    .patch({
      verification_token: token,
      verification_base64: base64,
      updated_at: moment().format(),
    })
    .findById(user.id);
  if (!patched) {
    return { error: errors[3] };
  }

  return { verificationBase64: base64 };
};

const sendVerificationLink = (event, user, verificationBase64) => {
  const fullName = user.full_name;
  const emailAddress = user.email_address;

  const urlShortenerAppLink = `${urlShortenerAppConfig.protocol}://${
    urlShortenerAppConfig.domain
  }${urlShortenerAppConfig.port ? `:${urlShortenerAppConfig.port}` : ""}`;

  event.emit(emailAddress, "Activate Account", "sign-up-verification-link", {
    appName: appConfig.name,
    appSupportEmail: appConfig.supportEmail,
    fullName,
    verificationLink: `${urlShortenerAppLink}/verify-account?q=${encodeURIComponent(
      verificationBase64
    )}`,
  });
};

module.exports = {
  rules,
  validateEmailAddress,
  regenVerificationToken,
  sendVerificationLink,
};
