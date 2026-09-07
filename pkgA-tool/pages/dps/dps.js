// DPS 计算器主页：职业/武器 → 配装 → 目标 → 实时结果
const D = require('../../../data/dps')
const X = require('../../../utils/dps')

Page({
  data: {
    statusBarHeight: 20,
    capsuleRight: 100,
    themeClass: '',
    // 选项数据
    classes: D.CLASSES,
    weapons: [],          // 当前职业武器
    allWeapons: D.WEAPONS,
    wprefixes: [],        // 当前职业可用词条
    armors: [],           // 当前职业 + 无护甲
    accOptions: D.ACCESSORIES,
    accNames: [],         // picker 文案
    buffs: D.BUFFS,
    targets: D.TARGETS,
    targetNames: [],
    modes: D.MODES,
    presets: D.PRESETS,
    stageN: D.STAGE_N,
    // 配装状态
    cls: 'melee',
    weaponId: 'terra_blade',
    prefixId: 'legendary',
    armorId: 'molten_armor',
    accs: [],
    accSel: [1, 0, 0, 0, 0], // picker 索引（0=无）
    buffsSel: ['well_fed'],
    targetId: 'moon_lord',
    targetIdx: 12,
    mode: 'classic',
    customDef: 0,
    // 结果
    result: null
  },

  onLoad () {
    const app = getApp()
    const s = X.defaultState()
    this.applyState(s)
    this.setData({
      statusBarHeight: (app.globalData.sys && app.globalData.sys.statusBarHeight) || 20,
      capsuleRight: app.globalData.capsuleRight || 100,
      themeClass: app.globalData.theme === 'light' ? 'theme-light' : ''
    })
  },

  onShow () {
    const app = getApp()
    this.setData({ themeClass: app.globalData.theme === 'light' ? 'theme-light' : '' })
  },

  /* 应用一个完整 state（默认/预设） */
  applyState (s) {
    this._state = s
    const accNames = ['无饰品'].concat(D.ACCESSORIES.map(a => a.name))
    const targetNames = D.TARGETS.map(t => t.name)
    this.setData({ accNames, targetNames, targets: D.TARGETS })
    this.refreshOptions()
    this.syncUI()
    this.recalc()
  },

  /* 按当前职业刷新武器/词条/盔甲选项 */
  refreshOptions () {
    const s = this._state
    const weapons = D.WEAPONS.filter(w => w.cls === s.cls)
    const wprefixes = D.WPREFIX.filter(p => p.cls === 'all' || p.cls === s.cls)
    const armors = D.ARMORS.filter(a => a.cls === 'all' || a.cls === s.cls)
    this.setData({ weapons, wprefixes, armors })
  },

  /* 重算结果 */
  recalc () {
    const r = X.calc(this._state)
    // 饰品显示名（含词条）
    const accs = this._state.accs.map(a => {
      const it = D.ACCESSORIES.find(x => x.id === a.id)
      const ap = D.APREFIX.find(p => p.id === a.ap)
      return { id: a.id, ap: a.ap, name: it ? it.name : '', apName: ap ? ap.name : '', art: it ? it.art : '' }
    })
    this.setData({ result: r, accs })
  },

  /* ---------- 交互 ---------- */
  back () { wx.navigateBack() },

  // 切职业：切默认武器/词条/盔甲，清空饰品中不适用的（保留通用）
  onCls (e) {
    const cls = e.currentTarget.dataset.id
    if (cls === this._state.cls) return
    const s = this._state
    s.cls = cls
    // 换该职业默认武器
    const w = D.WEAPONS.find(x => x.cls === cls && x.stage === 'end') || D.WEAPONS.find(x => x.cls === cls)
    s.weaponId = w.id
    // 词条切该职业毕业词条
    const pxMap = { melee: 'legendary', ranged: 'unreal', magic: 'mythical' }
    s.prefixId = pxMap[cls]
    // 盔甲切该职业第一套
    const ar = D.ARMORS.find(x => x.cls === cls)
    s.armorId = ar ? ar.id : 'none'
    this.refreshOptions()
    this.recalc()
    this.syncUI()
  },

  onWeapon (e) {
    this._state.weaponId = e.currentTarget.dataset.id
    this.recalc()
    this.syncUI()
  },

  onPrefix (e) {
    this._state.prefixId = this.data.wprefixes[e.detail.value].id
    this.recalc()
    this.syncUI()
  },

  onArmor (e) {
    this._state.armorId = this.data.armors[e.detail.value].id
    this.recalc()
    this.syncUI()
  },

  // 饰品槽位 picker
  onAcc (e) {
    const i = Number(e.currentTarget.dataset.i)
    const idx = Number(e.detail.value)
    this._state.accs[i].id = idx === 0 ? '' : D.ACCESSORIES[idx - 1].id
    this.recalc()
    this.syncUI()
  },

  // 饰品词条循环切换：无→威逼→幸运
  onAccAp (e) {
    const i = Number(e.currentTarget.dataset.i)
    const cur = this._state.accs[i].ap
    const order = ['none', 'menacing', 'lucky']
    this._state.accs[i].ap = order[(order.indexOf(cur) + 1) % 3]
    this.recalc()
    this.syncUI()
  },

  // 增益开关
  onBuff (e) {
    const id = e.currentTarget.dataset.id
    const list = this._state.buffs
    const i = list.indexOf(id)
    if (i >= 0) list.splice(i, 1)
    else list.push(id)
    this.recalc()
    this.syncUI()
  },

  // 目标 picker
  onTarget (e) {
    const idx = Number(e.detail.value)
    this._state.targetId = D.TARGETS[idx].id
    this.recalc()
    this.syncUI()
  },

  // 自定义防御滑块
  onDef (e) {
    this._state.customDef = Number(e.detail.value)
    this.recalc()
    this.syncUI()
  },

  // 难度
  onMode (e) {
    this._state.mode = e.currentTarget.dataset.id
    this.recalc()
    this.syncUI()
  },

  // 预设方案
  onPreset (e) {
    const s = X.presetState(e.currentTarget.dataset.id)
    if (!s) return
    this.applyState(s)
    wx.showToast({ title: '已应用预设', icon: 'none' })
  },

  /* 同步 _state 到 data（picker 索引等） */
  syncUI () {
    const s = this._state
    const accSel = s.accs.map(a => {
      const i = D.ACCESSORIES.findIndex(x => x.id === a.id)
      return i >= 0 ? i + 1 : 0
    })
    const targetIdx = Math.max(0, D.TARGETS.findIndex(t => t.id === s.targetId))
    const pxIdx = Math.max(0, this.data.wprefixes.findIndex(p => p.id === s.prefixId))
    const arIdx = Math.max(0, this.data.armors.findIndex(a => a.id === s.armorId))
    this.setData({
      cls: s.cls, weaponId: s.weaponId, prefixId: s.prefixId,
      prefixIdx: pxIdx, armorIdx: arIdx,
      accSel, buffsSel: s.buffs, targetId: s.targetId, targetIdx,
      mode: s.mode, customDef: s.customDef || 0
    })
  },
  onShareAppMessage () {
    return { title: '泰拉瑞亚 · DPS 计算器（配装伤害一目了然）', path: '/pkgA-tool/pages/dps/dps' }
  },
  onShareTimeline () {
    return { title: '泰拉瑞亚 · DPS 计算器（配装伤害一目了然）' }
  }
})
