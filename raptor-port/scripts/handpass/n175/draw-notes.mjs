// draw-notes - [MSQ-PICK-GUARD] the second questions page, drawing D3: the grey "Blocked:" note with the new words, in
// the approved look (chat 166's p1b / p3-p): on a desktop just under the control pressed, on a phone at the screen's
// foot (chat 175, 25 Nov 26). The note is the app's own (window.toast(text, 'blocked')), its fade stopped; on a desktop
// ONLY its place is changed (./draw-lib.mjs raise, place). The pick itself is not made: the picker's list is opened and
// closed again, as the built guard would leave it.
//  d3a (d, p): Admin → Users, a row open with typing, 149 picked.
//  d3b (d, p): the "Not saved" band showing (the stand-in: the browser's storage refuses every write), 149 picked.
//  d3c (d):    an Input window open, the lit bell tapped where a tap acts directly (his own OIL question waiting).
//  d3d (d):    an Input window open AND "Not saved" showing, 149 picked - the note that shows first.
//   node raptor-port/scripts/handpass/n175/draw-notes.mjs        (ONLY=d3a-d,d3a-p,d3b-d,d3b-p,d3c,d3d)
// Pictures: drawn/<id>-<d|p>-note[-crop].png. FACT lines: the note's words, box, lines; what it lies over.
import { closeAll, FACT, signIn, go, wait, boxOf, covered, vis, hit, shut, barSq, run, shot, scratch, want, failedSave, bandNow, raise, place, noteFacts, openInput, typeWords, inputWin, windowsNow, openUsersRow, inputsList } from './draw-lib.mjs'
const GAP = 8
const N = {
  d3a: 'Blocked: save or cancel the open row, then pick 149.',
  d3b: 'Blocked: press Retry to save your changes, then pick 149.',
  d3c: 'Blocked: close the open window, then press the bell again.',
  d3d: 'Blocked: close the open window, then pick 149.',
}
const listRows = (s, sel) => s.page.evaluate(sel => [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim()), sel)
/* the desktop's picker pressed, its list opened, then closed again by the picker itself - the pick does not happen */
async function pickerOpenedAndClosed(s, k) {
  await hit(s, '#sqnMenuBtn', 400)
  FACT(`${k}.listOpened`, await listRows(s, '#sqnMenu .sqm-row'))
  await hit(s, '#sqnMenuBtn', 400)
  if ((await listRows(s, '#sqnMenu .sqm-row')).length) { await s.page.keyboard.press('Escape'); await wait(s, 300) }
  FACT(`${k}.listClosed`, !(await listRows(s, '#sqnMenu .sqm-row')).length)
}
/* the phone's ☰ menu opened, its squadron list opened, then both closed again - the pick does not happen */
async function menuListOpenedAndClosed(s, k) {
  FACT(`${k}.burger`, await covered(s, '#burger'))
  await hit(s, '#burger', 400)
  if (!(await s.page.locator('#drawerSqnList').count())) await hit(s, '#drawerSqnBtn', 400)
  FACT(`${k}.listOpened`, await listRows(s, '#drawerSqnList .sqm-row'))
  await shut(s)
  FACT(`${k}.menuClosed`, !(await s.page.evaluate(() => document.querySelector('#drawer')?.classList.contains('open'))))
}
/* just under the control pressed: its left edge on the control's (a control left of the middle) or its right edge on the
   control's, 8px under the top bar - or under the "Not saved" band where that stands under the bar, so the note never
   lies over the band it sends him to */
async function under(s, k, ctlSel) {
  const ctl = await boxOf(s, ctlSel), bar = await boxOf(s, '.topbar'), band = await bandNow(s)
  const foot = Math.max(bar.y + bar.h, band ? band.box.y + band.box.h : 0)
  const p = ctl.x + ctl.w / 2 < s.W / 2 ? { top: Math.round(foot) + GAP, left: ctl.x } : { top: Math.round(foot) + GAP, right: Math.round(s.W - (ctl.x + ctl.w)) }
  FACT(`${k}.placed`, { control: ctlSel, controlBox: ctl, topBarFoot: bar.y + bar.h, bandFoot: band ? band.box.y + band.box.h : null, ...p })
  await place(s, p)
}
const WINSELS = { windowTitle: '.inpedwin .win-ttl', windowX: '.inpedwin .win-x', window: '.inpedwin' }
const BANDSELS = { band: '.savestat.failed', retry: '.savestat.failed button' }

