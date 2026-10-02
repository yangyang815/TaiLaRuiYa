// 暗影焰三件套 art 对齐真图名 + spritemap 补键（2026-10-02）
const fs = require('fs');
const path = require('path');
const R = (p) => path.join(__dirname, '..', p);

// 1. items.js：art 字段对齐（妖娃此前误用不存在名，真图为 ShadowFlameHexDoll）
let it = fs.readFileSync(R('data/items.js'), 'utf8');
const fixArt = (oldA, newA, tag) => {
  const o = 'art:"' + oldA + '"';
  const n = 'art:"' + newA + '"';
  if (it.indexOf(n) >= 0) { console.log(tag, '已是新版，跳过'); return; }
  if (it.indexOf(o) < 0) throw new Error('未找到: ' + tag);
  it = it.replace(o, n);
  console.log(tag, 'OK');
};
fixArt('shadowflame_apparition', 'ShadowFlameHexDoll', '妖娃 art');
fixArt('shadowflame_bow', 'ShadowFlameBow', '暗影焰弓 art');
fixArt('shadowflame_knife', 'ShadowFlameKnife', '暗影焰刀 art');
fs.writeFileSync(R('data/items.js'), it);

// 2. spritemap.js：补三键（键无引号，值 "png"）
let sp = fs.readFileSync(R('data/spritemap.js'), 'utf8');
let added = 0;
['ShadowFlameHexDoll', 'ShadowFlameBow', 'ShadowFlameKnife'].forEach(k => {
  if (sp.indexOf(k + ':"png"') >= 0) return;
  sp = sp.replace('module.exports={', 'module.exports={' + k + ':"png",');
  added++;
});
fs.writeFileSync(R('data/spritemap.js'), sp);
console.log('spritemap 补键', added, '个');
