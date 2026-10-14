import * as F from './fx.mjs'
const { L } = F
console.log('w1 c8 v1')
L.SIZES.p360 = { w: 360, h: 740, dpr: 3, phone: true }
L.SIZES.p430 = { w: 430, h: 932, dpr: 3, phone: true }
const ok = (id, expected, saw, pass) => L.row('W1', id, expected, typeof saw === 'string' ? saw : JSON.stringify(saw), pass ? 'PASS' : 'FAIL')
for (const key of ['p360', 'p430']) {
  const w = await L.world(key)
  const p = w.page
  try {
    const fx = await F.c6Fixture(w)
    await w.press('[data-testid="clash-line"]'); await L.sleep(400)
    await p.evaluate(() => window.clearToast && window.clearToast()); await L.sleep(200)
    const n = await F.readNote(p)
    const set = k => [...new Set(n.rows.map(r => r[k]))]
    const info = { size: `${w.S.w}x${w.S.h}`, noteW: n.w, vw: n.vw, cls: n.cls, expanded: n.expanded, rows: n.rows.length, whoL: set('whoL'), dayL: set('dayL'), doR: set('doR'), dayLines: n.rows.map(r => r.dayLines), nameCut: n.rows.map(r => r.nameCut), filtersH: n.filtersH, baselineFiltersH: fx.baseline.filtersH, overflowX: n.overflowX, baselineOverflow: fx.baseline.overflowX, words: n.rows.map(r => [r.who, r.day, r.go, r.what]) }
    console.log(key, JSON.stringify(info))
    ok(`C8 ${w.S.w}x${w.S.h}`, 'note full width; names at one edge, days at one edge, instructions end at one edge; each day on one line; second line of buttons keeps its height; no sideways scroll', info,
      n.rows.length === 2 && n.expanded === 'true' && n.w === n.vw && info.whoL.length === 1 && info.dayL.length === 1 && info.doR.length === 1 && info.dayLines.every(x => x === 1) && n.filtersH === fx.baseline.filtersH && !n.overflowX)
    await L.pic(w, `c8-${w.S.w}x${w.S.h}-open`)
  } finally { await L.close(w) }
}
