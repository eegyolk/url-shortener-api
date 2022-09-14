function ResponseObject(httpCode, data, status = 1, errorCode = 0, msg = "") {
  this.httpCode = httpCode;
  this.data = data;
  this.status = status;
  this.errorCode = errorCode;
  this.msg = msg;
}

ResponseObject.prototype.getHttpCode = function () {
  return this.httpCode;
};

ResponseObject.prototype.getData = function () {
  return {
    status: this.status,
    errorCode: this.errorCode,
    message: this.msg,
    data: this.data,
  };
};

module.exports = ResponseObject;
