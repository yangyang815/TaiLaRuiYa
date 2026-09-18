// 修复 data-v3.js：损坏结构 = 原始内容(截断) + 追加的正确导出
// 策略：取最后一个 module.exports 起的完整 JSON（它是损坏前加载的正确数据+电鳗修复），重建文件
const fs = require('fs')
const p = 'pkg-cat-3/data/data-v3.js'
const s = fs.readFileSync(p, 'utf8')

const lastIdx = s.lastIndexOf('module.exports')
if (lastIdx < 0) { console.log('找不到导出语句'); process.exit(1) }
let tail = s.slice(lastIdx).trim()
tail = tail.replace(/^module\.exports\s*=\s*/, '').replace(/;?\s*$/, '')

let arr
try {
  arr = JSON.parse(tail)
} catch (e) {
  console.log('JSON 解析失败:', e.message.slice(0, 100)); process.exit(1)
}

// 校验数据完整性
const eel = arr.find(x => x.f === 'EelWhip')
const wheel = arr.find(x => x.f === 'MechanicalWheelPiece')
const wings = arr.find(x => x.f === 'RainbowWings')
console.log('条目数:', arr.length)
console.log('电鳗 ob:', JSON.stringify(eel && eel.ob))
console.log('机械车轮片 ob:', JSON.stringify(wheel && wheel.ob))
console.log('女皇之翼 ob:', JSON.stringify(wings && wings.ob))
if (!eel || eel.ob !== '由 猪龙鱼公爵 掉落（七选一 14.29%）') {
  console.log('电鳗修复缺失，中止'); process.exit(1)
}

fs.writeFileSync(p, '// 自动生成：全物品图鉴数据卷 3（勿手改）\nmodule.exports=' + JSON.stringify(arr) + ';')
console.log('已重建 data-v3.js')
// 复核
const v3 = require('../' + p)
console.log('复核: 条目数', v3.length, '| 电鳗 ob:', v3.find(x => x.f === 'EelWhip').ob)
