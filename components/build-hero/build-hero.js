// 建筑外观组件：官方方块/家具精灵图按 16×11 网格实时拼合，天空与背景墙用色块
// 效果接近游戏实机截图；无贴图映射的字符回退案例 pal 颜色
const D = require('../../data/building')

// 通用贴图：玻璃窗 / 火把 / 工作台（所有案例共用，可被 case.tiles 覆盖）
// FIT 内的字符用 aspectFit（横宽图标如工作台），其余 aspectFill（方块贴图满铺）
const BASE_TILES = { V: 'glass', T: 'torch', A: 'workbench' }
const FIT_CHARS = { A: 1, T: 1 }

Component({
  properties: {
    caseId: { type: String, value: '' },
    tpl: { type: String, value: '' }, // 指定模板名（步骤图），空则用案例 thumb 成品图
    width: { type: Number, value: 640 } // rpx
  },
  data: {
    rows: [],   // [[{img}|{c}|null] × 16] × 11
    height: 440
  },
  observers: {
    'caseId, tpl, width': function () { this.render() }
  },
  lifetimes: {
    attached () { this.render() }
  },
  methods: {
    render () {
      const c = D.CASES.find(x => x.id === this.properties.caseId)
      if (!c) return
      const tpl = D.TPL[this.properties.tpl || c.thumb]
      if (!tpl) return
      const pal = Object.assign({}, D.FIXED, c.pal)
      const tiles = Object.assign({}, BASE_TILES, c.tiles)
      const rows = tpl.map(line => {
        const cells = []
        for (let x = 0; x < 16; x++) {
          const ch = line[x]
          if (!ch || ch === '.') { cells.push(null); continue }
          const sp = tiles[ch]
          if (sp) cells.push({ img: '/assets/sprites/' + sp + '.png', fit: !!FIT_CHARS[ch] })
          else cells.push({ c: pal[ch] || '#888' })
        }
        return cells
      })
      this.setData({
        rows,
        height: Math.round(this.properties.width * 11 / 16)
      })
    }
  }
})
