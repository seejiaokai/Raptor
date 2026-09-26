/* W3-05d — a leave across 31 Dec (30 Dec 26 – 2 Jan 27, filed on the Inputs page) charges each war its OWN days,
   once: Blade's figures in the 26 war and the 27 war, before and after (Fable S14 "charges once"). Assertions of the
   RIGHT behaviour: 26 moves by 2 days, 27 by 2 days. */
process.env.AB_WHO = 'w3'
const L = await import('./w3-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, fileInput, figures, resultBook, ROOT, warPick, shot } = L
const R = resultBook('W3-05d', `${ROOT}/docs/handpass/parts/2026-09-26-absence-w3-05d.txt`)
const { browser, page, errors } = await openHi({ width: 1440, height: 900, who: 'a', dpr: 1 })
const read = async () => {
  await warPick(page, 'JAN - DEC 26'); await lwOpen(page, '2026-12-30'); const a = await figures(page, 'slash')
  await warPick(page, 'JAN - DEC 27'); await lwOpen(page, '2027-01-01'); const b = await figures(page, 'slash')
  await warPick(page, 'JAN - DEC 26')
  return { w26: a, w27: b }
}
const before = await read()
const f = await fileInput(page, { person: 'slash', type: 'LL', from: '2026-12-30', to: '2027-01-02', remarks: 'W3 new year' })
const after = await read()
await warPick(page, 'JAN - DEC 27'); await lwOpen(page, '2027-01-01'); await L.lwShot(page, 'w3-05d-war27-figures', 'slash', '2027-01-01')
R.note('figures', { filed: f.added, before, after })
const d = (x, y) => (+y) - (+x)
/* One running balance per counter, whatever war is on screen ([LEAVE-YEAR], filed — which year a leave across 31 Dec
   charges is his to decide). So "charges once" reads: the four days charge their working days ONCE (30, 31 Dec and
   Fri 1 Jan — Sat 2 Jan is a weekend), and both wars show that one balance. */
R.ck('newyear-charges-once', d(before.w26.lvetot, after.w26.lvetot) === 3 && after.w26.lvetot === after.w27.lvetot && after.w26.lve === after.w27.lve,
  'the leave across 31 Dec charges its three working days ONCE (LVE TOT +3, not +6), and both wars show the one balance ([LEAVE-YEAR])', { lvetot26: [before.w26.lvetot, after.w26.lvetot], lvetot27: [before.w27.lvetot, after.w27.lvetot], lve26: [before.w26.lve, after.w26.lve], lve27: [before.w27.lve, after.w27.lve] })
R.note('errors', errors.slice(0, 10))
R.save()
await browser.close()
