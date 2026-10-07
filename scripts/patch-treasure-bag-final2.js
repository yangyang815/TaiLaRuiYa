// 收尾补丁：
// 1) app.json 增加 packOptions.ignore（排除开发目录，真实减小主包）
// 2) 清理最后 5 条"开启宝藏袋/宝箱"残留（对照官方 wiki）
// 3) obt 表同步本批新文案键（存在才同步）
const fs = require('fs');
const path = require('path');
const R = p => path.join(__dirname, '..', p);

// ---------- 1) app.json packOptions ----------
const app = JSON.parse(fs.readFileSync(R('app.json'), 'utf8'));
if (!app.packOptions || !app.packOptions.ignore || !app.packOptions.ignore.length) {
  app.packOptions = {
    ignore: [
      { type: 'folder', value: 'scripts' },
      { type: 'folder', value: '.workbuddy' },
      { type: 'folder', value: 'node_modules' },
      { type: 'file', value: 'README.md' },
      { type: 'file', value: '.gitignore' }
    ]
  };
  fs.writeFileSync(R('app.json'), JSON.stringify(app, null, 2));
  console.log('1) app.json packOptions.ignore 已配置（scripts/.workbuddy/node_modules 等）');
} else {
  console.log('1) [SKIP] packOptions 已存在');
}

// ---------- 2) 最后 5 条残留 ----------
const V2 = {
  'Sturdy Fossil': '由沙漠化石提炼机提炼沙漠化石获得；蛇蜥怪亦会掉落；或从绿洲匣、幻象匣中开出'
};
const V3 = {
  "Skiphs' Blood": "困难模式 Boss 的专家模式宝藏袋（史莱姆皇后的除外）有 6.25% 概率开出随机开发者物品；Celebration Mk10 世界为 12.5%",
  'Reaver Shark': '在海洋生物群系钓鱼时钓获（1.4.0.1 起镐力由 100% 降为 59%）',
  'Sawtooth Shark': '在海洋生物群系钓鱼时钓获（50% 渔力时 1/100，100% 渔力时 1/50）',
  'Golden Key': '由地牢中的愤怒骷髅怪、诅咒骷髅头、暗黑法师等敌怪掉落；在地牢的金箱中亦可找到'
};
function fixByEn(src, en, newOb, tag) {
  const anchor = '"en":"' + en + '"';
  const idx = src.indexOf(anchor);
  if (idx < 0) { console.log('[MISS]', tag, en); return src; }
  const win = src.slice(idx, idx + 1200);
  const m = win.match(/"ob":"([^"]*)"/);
  if (!m) { console.log('[NO OB]', tag, en); return src; }
  if (m[1] === newOb) return src;
  return src.slice(0, idx + m.index) + '"ob":"' + newOb + '"' + src.slice(idx + m.index + m[0].length);
}
// v2 坚固化石（ob 是"由...；开启宝藏袋获得"尾巴）——用尾巴删除
let v2src = fs.readFileSync(R('pkg-cat-2/data/data-v2.js'), 'utf8');
const sfOld = '；开启宝藏袋获得';
const ai = v2src.indexOf('"en":"Sturdy Fossil"');
if (ai >= 0) {
  const win = v2src.slice(ai, ai + 900);
  const m = win.match(/"ob":"([^"]*)"/);
  if (m && m[1].endsWith(sfOld)) {
    const nv = '"ob":"' + m[1].slice(0, -sfOld.length) + '"';
    v2src = v2src.slice(0, ai + m.index) + nv + v2src.slice(ai + m.index + m[0].length);
    console.log('2a) v2 坚固化石尾巴删除 OK');
  } else if (m) {
    console.log('  [SKIP] 坚固化石:', m[0].slice(0, 60));
  }
}
fs.writeFileSync(R('pkg-cat-2/data/data-v2.js'), v2src);
// v3 四条
let v3src = fs.readFileSync(R('pkg-cat-3/data/data-v3.js'), 'utf8');
let ok = 0;
Object.keys(V3).forEach(en => {
  const before = v3src;
  v3src = fixByEn(v3src, en, V3[en], 'v3');
  if (v3src !== before) ok++;
});
fs.writeFileSync(R('pkg-cat-3/data/data-v3.js'), v3src);
console.log('2b) v3 残留清理', ok, '/4');

// ---------- 3) obt 表同步（键存在才同步）----------
const RW = require(R('pkg-recipe/data/recipes-wiki.js'));
const syncPairs = [];
Object.keys(V2).forEach(en => syncPairs.push([en, V2[en]]));
Object.keys(V3).forEach(en => syncPairs.push([en, V3[en]]));
let rw = fs.readFileSync(R('pkg-recipe/data/recipes-wiki.js'), 'utf8');
const os = rw.indexOf('"obt":{');
let synced = 0;
syncPairs.forEach(([en, ob]) => {
  const ki = rw.indexOf('"' + en + '":"', os);
  if (ki < 0) return;
  const vs = ki + en.length + 4, ve = rw.indexOf('"', vs);
  if (rw.slice(vs, ve) !== ob) { rw = rw.slice(0, vs) + ob + rw.slice(ve); synced++; }
});
fs.writeFileSync(R('pkg-recipe/data/recipes-wiki.js'), rw);
console.log('3) obt 表同步', synced, '键');
