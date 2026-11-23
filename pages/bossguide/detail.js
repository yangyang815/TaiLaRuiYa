const BT = require("../../utils/back-top-behavior");
const dex = require("../../utils/dex");
const store = require("../../utils/store");
const { GUIDES: GUIDES, CATS: CATS } = require("../../data/bossGuides");
const CAT_ORDER = ["场地", "战士", "射手", "法师", "召唤师", "盔甲", "饰品", "药水", "技巧"];
const CLASS_CATS = ["战士", "射手", "法师", "召唤师"];
const CLASSES = [
  { k: "", n: "全部" },
  { k: "战士", n: "⚔️ 战士" },
  { k: "射手", n: "🏹 射手" },
  { k: "法师", n: "🔮 法师" },
  { k: "召唤师", n: "🪄 召唤师" }
];
Page({
  behaviors: [BT],
  onPageScroll(e) {
    const show = e && e.scrollTop > 600;
    if (show !== this.data.showBackTop) this.setData({ showBackTop: show });
  },
  data: {
    statusBarHeight: 20,
    capsuleRight: 100,
    themeClass: "",
    id: "",
    name: "",
    en: "",
    artId: "",
    color: "#FFD700",
    summon: null,
    classes: CLASSES,
    cls: "",
    hasClassCats: true,
    groups: [],
    unlocks: [],
    next: "",
    nextId: "",
    nextName: "",
    done: 0,
    total: 0,
    pct: 0,
    defeated: false
  },
  onLoad(opts) {
    const app = getApp();
    const id = opts.id || "";
    const g = GUIDES[id];
    if (!g) {
      wx.showToast({ title: "攻略不存在", icon: "none" });
      setTimeout(() => wx.navigateBack(), 600);
      return;
    }
    const e = dex.byId[id] || {};
    wx.setNavigationBarTitle({ title: "泰拉瑞亚" + (g.name || "Boss") + "·Boss攻略" });
    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      capsuleRight: app.globalData.capsuleRight || 100,
      themeClass: app.themeClass(),
      id: id,
      name: e.name || id,
      en: e.en || "",
      artId: e.artId || "boss_eye_cthulhu",
      color: (e.raw && e.raw.color) || "#FFD700",
      summon: g.summon,
      unlocks: g.post.unlocks || [],
      next: g.post.next || "",
      nextId: g.post.nextId || "",
      nextName: g.post.nextId ? (dex.byId[g.post.nextId] || {}).name || "" : ""
    });
    this.refresh();
  },
  onShow() {
    const app = getApp();
    this.setData({ themeClass: app.themeClass() });
    if (this.data.id && GUIDES[this.data.id]) this.refresh();
  },
  refresh() {
    const g = GUIDES[this.data.id];
    const checked = store.getBossChecks(this.data.id);
    const cls = this.data.cls;
    const hasClassCats = g.prep.some((p) => CLASS_CATS.indexOf(p.cat) >= 0);
    const visible = cls
      ? g.prep.filter((p) => CLASS_CATS.indexOf(p.cat) < 0 || p.cat === cls)
      : g.prep;
    const byCat = {};
    visible.forEach((p) => {
      (byCat[p.cat] = byCat[p.cat] || []).push(Object.assign({}, p, { checked: !!checked[p.id] }));
    });
    const groups = CAT_ORDER.filter((c) => byCat[c]).map((c) => ({
      cat: c,
      icon: CATS[c] || "📌",
      items: byCat[c],
      done: byCat[c].filter((i) => i.checked).length
    }));
    const total = visible.length;
    const done = visible.filter((p) => checked[p.id]).length;
    this.setData({
      hasClassCats: hasClassCats,
      groups: groups,
      total: total,
      done: done,
      pct: total ? Math.round((done / total) * 100) : 0,
      defeated: store.isDefeated(this.data.id)
    });
  },
  onCls(e) {
    const k = e.currentTarget.dataset.k || "";
    if (k === this.data.cls) return;
    this.setData({ cls: k });
    this.refresh();
  },
  onToggle(e) {
    const gi = +e.currentTarget.dataset.g;
    const ii = +e.currentTarget.dataset.i;
    const item = this.data.groups[gi] && this.data.groups[gi].items[ii];
    if (!item) return;
    store.toggleCheck(this.data.id, item.id);
    wx.vibrateShort({ type: "light" });
    this.refresh();
  },
  onLink(e) {
    const id = e.currentTarget.dataset.link;
    if (!id) return;
    if (dex.byId[id]) {
      dex.go(id);
      return;
    }
    wx.showToast({ title: "该物品暂无图鉴页", icon: "none" });
  },
  goNext() {
    if (this.data.nextId) wx.redirectTo({ url: "/pages/bossguide/detail?id=" + this.data.nextId });
  },
  goBoss() {
    dex.go(this.data.id);
  },
  toggleDefeated() {
    const added = store.toggleDefeated(this.data.id);
    this.setData({ defeated: added });
    wx.vibrateShort({ type: "medium" });
    wx.showToast({ title: added ? "已标记击败！" : "已取消击败标记", icon: "none" });
  },
  back() {
    wx.navigateBack();
  },
  onShareAppMessage() {
    // 分享卡片：Boss 精灵图 + 攻略名（离屏 canvas 生成，失败回退截屏）
    // 注意：promise resolve 的对象会整体替换分享内容，必须带全 title/path
    const shareCard = require("../../utils/share-card");
    const be = dex.byId[this.data.id] || {};
    const title = (this.data.name || "Boss") + "完整攻略 · 打法准备掉落一应俱全";
    const path = "/pages/bossguide/detail?id=" + this.data.id;
    return {
      title: title,
      path: path,
      promise: shareCard
        .makeCard({
          title: this.data.name || "Boss",
          sub: "完整攻略 · 打法准备掉落",
          icon: shareCard.spriteIcon(be.artId),
          accent: be.glow
        })
        .then((p) => {
          const r = { title: title, path: path };
          if (p) r.imageUrl = p;
          return r;
        })
    };
  },
  onShareTimeline() {
    return { title: (this.data.name || "Boss") + "完整攻略 · 泰拉瑞亚攻略免费看" };
  }
});
