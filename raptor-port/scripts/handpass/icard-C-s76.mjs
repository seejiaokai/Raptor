import * as L from './icard-C-lib.mjs'
const { sleep } = L
const parts = [], pics = []
let verdict = 'PASS'
const fail = m => { verdict = 'FAIL'; parts.push('FAIL: ' + m) }
const hs = h => h ? `chip "${h.pending}"; working selects [${h.signs.join('/')}]; mark "${h.nys}"; AL button "${h.alpub}"; issued line "${h.signed}"` : 'none'
let w, errs = []
const acc = (p, iid) => p.evaluate(iid => { const r = window.INPUTS.find(x => x.iid === iid); return r ? JSON.stringify(r.acc) : 'GONE' }, iid)
async function setup(label) {
  w = await L.world('desk', 'ad')
  const p = w.page
  await L.fileNew(w, { iso: '2026-07-20', type: 'Duty', title: 'Taken off duty', s: '13:00', e: '15:00' })
  const rec = await L.recBy(p, { type: 'Duty', date: 'Jul 20' })
  await L.weekTo(w, 'editsched', 'Jul 20')
  await L.openBoard(w, 0)
  const row = p.locator('#schedBoard .sb-arow.gr-frominput').filter({ has: p.locator('textarea', { hasText: 'Taken off duty' }) }).first()
  await row.locator('button').last().click(); await sleep(700)
  await L.closeBoard(p)
  parts.push(`${label}: Saber filed a Duty Mon 20 Jul 13:00-15:00 "Taken off duty", took it off the programme with the ground row's ✕ (the request's accept state is now ${await acc(p, rec.iid)})`)
  const sp = await L.signAndPublish(w, 'Jul 20', 0)
  parts.push(`${label}: signed and pressed ${JSON.stringify(sp.pub)} while it was off: ${hs(sp.head)}`)
  await L.signDay(p, 0, 1)
  const base = await L.editDay(w, 'Jul 20', 0)
  parts.push(`${label}: baseline Mon after publishing and signing the working boxes again: ${hs(base.head)}; Taken off duty on the face: ${base.rows.some(r => /TAKEN OFF DUTY/i.test(r))}`)
  pics.push(await L.pic(w, `76-${label}-1-baseline`))
  return { rec, base }
}
try {
  // W1: move it elsewhere
  const { rec, base } = await setup('W1')
  const p = w.page
  await L.openFromList(w, rec.iid)
  const line = await L.calTap(w, '2026-07-21')
  const s = await L.saveWin(w)
  const now = await L.recId(p, rec.iid)
  parts.push(`W1 moved it from the List window to Tue 21 Jul (line "${line}"): saved ${now.date}; question ${s.asked ? s.head.slice(0, 60) : 'none'}; accept state ${await acc(p, rec.iid)}`)
  await L.closeWins(p)
  const d0 = await L.editDay(w, 'Jul 20', 0)
  pics.push(await L.pic(w, '76-W1-2-mon-after-move'))
  parts.push(`W1 Mon after the move: ${hs(d0.head)}`)
  if (/pending/i.test(d0.head.pending) || d0.head.alpub) fail('moving the taken-off request raised a pending change / AL button on the original day: ' + hs(d0.head))
  if (d0.head.signs.join('/') !== base.head.signs.join('/') || d0.head.nys) fail('the working sign-offs were lost on the original day after the move: ' + hs(d0.head))
  const u = await L.undo(w); const rU = await L.recId(p, rec.iid)
  const rd = await L.redo(w); const rR = await L.recId(p, rec.iid)
  parts.push(`W1 Undo ${u}: ${rU.date}; Redo ${rd}: ${rR.date}`)
  if (rU.date !== 'Jul 20' || rR.date !== 'Jul 21') fail('Undo/Redo of the move wrong')
  await w.browser.close(); errs.push(...w.errors)
  // W2: delete it
  const s2 = await setup('W2')
  const p2 = w.page
  await L.openFromList(w, s2.rec.iid)
  await p2.locator('#inpEditDel').click(); await sleep(600)
  const gone = !(await L.recId(p2, s2.rec.iid))
  await L.closeWins(p2)
  const e0 = await L.editDay(w, 'Jul 20', 0)
  pics.push(await L.pic(w, '76-W2-2-mon-after-delete'))
  parts.push(`W2 deleted it from its window: gone ${gone}; Mon: ${hs(e0.head)}`)
  if (!gone) fail('delete did not remove the input')
  if (/pending/i.test(e0.head.pending) || e0.head.alpub) fail('deleting the taken-off request raised a pending change / AL button: ' + hs(e0.head))
  if (e0.head.signs.join('/') !== s2.base.head.signs.join('/') || e0.head.nys) fail('working sign-offs lost after the delete: ' + hs(e0.head))
  const u2 = await L.undo(w); const back = await L.recId(p2, s2.rec.iid)
  const rd2 = await L.redo(w); const gone2 = !(await L.recId(p2, s2.rec.iid))
  parts.push(`W2 Undo ${u2}: back ${!!back}; Redo ${rd2}: gone ${gone2}`)
  if (!back || !gone2) fail('Undo/Redo of the delete wrong')
  errs.push(...w.errors)
  L.row(76, 'desktop 1440x900', 'Admin (Saber)', verdict, parts.join(' || '), pics)
} catch (e) {
  console.log('ERR', e)
  try { pics.push(await L.pic(w, '76-err')) } catch (x) {}
  L.row(76, 'desktop 1440x900', 'Admin (Saber)', 'NOT RUN', 'script stopped: ' + String(e).slice(0, 500) + ' || ' + parts.join(' || '), pics)
}
await L.finish(w, errs)
