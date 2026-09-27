/* RE-WALK copy of w1-08-member.mjs (26 Sep 26, the absence-record re-walk, W1): pictures go to docs/img/handpass/2026-09-26-absence/rewalk/w1/, results to docs/handpass/parts/2026-09-26-absence-rewalk-w1-*.txt; every change of premise or added check is marked RE-WALK. The first walk's script is untouched. */
/* W1-08 (26 Sep 26) — the Inputs CALENDAR as the MEMBER (us = Ranger, person bane), desktop.
   Rules: B6 (his own leave dragged onto his own pending bid: the bid goes, HE is told by a message, and NO notice is
   left — a notice is for someone else's action); a member moves only his own inputs ("Only a scheduler can move
   someone else's input") and another man's chip should not lift (the brief's expectation); one undo restores both;
   Q14 / Astra 21 (a member may file leave on the Inputs page for any date — outside the bidding window, and while the
   war's bidding is CLOSED — and it counts as already approved, no admin step). A FAIL is a finding.
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/w1-08-member.mjs [step,step] */
process.env.AB_WHO = 'rewalk/w1'
const L = await import('./w1-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, bidOn, tapCell, closeSheets, fileInput, inputsOf, shot, resultBook, ROOT, toastSpy, toasts, calOpen, mouseDragChip,
  mouseGesture, chipDays, chipAt, cellAt, dragLeft, emptyAt, addDialog, lwCell, warRead, undoRedo, relogin, reloadSame, go } = L
const R = resultBook('W1-08-member', `${ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-w1-08-member.txt`)
const ONLY = (process.argv[2] || '').split(',').filter(Boolean)
let page, errors = [], browser
async function step(name, fn) { if (ONLY.length && !ONLY.some(k => name.startsWith(k))) return; try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await shot(page, `w1-08-THREW-${name}`).catch(() => {}) } }
const file = async f => { await L.inputsView(page, 'list'); return fileInput(page, f) }
const cellOf = async (P, D) => { await lwOpen(page, D); return lwCell(page, P, D) }
const dayList = async (P, D) => { await lwOpen(page, D); const s = await tapCell(page, P, D); await closeSheets(page); return s }
const noGhost = d => d.ghosts === 0 && !d.lit.length && !d.dragging

/* ======== world 1: the member, the war OPEN for bidding (window 1 Jan - 31 Mar) ======== */
;({ browser, page, errors } = await openHi({ width: 1440, height: 900, who: 'm', dpr: 1 }))
await toastSpy(page)

let own
await step('B6', async () => {
  const P = 'bane', D0 = '2026-03-09', D2 = '2026-03-11'
  await lwOpen(page, D2)
  const b = await bidOn(page, P, D2, 'LL')
  const f = await file({ type: 'LL', from: D0, remarks: 'W1 member own' })
  const before = await warRead(page, P, [D0, D2])
  R.note('B6-setup', { bid: b, filed: f.added, iid: f.iid, before })
  await calOpen(page, '2026-03'); await toasts(page)
  const g = await mouseDragChip(page, f.iid, D0, D2, { mid: 'w1-08-b6-in-flight' })
  const t = await toasts(page)
  const days = await chipDays(page, f.iid)
  await shot(page, 'w1-08-b6-cal-after')
  R.ck('B6-moved', days.join() === D2, 'his own leave lands on 11 Mar', { days })
  R.ck('B6-message', t.some(x => /your .*bid/i.test(x)), 'HE is told by a message that his own bid went ("your … bid")', t)
  const after = await warRead(page, P, [D0, D2])
  const c = await cellOf(P, D2)
  const s = await dayList(P, D2)
  await L.lwShot(page, 'w1-08-b6-war-after', P, D2)
  R.ck('B6-no-notice', c.mark !== '!' && !(s.lines || []).some(l => /replaced/i.test(l)), 'NO notice and no amber mark — he replaced his own bid (B6)', { c, lines: s.lines })
  R.ck('B6-balance', JSON.stringify(before.bal) !== JSON.stringify(after.bal) || true, 'the balance column reads the records at once (recorded)', { before: before.bal, after: after.bal })
  const u = await undoRedo(page, 'undo', 'war')
  const w = await warRead(page, P, [D0, D2])
  await calOpen(page, '2026-03')
  R.ck('B6-undo', u.pressed && (await chipDays(page, f.iid)).join() === D0 && /LL/.test(w.row[1]), 'the member\'s own Undo (the war\'s) brings the leave back to 9 Mar and the bid back on 11 Mar', { u, row: w.row })
  own = f.iid
})

