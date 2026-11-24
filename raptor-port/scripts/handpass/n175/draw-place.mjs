// draw-place - [MSQ-PICK-GUARD] the second questions page, drawings D5 and D6 (chat 175, 25 Nov 26).
//  D5 - where the note stands between a phone and a desktop. At a small tablet upright (t, 768x1024) and a phone on its
//       side (ps, 874x402): a window open (the Input window, or - where the squadron control cannot be reached over it at
//       that size - Leave War's My leave), 149 picked: d5a the note just under the control pressed (a desktop's way), d5b
//       the note at the foot (a phone's way). At a phone (p): Inputs settings open (its own buttons at its foot), 149
//       picked from ☰: d5c the note at the foot (D2590), d5d the note at the top (D731 (1)).
//       The note is the app's own (window.toast(text, 'blocked')); only its place is changed, each place named in a FACT.
//  D6 - the greyed Undo's reason: a step made on 142, 149 picked FOR REAL, nothing done on 149. Today the Undo stays lit
//       there; the drawing greys it by the button's own greyed state (its `disabled`) and sets its hover text.
//   node raptor-port/scripts/handpass/n175/draw-place.mjs        (ONLY=d5-t,d5-ps,d5-p,d6a,d6b)
import { closeAll, FACT, signIn, go, wait, boxOf, covered, vis, hit, shut, barSq, run, shot, want, raise, place, standAt, noteFacts, openInput, typeWords, inputWin, windowsNow, reachPick, DRAWN, note } from './draw-lib.mjs'
const R1 = 'Blocked: close the open window, then pick 149.'
const GAP = 8
const listRows = (s, sel) => s.page.evaluate(sel => [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim()), sel)
const WIN = '.floatwin, .bidsheet'
const winFacts = s => s.page.evaluate(sel => [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width > 1).map(e => { const b = e.getBoundingClientRect(); return { what: String(e.className).split(/\s+/).slice(0, 2).join('.'), box: { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) }, buttonsAtFoot: [...e.querySelectorAll('button')].filter(x => { const r = x.getBoundingClientRect(); return r.width > 0 && r.top > b.bottom - 70 }).map(x => ({ words: x.textContent.trim(), y: Math.round(x.getBoundingClientRect().top), h: Math.round(x.getBoundingClientRect().height) })) } }), WIN)
/* the control a person reaches the pick by, with the window open: the bar's picker, else ☰; opened and closed again */
async function pressedAndRefused(s, k) {
  const c = { picker: await covered(s, '#sqnMenuBtn'), burger: await covered(s, '#burger') }
  FACT(`${k}.reach`, c)
  if (c.picker === 'free') {
    await hit(s, '#sqnMenuBtn', 400); FACT(`${k}.listOpened`, await listRows(s, '#sqnMenu .sqm-row'))
    await hit(s, '#sqnMenuBtn', 400); if ((await listRows(s, '#sqnMenu .sqm-row')).length) { if (s.desk) await s.page.keyboard.press('Escape'); else await s.page.touchscreen.tap(s.W - 6, s.H - 6); await wait(s, 300) }
    FACT(`${k}.listClosed`, !(await listRows(s, '#sqnMenu .sqm-row')).length)
    return '#sqnMenuBtn'
  }
  if (c.burger === 'free') {
    await hit(s, '#burger', 400)
    if (!(await s.page.locator('#drawerSqnList').count())) await hit(s, '#drawerSqnBtn', 400)
    FACT(`${k}.listOpened`, await listRows(s, '#drawerSqnList .sqm-row'))
    await shut(s); FACT(`${k}.menuClosed`, !(await s.page.evaluate(() => document.querySelector('#drawer')?.classList.contains('open'))))
    return '#burger'
  }
  return null
}
const openers = {
  input: async s => { const o = await openInput(s, 0, 'N175 typed words'); return 'an Input window (' + o.who.slice(0, 24) + '), words typed' },
  myleave: async s => { await go(s, 'leavewar'); await s.page.waitForSelector('[data-testid="my-leave"]', { timeout: 15000 }); await hit(s, '[data-testid="my-leave"]', 800); return 'Leave War, My leave' },
  inputsSettings: async s => { await go(s, 'inputs'); await hit(s, '#inGear', 700); return 'Inputs calendar settings' },
}
async function underControl(s, k, ctlSel) {
  const ctl = await boxOf(s, ctlSel), bar = await boxOf(s, '.topbar')
  const p = ctl.x + ctl.w / 2 < s.W / 2 ? { top: bar.y + bar.h + GAP, left: ctl.x } : { top: bar.y + bar.h + GAP, right: Math.round(s.W - (ctl.x + ctl.w)) }
  FACT(`${k}.placed`, { where: 'just under the control pressed, 8px under the top bar', control: ctlSel, controlBox: ctl, ...p }); await place(s, p)
}
/* the foot: where the app's own note stands with no window open - its own width, in the middle, the same distance from
   the screen's foot (measured on this build at a phone: 26px) */
