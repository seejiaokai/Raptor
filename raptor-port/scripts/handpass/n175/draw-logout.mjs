// draw-logout - [MSQ-PICK-GUARD] the second questions page, drawings D1 and D4: Logout's questions (chat 175, 25 Nov 26).
// Every card is the app's own question card built again from its captured markup (./draw-lib.mjs askCard) and hung
// from the Logout control pressed, by the app's own placing rule; Logout itself is NOT pressed (today it would end the
// session) - the card is drawn as the build would raise it.
//  D1 - a save has failed ("Not saved — keep this page open", Retry; the stand-in: the browser's storage refuses every
//       write), Logout pressed. d1a: the change kept through Logout (today's code); d1b: the change dropped at Logout.
//       Desktop: the card hangs from the bar's Logout. Phone: Logout lives in the ☰ menu, so the menu is open and the
//       card hangs from its Logout line.
//  D4 - Logout over typed work, a desktop: d4a an Input window, today's words; d4b the proposed words; d4c Admin →
//       Users, an opened row with typing; d4d Inputs settings → Calendar → Add a holiday, a name typed.
//   node raptor-port/scripts/handpass/n175/draw-logout.mjs        (ONLY=d1a-d,d1a-p,d1b-d,d1b-p,d4a,d4b,d4c,d4d)
// Pictures: drawn/<id>-<d|p>-logout[-crop].png. FACT lines: the card's words, buttons, box, lines; what it lies over.
import { closeAll, FACT, signIn, go, wait, boxOf, covered, vis, hit, run, shot, scratch, want, failedSave, bandNow, askCard, openInput, typeWords, inputWin, windowsNow, openUsersRow, openHolidayAdd, R } from './draw-lib.mjs'

const D1 = {
  d1a: { question: 'Your last changes aren\'t saved yet. Log out anyway?', buttons: [['Log out', 'plain'], ['Stay', 'primary']] },
  d1b: { question: 'Your last changes aren\'t saved. Log out and lose them?', buttons: [['Discard and log out', 'danger'], ['Stay', 'primary']] },
}
const BAND = { band: '.savestat.failed', retry: '.savestat.failed button' }
for (const id of ['d1a', 'd1b']) {
  if (want(`${id}-d`)) await run(`${id}.d`, 'd', async s => {
    const k = `${id}.d`
    await signIn(s, 'ad', 'a'); await failedSave(s, k)
    FACT(`${k}.logout`, { box: await boxOf(s, '#logout'), covered: await covered(s, '#logout') })
    const c = await askCard(s, k, { at: '#logout', ...D1[id], sels: BAND })
    const band = await bandNow(s); FACT(`${k}.band`, band)
    await shot(s, `${id}-d-logout`, [c.box, c.control, band.box], 16)
  })
  if (want(`${id}-p`)) await run(`${id}.p`, 'p', async s => {
    const k = `${id}.p`
    await signIn(s, 'ad', 'a'); await failedSave(s, k)
    await hit(s, '#burger', 500)
    FACT(`${k}.menuOpen`, await s.page.evaluate(() => !!document.querySelector('#drawer')?.classList.contains('open')))
    FACT(`${k}.logout`, { box: await boxOf(s, '#drawerLogout'), covered: await covered(s, '#drawerLogout') })
    const c = await askCard(s, k, { at: '#drawerLogout', ...D1[id], sels: BAND })
    const band = await bandNow(s); FACT(`${k}.band`, band)
    FACT(`${k}.bandInSight`, band.retryInFront ? 'Retry is in front' : 'the menu covers the band: its Retry cannot be seen or pressed while the menu is open')
    await shot(s, `${id}-p-logout`, [c.box, c.control, band.box], 16)
  })
}

/* D4 - Logout over typed work, a desktop */
const WIN = { windowTitle: '.inpedwin .win-ttl', windowX: '.inpedwin .win-x', window: '.inpedwin' }
const D4 = {
  d4a: { question: 'This input has unsaved changes. Close it and lose them?', buttons: [['Discard and close', 'danger'], ['Keep editing', 'primary']] },
  d4b: { question: 'This input has unsaved changes. Log out and lose them?', buttons: [['Discard and log out', 'danger'], ['Keep editing', 'primary']] },
  d4c: { question: 'The open row has unsaved changes. Log out and lose them?', buttons: [['Discard and log out', 'danger'], ['Keep editing', 'primary']] },
  /* redrawn 25 Nov 26 on the host's word (a fresh Fable's read of the words): the window named by its own title, in curly quotes */
  d4d: { question: '“Add a holiday” has unsaved changes. Log out and lose them?', buttons: [['Discard and log out', 'danger'], ['Keep editing', 'primary']] },
}
for (const id of ['d4a', 'd4b']) if (want(id)) await run(id, 'd', async s => {
  await signIn(s, 'ad', 'a'); FACT(`${id}.opened`, await openInput(s, 0, 'N175 typed words'))
  FACT(`${id}.window`, await inputWin(s))
  FACT(`${id}.logout`, { box: await boxOf(s, '#logout'), covered: await covered(s, '#logout') })
  const c = await askCard(s, id, { at: '#logout', ...D4[id], sels: WIN })
  const w = await boxOf(s, '.inpedwin')
  await shot(s, `${id}-d-logout`, [c.box, c.control, { x: w.x, y: w.y, w: w.w, h: 120 }], 16)
})
if (want('d4c')) await run('d4c', 'd', async s => {
  await signIn(s, 'ad', 'a')
  const row = await openUsersRow(s); FACT('d4c.row', row)
  FACT('d4c.logout', { box: await boxOf(s, '#logout'), covered: await covered(s, '#logout') })
  const c = await askCard(s, 'd4c', { at: '#logout', ...D4.d4c, sels: { row: row.rowSel, typedBox: row.boxSel } })
  const rb = await boxOf(s, row.rowSel)
  FACT('d4c.rowBox', rb)
  await shot(s, 'd4c-d-logout', [c.box, c.control, rb], 16)
})
if (want('d4d')) await run('d4d', 'd', async s => {
  await signIn(s, 'ad', 'a')
  const h = await openHolidayAdd(s); FACT('d4d.typed', h)
  FACT('d4d.windows', (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 90)))
  const cov = await covered(s, '#logout')
  FACT('d4d.logout', { box: await boxOf(s, '#logout'), covered: cov })
  if (cov !== 'free') { FACT('d4d.notDrawn', 'Logout is covered over this window on a desktop: ' + cov); await scratch(s, 'd4d-covered'); return }
  const c = await askCard(s, 'd4d', { at: '#logout', ...D4.d4d, sels: { typedBox: h.boxSel } })
  const tb = await boxOf(s, h.boxSel)
  const win = await s.page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 0); const w = e?.closest('.floatwin, [role=dialog], .modal, dialog'); if (!w) return null; const b = w.getBoundingClientRect(); return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height), what: w.className } }, h.boxSel)
  FACT('d4d.window', win)
  await shot(s, 'd4d-d-logout', [c.box, c.control, win || tb], 16)
})
await closeAll()
void go; void wait; void vis; void typeWords; void R
