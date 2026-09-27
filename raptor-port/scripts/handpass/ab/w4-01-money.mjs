/* W4 — MONEY on days with several records (26 Sep 26). Old plan batch F1 + Fable S27, S28 + Astra 19, 25.
   Every record is filed through the Inputs page's own form, as an admin; after EVERY filing the five figure readers
   (the day cell, the balance column, the every-figure sheet, the drawer, the breakdown) and the manning rows are read,
   and must move at once and agree. Written as assertions of the RIGHT behaviour — re-running it IS the re-walk.
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/w4-01-money.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = 'w4'
const L = await import('./w4-lib.mjs')
const { openW4, fileInput, lwOpen, tapDay, closeSheets, shot, resultBook, ROOT, readAll, manningOn, manningDelta, top, cellOf, sideScroll, lwShot } = L
const PHONE = W === 'phone'
const R = resultBook(`W4-money-${W}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-w4-money-${W}.txt`)
const { browser, page, errors } = await openW4({ phone: PHONE, who: 'a' })
const P = n => `w4-money-${W}-${n}`
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).split('\n')[0].slice(0, 300)); await shot(page, P(`THREW-${name}`)).catch(() => {}); await closeSheets(page).catch(() => {}) } }
const lines = s => (s.lines || []).map(x => x.slice(0, 90))
/* the head-count rows (a person is 1 in each he belongs to); SC D / SC N are team maths and move by fractions */
const HEADS = ['sets', 'ip', 'iwso', 'instr', 'opsp', 'opsw', 'flp', 'wmp', 'sxo']
const onceOk = dm => { const h = HEADS.filter(k => dm[k] != null).map(k => dm[k]); return h.length > 0 && h.every(v => v === -1) }

/* F1 — four records on one day: Outlaw (casper, a pilot), Wed 22 Jul — LL 08:00–10:00, OL 10:30–11:30, a course all
   day, ATT C 13:00–17:00. Expected: one code (the LL morning — leave is top of the ladder, the earlier of the two), a
   grey +3 (nothing clashes: the two leaves do not share time, the medical is after them, a course clashes with
   nothing); the tap list shows all four in ladder order (LL, OL, ATT C, CSE); the LONGER morning leave (LL, 2 h) pays
   the morning half and OL pays nothing → +LVE −0.5, LL 0.5 used, OL none; MED TOT 0.5 (a 4-hour medical is a half);
   manning removes him ONCE (his rows fall by exactly 1). */
