// M5a (28 Oct 26): the busy case every M5a drawing is drawn from, staged through the app's own doors on today's main.
// Ranger (id bane), a senior pilot, the member signed in as us/us. The clock is Thu 22 Jan 26, 09:00.
//   His LL Mon 19 – Wed 21 Jan, approved (taken: "3 taken")       — placed before he typed App bal
//   His LL Mon 26 – Tue 27 Jan, approved                           — placed after he typed App bal (new since his visit)
//   His LL Thu 29 Jan AM, pending (0.5)  ·  his LL Thu 12 – Fri 13 Feb, pending (2)
//   His LL Mon 2 Feb, refused (new since his visit)
// Bids go in through the localhost bridge's setCell (the store's own writer, as the e2e tests do); approve and refuse are
// pressed in the real window a tap on his cell opens. Then his LVE is set to 12.5 through the person sheet's own "Set",
// so the grid's figure beside his name reads what the drawn War bal reads. The state is saved for the drawing scripts.
//   cd raptor-port ; LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-m5a-stage.mjs
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, q, errs, OUT } from './full-lib.mjs'
export const M5CLOCK = new Date('2026-01-22T09:00:00+08:00')
const browser = await chromium.launch()
const { ctx, p } = await newPage(browser, 1536, 864, false)
await p.clock.setFixedTime(M5CLOCK)
await signIn(p, 'admin')
const put = (d, c) => p.evaluate(([d, c]) => window.lwSetCell('bane', d, c), [d, c])
const ok = []
for (const d of ['2026-01-19', '2026-01-20', '2026-01-21', '2026-01-26', '2026-01-27', '2026-02-02', '2026-02-12', '2026-02-13']) ok.push(await put(d, 'LL'))
ok.push(await put('2026-03-02', 'CCL'))   // a pending CCL, for the small tile's Pending / War bal lines (D1253)
// and round 20d's other two pending small tiles: PL half a day, CL a day (its own sample figures — D1478, the sole source)
ok.push(await put('2026-03-16', '*PL'))
ok.push(await put('2026-03-17', 'CL'))
ok.push(await put('2026-01-29', '*LL'))   // a leading * is the morning (codes.ts parseCell)
console.log('placed', JSON.stringify(ok))
await p.waitForTimeout(500)
// decide in the real window: a tap on a leave's day opens the whole leave (D1461); Approve or Refuse there
async function decide(date, btn) {
  await p.evaluate(id => document.querySelector(`[data-testid="${id}"]`)?.scrollIntoView({ block: 'center', inline: 'center' }), 'cell-bane-' + date)
  await p.waitForTimeout(300)
  await p.click(q('cell-bane-' + date)); await p.waitForTimeout(500)
  const b = p.locator('.bidsheet button').filter({ hasText: new RegExp('^' + btn + '$') }).first()
  const n = await b.count(); if (n) { await b.click(); await p.waitForTimeout(400) }
  console.log('decide', date, btn, n ? 'pressed' : 'MISSING', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.bidsheet button')].map(b => b.textContent.trim()).filter(Boolean).slice(0, 14))))
  await p.keyboard.press('Escape'); await p.waitForTimeout(300)
}
await decide('2026-01-19', 'Approve')
await decide('2026-01-26', 'Approve')
await decide('2026-02-02', 'Refuse')
await shot(p, 'm5a-stage-grid')
// his LVE set through the person sheet's own Set, so the grid's figure reads 12.5
await p.evaluate(() => window.scrollTo(0, 0))
await p.click(q('person-bane')); await p.waitForTimeout(600)
console.log('sheet rows', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('[data-testid^="pfig-"]')].map(e => e.dataset.testid + ' | ' + e.textContent.replace(/\s+/g, ' ').trim().slice(0, 90)))))
await shot(p, 'm5a-stage-sheet')
await p.click(q('lve-edit')); await p.waitForTimeout(250)
await p.fill(q('lve-input'), '12.5'); await p.click(q('lve-save')); await p.waitForTimeout(400)
console.log('LVE now', await p.evaluate(() => document.querySelector('[data-testid="pfig-lve"]')?.textContent.replace(/\s+/g, ' ').slice(0, 40)))
await p.keyboard.press('Escape'); await p.waitForTimeout(300)
await shot(p, 'm5a-stage-grid2')
writeFileSync(join(OUT, 'm5a-state.json'), JSON.stringify(await ctx.storageState()))
await ctx.close(); await browser.close(); console.log('errors:', errs)
