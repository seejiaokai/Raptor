// Re-walk R2, a probe: does a pick made WHILE the Leave War is open move the war to the squadron picked? Saber (master
// admin), desktop. (a) From View-only Sched pick 149, open Leave War → Approvals; then pick 142 with Approvals open — wait,
// read; press Grid — read the rows; leave for View-only Sched and come back. (b) The same on the Grid tab, 142 → 149.
// Reads only; every change is a press.
import { serve, stop, newPage, signIn, pick, note, save, errs, facts } from '../walk/lib.mjs'
import { navTo } from '../walk/w1-view.mjs'
import { step, press, shot, vis, text } from './rlib.mjs'

const SZ = process.env.SZ || 'd'
const T = id => `[data-testid="${id}"]`
const state = s => s.page.evaluate(() => {
  const mark = document.querySelector('#sqnMenuBtn')?.textContent.replace(/TALON/, '').trim()
  const rows = [...document.querySelectorAll('[data-testid^="row-"]')].map(e => e.dataset.testid.slice(4))
  const ap = document.querySelector('[data-testid="approvals-page"]')
  const lines = ap ? [...ap.querySelectorAll('[data-testid^="appr-line-"]')].filter(l => l.getBoundingClientRect().height > 0).map(l => l.dataset.testid.slice(10)) : null
  const head = ap ? ap.querySelector('h1,h2,.appr-title')?.parentElement?.textContent.replace(/\s+/g, ' ').trim().slice(0, 80) : null
  return { mark, rowsFirst: rows.slice(0, 3), rowCount: rows.length, has149: rows.some(r => /9$/.test(r)), apprLines: lines && lines.slice(0, 4), apprCount: lines && lines.length, head }
})
await serve()
try {
  const s = await newPage(SZ); const P = `r3c-${SZ}`
  await signIn(s, 'ad', 'a')
  await step('a: pick 142 with Approvals open', async () => {
    await pick(s, '149'); await navTo(s, 'Leave War'); await s.page.waitForTimeout(1200)
    await press(s, T('lw-tab-approvals')); await s.page.waitForTimeout(800)
    facts.a0_149_approvals = await state(s)
    await pick(s, '142'); await s.page.waitForTimeout(3000)
    facts.a1_after_pick142_3s = await state(s); facts.a1_typing = await s.page.evaluate(() => document.activeElement?.outerHTML.slice(0, 120))
    await shot(s, `${P}-a1-after-pick142.png`)
    await press(s, T('lw-tab-grid')); await s.page.waitForTimeout(1500)
    facts.a2_grid = await state(s)
    await shot(s, `${P}-a2-grid.png`)
    await navTo(s, 'View-only Sched'); await navTo(s, 'Leave War'); await s.page.waitForTimeout(1500)
    facts.a3_away_and_back = await state(s)
    await shot(s, `${P}-a3-away-back.png`)
  })
  await step('b: pick 149 on the Grid', async () => {
    facts.b0 = await state(s)
    await pick(s, '149'); await s.page.waitForTimeout(3000)
    facts.b1_after_pick149 = await state(s)
    await shot(s, `${P}-b1-grid-after-pick149.png`)
    await navTo(s, 'View-only Sched'); await navTo(s, 'Leave War'); await s.page.waitForTimeout(1500)
    facts.b2_away_and_back = await state(s)
  })
  await step('c: from another page', async () => {
    await navTo(s, 'View-only Sched'); await pick(s, '142'); await navTo(s, 'Leave War'); await s.page.waitForTimeout(1500)
    facts.c_142_from_other_page = await state(s)
  })
  await s.ctx.close()
} finally { save('r3c'); await stop() }
console.log(JSON.stringify(facts, null, 1))
console.log('errs', errs.length, errs.slice(0, 10))
