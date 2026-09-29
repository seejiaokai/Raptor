/* Walker A2 — Astra 23: a Leave War bid, an admin decision and an award deletion across two sign-ins (28 Sep 26,
   Phase A of the change-recording re-test). One fresh demo world, the Leave War's own Undo / Redo throughout.
     Ranger (member): bids LL on his own row, 7 Jan (inside the bidding window) → his Undo / Redo on it.
     Saber (admin), after Ranger signs out: the list is empty; he Approves Ranger's bid → Undo (back to a bid) → Redo;
       gives Ranger a +OIL award on 8 Jan, then deletes it → Undo brings the award back → Redo takes it away → Undo;
       then Undo walks back only HIS steps and stops (Ranger's bid is not his to take back — the list began at his sign-in).
     Ranger again: his Undo is off — Saber's decision and award are not his.
   Usage (from raptor-port/): node scripts/handpass/cr-a2-sessions.mjs [desktop|phone] */
import './cr-a2-env.mjs'
const L = await import('./cr-a2-lib.mjs')
const { openA2, book, door, doorState, lwOpen, tapCell, sheetNow, sheetPress, closeSheets, recsOf, signOut, signIn } = L
const B = book('sessions')
const { browser, page, errors } = await openA2('m')
const P = 'bane', D1 = '2026-01-07', D2 = '2026-01-08'
async function step(id, fn) {
  try { await fn() } catch (e) { B.ck(id, 'step ran', false, 'THREW ' + String(e && e.message || e).split('\n')[0].slice(0, 300), await B.shot(page, `THREW-${id}`)) }
  try { await closeSheets(page) } catch { }
}
const rec = async (d) => (await recsOf(page, P, [d]))[d]
const approvedLL = () => page.evaluate(p => window.INPUTS.filter(x => x.person === p && x.lw && x.type === 'LL' && /Jan 0?7/.test(x.date || '')).length, P)
async function atCell(d, name) { await lwOpen(page, d); const c = page.locator(`[data-testid="cell-${P}-${d}"]`).first(); if (await c.count()) { await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(250) } return B.shot(page, name) }

await step('S1', async () => {
  await lwOpen(page, D1)
  await tapCell(page, P, D1); await sheetPress(page, 'bid-LL')
  let s = await sheetNow(page); if (s.open === 'bid-picker' && /Tap the same leave again/i.test(s.text || '')) await sheetPress(page, 'bid-LL')
  await closeSheets(page)
  const r0 = await rec(D1)
  const p0 = await atCell(D1, 'S1-ranger-bid')
  B.ck('S1-bid', 'Ranger bids LL on his own 7 Jan', /request:LL/.test(r0), { rec: r0, doors: await doorState(page, 'lw') }, p0)
  await lwOpen(page, D1)
  const u = await door(page, 'lw', 'undo'); const r1 = await rec(D1)
  const p1 = await atCell(D1, 'S1-ranger-undo')
  const r = await door(page, 'lw', 'redo'); const r2 = await rec(D1)
  const p2 = await atCell(D1, 'S1-ranger-redo')
  B.ck('S1-own', 'his own Undo takes his bid back and Redo puts it back', u.pressed && !/request:LL/.test(r1) && r.pressed && /request:LL/.test(r2), { undo: u.toasts, afterUndo: r1, redo: r.toasts, afterRedo: r2 }, `${p1}, ${p2}`)
})

await signOut(page); await signIn(page, 'a')

await step('S2', async () => {
  await lwOpen(page, D1)
  const d0 = await doorState(page, 'lw')
  B.ck('S2-empty', 'Saber signs in after Ranger: nothing to undo or redo (Ranger\'s bid is not on his list)', /^off/.test(d0.undo) && /^off/.test(d0.redo), d0)
  const t = await tapCell(page, P, D1)
  const a = await sheetPress(page, 'decide-approve')
  await closeSheets(page)
  const n1 = await approvedLL(), r1 = await rec(D1)
  const p0 = await atCell(D1, 'S2-saber-approves')
  B.ck('S2-approve', 'Saber approves Ranger\'s bid (it becomes his leave)', a.pressed && n1 === 1 && !/request:LL/.test(r1), { opened: t.open, approved: n1, rec: r1 }, p0)
  await lwOpen(page, D1)
  const u = await door(page, 'lw', 'undo'); const n2 = await approvedLL(), r2 = await rec(D1)
  const p1 = await atCell(D1, 'S2-saber-undo-approve')
  B.ck('S2-undo', 'Saber\'s Undo takes his approval back — Ranger\'s bid stands again, undecided', u.pressed && n2 === 0 && /request:LL/.test(r2), { toasts: u.toasts, approved: n2, rec: r2 }, p1)
  const r = await door(page, 'lw', 'redo'); const n3 = await approvedLL()
  const p2 = await atCell(D1, 'S2-saber-redo-approve')
  B.ck('S2-redo', 'Redo approves it again', r.pressed && n3 === 1, { toasts: r.toasts, approved: n3 }, p2)
})

