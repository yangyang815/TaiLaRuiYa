// 主题页点击链路诊断加固：
// 1) 卡片加 hover 反馈（区分"事件没触发"和"handler 内部报错"）
// 2) onThemeTap 全程 try/catch，报错直接 toast 显示（真机无控制台也能看见）
// 3) 关键节点 console.log，模拟器 Console 可查
const fs = require("fs")

// ---- 1. theme.js 页面逻辑加固 ----
let p = "pages/theme/theme.js"
let js = fs.readFileSync(p, "utf8")

const oldFn = `  onThemeTap(e) {
    const id = e.currentTarget.dataset.id
    const t = theme.THEMES.find(x => x.id === id)
    if (!t) return`
const newFn = `  onThemeTap(e) {
    try {
      const id = e.currentTarget.dataset.id
      console.log("[theme] tap:", id)
      if (!id) { wx.showToast({ title: "未取得主题ID", icon: "none" }); return }
      const t = theme.THEMES.find(x => x.id === id)
      if (!t) { wx.showToast({ title: "主题数据缺失:" + id, icon: "none" }); return }`
if (!js.includes(oldFn)) { console.log("onThemeTap 锚点未命中"); process.exit(1) }
js = js.replace(oldFn, newFn)

// 收尾：把原函数体剩余部分包进 try，并补 catch
const oldTail = `          this.render()
        })
      },
    })
  },`
const newTail = `          this.render()
        })
      },
    })
    } catch (err) {
      console.error("[theme] onThemeTap 异常:", err)
      wx.showToast({ title: "点击异常:" + (err && err.message || err), icon: "none", duration: 3000 })
    }
  },`
if (!js.includes(oldTail)) { console.log("onThemeTap 尾部锚点未命中"); process.exit(1) }
js = js.replace(oldTail, newTail)
fs.writeFileSync(p, js)
console.log("theme.js 加固 OK")

// ---- 2. wxml 卡片加 hover 反馈 ----
let w = "pages/theme/theme.wxml"
let wx = fs.readFileSync(w, "utf8")
const oldCard = `<view class="tp-card card tappable {{item.using ? 'tp-using' : ''}}"
      wx:for="{{themes}}" wx:key="id"
      bindtap="onThemeTap" data-id="{{item.id}}">`
const newCard = `<view class="tp-card card tappable {{item.using ? 'tp-using' : ''}}"
      wx:for="{{themes}}" wx:key="id"
      hover-class="tp-card-hover" hover-stay-time="80"
      bindtap="onThemeTap" data-id="{{item.id}}">`
if (!wx.includes(oldCard)) { console.log("wxml 卡片锚点未命中"); process.exit(1) }
wx = wx.replace(oldCard, newCard)
fs.writeFileSync(w, wx)
console.log("wxml hover OK")

// ---- 3. wxss hover 样式 ----
let s = "pages/theme/theme.wxss"
let css = fs.readFileSync(s, "utf8")
if (!css.includes("tp-card-hover")) {
  css += "\n.tp-card-hover { opacity: 0.82; transform: scale(0.985); transition: all 0.08s; }\n"
  fs.writeFileSync(s, css)
  console.log("wxss hover 样式 OK")
} else console.log("wxss 已有 hover 样式")
