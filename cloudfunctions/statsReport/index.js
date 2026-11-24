// 云函数：statsReport —— 全站页面访问统计报表（管理员自查工具）
// 用法：云端测试传 {} 即可，返回格式化文本报告 + 聚合数据
// 数据源：stats_daily（trackPage 上报的 日+键 计数），只读，不改任何数据
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const COLL = 'stats_daily';
const PAGE_QUERY = 1000; // 单次查询上限

// 路由 → 中文名映射（未收录路由显示原路径）
const NAME = {
  'pages/home/home': '首页',
  'pages/codex/codex': '图鉴',
  'pages/craft/craft': '合成速查',
  'pages/my/my': '我的',
  'pages/list/list': '图鉴列表',
  'pages/detail/detail': '物品详情',
  'pages/strategy/strategy': '攻略文章',
  'pages/search/search': '搜索',
  'pages/seeds/seeds': '世界种子页',
  'pages/favs/favs': '收藏',
  'pages/messages/messages': '消息中心',
  'pages/bossguide/bossguide': 'Boss图文攻略列表',
  'pages/bossguide/detail': 'Boss图文攻略',
  'pages/acq/acq': '获取方式页',
  'pages/catalog/catalog': '全图鉴目录',
  'pages/theme/theme': '主题设置',
  'pages/feedback/feedback': '反馈',
  'pages/help/help': '帮助',
  'pkgA-tool/pages/build/build': '装备构筑器',
  'pkgA-tool/pages/build/basics': '构筑基础页',
  'pkgA-tool/pages/build/detail': '构筑详情',
  'pkgA-tool/pages/dps/dps': 'DPS计算器',
  'pkgA-tool/pages/npcplan/npcplan': 'NPC规划器',
  'pkgA-tool/pages/fishing/fishing': '钓鱼助手',
  'pkgA-tool/pages/career/career': '职业养成',
  'pkgA-tool/pages/careerclass/careerclass': '职业分类',
  'pkgA-tool/pages/careerpath/careerpath': '职业路线',
  'pkgA-tool/pages/careerlib/careerlib': '职业库',
  'pkgB-guide/pages/guide/guide': '新手指南',
  'pkgB-guide/pages/achv/achv': '成就',
  'pkgB-guide/pages/gameachv/gameachv': '游戏内成就',
  'pkgB-guide/pages/secrets/secrets': '彩蛋秘密',
  'pkgB-guide/pages/worldseeds/worldseeds': '世界种子',
  'pkgB-guide/pages/biomes/biomes': '生物群系',
  'pkgB-guide/pages/prefixes/prefixes': '词缀大全',
  'pkg-recipe/pages/index/index': '配方数据装载页',
  'pkg-cat-1/pages/index/index': '图鉴卷1装载页',
  'pkg-cat-2/pages/index/index': '图鉴卷2装载页',
  'pkg-cat-3/pages/index/index': '图鉴卷3装载页',
  'pkg-cal/pages/calamity/calamity': '灾厄专区首页',
  'pkg-cal/pages/calamity-list/calamity-list': '灾厄列表页',
  'pkg-cal/pages/calamity-boss/calamity-boss': '灾厄Boss速查',
  'pkg-cal/pages/calamity-guide/calamity-guide': '灾厄机制FAQ'
};
function nameOf(route) { return NAME[route] || route; }

// 解析键：pv:路由?id=xx&type=yy / ev:事件名
function parseKey(k) {
  if (typeof k !== 'string') return null;
  if (k.indexOf('pv:') === 0) {
    const body = k.slice(3);
    const qi = body.indexOf('?');
    const route = qi >= 0 ? body.slice(0, qi) : body;
    const params = {};
    if (qi >= 0) {
      body.slice(qi + 1).split('&').forEach(kv => {
        const eq = kv.indexOf('=');
        if (eq > 0) params[kv.slice(0, eq)] = kv.slice(eq + 1);
      });
    }
    return { kind: 'pv', route: route, params: params };
  }
  if (k.indexOf('ev:') === 0) return { kind: 'ev', name: k.slice(3) };
  return null;
}

