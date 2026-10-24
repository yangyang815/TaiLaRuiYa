const R = (p) => 'D:/小程序库/泰拉瑞亚/' + p;
const fs = require('fs');
const NAMES = ['扩音器', '反光墨镜', '反诅咒咒语', '邪眼', '蒙眼布', '袖珍镜'];
['data/items.js', 'pkg-cat-1/data/data-v1.js', 'pkg-cat-2/data/data-v2.js', 'pkg-cat-3/data/data-v3.js'].forEach(p => {
  const s = fs.readFileSync(R(p), 'utf8');
  NAMES.forEach(n => {
    const i1 = s.indexOf('"n":"' + n + '"');
    const i2 = s.indexOf('name:"' + n + '"');
    if (i1 >= 0 || i2 >= 0) console.log('[' + p + '] 含 ' + n + ' @' + (i1 >= 0 ? i1 : i2));
  });
});
console.log('=== obt/rec 相关键 ===');
const rw = require(R('pkg-recipe/data/recipes-wiki.js'));
['Vivid Sunglasses', 'Ankh Shield', 'Ankh Charm', 'Armor Bracing', 'The Plan', 'Medicated Bandage', 'Armor Polish', 'Vitamins', 'Fast Clock', 'Trifold Map', 'Bezoar', 'Adhesive Bandage', 'Obsidian Shield'].forEach(k => {
  console.log('[obt ' + k + '] ' + (rw.obt[k] ? rw.obt[k].slice(0, 90) : '(无)'));
});
