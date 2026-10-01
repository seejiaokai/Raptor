/* W3 probe 4 — probe 3's T1 with REFUSE instead of Ack, and with the ONE-DAY sheet's decide instead of the day's list:
   one tab, the admin bids Ranger's morning then his afternoon on 3 Mar; (R1) Refuse the morning from the day's list —
   is the afternoon's row rewritten? (R2) the same on 4 Mar with the drag-selection sheet deciding only the morning is
   not possible (a day holding two opens the list), so R2 refuses the AFTERNOON (the last) — is the morning's rewritten? */
import { fileURLToPath } from 'node:url'
const ROOT0 = fileURLToPath(new URL('../../', import.meta.url)).split('\\').join('/').replace(/\/$/, '')
process.env.HP_OUT ||= `${ROOT0}/docs/handpass/parts/dbrA-W3-p4-refuse.json`
const W = await import('./dbrA-W3-lib.mjs')
const { L, lwOpen, tapCell, sheetNow, sheetPress, closeSheets, bidOn, recsAt, row, rowsSummary } = W
const REC = /^leavewar\/rec:/
const ME = 'bane'
const errors = []
const places = (r, d) => recsAt(r, ME, d).map(x => `${x.code}/${x.state}#${x.ord}(${x.key.slice(-6)})`)
const browser = await L.launch(); const ctx = await L.context(browser)
const A = await W.newPage(ctx, errors, 'R')
await L.signIn(A, 'a'); await L.settle(A)
async function twoHalves(D) {
  await lwOpen(A, D)
  const a1 = await L.step(A, `bid Ranger's MORNING ${D}`, async () => bidOn(A, ME, D, 'LL', { portion: 'am' }), { put: [REC], only: true })
  const a2 = await L.step(A, `bid Ranger's AFTERNOON ${D}`, async () => {
    const t = await tapCell(A, ME, D)
    if (t.open === 'bid-picker') { await sheetPress(A, 'portion-pm'); await sheetPress(A, 'bid-LL'); let s = await sheetNow(A); if (/Tap the same leave again/i.test(s.text || '')) { await sheetPress(A, 'bid-LL'); s = await sheetNow(A) } if (s.open !== 'nothing') await closeSheets(A) } else await closeSheets(A)
  }, { put: [REC], only: true })
  return { am: a1.put[0], pm: a2.put[0] }
}
for (const [tag, D, which, verb] of [['R1', '2026-03-03', 'am', 'refuse'], ['R2', '2026-03-04', 'pm', 'refuse'], ['R3', '2026-03-05', 'am', 'approve']]) {
  const k = await twoHalves(D)
  const r0 = await L.rows(A)
  const target = k[which], other = which === 'am' ? k.pm : k.am
  const id = JSON.parse(r0[target]).id
  const s = await L.step(A, `${tag} the day's list: ${verb} the ${which === 'am' ? 'morning' : 'afternoon'} (${D})`, async () => { await tapCell(A, ME, D); await sheetPress(A, `dl-${verb}-${id}`); const x = await sheetNow(A); if (x.open !== 'nothing') await closeSheets(A) })
  const r1 = await L.rows(A)
  console.log(tag, 'places', places(r0, D), '→', places(r1, D), 'wrote', s.put, s.del)
  L.check(`${tag} — ${verb} of the ${which === 'am' ? 'morning' : 'afternoon'} leaves the other half's row untouched`, r1[other] === r0[other], { before: places(r0, D), after: places(r1, D), put: s.put, del: s.del })
  row({ step: `${tag} one tab, ${verb} ${which} of two`, width: 'desktop', did: `Ranger ${D}: Morning LL, Afternoon LL; the day's list → ${verb} on the ${which === 'am' ? 'morning' : 'afternoon'}`, screen: `places ${places(r0, D).join(' ')} → ${places(r1, D).join(' ')}`, rows: rowsSummary(s), ok: r1[other] === r0[other], pics: [] })
}
L.check('probe 4 — no console errors', !errors.length, errors)
L.save({ table: W.TABLE, errors })
await browser.close()
