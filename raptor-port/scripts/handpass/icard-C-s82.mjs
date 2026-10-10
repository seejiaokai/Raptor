import * as L from './icard-C-lib.mjs'
const { sleep } = L
const w = await L.world('desk', 'ad')
const p = w.page
const parts = [], pics = []
let verdict = 'PASS'
const fail = m => { verdict = 'FAIL'; parts.push('FAIL: ' + m) }
let names
const grp = async title => (await p.evaluate(t => window.INPUTS.filter(r => r.title === t).map(r => ({ iid: r.iid, person: r.person, by: r.by, grp: r.grp })), title)).map(r => `${names[r.person]} by ${names[r.by]} grp ${r.grp ? 'yes' : 'no'}`).join(' ; ') || 'NONE'
const listCards = async text => { await L.toList(w); const cf = await L.cardFacts(p, '#inList', 'inl'); return cf.filter(c => c.title === text) }
async function rowFor(text) {
  await L.toList(w)
  if (w.who === 'us') await L.showEveryone(w)
  const r = p.locator('#inBody tr').filter({ hasText: text })
  return { count: await r.count(), row: r.first() }
}
try {
  names = await p.evaluate(() => { const o = {}; for (const [k, v] of Object.entries(window.PEOPLE)) o[k] = v.cs; return o })
  await L.fileNew(w, { iso: '2026-07-21', type: 'Meeting', title: 'Pair one', several: ['Saber', 'Ranger'], s: '10:00', e: '11:00' })
  await L.fileNew(w, { iso: '2026-07-22', type: 'Meeting', title: 'Pair two', several: ['Saber', 'Ranger'], s: '10:00', e: '11:00' })
  parts.push('Saber filed two Meetings for himself and Ranger: Pair one: ' + await grp('Pair one') + ' | Pair two: ' + await grp('Pair two'))
  // Ranger takes himself out of Pair one
  await L.switchUser(w, 'us')
  await L.toList(w); await L.showEveryone(w)
  const rw = await rowFor('Pair one')
  await rw.row.locator('[data-testid="in-open"]').click(); await L.win(p).waitFor(); await sleep(300)
  await p.locator('[data-testid="inped-takeout"]').click(); await sleep(500)
  const yes = p.getByRole('button', { name: /^Take me out/ }).last()
  pics.push(await L.pic(w, '82-1-ranger-takes-himself-out'))
  const stay = p.getByRole('button', { name: /Stay in/ })
  if (await p.locator('[data-testid="inped-takeout-yes"]').count()) await p.locator('[data-testid="inped-takeout-yes"]').click()
  else await yes.click()
  await sleep(600)
  parts.push('Ranger took himself out of Pair one: ' + await grp('Pair one'))
  await L.closeWins(p)
  // Saber removes himself from Pair two
  await L.switchUser(w, 'ad')
  await L.openByText(w, 'Pair two')
  const sp = p.locator(`${L.WIN} [data-pp="${await L.pid(p, 'Saber')}"]`)
  await sp.scrollIntoViewIfNeeded(); await sp.click(); await sleep(250)
  pics.push(await L.pic(w, '82-2-saber-unticks-himself'))
  const sv = await L.saveWin(w)
  parts.push(`Saber unticked himself in Pair two and saved (question ${sv.asked ? sv.head.slice(0, 100) : 'none'}): ` + await grp('Pair two'))
  await L.closeWins(p)
  // inspect Pair one as Saber: survivor Saber alone, filer Saber
  const one = await grp('Pair one')
  if (!/^Saber by Saber/.test(one)) fail('Pair one survivor wrong: ' + one)
  let rows = await rowFor('Pair one')
  parts.push(`Pair one in the table: ${rows.count} row(s)`)
  if (rows.count !== 1) fail('Pair one does not count once in the table: ' + rows.count)
  await rows.row.locator('[data-testid="in-open"]').click(); await L.win(p).waitFor(); await sleep(300)
  let f = await L.winFacts(p)
  let sev = await p.locator('[data-testid="pp-several"]').getAttribute('aria-pressed').catch(() => null)
  parts.push(`Pair one (Saber alone) opened by Saber: Save ${f.save}, Delete ${f.del}, calendar ${f.cal}; Person ${(await p.locator('#inpEditPerson').count()) ? 'a one-person list' : 'no one-person list'}; Several people switch pressed ${sev}; title "${f.ttl}"`)
  pics.push(await L.pic(w, '82-3-pair-one-window'))
  if (!f.save || !f.del || !f.cal) fail('Pair one: the surviving filer lacks Save/Delete/calendar')
  if (!(await p.locator('#inpEditPerson').count())) fail('Pair one: the editor does not offer the one-person route (no Person list)')
  await L.closeWins(p)
  // Pair two as Saber (admin) and as Ranger
  const two = await grp('Pair two')
  if (!/^Ranger by Saber/.test(two)) fail('Pair two survivor wrong: ' + two)
  rows = await rowFor('Pair two')
  parts.push(`Pair two in the table: ${rows.count} row(s)`)
  if (rows.count !== 1) fail('Pair two does not count once: ' + rows.count)
  await rows.row.locator('[data-testid="in-open"]').click(); await L.win(p).waitFor(); await sleep(300)
  f = await L.winFacts(p)
  parts.push(`Pair two (Ranger alone, filed by Saber) opened by Saber: Save ${f.save}, Delete ${f.del}, placed "${f.placed}"; Person list ${await p.locator('#inpEditPerson').count()}`)
  await L.closeWins(p)
  await L.switchUser(w, 'us')
  rows = await rowFor('Pair two')
  await rows.row.locator('[data-testid="in-open"]').click(); await L.win(p).waitFor(); await sleep(300)
  f = await L.winFacts(p)
  parts.push(`Pair two opened by Ranger (the one left): Save ${f.save}, Delete ${f.del}, calendar ${f.cal}, ro "${f.ro}", placed "${f.placed}"`)
  pics.push(await L.pic(w, '82-4-pair-two-ranger-window'))
  parts.push('(Ranger is the one person in Pair two, so as for any input of his own he may change it; the filer stays Saber)')
  if (!/Placed by Saber/.test(f.placed)) fail('Pair two: the filer is no longer Saber: ' + f.placed)
  await L.closeWins(p)
  // By lines on the cards: phone-like card facts via the opened day
  await L.openDay(w, '2026-07-22')
  const cf = await L.cardFacts(p, L.DAYWIN, 'idy')
  const c2 = cf.find(c => c.title === 'Pair two')
  parts.push(`opened-day card of Pair two (Ranger viewing): who "${c2 && c2.who}", by "${c2 && c2.by}"`)
  pics.push(await L.pic(w, '82-5-day-card-pair-two'))
  if (!c2 || c2.by !== 'By Saber') fail('Pair two card does not say By Saber: ' + JSON.stringify(c2))
  await L.closeWins(p)
  await L.openDay(w, '2026-07-21')
  const c1 = (await L.cardFacts(p, L.DAYWIN, 'idy')).find(c => c.title === 'Pair one')
  parts.push(`opened-day card of Pair one (Ranger viewing, Saber alone): who "${c1 && c1.who}", by "${c1 && c1.by}"`)
  await L.closeWins(p)
  // undo of Ranger's own takeout is gone with the switch: undo the last thing for Ranger (none)
  L.row(82, 'desktop 1440x900', 'Admin (Saber), then Member (Ranger)', verdict, parts.join(' || '), pics)
} catch (e) {
  console.log('ERR', e)
  pics.push(await L.pic(w, '82-err'))
  L.row(82, 'desktop 1440x900', 'Admin / Member', 'NOT RUN', 'script stopped: ' + String(e).slice(0, 500) + ' || ' + parts.join(' || '), pics)
}
await L.finish(w)
