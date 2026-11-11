/* pdl-rw-r4 v1 — R4 plain-user round on the frozen build. Desktop 1536x864, then one phone pass (402x874, touch, TAP, a picture ~60 ms after each tap).
   Fixture: Vandal lands Mon 20:00 / flies Tue 12:00 (as S4), Tue published, then Tue edited (msn BFM2) so a change is waiting ("1 pending"). */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { chromium } from '@playwright/test'
import { existsSync, writeFileSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL = 'http://localhost:4292'
process.env.HP_SHOTS = resolve(HERE, '../../../docs/img/handpass/2026-11-12-published-day-logic-settings/rewalk/r4')
console.log('pdl-rw-r4 v1', process.env.HP_SHOTS)
const P = await import('./pdl-w1-lib.mjs')
const { X, W, L, sleep, SHOTS, row } = P
const w = await X.world('desktop')
const { page } = w
const man = w.ID('Vandal')
const shot = async (pg, n) => { await pg.screenshot({ path: `${SHOTS}/${n}.png` }); return n + '.png' }
/* what overlays are on screen right now (a window, a dialog, a changes window) */
const overlays = pg => pg.evaluate(() => [...document.querySelectorAll('.chgwin, [role="dialog"], .floatwin, .pendlist, .dayPop, #dayPop')].filter(e => e.offsetWidth > 0 && e.offsetHeight > 0 && !e.hidden).map(e => (e.className || e.id || e.tagName).toString().slice(0, 40) + ': ' + e.innerText.replace(/[\s ]+/g, ' ').slice(0, 160)))
const msnOf = pg => pg.evaluate(() => { const d = window.DAYS[1]; return d.waves.map(wv => wv.formations[0].msn).join(',') })
const pendOf = async pg => (await L.head(pg, 1) || {}).pending
const log = (k, v) => console.log(k, typeof v === 'string' ? v : JSON.stringify(v))

await P.openBoard(w, 0); await P.line(w, 0, { to: '19:00', ld: '20:00', who: man }); await L.closeBoard(page)
await P.openBoard(w, 1); const ln = await P.line(w, 1, { to: '12:00', ld: '13:00', who: man })
const sp = await X.signAndPublish(w, 1)
log('R4.0 published', { p: sp.p, tag: sp.h && sp.h.tag })
await X.typeIn(w, `[data-bfld="ff:1.${ln.gi}.0.msn"]`, 'BFM2')
await L.closeBoard(page)
await L.go(page, 'editsched'); await sleep(600)
log('R4.0 pending', await pendOf(page)); log('R4.0 msn', await msnOf(page))
await shot(page, 'r4-01-edit-week-pending')
const keep = await page.context().storageState()

/* ---- A. the pending count's window, open and close ---- */
const chip = page.locator('#eWeek .day[data-day="1"] [data-pendlist="1"]').first()
log('A chip count', await chip.count())
await chip.scrollIntoViewIfNeeded(); await chip.click(); await sleep(700)
const aOpen = await overlays(page); log('A pending window open overlays', aOpen)
await shot(page, 'r4-02-pending-window-open')
row('R4.A1 pending count opens a window', aOpen.length ? 'PASS' : 'FAIL', JSON.stringify(aOpen), 'r4-02-pending-window-open.png')
/* the window is documented to close on its ✕ only (never on a tap outside); Escape and an outside tap are recorded, not expected to close it */
await page.keyboard.press('Escape'); await sleep(400); const aEsc = await overlays(page).then(o => o.length); log('A still open after Escape (count)', aEsc)
await page.mouse.click(5, 300); await sleep(400); const aOut = await overlays(page).then(o => o.length); log('A still open after outside tap (count)', aOut)
await page.locator('.chgwin:visible .win-x').first().click(); await sleep(500)
let aClosed = await overlays(page); log('A after ✕', aClosed)
await shot(page, 'r4-03-pending-window-closed')
row('R4.A2 pending window closes', aClosed.length === 0 ? 'PASS' : 'FAIL', JSON.stringify(aClosed), 'r4-03-pending-window-closed.png')

/* the changes window (clock) */
await X.press(w, '#histBtn', { scope: 'page' }); await sleep(700)
const hOpen = await overlays(page); log('A changes window open', hOpen)
await shot(page, 'r4-04-changes-window-open')
row('R4.A3 changes window (clock) opens', hOpen.length ? 'PASS' : 'FAIL', JSON.stringify(hOpen), 'r4-04-changes-window-open.png')
await page.locator('.chgwin:visible .win-x').first().click(); await sleep(500)
let hClosed = await overlays(page)
await shot(page, 'r4-05-changes-window-closed')
row('R4.A4 changes window closes', hClosed.length === 0 ? 'PASS' : 'FAIL', JSON.stringify(hClosed), 'r4-05-changes-window-closed.png')

/* ---- B. Undo and Redo once each ---- */
const m0 = await msnOf(page), p0 = await pendOf(page)
await X.press(w, '#undoBtn', { scope: 'page' }); await sleep(700)
const m1 = await msnOf(page), p1 = await pendOf(page)
await shot(page, 'r4-06-after-undo')
await X.press(w, '#redoBtn', { scope: 'page' }); await sleep(700)
const m2 = await msnOf(page), p2 = await pendOf(page)
await shot(page, 'r4-07-after-redo')
log('B', { before: [m0, p0], undo: [m1, p1], redo: [m2, p2] })
row('R4.B1 Undo takes the BFM2 edit back', m0 !== m1 && !/BFM2/.test(m1) ? 'PASS' : 'FAIL', `msn before "${m0}" pending "${p0}" -> after Undo "${m1}" pending "${p1}"`, 'r4-06-after-undo.png')
row('R4.B2 Redo brings it back', m2 === m0 ? 'PASS' : 'FAIL', `after Redo msn "${m2}" pending "${p2}"`, 'r4-07-after-redo.png')

/* ---- C. the board, leave by Done ---- */
await L.board(page, 1); await sleep(700)
await shot(page, 'r4-08-board-open')
const bOpen = await page.locator('#schedBoard:visible').count()
await X.press(w, '#sbDone'); await sleep(700)
const bShown = await page.locator('#schedBoard:visible').count()
await shot(page, 'r4-09-after-done')
row('R4.C1 board opens and ✓ Done leaves it', bOpen === 1 && bShown === 0 ? 'PASS' : 'FAIL', `board visible before Done ${bOpen}, after ${bShown}`, 'r4-09-after-done.png')

/* ---- D. the Logic page ---- */
await L.go(page, 'logic'); await sleep(600)
await shot(page, 'r4-10-logic-page')
await X.press(w, '#lgEdit', { scope: 'page' }); await sleep(500)
const inp = page.locator('#lgBody input[data-lgset="crewRest"]').first()
const was = await inp.inputValue()
await inp.fill('10h'); await inp.press('Tab'); await sleep(600)
const now = await inp.inputValue()
await shot(page, 'r4-11-logic-changed')
log('D crewRest', { was, now, vconf: await page.evaluate(() => VCONF.crewRest) })
row('R4.D1 Logic: ✎ Edit, change Crew rest', now === '10h' ? 'PASS' : 'FAIL', `box "${was}" -> "${now}"`, 'r4-11-logic-changed.png')
const resetVisible = await page.locator('#lgReset:visible').count()
await X.press(w, '#lgReset', { scope: 'page' }); await sleep(700)
let dlg = await overlays(page); log('D after Reset press overlays', dlg)
await shot(page, 'r4-12-logic-after-reset-press')
if (dlg.length) {
  const b = page.locator('[role="dialog"]:visible button, .floatwin:visible button').filter({ hasText: /reset|yes|confirm|ok/i }).last()
  if (await b.count()) { log('D confirm button', await b.innerText()); await b.click(); await sleep(700) }
}
const after = await inp.inputValue().catch(() => '(box gone)')
await shot(page, 'r4-13-logic-after-reset')
log('D after reset', { after, vconf: await page.evaluate(() => VCONF.crewRest) })
row('R4.D2 Reset to standard puts Crew rest back to its standard (12h)', after === '12h' ? 'PASS' : 'FAIL', `reset button visible ${resetVisible}; box after: "${after}"; dialogs seen: ${JSON.stringify(dlg)}`, 'r4-13-logic-after-reset.png')
await X.press(w, '#lgDone', { scope: 'page' }); await sleep(600)
const editingLeft = await page.locator('#lgBody input[data-lgset="crewRest"]:visible').count()
await shot(page, 'r4-14-logic-done')
row('R4.D3 Done leaves editing', editingLeft === 0 ? 'PASS' : 'FAIL', `visible setting boxes after Done: ${editingLeft}`, 'r4-14-logic-done.png')
const deskErrors = w.errors.slice()
await w.browser.close()

/* ---- E. one phone pass: the board and the changes window by tap ---- */
const CH = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch({ headless: true, ...(existsSync(CH) ? { executablePath: CH } : {}) })
const ctx = await browser.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, storageState: keep })
const ph = await ctx.newPage()
const perr = []
ph.on('console', m => { if (m.type() === 'error') perr.push(m.text()) })
ph.on('pageerror', e => perr.push('PAGEERROR ' + e.message))
ph.on('response', r => { if (r.status() >= 400) perr.push('HTTP ' + r.status() + ' ' + r.url()) })
await ph.goto(process.env.HP_URL + '/')
await ph.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
if (await ph.locator('#luser:visible').count()) await L.login(ph, 'a')
await sleep(800)
log('E week', await ph.evaluate(() => window.DAYS[0].dt))
log('E phone fixture msn', await msnOf(ph))
const pw = { page: ph, phone: true, errors: perr }
const tapShot = async (sel, nm, scope = 'page') => {
  const el = ph.locator(sel + ':visible').first()
  await el.waitFor({ state: 'visible', timeout: 8000 })
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(150)
  await el.tap(); await sleep(60); await shot(ph, nm + '-60ms'); await sleep(800); await shot(ph, nm + '-settled')
}
await L.go(ph, 'editsched'); await sleep(600)
await shot(ph, 'r4p-01-edit-week')
await L.board(ph, 1); await sleep(800)
await shot(ph, 'r4p-02-board-open')
const pb = await ph.locator('#schedBoard:visible').count()
await tapShot('#sbHist', 'r4p-03-board-changes-tap')
const pOpen = await overlays(ph); log('E board changes overlays', pOpen)
row('R4.E1 phone board: changes window opens by tap', pOpen.length ? 'PASS' : 'FAIL', JSON.stringify(pOpen), 'r4p-03-board-changes-tap-settled.png')
await tapShot('.chgwin .win-x', 'r4p-04-board-changes-x-tap')
let pClosed = await overlays(ph)
await shot(ph, 'r4p-05-board-changes-closed')
row('R4.E2 phone board: changes window closes', pClosed.length === 0 ? 'PASS' : 'FAIL', JSON.stringify(pClosed), 'r4p-05-board-changes-closed.png')
await tapShot('#sbDone', 'r4p-06-done-tap')
const pShown = await ph.locator('#schedBoard:visible').count()
row('R4.E3 phone board: ✓ Done leaves by tap', pb === 1 && pShown === 0 ? 'PASS' : 'FAIL', `board visible before ${pb}, after ${pShown}`, 'r4p-06-done-tap-settled.png')
await L.go(ph, 'editsched'); await sleep(600)
if (await ph.locator('#histBtn:visible').count()) {
  await tapShot('#histBtn', 'r4p-07-edit-changes-tap')
  const eo = await overlays(ph); log('E edit changes overlays', eo)
  row('R4.E4 phone Edit Schedule: changes window opens by tap', eo.length ? 'PASS' : 'FAIL', JSON.stringify(eo), 'r4p-07-edit-changes-tap-settled.png')
  await tapShot('.chgwin .win-x', 'r4p-08-edit-changes-x-tap')
  const ec = await overlays(ph)
  row('R4.E5 phone Edit Schedule: changes window closes by ✕ tap', ec.length === 0 ? 'PASS' : 'FAIL', JSON.stringify(ec), 'r4p-08-edit-changes-x-tap-settled.png')
} else row('R4.E4 phone Edit Schedule changes button', 'NOT WALKED', '#histBtn not visible on the phone top bar', 'r4p-01-edit-week.png')
log('ERRORS desktop', deskErrors); log('ERRORS phone', perr)
writeFileSync(SHOTS + '/results.json', JSON.stringify({ rows: P.ROWS, deskErrors, perr }, null, 1))
await browser.close()
