const AppError = require('../utils/appError');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });

    // Programming and other unknown error: don't leak error details
  } else {
    // 1. Log error
    // console.log('Error: ', err);

    // 2. Send generic message
    res.status(500).json({
      status: 'error',
      message: 'something went very wrong'
    });
  }
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue.name;
  const message = `Duplicate field value: "${value}". Please use other value !!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const value = err.message.slice(30, err.message.length - 1);
  const message = `Invalid input data. ${value}`;
  return new AppError(message, 400);
};

const handleJWTError = (err) => new AppError('Invalid token. Please log in again', 401);

const handleTokenExpiredError = (err) => new AppError('Your token has expired. Please log in again', 401)

module.exports = (err, req, res, next) => {
  // console.log(process.env.NODE_ENV);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    if (err.name === 'CastError') err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') err = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') err = handleJWTError(err);
    if (err.name === 'TokenExpiredError') err = handleTokenExpiredError(err);

    sendErrorProd(err, res);
  }
};
