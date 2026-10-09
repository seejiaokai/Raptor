import * as L from './icard-C-lib.mjs'
const { sleep } = L
const parts = [], pics = []
let verdict = 'PASS'
const fail = m => { verdict = 'FAIL'; parts.push('FAIL: ' + m) }
const hs = h => h ? `tag ${h.tag}; chip "${h.pending}"; working selects [${h.signs.join('/')}]; mark "${h.nys}"; AL button "${h.alpub}"` : 'none'
let w, errs = []
const ll = r => r ? `${r.date}${r.endDate ? '>' + r.endDate : ''} "${r.remarks}"` : 'GONE'
async function setup(label) {
  w = await L.world('phone', 'us')
  const p = w.page
  const ranger = await L.pid(p, 'Ranger')
  await L.openNew(w, '2026-07-20')
  await p.selectOption('#inpEditType', 'LL')
  const line = await L.calTap(w, '2026-07-21')
  const sv = await L.saveWin(w); await L.closeWins(p)
  const rec = await L.recBy(p, { type: 'LL', date: 'Jul 20', person: ranger })
  parts.push(`${label}: Ranger filed LL Mon 20 - Tue 21 Jul (calendar line "${line}"), question ${sv.asked ? sv.head.slice(0, 80) : 'none'}; saved ${ll(rec)}`)
  await L.switchUser(w, 'ad')
  for (const di of [0, 1]) {
    const sp = await L.signAndPublish(w, 'Jul 20', di)
    parts.push(`${label}: Saber signed and pressed ${JSON.stringify(sp.pub)} on day ${di}: ${hs(sp.head)}`)
  }
  for (const di of [0, 1]) await L.signDay(w.page, di, 1) // working sign-offs after publishing
  const base = [await L.editDay(w, 'Jul 20', 0), await L.editDay(w, 'Jul 20', 1)]
  await L.signDay(p, 1, 1)
  const b0 = await L.editDay(w, 'Jul 20', 0)
  parts.push(`${label}: baseline Mon: ${hs(b0.head)}; Ranger text ${JSON.stringify((((b0.unav||'').split('## values: ')[1]||'').split(' | ').filter(x => /till/.test(x))))}`)
  pics.push(await L.pic(w, `75-${label}-1-baseline-mon`))
  const b1 = await L.editDay(w, 'Jul 20', 1)
  parts.push(`${label}: baseline Tue: ${hs(b1.head)}; Ranger text ${JSON.stringify((((b1.unav||'').split('## values: ')[1]||'').split(' | ').filter(x => /till/.test(x))))}`)
  await L.switchUser(w, 'us')
  return { rec, b0, b1 }
}
async function extend(rec) {
  const p = w.page
  await L.openFromList(w, rec.iid)
  const line = await L.calTap(w, '2026-07-20', '2026-07-22')
  const sv = await L.saveWin(w)
  return { line, sv, now: await L.recId(p, rec.iid) }
}
try {
  const { rec, b0, b1 } = await setup('W1')
  const e = await extend(rec)
  parts.push(`W1 Ranger opened the LL, tapped 20 then 22 Jul (line "${e.line}"), saved: ${ll(e.now)}; question ${e.sv.asked ? e.sv.head.slice(0, 80) : 'none'}`)
  if (!(e.now.date === 'Jul 20' && e.now.endDate === 'Jul 22')) fail('LL not extended to 22 Jul: ' + ll(e.now))
  if (!/till 22 Jul/.test(e.now.remarks || '')) parts.push('NOTE: remark after the change: "' + e.now.remarks + '"')
  await L.switchUser(w, 'ad')
  const d0 = await L.editDay(w, 'Jul 20', 0)
  pics.push(await L.pic(w, '75-W1-2-mon-after'))
  const d1 = await L.editDay(w, 'Jul 20', 1)
  pics.push(await L.pic(w, '75-W1-3-tue-after'))
  const d2 = await L.editDay(w, 'Jul 20', 2)
  pics.push(await L.pic(w, '75-W1-4-wed-after'))
  const i0 = await L.issuedDay(w, 'Jul 20', 0); i0.t = await L.dayTill(w.page, '#vWeek', 0); const i1 = await L.issuedDay(w, 'Jul 20', 1); i1.t = await L.dayTill(w.page, '#vWeek', 1)
  pics.push(await L.pic(w, '75-W1-5-issued-tue'))
  const mine = d => ((d.unav || '').split('## values: ')[1] || '').split(' | ').filter(x => /till|Ranger|Local|leave/i.test(x))
  parts.push(`W1 working Mon: ${hs(d0.head)}; Ranger rows ${JSON.stringify(mine(d0))} || working Tue: ${hs(d1.head)}; Ranger rows ${JSON.stringify(mine(d1))} || working Wed 22 (unpublished): chip "${d2.head.pending}"; Ranger rows ${JSON.stringify(mine(d2))} || ISSUED (View-only) Mon ${JSON.stringify(i0.t)} || ISSUED Tue ${JSON.stringify(i1.t)}`)
  for (const [n, d] of [['Mon', d0], ['Tue', d1]]) {
    if (!/pending/i.test(d.head.pending)) fail(`${n}: no pending chip (${d.head.pending})`)
    if (!d.head.signs.every(x => /name/i.test(x))) fail(`${n}: working sign-offs not cleared (${d.head.signs.join('/')})`)
    if (!/Publish AL/i.test(d.head.alpub)) fail(`${n}: no Publish AL button`)
    if (!mine(d).some(r => /22 Jul/.test(r))) fail(`${n}: working copy row lacks the new end wording till 22 Jul: ${JSON.stringify(mine(d))}`)
  }
  if (!mine(d2).length) fail('Wed 22 is not covered by the extended leave')
  for (const [n, d] of [['Mon', i0], ['Tue', i1]]) if (!(d.t && d.t.till.includes('till 21 Jul')) || (d.t && d.t.till.includes('till 22 Jul'))) fail(`${n}: issued face lost its issued words (till 21 Jul): ${JSON.stringify(d.t)}`)
  await w.browser.close(); errs.push(...w.errors)
  // W2: undo / redo
  const s2 = await setup('W2')
  const e2 = await extend(s2.rec)
  const p = w.page
  await L.closeWins(p)
  const u = await L.undo(w); const rU = await L.recId(p, s2.rec.iid)
  const r = await L.redo(w); const rR = await L.recId(p, s2.rec.iid)
  const u2 = await L.undo(w); const rU2 = await L.recId(p, s2.rec.iid)
  parts.push(`W2 extended to ${ll(e2.now)}; Undo ${u}: ${ll(rU)}; Redo ${r}: ${ll(rR)}; Undo again ${u2}: ${ll(rU2)}`)
  if (rU.endDate !== 'Jul 21' || rR.endDate !== 'Jul 22' || rU2.endDate !== 'Jul 21') fail('Undo/Redo did not restore the span')
  await L.switchUser(w, 'ad')
  const f0 = await L.editDay(w, 'Jul 20', 0)
  const f1 = await L.editDay(w, 'Jul 20', 1)
  const f2 = await L.editDay(w, 'Jul 20', 2)
  pics.push(await L.pic(w, '75-W2-6-wed-after-undo'))
  parts.push(`W2 after Undo: Mon ${hs(f0.head)}; Tue ${hs(f1.head)}; Wed Ranger text ${JSON.stringify((((f2.unav||'').split('## values: ')[1]||'').split(' | ').filter(x => /till/.test(x))))}`)
  for (const [n, d, b] of [['Mon', f0, s2.b0], ['Tue', f1, s2.b1]]) {
    if (/pending/i.test(d.head.pending) || d.head.alpub) fail(`${n}: pending/AL button remained after Undo`)
  }
  if (/till/.test(f2.unav || '')) fail('Wed 22 still carries the leave after Undo')
  errs.push(...w.errors)
  L.row(75, 'phone 390x844', 'Member (Ranger) edits; Admin (Saber) publishes/inspects', verdict, parts.join(' || '), pics)
} catch (e) {
  console.log('ERR', e)
  try { pics.push(await L.pic(w, '75-err')) } catch (x) {}
  L.row(75, 'phone 390x844', 'Ranger / Saber', 'NOT RUN', 'script stopped: ' + String(e).slice(0, 500) + ' || ' + parts.join(' || '), pics)
}
await L.finish(w, errs)
