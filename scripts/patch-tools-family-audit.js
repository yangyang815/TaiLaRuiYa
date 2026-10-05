// 工具分类：耍蛇者长笛 + 吸收绵家族 + 无底桶家族 获取方式修正（官方 wiki 1.4.5.8）
// 幂等：值相同则跳过；每个字段基于当前 src 重新截窗（避免多字段替换偏移 bug）
const fs = require('fs');
const R = p => require('path').join(__dirname, '..', p);

// ---------- 1) v2 ob/use 更新 ----------
const FIX = [
  {
    en: "Snake Charmer's Flute",
    ob: '地下沙漠较浅区域的沙岩箱中找到（1/4，25%）；或在绿洲钓鱼获得的绿洲匣、幻象匣中开出（各 1/8，12.5%）（1.4.0.1 加入）',
    use: '放置一个罐子并召唤出可攀爬的绳蛇：蛇向上生长至最多 100 图格后可像绳一样攀爬，还能贴着蛇放置物块，约 25 秒后消失'
  },
  {
    en: 'Super Absorbant Sponge',
    ob: '完成渔夫钓鱼任务的随机奖励：完成 10 个任务后，每个任务有 1/70（1.43%）概率获得（1.4.4 起困难模式之前也可获得）',
    use: '能吸收无限多水（1.4.4 起也能吸收微光）；可用于合成超强吸收绵'
  },
  {
    en: 'Honey Absorbant Sponge',
    ob: '渔夫任务奖励：当任务物品为大黄蜂金枪鱼时，额外奖励有 1/4（25%）概率获得，困难模式为 1/2（50%）（1.4.4 加入）',
    use: '能吸收无限多蜂蜜；可用于合成超强吸收绵'
  },
  {
    en: 'Bottomless Honey Bucket',
    ob: '渔夫任务奖励：当任务物品为大黄蜂金枪鱼时，额外奖励有 1/4（25%）概率获得，困难模式为 1/2（50%）（1.4.4 加入）'
  },
  {
    en: 'Bottomless Water Bucket',
    ob: '完成渔夫钓鱼任务的随机奖励：完成 10 个任务后每个任务有 1/70（1.43%）概率获得，第 25 个任务必定获得；击败月亮领主后可在微光中与无底微光桶互相嬗变'
  },
  {
    en: 'Bottomless Shimmer Bucket',
    ob: '合成：夜明锭×10 + 无底水桶 @ 远古操纵机；或击败月亮领主后将无底水桶丢入微光嬗变获得'
  }
];

let v2 = fs.readFileSync(R('pkg-cat-2/data/data-v2.js'), 'utf8');
let ok1 = 0, skip1 = 0, miss1 = 0;
FIX.forEach(({ en, ob, use }) => {
  const anchor = '"en":"' + en + '"';
  const idx = v2.indexOf(anchor);
  if (idx < 0) { console.log('[MISS]', en); miss1++; return; }
  const fields = { ob };
  if (use !== undefined) fields.use = use;
  let src = v2;
  Object.keys(fields).forEach(k => {
    // 每次替换后基于当前 src 重新定位（防偏移）
    const i2 = src.indexOf(anchor);
    const win = src.slice(i2, i2 + 1200);
    const m = win.match(new RegExp('"' + k + '":"[^"]*"'));
    if (!m) { console.log('[MISS ' + k + ']', en); return; }
    const nv = '"' + k + '":"' + fields[k] + '"';
    if (m[0] === nv) { skip1++; return; }
    src = src.slice(0, i2 + m.index) + nv + src.slice(i2 + m.index + m[0].length);
    ok1++;
  });
  v2 = src;
});
fs.writeFileSync(R('pkg-cat-2/data/data-v2.js'), v2);
console.log('1) v2 更新', ok1, '个字段，跳过(已同值)', skip1, '，MISS', miss1);

// ---------- 2) obt 表同步（范围限定，从 obt 开始查找）----------
const OBT = {
  'Super Absorbant Sponge': FIX[1].ob,
  'Honey Absorbant Sponge': FIX[2].ob,
  'Bottomless Water Bucket': FIX[4].ob,
  'Bottomless Shimmer Bucket': FIX[5].ob
};
let rw = fs.readFileSync(R('pkg-recipe/data/recipes-wiki.js'), 'utf8');
const os = rw.indexOf('"obt":{');
if (os < 0) throw new Error('obt 表未找到');
let ok2 = 0;
Object.keys(OBT).forEach(en => {
  const ki = rw.indexOf('"' + en + '":"', os);
  if (ki < 0) { console.log('obt 无键:', en); return; }
  const vs = ki + en.length + 4, ve = rw.indexOf('"', vs);
  if (rw.slice(vs, ve) !== OBT[en]) {
    rw = rw.slice(0, vs) + OBT[en] + rw.slice(ve);
    ok2++;
  }
});
fs.writeFileSync(R('pkg-recipe/data/recipes-wiki.js'), rw);
console.log('2) obt 同步', ok2, '键');
