/* W5 RE-WALK (26 Sep 26) — rw-w5-08's FR4b at 390 px: the second tap (Drifter's 10 Dec, after his posting moved to 1 Dec)
   did not open the posting sheet. What did it open, and does the switch, once reached, leave the hand archive alone?
   Usage (from raptor-port/): node scripts/handpass/ab/rw-w5-08c-fr4b-probe.mjs [phone|desktop] */
const W = process.argv[2] || 'phone'
process.env.AB_WHO = 'rewalk/w5'
const L = await import('./ab-lib.mjs')
const Q = await import('./rw-w5-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, tapCell, closeSheets, shot, toastSpy, resultBook, ROOT, rowRun } = L
const PHONE = W === 'phone'
const R = resultBook(`RW-W5-08c-${W}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-w5-08c-${W}.txt`)
const { browser, page, errors } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: PHONE ? 2 : 1 })
await toastSpy(page)
const pic = n => `rw-w5-08c-${W}-${n}`
const id = 'slipway'
await Q.postOutBid(page, id, '2026-07-20', '2026-11-02', true)
await Q.archiveByHand(page, id)
await lwOpen(page, '2026-11-10')
const s1 = await Q.postingSheet(page, id, '2026-11-10', { date: '2026-12-01' })
const q1 = await Q.quals(page, id)
const tries = {}
for (const d of ['2026-12-10', '2026-12-02', '2026-11-30']) {
  await lwOpen(page, d)
  const r = await rowRun(page, id, [d])
  const t = await tapCell(page, id, d)
  tries[d] = { row: r[0], opened: t.open, over: t.over || '', text: (t.text || '').slice(0, 120) }
  await shot(page, pic(`tap-${d}`))
  await closeSheets(page)
}
R.note('taps-after-move-to-1-dec', { s1: s1.after, q1: [q1.onRoster, q1.inArchive], tries })
const target = Object.entries(tries).find(([, v]) => v.opened === 'postout-sheet')
if (target) {
  await lwOpen(page, target[0])
  const s2 = await Q.postingSheet(page, id, target[0], { flip: true }, { after: pic('flip-off') })
  const q2 = await Q.quals(page, id, pic('quals-after-flip'))
  R.ck('FR4b-switch-off-keeps-hand-archive', /Stays on the Quals roster/.test(s2.after.text) && !q2.onRoster && q2.inArchive, '"Archive on PO date" turned off on a man archived BY HAND: he stays archived (FR4)', { day: target[0], s2: s2.after.text, q2 })
} else R.note('FR4b-no-posting-sheet', 'no hatched day opened the posting sheet at this width')
R.note('errors', errors.slice(0, 10))
R.save()
await browser.close()
