// The small fixes of 30 Oct 26 — fix 4's measure (S4-3, performance.md Part 1): what one bid costs the grid on his PC's
// desktop, the whole year drawn, on the build BEFORE the month guard was widened (LW_PORT=4391) and AFTER (4392). A bid is
// written through the localhost bridge (lwSetCell — the war's own writer), then two frames are waited for: the time from
// the write to the second frame is what the person waits for the grid to settle. Twenty bids on different men and days, on
// a month's middle and on a month's edge; the median of each and the slowest are printed. Pictures are not taken.
process.env.LW_OUT ||= '2026-10-30-lw-small-fixes/perf'
const L = await import('./lw-sf-lib.mjs')
console.log('[lw-sf-perf v1] port', L.PORT)
const w = await L.newCtx('desk'); const P = w.page
await L.signIn(w, 'admin')
await L.gotoMonth(w, 'NOV'); await P.waitForTimeout(1500)
const men = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="row-"]')].map(e => e.dataset.testid.slice(4)).slice(0, 24))
async function time(who, iso, code) {
  return P.evaluate(async ([who, iso, code]) => {
    const t0 = performance.now()
    window.lwSetCell(who, iso, code)
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
    return performance.now() - t0
  }, [who, iso, code])
}
const med = a => { const s = [...a].sort((x, y) => x - y); return Math.round(s[Math.floor(s.length / 2)] * 10) / 10 }
const out = {}
for (const [label, days] of [['mid-month', ['2026-11-11', '2026-11-12', '2026-11-18', '2026-11-19', '2026-11-25']], ['month edge', ['2026-11-30', '2026-12-01', '2026-10-31', '2026-11-01', '2026-12-31']]]) {
  const ts = []
  for (let i = 0; i < 20; i++) ts.push(await time(men[i % men.length], days[i % days.length], i % 2 ? '' : 'LL'))
  out[label] = { median: med(ts), max: Math.round(Math.max(...ts)) }
}
console.log(JSON.stringify(out))
console.log('errors:', w.errs.length ? w.errs : 'none')
await L.closeBrowser()
