// 图鉴武器第二批 25 条残留清理（含 I am error 混入清除）
const fs = require('fs');
const path = require('path');
const R = p => path.join(__dirname, '..', p);

// [中文名, 英文名, 新文案]
const FIX = [
  ['时尚剪刀', "Stylish Scissors", '由发型师掉落（1/8，12.5%）：需在血月期间用外来伤害源将其击杀（城镇 NPC 不受玩家直接伤害）'],
  ['火花魔棒', "Wand of Sparking", '地表和地下地层的木宝箱中找到（1/11，9.09%）；下弦月期间由骷髅商人出售（1 金）'],
  ['灰冲击枪', "Grey Zapinator", '由旅商出售（17 金），需击败任意一个肉前 Boss（史莱姆王/克苏鲁之眼/世界吞噬怪或克苏鲁之脑/蜂王/独眼巨鹿/骷髅王其中之一）'],
  ['吹管', "Blowpipe", '地表和地下地层的木宝箱中找到（1/10，10%）'],
  ['彩弹枪', "Paintball Gun", '由油漆工掉落（1/10，10%）：需用外来伤害源将其击杀（城镇 NPC 不受玩家直接伤害）'],
  ['史莱姆法杖', "Slime Staff", '由大部分史莱姆掉落（1/10000，0.01%）；粉史莱姆为 1/100 (1%)、沙史莱姆为 1/8000、史莱姆王为 1/30 (3.33%)；Celebrationmk10 和终极世界中可从公主处以 10 金购买'],
  ['手榴弹', "Grenade", '由爆破专家出售（75 铜）；也少见地出现在罐子和天然宝箱中'],
  ['手里剑', "Shuriken", '由商人出售（15 铜）；也常见于世界各地的罐子和宝箱中'],
  ['投刀', "Throwing Knife", '血月期间由商人出售（50 铜）；也可在宝箱中找到'],
  ['吸血鬼青蛙法杖', "Vampire Frog Staff", '血月期间由僵尸人鱼或游荡眼球怪鱼掉落（1/8，12.5%）'],
  ['代码1球', "Code 1", '击败克苏鲁之眼后由旅商出售（5 金）'],
  ['长矛', "Spear", '地表和地下地层的木宝箱中找到（1/10，10%）；可通过微光嬗变为三叉戟'],
  ['战斗扳手', "Combat Wrench", '由机械师掉落（1/8，12.5%）：需用外来伤害源将其击杀（城镇 NPC 不受玩家直接伤害）'],
  ['蘑菇回旋镖', "Shroomerang", '由发光蘑菇生物群系的孢子蝙蝠和孢子僵尸掉落'],
  ['木回旋镖', "Wooden Boomerang", '地表和地下地层的木宝箱中找到（1/10，10%）；满月期间由骷髅商人出售（1 金）'],
  ['雷管', "Detonator", '由爆破专家出售（20 银）；也可作为洞穴层金箱的一般物品找到（1/3，33.33%）'],
  ['链刀', "Chain Knife", '由洞穴蝙蝠掉落（1/250，0.4%）；don\u0027t dig up 和终极世界中改由小丑掉落'],
  ['伞', "Umbrella", '地表宝箱中找到（1/10，10%）；亏凸月期间由骷髅商人出售（1 金）'],
  ['泰拉魔刃', "Terragrim", '摧毁石中附魔剑背景物体获得（1/50，2%，其余为附魔剑）；Celebrationmk10 和终极世界中血月期间可从公主处以 25 金购买'],
  ['猪龙鱼链球', "Flairoon", '由猪龙鱼公爵掉落（1/7，14.29%，七件物品选一）；专家模式下从猪龙鱼公爵的宝藏袋中获得（14.29%）'],
  ['食人鱼枪', "Piranha Gun", '地牢的丛林箱中必定找到（世纪之花后用丛林钥匙开启，钥匙在丛林生物群系刷怪有 1/2500 概率掉落）'],
  ['彩虹枪', "Rainbow Gun", '地牢的神圣箱中必定找到（世纪之花后用神圣钥匙开启，钥匙在神圣之地刷怪有 1/2500 概率掉落）'],
  ['吸血鬼刀', "Vampire Knives", '地牢的猩红箱中必定找到（世纪之花后用猩红钥匙开启，钥匙在猩红之地刷怪有 1/2500 概率掉落）'],
  ['信号枪', "Flare Gun", '地下的金箱中作为主要物品找到（1/6，16.67%）或洞穴层金箱（2/15，13.33%），随附照明弹 25–50 个'],
  ['炸弹', "Bomb", '由爆破专家出售（3 银）；常见于罐子和宝箱中']
];

// ---------- 1. v3 ob（先试 en 锚点，再试 n 锚点） ----------
let v3 = fs.readFileSync(R('pkg-cat-3/data/data-v3.js'), 'utf8');
let ok1 = 0, miss1 = [];
FIX.forEach(([n, en, ob]) => {
  let i = v3.indexOf('"en":"' + en + '"');
  if (i < 0) i = v3.indexOf('"n":"' + n + '"');
  if (i < 0) { miss1.push(n); return; }
  const win = v3.slice(i, i + 800);
  const m = win.match(/"ob":"[^"]*"/);
  if (!m) { miss1.push(n + '(ob未匹配)'); return; }
  if (m[0] === '"ob":"' + ob + '"') return;
  v3 = v3.slice(0, i + m.index) + '"ob":"' + ob + '"' + v3.slice(i + m.index + m[0].length);
  ok1++;
});
fs.writeFileSync(R('pkg-cat-3/data/data-v3.js'), v3);
console.log('1) v3 ob 更新', ok1, '条；未命中:', miss1.length ? miss1.join('、') : '无');

// ---------- 2. obt 表范围限定同步 ----------
let rw = fs.readFileSync(R('pkg-recipe/data/recipes-wiki.js'), 'utf8');
const obtStart = rw.indexOf('"obt":{');
let ok2 = 0;
FIX.forEach(([n, en, ob]) => {
  const keyIdx = rw.indexOf('"' + en + '":"', obtStart);
  if (keyIdx < 0) return;
  const valStart = keyIdx + en.length + 4;
  const valEnd = rw.indexOf('"', valStart);
  if (rw.slice(valStart, valEnd) === ob) return;
  rw = rw.slice(0, valStart) + ob + rw.slice(valEnd);
  ok2++;
});
fs.writeFileSync(R('pkg-recipe/data/recipes-wiki.js'), rw);
console.log('2) obt 表更新', ok2, '键');
console.log('DONE');
