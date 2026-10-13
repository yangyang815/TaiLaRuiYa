const items = require('D:/小程序库/泰拉瑞亚/data/items.js');
const monsters = require('D:/小程序库/泰拉瑞亚/data/monsters.js');
const bosses = require('D:/小程序库/泰拉瑞亚/data/bosses.js');
let npc = [];
try { npc = require('D:/小程序库/泰拉瑞亚/data/npc.js'); } catch (e) { try { npc = require('D:/小程序库/泰拉瑞亚/data/npcs.js'); } catch (e2) {} }
// 同名对盘点
const monNames = new Set(monsters.map(m => m.name).concat(bosses.map(b => b.name)).concat(npc.map(n => n.name)));
const dup = [];
items.forEach(i => { if (monNames.has(i.name)) dup.push(i.name + ' (' + i.en + ', ' + i.cat + ')'); });
console.log('物品与怪物/BOSS/NPC 同名对:', dup.length);
dup.forEach(d => console.log('  ' + d));
// Wyvern 掉落数量
const fs = require('fs');
const mon2 = fs.readFileSync('D:/小程序库/泰拉瑞亚/data/monsters.js', 'utf8');
// 现有 art 资源里像龙的
const arts = fs.readdirSync('D:/小程序库/泰拉瑞亚/assets').filter(f => f.indexOf('wyv') >= 0 || f.indexOf('dragon') >= 0 || f.indexOf('m_') === 0);
console.log('assets 中 m_/wyv/dragon 相关(前20):', arts.slice(0, 20).join(', '));
