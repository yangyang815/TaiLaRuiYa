// 动态分享卡片：离屏 canvas 生成 5:4 分享图（600x480），供 onShareAppMessage 的
// promise.imageUrl 使用（接收者看到「精灵图 + 条目名 + 品牌条」的专属卡片，替代页面截屏）。
// 兼容性：wx.createOffscreenCanvas 需基础库 2.16.1+；不支持/任何异常时 resolve("")，
// 调用方退回微信默认的页面截屏卡片（优雅降级，不阻塞分享）。
// promise 分享超时 3s，本绘制流程（本地图 + 文字）实测远低于该阈值。
const SPRITES = require("../data/spritemap");

// 内容类型 → 分享标题价值点（detail 页标题用）
const SELL = {
  boss: "的掉落与打法",
  mon: "的图鉴与掉落",
  item: "的获得方式与用途",
  npc: "的入住条件与商品",
  seed: "种子代码与玩法"
};
// 内容类型 → 卡片副标题（卡片图上的价值点）
const SUB = {
  boss: "掉落 · 打法 · 攻略免费查",
  mon: "图鉴 · 掉落物 · 出现地点",
  item: "获得方式 · 用途 · 合成路线",
  npc: "入住条件 · 商品 · 偏好",
  seed: "代码 · 玩法 · 效果"
};

function rgba(hex, a) {
  if (!hex || hex[0] !== "#" || hex.length < 7) hex = "#FFD700";
  const r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);
  return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}
function rnd(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 1831565813) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function fitFont(ctx, text, fs, maxW) {
  ctx.font = "bold " + fs + "px sans-serif";
  while (fs > 18 && ctx.measureText(text).width > maxW) {
    fs -= 2;
    ctx.font = "bold " + fs + "px sans-serif";
  }
  return fs;
}

// opts: { title(条目名), sub(副标题), icon(本地图片路径，可空), accent(主题色，可空), style("calamity" 用灾厄红底) }
function makeCard(opts) {
  return new Promise((resolve) => {
    try {
      if (!wx.createOffscreenCanvas) return resolve("");
      const W = 600,
        H = 480;
      const cv = wx.createOffscreenCanvas({ type: "2d", width: W, height: H });
      const ctx = cv.getContext("2d");
      if (!ctx) return resolve("");
      const o = opts || {};
      const cal = o.style === "calamity";
      const accent = o.accent || (cal ? "#E85555" : "#FFD700");
      // 背景：品牌暗紫 / 灾厄暗红 + 星点
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      if (cal) {
        bg.addColorStop(0, "#4A1A1A");
        bg.addColorStop(1, "#1E0C0C");
      } else {
        bg.addColorStop(0, "#2E1D52");
        bg.addColorStop(1, "#170B30");
      }
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      const r = rnd(String(o.title || "").length * 7919 + (cal ? 444 : 20260823));
      for (let i = 0; i < 40; i++) {
        const x = 20 + r() * (W - 40),
          y = 20 + r() * (H - 40);
        const s = 0.5 + r() * 1.2,
          a = 0.1 + r() * 0.45;
        ctx.beginPath();
        ctx.arc(x, y, s, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255," + a.toFixed(2) + ")";
        ctx.fill();
      }
      // 精灵图 + 光晕
      const cx = W / 2,
        iy = 196,
        box = 140;
      const finish = () => {
        try {
          // 条目名（金色渐变 + 降字号适配长名）
          const fs = fitFont(ctx, o.title || "", 34, 540);
          const g = ctx.createLinearGradient(0, 368 - fs, 0, 368);
          g.addColorStop(0, "#FFF6D8");
          g.addColorStop(0.45, "#FFD700");
          g.addColorStop(1, "#E8A400");
          ctx.textAlign = "center";
          ctx.font = "bold " + fs + "px sans-serif";
          ctx.fillStyle = g;
          ctx.fillText(o.title || "", cx, 368);
          // 副标题
          if (o.sub) {
            ctx.font = "22px sans-serif";
            ctx.fillStyle = cal ? "rgba(255,190,180,0.88)" : "rgba(185,169,214,0.92)";
            ctx.fillText(o.sub, cx, 406);
          }
          // 品牌条
          ctx.font = "20px sans-serif";
          ctx.fillStyle = cal ? "rgba(255,156,138,0.92)" : "rgba(255,215,0,0.85)";
          ctx.fillText("向导之书 · 泰拉瑞亚图鉴免费查", cx, 450);
          wx.canvasToTempFilePath({
            canvas: cv,
            success: (res) => {
              console.log("[share-card] 导出成功:", res.tempFilePath);
              resolve(res.tempFilePath || "");
            },
            fail: (err) => {
              console.warn("[share-card] 导出失败:", (err && err.errMsg) || err);
              resolve("");
            }
          });
        } catch (e) {
          resolve("");
        }
      };
      const glow = ctx.createRadialGradient(cx, iy, 12, cx, iy, box * 0.85);
      glow.addColorStop(0, rgba(accent, 0.3));
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(cx - box, iy - box, box * 2, box * 2);
      if (o.icon) {
        const img = cv.createImage();
        img.onload = () => {
          try {
            console.log("[share-card] 图标加载成功:", o.icon, img.width + "x" + img.height);
            const sc = Math.min(box / img.width, box / img.height);
            const dw = img.width * sc,
              dh = img.height * sc;
            ctx.save();
            ctx.shadowColor = rgba(accent, 0.5);
            ctx.shadowBlur = 18;
            ctx.drawImage(img, cx - dw / 2, iy - dh / 2, dw, dh);
            ctx.restore();
            finish();
          } catch (e) {
            console.warn("[share-card] 绘制异常:", e.message);
            resolve("");
          }
        };
        img.onerror = (err) => {
          console.warn("[share-card] 图标加载失败:", o.icon, (err && err.errMsg) || "");
          finish();
        };
        img.src = o.icon;
      } else {
        finish();
      }
    } catch (e) {
      resolve("");
    }
  });
}

// 精灵图路径：条目 artId → 本地 png/gif（data/spritemap 全量命中，兜底 stone）
function spriteIcon(artId) {
  if (!artId) return "";
  const ext = SPRITES[artId];
  return ext ? "/assets/sprites/" + artId + "." + ext : "";
}

module.exports = {
  makeCard: makeCard,
  spriteIcon: spriteIcon,
  SELL: SELL,
  SUB: SUB
};
