const fs = require('fs')
const files = ['pkgA-tool/pages/fishing/fishing.js', 'pkgB-guide/pages/guide/guide.js', 'pkgA-tool/pages/dps/dps.js']
files.forEach(f => {
  const s = fs.readFileSync(f, 'utf8')
  let i = -1, c = 0
  while ((i = s.indexOf('theme-light', i + 1)) >= 0 && c < 3) {
    c++
    console.log('## ' + f + ' @' + i)
    console.log(JSON.stringify(s.slice(Math.max(0, i - 130), i + 60)))
  }
})
