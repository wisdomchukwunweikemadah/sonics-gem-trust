const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/users', adminController.getUsers);
router.get('/stats', adminController.getStats);
router.patch('/balance', adminController.adjustBalance);
router.post('/gift-gems', adminController.giftGems);

module.exports = router;
