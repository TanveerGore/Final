// Global async error handler — catches unhandled errors in routes
const errorHandler = (err, req, res, _next) => {
  console.error(
    `[Error] ${req.method} ${req.originalUrl}:`,
    err.stack || err.message,
  );

  if (err.name === "ValidationError") {
    return res
      .status(400)
      .json({ msg: "Validation error", errors: err.errors });
  }

  if (err.name === "CastError" && err.kind === "ObjectId") {
    return res.status(400).json({ msg: "Invalid ID format" });
  }

  if (err.code === 11000) {
    return res.status(409).json({ msg: "Duplicate entry" });
  }

  res
    .status(err.status || 500)
    .json({ msg: err.message || "Internal server error" });
};

module.exports = errorHandler;
