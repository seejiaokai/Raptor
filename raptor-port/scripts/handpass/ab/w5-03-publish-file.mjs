/* W5 — ORDER 3: PUBLISH then FILE / FILE then PUBLISH (Fable S9, Astra 7), with undo / redo / reload, and N9 — publishing a
   weekend (and an AL) over a man's pending bid KEEPS the bid and flags the day. Assertions of the RIGHT behaviour.
   Rules: D177–D179 (an input change after publishing reads "1 pending" on the admin's working copy, the four sign-offs fall,
   the published face keeps what it went out with), D98/D174 (taken back reads 0), the money the same in both orders
   (figures read the records — publishing moves no leave money), N9 (publishing KEEPS an undecided bid on published work,
   flags the day, and the publish message names it — sync.ts "…now sits on published work — the day is flagged, the bid is
   still live"), N2/N4 (the credit lands beside the bid), D142 (the AL is the day's latest version).
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/w5-03-publish-file.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = 'w5'
const L = await import('./ab-lib.mjs')
const S = await import('./ab-sched.mjs')
const X = await import('./w5-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, tapCell, closeSheets, fileInput, inputsOf, shot, toastSpy, toasts, resultBook, ROOT, lwShot, board, publishAL, signDay, bidOn, closeBoard } = L
const { undo, redo, reload, snap } = X
const PHONE = W === 'phone'
const R = resultBook(`W5-03-${W}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-w5-03-${W}.txt`)
const { browser, page, errors } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: PHONE ? 2 : 1 })
await toastSpy(page)
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await shot(page, `w5-03-${W}-THREW-${name}`).catch(() => {}) } }
const pic = n => `w5-03-${W}-${n}`
const has = (u, id) => Array.isArray(u) && u.some(r => r.endsWith(':' + id))
const FRI = 4, FISO = '2026-07-17', SAT = 5, SISO = '2026-07-18'
const lve = f => f ? +f.lve : NaN

let Xm, Ym, fy0, fy1, fx0, fx1
/* ---- FILE then PUBLISH (Y), then PUBLISH then FILE (X), on Friday */
await step('F-file-then-publish', async () => {
  ;[Xm, Ym] = await S.freeMen(page, [4])
  await lwOpen(page, FISO)
  fy0 = (await snap(page, Ym, [FISO])).figs; fx0 = (await snap(page, Xm, [FISO])).figs
  const y = await fileInput(page, { person: Ym, type: 'LL', from: FISO, remarks: 'W5 Y leave, filed before publishing' })
  await toasts(page)
  const pub = await S.pubAndSign(page, FRI)
  const pubToasts = await toasts(page)
  const c = await S.counts(page, FRI)
  const face = await S.unavOn(page, 'face', FRI)
  await lwOpen(page, FISO)
  fy1 = (await snap(page, Ym, [FISO])).figs
  await S.shotUnav(page, 'face', FRI, pic('F1-face-file-then-publish'))
  R.ck('F-face-carries-Y', y.added === 1 && pub.pub.p.pressed && has(face, Ym) && c.n.week === 0 && !c.fell,
    'filed first, then published: the published face lists Y, nothing pending, the four signed', { cast: { X: Xm, Y: Ym }, face, n: c.n, pubToasts })
})
await step('F-publish-then-file', async () => {
  const x = await fileInput(page, { person: Xm, type: 'LL', from: FISO, remarks: 'W5 X leave, filed after publishing' })
  const c = await S.counts(page, FRI)
  const face = await S.unavOn(page, 'face', FRI), work = await S.unavOn(page, 'work', FRI)
  await lwOpen(page, FISO)
  fx1 = (await snap(page, Xm, [FISO])).figs
  await S.shotUnav(page, 'face', FRI, pic('F2-face-publish-then-file'))
  await S.shotUnav(page, 'work', FRI, pic('F3-work-publish-then-file'))
  R.ck('F-pending-and-frozen', x.added === 1 && c.n.week === 1 && Object.values(c.n).every(v => v === 1) && c.fell && !has(face, Xm) && has(work, Xm),
    'published first, then filed: 1 pending on every count, the four fall, the face frozen without X, the working copy shows X (D177)', { n: c.n, signs: c.signs, face, work })
  R.ck('F-money-same-both-orders', lve(fy1) - lve(fy0) === lve(fx1) - lve(fx0) && lve(fx1) - lve(fx0) === -1,
    'the leave money is the same in both orders: each man −1 on the day', { Y: [fy0 && fy0.lve, fy1 && fy1.lve], X: [fx0 && fx0.lve, fx1 && fx1.lve] })
})
await step('F-undo-redo-reload', async () => {
  const u = await undo(page)
  const cu = await S.counts(page, FRI)
  const insU = (await inputsOf(page, Xm)).filter(x => /Jul 17/.test(x.date))
  R.ck('F-undo', u.pressed && !insU.length && cu.n.week === 0, 'Undo takes X\'s late leave back: 0 pending again (D98)', { undo: u, n: cu.n, signs: cu.signs, signLine: cu.signLine })
  R.note('F-undo-signoffs-RECORD', { fellAfterUndo: cu.fell, signs: cu.signs, line: cu.signLine })
  const r = await redo(page)
  const cr = await S.counts(page, FRI)
  R.ck('F-redo', r.pressed && cr.n.week === 1 && cr.fell, 'Redo files it again: 1 pending, the four fall', { redo: r, n: cr.n })
  const rl = await reload(page, 'a')
  const cl = await S.counts(page, FRI)
  const face = await S.unavOn(page, 'face', FRI)
  R.ck('F-reload', cl.n.week === 1 && cl.fell && !has(face, Xm) && has(face, Ym), 'a reload keeps 1 pending, the fallen sign-offs and the frozen face', { rl, n: cl.n, face })
})
await step('F-publish-al', async () => {
  await board(page, FRI)
  await signDay(page, FRI, 0)
  const a = await publishAL(page, FRI)
  await closeBoard(page)
  const c = await S.counts(page, FRI)
  const face = await S.unavOn(page, 'face', FRI)
  await S.shotUnav(page, 'face', FRI, pic('F4-face-after-AL1'))
  R.ck('F-al-carries-X', a.pressed && has(face, Xm) && c.n.week === 0, 'signing and publishing the AL puts X on the face; 0 pending', { al: a, face, n: c.n })
})

