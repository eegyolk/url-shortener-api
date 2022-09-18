const jwt = require("jsonwebtoken");
const moment = require("moment");

const appConfig = require("../../config/app");
const urlShortenerAppConfig = require("../../config/urlShortenerApp");
const Tokenize = require("../helpers/Tokenize");
const Users = require("../models/Users");

const rules = {
  verify: { verificationBase64: "required" },
  sendNew: { emailAddress: "required|email" },
};

const errors = {
  1: {
    code: "ERR-VERIFY-01",
    message: "Looks like the verification link has expired or invalid",
  },
  2: {
    code: "ERR-SENDNEW-01",
    message: "Email address does not exists",
  },
  3: {
    code: "ERR-SENDNEW-02",
    message: "Email address is already verified",
  },
};

const validateBase64 = async verificationBase64 => {
  const user = await Users.query()
    .select("id", "verification_token")
    .where("verification_base64", verificationBase64)
    .whereNull("verified_at");

  if (user.length === 0) {
    return false;
  }

  const verificationToken = jwt.decode(user[0].verification_token);
  if (!verificationToken) {
    return false;
  }

  const emailAddress = verificationToken.email_address;
  const expiry = verificationToken.exp * 1000;
  const currentTime = Date.now();

  if (currentTime > expiry) {
    return false;
  }

  await Users.query()
    .patch({
      verified_at: moment().format(),
      updated_at: moment().format(),
    })
    .findById(user[0].id);

  return {
    emailAddress,
  };
};

const validateEmailAddress = async emailAddress => {
  const user = await Users.query()
    .select("id", "full_name", "email_address", "verified_at")
    .where("email_address", emailAddress);

  if (user.length === 0) {
    return { error: errors[2] };
  }

  if (user[0].verified_at) {
    return { error: errors[3] };
  }

  return user[0];
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
    return;
  }

  return base64;
};

const sendVerificationLink = (mailerEvent, user, verificationBase64) => {
  const fullName = user.full_name;
  const emailAddress = user.email_address;

  const urlShortenerAppLink = `${urlShortenerAppConfig.protocol}://${
    urlShortenerAppConfig.domain
  }${urlShortenerAppConfig.port ? `:${urlShortenerAppConfig.port}` : ""}`;

  mailerEvent.emit(
    emailAddress,
    `Hi ${fullName}, welcome to ${appConfig.name}`,
    "sign-up-verification-link",
    {
      appName: appConfig.name,
      appSupportEmail: appConfig.supportEmail,
      fullName,
      verificationLink: `${urlShortenerAppLink}/verify?q=${encodeURIComponent(
        verificationBase64
      )}`,
    }
  );
};

module.exports = {
  rules,
  errors,
  validateBase64,
  validateEmailAddress,
  regenVerificationToken,
  sendVerificationLink,
};
