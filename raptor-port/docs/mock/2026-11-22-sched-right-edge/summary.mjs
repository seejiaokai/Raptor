/* [SCHED-RIGHT-EDGE] — prints the drawing's measures (shots/measures.json, or built/ with MOCK_BUILT=1) one line a
   window and state, and fails if a day arrow ever lands a day anywhere but where Monday opened, or steps more or less
   than one day. Run: node docs/mock/2026-11-22-sched-right-edge/summary.mjs */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = dirname(fileURLToPath(import.meta.url))
const { errors, measures: M } = JSON.parse(readFileSync(join(HERE, process.env.MOCK_BUILT === '1' ? 'built' : 'shots', 'measures.json'), 'utf8'))
let bad = 0
for (const [tag, m] of Object.entries(M)) {
  if (tag === 'phone') { console.log('phone', JSON.stringify(m)); continue }
  for (const st of Object.keys(m).filter(k => k.endsWith('-folded-start')).map(k => k.replace('-folded-start', ''))) {
    const a = m[`${st}-folded-start`], e = m[`${st}-folded-end`], o = m[`${st}-open-start`], u = m[`${st}-under-tab`], p = m[`${st}-arrow-presses`]
    /* the place a day has with the strip at its start; every press must land its own day there. Within 1px: at 125% a
       scroll rests on a whole screen pixel, 0.8 of a page pixel, so a landing reads 19.2, 20 or 20.8 — before the change
       as after it (the first press's own landing is not the measure: it can be the 20.8, and 19.2 is then 1.6 away). */
    const home = a.days[0].left + a.weekScrollLeft
    const want = ['1', '2', '3', '4', '5', '6', '5', '4', '3', '2', '1', '0']
    const ok = p.every((x, i) => x.front === want[i] && Math.abs(x.left - home) <= 1)
    if (!ok) bad++
    const lastVis = a.days.filter(d => d.left < a.week.right).pop()
    const endLast = e.days[e.days.length - 1]
    console.log([
      tag, st, `window ${a.innerWidth} @${a.dpr}`,
      `FOLDED week ends ${a.week.right} (lane ${a.boardPadRight}, week's own end ${a.weekPadRight}); tab ${a.rail.left}-${a.rail.right} y ${a.rail.top}-${a.rail.bottom}; arrow ${a.nextArrow.left}; foot bar ends ${a.scrollBar?.right}`,
      `Monday opens at ${a.days[0].left} (the week ${a.weekScrollLeft} along), an arrow lands a day at ${home}; last day in view: day ${lastVis.day} ${lastVis.left}-${lastVis.right}`,
      `ARROWS ${ok ? 'OK' : 'WRONG'}: ${p.map(x => x.front + '@' + x.left).join(' ')}`,
      `under the tab: ${u.underTheTab.length ? u.underTheTab.join(' ; ') : 'nothing'} (strip shown beside/under it: ${u.shownInItsColumnPx}px)`,
      `FAR END last column ends ${endLast.right}, ${(a.innerWidth - endLast.right).toFixed(1)} from the window's edge`,
      `OPEN week ends ${o.week.right}, lane ${o.boardPadRight}, tab ${o.rail.left}`,
    ].join(' | '))
  }
}
console.log('page errors:', errors.length, '· arrow faults:', bad)
process.exit(bad || errors.length ? 1 : 0)
