const { validationResult } = require('express-validator');

// Runs after an express-validator chain and turns failures into a single 400
// with per-field messages the forms can show inline.
function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array({ onlyFirstError: true }).map((err) => ({
    field: err.path,
    message: err.msg,
  }));
  res.status(400).json({ message: errors[0].message, errors });
}

module.exports = validate;
