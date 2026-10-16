/** 药水地图来源补全（wiki 核对），三源同步 + 删除重复条目 */
const fs = require('fs');
const R = p => 'D:/小程序库/泰拉瑞亚/' + p;
function extractObj(src, key) {
  const k = '"' + key + '":{';
  const i = src.indexOf(k);
  let depth = 0, end = -1;
  for (let c = i + k.length - 1; c < src.length; c++) {
    if (src[c] === '{') depth++;
    else if (src[c] === '}') { depth--; if (depth === 0) { end = c; break; } }
  }
  return { obj: JSON.parse(src.slice(i + k.length - 1, end + 1)), start: i + k.length - 1, end: end + 1 };
}

// 依据 EN wiki 各药水页面正文（2026-10-16 抓取）核实的额外来源
const ADD = {
  'Lesser Healing Potion': '罐子（仅前困难模式）与生成的宝箱中可找到，木匣与珍珠木匣常备，多数早期 Boss 掉落；商人出售，骷髅商人于特定月相亦出售',
  'Healing Potion': '困难模式的罐子与前困难模式的地狱罐子中可找到；独眼巨鹿、骷髅王、血肉墙掉落；商人与骷髅商人（困难模式）出售',
  'Mana Potion': '木匣与珍珠木匣外的各类匣子中可开出；商人（困难模式）出售',
  'Restoration Potion': '地狱的暗影箱中可找到',
  'Teleportation Potion': '洞穴层的宝箱与暗影箱中可找到',
  'Potion of Return': '洞穴层与地狱的罐子、暗影箱中可找到',
  'Recall Potion': '罐子与宝箱中可找到，部分史莱姆有小概率作为额外掉落送出',
  'Wormhole Potion': '罐子中可找到，史莱姆小概率额外掉落（仅多人模式）',
  'Mining Potion': '罐子、宝箱与匣子中常备，史莱姆小概率额外掉落',
  'Heartreach Potion': '罐子与各类匣子常备',
  'Greater Healing Potion': '多数困难模式 Boss、生物拟态与火星飞碟掉落',
  'Super Healing Potion': '月亮领主必掉',
  'Flask of Party': '庆典 Mk 10 世界中可从公主处购买',
};
const stats = { items: 0, removed: 0, obt: 0 };

// ---------- 1. items.js ----------
let src = fs.readFileSync(R('data/items.js'), 'utf8');
// 1a. 删除重复条目 矿工药水（id:miner，wiki 无此页，与挖矿药水重复）
{
  const anchor = 'id:"miner"';
  const i = src.indexOf(anchor);
  if (i >= 0) {
    // 条目边界：向前找 {，向后找配对 }
    let st = src.lastIndexOf('{', i);
    let depth = 0, end = -1;
    for (let c = st; c < src.length; c++) {
      if (src[c] === '{') depth++;
      else if (src[c] === '}') { depth--; if (depth === 0) { end = c; break; } }
    }
    // 吃掉后随逗号
    let cutEnd = end + 1;
    if (src[cutEnd] === ',') cutEnd++;
    else if (src[st - 1] === ',') st--; // 或前置逗号
    src = src.slice(0, st) + src.slice(cutEnd);
    stats.removed++;
  }
}
// 1b. 追加来源
const nameRe = /name:"([^"]+)"/g;
let m;
const anchors = [];
while ((m = nameRe.exec(src))) anchors.push({ n: m[1], pos: m.index });
anchors.forEach((a, idx) => {
  const end = idx + 1 < anchors.length ? anchors[idx + 1].pos : src.length;
  const win = src.slice(a.pos, end);
  const om = win.match(/obtain:"([^"]*)"/);
  if (!om) return;
  const en = (win.match(/en:"([^"]*)"/) || [])[1];
  if (!en || !ADD[en]) return;
  if (om[1].includes(ADD[en].slice(0, 12))) return; // 幂等
  const nu = om[1] + '；' + ADD[en];
  src = src.slice(0, a.pos + om.index) + 'obtain:"' + nu + '"' + src.slice(a.pos + om.index + om[0].length);
  const delta = nu.length - om[1].length;
  for (let k = idx + 1; k < anchors.length; k++) anchors[k].pos += delta;
  stats.items++;
});
fs.writeFileSync(R('data/items.js'), src);
console.log('items.js: 补来源', stats.items, '删除重复', stats.removed);

// ---------- 2. obt 表同步 ----------
let rw = fs.readFileSync(R('pkg-recipe/data/recipes-wiki.js'), 'utf8');
const obE = extractObj(rw, 'obt');
Object.keys(ADD).forEach(en => {
  const val = obE.obj[en];
  if (!val || !val.startsWith('合成：')) return;
  if (val.includes(ADD[en].slice(0, 12))) return;
  obE.obj[en] = val + '；' + ADD[en];
  stats.obt++;
});
rw = rw.slice(0, obE.start) + JSON.stringify(obE.obj) + rw.slice(obE.end);
fs.writeFileSync(R('pkg-recipe/data/recipes-wiki.js'), rw);
console.log('obt: 同步', stats.obt);

// ---------- 3. v3 图鉴（药水 23 条里涉及的）----------
function loadV(p) { let s = fs.readFileSync(R(p), 'utf8'); s = s.slice(s.indexOf('[')).replace(/;\s*$/, ''); return JSON.parse(s); }
const v3 = loadV('pkg-cat-3/data/data-v3.js');
let vc = 0;
v3.forEach(it => {
  if (!it.en || !ADD[it.en]) return;
  if (!(it.ob || '').startsWith('合成：')) return;
  if (it.ob.includes(ADD[it.en].slice(0, 12))) return;
  it.ob = it.ob + '；' + ADD[it.en];
  vc++;
});
{
  const src3 = fs.readFileSync(R('pkg-cat-3/data/data-v3.js'), 'utf8');
  const prefix3 = src3.slice(0, src3.indexOf('['));
  fs.writeFileSync(R('pkg-cat-3/data/data-v3.js'), prefix3 + JSON.stringify(v3) + ';');
  console.log('v3: 补来源', vc);
}
console.log('完成', JSON.stringify(stats));
