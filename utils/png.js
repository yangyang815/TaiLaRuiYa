// 纯 JS PNG 编码器：像素字符画 → PNG base64（data URL）
// 无 Canvas、无原生组件、同步计算、内存缓存 —— 真机批量渲染性能远优于逐像素 Canvas
// 实现：调色板 PNG（color type 3）+ deflate 固定 Huffman（LZ77 贪心匹配）

/* ---------- CRC32 / adler32 ---------- */
const CRC_T = []
for (let n = 0; n < 256; n++) {
  let c = n
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
  CRC_T[n] = c >>> 0
}
function crc32 (bytes, from, to) {
  let c = 0xFFFFFFFF
  for (let i = from; i < to; i++) c = CRC_T[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8)
  return (c ^ 0xFFFFFFFF) >>> 0
}
function adler32 (bytes) {
  let a = 1, b = 0
  for (let i = 0; i < bytes.length; i++) { a = (a + bytes[i]) % 65521; b = (b + a) % 65521 }
  return ((b << 16) | a) >>> 0
}

/* ---------- base64 ---------- */
const B64C = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
function b64 (u8) {
  let s = ''
  for (let i = 0; i < u8.length; i += 3) {
    const b0 = u8[i], b1 = i + 1 < u8.length ? u8[i + 1] : 0, b2 = i + 2 < u8.length ? u8[i + 2] : 0
    s += B64C[b0 >> 2]
    s += B64C[((b0 & 3) << 4) | (b1 >> 4)]
    s += i + 1 < u8.length ? B64C[((b1 & 15) << 2) | (b2 >> 6)] : '='
    s += i + 2 < u8.length ? B64C[b2 & 63] : '='
  }
  return s
}

/* ---------- 颜色解析 '#RRGGBB' ---------- */
const HX = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, a: 10, b: 11, c: 12, d: 13, e: 14, f: 15 }
function hexRGB (h) {
  return [(HX[h[1]] << 4) | HX[h[2]], (HX[h[3]] << 4) | HX[h[4]], (HX[h[5]] << 4) | HX[h[6]]]
}

/* ---------- deflate：LZ77 + 固定 Huffman ---------- */
// length → [符号码, extra位数, extra基准]
const LEN_T = (() => {
  const t = new Array(259)
  const seg = (sym, lo, hi, eb) => { for (let l = lo; l <= hi; l++) t[l] = [sym, eb, lo] }
  seg(257, 3, 3, 0); seg(258, 4, 4, 0); seg(259, 5, 5, 0); seg(260, 6, 6, 0)
  seg(261, 7, 7, 0); seg(262, 8, 8, 0); seg(263, 9, 9, 0); seg(264, 10, 10, 0)
  seg(265, 11, 12, 1); seg(266, 13, 14, 1); seg(267, 15, 16, 1); seg(268, 17, 18, 1)
  seg(269, 19, 22, 2); seg(270, 23, 26, 2); seg(271, 27, 30, 2); seg(272, 31, 34, 2)
  seg(273, 35, 42, 3); seg(274, 43, 50, 3); seg(275, 51, 58, 3); seg(276, 59, 66, 3)
  seg(277, 67, 82, 4); seg(278, 83, 98, 4); seg(279, 99, 114, 4); seg(280, 115, 130, 4)
  seg(281, 131, 162, 5); seg(282, 163, 194, 5); seg(283, 195, 226, 5); seg(284, 227, 257, 5)
  seg(285, 258, 258, 0)
  return t
})()
// dist → [符号码(5bit), extra位数, extra基准]（zlib 官方基准表程序化生成）
const DIST_T = (() => {
  const t = []
  const bases = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769,
    1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577]
  const extras = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]
  for (let code = 0; code < 30; code++) {
    const lo = bases[code], eb = extras[code], hi = Math.min(lo + (1 << eb) - 1, 32768)
    for (let d = lo; d <= hi; d++) t[d] = [code, eb, lo]
  }
  return t
})()

// 位写入器
function BW () { this.b = []; this.acc = 0; this.n = 0 }
BW.prototype.w = function (v, n) {          // LSB first（块头 / extra bits）
  for (let i = 0; i < n; i++) {
    this.acc |= ((v >> i) & 1) << this.n
    if (++this.n === 8) { this.b.push(this.acc); this.acc = 0; this.n = 0 }
  }
}
BW.prototype.h = function (code, n) {       // MSB first（Huffman 码）
  for (let i = n - 1; i >= 0; i--) {
    this.acc |= ((code >> i) & 1) << this.n
    if (++this.n === 8) { this.b.push(this.acc); this.acc = 0; this.n = 0 }
  }
}
BW.prototype.done = function () {
  if (this.n) { this.b.push(this.acc); this.acc = 0; this.n = 0 }
  return this.b
}
// literal/长度符号码（固定 Huffman 表）
function wrSym (bw, v) {
  if (v <= 143) bw.h(0x30 + v, 8)
  else if (v <= 255) bw.h(0x190 + v - 144, 9)
  else if (v <= 279) bw.h(v - 256, 7)
  else bw.h(0xC0 + v - 280, 8)
}

