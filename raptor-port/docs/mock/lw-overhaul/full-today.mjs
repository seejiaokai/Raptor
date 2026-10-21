// TODAY's pictures for the full mock-up, from the staged state (run full-stage.mjs and full-stage2.mjs first).
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, q, esc, errs, OUT } from './full-lib.mjs'
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))
export const toDay = (p, id, inline = 'center') => p.evaluate(([id, inline]) => { const e = document.querySelector(`[data-testid="${id}"]`); e?.scrollIntoView({ block: 'nearest', inline }); window.scrollTo(0, 0) }, [id, inline])
// the grid's own horizontal scroller, set so a date sits just right of the frozen columns
export const gridTo = async (p, date, row = 'bane') => {
  // the app's own month button first (it jumps the window there), then a wheel turn over the grid until the date sits
  // just right of the frozen columns — the way a person scrolls, so the window engine draws as it would for him
  const mon = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][+date.slice(5, 7) - 1]
  await p.locator(`button:text-is("${mon}")`).first().click(); await p.waitForTimeout(700)
  let d = 999
  for (let i = 0; i < 8 && Math.abs(d) > 3; i++) {
    const m = await p.evaluate(([date, row]) => {
      const c = document.querySelector(`[data-testid="cell-${row}-${date}"]`); if (!c) return null
      const frozen = [...c.parentElement.children].filter(td => getComputedStyle(td).position === 'sticky').reduce((m, td) => Math.max(m, td.getBoundingClientRect().right), 0)
      const r = c.getBoundingClientRect()
      return { d: r.left - frozen - 1, x: Math.min(innerWidth - 20, frozen + 60), y: r.top + r.height / 2 }
    }, [date, row])
    if (!m) return 'no cell'
    d = m.d; if (Math.abs(d) <= 3) break
    await p.mouse.move(m.x, m.y); await p.mouse.wheel(d, 0); await p.waitForTimeout(450)
  }
  return Math.round(d)
}

if (process.argv[1].endsWith('full-today.mjs')) {
  // desktop, admin
  let { ctx, p } = await newPage(browser, 1536, 860, false, state)
  await signIn(p, 'admin')
  console.log(await gridTo(p, '2026-01-18'))
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(400)
  await shot(p, 't-desk-admin')
  await p.evaluate(() => document.querySelector('[data-testid="row-dice"]')?.scrollIntoView({ block: 'center' })); await p.waitForTimeout(300)
  await shot(p, 't-desk-admin-busy')
  await p.click(q('cell-bane-2026-01-26')); await p.waitForTimeout(500); await shot(p, 't-desk-bid-admin'); await esc(p)
  await p.click(q('settings-open')); await p.waitForTimeout(500); await shot(p, 't-desk-settings'); await esc(p)
  await ctx.close()
  // phone, member (Ranger)
  ;({ ctx, p } = await newPage(browser, 390, 844, true, state))
  await signIn(p, 'member')
  console.log(await gridTo(p, '2026-01-19'))
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(400)
  await shot(p, 't-phone-member')
  await p.evaluate(() => { const r = document.querySelector('[data-testid="row-dice"]'); window.scrollBy(0, r.getBoundingClientRect().top - 330) }); await p.waitForTimeout(400)
  await shot(p, 't-phone-member-busy')
  await p.tap(q('person-bane')); await p.waitForTimeout(500); await shot(p, 't-phone-person'); await esc(p)
  await p.tap(q('cell-bane-2026-01-28')); await p.waitForTimeout(500); await shot(p, 't-phone-bid-member'); await esc(p)
  await p.evaluate(() => window.scrollTo(0, 0)); await p.tap(q('legend-open')); await p.waitForTimeout(500); await shot(p, 't-phone-legend'); await esc(p)
  await ctx.close(); await browser.close(); console.log('errors:', errs)
}
