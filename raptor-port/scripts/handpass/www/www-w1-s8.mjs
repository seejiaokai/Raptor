/* www W1 scenario 8 — the pending OIL line's shapes. usage: [PHONE=1] node scripts/handpass/www/www-w1-s8.mjs */
const PHONE = process.env.PHONE === '1'
process.env.WWW_RUN ||= 's8-' + (PHONE ? 'p' : 'd')
const H = await import('./www-w1-lib3.mjs')
const { X, say, sleep, L, nrm } = H
const size = PHONE ? '402' : '1536'
const P = PHONE ? 'p' : 'd'
const SAT = X.SAT
const w = await X.open({ phone: PHONE })
const { page } = w
const R = (did, exp, saw, v, pic) => X.row('8 pending OIL line shapes', size, did, exp, saw, v, pic)
// the rally setting's key, read from the page
await L.go(page, 'logic'); await sleep(500)
const rallyKey = await page.evaluate(() => document.querySelector('.lgset[data-lgname="Default rally before take-off"]')?.dataset.lgkey)
say('rally key', rallyKey)
// base: A flight 90 so the published day is a full day (09:00-15:30 = 6h30)
await H.logicOpen(w, true); await H.setSetting(w, 'fltLen', '90'); await H.logicDone(w)
await X.board(w, SAT)
await X.flight(w, SAT, '12:00', '', 'bane', { msn: 'OIL FLT' })
const pr = await H.signAndPublish(w, SAT); await sleep(800)
const hp = await H.head(w, SAT)
await X.closeBoard(w)
R('set A flight 90, built Ranger T/O 12:00 no landing on Saturday, published', 'ORIG out', JSON.stringify({ pr: pr.pressed, tag: hp && hp.tag }), hp && /ORIG/.test(hp.tag) ? 'PASS' : 'NOT WALKED', '')
const r0 = await H.lwReadAll(w, 'bane', '2026-07-18', `8-0base`)
R('base credit', 'FO*, worked 09:00–15:30', JSON.stringify(r0), r0.cell && /^FO\*/.test(r0.cell.text) ? 'PASS' : 'FAIL', `8-0base-lwsheet-${P}.png`)
async function change(tag, sets, did, expRe) {
  await H.logicOpen(w, true)
  for (const [k, v] of sets) await H.setSetting(w, k, v)
  await H.logicDone(w)
  await X.board(w, SAT)
  const h = await H.head(w, SAT)
  const pl = await H.pendingList(w, SAT, tag)
  const mine = pl.filter(l => /Logic|Ranger|OIL changes|still|full day|half day|start|end/i.test(l))
  R(did, expRe ? 'RECORD; the Ranger line says whether OIL changed and the moved times' : 'RECORD', `head ${JSON.stringify(h && h.pending)}; ${JSON.stringify(mine)}`, 'RECORDED', `${tag}-pendinglist-${P}.png`)
  if (expRe) R(did + ' — line check', 'a Ranger line naming the moved times and "still a full day" / the change', JSON.stringify(mine.filter(l => /Ranger/.test(l) || /still|OIL changes/i.test(l))), mine.some(l => expRe.test(l)) ? 'PASS' : 'FAIL', `${tag}-pendinglist-${P}.png`)
  await page.keyboard.press('Escape'); await sleep(400)
  await X.closeBoard(w)
}
// (a) only the flight length: 90 -> 120 (end moves 15:30 -> 16:00; still full)
await change('8-a', [['fltLen', '120']], 'only A flight 90 -> 2h', /09:00–16:00|full day/)
await H.logicOpen(w, true); await H.setSetting(w, 'fltLen', '90'); await H.logicDone(w)
// (b) only the nominal report: 3h -> 2h45 (start 09:00 -> 09:15; still full 6h15)
await change('8-b', [[rallyKey, '165']], 'only the default rally 3h -> 2h45', /09:15–15:30|full day/)
// (c) both
await change('8-c', [['fltLen', '120'], [rallyKey, '165']], 'both: A flight 2h and rally 2h45', /09:15–16:00|full day/)
// (d) a pending schedule edit: type an in-time R 08:30 on the flight, with the Logic changes still in place
await X.board(w, SAT)
const wi = 0
await X.typeIn(w, `[data-bfld="ff:${SAT}.${wi}.0.rl"]`, "08:30")
const hd = await H.head(w, SAT)
const pld = await H.pendingList(w, SAT, '8-d')
const mined = pld.filter(l => /Logic|Ranger|OIL changes|still|full day|half day|08:30|in-time|R /i.test(l))
R('(d) Logic changes (A flight 2h, rally 2h45) in place, THEN a schedule edit: in-time R 08:30', 'RECORD the whole pending list for the person', `head ${JSON.stringify(hd && hd.pending)}; ${JSON.stringify(pld)}`, 'RECORDED', `8-d-pendinglist-${P}.png`)
await page.keyboard.press('Escape'); await sleep(400)
// order reversed: put the Logic back first, keep the edit, then change Logic again
await X.closeBoard(w)
await H.logicOpen(w, true); await H.setSetting(w, 'fltLen', '90'); await H.setSetting(w, rallyKey, '180'); await H.logicDone(w)
await X.board(w, SAT)
const he = await H.head(w, SAT)
const ple = await H.pendingList(w, SAT, '8-e')
R('(e) schedule edit R 08:30 only (Logic back to 90 / 3h)', 'RECORD', `head ${JSON.stringify(he && he.pending)}; ${JSON.stringify(ple)}`, 'RECORDED', `8-e-pendinglist-${P}.png`)
await page.keyboard.press('Escape'); await sleep(400)
await X.closeBoard(w)
await H.logicOpen(w, true); await H.setSetting(w, 'fltLen', '120'); await H.setSetting(w, rallyKey, '165'); await H.logicDone(w)
await X.board(w, SAT)
const hf = await H.head(w, SAT)
const plf = await H.pendingList(w, SAT, '8-f')
R('(f) schedule edit first, THEN the Logic changes (A flight 2h, rally 2h45) — the other order', 'same pending content as (d), whatever the order', `head ${JSON.stringify(hf && hf.pending)}; ${JSON.stringify(plf)}`, JSON.stringify(plf.filter(l => /Ranger|Logic/.test(l))) === JSON.stringify(pld.filter(l => /Ranger|Logic/.test(l))) ? 'PASS' : 'FAIL', `8-f-pendinglist-${P}.png`)
await X.fin(w)
