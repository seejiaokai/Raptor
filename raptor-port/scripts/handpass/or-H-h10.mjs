import { launch, open, fileInput, openFromList, describeWin, shot, WIN, save, errs, as } from './or-H-lib.mjs'
const out = {}
const log = (k, v) => { out[k] = v; console.log('## ' + k + ' ' + JSON.stringify(v)) }
const browser = await launch()
const { ctx, page } = await open(browser)
await as(page, 'Saber')
const r = await fileInput(page, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Ranger', 'Tally'], placeholder: 'ALL AVAIL', from: '2026-07-15', to: '2026-07-15', timed: ['14:00', '15:00'], title: 'Big brief' })
const iid = r[0].iid
log('filed', await page.evaluate(i => { const x = window.INPUTS.find(y => y.iid === i); return { people: x.people.map(e => window.PEOPLE[e.p]?.cs || e.p), by: window.PEOPLE[x.by]?.cs } }, iid))
const MON = ['january','february','march','april','may','june','july','august','september','october','november','december']
const toMonth = async () => {
  await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(300)
  if (await page.locator('#inCalBtn[aria-pressed="false"]').count()) { await page.locator('#inCalBtn').click(); await page.waitForTimeout(300) }
  for (let i = 0; i < 12 && !(await page.locator('[data-icday="2026-07-15"]').count()); i++) {
    const [mn, yr] = (await page.locator('#inpCal .ic-mon').textContent()).trim().toLowerCase().split(/\s+/)
    const at = +yr * 12 + MON.findIndex(x => x.startsWith(mn))
    await page.locator(at < 2026 * 12 + 6 ? '#icNext' : '#icPrev').click(); await page.waitForTimeout(200)
  }
}
await toMonth()
const cell = () => page.evaluate(() => ({ bars: [...document.querySelectorAll('#inpCal *')].filter(e => e.getClientRects().length && /Big brief/.test(e.textContent) && ![...e.children].some(c => /Big brief/.test(c.textContent))).map(e => e.textContent.trim().replace(/\s+/g, ' ')) }))
log('bar', await cell())
await shot(page, 'H10-1-month')
await page.locator('[data-icday="2026-07-15"]').focus(); await page.keyboard.press('Enter'); await page.waitForSelector('[data-testid="win-inputsday"]'); await page.waitForTimeout(300)
log('card', await page.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputsday"] .icard')].filter(c => c.innerText.includes('Big brief')).map(c => c.innerText.replace(/\s+/g, ' '))))
await shot(page, 'H10-2-card')
await page.locator('[data-testid="win-inputsday-x"]').click()
/* list */
await page.locator('#inListBtn').click(); await page.waitForTimeout(300)
await page.locator('#inRangeBtn').click().catch(() => {}); await page.locator('#inRangeAll').click().catch(() => {}); await page.waitForTimeout(400)
const listRow = () => page.evaluate(() => { const e = [...document.querySelectorAll('[data-iid], [data-listiid]')].find(x => /Big brief/.test(x.innerText)); return e ? e.innerText.replace(/\s+/g, ' ') : null })
log('list-row', await listRow())
log('list-row-has-plus-n', /\+\s*\d/.test(await listRow() || ''))
await shot(page, 'H10-3-list-row-scroll')
await page.evaluate(() => { const e = [...document.querySelectorAll('[data-iid], [data-listiid]')].find(x => /Big brief/.test(x.innerText)); if (e) e.scrollIntoView({ block: 'center' }) }); await page.waitForTimeout(300)
await shot(page, 'H10-3-list-row')
/* the person filter */
const sel = page.locator('select:visible').first()
log('filter-options-sample', await sel.evaluate(s => [...s.options].slice(0, 5).map(o => o.textContent)))
for (const cs of ['Hunter', 'Tally', 'Grit']) {
  await sel.selectOption({ label: cs }); await page.waitForTimeout(500)
  log('filter-' + cs, { listShows: !!(await listRow()), row: await listRow() })
  await shot(page, 'H10-4-filter-' + cs)
}
/* the calendar with the filter set to the fifth man, and to one of the four */
await page.locator('#inCalBtn').click(); await page.waitForTimeout(300)
await toMonth()
await page.locator('select:visible').first().selectOption({ label: 'Grit' }); await page.waitForTimeout(400)
log('calendar-filter-Grit', await cell())
await page.locator('select:visible').first().selectOption({ label: 'Hunter' }); await page.waitForTimeout(400)
log('calendar-filter-Hunter', await cell())
await shot(page, 'H10-5-calendar-filter-Hunter')
log('errors', errs)
save('H10', out)
await browser.close()
