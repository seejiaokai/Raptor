// RX2-6 (an event type re-tagged as a holiday, back, and again) — a new world. arg: kind to try (default: print kinds first)
import { launch, world, bye, THU } from './on-RX2-lib.mjs'
const TUE = '2026-07-14', WED = '2026-07-15'
const browser = await launch()
const w = await world(browser, { tag: 'R6' }); const { page, tid } = w
const press = w.press
w.say('Warden admin', await w.giveWarden())
const a = await w.fileIt(TUE, { type: 'Training', people: ['nick'], from: '09:00', to: '10:00', title: 'Tue brief' })
const b = await w.fileIt(WED, { type: 'Training', people: ['mamba'], from: '09:00', to: '10:00', title: 'Wed brief' })
const c = await w.fileIt(THU, { type: 'Duty', people: ['harpoon'], title: 'Thu duty' })
w.say('filed', [a, b, c])
// the Leave War
const goLW = async () => {
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector('[data-testid="row-slipway"]', { timeout: 15000 })
  const bar = page.locator('[data-testid="figures-toggle"]')
  if ((await bar.count()) && (await bar.getAttribute('aria-expanded')) === 'true') await bar.click()
  await page.locator('[data-testid="month-JUL"]').click()
  await page.locator('[data-testid="head-2026-07-01"]').waitFor({ state: 'attached' })
  await page.waitForTimeout(800)
}
const openEventSheet = async (line, iso) => {
  const cell = page.locator(`[data-testid="event-${line}-${iso}"], [data-testid="event-band-${line}-${iso}"]`).first()
  await cell.scrollIntoViewIfNeeded(); await cell.click(); await page.waitForTimeout(500)
  const pk = page.locator('[data-testid="event-peek-edit"]'); if (await pk.count()) { await pk.click(); await page.waitForTimeout(500) }
}
await goLW()
await openEventSheet(0, THU)
const chips = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="event-quick-"]')].map(b => [b.dataset.testid, b.textContent]))
w.say('presets', chips)
const sc = chips.find(x => x[1] === 'SC')
await press(page.locator(`[data-testid="${sc[0]}"]`)); await press(tid('event-scope-day'))
w.say('SC read-out', await tid('event-readout').innerText())
await press(tid('event-apply')); await page.waitForTimeout(700)
await openEventSheet(1, TUE)
await press(page.locator(`[data-testid="${sc[0]}"]`)); await press(tid('event-scope-range')); await page.waitForTimeout(250)
await press(tid(`event-day-${TUE}`)); await press(tid(`event-day-${WED}`)); await page.waitForTimeout(200)
w.say('band', await tid('event-selection').innerText())
await press(tid('event-apply')); await page.waitForTimeout(700)
w.say('after tagging SC (work): list', await tid('win-oilday').count())
w.say('bells after SC placed', await w.bothBells())
await w.shot('R6-1-sc-placed')
const editTypes = async () => {
  await openEventSheet(0, '2026-07-21')
  await press(tid('event-edit-types')); await page.waitForTimeout(400)
}
const kindsNow = () => page.evaluate(() => [...document.querySelectorAll('[data-testid^="evtype-kind-3-"]')].map(b => b.dataset.testid.replace('evtype-kind-3-', '') + ':' + b.textContent.trim() + ':' + b.getAttribute('aria-pressed')))
const closeTypes = async () => { await press(tid('types-done')); await page.waitForTimeout(300); if (await tid('event-cancel').count()) await press(tid('event-cancel')); await page.waitForTimeout(400) }
await editTypes()
w.say('SC row kinds offered', await kindsNow())
await w.shot('R6-2-edit-types')
// find the public-holiday kind
const all = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="evtype-kind-3-"]')].map(b => b.dataset.testid.replace('evtype-kind-3-', '')))
w.say('kind ids', all)
const hol = all.find(k => /^(ph|hol|holiday|public)/.test(k)) || all[0]
w.say('using kind for holiday', hol)
await press(tid(`evtype-kind-3-${hol}`)); await page.waitForTimeout(900)
w.say('after re-tag as holiday: kinds', await kindsNow())
w.say('list up', await w.listInfo())
await w.hush(); await w.shot('R6-3-after-retag-holiday')
await closeTypes()
w.say('list after closing editor', await w.listInfo())
// the list may be up; Later
if (await tid('win-oilday').count()) { await press(tid('odl-later')); await page.waitForTimeout(400) }
w.say('bells after re-tag as holiday', await w.bothBells('R6-4-bells-holiday'))
const undoA = await w.undoInfo(); w.say('undo', undoA)
// re-tag back to the plain kind
await w.me('stiff')
await goLW()
await editTypes()
const plain = 'work'
w.say('plain kind candidates', all)
w.say('kinds now', await kindsNow())
await w.shot('R6-5-edit-types-again')
w.say('plain kind chosen (second reading of pressed kinds above)', plain)
await press(tid(`evtype-kind-3-${plain}`)); await page.waitForTimeout(900)
w.say('after re-tag back: kinds', await kindsNow())
w.say('list up', await w.listInfo())
await w.hush(); await w.shot('R6-6-after-retag-back')
await closeTypes()
w.say('bells after re-tag back', await w.bothBells('R6-7-bells-back'))
// and again as a holiday
await w.me('stiff')
await goLW()
await editTypes()
await press(tid(`evtype-kind-3-${hol}`)); await page.waitForTimeout(900)
w.say('after re-tag as holiday again: kinds', await kindsNow())
w.say('list up', await w.listInfo())
await w.hush(); await w.shot('R6-8-after-retag-again')
await closeTypes()
if (await tid('win-oilday').count()) { await press(tid('odl-later')); await page.waitForTimeout(400) }
w.say('bells after re-tag again', await w.bothBells('R6-9-bells-again'))
w.say('errors', await bye(w))
await browser.close()
