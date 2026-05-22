const express = require('express');
const authController = require('../controllers/authController');
const validate = require('../middlewares/validateMiddleware');
const { authLimiter } = require('../middlewares/rateLimiter');
const {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resetPasswordSchema,
  requestResetSchema,
  resendVerificationSchema,
} = require('../validators/authValidator');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/verify-email', authLimiter, validate(verifyEmailSchema), authController.verifyEmail);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.post('/request-reset', authLimiter, validate(requestResetSchema), authController.requestReset);
router.post(
  '/resend-verification',
  authLimiter,
  validate(resendVerificationSchema),
  authController.resendVerification
);
router.post('/logout', protect, authController.logout);

module.exports = router;
