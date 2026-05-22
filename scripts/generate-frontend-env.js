/**
 * Optional local helper — writes env.generated.js when ngrok URL changes.
 * Production deploys do NOT need this; head-api.js + config.js pin the API URL.
 *
 * Usage: SGT_API_URL=https://your.ngrok-free.dev/api node scripts/generate-frontend-env.js
 */
const fs = require('fs');
const path = require('path');

const api = (
  process.env.SGT_API_URL ||
  process.env.VITE_API_URL ||
  'https://dole-embolism-trustless.ngrok-free.dev/api'
)
  .trim()
  .replace(/\/+$/, '');

const outPath = path.join(__dirname, '../frontend/assets/js/env.generated.js');
const content = `/** Auto-generated — do not edit manually */\nwindow.__SGT_API_BASE__ = '${api}';\n`;

fs.writeFileSync(outPath, content, 'utf8');
console.log('[SGT] Wrote', outPath);
console.log('[SGT] API base:', api);
