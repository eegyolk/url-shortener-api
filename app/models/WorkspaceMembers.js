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

  static get relationMappings() {
    const Users = require("./Users");
    const Workspaces = require("./Workspaces");

    return {
      workspace: {
        relation: Model.BelongsToOneRelation,
        modelClass: Workspaces,
        join: {
          from: `${this.tableName}.workspace_id`,
          to: `${Workspaces.tableName}.id`,
        },
      },

      ownerUser: {
        relation: Model.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: `${this.tableName}.owner_user_id`,
          to: `${Users.tableName}.id`,
        },
      },

      creatorUser: {
        relation: Model.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: `${this.tableName}.creator_user_id`,
          to: `${Users.tableName}.id`,
        },
      },

      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: `${this.tableName}.user_id`,
          to: `${Users.tableName}.id`,
        },
      },
    };
  }
}

module.exports = WorkspaceMembers;
