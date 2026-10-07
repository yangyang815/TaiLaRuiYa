// 扫描掉落战利品(drop)分类的真正模糊占位文案（整句匹配）
const fs = require('fs');
const path = require('path');
const R = p => path.join(__dirname, '..', p);

function loadArr(p) {
  let s = fs.readFileSync(p, 'utf8');
  s = s.slice(s.indexOf('['));
  s = s.replace(/;\s*$/, '');
  return JSON.parse(s);
}

const cats = new Set(['掉落物品','战利品','袋装战利品','任务奖励','开发者物品','未实装物品','趣味物品','杂项','鱼饵','钓获物品','钥匙','钱币']);
// 精确模糊模式：ob 为这些短句之一，或长度过短
const exactVague = ['钓鱼获得','可于世界中探索、击败敌怪或参与事件获得','击败敌怪掉落','可于世界中探索获得','探索获得'];
const isVague = ob => !ob || ob.length < 12 || exactVague.includes(ob);

let total = 0, bad = 0;
for (const f of ['pkg-cat-1/data/data-v1.js','pkg-cat-2/data/data-v2.js','pkg-cat-3/data/data-v3.js']) {
  let arr;
  try { arr = loadArr(R(f)); } catch (e) { console.log(f, 'load fail'); continue; }
  const drop = arr.filter(i => cats.has(i.c));
  const bads = drop.filter(i => isVague(i.ob || ''));
  total += drop.length; bad += bads.length;
  bads.forEach(b => console.log('[' + b.c + '] ' + b.n + ' (' + b.en + ') :: ' + (b.ob || '(空)')));
}
console.log(`\ndrop 总 ${total} 条, 模糊占位 ${bad} 条`);