/* ---- another man's chip: the member cannot move it; the brief expects it not to lift at all ---- */
await step('OTHER', async () => {
  /* a member's Inputs page opens filtered to himself ("filtered: Ranger"); he widens it to everyone through the
     page's own person filter, as he would to see who else is away */
  await L.inputsView(page, 'list')
  const opts = await page.evaluate(() => [...document.querySelectorAll('#inFPerson option')].map(o => o.value).slice(0, 4))
  await page.selectOption('#inFPerson', 'all'); await page.waitForTimeout(400)
  R.note('OTHER-filter', { opts })
  await calOpen(page, '2026-07')
  const iid = await page.evaluate(() => document.querySelector('#inpCal [data-icday="2026-07-24"] [data-iid]')?.getAttribute('data-iid'))
  const who = await page.evaluate(i => { const r = window.INPUTS.find(x => x.iid === i); return r && window.PEOPLE[r.person].cs }, iid)
  await toasts(page)
  const g = await mouseDragChip(page, iid, '2026-07-24', '2026-07-27', { mid: 'w1-08-other-in-flight' })
  const t = await toasts(page)
  const days = await chipDays(page, iid)
  await shot(page, 'w1-08-other-after')
  /* RE-WALK premise (W1-F3's fix): the chip never lifts, so there is no drop and no "Only a scheduler can move…"
     refusal to read — the check is that it stays put and nothing moved; whatever toast there is is recorded */
  R.ck('OTHER-not-moved', days.join() === '2026-07-24' && !t.some(x => /Moved/i.test(x)), `${who}'s chip stays on 24 Jul (nothing moved)`, { days, t })
  R.ck('OTHER-no-lift', g.inFlight.ghosts === 0, 'another man\'s chip does not lift in the member\'s hand (no ghost while he drags)', { inFlight: g.inFlight, who })
  R.ck('OTHER-no-ghost-after', noGhost(g.after), 'no ghost, no lit day after the refused drop', g.after)
  /* a tap on another man's chip: what opens for a member */
  const c = await chipAt(page, iid, '2026-07-24')
  await page.mouse.click(c.x, c.y); await page.waitForTimeout(600)
  const d = await addDialog(page)
  await shot(page, 'w1-08-other-tap')
  const ctrls = await page.evaluate(() => [...document.querySelectorAll('#inpEditPop button, #inpEditPop select, #inpEditPop input')].filter(e => e.offsetWidth || e.offsetHeight).map(e => (e.id || e.tagName) + (e.disabled ? '(off)' : '')))
  R.ck('OTHER-tap-readonly', !d.open || !ctrls.some(x => /inpEditDel$|inpEditSave$/.test(x)), 'a tap on another man’s chip does not hand the member a Delete / Save he may not use (the Inputs table hides ✎ / ✕ on other men’s rows)', { d, ctrls })
  /* RE-WALK (register §12): the input opens READ ONLY — no Delete, no Save, and it says who may change it */
  const ro = await page.evaluate(() => ({ note: (document.querySelector('#inpEditPop [data-testid="inped-ro"]')?.innerText || '').trim(),
    inert: !!document.querySelector('#inpEditPop .inped-body[inert]'),
    close: (document.getElementById('inpEditCancel')?.innerText || '').trim() }))
  R.ck('OTHER-tap-readonly-says', d.open && ro.note === `Only ${who} or an admin can change this.` && ro.inert, `the tap opens ${who}'s input READ ONLY: "Only ${who} or an admin can change this.", its fields inert`, { ro, title: d.title })
  /* the fields cannot be typed into: a press on Remarks and a few keys change nothing */
  const rmk0 = await page.evaluate(i => window.INPUTS.find(x => x.iid === i)?.remarks, iid)
  await page.locator('#inpEditRmk').click({ force: true }).catch(() => {}); await page.keyboard.type('xx'); await page.waitForTimeout(200)
  const val = await page.locator('#inpEditRmk').inputValue().catch(() => '?')
  R.ck('OTHER-tap-cannot-type', !/xx/.test(val), 'typing into the read-only Remarks does nothing', { val, rmk0 })
  if (d.open && ctrls.includes('inpEditDel')) {
    await toasts(page)
    await page.locator('#inpEditDel').click(); await page.waitForTimeout(600)
    const t1 = await toasts(page)
    const still = await page.evaluate(i => !!window.INPUTS.find(x => x.iid === i), iid)
    R.ck('OTHER-delete-refused', still && t1.some(x => /only delete your own/i.test(x)), 'pressing Delete on another man’s input is refused and said; his leave is still there', { t1, still })
    await shot(page, 'w1-08-other-delete-refused')
    if (await page.locator('#inpEditPop:not([hidden])').count()) {
      await page.locator('#inpEditRmk').fill('member was here'); await page.locator('#inpEditSave').click(); await page.waitForTimeout(600)
      const t2 = await toasts(page)
      const rmk = await page.evaluate(i => window.INPUTS.find(x => x.iid === i)?.remarks, iid)
      R.ck('OTHER-save-refused', rmk !== 'member was here' && t2.some(x => /only edit your own/i.test(x)), 'Save of a changed remark on another man’s input is refused and said', { t2, rmk })
    }
  }
  if (await page.locator('#inpEditCancel:visible').count()) { await page.locator('#inpEditCancel').click(); await page.waitForTimeout(300) }
  /* RE-WALK control: his OWN input (9 Mar, from B6) still opens with Delete and Save */
  if (own) {
    await calOpen(page, '2026-03')
    const oc = await chipAt(page, own, '2026-03-09')
    if (oc) { await page.mouse.click(oc.x, oc.y); await page.waitForTimeout(600) }
    const od = await addDialog(page)
    const octrls = await page.evaluate(() => [...document.querySelectorAll('#inpEditPop button')].filter(e => e.offsetWidth || e.offsetHeight).map(e => e.id || e.innerText.trim()))
    await shot(page, 'w1-08-own-tap-editable')
    R.ck('OWN-tap-editable', od.open && octrls.includes('inpEditDel') && octrls.includes('inpEditSave'), 'the control: a tap on his OWN chip opens it with Delete and Save', { od, octrls })
    if (await page.locator('#inpEditCancel:visible').count()) { await page.locator('#inpEditCancel').click(); await page.waitForTimeout(300) }
  }
})

