/* W6 (26 Sep 26) — the FIRST walk of the roll-call rows nobody reached: R12, R17, R18, R19, R22, R27, R30, R32, R36
   (plan 2026-09-26-absence-retest-plan.md §4, §9; the re-walk brief's W6 section). THIS script builds the one world the
   walk reads, through the app's own controls only (bug-check order §7.7), on the desktop as the admin, and saves it so the
   phone and the member read the SAME world (w6-02-walk.mjs):
     Thu 16 – Fri 17 Jul (the demo week; Friday is the one weekday a publish is allowed on):
       - Friday gets a flying line (the board's "+ Wave" → Flying wave) W6LINE 10:00–11:00, pilot P1, WSO W1 — so the
         print and the CSV have a Friday to print (the demo Friday flies nothing);
       - A: LL Thu–Fri (full days) · B: LL, the morning only, Thu–Fri · C: ATT C Thu–Fri (a medical) ·
         D: CSE Fri (a course) · E: LL Fri bid on the war and APPROVED there;
       - Friday signed and published; Saturday (the SDO desk 08:00–18:00, Plasma on it) signed and published;
       - LATE, on published Friday: F = LL Fri for P1 (the pilot on the Friday line) — one pending;
       - LATE, on published Saturday: LL Sat for the SDO (a leave over his named weekend duty) — the war's clash;
     Wed 29 Jul (a clean weekday) — the manning:
       - six of the seven IWSOs away: five on LL all day, the sixth on LL (morning) AND ATT C (afternoon) — a leave and a
         medical on one day; the seventh given an OIL award (FO, one day) on the war.
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/w6-01-build.mjs */
process.env.AB_WHO = 'rewalk/w6'
const L = await import('./ab-lib.mjs')
const S = await import('./ab-sched.mjs')
const W4 = await import('./w4-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { writeFileSync } = await import('node:fs')
const { go, board, closeBoard, tap, type, put, fileInput, tapCell, sheetPress, closeSheets, bidOn, shot, toastSpy, toasts, resultBook, ROOT, inputsOf } = L
const R = resultBook('W6-build', `${ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-w6-01-build.txt`)
export const SCR = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor--claude-worktrees-absence-record-d147-af6a50/88ce3848-856b-4e60-84e4-7a09da4979d8/scratchpad/w6'
const THU = '2026-07-16', FRI = '2026-07-17', SAT = '2026-07-18', D29 = '2026-07-29'
const { browser, page, errors } = await openHi({ width: 1440, height: 900, who: 'a', dpr: 1 })
await toastSpy(page)
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).split('\n')[0].slice(0, 300)); await shot(page, `w6-build-THREW-${name}`).catch(() => {}); await closeSheets(page).catch(() => {}) } }
const bundle = await page.evaluate(() => [...document.scripts].map(s => s.src).find(s => /index-/.test(s)) || '')
R.ck('bundle', /index-KbvILaPW\.js/.test(bundle), 'the rebuilt bundle index-KbvILaPW.js is what the page loads', bundle)

/* ---- the cast: men with nothing Thu–Sat, by seat; the IWSOs for the manning day */
const cs = await page.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([k, p]) => [k, p.cs])))
const seat = await page.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([k, p]) => [k, p.seat])))
const free = await S.freeMen(page, [3, 4, 5, 6])
const fcp = free.filter(k => seat[k] === 'FCP'), rcp = free.filter(k => seat[k] === 'RCP')
const cast = { P1: fcp[0], W1: rcp[0], A: fcp[1], B: rcp[1], C: fcp[2], D: rcp[2], E: fcp[3], G: rcp[3], SDO: 'plasma' }
const iwso = await page.evaluate(() => Object.entries(window.PEOPLE).filter(([k, p]) => p.seat === 'RCP' && String(p.q || '').toUpperCase() === 'IW' && !p.san && !p.archived).map(([k]) => k))
R.note('cast', Object.fromEntries(Object.entries(cast).map(([k, v]) => [k, `${v}=${cs[v]}`])))
R.note('iwso', iwso.map(k => `${k}=${cs[k]}`))

/* ---- Friday's flying line, through the board's own "+ Wave" */
await step('fri-line', async () => {
  await board(page, 4)
  await tap(page, '[data-wvadd="4"]')
  const k = page.locator('.wavemenu [data-wmkind="fly"]:visible').first()
  if (await k.count()) await k.click(); else await page.getByRole('button', { name: 'Flying wave', exact: true }).click()
  await page.waitForTimeout(600)
  await type(page, '[data-bfld="ff:4.0.0.cs"]', 'W6LINE')
  await type(page, '[data-bfld="ff:4.0.0.to"]', '10:00')
  await type(page, '[data-bfld="ff:4.0.0.ld"]', '11:00')
  const p = await put(page, '[data-slot="4.0.0.0.p"]', [cast.P1])
  const w = await put(page, '[data-slot="4.0.0.0.w"]', [cast.W1])
  const line = await page.evaluate(() => { const f = window.DAYS[4].waves[0]?.formations[0]; return f ? { cs: f.cs, to: f.to, ld: f.ld, p: f.aircraft[0].p, w: f.aircraft[0].w } : null })
  await shot(page, 'w6-build-01-fri-line')
  R.ck('fri-line', p === cast.P1 && w === cast.W1 && line && line.cs === 'W6LINE', 'Friday flies W6LINE 10:00–11:00 with P1 / W1 (the board\'s + Wave, its own boxes and palette)', { p, w, line })
  await closeBoard(page)
})

