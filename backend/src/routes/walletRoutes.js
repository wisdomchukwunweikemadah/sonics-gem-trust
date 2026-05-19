const express = require('express');
const walletController = require('../controllers/walletController');
const validate = require('../middlewares/validateMiddleware');
const { protect } = require('../middlewares/authMiddleware');
const { walletLimiter } = require('../middlewares/rateLimiter');
const { sendGemsSchema, convertSchema, convertToGemsSchema } = require('../validators/walletValidator');

const router = express.Router();

router.use(protect);

router.get('/balance', walletController.getBalance);
router.post('/send', walletLimiter, validate(sendGemsSchema), walletController.sendGems);
router.post('/convert', walletLimiter, validate(convertSchema), walletController.convert);
router.post('/convert-to-gems', walletLimiter, validate(convertToGemsSchema), walletController.convertToGems);

module.exports = router;
