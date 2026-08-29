// 钓鱼助手逻辑：今日推荐 / 渔夫任务 / 图鉴搜索 / 收集进度
const F = require('../data/fishing')
const store = require('./store')

// 鱼分类清单（打勾进度用）
const ALL_FISH = []
F.QUEST_FISH.forEach(f => ALL_FISH.push({ ...f, kind: 'quest' }))
F.FOOD_FISH.forEach(f => ALL_FISH.push({ ...f, kind: 'food' }))

const KIND_N = { quest: '任务鱼', food: '可钓获' }

/**
 * 今日推荐
 * @param hour 0-23（游戏外现实时间，仅用于展示建议）
 * @param rain 是否下雨（用户手动切换）
 */
function today (hour, rain) {
  const isNight = hour >= 19 || hour < 5
  const time = isNight ? 'night' : 'day'
  // 当前时间+天气下可钓的鱼
  const available = ALL_FISH.filter(f =>
    (f.time === 'any' || f.time === time) &&
    (f.weather === 'any' || (f.weather === 'rain' && rain))
  )
  return {
    timeN: isNight ? '夜晚' : '白天',
    rain,
    fishes: available.map(f => ({
      id: f.id, name: f.name, biomeN: F.BIOME_N[f.biome] || f.biome, kind: f.kind, note: f.note
    })),
    total: available.length
  }
}

/**
 * 渔夫今日任务（按日期轮换，一天一个）
 * 每日 0 点切换；任务鱼 33 条循环
 */
function dailyQuest (dateKey) {
  const list = F.QUEST_FISH
  const seed = hash(dateKey)
  const fish = list[seed % list.length]
  return {
    ...fish,
    biomeN: F.BIOME_N[fish.biome] || fish.biome,
    timeN: F.TIME_N[fish.time] || fish.time,
    weatherN: F.WEATHER_N[fish.weather] || fish.weather
  }
}

// 简单字符串哈希
function hash (s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

/**
 * 图鉴列表（含打勾状态）
 */
function guide (done) {
  return ALL_FISH.map(f => ({
    id: f.id, name: f.name, en: f.en || '',
    biomeN: F.BIOME_N[f.biome] || f.biome,
    timeN: F.TIME_N[f.time] || f.time,
    weatherN: f.weather === 'rain' ? '雨天' : '任意',
    kind: f.kind, kindN: KIND_N[f.kind],
    power: f.power || 0, note: f.note || '',
    reward: f.reward || '',
    done: done.indexOf(f.id) >= 0
  }))
}

/**
 * 模糊搜索（名称/英文/地形）
 */
function search (kw) {
  if (!kw) return []
  const k = kw.toLowerCase()
  return ALL_FISH.filter(f =>
    f.name.indexOf(kw) >= 0 ||
    (f.en || '').toLowerCase().indexOf(k) >= 0 ||
    (F.BIOME_N[f.biome] || '').indexOf(kw) >= 0
  ).map(f => ({
    id: f.id, name: f.name, biomeN: F.BIOME_N[f.biome] || f.biome,
    timeN: F.TIME_N[f.time] || f.time, note: f.note, kind: f.kind
  }))
}

/**
 * 收集进度统计
 */
function progress (done) {
  const doneSet = new Set(done)
  const questDone = F.QUEST_FISH.filter(f => doneSet.has(f.id)).length
  const foodDone = F.FOOD_FISH.filter(f => doneSet.has(f.id)).length
  return {
    questDone, questTotal: F.QUEST_FISH.length,
    foodDone, foodTotal: F.FOOD_FISH.length,
    total: ALL_FISH.length, done: questDone + foodDone,
    pct: Math.round((questDone + foodDone) / ALL_FISH.length * 100)
  }
}

module.exports = { today, dailyQuest, guide, search, progress, KIND_N, ALL_FISH }
