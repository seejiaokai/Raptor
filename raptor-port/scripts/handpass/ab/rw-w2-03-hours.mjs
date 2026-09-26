/* RE-WALK copy of w2-03-hours.mjs on the REBUILT app (26 Sep 26): pictures to rewalk/w2, results to
   parts/2026-09-26-absence-rewalk-w2-03-*.txt; nothing else changed (the real-hours behaviour must be unchanged).
   W2-03 — a medical's REAL HOURS (register §7 as updated by CURRENT-STATE §1 rows 1–3; the six-hour rule; H6), walked
   in the running app. Assertions of the RIGHT behaviour.
     H1 (Fable S22)  ATT C 09:00–14:00 over a full-day LL: the leave survives from 14:00 (CURRENT-STATE §1 row 2), the
                     box draws the medical as a MORNING (six hours or less → a half, the side of noon its midpoint sits on),
                     MED TOT +0.5; the leave now charges half; manning takes the man away once
     H2 (§7)         leave 10:30–11:30 beside a medical 08:00–10:00 — "Allow both — judge on real times", in both orders;
                     leave 10:30–11:30 INSIDE a medical 09:00–14:00 is refused, naming the medical's real hours
     H3 (Fable S23)  the six-hour boundary: ATT C 08:00–14:00 (6h00) is half a day; 08:00–14:01 is a full day
     H4 (Astra 17)   an overnight medical 23:00–02:00 counts on the second date for clashes (H6, CURRENT-STATE row 3):
                     leave 01:00–03:00 the next day is refused naming the medical; leave 03:00–05:00 is allowed; MED TOT
                     counts only its own date
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/w2-03-hours.mjs [desktop|phone] */
const WD = process.argv[2] || 'desktop'
process.env.AB_WHO = 'rewalk/w2'
const L = await import('./ab-lib.mjs')
const W = await import('./w2-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { shot, toastSpy, toasts, resultBook, ROOT } = L
const PHONE = WD === 'phone'
const R = resultBook(`RW-W2-03-${WD}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-w2-03-${WD}.txt`)
const { browser, page, errors } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: PHONE ? 3 : 1 })
await toastSpy(page)
const P = (n) => `rw-w2-03-${WD}-${n}`
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const ONLY = (process.env.W2_ONLY || '').split(',').filter(Boolean)
async function step(name, fn) { if (ONLY.length && !ONLY.some(o => name.startsWith(o))) return; try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await shot(page, P(`THREW-${name}`)).catch(() => {}) } }
const JUL = d => `2026-07-${String(d).padStart(2, '0')}`
const num = s => parseFloat(String(s || '0').replace(/[^\d.\-]/g, '')) || 0
const cellOf = async (id, iso) => { await L.lwOpen(page, iso); return L.lwCell(page, id, iso) }

