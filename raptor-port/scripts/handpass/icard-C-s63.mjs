import * as L from './icard-C-lib.mjs'
const { sleep } = L
const w = await L.world('phone', 'us')
const p = w.page
const parts = [], pics = []
let verdict = 'PASS'
const fail = m => { verdict = 'FAIL'; parts.push('FAIL: ' + m) }
let names
const grp = async () => { const rs = await p.evaluate(() => window.INPUTS.filter(r => r.type === 'Meeting' && r.title === 'Crew sync' ).map(r => ({ iid: r.iid, person: r.person, date: r.date, endDate: r.endDate, s: r.s, e: r.e, remarks: r.remarks, by: r.by, grp: r.grp }))); return rs }
const show = async () => { const rs = await grp(); return rs.map(r => `${names[r.person]} ${r.date}${r.endDate ? '>' + r.endDate : ''} ${r.s}-${r.e} "${r.remarks}" by ${names[r.by]}`).join(' ; ') || 'NONE' }
try {
  names = await p.evaluate(() => { const o = {}; for (const [k, v] of Object.entries(window.PEOPLE)) o[k] = v.cs; return o })
  await L.fileNew(w, { iso: '2026-07-21', type: 'Meeting', title: 'Crew sync', several: ['Ranger', 'Ace', 'Blade'], s: '10:00', e: '11:00' })
  parts.push('Ranger filed Meeting "Crew sync" Tue 21 Jul 10:00-11:00 for Ranger, Ace, Blade: ' + await show())
  await L.openByText(w, 'Crew sync')
  let f = await L.winFacts(p)
  parts.push(`opened by the filer: Save ${f.save}, Delete ${f.del}, calendar ${f.cal}, read-only line "${f.ro}", title "${f.ttl}"`)
  if (!f.save || !f.del) fail('filer cannot manage his own shared entry')
  // remove Ranger
  const rp = p.locator(`${L.WIN} [data-pp="${await L.pid(p, 'Ranger')}"]`)
  await rp.scrollIntoViewIfNeeded(); await rp.tap(); await sleep(250)
  pics.push(await L.pic(w, '63-1-ranger-unticked'))
  let s = await L.saveWin(w)
  parts.push(`unticked Ranger and saved; question ${s.asked ? s.head.slice(0, 120) : 'none'}: ${await show()}`)
  let rs = await grp()
  if (rs.length !== 2 || rs.some(r => names[r.person] === 'Ranger')) fail('Ranger not removed: ' + await show())
  if (!rs.every(r => names[r.by] === 'Ranger')) fail('filer changed')
  await L.closeWins(p)
  // see it as Ranger: Everyone filter
  await L.toList(w); await L.showEveryone(w)
  const card = p.locator('#inList [data-testid^="inl-row-"]').filter({ hasText: 'Crew sync' }).first()
  await card.scrollIntoViewIfNeeded()
  const cf = await L.cardFacts(p, '#inList', 'inl')
  const mine = cf.find(c => c.title === 'Crew sync')
  parts.push(`card now: who "${mine && mine.who}" kind "${mine && mine.kind}" by "${mine && mine.by}"`)
  pics.push(await L.pic(w, '63-2-card-by-ranger'))
  if (!mine || mine.by !== 'By Ranger') fail('card does not say By Ranger: ' + JSON.stringify(mine))
  // edit the remaining group's dates, remarks and hours
  await L.openByText(w, 'Crew sync')
  f = await L.winFacts(p)
  parts.push(`reopened (Ranger not in it): Save ${f.save}, Delete ${f.del}, calendar ${f.cal}, ro "${f.ro}"`)
  if (!f.save || !f.del || !f.cal) fail('filer who is no longer in it cannot manage it (Save/Delete/calendar)')
  await L.setTimes(p, '13:00', '14:30'); await p.fill('#inpEditRmk', 'moved to the afternoon')
  const line = await L.calTap(w, '2026-07-22')
  const before = await show()
  s = await L.saveWin(w)
  const after = await show()
  parts.push(`edited hours/remark/date (tap 22 Jul, line "${line}"): ${after}`)
  rs = await grp()
  if (!(rs.length === 2 && rs.every(r => r.date === 'Jul 22' && r.s === 780 && r.e === 870 && r.remarks === 'moved to the afternoon'))) fail('the whole group was not edited: ' + after)
  pics.push(await L.pic(w, '63-3-after-edit'))
  await L.closeWins(p)
  const u = await L.undo(w); const aU = await show()
  parts.push(`ONE Undo (${u}): ${aU}`)
  if (aU !== before) fail('one Undo did not reverse the whole edit: ' + aU + ' vs ' + before)
  const rd = await L.redo(w); const aR = await show()
  parts.push(`Redo (${rd}): ${aR}`)
  if (aR !== after) fail('Redo did not restore the whole edit')
  // delete with confirmation
  await L.openByText(w, 'Crew sync')
  await p.locator('#inpEditDel').scrollIntoViewIfNeeded(); await p.locator('#inpEditDel').tap(); await sleep(500)
  const ask = await p.locator('[data-testid="inped-delall"]').innerText().catch(() => '(no confirmation)')
  pics.push(await L.pic(w, '63-4-delete-question'))
  parts.push(`Delete asks: "${ask.replace(/\s+/g, ' ')}"; still ${(await grp()).length} rows before confirming`)
  if (!/people|everyone|all/i.test(ask)) fail('no group delete confirmation')
  const yes = p.locator('[data-testid="inped-delall-yes"]')
  if (await yes.count()) { await yes.tap(); await sleep(500) } else fail('no confirm button')
  const gone = (await grp()).length
  parts.push(`confirmed: rows left ${gone}`)
  if (gone) fail('delete did not remove the group')
  await L.closeWins(p)
  const u2 = await L.undo(w); const n2 = (await grp()).length
  parts.push(`ONE Undo of the delete (${u2}): rows ${n2}`)
  if (n2 !== 2) fail('one Undo did not bring both back')
  L.row(63, 'phone 390x844', 'Member (Ranger) as filer', verdict, parts.join(' || '), pics)
} catch (e) {
  console.log('ERR', e)
  pics.push(await L.pic(w, '63-err'))
  L.row(63, 'phone 390x844', 'Member (Ranger)', 'NOT RUN', 'script stopped: ' + String(e).slice(0, 400) + ' || ' + parts.join(' || '), pics)
}
await L.finish(w)
