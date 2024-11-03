const errorHandle = (err, req, res, next) => {
  return res.status(err.code || 500).json({
    message: err.message || "Inventer Server Error",
    code: err.code,
    status: err.status,
    typeError: err.typeError,
  });
};

module.exports = errorHandle;
