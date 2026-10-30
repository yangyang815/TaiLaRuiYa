const stems = require("./search-stems");
const RCOL = {
  "-13": "#B57BFF",
  "-12": "#FF4CE0",
  "-1": "#B4B4B4",
  0: "#FFFFFF",
  1: "#9696FF",
  2: "#96FF96",
  3: "#FFC896",
  4: "#FF9696",
  5: "#FF96FF",
  6: "#D2A0FF",
  7: "#96FF0A",
  8: "#FFFF32",
  9: "#32FFFF",
  10: "#FF3232"
};
const RLAB = {
  "-13": "大师",
  "-12": "专家",
  "-1": "任务",
  0: "白色",
  1: "蓝色",
  2: "绿色",
  3: "橙色",
  4: "浅红",
  5: "粉色",
  6: "浅紫",
  7: "青柠",
  8: "黄色",
  9: "青色",
  10: "红色"
};
let loader = null;
const VOLS = require("./cat-vols");
// 缓存版本体系：
// - cat-data-ver.js 导出分卷对象 {v1,v2,v3}（build-catalog 按数据内容 hash 生成，改哪卷只失效哪卷缓存）
// - 兼容旧字符串格式（历史脚本产物），自动归一化为三卷同值
// - SCHEMA_VER：normalize 逻辑与缓存结构版本，改 normalize 规则或分片结构时手动 +1（约定：不含连字符）
const SCHEMA_VER = "s1";
let DATAVER = "v0";
try {
  DATAVER = require("./cat-data-ver");
} catch (e) {}
const DV =
  typeof DATAVER === "string" ? { v1: DATAVER, v2: DATAVER, v3: DATAVER } : DATAVER || {};