/* ---- N9: a bid on a man's published weekend work, at the publish and at an AL */
let M1, M2
await step('N9-publish-keeps-bid', async () => {
  const duty = await page.evaluate(di => {
    const d = window.DAYS[di], P = window.PEOPLE, out = []
    ;(d.dutywaves || []).forEach(b => b.rows.forEach(r => { if (r.id && P[r.id] && (P[r.id].seat === 'FCP' || P[r.id].seat === 'RCP')) out.push(r.id) }))
    return [...new Set(out)]
  }, SAT)
  ;[M1, M2] = duty
  R.note('N9-cast', { saturdayDutyAircrew: duty })
  await lwOpen(page, SISO)
  const b = await bidOn(page, M1, SISO, 'LL')
  const before = await snap(page, M1, [SISO])
  await toasts(page)
  const pub = await S.pubOnBoard(page, SAT)
  const ts = await toasts(page)
  await lwOpen(page, SISO)
  const after = await snap(page, M1, [SISO])
  const t = await tapCell(page, M1, SISO)
  await shot(page, pic('N1-publish-over-bid-taplist'))
  await closeSheets(page)
  await lwShot(page, pic('N2-publish-over-bid-cell'), M1, SISO)
  const msg = ts.join(' · ')
  R.ck('N9-message', pub.p.pressed && new RegExp(`bid on 18 Jul now sits on published work — the day is flagged, the bid is still live`).test(msg),
    'publishing Saturday over M1\'s pending LL bid says "…\'s LL bid on 18 Jul now sits on published work — the day is flagged, the bid is still live"', { toasts: ts })
  R.ck('N9-bid-kept-flagged', b.placed && /!/.test(after.run[0]) && (t.lines || []).some(l => /bid, not decided yet/.test(l)) && (t.lines || []).some(l => /OIL earned/.test(l)) && !(t.lines || []).some(l => /replaced by/.test(l)),
    'the bid is KEPT (not removed, no notice), the credit lands beside it, the day wears the amber !', { before: before.run, after: after.run, lines: t.lines, oil: [before.figs.oil, after.figs.oil] })
  const u = await undo(page)
  await lwOpen(page, SISO)
  const afterU = await snap(page, M1, [SISO], { figs: false })
  R.note('N9-undo-of-publish-RECORD', { undo: u, cell: afterU.run })
  if (u.pressed) { const r = await redo(page); R.note('N9-redo-RECORD', { redo: r }) }
})
await step('N9-AL-keeps-bid', async () => {
  /* the demo's Saturday has ONE aircrew duty desk (M1): the AL walk re-uses his bid, still pending on published work */
  const c0 = await S.counts(page, SAT)
  const b = { placed: true, note: 'M1 bid from the publish step, still pending' }
  const c1 = c0
  const free = await S.freeMen(page, [5])
  const z = await fileInput(page, { person: free[0], type: 'LL', from: SISO, remarks: 'W5 late Saturday leave → an AL' })
  const c2 = await S.counts(page, SAT)
  await board(page, SAT)
  await signDay(page, SAT, 0)
  await toasts(page)
  const a = await publishAL(page, SAT)
  const ts = await toasts(page)
  await closeBoard(page)
  await lwOpen(page, SISO)
  const after = await snap(page, M1, [SISO])
  const t = await tapCell(page, M1, SISO)
  await shot(page, pic('N3-AL-over-bid-taplist'))
  await closeSheets(page)
  R.note('N9-AL-counts', { beforeBid: c0.n, afterBid: c1.n, afterLateLeave: c2.n, note: 'a bid is not an input — whether it reads pending is RECORDED' })
  R.ck('N9-AL-message', b.placed && z.added === 1 && a.pressed && ts.some(x => /bid on 18 Jul now sits on published work — the day is flagged, the bid is still live/.test(x)),
    'publishing AL1 (a late leave for another man) over M1\'s still-pending bid names it the same way', { al: a, toasts: ts })
  R.ck('N9-AL-bid-kept', (t.lines || []).some(l => /bid, not decided yet/.test(l)) && /!/.test(after.run[0]), 'M1\'s bid is still kept and the day flagged after the AL', { run: after.run, lines: t.lines, oil: after.figs && after.figs.oil })
})

R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
