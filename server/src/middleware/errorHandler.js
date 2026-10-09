const multer = require('multer');
const mongoose = require('mongoose');
const HttpError = require('../utils/HttpError');
const { uploadErrorMessage } = require('./upload');

function notFound(req, res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// Express only treats a middleware as an error handler if it declares all four arguments.
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message, errors: err.details });
  }
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: uploadErrorMessage(err) });
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: `Invalid ${err.path}` });
  }
  if (err instanceof mongoose.Error.ValidationError) {
    const first = Object.values(err.errors)[0];
    return res.status(400).json({ message: first?.message || 'Invalid data' });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'value';
    return res.status(409).json({ message: `That ${field} is already taken` });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Malformed JSON body' });
  }
  if (err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ message: err.expose ? err.message : 'Request failed' });
  }

  console.error(err);
  res.status(500).json({ message: 'Something went wrong on our side' });
}

module.exports = { notFound, errorHandler };
