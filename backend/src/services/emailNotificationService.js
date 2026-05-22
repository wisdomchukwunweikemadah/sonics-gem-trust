const sendEmail = require('../utils/sendEmail');
const templates = require('../emails');

const PRODUCTION_FRONTEND = 'https://sonics-gem-trust.vercel.app';

const getFrontendUrl = () =>
  (process.env.FRONTEND_URL || PRODUCTION_FRONTEND).replace(/\/$/, '');

const dispatch = async (templateFn, to, payload) => {
  const { subject, html, text } = templateFn(payload);
  return sendEmail({ to, subject, html, text });
};

const sendVerificationEmail = (user, verifyToken) => {
  const verifyUrl = `${getFrontendUrl()}/pages/verify-email.html?token=${verifyToken}`;
  return dispatch(templates.verificationEmail, user.email, {
    username: user.username,
    verifyUrl,
    token: verifyToken,
  });
};

const sendPasswordResetEmail = (user, token) => {
  const resetUrl = `${getFrontendUrl()}/pages/login.html?reset=${token}`;
  return dispatch(templates.passwordResetEmail, user.email, {
    username: user.username,
    resetUrl,
    token,
  });
};

const sendLoginAlertEmail = (user, meta) =>
  dispatch(templates.loginAlertEmail, user.email, {
    username: user.username,
    email: user.email,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
    loginTime: meta.loginTime || new Date(),
  });

const sendProfilePictureEmail = (user, profileImageUrl) =>
  dispatch(templates.profilePictureEmail, user.email, {
    username: user.username,
    profileImageUrl,
    updatedAt: new Date(),
  });

const sendConvertToGemsEmail = (user, data) =>
  dispatch(templates.convertToGemsEmail, user.email, {
    username: user.username,
    ...data,
  });

const sendConvertToUssdEmail = (user, data) =>
  dispatch(templates.convertToUssdEmail, user.email, {
    username: user.username,
    ...data,
  });

const sendAboutEmail = (user) =>
  dispatch(templates.aboutEmail, user.email, {
    username: user.username,
    walletId: user.walletId,
  });

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendLoginAlertEmail,
  sendProfilePictureEmail,
  sendConvertToGemsEmail,
  sendConvertToUssdEmail,
  sendAboutEmail,
  getFrontendUrl,
};
