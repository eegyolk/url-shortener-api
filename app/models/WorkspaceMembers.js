const { Model } = require("objection");

class WorkspaceMembers extends Model {
  static get tableName() {
    return "workspace_members";
  }

  static ROLES = {
    OWNER: "Owner", // the owner of workspace
    ADMIN: "Admin", // can create/read/edit/delete
    EDITOR: "Editor", // can read/edit
    VIEWER: "Viewer", // can read only
  };
}

module.exports = WorkspaceMembers;
