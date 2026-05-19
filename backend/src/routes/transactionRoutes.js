const express = require('express');
const transactionController = require('../controllers/transactionController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', transactionController.getTransactions);
router.get('/activity', transactionController.getActivity);

module.exports = router;
