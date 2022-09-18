const appConfig = require("../../config/app");
const urlShortenerAppConfig = require("../../config/urlShortenerApp");
const Password = require("../helpers/Password");
const Tokenize = require("../helpers/Tokenize");
const Users = require("../models/Users");

const rules = {
  fullName: "required|min:3",
  emailAddress: "required|email",
  password:
    "required|regex:/^(?=.*\\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$",
};

const errors = {
  1: { code: "ERR-SIGNUP-01", message: "This email address already exists" },
};

const isEmailAddressExists = async emailAddress => {
  const user = await Users.query()
    .select("id")
    .where("email_address", emailAddress);

  if (user.length === 0) {
    return false;
  } else {
    return true;
  }
};

const createUser = async body => {
  const { fullName, emailAddress, password } = body;

  const data = {
    full_name: fullName,
    email_address: emailAddress,
    password: Password.make(password),
  };
  const temp = Object.assign({}, data);
  delete temp.password;

  const { token, base64 } = Tokenize.makeLinkToken(temp);
  data["verification_token"] = token;
  data["verification_base64"] = base64;

  return await Users.query().insert(data);
};

const sendVerificationLink = (mailerEvent, body, verificationBase64) => {
  const { fullName, emailAddress } = body;

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
  isEmailAddressExists,
  createUser,
  sendVerificationLink,
};
