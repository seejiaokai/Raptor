// His D1460 (28 Oct 26): a member is told when someone else changes the kind of his pending bid. Walked as a person would:
// the admin, with "Approve what I enter" off, places LL on Ranger's day, then opens the day again and presses OL; then
// Ranger's bell is opened and pictured. WebKit at 402 x 874 (his iPhone's engine) and Chromium at 1536 x 730 at 1.25.
// Run from raptor-port/ against the build served on PORT (default 4173): node scripts/handpass/lw-retype-bell-walk.mjs
import { webkit, chromium, devices } from '@playwright/test'
import path from 'node:path'
import { mkdirSync } from 'node:fs'
const PORT = process.env.PORT || 4173
const OUT = path.resolve('docs/img/handpass/2026-10-28-lw-retype-bell')
mkdirSync(OUT, { recursive: true })
let problems = 0
const rows = []
async function run(name, launcher, opts) {
  const b = await launcher.launch()
  const P = await (await b.newContext(opts)).newPage()
  P.on('pageerror', e => { problems++; console.log(name, 'page error: ' + String(e).slice(0, 160)) })
  await P.goto(`http://localhost:${PORT}/?fresh=1`); await P.waitForSelector('#luser')
  await P.fill('#luser', 'ad'); await P.fill('#lpass', 'a'); await P.click('#loginForm button[type=submit]')
  await P.waitForSelector('#vWeek .day', { state: 'attached' })
  await P.evaluate(() => window.go('leavewar')); await P.waitForSelector('[data-testid="lw-tab-approvals"]')
  await P.waitForTimeout(1500)
  /* Ranger's row and a weekday a few days ahead in view */
  const cell = await P.evaluate(() => {
    const row = [...document.querySelectorAll('#page-leavewar tr[data-testid^="row-"]')].find(r => /^Ran/.test(r.querySelector('.who')?.textContent?.trim() || ''))
    const id = row.dataset.testid.slice(4)
    const w = document.querySelector('#page-leavewar .mx-wrap').getBoundingClientRect()
    const cells = [...row.querySelectorAll('td[data-testid^="cell-"]')].filter(c => { const r = c.getBoundingClientRect(); return r.left > w.left + 140 && r.right < innerWidth - 10 && !c.className.includes('weekend') && !c.textContent.trim() })
    return { id, tid: cells[2]?.dataset.testid }
  })
  console.log(name, 'cell', JSON.stringify(cell))
  await P.click(`[data-testid="${cell.tid}"]`)
  await P.waitForSelector('[data-testid="bid-picker"]', { timeout: 4000 }).catch(async () => { await P.screenshot({ path: path.join(OUT, `${name}-0-debug.png`) }); throw new Error('no window on the first tap') })
  const sw = P.getByTestId('bid-approve-tick')
  if ((await sw.getAttribute('aria-checked')) === 'true' || (await sw.getAttribute('aria-pressed')) === 'true') await sw.click()
  /* a leave that takes him below zero asks for the same press again ("Tap the same leave again to go ahead") */
  const press = async (t) => { await P.getByTestId(t).click(); await P.waitForTimeout(300); if (await P.locator('[data-testid="bid-picker"]').count()) { await P.getByTestId(t).click(); await P.waitForTimeout(500) } }
  await press('bid-LL'); await P.waitForTimeout(400)
  await P.screenshot({ path: path.join(OUT, `${name}-0b-placed.png`) })
  await P.click(`[data-testid="${cell.tid}"]`)
  await P.waitForSelector('[data-testid="bid-picker"]', { timeout: 4000 }).catch(async () => { await P.screenshot({ path: path.join(OUT, `${name}-0c-debug.png`) }); throw new Error('no window on the second tap') })
  await P.screenshot({ path: path.join(OUT, `${name}-1-window.png`) })
  await press('bid-OL'); await P.waitForTimeout(400)
  const placed = await P.locator(`[data-testid="${cell.tid}"]`).innerText()
  /* Ranger signed in (the test bridge's switch, as a sign-in would), his bell opened */
  await P.evaluate((id) => { window.raptorRole('member'); window.lwSetRole('member'); window.raptorMe(id) }, cell.id)
  await P.waitForTimeout(400)
  await P.locator('.bellbtn').filter({ visible: true }).first().click(); await P.waitForTimeout(500)
  const list = await P.locator('.bell-list').first().innerText().catch(() => '')
  await P.screenshot({ path: path.join(OUT, `${name}-2-bell.png`) })
  const ok = /LL bid changed to OL/.test(list) && /OL/.test(placed)
  rows.push(`| ${name} | the admin re-types Ranger's pending LL to OL; Ranger's bell | ${ok ? 'PASS' : 'FAIL'} | cell "${placed.trim()}"; bell: ${list.replace(/\s+/g, ' ').slice(0, 160)} |`)
  await b.close()
}
await run('phone', webkit, { ...devices['iPhone 13'], viewport: { width: 402, height: 874 }, deviceScaleFactor: 2 })
await run('desk', chromium, { viewport: { width: 1536, height: 730 }, deviceScaleFactor: 1.25 })
console.log(rows.join('\n'))
console.log(problems ? `${problems} page errors` : 'no page errors')
