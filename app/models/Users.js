const { Model } = require("objection");

class Users extends Model {
  static get tableName() {
    return "users";
  }

  static SSO_PROVIDER = {
    GOOGLE: "Google",
    FACEBOOK: "Facebook",
    TWITTER: "Twitter",
  };
}

module.exports = Users;
