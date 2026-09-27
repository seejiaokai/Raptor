/* W2-05 — a MEDICAL on a PUBLISHED day (D177, D178, D179 — the face frozen, D185; D103 the four fall; D98/D174 taken
   back reads 0; D211 members read a medical's type and remarks), and a MEMBER's own medical (item 6), walked in the
   running app. Assertions of the RIGHT behaviour. The host's H1 already walked a late medical FILED onto published
   Friday; this walks the other four medical doors onto it:
     P1  a medical EXTENDED onto published Friday (Inputs table edit, 15–16 → 15–17)
     P2  a medical on the face TRIMMED by an upchit dated Friday (the medical ends Thursday)
     P3  a medical on the face DELETED (Inputs table ✕)
     P4  a medical DRAGGED onto Friday on the Inputs calendar (Mon 13 → Fri 17)
   each: every count reads 1 pending on the admin's working copy, the four sign-offs fall, the published face keeps the
   medical rows it went out with; ONE Undo → 0 again.
     P5  the member (us = Ranger) reads published Friday: a medical row shows its type and remarks (D211)
     P6  the member files his OWN medical (the certificate ask), moves it by the calendar, undoes it on the war; he
         cannot drag another man's
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/w2-05-published.mjs [desktop|phone] */
const WD = process.argv[2] || 'desktop'
process.env.AB_WHO = 'w2'
const L = await import('./ab-lib.mjs')
const S = await import('./ab-sched.mjs')
const W = await import('./w2-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { shot, toastSpy, toasts, resultBook, ROOT, inputsWindow, deleteInputRow, go } = L
const { counts, agree, unavOn, shotUnav, pubAndSign, freeMen } = S
const PHONE = WD === 'phone'
const R = resultBook(`W2-05-${WD}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-w2-05-${WD}.txt`)
const { browser, page, errors } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: PHONE ? 3 : 1 })
await toastSpy(page)
const P = (n) => `w2-05-${WD}-${n}`
const ONLY = (process.env.W2_ONLY || '').split(',').filter(Boolean)
async function step(name, fn) { if (ONLY.length && !ONLY.some(o => name.startsWith(o))) return; try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await shot(page, P(`THREW-${name}`)).catch(() => {}) } }
const drag = (iid, a, b) => PHONE ? W.calDragTouch(page, iid, a, b) : W.calDragMouse(page, iid, a, b)
const JUL = d => `2026-07-${String(d).padStart(2, '0')}`
const FRI = 4
const has = (u, id) => Array.isArray(u) && u.some(r => r.endsWith(':' + id))
const cs = await W.csOf(page)

/* ---- the cast: men with nothing that week Mon–Fri (a medical on a worked Friday would be a hard conflict) */
let free = await freeMen(page, [0, 1, 2, 3, 4])
if (free.length < 4) free = [...new Set([...free, ...(await freeMen(page, [2, 3, 4]))])]
const [U1, U2, U3, U4] = free
R.note('cast', { U1: cs[U1], U2: cs[U2], U3: cs[U3], U4: cs[U4], free: free.map(f => cs[f]) })
const ids = {}
await step('setup', async () => {
  ids.u1 = (await W.fileMed(page, { person: U1, type: 'ATT C', from: JUL(15), to: JUL(16), remarks: 'W2 P1 flu' })).iid
  ids.u2 = (await W.fileMed(page, { person: U2, type: 'ATT C', from: JUL(16), to: JUL(17), remarks: 'W2 P2 back strain — PHA review' })).iid
  ids.u3 = (await W.fileMed(page, { person: U3, type: 'HL', from: JUL(17), remarks: 'W2 P3 day surgery' })).iid
  ids.u4 = (await W.fileMed(page, { person: U4, type: 'ATT C', from: JUL(13), remarks: 'W2 P4 dentist' })).iid
  const pub = await pubAndSign(page, FRI)
  const c = await counts(page, FRI); const [ok, bad] = agree(c, 0)
  const face = await unavOn(page, 'face', FRI)
  await shotUnav(page, 'face', FRI, P('00-fri-face-as-published'))
  R.ck('setup-published', pub.pub.p.pressed && ok && !c.fell && has(face, U2) && has(face, U3) && !has(face, U1) && !has(face, U4),
    'Friday published and signed: 0 pending; the face lists U2 (ATT C) and U3 (HL), not U1 or U4', { ids, pub: pub.pub.p, bad, face, signs: c.signs })
})

