const { Model } = require("objection");

class WorkspaceTemplates extends Model {
  static get tableName() {
    return "workspace_templates";
  }
}

module.exports = WorkspaceTemplates;
