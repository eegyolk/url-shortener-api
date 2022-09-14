const Validator = require("validatorjs");

const ValidationException = require("../exceptions/ValidationException");
const HttpCode = require("./HttpCode");

function Validation(data, rules, messages = null) {
  this.validator = new Validator(data, rules, messages);
}

Validation.prototype.validate = function (
  status = HttpCode.UNPROCESSABLE_ENTITY
) {
  if (this.validator.passes() && !this.validator.fails()) {
    return true;
  } else {
    this.errors = this.validator.errors;
    throw new ValidationException(this, status);
  }
};

Validation.prototype.getErrors = function () {
  return this.errors;
};

module.exports = Validation;
