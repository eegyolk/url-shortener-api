const { Model } = require("objection");

class Workspaces extends Model {
  static get tableName() {
    return "workspaces";
  }

  static SPACE_CHARACTER = {
    BLANK_SPACE: "Blank Space",
    NOTHING: "Nothing",
    PLUS: "Plus",
    HYPEN: "Hypen",
    UNDERSCORE: "Underscore",
  };

  static get relationMappings() {
    const WorkspaceMembers = require("./WorkspaceMembers");

    return {
      members: {
        relation: Model.HasManyRelation,
        modelClass: WorkspaceMembers,
        join: {
          from: `${this.tableName}.id`,
          to: `${WorkspaceMembers.tableName}.workspace_id`,
        },
      },
    };
  }

  static modifiers = {
    selectWorkspaceForWorkspaceMembers(query) {
      const { ref } = Workspaces;

      query.select(
        ref("id"),
        ref("name"),
        ref("space_character"),
        ref("description")
      );
    },
  };
}

module.exports = Workspaces;
