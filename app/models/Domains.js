const { Model } = require("objection");

class Domains extends Model {
  static get tableName() {
    return "domains";
  }
}

module.exports = Domains;
