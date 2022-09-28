const { Model } = require("objection");

class UTMParameterValues extends Model {
  static get tableName() {
    return "utm_parameter_values";
  }
}

module.exports = UTMParameterValues;