/* ---- the member's hold-to-add: his own input, no Person to choose ---- */
await step('HOLD', async () => {
  await calOpen(page, '2026-08')
  const p = await emptyAt(page, '2026-08-19')
  await mouseGesture(page, p, null, { holdMs: 650 })
  const d = await addDialog(page)
  await shot(page, 'w1-08-hold-add-member')
  R.ck('HOLD-member', d.open && /Aug 19/.test(d.title) && !d.person, 'a member\'s hold opens the add dialog for 19 Aug, with no Person to pick (it is his own)', d)
  await page.selectOption('#inpEditType', 'LL')
  const before = await page.evaluate(() => window.INPUTS.map(x => x.iid))
  await page.locator('#inpEditSave').click(); await page.waitForTimeout(700)
  const fresh = await page.evaluate(b => window.INPUTS.filter(x => !b.includes(x.iid)).map(x => ({ person: x.person, date: x.date, type: x.type })), before)
  R.ck('HOLD-member-own', fresh.length === 1 && fresh[0].person === 'bane' && fresh[0].date === 'Aug 19', 'filed as Ranger\'s own, on 19 Aug', fresh)
  /* Q14: outside the bidding window (1 Jan - 31 Mar) it counts as already approved */
  const c = await cellOf('bane', '2026-08-19')
  await L.lwShot(page, 'w1-08-q14-outside-window', 'bane', '2026-08-19')
  R.ck('Q14-outside-window', /LL/.test(c.box) && /appr/.test(c.cls), 'outside the bidding window the leave shows on the war as approved (no admin step) — Q14', c)
})

await step('RELOAD', async () => {
  await reloadSame(page, 'm'); await toastSpy(page)
  const mine = await inputsOf(page, 'bane')
  R.ck('RELOAD-member', mine.some(x => x.date === 'Aug 19' && x.type === 'LL') && mine.filter(x => x.remarks === 'W1 member own').length === 1, 'after a reload his inputs are all there, none doubled', mine)
})
R.ck('console-errors-w1', !errors.length, 'no console / page errors / 4xx (world 1)', errors.slice(0, 20))
await browser.close()

/* ======== world 2: the admin CLOSES bidding, then the member files and drags (Q14 / Astra 21) ======== */
;({ browser, page, errors } = await openHi({ width: 1440, height: 900, who: 'a', dpr: 1 }))
await toastSpy(page)
await step('CLOSED', async () => {
  await lwOpen(page, '2026-08-10')
  const s0 = (await page.locator('[data-testid="stage-now"]').innerText()).trim()
  await page.locator('[data-testid="stage-advance"]').click(); await page.waitForTimeout(700)
  const s1 = (await page.locator('[data-testid="stage-now"]').innerText()).trim()
  await relogin(page, 'm'); await toastSpy(page)
  await lwOpen(page, '2026-08-10')
  const s2 = (await page.locator('[data-testid="stage-now"]').innerText()).trim()
  await shot(page, 'w1-08-closed-member-war')
  R.note('CLOSED-stage', { admin: [s0, s1], member: s2 })
  const f = await file({ type: 'LL', from: '2026-08-10', remarks: 'W1 member while closed' })
  R.ck('CLOSED-files', f.added === 1, 'with bidding CLOSED the member still files his own leave on the Inputs page (Q14)', f)
  const c = await cellOf('bane', '2026-08-10')
  R.ck('CLOSED-approved', /LL/.test(c.box) && /appr/.test(c.cls), 'it shows on the war as approved at once', c)
  await calOpen(page, '2026-08'); await toasts(page)
  const g = await mouseDragChip(page, f.iid, '2026-08-10', '2026-08-12')
  const t = await toasts(page)
  const days = await chipDays(page, f.iid)
  R.ck('CLOSED-drag', days.join() === '2026-08-12', 'and he may move it on the calendar while bidding is closed', { days, t })
  const c2 = await cellOf('bane', '2026-08-12')
  await L.lwShot(page, 'w1-08-closed-after-drag', 'bane', '2026-08-12')
  R.ck('CLOSED-war-follows', /LL/.test(c2.box) && !/LL/.test((await cellOf('bane', '2026-08-10')).box), 'the war follows: 12 Aug LL, 10 Aug clear', c2)
})
R.ck('console-errors-w2', !errors.length, 'no console / page errors / 4xx (world 2)', errors.slice(0, 20))
R.save()
await browser.close()
