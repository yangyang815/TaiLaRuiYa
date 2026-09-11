// craft.js 合并逻辑替换：_mergeWiki 改为装载静态配方索引
const fs = require('fs')
let s = fs.readFileSync(__dirname + '/../pages/craft/craft.js', 'utf8')
// 1) 新增 recipeIndex 装载器
if (!s.includes('function recipeIndex(')) {
  s = s.replace('function idxRecEn(en){',
    'let _idxP=null;function recipeIndex(){if(!_idxP){try{_idxP=require.async("../../pkg-recipe/data/recipe-index.js").catch(e=>{console.warn("[合成] 配方索引装载失败",e);return null})}catch(e){console.warn("[合成] 配方索引装载失败",e);_idxP=Promise.resolve(null)}}return _idxP}function idxRecEn(en){')
}
// 2) 替换 _mergeWiki 实现
const start = s.indexOf('_mergeWiki(){')
const endMark = s.indexOf(',onRecipeTap(e){')
if (start < 0 || endMark < 0 || endMark <= start) { console.log('定位失败', start, endMark); process.exit(1) }
const NEW = '_mergeWiki(){recipeIndex().then(idx=>{if(!idx||!idx.length){console.warn("[合成] 配方索引不可用，筛选列表保持内置配方");return}this._recipes=idx.map(r=>({rid:r.src==="b"?r.id:r.en,wiki:r.src==="w",name:r.n,artId:r.art,sprite:r.spr,station:"",stationName:r.st||"",cat:r.cat,catLabel:r.cl||""}));const cnt={},inG=[],rest=[],seen={};this._recipes.forEach(r=>{if(!r.cat||seen[r.cat])return;seen[r.cat]=1;const gi=catGroups.GROUPS.findIndex(g=>g.k===r.cat);(gi<0?rest:inG).push({k:r.cat,n:r.catLabel||r.cat,gi:gi<0?99:gi})});this._recipes.forEach(r=>{if(r.cat)cnt[r.cat]=(cnt[r.cat]||0)+1});inG.sort((a,b)=>a.gi-b.gi);rest.sort((a,b)=>(cnt[b.k]||0)-(cnt[a.k]||0));const chips=[{k:"",n:"全部"}].concat(inG).concat(rest);this._idxDone=true;this.setData({catChips:chips});this.applyFilterRecipes();console.log("[合成] 配方筛选装载:",this._recipes.length,"条")}).catch(e=>console.warn("[合成] 配方索引异常",e))}'
s = s.slice(0, start) + NEW + s.slice(endMark)
// 3) onShow 增加重试（索引未装载完成时再次尝试）
s = s.replace('onShow(){if(typeof this.getTabBar==="function"&&this.getTabBar())this.getTabBar().init(2);const app=getApp();',
  'onShow(){if(typeof this.getTabBar==="function"&&this.getTabBar())this.getTabBar().init(2);const app=getApp();if(!this._idxDone)this._mergeWiki();')
fs.writeFileSync(__dirname + '/../pages/craft/craft.js', s)
console.log('patched')
