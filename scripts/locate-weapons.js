// 定位五个物品在各数据文件中的位置
const fs = require('fs');
const names = ['致命牌组', '雀杖', '小雪怪法杖', '鳄鱼机关枪', '吉克球'];
const files = ['data/items.js', 'pkg-cat-1/data/data-v1.js', 'pkg-cat-2/data/data-v2.js', 'pkg-cat-3/data/data-v3.js'];
for (const n of names) {
  console.log('=== ' + n + ' ===');
  for (const f of files) {
    const s = fs.readFileSync('D:/小程序库/泰拉瑞亚/' + f, 'utf8');
    // items.js 用 obtain:，v* 用 "ob":
    let i = s.indexOf('name:"' + n + '"');
    let src = null;
    if (i >= 0) {
      const seg = s.slice(i, i + 500);
      const m = seg.match(/obtain:"([^"]*)"/);
      src = f + ' (obtain) :: ' + (m ? m[1] : '(无 obtain)');
    } else {
      i = s.indexOf('"n":"' + n + '"');
      if (i >= 0) {
        const end = s.indexOf('},{"n":"', i);
        const seg = s.slice(i, end > 0 ? end : i + 900);
        const m = seg.match(/"ob":"([^"]*)"/);
        src = f + ' (ob) :: ' + (m ? m[1] : '(无 ob)');
      }
    }
    if (src) console.log('  ' + src);
  }
}
