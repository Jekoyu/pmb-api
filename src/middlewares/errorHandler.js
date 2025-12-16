/**
 * Error Handler Middleware
 * Handles all uncaught errors in the application
 */
export const errorHandler = (err, req, res, next) => {
  // Detailed error logging
  const timestamp = new Date().toISOString();
  console.error(
    "\n╔════════════════════════════════════════════════════════════════════════════════"
  );
  console.error(`║ ❌ ERROR - ${timestamp}`);
  console.error(
    "╠════════════════════════════════════════════════════════════════════════════════"
  );
  console.error(`║ Method: ${req.method}`);
  console.error(`║ URL: ${req.originalUrl}`);
  console.error(
    `║ IP: ${req.ip || req.connection?.remoteAddress || "unknown"}`
  );
  console.error(`║ Message: ${err.message}`);
  console.error(`║ Code: ${err.code || "N/A"}`);
  console.error(
    "╠════════════════════════════════════════════════════════════════════════════════"
  );
  console.error("║ Stack Trace:");
  if (err.stack) {
    err.stack.split("\n").forEach((line) => {
      console.error(`║   ${line}`);
    });
  }
  console.error(
    "╚════════════════════════════════════════════════════════════════════════════════\n"
  );

  // Prisma-specific errors
  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      error: "Conflict",
      message: "A record with this unique field already exists.",
    });
  }

  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      error: "Not Found",
      message: "Record not found.",
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? "Internal Server Error" : "Error",
    message:
      process.env.NODE_ENV === "production" && statusCode === 500
        ? "Something went wrong"
        : message,
  });
};

/**
 * Not Found Handler
 * Handles requests to undefined routes
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: "Not Found",
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
};

export default { errorHandler, notFoundHandler };
