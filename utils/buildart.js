// 建造指南像素图解注册：为每个案例 × 模板生成独立 artId（bld_案例_模板）
// 页面只传 artId 短字符串，避免 setData 传输完整像素对象
const { A, reg } = require('./pixelart')
const { FIXED, TPL, CASES } = require('../data/building')

CASES.forEach(c => {
  const pal = Object.assign({}, FIXED, c.pal)
  const tpls = new Set((c.steps || []).map(s => s.tpl))
  tpls.add(c.thumb)
  tpls.forEach(t => {
    if (TPL[t]) reg('bld_' + c.id + '_' + t, A(16, 11, pal, TPL[t]))
  })
})
