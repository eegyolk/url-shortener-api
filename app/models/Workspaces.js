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
}

module.exports = Workspaces;
