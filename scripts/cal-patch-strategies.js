// 灾厄深度攻略全量 Wiki 核对补丁（2026-11-25）
// 数值来源：灾厄中文维基各 Boss 页攻击表（{{n2}} 模板前两档）逐条复核
// 链路来源：Boss Rush 官方推荐流程顺序（wiki 明示"推荐的流程击败顺序"）
const fs = require("fs");
const FILE = "pkg-cal/data/calamity-strategies.js";
const S = require("../" + FILE);
const st = S.strategies;

let fixCount = 0;
function log(msg) { console.log("  " + msg); fixCount++; }

// ---------- 数值修正 ----------
// 史莱姆之神：圣卫接触 40/84 是混排（黑檀 40/80、血化 42/84）
{
  const g = st.cal_slime_god;
  const i = g.attacks.findIndex((a) => a[0] === "圣卫接触（跳跃）");
  if (i >= 0) {
    g.attacks.splice(i, 1,
      ["黑檀圣卫接触", "40/80", "跳跃攻击节奏明显，保持距离并留意快速连跳"],
      ["血化圣卫接触", "42/84", "血化圣卫伤害略高，同样跳跃突进，拉距走位"]
    );
    log("史莱姆之神：圣卫接触拆分为黑檀 40/80 + 血化 42/84");
  }
}

// 血肉宿主：本体接触 经典—/专家48（复仇模式才是主动冲撞）
{
  const p = st.cal_perforators;
  const r = p.attacks.find((a) => a[0] === "本体冲撞（复仇）");
  if (r) {
    r[0] = "本体接触（专家起）"; r[1] = "—/48";
    r[2] = "经典无本体接触伤害，专家起有接触；复仇模式附加主动冲撞（有寄生者存活时放弃冲撞）";
    log("血肉宿主：本体接触 —/48（原 48/72 归属错误）");
  }
  p.phases = p.phases.replace(
    "复仇模式本体获得接触伤害并主动冲撞",
    "经典模式无本体接触伤害，专家起获得接触伤害；复仇模式主动冲撞"
  );
}

// 极地之灵：冰霜爆 46/92（原 69/138 是接触伤害的数值）；冰霜炸弹 112/168
{
  const c = st.cal_cryogen;
  const a = c.attacks.find((x) => x[0] === "冰霜爆");
  if (a) { a[1] = "46/92"; log("极地之灵：冰霜爆 69/138 → 46/92"); }
  const b = c.attacks.find((x) => x[0] === "冰霜炸弹（复仇）");
  if (b) { b[1] = "112/168"; log("极地之灵：冰霜炸弹 112/112 → 112/168"); }
}

// 白金星舰：星瀚逐影焰 60/120（原 60/180）
{
  const a = st.cal_astrum_aureus.attacks.find((x) => x[0] === "星瀚逐影焰");
  if (a) { a[1] = "60/120"; log("白金星舰：星瀚逐影焰 60/180 → 60/120"); }
}

// 瘟疫使者歌莉娅：制导瘟疫飞弹有伤害 60/120；瘟疫之雷 —/140
{
  const g = st.cal_pbg;
  const a = g.attacks.find((x) => x[0] === "制导瘟疫飞弹");
  if (a) { a[1] = "60/120"; log("瘟疫使者歌莉娅：制导瘟疫飞弹 — → 60/120"); }
  const b = g.attacks.find((x) => x[0] === "瘟疫之雷（召唤）");
  if (b) { b[1] = "—/140"; log("瘟疫使者歌莉娅：瘟疫之雷 140 → —/140"); }
}

// 毁灭魔像：火柱本体无伤害（拆分），蓝色火球 60/120 保留
{
  const r = st.cal_ravager.attacks.find((x) => x[0] === "火柱与蓝色火球");
  if (r) {
    r[0] = "蓝色火球";
    r[2] = "两侧 45 格循环发射，自身每损 1/4 生命换一次模式；火柱本体无伤害、只能用镐类工具摧毁";
    log("毁灭魔像：火柱与蓝色火球 → 蓝色火球 60/120（火柱无伤害）");
  }
}

// 亵渎守卫：神圣碎晶 96/192（原 72/144）
{
  const a = st.cal_profaned_guardians.attacks.find((x) => x[0] === "神圣碎晶");
  if (a) { a[1] = "96/192"; log("亵渎守卫：神圣碎晶 72/144 → 96/192"); }
}