/* ================================================================ H1 — ATT C 09:00–14:00 over a full-day LL */
await step('H1', async () => {
  const M = 'dice'                     // Reaper
  await W.fileMed(page, { person: M, type: 'LL', from: JUL(20), remarks: 'W2 H1 leave' })
  const f0 = await W.warRead(page, M, [JUL(20)]); const man0 = await W.manning(page, JUL(20))
  const m = await W.fileMed(page, { person: M, type: 'ATT C', from: JUL(20), span: 'custom', start: '09:00', end: '14:00', remarks: 'W2 H1 clinic' })
  const rows = await W.medRows(page, M)
  const f1 = await W.warRead(page, M, [JUL(20)]); const man1 = await W.manning(page, JUL(20))
  const cell = await cellOf(M, JUL(20))
  await L.lwShot(page, P('H1a-war-attc-morning-over-leave'), M, JUL(20))
  const t = await L.tapCell(page, M, JUL(20))
  await shot(page, P('H1b-tap-list'))
  await L.closeSheets(page)
  R.note('H1-filed', { sheet: m.sheet, rows, cell, tap: t })
  R.ck('H1-leave-survives-from-14', rows.some(r => /^LL Jul 20 14:00-/.test(r)) && rows.some(r => /^ATT C Jul 20 09:00-14:00/.test(r)),
    'the leave survives from 14:00 (the hours the medical does not cover — CURRENT-STATE §1 row 2); the ATT C keeps 09:00–14:00', rows)
  R.ck('H1-medtot-half', num(f1.figs.medtot) - num(f0.figs.medtot) === 0.5, 'MED TOT +0.5 (five hours → half a day, six-hour rule)', { before: f0.figs, after: f1.figs })
  R.ck('H1-leave-charges-half', num(f1.figs.lvetot) === num(f0.figs.lvetot) - 0.5, 'the leave now charges half a day (LVE TOT 1 → 0.5)', { before: f0.figs, after: f1.figs })
  R.ck('H1-box-and-list', /^LL>/.test(cell.box) && /\+1/.test(cell.mark) && (t.lines || []).some(l => /ATT C — medical, morning/.test(l)) && (t.lines || []).some(l => /LL — local leave, 14:00/.test(l)),
    'the box shows the leave as an afternoon ("LL>", the ladder puts leave above off-sick) with a grey +1; the tap list names the ATT C as a MORNING and the leave from 14:00', { cell, lines: t.lines })
  R.ck('H1-manning-once', same(man0, man1), 'manning is unchanged — he was away all day and still is (a morning medical + an afternoon of leave = one body away, once)', { before: man0, after: man1 })
  R.note('H1-manning', { before: man0, after: man1 })
})

/* ================================================================ H2 — leave beside a medical at non-overlapping hours */
await step('H2', async () => {
  const M = 'pump'                     // Piston — medical first, then leave
  const a = await W.fileMed(page, { person: M, type: 'ATT C', from: JUL(21), span: 'custom', start: '08:00', end: '10:00', remarks: 'W2 H2 early clinic' })
  await toasts(page)
  const b = await W.fileMed(page, { person: M, type: 'LL', from: JUL(21), span: 'custom', start: '10:30', end: '11:30', remarks: 'W2 H2 errand' })
  const tb = await toasts(page)
  const rows = await W.medRows(page, M)
  R.ck('H2-medical-then-leave', a.added === 1 && b.added === 1 && rows.some(r => /^ATT C Jul 21 08:00-10:00/.test(r)) && rows.some(r => /^LL Jul 21 10:30-11:30/.test(r)),
    'ATT C 08:00–10:00, then LL 10:30–11:30 the same morning: both filed, neither cut ("Allow both — judge on real times")', { rows, toasts: tb })
  const f = await W.warRead(page, M, [JUL(21)])
  await L.lwShot(page, P('H2a-war-medical-and-leave-same-morning'), M, JUL(21))
  R.note('H2-war', f)
  const M2 = 'snap'                    // Cinch — leave first, then medical
  await W.fileMed(page, { person: M2, type: 'LL', from: JUL(21), span: 'custom', start: '10:30', end: '11:30', remarks: 'W2 H2 errand' })
  const c = await W.fileMed(page, { person: M2, type: 'ATT C', from: JUL(21), span: 'custom', start: '08:00', end: '10:00', remarks: 'W2 H2 early clinic' })
  const rows2 = await W.medRows(page, M2)
  R.ck('H2-leave-then-medical', c.added === 1 && rows2.some(r => /^LL Jul 21 10:30-11:30/.test(r)) && rows2.some(r => /^ATT C Jul 21 08:00-10:00/.test(r)),
    'the other order: LL 10:30–11:30 first, then ATT C 08:00–10:00 — both stand, the leave uncut', rows2)
  /* inside the medical's real hours: refused, naming them */
  const M3 = 'slipway'                 // Drifter
  await W.fileMed(page, { person: M3, type: 'ATT C', from: JUL(22), span: 'custom', start: '09:00', end: '14:00', remarks: 'W2 H2 clinic' })
  await toasts(page)
  const d = await W.fileMed(page, { person: M3, type: 'LL', from: JUL(22), span: 'custom', start: '10:30', end: '11:30', remarks: 'W2 H2 inside' })
  const td = await toasts(page)
  await shot(page, P('H2b-leave-inside-medical-refused'))
  R.ck('H2-inside-refused', d.added === 0 && td.some(t => /ATT C/.test(t) && /09:00/.test(t)), 'LL 10:30–11:30 inside ATT C 09:00–14:00 is refused, and the refusal names the medical\'s real hours (09:00–14:00)', { toasts: td, sheet: d.sheet })
})

