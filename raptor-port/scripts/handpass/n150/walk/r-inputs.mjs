// r-inputs (chat 151, the re-walk) — fix 6 and scenarios c, c2, c3: an input window (Inputs page) left open when the page
// moves is held — a band over it, Save greyed and refusing, Close live — never editable; picking 142 again gives it back
// live.
//  c  — Hunter (Plan of 149) on 149's Inputs, an existing input's window open, switches to the member view → View-only
//       Sched; is the window still open? If so: its band, and a press on Save (pictured).
//  c2 — Ranger (View of 149) on his Inputs, a saved input's window open, picks 149 → View-only Sched, the window held with
//       the band "This is 142's. You picked 149 — close this to go on.", Save refusing; 142 again → live.
//  c3 — Hunter (Plan of 149) on his Inputs: an input's remarks changed and saved, the window opened again; 149 picked (Full
//       access) → the window held with the pick's band, the page staying Inputs; the top bar's Undo, then Redo → still
//       held, Save refusing; 142 again → live.
// SZ=d (desktop 1536) or SZ=p (WebKit phone).
import { serve, stop, newPage, signIn, as, step, rec, pic, picsFor, press, openMenu, menuPick, barPick, go, grant, finish, note, facts, state, PICS } from './vlib.mjs'
import { check, shutMenu, over, T } from './r-lib.mjs'
const SZ = process.env.SZ || 'd'
console.log('r-inputs v2 (the window read by its buttons)', SZ)
picsFor('r-inputs-' + SZ)
const BAND = (from, to) => `This is ${from}'s. You picked ${to} — close this to go on.`
const norm = t => (t || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim()
const pick = (s, n, name) => s.desk ? barPick(s, n, name) : menuPick(s, n, name)
const pagesOffered = st => (st.tabs.length ? st.tabs : st.items)
/* the input window as drawn: its band's words, held parts, the Save button's state, the remarks box's value */
const inWin = s => s.page.evaluate(() => {
  /* found by its own Cancel or Save button where drawn (v1 read the window's test id, whose box measured 0 once the page
     had moved — the window was on screen in the pictures: a read of the script's making) */
  const btn = [...document.querySelectorAll('#inpEditCancel, #inpEditSave')].find(e => e.getBoundingClientRect().width > 0)
  if (!btn) return null
  const fw = btn.closest('.floatwin') || btn.closest('[role=dialog]') || btn.parentElement.parentElement
  const band = [...fw.querySelectorAll('[data-testid="inped-moveband"], .moveband')].find(b => b.getBoundingClientRect().width > 0)
  const save = fw.querySelector('#inpEditSave'); const rmk = fw.querySelector('#inpEditRmk')
  const r = save && save.getBoundingClientRect()
  const top = r ? document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) : null
  return {
    title: (fw.querySelector('.win-bar, .airpop-head')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60),
    band: band ? band.textContent.replace(/\s+/g, ' ').replace(/Close$/, '').trim() : null,
    held: fw.querySelectorAll('[data-heldro]').length,
    save: save ? { shown: r.width > 0, inert: !!save.closest('[inert]'), opacity: getComputedStyle(save.closest('[data-heldro]') || save).opacity, reached: !!top && (top === save || save.contains(top)) } : null,
    rmk: rmk ? rmk.value : null,
    cancel: !!fw.querySelector('#inpEditCancel'),
  }
})
const toast = s => s.page.evaluate(() => { const t = document.querySelector('#toastEl'); return t && t.getBoundingClientRect().height > 0 ? t.textContent.replace(/\s+/g, ' ').trim() : null })
/* open the first input in the list view (the list button, then a row's open control) */
/* the list view (the probe found no rows in its opening range: "All dates" is the way to rows), then a row — the
   desktop table's open control, the phone's card — whose words hold `who` where given */
