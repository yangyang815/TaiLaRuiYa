// 检查 23 个条目在 obt 表与 items.js 的覆盖情况
const R = require('../pkg-recipe/data/recipes-wiki.js');
const I = require('../data/items.js');
const ens = ["Bee set","Buccaneer set","Elf set","Lamia set","Martian Costume set","Martian Uniform set","Ocram Mask","Mummy set","Pedguin's set","Rune set","Sailor set","Scarecrow set","Wedding set","Gladiator armor","Mining armor","Rain armor","Flower Boots","Hermes Boots","Flurry Boots","Water Walking Boots","Dunerider Boots","Sailfish Boots","Flame Waker Boots"];
const names = ['蜜蜂套装','西域海盗套装','精灵套装','拉弥亚套装','火星装套装','火星制服套装','Ocram Mask','木乃伊套装','Pedguin的套装','符文套装','水手套装','稻草人套装','婚礼套装','角斗士盔甲','挖矿盔甲','雨具盔甲','花靴','赫尔墨斯靴','疾风雪靴','水上漂靴','沙丘行者靴','旗鱼靴','烈焰靴'];
console.log('--- obt 表 ---');
ens.forEach(en => console.log(en, ':', R.obt[en] !== undefined ? '有' : '无'));
console.log('--- items.js ---');
names.forEach(n => {
  const e = I.find(x => (x.name || x.n) === n);
  console.log('[' + n + ']', e ? ('obtain: ' + (e.obtain || '').slice(0, 55)) : '不在');
});
