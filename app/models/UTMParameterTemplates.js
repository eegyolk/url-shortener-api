const { Model } = require("objection");

class UTMParameterTemplates extends Model {
  static get tableName() {
    return "utm_parameter_templates";
  }
}

module.exports = UTMParameterTemplates;
