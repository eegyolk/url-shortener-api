function ResponseObject(
  httpCode,
  status = 1,
  data = undefined,
  errorCode = 0,
  message = ""
) {
  this.httpCode = httpCode;
  this.status = status;
  this.data = data;
  this.errorCode = errorCode;
  this.message = message;
}

ResponseObject.prototype.getHttpCode = function () {
  return this.httpCode;
};

ResponseObject.prototype.getData = function () {
  const data = { status: this.status };

  if (this.data !== undefined) {
    data["data"] = this.data;
  }

  if (this.errorCode) {
    data["errorCode"] = this.errorCode;
  }

  if (this.message.length > 0) {
    data["message"] = this.message;
  }

  return data;
};

module.exports = ResponseObject;
