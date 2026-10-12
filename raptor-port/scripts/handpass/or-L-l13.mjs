import { open, fileInput, toWeek, toBoard, shot, saveRes, errs, browser, toast, inputsOf, weekRows, dragOntoRow, closeBoardMode } from './or-L-lib.mjs'
const R = {}
const { ctx, page } = await open('ad', 'a')
R.filed = await fileInput(page, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Ranger'], from: '2026-07-15', to: '2026-07-15', timed: ['14:00', '15:00'], title: 'L13 meeting' })
R.addToast = await dragOntoRow(page, 'Hex', 'L13 MEETING')
R.afterAdd = (await inputsOf(page, 'L13 meeting')).map(r => r.people)
/* right-click Hunter's puck on the row */
await toWeek(page)
const row = page.locator('#eWeek .day:not(.peek)').nth(2).locator('.sec-grnd .pl-row', { hasText: 'L13 MEETING' })
await row.locator('.puck', { hasText: 'Hunter' }).first().click({ button: 'right' }); await page.waitForTimeout(600)
R.rcToast = await toast(page)
R.afterRc = (await inputsOf(page, 'L13 meeting')).map(r => r.people)
/* history on */
await toWeek(page)
await page.locator('#histBtn').click(); await page.waitForTimeout(900)
R.histOn = await page.locator('#histBtn').getAttribute('aria-pressed')
await shot(page, 'l13-1-history-on')
const day = page.locator('#eWeek .day:not(.peek)').nth(2)
const dotsQ = root => page.evaluate(root => [...document.querySelectorAll(root + ' [data-histdot]')].filter(e => e.offsetParent).map(e => ({ tag: e.tagName, cls: (e.className || '').toString().slice(0, 50), attrs: [...e.attributes].filter(a => /^data-/.test(a.name)).map(a => a.name + '=' + a.value).join(' ').slice(0, 100), text: (e.innerText || '').replace(/\s+/g, ' ').slice(0, 40), row: e.closest('.pl-row, .sb-arow')?.innerText.replace(/\s+/g, ' ').slice(0, 70) || null, puck: e.closest('.puck') ? e.closest('.puck').innerText.replace(/\s+/g, ' ').trim() : null, section: (e.closest('[class*="sec-"]')?.className || '').toString().slice(0, 40) })), root)
R.dotsWeekWed = (await dotsQ('#eWeek .day:not(.peek):nth-of-type(3)'))
R.dotsWeekAll = (await dotsQ('#eWeek')).filter(d => /L13|Hex|Hunter|MEETING/i.test((d.row || '') + (d.puck || '') + d.text))
await row.scrollIntoViewIfNeeded()
await day.locator('.sec-grnd').screenshot({ path: 'docs/img/handpass/2026-10-12-one-rule/L/l13-2-ground-history-on.png' })
await day.locator('.sec-inp').first().screenshot({ path: 'docs/img/handpass/2026-10-12-one-rule/L/l13-3-personalinputs-history-on.png' }).catch(() => {})
/* tap / hover the dots on the row */
R.tapResults = []
const dotEls = page.locator('#eWeek [data-histdot]')
const n = await dotEls.count()
for (let i = 0; i < n; i++) {
  const el = dotEls.nth(i)
  const info = await el.evaluate(e => ({ row: e.closest('.pl-row')?.innerText.replace(/\s+/g, ' ').slice(0, 60), puck: e.closest('.puck')?.innerText.replace(/\s+/g, ' ').trim() || null, cls: e.className.toString().slice(0, 40) }))
  if (!/L13/i.test(info.row || '')) continue
  await el.scrollIntoViewIfNeeded(); await el.click({ force: true }).catch(() => {}); await page.waitForTimeout(600)
  const bub = await page.evaluate(() => [...document.querySelectorAll('.histbub')].map(b => b.innerText.replace(/\s+/g, ' ').trim()))
  R.tapResults.push({ info, bubble: bub })
  await shot(page, 'l13-4-tap-' + i)
  await page.keyboard.press('Escape'); await page.waitForTimeout(200)
}
/* board */
await page.locator('#histBtn').click().catch(() => {})
await toBoard(page, 2)
await page.locator('#sbHist, #histBtn, [data-testid="sb-history"]').first().click().catch(() => {})
await page.waitForTimeout(700)
R.boardDots = await dotsQ('#schedBoard')
await shot(page, 'l13-5-board')
saveRes('L13', R)
console.log(JSON.stringify(R, null, 1))
console.log('ERRS', errs.join('\n'))
await browser.close()
