const Joi = require('joi');

const transactionQuerySchema = Joi.object({
  type: Joi.string().valid('SEND', 'RECEIVE', 'CONVERT', 'BONUS').optional(),
  limit: Joi.number().integer().min(1).max(100).default(20),
  page: Joi.number().integer().min(1).default(1),
});

module.exports = { transactionQuerySchema };