const F1 = { id: 'casper', d: '2026-07-22' }
await step('F1', async () => {
  await lwOpen(page, F1.d)
  const m0 = await manningOn(page, F1.d)
  const r0 = await readAll(page, F1.id, F1.d)
  R.note('F1-before', { cell: r0.cell, bal: r0.bal, sheet: r0.sheet })
  const steps = [
    { type: 'LL', span: 'custom', start: '08:00', end: '10:00', remarks: 'W4 F1 LL morning 2h' },
    { type: 'OL', span: 'custom', start: '10:30', end: '11:30', remarks: 'W4 F1 OL morning 1h' },
    { type: 'CSE', remarks: 'W4 F1 course' },
    { type: 'ATT C', span: 'custom', start: '13:00', end: '17:00', remarks: 'W4 F1 medical 4h' },
  ]
  let prev = r0
  for (const [i, s] of steps.entries()) {
    const f = await fileInput(page, { person: F1.id, from: F1.d, ...s })
    await lwOpen(page, F1.d)
    const r = await readAll(page, F1.id, F1.d)
    R.ck(`F1-file-${i + 1}-${s.type}`, f.added === 1 && r.agree, `${s.type} filed, and every figure reader agrees at once`, { added: f.added, toast: f.toast, asked: f.asked, cell: r.cell, bal: r.bal.bal, sheet: r.sheet, drawer: r.drawer, bd: r.breakdown, disagree: r.disagree })
    prev = r
  }
  const m1 = await manningOn(page, F1.d)
  const cell = prev.cell
  R.ck('F1-one-code-plus3', /LL/.test(cell.box) && !/OL/.test(cell.box) && cell.mark === '+3' && !cell.amber, 'the box shows the LL morning and a grey +3 (not amber)', cell)
  const t = await tapDay(page, PHONE, F1.id, F1.d)
  await shot(page, P('F1-taplist'))
  const ls = lines(t)
  const order = ls.map(l => (/^\S+/.exec(l) || [''])[0])
  R.ck('F1-taplist-four', t.open === 'daylist-sheet' && ls.length === 4, 'the tap list shows all four records', { open: t.open, lines: ls })
  R.ck('F1-taplist-ladder', /LL/.test(ls[0] || '') && /OL/.test(ls[1] || '') && /ATT C/.test(ls[2] || '') && /CSE/.test(ls[3] || ''), 'ladder order: LL, OL (leave, earlier first), ATT C (medical), CSE (course)', order)
  R.ck('F1-no-clash-sentence', !/can’t both stand|cover the same time/.test(t.text || ''), 'no clash sentence (nothing on the day shares time)', (t.text || '').slice(0, 200))
  await closeSheets(page)
  const s = prev.sheet
  R.ck('F1-lve-half-by-LL', top(s.lve) === top(r0.sheet.lve) - 0.5 && /\s0\.5$/.test(s.lve), '+LVE falls by 0.5 (the LL pays the morning half; OL pays nothing), LL 0.5 on the used line', { before: r0.sheet.lve, after: s.lve })
  R.ck('F1-breakdown-LL-not-OL', prev.breakdown.lve && /0\.5/.test(JSON.stringify(prev.breakdown.lve)) && !/OL[^"]*":"-?0\.5/.test(JSON.stringify(prev.breakdown.lve)), 'the breakdown charges LL 0.5 and OL 0', prev.breakdown.lve)
  R.ck('F1-medtot', top(s.medtot) === 0.5, 'MED TOT 0.5 (a 4-hour ATT C is a half day)', s.medtot)
  R.ck('F1-lvetot', top(s.lvetot) === 0.5, 'LVE TOT 0.5 (one half charged once)', s.lvetot)
  const dm = manningDelta(m0, m1)
  R.ck('F1-manning-once', onceOk(dm), 'the head-count rows he belongs to fall by exactly 1 — removed once, not per record', { delta: dm })
  await lwShot(page, P('F1-box'), F1.id, F1.d)
})

/* Fable S27 — answer D: which record pays a half. Outlaw again, three more weekdays:
   Thu 23: LL 08:00–09:00 (1 h) + OIL 09:30–11:30 (2 h)  → OIL (longer) pays the morning: OIL −0.5, LVE untouched
   Fri 24: OIL 07:00–08:00 (1 h) + LL 09:00–10:00 (1 h)  → equal lengths → the EARLIER start (OIL) pays: OIL −0.5 more
   Mon 27: LL 08:00–10:00 + OL 14:00–16:00 (Astra 25)     → one FULL annual day (LL pays the morning, OL the afternoon);
           manning removes him once, as a whole body. */
await step('S27', async () => {
  const before = await readAll(page, F1.id, null, { bd: ['lve'] })
  const fileAll = async (d, list) => { for (const s of list) { const f = await fileInput(page, { person: F1.id, from: d, span: 'custom', ...s }); if (f.added !== 1) R.note('S27-file-refused', { d, s, f }) } }
  await fileAll('2026-07-23', [{ type: 'LL', start: '08:00', end: '09:00', remarks: 'W4 S27 LL 1h' }, { type: 'OIL', start: '09:30', end: '11:30', remarks: 'W4 S27 OIL 2h' }])
  await lwOpen(page, '2026-07-23')
  const a = await readAll(page, F1.id, '2026-07-23', { bd: ['lve'] })
  R.ck('S27-longer-pays', top(a.sheet.oil) === top(before.sheet.oil) - 0.5 && top(a.sheet.lve) === top(before.sheet.lve) && a.agree, 'Thu 23: the 2-hour OIL pays the morning (OIL −0.5), the 1-hour LL pays nothing (LVE unchanged); readers agree', { before: { lve: before.sheet.lve, oil: before.sheet.oil }, after: { lve: a.sheet.lve, oil: a.sheet.oil }, cell: a.cell, disagree: a.disagree })
  await fileAll('2026-07-24', [{ type: 'OIL', start: '07:00', end: '08:00', remarks: 'W4 S27 OIL 1h early' }, { type: 'LL', start: '09:00', end: '10:00', remarks: 'W4 S27 LL 1h later' }])
  await lwOpen(page, '2026-07-24')
  const b = await readAll(page, F1.id, '2026-07-24', { bd: ['lve'] })
  R.ck('S27-equal-earlier-pays', top(b.sheet.oil) === top(a.sheet.oil) - 0.5 && top(b.sheet.lve) === top(a.sheet.lve) && b.agree, 'Fri 24: equal lengths — the EARLIER start (OIL 07:00) pays; LVE unchanged', { lve: b.sheet.lve, oil: b.sheet.oil, cell: b.cell, disagree: b.disagree })
  const m0 = await manningOn(page, '2026-07-27')
  await fileAll('2026-07-27', [{ type: 'LL', start: '08:00', end: '10:00', remarks: 'W4 A25 LL morning' }, { type: 'OL', start: '14:00', end: '16:00', remarks: 'W4 A25 OL afternoon' }])
  await lwOpen(page, '2026-07-27')
  const c = await readAll(page, F1.id, '2026-07-27', { bd: ['lve'] })
  const m1 = await manningOn(page, '2026-07-27')
  R.ck('A25-both-halves-one-day', top(c.sheet.lve) === top(b.sheet.lve) - 1 && top(c.sheet.lvetot) === top(b.sheet.lvetot) + 1 && c.agree, 'Mon 27: two separated leaves touching both halves = ONE full annual day (LVE −1, LVE TOT +1)', { lve: c.sheet.lve, lvetot: c.sheet.lvetot, bd: c.breakdown.lve, disagree: c.disagree })
  const dm = manningDelta(m0, m1)
  R.ck('A25-manning-whole-body', onceOk(dm), 'his manning rows fall by exactly 1 (a whole body, not 0.5, not 2)', dm)
  R.ck('A25-box', /LL/.test(c.cell.box) && c.cell.mark === '+1' && !c.cell.amber, 'the box shows the LL morning with a grey +1', c.cell)
  await lwShot(page, P('S27-A25-row'), F1.id, '2026-07-24')
})

/* Fable S28 / Astra 19 — leave over a course, and over overseas duty, in BOTH orders. Three pilots, clean days:
   Havoc (boosh)  Tue 28 Jul: CSE all day, THEN OL all day   → box OL, +1, LVE −1, manning removes him once
   Comet (beams)  Wed 29 Jul: OD all day, THEN LL all day    → box LL, +1, LVE −1, once
   Forge (chaps)  Thu 30 Jul: LL all day, THEN OD all day    → the same, whichever came first */
await step('S28', async () => {
  const cases = [
    { id: 'boosh', d: '2026-07-28', first: { type: 'CSE', remarks: 'W4 S28 course' }, then: { type: 'OL', span: 'all', remarks: 'W4 S28 OL over course' }, want: 'OL', tag: 'S28-OL-over-CSE' },
    { id: 'beams', d: '2026-07-29', first: { type: 'OD', remarks: 'W4 A19 OD first' }, then: { type: 'LL', span: 'all', remarks: 'W4 A19 LL over OD' }, want: 'LL', tag: 'A19-LL-over-OD' },
    { id: 'chaps', d: '2026-07-30', first: { type: 'LL', span: 'all', remarks: 'W4 A19 LL first' }, then: { type: 'OD', remarks: 'W4 A19 OD over LL' }, want: 'LL', tag: 'A19-OD-over-LL' },
  ]
  for (const k of cases) {
    await lwOpen(page, k.d)
    const m0 = await manningOn(page, k.d)
    const r0 = await readAll(page, k.id, k.d, { bd: ['lve'] })
    const f1 = await fileInput(page, { person: k.id, from: k.d, ...k.first })
    await lwOpen(page, k.d)
    const mMid = await manningOn(page, k.d)
    const f2 = await fileInput(page, { person: k.id, from: k.d, ...k.then })
    await lwOpen(page, k.d)
    const m1 = await manningOn(page, k.d)
    const r1 = await readAll(page, k.id, k.d, { bd: ['lve'] })
    const t = await tapDay(page, PHONE, k.id, k.d)
    await shot(page, P(`${k.tag}-taplist`))
    await closeSheets(page)
    R.ck(`${k.tag}-both-kept`, f1.added === 1 && f2.added === 1 && t.open === 'daylist-sheet' && (t.lines || []).length === 2, 'both records kept — nothing silently replaced — and the tap list shows both', { f1: [f1.added, f1.toast], f2: [f2.added, f2.toast], open: t.open, lines: lines(t) })
    R.ck(`${k.tag}-box`, new RegExp(`^${k.want}$`).test(r1.cell.box) && r1.cell.mark === '+1' && !r1.cell.amber, `box ${k.want} (leave over away-duty on the ladder), a grey +1`, r1.cell)
    R.ck(`${k.tag}-charged`, top(r1.sheet.lve) === top(r0.sheet.lve) - 1 && r1.agree, 'LVE −1 (a weekday leave charges), every reader agreeing', { before: r0.sheet.lve, after: r1.sheet.lve, disagree: r1.disagree })
    const dFirst = manningDelta(m0, mMid), dBoth = manningDelta(m0, m1)
    R.ck(`${k.tag}-manning-once`, JSON.stringify(dFirst) === JSON.stringify(dBoth) && onceOk(dBoth), 'the second record removes nobody more: his rows fall by 1 once, not twice', { afterFirst: dFirst, afterBoth: dBoth })
  }
  await lwShot(page, P('S28-A19-rows'), 'beams', '2026-07-29')
})

if (PHONE) R.note('side-scroll', await sideScroll(page))
R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
