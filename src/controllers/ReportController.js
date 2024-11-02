const { CONFIG_MESSAGE_ERRORS } = require("../configs");
const ReportService = require("../services/ReportService");

const getReportCountProductType = async (req, res) => {
  try {
    const response = await ReportService.getReportCountProductType();
    const { data, status, typeError, message, statusMessage } = response;
    return res.status(status).json({
      typeError,
      data,
      message,
      status: statusMessage,
    });
  } catch (e) {
    return res.status(CONFIG_MESSAGE_ERRORS.INTERNAL_ERROR.status).json({
      message: "Internal Server Error",
      data: null,
      status: "Error",
      typeError: CONFIG_MESSAGE_ERRORS.INTERNAL_ERROR.type,
    });
  }
};


const getReportCountRecords = async (req, res) => {
  try {
    const response = await ReportService.getReportCountRecords();
    const { data, status, typeError, message, statusMessage } = response;
    return res.status(status).json({
      typeError,
      data,
      message,
      status: statusMessage,
    });
  } catch (e) {
    return res.status(CONFIG_MESSAGE_ERRORS.INTERNAL_ERROR.status).json({
      message: "Internal Server Error",
      data: null,
      status: "Error",
      typeError: CONFIG_MESSAGE_ERRORS.INTERNAL_ERROR.type,
    });
  }
};

module.exports = {
  getReportCountProductType,
  getReportCountRecords
};
