import { readFileSync } from 'node:fs'
const D = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-11-13-approvals-scroll-pc/walker/'
const a = JSON.parse(readFileSync(D + 'appr-a-w10-after-data.json', 'utf8')), b = JSON.parse(readFileSync(D + 'appr-a-w10-before-data.json', 'utf8'))
let maxd = 0, worstA = 0, worstB = 0, n = 0; const diffs = []; const tags = new Set(); const cols = new Set()
for (const st of Object.keys(a)) for (const k of new Set([...Object.keys(a[st]), ...Object.keys(b[st] || {})])) {
  const x = a[st][k], y = (b[st] || {})[k]
  const [col, side, tag] = k.split('|'); tags.add(tag); cols.add(col)
  if (x === undefined || y === undefined) { diffs.push(`${st} ${k}: after ${x} before ${y}`); continue }
  n++; maxd = Math.max(maxd, Math.abs(x - y)); worstA = Math.max(worstA, Math.abs(x)); worstB = Math.max(worstB, Math.abs(y))
  if (Math.abs(x - y) > 1) diffs.push(`${st} ${k}: after ${x} before ${y}`)
}
console.log(JSON.stringify({ compared: n, maxAfterMinusBefore: maxd, worstGapAfter: worstA, worstGapBefore: worstB, columns: [...cols], tags: [...tags], diffs }))
