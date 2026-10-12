import { open, fileInput, shot, toWeekDay, toWeek, errs, browser, unavRows, rosterPuck, reveal, mouseDrag, centre, toastMark, toastsSince } from './or-J-lib.mjs'
import { writeFileSync } from 'node:fs'
const { ctx, page } = await open({ fresh: true })
const res = {}
await fileInput(page, { type: 'LL', people: ['Drifter', 'Hex', 'Tally'], from: '2026-07-15', to: '2026-07-16' })
await toWeekDay(page, 2)
const hexPuck = page.locator('#eWeek .day:not(.peek)').nth(2).locator('.sec-unav .pl-row').filter({ has: page.locator('.puck', { hasText: 'Hex' }) }).first().locator('.puck').first()
const hb = await reveal(hexPuck); const gb = await rosterPuck(page, 'Anvil').boundingBox()
await mouseDrag(page, centre(gb), centre(hb))
res.afterDrag = (await unavRows(page, 2)).filter(x => /^LL/.test(x.text)).map(x => x.people.join('+'))
const dotsNow = () => page.evaluate(() => [...document.querySelectorAll('[data-histdot]')].map(e => ({ tag: e.tagName, row: (e.closest('.pl-row')?.innerText||'').replace(/\s+/g,' ').slice(0,40), seat: e.dataset.inprow || e.dataset.inpseat || '', day: [...document.querySelectorAll('#eWeek .day:not(.peek)')].indexOf(e.closest('.day')) })))
await page.evaluate(() => window.scrollTo(0, 0))
await page.locator('#histBtn').click(); await page.waitForTimeout(1500)
res.histOnState = await page.evaluate(() => ({ pressed: document.getElementById('histBtn')?.getAttribute('aria-pressed'), boardwrap: !!document.querySelector('.hist-on') }))
res.dotsAfterOpen = await dotsNow()
await page.locator('.chgwin button', { hasText: /All changes/ }).first().click(); await page.waitForTimeout(1200)
res.dotsAllChanges = await dotsNow()
res.lines = await page.locator('.chgwin .cw-txt').allInnerTexts()
res.taps = []
for (let i = 0; i < res.lines.length; i++) {
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(1800)
  await page.locator('.chgwin .cw-txt').nth(i).click(); await page.waitForTimeout(250)
  const fl = await page.evaluate(() => [...document.querySelectorAll('.chgflash')].map(e => ({ tag: e.tagName, cls: e.className.toString().slice(0, 40), inprow: e.dataset.inprow || e.closest('[data-inprow]')?.dataset.inprow || null, row: (e.closest('.pl-row') || e).innerText.replace(/\s+/g, ' ').slice(0, 50), day: [...document.querySelectorAll('#eWeek .day:not(.peek)')].indexOf(e.closest('.day')) })))
  const bx = await page.evaluate(() => (document.getElementById('toastEl')?.innerText || '').replace(/\s+/g, ' '))
  res.taps.push({ line: res.lines[i], flash: fl, toast: bx })
  await shot(page, 'j2-d-tap' + i)
}
/* control: a one-person leave on the same day — does a dot show on ITS row? */
await page.locator('#histBtn').click(); await page.waitForTimeout(500)
await fileInput(page, { type: 'LL', person: 'Hunter', from: '2026-07-15', to: '2026-07-15' })
await toWeekDay(page, 2)
await page.locator('#histBtn').click(); await page.waitForTimeout(1500)
res.controlDots = await dotsNow()
await shot(page, 'j2-e-control')
console.log(JSON.stringify(res, null, 1))
writeFileSync('docs/handpass/parts/or-J-j2-raw.json', JSON.stringify(res, null, 1))
console.log('ERR', errs.join('\n'))
await ctx.close(); await browser.close()