// 痴愚金龙：冲刺 120/240（原把接触值安在冲刺行）；补飞行接触 80/160
{
  const d = st.cal_dragonfolly;
  const i = d.attacks.findIndex((x) => x[0] === "水平长冲刺");
  if (i >= 0) {
    d.attacks.splice(i, 1,
      ["飞行接触", "80/160", "与玩家垂直对齐后接近，接触伤害较低但持续，保持机动"],
      ["冲刺", "120/240", "长距离冲刺伤害高，对齐瞬间垂直闪避"]
    );
    log("痴愚金龙：水平长冲刺 80/160 → 飞行接触 80/160 + 冲刺 120/240");
  }
}

// 亵渎天神：圣之爆焱 120/240（原 80/160 是神圣之火的数值）
{
  const a = st.cal_providence.attacks.find((x) => x[0] === "圣之爆焱");
  if (a) { a[1] = "120/240"; log("亵渎天神：圣之爆焱 80/160 → 120/240"); }
}

// 风暴编织者：身体激光 108/216（原 90/180）；补头部接触 180/360
{
  const w = st.cal_storm_weaver;
  const a = w.attacks.find((x) => x[0] === "带电激光");
  if (a) { a[0] = "身体激光"; a[1] = "108/216"; a[2] = "避免接触体节，注意带电与静电逸散减益"; log("风暴编织者：带电激光 90/180 → 身体激光 108/216"); }
  const hasHead = w.attacks.some((x) => x[0] === "头部接触");
  if (!hasHead) {
    const i = w.attacks.findIndex((x) => x[0] === "覆甲尾部接触");
    w.attacks.splice(i >= 0 ? i : 0, 0, ["头部接触", "180/360", "第一阶段装甲期头部伤害极高，绝不可贴头，只攻击防御为 0 的尾巴"]);
    log("风暴编织者：补头部接触 180/360");
  }
}

// 噬魂幽花：蓝色幻影冲击 130/260；红色系拆分
{
  const p = st.cal_polterghast;
  const a = p.attacks.find((x) => x[0] === "蓝色幻影冲击");
  if (a) { a[1] = "130/260"; log("噬魂幽花：蓝色幻影冲击 120/240 → 130/260"); }
  const i = p.attacks.findIndex((x) => x[0] === "红色幻灵弹/冲击");
  if (i >= 0) {
    p.attacks.splice(i, 1,
      ["红色幻灵弹", "130/260", "二阶段追踪弹升级版，更快更远，提前预判走位"],
      ["红色幻影冲击", "140/280", "二阶段冲刺弹升级版，看到变红立即拉开"]
    );
    log("噬魂幽花：红色幻灵弹/冲击 → 130/260 + 140/280 拆分");
  }
}

// 硫海遗爵：冲刺接触 140/280（三阶段 154/308、168/336）
{
  const d = st.cal_old_duke;
  const a = d.attacks.find((x) => x[0] === "预判冲刺");
  if (a) {
    a[1] = "140/280";
    a[2] = "冲刺会预判玩家移动方向，冲刺瞬间反向变向躲避；三阶段接触提升至 154/308、168/336";
    log("硫海遗爵：预判冲刺 140/154/168 → 140/280（三阶段递增入提示）");
  }
}

// 神明吞噬者：紫色光束 —/340（强化激光阶段为专家及以上）
{
  const a = st.cal_devourer.attacks.find((x) => x[0].indexOf("紫色光束") >= 0);
  if (a) { a[1] = "—/340"; log("神明吞噬者：紫色光束 170/340 → —/340"); }
}

// 星流巨械：高斯核弹 270/540（裂片 140/280 入提示；原 270/140 为错拼）
{
  const a = st.cal_exo_mechs.attacks.find((x) => x[0].indexOf("高斯核弹") >= 0);
  if (a) {
    a[0] = "高斯核弹（阿瑞斯狂暴）"; a[1] = "270/540";
    a[2] = "追踪 20 格，绿色圆圈指示爆炸范围，指示期内离开；爆炸裂片 140/280";
    log("星流巨械：高斯核弹 270/140 → 270/540（裂片 140/280）");
  }
}

// 星神游龙：红色幻星雷 X 型激光 = 星幻激光 60/120（原 80/160）
{
  const a = st.cal_astrum_deus.attacks.find((x) => x[0] === "红色幻星雷四向激光");
  if (a) { a[1] = "60/120"; log("星神游龙：红色幻星雷四向激光 80/160 → 60/120"); }
}

