const {
  baseLayout,
  primaryButton,
  badge,
  detailTable,
  alertBox,
  statGrid,
  codeBlock,
  paragraph,
  escapeHtml,
  FRONTEND,
  BRAND,
} = require('./layout');

const fmt = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (d = new Date()) =>
  new Date(d).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

/** Email verification */
const verificationEmail = ({ username, verifyUrl, token }) => {
  const body = `
    ${paragraph(`Hi <strong style="color:${BRAND.text};">${escapeHtml(username)}</strong>,`)}
    ${paragraph('Welcome to <strong>Sonic\'s Gem Trust</strong>. Confirm your email to unlock full wallet security and transaction alerts.')}
    ${badge('Action required', BRAND.warning)}
    ${primaryButton(verifyUrl, 'Verify email address')}
    ${paragraph(`Or paste this link in your browser:<br/><a href="${escapeHtml(verifyUrl)}" style="color:${BRAND.primary};word-break:break-all;">${escapeHtml(verifyUrl)}</a>`)}
    ${codeBlock(token)}
    ${alertBox('This link expires in <strong>24 hours</strong>. If you did not create an account, ignore this email.', 'info')}
  `;

  return {
    subject: 'Verify your SGT Wallet email',
    html: baseLayout({
      preheader: 'Confirm your email to secure your SGT Wallet account',
      eyebrow: 'Security',
      title: 'Verify your email',
      subtitle: 'One tap to activate your virtual wallet',
      bodyHtml: body,
    }),
    text: `Hi ${username}, verify your SGT Wallet: ${verifyUrl}\nCode: ${token}`,
  };
};

/** Password reset */
const passwordResetEmail = ({ username, resetUrl, token }) => {
  const body = `
    ${paragraph(`Hi <strong>${escapeHtml(username)}</strong>,`)}
    ${paragraph('We received a request to reset your SGT Wallet password. Use the button below to choose a new password.')}
    ${badge('Security alert', BRAND.danger)}
    ${primaryButton(resetUrl, 'Reset password')}
    ${paragraph(`Reset link:<br/><a href="${escapeHtml(resetUrl)}" style="color:${BRAND.primary};word-break:break-all;">${escapeHtml(resetUrl)}</a>`)}
    ${codeBlock(token)}
    ${alertBox('If you did not request a reset, your account is still safe — delete this email. Link expires in 24 hours.', 'danger')}
  `;

  return {
    subject: 'Reset your SGT Wallet password',
    html: baseLayout({
      preheader: 'Reset your SGT Wallet password securely',
      eyebrow: 'Account security',
      title: 'Password reset',
      subtitle: 'Create a new password for your account',
      bodyHtml: body,
    }),
    text: `Hi ${username}, reset password: ${resetUrl}\nCode: ${token}`,
  };
};

/** Login alert */
const loginAlertEmail = ({ username, email, ipAddress, userAgent, loginTime }) => {
  const body = `
    ${paragraph(`Hi <strong>${escapeHtml(username)}</strong>,`)}
    ${paragraph('A new sign-in to your SGT Wallet account was detected.')}
    ${badge('New login', BRAND.success)}
    ${detailTable([
      { label: 'Account', value: escapeHtml(email) },
      { label: 'Time', value: escapeHtml(fmtDate(loginTime)) },
      { label: 'IP address', value: escapeHtml(ipAddress || 'Unknown') },
      { label: 'Device', value: escapeHtml(userAgent || 'Unknown browser') },
    ])}
    ${primaryButton(`${FRONTEND}/pages/settings.html`, 'Review account security')}
    ${alertBox('If this was not you, reset your password immediately and contact support.', 'danger')}
  `;

  return {
    subject: 'New login to your SGT Wallet',
    html: baseLayout({
      preheader: 'New sign-in detected on your SGT Wallet account',
      eyebrow: 'Security',
      title: 'Login alert',
      subtitle: 'We notify you of every new session',
      bodyHtml: body,
    }),
    text: `New login for ${username} at ${fmtDate(loginTime)} from ${ipAddress}`,
  };
};

/** Profile picture updated */
const profilePictureEmail = ({ username, profileImageUrl, updatedAt }) => {
  const body = `
    ${paragraph(`Hi <strong>${escapeHtml(username)}</strong>,`)}
    ${paragraph('Your profile photo was updated successfully on SGT Wallet.')}
    ${badge('Profile updated', BRAND.primary)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td align="center">
          <img src="${escapeHtml(profileImageUrl)}" alt="Profile" width="120" height="120" style="display:block;width:120px;height:120px;border-radius:50%;border:3px solid ${BRAND.primary};object-fit:cover;" />
        </td>
      </tr>
    </table>
    ${detailTable([
      { label: 'Updated', value: escapeHtml(fmtDate(updatedAt)) },
      { label: 'Status', value: '<span style="color:#00ff99;">Active</span>' },
    ])}
    ${primaryButton(`${FRONTEND}/pages/settings.html`, 'View profile')}
    ${alertBox('If you did not change your photo, update your password in Settings.', 'warning')}
  `;

  return {
    subject: 'Your SGT Wallet profile photo was updated',
    html: baseLayout({
      preheader: 'Your profile picture was changed on SGT Wallet',
      eyebrow: 'Profile',
      title: 'Photo updated',
      subtitle: 'Your identity on SGT Wallet',
      bodyHtml: body,
    }),
    text: `Hi ${username}, your profile picture was updated at ${fmtDate(updatedAt)}`,
  };
};

