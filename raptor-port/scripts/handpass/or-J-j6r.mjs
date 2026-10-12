import { open, fileInput, shot, toWeekDay, errs, browser, unavRows, lwOpen, login, toastMark, toastsSince } from './or-J-lib.mjs'
import { writeFileSync } from 'node:fs'
const { ctx, page } = await open({ fresh: false })
const res = {}
const rows = async (label) => {
  await toWeekDay(page, 0)
  const o = { label }
  o.inputs = await page.evaluate(() => window.INPUTS.filter(r => r.type === 'LL' && r.date === 'Jul 13').map(r => ({ people: (r.people || []).map(e => window.PEOPLE[e.p]?.cs), end: r.endDate })))
  o.days = []
  for (let di = 0; di < 5; di++) o.days.push(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][di] + ':' + (await unavRows(page, di)).filter(r => /^LL/.test(r.text) && r.people.some(n => ['Hex', 'Hunter'].includes(n))).map(r => r.people.join('+')).join(','))
  o.hex = await page.evaluate(() => { const x = window.PEOPLE.rocky; return { archived: !!x.archived, deleted: !!x.deleted, archivedBy: x.archivedBy || '' } })
  return o
}
/* the posting first, on Hex's empty Wed 15 Jul cell (scheduled: the day has not come) */
await lwOpen(page, 'jul')
const c = page.locator('[data-testid="cell-rocky-2026-07-15"]'); await c.scrollIntoViewIfNeeded(); await c.click(); await page.waitForTimeout(600)
await page.locator('[data-testid="bid-postout"]').click(); await page.waitForTimeout(500)
res.poLine = await page.evaluate(() => document.querySelector('[data-testid="po-line"]')?.innerText || '')
await page.locator('[data-testid="po-confirm"]').click(); await page.waitForTimeout(1200)
await page.keyboard.press('Escape').catch(() => {}); await page.waitForTimeout(400)
console.log('PO', res.poLine)
const m = await toastMark(page)
res.filed = await fileInput(page, { type: 'LL', people: ['Hex', 'Hunter'], from: '2026-07-13', to: '2026-07-17' })
console.log('filed', JSON.stringify(res.filed), await toastsSince(page, m))
res.before = await rows('before the day'); console.log(JSON.stringify(res.before)); await shot(page, 'j6r-1-before-the-day')
await page.clock.setFixedTime(new Date('2026-07-15T08:00:00'))
await page.reload(); await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
await page.waitForSelector('#vWeek .day, #loginForm', { state: 'attached' }); await page.waitForTimeout(700)
if (await page.locator('#loginForm').isVisible().catch(() => false)) await login(page)
res.onTheDay = await rows('on the day (reloaded, clock Wed 15 Jul 08:00)'); console.log(JSON.stringify(res.onTheDay)); await shot(page, 'j6r-2-on-the-day')
const sec = page.locator('#eWeek .day:not(.peek)').nth(2).locator('.sec-unav').first(); await sec.scrollIntoViewIfNeeded(); await sec.screenshot({ path: 'docs/img/handpass/2026-10-12-one-rule/J/j6r-2b-wed-unavail.png' })
writeFileSync('docs/handpass/parts/or-J-j6d-raw.json', JSON.stringify(res, null, 1))
console.log('ERR', errs.join('\n'))
await ctx.close(); await browser.close()
