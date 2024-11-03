const { CONFIG_MESSAGE_ERRORS } = require("../configs");

class ErrorResponse extends Error {
  code;
  typeError;
  status;
  constructor(message, code, typeError, status) {
    super(message);
    this.code = code;
    this.typeError = typeError;
    this.status = status;
  }
}

module.exports = ErrorResponse;
