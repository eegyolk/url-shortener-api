const { Model } = require("objection");

class Tags extends Model {
  static get tableName() {
    return "tags";
  }
}

module.exports = Tags;
