const walletService = require('../services/walletService');
const { sendSuccess } = require('../utils/response');

const getBalance = async (req, res, next) => {
  try {
    const balance = await walletService.getBalance(req.user.id);
    sendSuccess(res, 200, 'Balance retrieved', balance);
  } catch (err) {
    next(err);
  }
};

const sendGems = async (req, res, next) => {
  try {
    const result = await walletService.sendGems(req.user.id, req.body);
    sendSuccess(res, 200, 'Transfer successful', result);
  } catch (err) {
    next(err);
  }
};

const convert = async (req, res, next) => {
  try {
    const result = await walletService.convertGemsToUssd(req.user.id, {
      gemsAmount: req.body.gemsAmount,
      reference: req.body.reference,
    });
    sendSuccess(res, 200, 'Conversion successful', result);
  } catch (err) {
    next(err);
  }
};

const convertToGems = async (req, res, next) => {
  try {
    const result = await walletService.convertUssdToGems(req.user.id, {
      ussdAmount: req.body.ussdAmount,
      reference: req.body.reference,
    });
    sendSuccess(res, 200, 'Conversion to Gems successful', result);
  } catch (err) {
    next(err);
  }
};

module.exports = { getBalance, sendGems, convert, convertToGems };
