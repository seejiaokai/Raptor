/* W3-01 — BULK by a real mouse drag over a MIXED rectangle (absence-record re-test, 26 Sep 26).
   Written as assertions of the RIGHT behaviour: re-running it after a fix IS the re-walk.
   The rectangle: Dash (spaceman) / Fable (plasma) / Ghost (riddler) / Grit (sufa) × Thu 16 – Sat 18 Jul, war OPEN:
     spaceman 16 a pending LL bid · 17 empty · 18 an OIL award (1 day)
     plasma   16 an OIL award (1 day) · 17 a war-approved LL · 18 the schedule's automatic credit (Sat published, SDO)
     riddler  16 split: Inputs-filed LL morning + a pending LL afternoon bid · 17 Inputs-filed LL · 18 empty
     sufa     16, 17 ATT C (the demo's medical) · 18 empty
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/w3-01-bulk.mjs <fill|delete|approve|refuse|ack|move|moveclash> */
process.env.AB_WHO = 'w3'
const ACT = process.argv[2] || 'delete'
const L = await import('./w3-lib.mjs')
const S = await import('./ab-sched.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, bidOn, lwAward, tapCell, sheetPress, closeSheets, sheetNow, fileInput, inputsOf, figures, shot, resultBook, ROOT, toastSpy, toasts,
  recsOf, grid, dragRect, selPress, lwHist, reload, claimed } = L
const R = resultBook(`W3-01-${ACT}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-w3-01-${ACT}.txt`)
const { browser, page, errors } = await openHi({ width: 1440, height: 900, who: 'a', dpr: 1 })
await toastSpy(page)
const P = ['spaceman', 'plasma', 'riddler', 'sufa'], D = ['2026-07-16', '2026-07-17', '2026-07-18']
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await shot(page, `w3-01-${ACT}-THREW-${name}`).catch(() => {}) } }

/* ---- the fixture, through the app's own controls ---- */
await step('fixture', async () => {
  const pub = await S.pubOnBoard(page, 5)
  const a = await fileInput(page, { person: 'riddler', type: 'LL', from: D[1], remarks: 'W3 filed leave' })
  const b = await fileInput(page, { person: 'riddler', type: 'LL', from: D[0], span: 'am', remarks: 'W3 filed morning' })
  await lwOpen(page, D[0])
  const c = await bidOn(page, 'spaceman', D[0], 'LL')
  const d = await bidOn(page, 'riddler', D[0], 'LL', { portion: 'pm' })
  const e = await lwAward(page, 'spaceman', D[2], '1', 'W3 award A')
  const f = await lwAward(page, 'plasma', D[0], '1', 'W3 award B')
  const g = await bidOn(page, 'plasma', D[1], 'LL')
  await tapCell(page, 'plasma', D[1]); const h = await sheetPress(page, 'decide-approve'); await closeSheets(page)
  R.note('fixture', { pub: pub.p, filed: [a.added, b.added], bids: [c.placed, d.placed, d.why, g.placed], awards: [e.given, f.given, e.err, f.err], approve: h.pressed })
  /* the move's extras: a course in the rectangle (Dash, Fri 17 — it must never enter the move), and for the clash run an
     Inputs-filed LL on Fable's Tue 21 Jul, where his approved Fri 17 leave would land when the block's first entry
     (Thu 16) is dropped on Mon 20 */
  if (ACT === 'move' || ACT === 'moveclash') {
    const k = await fileInput(page, { person: 'spaceman', type: 'CSE', from: D[1], remarks: 'W3 course' })
    const l = ACT === 'moveclash' ? await fileInput(page, { person: 'plasma', type: 'LL', from: '2026-07-21', remarks: 'W3 landing blocker' }) : null
    R.note('fixture-move', { course: k.added, blocker: l && l.added })
  }
})
await lwOpen(page, D[0])
const read = async () => ({ grid: await grid(page, P, D), recs: Object.fromEntries(await Promise.all(P.map(async p => [p, await recsOf(page, p, D)]))),
  inputs: Object.fromEntries(await Promise.all(P.map(async p => [p, (await inputsOf(page, p)).filter(x => /Jul 1[5-9]/.test(x.date + x.endDate)).map(x => `${x.type} ${x.date}${x.endDate ? '–' + x.endDate : ''}${x.allday ? '' : ' ' + x.s + '-' + x.e} lw=${x.lw ? 'y' : 'n'}`)]))) })
const money = async () => ({ spaceman: await figures(page, 'spaceman'), plasma: await figures(page, 'plasma'), riddler: await figures(page, 'riddler') })
const before = await read()
const mBefore = await money()
R.note('before-grid', before.grid)
R.note('before-recs', before.recs)
R.note('before-inputs', before.inputs)
R.note('before-money', { sp: mBefore.spaceman, pl: mBefore.plasma, ri: mBefore.riddler })
await lwOpen(page, D[0])
await L.lwShot(page, `w3-01-${ACT}-a-before`, 'plasma', D[1])

