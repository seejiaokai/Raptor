import * as L from './icard-C-lib.mjs'
const { sleep } = L
const w = await L.world('phone', 'ad')
const p = w.page
const parts = [], pics = []
let verdict = 'PASS'
const fail = m => { verdict = 'FAIL'; parts.push('FAIL: ' + m) }
const hs = h => h ? `chip "${h.pending}"; working selects [${h.signs.join('/')}]; mark "${h.nys}"; AL button "${h.alpub}"` : 'none'
const lw = async () => JSON.stringify(await L.lwCellText(w, 'Saber'))
const fmt = r => r ? `${r.date} ${r.s}-${r.e} oil ${JSON.stringify(r.oil)}` : 'GONE'
const issuedHours = async () => { const v = await L.issuedDay(w, 'Jul 13', 5); return (v.rows.filter(r => /DUTY/i.test(r))).join(' | ') }
async function change(rec, endHM, ans, label) {
  await L.openFromList(w, rec.iid)
  await L.setTimes(p, null, endHM)
  const s = await L.saveWin(w)
  parts.push(`${label}: changed End to ${endHM}: question ${s.asked ? s.head.slice(0, 150) : 'none'}`)
  if (s.asked) { await L.answerOil(w, ans); await sleep(500) }
  return await L.recId(p, rec.iid)
}
try {
  await L.fileNew(w, { iso: '2026-07-18', type: 'Duty', s: '09:00', e: '12:00', oil: 'yes' })
  const rec = await L.recBy(p, { type: 'Duty', date: 'Jul 18' })
  parts.push('filed own Sat 18 Jul Duty 09:00-12:00, OIL Yes: ' + fmt(rec) + '; Leave War cell before publishing: ' + await lw())
  const sp = await L.signAndPublish(w, 'Jul 13', 5)
  parts.push(`published Saturday: ${JSON.stringify(sp.pub)}; Leave War cell after publishing: ${await lw()}`)
  await L.weekTo(w, 'editsched', 'Jul 13'); await L.showDay(p, 5)
  parts.push('re-signed the working boxes after publishing: ' + JSON.stringify(await L.signDay(p, 5, 1)))
  const base = await L.editDay(w, 'Jul 13', 5)
  parts.push('baseline Sat: ' + hs(base.head))
  pics.push(await L.pic(w, '77-1-baseline'))
  // change 1: longer hours -> FO
  const r1 = await change(rec, '17:00', 'yes', 'C1')
  parts.push('C1 saved: ' + fmt(r1))
  const d1 = await L.editDay(w, 'Jul 13', 5)
  pics.push(await L.pic(w, '77-2-pending-after-c1'))
  const lw1 = await lw()
  const iss1 = await issuedHours()
  parts.push(`C1 Sat now: ${hs(d1.head)}; Leave War cell (issued OIL): ${lw1}; issued face Duty rows: ${iss1}`)
  if (!/pending/i.test(d1.head.pending) || !/Publish AL/i.test(d1.head.alpub)) fail('C1: no pending change / AL button: ' + hs(d1.head))
  if (!d1.head.signs.every(x => /name/i.test(x))) fail('C1: working sign-offs not cleared: ' + d1.head.signs.join('/'))
  if (!/HO/.test(lw1)) fail('C1: the issued earned leave changed before publishing the amendment: ' + lw1)
  if (!/09:00\s*12:00/.test(iss1)) fail('C1: issued face no longer shows the issued hours 09:00-12:00: ' + iss1)
  // publish the amendment
  const al = await L.signAndPublish(w, 'Jul 13', 5)
  const pubAL = await L.publishAL(p, 5)
  const hAfter = await L.editDay(w, 'Jul 13', 5)
  const lw2 = await lw()
  const iss2 = await issuedHours()
  parts.push(`C1 amendment: signed ${JSON.stringify(al.signs)}, pressed publish day? ${JSON.stringify(al.pub)}, then AL: ${JSON.stringify(pubAL)}; Sat now: ${hs(hAfter.head)}; Leave War cell: ${lw2}; issued face: ${iss2}`)
  pics.push(await L.pic(w, '77-3-after-al'))
  if (!/FO/.test(lw2)) fail('C1: after publishing the amendment the issued earned leave did not become FO: ' + lw2)
  // opposite change: back to 3 hours -> HO
  await L.signDay(p, 5, 1)
  const r2 = await change(rec, '12:00', 'yes', 'C2')
  parts.push('C2 saved: ' + fmt(r2))
  const d2 = await L.editDay(w, 'Jul 13', 5)
  const lw3 = await lw()
  parts.push(`C2 Sat now: ${hs(d2.head)}; Leave War cell: ${lw3}`)
  if (!/pending/i.test(d2.head.pending)) fail('C2: no pending change after the opposite change')
  if (!/FO/.test(lw3)) fail('C2: issued earned leave changed before the amendment: ' + lw3)
  await L.signAndPublish(w, 'Jul 13', 5)
  const pubAL2 = await L.publishAL(p, 5)
  const lw4 = await lw()
  parts.push(`C2 amendment published ${JSON.stringify(pubAL2)}; Leave War cell: ${lw4}`)
  if (!/HO/.test(lw4)) fail('C2: after the amendment the issued earned leave did not become HO: ' + lw4)
  pics.push(await L.pic(w, '77-4-after-c2-al'))
  L.row(77, 'phone 390x844', 'Admin (Saber)', verdict, parts.join(' || '), pics)
} catch (e) {
  console.log('ERR', e)
  pics.push(await L.pic(w, '77-err'))
  L.row(77, 'phone 390x844', 'Admin (Saber)', 'NOT RUN', 'script stopped: ' + String(e).slice(0, 500) + ' || ' + parts.join(' || '), pics)
}
await L.finish(w)
