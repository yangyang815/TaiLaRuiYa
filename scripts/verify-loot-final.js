// 最终全量验证：两轮补丁全部条目 + drop 分类复扫 + JSON 完整性
const fs = require('fs');
const path = require('path');
const R = p => path.join(__dirname, '..', p);
function load(p) { let s = fs.readFileSync(p, 'utf8'); s = s.slice(s.indexOf('[')).replace(/;\s*$/, ''); return JSON.parse(s); }

// ---- 提取两轮补丁的 (en, expected) ----
const ps2 = fs.readFileSync(__dirname + '/patch-loot-fuzzy2-audit.js', 'utf8');
const ps3 = fs.readFileSync(__dirname + '/patch-loot-fuzzy3-audit.js', 'utf8');
const UNIMPL = '未实装物品：从未在正式游戏中开放获取，仅存在于游戏数据中，正常途径无法获得（只能通过外部工具修改获取）';
const REMOVED = '已移除物品：曾在旧版本中开放获取，现已从游戏中移除，正常途径无法获得（只能通过外部工具修改获取）';
const SHELL = '合成：手机 + 魔镜 + 恶魔海螺 @ 工匠作坊；四个变体可丢入微光互相切换，兼具传送与信息显示功能';
const pairs = [];
const re = /FIX\.push\(\['([^']+)',\s*'((?:[^'\\]|\\.)*)'\]\)/g;
let m;
[ps2, ps3].forEach(ps => { while ((m = re.exec(ps))) pairs.push([m[1], m[2]]); });
const ure = /\['([^']+)',\s*(UNIMPL|REMOVED)\]/g;
while ((m = ure.exec(ps2))) pairs.push([m[1], m[2] === 'UNIMPL' ? UNIMPL : REMOVED]);
['Shellphone (Home)', 'Shellphone (Ocean)', 'Shellphone (Spawn)', 'Shellphone (Underworld)'].forEach(en => pairs.push([en, SHELL]));
const vc = pairs.find(p => p[0] === 'Vortex Chainsaw');
if (!vc) pairs.push(['Vortex Chainsaw', UNIMPL]);

// ---- 逐条验证 ----
const arr = load(R('pkg-cat-3/data/data-v3.js'));
const idx = new Map();
arr.forEach(i => { if (!idx.has(i.en)) idx.set(i.en, []); idx.get(i.en).push(i); });
let ok = 0, bad = 0;
const seen = new Set();
for (const [en, exp] of pairs) {
  if (seen.has(en)) continue; seen.add(en);
  const list = idx.get(en);
  if (!list || !list.length) { console.log('[MISS条目] ' + en); bad++; continue; }
  const good = list.filter(i => i.ob === exp);
  if (good.length === list.length) { ok++; continue; }
  bad++;
  list.forEach(i => { if (i.ob !== exp) console.log('[不符] ' + en + ' (' + i.c + ')\n  期望: ' + exp.slice(0, 40) + '\n  实际: ' + (i.ob || '').slice(0, 40)); });
}
console.log(`补丁验证: 目标 ${seen.size} 条, 符合 ${ok}, 不符 ${bad}`);

// ---- drop 分类模糊复扫 ----
const cats = new Set(['掉落物品','战利品','袋装战利品','任务奖励','开发者物品','未实装物品','趣味物品','杂项','鱼饵','钓获物品','钥匙','钱币']);
const exactVague = ['钓鱼获得','可于世界中探索、击败敌怪或参与事件获得','击败敌怪掉落','可于世界中探索获得','探索获得'];
const isVague = ob => !ob || ob.length < 12 || exactVague.includes(ob);
let dropTotal = 0, vague = 0;
arr.filter(i => cats.has(i.c)).forEach(i => { dropTotal++; if (isVague(i.ob || '')) { vague++; console.log('[残留] ' + i.n + ' (' + i.en + ') :: ' + i.ob); } });
// 信息物品组也复查贝壳电话
const info = arr.filter(i => i.c === '信息物品');
const shellBad = info.filter(i => (i.ob || '').includes('可于世界中探索'));
shellBad.forEach(i => console.log('[信息物品残留] ' + i.n));
console.log(`drop 分类: 总 ${dropTotal} 条, 模糊残留 ${vague + shellBad.length} 条`);
