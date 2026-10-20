/** 修复 9 个空 f + spritemap gif 扩展名 + 升 DATAVER */
const fs = require('fs');
const R = p => 'D:/小程序库/泰拉瑞亚/' + p;

// 1. 回填 f（按实际文件扩展名）
const FIX = {
  BeeHiveItem: 'Bee Hive', RTerraria: 'r/Terraria', RTerraria2023: 'r/Terraria 2023',
  HeliumMoss: 'Helium Moss', FishingBobberGlowingHelium: 'Helium Moss Fishing Bobber',
  HeliumMossBlock: 'Helium Moss Brick', HeliumMossWall: 'Helium Moss Brick Wall',
  RainbowBrick: 'Rainbow Brick', RainbowBrickWall: 'Rainbow Brick Wall',
};
const sm = require(R('data/spritemap.js'));
['pkg-cat-1/data/data-v1.js', 'pkg-cat-2/data/data-v2.js', 'pkg-cat-3/data/data-v3.js'].forEach(p => {
  let s = fs.readFileSync(R(p), 'utf8');
  let n = 0;
  Object.keys(FIX).forEach(f => {
    const ext = fs.existsSync(R('assets/sprites/' + f + '.gif')) ? 'gif' : 'png';
    const re = new RegExp('("en":"' + FIX[f].replace(/[\/]/g, '\\/') + '","f":)"(png|gif)?"');
    if (re.test(s)) { s = s.replace(re, '$1"' + f + '"'); n++; }
    else if (s.includes('"f":"' + f + '"')) n++; // 已有
  });
  fs.writeFileSync(R(p), s);
  console.log(p.split('/')[0] + ' 回填 ' + n);
});

// 2. spritemap 修正 gif
let sms = fs.readFileSync(R('data/spritemap.js'), 'utf8');
let fixed = 0;
Object.keys(FIX).forEach(f => {
  const ext = fs.existsSync(R('assets/sprites/' + f + '.gif')) ? 'gif' : 'png';
  const re = new RegExp('(^|\\{)' + f + ':"(?:png|gif)"');
  if (!new RegExp('(^|\\{)' + f + ':"' + ext + '"').test(sms)) {
    if (re.test(sms)) { sms = sms.replace(re, '$1' + f + ':"' + ext + '"'); fixed++; }
    else { sms = sms.replace('module.exports={', 'module.exports={' + f + ':"' + ext + '",'); fixed++; }
  }
});
fs.writeFileSync(R('data/spritemap.js'), sms);
console.log('spritemap 修正', fixed);

// 3. 升 DATAVER（强制图鉴缓存失效）
const dv = 'module.exports = "v' + Date.now() + '"';
fs.writeFileSync(R('utils/cat-data-ver.js'), '// 自动生成：图鉴数据版本（勿手改）\n' + dv + '\n');
console.log('DATAVER 已升级:', dv);
