// obt 水果键按树名同步 + items.js 绳更新
const fs = require('fs');
const path = require('path');
const R = p => path.join(__dirname, '..', p);

const TREES = [
  ['Apple', '森林树'], ['Apricot', '森林树'], ['Grapefruit', '森林树'], ['Lemon', '森林树'], ['Peach', '森林树'],
  ['Cherry', '针叶树'], ['Plum', '针叶树'],
  ['Blackcurrant', '乌木树（腐化之地）'], ['Elderberry', '乌木树（腐化之地）'],
  ['Blood Orange', '暗影木树（猩红之地）'], ['Rambutan', '暗影木树（猩红之地）'],
  ['Mango', '红木树（丛林）'], ['Pineapple', '红木树（丛林）'],
  ['Banana', '棕榈树（海洋）'], ['Coconut', '棕榈树（海洋）'],
  ['Dragon Fruit', '珍珠木树（神圣之地）'], ['Star Fruit', '珍珠木树（神圣之地）'],
  ['Pomegranate', '灰烬树（地狱）'], ['Spicy Pepper', '灰烬树（地狱）'],
];
let rw = fs.readFileSync(R('pkg-recipe/data/recipes-wiki.js'), 'utf8');
const os = rw.indexOf('"obt":{');
let n = 0;
TREES.forEach(([en, tree]) => {
  const ob = '在' + tree + '上摇树获得的水果（1.4.0.1 加入），可用于制作果汁、水果沙拉、仙馔密酒等食物';
  const ki = rw.indexOf('"' + en + '":"', os);
  if (ki < 0) { console.log('obt 无键:', en); return; }
  const vs = ki + en.length + 4, ve = rw.indexOf('"', vs);
  if (rw.slice(vs, ve) !== ob) { rw = rw.slice(0, vs) + ob + rw.slice(ve); n++; }
});
fs.writeFileSync(R('pkg-recipe/data/recipes-wiki.js'), rw);
console.log('obt 水果键按树名同步', n, '条');

let it = fs.readFileSync(R('data/items.js'), 'utf8');
const oldObtain = 'obtain:"商店购买/陶罐开出"';
const newObtain = 'obtain:"从商人/骷髅商人处购买（10 铜）；也可在宝箱和罐子中随机找到，或作为史莱姆的额外掉落获得"';
if (it.includes(oldObtain)) {
  it = it.split(oldObtain).join(newObtain);
  fs.writeFileSync(R('data/items.js'), it);
  console.log('items 绳更新 OK');
} else {
  console.log('items 绳锚点未找到');
}
