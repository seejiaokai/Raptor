/* W5 — the control for ORDER 2's "medical then bid": does the bid door judge a medical by its REAL hours (§7) or by
   the whole day? Two clean days, each with a morning medical filed on the Inputs page, then an afternoon LL bid:
     (a) ATT C 08:00–11:00 — the hours end before noon: the afternoon bid must be PLACED (they do not meet);
     (b) ATT C 09:00–14:00 — the hours run past noon: the afternoon bid is refused, naming the medical.
   Both sheets open offering the afternoon only ("The morning is <C"). Assertions of the RIGHT behaviour.
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/w5-02b-medical-hours-control.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = 'w5'
const L = await import('./ab-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, tapCell, sheetPress, closeSheets, sheetNow, fileInput, shot, toastSpy, resultBook, ROOT, lwShot } = L
const PHONE = W === 'phone'
const R = resultBook(`W5-02b-${W}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-w5-02b-${W}.txt`)
const { browser, page, errors } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: PHONE ? 2 : 1 })
await toastSpy(page)
const pic = n => `w5-02b-${W}-${n}`
const P = 'bane'
async function pmBid(D, tag) {
  await lwOpen(page, D)
  const t = await tapCell(page, P, D)
  const portions = (t.buttons || []).filter(b => /^portion-/.test(b))
  if (t.open !== 'bid-picker') { await closeSheets(page); return { open: t.open } }
  if (portions.length > 1) await sheetPress(page, 'portion-pm')
  await sheetPress(page, 'bid-LL')
  let s = await sheetNow(page)
  if (s.open === 'bid-picker' && /Tap the same leave again/i.test(s.text)) { await sheetPress(page, 'bid-LL'); s = await sheetNow(page) }
  await shot(page, pic(`${tag}-after-pm-bid`))
  const placed = s.open === 'nothing'
  if (!placed) await closeSheets(page)
  return { open: t.open, portions, held: /morning is [^,]*/.exec(t.text || '')?.[0] || '', placed, said: placed ? '' : (s.text || '').slice(-160), cell: await L.lwCell(page, P, D) }
}
const a = await fileInput(page, { person: P, type: 'ATT C', from: '2026-08-11', span: 'custom', start: '08:00', end: '11:00', remarks: 'W5 sick 08-11' })
const ra = await pmBid('2026-08-11', 'a-0800-1100')
R.ck('a-real-hours-apart', a.added === 1 && ra.placed, 'ATT C 08:00–11:00, then an afternoon LL bid: the bid is PLACED — the real hours do not meet (§7)', ra)
const b = await fileInput(page, { person: P, type: 'ATT C', from: '2026-08-12', span: 'custom', start: '09:00', end: '14:00', remarks: 'W5 sick 09-14' })
const rb = await pmBid('2026-08-12', 'b-0900-1400')
R.ck('b-real-hours-meet', b.added === 1 && !rb.placed && /ATT C|medical/i.test(rb.said), 'ATT C 09:00–14:00, then an afternoon LL bid: refused, naming the medical — the hours run past noon', rb)
R.note('b-offered-then-refused', { portions: rb.portions, held: rb.held, note: 'the sheet offers ONLY the afternoon, then refuses it — the house rule is that a control that cannot work is absent (BidPicker item D)' })
await lwShot(page, pic('row-after-both'), P, '2026-08-11')
R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