/** USSD converted back to Gems */
const convertToGemsEmail = ({ username, ussdAmount, gemsReceived, gemBalance, ussdBalance }) => {
  const body = `
    ${paragraph(`Hi <strong>${escapeHtml(username)}</strong>,`)}
    ${paragraph('Your USSD to Gems conversion completed successfully.')}
    ${badge('Conversion complete', BRAND.success)}
    ${statGrid([
      { label: 'USSD spent', value: fmt(ussdAmount), color: BRAND.warning },
      { label: 'Gems received', value: fmt(gemsReceived), color: BRAND.primary },
    ])}
    ${detailTable([
      { label: 'Rate', value: '1 USSD = 100 Gems' },
      { label: 'New gem balance', value: fmt(gemBalance) },
      { label: 'Remaining USSD', value: fmt(ussdBalance) },
      { label: 'Completed', value: escapeHtml(fmtDate()) },
    ])}
    ${primaryButton(`${FRONTEND}/pages/dashboard.html`, 'View wallet')}
    ${alertBox('Simulation only — no real currency was exchanged.', 'info')}
  `;

  return {
    subject: `Converted ${fmt(ussdAmount)} USSD to ${fmt(gemsReceived)} Gems`,
    html: baseLayout({
      preheader: `You received ${fmt(gemsReceived)} Gems from USSD conversion`,
      eyebrow: 'Wallet',
      title: 'Gems credited',
      subtitle: 'USSD → Gems conversion receipt',
      bodyHtml: body,
    }),
    text: `Converted ${ussdAmount} USSD to ${gemsReceived} Gems. Balance: ${gemBalance} Gems`,
  };
};

/** Gems to USSD conversion receipt */
const convertToUssdEmail = ({ username, gemsAmount, ussdReceived, gemBalance, ussdBalance }) => {
  const body = `
    ${paragraph(`Hi <strong>${escapeHtml(username)}</strong>,`)}
    ${paragraph('Your Gems to USSD conversion completed successfully.')}
    ${badge('Conversion complete', BRAND.success)}
    ${statGrid([
      { label: 'Gems spent', value: fmt(gemsAmount), color: BRAND.primary },
      { label: 'USSD received', value: fmt(ussdReceived), color: BRAND.warning },
    ])}
    ${detailTable([
      { label: 'Rate', value: '100 Gems = 1 USSD' },
      { label: 'Gem balance', value: fmt(gemBalance) },
      { label: 'USSD balance', value: fmt(ussdBalance) },
    ])}
    ${primaryButton(`${FRONTEND}/pages/market.html`, 'Open market')}
  `;

  return {
    subject: `Converted ${fmt(gemsAmount)} Gems to ${fmt(ussdReceived)} USSD`,
    html: baseLayout({
      preheader: `You received ${fmt(ussdReceived)} USSD`,
      eyebrow: 'Wallet',
      title: 'USSD credited',
      subtitle: 'Gems → USSD conversion receipt',
      bodyHtml: body,
    }),
    text: `Converted ${gemsAmount} Gems to ${ussdReceived} USSD`,
  };
};

/** About / welcome product email */
const aboutEmail = ({ username, walletId }) => {
  const body = `
    ${paragraph(`Hi <strong>${escapeHtml(username)}</strong>,`)}
    ${paragraph('<strong>Sonic\'s Gem Trust</strong> is your premium simulation wallet for managing virtual Gems and USSD — built with fintech-grade security and design.')}
    ${badge('Simulation project', BRAND.primary)}
    ${statGrid([
      { label: 'Signup bonus', value: '1,000', color: BRAND.primary },
      { label: 'Convert rate', value: '100:1', color: BRAND.warning },
      { label: 'Your wallet', value: walletId ? escapeHtml(walletId) : '—', color: BRAND.success },
    ])}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
    <tr><td style="padding:12px 0;font-family:Segoe UI,Roboto,Arial,sans-serif;font-size:14px;color:${BRAND.text};">
      <strong style="color:${BRAND.primary};">💎 Send Gems</strong> — transfer instantly with Wallet ID<br/><br/>
      <strong style="color:${BRAND.primary};">⇄ Convert</strong> — swap Gems ↔ USSD at live rates<br/><br/>
      <strong style="color:${BRAND.primary};">📊 Analytics</strong> — charts, history, and insights<br/><br/>
      <strong style="color:${BRAND.primary};">🔐 Security</strong> — JWT, bcrypt, email alerts
    </td></tr>
  </table>
    ${primaryButton(`${FRONTEND}/pages/about.html`, 'Learn more about SGT')}
    ${primaryButton(`${FRONTEND}/pages/dashboard.html`, 'Open dashboard')}
    ${alertBox('No real money or payment gateways are used. For portfolio and educational purposes only.', 'info')}
  `;

  return {
    subject: 'Welcome to Sonic\'s Gem Trust — Your virtual wallet',
    html: baseLayout({
      preheader: 'Discover Gems, USSD conversions, and premium wallet features',
      eyebrow: 'Welcome',
      title: 'About SGT Wallet',
      subtitle: 'Your fintech-style simulation experience',
      bodyHtml: body,
    }),
    text: `Welcome to SGT Wallet, ${username}! Wallet ID: ${walletId}`,
  };
};

module.exports = {
  verificationEmail,
  passwordResetEmail,
  loginAlertEmail,
  profilePictureEmail,
  convertToGemsEmail,
  convertToUssdEmail,
  aboutEmail,
};
