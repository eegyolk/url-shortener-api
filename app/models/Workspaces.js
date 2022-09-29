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
    const WorkspaceTemplates = require("./WorkspaceTemplates");

    return {
      members: {
        relation: Model.HasManyRelation,
        modelClass: WorkspaceMembers,
        join: {
          from: `${this.tableName}.id`,
          to: `${WorkspaceMembers.tableName}.workspace_id`,
        },
      },

      templates: {
        relation: Model.HasManyRelation,
        modelClass: WorkspaceTemplates,
        join: {
          from: `${this.tableName}.id`,
          to: `${WorkspaceTemplates.tableName}.workspace_id`,
        },
      },
    };
  }
}

module.exports = Workspaces;
