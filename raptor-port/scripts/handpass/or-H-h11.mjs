import { launch, open, fileInput, openFromList, describeWin, shot, WIN, toastMark, toastsSince, save, errs, as, bellRead, oilAnswer } from './or-H-lib.mjs'
const out = {}
const log = (k, v) => { out[k] = v; console.log('## ' + k + ' ' + JSON.stringify(v)) }
const browser = await launch()
const { ctx, page } = await open(browser)
await as(page, 'Saber')
const r = await fileInput(page, { type: 'Training', people: ['Ranger', 'Tally', 'Hex'], from: '2026-07-18', to: '2026-07-18', timed: ['09:00', '12:00'], title: 'Sat drill', oil: 'yes' })
const iid = r[0].iid
const oilOf = () => page.evaluate(i => { const x = window.INPUTS.find(y => y.iid === i); return { oil: x.oil, people: x.people.map(e => window.PEOPLE[e.p]?.cs + (e.oil !== undefined ? '[oil=' + JSON.stringify(e.oil) + ']' : '')) } }, iid)
log('filed', await oilOf())
const weekBars = async () => {
  await page.evaluate(() => window.go('editsched')); await page.locator('#eWeek .day').first().waitFor()
  const day = page.locator('#eWeek .day:not(.peek)').nth(5); await day.scrollIntoViewIfNeeded()
  const row = day.locator('.sec-grnd .pl-row', { hasText: 'Sat drill' }).first(); await row.scrollIntoViewIfNeeded()
  return row.evaluate(r => [...r.querySelectorAll('.ppl .puck')].map(p => p.querySelector('.nm').textContent + ':' + (/oilbar-(\w+)/.exec(p.className) || ['', 'none'])[1]))
}
log('week-oil-bars-before', await weekBars())
await shot(page, 'H11-0-week-before')
await openFromList(page, iid)
const d = await describeWin(page)
log('saber-window', { buttons: d.buttons.map(b => b.id + ':' + b.text).filter(t => t.length > 4), oilText: d.text.match(/OIL \|[^|]*\|[^|]*\|[^|]*/g), yourOil: /Your OIL/i.test(d.text), tail: d.text.slice(-260) })
await page.locator(`${WIN} [data-testid="inped-oil-change"], ${WIN} button`).filter({ hasText: /Change/ }).first().scrollIntoViewIfNeeded().catch(() => {})
await shot(page, 'H11-1-saber-window-oil-line')
const ch = page.locator(`${WIN} button`, { hasText: /Change/ })
log('change-buttons', await ch.count())
if (await ch.count()) {
  const m = await toastMark(page)
  await ch.first().click(); await page.waitForTimeout(500)
  log('after-change-click', { sheet: await page.locator('[data-testid="oilconf"]').count(), text: await page.locator('[data-testid="oilconf"]').first().innerText().catch(() => null), win: await page.locator(WIN).count() })
  await shot(page, 'H11-2-change-clicked')
  if (await page.locator('[data-testid="oilconf"]').count()) { await oilAnswer(page, 'no'); await page.waitForTimeout(600) }
  log('after-answer-no', { toast: await toastsSince(page, m), inputs: await oilOf(), win: await page.locator(WIN).count() })
  await shot(page, 'H11-3-after-no')
}
if (await page.locator(WIN).count()) { await page.locator('#inpEditCancel, #inpEditSave').first().click().catch(() => {}); await page.waitForTimeout(500); log('after-window-closed-oil', await oilOf()) }
log('week-oil-bars-after', await weekBars())
await shot(page, 'H11-4-week-after')
/* OIL Earn on the board follows */
const sbd = page.locator('#eWeek [data-sbday="5"]:visible').first(); await sbd.scrollIntoViewIfNeeded(); await sbd.click()
await page.waitForSelector('#schedBoard'); await page.waitForTimeout(400)
await page.locator('#schedBoard button', { hasText: 'OIL Earn' }).first().click(); await page.waitForTimeout(500)
log('board-oil-earn-row', await page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow')].filter(r => r.getClientRects().length).map(r => (r.querySelector('textarea.ain, input.ain') || {}).value + ' :: ' + [...r.querySelectorAll('.puck')].map(p => p.querySelector('.nm').textContent + ':' + (/oilbar-(\w+)|oil-(on|off)|oilon|oiloff/.exec(p.className) || ['', 'none'])[0]).join(', '))))
await shot(page, 'H11-5-board-oil-earn')
await page.locator('#sbDone').click().catch(() => {}); await page.waitForTimeout(300)
/* bells */
for (const n of ['Ranger', 'Tally', 'Hex']) { await as(page, n); const b = await bellRead(page); log('bell-' + n, { oilQuestion: b.oilQuestionOpened, list: b.list }) }
log('errors', errs)
save('H11', out)
await browser.close()
