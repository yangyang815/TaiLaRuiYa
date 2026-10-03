// 全库 df 字段 HTML 实体清理：&#32;→空格、&#8239;→空格、&#58;→冒号等
const fs = require('fs');
const path = require('path');
const R = p => path.join(__dirname, '..', p);

function decodeEntities(s) {
  return s.replace(/&#(\d+);/g, (m, n) => {
    const c = parseInt(n, 10);
    if (c === 32 || c === 8239 || c === 160) return ' ';
    if (c === 58) return '：';
    return String.fromCodePoint(c);
  });
}

['pkg-cat-2/data/data-v2.js', 'pkg-cat-3/data/data-v3.js'].forEach(f => {
  let s = fs.readFileSync(R(f), 'utf8');
  let n = 0;
  s = s.replace(/"df":"([^"]*)"/g, (m, inner) => {
    const dec = decodeEntities(inner);
    if (dec !== inner) { n++; return '"df":"' + dec + '"'; }
    return m;
  });
  fs.writeFileSync(R(f), s);
  console.log(f, '解码', n, '条 df');
});

// 校验
const v2 = require(R('pkg-cat-2/data/data-v2.js'));
const v3 = require(R('pkg-cat-3/data/data-v3.js'));
const bad = [...v2, ...v3].filter(e => /&#/.test(e.df || ''));
console.log('df 实体残留:', bad.length);
const sample = v2.find(x => x.n === '远古钴盔甲');
console.log('远古钴盔甲 df:', JSON.stringify(sample.df));
const s2 = v2.find(x => x.n === '死灵盔甲');
console.log('死灵盔甲 df:', JSON.stringify(s2.df));
console.log('DONE');
