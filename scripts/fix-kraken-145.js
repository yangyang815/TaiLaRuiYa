// 克拉肯球按官方 1.4.5.7 数据还原修正
const fs = require('fs')

// 1. items.js
let it = fs.readFileSync('data/items.js', 'utf8')
const oK = '{id:"kraken",name:"克拉肯球",en:"Kraken",cat:"weapon",sub:"melee",rarity:8,art:"kraken",stats:[["伤害","95"],["暴击率","14%"],["持续时间","无限"]],desc:"深海巨妖的化身，出线如触手般横扫地牢。",obtain:"击败世纪之花后，地牢内任意敌怪 0.25% 掉落",use:"后期悠悠球主力，无需悠悠球袋即可无限悬停。"}'
const nK = '{id:"kraken",name:"克拉肯球",en:"Kraken",cat:"weapon",sub:"melee",rarity:8,art:"kraken",stats:[["伤害","120"],["暴击率","14%"],["持续时间","无限"]],desc:"深海巨妖的化身，缠绕漩涡大幅扩大攻击范围，每第 4 次命中释放三重穿透巨浪。",obtain:"猪龙鱼公爵 14.29%（七选一武器池）掉落",use:"后期悠悠球主力，无需悠悠球袋即可无限悬停。"}'
if (it.includes(oK)) { it = it.replace(oK, nK); fs.writeFileSync('data/items.js', it); console.log('items.js kraken OK') } else console.log('items.js kraken 未匹配!')

// 2. drops.json 还原
let s = fs.readFileSync('scripts/catalog-stage/drops.json', 'utf8')
const oD = '"Kraken":[{"by":"Dungeon enemies (post-Plantera)","rate":"0.25%"}]'
const nD = '"Kraken":[{"by":"Duke Fishron","rate":"14.29%"},{"by":"Duke Fishron","rate":"14.29%"}]'
if (s.includes(oD)) { s = s.replace(oD, nD); fs.writeFileSync('scripts/catalog-stage/drops.json', s); console.log('drops.json OK') } else console.log('drops.json 未匹配!')

// 3. zhdetail tooltip 还原
let z = fs.readFileSync('scripts/catalog-stage/zhdetail.json', 'utf8')
const oZ = '"Kraken":{"n":"Kraken","t":"","b":""'
const nZ = '"Kraken":{"n":"Kraken","t":"蕴含深海能量命中时为强力巨浪充能","b":""'
if (z.includes(oZ)) { z = z.replace(oZ, nZ); fs.writeFileSync('scripts/catalog-stage/zhdetail.json', z); console.log('zhdetail OK') } else console.log('zhdetail 未匹配!')

// 4. data-v3.js 还原
let v = fs.readFileSync('pkg-cat-3/data/data-v3.js', 'utf8')
const oV = '{"n":"克拉肯球","en":"Kraken","f":"Kraken","c":"悠悠球","d":"95","dt":"近战","df":"","r":8,"u":"25","k":"4.3","t":"","b":"","s":"售价 11金","ob":"击败世纪之花后由地牢内任意敌怪掉落（0.25%）","use":"","hm":0}'
const nV = '{"n":"克拉肯球","en":"Kraken","f":"Kraken","c":"悠悠球","d":"120","dt":"近战","df":"","r":8,"u":"25","k":"4.3","t":"蕴含深海能量命中时为强力巨浪充能","b":"","s":"售价 11金","ob":"由 猪龙鱼公爵 掉落","use":"","hm":0}'
if (v.includes(oV)) { v = v.replace(oV, nV); fs.writeFileSync('pkg-cat-3/data/data-v3.js', v); console.log('data-v3 OK') } else console.log('data-v3 未匹配!')

// 5. build-catalog.js 移除过时映射
let b = fs.readFileSync('scripts/build-catalog.js', 'utf8')
const oB = "          const DROPBY_ZH = { 'Dungeon enemies (post-Plantera)': '地牢敌怪（世纪之花后）' }\n"
if (b.includes(oB)) { b = b.replace(oB, ''); fs.writeFileSync('scripts/build-catalog.js', b); console.log('build-catalog OK') } else console.log('build-catalog 未匹配（可能已移除）')
