// 黄金家具套装两条掉落细节化（官方 wiki 1.4.5.8：四海盗各 1/300 掉随机一件，飞行荷兰人号必掉一件）
const fs = require('fs');
const R = p => require('path').resolve(__dirname, '..', p);

const DROP = '黄金家具套装的组成之一：海盗入侵期间，私船海盗、海盗弩手、海盗神射手、海盗甲板手各以 1/300 (0.33%) 概率掉落一件随机的黄金家具；飞行荷兰人号则必定掉落一件（100%，1.4.4 加入）';

function fixOb(src, en, ob, tag) {
  const anchor = '"en":"' + en + '"';
  const idx = src.indexOf(anchor);
  if (idx < 0) { console.log('  [MISS] ' + tag + ' (' + en + ')'); return src; }
  const win = src.slice(idx, idx + 900);
  const m = win.match(/"ob":"[^"]*"/);
  if (!m) { console.log('  [MISS ob] ' + tag + ' (' + en + ')'); return src; }
  if (m[0] === '"ob":"' + ob + '"') { console.log('  [SKIP] ' + tag); return src; }
  const pos = idx + m.index;
  console.log('  [OK] ' + tag + ' (' + en + ')');
  return src.slice(0, pos) + '"ob":"' + ob + '"' + src.slice(pos + m[0].length);
}

let v3 = fs.readFileSync(R('pkg-cat-3/data/data-v3.js'), 'utf8');
v3 = fixOb(v3, 'Golden Dresser', DROP, 'v3 金梳妆台');
fs.writeFileSync(R('pkg-cat-3/data/data-v3.js'), v3);

let v2 = fs.readFileSync(R('pkg-cat-2/data/data-v2.js'), 'utf8');
v2 = fixOb(v2, 'Golden Platform', DROP, 'v2 金平台');
fs.writeFileSync(R('pkg-cat-2/data/data-v2.js'), v2);

delete require.cache[require.resolve(R('pkg-cat-3/data/data-v3.js'))];
delete require.cache[require.resolve(R('pkg-cat-2/data/data-v2.js'))];
require(R('pkg-cat-3/data/data-v3.js'));
require(R('pkg-cat-2/data/data-v2.js'));
require(R('utils/dex.js'));
console.log('语法 OK');
