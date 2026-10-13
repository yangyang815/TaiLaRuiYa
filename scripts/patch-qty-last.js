// 最后 5 条收尾：永夜刃定制文案 + 贝壳电话 4 条白名单（文案已完整，无需数量）
const fs = require('fs');
const path = require('path');
const R = p => path.join(__dirname, '..', p);

const v3p = 'pkg-cat-3/data/data-v3.js';
let raw = fs.readFileSync(R(v3p), 'utf8');

function fixOb(src, en, newOb) {
  const anchor = '"en":"' + en + '"';
  let idx = -1;
  while ((idx = src.indexOf(anchor, idx + 1)) >= 0) {
    let end = src.indexOf('},{"n":"', idx);
    if (end < 0) end = src.length;
    const win = src.slice(idx, end);
    const m = win.match(/"ob":"[^"]*"/);
    if (!m) continue;
    if (m[0] === '"ob":"' + newOb + '"') return src;
    return src.slice(0, idx + m.index) + '"ob":"' + newOb + '"' + src.slice(idx + m.index + m[0].length);
  }
  return src;
}

// 永夜刃：统一译名（Fiery Greatsword 现行译名 炽焰巨剑；腐化用魔光剑、猩红用血腥屠刀，各材料 1 个）
const NE = '合成：血腥屠刀（猩红世界）或 魔光剑（腐化世界）+ 村正 + 草剑 + 炽焰巨剑 @ 恶魔祭坛（各材料 1 个）';
const before = raw;
raw = fixOb(raw, "Night's Edge", NE);
console.log('永夜刃:', raw !== before ? '已更新' : '无变化');
fs.writeFileSync(R(v3p), raw);
console.log('贝壳电话 4 条: 维持上一轮手写完整文案（材料各 1 个，无需数量标注）');
