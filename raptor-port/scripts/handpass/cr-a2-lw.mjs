/* Walker A2 — the Leave War's own gestures through the ONE Undo (28 Sep 26, Phase A of the change-recording re-test).
   Saber (admin) on a fresh demo world, Ryder's (xray) row in the demo week (Mon 13 – Sun 19 Jul 26, so every history
   line lands in the loaded week):
     G1 a bid placed (LL, Wed 15)          G2 that bid decided — Approve        G3 a bid moved (the Move button, Thu 16 → Fri 17)
     G4 the approved leave removed (Wed 15) G5 an OIL award given (+OIL, Sat 18) G6 a ⚙ setting changed (Show SANS)
     G7 the stage advanced (→ BIDDING CLOSED)
   each undone and redone from the Leave War's own pair; G5 ALSO undone and redone from Edit Schedule's top bar. Then the
   changes window (Edit Schedule's clock): each Undo and Redo has its "Undo — …" / "Redo — …" line on the day it changed
   (D263). Every step asserts the RIGHT behaviour (PASS = the app did what it should).
   Usage (from raptor-port/): node scripts/handpass/cr-a2-lw.mjs [desktop|phone] */
import './cr-a2-env.mjs'
const L = await import('./cr-a2-lib.mjs')
const { PHONE, WIDTH, openA2, book, door, doorState, toasts, lwOpen, tapCell, sheetNow, sheetPress, closeSheets, recsOf, lwCell,
  go, elogTail, changesWindow, closeChanges, toWeek, stageNow, stageGo } = L
const B = book('lw')
const { browser, page, errors } = await openA2('a')
const P = 'xray'  // Ryder
const WED = '2026-07-15', THU = '2026-07-16', FRI = '2026-07-17', SAT = '2026-07-18'

async function step(id, fn) {
  try { await fn() } catch (e) { B.ck(id, 'step ran', false, 'THREW ' + String(e && e.message || e).split('\n')[0].slice(0, 300), await B.shot(page, `THREW-${id}`)) }
  try { await closeSheets(page); if (await page.locator('[data-testid="move-banner"]:visible').count()) await page.locator('[data-testid="move-cancel"]:visible').first().click() } catch { }
}
const rec = async (d) => (await recsOf(page, P, [d]))[d]
const cell = async (d) => { await lwOpen(page, d); return (await lwCell(page, P, d)).box }
/** A person's press on a control by testid (finger on the phone). */
async function tapId(testid) {
  const b = page.locator(`[data-testid="${testid}"]:visible`).last()
  if (!(await b.count())) return false
  if (PHONE) await b.tap().catch(() => b.click()); else await b.click()
  await page.waitForTimeout(600); return true
}
/** The picture after an Undo / Redo: on the war, Ryder's day brought on screen (with the toast while it shows) —
    or, for a change that is not a day (⚙, the stage), the top of the war with its Undo / Redo pair. */
let FRAME = 'cell'
async function frameShot(where, d, name) {
  if (where === 'lw' && FRAME === 'cell') {
    const c = page.locator(`[data-testid="cell-${P}-${d}"]`).first()
    if (await c.count()) { await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(250) }
  } else if (where === 'lw') { await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(200) }
  return B.shot(page, name)
}
/** Undo then Redo from a door, reading the day after each, with pictures. */
async function undoRedo(id, where, d, read, wantBefore, wantUndone, pics = []) {
  if (where === 'lw') await lwOpen(page, d)
  else { await go(page, 'editsched') }
  const u = await door(page, where, 'undo')
  const afterU = await read()
  if (where !== 'lw') await go(page, 'editsched')
  pics.push(await frameShot(where, d, `${id}-undone`))
  const r = await door(page, where, 'redo')
  const afterR = await read()
  pics.push(await frameShot(where, d, `${id}-redone`))
  B.ck(`${id}-undo`, `Undo from the ${where === 'lw' ? 'Leave War' : where === 'top' ? 'top bar' : 'board'} takes it back ("Undid: …", Redo on)`,
    u.pressed && wantUndone(afterU) && (u.toasts || []).some(t => /^Undid: /.test(t)),
    { title: u.title, toasts: u.toasts, afterUndo: afterU, redoOn: u.pressed }, pics[pics.length - 2])
  B.ck(`${id}-redo`, 'Redo from the same door puts it back ("Redid: …")',
    r.pressed && wantBefore(afterR) && (r.toasts || []).some(t => /^Redid: /.test(t)),
    { title: r.title, toasts: r.toasts, afterRedo: afterR }, pics[pics.length - 1])
  return { u, r }
}

