const jwt = require("jsonwebtoken");
const moment = require("moment");

const Users = require("../../models/Users");

const rules = {
  verificationBase64: "required",
};

const errors = {
  1: {
    code: "ERR-VERIFYACCOUNT-01",
    message: "Looks like the verification link is invalid.",
  },
  2: {
    code: "ERR-VERIFYACCOUNT-02",
    message: "Looks like the verification link has expired.",
  },
  3: {
    code: "ERR-VERIFYACCOUNT-03",
    message: "Unable to update user record.",
  },
};

const validateBase64 = async verificationBase64 => {
  const user = await Users.query()
    .select("id", "email_address", "verification_token")
    .where("verification_base64", verificationBase64)
    .whereNull("verified_at");

  if (user.length === 0) {
    return { error: errors[1] };
  }

  const verificationToken = jwt.decode(user[0].verification_token);
  if (!verificationToken) {
    return { error: errors[1] };
  }

  const expiry = verificationToken.exp * 1000;
  const currentTime = Date.now();

  if (currentTime > expiry) {
    return { error: errors[2] };
  }

  return { user: user[0] };
};

const clearToken = async id => {
  const patched = await Users.query()
    .patch({
      verification_token: "",
      verification_base64: "",
      verified_at: moment().format(),
      updated_at: moment().format(),
    })
    .findById(id);
  if (!patched) {
    return { error: errors[3] };
  }

  return {};
};

module.exports = {
  rules,
  validateBase64,
  clearToken,
};
