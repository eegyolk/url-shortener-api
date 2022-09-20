function DefaultException(message, status) {
  this.message = message;
  this.status = status;
}

DefaultException.prototype.getStatus = function () {
  return this.status;
};

DefaultException.prototype.getErrors = function () {
  return this.message;
};

module.exports = DefaultException;