async function openFirstInput(s, name, who) {
  const { page } = s
  await go(s, 'inputs'); await page.waitForTimeout(900); await shutMenu(s)
  if (await page.locator('#inListBtn[aria-pressed="false"]').count()) await press(s, '#inListBtn')
  await page.waitForTimeout(400)
  if (!(await page.locator('#inRangePop').filter({ visible: true }).count())) await press(s, '#inRangeBtn')
  if (await page.locator('#inRangeAll').filter({ visible: true }).count()) await press(s, '#inRangeAll')
  await page.waitForTimeout(500)
  const rowSel = s.desk ? '#inBody tr[data-iid]' : '[data-testid^="inl-row-"]'
  let row = page.locator(rowSel).filter({ visible: true })
  if (who) row = row.filter({ hasText: who })
  facts[`rows-${name}`] = await row.count(); note(`${name}: ${facts[`rows-${name}`]} rows${who ? ' naming ' + who : ''}`)
  if (!(await row.count())) return false
  const r = row.first()
  await r.scrollIntoViewIfNeeded()
  const o = s.desk ? r.locator(T('in-open')).first() : r
  await press(s, o, name); await page.waitForTimeout(600)
  return !!(await inWin(s))
}
/* a press on Save as a person makes it, at its place on the screen (a held part takes no press, so no locator click) */
async function pressSaveAt(s, name) {
  const b = await s.page.evaluate(() => { const e = [...document.querySelectorAll('#inpEditSave')].find(x => x.getBoundingClientRect().width > 0); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
  if (!b) return false
  if (s.desk) await s.page.mouse.click(b.x, b.y); else await s.page.touchscreen.tap(b.x, b.y)
  if (!s.desk && name) { await s.page.waitForTimeout(60); await s.page.screenshot({ path: `${PICS}/${name}-justtapped.png` }) }
  await s.page.waitForTimeout(600); return true
}
async function switchRole(s, name) {
  if (s.desk) { const o = await over(s, '#roleBadge'); if (o !== 'self') return { pressed: false, cover: o }; await press(s, '#roleBadge'); return { pressed: true } }
  const o = await over(s, '#burger'); if (o !== 'self') return { pressed: false, cover: o }
  await openMenu(s, name && `${name}-menu`); await press(s, '#drawerRole', name && `${name}-role`); return { pressed: true }
}
async function pickWithWindow(s, n, name) {
  const o = await over(s, s.desk ? '#sqnMenuBtn' : '#burger'); if (o !== 'self') return { pressed: false, cover: o }
  await pick(s, n, name); await shutMenu(s); return { pressed: true }
}
async function closeWin(s) { if ((await over(s, '#inpEditCancel')) === 'self') await press(s, '#inpEditCancel'); else { const x = s.page.locator('[data-testid="win-inputedit"]').locator('xpath=ancestor-or-self::*[contains(@class,"floatwin")]').locator('.win-x, [aria-label="Close"]').first(); if (await x.count()) await x.click().catch(() => {}) } await s.page.waitForTimeout(400) }
/* the held window refuses Save: a press where Save is drawn changes nothing — the window, its band and its words stay */
async function saveRefuses(s, k, name) {
  const before = await inWin(s)
  await pressSaveAt(s, name)
  const after = await inWin(s), t = await toast(s)
  facts[`${k}-save-press`] = { before, after, toast: t }; note(`${k}: Save pressed while held —`, JSON.stringify({ after, toast: t }))
  return check(`${k}: Save refuses (greyed, takes no press; the window and its band stay)`, !!before?.save && (before.save.inert || !before.save.reached) && !!after && !!after.band, { save: before?.save, after: after && { band: after.band, held: after.held }, toast: t })
}
await serve()
try {
  const s = await newPage(SZ)
  const { page } = s
  await signIn(s, 'ad', 'a')
  await step('grants', async () => { await grant(s, 'prowler', '149', 'plan'); await grant(s, 'bane', '149', 'view'); await go(s, 'viewsched'); await shutMenu(s) })
  /* ---- c ---- */
  await as(s, 'ad2', 'a2')
  await step('c: Hunter on 149\'s Inputs, an input open, switch to the member view', async () => {
    await pick(s, '149', 'c-01-pick'); await shutMenu(s)
    const ok = await openFirstInput(s, 'c-02-open'); const w0 = await inWin(s)
    facts['c-a-open'] = w0; await pic(s, 'c-02-window-open')
    if (!check('c: premise — an input of 149 open', ok && (await state(s)).barMark?.startsWith('149'), w0)) return
    const sw = await switchRole(s, 'c-03'); facts['c-switch'] = sw
    if (!sw.pressed) { await pic(s, 'c-03-switch-covered'); facts['c-result'] = `NOT WALKED: the role switch covered by ${sw.cover}`; await closeWin(s); return }
    await page.waitForTimeout(600)
    const st = await rec(s, 'c-b-after-switch'); const w = await inWin(s); facts['c-b-window'] = w
    await pic(s, 'c-03-after-switch')
    check('c: lands on View-only Sched (149, two pages)', st.page === 'page-viewsched' && st.barMark?.startsWith('149') && pagesOffered(st).length === 2, { page: st.page, mark: st.barMark, pages: pagesOffered(st) })
    note('c: the window after the switch:', JSON.stringify(w))
    if (w) {
      check('c: the window still open wears a band', !!w.band, w.band)
      check('c: the window held (greyed parts)', w.held > 0, w.held)
      /* not editable: a press in its Remarks box and typing, as a person would */
      const rb = await page.evaluate(() => { const e = [...document.querySelectorAll('#inpEditRmk')].find(x => x.getBoundingClientRect().width > 0); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, inert: !!e.closest('[inert]') } })
      if (rb) {
        await page.mouse.click(rb.x, rb.y); await page.keyboard.type('c member typed', { delay: 10 }); await page.waitForTimeout(300)
        const v = (await inWin(s))?.rmk; facts['c-typed-into-remarks'] = { inert: rb.inert, value: v }
        await pic(s, 'c-03b-after-typing-in-remarks')
        check('c: its Remarks box takes no typing (not editable)', !v || !v.includes('c member typed'), { inert: rb.inert, value: v })
      }
      await saveRefuses(s, 'c', 'c-04-save'); await pic(s, 'c-04-after-save-press')
      facts['c-after-save-toast'] = await toast(s)
      await closeWin(s); const st2 = await rec(s, 'c-c-after-close'); await pic(s, 'c-05-after-close')
      check('c: its Close closes it; still View-only Sched 149', !(await inWin(s)) && st2.page === 'page-viewsched', { page: st2.page })
    } else check('c: the window closed with the switch (none left open)', true, 'no window')
    if (s.desk) await press(s, '#roleBadge'); else { await openMenu(s); await press(s, '#drawerRole') }
    await shutMenu(s); await go(s, 'viewsched'); await pick(s, '142'); await shutMenu(s)
  })
  /* ---- c3 ---- */
  await step('c3: Hunter on his Inputs, remarks saved, window again, 149 picked, Undo, Redo, 142 again', async () => {
    const ok = await openFirstInput(s, 'c3-01-open'); if (!check('c3: premise — an input of 142 open', ok && (await state(s)).barMark?.startsWith('142'), await inWin(s))) return
    const rmk = page.locator('#inpEditRmk').first()
    await rmk.fill('c3 walk remarks'); await pic(s, 'c3-01-typed')
    await press(s, '#inpEditSave', 'c3-02-save'); await page.waitForTimeout(600)
    facts['c3-a-after-save'] = { win: await inWin(s), toast: await toast(s) }; note('c3 saved:', JSON.stringify(facts['c3-a-after-save']))
    if (await inWin(s)) await closeWin(s)
    const ok2 = await openFirstInput(s, 'c3-03-open-again'); const w0 = await inWin(s)
    check('c3: opened again, the saved remarks in it', ok2 && w0?.rmk === 'c3 walk remarks', w0 && w0.rmk)
    const p = await pickWithWindow(s, '149', 'c3-04')
    if (!p.pressed) { await pic(s, 'c3-04-pick-covered'); facts['c3-result'] = `NOT WALKED: covered by ${p.cover}`; await closeWin(s); return }
    let st = await rec(s, 'c3-b-after-pick'); let w = await inWin(s); await pic(s, 'c3-04-after-pick-149')
    check('c3: the page stays Inputs, 149 in view', st.page === 'page-inputs' && st.barMark?.startsWith('149'), { page: st.page, mark: st.barMark })
    check(`c3: the window held with "${BAND('142', '149')}"`, !!w && norm(w.band) === BAND('142', '149') && w.held > 0, w)
    for (const [btn, tag] of [['#undoBtn', 'undo'], ['#redoBtn', 'redo']]) {
      const ov = await over(s, btn); facts[`c3-${tag}-over`] = ov
      if (ov !== 'self') { check(`c3: the top bar's ${tag} reachable`, false, ov); await pic(s, `c3-05-${tag}-covered`); continue }
      await press(s, btn, `c3-05-${tag}`); await page.waitForTimeout(600)
      st = await rec(s, `c3-c-after-${tag}`); w = await inWin(s); facts[`c3-${tag}-toast`] = await toast(s)
      await pic(s, `c3-05-after-${tag}`)
      note(`c3 after ${tag}:`, JSON.stringify({ w, toast: facts[`c3-${tag}-toast`], page: st.page, mark: st.barMark }))
      check(`c3: after ${tag} the window still held with the pick's band`, !!w && norm(w.band) === BAND('142', '149') && w.held > 0, w && { band: w.band, held: w.held })
    }
    if (await inWin(s)) { await saveRefuses(s, 'c3', 'c3-06-save'); await pic(s, 'c3-06-after-save-press') }
    await pickWithWindow(s, '142', 'c3-07')
    st = await rec(s, 'c3-d-142-again'); w = await inWin(s); await pic(s, 'c3-07-142-again')
    check('c3: 142 again → the window back live (no band, nothing greyed, Save reached)', !!w && !w.band && w.held === 0 && !!w.save?.reached, w)
    if (w) await closeWin(s)
  })
  /* ---- c2 ---- */
  await as(s, 'us', 'us')
  await step('c2: Ranger on his Inputs, a saved input open, picks 149, then 142 again', async () => {
    const ok = await openFirstInput(s, 'c2-01-open', 'Ranger'); const w0 = await inWin(s); facts['c2-a-open'] = w0
    await pic(s, 'c2-01-window-open')
    if (!check('c2: premise — an input of 142 open, Save offered', ok && !!w0?.save, w0)) { if (w0) await closeWin(s); return }
    const p = await pickWithWindow(s, '149', 'c2-02')
    if (!p.pressed) { await pic(s, 'c2-02-pick-covered'); facts['c2-result'] = `NOT WALKED: covered by ${p.cover}`; await closeWin(s); return }
    let st = await rec(s, 'c2-b-after-pick'); let w = await inWin(s); await pic(s, 'c2-02-after-pick-149')
    check('c2: lands on View-only Sched, 149', st.page === 'page-viewsched' && st.barMark?.startsWith('149'), { page: st.page, mark: st.barMark })
    check(`c2: the window held with "${BAND('142', '149')}"`, !!w && norm(w.band) === BAND('142', '149') && w.held > 0, w)
    if (w) { await saveRefuses(s, 'c2', 'c2-03-save'); await pic(s, 'c2-03-after-save-press') }
    await pickWithWindow(s, '142', 'c2-04')
    st = await rec(s, 'c2-c-142-again'); w = await inWin(s); await pic(s, 'c2-04-142-again')
    check('c2: 142 again → the window back live (no band, nothing greyed, Save reached)', !!w && !w.band && w.held === 0 && !!w.save?.reached, w)
    if (w) await closeWin(s)
  })
  await s.ctx.close()
} finally { finish('r-inputs-' + SZ); await stop() }
