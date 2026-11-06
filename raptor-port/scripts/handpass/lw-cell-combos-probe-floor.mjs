// [LW-CELL-COMBOS] probe (6 Nov 26): a whole day beside a half (his D1727 — the half over its own half of the whole) — where
// the whole day's letters stand, and whether the half's box covers them. Lays the BUILT cell's markup (MatrixRows `pairLook`)
// into a real grid cell, as lw-cell-combos-measure.mjs does, for each kind pair; prints each box's rect, its letters' rect and
// what is drawn at the letters' centre. SIZE=desk|phone, LW_DIST=<build>.
process.env.LW_OUT ||= '2026-11-06-lw-cell-combos/probe'
const L = await import('./lw-rr-lib.mjs')
const SIZE = process.env.SIZE || 'desk'
console.log('[lw-cell-combos-probe-floor v1]', SIZE, L.DIST)
const w = await L.newWorld(SIZE)
await L.signInSaved(w, 'admin'); await L.toWar(w); await L.openGrid(w)
const P = w.page
const cellId = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="cell-"]')].find(td => !td.textContent.trim() && td.getBoundingClientRect().width > 0)?.dataset.testid)
const CASES = [
  ['OD + HO morning', 'act hasc', '<span class="c k-oil s-a top bx-roof bx-am">HO</span><span class="c k-od s-a whole bx-floor bx-lo raptor">OD</span>'],
  ['OD + HO afternoon', 'act hasc', '<span class="c k-od s-a whole bx-floor bx-hi raptor">OD</span><span class="c k-oil s-a bot bx-roof bx-pm">HO</span>'],
  ['LL + OTH morning', 'act hasc', '<span class="c k-ll s-a whole bx-floor bx-lo">LL</span><span class="c k-unav s-a top bx-roof bx-am raptor">OTH</span>'],
  ['LL + HO afternoon', 'act hasc', '<span class="c k-ll s-a whole bx-floor bx-hi">LL</span><span class="c k-oil s-a bot bx-roof bx-pm">HO</span>'],
]
for (const [name, td, html] of CASES) {
  const r = await P.evaluate(([id, td, html]) => {
    const c = document.querySelector(`[data-testid="${id}"]`)
    c.className = td; c.innerHTML = html
    return [...c.querySelectorAll('.c')].map(e => {
      const b = e.getBoundingClientRect(), rg = document.createRange(); rg.selectNodeContents(e); const t = rg.getBoundingClientRect(), cs = getComputedStyle(e)
      const mid = document.elementFromPoint(t.left + t.width / 2, t.top + t.height / 2)
      return `${e.textContent}: box ${b.top.toFixed(1)}–${b.bottom.toFixed(1)} letters ${t.top.toFixed(1)}–${t.bottom.toFixed(1)} display ${cs.display} align ${cs.alignItems} z ${cs.zIndex} · at the letters' centre: ${mid === e ? 'ITSELF' : (mid?.textContent || mid?.tagName)}`
    })
  }, [cellId, td, html])
  console.log(name, '\n  ' + r.join('\n  '))
}
await L.closeBrowser()
