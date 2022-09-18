const Users = require("../models/Users");

const errors = {
  1: { code: "ERR-ME-01", message: "Account not yet verified" },
  2: { code: "ERR-ME-02", message: "Account was deactivated" },
};

const getMe = async id => {
  return await Users.query()
    .select(
      "id",
      "full_name",
      "email_address",
      "sso_provider",
      "image_url",
      "country",
      "verified_at",
      "logged_in_at",
      "reset_at"
    )
    .findById(id);
};

module.exports = {
  errors,
  getMe,
};
