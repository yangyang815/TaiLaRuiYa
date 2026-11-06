const SH = require("../../data/shimmer");
const catSearch = require("../../utils/catalog-search");

Component({
  properties: {
    // 当前物品的中文名（与图鉴条目 n 字段一致）
    name: { type: String, value: "" }
  },
  data: {
    fwd: [], // 正向：投入微光后转化为
    rev: []  // 反向：由以下物品嬗变而来
  },
  observers: {
    name: function (v) {
      if (!v) {
        this.setData({ fwd: [], rev: [] });
        return;
      }
      const fwd = [];
      const rev = [];
      SH.pairs.forEach((p) => {
        if (p.from === v) fwd.push({ name: p.to, cond: p.cond || "" });
        if (p.to === v) rev.push({ name: p.from, cond: p.cond || "" });
      });
      this.setData({ fwd: fwd, rev: rev });
      // 产物/来源条目的图标与工具提示：异步查图鉴数据后按路径填充
      const fill = (list, key) => {
        list.forEach((it, i) => {
          catSearch.findByName(it.name)
            .then((entry) => {
              if (!entry) return;
              this.setData({
                [key + "[" + i + "].sprite"]: entry.sprite || "",
                [key + "[" + i + "].tip"]: entry.t || entry.en || ""
              });
            })
            .catch(() => {});
        });
      };
      fill(fwd, "fwd");
      fill(rev, "rev");
    }
  },
  methods: {
    // 点击产物/来源卡：跳到该条目（图鉴弹窗机制）
    onTapItem(e) {
      const nm = e.currentTarget.dataset.n;
      if (!nm) return;
      catSearch.findByName(nm)
        .then((entry) => {
          if (!entry) {
            wx.showToast({ title: "图鉴暂未收录该物品", icon: "none" });
            return;
          }
          const app = getApp();
          app.globalData.pendingCatSheet = "cat:" + entry.f;
          wx.switchTab({ url: "/pages/codex/codex" });
        })
        .catch(() => {
          wx.showToast({ title: "数据未就绪，稍后再试", icon: "none" });
        });
    }
  }
});
