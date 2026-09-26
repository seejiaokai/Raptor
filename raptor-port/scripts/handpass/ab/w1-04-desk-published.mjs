/* W1-04 (26 Sep 26) — the Inputs CALENDAR drag onto and off a PUBLISHED day, desktop, as the admin (Saber).
   Rules: D177, D178 (every input change after a day is published — here a calendar MOVE — reads "1 pending" on the
   admin's working copy and drops the four sign-offs, D103); the published face (View-only Sched) keeps what it went out
   with (D177-D179); moved back → 0 pending (D98) and the signatures return (AM11); undo / redo / reload keep it true;
   N4 on a published WEEKEND (a man the published schedule credits with work: leave dragged onto that day is FILED and
   FLAGGED — amber on the war, the filer told), not refused. Every check is the RIGHT behaviour: a FAIL is a finding.
   World: a fresh demo; Fri 17 Jul (di 4) and Sat 18 Jul (di 5) published through the board's own controls.
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/w1-04-desk-published.mjs [step,step] */
process.env.AB_WHO = 'w1'
const L = await import('./w1-lib.mjs')
const S = await import('./ab-sched.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, tapCell, closeSheets, fileInput, inputsOf, shot, resultBook, ROOT, toastSpy, toasts,
  calOpen, mouseDragChip, chipDays, lwCell, undoRedo, reloadSame, warRead } = L
const { counts, agree, unavOn, shotUnav, pubAndSign, freeMen, ISO } = S
const R = resultBook('W1-04-desk', `${ROOT}/docs/handpass/parts/2026-09-26-absence-w1-04-desk.txt`)
const { browser, page, errors } = await openHi({ width: 1440, height: 900, who: 'a', dpr: 1 })
await toastSpy(page)
const ONLY = (process.argv[2] || '').split(',').filter(Boolean)
async function step(name, fn) { if (ONLY.length && !ONLY.some(k => name.startsWith(k))) return; try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await shot(page, `w1-04-THREW-${name}`).catch(() => {}) } }
const file = async f => { await L.inputsView(page, 'list'); return fileInput(page, f) }
const cellOf = async (P, D) => { await lwOpen(page, D); return lwCell(page, P, D) }
const dayList = async (P, D) => { await lwOpen(page, D); const s = await tapCell(page, P, D); await closeSheets(page); return s }
const has = (u, id) => Array.isArray(u) && u.some(r => r.endsWith(':' + id))
const FRI = 4, SAT = 5
const cs = await page.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([k, p]) => [k, p.cs])))
const signed = c => c.signs.length === 4 && c.signs.every(x => x && !/—|sign/i.test(x))

let X
await step('setup', async () => {
  const free = await freeMen(page, [0, 1, 2, 3, 4, 5, 6])
  X = free[0]
  const f = await file({ person: X, type: 'LL', from: '2026-07-20', remarks: 'W1 pub leave' })
  const p = await pubAndSign(page, FRI)
  const c = await counts(page, FRI)
  const [ok, bad] = agree(c, 0)
  const face = await unavOn(page, 'face', FRI)
  R.note('cast', { X: cs[X], free, filed: f.added, iid: f.iid })
  R.ck('setup-published', p.pub.p.pressed && ok && signed(c), 'Friday published and signed: 0 pending everywhere, the four signed', { pub: p.pub.p, bad, signs: c.signs })
  R.ck('setup-face', has(face, 'pike') && !has(face, X), 'the published face lists Nomad (OD) and not X', face)
  await shotUnav(page, 'face', FRI, 'w1-04-00-fri-face-as-published')
  X = { id: X, iid: f.iid }
})

