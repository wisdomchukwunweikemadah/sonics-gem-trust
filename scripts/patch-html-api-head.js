const fs = require('fs');
const path = require('path');

const INLINE = `  <script>
  !function(w){var p="https://dole-embolism-trustless.ngrok-free.dev/api",h=w.location.hostname,l=h==="localhost"||h==="127.0.0.1";
  if(!l){w.SGT_API_URL=p;w.__SGT_API_BASE__=p;w.__SGT_FORCE_PRODUCTION__=1;try{w.localStorage.removeItem("sgt_api_base")}catch(e){}}
  else{w.SGT_API_URL=w.SGT_API_URL||"http://localhost:5001/api"}}(window);
  </script>
`;

const META = '  <meta name="sgt-api-base" content="https://dole-embolism-trustless.ngrok-free.dev/api" />';

const pagesDir = path.join(__dirname, '../frontend/pages');

for (const file of fs.readdirSync(pagesDir)) {
  if (!file.endsWith('.html')) continue;
  const fp = path.join(pagesDir, file);
  let html = fs.readFileSync(fp, 'utf8');

  if (!html.includes('sgt-api-base')) {
    html = html.replace(
      /(<meta name="viewport"[^>]*>)/,
      `$1\n${META}\n${INLINE}`
    );
  } else if (!html.includes('SGT_API_URL')) {
    html = html.replace(
      /(<meta name="sgt-api-base"[^>]*>)/,
      `$1\n${INLINE}`
    );
  }

  html = html.replace(/app\.js\?v=\d+/g, 'sgt-wallet.js?v=4');
  html = html.replace(/src="\.\.\/assets\/js\/app\.js"/g, 'src="../assets/js/sgt-wallet.js?v=4"');
  html = html.replace(/runtime-config\.js\?v=\d+/g, 'runtime-config.js?v=4');
  html = html.replace(/env\.generated\.js\?v=\d+/g, 'env.generated.js?v=4');
  html = html.replace(/config\.js\?v=\d+/g, 'config.js?v=4');

  fs.writeFileSync(fp, html);
  console.log('patched', file);
}
