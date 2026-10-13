// 扫描 v3 武器分类中"合成："格式的 ob，统计材料缺数量的条目
const fs = require('fs');
function load(p) { let s = fs.readFileSync(p, 'utf8'); s = s.slice(s.indexOf('[')).replace(/;\s*$/, ''); return JSON.parse(s); }
const v3 = load('D:/小程序库/泰拉瑞亚/pkg-cat-3/data/data-v3.js');

// 先看这五个物品的分类值
['致命牌组','雀杖','小雪怪法杖','鳄鱼机关枪','吉克球'].forEach(n=>{
  const it=v3.find(i=>i.n===n);
  if(it) console.log('['+n+'] c='+it.c+' r='+it.r);
});

// 统计武器类中含"合成："且无数字的材料
const cats=new Set();
const bad=[];
let synthTotal=0;
v3.forEach(it=>{
  const ob=it.ob||'';
  if(!ob.startsWith('合成：')) return;
  synthTotal++;
  // 材料部分（@ 之前），检查是否含数字
  const mats=ob.split('@')[0].replace('合成：','');
  const hasNum=/[0-9]/.test(mats);
  if(!hasNum) { bad.push(it); cats.add(it.c); }
});
console.log('\n所有合成格式条目: '+synthTotal+' 条；材料无数量的: '+bad.length+' 条');
console.log('涉及的分类:', [...cats].join(','));
console.log('\n按分类统计:');
const byCat={};
bad.forEach(i=>byCat[i.c]=(byCat[i.c]||0)+1);
console.log(JSON.stringify(byCat));
// 列出前 40 条示例
console.log('\n示例（前 40）:');
bad.slice(0,40).forEach(i=>console.log('  ['+i.c+'] '+i.n+' :: '+i.ob.slice(0,60)));
fs.writeFileSync('D:/小程序库/泰拉瑞亚/scripts/scan-synth-qty.json', JSON.stringify(bad.map(i=>({n:i.n,en:i.en,c:i.c,ob:i.ob})), null, 1));
