const BRAND = {
  primary: '#00d4ff',
  secondary: '#7c3aed',
  dark: '#0f172a',
  card: '#111827',
  surface: '#1e293b',
  text: '#f8fafc',
  muted: '#94a3b8',
  success: '#00ff99',
  danger: '#ff4d4d',
  warning: '#ffb020',
};

const FRONTEND = (process.env.FRONTEND_URL || 'https://sonics-gem-trust.vercel.app').replace(/\/$/, '');

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const preheaderBlock = (text) => `
  <div style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;max-height:0;overflow:hidden;mso-hide:all;">
    ${escapeHtml(text)}
  </motion>
`.replace('</motion>', '</div>');

const baseLayout = ({ preheader, eyebrow, title, subtitle, bodyHtml }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="color-scheme" content="dark" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { margin:0; padding:0; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .stack-col { display: block !important; width: 100% !important; }
      .px-mobile { padding-left: 20px !important; padding-right: 20px !important; }
      .hero-title { font-size: 24px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.dark};">
  ${preheaderBlock(preheader)}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.dark};">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="border-radius:20px 20px 0 0;background:linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%);padding:32px 28px;" class="px-mobile">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td valign="top">
                    <p style="margin:0 0 6px;font-family:Segoe UI,Roboto,Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.85);">
                      ${escapeHtml(eyebrow || 'SGT WALLET')}
                    </p>
                    <h1 class="hero-title" style="margin:0;font-family:Segoe UI,Roboto,Arial,sans-serif;font-size:28px;font-weight:800;line-height:1.2;color:#ffffff;">
                      ${escapeHtml(title)}
                    </h1>
                    ${subtitle ? `<p style="margin:10px 0 0;font-family:Segoe UI,Roboto,Arial,sans-serif;font-size:15px;line-height:1.5;color:rgba(255,255,255,0.92);">${escapeHtml(subtitle)}</p>` : ''}
                  </td>
                  <td width="52" align="right" valign="top">
                    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                      <td style="width:48px;height:48px;border-radius:14px;background:rgba(255,255,255,0.2);text-align:center;font-size:22px;line-height:48px;">&#128142;</td>
                    </tr></table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color:${BRAND.card};border-left:1px solid rgba(148,163,184,0.12);border-right:1px solid rgba(148,163,184,0.12);padding:32px 28px;" class="px-mobile">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="background-color:${BRAND.surface};border-radius:0 0 20px 20px;border:1px solid rgba(148,163,184,0.12);border-top:none;padding:24px 28px;" class="px-mobile">
              <p style="margin:0 0 12px;font-family:Segoe UI,Roboto,Arial,sans-serif;font-size:13px;text-align:center;">
                <a href="${FRONTEND}/pages/dashboard.html" style="color:${BRAND.primary};text-decoration:none;margin:0 8px;">Dashboard</a>
                <a href="${FRONTEND}/pages/about.html" style="color:${BRAND.primary};text-decoration:none;margin:0 8px;">About</a>
                <a href="${FRONTEND}/pages/settings.html" style="color:${BRAND.primary};text-decoration:none;margin:0 8px;">Settings</a>
              </p>
              <p style="margin:0;font-family:Segoe UI,Roboto,Arial,sans-serif;font-size:12px;line-height:1.5;color:${BRAND.muted};text-align:center;">
                Simulation only — no real money or payment gateways.<br />
                &copy; ${new Date().getFullYear()} Sonic's Gem Trust
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const primaryButton = (href, label) => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:28px auto;">
    <tr>
      <td align="center" style="border-radius:12px;background:linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary});">
        <a href="${escapeHtml(href)}" target="_blank" style="display:inline-block;padding:14px 32px;font-family:Segoe UI,Roboto,Arial,sans-serif;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">
          ${escapeHtml(label)}
        </a>
      </td>
    </tr>
  </table>`;

const badge = (text, color = BRAND.primary) => `
  <span style="display:inline-block;padding:6px 12px;border-radius:999px;background:rgba(0,212,255,0.12);color:${color};font-family:Segoe UI,Roboto,Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">
    ${escapeHtml(text)}
  </span>`;

const detailTable = (rows) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;border-radius:12px;overflow:hidden;border:1px solid rgba(148,163,184,0.15);">
    ${rows
      .map(
        (row, i) => `
    <tr style="background-color:${i % 2 === 0 ? BRAND.surface : BRAND.card};">
      <td style="padding:14px 16px;font-family:Segoe UI,Roboto,Arial,sans-serif;font-size:13px;color:${BRAND.muted};">${escapeHtml(row.label)}</td>
      <td style="padding:14px 16px;font-family:Segoe UI,Roboto,Arial,sans-serif;font-size:14px;font-weight:600;color:${BRAND.text};text-align:right;">${row.value}</td>
    </tr>`
      )
      .join('')}
  </table>`;

const alertBox = (message, type = 'info') => {
  const styles = {
    info: { bg: 'rgba(0,212,255,0.1)', border: BRAND.primary },
    success: { bg: 'rgba(0,255,153,0.1)', border: BRAND.success },
    warning: { bg: 'rgba(255,176,32,0.1)', border: BRAND.warning },
    danger: { bg: 'rgba(255,77,77,0.1)', border: BRAND.danger },
  };
  const s = styles[type] || styles.info;
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
    <tr>
      <td style="padding:16px 18px;border-radius:12px;background:${s.bg};border-left:4px solid ${s.border};font-family:Segoe UI,Roboto,Arial,sans-serif;font-size:14px;line-height:1.5;color:${BRAND.text};">
        ${message}
      </td>
    </tr>
  </table>`;
};

const statGrid = (stats) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
    <tr>
      ${stats
        .map(
          (s) => `
      <td class="stack-col" width="${Math.floor(100 / stats.length)}%" style="padding:6px;vertical-align:top;">
        <table role="presentation" width="100%" style="background:${BRAND.surface};border-radius:12px;border:1px solid rgba(148,163,184,0.12);">
          <tr>
            <td style="padding:16px;text-align:center;">
              <p style="margin:0 0 4px;font-family:Segoe UI,Roboto,Arial,sans-serif;font-size:11px;color:${BRAND.muted};text-transform:uppercase;">${escapeHtml(s.label)}</p>
              <p style="margin:0;font-family:Segoe UI,Roboto,Arial,sans-serif;font-size:20px;font-weight:800;color:${s.color || BRAND.primary};">${escapeHtml(String(s.value))}</p>
            </td>
          </tr>
        </table>
      </td>`
        )
        .join('')}
    </tr>
  </table>`;

const codeBlock = (code) => `
  <p style="margin:16px 0;padding:14px;background:${BRAND.surface};border-radius:10px;border:1px dashed rgba(148,163,184,0.3);font-family:Consolas,Monaco,monospace;font-size:14px;color:${BRAND.primary};text-align:center;word-break:break-all;">
    ${escapeHtml(code)}
  </p>`;

const paragraph = (html) => `
  <p style="margin:0 0 16px;font-family:Segoe UI,Roboto,Arial,sans-serif;font-size:15px;line-height:1.65;color:${BRAND.text};">${html}</p>`;

module.exports = {
  BRAND,
  FRONTEND,
  escapeHtml,
  baseLayout,
  primaryButton,
  badge,
  detailTable,
  alertBox,
  statGrid,
  codeBlock,
  paragraph,
};
