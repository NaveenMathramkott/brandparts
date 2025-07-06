const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      success: false,
      message: "File size too large",
    });
  }

  if (err.code === "LIMIT_FILE_COUNT") {
    return res.status(400).json({
      success: false,
      message: "Too many files uploaded",
    });
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      success: false,
      message: "Invalid file type",
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    message: err.message || "Something went wrong",
  });
};

export default errorHandler;
