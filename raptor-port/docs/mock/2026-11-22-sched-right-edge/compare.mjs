/* [SCHED-RIGHT-EDGE] — the built screen beside the drawing he approved (D1494's purpose, for a pure-style change drawn
   with the exact rule built): every measure the drawing recorded for "proposed" (shots/measures.json) against the same
   measure of the built app (built/measures.json, from MOCK_BUILT=1 draw.mjs), at every window width, to 1px — the
   0.8px rest of a 125% screen is not a difference. One difference is expected and named: the week now OPENS with its
   strip at its start (D2295), where the drawing's build opened 20px along; every place measured at the opening is
   therefore compared after taking that 20px off. Prints each difference; exits 1 on any.
   Run: node docs/mock/2026-11-22-sched-right-edge/compare.mjs */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = dirname(fileURLToPath(import.meta.url))
const D = JSON.parse(readFileSync(join(HERE, 'shots', 'measures.json'), 'utf8')).measures
const B = JSON.parse(readFileSync(join(HERE, 'built', 'measures.json'), 'utf8')).measures
const diffs = []
let checked = 0
const near = (a, b) => Math.abs(a - b) <= 1
const cmp = (where, a, b) => { checked++; if (a == null && b == null) return; if (a == null || b == null || !near(a, b)) diffs.push(`${where}: drawn ${a}, built ${b}`) }
for (const tag of Object.keys(D)) {
  if (tag === 'phone') {
    for (const k of ['weekRight', 'dayLeft', 'dayRight', 'tabLeft', 'tabRight']) cmp(`phone ${k}`, D.phone.proposed[k], B.phone.built[k])
    continue
  }
  for (const state of ['folded-start', 'folded-end', 'open-start']) {
    const d = D[tag]['proposed-' + state], b = B[tag]['built-' + state]
    const shift = b.weekScrollLeft - d.weekScrollLeft   // 0, or -20 where the page opens (D2295)
    if (state !== 'folded-end' && !near(shift, -20)) diffs.push(`${tag} ${state}: the opening moved by ${shift}, not the 20 D2295 takes off`)
    for (const part of ['board', 'week', 'rail', 'nextArrow', 'scrollBar']) for (const side of ['left', 'right', 'top', 'bottom'])
      cmp(`${tag} ${state} ${part}.${side}`, d[part]?.[side], b[part]?.[side])
    cmp(`${tag} ${state} lane`, parseFloat(d.boardPadRight), parseFloat(b.boardPadRight))
    cmp(`${tag} ${state} week's own end`, parseFloat(d.weekPadRight), parseFloat(b.weekPadRight))
    d.days.forEach((x, i) => { cmp(`${tag} ${state} day ${x.day} left`, x.left - shift, b.days[i].left); cmp(`${tag} ${state} day ${x.day} width`, x.width, b.days[i].width) })
  }
  const dp = D[tag]['proposed-arrow-presses'], bp = B[tag]['built-arrow-presses']
  dp.forEach((x, i) => { checked++; if (x.front !== bp[i].front || !(Math.abs(x.left - bp[i].left) <= 1.7)) diffs.push(`${tag} press ${i + 1}: drawn day ${x.front} at ${x.left}, built day ${bp[i].front} at ${bp[i].left}`) })
}
console.log(`${checked} measures compared at ${Object.keys(D).length - 1} window widths and the phone · ${diffs.length} difference(s)`)
for (const x of diffs.slice(0, 40)) console.log('  -', x)
process.exit(diffs.length ? 1 : 0)
