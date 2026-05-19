const {
  transporter,
  isEmailConfigured,
  verifyMailConnection,
  getFromAddress,
  getEmailUser,
} = require('../config/mail');

let lastVerifyAt = 0;
const VERIFY_INTERVAL_MS = 5 * 60 * 1000;

const ensureTransporterReady = async () => {
  if (!isEmailConfigured || !transporter) {
    return false;
  }

  const now = Date.now();
  if (now - lastVerifyAt > VERIFY_INTERVAL_MS) {
    try {
      await transporter.verify();
      lastVerifyAt = now;
    } catch (error) {
      console.error('[Mail] Pre-send verify failed:', error.message);
      return false;
    }
  }

  return true;
};

/**
 * Send email with graceful fallback — never throws to callers.
 * @returns {{ sent: boolean, simulated: boolean, messageId?: string, error?: string }}
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const payload = { to, subject };

  if (!isEmailConfigured) {
    console.log('[Mail] Simulated (not configured)', payload);
    console.log('[Mail] Set EMAIL_USER to your full Gmail and EMAIL_PASS to a Google App Password.');
    return { sent: false, simulated: true };
  }

  const ready = await ensureTransporterReady();
  if (!ready) {
    console.error('[Mail] Skipping send — SMTP not ready', payload);
    return { sent: false, simulated: true, error: 'SMTP connection not available' };
  }

  try {
    const info = await transporter.sendMail({
      from: getFromAddress(),
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
      replyTo: getEmailUser(),
    });

    console.log(`[Mail] Sent "${subject}" to ${to} — id: ${info.messageId}`);
    return { sent: true, simulated: false, messageId: info.messageId };
  } catch (error) {
    console.error(`[Mail] Failed to send "${subject}" to ${to}:`, error.message);
    if (error.response) {
      console.error('[Mail] SMTP response:', error.response);
    }
    return { sent: false, simulated: false, error: error.message };
  }
};

sendEmail.verifyOnStartup = verifyMailConnection;

module.exports = sendEmail;
