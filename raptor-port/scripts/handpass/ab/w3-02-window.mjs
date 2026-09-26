/* W3-02 — THE ONE WINDOW (N15): Ack / Approve / Refuse / Move on one bid, in the stages OPEN, CLOSED and PUBLISHED,
   and ABSENT in a DRAFT war; on a PUBLISHED war a war-approved leave opens the remarks sheet only; the tap list (a day
   holding several records) and its per-record buttons in each stage (Fable S13, S19; Astra 37).
   Written as assertions of the RIGHT behaviour. Usage: node scripts/handpass/ab/w3-02-window.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = 'w3'
const L = await import('./w3-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, bidOn, lwAward, tapCell, sheetPress, closeSheets, sheetNow, inputsOf, shot, resultBook, ROOT, toastSpy, toasts,
  recsOf, lwHist, reload, stageNow, stageGo, warPick, lwCell } = L
const PHONE = W === 'phone'
const R = resultBook(`W3-02-${W}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-w3-02-${W}.txt`)
const { browser, page, errors } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: PHONE ? 3 : 1 })
await toastSpy(page)
const pic = (n) => shot(page, `w3-02-${W}-${n}`)
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await pic(`THREW-${name}`).catch(() => {}) } }
const has = (s, ...ids) => ids.every(id => (s.buttons || []).some(b => b.startsWith(id + ':')))
const hasNone = (s, ...ids) => ids.every(id => !(s.buttons || []).some(b => b.startsWith(id + ':')))
const WIN = ['decide-ack', 'decide-approve', 'decide-refuse', 'decide-shift']
const recs = async (p, d) => (await recsOf(page, p, [d]))[d]
const inputsOn = async (p, label) => (await inputsOf(page, p)).filter(x => x.date === label || (x.endDate && x.date <= label)).map(x => `${x.type} ${x.date}${x.endDate ? '–' + x.endDate : ''} lw=${x.lw ? 'y' : 'n'} "${x.remarks}"`)
async function moveTo(iso) {
  const f = page.locator('[data-testid="bid-picker"] [data-testid="shift-date"]:visible').first()
  await f.fill(iso); await page.waitForTimeout(250)
  return sheetPress(page, 'decide-shift')
}

await lwOpen(page, '2026-07-20')
R.note('stage-start', await stageNow(page))

/* ================= OPEN ================= */
await step('O1-window-open', async () => {
  const b = await bidOn(page, 'mamba', '2026-07-20', 'LL')
  const s = await tapCell(page, 'mamba', '2026-07-20')
  await pic('O1-open-window')
  R.ck('O1-window-open', b.placed && s.open === 'bid-picker' && has(s, ...WIN), 'OPEN: a tap on an undecided bid opens the bid sheet with Ack / Approve / Refuse / Move on it (N15)', { placed: b.placed, open: s.open, buttons: s.buttons })
})
await step('O2-ack', async () => {
  const a = await sheetPress(page, 'decide-ack')
  const r1 = await recs('mamba', '2026-07-20')
  const s = await tapCell(page, 'mamba', '2026-07-20')
  const pressed = await page.locator('[data-testid="decide-ack"][aria-pressed="true"]').count()
  await pic('O2-acked-window')
  await closeSheets(page)
  R.ck('O2-ack', a.sheet.open === 'nothing' && /acknowledged/.test(r1) && pressed === 1, 'Ack closes the window, the bid reads acknowledged, and the window shows Ack pressed next time', { closed: a.sheet.open, rec: r1, ackPressed: pressed })
  const u = await lwHist(page, 'undo'); const r2 = await recs('mamba', '2026-07-20')
  const rd = await lwHist(page, 'redo'); const r3 = await recs('mamba', '2026-07-20')
  R.ck('O2-ack-undo-redo', /pending/.test(r2) && /acknowledged/.test(r3), 'Undo takes the Ack back (pending), Redo puts it back', { undo: u.title, afterUndo: r2, redo: rd.title, afterRedo: r3 })
})
await step('O3-move', async () => {
  await tapCell(page, 'mamba', '2026-07-20')
  const m = await moveTo('2026-07-22')
  const g = await L.grid(page, ['mamba'], ['2026-07-20', '2026-07-21', '2026-07-22'])
  const r22 = await recs('mamba', '2026-07-22')
  await L.lwShot(page, `w3-02-${W}-O3-moved`, 'mamba', '2026-07-22')
  R.ck('O3-move', m.sheet.open === 'nothing' && /LL/.test(g.mamba.split(' | ')[2]) && !/LL/.test(g.mamba.split(' | ')[0]) && /pending/.test(r22) && !/shiftedFrom/.test(r22),
    'OPEN: the window\'s Move lands the bid on 22 Jul, UNDECIDED (a move is a proposal), no moved mark while bidding is open', { sheet: m.sheet.open, grid: g, rec22: r22 })
  const u = await lwHist(page, 'undo'); const g2 = await L.grid(page, ['mamba'], ['2026-07-20', '2026-07-22'])
  const rd = await lwHist(page, 'redo'); const g3 = await L.grid(page, ['mamba'], ['2026-07-20', '2026-07-22'])
  R.ck('O3-move-undo-redo', /LL/.test(g2.mamba.split(' | ')[0]) && /LL/.test(g3.mamba.split(' | ')[1]), 'Undo puts the bid back on 20 Jul; Redo moves it again', { undo: u.title, afterUndo: g2, afterRedo: g3 })
})
await step('O4-approve', async () => {
  await tapCell(page, 'mamba', '2026-07-22')
  const a = await sheetPress(page, 'decide-approve')
  const inp = (await inputsOf(page, 'mamba')).filter(x => /Jul 22/.test(x.date))
  const r = await recs('mamba', '2026-07-22')
  R.ck('O4-approve', a.sheet.open === 'nothing' && inp.length === 1 && !!inp[0].lw && r === '-', 'OPEN: Approve writes the Input (the war\'s own, lw) and the bid goes', { inputs: inp, rec: r })
  const s = await tapCell(page, 'mamba', '2026-07-22')
  await pic('O4-approved-tap')
  R.note('O4-approved-leave-tap-open', { open: s.open, buttons: s.buttons, text: (s.text || '').slice(0, 200) })
  await closeSheets(page)
})
await step('O6-refuse', async () => {
  await bidOn(page, 'nact', '2026-07-20', 'LL')
  await tapCell(page, 'nact', '2026-07-20')
  const a = await sheetPress(page, 'decide-refuse')
  const r = await recs('nact', '2026-07-20'); const c = await lwCell(page, 'nact', '2026-07-20')
  R.ck('O6-refuse', a.sheet.open === 'nothing' && /refused/.test(r), 'OPEN: Refuse records the bid as refused (kept as history)', { rec: r, cell: c })
})
await step('O7-taplist-open', async () => {
  await lwAward(page, 'nact', '2026-07-21', '1', 'W3 window award')
  const b = await bidOn(page, 'nact', '2026-07-21', 'LL')
  const s = await tapCell(page, 'nact', '2026-07-21')
  await pic('O7-taplist-open')
  R.note('O7-taplist', { placed: b.placed, why: b.why, open: s.open, lines: s.lines, buttons: s.buttons })
  R.ck('O7-taplist-open', s.open === 'daylist-sheet' && s.buttons.some(x => /^dl-approve-/.test(x)) && s.buttons.some(x => /^dl-oil-edit-/.test(x)),
    'OPEN: a day holding an award and a bid opens the tap list, the bid with its own Approve / Ack / Refuse / Clear, the award with Edit… / Clear', { open: s.open, buttons: s.buttons })
  await closeSheets(page)
})

