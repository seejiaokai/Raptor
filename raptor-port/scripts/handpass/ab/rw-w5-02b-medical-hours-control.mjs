/* W5 RE-WALK copy (26 Sep 26) for W5-F4 / F5 (register §12: "A half is offered only when it can be taken, read off the
   real hours: beside an ATT C recorded 09:00–14:00 no afternoon is offered, and a refusal names a timed medical's hours.
   The heading speaks the box's notation ('now <LL')."). Case (b) now expects NO afternoon offered — the tap reads the day;
   the heading of every sheet opened is read; (c) the heading beside a filed morning LL; (d) a medical 13:00–17:00 (the
   afternoon taken, the morning free).
   W5 — the control for ORDER 2's "medical then bid": does the bid door judge a medical by its REAL hours (§7) or by
   the whole day? Two clean days, each with a morning medical filed on the Inputs page, then an afternoon LL bid:
     (a) ATT C 08:00–11:00 — the hours end before noon: the afternoon bid must be PLACED (they do not meet);
     (b) ATT C 09:00–14:00 — the hours run past noon: the afternoon bid is refused, naming the medical.
   Both sheets open offering the afternoon only ("The morning is <C"). Assertions of the RIGHT behaviour.
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/w5-02b-medical-hours-control.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = 'rewalk/w5'
const L = await import('./ab-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, tapCell, sheetPress, closeSheets, sheetNow, fileInput, shot, toastSpy, resultBook, ROOT, lwShot } = L
const PHONE = W === 'phone'
const R = resultBook(`RW-W5-02b-${W}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-w5-02b-${W}.txt`)
const { browser, page, errors } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: PHONE ? 2 : 1 })
await toastSpy(page)
const pic = n => `rw-w5-02b-${W}-${n}`
const P = 'bane'
async function pmBid(D, tag) {
  await lwOpen(page, D)
  const t = await tapCell(page, P, D)
  const portions = (t.buttons || []).filter(b => /^portion-/.test(b))
  const head = await page.evaluate(() => { const c = document.querySelector('.bidsheet[role="dialog"] .cur'); return c ? c.textContent.trim() : '' })
  await shot(page, pic(`${tag}-tap`))
  if (t.open !== 'bid-picker') { await closeSheets(page); return { open: t.open, head, text: (t.text || '').slice(0, 300), buttons: t.buttons, cell: await L.lwCell(page, P, D) } }
  if (portions.length > 1) await sheetPress(page, 'portion-pm')
  await sheetPress(page, 'bid-LL')
  let s = await sheetNow(page)
  if (s.open === 'bid-picker' && /Tap the same leave again/i.test(s.text)) { await sheetPress(page, 'bid-LL'); s = await sheetNow(page) }
  await shot(page, pic(`${tag}-after-pm-bid`))
  const placed = s.open === 'nothing'
  if (!placed) await closeSheets(page)
  return { open: t.open, head, portions, held: /morning is [^,]*/.exec(t.text || '')?.[0] || '', placed, said: placed ? '' : (s.text || '').slice(-160), cell: await L.lwCell(page, P, D) }
}
const a = await fileInput(page, { person: P, type: 'ATT C', from: '2026-08-11', span: 'custom', start: '08:00', end: '11:00', remarks: 'W5 sick 08-11' })
const ra = await pmBid('2026-08-11', 'a-0800-1100')
R.ck('a-real-hours-apart', a.added === 1 && ra.placed, 'ATT C 08:00–11:00, then an afternoon LL bid: the bid is PLACED — the real hours do not meet (§7)', ra)
const b = await fileInput(page, { person: P, type: 'ATT C', from: '2026-08-12', span: 'custom', start: '09:00', end: '14:00', remarks: 'W5 sick 09-14' })
const rb = await pmBid('2026-08-12', 'b-0900-1400')
R.ck('b-no-afternoon-offered', b.added === 1 && rb.open !== 'bid-picker' && !(rb.buttons || []).some(x => /^(portion-|bid-LL)/.test(x)), 'ATT C 09:00–14:00: the tap offers NO afternoon (no bid sheet, no LL) — it reads the day (W5-F4)', rb)
R.ck('a-heading-box-notation', !!ra.head && !/\*/.test(ra.head), 'beside a morning medical (08:00–11:00) the sheet heading speaks the box notation, no "*" (W5-F5)', { head: ra.head, box: ra.cell })
/* (c) the heading beside a filed MORNING leave */
const c = await fileInput(page, { person: P, type: 'LL', from: '2026-08-13', span: 'am', remarks: 'W5 rw morning LL' })
await lwOpen(page, '2026-08-13')
const tc = await tapCell(page, P, '2026-08-13')
const hc = await page.evaluate(() => { const c = document.querySelector('.bidsheet[role="dialog"] .cur'); return c ? c.textContent.trim() : '' })
await shot(page, pic('c-heading-beside-morning-LL'))
await closeSheets(page)
R.ck('c-heading-now-<LL', c.added === 1 && tc.open === 'bid-picker' && /<LL/.test(hc) && !/\*/.test(hc), 'a filed morning LL: the bid sheet heading reads "now <LL", as the box does (W5-F5)', { open: tc.open, head: hc, portions: (tc.buttons || []).filter(x => /^portion-/.test(x)), box: await L.lwCell(page, P, '2026-08-13') })
/* (d) a medical 13:00–17:00 — the afternoon taken, the morning free: what is offered, and does a morning bid land? */
const d = await fileInput(page, { person: P, type: 'ATT C', from: '2026-08-14', span: 'custom', start: '13:00', end: '17:00', remarks: 'W5 sick 13-17' })
await lwOpen(page, '2026-08-14')
const td = await tapCell(page, P, '2026-08-14')
const hd = await page.evaluate(() => { const c = document.querySelector('.bidsheet[role="dialog"] .cur'); return c ? c.textContent.trim() : '' })
await shot(page, pic('d-1300-1700-tap'))
let placedD = null
if (td.open === 'bid-picker') {
  const por = (td.buttons || []).filter(x => /^portion-/.test(x))
  if (por.some(x => /portion-am/.test(x)) && por.length > 1) await sheetPress(page, 'portion-am')
  await sheetPress(page, 'bid-LL'); let sd = await sheetNow(page)
  if (sd.open === 'bid-picker' && /Tap the same leave again/i.test(sd.text)) { await sheetPress(page, 'bid-LL'); sd = await sheetNow(page) }
  placedD = sd.open === 'nothing' ? 'placed' : 'refused: ' + (sd.text || '').slice(-160)
  await closeSheets(page)
} else await closeSheets(page)
R.note('d-afternoon-medical', { added: d.added, open: td.open, head: hd, portions: (td.buttons || []).filter(x => /^portion-/.test(x)), text: (td.text || '').slice(0, 220), morningBid: placedD, box: await L.lwCell(page, P, '2026-08-14') })
await lwShot(page, pic('row-after-both'), P, '2026-08-11')
R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
