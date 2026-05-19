const transactionService = require('../services/transactionService');
const { sendSuccess } = require('../utils/response');

const getTransactions = async (req, res, next) => {
  try {
    const { type, limit, page } = req.query;
    const result = await transactionService.getUserTransactions(req.user.id, {
      type,
      limit: limit ? parseInt(limit, 10) : 20,
      page: page ? parseInt(page, 10) : 1,
    });
    sendSuccess(res, 200, 'Transactions retrieved', result);
  } catch (err) {
    next(err);
  }
};

const getActivity = async (req, res, next) => {
  try {
    const activity = await transactionService.getWeeklyActivity(req.user.id);
    sendSuccess(res, 200, 'Weekly activity retrieved', activity);
  } catch (err) {
    next(err);
  }
};

module.exports = { getTransactions, getActivity };
