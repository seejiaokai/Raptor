/* W5 — ORDER 2: APPROVE then MEDICAL / MEDICAL then APPROVE (Fable S8, Astra 6), on an UNPUBLISHED week (20–31 Jul)
   and on the PUBLISHED Friday 17 Jul, with undo / redo / reload. Assertions of the RIGHT behaviour — a PASS means correct.
   Rules: B7 at every door / H3 as overruled (leave and a medical may not share real time — the medical CUTS leave already
   there; approving leave over a medical is REFUSED, with the medical named, and the bid stays), §7 (real hours decide),
   N18 (the cut note is AMBER and holds long enough to read), figures read the records (the leave balance gives the cut
   days back at once, MED TOT counts the medical), D177–D179 (on a published day every input change reads pending, the
   published face frozen — a medical too), the one timeline (one Undo takes the whole medical-and-cut back).
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/w5-02-approve-medical.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = 'w5'
const L = await import('./ab-lib.mjs')
const S = await import('./ab-sched.mjs')
const X = await import('./w5-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, tapCell, sheetPress, closeSheets, sheetNow, fileInput, inputsOf, shot, toastSpy, toasts, resultBook, ROOT, lwShot, rowRun } = L
const { undo, redo, reload, snap } = X
const PHONE = W === 'phone'
const R = resultBook(`W5-02-${W}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-w5-02-${W}.txt`)
const { browser, page, errors } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: PHONE ? 2 : 1 })
await toastSpy(page)
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await shot(page, `w5-02-${W}-THREW-${name}`).catch(() => {}) } }
const pic = n => `w5-02-${W}-${n}`
const toastTint = () => page.evaluate(() => { const t = document.getElementById('toastEl'); return t ? t.style.color : '' })
const money = f => f ? `lve=${f.lve} lvetot=${f.lvetot} medtot=${f.medtot}` : ''
const P = 'bane'
const WK = ['2026-07-20', '2026-07-21', '2026-07-22', '2026-07-23', '2026-07-24']
const WK2 = ['2026-07-27', '2026-07-28', '2026-07-29', '2026-07-30', '2026-07-31']

/** A range bid through the bid sheet's own "Pick a range" (from = the tapped day, to = the tap in the calendar). */
async function rangeBid(id, from, to, code = 'LL') {
  const t = await tapCell(page, id, from)
  if (t.open !== 'bid-picker') { await closeSheets(page); return { placed: false, why: 'opened ' + t.open } }
  await sheetPress(page, 'span-range')
  const d = page.locator(`.bidsheet[role="dialog"] [data-testid="span-day-${to}"]`).first()
  if (!(await d.count())) { await closeSheets(page); return { placed: false, why: 'no day ' + to + ' in the range calendar' } }
  await d.click(); await page.waitForTimeout(300)
  const sel = await page.evaluate(() => ((document.querySelector('[data-testid="span-selection"]') || {}).innerText || '').trim())
  let r = await sheetPress(page, `bid-${code}`)
  let s = await sheetNow(page)
  if (s.open === 'bid-picker' && /Tap the same leave again/i.test(s.text)) { await sheetPress(page, `bid-${code}`); s = await sheetNow(page) }
  const placed = s.open === 'nothing'
  if (!placed) await closeSheets(page)
  return { placed, sel, why: placed ? '' : (s.text || '').slice(0, 300) }
}
/** Approve through the one window on the tapped day; report what the sheet said if it refused. */
async function approve(id, iso) {
  const t = await tapCell(page, id, iso)
  await toasts(page)
  const btn = (t.buttons || []).find(b => /^decide-approve|^dl-approve-/.test(b))
  if (!btn) { await closeSheets(page); return { pressed: false, why: 'no Approve on ' + t.open, sheet: t } }
  const p = await sheetPress(page, btn.split(':')[0])
  const after = await sheetNow(page)
  const ts = await toasts(page)
  const tint = await toastTint()
  await shot(page, pic(`approve-${id}-${iso}`))
  await closeSheets(page)
  return { pressed: p.pressed, stillOpen: after.open, said: (after.text || '').slice(0, 300), msg: ((await page.evaluate(() => (document.querySelector('[data-testid="shift-problem"], [data-testid="span-note"], [data-testid="daylist-msg"]') || {}).innerText || '')) || ''), toasts: ts, tint }
}

