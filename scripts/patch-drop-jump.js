// 敌怪掉落物跳转修复：
// 1) monsters.js 掉落物名与图鉴官方名对齐（8 处）
// 2) detail.js onDrop / codex.js onSheetDrop 增加"按名字解析分包图鉴 → cat 弹窗"层
// 幂等：已应用则跳过
const fs = require('fs');
const R = p => require('path').join(__dirname, '..', p);
const rep = (src, oldS, newS, tag, global) => {
  if (!src.includes(oldS)) { console.log('  [SKIP 已应用或未找到]', tag); return src; }
  if (global) return src.split(oldS).join(newS);
  return src.replace(oldS, newS);
};

// ---------- 1) monsters.js 掉落物名对齐图鉴官方名 ----------
let mon = fs.readFileSync(R('data/monsters.js'), 'utf8');
const NAME_FIX = [
  ['name:"守护者勋章"', 'name:"护卫奖章"', true],
  ['name:"诡异木"', 'name:"阴森木"', true],
  ['name:"花岗岩"', 'name:"花岗岩块"', false],
  ['name:"蜘蛛毒牙×2~5"', 'name:"蜘蛛牙×2~5"', true],
  ['name:"僵尸手臂"', 'name:"僵尸臂"', true],
  ['name:"血腥鱼饵桶"', 'name:"鱼饵桶"', false],
  ['name:"符文法师帽（时装）"', 'name:"符文帽"', false],
  ['name:"符文法师袍（时装）"', 'name:"符文长袍"', false]
];
NAME_FIX.forEach(([o, n, g]) => { mon = rep(mon, o, n, o, g); });
fs.writeFileSync(R('data/monsters.js'), mon);
console.log('1) monsters.js 掉落物名对齐 OK');

// ---------- 2) detail.js：require + onDrop 解析层 ----------
let dt = fs.readFileSync(R('pages/detail/detail.js'), 'utf8');
dt = rep(dt,
  'const catSearch=require("../../utils/catalog-search");',
  'const catSearch=require("../../utils/catalog-search");const dropLink=require("../../utils/drop-link");',
  'detail require dropLink', false);
const OLD_DROP = 'if(dex.byId[id]){store.pushRecent(id,dex.byId[id].type);dex.go(id);return}if(acq.has(id))wx.navigateTo({url:"/pages/acq/acq?id="+id})}';
const NEW_DROP = 'if(dex.byId[id]){store.pushRecent(id,dex.byId[id].type);dex.go(id);return}const d=(this.data.drops||[]).find(x=>x.id===id);if(d&&d.name){dropLink.resolve(d.name).then(en=>{if(en){this.showCatDetail(en.f);return}if(acq.has(id)){wx.navigateTo({url:"/pages/acq/acq?id="+id})}else{wx.showToast({title:"图鉴暂未收录",icon:"none"})}});return}if(acq.has(id))wx.navigateTo({url:"/pages/acq/acq?id="+id});else wx.showToast({title:"图鉴暂未收录",icon:"none"})}';
dt = rep(dt, OLD_DROP, NEW_DROP, 'detail onDrop 解析层', false);
fs.writeFileSync(R('pages/detail/detail.js'), dt);
console.log('2) detail.js OK');

// ---------- 3) codex.js：require + onSheetDrop 解析层 ----------
let cx = fs.readFileSync(R('pages/codex/codex.js'), 'utf8');
cx = rep(cx,
  'const catSearch=require("../../utils/catalog-search");',
  'const catSearch=require("../../utils/catalog-search");const dropLink=require("../../utils/drop-link");const acq=require("../../utils/acq");',
  'codex require dropLink+acq', false);
const OLD_SD = 'if(dex.byId[id]){const en=dex.byId[id];this.setData({sheet:null});store.pushRecent(id,en.type);dex.go(id);return}wx.navigateTo({url:"/pages/acq/acq?id="+id})}';
const NEW_SD = 'if(dex.byId[id]){const en=dex.byId[id];this.setData({sheet:null});store.pushRecent(id,en.type);dex.go(id);return}const dd=this.data.sheet&&(this.data.sheet.drops||[]).find(x=>x.id===id);if(dd&&dd.name){dropLink.resolve(dd.name).then(en=>{if(en){const cid="cat:"+en.f;const c=this._catById[cid];if(c){this.openCatSheet(c)}else{app.globalData.pendingCatSheet=cid;this.loadAllItems()}return}if(acq.has(id)){wx.navigateTo({url:"/pages/acq/acq?id="+id})}else{wx.showToast({title:"图鉴暂未收录",icon:"none"})}});return}wx.navigateTo({url:"/pages/acq/acq?id="+id})}';
cx = rep(cx, OLD_SD, NEW_SD, 'codex onSheetDrop 解析层', false);
fs.writeFileSync(R('pages/codex/codex.js'), cx);
console.log('3) codex.js OK');
