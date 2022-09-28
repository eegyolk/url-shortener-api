const { Model } = require("objection");

class Channels extends Model {
  static get tableName() {
    return "channels";
  }
}

module.exports = Channels;
