// utils/errorHandler.js

class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.timestamp = new Date();

    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 422);
  }
}

class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500);
  }
}

class ServiceUnavailableError extends AppError {
  constructor(message = 'Service unavailable') {
    super(message, 503);
  }
}

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new NotFoundError(message);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = new ConflictError(message);
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    const message = messages.join(', ');
    error = new ValidationError(message);
  }

  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new UnauthorizedError(message);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new UnauthorizedError(message);
  }

  if (process.env.NODE_ENV === 'development') {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      error: {
        name: err.name,
        stack: err.stack,
        ...error
      },
      timestamp: new Date().toISOString()
    });
  }

  if (process.env.NODE_ENV === 'production') {
    return res.status(error.statusCode).json({
      success: false,
      message: error.isOperational ? error.message : 'Something went wrong',
      timestamp: new Date().toISOString()
    });
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    timestamp: new Date().toISOString()
  });
};

const notFound = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError,
  ServiceUnavailableError,
  errorHandler,
  notFound,
  asyncHandler
};