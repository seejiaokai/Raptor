/* WALKER F — Leave War / OIL tracker / bell readers (reads only). */
import * as L from './cal-F-lib2.mjs'
export * from './cal-F-lib2.mjs'
const { sleep } = L

/** the Leave War's cell for each man on a date (text + classes), as drawn */
export async function lwCells(p, personIds, iso, { phone = false } = {}) {
  await L.go(p, 'leavewar'); await sleep(1200)
  const mon = p.locator(`[data-testid="month-${['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][+iso.slice(5, 7) - 1]}"]`)
  if (await mon.count()) { await mon.first().click(); await sleep(1200) }
  return p.evaluate(([ids, d]) => {
    const out = {}
    for (const id of ids) {
      const c = document.querySelector(`[data-testid="cell-${id}-${d}"]`)
      out[(window.PEOPLE[id] || {}).cs || id] = c ? { text: (c.innerText || '').trim(), cls: c.className.slice(0, 80) } : 'NO CELL DRAWN'
    }
    return out
  }, [personIds, iso])
}
/** the OIL tracker's row for each man: balance and the row's own words */
export async function oilRows(p, personIds) {
  await L.go(p, 'leavewar'); await sleep(900)
  const btn = p.locator('[data-testid="oil-tracker"]')
  await btn.first().click(); await sleep(1200)
  const out = await p.evaluate(ids => {
    const o = {}
    for (const id of ids) {
      const r = document.querySelector(`[data-testid="oil-row-${id}"]`)
      const bal = document.querySelector(`[data-testid="oil-bal-${id}"]`)
      o[(window.PEOPLE[id] || {}).cs || id] = r ? { bal: bal ? bal.innerText.trim() : null, text: r.innerText.replace(/\s+/g, ' ').slice(0, 220) } : 'NO ROW'
    }
    return o
  }, personIds)
  return out
}
export async function closeOil(p) { const x = p.locator('[data-testid="oil-close"]'); if (await x.count()) { await x.first().click(); await sleep(400) } }
/** be person `id` (a member) in place — the world keeps its Undo steps */
export async function be(p, id, role = 'member') { await p.evaluate(([i, r]) => { window.raptorMe(i); window.raptorRole(r) }, [id, role]); await sleep(600) }
export const bellState = p => p.evaluate(() => { const b = document.getElementById('notifyBell') || document.getElementById('sbBell'); return b ? { cls: b.className, on: b.classList.contains('on') } : null })