/* ================= UNPUBLISHED: A. approve then medical (20–24 Jul) */
let A0, A1, A2
await step('U-A-approve', async () => {
  await lwOpen(page, WK[0])
  A0 = await snap(page, P, WK)
  const b = await rangeBid(P, WK[0], WK[4])
  /* the one window decides the TAPPED day; a run is approved day by day, each approval extending the one leave
     (the approve-extend, D189 rewrites its "till") */
  const aps = []
  for (const d of WK) aps.push(await approve(P, d))
  const ap = { pressed: aps.every(a => a.pressed), each: aps.map(a => a.pressed) }
  const ins = (await inputsOf(page, P)).filter(x => /Jul 2[0-4]/.test(x.date))
  A1 = await snap(page, P, WK)
  await lwShot(page, pic('UA1-approved-20-24'), P, WK[2])
  R.ck('U-A-approved', b.placed && ap.pressed && ins.length === 1 && /LL/.test(A1.run.join(' ')),
    'Ranger\'s LL bid 20–24 Jul, approved on the war, becomes ONE leave input 20–24 Jul', { bid: b, approve: ap, inputs: ins, run: A1.run, money: money(A1.figs), base: money(A0.figs) })
})
await step('U-A-medical-cuts', async () => {
  await toasts(page)
  const m = await fileInput(page, { person: P, type: 'ATT C', from: WK[2], to: WK[3], remarks: 'W5 sick mid-leave' })
  const tint = await toastTint()
  const ts = await toasts(page)
  const ins = (await inputsOf(page, P)).filter(x => /Jul 2[0-4]/.test(x.date))
  const lv = ins.filter(x => x.type === 'LL')
  await lwOpen(page, WK[0])
  A2 = await snap(page, P, WK)
  await lwShot(page, pic('UA2-medical-cut-leave'), P, WK[2])
  R.ck('U-A-cut-pieces', m.added >= 1 && lv.length === 2 && lv.every(x => x.lw) && /Jul 20/.test(lv.map(x => x.date).join()) && /Jul 24/.test(lv.map(x => x.date).join()),
    'the medical cuts the approved leave into 20–21 and 24, both pieces still war-approved', { inputs: ins, run: A2.run })
  R.ck('U-A-money', +A2.figs.lve === +A1.figs.lve + 2 && +A2.figs.medtot === +A1.figs.medtot + 2,
    'the leave balance gives the two cut days back at once, MED TOT +2', { before: money(A1.figs), after: money(A2.figs) })
  R.ck('U-A-amber', /adv/.test(tint) && ts.some(t => /cut/i.test(t)), 'the cut note is amber (N18)', { tint, toasts: ts })
  R.note('U-A-till-remarks', lv.map(x => `${x.date}${x.endDate ? '–' + x.endDate : ''}: "${x.remarks}"`))
})
await step('U-A-undo-redo-reload', async () => {
  await lwOpen(page, WK[0])
  const u = await undo(page)
  const afterU = await snap(page, P, WK)
  const insU = (await inputsOf(page, P)).filter(x => /Jul 2[0-4]/.test(x.date))
  await lwShot(page, pic('UA3-after-undo'), P, WK[2])
  R.ck('U-A-undo', u.pressed && insU.length === 1 && insU[0].type === 'LL' && JSON.stringify(afterU.run) === JSON.stringify(A1.run) && money(afterU.figs) === money(A1.figs),
    'ONE Undo takes the medical AND the cut back: one leave 20–24 again, the figures as before the medical', { undo: u, inputs: insU, run: afterU.run, money: money(afterU.figs) })
  const r = await redo(page)
  const afterR = await snap(page, P, WK)
  R.ck('U-A-redo', r.pressed && JSON.stringify(afterR.run) === JSON.stringify(A2.run) && money(afterR.figs) === money(A2.figs),
    'Redo re-makes the medical and the cut, the same pieces and figures', { redo: r, run: afterR.run, money: money(afterR.figs) })
  const rl = await reload(page, 'a')
  await lwOpen(page, WK[0])
  const afterL = await snap(page, P, WK)
  R.ck('U-A-reload', JSON.stringify(afterL.run) === JSON.stringify(A2.run) && money(afterL.figs) === money(A2.figs), 'a reload keeps the cut pieces and the figures', { rl, run: afterL.run, money: money(afterL.figs) })
  await lwShot(page, pic('UA4-after-reload'), P, WK[2])
})