async function door(tag, what, act, faceWant) {
  await step(tag, async () => {
    const r = await act()
    const c = await counts(page, FRI); const [ok, bad] = agree(c, 1)
    const face = await unavOn(page, 'face', FRI), work = await unavOn(page, 'work', FRI)
    await shotUnav(page, 'face', FRI, P(`${tag}a-face`)); await shotUnav(page, 'work', FRI, P(`${tag}b-working-copy`))
    R.ck(`${tag}-pending`, ok && c.fell, `${what}: 1 pending on every count of the admin's working copy, the four sign-offs fall (D177–D179, D103)`, { act: r, bad, c })
    R.ck(`${tag}-face-frozen`, faceWant(face, work), 'the published face keeps the medical rows it went out with; the working copy shows the change (D179, D185)', { face, work })
    const u = await W.hist(page, 'undo')
    const c2 = await counts(page, FRI); const [ok2, bad2] = agree(c2, 0)
    R.ck(`${tag}-undo`, ok2, 'ONE Undo takes it back: 0 pending again (D98 / D174)', { undo: u, bad: bad2, signs: c2.signs, fell: c2.fell })
  })
}
await door('P1', 'U1\'s ATT C 15–16 extended to 15–17 on the Inputs table', async () => {
  await W.toList(page); await inputsWindow(page, JUL(13), JUL(19))
  await W.tableEdit(page, ids.u1); const d = await W.tablePickDates(page, JUL(15), JUL(17)); await W.tableSave(page)
  return { dates: d, sheet: await W.confirmNow(page), rows: await W.medRows(page, U1) }
}, (f, w) => !has(f, U1) && has(w, U1) && has(f, U2) && has(f, U3))
await door('P2', 'an upchit for U2 dated Fri 17 (his ATT C 16–17 now ends Thu 16)', async () => {
  const u = await W.fileMed(page, { person: U2, type: 'Upchit', from: JUL(17), remarks: 'W2 P2 fit' })
  return { sheet: u.sheet, rows: await W.medRows(page, U2) }
}, (f, w) => has(f, U2) && !has(w, U2))
await door('P3', 'U3\'s HL on Friday deleted from the Inputs table', async () => {
  await W.toList(page); await inputsWindow(page, JUL(13), JUL(19))
  return { del: await deleteInputRow(page, ids.u3), rows: await W.medRows(page, U3) }
}, (f, w) => has(f, U3) && !has(w, U3))
await door('P4', 'U4\'s ATT C dragged on the Inputs calendar from Mon 13 onto Fri 17', async () => {
  await W.calTo(page, '2026-07')
  const d = await drag(ids.u4, JUL(13), JUL(17))
  return { drag: d, toasts: await toasts(page), sheet: await W.confirmNow(page), rows: await W.medRows(page, U4) }
}, (f, w) => !has(f, U4) && has(w, U4))

/* ---- P5: the member reads published Friday */
await step('P5', async () => {
  await L.relogin(page, 'm')
  await toastSpy(page)
  await go(page, 'viewsched'); await page.waitForTimeout(500)
  const rows = await page.evaluate(() => { const b = document.querySelector('#vWeek .day[data-day="4"] .sec-unav'); return b ? [...b.querySelectorAll('.pl-row')].map(r => r.innerText.replace(/\s+/g, ' ').trim()) : 'NO BLOCK' })
  await shotUnav(page, 'face', FRI, P('P5a-member-reads-published-friday'))
  const u2 = Array.isArray(rows) ? rows.find(r => r.includes(cs[U2])) : null
  R.ck('P5-member-reads-medical', !!u2 && /ATT C/.test(u2) && /back strain/.test(u2), 'the member reads U2\'s medical row on published Friday with its type and remarks (D211)', rows)
})

/* ---- P6: the member's own medical */
await step('P6', async () => {
  const me = 'bane'
  const f = await W.fileMed(page, { type: 'ATT C', from: JUL(20), to: JUL(21), remarks: 'W2 P6 Ranger sick' })
  const rows0 = await W.medRows(page, me)
  const war0 = await W.warRead(page, me, [JUL(20), JUL(21), JUL(22), JUL(23)])
  R.ck('P6-member-files-own', f.added === 1 && f.asked.includes('certificate') && rows0.some(r => /^ATT C Jul 20–Jul 21/.test(r)) && war0.figs.medtot !== '0',
    'the member files his own ATT C 20–21 (asked for the certificate, "No document"); his war row and MED TOT show it', { asked: f.asked, rows0, war0 })
  await W.calTo(page, '2026-07')
  await toasts(page)
  const d = await drag(f.iid, JUL(20), JUL(22))
  const t = await toasts(page)
  const rows1 = await W.medRows(page, me), war1 = await W.warRead(page, me, [JUL(20), JUL(21), JUL(22), JUL(23)])
  await shot(page, P('P6a-member-moved-own-medical'))
  R.ck('P6-member-drags-own', rows1.some(r => /^ATT C Jul 22–Jul 23/.test(r)) && t.some(x => /Moved to 22 Jul/.test(x)), 'he drags his own chip 20 → 22: moved (22–23), "Moved to 22 Jul"; the war follows', { drag: d, toasts: t, rows1, war1 })
  const u = await W.hist(page, 'undo', 'leavewar')
  const rows2 = await W.medRows(page, me)
  R.ck('P6-member-undo-on-war', rows2.some(r => /^ATT C Jul 20–Jul 21/.test(r)), 'the Leave War\'s Undo (his only Undo) puts it back to 20–21', { undo: u, rows2 })
  /* another man's chip: Grit's demo ATT C 13–17 */
  const grit = await page.evaluate(() => (window.INPUTS.find(x => x.person === 'sufa' && x.type === 'ATT C') || {}).iid)
  /* a member's Inputs page opens filtered to himself ("FILTERED: RANGER") — widen it to everyone first, as he would */
  await W.toList(page)
  const filt = await page.evaluate(() => [...document.querySelectorAll('#inFPerson option')].map(o => o.value))
  await page.selectOption('#inFPerson', 'all').catch(() => {})
  R.note('P6-member-filter', { options: filt.slice(0, 5), now: await page.locator('#inFPerson').inputValue().catch(() => '?') })
  await W.calTo(page, '2026-07')
  await toasts(page)
  const d2 = await drag(grit, JUL(14), JUL(21))
  const t2 = await toasts(page)
  await shot(page, P('P6b-member-cannot-move-another'))
  R.ck('P6-member-not-another', t2.some(x => /Only a scheduler can move someone else/.test(x)) && (await W.medRows(page, 'sufa')).some(r => /^ATT C Jul 13–Jul 17/.test(r)),
    'dragging Grit\'s chip is refused: "Only a scheduler can move someone else\'s input"; it stays 13–17', { drag: d2, toasts: t2, ghost: await W.ghostLeft(page) })
})

R.note('errors', errors.slice(0, 20))
R.ck('console-clean', !errors.length, 'no console errors, page errors or failed requests', errors.slice(0, 10))
R.save()
await browser.close()
