// #58 Saved changes survive reopening and reload - Saber (admin), desktop 1440x900, a world that persists (no ?fresh)
import * as L from './icard-B-lib.mjs'
const browser = await L.launch()
const T = false
const { ctx, page: p } = await L.open(browser, { width: 1440, height: 900 }, 'ad', 'a', false, false)
await L.watchToasts(p)
const sab = await L.csId(p, 'Saber')
const span = r => r ? `${r.date}${r.endDate ? '→' + r.endDate : ''}` : 'none'
const state = () => p.evaluate(() => {
  const mine = window.INPUTS.filter(r => /^(P58|Persist)/.test(r.title || '') || /^P58/.test(r.remarks || ''))
  return mine.map(r => ({ cs: window.PEOPLE[r.person].cs, type: r.type, title: r.title, remarks: r.remarks, date: r.date, endDate: r.endDate, s: r.s, e: r.e, docs: (r.docIds || (r.docId ? [r.docId] : [])).length })).sort((a, b) => (a.title + a.cs).localeCompare(b.title + b.cs))
})
const say = a => a.map(x => `${x.cs}|${x.type}|${x.title}|${x.remarks}|${x.date}${x.endDate ? '→' + x.endDate : ''}|${x.s}-${x.e}|docs ${x.docs}`).join(' ;; ')
await L.scn(58, '1440x900', 'Saber (admin)', async () => {
  const notes = [], pics = []
  // ordinary edit + date move
  await L.fileInput(p, T, { iso: '2026-07-20', type: 'Duty', who: sab, from: '09:00', to: '10:00', title: 'Persist one', rmk: 'P58 first' })
  let d = await L.rec(p, { type: 'Duty', title: 'Persist one' })
  await L.openFromList(p, T, d.iid)
  await p.fill('#inpEditOwnTitle', 'Persist one edited'); await p.fill('#inpEditRmk', 'P58 second'); await L.setTimes(p, '11:00', '12:30')
  await L.tapDate(p, T, '2026-07-22')
  await L.saveWin(p, T, 'no')
  // shared edit
  await L.fileInput(p, T, { iso: '2026-07-21', type: 'Meeting', several: ['Ace', 'Blade', 'Cinch'], from: '10:00', to: '11:00', title: 'Persist trio', rmk: 'P58 trio' })
  await L.toList(p, T)
  await p.locator('#inBody tr').filter({ hasText: 'Persist trio' }).first().locator('[data-testid="in-open"]').click(); await p.locator(L.WIN).waitFor()
  await p.fill('#inpEditOwnTitle', 'Persist trio edited'); await L.setTimes(p, '14:00', '15:00')
  await L.saveWin(p, T, 'no')
  // document addition
  await L.fileInput(p, T, { iso: '2026-07-24', type: 'ATT C', who: sab, doc: L.DOC, rmk: 'P58 med' })
  const med = await L.rec(p, { type: 'ATT C', person: sab })
  await L.openFromList(p, T, med.iid); await L.attachDoc(p, L.DOC2); await L.saveWin(p, T)
  // a deleted entry must stay deleted
  await L.fileInput(p, T, { iso: '2026-07-23', type: 'Duty', who: sab, from: '09:00', to: '10:00', title: 'Persist del', rmk: 'P58 del' })
  const del = await L.rec(p, { type: 'Duty', title: 'Persist del' })
  await L.openFromList(p, T, del.iid); await p.locator('#inpEditDel').click(); await p.waitForTimeout(500)
  const before = await state()
  notes.push('before Undo/Redo: ' + say(before))
  await L.undo(p); const u = await state(); await L.redo(p); const r = await state()
  notes.push(`Undo brought back "Persist del": ${u.some(x => x.title === 'Persist del')}; Redo -> state same as before: ${say(r) === say(before)}`)
  // reload and sign in again
  await L.closeAll(p)
  await p.reload(); await L.signIn(p, 'ad', 'a')
  await L.watchToasts(p)
  const after = await state()
  notes.push('after reload: ' + say(after))
  await L.toList(p, T)   // All dates
  const rowsAfter = {}
  for (const t of ['Persist one edited', 'Persist trio edited', 'Persist del']) rowsAfter[t] = await p.locator('#inBody tr').filter({ hasText: t }).count()
  const medRow = await p.locator('#inBody tr').filter({ hasText: 'P58 med' }).locator('.rclip').count()
  notes.push(`list rows after reload (All dates): ${JSON.stringify(rowsAfter)}; the medical row has a paperclip: ${medRow}`)
  pics.push(await L.shot(p, 'B58-1-list-after-reload'))
  // the document viewer after reload shows both documents
  const medAfter = await L.rec(p, { type: 'ATT C', person: sab })
  await L.openFromList(p, T, medAfter.iid)
  const chips = await p.locator(`${L.WIN} .docchip`).count()
  await p.locator(`${L.WIN} [data-testid="inped-docview"]`).click(); await p.locator('#docViewPop:not([hidden])').waitFor({ timeout: 3000 })
  const counter = (await p.locator('#docViewPop').innerText()).replace(/\s+/g, ' ').match(/\d+ of \d+/)
  pics.push(await L.shot(p, 'B58-2-documents-after-reload'))
  notes.push(`medical window after reload: ${chips} document chip(s); viewer counter ${counter ? counter[0] : 'none'}`)
  const ok = say(after) === say(before) && rowsAfter['Persist one edited'] === 1 && rowsAfter['Persist trio edited'] === 1 && rowsAfter['Persist del'] === 0 && chips === 2 && counter && /of 2/.test(counter[0]) && u.some(x => x.title === 'Persist del') && say(r) === say(before)
    && after.filter(x => x.title === 'Persist trio edited').length === 3 && after.some(x => x.title === 'Persist one edited' && x.date === 'Jul 22' && x.s === 660 && x.e === 750)
  return { ok, saw: notes.join(' || '), pics }
})
L.save('s58')
console.log(L.errs)
await browser.close()
