const { Model } = require("objection");

class WorkspaceMembers extends Model {
  static get tableName() {
    return "workspace_members";
  }

  static ROLES = {
    OWNER: "Owner",
    ADMIN: "Admin",
    EDITOR: "Editor",
    VIEWER: "Viewer",
  };
}

module.exports = WorkspaceMembers;
