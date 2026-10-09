// S17 — cancelling the OIL question produces one actionable bell task (member, phone 390x844).
import { world, closeAll, toInputs, openNew, setTimes, fileInput, pic, T, oilAnswer, signIn, sleep, readInputs, observe, switchUser, issue, lwMap, crowdCount, listAll, listSearch, listRow } from './aa-A-lib.mjs'
const bell = async page => {
  const b = page.locator('#notifyBell'); const badge = await b.innerText().catch(() => '')
  await b.click(); await sleep(500)
  const ob = await page.evaluate(() => { const w = [...document.querySelectorAll('[data-testid^="win-"], .notifypop, .airpop, [role=dialog]')].filter(e => e.offsetParent); return w.map(e => (e.dataset.testid || e.className) + ' :: ' + e.innerText.replace(/\s+/g, ' ').slice(0, 400)) })
  return { badge: badge.replace(/\s+/g, ' '), ob }
}
for (const ph of ['allavail', 'all']) {
  const rm = 'walkS17 ' + ph
  const w = await world({ who: 'us', size: 'p' })
  const { page } = w
  await toInputs(page)
  await fileInput(page, { iso: '2026-07-18', type: 'Event', person: ph, remarks: rm, start: '09:00', end: '12:00', oil: 'cancel' })
  let rec = (await readInputs(page, rm))[0]
  console.log(ph, 'saved after cancelling question:', JSON.stringify(rec))
  await pic(page, `s17-${ph}-1-after-cancel`)
  await page.reload(); await sleep(900)
  if (await page.locator('#luser').count()) await signIn(page, 'us')
  await toInputs(page)
  const b1 = await bell(page)
  console.log(ph, 'member bell:', JSON.stringify(b1))
  await pic(page, `s17-${ph}-2-member-bell`)
  // tap the task
  const task = page.locator('[data-testid^="win-"]:visible, .notifypop:visible').locator('text=/OIL|Event|walkS17|answer/i').first()
  console.log(ph, 'task candidates', await page.evaluate(() => [...document.querySelectorAll('[data-notif], .nrow, .notif-item, [data-task]')].map(e => e.outerHTML.slice(0, 200)).slice(0, 5)))
  await task.click().catch(e => console.log('task click failed', String(e).slice(0, 100))); await sleep(700)
  const q = await page.locator(T('oilconf')).isVisible().catch(() => false)
  console.log(ph, 'tap opened the OIL question:', q)
  await pic(page, `s17-${ph}-3-task-tapped`)
  if (q) { console.log('question text', (await page.locator(T('oilconf')).innerText()).replace(/\s+/g, ' ').slice(0, 160)); await oilAnswer(page, 'no') }
  rec = (await readInputs(page, rm))[0]; console.log(ph, 'after answering No:', JSON.stringify(rec.oil))
  const b2 = await bell(page); console.log(ph, 'bell after answering:', JSON.stringify(b2))
  await pic(page, `s17-${ph}-4-bell-after-answer`)
  await page.keyboard.press('Escape')
  console.log(ph, 'errs', JSON.stringify(w.errs))
  await w.ctx.close()
}
await closeAll()
