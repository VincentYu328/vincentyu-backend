// ------------------------------------------------------------
// Async route wrapper (catches async errors)
// ------------------------------------------------------------
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// ------------------------------------------------------------
// 404 Not Found handler (use this BEFORE errorHandler)
// ------------------------------------------------------------
export function notFoundHandler(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.path}`);
  error.status = 404;
  next(error);
}

// ------------------------------------------------------------
// Centralized error handler
// ------------------------------------------------------------
export function errorHandler(err, req, res, next) {
  // Log full error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('❌ Error:', err);
  } else {
    // In production, log only essential info
    console.error('❌ Error:', {
      message: err.message,
      status: err.status,
      path: req.path,
      method: req.method
    });
  }

  // Default status code
  const statusCode = err.status || err.statusCode || 500;

  // Prepare error response
  const errorResponse = {
    error: err.message || 'Internal Server Error'
  };

  // In development, include stack trace
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.stack = err.stack;
    errorResponse.path = req.path;
    errorResponse.method = req.method;
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.message
    });
  }

  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(409).json({
      error: 'Database constraint violation',
      details: process.env.NODE_ENV !== 'production' ? err.message : 'Duplicate entry'
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Authentication required'
    });
  }

  // Generic error response
  res.status(statusCode).json(errorResponse);
}