await lwOpen(page, WED)
B.note('start', { stage: await stageNow(page), doors: await doorState(page, 'lw'), rec: await recsOf(page, P, [WED, THU, FRI, SAT]) })

/* G1 — a bid placed */
await step('G1', async () => {
  const t = await tapCell(page, P, WED)
  await sheetPress(page, 'bid-LL')
  let s = await sheetNow(page)
  if (s.open === 'bid-picker' && /Tap the same leave again/i.test(s.text || '')) { await sheetPress(page, 'bid-LL'); s = await sheetNow(page) }
  await closeSheets(page)
  const placed = await rec(WED)
  const pic = await B.shot(page, 'G1-bid-placed')
  B.ck('G1-place', 'an LL bid placed on Ryder\'s Wed 15 Jul through the bid sheet', /request:LL/.test(placed), { opened: t.open, rec: placed, doors: await doorState(page, 'lw') }, pic)
  await undoRedo('G1', 'lw', WED, () => rec(WED), r => /request:LL/.test(r), r => !/request:LL/.test(r))
})

/* G2 — that bid decided: Approve */
await step('G2', async () => {
  const t = await tapCell(page, P, WED)
  const s0 = await sheetNow(page)
  const ok = await sheetPress(page, 'decide-approve')
  await closeSheets(page)
  const r = await rec(WED)
  const inp = await page.evaluate(([p, d]) => window.INPUTS.filter(x => x.person === p && x.date && x.lw).map(x => x.type + '@' + x.date), [P, WED])
  const pic = await B.shot(page, 'G2-approved')
  B.ck('G2-approve', 'Approve on the bid sheet: the bid becomes approved leave (an input on the schedule)', ok.pressed && !/request:LL/.test(r), { opened: t.open, buttons: (s0.buttons || []).slice(0, 12), rec: r, inputs: inp }, pic)
  await undoRedo('G2', 'lw', WED, async () => ({ rec: await rec(WED), approved: await page.evaluate(([p]) => window.INPUTS.filter(x => x.person === p && x.lw && x.type === 'LL').length, [P]) }),
    x => x.approved >= 1 && !/request:LL/.test(x.rec), x => x.approved === 0 && /request:LL/.test(x.rec))
})

/* G3 — a bid moved with the Move button (Thu 16 → Fri 17) */
await step('G3', async () => {
  await tapCell(page, P, THU); await sheetPress(page, 'bid-LL')
  let s = await sheetNow(page); if (s.open === 'bid-picker' && /Tap the same leave again/i.test(s.text || '')) await sheetPress(page, 'bid-LL')
  await closeSheets(page)
  const before = await recsOf(page, P, [THU, FRI])
  await tapCell(page, P, THU)
  const s1 = await sheetNow(page)
  const mv = await sheetPress(page, 'decide-shift')
  const ban = await page.locator('[data-testid="move-banner"]:visible').count() ? (await page.locator('[data-testid="move-banner"]').first().innerText()).replace(/\s+/g, ' ') : ''
  const tgt = page.locator(`[data-testid="cell-${P}-${FRI}"]`).first()
  const box = await tgt.evaluate(e => { const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 } })
  if (PHONE) await page.touchscreen.tap(box.x, box.y); else await page.mouse.click(box.x, box.y)
  await page.waitForTimeout(600)
  if (PHONE && await page.locator('[data-testid="move-confirm"]:visible').count()) await tapId('move-confirm')
  await page.waitForTimeout(400)
  const after = await recsOf(page, P, [THU, FRI])
  const pic = await B.shot(page, 'G3-moved')
  B.ck('G3-move', 'the Move button picks the Thu bid up and it lands on Fri', /request:LL/.test(before[THU]) && !/request:LL/.test(after[THU]) && /request:LL/.test(after[FRI]),
    { moveBtn: (s1.buttons || []).filter(b => /shift|Move/.test(b)), pressed: mv.pressed, banner: ban, before, after }, pic)
  await undoRedo('G3', 'lw', THU, () => recsOf(page, P, [THU, FRI]), x => !/request:LL/.test(x[THU]) && /request:LL/.test(x[FRI]), x => /request:LL/.test(x[THU]) && !/request:LL/.test(x[FRI]))
})

