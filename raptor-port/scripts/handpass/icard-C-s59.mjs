import * as L from './icard-C-lib.mjs'
const { sleep } = L
const w = await L.world('phone', 'us')
const p = w.page
const parts = [], pics = []
let verdict = 'PASS'
const fail = m => { verdict = 'FAIL'; parts.push('FAIL: ' + m) }
const R = async iid => L.recId(p, iid)
const fmt = r => r ? `${r.type} "${r.title}" rmk "${r.remarks}" ${r.date}${r.endDate ? '>' + r.endDate : ''} ${r.s}-${r.e} person ${r.person}` : 'GONE'
try {
  const ranger = await L.pid(p, 'Ranger')
  await L.fileNew(w, { iso: '2026-07-21', type: 'Duty', s: '09:00', e: '10:00' })
  const rec = await L.recBy(p, { type: 'Duty', date: 'Jul 21', person: ranger })
  parts.push('Ranger filed a Duty Tue 21 Jul 09:00-10:00 for himself: ' + fmt(rec))
  await L.openFromList(w, rec.iid)
  const f0 = await L.winFacts(p)
  const fixed = await p.locator('#inpEditPersonFixed').count(), sel = await p.locator('#inpEditPerson').count()
  parts.push(`window: Save ${f0.save}, Delete ${f0.del}, calendar ${f0.cal}; Person control: fixed text ${fixed}, selectable list ${sel}, several-people switch ${await p.locator('[data-testid="pp-several"]').count()}`)
  if (!f0.save || !f0.del || !f0.cal) fail('own window lacks Save/Delete/calendar')
  if (sel) fail('Person is a selectable list for a member')
  pics.push(await L.pic(w, '59-1-own-window'))
  await p.selectOption('#inpEditType', 'Meeting')
  await p.fill('#inpEditOwnTitle', 'Planning'); await p.fill('#inpEditRmk', 'room two')
  await L.setTimes(p, '10:00', '11:30')
  const line = await L.calTap(w, '2026-07-23')
  pics.push(await L.pic(w, '59-2-fields-changed'))
  const s = await L.saveWin(w)
  const r1 = await R(rec.iid)
  parts.push(`changed kind/title/remark/hours/date, calendar line "${line}"; Save asked ${s.asked ? s.head.slice(0, 80) : 'nothing'}; saved: ${fmt(r1)}`)
  if (!(r1.type === 'Meeting' && r1.title === 'Planning' && r1.remarks === 'room two' && r1.s === 600 && r1.e === 690 && r1.date === 'Jul 23' && r1.person === ranger)) fail('the own Duty edit was not saved whole: ' + fmt(r1))
  // undo / redo of the main save
  await L.closeWins(p)
  const u = await L.undo(w); const rU = await R(rec.iid)
  const rd = await L.redo(w); const rR = await R(rec.iid)
  parts.push(`Undo ${u}: ${fmt(rU)}; Redo ${rd}: ${fmt(rR)}`)
  if (rU.type !== 'Duty' || rU.date !== 'Jul 21') fail('Undo did not restore the Duty on 21 Jul')
  if (rR.type !== 'Meeting' || rR.date !== 'Jul 23') fail('Redo did not bring the edit back')
  // delete and Undo
  await L.openFromList(w, rec.iid)
  await p.locator('#inpEditDel').scrollIntoViewIfNeeded(); await p.locator('#inpEditDel').tap(); await sleep(500)
  const gone = !(await R(rec.iid))
  await L.closeWins(p)
  const u2 = await L.undo(w); const back = await R(rec.iid)
  parts.push(`Delete: record gone ${gone}; Undo ${u2}: ${fmt(back)}`)
  pics.push(await L.pic(w, '59-3-after-delete-undo'))
  if (!gone || !back) fail('delete / undo did not work')
  const rd2 = await L.redo(w); const gone2 = !(await R(rec.iid))
  parts.push(`Redo ${rd2}: gone ${gone2}`)
  if (!gone2) fail('Redo did not delete again')
  await L.undo(w)
  // own LL, date route
  await L.fileNew(w, { iso: '2026-07-27', type: 'LL', allday: true })
  const ll = await L.recBy(p, { type: 'LL', date: 'Jul 27', person: ranger })
  await L.openFromList(w, ll.iid)
  const l1 = await L.calTap(w, '2026-07-28')
  const sv = await L.saveWin(w)
  const ll2 = await R(ll.iid)
  parts.push(`own LL ${fmt(ll)} -> tapped 28 Jul (line "${l1}"); question ${sv.asked ? sv.head.slice(0, 100) : 'none'}; saved ${fmt(ll2)}`)
  if (!ll2 || ll2.date !== 'Jul 28' || ll2.person !== ranger) fail('own LL date move failed: ' + fmt(ll2))
  pics.push(await L.pic(w, '59-4-ll-moved'))
  await L.closeWins(p)
  // own medical paperwork
  await L.fileNew(w, { iso: '2026-07-30', type: 'ATT C', doc: L.SAMPLE })
  const att = await L.recBy(p, { type: 'ATT C', date: 'Jul 30', person: ranger })
  if (!att) { fail('could not file own ATT C') } else {
    await L.openFromList(w, att.iid)
    const f2 = await L.winFacts(p)
    const l2 = await L.calTap(w, '2026-07-31')
    pics.push(await L.pic(w, '59-5-attc-window'))
    const sv2 = await L.saveWin(w)
    const att2 = await R(att.iid)
    parts.push(`own ATT C ${fmt(att)}: window Save ${f2.save} Delete ${f2.del} calendar ${f2.cal} paperclip ${f2.docview}; tapped 31 Jul (line "${l2}"); question ${sv2.asked ? sv2.head.slice(0, 160) : 'none'}; saved ${fmt(att2)} doc ${att2 && att2.docId ? 'kept' : 'GONE'}`)
    if (!f2.save || !f2.del || !f2.cal || !f2.docview) fail('own medical window lacks Save/Delete/calendar/paperclip')
    if (!att2 || att2.date !== 'Jul 31') fail('own ATT C date move failed: ' + fmt(att2))
    pics.push(await L.pic(w, '59-6-attc-moved'))
  }
  L.row(59, 'phone 390x844', 'Member (Ranger)', verdict, parts.join(' || '), pics)
} catch (e) {
  console.log('ERR', e)
  pics.push(await L.pic(w, '59-err'))
  L.row(59, 'phone 390x844', 'Member (Ranger)', 'NOT RUN', 'script stopped: ' + String(e).slice(0, 400) + ' || ' + parts.join(' || '), pics)
}
await L.finish(w)
