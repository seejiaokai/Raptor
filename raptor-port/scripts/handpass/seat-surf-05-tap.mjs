/* [OIL-SEATS-CAN-EARN] walk — SURFACES. Does tapping the count chip on the
   EDIT WEEK / VIEW WEEK say the same thing as tapping it on the BOARD?
   (The message lands in the app's own message strip at the foot of the screen.) */
import { open, go, board, closeBoard, tap, type, shot, STATE } from './lib.mjs'

const di = 5
const { browser, page, errors } = await open({ state: STATE })

/* fixture: one placeholder on a duty desk, one on a new ground row */
await board(page, di)
await tap(page, `[data-gradd="${di}"]`)
await type(page, `[data-bfld="gr:${di}.5.prog"]`, 'STORES CHECK')
await type(page, `[data-bfld="gr:${di}.5.str"]`, '08:00')
await type(page, `[data-bfld="gr:${di}.5.end"]`, '10:00')
await closeBoard(page)
await go(page, 'editsched'); await page.waitForTimeout(800)

async function weekPut(key, pid) {
  const t = page.locator(`#eWeek [data-slot="${key}"], #eWeek [data-fill="${key}"]`).first()
  if (!(await t.count())) return false
  await t.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(120)
  const b = await t.boundingBox(); if (b) await page.mouse.click(b.x + b.width / 2, b.y + Math.min(b.height - 3, b.height * 0.8))
  await page.waitForTimeout(240)
  const p = page.locator(`#eRoster .rpuck[data-person="${pid}"]:visible`).first()
  if (await page.evaluate(() => !!(window.ARM && window.ARM.key)) && await p.count()) {
    await p.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(100)
    try { await p.click({ timeout: 2500 }) } catch { const q = await p.boundingBox(); if (q) await page.mouse.click(q.x + q.width / 2, q.y + q.height / 2) }
    await page.waitForTimeout(420)
  }
  await page.keyboard.press('Escape'); await page.waitForTimeout(150)
  return true
}
await weekPut(`d:${di}.1.1.+`, 'allavail')
await weekPut(`g:${di}.5.+`, 'all')

const said = () => page.evaluate(() => {
  const t = document.getElementById('toastEl')
  if (!t) return 'NO MESSAGE STRIP IN THE PAGE AT ALL'
  return { txt: (t.textContent || '').trim(), opacity: t.style.opacity }
})
async function tapChip(scope, idx, label) {
  await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) { t.textContent = ''; t.style.opacity = '0' } })
  const c = page.locator(`${scope} .oilcount`).nth(idx)
  if (!(await c.count())) return console.log(`  ${label}: no chip at ${idx}`)
  const txt = (await c.innerText()).trim()
  await c.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(150)
  try { await c.click({ timeout: 3000 }) } catch { const b = await c.boundingBox(); if (b) await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2) }
  await page.waitForTimeout(600)
  const s = await said()
  console.log(`  ${label} chip "${txt}"  ->  ${JSON.stringify(s).slice(0, 460)}`)
  return s
}

console.log('\n===== EDIT WEEK — tapping each chip =====')
const nE = await page.locator(`#eWeek .day[data-day="${di}"] .oilcount`).count()
console.log(' chips on day 5 of the edit week:', nE)
for (let i = 0; i < nE; i++) await tapChip(`#eWeek .day[data-day="${di}"]`, i, 'edit week')
await shot(page, 'SURF-04-editweek-chip-tap-message')

console.log('\n===== VIEW WEEK — tapping each chip =====')
await go(page, 'viewsched'); await page.waitForTimeout(900)
const nV = await page.locator(`#vWeek .day[data-day="${di}"] .oilcount`).count()
console.log(' chips on day 5 of the view week:', nV)
for (let i = 0; i < nV; i++) await tapChip(`#vWeek .day[data-day="${di}"]`, i, 'view week')
await shot(page, 'SURF-05-viewweek-chip-tap-message')

console.log('\n===== THE BOARD — tapping the same chips =====')
await board(page, di)
const nB = await page.locator(`#schedBoard .oilcount:visible`).count()
console.log(' chips visible on the board:', nB)
for (let i = 0; i < Math.min(nB, 4); i++) await tapChip('#schedBoard', i, 'board')
await shot(page, 'SURF-06-board-chip-tap-message')

console.log('\nerrors:', errors.slice(0, 8))
await browser.close()