/* ================================================================ H3 — the six-hour boundary */
await step('H3', async () => {
  const M = 'prism'                    // Recon
  const f0 = await W.warRead(page, M, [JUL(21), JUL(23)])
  await W.fileMed(page, { person: M, type: 'ATT C', from: JUL(21), span: 'custom', start: '08:00', end: '14:00', remarks: 'W2 H3 six hours' })
  const f1 = await W.warRead(page, M, [JUL(21), JUL(23)])
  const c1 = await cellOf(M, JUL(21))
  await W.fileMed(page, { person: M, type: 'ATT C', from: JUL(23), span: 'custom', start: '08:00', end: '14:01', remarks: 'W2 H3 six hours one minute' })
  const f2 = await W.warRead(page, M, [JUL(21), JUL(23)])
  const c2 = await cellOf(M, JUL(23))
  await L.lwShot(page, P('H3a-war-six-hours-vs-one-minute-more'), M, JUL(22))
  R.ck('H3-six-hours-is-half', num(f1.figs.medtot) - num(f0.figs.medtot) === 0.5, 'ATT C 08:00–14:00 (exactly six hours) counts half a day', { before: f0.figs.medtot, after: f1.figs.medtot, cell: c1 })
  R.ck('H3-past-six-is-full', num(f2.figs.medtot) - num(f1.figs.medtot) === 1, 'ATT C 08:00–14:01 (one minute past six hours) counts a full day', { before: f1.figs.medtot, after: f2.figs.medtot, cell: c2 })
  const man21 = await W.manning(page, JUL(21)), man23 = await W.manning(page, JUL(23))
  R.note('H3-manning', { half: man21, full: man23 })
})

/* ================================================================ H4 — an overnight medical, the second date */
await step('H4', async () => {
  const M = 'haowen'                   // Talisman
  const f0 = await W.warRead(page, M, [JUL(22), JUL(23)])
  const a = await W.fileMed(page, { person: M, type: 'ATT C', from: JUL(22), span: 'custom', start: '23:00', end: '02:00', remarks: 'W2 H4 night' })
  const rows0 = await W.medRows(page, M)
  const f1 = await W.warRead(page, M, [JUL(22), JUL(23)])
  await toasts(page)
  const b = await W.fileMed(page, { person: M, type: 'LL', from: JUL(23), span: 'custom', start: '01:00', end: '03:00', remarks: 'W2 H4 overlaps the tail' })
  const tb = await toasts(page)
  await shot(page, P('H4a-leave-over-overnight-tail-refused'))
  R.ck('H4-tail-clashes', a.added === 1 && b.added === 0 && tb.some(t => /ATT C/.test(t)), 'LL 01:00–03:00 on 23 Jul meets the medical that ran past midnight (23:00–02:00 on the 22nd): refused, naming it', { rows0, toasts: tb, sheet: b.sheet })
  const c = await W.fileMed(page, { person: M, type: 'LL', from: JUL(23), span: 'custom', start: '03:00', end: '05:00', remarks: 'W2 H4 after the tail' })
  R.ck('H4-after-tail-allowed', c.added === 1, 'LL 03:00–05:00 on 23 Jul (after the tail) is allowed', await W.medRows(page, M))
  R.ck('H4-medtot-own-date', num(f1.figs.medtot) - num(f0.figs.medtot) === 0.5, 'MED TOT counts the three-hour medical once, on its own date: +0.5 — no extra day for the tail', { before: f0, after: f1 })
  const f2 = await W.warRead(page, M, [JUL(22), JUL(23)])
  await L.lwShot(page, P('H4b-war-overnight'), M, JUL(22))
  R.note('H4-war', { after: f2 })
})

R.note('errors', errors.slice(0, 20))
R.ck('console-clean', !errors.length, 'no console errors, page errors or failed requests', errors.slice(0, 10))
R.save()
await browser.close()
