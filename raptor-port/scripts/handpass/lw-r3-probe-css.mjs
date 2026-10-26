// Round 3's check: the computed layout of the row under the leaves (the ⋯'s row)
import * as L from './lw-r3-lib.mjs'
const w = await L.newCtx('desk'); const P = w.page
await L.signInPlain(w, 'admin')
await L.openCellR(w, 'slipway', '2026-06-15')
console.log(JSON.stringify(await P.evaluate(() => {
  const row = document.querySelector('[data-testid="bid-extra-row"]'); const wrap = row.querySelector('.bp-more-wrap'); const more = row.querySelector('.bp-more')
  const cs = getComputedStyle(row), cw = getComputedStyle(wrap), cm = getComputedStyle(more)
  const rules = []; for (const ss of document.styleSheets) { let rs; try { rs = ss.cssRules } catch { continue } for (const r of rs) if (r.selectorText && (row.matches(r.selectorText) || wrap.matches(r.selectorText) || more.matches(r.selectorText))) rules.push(r.cssText.slice(0, 160)) }
  return { row: [cs.display, cs.gridTemplateColumns, row.getBoundingClientRect().width], wrap: [cw.display, cw.gridColumnStart, cw.width], more: [cm.width, cm.flex], parent: row.parentElement.className, rules }
}), null, 1))
await L.closeBrowser()