/* the cells whose box or records moved */
const changed = (x, y) => {
  const out = []
  for (const p of P) {
    const gx = x.grid[p].split(' | '), gy = y.grid[p].split(' | ')
    D.forEach((d, i) => { if (gx[i] !== gy[i] || x.recs[p][d] !== y.recs[p][d]) out.push(`${p}@${d.slice(5)}: ${gx[i]} {${x.recs[p][d]}} → ${gy[i]} {${y.recs[p][d]}}`) })
  }
  return out
}

let sel, after, res
await step('drag', async () => {
  sel = await dragRect(page, 'spaceman', D[0], 'sufa', D[2])
  await shot(page, `w3-01-${ACT}-b-sheet`)
  R.ck('drag-opens-selection', sel.open === 'select-sheet' && /4 people|Dash, Fable|3 days/.test(sel.text), 'a real mouse drag over 4 rows × 3 days opens the selection sheet naming the block', { open: sel.open, text: (sel.text || '').slice(0, 220), buttons: sel.buttons, startHit: sel.startHit })
})

await step('act', async () => {
  if (ACT === 'fill') res = await selPress(page, 'sel-OL')
  if (ACT === 'delete') {
    const first = await selPress(page, 'sel-delete')
    R.note('delete-first-tap', { note: first.note })
    await shot(page, `w3-01-${ACT}-c-confirm`)
    R.ck('delete-confirm-names-awards', /award|OIL/i.test(first.note), 'the Delete confirm names the OIL awards it will take (or they are left out) — Fable F2 / AB2', first.note)
    res = await selPress(page, 'sel-delete')
  }
  if (ACT === 'approve') res = await selPress(page, 'sel-approve')
  if (ACT === 'refuse') res = await selPress(page, 'sel-refuse')
  if (ACT === 'ack') res = await selPress(page, 'sel-pending')
  if (ACT === 'move' || ACT === 'moveclash') {
    const m = await selPress(page, 'sel-move')
    const banner = await page.locator('[data-testid="move-banner"]').allInnerTexts()
    R.note('move-banner', banner)
    /* moveclash: land the block's first entry (Thu 16) on Fri 17 — spaceman's bid would land on 17 (free) but the
       riddler afternoon bid would land on riddler 17, which holds Inputs-filed LL → the whole move must refuse.
       move: land it on Mon 20 (a clean week) */
    const target = '2026-07-20'
    const tc = page.locator(`[data-testid="cell-spaceman-${target}"]`).first()
    await tc.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(300)
    const bb = await tc.boundingBox()
    await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, { steps: 5 }); await page.waitForTimeout(500)
    await shot(page, `w3-01-${ACT}-c-hover`)
    const hoverBanner = await page.locator('[data-testid="move-banner"]').allInnerTexts()
    await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.waitForTimeout(900)
    const banner2 = await page.locator('[data-testid="move-banner"]').allInnerTexts()
    res = { pressed: m.pressed, note: [hoverBanner.join(' '), '→', banner2.join(' ')].join(' '), banner: banner2 }
    R.note('move-banners', { hover: hoverBanner, afterClick: banner2 })
    await shot(page, `w3-01-${ACT}-d-after-click`)
    if (banner2.length) { await page.locator('[data-testid="move-cancel"]').click().catch(() => {}); await page.waitForTimeout(400) }
  }
  await shot(page, `w3-01-${ACT}-d-note`)
  await closeSheets(page)
  after = await read()
  R.note('act', { note: res && res.note, open: res && res.sheet && res.sheet.open })
  R.note('after-grid', after.grid)
  R.note('after-inputs', after.inputs)
})

const ch = changed(before, after)
R.note('changed-cells', ch)
const mAfter = await money()
R.note('after-money', { sp: mAfter.spaceman, pl: mAfter.plasma, ri: mAfter.riddler })
const c = claimed(res && res.note)
await lwOpen(page, D[0])
await L.lwShot(page, `w3-01-${ACT}-e-after`, 'plasma', D[1])

