const R = (p) => 'D:/小程序库/泰拉瑞亚/' + p;
const fs = require('fs');

// 1. 现行配方缓存里四个物品的配方（含微光行）
const CUR = JSON.parse(fs.readFileSync(R('scripts/current-recipes.json'), 'utf8'));
['Nazar', 'Megaphone', 'Blindfold', 'Pocket Mirror', 'Ankh Charm', 'Vivid Sunglasses'].forEach(en => {
  console.log('=== CUR ' + en + ' ===');
  const rows = CUR[en];
  if (!rows) { console.log('  (缓存无)'); return; }
  rows.forEach(r => console.log('  [' + (r.plats || []).join(',') + '] 材料: ' + r.mats.map(m => m.n + (m.q > 1 ? 'x' + m.q : '')).join(' + ') + ' @ ' + (r.station || '?')));
});

// 2. 谁的配方里用到这四个物品（反查用途）
console.log('\n=== 反查：使用这四件物品的配方 ===');
['Nazar', 'Megaphone', 'Blindfold', 'Pocket Mirror'].forEach(target => {
  const users = [];
  Object.keys(CUR).forEach(en => {
    (CUR[en] || []).forEach(r => {
      if ((r.mats || []).some(m => m.n === target)) users.push(en + ' [' + r.mats.map(m => m.n).join('+') + ' @ ' + r.station + ']');
    });
  });
  console.log(target + ' ← ' + (users.length ? users.join(' ; ') : '(无配方使用)'));
});

// 3. 微光链：查缓存里的微光行（station 含 微光）
console.log('\n=== 微光行扫描（涉四件物品） ===');
Object.keys(CUR).forEach(en => {
  (CUR[en] || []).forEach(r => {
    if (/微光/.test(r.station || '') && (r.mats || []).some(m => /邪眼|扩音器|蒙眼布|袖珍镜|Nazar|Megaphone|Blindfold|Pocket/.test(m.n))) {
      console.log('  ' + en + ' ← ' + r.mats.map(m => m.n).join('+') + ' @ ' + r.station);
    }
  });
});

// 4. 四源现状
console.log('\n=== 四源现状 ===');
const items = require(R('data/items.js'));
['邪眼', '扩音器', '蒙眼布', '袖珍镜'].forEach(n => {
  const it = items.find(i => i.name === n);
  if (it) {
    console.log('[' + n + '] id=' + it.id + ' en=' + it.en);
    console.log('  详情 use: ' + (it.use || '(无)'));
    console.log('  详情 obtain: ' + (it.obtain || '(无)'));
  } else console.log('[' + n + '] 主包无');
});
function loadV(p) { let s = fs.readFileSync(R(p), 'utf8'); s = s.slice(s.indexOf('[')).replace(/;\s*$/, ''); return JSON.parse(s); }
const v3 = loadV('pkg-cat-3/data/data-v3.js');
['Nazar', 'Megaphone', 'Blindfold', 'Pocket Mirror'].forEach(en => {
  const it = v3.find(i => i.en === en);
  if (it) {
    console.log('[v3 ' + it.n + '] use: ' + (it.use || '(无)'));
    console.log('  ob: ' + it.ob);
  } else console.log('[v3 ' + en + '] 无');
});
const rw = require(R('pkg-recipe/data/recipes-wiki.js'));
['Nazar', 'Megaphone', 'Blindfold', 'Pocket Mirror'].forEach(en => {
  console.log('[obt ' + en + '] ' + (rw.obt[en] || '(无键)'));
});
