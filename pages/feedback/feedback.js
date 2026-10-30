// 反馈页：类型选择 + 文本 + 可选截图 → submitFeedback 云函数
const track = require("../../utils/track");
const MAX_LEN = 500;
const TYPES = [
  { k: "suggest", n: "功能建议", ico: "💡" },
  { k: "bug", n: "问题反馈", ico: "🐞" },
  { k: "correction", n: "内容纠错", ico: "📝" },
  { k: "other", n: "其他", ico: "💬" }
];
const PLACEHOLDER = {
  suggest: "想让我们加什么功能？说说你的想法…",
  bug: "遇到了什么问题？（在哪出现的、做了什么操作）",
  correction: "哪里写错了？正确的应该是什么？",
  other: "想说什么都可以…"
};

Page({
  data: {
    themeClass: "",
    statusBarHeight: 20,
    capsuleRight: 100,
    types: TYPES,
    type: "suggest",
    placeholder: PLACEHOLDER.suggest,
    content: "",
    len: 0,
    maxLen: MAX_LEN,
    shot: "",
    uploading: false,
    submitting: false,
    ctx: null
  },

  onLoad(options) {
    const app = getApp();
    this.setData({
      themeClass: app.themeClass ? app.themeClass() : "",
      statusBarHeight: app.globalData.navTop || 20,
      capsuleRight: app.globalData.capsuleRight || 100
    });
    // 纠错上下文（详情页跳转携带）
    if (options && options.type === "correction") {
      this.setData({
        type: "correction",
        placeholder: PLACEHOLDER.correction,
        ctx: {
          itemId: options.itemId || "",
          name: options.name ? decodeURIComponent(options.name) : "",
          cat: options.cat ? decodeURIComponent(options.cat) : "",
          currentText: options.text ? decodeURIComponent(options.text) : ""
        }
      });
    } else if (options && options.type && TYPES.some((t) => t.k === options.type)) {
      this.setData({ type: options.type, placeholder: PLACEHOLDER[options.type] });
    }
  },

  onShow() {
    const app = getApp();
    if (app.themeClass) this.setData({ themeClass: app.themeClass() });
  },

  back() {
    wx.navigateBack({ fail: () => wx.reLaunch({ url: "/pages/home/home" }) });
  },

  pickType(e) {
    const k = e.currentTarget.dataset.k;
    this.setData({ type: k, placeholder: PLACEHOLDER[k] });
  },

  onInput(e) {
    const v = (e.detail.value || "").slice(0, MAX_LEN);
    this.setData({ content: v, len: v.length });
  },

  chooseShot() {
    if (this.data.shot || this.data.submitting) return;
    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      sizeType: ["compressed"],
      success: (res) => {
        if (res.tempFiles && res.tempFiles[0])
          this.setData({ shot: res.tempFiles[0].tempFilePath });
      }
    });
  },

  removeShot() {
    this.setData({ shot: "" });
  },

  uploadShot() {
    const fp = this.data.shot;
    const ext = (fp.match(/\.(\w+)$/) || [])[1] || "png";
    const cloudPath =
      "feedback/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + ext;
    return wx.cloud.uploadFile({ cloudPath, filePath: fp });
  },

  meta() {
    let version = "",
      envVersion = "";
    try {
      const acc = wx.getAccountInfoSync();
      if (acc && acc.miniProgram) {
        version = acc.miniProgram.version || "";
        envVersion = acc.miniProgram.envVersion || "";
      }
    } catch (e) {
      /* ignore */
    }
    let model = "",
      system = "",
      platform = "";
    try {
      const di = wx.getDeviceInfo ? wx.getDeviceInfo() : wx.getSystemInfoSync();
      model = di.model || "";
      system = di.system || "";
      platform = di.platform || "";
    } catch (e) {
      /* ignore */
    }
    return {
      version: version || (envVersion ? "dev-" + envVersion : ""),
      model,
      system,
      platform
    };
  },

  submit() {
    if (this.data.submitting) return;
    const content = this.data.content.trim();
    if (content.length < 2) {
      wx.showToast({ title: "内容太短啦", icon: "none" });
      return;
    }

    this.setData({ submitting: true });
    const finish = (res) => {
      this.setData({ submitting: false });
      if (res && res.ok) {
        wx.showToast({ title: "提交成功，感谢反馈", icon: "success", duration: 1500 });
        setTimeout(() => this.back(), 1300);
      } else {
        const msg = (res && res.msg) || "提交失败，请稍后再试";
        wx.showToast({ title: msg, icon: "none", duration: 2200 });
      }
    };
    const call = (screenshot) => {
      const payload = {
        type: this.data.type,
        content,
        screenshot: screenshot || "",
        meta: this.meta()
      };
      if (this.data.ctx) payload.ctx = this.data.ctx;
      wx.cloud.callFunction({
        name: "submitFeedback",
        data: payload,
        success: (r) => {
          track.event("feedback"); // 只计提交动作次数
          finish(r.result);
        },
        fail: () => finish(null)
      });
    };

    if (this.data.shot) {
      this.uploadShot()
        .then((r) => call(r.fileID))
        .catch(() => {
          // 上传失败：不带截图继续提交
          call("");
        });
    } else {
      call("");
    }
  }
});
