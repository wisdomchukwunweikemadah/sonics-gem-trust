const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '../frontend/assets/js/app.js');
let t = fs.readFileSync(p, 'utf8');
const bad = "createElement('" + "motion" + "')";
const good = "createElement('" + "div" + "')";
t = t.replace(bad, good);
fs.writeFileSync(p, t);
console.log('fixed app.js spinner');
