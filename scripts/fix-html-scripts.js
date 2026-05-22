const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, '../frontend');

const walk = (dir, files = []) => {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, files);
    else if (name.endsWith('.html')) files.push(p);
  }
  return files;
};

for (const file of walk(frontendDir)) {
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/head-api\.js\?v=\d+/g, 'head-api.js?v=6');
  html = html.replace(/\?v=\d+/g, '?v=6');
  html = html.replace(/\s*<script src="[^"]*runtime-config\.js[^"]*"><\/script>\n?/g, '\n');
  html = html.replace(/\s*<script src="[^"]*env\.generated\.js[^"]*"><\/script>\n?/g, '\n');
  const seen = new Set();
  html = html.replace(/<script src="([^"]*notifications\.js[^"]*)"><\/script>\n?/g, (m, src) => {
    if (seen.has(src)) return '';
    seen.add(src);
    return m;
  });
  fs.writeFileSync(file, html);
  console.log('Fixed', path.relative(frontendDir, file));
}
