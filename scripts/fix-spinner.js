const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '../frontend/assets/js/sgt-wallet.js');
let t = fs.readFileSync(p, 'utf8');
t = t.split("createElement('motion')").join("createElement('div')");
fs.writeFileSync(p, t);
console.log('fixed spinner');
