import * as L from './icard-C-lib.mjs'
const { sleep } = L
const w = await L.world('desk', 'us')
const p = w.page
const parts = [], pics = []
let verdict = 'PASS'
const fail = m => { verdict = 'FAIL'; parts.push('FAIL: ' + m) }
const fmt = r => r ? `${r.type} "${r.title}" ${r.date}${r.endDate ? '>' + r.endDate : ''} ${r.s}-${r.e} person ${r.person} oil ${JSON.stringify(r.oil)} by ${r.by}` : 'GONE'
const toast = () => p.evaluate(() => (document.getElementById('toastEl') || {}).innerText || '')
try {
  const ace = await L.pid(p, 'Ace'), ranger = await L.pid(p, 'Ranger')
  await L.fileNew(w, { iso: '2026-07-18', type: 'Duty', person: ace, s: '09:00', e: '11:00', oil: 'yes' })
  const rec = await L.recBy(p, { type: 'Duty', date: 'Jul 18', person: ace })
  parts.push('Ranger (members-may-file setting at its default, on) filed a Sat 18 Jul Duty for Ace 09:00-11:00 and answered OIL Yes: ' + fmt(rec))
  await L.toList(w); await L.showEveryone(w)
  await p.locator(`#inBody tr[data-iid="${rec.iid}"] [data-testid="in-open"]`).click(); await L.win(p).waitFor(); await sleep(300)
  const f = await L.winFacts(p)
  const typeOpts = await p.locator('#inpEditType option').allInnerTexts()
  const personSel = await p.locator('#inpEditPerson').count()
  parts.push(`opened: Save ${f.save}, Delete ${f.del}, calendar ${f.cal}; Person list ${personSel ? 'selectable' : 'fixed text'}; Type offers ${typeOpts.join('/')}`)
  if (!f.save || !f.del || !f.cal) fail('filer-for-other lacks Save/Delete/calendar')
  pics.push(await L.pic(w, '62-1-window'))
  // permitted edits
  await p.fill('#inpEditOwnTitle', 'Range duty')
  await L.setTimes(p, '10:00', '12:00')
  const line = await L.calTap(w, '2026-07-19')
  let s = await L.saveWin(w)
  let r1 = await L.recId(p, rec.iid)
  parts.push(`title + hours + date (tap Sun 19 Jul, line "${line}"): OIL question ${s.asked ? s.head.slice(0, 120) : 'none'}; saved ${fmt(r1)}`)
  if (s.asked) { /* answer it yes */ await L.answerOil(w, 'yes'); r1 = await L.recId(p, rec.iid); parts.push('answered OIL Yes: ' + fmt(r1)) }
  if (!(r1.title === 'Range duty' && r1.s === 600 && r1.e === 720 && r1.date === 'Jul 19' && r1.person === ace)) fail('permitted edit not saved right: ' + fmt(r1))
  pics.push(await L.pic(w, '62-2-edited'))
  // OIL answer change
  await L.openFromList(w, rec.iid)
  const rev = p.locator('[data-testid="oil-revise"]')
  if (await rev.count()) {
    await rev.click(); await sleep(400)
    const q = await L.oilText(p)
    await L.answerOil(w, 'no'); await sleep(400)
    const r2 = await L.recId(p, rec.iid)
    parts.push(`OIL Change… opened (${(q || '').slice(0, 60)}...) -> No: oil ${JSON.stringify(r2.oil)}`)
    if (Object.values(r2.oil || {}).some(v => v > 0)) fail('OIL answer not changed')
  } else { parts.push('no OIL Change… in window (oil ' + JSON.stringify(r1.oil) + ')'); fail('no OIL change route') }
  // forbidden: retype to LL / ATT C
  for (const kind of ['LL', 'ATT C']) {
    if (!(await L.win(p).count())) await L.openFromList(w, rec.iid)
    const offered = (await p.locator('#inpEditType option').allInnerTexts()).includes(kind)
    if (!offered) { parts.push(`retype to ${kind}: not offered in the Type list`); continue }
    const before = await L.recId(p, rec.iid)
    await p.selectOption('#inpEditType', kind)
    const s2 = await L.saveWin(w)
    const msg = await toast()
    const winOpen = await L.win(p).count()
    const after = await L.recId(p, rec.iid)
    parts.push(`retype to ${kind}: offered; Save -> question ${s2.asked ? s2.head.slice(0, 80) : 'none'}; toast "${msg}"; window still open ${winOpen}; record ${fmt(after)}`)
    pics.push(await L.pic(w, `62-3-retype-${kind.replace(' ', '')}`))
    if (after.type !== before.type || after.person !== ace) fail(`retype to ${kind} was accepted: ` + fmt(after))
    await L.closeWins(p)
  }
  // forbidden: another person
  await L.openFromList(w, rec.iid)
  const anvil = await L.pid(p, 'Anvil')
  if (await p.locator('#inpEditPerson').count()) {
    await p.selectOption('#inpEditPerson', anvil)
    const s3 = await L.saveWin(w)
    const msg = await toast()
    const after = await L.recId(p, rec.iid)
    parts.push(`move to another person (Anvil): Save -> toast "${msg}"; record ${fmt(after)}`)
    pics.push(await L.pic(w, '62-4-move-person'))
    if (after.person !== ace) parts.push('NOTE: person changed to ' + after.person + ' (ranger is ' + ranger + ', ace ' + ace + ')')
    if (after.person === ranger) fail('Ace was replaced by Ranger')
    if (after.person !== ace && after.person !== anvil) fail('person replaced by someone else')
    if (after.person === anvil) fail('a member moved the input to another person')
  } else parts.push('move to another person: the Person control is fixed text, nothing to select')
  await L.closeWins(p)
  // delete and undo
  await L.openFromList(w, rec.iid)
  await p.locator('#inpEditDel').click(); await sleep(500)
  const gone = !(await L.recId(p, rec.iid))
  await L.closeWins(p)
  const u = await L.undo(w); const back = await L.recId(p, rec.iid)
  const rd = await L.redo(w); const gone2 = !(await L.recId(p, rec.iid))
  parts.push(`Delete: gone ${gone}; Undo ${u}: ${fmt(back)}; Redo ${rd}: gone ${gone2}`)
  if (!gone || !back || !gone2) fail('delete/undo/redo')
  L.row(62, 'desktop 1440x900', 'Member (Ranger) who filed for Ace', verdict, parts.join(' || '), pics)
} catch (e) {
  console.log('ERR', e)
  pics.push(await L.pic(w, '62-err'))
  L.row(62, 'desktop 1440x900', 'Member (Ranger)', 'NOT RUN', 'script stopped: ' + String(e).slice(0, 400) + ' || ' + parts.join(' || '), pics)
}
await L.finish(w)
