// 掉落战利品模糊条目修正（第三轮）：补漏星旋链锯 + 贝壳电话变体 + 普通匣钓鱼主来源 + 炼药桌
const fs = require('fs');
const path = require('path');
const R = p => path.join(__dirname, '..', p);

function fixByEn(src, en, newOb, tag) {
  const anchor = '"en":"' + en + '"';
  let idx = -1, count = 0, changed = 0, skipped = 0;
  while ((idx = src.indexOf(anchor, idx + 1)) >= 0) {
    count++;
    // 条目边界感知：窗口截止到下一个条目边界
    let end = src.indexOf('},{"n":"', idx);
    if (end < 0) end = idx + 4000;
    const win = src.slice(idx, end);
    const m = win.match(/"ob":"[^"]*"/);
    if (!m) continue;
    if (m[0] === '"ob":"' + newOb + '"') { skipped++; continue; }
    src = src.slice(0, idx + m.index) + '"ob":"' + newOb + '"' + src.slice(idx + m.index + m[0].length);
    changed++;
  }
  if (!count) console.log('  [MISS] ' + tag);
  else if (changed) console.log('  [OK] ' + tag);
  else console.log('  [SKIP] ' + tag);
  return src;
}

const FIX = [];
const UNIMPL = '未实装物品：从未在正式游戏中开放获取，仅存在于游戏数据中，正常途径无法获得（只能通过外部工具修改获取）';
// 漏网：星旋链锯
FIX.push(['Vortex Chainsaw', UNIMPL]);
// 贝壳电话 4 变体
const SHELL = '合成：手机 + 魔镜 + 恶魔海螺 @ 工匠作坊；四个变体可丢入微光互相切换，兼具传送与信息显示功能';
FIX.push(['Shellphone (Home)', SHELL]);
FIX.push(['Shellphone (Ocean)', SHELL]);
FIX.push(['Shellphone (Spawn)', SHELL]);
FIX.push(['Shellphone (Underworld)', SHELL]);
// 普通匣：补钓鱼主来源（保留微光转换）
FIX.push(['Corrupt Crate', '在腐化之地钓鱼钓获，稀有；内含标准匣子物品并必定附带一件暗影珠物品；也可将污损匣丢入微光转换获得']);
FIX.push(['Crimson Crate', '在猩红之地钓鱼钓获，稀有；内含标准匣子物品并必定附带一颗猩红之心物品；也可将血匣丢入微光转换获得']);
FIX.push(['Dungeon Crate', '击败骷髅王后在地牢钓鱼钓获，稀有；打开地牢匣与围栏匣是获得金锁盒的唯一途径；也可将围栏匣丢入微光转换获得']);
FIX.push(['Golden Crate', '在任意生物群系钓鱼钓获，非常稀有；标准匣子的最高档位（钛金匣的前困难模式版本）；也可将钛金匣丢入微光转换获得']);
FIX.push(['Hallowed Crate', '在神圣之地钓鱼钓获，稀有；内含标准匣子物品，并有概率额外掉落碎魔晶或光明之魂；也可将天赐匣丢入微光转换获得']);
FIX.push(['Iron Crate', '在任意生物群系钓鱼钓获，不常见；标准匣子的中间档位（秘银匣的前困难模式版本）；也可将秘银匣丢入微光转换获得']);
FIX.push(['Jungle Crate', '在丛林生物群系钓鱼钓获，稀有；内含标准匣子物品并必定附带一件常春藤箱物品；也可将荆棘匣丢入微光转换获得']);
FIX.push(['Oasis Crate', '在沙漠生物群系钓鱼钓获，稀有；内含标准匣子物品并必定附带一件砂岩箱物品；也可将幻象匣丢入微光转换获得']);
FIX.push(['Obsidian Crate', '在熔岩中钓鱼钓获；打开黑曜石匣与狱石匣是获得黑曜石锁盒的唯一途径；也可将狱石匣丢入微光转换获得']);
FIX.push(['Ocean Crate', '在海洋生物群系钓鱼钓获，稀有；内含标准匣子物品并必定附带一件水箱物品；也可将海边匣丢入微光转换获得']);
FIX.push(['Sky Crate', '在太空层（如浮空湖）钓鱼钓获，稀有；内含标准匣子物品并必定附带一件天宝箱物品；也可将天蓝匣丢入微光转换获得']);
// 炼药桌
FIX.push(['Alchemy Table', '地牢中自然生成的可挖取家具（用任意镐挖下后可放置使用，制作药水时有 1/3 概率不消耗材料）；也可将施法桌丢入微光转换获得']);

let v3 = fs.readFileSync(R('pkg-cat-3/data/data-v3.js'), 'utf8');
FIX.forEach(([en, ob]) => { v3 = fixByEn(v3, en, ob, en); });
fs.writeFileSync(R('pkg-cat-3/data/data-v3.js'), v3);
console.log('done. total fixes:', FIX.length);