if (want('d3a-d')) await run('d3a.d', 'd', async s => {
  const k = 'd3a.d'
  await signIn(s, 'ad', 'a'); const row = await openUsersRow(s); FACT(`${k}.row`, row)
  await pickerOpenedAndClosed(s, k)
  await raise(s, N.d3a); await under(s, k, '#sqnMenuBtn')
  const m = await noteFacts(s, k, N.d3a, { picker: '#sqnMenuBtn', row: row.rowSel, typedBox: row.boxSel })
  FACT(`${k}.state`, { squadron: await barSq(s), rowStillOpen: !!(await boxOf(s, row.rowSel)), typed: await vis(s, row.boxSel).first().inputValue() })
  await shot(s, 'd3a-d-note', [m.box, m.boxes.picker, m.boxes.row], 16)
})
if (want('d3a-p')) await run('d3a.p', 'p', async s => {
  const k = 'd3a.p'
  await signIn(s, 'ad', 'a'); const row = await openUsersRow(s); FACT(`${k}.row`, row)
  await menuListOpenedAndClosed(s, k)
  await vis(s, row.rowSel).first().evaluate(e => e.scrollIntoView({ block: 'center' })); await wait(s, 300)
  await raise(s, N.d3a)
  const m = await noteFacts(s, k, N.d3a, { row: row.rowSel, typedBox: row.boxSel, rowSave: '#accEdSave', rowCancel: '#accEdCancel' })
  FACT(`${k}.state`, { squadron: await barSq(s), rowBox: m.boxes.row, rowInSight: !!m.boxes.row && m.boxes.row.y < s.H && m.boxes.row.y + m.boxes.row.h > 0, saveBox: m.boxes.rowSave, cancelBox: m.boxes.rowCancel, typed: await vis(s, row.boxSel).first().inputValue() })
  await shot(s, 'd3a-p-note', [m.box, m.boxes.row && { x: 0, y: Math.max(0, m.boxes.row.y), w: s.W, h: 10 }], 16)
})
if (want('d3b-d')) await run('d3b.d', 'd', async s => {
  const k = 'd3b.d'
  await signIn(s, 'ad', 'a'); await failedSave(s, k)
  await pickerOpenedAndClosed(s, k)
  await raise(s, N.d3b); await under(s, k, '#sqnMenuBtn')
  const m = await noteFacts(s, k, N.d3b, { picker: '#sqnMenuBtn', ...BANDSELS })
  const band = await bandNow(s); FACT(`${k}.band`, band)
  await shot(s, 'd3b-d-note', [m.box, m.boxes.picker, band.box], 16)
})
if (want('d3b-p')) await run('d3b.p', 'p', async s => {
  const k = 'd3b.p'
  await signIn(s, 'ad', 'a'); await failedSave(s, k)
  await menuListOpenedAndClosed(s, k)
  await raise(s, N.d3b)
  const m = await noteFacts(s, k, N.d3b, BANDSELS)
  const band = await bandNow(s); FACT(`${k}.band`, band)
  FACT(`${k}.bandAndNoteBothInSight`, { bandTop: band.box.y, noteTop: m.box.y, apart: m.box.y - (band.box.y + band.box.h), retryInFront: band.retryInFront })
  await shot(s, 'd3b-p-note', [m.box, band.box], 16)
})
if (want('d3d')) await run('d3d', 'd', async s => {
  const k = 'd3d'
  await signIn(s, 'ad', 'a'); await failedSave(s, k)
  /* a second input opened over the standing band, words typed in it (the storage still refuses: nothing is saved) */
  await inputsList(s)
  const row = vis(s, '#inBody tr[data-iid], #inList [data-iid]').nth(1)
  const o = row.locator('[data-testid="in-open"]'); await hit(s, (await o.count()) ? o.first() : row, 700)
  FACT(`${k}.typed`, await typeWords(s, '#inpEditRmk', 'N175 typed words')); FACT(`${k}.window`, await inputWin(s))
  await pickerOpenedAndClosed(s, k)
  await raise(s, N.d3d); await under(s, k, '#sqnMenuBtn')
  const m = await noteFacts(s, k, N.d3d, { picker: '#sqnMenuBtn', ...BANDSELS, ...WINSELS })
  const band = await bandNow(s); FACT(`${k}.band`, band)
  const w = await boxOf(s, '.inpedwin')
  await shot(s, 'd3d-d-note', [m.box, m.boxes.picker, band.box, { x: w.x, y: w.y, w: w.w, h: 110 }], 16)
})

/* d3c - the lit bell. The real state is tried first: an input of his own on a Saturday with its OIL question not yet
   answered lights the bell, and a tap on it then acts directly (ui/topstate.ts bellTap). */