/* ================= CLOSED ================= */
let adv
await step('C0-advance', async () => {
  await bidOn(page, 'razer', '2026-07-20', 'LL')          // an undecided bid that will still be waiting at PUBLISHED
  await bidOn(page, 'glass', '2026-07-24', 'LL')           // approved at OPEN, then an award beside it (the tap list at PUBLISHED)
  await tapCell(page, 'glass', '2026-07-24'); await sheetPress(page, 'decide-approve'); await closeSheets(page)
  await lwAward(page, 'glass', '2026-07-24', '1', 'W3 beside approved')
  adv = await stageGo(page, 'advance')
  await pic('C0-closed')
  R.ck('C0-advance', adv.pressed && /CLOSED/i.test(adv.now), 'the stage control moves the war to BIDDING CLOSED', adv)
})
await step('C1-window-closed', async () => {
  const b = await bidOn(page, 'slipway', '2026-07-20', 'LL')
  const s = await tapCell(page, 'slipway', '2026-07-20')
  R.ck('C1-window-closed', b.placed && s.open === 'bid-picker' && has(s, ...WIN), 'CLOSED: the same window — Ack / Approve / Refuse / Move', { placed: b.placed, why: b.why, open: s.open, buttons: s.buttons })
  const m = await moveTo('2026-07-23')
  const s2 = await tapCell(page, 'slipway', '2026-07-23')
  const mf = await page.locator('[data-testid="decide-movedfrom"]').allInnerTexts()
  await pic('C1-moved-from')
  await closeSheets(page)
  const mark = await page.evaluate(() => { const c = document.querySelector('[data-testid="cell-slipway-2026-07-23"]'); return c ? c.className + ' ' + (c.querySelector('.c') || c).className : 'NOCELL' })
  R.ck('C1-moved-mark', m.sheet.open === 'nothing' && /20/.test(mf.join(' ')), 'CLOSED: a moved bid says "moved from 2026-07-20" on its window, and the grid wears the dotted moved mark', { movedFrom: mf, cls: mark })
  await L.lwShot(page, `w3-02-${W}-C1-grid-moved-mark`, 'slipway', '2026-07-23')
})
await step('C2-approve-closed', async () => {
  await tapCell(page, 'slipway', '2026-07-23')
  const a = await sheetPress(page, 'decide-approve')
  const inp = (await inputsOf(page, 'slipway')).filter(x => /Jul 23/.test(x.date))
  R.ck('C2-approve-closed', a.sheet.open === 'nothing' && inp.length === 1, 'CLOSED: Approve writes the Input', inp)
  const s = await tapCell(page, 'mamba', '2026-07-22')
  R.note('C3-approved-leave-tap-closed', { open: s.open, buttons: s.buttons })
  await pic('C3-approved-tap-closed')
  await closeSheets(page)
})

