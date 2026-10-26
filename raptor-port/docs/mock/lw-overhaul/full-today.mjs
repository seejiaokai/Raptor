// TODAY's pictures for the full mock-up, from the staged state (run full-stage.mjs and full-stage2.mjs first).
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, q, esc, errs, OUT, gridTo } from './full-lib.mjs'
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))
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
