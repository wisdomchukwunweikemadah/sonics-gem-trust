const featuresService = require('../services/featuresService');
const { sendSuccess } = require('../utils/response');

const getLeaderboard = async (req, res, next) => {
  try {
    const data = await featuresService.getLeaderboard();
    sendSuccess(res, 200, 'Leaderboard loaded', data);
  } catch (err) {
    next(err);
  }
};

const claimDaily = async (req, res, next) => {
  try {
    const data = await featuresService.claimDailyReward(req.user.id);
    sendSuccess(res, 200, `You received ${data.reward} Gems! Streak: ${data.streak} days`, data);
  } catch (err) {
    next(err);
  }
};

const getActivity = async (req, res, next) => {
  try {
    const feed = await featuresService.getActivityFeed(Number(req.query.limit) || 20);
    sendSuccess(res, 200, 'Activity feed loaded', { feed });
  } catch (err) {
    next(err);
  }
};

module.exports = { getLeaderboard, claimDaily, getActivity };
