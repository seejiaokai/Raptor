// S17 — an unanswered saved placeholder Event gives ONE bell task to its filer (member, phone 390x844).
// Cancelling the OIL question never saves (checked), so the unanswered state is reached the other documented way:
// filed on a weekday (no question), then the admin declares that date a public holiday.
import { setPerson, closeWins, world, closeAll, toInputs, fileInput, pic, T, oilAnswer, signIn, sleep, readInputs, observe, URL_, declareHoliday, issue, lwMap, crowdCount, listAll, listSearch, listRow } from './aa-A-lib.mjs'
const bellState = async (page, tag) => {
  await closeWins(page)
  const b = page.locator('#notifyBell')
  const cls = await b.getAttribute('class'); const dot = await b.evaluate(e => !!e.querySelector('.dot, .bdot, .badge, [class*=dot]'))
  await pic(page, tag)
  return { cls, lit: /on/.test(cls || ''), dot }
}
for (const ph of ['allavail', 'all']) {
  const rm = 'walkS17 ' + ph
  const w = await world({ who: 'us', size: 'p' })
  const A = w.page
  await toInputs(A)
  // (a) first, does cancelling the question save? (documented behaviour check, on its own weekend input)
  await fileInput(A, { iso: '2026-07-18', type: 'Event', person: ph, remarks: 'walkS17 cancel-check ' + ph, start: '09:00', end: '12:00', oil: 'cancel' })
  console.log(ph, 'weekend Event, question cancelled -> saved?', (await readInputs(A, 'walkS17 cancel-check')).length, '(0 = nothing saved)')
  await A.keyboard.press('Escape'); await sleep(300)
  // (b) the weekday input
  await fileInput(A, { iso: '2026-07-15', type: 'Event', person: ph, remarks: rm, start: '09:00', end: '12:00' })
  let rec = (await readInputs(A, rm))[0]
  console.log(ph, 'member filed on a Wednesday (no question):', JSON.stringify(rec))
  // (c) admin tab declares Wed 15 Jul a public holiday
  const B = await w.ctx.newPage(); await B.setViewportSize({ width: 1440, height: 900 })
  B.on('pageerror', e => w.errs.push('B PAGEERROR ' + e)); B.on('console', m => { if (m.type() === 'error') w.errs.push('B CONSOLE ' + m.text()) })
  await B.goto(URL_); await signIn(B, 'ad'); await toInputs(B)
  const sel = await declareHoliday(B, '2026-07-15', 'ph', 'Walk PH')
  console.log(ph, 'admin declared PH, selection said:', sel)
  await pic(B, `s17-${ph}-0-admin-declared`)
  // (d) member reloads
  await A.reload(); await sleep(1000)
  if (await A.locator('#luser').count()) await signIn(A, 'us')
  await toInputs(A)
  const b1 = await bellState(A, `s17-${ph}-2-member-bell-before`)
  console.log(ph, 'member bell before tapping:', JSON.stringify(b1))
  await B.reload(); await sleep(1000); if (await B.locator('#luser').count()) await signIn(B, 'ad')
  const bb0 = await bellState(B, `s17-${ph}-2b-admin-bell-while-pending`); console.log(ph, 'admin (a crowd member, not the filer) bell while the question is open:', JSON.stringify(bb0))
  await A.locator('#notifyBell').click(); await sleep(900)
  const q = await A.locator(T('oilconf')).isVisible().catch(() => false)
  console.log(ph, 'tap opened the OIL question:', q)
  await pic(A, `s17-${ph}-3-task-tapped`)
  if (q) { console.log(ph, 'question:', (await A.locator(T('oilconf')).innerText()).replace(/\s+/g, ' ').slice(0, 140)); await oilAnswer(A, 'no') }
  rec = (await readInputs(A, rm))[0]; console.log(ph, 'after No:', JSON.stringify(rec.oil))
  const b2 = await bellState(A, `s17-${ph}-4-bell-after-no`); console.log(ph, 'member bell after answering No:', JSON.stringify(b2))
  // (e) admin's bell (another man in the crowd)
  await B.reload(); await sleep(1000); if (await B.locator('#luser').count()) await signIn(B, 'ad')
  const bb = await bellState(B, `s17-${ph}-5-admin-bell-after-answer`); console.log(ph, 'admin (crowd member, not the filer) bell after the member answered:', JSON.stringify(bb))
  // (f) issue with No, then answer Yes and issue again
  await toInputs(B); await B.keyboard.press('Escape')
  console.log(ph, 'ORIG(No)', JSON.stringify(await issue(B, 2)))
  let m = await lwMap(B, '2026-07-15'); console.log(ph, 'credits on Wed 15 Jul after issuing with No:', crowdCount(m))
  await A.reload(); await sleep(1000); if (await A.locator('#luser').count()) await signIn(A, 'us')
  await toInputs(A); await listAll(A); await setPerson(A, 'all'); await listSearch(A, rm)
  await listRow(A, rm).locator('.roil').click(); await sleep(500)
  await oilAnswer(A, 'yes')
  rec = (await readInputs(A, rm))[0]; console.log(ph, 'after Yes:', JSON.stringify(rec.oil))
  await B.reload(); await sleep(1000); if (await B.locator('#luser').count()) await signIn(B, 'ad')
  console.log(ph, 'AL1(Yes)', JSON.stringify(await issue(B, 2)))
  m = await lwMap(B, '2026-07-15'); console.log(ph, 'credits on Wed 15 Jul after issuing with Yes:', crowdCount(m))
  await pic(B, `s17-${ph}-6-credits`)
  console.log(ph, 'errs', JSON.stringify(w.errs))
  await w.ctx.close()
}
await closeAll()
