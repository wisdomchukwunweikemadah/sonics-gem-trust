const adminService = require('../services/adminService');
const { sendSuccess } = require('../utils/response');

const getUsers = async (req, res, next) => {
  try {
    const users = await adminService.getAllUsers();
    sendSuccess(res, 200, 'Users retrieved', { users });
  } catch (err) {
    next(err);
  }
};

const adjustBalance = async (req, res, next) => {
  try {
    const { userId, gemBalance, ussdBalance } = req.body;
    const balance = await adminService.adjustBalance(userId, { gemBalance, ussdBalance });
    sendSuccess(res, 200, 'Balance adjusted', balance);
  } catch (err) {
    next(err);
  }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await adminService.getStatistics();
    sendSuccess(res, 200, 'Statistics retrieved', stats);
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, adjustBalance, getStats };
