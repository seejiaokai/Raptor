import { chromium, launchOptions, world, shot, tid, cell, backToSans, press, fileCommit } from './cal-D-lib.mjs'
const browser = await chromium.launch(launchOptions)
const { ctx, page, errors } = await world(browser, 'desk')
await backToSans(page, 'desk')
await press('desk', cell(page, '2026-07-17'), { position: { x: 8, y: 8 } }); await tid(page, 'win-sansday').waitFor()
await fileCommit(page, 'desk', 'yeti', { f: true, o: true }); await page.click('#inpEditSave'); await page.waitForTimeout(500)
await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(1000)
const panel = () => page.evaluate(() => {
  const p = document.querySelector('.crewp, #crewPanel, [class*=aircrew], .crew') || document.body
  const all = document.body.innerText.replace(/\s+/g, ' ')
  const hd = all.match(/AIRCREW\s*[·.]?\s*\S*\s*(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)/i)
  const i = all.search(/SANS AVAIL/i)
  return (hd ? hd[1] : '?') + ' :: ' + (i >= 0 ? all.slice(i, i + 80) : 'no SANS AVAIL text')
})
console.log('Monday panel:', await panel())
for (let i = 0; i < 4; i++) { await page.mouse.click(1327, 232); await page.waitForTimeout(500) }
console.log('after 4 steps:', await panel())
await shot(page, 'p409-desk-schedule-fri')
await ctx.close(); await browser.close()
