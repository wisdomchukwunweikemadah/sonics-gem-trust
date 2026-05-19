const userService = require('../services/userService');
const { sendSuccess } = require('../utils/response');

const getProfile = async (req, res, next) => {
  try {
    const profile = await userService.getProfile(req.user.id);
    sendSuccess(res, 200, 'Profile retrieved', profile);
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const profile = await userService.updateProfile(req.user.id, req.body);
    sendSuccess(res, 200, 'Profile updated', profile);
  } catch (err) {
    next(err);
  }
};

const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      const err = new Error('No file uploaded');
      err.statusCode = 400;
      throw err;
    }
    const profile = await userService.uploadProfileImage(req.user.id, req.file.path);
    sendSuccess(res, 200, 'Profile image updated', profile);
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, uploadAvatar };
