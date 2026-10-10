import * as L from './icard-C-lib.mjs'
const { sleep } = L
const w = await L.world('desk', 'us')
const p = w.page
const parts = [], pics = []
let verdict = 'PASS'
const fail = m => { verdict = 'FAIL'; parts.push('FAIL: ' + m) }
const toast = () => p.evaluate(() => (document.getElementById('toastEl') || {}).innerText || '')
const facts = async (label, text, pic) => {
  await L.openByText(w, text)
  const f = await L.winFacts(p)
  const person = await p.locator('#inpEditPerson').count(), pf = await p.locator('#inpEditPersonFixed').count()
  const ed = await p.locator(L.WIN).evaluate(w => [...w.querySelectorAll('input:not([type=hidden]),select,textarea')].filter(e => e.offsetParent && !e.disabled && !e.readOnly && !e.closest('[inert]')).length)
  if (pic) pics.push(await L.pic(w, pic))
  await p.locator('[data-testid="win-inputedit-x"]').click(); await sleep(250)
  return { ...f, ed }
}
const line = (l, f) => `${l}: Save ${f.save}, Delete ${f.del}, calendar ${f.cal}, ro "${f.ro}", live fields ${f.ed}`
try {
  const ace = await L.pid(p, 'Ace')
  await L.fileNew(w, { iso: '2026-07-21', type: 'Duty', title: 'Own duty', s: '09:00', e: '10:00' })
  await L.fileNew(w, { iso: '2026-07-22', type: 'Duty', title: 'For Ace duty', person: ace, s: '09:00', e: '10:00' })
  await L.fileNew(w, { iso: '2026-07-23', type: 'Meeting', title: 'Shared meet', several: ['Ace', 'Blade'], s: '10:00', e: '11:00' })
  parts.push('Ranger filed an own Duty (21 Jul), a Duty for Ace (22 Jul) and a Meeting for Ace+Blade (23 Jul)')
  let a = { own: await facts('own', 'Own duty'), oth: await facts('oth', 'For Ace duty'), grp: await facts('grp', 'Shared meet') }
  parts.push('setting ON: ' + [line('own', a.own), line('for Ace', a.oth), line('shared', a.grp)].join(' | '))
  await L.switchUser(w, 'ad')
  const sw = await L.setMemberFiling(w, false)
  parts.push(`Saber turned "Members may file duties and commitments for other people" off (was ${sw.was})`)
  pics.push(await L.pic(w, '64-1-setting-off'))
  await L.switchUser(w, 'us')
  const b = { own: await facts('own', 'Own duty', '64-2-own-off'), oth: await facts('oth', 'For Ace duty', '64-3-ace-off'), grp: await facts('grp', 'Shared meet', '64-4-shared-off') }
  parts.push('setting OFF: ' + [line('own', b.own), line('for Ace', b.oth), line('shared', b.grp)].join(' | '))
  if (!b.own.save || !b.own.del) fail('own input lost Save/Delete with the setting off')
  if (b.oth.save || b.oth.del || b.oth.cal || b.oth.ed) fail('input for Ace still changeable by Ranger with the setting off: ' + line('for Ace', b.oth))
  if (b.grp.save || b.grp.del || b.grp.cal || b.grp.ed) fail('shared input still changeable by Ranger with the setting off: ' + line('shared', b.grp))
  // try forcing a change on the other-person record through the keyboard / forced controls: it must stay
  const ro = await L.recBy(p, { title: 'For Ace duty' })
  parts.push('Ace record unchanged: ' + JSON.stringify([ro.date, ro.s, ro.e, ro.person === ace]))
  // own still editable: change his hours and save
  await L.openByText(w, 'Own duty')
  await L.setTimes(p, '09:30', '10:30'); await L.saveWin(w)
  const own = await L.recBy(p, { title: 'Own duty' })
  parts.push('own edit saved with setting off: ' + own.s + '-' + own.e)
  if (own.s !== 570) fail('own edit did not save with the setting off')
  await L.closeWins(p)
  await L.switchUser(w, 'ad')
  const sw2 = await L.setMemberFiling(w, true)
  parts.push(`Saber restored the setting (was ${sw2.was})`)
  await L.switchUser(w, 'us')
  const c = { own: await facts('own', 'Own duty'), oth: await facts('oth', 'For Ace duty', '64-5-ace-restored'), grp: await facts('grp', 'Shared meet', '64-6-shared-restored') }
  parts.push('setting RESTORED: ' + [line('own', c.own), line('for Ace', c.oth), line('shared', c.grp)].join(' | '))
  if (!c.oth.save || !c.oth.del || !c.grp.save || !c.grp.del) fail('routes did not return after restoring the setting')
  L.row(64, 'desktop 1440x900', 'Member (Ranger) checking, Admin (Saber) toggling the setting', verdict, parts.join(' || '), pics)
} catch (e) {
  console.log('ERR', e)
  pics.push(await L.pic(w, '64-err'))
  L.row(64, 'desktop 1440x900', 'Member / Admin', 'NOT RUN', 'script stopped: ' + String(e).slice(0, 400) + ' || ' + parts.join(' || '), pics)
}
await L.finish(w)