// 硫磺火元素：炼狱硫火球 48/96（原 38/76 是硫火飞弹的值）；接触 56/112；狱火永燃射线 140/210
{
  const b = st.cal_brimstone;
  const a1 = b.attacks.find((x) => x[0] === "炼狱硫火球");
  if (a1) { a1[1] = "48/96"; a1[2] = "4 秒后或触物爆炸留下焦炎爆，保持移动不停留"; log("硫磺火元素：炼狱硫火球 38/76 → 48/96"); }
  const a2 = b.attacks.find((x) => x[0] === "传送落点");
  if (a2) { a2[0] = "接触（传送落点）"; log("硫磺火元素：传送落点 → 接触（传送落点）56/112"); }
  const a3 = b.attacks.find((x) => x[0] === "狱火永燃射线（复仇）");
  if (a3) { a3[1] = "140/210"; log("硫磺火元素：狱火永燃射线 —/140 → 140/210"); }
}

// 犽戎：弹幕炼狱弹幕为灼焱余烬 132/264（原 210/420 是冲刺值）
{
  const a = st.cal_yharon.attacks.find((x) => x[0] === "弹幕炼狱");
  if (a) { a[1] = "132/264"; log("犽戎：弹幕炼狱 210/420 → 132/264"); }
}

// 西格纳斯：星界雷 —/420（经典无此攻击）
{
  const a = st.cal_signus.attacks.find((x) => x[0] === "星界雷（复仇）");
  if (a) { a[1] = "—/420"; log("西格纳斯：星界雷 280/420 → —/420"); }
}

// 灾厄之影：补接触 70/140
{
  const c = st.cal_calamitas_clone;
  if (!c.attacks.some((x) => x[0] === "接触")) {
    c.attacks.unshift(["接触", "70/140", "本体接触伤害较高，全程保持距离机动"]);
    log("灾厄之影：补接触 70/140");
  }
}

// 利维坦和阿娜希塔：补阿娜希塔冲刺 75/150
{
  const l = st.cal_leviathan;
  if (!l.attacks.some((x) => x[0] === "阿娜希塔冲刺")) {
    const i = l.attacks.findIndex((x) => x[0] === "水之枪");
    l.attacks.splice(i >= 0 ? i : 0, 0, ["阿娜希塔冲刺", "75/150", "隐身解除后的冲刺突进，横向位移躲避"]);
    log("利维坦和阿娜希塔：补阿娜希塔冲刺 75/150");
  }
}

// ---------- 下一站文案（对齐 Boss Rush 官方推荐顺序） ----------
const AFTER_FIX = [
  ["cal_calamitas_clone", "下一站：亵渎守卫（月主后）或利维坦和阿娜希塔。", "下一站：利维坦和阿娜希塔（官方推荐顺序中紧随其后，随后白金星舰）。"],
  ["cal_profaned_guardians", "下一站：利维坦和阿娜希塔。", "下一站：痴愚金龙（官方推荐顺序中紧随其后）。"],
  ["cal_providence", "下一站：风暴编织者。", "下一站：无尽虚空（三使徒顺序可自由选择，官方推荐以无尽虚空为先）。"],
  ["cal_storm_weaver", "下一站：无尽虚空。", "下一站：神之使徒西格纳斯。"],
  ["cal_ceaseless_void", "下一站：神之使徒西格纳斯。", "下一站：风暴编织者。"],
  ["cal_signus", "下一站：神明吞噬者（或先噬魂幽花/硫海遗爵，三线均可）。", "下一站：噬魂幽花。"],
  ["cal_slime_god", "下一站：极地之灵。", "下一站：极地之灵（需先击败血肉墙进入困难模式）。"],
  ["cal_astrum_aureus", "下一站：瘟疫使者歌莉娅。", "下一站：瘟疫使者歌莉娅（需先击败原版石巨人）。"],
  ["cal_astrum_deus", "下一站：痴愚金龙。", "下一站：亵渎守卫（需先击败月亮领主进入月主后）。"]
];
AFTER_FIX.forEach(([id, from, to]) => {
  const t = st[id].after;
  if (t.indexOf(from) >= 0) { st[id].after = t.replace(from, to); log(id + " 下一站文案更新"); }
  else console.log("  !! 未找到 " + id + " 的锚点: " + from.slice(0, 20));
});

// ---------- 重新序列化（保留头部注释） ----------
const raw = fs.readFileSync(FILE, "utf8");
const header = raw.slice(0, raw.indexOf("module.exports"));
const out = header + "module.exports=" + JSON.stringify(S) + "\n";
fs.writeFileSync(FILE, out);
console.log("\n共 " + fixCount + " 项修正，已写回 " + FILE + "（" + Math.round(out.length / 1024) + "KB）");
