/* The absence-record re-test — HOST walk H1 (26 Sep 26): an absence landing on an already-PUBLISHED day, through each
   door a person has. Written as assertions of the RIGHT behaviour (a PASS means correct; re-running it IS the re-walk).
   Rules: D177, D178, D179 (every input change after publishing reads "1 pending" on the admin's working copy and drops
   the four sign-offs; the published face keeps what it went out with — a medical too, D179/D185), D98/D174 (taken back
   out reads 0), D103 (anything pending wipes the sign-offs), D189 (a stretched/cut leave's "till" note), `[PUB-UNAVAIL]`.
   World: a fresh demo, made through the app's own controls only. Fri 17 Jul (di 4) is the clean weekday a publish is
   allowed on (docs/handpass/README.md). Usage (from raptor-port/, the build on 4175):
     node scripts/handpass/ab/ab-h1-published-doors.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = `host/h1-${W}`
const L = await import('./ab-lib.mjs')
const S = await import('./ab-sched.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { go, lwOpen, lwBid, tapCell, sheetPress, closeSheets, sheetNow, fileInput, inputsWindow, deleteInputRow, inputsOf, shot, toastSpy, toasts, resultBook, ROOT, rowRun } = L
const { counts, agree, unavOn, shotUnav, pubAndSign, freeMen, ISO } = S
const PHONE = W === 'phone'
const R = resultBook(`H1-${W}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-h1-${W}.txt`)
const FRI = 4, THU = 3
const { browser, page, errors } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: PHONE ? 3 : 1 })
await toastSpy(page)
const cs = await page.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([k, p]) => [k, p.cs])))
const has = (u, id) => Array.isArray(u) && u.some(r => r.endsWith(':' + id))
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await shot(page, `h1-THREW-${name}`).catch(() => {}) } }

/* ---- the world: three men with nothing that week; Z's leave, V's war-approved leave and U's medical are filed
   BEFORE Friday is published, so the published face carries them */
const free = await freeMen(page, [2, 3, 4, 5])
const [X, Y, Z, V, U] = free
R.note('cast', { X: cs[X], Y: cs[Y], Z: cs[Z], V: cs[V], U: cs[U], free: free.length })
await step('setup-Z-leave', async () => {
  const r = await fileInput(page, { person: Z, type: 'LL', from: ISO[THU], to: ISO[FRI], remarks: 'H1 Z leave Thu-Fri' })
  R.ck('setup-Z-leave', r.added === 1, 'Z LL Thu-Fri filed on the Inputs page', r)
})
await step('setup-U-medical', async () => {
  const r = await fileInput(page, { person: U, type: 'ATT C', from: ISO[FRI], remarks: 'H1 U sick — PHA' })
  R.ck('setup-U-medical', r.added === 1, 'U ATT C Fri filed (certificate asked, answered none)', r)
})
await step('setup-V-war-approved', async () => {
  await lwOpen(page, ISO[FRI])
  const b = await lwBid(page, V, ISO[FRI], 'LL')
  const t = await tapCell(page, V, ISO[FRI])
  const a = await sheetPress(page, 'decide-approve')
  await closeSheets(page)
  const cell = await L.lwCell(page, V, ISO[FRI])
  R.ck('setup-V-war-approved', b.placed && a.pressed && /LL/.test(cell.box), 'V bid LL Fri on the war, then Approve', { bid: b.placed, tap: t.open, approve: a.pressed, cell })
})
let pub
await step('publish-fri', async () => {
  pub = await pubAndSign(page, FRI)
  const c = await counts(page, FRI)
  const [ok, bad] = agree(c, 0)
  R.ck('publish-fri', pub.pub.p.pressed && ok && !c.fell, 'Friday published and signed again: 0 pending everywhere, the four signed', { pub: pub.pub.p, bad, c })
  const face = await unavOn(page, 'face', FRI)
  R.ck('publish-fri-face', has(face, Z) && has(face, V) && has(face, U), 'the published face lists Z (LL), V (LL) and U (ATT C) as Unavailable', face)
  await shotUnav(page, 'face', FRI, 'h1-00-fri-face-as-published')
})

/* ---- door A: the Inputs page form, then its ✕ */
let xIid
await step('A-inputs-file', async () => {
  const r = await fileInput(page, { person: X, type: 'LL', from: ISO[FRI], remarks: 'H1 X late leave' })
  xIid = r.iid
  const c = await counts(page, FRI); const [ok, bad] = agree(c, 1)
  R.ck('A-inputs-file-count', r.added === 1 && ok, 'a leave filed on the Inputs page onto published Friday: 1 pending on every count', { bad, c })
  R.ck('A-inputs-file-signs', c.fell, 'the four sign-offs fall (D103)', c.signs)
  const face = await unavOn(page, 'face', FRI), work = await unavOn(page, 'work', FRI)
  R.ck('A-inputs-file-face', !has(face, X) && has(work, X), 'the published face keeps what it went out with (no X); the working copy shows X', { face, work })
  await shotUnav(page, 'face', FRI, 'h1-A1-face-after-late-leave'); await shotUnav(page, 'work', FRI, 'h1-A1-work-after-late-leave')
})
await step('A-inputs-delete', async () => {
  const w = await inputsWindow(page, ISO[FRI], ISO[FRI])
  const d = await deleteInputRow(page, xIid)
  const c = await counts(page, FRI); const [ok, bad] = agree(c, 0)
  R.ck('A-inputs-delete', d.deleted && ok, 'the late leave deleted again from the Inputs table: back to 0 (D98)', { w, d, bad, c })
  R.note('A-inputs-delete-signs', { signs: c.signs, fell: c.fell, line: c.signLine })
})

