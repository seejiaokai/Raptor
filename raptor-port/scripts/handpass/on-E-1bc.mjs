// E1b — TYPING a word on the Event row (Name box) ; E1c — a merged band over several days
import { launch, session, lw, ON_FRI, FRI, THU, addRow } from './on-E-lib.mjs'
const browser = await launch()
const which = process.argv[2] || 'all'
async function listState(s) {
  const { tid, say, measure, page } = s
  const n = await tid('win-oilday').count()
  const o = { listUp: n, page: await page.evaluate(() => window.CURPAGE) }
  if (n) {
    o.title = (await tid('win-oilday').locator('.win-ttl').innerText()).replace(/\s+/g, ' ')
    o.lead = await tid('odl-lead').innerText().catch(() => '')
    o.count = await tid('odl-count').innerText()
    o.cards = await tid('win-oilday').locator('.icard').count()
    o.box = await measure('[data-testid="win-oilday"]')
  }
  return o
}
if (which === 'all' || which === 'b') await session(browser, 'E1b', async s => {
  const { page, press, say, shot, tid, bell, openBell, closeBell } = s
  say('Warden admin', await s.giveWarden())
  for (const spec of ON_FRI) await s.fileIt(FRI, spec)
  const war = lw(page); await war.go('JUL')
  await war.openEventSheet(0, FRI)
  await tid('event-text').fill('PH')
  await page.waitForTimeout(300)
  say('typed "PH": picked', await page.evaluate(() => [...document.querySelectorAll('[data-testid^="event-quick-"],[data-testid="event-other"]')].map(b => b.textContent + ':' + b.getAttribute('aria-pressed'))))
  say('readout', await tid('event-readout').innerText().catch(() => '(none)'))
  await shot('1-typed-ph')
  await press(tid('event-apply')); await page.waitForTimeout(900)
  say('after save', await listState(s))
  await shot('2-after-save')
  await press(tid('odl-later')).catch(() => {}); await page.waitForTimeout(300)
  await page.evaluate(() => window.raptorMe('nact')); await page.waitForTimeout(500)
  await openBell(); say('Warden bell', await bell())
})
if (which === 'all' || which === 'n') await session(browser, 'E1n', async s => {
  // typing a word that is NOT a preset ("National Day"), left as a Note, then with kind Public holiday
  const { page, press, say, shot, tid, bell, openBell } = s
  say('Warden admin', await s.giveWarden())
  for (const spec of ON_FRI) await s.fileIt(FRI, spec)
  const war = lw(page); await war.go('JUL')
  await war.openEventSheet(0, FRI)
  await tid('event-text').fill('National Day')
  await page.waitForTimeout(300)
  say('typed "National Day": picked', await page.evaluate(() => [...document.querySelectorAll('[data-testid^="event-quick-"],[data-testid="event-other"]')].map(b => b.textContent + ':' + b.getAttribute('aria-pressed'))))
  say('readout', await tid('event-readout').innerText().catch(() => '(none)'))
  await press(tid('event-apply')); await page.waitForTimeout(900)
  say('as a plain note: after save', await listState(s))
  say('Saber bell', await bell())
  await shot('1-note-saved')
  // now change the same event to kind Public holiday via Other…
  await war.openEventSheet(0, FRI)
  await press(tid('event-other')); await page.waitForTimeout(200)
  await press(tid('event-tag-off')); await page.waitForTimeout(200)
  say('Other + Public holiday: readout', await tid('event-readout').innerText().catch(() => '(none)'))
  await press(tid('event-apply')); await page.waitForTimeout(900)
  say('as Other/Public holiday: after save', await listState(s))
  await shot('2-other-ph-saved')
})
if (which === 'all' || which === 'c') await session(browser, 'E1c', async s => {
  const { page, press, say, shot, tid, bell, openBell } = s
  say('Warden admin', await s.giveWarden())
  for (const spec of ON_FRI) await s.fileIt(FRI, spec)
  const war = lw(page); await war.go('JUL')
  await war.openEventSheet(0, FRI)
  await press(tid('event-quick-0'))
  await press(tid('event-scope-range')); await page.waitForTimeout(300)
  await press(tid(`event-day-${THU}`)); await press(tid(`event-day-${FRI}`)); await page.waitForTimeout(200)
  say('range selection', await tid('event-selection').innerText().catch(() => ''))
  say('mode', await page.evaluate(() => [...document.querySelectorAll('[data-testid^="event-mode-"]')].map(b => b.dataset.testid + ':' + b.className)))
  await shot('1-band-sheet')
  await press(tid('event-apply')); await page.waitForTimeout(900)
  say('after save', await listState(s))
  await shot('2-band-after-save')
  await press(tid('odl-later')).catch(() => {}); await page.waitForTimeout(300)
  await page.evaluate(() => window.raptorMe('nact')); await page.waitForTimeout(500)
  await openBell(); say('Warden bell', await bell())
  await shot('3-warden-bell')
})
await browser.close()
