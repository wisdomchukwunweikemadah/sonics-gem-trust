const fs = require('fs');
const path = require('path');

const HEAD = `  <meta name="sgt-api-base" content="https://dole-embolism-trustless.ngrok-free.dev/api" />
  <script src="../assets/js/head-api.js?v=5"></script>
`;

const HEAD_ROOT = `  <meta name="sgt-api-base" content="https://dole-embolism-trustless.ngrok-free.dev/api" />
  <script src="assets/js/head-api.js?v=5"></script>
`;

const SCRIPTS_PAGE = `  <script src="https://cdn.jsdelivr.net/npm/toastify-js"></script>
  <script src="../assets/js/runtime-config.js?v=5"></script>
  <script src="../assets/js/env.generated.js?v=5"></script>
  <script src="../assets/js/config.js?v=5"></script>
  <script src="../assets/js/notifications.js?v=5"></script>`;

const pagesDir = path.join(__dirname, '../frontend/pages');

for (const file of fs.readdirSync(pagesDir)) {
  if (!file.endsWith('.html')) continue;
  let html = fs.readFileSync(path.join(pagesDir, file), 'utf8');

  html = html.replace(/<script>\s*!function\(w\)[\s\S]*?<\/script>\s*/g, '');
  html = html.replace(/<meta name="sgt-api-base"[^>]*>\s*/g, '');

  if (!html.includes('head-api.js')) {
    html = html.replace(/(<meta name="viewport"[^>]*>)/, `$1\n${HEAD}`);
  }

  html = html.replace(
    /<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/toastify-js"><\/script>[\s\S]*?<script src="\.\.\/assets\/js\/config\.js[^"]*"><\/script>/,
    SCRIPTS_PAGE
  );

  html = html.replace(/sgt-wallet\.js\?v=\d+/g, 'sgt-wallet.js?v=5');
  html = html.replace(/notifications\.js\?v=\d+/g, 'notifications.js?v=5');
  html = html.replace(/theme\.js\?v=\d+/g, 'theme.js?v=5');
  html = html.replace(/auth\.js\?v=\d+/g, 'auth.js?v=5');
  html = html.replace(/dashboard\.js\?v=\d+/g, 'dashboard.js?v=5');
  html = html.replace(/wallet\.js\?v=\d+/g, 'wallet.js?v=5');
  html = html.replace(/admin\.js\?v=\d+/g, 'admin.js?v=5');
  html = html.replace(/settings\.js\?v=\d+/g, 'settings.js?v=5');
  html = html.replace(/transactions\.js\?v=\d+/g, 'transactions.js?v=5');
  html = html.replace(/market\.js\?v=\d+/g, 'market.js?v=5');

  fs.writeFileSync(path.join(pagesDir, file), html);
  console.log('patched', file);
}

const indexPath = path.join(__dirname, '../frontend/index.html');
if (fs.existsSync(indexPath)) {
  let idx = fs.readFileSync(indexPath, 'utf8');
  if (!idx.includes('head-api.js')) {
    idx = idx.replace(/(<meta name="viewport"[^>]*>)/, `$1\n${HEAD_ROOT}`);
  }
  fs.writeFileSync(indexPath, idx);
  console.log('patched index.html');
}