/* ---- the absences filed BEFORE Friday is published */
const filed = {}
await step('file-before', async () => {
  filed.A = await fileInput(page, { person: cast.A, type: 'LL', from: THU, to: FRI, span: 'all', remarks: 'W6 A leave' })
  filed.B = await fileInput(page, { person: cast.B, type: 'LL', from: THU, to: FRI, span: 'am', remarks: 'W6 B morning leave' })
  filed.C = await fileInput(page, { person: cast.C, type: 'ATT C', from: THU, to: FRI, remarks: 'W6 C sick' })
  filed.D = await fileInput(page, { person: cast.D, type: 'CSE', from: FRI, span: 'all', remarks: 'W6 D course' })
  const st = {}
  for (const k of ['A', 'B', 'C', 'D']) st[k] = (await inputsOf(page, cast[k])).filter(x => /W6/.test(x.remarks))
  R.ck('file-before', ['A', 'B', 'C', 'D'].every(k => filed[k].added === 1 && st[k].length === 1), 'A LL Thu–Fri, B LL mornings Thu–Fri, C ATT C Thu–Fri, D CSE Fri — each filed on the Inputs page', { filed: Object.fromEntries(Object.entries(filed).map(([k, v]) => [k, [v.added, v.asked, v.toast]])), st })
})
await step('war-approved', async () => {
  await L.lwOpen(page, FRI)
  const b = await bidOn(page, cast.E, FRI, 'LL')
  const t = await tapCell(page, cast.E, FRI)
  const a = await sheetPress(page, 'decide-approve')
  await closeSheets(page)
  const cell = await L.lwCell(page, cast.E, FRI)
  const st = await inputsOf(page, cast.E)
  R.ck('war-approved', b.placed && a.pressed && /LL/.test(cell.box) && st.some(x => x.lw), 'E: an LL bid on Fri on the war, then Approve — it writes the Input (lw provenance)', { b, tap: t.open, a: a.pressed, cell, st })
})

/* ---- publish Friday and Saturday */
await step('publish', async () => {
  const f = await S.pubOnBoard(page, 4)
  R.ck('publish-fri', f.p.pressed, 'Friday signed and published through the board', f)
  const s = await S.pubOnBoard(page, 5)
  R.ck('publish-sat', s.p.pressed, 'Saturday signed and published through the board', s)
  await closeBoard(page)
  const face = await S.unavOn(page, 'face', 4)
  R.note('fri-face-as-published', face)
  await S.shotUnav(page, 'face', 4, 'w6-build-02-fri-face-as-published')
  const cf = await S.counts(page, 4), cs5 = await S.counts(page, 5)
  R.ck('publish-zero', S.agree(cf, 0)[0] && S.agree(cs5, 0)[0], 'both days read nothing pending after the publish', { fri: cf.n, sat: cs5.n })
})

/* ---- LATE: F on published Friday (the pilot on the line); a leave over the Saturday SDO's named duty */
await step('late-fri', async () => {
  await toasts(page)
  filed.F = await fileInput(page, { person: cast.P1, type: 'LL', from: FRI, span: 'all', remarks: 'W6 F late leave' })
  const c = await S.counts(page, 4)
  R.ck('late-fri', filed.F.added === 1 && S.agree(c, 1)[0], 'F: LL on published Friday for P1 — one pending on every count', { F: filed.F, c: c.n, t: await toasts(page) })
})
await step('late-sat-sdo', async () => {
  await toasts(page)
  filed.S = await fileInput(page, { person: cast.SDO, type: 'LL', from: SAT, span: 'all', remarks: 'W6 SDO leave over his duty' })
  const t = await toasts(page)
  const c = await S.counts(page, 5)
  R.ck('late-sat-sdo', filed.S.added === 1, 'a leave filed on Saturday for the man on its SDO desk is taken (filed and flagged, N4)', { S: filed.S, toasts: t, sat: c.n })
  R.note('late-sat-sdo-toast', t)
})

/* ---- the manning day, Wed 29 Jul */
await step('manning-day', async () => {
  const base = await W4.manningOn(page, D29)
  R.note('manning-29-before', base)
  const away = iwso.slice(0, iwso.length - 1), awarded = iwso[iwso.length - 1], dbl = away[away.length - 1]
  for (const id of away.slice(0, -1)) await fileInput(page, { person: id, type: 'LL', from: D29, span: 'all', remarks: 'W6 manning leave' })
  const a = await fileInput(page, { person: dbl, type: 'LL', from: D29, span: 'am', remarks: 'W6 manning morning leave' })
  const m = await fileInput(page, { person: dbl, type: 'ATT C', from: D29, span: 'pm', remarks: 'W6 manning afternoon sick' })
  const st = (await inputsOf(page, dbl)).filter(x => /W6 manning/.test(x.remarks))
  R.ck('manning-double', a.added === 1 && m.added === 1 && st.length === 2, 'the sixth IWSO carries a leave (morning) AND a medical (afternoon) on 29 Jul, both stored', { dbl: cs[dbl], st })
  await L.lwOpen(page, D29)
  const aw = await L.lwAward(page, awarded, D29, '1', 'W6 award')
  R.ck('manning-award', aw.given, 'the seventh IWSO given an OIL award (1 day) on 29 Jul through the bid sheet\'s +OIL', { who: cs[awarded], aw })
  R.note('manning-roles', { away: away.map(k => cs[k]), double: cs[dbl], awarded: cs[awarded] })
  writeFileSync(`${SCR}/cast.json`, JSON.stringify({ cast, cs, iwso, away, dbl, awarded, base }, null, 1))
})

await page.context().storageState({ path: `${SCR}/world.json` })
R.note('saved', `${SCR}/world.json`)
R.note('toasts', await toasts(page))
R.note('errors', errors.slice(0, 20))
R.ck('no-console-errors', errors.length === 0, 'no console errors while building', errors.slice(0, 5))
R.save()
await browser.close()
