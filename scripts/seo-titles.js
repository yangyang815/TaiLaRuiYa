// SEO 标题改造：静态页 json 标题 + 动态页标题 + sitemap 排除装载页
const fs = require('fs')

// ---------- 1) 静态页标题 ----------
const TITLES = {
  'pages/home/home.json': '向导之书·泰拉瑞亚攻略百科',
  'pages/codex/codex.json': '泰拉瑞亚图鉴·物品·Boss·怪物',
  'pages/craft/craft.json': '泰拉瑞亚合成表·全物品配方查询',
  'pages/my/my.json': '向导之书·我的冒险档案',
  'pages/detail/detail.json': '泰拉瑞亚百科·属性与获取方式',
  'pages/acq/acq.json': '泰拉瑞亚获取方式速查',
  'pages/list/list.json': '泰拉瑞亚大全·排行与推荐',
  'pages/strategy/strategy.json': '泰拉瑞亚攻略·流程事件职业建造',
  'pages/bossguide/bossguide.json': '泰拉瑞亚Boss攻略·召唤与打法',
  'pages/bossguide/detail.json': '泰拉瑞亚Boss攻略详情',
  'pages/search/search.json': '搜索·向导之书',
  'pages/messages/messages.json': '向导之书·动态与公告',
  'pages/favs/favs.json': '向导之书·我的收藏',
  'pages/seeds/seeds.json': '泰拉瑞亚世界种子',
  'pages/catalog/catalog.json': '泰拉瑞亚物品目录',
  'pkgA-tool/pages/fishing/fishing.json': '泰拉瑞亚钓鱼攻略·任务鱼与渔力',
  'pkgA-tool/pages/career/career.json': '泰拉瑞亚职业养成·四职业路线',
  'pkgA-tool/pages/careerclass/careerclass.json': '泰拉瑞亚职业详解',
  'pkgA-tool/pages/careerlib/careerlib.json': '泰拉瑞亚职业图鉴',
  'pkgA-tool/pages/careerpath/careerpath.json': '泰拉瑞亚职业成长路线',
  'pkgA-tool/pages/build/build.json': '泰拉瑞亚建造指南',
  'pkgA-tool/pages/build/basics.json': '泰拉瑞亚建造入门',
  'pkgA-tool/pages/build/detail.json': '泰拉瑞亚建造案例',
  'pkgA-tool/pages/dps/dps.json': '泰拉瑞亚DPS计算器',
  'pkgA-tool/pages/npcplan/npcplan.json': '泰拉瑞亚NPC入住规划器',
  'pkgB-guide/pages/guide/guide.json': '泰拉瑞亚新手指南·从第一天到通关',
  'pkgB-guide/pages/worldseeds/worldseeds.json': '泰拉瑞亚隐藏种子大全·全部代码',
  'pkgB-guide/pages/biomes/biomes.json': '泰拉瑞亚生物群系大全',
  'pkgB-guide/pages/prefixes/prefixes.json': '泰拉瑞亚词条图鉴·全部修饰语',
  'pkgB-guide/pages/secrets/secrets.json': '泰拉瑞亚隐藏知识库·彩蛋与机制',
  'pkgB-guide/pages/achv/achv.json': '向导之书·成就系统',
  'pkgB-guide/pages/gameachv/gameachv.json': '泰拉瑞亚游戏内成就列表',
  'pkg-recipe/pages/index/index.json': '泰拉瑞亚配方数据',
}

let n = 0
for (const [file, title] of Object.entries(TITLES)) {
  if (!fs.existsSync(file)) { console.log('跳过（不存在）', file); continue }
  let j = fs.readFileSync(file, 'utf8')
  if (/"navigationBarTitleText"/.test(j)) {
    j = j.replace(/"navigationBarTitleText":"[^"]*"/, '"navigationBarTitleText":"' + title + '"')
  } else {
    j = j.replace(/^\{/, '{\n  "navigationBarTitleText": "' + title + '",')
  }
  fs.writeFileSync(file, j)
  n++
}
console.log('静态标题写入', n, '页')

// ---------- 2) sitemap 排除数据装载页 ----------
const sp = 'sitemap.json'
let s = fs.readFileSync(sp, 'utf8')
if (!s.includes('pkg-cat-')) {
  const disallow = [
    '    {',
    '      "action": "disallow",',
    '      "page": "pkg-cat-1/pages/index/index"',
    '    },',
    '    {',
    '      "action": "disallow",',
    '      "page": "pkg-cat-2/pages/index/index"',
    '    },',
    '    {',
    '      "action": "disallow",',
    '      "page": "pkg-cat-3/pages/index/index"',
    '    },',
  ].join('\n')
  s = s.replace(/"rules": \[\{[\s\S]*?\}\]/, '"rules": [\n' + disallow + '\n    {\n      "action": "allow",\n      "page": "*"\n    }\n  ]')
  fs.writeFileSync(sp, s)
  console.log('sitemap 排除装载页 OK')
} else console.log('sitemap 已有排除项')

// ---------- 3) 动态标题 ----------
// 3a) detail.js：泰拉瑞亚{名称}·攻略与获取
let d = fs.readFileSync('pages/detail/detail.js', 'utf8')
const dOld = 'setNavigationBarTitle({title:e.name})'
if (d.includes(dOld)) {
  d = d.split(dOld).join('setNavigationBarTitle({title:"泰拉瑞亚"+e.name+"·攻略与获取"})')
  fs.writeFileSync('pages/detail/detail.js', d)
  console.log('detail 动态标题 OK')
} else console.log('detail 锚点未命中')

// 3b) acq.js：泰拉瑞亚{name}怎么获得·掉落与合成
let a = fs.readFileSync('pages/acq/acq.js', 'utf8')
const aOld = 'wx.setNavigationBarTitle({title:"获取方式速查"})'
if (a.includes(aOld)) {
  a = a.replace(aOld, 'wx.setNavigationBarTitle({title:"泰拉瑞亚"+info.name+"怎么获得·掉落与合成"})')
  fs.writeFileSync('pages/acq/acq.js', a)
  console.log('acq 动态标题 OK')
} else console.log('acq 锚点未命中')

// 3c) strategy.js：openDetail 时设 泰拉瑞亚·{攻略标题}
let st = fs.readFileSync('pages/strategy/strategy.js', 'utf8')
const sOld = 'openDetail(id){const s=dex.strats.find(x=>x.id===id);if(!s)return;'
if (!st.includes('setNavigationBarTitle') && st.includes(sOld)) {
  st = st.replace(sOld, sOld + 'wx.setNavigationBarTitle({title:"泰拉瑞亚攻略·"+s.title});')
  fs.writeFileSync('pages/strategy/strategy.js', st)
  console.log('strategy 动态标题 OK')
} else console.log('strategy 已有或锚点未命中')

// 3d) bossguide/detail.js：泰拉瑞亚{Boss名}·Boss攻略
let b = fs.readFileSync('pages/bossguide/detail.js', 'utf8')
const bOld = 'const e=dex.byId[id]||{};'
if (!b.includes('setNavigationBarTitle') && b.includes(bOld)) {
  b = b.replace(bOld, bOld + 'wx.setNavigationBarTitle({title:"泰拉瑞亚"+(g.name||"Boss")+"·Boss攻略"});')
  fs.writeFileSync('pages/bossguide/detail.js', b)
  console.log('bossguide 动态标题 OK')
} else console.log('bossguide 已有或锚点未命中')
