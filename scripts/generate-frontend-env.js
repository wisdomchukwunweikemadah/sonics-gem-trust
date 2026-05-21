/**
 * Writes frontend/assets/js/env.generated.js for Vercel (or manual) deploys.
 * Set SGT_API_URL in Vercel project settings when ngrok URL changes.
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