function volVer(i) {
  return SCHEMA_VER + "-" + String(DV["v" + i] || "v0");
}
const hasWx = typeof wx !== "undefined" && !!wx.getStorageSync;
const ALIAS = {
  地狱花: "火焰花",
  黑曜石药水: "黑曜石皮药水",
  红心: "生命水晶",
  蓝心: "魔力水晶",
  肉山: "血肉墙",
  蜂王: "蜂后",
  世界吞噬者: "世界吞噬怪",
  克苏鲁之脑: "克苏鲁之脑",
  巴斯特雕像: "韧皮雕像",
  炽焰巨剑: "火山",
  阿尔盖比之花: "阿比盖尔之花",
  阿盖尔之花: "阿比盖尔之花"
};
let _lastStats = {};
function lastStats() {
  return _lastStats;
}
function rawVol(i) {
  if (loader) {
    return Promise.resolve(loader()).then((all) => (all || []).filter((x) => (x.vol || i) === i));
  }
  _lastStats = _lastStats || {};
  const paths = [
    "../pkg-cat-" + i + "/data/data-v" + i + ".js",
    "/pkg-cat-" + i + "/data/data-v" + i + ".js",
    "../../pkg-cat-" + i + "/data/data-v" + i + ".js"
  ];
  return new Promise((res) => {
    let pi = 0;
    let lastErr = "";
    const tryNext = () => {
      if (pi >= paths.length) {
        _lastStats["v" + i] = -1;
        console.log("[图鉴] v" + i + " 全部路径失败, 最后错误:", lastErr);
        res([]);
        return;
      }
      const p = paths[pi++];
      console.log("[图鉴] v" + i + " 尝试路径:", p);
      try {
        require.async(p).then(
          (m) => {
            _lastStats["v" + i] = (m || []).length;
            console.log("[图鉴] v" + i + " 加载成功:", _lastStats["v" + i], "条 via", p);
            res(m || []);
          },
          (err) => {
            lastErr = (err && (err.message || err.errMsg)) || String(err);
            console.log("[图鉴] v" + i + " 该路径失败:", lastErr);
            tryNext();
          }
        );
      } catch (e) {
        lastErr = (e && e.message) || String(e);
        console.log("[图鉴] v" + i + " 同步抛错:", lastErr);
        tryNext();
      }
    };
    tryNext();
  });
}
function volWithTimeout(i) {
  let settled = false;
  return Promise.race([
    rawVol(i).then((m) => {
      settled = true;
      return m;
    }),
    new Promise((res) =>
      setTimeout(() => {
        if (!settled) {
          if (_lastStats) _lastStats["v" + i] = -1;
          console.log("[图鉴] v" + i + " 12s 超时，放弃等待");
        }
        res([]);
      }, 12e3)
    )
  ]);
}
function normalizeRows(rows, vol) {
  const out = [];
  (rows || []).forEach((x) => {
    if (!x || !x.f) return;
    const r = Number(x.r);
    out.push({
      ...x,
      vol: vol,
      sprite: x.sprite || "/pkg-cat-" + vol + "/assets/" + x.f + ".png",
      rcol: x.rcol || RCOL[r] || "#FFFFFF",
      rlab: x.rlab || RLAB[r] || ""
    });
  });
  return out;
}
let purgedOld = false;
function purgeOldCaches() {
  if (purgedOld || !hasWx) return;
  purgedOld = true;
  try {
    (wx.getStorageInfoSync().keys || []).forEach((k) => {
      if (k.indexOf("terr_catv2_") === 0) {
        // 新分片格式：terr_catv2_{volVer}-{vol}-{分片序号|meta}，仅保留当前版本×当前卷
        const m = k.match(/^terr_catv2_(.+)-(\d)-(meta|\d+)$/);
        const vol = m ? Number(m[2]) : 0;
        if (!m || vol < 1 || vol > VOLS || m[1] !== volVer(vol)) {
          try {
            wx.removeStorageSync(k);
          } catch (e) {}
        }
        return;
      }
      if (k.indexOf("terr_catv") === 0) {
        // 旧整卷格式（terr_catv_{DATAVER}_{vol}）：一次性迁移清理
        try {
          wx.removeStorageSync(k);
        } catch (e) {}
      }
    });
  } catch (e) {}
}
// 分片大小（字符数）：微信 storage 单键上限 1MB，480KB 留足余量
const CHUNK_CHARS = 480 * 1024;
function saveVol(i, rows) {
  if (!hasWx) return;
  try {
    const s = JSON.stringify(rows || []);
    const n = Math.max(1, Math.ceil(s.length / CHUNK_CHARS));
    const base = "terr_catv2_" + volVer(i) + "-" + i + "-";
    for (let c = 0; c < n; c++) {
      wx.setStorageSync(base + c, s.substr(c * CHUNK_CHARS, CHUNK_CHARS));
    }
    wx.setStorageSync(base + "meta", { c: n, len: s.length, cnt: (rows || []).length });
    purgeOldCaches();
  } catch (e) {}
}
// 坏缓存清理：分片数加上限防御（真实分片数 ≤ 数MB/480KB ≈ 6，损坏的 meta.c 也不会撑爆循环）
function cleanVolCache(base, chunks) {
  try {
    const n = Math.min(Number(chunks) || 0, 50);
    for (let c = 0; c < n; c++) wx.removeStorageSync(base + c);
    wx.removeStorageSync(base + "meta");
  } catch (e) {}
}
function loadVolStorage(i) {
  if (!hasWx) return [];
  const base = "terr_catv2_" + volVer(i) + "-" + i + "-";
  try {
    const meta = wx.getStorageSync(base + "meta");
    if (!meta || !meta.c) return [];
    let s = "";
    for (let c = 0; c < meta.c; c++) {
      const part = wx.getStorageSync(base + c);
      if (typeof part !== "string" || !part) {
        cleanVolCache(base, meta.c);
        return [];
      }
      s += part;
    }
    if (meta.len && s.length !== meta.len) {
      cleanVolCache(base, meta.c);
      return [];
    }
    const rows = JSON.parse(s);
    return Array.isArray(rows) ? rows : [];
  } catch (e) {
    // 坏缓存自愈（解析失败等异常）：清掉该卷当前版本的所有分片，下次走分包重装
    try {
      const meta = wx.getStorageSync(base + "meta");
      if (meta && meta.c) cleanVolCache(base, meta.c);
    } catch (e2) {}
    return [];
  }
}
function globalDataVol(i) {
  try {
    if (typeof getApp !== "function") return [];
    const app = getApp();
    const v = app && app.globalData && app.globalData["catVol" + i];
    return v && v.length ? v : [];
  } catch (e) {
    return [];
  }
}
const volP = {};
function loadVol(i, force) {
  if (force) delete volP[i];
  if (!volP[i]) {
    volP[i] = Promise.resolve().then(() => {
      // 主源：本地分片缓存（分卷版本匹配即命中，秒开、零分包依赖）
      const cached = loadVolStorage(i);
      if (cached.length) {
        _lastStats["v" + i] = cached.length + " (cache)";
        return mapEntries(cached, i);
      }
      // 未命中（首次 / 该卷数据更新过 / 坏缓存自愈后）：读分包数据文件
      return volWithTimeout(i).then((m) => {
        if (m && m.length) {
          _lastStats["v" + i] = m.length;
          saveVol(i, m);
          return mapEntries(m, i);
        }
        delete volP[i];
        // 兜底 1：装载页链路产物（globalData，弱网分包未就绪时由 codex 装载链写入）
        const g = globalDataVol(i);
        if (g.length) {
          _lastStats["v" + i] = g.length + " (global)";
          saveVol(i, g);
          return mapEntries(g, i);
        }
        // 兜底 2：本地缓存（理论上前面已查过，防御性保留）
        return mapEntries(loadVolStorage(i), i);
      });
    });
  }
  return volP[i];
}
function resetVols() {
  Object.keys(volP).forEach((k) => {
    delete volP[k];
  });
}
function mapEntries(rows, vol) {
  return normalizeRows(rows, vol);
}
function load() {
  return Promise.all(Array.from({ length: VOLS }, (x, k) => k + 1).map((i) => loadVol(i))).then(
    (ms) => {
      const out = [];
      ms.forEach((m, i) => out.push(...mapEntries(m, i + 1)));
      return out;
    }
  );
}
function loadProgressive(onPart) {
  return Promise.all(
    Array.from({ length: VOLS }, (x, k) => k + 1).map((i) =>
      loadVol(i).then((rows) => {
        if (rows && rows.length) {
          try {
            onPart(mapEntries(rows, i), i);
          } catch (e) {
            console.error("[图鉴] 上屏异常:", e && e.message);
          }
        }
      })
    )
  );
}
function search(kw, limit) {
  const k = (kw || "").trim().toLowerCase();
  if (!k) return Promise.resolve([]);
  const max = limit || 8;
  const terms = [k];
  const kwt = (kw || "").trim();
  const aliased = ALIAS[kwt];
  if (aliased) terms.push(aliased.toLowerCase());
  if (kwt.length >= 2) {
    for (const ak in ALIAS) {
      if (ak !== kwt && (ak.indexOf(kwt) >= 0 || kwt.indexOf(ak) >= 0)) {
        const v = ALIAS[ak].toLowerCase();
        if (terms.indexOf(v) < 0) terms.push(v);
      }
    }
  }
  return load().then((all) => {
    const inX = (x, t) =>
      (x.n || "").toLowerCase().indexOf(t) >= 0 || (x.en || "").toLowerCase().indexOf(t) >= 0;
    const stem = stems.stemOf(kw);
    const hits = all.filter(
      (x) => terms.some((t) => inX(x, t)) || (stem && (x.en || "").toLowerCase().indexOf(stem) >= 0)
    );
    hits.sort((a, b) => {
      const ap = terms.some(
        (t) => (a.n || "").toLowerCase().startsWith(t) || (a.en || "").toLowerCase().startsWith(t)
      )
        ? 0
        : 1;
      const bp = terms.some(
        (t) => (b.n || "").toLowerCase().startsWith(t) || (b.en || "").toLowerCase().startsWith(t)
      )
        ? 0
        : 1;
      return ap - bp || (a.n || "").length - (b.n || "").length;
    });
    return hits
      .slice(0, max)
      .map((x) => ({
        n: x.n,
        en: x.en,
        f: x.f,
        vol: x.vol,
        c: x.c || "",
        d: x.d || "",
        dt: x.dt || "",
        sprite: x.sprite,
        rcol: x.rcol,
        rlab: x.rlab
      }));
  });
}
function searchTotal(kw) {
  const k = (kw || "").trim().toLowerCase();
  if (!k) return Promise.resolve(0);
  const terms = [k];
  const kwt = (kw || "").trim();
  const aliased = ALIAS[kwt];
  if (aliased) terms.push(aliased.toLowerCase());
  if (kwt.length >= 2) {
    for (const ak in ALIAS) {
      if (ak !== kwt && (ak.indexOf(kwt) >= 0 || kwt.indexOf(ak) >= 0)) {
        const v = ALIAS[ak].toLowerCase();
        if (terms.indexOf(v) < 0) terms.push(v);
      }
    }
  }
  return load().then(
    (all) =>
      all.filter((x) =>
        terms.some(
          (t) =>
            (x.n || "").toLowerCase().indexOf(t) >= 0 || (x.en || "").toLowerCase().indexOf(t) >= 0
        )
      ).length
  );
}
function getById(f) {
  return load().then((all) => all.find((x) => x.f === f) || null);
}
function findByName(name) {
  return load().then((all) => all.find((x) => x.n === name) || null);
}
module.exports = {
  VOLS: VOLS,
  load: load,
  loadVol: loadVol,
  loadProgressive: loadProgressive,
  resetVols: resetVols,
  search: search,
  searchTotal: searchTotal,
  getById: getById,
  findByName: findByName,
  lastStats: lastStats,
  normalizeRows: normalizeRows,
  saveVolCache: saveVol,
  ALIAS: ALIAS,
  __useLoader: (fn) => {
    loader = fn;
  }
};