/* ================= UNPUBLISHED: B. medical then bid then approve (27–31 Jul)
   (1) a WHOLE-day medical on 29 Jul, then a range bid 27–31: what the bid sheet does with the medical day;
   (2) a medical 09:00–14:00 on 30 Jul (a morning by the six-hour rule, real hours past noon, §7), then an
   afternoon bid on 30 Jul, then Approve — the approve must be refused with the medical named, the bid kept. */
await step('U-B1-whole-day-medical-then-range-bid', async () => {
  const m = await fileInput(page, { person: P, type: 'ATT C', from: WK2[2], remarks: 'W5 sick first' })
  await lwOpen(page, WK2[0])
  const before = await snap(page, P, WK2)
  const t = await tapCell(page, P, WK2[0])
  await sheetPress(page, 'span-range')
  const d = page.locator(`.bidsheet[role="dialog"] [data-testid="span-day-${WK2[4]}"]`).first()
  await d.click(); await page.waitForTimeout(300)
  await sheetPress(page, 'bid-LL')
  const note1 = await page.evaluate(() => [...document.querySelectorAll('[data-testid="span-note"]')].map(e => e.innerText.trim()).join(' | '))
  await shot(page, pic('UB1-range-bid-over-medical-sheet'))
  const s1 = await sheetNow(page)
  let placedAfter = null
  if (s1.open === 'bid-picker') { await sheetPress(page, 'bid-LL'); placedAfter = await sheetNow(page) }
  await closeSheets(page)
  const mid = await snap(page, P, WK2)
  await lwShot(page, pic('UB1-range-bid-over-medical'), P, WK2[2])
  const tMed = await tapCell(page, P, WK2[2]); await closeSheets(page)
  R.note('U-B1', { medical: m.added, before: before.run, note: note1, second: placedAfter && placedAfter.open, secondSaid: placedAfter && (placedAfter.text || '').slice(-260), after: mid.run, medDayOpens: tMed.open, money: [money(before.figs), money(mid.figs)] })
  R.ck('U-B1-medical-day-kept', /C/.test(mid.run[2]) && !/LL/.test(mid.run[2]) && tMed.open === 'raptor-sheet',
    'the range bid lands on the free days only; the medical day keeps the ATT C and a tap on it opens the read-only sheet (no bid is possible over a whole-day medical)', { run: mid.run, note: note1, medDayOpens: tMed.open })
})
await step('U-B2-custom-medical-then-pm-bid-then-approve', async () => {
  const D = '2026-08-04'   // a clean Tuesday (27–31 Jul carry the range bid above)
  const m = await fileInput(page, { person: P, type: 'ATT C', from: D, span: 'custom', start: '09:00', end: '14:00', remarks: 'W5 sick 09-14' })
  await lwOpen(page, D)
  const c0 = await L.lwCell(page, P, D)
  const t = await tapCell(page, P, D)
  await shot(page, pic('UB2-sheet-beside-0900-1400-medical'))
  const portions = (t.buttons || []).filter(b => /^portion-/.test(b))
  let placed = false, said = ''
  if (t.open === 'bid-picker') {
    if (portions.some(p => /portion-pm/.test(p)) && portions.length > 1) await sheetPress(page, 'portion-pm')
    await sheetPress(page, 'bid-LL')
    let s = await sheetNow(page)
    if (s.open === 'bid-picker' && /Tap the same leave again/i.test(s.text)) { await sheetPress(page, 'bid-LL'); s = await sheetNow(page) }
    placed = s.open === 'nothing'; said = placed ? '' : (s.text || '')
    await shot(page, pic('UB2-after-pm-bid-press'))
    await closeSheets(page)
  } else await closeSheets(page)
  const c1 = await L.lwCell(page, P, D)
  R.note('U-B2-bid', { medical: m.added, cellBefore: c0, open: t.open, portions, heldLine: (t.text || '').slice(0, 260), placed, said: said.slice(0, 300), cellAfter: c1 })
  if (!placed) {
    R.ck('U-B2-bid-door', t.open === 'bid-picker' && /ATT C|medical/i.test(said), 'the afternoon bid beside a 09:00–14:00 medical is refused at the bid door, naming the medical (so no approve over a medical can be reached)', { open: t.open, said: said.slice(-200) })
    return
  }
  const ap = await approve(P, D)
  const ins = (await inputsOf(page, P)).filter(x => x.date === 'Aug 4')
  const c2 = await L.lwCell(page, P, D)
  R.ck('U-B2-approve-refused-named', !ins.some(x => x.type === 'LL') && /ATT C|medical/i.test(`${ap.said} ${ap.msg} ${(ap.toasts || []).join(' ')}`),
    'approving the afternoon bid over the 09:00–14:00 medical is REFUSED, and the refusal names the medical', { approve: ap, inputs: ins })
  R.ck('U-B2-bid-stays', c2.box === c1.box && c2.mark === c1.mark, 'the bid stays as it was', { before: c1, after: c2 })
})

