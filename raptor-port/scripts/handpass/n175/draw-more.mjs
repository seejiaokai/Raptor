// draw-more - [MSQ-PICK-GUARD] the second questions page, the five drawings added after the words' read (chat 175,
// 25 Nov 26). d4d's redraw is in draw-logout.mjs (ONLY=d4d); d7a is draw-refresh.mjs. Here:
//  d3e (d): Saber opens My leave on the Leave War, presses the Inputs tab (the window no longer in sight), then the
//           bar's picker. FIRST pressed: is the My leave window still open when he goes back to the Leave War tab without
//           picking? Only if it is, the note is drawn under the picker.
//  d3f (d): Admin → Users, "Give access" under Waiting for access opened with words typed (presser P2's p2-users case b
//           way: a name on no list asks for access to 142 by the sign-in card's own "Request access", in a first
//           browser; its saved data copied over), 149 picked.
//  d6c (p): a step made on 142, 149 picked for real, Undo greyed (the drawing, as d6b) - then what a tap on the greyed
//           Undo would show: the app's PLAIN passing note (window.toast(text, 'warn'), the call ui/topstate.ts makes for
//           "Nothing to undo."), at the foot.
//   node raptor-port/scripts/handpass/n175/draw-more.mjs        (ONLY=d3e,d3f,d6c)
import { writeFileSync } from 'node:fs'
import { mk, closeAll, FACT, signIn, go, wait, boxOf, vis, hit, barSq, run, shot, want, raise, place, noteFacts, openInput, typeWords, reachPick, TMP } from './draw-lib.mjs'
const GAP = 8
const listRows = (s, sel) => s.page.evaluate(sel => [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim()), sel)
async function pickerOpenedAndClosed(s, k) {
  await hit(s, '#sqnMenuBtn', 400); FACT(`${k}.listOpened`, await listRows(s, '#sqnMenu .sqm-row'))
  await hit(s, '#sqnMenuBtn', 400); if ((await listRows(s, '#sqnMenu .sqm-row')).length) { await s.page.keyboard.press('Escape'); await wait(s, 300) }
  FACT(`${k}.listClosed`, !(await listRows(s, '#sqnMenu .sqm-row')).length)
}
async function underPicker(s, k) {
  const ctl = await boxOf(s, '#sqnMenuBtn'), bar = await boxOf(s, '.topbar')
  const p = { top: bar.y + bar.h + GAP, left: ctl.x }; FACT(`${k}.placed`, { where: 'just under the picker, 8px under the top bar', controlBox: ctl, ...p }); await place(s, p)
}
const pageOn = s => s.page.evaluate(() => document.querySelector('.page.on')?.id || null)
const myLeaveWin = s => s.page.evaluate(() => { const all = [...document.querySelectorAll('.bidsheet, .floatwin, [role=dialog]')]; const shown = all.filter(e => { const b = e.getBoundingClientRect(), c = getComputedStyle(e); return b.width > 2 && b.height > 2 && c.visibility !== 'hidden' && c.display !== 'none' }); return { inPage: all.length, inSight: shown.map(e => String(e.className).split(/\s+/).slice(0, 2).join('.') + ': ' + e.innerText.replace(/\s+/g, ' ').slice(0, 50)) } })

if (want('d3e')) await run('d3e', 'd', async s => {
  const k = 'd3e', N = 'Blocked: close the open window on the Leave War, then pick 149.'
  await signIn(s, 'ad', 'a')
  await go(s, 'leavewar'); await s.page.waitForSelector('[data-testid="my-leave"]', { timeout: 15000 }); await hit(s, '[data-testid="my-leave"]', 800)
  FACT(`${k}.1.opened`, { page: await pageOn(s), ...(await myLeaveWin(s)) })
  await go(s, 'inputs'); await wait(s, 600)
  FACT(`${k}.2.onInputs`, { page: await pageOn(s), ...(await myLeaveWin(s)) })
  /* the check asked for: back to the Leave War tab, nothing picked - is the window still open? */
  await go(s, 'leavewar'); await wait(s, 900)
  const back = { page: await pageOn(s), ...(await myLeaveWin(s)) }
  FACT(`${k}.3.backOnTheLeaveWar`, back)
  const still = back.inSight.length > 0
  FACT(`${k}.windowStillOpenOnComingBack`, still)
  if (!still) { FACT(`${k}.notDrawn`, 'the My leave window is NOT open when he comes back to the Leave War tab: leaving the tab closed it, so there is no open window for the note to speak of'); return }
  await go(s, 'inputs'); await wait(s, 600)
  FACT(`${k}.4.onInputsAgain`, { page: await pageOn(s), ...(await myLeaveWin(s)) })
  await pickerOpenedAndClosed(s, k)
  await raise(s, N); await underPicker(s, k)
  const m = await noteFacts(s, k, N, { picker: '#sqnMenuBtn' })
  FACT(`${k}.state`, { squadron: await barSq(s), page: await pageOn(s) })
  await shot(s, 'd3e-d-note', [m.box, m.boxes.picker, { x: 0, y: 0, w: 760, h: 150 }], 16)
})

