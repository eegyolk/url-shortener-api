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

  static modifiers = {
    selectUserForWorkspaceMembers(query) {
      const { ref } = Users;

      query.select(
        ref("id"),
        ref("full_name"),
        ref("email_address"),
        ref("image_url"),
        ref("verified_at"),
        ref("primary_workspace_id"),
        ref("deleted_at")
      );
    },
  };
}

module.exports = Users;
