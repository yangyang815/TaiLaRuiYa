// 网络性能优化：消息中心云通道节流（2026-10-02）
// 1) 30 分钟节流窗口：非强制调用走缓存不发请求  2) 超时 6s→3s
const fs = require('fs');
const path = require('path');

// ---------- 1. utils/remote-msg.js ----------
const p = path.join(__dirname, '..', 'utils', 'remote-msg.js');
let s = fs.readFileSync(p, 'utf8');
const rep = (src, oldS, newS, tag) => {
  if (src.indexOf(newS) >= 0) { console.log(tag, '已是新版，跳过'); return src; }
  if (src.indexOf(oldS) < 0) throw new Error('未找到: ' + tag);
  return src.replace(oldS, newS);
};

s = rep(s, 'const MAX_AGE=24*3600*1e3;',
  'const MAX_AGE=24*3600*1e3;const FETCH_GAP=30*60*1e3;const FETCH_AT="terr_msg_fetch_at";', '节流常量');
s = rep(s, 'function refresh(onUpdate){const done=[];let settled=false;',
  'function refresh(onUpdate,force){try{const at=Number(wx.getStorageSync(FETCH_AT))||0;if(!force&&at&&Date.now()-at<FETCH_GAP){onUpdate&&onUpdate(currentList());return}}catch(e){}let settled=false;', 'refresh 节流短路');
s = rep(s, 'const settle=list=>{if(settled)return;settled=true;try{wx.setStorageSync(CACHE_KEY,{ts:Date.now(),list:list})}catch(e){}',
  'const settle=list=>{if(settled)return;settled=true;try{wx.setStorageSync(CACHE_KEY,{ts:Date.now(),list:list})}catch(e){}try{wx.setStorageSync(FETCH_AT,Date.now())}catch(e){}', 'settle 记录时间戳');
s = rep(s, 'settled||tryMirror(0)},6e3);', 'settled||tryMirror(0)},3e3);', '超时 3s');
fs.writeFileSync(p, s);
console.log('remote-msg.js 优化完成');

// ---------- 2. pages/messages/messages.js：强制拉新 ----------
const mp = path.join(__dirname, '..', 'pages', 'messages', 'messages.js');
let m = fs.readFileSync(mp, 'utf8');
m = rep(m, 'remoteMsg.refresh(list=>render(list))', 'remoteMsg.refresh(list=>render(list),true)', 'messages 强制拉新');
fs.writeFileSync(mp, m);
console.log('messages.js OK');
