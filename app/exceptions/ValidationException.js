function ValidationException(validation, status) {
  this.validation = validation;
  this.status = status;
}

ValidationException.prototype.getStatus = function () {
  return this.status;
};

ValidationException.prototype.getErrors = function () {
  return this.validation.getErrors();
};

module.exports = ValidationException;
