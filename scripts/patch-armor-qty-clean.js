// rec 表清理：移除已废弃配方变体 + 去重相同变体（官方 wiki 1.4.5.8）
const fs = require('fs');
const R = p => require('path').resolve(__dirname, '..', p);

delete require.cache[require.resolve(R('pkg-recipe/data/recipes-wiki.js'))];
const DATA = require(R('pkg-recipe/data/recipes-wiki.js'));

// 1) 移除已废弃的配方变体
//    寒霜盔甲：神圣锭+寒霜核 配方已移除（现为任意精金/钛金锭+寒霜核）
//    幽灵兜帽/面具：叶绿锭+灵气 配方已移除（1.3.0.1 起改用幽灵锭）
let removed = [];
const STALE = {
  'Frost Helmet': v => JSON.stringify(v.i).includes('Hallowed Bar'),
  'Frost Breastplate': v => JSON.stringify(v.i).includes('Hallowed Bar'),
  'Frost Leggings': v => JSON.stringify(v.i).includes('Hallowed Bar'),
  'Spectre Hood': v => JSON.stringify(v.i).includes('Ectoplasm'),
  'Spectre Mask': v => JSON.stringify(v.i).includes('Ectoplasm'),
};
Object.keys(STALE).forEach(en => {
  const variants = DATA.rec[en];
  if (!variants) return;
  const kept = variants.filter(v => !STALE[en](v));
  if (kept.length < variants.length) {
    removed.push(en + '（' + (variants.length - kept.length) + ' 个废弃变体）');
    DATA.rec[en] = kept;
  }
});

// 2) 盔甲条目去重：完全相同的变体只留一个
let dedup = [];
Object.keys(DATA.rec).forEach(en => {
  if (!en.match(/Helmet|Chainmail|Greaves|Breastplate|Leggings|Mask|Hat|Hood|Headgear|Plate|Suit|Scale Mail|Shell|Robe|Pants|Vest|Coat|Outlaw|Longcoat|Visor|armor|Hood|Chestplate|Treads/)) return;
  const variants = DATA.rec[en];
  if (!variants || variants.length < 2) return;
  const seen = new Set();
  const kept = variants.filter(v => {
    const k = JSON.stringify(v);
    if (seen.has(k)) return false;
    seen.add(k); return true;
  });
  if (kept.length < variants.length) { dedup.push(en + '（' + (variants.length - kept.length) + '）'); DATA.rec[en] = kept; }
});

fs.writeFileSync(R('pkg-recipe/data/recipes-wiki.js'), 'module.exports=' + JSON.stringify(DATA) + ';');
console.log('移除废弃变体:', removed.length ? removed.join('；') : '无');
console.log('去重条目:', dedup.length ? dedup.join('；') : '无');

delete require.cache[require.resolve(R('pkg-recipe/data/recipes-wiki.js'))];
const D2 = require(R('pkg-recipe/data/recipes-wiki.js'));
console.log('rec[Frost Helmet]:', JSON.stringify(D2.rec['Frost Helmet']));
console.log('rec[Spectre Hood]:', JSON.stringify(D2.rec['Spectre Hood']));
console.log('rec[Copper Helmet]:', JSON.stringify(D2.rec['Copper Helmet']));
global.wx = { getStorageSync: () => 0, setStorageSync: () => {} };
require(R('utils/dex.js'));
console.log('语法 OK');
