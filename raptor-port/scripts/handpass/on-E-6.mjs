// E6 — tells nobody: (a) a holiday on a Friday with no inputs, (b) a holiday on Sat 18, (c) NF on a weekday with inputs
import { launch, session, lw, ON_FRI, FRI, SAT, THU } from './on-E-lib.mjs'
const which = process.argv[2] || 'all'
const browser = await launch()
const state = async s => {
  const { tid, bell, page } = s
  const o = { listUp: await tid('win-oilday').count(), saberBell: await bell() }
  await page.evaluate(() => window.raptorMe('nact')); await page.waitForTimeout(500)
  o.wardenBell = await bell()
  await s.openBell(); o.wardenList = await bell(); await s.closeBell()
  await page.evaluate(() => window.raptorMe('stiff')); await page.waitForTimeout(400)
  return o
}
if (which === 'all' || which === 'a') await session(browser, 'E6a', async s => {
  const { page, say, shot, tid } = s
  say('Warden admin', await s.giveWarden())
  await s.fileIt('2026-07-16', { type: 'Duty', people: ['harpoon'], title: 'Thu duty' })      // some input elsewhere so the world is written
  await s.addHoliday('2026-07-10', 'Quiet Friday')
  await page.waitForTimeout(500)
  say('Fri 10 Jul (no inputs) made a holiday ->', await state(s))
  const hol = await page.evaluate(() => 'ok')
  await s.toMonth(); await page.waitForTimeout(300)
  say('Inputs calendar shows PH on Fri 10?', await page.evaluate(() => { const d = document.querySelector('[data-icday="2026-07-10"]'); return d ? d.innerText.replace(/\s+/g, ' ') : null }))
  await shot('1-holiday-no-inputs')
})
if (which === 'all' || which === 'b') await session(browser, 'E6b', async s => {
  const { page, press, say, shot, tid } = s
  say('Warden admin', await s.giveWarden())
  const iid = await s.fileIt(SAT, { type: 'Training', people: ['bane'], from: '09:00', to: '12:00', title: 'Range brief' })
  say('filed on Sat 18 (answered at the save)', await s.inputsOf([iid]))
  const war = lw(page); await war.go('JUL')
  await war.openEventSheet(0, SAT)
  await press(tid('event-quick-0')); await press(tid('event-scope-day')); await press(tid('event-apply')); await page.waitForTimeout(900)
  say('Sat 18 made PH on the Event row ->', await state(s))
  await shot('1-holiday-on-saturday')
})
if (which === 'all' || which === 'c') await session(browser, 'E6c', async s => {
  const { page, press, say, shot, tid } = s
  say('Warden admin', await s.giveWarden())
  await s.fileIt(THU, { type: 'Duty', people: ['harpoon'], title: 'Thu duty' })
  await s.fileIt(THU, { type: 'Training', people: ['nick'], from: '09:00', to: '10:00', title: 'Thu brief' })
  await page.evaluate(() => window.go('inputs'))
  await press(page.locator('#inGear')); await page.waitForTimeout(400)
  await press(tid('iset-days')); await page.waitForTimeout(600)
  const mt = tid('days-tab-month'); if (await mt.count()) { await press(mt); await page.waitForTimeout(300) }
  for (let i = 0; i < 6 && !(await tid(`days-cell-${THU}`).count()); i++) { await press(tid('days-next')); await page.waitForTimeout(200) }
  say('month shown', await tid('days-month').innerText())
  const nf = tid(`days-nf-${THU}`)
  say('NF button for Thu 16 present', await nf.count())
  await tid(`days-cell-${THU}`).hover(); await page.waitForTimeout(200)
  await press(nf); await page.waitForTimeout(900)
  say('Thu 16 tag after NF', await tid(`days-tag-${THU}`).innerText().catch(() => '(none)'))
  await shot('1-nf-set')
  await page.locator('[data-testid="win-days-x"], [data-testid="win-inputsset-x"]').first().evaluate(e => e.click()).catch(() => {})
  await page.waitForTimeout(300)
  say('Thu 16 set to NF ->', await state(s))
})
await browser.close()
