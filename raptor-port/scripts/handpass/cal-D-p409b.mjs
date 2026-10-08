import { chromium, launchOptions, world, shot, tid, cell, backToSans, press, fileCommit } from './cal-D-lib.mjs'
const browser = await chromium.launch(launchOptions)
const { ctx, page, errors } = await world(browser, 'desk')
await backToSans(page, 'desk')
await press('desk', cell(page, '2026-07-17'), { position: { x: 8, y: 8 } }); await tid(page, 'win-sansday').waitFor()
await fileCommit(page, 'desk', 'yeti', { f: true, o: true }); await page.click('#inpEditSave'); await page.waitForTimeout(500)
await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(1000)
const r = await page.evaluate(() => [...document.querySelectorAll('#vWeek .day')].map(d => {
  const t = d.innerText.replace(/\s+/g, ' ')
  const i = t.search(/SANS AVAIL/i)
  return t.slice(0, 40) + ' ## ' + (i >= 0 ? t.slice(i, i + 160) : 'no SANS section')
}))
console.log(r.join('\n'))
// bring Friday's own card into view and take its picture
await page.evaluate(() => { const d = [...document.querySelectorAll('#vWeek .day')].find(x => /Friday/.test(x.innerText.slice(0, 40))); if (d) d.scrollIntoView({ inline: 'center' }) })
await page.waitForTimeout(600)
await shot(page, 'p409-desk-schedule')
await ctx.close(); await browser.close()
