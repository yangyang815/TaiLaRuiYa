// 修补獾帽与0x33墨镜的内部名解析
const fs = require('fs')
let src = fs.readFileSync('data/bosses.js', 'utf8')
const o1 = '{id:"",name:"獾帽",rate:"100%（与血肉墙同一天击败）"}'
const n1 = '{id:"cat:BadgersHat",name:"Badger的帽子",rate:"100%（与血肉墙同一天击败）"}'
if (src.includes(o1)) { src = src.replace(o1, n1); console.log('獾帽 OK') } else console.log('獾帽 未匹配')
const o2 = '{id:"",name:"0x33的墨镜",rate:"100%（大师）"}'
const n2 = '{id:"cat:AviatorSunglasses",name:"0x33的飞行员风镜",rate:"100%（大师）"}'
if (src.includes(o2)) { src = src.replace(o2, n2); console.log('墨镜 OK') } else console.log('墨镜 未匹配')
fs.writeFileSync('data/bosses.js', src)
