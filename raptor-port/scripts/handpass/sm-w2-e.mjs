// W2 part E (S2): Leave War on a healthy world places an approved LL (Shaft 15 Jul) and a pending LL (Dice 16 Jul); then on U tries every change.
import * as L from './sm-lib.mjs'
import { readFileSync, writeFileSync } from 'node:fs'
console.log('sm-w2-e v1')
const OUT = L.outDir('w2')
const ORIGIN = 'http://localhost:4393'
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/e63929f0a8c01089/bf4e1ab0-4906-4138-afef-e67911a71441/scratchpad'
const state = JSON.parse(readFileSync(SCR + '/w2-state3.json', 'utf8'))
const log = (k, v) => console.log(k, JSON.stringify(v))
const vis = (page) => page.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter(e => e.getBoundingClientRect().width > 0 && !/^cell-|^row-|^hdr|^month|^day-|^head-/.test(e.dataset.testid)).map(e => e.dataset.testid))
async function openLW(W) {
  await W.page.evaluate(() => window.go('leavewar')); await L.sleep(2500)
  await W.page.waitForSelector('td[data-testid^="cell-"]', { timeout: 20000 })
  await W.page.locator('[data-testid="month-JUL"]').click(); await L.sleep(1200)
}
async function tapCell(W, who, iso) {
  const c = W.page.locator(`[data-testid="cell-${who}-${iso}"]`); await c.scrollIntoViewIfNeeded(); await c.click(); await L.sleep(1000)
}
const closeSheet = async (W) => { const x = W.page.locator('[data-testid="sheet-scrim"]'); if (await x.count()) { await W.page.keyboard.press('Escape'); await L.sleep(500) } }

/* healthy: place approved + pending */
const H = await L.launch('pc', { origin: ORIGIN, state })
await L.signIn(H); await openLW(H)
await tapCell(H, 'shaft', '2026-07-15')
log('sheet testids', await vis(H.page))
await H.page.getByRole('button', { name: /^LL/ }).first().click(); await L.sleep(1200)
log('after LL shaft', { cell: await H.page.evaluate(() => (document.querySelector('[data-testid="cell-shaft-2026-07-15"]') || {}).textContent), sheet: await vis(H.page) })
await closeSheet(H)
await L.pic(H, OUT, 's2-fixture-healthy', { clip: { x: 0, y: 0, width: 1536, height: 864 } })
// pending: turn Auto-approve off then place
await tapCell(H, 'dice', '2026-07-16')
const sw = H.page.locator('text=Auto-approve').first()
log('auto-approve present', await sw.count())
if (await sw.count()) { await sw.click(); await L.sleep(300) }
await H.page.getByRole('button', { name: /^LL/ }).first().click(); await L.sleep(1200)
log('after LL dice', await H.page.evaluate(() => (document.querySelector('[data-testid="cell-dice-2026-07-16"]') || {}).className))
await closeSheet(H)
log('keys', await H.page.evaluate(() => Object.keys(localStorage).filter(k => /leavewar/.test(k)).length))
const st = await H.ctx.storageState()
writeFileSync(SCR + '/w2-state4.json', JSON.stringify(st))
log('errs', H.errs)
await L.closeAll(H)

/* U: try every change */
const U = await L.launch('pc', { origin: ORIGIN, state: st, init: L.damageInit('raptor:weeks/13-07-2026#2') })
await L.signIn(U); await openLW(U)
const toast = async () => (await L.toastText(U.page))
const snapLW = () => U.page.evaluate(() => JSON.stringify(Object.entries(localStorage).filter(([k]) => /leavewar|inputs/.test(k) && !/^$/.test(k)).map(([k, v]) => [k, v.length])))
await tapCell(U, 'shaft', '2026-07-15')
log('U sheet shaft 15 (approved)', await vis(U.page))
await L.pic(U, OUT, 's2-U-sheet-approved', { clip: { x: 0, y: 0, width: 1536, height: 864 } })
for (const [name, rx] of [['approve-toggle(send back)', /^Approve/], ['delete', /^Delete/], ['move', /Move/], ['OD', /^OD/], ['CSE', /^CSE/]]) {
  const before = await snapLW()
  const b = U.page.getByRole('button', { name: rx }).filter({ visible: true }).first()
  if (!(await b.count())) { log('S2 ' + name, 'no such button'); continue }
  const dis = await b.isDisabled()
  await b.click(); await L.sleep(900)
  if (name === 'delete') { const y = U.page.getByRole('button', { name: /sure|confirm|yes/i }).filter({ visible: true }).first(); if (await y.count()) { await y.click(); await L.sleep(900) } }
  const t = await toast()
  await L.pic(U, OUT, 's2-U-' + name.replace(/\W+/g, ''), { clip: { x: 0, y: 0, width: 1536, height: 864 } })
  log('S2 ' + name, { disabled: dis, toast: t, storeChanged: before !== await snapLW(), cell: await U.page.evaluate(() => (document.querySelector('[data-testid="cell-shaft-2026-07-15"]') || {}).className) })
  for (let i = 0; i < 40; i++) { const t0 = await toast(); if (!t0 || !t0.shown) break; await L.sleep(250) }
}
await closeSheet(U)
// pending bid: approve
await tapCell(U, 'dice', '2026-07-16')
log('U sheet dice 16 (pending)', await vis(U.page))
{
  const before = await snapLW()
  const b = U.page.getByRole('button', { name: /^Approve/ }).filter({ visible: true }).first()
  if (await b.count()) { log('approve disabled', await b.isDisabled()); await b.click(); await L.sleep(900) }
  log('S2 approve pending', { toast: await toast(), storeChanged: before !== await snapLW() })
  await L.pic(U, OUT, 's2-U-approve-pending', { clip: { x: 0, y: 0, width: 1536, height: 864 } })
}
await closeSheet(U)
// new leave on a protected date
await tapCell(U, 'ammo', '2026-07-14')
{
  const before = await snapLW()
  await U.page.getByRole('button', { name: /^LL/ }).first().click(); await L.sleep(1100)
  log('S2 new LL ammo 14 Jul', { toast: await toast(), storeChanged: before !== await snapLW() })
}
log('errs', U.errs)
await L.closeAll(U)
console.log('DONE')
