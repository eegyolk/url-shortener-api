const Users = require("../../models/Users");

const errors = {
  1: { code: "ERR-ME-01", message: "User not found." },
  2: { code: "ERR-ME-02", message: "Account not yet verified." },
  3: { code: "ERR-ME-03", message: "Account was deactivated." },
};

const getMe = async id => {
  const user = await Users.query()
    .select(
      "id",
      "full_name",
      "email_address",
      "sso_provider",
      "image_url",
      "country",
      "verified_at",
      "logged_in_at",
      "deleted_at",
      "reset_at"
    )
    .findById(id);

  if (!user) {
    return { error: errors[1] };
  }

  if (!user.verified_at) {
    return { error: errors[2] };
  }

  if (user.deleted_at) {
    return { error: errors[3] };
  }

  return user;
};

module.exports = {
  getMe,
};
