// 用 huijiwiki 搜索 API（node fetch + encodeURIComponent）定位每个 Boss 的准确页面 URL
const TARGETS = [
  ["cal_brimstone", "硫磺火元素", ["Brimstone Elemental"]],
  ["cal_calamitas_clone", "灾厄之眼", ["Calamitas Clone"]],
  ["cal_leviathan", "阿娜希塔和利维坦", ["Leviathan and Anahita", "利维坦"]],
  ["cal_pbg", "瘟疫使者歌莉娅", ["The Plaguebringer Goliath", "瘟疫使者"]],
  ["cal_ravager", "毁灭魔像", ["Ravager", "毁灭魔像"]],
  ["cal_astrum_deus", "星神游龙", ["Astrum Deus", "星神游龙"]],
  ["cal_profaned_guardians", "亵渎守卫", ["Profaned Guardians", "亵渎守卫"]],
  ["cal_dragonfolly", "痴愚金龙", ["Dragonfolly", "痴愚金龙"]],
  ["cal_providence", "亵渎天神", ["Providence", "亵渎天神"]],
  ["cal_storm_weaver", "风暴编织者", ["Storm Weaver", "风暴编织者"]],
  ["cal_ceaseless_void", "无尽虚空", ["Ceaseless Void", "无尽虚空"]],
  ["cal_signus", "神之使徒西格纳斯", ["Signus", "神之使徒西格纳斯"]],
  ["cal_polterghast", "噬魂幽花", ["Polterghast", "噬魂幽花"]],
  ["cal_old_duke", "硫海遗爵", ["The Old Duke", "硫海遗爵"]],
  ["cal_devourer", "神明吞噬者", ["The Devourer of Gods", "神明吞噬者"]],
  ["cal_yharon", "丛林龙", ["Yharon", "丛林龙"]],
  ["cal_exo_mechs", "星流巨械", ["Exo Mechs", "星流巨械"]],
  ["cal_supreme_calamitas", "至尊灾厄", ["Supreme Calamitas", "至尊灾厄"]]
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function search (query) {
  const url = "https://calamity.huijiwiki.com/api.php?action=query&format=json&formatversion=2&list=search&srlimit=6&srsearch=" + encodeURIComponent(query)
  const r = await fetch(url, {
    headers: { "User-Agent": "terraria-miniapp-dev/1.0" },
    signal: AbortSignal.timeout(20000)
  })
  const j = await r.json()
  return (j.query && j.query.search || []).map(x => x.title)
}

;(async () => {
  for (const [id, cn, cands] of TARGETS) {
    let titles = []
    for (const q of cands) {
      try {
        titles = await search(q)
        if (titles.length) break
      } catch (e) {
        titles = ["ERR: " + e.message.slice(0, 50)]
      }
      await sleep(200)
    }
    const pick = titles.find(t => t && t.indexOf("消歧义") < 0) || titles[0] || "未找到"
    console.log(id + " → https://calamity.huijiwiki.com/wiki/" + encodeURIComponent(pick.replace(/ /g, "_")))
    await sleep(150)
  }
})()
