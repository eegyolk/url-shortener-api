const moment = require("moment");
const Password = require("../helpers/Password");
const Users = require("../models/Users");

const rules = {
  emailAddress: "required|email",
  password: "required",
};

const errors = {
  1: { code: "ERR-SIGNIN-01", message: "Invalid username or password" },
  2: { code: "ERR-SIGNIN-02", message: "Account not yet verified" },
  3: { code: "ERR-SIGNIN-03", message: "Account was deactivated" },
};

const getUserByEmailAddress = async emailAddress => {
  const user = await Users.query()
    .select("id", "password", "verified_at", "deleted_at")
    .where("email_address", emailAddress);

  if (user.length === 0) {
    return;
  } else {
    return user[0];
  }
};

const validatePassword = (password, passwordHash) => {
  return Password.check(password, passwordHash);
};

const updateUser = async id => {
  const patched = await Users.query()
    .patch({
      logged_in_at: moment().format(),
    })
    .findById(id);

  if (!patched) {
    return;
  }

  return await Users.query()
    .select(
      "id",
      "full_name",
      "email_address",
      "sso_provider",
      "image_url",
      "country",
      "verified_at",
      "logged_in_at"
    )
    .findById(id);
};

module.exports = {
  rules,
  errors,
  getUserByEmailAddress,
  validatePassword,
  updateUser,
};
