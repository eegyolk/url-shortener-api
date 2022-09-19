const jwt = require("jsonwebtoken");
const moment = require("moment");

const appConfig = require("../../../config/app");
const urlShortenerAppConfig = require("../../../config/urlShortenerApp");
const Password = require("../../helpers/Password");
const Users = require("../../models/Users");

const rules = {
  resetBase64: "required",
  password:
    "required|confirmed|regex:/^(?=.*\\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$",
};

const errors = {
  1: {
    code: "ERR-RESETPASSWORD-01",
    message: "Looks like the reset link is invalid.",
  },
  2: {
    code: "ERR-RESETPASSWORD-02",
    message: "Looks like the reset link has expired",
  },
  3: {
    code: "ERR-RESETPASSWORD-03",
    message: "Unable to update user record",
  },
};

const validateBase64 = async resetBase64 => {
  const user = await Users.query()
    .select("id", "reset_token")
    .where("reset_base64", resetBase64)
    .whereNotNull("verified_at")
    .whereNull("deleted_at");

  if (user.length === 0) {
    return { error: errors[1] };
  }

  const resetToken = jwt.decode(user[0].reset_token);
  if (!resetToken) {
    return { error: errors[1] };
  }

  const expiry = resetToken.exp * 1000;
  const currentTime = Date.now();

  if (currentTime > expiry) {
    return { error: errors[2] };
  }

  return { user: user[0] };
};

const updatePassword = async (user, password) => {
  const patched = await Users.query()
    .patch({
      password: Password.make(password),
      reset_at: moment().format(),
      updated_at: moment().format(),
    })
    .findById(user.id);

  if (!patched) {
    return { error: errors[3] };
  }

  return {};
};

module.exports = {
  rules,
  validateBase64,
  updatePassword,
};
