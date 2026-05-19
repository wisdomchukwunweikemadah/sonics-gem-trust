/**
 * Generate HTML previews of all email templates in docs/email-previews/
 * Run: node scripts/preview-emails.js
 */
const fs = require('fs');
const path = require('path');
const templates = require('../src/emails');

const outDir = path.join(__dirname, '../../docs/email-previews');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const samples = {
  verificationEmail: templates.verificationEmail({
    username: 'SonicFan',
    verifyUrl: 'http://127.0.0.1:5500/pages/login.html?verify=sample-token',
    token: 'sample-verify-token-abc123',
  }),
  passwordResetEmail: templates.passwordResetEmail({
    username: 'SonicFan',
    resetUrl: 'http://127.0.0.1:5500/pages/login.html?reset=sample-reset',
    token: 'sample-reset-token-xyz',
  }),
  loginAlertEmail: templates.loginAlertEmail({
    username: 'SonicFan',
    email: 'user@example.com',
    ipAddress: '192.168.1.42',
    userAgent: 'Chrome 120 / Windows 10',
    loginTime: new Date(),
  }),
  profilePictureEmail: templates.profilePictureEmail({
    username: 'SonicFan',
    profileImageUrl: 'https://via.placeholder.com/120',
    updatedAt: new Date(),
  }),
  convertToGemsEmail: templates.convertToGemsEmail({
    username: 'SonicFan',
    ussdAmount: 5,
    gemsReceived: 500,
    gemBalance: 1500,
    ussdBalance: 10,
  }),
  convertToUssdEmail: templates.convertToUssdEmail({
    username: 'SonicFan',
    gemsAmount: 500,
    ussdReceived: 5,
    gemBalance: 1000,
    ussdBalance: 15,
  }),
  aboutEmail: templates.aboutEmail({
    username: 'SonicFan',
    walletId: 'SGT-DEMO-1234-ABCD',
  }),
};

Object.entries(samples).forEach(([name, { html, subject }]) => {
  const file = path.join(outDir, `${name}.html`);
  fs.writeFileSync(file, html, 'utf8');
  console.log(`Wrote ${file} — ${subject}`);
});

console.log(`\nOpen files in ${outDir} to preview emails in a browser.`);
