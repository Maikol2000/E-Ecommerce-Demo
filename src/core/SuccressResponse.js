class SuccessResponse {
  statusCode = "";
  message = "";
  statusMessage = "";
  data;
  constructor(statusCode, message, statusMessage, data) {
    this.statusCode = statusCode;
    this.message = message;
    this.statusMessage = statusMessage;
    this.data = data;
  }

  send(res, headers = {}) {
    return res.status(this.statusCode).json({
      data: this.data,
      message: this.message,
      status: this.statusMessage,
    });
  }
}

module.exports = SuccessResponse;
