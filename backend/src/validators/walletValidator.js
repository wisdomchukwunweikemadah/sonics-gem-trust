const Joi = require('joi');

const sendGemsSchema = Joi.object({
  recipientWalletId: Joi.string().pattern(/^SGT-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/).required(),
  amount: Joi.number().positive().precision(2).max(1000000).required(),
  reference: Joi.string().max(64).optional(),
});

const convertSchema = Joi.object({
  gemsAmount: Joi.number().positive().precision(2).max(1000000).required(),
  reference: Joi.string().max(64).optional(),
});

const convertToGemsSchema = Joi.object({
  ussdAmount: Joi.number().positive().precision(2).max(1000000).required(),
  reference: Joi.string().max(64).optional(),
});

module.exports = { sendGemsSchema, convertSchema, convertToGemsSchema };