/* ---- what each action must do ---- */
const cell = (g, p, i) => g.grid[p].split(' | ')[i]
if (ACT === 'delete') {
  R.ck('AB2-awards-kept', /FO/.test(cell(after, 'spaceman', 2)) && /FO/.test(cell(after, 'plasma', 0)) && mAfter.spaceman.oil === mBefore.spaceman.oil && mAfter.plasma.oil === mBefore.plasma.oil,
    'bulk Delete removes the bids and the war-approved leave but keeps both OIL awards (an award has its own Remove; F2 / AB2)',
    { spaceman18: cell(after, 'spaceman', 2), plasma16: cell(after, 'plasma', 0), oil: { sp: [mBefore.spaceman.oil, mAfter.spaceman.oil], pl: [mBefore.plasma.oil, mAfter.plasma.oil] } })
  R.ck('D3-medical-and-auto-kept', /C/.test(cell(after, 'sufa', 0)) && /C/.test(cell(after, 'sufa', 1)) && /FO/.test(cell(after, 'plasma', 2)), 'Delete never takes the medical or the automatic credit (D3)', { sufa: after.grid.sufa, plasma18: cell(after, 'plasma', 2) })
  R.ck('D3-bids-gone', !/LL/.test(cell(after, 'spaceman', 0)) && !/LL/.test(cell(after, 'plasma', 1)), 'the pending bid and the war-approved leave are gone', { sp16: cell(after, 'spaceman', 0), pl17: cell(after, 'plasma', 1) })
  R.ck('D3-split-bid-deleted', !/request/.test(after.recs.riddler[D[0]]), 'the undecided afternoon bid that shares Ghost’s 16 Jul with his Inputs-filed morning is deleted too — it is an editable bid (the D1 shape, fixed for Approve)', { before: before.recs.riddler[D[0]], after: after.recs.riddler[D[0]], box: cell(after, 'riddler', 0) })
}
if (ACT === 'approve') {
  R.ck('D1-split-bid-decided', !/pending/.test(after.recs.riddler[D[0]]) && after.inputs.riddler.length > before.inputs.riddler.length, 'the afternoon bid under the Inputs-filed morning is APPROVED (an Input written), not read as already decided (D1)', { before: before.recs.riddler[D[0]], after: after.recs.riddler[D[0]], inputs: after.inputs.riddler })
  R.ck('AB7-count-true', c.written === 2, 'the note counts only what changed: 2 decided (Dash 16, Ghost 16 afternoon) — the already-approved leave is not a decision (F7 / AB7)', { note: res && res.note, claimed: c, changed: ch.length })
}
if (ACT === 'refuse' || ACT === 'ack') {
  R.ck(`D5-${ACT}-approved-back`, /pending|acknowledged|refused/.test(after.recs.plasma[D[1]]), `bulk ${ACT} over a war-approved leave turns it back into a bid of that answer (D5)`, { plasma17: after.recs.plasma[D[1]], inputs: after.inputs.plasma })
}
if (ACT === 'move') {
  const m20 = await grid(page, ['spaceman', 'plasma', 'riddler'], ['2026-07-20', '2026-07-21', '2026-07-22'])
  R.note('move-landing', m20)
  R.ck('D4-move-lands', /LL/.test(m20.spaceman.split(' | ')[0]) && /LL/.test(m20.plasma.split(' | ')[1]), 'the block lands with its gaps kept: Dash 16→20, Fable 17→21 (Ghost is the next check)', m20)
  R.ck('D4-course-medical-stay', /C/.test(cell(after, 'sufa', 0)) && /C/.test(cell(after, 'sufa', 1)) && /CSE/.test(cell(after, 'spaceman', 1)), 'the medical and the course never enter the move', { sufa: after.grid.sufa, spaceman: after.grid.spaceman })
  R.ck('D4-split-bid-moves', /LL/.test(m20.riddler.split(' | ')[0]) && !/request/.test(after.recs.riddler[D[0]]), 'Ghost’s undecided afternoon bid (beside his Inputs-filed morning) moves with the block (the banner counts it: 3 entries)', { banner: res && res.note, riddler20: m20.riddler, riddler16: after.recs.riddler[D[0]] })
}
if (ACT === 'moveclash') {
  R.ck('D4-all-or-nothing', ch.length === 0 && /booked|already/i.test(res.note), 'one clashing landing refuses the WHOLE move and says which day (D4)', { changed: ch, note: res.note })
}
/* the note tells the truth: what it claims written/decided equals the cells that actually changed */
if (['fill', 'delete', 'refuse', 'ack'].includes(ACT)) {
  R.ck(`${ACT}-note-true`, c.written == null ? ch.length > 0 && !(res && res.note) : c.written === ch.length, `the note's "N ${ACT === 'delete' ? 'deleted' : ACT === 'fill' ? 'written' : 'decided'}" equals the boxes that changed`, { note: res && res.note, claimed: c, changed: ch.length, cells: ch })
}

/* ---- undo, redo, reload ---- */
await step('undo-redo-reload', async () => {
  const u = await lwHist(page, 'undo')
  await lwOpen(page, D[0])
  const afterUndo = await read()
  const ch2 = changed(before, afterUndo)
  R.ck(`${ACT}-undo-restores`, ch2.length === 0 && JSON.stringify(afterUndo.inputs) === JSON.stringify(before.inputs), 'one Undo puts the whole rectangle back as it was', { undo: u, left: ch2, inputs: afterUndo.inputs })
  await L.lwShot(page, `w3-01-${ACT}-f-undone`, 'plasma', D[1])
  const r = await lwHist(page, 'redo')
  await lwOpen(page, D[0])
  const afterRedo = await read()
  const ch3 = changed(after, afterRedo)
  R.ck(`${ACT}-redo-reapplies`, ch3.length === 0, 'Redo puts the action back exactly', { redo: r, diff: ch3 })
  await reload(page)
  await lwOpen(page, D[0])
  const afterReload = await read()
  const ch4 = changed(after, afterReload)
  R.ck(`${ACT}-reload-keeps`, ch4.length === 0, 'after a reload the grid is what the action left', { diff: ch4 })
  await L.lwShot(page, `w3-01-${ACT}-g-reloaded`, 'plasma', D[1])
})
R.note('toasts', await toasts(page))
R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