/* ---- a leave dragged ONTO the published Friday ---- */
await step('ON', async () => {
  await calOpen(page, '2026-07'); await toasts(page)
  const g = await mouseDragChip(page, X.iid, '2026-07-20', ISO[FRI])
  const t = await toasts(page)
  const days = await chipDays(page, X.iid)
  const c = await counts(page, FRI)
  const [ok, bad] = agree(c, 1)
  const face = await unavOn(page, 'face', FRI), work = await unavOn(page, 'work', FRI)
  await shotUnav(page, 'face', FRI, 'w1-04-01-on-face-kept')
  await shotUnav(page, 'work', FRI, 'w1-04-02-on-working-copy')
  R.ck('ON-moved', days.join() === ISO[FRI], 'the leave lands on Fri 17 Jul', { days, t })
  R.ck('ON-pending', ok, '"1 pending" on every count (week head, board, both ⓘ, the Amendments panel) (D177/D178)', { bad, c: { week: c.week, board: c.board, infoWeek: c.infoWeek, infoBoard: c.infoBoard, panel: c.panel } })
  R.ck('ON-signs-fell', c.fell, 'the four sign-offs fall (D103)', c.signs)
  R.ck('ON-face-frozen', !has(face, X.id), 'View-only Sched keeps the Unavailable list it went out with (X not on it)', face)
  R.ck('ON-working-copy', has(work, X.id), 'the working copy shows X as Unavailable', work)
})

/* undo / redo / reload */
await step('ON-undo', async () => {
  const u = await undoRedo(page, 'undo', 'war')
  const c = await counts(page, FRI)
  await calOpen(page, '2026-07')
  const days = await chipDays(page, X.iid)
  const [ok] = agree(c, 0)
  R.ck('ON-undo', u.pressed && days.join() === '2026-07-20' && ok, 'undo: the leave back on 20 Jul, Friday 0 pending', { u, days, c: c.n })
  R.ck('ON-undo-signs-back', signed(c), 'the four sign-offs come back (AM11: back to what was signed)', c.signs)
  const r = await undoRedo(page, 'redo', 'war')
  const c2 = await counts(page, FRI)
  R.ck('ON-redo', r.pressed && agree(c2, 1)[0] && c2.fell, 'redo: 1 pending again, the sign-offs down', { r, n: c2.n, signs: c2.signs })
  await reloadSame(page, 'a'); await toastSpy(page)
  const c3 = await counts(page, FRI)
  const face = await unavOn(page, 'face', FRI)
  R.ck('ON-reload', agree(c3, 1)[0] && c3.fell && !has(face, X.id), 'a reload keeps it: 1 pending, sign-offs down, the face still without X', { n: c3.n, signs: c3.signs, face })
})

/* ---- dragged back OFF the published Friday → 0 pending (D98), the signatures back ---- */
await step('BACK', async () => {
  await calOpen(page, '2026-07'); await toasts(page)
  const g = await mouseDragChip(page, X.iid, ISO[FRI], '2026-07-20')
  const t = await toasts(page)
  const days = await chipDays(page, X.iid)
  const c = await counts(page, FRI)
  const [ok, bad] = agree(c, 0)
  await shot(page, 'w1-04-03-back-counts')
  R.ck('BACK-zero', days.join() === '2026-07-20' && ok, 'dragged back to 20 Jul: Friday reads 0 on every count (D98)', { days, bad, n: c.n })
  R.ck('BACK-signs', signed(c), 'the four sign-offs return (AM11)', c.signs)
})

