/* THE TRACKER TIDY (5 Nov 26, [TRK-STANDALONE-LEFTOVERS]) — the HOST's route check before the walker starts
   (docs/walk-scripts.md §1): the route every scenario starts from, proved on the frozen build. Desktop and phone:
   sign in, open the Tracker by its tab, count the Undo / Redo pair (top bar only), mark an event in the marking pop-up,
   take it back with the top bar's ↶, and list where the browser's storage changed (raptor:tracker/ only; no ocu: key).
     HP_URL=http://127.0.0.1:4180 HP_SHOTS=… HP_OUT=… node scripts/handpass/trk1105-route.mjs */
import { open, shot, log, save, PHONE } from './trk-lib.mjs'

console.log('trk1105-route v1')
const L = log()
const sleep = ms => new Promise(r => setTimeout(r, ms))
const PH = { width: 402, height: 874 }
const keys = page => page.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k) } return o })
const pair = page => page.evaluate(() => ({
  undo: document.querySelectorAll('#trUndoBtn').length, redo: document.querySelectorAll('#trRedoBtn').length,
  inTop: !!document.querySelector('.topbar #trUndoBtn') && !!document.querySelector('.topbar #trRedoBtn'),
  inTracker: !!document.querySelector('#page-tracker #trUndoBtn, #page-tracker #trRedoBtn'),
  undoOff: document.querySelector('#trUndoBtn')?.disabled ?? null, title: document.querySelector('#trUndoBtn')?.title ?? null,
}))
const grade = (page, id) => page.evaluate(i => window.__undoForTests().grade(i), id)

for (const [tag, size, touch] of [['desk', { width: 1536, height: 864 }, false], ['phone', PH, true]]) {
  const { browser, page, errors } = await open({ size, touch })
  const k0 = await keys(page)
  const p0 = await pair(page)
  L.ok(`R1 ${tag}: one Undo / Redo pair, in the top bar, none in the Tracker, greyed`, p0.undo === 1 && p0.redo === 1 && p0.inTop && !p0.inTracker && p0.undoOff === true, JSON.stringify(p0))
  await shot(page, `R1-${tag}-open`)
  /* the marking pop-up on ST-02, by a press on its ball (scrolled to it by the chart's own scroll first) */
  await page.evaluate(() => { const bd = document.getElementById('board'), g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === 'ST-02'); const r = g.getBoundingClientRect(), b = bd.getBoundingClientRect(); bd.scrollTop += (r.top + r.height / 2) - (b.top + b.height / 2); bd.scrollLeft += (r.left + r.width / 2) - (b.left + b.width / 2) })
  await sleep(300)
  const c = await page.evaluate(() => { const r = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === 'ST-02').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
  if (touch) await page.touchscreen.tap(c.x, c.y); else await page.mouse.click(c.x, c.y)
  await page.waitForSelector('#pop', { timeout: 4000 }); await sleep(250)
  const dco = page.locator('#pop .opts button[data-g="dco"]').first(); if (touch) await dco.tap(); else await dco.click()
  await sleep(1200)
  const p1 = await pair(page), g1 = await grade(page, 'ST-02')
  L.ok(`R2 ${tag}: DCO on ST-02 lights the top bar's ↶`, g1 === 'dco' && p1.undoOff === false, JSON.stringify({ g1, p1 }))
  const k1 = await keys(page)
  const changed = Object.keys(k1).filter(k => k1[k] !== k0[k]), ocu = Object.keys(k1).filter(k => /^ocu:/.test(k))
  L.ok(`R3 ${tag}: the mark changed keys under raptor:tracker/ only (ocuLocal: and the app's own bookkeeping aside); no ocu: key`, ocu.length === 0 && changed.some(k => k.startsWith('raptor:tracker/')) && changed.every(k => /^raptor:/.test(k) || /^ocuLocal:/.test(k) || /^raptorLocal:/.test(k)), JSON.stringify({ changed, ocu }))
  await shot(page, `R2-${tag}-marked`)
  const u = page.locator('.topbar #trUndoBtn'); if (touch) await u.tap(); else await u.click()
  await sleep(900)
  L.ok(`R4 ${tag}: the top bar's ↶ takes the mark back`, (await grade(page, 'ST-02')) === 0, String(await grade(page, 'ST-02')))
  await shot(page, `R4-${tag}-undone`)
  L.note(`${tag} errors`, errors.join(' | ') || 'none')
  await browser.close()
}
save('trk1105-route', { rows: L.rows })
const fails = L.rows.filter(r => r.pass === false)
console.log(`\n${L.rows.filter(r => r.pass === true).length} PASS · ${fails.length} FAIL`)
process.exit(fails.length ? 1 : 0)