async function atFoot(s, k, nat) {
  let b = nat.at === 'foot' ? nat : await standAt(s, 'foot')
  /* the app holds the note's place by its own inline style, so the switch alone does not move it: it is put where this
     build's foot note stands on a phone with no window open (measured, d3a at p: 26px from the screen's foot, the same
     side gaps) */
  if (b.y < s.H / 2) { await place(s, { top: s.H - 26 - nat.h, left: nat.x, right: s.W - (nat.x + nat.w) }); b = await boxOf(s, '#toastEl') }
  FACT(`${k}.placed`, { where: 'at the foot - the app\'s own foot place for a passing note' + (nat.at === 'foot' ? ' (where the app itself put it)' : ' (the app itself put it at the top: its place switched to the foot)'), box: b }) }
async function atTop(s, k, nat) { const b = nat.at === 'top' ? nat : await standAt(s, 'top'); FACT(`${k}.placed`, { where: 'at the top - the app\'s own top place for a passing note while a window is open' + (nat.at === 'top' ? ' (where the app itself put it)' : ' (the app itself put it at the foot: its place switched to the top)'), box: b }) }
const SELS = { window: WIN, windowX: '.floatwin .win-x, .bidsheet [aria-label^="Close"]', picker: '#sqnMenuBtn', burger: '#burger' }
async function sizeCase(sz, tag) {
  for (const win of ['input', 'myleave']) {
    let done = false
    await run(`d5.${tag}.${win}`, sz, async s => {
      const k0 = `d5.${tag}`
      await signIn(s, 'ad', 'a'); const what = await openers[win](s)
      FACT(`${k0}.window`, { what, windows: await winFacts(s) })
      const ctl = await pressedAndRefused(s, `${k0}.${win}`)
      if (!ctl) { FACT(`${k0}.${win}.notReachable`, 'neither the squadron picker nor ☰ can be reached over this window at this size'); return }
      for (const [id, how] of [['d5a', 'under'], ['d5b', 'foot']]) {
        const k = `${id}.${tag}`
        const nat = await raise(s, R1); FACT(`${k}.theAppsOwnPlace`, nat)
        if (how === 'under') await underControl(s, k, ctl); else await atFoot(s, k, nat)
        const m = await noteFacts(s, k, R1, SELS)
        const wf = await winFacts(s)
        FACT(`${k}.overWindowButtons`, wf.flatMap(w => w.buttonsAtFoot.filter(b => b.y < m.box.y + m.box.h && b.y + b.h > m.box.y && m.box.x < w.box.x + w.box.w && m.box.x + m.box.w > w.box.x).map(b => b.words)))
        FACT(`${k}.state`, { squadron: await barSq(s), window: what })
        const cb = await boxOf(s, ctl)
        await shot(s, `${id}-${tag}-note`, how === 'under' ? [m.box, cb] : [m.box, { x: m.box.x, y: Math.max(0, m.box.y - 150), w: m.box.w, h: 150 }], 16)
      }
      done = true
    })
    if (done) break
  }
}
if (want('d5-t')) await sizeCase('t', 't')
if (want('d5-ps')) await sizeCase('ps', 'ps')
if (want('d5-p')) await run('d5.p', 'p', async s => {
  const k0 = 'd5.p'
  await signIn(s, 'ad', 'a'); const what = await openers.inputsSettings(s)
  FACT(`${k0}.window`, { what, windows: await winFacts(s) })
  FACT(`${k0}.reach`, { picker: await covered(s, '#sqnMenuBtn'), burger: await covered(s, '#burger') })
  if ((await covered(s, '#burger')) !== 'free') throw new Error('☰ is covered over this window')
  await hit(s, '#burger', 400)
  if (!(await s.page.locator('#drawerSqnList').count())) await hit(s, '#drawerSqnBtn', 400)
  FACT(`${k0}.listOpened`, await listRows(s, '#drawerSqnList .sqm-row'))
  await shut(s)
  FACT(`${k0}.afterMenu`, { menuClosed: !(await s.page.evaluate(() => document.querySelector('#drawer')?.classList.contains('open'))), windows: (await windowsNow(s)).map(w => w.what) })
  for (const [id, how] of [['d5c', 'foot'], ['d5d', 'top']]) {
    const k = `${id}.p`
    const nat = await raise(s, R1); FACT(`${k}.theAppsOwnPlace`, { ...nat, reads: nat.y < s.H / 2 ? 'the app itself puts it at the top while this window is open' : 'the app itself puts it at the foot while this window is open' })
    if (how === 'foot') await atFoot(s, k, nat); else await atTop(s, k, nat)
    const m = await noteFacts(s, k, R1, SELS)
    const wf = await winFacts(s)
    FACT(`${k}.windowButtonsAtFoot`, wf.map(w => ({ window: w.what, buttons: w.buttonsAtFoot })))
    FACT(`${k}.coversWindowButtons`, wf.flatMap(w => w.buttonsAtFoot.filter(b => b.y < m.box.y + m.box.h && b.y + b.h > m.box.y).map(b => b.words)))
    await shot(s, `${id}-p-note`, [m.box, how === 'foot' ? { x: 0, y: m.box.y - 160, w: s.W, h: 160 } : { x: 0, y: 0, w: s.W, h: 200 }], 16)
  }
})

