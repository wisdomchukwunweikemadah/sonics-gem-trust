const nodemailer = require('nodemailer');

const getEmailUser = () => (process.env.EMAIL_USER || '').trim();
const getEmailPass = () => (process.env.EMAIL_PASS || '').replace(/\s/g, '');

const isValidGmailUser = (user) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user);

const isEmailConfigured = Boolean(getEmailUser() && getEmailPass() && isValidGmailUser(getEmailUser()));

let transporter = null;
let smtpVerified = false;

if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: getEmailUser(),
      pass: getEmailPass(),
    },
    tls: {
      minVersion: 'TLSv1.2',
    },
  });
} else if (getEmailUser() || getEmailPass()) {
  console.warn(
    '[Mail] EMAIL_USER must be your full Gmail address (e.g. you@gmail.com). App passwords work; spaces in EMAIL_PASS are stripped automatically.'
  );
}

const verifyMailConnection = async () => {
  if (!isEmailConfigured || !transporter) {
    console.warn('[Mail] Not configured — verification and reset emails will be logged to console only.');
    smtpVerified = false;
    return false;
  }

  try {
    await transporter.verify();
    smtpVerified = true;
    console.log(`[Mail] Gmail SMTP verified for ${getEmailUser()}`);
    return true;
  } catch (error) {
    smtpVerified = false;
    console.error('[Mail] Gmail SMTP verification failed:', error.message);
    if (error.message.includes('Invalid login')) {
      console.error('[Mail] Use a Google App Password: https://myaccount.google.com/apppasswords');
    }
    return false;
  }
};

const getFromAddress = () => {
  if (process.env.EMAIL_FROM) return process.env.EMAIL_FROM;
  return `SGT Wallet <${getEmailUser()}>`;
};

module.exports = {
  transporter,
  isEmailConfigured,
  smtpVerified: () => smtpVerified,
  verifyMailConnection,
  getEmailUser,
  getFromAddress,
};