/* ================= PUBLISHED Friday 17 Jul (di 4) */
const FRI = 4, FISO = '2026-07-17'
let Y, Z
await step('P-cast-publish', async () => {
  const free = await S.freeMen(page, [4])
  ;[Y, Z] = free
  const pub = await S.pubAndSign(page, FRI)
  const c = await S.counts(page, FRI)
  R.ck('P-published', pub.pub.p.pressed && c.n.week === 0, 'Friday published and signed, nothing pending', { cast: { Y, Z }, pub: pub.pub.p, n: c.n })
})
let PA1
await step('P-A-approve-then-medical', async () => {
  await lwOpen(page, FISO)
  const b = await L.bidOn(page, Y, FISO, 'LL')
  const ap = await approve(Y, FISO)
  const c1 = await S.counts(page, FRI)
  await lwOpen(page, FISO)
  PA1 = await snap(page, Y, [FISO])
  const m = await fileInput(page, { person: Y, type: 'ATT C', from: FISO, remarks: 'W5 sick on published Friday' })
  const tint = await toastTint()
  const ins = (await inputsOf(page, Y)).filter(x => /Jul 17/.test(x.date))
  const c2 = await S.counts(page, FRI)
  const face = await S.unavOn(page, 'face', FRI), work = await S.unavOn(page, 'work', FRI)
  await lwOpen(page, FISO)
  const after = await snap(page, Y, [FISO])
  await S.shotUnav(page, 'face', FRI, pic('PA1-face-after-medical'))
  await S.shotUnav(page, 'work', FRI, pic('PA2-work-after-medical'))
  R.ck('P-A-approve-pending', b.placed && ap.pressed && c1.n.week === 1 && c1.fell, 'the approve on published Friday reads 1 pending, the four sign-offs fall', { bid: b.placed, approve: ap.pressed, n: c1.n })
  R.ck('P-A-medical-replaces', ins.length === 1 && ins[0].type === 'ATT C' && +after.figs.lve === +PA1.figs.lve + 1 && +after.figs.medtot === +PA1.figs.medtot + 1,
    'the whole-day medical takes the whole approved leave: only the ATT C left, the leave day back, MED TOT +1', { inputs: ins, before: money(PA1.figs), after: money(after.figs), tint })
  R.ck('P-A-face-frozen', !face.some?.(r => r.endsWith(':' + Y)) && Array.isArray(work) && work.some(r => r === 'ATT C:' + Y) && c2.n.week >= 1 && Object.values(c2.n).every(v => v === c2.n.week),
    'the published face still without him; the working copy shows ATT C; every count agrees and reads pending', { face, work, n: c2.n })
  const u = await undo(page)
  const cu = await S.counts(page, FRI)
  const insU = (await inputsOf(page, Y)).filter(x => /Jul 17/.test(x.date))
  R.ck('P-A-undo', u.pressed && insU.length === 1 && insU[0].type === 'LL' && cu.n.week === 1, 'ONE Undo brings the approved leave back and removes the medical; Friday back to 1 pending', { undo: u, inputs: insU, n: cu.n })
  const r = await redo(page)
  const cr = await S.counts(page, FRI)
  const insR = (await inputsOf(page, Y)).filter(x => /Jul 17/.test(x.date))
  R.ck('P-A-redo', r.pressed && insR.length === 1 && insR[0].type === 'ATT C' && cr.n.week === c2.n.week, 'Redo re-makes the medical; the same pending count', { redo: r, inputs: insR, n: cr.n })
})
await step('P-B-medical-then-approve', async () => {
  const m = await fileInput(page, { person: Z, type: 'ATT C', from: FISO, span: 'custom', start: '09:00', end: '14:00', remarks: 'W5 sick 09-14 first, published Friday' })
  const c1 = await S.counts(page, FRI)
  await lwOpen(page, FISO)
  const b = await L.bidOn(page, Z, FISO, 'LL', { portion: 'pm' })
  const mid = await snap(page, Z, [FISO])
  const ap = await approve(Z, FISO)
  const after = await snap(page, Z, [FISO])
  const ins = (await inputsOf(page, Z)).filter(x => /Jul 17/.test(x.date))
  const c2 = await S.counts(page, FRI)
  await lwShot(page, pic('PB1-refused-approve-published'), Z, FISO)
  R.note('P-B-bid', { medical: m.added, bid: b, cell: mid.run, n1: c1.n })
  if (!b.placed) { R.ck('P-B-bid-door', /ATT C|medical/i.test(b.why || ''), 'on published Friday the afternoon bid beside the 09:00–14:00 medical is refused at the bid door, naming the medical', { why: (b.why || '').slice(-200) }); await lwShot(page, pic('PB1-bid-door-refusal'), Z, FISO); return }
  R.ck('P-B-refused', !ins.some(x => x.type === 'LL') && /ATT C|medical/i.test(`${ap.said} ${ap.msg} ${(ap.toasts || []).join(' ')}`) && JSON.stringify(after.run) === JSON.stringify(mid.run),
    'approving over the medical on published Friday is refused with the medical named; the bid stays; the pending count unchanged', { approve: ap, inputs: ins, n: c2.n })
  R.ck('P-B-count-unchanged', c2.n.week === c1.n.week, 'a refused approve adds nothing pending', { before: c1.n, after: c2.n })
})
await step('P-reload', async () => {
  const before = await S.counts(page, FRI)
  const rl = await reload(page, 'a')
  const after = await S.counts(page, FRI)
  const face = await S.unavOn(page, 'face', FRI)
  R.ck('P-reload', after.n.week === before.n.week && after.fell === before.fell, 'a reload keeps the pending count and the fallen sign-offs', { rl, before: before.n, after: after.n, face })
  await S.shotUnav(page, 'work', FRI, pic('PB2-work-after-reload'))
})

R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
