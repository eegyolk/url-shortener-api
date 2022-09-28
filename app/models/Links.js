const { Model } = require("objection");

class Links extends Model {
  static get tableName() {
    return "links";
  }

  static IS_ACTIVE = {
    NO: 0,
    YES: 1,
  };
}

module.exports = Links;
