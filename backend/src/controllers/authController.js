const authService = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/response');

const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.registerUser(req.body);
    sendSuccess(res, 201, 'Account created successfully. You are now logged in.', {
      user,
      token,
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const loginMeta = {
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
      userAgent: req.headers['user-agent'],
      loginTime: new Date(),
    };
    const { user, token } = await authService.loginUser(req.body, loginMeta);
    sendSuccess(res, 200, 'Login successful', { user, token });
  } catch (err) {
    next(err);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const result = await authService.verifyEmail(req.body.token);
    sendSuccess(res, 200, 'Email verified successfully', result);
  } catch (err) {
    next(err);
  }
};

const requestReset = async (req, res, next) => {
  try {
    const result = await authService.requestPasswordReset(req.body.email);
    sendSuccess(res, 200, result.message, process.env.NODE_ENV === 'development' ? { token: result.token } : null);
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.body);
    sendSuccess(res, 200, result.message);
  } catch (err) {
    next(err);
  }
};

const resendVerification = async (req, res, next) => {
  try {
    const result = await authService.resendVerification(req.body.email);
    sendSuccess(res, 200, result.message, process.env.NODE_ENV === 'development' ? { token: result.token } : null);
  } catch (err) {
    next(err);
  }
};

const logout = (req, res) => {
  sendSuccess(res, 200, 'Logged out successfully');
};

module.exports = {
  register,
  login,
  verifyEmail,
  requestReset,
  resetPassword,
  resendVerification,
  logout,
};