if (want('d3c')) await run('d3c', 'd', async s => {
  const k = 'd3c', { page } = s
  await signIn(s, 'ad', 'a')
  const lit = () => page.evaluate(() => { const b = [...document.querySelectorAll('#notifyBell')].find(e => e.getBoundingClientRect().width > 0); return { on: b.classList.contains('on'), label: b.getAttribute('aria-label') || b.title || null } })
  FACT(`${k}.bellBefore`, await lit())
  await inputsList(s); await hit(s, '#inNew', 600)
  const v = await page.evaluate(() => [...document.querySelector('#inpEditPerson').options].find(x => /Saber/.test(x.textContent))?.value)
  if (v) await page.selectOption('#inpEditPerson', v)
  /* a duty or commitment (only those ask the OIL question - leavewar/sync.ts oilPendingFor): the first type the window
     lists under a heading of duties, else Appointment */
  const types = await page.evaluate(() => { const e = document.querySelector('.inpedwin select:not(#inpEditPerson)'); return e ? [...e.options].map(o => ({ group: o.parentElement.tagName === 'OPTGROUP' ? o.parentElement.label : '', text: o.textContent.trim(), value: o.value })) : [] })
  FACT(`${k}.typesOffered`, types.map(t => (t.group ? t.group + ': ' : '') + t.text))
  const pickT = types.find(t => /dut|commit/i.test(t.group)) || types.find(t => /^Appointment$/i.test(t.text))
  if (pickT) { await page.selectOption('.inpedwin select:not(#inpEditPerson)', pickT.value); await wait(s, 300) }
  FACT(`${k}.newInput`, { person: await page.evaluate(() => { const e = document.querySelector('#inpEditPerson'); return e.options[e.selectedIndex]?.textContent }), type: await page.evaluate(() => { const e = document.querySelector('.inpedwin select:not(#inpEditPerson)'); return e ? e.options[e.selectedIndex]?.textContent : null }) })
  const day = () => page.locator('.floatwin.inpedwin button[aria-label^="Sat 5 Dec 2026"]').first()
  for (let i = 0; i < 12 && !(await day().count()); i++) await hit(s, page.locator('.floatwin.inpedwin button[aria-label="Next month"]').first(), 250)
  await hit(s, day()); await page.fill('#inpEditRmk', 'n175 weekend duty'); await hit(s, '#inpEditSave', 600)
  await scratch(s, 'd3c-1-after-save')
  FACT(`${k}.afterSave`, (await windowsNow(s)).map(w => ({ what: w.what, words: w.words.slice(0, 160), buttons: w.buttons })))
  for (let i = 0; i < 3; i++) {
    const nd = vis(s, 'button').filter({ hasText: /^No document$/ }); if (await nd.count()) await hit(s, nd.first())
    if (await vis(s, '#dlgOk').count()) await hit(s, '#dlgOk')
  }
  await wait(s, 500)
  FACT(`${k}.afterAnswers`, (await windowsNow(s)).map(w => ({ what: w.what, words: w.words.slice(0, 160), buttons: w.buttons })))
  for (let i = 0; i < 3 && (await windowsNow(s)).length; i++) { await page.keyboard.press('Escape'); await wait(s, 400) }
  /* the new input is thrown away by its own Cancel (nothing was filed) */
  const cancel = vis(s, '.inpedwin button').filter({ hasText: /^Cancel$/ }); if (await cancel.count()) await hit(s, cancel.first(), 500)
  FACT(`${k}.newInputThrownAway`, !(await vis(s, '.inpedwin').count()))
  await scratch(s, 'd3c-2-settled')
  const bell = await lit(); FACT(`${k}.bellLit`, bell)
  /* NOT RAISED BY THE APP (25 Nov 26): the window asks the OIL question at Save ("Does it deserve FO…? Yes: credit FO ·
     No OIL · Back", Add greyed until it is answered), so his own input cannot be filed with the question left open by
     these presses. THE STAND-IN, named: the bell is lit by giving the real bell button the app's own lit class ('on') -
     its look only; nothing waits behind it. */
  if (!bell.on) await page.evaluate(() => { const b = [...document.querySelectorAll('#notifyBell')].find(e => e.getBoundingClientRect().width > 0); b.classList.add('on'); window.__n175bell = new MutationObserver(() => { if (!b.classList.contains('on')) b.classList.add('on') }); window.__n175bell.observe(b, { attributes: true, attributeFilter: ['class'] }) })
  FACT(`${k}.litBy`, bell.on ? 'the app itself: his own input on Sat 5 Dec with its OIL question unanswered (a tap on the bell would open that question directly)' : 'A STAND-IN: the app would not leave his own OIL question open by these presses (it asks at Save), so the real bell button was given the app\'s own lit look (its class "on"); no question waits behind it')
  /* another input opened, words typed */
  const row = vis(s, '#inBody tr[data-iid], #inList [data-iid]').filter({ hasNotText: /Saber/ }).first()
  const o = row.locator('[data-testid="in-open"]'); await hit(s, (await o.count()) ? o.first() : row, 700)
  FACT(`${k}.typed`, await typeWords(s, '#inpEditRmk', 'N175 typed words')); FACT(`${k}.window`, await inputWin(s))
  FACT(`${k}.bell`, { box: await boxOf(s, '#notifyBell'), covered: await covered(s, '#notifyBell'), ...(await lit()) })
  await raise(s, N.d3c); await under(s, k, '#notifyBell')
  const m = await noteFacts(s, k, N.d3c, { bell: '#notifyBell', ...WINSELS })
  const w = await boxOf(s, '.inpedwin')
  await shot(s, 'd3c-d-note', [m.box, m.boxes.bell, { x: w.x, y: w.y, w: w.w, h: 110 }], 16)
})
await closeAll()
void go
