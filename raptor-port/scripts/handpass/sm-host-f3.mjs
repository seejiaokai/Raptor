// The host's last look at the narrow re-read's fix (Astra and Sol 6.1, 8 Nov 26; commit 26aa4de19) — chat 13: a man
// taken out of a shared Unavailable input after its day was published has no row left, so his line in the changes
// window's "To go out" list must stand still; before the fix it was a button that landed on the first man still in it.
// The other men's line must still go to their row. Everything is pressed on screen: the input filed for three people in
// its window, the day published, the input opened again from the Inputs list and Hex's puck pressed off, Save.
// Run on any build: SM_DIST=<dist> TAG=<name> node scripts/handpass/sm-host-f3.mjs
import * as L from './sm-lib.mjs'
const TAG = process.env.TAG || 'job'
console.log('sm-host-f3 v1', TAG, L.DIST)
const OUT = L.outDir('host')
const W = await L.launch('pc', { origin: 'http://localhost:4397' })
const { page } = W
await L.signIn(W)
// 1. an overseas duty for Ranger, Vandal and Hex on Wednesday 15 Jul, filed in its window
await L.openInputsList(W)
await page.locator(L.T('in-new')).first().click(); await page.waitForSelector(L.T('win-inputedit')); await L.sleep(500)
await page.locator('#inpEditType').selectOption('OD'); await L.sleep(300)
await page.locator(L.T('pp-several')).first().click(); await L.sleep(300)
for (const id of ['bane', 'split', 'rocky']) {
  const p = page.locator(`[data-testid="win-inputedit"] [data-pp="${id}"]`).first()
  if (!(await p.getAttribute('aria-pressed') === 'true')) await p.click()
  await L.sleep(150)
}
await page.locator('#inpEditRmk').fill('Exercise R')
await page.locator('[data-testid="inpEdCal-day-2026-07-15"]').first().click(); await L.sleep(200)
await page.locator('[data-testid="inpEdCal-day-2026-07-15"]').first().click(); await L.sleep(200)
await page.locator('#inpEditSave').click(); await L.sleep(1100)
for (let i = 0; i < 4; i++) {
  const open = await page.evaluate(() => [...document.querySelectorAll('[data-testid="docconf"], [data-testid="oilconf"]')].filter(e => e.getBoundingClientRect().width).map(e => e.dataset.testid))
  if (!open.length) break
  if (open.includes('docconf')) await page.locator(L.T('docconf-nodoc')).first().click()
  else { await page.locator(L.T('oil-no')).first().click(); await L.sleep(250); await page.locator(L.T('oilconf-save')).first().click() }
  await L.sleep(700)
}
const od = await page.evaluate(() => (window.INPUTS || []).find(r => r.remarks === 'Exercise R'))
console.log('filed', JSON.stringify(od && { iid: od.iid, type: od.type, people: od.people || od.person, acc: od.acc }))
if (!od) { console.log('NOT FILED'); await L.closeAll(W); process.exit(1) }
// 2. Wednesday published
console.log('publish', JSON.stringify(await L.publishDay(W, 2))); await L.closeBoard(W)
// 3. the input opened again from the Inputs list, Hex pressed off, Save
await L.openInputsList(W)
await page.locator(`tr[data-iid="${od.iid}"] [data-testid="in-open"]`).first().click(); await page.waitForSelector(L.T('win-inputedit')); await L.sleep(600)
await page.locator('[data-testid="win-inputedit"] [data-pp="rocky"]').first().click(); await L.sleep(300)
await page.locator('#inpEditSave').click(); await L.sleep(1100)
for (let i = 0; i < 3; i++) {
  const open = await page.evaluate(() => [...document.querySelectorAll('[data-testid="docconf"], [data-testid="oilconf"]')].filter(e => e.getBoundingClientRect().width).map(e => e.dataset.testid))
  if (!open.length) break
  if (open.includes('docconf')) await page.locator(L.T('docconf-nodoc')).first().click()
  else { await page.locator(L.T('oil-no')).first().click(); await L.sleep(250); await page.locator(L.T('oilconf-save')).first().click() }
  await L.sleep(700)
}
const now = await page.evaluate(() => (window.INPUTS || []).filter(r => /^Exercise R/.test(r.remarks || '')).map(r => ({ iid: r.iid, people: r.people || r.person })))
console.log('after taking Hex out', JSON.stringify(now))
// 4. Wednesday's "To go out" list on Edit Schedule: what each line is, and where a tap on each goes
await L.goEdit(W); await page.evaluate(() => window.scrollTo(0, 0)); await L.sleep(500)
await L.press(W, page.locator('#eWeek section.day[data-day="2"] [data-pendlist="2"]')); await L.sleep(900)
const lines = await page.evaluate(() => [...document.querySelectorAll('.chgwin .pl-item')].map(e => ({ tag: e.tagName, still: e.classList.contains('still'), plix: e.getAttribute('data-plix'), text: e.textContent.replace(/\s+/g, ' ').trim().slice(0, 90) })))
console.log('lines', JSON.stringify(lines, null, 1))
await L.pic(W, OUT, `f3-${TAG}-list`, { sel: '.chgwin' })
for (const pick of [/Hex/, /Ranger|Vandal/]) {
  await page.evaluate(() => window.scrollTo(0, 0)); await L.sleep(300)
  const line = page.locator('.chgwin .pl-item').filter({ hasText: pick }).first()
  if (!(await line.count())) { console.log('no line', String(pick)); continue }
  const y0 = await page.evaluate(() => Math.round(scrollY))
  await line.click(); await L.sleep(1200)
  const r = await page.evaluate(() => ({ y: Math.round(scrollY), flash: [...document.querySelectorAll('.chgflash')].map(e => (e.getAttribute('data-inprow') || e.getAttribute('data-k') || e.className.slice(0, 30)) + '|' + e.textContent.replace(/\s+/g, ' ').trim().slice(0, 30)) }))
  console.log('tap', String(pick), 'from y', y0, JSON.stringify(r))
  await L.pic(W, OUT, `f3-${TAG}-tap-${String(pick).replace(/\W/g, '')}`, {})
}
console.log('errs', JSON.stringify(W.errs))
await L.closeAll(W)