await step('S3', async () => {
  await lwOpen(page, D2)
  await tapCell(page, P, D2); await sheetPress(page, 'bid-oil')
  await page.locator('[data-testid="oil-why"]:visible').first().fill('A2 sessions award')
  await page.locator('[data-testid="oil-days"]:visible').first().fill('1')
  await sheetPress(page, 'oil-give'); await closeSheets(page)
  const has = x => /credit:(FO|HO)\/manual/.test(x || '')
  const g = await rec(D2)
  B.ck('S3-give', 'Saber gives Ranger a 1-day OIL award on 8 Jan', has(g), { rec: g }, await atCell(D2, 'S3-award-given'))
  const t = await tapCell(page, P, D2)
  let how = null
  if ((t.buttons || []).some(b => /^oil-clear/.test(b))) { await sheetPress(page, 'oil-clear'); how = 'oil-clear (Remove)' }
  else if ((t.buttons || []).some(b => /^bid-clear/.test(b))) { await sheetPress(page, 'bid-clear'); if ((await sheetNow(page)).open !== 'nothing') await sheetPress(page, 'bid-clear'); how = 'bid-clear (Delete)' }
  await closeSheets(page)
  const d = await rec(D2)
  B.ck('S3-delete', 'Saber deletes the award through the day\'s sheet', !!how && !has(d), { opened: t.open, buttons: t.buttons, how, rec: d }, await atCell(D2, 'S3-award-deleted'))
  await lwOpen(page, D2)
  const u = await door(page, 'lw', 'undo'); const a1 = await rec(D2)
  const p1 = await atCell(D2, 'S3-undo-delete')
  B.ck('S3-undo', 'Undo brings the deleted award back', u.pressed && has(a1), { toasts: u.toasts, rec: a1 }, p1)
  const r = await door(page, 'lw', 'redo'); const a2 = await rec(D2)
  const p2 = await atCell(D2, 'S3-redo-delete')
  B.ck('S3-redo', 'Redo deletes it again', r.pressed && !has(a2), { toasts: r.toasts, rec: a2 }, p2)
  const u2 = await door(page, 'lw', 'undo'); const a3 = await rec(D2)
  B.ck('S3-undo-again', 'Undo once more: the award is back', u2.pressed && has(a3), { toasts: u2.toasts, rec: a3 })
})

await step('S4', async () => {
  /* walk Saber's list to its start: the award given, then the approval — then OFF, with Ranger's bid untouched */
  await lwOpen(page, D1)
  const presses = []
  for (let i = 0; i < 6; i++) {
    const d = await doorState(page, 'lw')
    if (!/^on/.test(d.undo)) { presses.push('OFF ' + d.undo); break }
    const u = await door(page, 'lw', 'undo'); presses.push((u.toasts || []).join(' / ') || '(no toast)')
  }
  const r1 = await rec(D1), n = await approvedLL(), a = await rec(D2)
  const p = await atCell(D1, 'S4-saber-list-exhausted')
  B.ck('S4-stop', 'Saber\'s Undo walks back only his own steps and stops; Ranger\'s bid stays (undecided again)', /^OFF/.test(presses[presses.length - 1] || '') && /request:LL/.test(r1) && n === 0 && !/credit:(FO|HO)\/manual/.test(a),
    { presses, bid: r1, approved: n, award: a }, p)
  const rr = await door(page, 'lw', 'redo')
  B.ck('S4-redo', 'Redo still works after the list is walked back (the last step he undid)', rr.pressed && (rr.toasts || []).some(x => /^Redid/.test(x)), { toasts: rr.toasts })
})

await signOut(page); await signIn(page, 'm')

await step('S5', async () => {
  await lwOpen(page, D1)
  const d = await doorState(page, 'lw')
  const p = await atCell(D1, 'S5-ranger-again')
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(200)
  const p2 = await B.shot(page, 'S5-ranger-doors')
  B.ck('S5-empty', 'Ranger signs in again: his Undo and Redo are off — Saber\'s decisions are not his to take back', /^off/.test(d.undo) && /^off/.test(d.redo), { doors: d, rec: await rec(D1) }, `${p}, ${p2}`)
})

B.note('errors', errors)
B.save(errors)
console.log(`${B.rows.filter(r => r.ok === true).length} PASS · ${B.rows.filter(r => r.ok === false).length} FAIL`)
await browser.close()