/* ---- a record that WAS on the published Friday dragged OFF it: Nomad's OD 15-17 → 22-24 ---- */
await step('OFF', async () => {
  const od = (await inputsOf(page, 'pike')).find(x => x.type === 'OD')
  await calOpen(page, '2026-07'); await toasts(page)
  const g = await mouseDragChip(page, od.iid, ISO[FRI], '2026-07-24')
  const t = await toasts(page)
  const days = await chipDays(page, od.iid)
  const c = await counts(page, FRI)
  const face = await unavOn(page, 'face', FRI), work = await unavOn(page, 'work', FRI)
  R.ck('OFF-moved', days.join() === '2026-07-22,2026-07-23,2026-07-24', 'the OD grabbed on Fri 17 and dropped on Fri 24 slides a week (22-24 Jul)', { days, t })
  R.ck('OFF-pending', agree(c, 1)[0] && c.fell, 'Friday reads 1 pending, the sign-offs fall', { n: c.n, signs: c.signs })
  R.ck('OFF-face-keeps', has(face, 'pike') && !has(work, 'pike'), 'the face still lists Nomad (as issued); the working copy no longer does', { face, work })
  await shotUnav(page, 'face', FRI, 'w1-04-04-off-face-keeps-nomad')
  await reloadSame(page, 'a'); await toastSpy(page)
  const c2 = await counts(page, FRI)
  R.ck('OFF-reload', agree(c2, 1)[0], 'after a reload still 1 pending', c2.n)
  await calOpen(page, '2026-07')
  const g2 = await mouseDragChip(page, od.iid, '2026-07-24', ISO[FRI])
  const c3 = await counts(page, FRI)
  await calOpen(page, '2026-07'); const back = await chipDays(page, od.iid)
  R.ck('OFF-back-zero', back.join() === '2026-07-15,2026-07-16,2026-07-17' && agree(c3, 0)[0] && signed(c3), 'dragged back: 15-17 Jul, Friday 0 pending, signed again', { back, g2, n: c3.n, signs: c3.signs })
})

/* ---- N4 on a PUBLISHED WEEKEND: a man the published Saturday credits with work gets leave dragged onto it ---- */
await step('N4W', async () => {
  const duty = await page.evaluate(() => { const s = new Set(); (window.DAYS[5].dutywaves || []).forEach(b => b.rows.forEach(r => { if (r.id && window.PEOPLE[r.id]) s.add(r.id) })); return [...s] })
  const withJul = await page.evaluate(() => [...new Set(window.INPUTS.filter(x => /Jul 1[3-9]/.test(x.date + (x.endDate || ''))).map(x => x.person))])
  const W = duty.find(p => !withJul.includes(p))
  const pub = await S.pubOnBoard(page, SAT)
  await lwOpen(page, ISO[SAT])
  const before = await cellOf(W, ISO[SAT])
  R.note('N4W-setup', { duty, W: cs[W], pub: pub.p, before })
  R.ck('N4W-credit-landed', /FO|HO/.test(before.box), 'the published Saturday credits the duty man OIL (FO/HO on the war)', before)
  const f = await file({ person: W, type: 'LL', from: '2026-07-20', remarks: 'W1 N4 onto a worked Saturday' })
  await calOpen(page, '2026-07'); await toasts(page)
  const g = await mouseDragChip(page, f.iid, '2026-07-20', ISO[SAT])
  const t = await toasts(page)
  const days = await chipDays(page, f.iid)
  await shot(page, 'w1-04-05-n4w-cal')
  R.ck('N4W-filed', days.join() === ISO[SAT], 'the leave lands on the worked Saturday — filed, not refused (N4)', { days })
  R.ck('N4W-told', t.some(x => /work/i.test(x)), 'the filer is told in the same breath that he is recorded working that day (amber toast)', t)
  const cell = await cellOf(W, ISO[SAT])
  const s = await dayList(W, ISO[SAT])
  await L.lwShot(page, 'w1-04-06-n4w-war', W, ISO[SAT])
  R.ck('N4W-amber', cell.mark === '!', 'the war marks the Saturday amber (!) — leave over recorded work', { cell, lines: s.lines })
  const c = await counts(page, SAT)
  R.note('N4W-sat-counts', { n: c.n, signs: c.signs })
  const u = await undoRedo(page, 'undo', 'war')
  const cell2 = await cellOf(W, ISO[SAT])
  R.ck('N4W-undo', u.pressed && cell2.mark !== '!' && /FO|HO/.test(cell2.box), 'one undo: the leave off the Saturday, the amber gone, the credit still there', { u, cell2 })
})

R.note('toasts-left', await toasts(page))
R.ck('console-errors', !errors.length, 'no console / page errors / 4xx', errors.slice(0, 20))
R.save()
await browser.close()
