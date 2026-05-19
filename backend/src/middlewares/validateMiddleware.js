const { sendError } = require('../utils/response');

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message,
    }));
    return sendError(res, 400, 'Validation failed', errors);
  }

  req.body = value;
  next();
};

module.exports = validate;
