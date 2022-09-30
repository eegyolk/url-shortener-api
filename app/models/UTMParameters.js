const { Model } = require("objection");

class UTMParameters extends Model {
  static get tableName() {
    return "utm_parameters";
  }

  static UTM_PARAMETER = {
    SOURCE: { id: 1, key: "utm_source" },
    MEDIUM: { id: 2, key: "utm_medium" },
    CAMPAIGN: { id: 3, key: "utm_campaign" },
    TERM: { id: 4, key: "utm_term" },
    CONTENT: { id: 5, key: "utm_content" },
  };

  static get relationMappings() {
    const UTMParameterValues = require("./UTMParameterValues");

    return {
      parameterValues: {
        relation: Model.HasManyRelation,
        modelClass: UTMParameterValues,
        join: {
          from: `${this.tableName}.id`,
          to: `${UTMParameterValues.tableName}.utm_parameter_id`,
        },
      },
    };
  }
}

module.exports = UTMParameters;