/* ================= PUBLISHED ================= */
await step('P0-advance', async () => {
  const a = await stageGo(page, 'advance')
  await pic('P0-published')
  R.ck('P0-advance', a.pressed && /PUBLISHED/i.test(a.now), 'the stage control moves the war to PUBLISHED', a)
})
await step('P1-approved-remarks-only', async () => {
  const s = await tapCell(page, 'mamba', '2026-07-22')
  await pic('P1-approved-remarks')
  R.ck('P1-approved-remarks-only', s.open === 'remarks-sheet' && hasNone(s, ...WIN), 'PUBLISHED: a war-approved leave opens the remarks sheet ONLY — no Ack / Approve / Refuse / Move (owner, 21 Sep 26)', { open: s.open, buttons: s.buttons })
  await closeSheets(page)
})
await step('P2-undecided-still-decides', async () => {
  const s = await tapCell(page, 'razer', '2026-07-20')
  await pic('P2-undecided-published')
  R.ck('P2-undecided-still-decides', s.open === 'bid-picker' && has(s, ...WIN), 'PUBLISHED: a bid nobody decided still opens the one window with its four answers (Fable S19)', { open: s.open, buttons: s.buttons })
  await closeSheets(page)
})
await step('P3-taplist-published', async () => {
  const s = await tapCell(page, 'glass', '2026-07-24')
  await pic('P3-taplist-published')
  const leave = (s.buttons || []).filter(b => /^dl-(unapprove|refuse|remove|move)-/.test(b))
  R.ck('P3-taplist-published', s.open === 'daylist-sheet' && leave.length === 0 && s.buttons.some(b => /^dl-note-/.test(b)),
    'PUBLISHED: on the tap list an approved leave has Note only — no Back to bid / Refuse / Delete / Move', { open: s.open, lines: s.lines, buttons: s.buttons })
  await closeSheets(page)
  const t = await tapCell(page, 'nact', '2026-07-21')
  R.ck('P3b-taplist-bid-published', t.open === 'daylist-sheet' && t.buttons.some(b => /^dl-approve-/.test(b)), 'PUBLISHED: the tap list\'s undecided bid still carries Approve / Ack / Refuse', { buttons: t.buttons })
  await closeSheets(page)
})
await step('P4-reload', async () => {
  await reload(page); await lwOpen(page, '2026-07-20')
  const st = await stageNow(page)
  const r = await recs('razer', '2026-07-20')
  R.ck('P4-reload', /PUBLISHED/i.test(st) && /pending/.test(r), 'after a reload the war is still PUBLISHED and the undecided bid is still there', { stage: st, razer: r })
})

