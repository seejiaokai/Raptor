/* W5 RE-WALK (26 Sep 26) — a probe for rw-w5-08: after a Post out from 1 Aug (archive on), which of the man's August days
   are drawn, and what does a tap on one open? (FR2a found no August box for Cobra; FR2b's tap on Gambit's 5 Aug did not
   open the posting sheet.) Two men posted out, one from 1 Aug and one from 15 Aug; each row read Jul–Sep and each
   hatched day tapped. Usage (from raptor-port/): node scripts/handpass/ab/rw-w5-08b-hatched-probe.mjs */
process.env.AB_WHO = 'rewalk/w5'
const L = await import('./ab-lib.mjs')
const Q = await import('./rw-w5-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, tapCell, closeSheets, shot, toastSpy, resultBook, ROOT, rowRun, lwShot } = L
const R = resultBook('RW-W5-08b', `${ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-w5-08b.txt`)
const { browser, page, errors } = await openHi({ width: 1440, height: 900, who: 'a', dpr: 1 })
await toastSpy(page)
const DAYS = ['2026-07-30', '2026-07-31', '2026-08-01', '2026-08-05', '2026-08-14', '2026-08-15', '2026-08-20', '2026-09-14']
for (const [id, from] of [['taipan', '2026-08-01'], ['bruise', '2026-08-01'], ['shrek', '2026-08-15']]) {
  const po = await Q.postOutBid(page, id, '2026-07-28', from, true)
  const row = []
  for (const d of DAYS) { await lwOpen(page, d); row.push((await rowRun(page, id, [d]))[0]) }
  await lwOpen(page, '2026-08-05'); await lwShot(page, `rw-w5-08b-${id}-aug`, id, '2026-08-05')
  const taps = {}
  for (const d of ['2026-08-05', '2026-08-20']) { await lwOpen(page, d); const t = await tapCell(page, id, d); taps[d] = `${t.open}${t.over ? ' over ' + t.over : ''} ${(t.text || '').slice(0, 90)}`; if (d === '2026-08-20') await shot(page, `rw-w5-08b-${id}-tap-20-aug`); await closeSheets(page) }
  R.note(id, { from, po: po.done, row, taps })
}
R.note('errors', errors.slice(0, 10))
R.save()
await browser.close()
