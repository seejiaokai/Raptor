// THE JOINED BAR'S STYLE, READ IN THE PAGE (the M3 build's FULL check, W1's find): which rules set a joined box's edges and
// look, and which wins. Usage (from raptor-port/, a preview served): node scripts/handpass/lw-m3b-joincss.mjs [LW_PORT=4180]
process.env.LW_PORT ||= '4180'
process.env.LW_OUT ||= '2026-10-25-lw-m3-build/host'
const L = await import('./lw-r3-lib.mjs')
console.log('lw-m3b-joincss v1')
const w = await L.newCtx('desk'); const P = w.page
await L.signInPlain(w, 'admin')
const who = await P.evaluate(() => Object.entries(window.PEOPLE).find(([, v]) => v.cs === 'Drifter')[0])
/* a three-day LL bid run through the drag window: Mon 2 – Wed 4 Nov */
await L.reachCell(w, who, '2026-11-02')
const r = await P.evaluate(({ who }) => {
  const out = {}
  for (const d of ['2026-11-02', '2026-11-03', '2026-11-04']) window.lwSetCell?.(who, d, 'LL')
  return out
}, { who })
await P.waitForTimeout(800)
const info = await P.evaluate(({ who }) => {
  const res = []
  for (const d of ['2026-11-02', '2026-11-03', '2026-11-04']) {
    const c = document.querySelector(`[data-testid="cell-${who}-${d}"] .c`)
    if (!c) { res.push({ d, none: true }); continue }
    const cs = getComputedStyle(c)
    const rules = []
    for (const sh of document.styleSheets) {
      let list; try { list = sh.cssRules } catch { continue }
      const walk = (rs) => { for (const ru of rs) { if (ru.cssRules && !ru.selectorText) { walk(ru.cssRules); continue } if (!ru.selectorText) continue; try { if (c.matches(ru.selectorText) && /(^|;)\s*(left|right|inset|border-radius|border-top-right-radius|color|box-shadow)\s*:/.test(ru.style.cssText)) rules.push(ru.selectorText.slice(0, 160) + ' { ' + ru.style.cssText.slice(0, 140) + ' }') } catch {} } }
      walk(list)
    }
    res.push({ d, cls: c.className, left: cs.left, right: cs.right, rad: cs.borderTopRightRadius, color: cs.color, shadow: cs.boxShadow.slice(0, 80), rules })
  }
  return res
}, { who })
console.log(JSON.stringify(info, null, 1))
await L.closeBrowser()