if (want('d3f')) {
  const k = 'd3f', N = 'Blocked: finish or cancel giving access, then pick 149.'
  let st = null
  /* SET-UP, by presses: a name on no list asks for access to 142 */
  await run(`${k}.setup`, 'd', async s => {
    const { page } = s
    await page.goto('http://localhost:4700/'); await page.waitForSelector('#luser')
    await page.fill('#luser', 'n175wait'); await page.fill('#lpass', 'x'); await page.click('#loginForm button[type=submit]')
    await page.waitForSelector('#accForm', { timeout: 15000 })
    await page.selectOption('#accSqn', { label: '142' }); await page.fill('#accCs', 'Newbie'); await page.selectOption('#accSeat', { label: 'Pilot' })
    const cat = await page.evaluate(() => [...document.querySelector('#accCat').options].map(o => o.value).find(v => v)); await page.selectOption('#accCat', cat)
    await hit(s, '#accSend', 900); await hit(s, '#accOut', 900)
    st = `${TMP}/users-wait-d.json`; writeFileSync(st, JSON.stringify(await s.ctx.storageState()))
    FACT(`${k}.setup`, 'a name on no list ("n175wait", callsign Newbie) asked for access to 142 by the sign-in card\'s Request access; the saved data copied into the drawing\'s browser')
  })
  if (st) {
    const s = await mk('d', { storageState: st })
    try {
      await signIn(s, 'ad', 'a')
      await go(s, 'admin'); await wait(s, 700)
      if (await vis(s, '.adm-back').count()) await hit(s, '.adm-back', 500)
      const t = vis(s, '#page-admin button.adm-cat').filter({ hasText: /^Users/ }); if (await t.count()) await hit(s, t.first(), 700)
      FACT(`${k}.waitingLine`, (await s.page.locator('#page-admin').innerText()).replace(/\s+/g, ' ').match(/(WAITING FOR ACCESS|Waiting for access ·).{0,90}/)?.[0])
      await hit(s, vis(s, '[data-approve]').first(), 700)
      if (!(await vis(s, '#apvCs').count())) { const nb = vis(s, '#page-admin button').filter({ hasText: /^New person$/ }); if (await nb.count()) { await hit(s, nb.first(), 400); FACT(`${k}.pressedNewPerson`, true) } }
      const typed = await typeWords(s, '#apvCs', 'N175 typed'); await s.page.mouse.move(1, 1)
      const form = await s.page.evaluate(() => { const e = document.querySelector('#apvGo')?.closest('.acc-edit, [data-approving]') || document.querySelector('[data-approving]'); if (!e) return null; e.scrollIntoView({ block: 'center' }); const b = e.getBoundingClientRect(); return { words: e.innerText.replace(/\s+/g, ' ').slice(0, 140), buttons: [...e.querySelectorAll('button')].filter(x => x.getBoundingClientRect().width > 0).map(x => x.textContent.trim()), box: { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) } } })
      FACT(`${k}.form`, { typed, ...form })
      if (typed !== 'N175 typed' || !form) throw new Error('the Give access form with typed words is not standing')
      await wait(s, 300)
      await pickerOpenedAndClosed(s, k)
      await raise(s, N); await underPicker(s, k)
      const m = await noteFacts(s, k, N, { picker: '#sqnMenuBtn', form: '[data-approving]', typedBox: '#apvCs' })
      FACT(`${k}.state`, { squadron: await barSq(s), formStillOpen: !!(await boxOf(s, '#apvGo')), typed: await vis(s, '#apvCs').first().inputValue() })
      await shot(s, 'd3f-d-note', [m.box, m.boxes.picker, m.boxes.form], 16)
    } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 240)); process.exitCode = 1 } finally { await s.ctx.close().catch(() => {}) }
  }
}

