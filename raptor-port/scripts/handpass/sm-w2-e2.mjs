// W2 part E2 (S2) on U using state4: record every word the Leave War says on protected dates. SZ=pc|phone
import * as L from './sm-lib.mjs'
import { readFileSync } from 'node:fs'
const size = process.env.SZ || 'pc'
console.log('sm-w2-e2 v2', size)
const OUT = L.outDir('w2')
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/e63929f0a8c01089/bf4e1ab0-4906-4138-afef-e67911a71441/scratchpad'
const st = JSON.parse(readFileSync(SCR + '/w2-state4.json', 'utf8'))
const log = (k, v) => console.log(k, JSON.stringify(v))
const U = await L.launch(size, { origin: 'http://localhost:4393', state: st, init: L.damageInit('raptor:weeks/13-07-2026#2') })
const { page } = U
const vp = page.viewportSize(); const full = { x: 0, y: 0, width: vp.width, height: vp.height }
await L.signIn(U)
await page.evaluate(() => window.go('leavewar')); await L.sleep(2500)
await page.waitForSelector('td[data-testid^="cell-"]', { timeout: 20000 })
await page.locator('[data-testid="month-JUL"]').click(); await L.sleep(1200)
const tap = async (who, iso) => { const c = page.locator(`[data-testid="cell-${who}-${iso}"]`); await c.scrollIntoViewIfNeeded(); if (size === 'phone') await c.tap(); else await c.click(); await L.sleep(1000) }
const words = () => page.evaluate(() => [...document.querySelectorAll('body *')].filter(e => e.children.length === 0 && e.getBoundingClientRect().width > 0 && /locked week|older version|saved copy|Blocked|not changed|can.t be/i.test(e.textContent)).map(e => e.textContent.replace(/\s+/g, ' ').trim()).filter(t => !/^This week/.test(t)))
const snap = () => page.evaluate(() => JSON.stringify(Object.entries(localStorage).filter(([k]) => /leavewar|inputs|weeks/.test(k)).map(([k, v]) => [k, v.length])))
const press = async (rx) => { const b = page.getByRole('button', { name: rx }).filter({ visible: true }).first(); if (!(await b.count())) return null; const dis = await b.isDisabled(); if (size === 'phone') await b.tap(); else await b.click(); await L.sleep(900); return { dis } }
const clearToast = async () => { for (let i = 0; i < 40; i++) { const t = await L.toastText(page); if (!t || !t.shown) break; await L.sleep(250) } }
const act = async (name, who, iso, rx, extra) => {
  await clearToast(); await tap(who, iso)
  const before = await snap()
  const r = await press(rx)
  if (r && extra) { const y = page.getByRole('button', { name: /sure|confirm|yes/i }).filter({ visible: true }).first(); if (await y.count()) { await y.click(); await L.sleep(800) } }
  await L.pic(U, OUT, `s2-${size}-${name}`, { clip: full })
  log('S2 ' + name, { pressed: r, words: await words(), toast: await L.toastText(page), changed: before !== await snap() })
  await page.keyboard.press('Escape'); await L.sleep(400)
}
await act('send-back-approved', 'shaft', '2026-07-15', /^Approved/)
await act('delete-approved', 'shaft', '2026-07-15', /^Delete/, true)
await act('move-approved', 'shaft', '2026-07-15', /Move/)
await act('approve-pending', 'dice', '2026-07-16', /^Approve/)
await act('refuse-pending', 'dice', '2026-07-16', /^Refuse/)
await act('delete-pending', 'dice', '2026-07-16', /^Delete/, true)
await act('new-LL-protected', 'ammo', '2026-07-14', /^LL/)
await act('new-LL-healthy', 'ammo', '2026-07-22', /^LL/)
// a range touching healthy+protected: Pick a range is a drag; record NOT DRIVEN unless simple
log('cells', await page.evaluate(() => ({ ammo14: (document.querySelector('[data-testid="cell-ammo-2026-07-14"]') || {}).className, ammo22: (document.querySelector('[data-testid="cell-ammo-2026-07-22"]') || {}).className, shaft15: (document.querySelector('[data-testid="cell-shaft-2026-07-15"]') || {}).className, dice16: (document.querySelector('[data-testid="cell-dice-2026-07-16"]') || {}).className })))
log('errs', U.errs)
await L.closeAll(U)
console.log('DONE')
