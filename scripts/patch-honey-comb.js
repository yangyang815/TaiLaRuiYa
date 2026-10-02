// 蜂窝 ob 修正（蜂王 1/3 掉落，专家袋同率，2026-10-02）
const fs = require('fs');
const path = require('path');
const R = (p) => path.join(__dirname, '..', p);

let v2 = fs.readFileSync(R('pkg-cat-2/data/data-v2.js'), 'utf8');
const ai = v2.indexOf('"en":"Honey Comb"');
if (ai < 0) throw new Error('Honey Comb 锚点未找到');
const win = v2.slice(ai, ai + 600);
const m = win.match(/"ob":"[^"]*"/);
if (!m) throw new Error('ob 未找到');
const nv = '"ob":"由蜂王掉落（1/3，33.33%）；专家模式下开启蜂王的宝藏袋同样有 33.33% 概率获得"';
v2 = v2.slice(0, ai + m.index) + nv + v2.slice(ai + m.index + m[0].length);
fs.writeFileSync(R('pkg-cat-2/data/data-v2.js'), v2);
console.log('v2 蜂窝 OK');

let rw = fs.readFileSync(R('pkg-recipe/data/recipes-wiki.js'), 'utf8');
const re = /"Honey Comb":"[^"]*"/;
const mm = rw.match(re);
if (mm) {
  rw = rw.replace(mm[0], '"Honey Comb":"由蜂王掉落（1/3，33.33%）；专家模式下开启蜂王的宝藏袋同样有 33.33% 概率获得"');
  fs.writeFileSync(R('pkg-recipe/data/recipes-wiki.js'), rw);
  console.log('obt Honey Comb OK');
} else console.log('obt 无 Honey Comb 键，跳过');
