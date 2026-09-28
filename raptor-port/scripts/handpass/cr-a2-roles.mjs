/* Walker A2 — roles and the one Undo (28 Sep 26, Phase A of the change-recording re-test).
   R1  Fable S6 / Astra 15 — the admin's member view (D292): a note changed as admin, then the member view → the Leave
       War's Undo is ON, refuses with "Switch back to the admin view to undo that." and changes nothing; a second press
       the same (Fable S30: never greys, nothing moves; Redo off raises nothing); switch back → Undo reverses the note.
       The mirror: in the member view Saber files his own LL (Inputs page) → his member-view Undo / Redo work on it →
       back to admin → Undo reverses it (an admin may reverse anything).
   R2  Fable S15 / Astra 14 — the list empties at every sign-in and sign-out (D148): Saber two bids, one undone (Redo on)
       → sign out → Saber again: both buttons off (the bids as they were); → Ranger: off. Ranger bids on his own row →
       Undo on → sign out → Ranger again: off; → Saber: off.
   R3  Fable S23 — the bubble for a take-off time changed on the edit week, read cold.
   Usage (from raptor-port/): node scripts/handpass/cr-a2-roles.mjs [desktop|phone] */
import './cr-a2-env.mjs'
const L = await import('./cr-a2-lib.mjs')
const { openA2, book, door, doorState, lwOpen, tapCell, sheetNow, sheetPress, closeSheets, recsOf, go,
  signOut, signIn, switchView, viewNow, fileInput, inputsOf } = L
const B = book('roles')
const { browser, page, errors } = await openA2('a')
async function step(id, fn) {
  try { await fn() } catch (e) { B.ck(id, 'step ran', false, 'THREW ' + String(e && e.message || e).split('\n')[0].slice(0, 300), await B.shot(page, `THREW-${id}`)) }
  try { await closeSheets(page) } catch { }
}
const noteSel = '#eWeek [data-txt="dn:0"]'
async function noteNow() { await go(page, 'editsched'); return page.locator(noteSel).first().evaluate(e => (e.value ?? e.textContent) || '').catch(() => '?') }
async function typeNote(v) {
  await go(page, 'editsched')
  const n = page.locator(`${noteSel}:visible`).first()
  if (!(await n.count())) {
    const any = page.locator('#eWeek [data-txt^="dn:"]:visible').first(); await any.click(); await any.fill(v); await any.blur(); await page.waitForTimeout(400); return await any.getAttribute('data-txt')
  }
  await n.click(); await n.fill(v); await n.blur(); await page.waitForTimeout(400)
  return 'dn:0'
}
const bidOnDay = async (pid, iso) => {
  await tapCell(page, pid, iso); await sheetPress(page, 'bid-LL')
  const s = await sheetNow(page); if (s.open === 'bid-picker' && /Tap the same leave again/i.test(s.text || '')) await sheetPress(page, 'bid-LL')
  await closeSheets(page)
  return (await recsOf(page, pid, [iso]))[iso]
}
const mineLL = async () => (await inputsOf(page, 'stiff')).filter(x => /A2 member-view/.test(x.remarks)).length

