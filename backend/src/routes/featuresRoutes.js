const express = require('express');
const featuresController = require('../controllers/featuresController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/leaderboard', featuresController.getLeaderboard);
router.get('/activity', protect, featuresController.getActivity);
router.post('/daily-reward', protect, featuresController.claimDaily);

module.exports = router;
