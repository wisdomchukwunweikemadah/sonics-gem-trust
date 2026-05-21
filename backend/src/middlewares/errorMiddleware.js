const { sendError } = require('../utils/response');

const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Not found - ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return sendError(res, 403, 'Origin not allowed by CORS policy');
  }

  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid token');
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Token expired');
  }
  if (err.code === 'P2002') {
    return sendError(res, 409, 'Resource already exists');
  }

  return sendError(res, statusCode, err.message || 'Server error');
};

module.exports = { notFound, errorHandler };
