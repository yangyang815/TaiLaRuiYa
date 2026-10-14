/** 特殊种子数据 wiki 核对补丁（幂等） */
const fs = require('fs');
const R = p => 'D:/小程序库/泰拉瑞亚/' + p;

let s = fs.readFileSync(R('data/seeds.js'), 'utf8');
const prefix = s.slice(0, s.indexOf('['));
const arr = JSON.parse(s.slice(s.indexOf('[')).replace(/;\s*$/, ''));
const stats = { added: 0, fixed: 0 };

// 1. 新增 Beam me up（wiki 1.4.5.0 秘密种子，第 37 条）
if (!arr.find(i => i.id === 'seed_beammeup')) {
  arr.push({
    id: 'seed_beammeup',
    name: '传送网络世界',
    en: 'Beam me up',
    code: 'beam me up',
    tag: '地下传送网',
    diff: 1,
    ver: '1.4.5.0',
    group: 'casual',
    art: 'teleporter',
    color: '#4FD1C5',
    desc: '名字来自《星际迷航》的经典台词"Beam me up, Scotty"（把我传上去，斯科蒂）。这个世界会在地下洞穴各处生成成对的传送机——踩上压力板，嗖的一下就跨越大半个地图，洞穴探险再也不用走回头路。',
    mechanics: [
      '地下洞穴中散布成对的传送机（Teleporter），顶部放置蓝色压力板',
      '传送机之间用不同颜色的电线连接，踩上压力板即触发传送',
      '1.4.5.7 修复了早期版本传送机生成过少的问题',
    ],
    tips: [
      '看到彩色电线就顺着找另一端，通常通往大片未探索的洞穴',
      '传送是双向的，进出矿道前先记下线路颜色，避免迷路',
      '配合洞穴探险类成就与发光 decals 收集，效率翻倍',
    ],
  });
  stats.added++;
}

// 2. care bears 代码修正（wiki 原文 the care bears movie）
const cb = arr.find(i => i.id === 'seed_carebears');
if (cb && cb.code === 'the carebears movie') { cb.code = 'the care bears movie'; stats.fixed++; }

// 3. The Constant 补官方代码变体（wiki: constant / the constant / eye 4 an eye / eye for an eye）
const con = arr.find(i => i.id === 'seed_constant');
if (con && con.code === 'constant') {
  con.code = 'constant / the constant / eye 4 an eye / eye for an eye';
  if (!/eye 4 an eye/.test(con.desc)) {
    con.desc += '输入 eye 4 an eye 或 eye for an eye 也能激活——这是致敬 1.4.3 联动补丁"An Eye For An Eye"（以眼还眼）的彩蛋代码。';
  }
  stats.fixed++;
}

// 4. 别挖地/终极世界代码对齐 wiki 原文（空格无关，仅展示规范化）
const ddu = arr.find(i => i.id === 'seed_dontdigup');
if (ddu && ddu.code === 'dontdigup') { ddu.code = 'dont dig up'; stats.fixed++; }
const zen = arr.find(i => i.id === 'seed_zenith');
if (zen && zen.code === 'getfixedboi') { zen.code = 'get fixed boi'; stats.fixed++; }

fs.writeFileSync(R('data/seeds.js'), prefix + JSON.stringify(arr) + ';');
console.log('补丁完成: 新增', stats.added, '修正', stats.fixed, '| 总条数:', arr.length);