/* ---------------- R1 — the admin's member view ---------------- */
await step('R1', async () => {
  const key = await typeNote('A2 NOTE AS ADMIN')
  const n0 = await noteNow()
  const top = await L.doorState(page, 'top')
  const p0 = await B.shot(page, 'R1-note-as-admin')
  B.ck('R1-note', 'Saber types a note on Monday on Edit Schedule; the top bar\'s Undo names it', /A2 NOTE AS ADMIN/.test(n0) && /^on "Undo — /.test(top.undo), { key, note: n0, top }, p0)
  const sv = await switchView(page)
  await page.waitForTimeout(400)
  const v1 = await viewNow(page)
  const pg = await page.evaluate(() => window.CURPAGE)
  const topShown = await page.locator('#undoBtn:visible').count()
  const p1 = await B.shot(page, 'R1-member-view')
  B.ck('R1-switch', 'the switch puts Saber in the member view (Edit Schedule gives way to View-only Sched; its Undo pair goes)',
    /Member/i.test((v1.badge || '') + ' ' + (v1.acct || '') + ' ' + sv) && pg !== 'editsched' && topShown === 0, { sv, v1, page: pg, topUndoVisible: topShown }, p1)
  await lwOpen(page, '2026-07-15')
  const s = await doorState(page, 'lw')
  const u1 = await door(page, 'lw', 'undo')
  const p2 = await B.shot(page, 'R1-member-undo-refused')
  B.ck('R1-refuse', 'in the member view the war\'s Undo is ON and refuses: "Switch back to the admin view to undo that."',
    u1.pressed && (u1.toasts || []).some(t => /Switch back to the admin view to undo that/.test(t)) && u1.disabledAfter === false,
    { door: s, toasts: u1.toasts, stillOn: u1.disabledAfter === false }, p2)
  const u2 = await door(page, 'lw', 'undo')
  const r2 = await door(page, 'lw', 'redo')
  B.ck('R1-again', 'the next press says the same and the button stays on (D148: never greys); Redo is off and raises nothing (S30)',
    u2.pressed && (u2.toasts || []).some(t => /Switch back/.test(t)) && u2.disabledAfter === false && r2.disabled === true && !r2.pressed,
    { second: u2.toasts, undoStillOn: u2.disabledAfter === false, redo: { disabled: r2.disabled, title: r2.title } })
  await go(page, 'viewsched')
  const vtxt = await page.evaluate(() => (document.querySelector('#vWeek .day[data-day="0"]') || {}).innerText || '')
  const p2b = await B.shot(page, 'R1-note-kept-on-view-page')
  B.ck('R1-unchanged', 'the refused Undo left Monday\'s note as Saber typed it (View-only Sched)', /A2 NOTE AS ADMIN/.test(vtxt), { found: /A2 NOTE AS ADMIN/.test(vtxt) }, p2b)
  const f = await fileInput(page, { from: '2026-07-14', type: 'LL', remarks: 'A2 member-view LL' })
  const m1 = await mineLL()
  const p3 = await B.shot(page, 'R1-member-files-own-LL')
  B.ck('R1-file', 'in the member view Saber files his own LL on Tue 14 Jul on the Inputs page', f.added === 1 && m1 === 1, { f, m1 }, p3)
  await lwOpen(page, '2026-07-14')
  const mu = await door(page, 'lw', 'undo')
  const afterMu = await mineLL()
  const mr = await door(page, 'lw', 'redo')
  const afterMr = await mineLL()
  const p4 = await B.shot(page, 'R1-member-own-undo-redo')
  B.ck('R1-own', 'his member-view Undo takes his own filing back and Redo brings it back',
    mu.pressed && afterMu === 0 && (mu.toasts || []).some(t => /^Undid: /.test(t)) && mr.pressed && afterMr === 1, { undo: mu.toasts, afterUndo: afterMu, redo: mr.toasts, afterRedo: afterMr }, p4)
  const sb = await switchView(page)
  const v2 = await viewNow(page)
  await lwOpen(page, '2026-07-14')
  const au = await door(page, 'lw', 'undo')
  const afterAu = await mineLL()
  const p5 = await B.shot(page, 'R1-back-to-admin-undo')
  B.ck('R1-back', 'back in the admin view, Undo reverses the member-view filing (an admin may reverse anything)',
    /Admin/i.test((v2.badge || '') + ' ' + (v2.acct || '') + ' ' + sb) && au.pressed && afterAu === 0 && (au.toasts || []).some(t => /^Undid: /.test(t)), { sb, v2, toasts: au.toasts, left: afterAu }, p5)
  const au2 = await door(page, 'lw', 'undo')
  const n2 = await noteNow()
  const p6 = await B.shot(page, 'R1-note-undone-as-admin')
  B.ck('R1-note-undone', 'the next Undo (admin view) reverses the note typed before the switch', au2.pressed && !/A2 NOTE AS ADMIN/.test(n2) && (au2.toasts || []).some(t => /^Undid: /.test(t)), { toasts: au2.toasts, note: n2 }, p6)
})

/* ---------------- R3 — the bubble for a take-off time (S23), read cold ---------------- */
await step('R3', async () => {
  await go(page, 'editsched')
  const to = page.locator('#eWeek [data-txt$=".to"]:visible').first()
  if (!(await to.count())) { B.note('R3', 'no take-off time box visible on the edit week'); return }
  const key = await to.getAttribute('data-txt'), v0 = (await to.textContent() || '').trim()
  await to.click(); await to.fill('10:45'); await to.blur(); await page.waitForTimeout(400)
  const t = await doorState(page, 'top')
  const u = await door(page, 'top', 'undo')
  const v1 = (await page.locator(`#eWeek [data-txt="${key}"]`).first().textContent() || '').trim()
  const pic = await B.shot(page, 'R3-takeoff-undo-bubble')
  B.ck('R3-words', 'a take-off time changed and undone: the bubble names what came back (a time on a flying line) — KNOWN, [AMEND-SMALL-SEEN] 2',
    u.pressed && (u.toasts || []).some(x => /time|take-off|flying/i.test(x)), { key, was: v0, title: t.undo, toasts: u.toasts, now: v1 }, pic)
})

/* ---------------- R2 — the list empties at sign-out / sign-in ---------------- */
await step('R2', async () => {
  const a = await bidOnDay('freak', '2026-07-15'), b = await bidOnDay('freak', '2026-07-16')
  await lwOpen(page, '2026-07-16')
  const u = await door(page, 'lw', 'undo')
  const s0 = await doorState(page, 'lw')
  const p0 = await B.shot(page, 'R2-saber-two-bids-one-undone')
  B.ck('R2-setup', 'Saber: two bids on Echo, the second undone — Undo and Redo both on', /LL/.test(a) && /LL/.test(b) && u.pressed && /^on/.test(s0.undo) && /^on/.test(s0.redo), { a, b, undo: u.toasts, doors: s0 }, p0)
  await signOut(page); await signIn(page, 'a')
  await lwOpen(page, '2026-07-15')
  const s1 = await doorState(page, 'lw'), r1 = await recsOf(page, 'freak', ['2026-07-15', '2026-07-16'])
  await go(page, 'editsched'); const t1 = await doorState(page, 'top')
  await lwOpen(page, '2026-07-15')
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(200)
  const p1 = await B.shot(page, 'R2-saber-again-empty')
  B.ck('R2-saber-again', 'Saber signs out and in again: both doors off; the bids stay as they were (Wed kept, Thu gone)',
    /^off/.test(s1.undo) && /^off/.test(s1.redo) && /^off/.test(t1.undo) && /^off/.test(t1.redo) && /LL/.test(r1['2026-07-15']) && !/LL/.test(r1['2026-07-16']), { lw: s1, top: t1, recs: r1 }, p1)
  await signOut(page); await signIn(page, 'm')
  await lwOpen(page, '2026-01-07')
  const s2 = await doorState(page, 'lw')
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(200)
  const p2 = await B.shot(page, 'R2-ranger-after-saber')
  B.ck('R2-ranger-after', 'Ranger signs in after Saber: the war\'s Undo and Redo are off', /^off/.test(s2.undo) && /^off/.test(s2.redo), s2, p2)
  const rb = await bidOnDay('bane', '2026-01-07')
  const s3 = await doorState(page, 'lw')
  const p3 = await B.shot(page, 'R2-ranger-bid')
  B.ck('R2-ranger-bid', 'Ranger bids on his own row (7 Jan, inside the bidding window) — his Undo is on and names it', /LL/.test(rb) && /^on "Undo — /.test(s3.undo), { rec: rb, doors: s3 }, p3)
  await signOut(page); await signIn(page, 'm')
  await lwOpen(page, '2026-01-07')
  const s4 = await doorState(page, 'lw'), r4 = (await recsOf(page, 'bane', ['2026-01-07']))['2026-01-07']
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(200)
  const p4 = await B.shot(page, 'R2-ranger-again-empty')
  B.ck('R2-ranger-again', 'Ranger signs out and in again: his Undo is off; his bid stays', /^off/.test(s4.undo) && /^off/.test(s4.redo) && /LL/.test(r4), { doors: s4, rec: r4 }, p4)
  await signOut(page); await signIn(page, 'a')
  await lwOpen(page, '2026-01-07')
  const s5 = await doorState(page, 'lw')
  await go(page, 'editsched'); const t5 = await doorState(page, 'top')
  const p5 = await B.shot(page, 'R2-saber-after-ranger')
  B.ck('R2-saber-after', 'Saber signs in after Ranger: every door off', /^off/.test(s5.undo) && /^off/.test(t5.undo) && /^off/.test(s5.redo), { lw: s5, top: t5 }, p5)
})

B.note('errors', errors)
B.save(errors)
console.log(`${B.rows.filter(r => r.ok === true).length} PASS · ${B.rows.filter(r => r.ok === false).length} FAIL`)
await browser.close()
