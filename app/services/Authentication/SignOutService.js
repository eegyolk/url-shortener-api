const moment = require("moment");

const Users = require("../../models/Users");

const errors = {
  1: { code: "ERR-SIGNOUT-01", message: "Unable to update user record." },
};

const clearSession = sessionId => {
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

const updateUser = async id => {
  const patched = await Users.query()
    .patch({
      session_id: null,
      logged_in_at: null,
      updated_at: moment().format(),
    })
    .findById(id);

  if (!patched) {
    return { error: errors[1] };
  }

  return {};
};

module.exports = {
  clearSession,
  updateUser,
};
