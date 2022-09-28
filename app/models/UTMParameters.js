const { Model } = require("objection");

class UTMParameters extends Model {
  static get tableName() {
    return "utm_parameters";
  }
}

module.exports = UTMParameters;
