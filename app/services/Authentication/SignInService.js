const moment = require("moment");
const Password = require("../../helpers/Password");
const Users = require("../../models/Users");

const rules = {
  emailAddress: "required|email",
  password: "required",
};

const errors = {
  1: { code: "ERR-SIGNIN-01", message: "Invalid username or password." },
  2: { code: "ERR-SIGNIN-02", message: "Email address is not yet verified." },
  3: { code: "ERR-SIGNIN-03", message: "Account was deactivated." },
  4: { code: "ERR-SIGNIN-04", message: "Unable to update user record." },
};

const getUserByEmailAddress = async emailAddress => {
  const user = await Users.query()
    .select("id", "password", "session_id", "verified_at", "deleted_at")
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

  return { user: user[0] };
};

const validatePassword = (password, passwordHash) => {
  const result = Password.check(password, passwordHash);
  if (!result) {
    return { error: errors[1] };
  }

  return {};
};

const clearLastSession = sessionId => {
  return new Promise(resolve => {
    if (sessionId) {
      G_SESSION_STORE.destroy(sessionId, async err => {
        if (err) {
          resolve({ error: err });
        } else {
          resolve({});
        }
      });
    }
    resolve({});
  });
};

const updateUser = async (id, sessionId) => {
  const patched = await Users.query()
    .patch({
      session_id: sessionId,
      logged_in_at: moment().format(),
      updated_at: moment().format(),
    })
    .findById(id);

  if (!patched) {
    return { error: errors[4] };
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
      "logged_in_at",
      "reset_at",
      "deleted_at"
    )
    .findById(id);
};

module.exports = {
  rules,
  getUserByEmailAddress,
  validatePassword,
  clearLastSession,
  updateUser,
};