exports.main = async () => {
  // 分页拉全量
  let docs = [], skip = 0;
  while (true) {
    const batch = await db.collection(COLL).skip(skip).limit(PAGE_QUERY).get();
    docs = docs.concat(batch.data || []);
    if (!batch.data || batch.data.length < PAGE_QUERY) break;
    skip += PAGE_QUERY;
    if (skip > 20000) break; // 保险丝
  }

  const days = {};      // 日期 -> PV
  const routes = {};    // 路由 -> PV
  const content = {};   // type=id -> PV
  const cal = {};       // 灾厄路由 -> PV
  const events = {};    // 事件 -> PV
  let totalPV = 0;

  docs.forEach(doc => {
    const n = Math.max(0, Math.floor(Number(doc.n) || 0));
    if (!n) return;
    totalPV += n;
    const d = doc.d || '?';
    days[d] = (days[d] || 0) + n;
    const p = parseKey(doc.k);
    if (!p) return;
    if (p.kind === 'ev') { events[p.name] = (events[p.name] || 0) + n; return; }
    routes[p.route] = (routes[p.route] || 0) + n;
    if (p.route.indexOf('pkg-cal') >= 0) cal[p.route] = (cal[p.route] || 0) + n;
    const id = p.params.id, type = p.params.type;
    if (id && type) {
      const ck = type + '|' + id;
      content[ck] = (content[ck] || 0) + n;
    }
  });

  const dayKeys = Object.keys(days).sort();
  const range = dayKeys.length ? dayKeys[0] + ' ~ ' + dayKeys[dayKeys.length - 1] : '无数据';

  // 近 14 天趋势
  const recent = dayKeys.slice(-14);

  // 页面排行
  const routeRows = Object.keys(routes).map(r => ({ r: r, n: routes[r], name: nameOf(r) }))
    .sort((a, b) => b.n - a.n);

  // 内容排行
  const contentRows = Object.keys(content).map(k => {
    const sep = k.indexOf('|');
    return { type: k.slice(0, sep), id: k.slice(sep + 1), n: content[k] };
  }).sort((a, b) => b.n - a.n);

  // 组装报告文本
  const L = [];
  const today = dayKeys[dayKeys.length - 1] || '?';
  L.push('📊 全站页面访问统计（数据截至 ' + today + '，覆盖 ' + range + '）');
  L.push('');
  L.push('【总览】累计访问 ' + totalPV + ' 次 | ' + dayKeys.length + ' 个统计日 | ' + routeRows.length + ' 个页面 | ' + docs.length + ' 条记录');
  L.push('');
  L.push('【近 ' + recent.length + ' 天趋势】');
  recent.forEach(d => L.push('  ' + d.slice(5) + ': ' + days[d] + ' 次'));
  L.push('');
  L.push('【页面排行（累计 PV）】');
  routeRows.forEach((row, i) => L.push((i + 1) + '. ' + row.name + ' — ' + row.n + ' 次（' + Math.round(row.n * 100 / Math.max(1, totalPV)) + '%）'));
  L.push('');
  L.push('【热门内容 Top 20】（格式：分类|条目id，发我可译成物品名）');
  if (contentRows.length) {
    contentRows.slice(0, 20).forEach((row, i) => L.push((i + 1) + '. [' + row.type + '] ' + row.id + ' — ' + row.n + ' 次'));
  } else L.push('  （暂无带内容参数的访问）');
  L.push('');
  L.push('【灾厄专区】');
  const calTotal = Object.keys(cal).reduce((s, k) => s + cal[k], 0);
  if (calTotal) {
    L.push('  专区累计 ' + calTotal + ' 次（占全站 ' + Math.round(calTotal * 100 / Math.max(1, totalPV)) + '%）');
    Object.keys(cal).map(k => ({ r: k, n: cal[k] })).sort((a, b) => b.n - a.n)
      .forEach(row => L.push('  ' + nameOf(row.r) + ' — ' + row.n + ' 次'));
  } else L.push('  （暂无记录）');
  L.push('');
  L.push('【事件打点】');
  const evKeys = Object.keys(events);
  if (evKeys.length) evKeys.forEach(k => L.push('  ' + k + ' — ' + events[k] + ' 次'));
  else L.push('  （暂无，track.event 打点后此处出数）');

  return {
    ok: true,
    totalPV: totalPV,
    days: dayKeys.length,
    keys: docs.length,
    top: contentRows.slice(0, 50),
    report: L.join('\n')
  };
};