/* G4 — the approved leave removed (Wed 15) */
await step('G4', async () => {
  const t = await tapCell(page, P, WED)
  const s0 = await sheetNow(page)
  /* approved leave the war wrote: its sheet's Delete (the one word, D332); a second press if it asks first */
  let pressed = null
  for (const id of ['bid-clear', 'dl-remove', 'raptor-clear']) {
    const b = page.locator(`.bidsheet[role="dialog"]:visible [data-testid^="${id}"]`).first()
    if (await b.count()) { await b.click(); await page.waitForTimeout(500); pressed = id; break }
  }
  let s1 = await sheetNow(page)
  if (s1.open !== 'nothing' && pressed) { const b = page.locator(`.bidsheet[role="dialog"]:visible [data-testid^="${pressed}"]`).first(); if (await b.count()) { await b.click(); await page.waitForTimeout(500) } s1 = await sheetNow(page) }
  await closeSheets(page)
  const approved = await page.evaluate(([p]) => window.INPUTS.filter(x => x.person === p && x.lw && x.type === 'LL').length, [P])
  const pic = await B.shot(page, 'G4-removed')
  B.ck('G4-remove', 'the approved leave on Wed is removed through its sheet\'s Delete', !!pressed && approved === 0,
    { opened: t.open, buttons: s0.buttons, pressed, left: s1.open, approved, rec: await rec(WED) }, pic)
  await undoRedo('G4', 'lw', WED, async () => page.evaluate(([p]) => window.INPUTS.filter(x => x.person === p && x.lw && x.type === 'LL').length, [P]),
    n => n === 0, n => n === 1)
})

/* G5 — an OIL award given (+OIL, Sat 18) — undone and redone from the Leave War, then from Edit Schedule's top bar */
await step('G5', async () => {
  await tapCell(page, P, SAT)
  await sheetPress(page, 'bid-oil')
  await page.locator('[data-testid="oil-why"]:visible').first().fill('A2 walk award')
  await page.locator('[data-testid="oil-days"]:visible').first().fill('1')
  await sheetPress(page, 'oil-give')
  await closeSheets(page)
  const r = await rec(SAT)
  const pic = await B.shot(page, 'G5-award')
  B.ck('G5-give', '+OIL gives Ryder a 1-day award on Sat 18', /credit:(FO|HO)\/manual/.test(r), { rec: r }, pic)
  const has = x => /credit:(FO|HO)\/manual/.test(x)
  await undoRedo('G5', 'lw', SAT, () => rec(SAT), has, x => !has(x))
  /* the SAME step from Edit Schedule's top bar */
  await go(page, 'editsched')
  const ds = await doorState(page, 'top')
  const u = await door(page, 'top', 'undo')
  const afterU = await rec(SAT)
  const picU = await B.shot(page, 'G5-undone-from-topbar')
  B.ck('G5-top-undo', 'Edit Schedule\'s top-bar Undo takes the Leave War award back (one timeline)', u.pressed && !has(afterU) && (u.toasts || []).some(t => /^Undid/.test(t)), { doorBefore: ds, toasts: u.toasts, rec: afterU }, picU)
  const rd = await door(page, 'top', 'redo')
  const afterR = await rec(SAT)
  await lwOpen(page, SAT)
  const picR = await B.shot(page, 'G5-redone-from-topbar-seen-on-war')
  B.ck('G5-top-redo', 'the top-bar Redo puts the award back — seen on the war', rd.pressed && has(afterR) && (rd.toasts || []).some(t => /^Redid/.test(t)), { toasts: rd.toasts, rec: afterR }, picR)
})

