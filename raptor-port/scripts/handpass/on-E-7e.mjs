// E7 — a holiday CHANGED onto new dates (Holidays list: Tue 14 -> Thu 16), three inputs on Thu 16
import { launch, session, THU, addRow } from './on-E-lib.mjs'
const TUE = '2026-07-03'   // an empty Friday: the demo's own inputs stand on Tue 14
const browser = await launch()
await session(browser, 'E7e', async s => {
  const { page, press, say, shot, tid, measure, bell, openBell, closeBell } = s
  say('Warden admin', await s.giveWarden())
  await s.fileIt(THU, { type: 'Duty', people: ['harpoon'], title: 'Thu duty' })
  await s.fileIt(THU, { type: 'Training', people: ['nick'], from: '09:00', to: '10:00', title: 'Thu brief' })
  await s.fileIt(THU, { type: 'Meeting', people: ['mamba'], from: '14:00', to: '15:00', title: 'Thu meeting' })
  await s.addHoliday(TUE, 'Move Day')
  say('after adding Move Day on Tue 14 (no inputs): list', await tid('win-oilday').count())
  say('Saber bell', await bell())
  // change its date to Thu 16 on the Holidays list
  await page.evaluate(() => window.go('inputs'))
  await press(page.locator('#inGear')); await page.waitForTimeout(400)
  await press(tid('iset-days')); await page.waitForTimeout(600)
  const tab = tid('days-tab-holidays'); if (await tab.count()) { await press(tab); await page.waitForTimeout(300) }
  const line = page.locator(`.hol-line[data-from="${TUE}"]`)
  say('Move Day line present', await line.count())
  await press(line); await page.waitForTimeout(500)
  const dates = () => page.evaluate(() => { const e = document.querySelector('[data-testid="hol-dates"]'); return e ? [e.dataset.from, e.dataset.to] : null })
  say('form dates at open', await dates())
  for (let i = 0; i < 8 && !(await tid(`holcal-day-${THU}`).count()); i++) await press(tid('holcal-next-month'))
  await press(tid(`holcal-day-${THU}`)); await page.waitForTimeout(250)
  say('after tapping Thu 16', await dates())
  if (JSON.stringify(await dates()) !== JSON.stringify([THU, THU])) { await press(tid(`holcal-day-${THU}`)); await page.waitForTimeout(250); say('after tapping Thu 16 again', await dates()) }
  if (JSON.stringify(await dates()) !== JSON.stringify([THU, THU])) { await press(tid(`holcal-day-${THU}`)); await page.waitForTimeout(250); say('after a third tap', await dates()) }
  await shot('1-change-form')
  await press(tid('hol-save')); await page.waitForTimeout(900)
  say('hol err', await tid('hol-err').innerText().catch(() => '(none)'))
  await page.locator('[data-testid="win-inputsset-x"]').evaluate(e => e.click()).catch(() => {})
  await page.waitForTimeout(300)
  const n = await tid('win-oilday').count()
  say('list up after the change', n)
  if (n) say('list', { title: (await tid('win-oilday').locator('.win-ttl').innerText()).replace(/\s+/g, ' '), lead: await tid('odl-lead').innerText().catch(() => ''), count: await tid('odl-count').innerText(), cards: await tid('win-oilday').locator('.icard').count(), box: await measure('[data-testid="win-oilday"]') })
  await shot('2-after-change')
  say('Saber bell', await bell())
  await openBell(); say('Saber bell list', await bell()); await closeBell()
  await page.evaluate(() => window.raptorMe('nact')); await page.waitForTimeout(500)
  await openBell(); say('Warden bell list', await bell())
  await shot('3-warden-bell')
})
await browser.close()
