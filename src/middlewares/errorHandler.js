/**
 * Error Handler Middleware
 * Handles all uncaught errors in the application
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Prisma-specific errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: 'Conflict',
      message: 'A record with this unique field already exists.',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: 'Not Found',
      message: 'Record not found.',
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? 'Internal Server Error' : 'Error',
    message: process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Something went wrong'
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
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
};

export default { errorHandler, notFoundHandler };