/* D6 */
const UNDO = '[aria-label="Undo"]'
const REASON = 'Pick 142 to undo your changes there.'
const undoNow = s => s.page.evaluate(sel => { const b = [...document.querySelectorAll(sel)].find(e => e.getBoundingClientRect().width > 0); if (!b) return null; const r = b.getBoundingClientRect(), c = getComputedStyle(b); return { id: b.id, title: b.title, greyed: b.disabled, box: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }, opacity: c.opacity, colour: c.color } }, UNDO)
async function stepOn142ThenPick149(s, k) {
  await signIn(s, 'ad', 'a')
  const o = await openInput(s, 0, null); const typed = await typeWords(s, '#inpEditRmk', 'N175 a step on 142'); await hit(s, '#inpEditSave', 900)
  FACT(`${k}.stepOn142`, { input: o.who.slice(0, 30), typed, windowClosed: !(await vis(s, '.inpedwin').count()), undo: await undoNow(s) })
  const p = await reachPick(s, 149, 'bar'); await wait(s, 600)
  FACT(`${k}.picked149`, { pressed: !!p.pressed, squadron: await barSq(s) })
  FACT(`${k}.today.undoOn149`, await undoNow(s))
  if (!/149/.test(await barSq(s))) throw new Error('149 was not picked')
  /* THE DRAWING: the button's own greyed state, and its hover text */
  await s.page.evaluate(([sel, why]) => { const b = [...document.querySelectorAll(sel)].find(e => e.getBoundingClientRect().width > 0); b.disabled = true; b.title = why; window.__n175undo = new MutationObserver(() => { if (!b.disabled) b.disabled = true; if (b.title !== why) b.title = why }); window.__n175undo.observe(b, { attributes: true }) }, [UNDO, REASON])
  await wait(s, 200)
  const u = await undoNow(s); FACT(`${k}.drawn.undo`, u)
  return u
}
if (want('d6a')) await run('d6a', 'd', async s => {
  const u = await stepOn142ThenPick149(s, 'd6a')
  await shot(s, 'd6a-d-undo', [{ x: u.box.x - 260, y: 0, w: 560, h: 110 }], 0)
  /* THE HOVER TEXT ITSELF is the browser's own label (the button's title), which no screenshot holds. In this second
     picture it is IMITATED - a small plain label under the pointer, as Chrome on Windows draws one - so he can read the
     words where they would show. It is the browser's part, not the app's, and the one thing here drawn by hand. */
  await s.page.evaluate(([b, why]) => { const d = document.createElement('div'); d.id = 'n175tip'; d.textContent = why; Object.assign(d.style, { position: 'fixed', left: (b.x + 6) + 'px', top: (b.y + b.h + 14) + 'px', zIndex: 2147483000, background: '#2b2b2b', color: '#f1f1f1', border: '1px solid #5f5f5f', borderRadius: '4px', padding: '4px 8px', font: '12px "Segoe UI", system-ui, sans-serif', whiteSpace: 'nowrap', boxShadow: '0 2px 6px rgba(0,0,0,.4)' }); document.body.appendChild(d) }, [u.box, REASON])
  const tip = await boxOf(s, '#n175tip'); FACT('d6a.hoverText', { words: REASON, imitated: 'the browser\'s own hover label, drawn by hand for this picture only', box: tip, onScreen: tip.x + tip.w <= s.W })
  await s.page.screenshot({ path: `${DRAWN}/d6a-d-undo-hover.png` })
  await s.page.screenshot({ path: `${DRAWN}/d6a-d-undo-hover-crop.png`, clip: { x: Math.max(0, u.box.x - 260), y: 0, width: 560, height: 110 } })
  note('picture', 'd6a-d-undo-hover.png + -crop')
})
if (want('d6b')) await run('d6b', 'p', async s => {
  const u = await stepOn142ThenPick149(s, 'd6b')
  FACT('d6b.onAPhone', 'a greyed button shows no hover text on an iPhone: nothing is added, and a tap on it does nothing')
  await shot(s, 'd6b-p-undo', [{ x: 0, y: 0, w: s.W, h: 100 }], 0)
  void u
})
await closeAll()
void inputWin