/* ---- door B: the war — bid, approve, then back to a bid and clear */
await step('B-war-approve', async () => {
  await lwOpen(page, ISO[FRI])
  const b = await lwBid(page, X, ISO[FRI], 'LL')
  await tapCell(page, X, ISO[FRI]); const a = await sheetPress(page, 'decide-approve'); await closeSheets(page)
  const c = await counts(page, FRI); const [ok, bad] = agree(c, 1)
  R.ck('B-war-approve', b.placed && a.pressed && ok && c.fell, 'a bid approved on the war onto published Friday: 1 pending, the four fall', { bad, c })
  const face = await unavOn(page, 'face', FRI)
  R.ck('B-war-approve-face', !has(face, X), 'the face still without X', face)
})
await step('B-war-clear', async () => {
  await lwOpen(page, ISO[FRI])
  const t = await tapCell(page, X, ISO[FRI])
  R.note('B-war-clear-sheet', t)
  await shot(page, 'h1-B2-war-approved-sheet')
  let r = await sheetPress(page, 'bid-clear')
  if (!r.pressed) r = await sheetPress(page, /^Clear$|^Delete$/)
  await closeSheets(page)
  const cell = await L.lwCell(page, X, ISO[FRI])
  const c = await counts(page, FRI); const [ok, bad] = agree(c, 0)
  R.ck('B-war-clear', r.pressed && ok, 'the approved leave cleared on the war: back to 0', { pressed: r.pressed, why: r.why, cell, bad, c })
})

/* ---- door C: a medical filed late — frozen on the face, pending for the admin (D179) */
await step('C-medical-late', async () => {
  const r = await fileInput(page, { person: Y, type: 'ATT C', from: ISO[FRI], remarks: 'H1 Y late medical' })
  const c = await counts(page, FRI); const [ok, bad] = agree(c, 1)
  R.ck('C-medical-late-count', r.added === 1 && ok && c.fell, 'a medical filed late onto published Friday: 1 pending, the four fall', { bad, c })
  const face = await unavOn(page, 'face', FRI), work = await unavOn(page, 'work', FRI)
  R.ck('C-medical-late-face', !has(face, Y) && has(work, Y), 'the face stays as issued — a medical too (D179, D185)', { face, work })
  await shotUnav(page, 'face', FRI, 'h1-C1-face-after-late-medical'); await shotUnav(page, 'work', FRI, 'h1-C1-work-after-late-medical')
})

/* ---- door D: a medical CUTTING a leave that went out on the face (Z's LL Thu–Fri; ATT C on Fri) */
await step('D-medical-cuts-issued-leave', async () => {
  const before = await inputsOf(page, Z)
  const r = await fileInput(page, { person: Z, type: 'ATT C', from: ISO[FRI], remarks: 'H1 Z sick on his last leave day' })
  const after = await inputsOf(page, Z)
  const c = await counts(page, FRI)
  R.note('D-medical-cuts-inputs', { before, after, toast: r.toast })
  R.ck('D-medical-cuts-count', c.n.week >= 1 && Object.values(c.n).every(v => v === c.n.week) && c.fell, 'Friday pending (the leave cut + the medical), every count agreeing, the four fall', c)
  const face = await unavOn(page, 'face', FRI), work = await unavOn(page, 'work', FRI)
  R.ck('D-medical-cuts-face', has(face, Z), 'the face still shows Z as it went out', { face, work })
  const thu = await counts(page, THU)
  R.note('D-medical-cuts-thursday', { thu: thu.n, note: 'Thursday is unpublished — nothing pending expected' })
  await lwOpen(page, ISO[FRI]); R.note('D-medical-cuts-war', await rowRun(page, Z, [ISO[THU], ISO[FRI]])); await L.lwShot(page, 'h1-D1-war-z-cut', Z, ISO[FRI])
})

/* ---- door F: the war's MOVE of V's war-approved leave off published Friday */
await step('F-war-move', async () => {
  await lwOpen(page, ISO[FRI])
  const t = await tapCell(page, V, ISO[FRI])
  R.note('F-war-move-sheet', t)
  await shot(page, 'h1-F1-war-v-sheet')
  await closeSheets(page)
  R.note('F-war-move', 'the war\'s own Move is walked by W3 (the one window); here we read what Friday says after it, below')
})

R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