// LZ77：贪心最长匹配（哈希桶 + 前向链）
const HB = 16384 // 桶数（2 的幂）
function lzTokens (raw) {
  const n = raw.length
  const head = new Int32Array(HB).fill(-1)
  const prev = new Int32Array(n).fill(-1)
  const key3 = i => ((raw[i] << 16) | (raw[i + 1] << 8) | raw[i + 2]) & (HB - 1)
  const insert = i => { const h = key3(i); prev[i] = head[h]; head[h] = i }
  const tokens = []
  let i = 0
  while (i < n) {
    let bestL = 0, bestD = 0
    if (i + 2 < n) {
      let c = head[key3(i)], tries = 0
      while (c !== -1 && i - c <= 32768 && tries < 96) {
        tries++
        if (raw[c] === raw[i] && raw[c + 1] === raw[i + 1] && raw[c + 2] === raw[i + 2]) {
          let l = 3
          const max = Math.min(258, n - i)
          while (l < max && raw[c + l] === raw[i + l]) l++
          if (l > bestL) { bestL = l; bestD = i - c; if (l >= max) break }
        }
        c = prev[c]
      }
    }
    if (bestL >= 3) {
      tokens.push([bestL, bestD])
      const end = i + bestL
      for (let j = i; j < end - 2; j++) if (j + 2 < n) insert(j)
      i = end
    } else {
      tokens.push(raw[i])
      if (i + 2 < n) insert(i)
      i++
    }
  }
  return tokens
}

function deflateFixed (raw) {
  const bw = new BW()
  bw.w(1, 1) // BFINAL=1
  bw.w(1, 2) // BTYPE=01 固定 Huffman
  const tokens = lzTokens(raw)
  for (let t = 0; t < tokens.length; t++) {
    const tk = tokens[t]
    if (typeof tk === 'number') { wrSym(bw, tk); continue }
    const lc = LEN_T[tk[0]]
    wrSym(bw, lc[0])
    if (lc[1]) bw.w(tk[0] - lc[2], lc[1])
    const dc = DIST_T[tk[1]]
    bw.h(dc[0], 5)
    if (dc[1]) bw.w(tk[1] - dc[2], dc[1])
  }
  wrSym(bw, 256) // 块结束符
  const bits = bw.done()
  const z = new Uint8Array(2 + bits.length + 4)
  z[0] = 0x78; z[1] = 0x01
  for (let i = 0; i < bits.length; i++) z[2 + i] = bits[i]
  const ad = adler32(raw)
  z[z.length - 4] = (ad >>> 24) & 255
  z[z.length - 3] = (ad >>> 16) & 255
  z[z.length - 2] = (ad >>> 8) & 255
  z[z.length - 1] = ad & 255
  return z
}

/* ---------- PNG 组装 ---------- */
function pushBE (arr, v, n) { for (let i = n - 1; i >= 0; i--) arr.push((v >>> (i * 8)) & 255) }
function chunk (bytes, type, data) {
  pushBE(bytes, data.length, 4)
  const t0 = bytes.length
  for (let i = 0; i < 4; i++) bytes.push(type.charCodeAt(i))
  for (let i = 0; i < data.length; i++) bytes.push(data[i])
  const crc = crc32(bytes, t0, bytes.length)
  pushBE(bytes, crc, 4)
}

// art: { w, h, rows:[字符串], pal:{字符:'#RRGGBB'} }，per: 整数放大倍率
function encode (art, per) {
  const w = art.w * per
  const hRows = art.rows.length
  const h = hRows * per

  // 调色板：索引 0 固定为透明
  const palRGB = [0, 0, 0]
  const palA = [0]
  const cmap = {}
  for (const ch in art.pal) {
    const rgb = hexRGB(art.pal[ch])
    cmap[ch] = palRGB.length / 3
    palRGB.push(rgb[0], rgb[1], rgb[2])
    palA.push(255)
  }

  // 逐行索引数据（filter 0 + 像素索引）
  const raw = new Uint8Array((1 + w) * h)
  let o = 0
  for (let y = 0; y < hRows; y++) {
    const row = art.rows[y]
    const line = new Uint8Array(w)
    for (let x = 0; x < art.w; x++) {
      const ch = row[x]
      const ci = ch && art.pal[ch] ? (cmap[ch] || 0) : 0
      for (let m = 0; m < per; m++) line[x * per + m] = ci
    }
    for (let m = 0; m < per; m++) { raw[o++] = 0; raw.set(line, o); o += w }
  }

  const bytes = [137, 80, 78, 71, 13, 10, 26, 10]
  const ihdr = []
  pushBE(ihdr, w, 4); pushBE(ihdr, h, 4)
  ihdr.push(8, 3, 0, 0, 0) // bitDepth 8, colorType 3 调色板, 压缩 0, 滤波 0, 隔行 0
  chunk(bytes, 'IHDR', ihdr)
  chunk(bytes, 'PLTE', palRGB)
  chunk(bytes, 'tRNS', palA)
  chunk(bytes, 'IDAT', deflateFixed(raw))
  chunk(bytes, 'IEND', [])
  return 'data:image/png;base64,' + b64(Uint8Array.from(bytes))
}

/* ---------- 对外接口（带缓存） ---------- */
const cache = new Map() // art 引用 → Map(per → dataURL)
function renderArt (art, per) {
  if (!art || !art.rows) return ''
  per = Math.max(1, Math.min(per | 0, 24))
  let perMap = cache.get(art)
  if (!perMap) { perMap = new Map(); cache.set(art, perMap) }
  let url = perMap.get(per)
  if (!url) { url = encode(art, per); perMap.set(per, url) }
  return url
}

module.exports = { renderArt, encode }