/* G6 — a ⚙ setting: Show SANS */
await step('G6', async () => {
  FRAME = 'top'
  await lwOpen(page, WED)
  const sans = async () => {
    await tapId('settings-open')
    const v = await page.locator('[data-testid="sans-toggle"]').first().getAttribute('aria-pressed').catch(() => null)
    await tapId('settings-close'); return v
  }
  const v0 = await sans()
  await tapId('settings-open'); await tapId('sans-toggle')
  const v1 = await page.locator('[data-testid="sans-toggle"]').first().getAttribute('aria-pressed')
  const pic = await B.shot(page, 'G6-sans-shown')
  await tapId('settings-close')
  B.ck('G6-set', 'the ⚙ sheet\'s Show SANS switched', v0 !== v1, { before: v0, after: v1 }, pic)
  await undoRedo('G6', 'lw', WED, sans, v => v === v1, v => v === v0)
})

/* G7 — the stage advanced */
await step('G7', async () => {
  await lwOpen(page, WED)
  const s0 = await stageNow(page)
  const a = await stageGo(page, 'advance')
  const pic = await B.shot(page, 'G7-stage-closed')
  B.ck('G7-advance', 'the stage control moves the war on', a.pressed && a.now !== s0, { from: s0, ...a }, pic)
  await undoRedo('G7', 'lw', WED, () => stageNow(page), s => s === a.now, s => s === s0)
})

/* the changes window — Edit Schedule's clock — each Undo / Redo's line on its day (D263) */
await step('H', async () => {
  const tail = await elogTail(page, 40)
  B.note('H-record', tail.filter(r => /^(Undo|Redo)/.test(r.lbl)).map(r => `${r.lbl} @${r.date}${r.end && r.end !== r.date ? '–' + r.end : ''}`))
  const want = [['Wed', 'G1/G2/G4 (the bid, its approval, its removal)', 3], ['Thu', 'G3 (the move, from)', 1], ['Fri', 'G3 (the move, to)', 1], ['Sat', 'G5 (the award, LW pair and top bar)', 2]]
  for (const [day, what, n] of want) {
    const w = await changesWindow(page, { day })
    const u = w.lines.filter(l => /Undo —/.test(l)).length, r = w.lines.filter(l => /Redo —/.test(l)).length
    const pic = await B.shot(page, `H-changes-${day}`)
    B.ck(`H-${day}`, `the changes window on ${day}: ${n} "Undo — …" and ${n} "Redo — …" line(s) for ${what}`, u >= n && r >= n,
      { title: w.title, undoLines: u, redoLines: r, lines: w.lines.filter(l => /Undo|Redo/.test(l)).slice(0, 8) }, pic)
    if (PHONE) await closeChanges(page)
  }
  await closeChanges(page)
  /* G6 and G7 change no day — their lines are dated today (28 Sep 26): the week of 28 Sep */
  await toWeek(page, '28/09/2026')
  const w = await changesWindow(page, { day: 'Week' })
  const pic = await B.shot(page, 'H-changes-week-of-28Sep')
  B.ck('H-today', 'the ⚙ and stage Undo / Redo lines are in the history (dated today, 28 Sep — the week nobody has loaded)', w.lines.filter(l => /Undo —/.test(l)).length >= 2 && w.lines.filter(l => /Redo —/.test(l)).length >= 2,
    { title: w.title, lines: w.lines.filter(l => /Undo|Redo/.test(l)).slice(0, 8) }, pic)
  await closeChanges(page)
  await toWeek(page, '13/07/2026')
})

B.note('errors', errors)
B.save(errors)
console.log(`${B.rows.filter(r => r.ok === true).length} PASS · ${B.rows.filter(r => r.ok === false).length} FAIL`)
await browser.close()