/* ================= DRAFT ================= */
await step('D0-new-war', async () => {
  await page.locator('[data-testid="war-new"]:visible').first().click(); await page.waitForTimeout(500)
  await page.locator('[data-testid="war-name"]').fill('W3 DRAFT 28')
  const day = async (iso) => {
    for (let i = 0; i < 30 && !(await page.locator(`[data-testid="war-day-${iso}"]`).count()); i++) { await page.locator('[data-testid="war-next-month"]').click(); await page.waitForTimeout(80) }
    await page.locator(`[data-testid="war-day-${iso}"]`).first().click(); await page.waitForTimeout(150)
  }
  await day('2028-01-01'); await day('2028-01-31')
  await pic('D0-new-war-sheet')
  await page.locator('[data-testid="war-create"]').click(); await page.waitForTimeout(1500)
  const opts = await warPick(page)
  const st = await stageNow(page)
  R.ck('D0-new-war', /DRAFT/i.test(st) && opts.some(o => /W3 DRAFT 28/.test(o.t)), 'the + New door makes a DRAFT war and puts it on screen', { stage: st, opts })
})
await step('D1-draft-no-window', async () => {
  await lwOpen(page, '2028-01-10')
  const s = await tapCell(page, 'mamba', '2028-01-10')
  R.note('D1-draft-first-tap', { open: s.open, buttons: s.buttons })
  await closeSheets(page)
  const b = await bidOn(page, 'mamba', '2028-01-11', 'LL')
  const s2 = await tapCell(page, 'mamba', '2028-01-11')
  await pic('D1-draft-bid-tapped')
  R.ck('D1-draft-no-window', b.placed && s2.open === 'bid-picker' && hasNone(s2, ...WIN), 'DRAFT: an admin places a bid; tapping it opens the bid sheet with NO Ack / Approve / Refuse / Move (Fable S13, Astra 37)', { placed: b.placed, why: b.why, open: s2.open, buttons: s2.buttons })
  await closeSheets(page)
})
await step('D2-draft-drag-no-decide', async () => {
  const s = await L.dragRect(page, 'mamba', '2028-01-11', 'nact', '2028-01-12')
  await pic('D2-draft-selection')
  R.ck('D2-draft-drag-no-decide', s.open === 'select-sheet' && hasNone(s, 'sel-approve', 'sel-refuse', 'sel-pending'), 'DRAFT: the drag-selection sheet has no Decide row', { open: s.open, buttons: s.buttons })
  await closeSheets(page)
})
R.note('toasts', await toasts(page))
R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