if (want('d6c')) await run('d6c', 'p', async s => {
  const k = 'd6c', WHY = 'Pick 142 to undo your changes there.', UNDO = '[aria-label="Undo"]'
  await signIn(s, 'ad', 'a')
  const o = await openInput(s, 0, null); const typed = await typeWords(s, '#inpEditRmk', 'N175 a step on 142'); await hit(s, '#inpEditSave', 900)
  FACT(`${k}.stepOn142`, { input: o.who.slice(0, 30), typed, windowClosed: !(await vis(s, '.inpedwin').count()) })
  const p = await reachPick(s, 149, 'bar'); await wait(s, 600)
  FACT(`${k}.picked149`, { pressed: !!p.pressed, squadron: await barSq(s) })
  if (!/149/.test(await barSq(s))) throw new Error('149 was not picked')
  /* the plain note the app raises today for an Undo with nothing to take, read for its look: the real "Nothing to undo."
     cannot be raised here (142's step is still on the list today), so the same call is made with the new words */
  await s.page.evaluate(([sel, why]) => { const b = [...document.querySelectorAll(sel)].find(e => e.getBoundingClientRect().width > 0); b.disabled = true; b.title = why; window.__n175undo = new MutationObserver(() => { if (!b.disabled) b.disabled = true }); window.__n175undo.observe(b, { attributes: true }) }, [UNDO, WHY])
  await s.page.evaluate(w => window.toast(w, 'warn'), WHY); await wait(s, 450)
  const r = await s.page.evaluate(() => {
    const t = document.querySelector('#toastEl'); t.getAnimations?.().forEach(a => a.cancel()); t.style.opacity = '1'
    window.__n175hold = new MutationObserver(() => { if (t.style.opacity !== '1') t.style.opacity = '1' }); window.__n175hold.observe(t, { attributes: true, attributeFilter: ['style'] })
    const b = t.getBoundingClientRect(), c = getComputedStyle(t)
    const rg = document.createRange(); rg.selectNodeContents(t); const tops = []; for (const q of rg.getClientRects()) { if (q.width < 2) continue; const m = q.top + q.height / 2; if (!tops.some(y => Math.abs(y - m) < q.height * 0.6)) tops.push(m) }
    const u = [...document.querySelectorAll('[aria-label="Undo"]')].find(e => e.getBoundingClientRect().width > 0), ub = u.getBoundingClientRect()
    return { words: t.textContent.replace(/\s+/g, ' ').trim(), face: t.dataset.face || null, where: t.dataset.at || null, blockedSign: !!t.querySelector('.bk-sign'), box: { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) }, lines: tops.length, colours: c.backgroundColor + ' | ' + c.color + ' | ' + c.borderTopColor, onScreen: b.left >= 0 && b.right <= innerWidth && b.bottom <= innerHeight, undo: { greyed: u.disabled, box: { x: Math.round(ub.left), y: Math.round(ub.top), w: Math.round(ub.width), h: Math.round(ub.height) } } }
  })
  FACT(`${k}.note`, r)
  FACT(`${k}.raisedBy`, 'window.toast(words, "warn") - the call ui/topstate.ts makes when Undo has nothing to take; today a DISABLED button takes no tap at all, so the build must let the greyed Undo take the tap for this note to show')
  if (r.words !== WHY || r.blockedSign) throw new Error('the plain note did not draw the words: ' + JSON.stringify(r))
  await shot(s, 'd6c-p-undo', [r.box, { x: 0, y: r.box.y - 120, w: s.W, h: 120 }], 16)
  await s.page.screenshot({ path: (await import('./draw-lib.mjs')).DRAWN + '/d6c-p-undo-top-crop.png', clip: { x: 0, y: 0, width: s.W, height: 100 } })
})
await closeAll()
