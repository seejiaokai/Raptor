import { open, fileInput, toWeek, toBoard, shot, browser, errs, readRows, inputsRead, signAndPublish, counts, sleep, toastMark, toastsSince } from './or-G-lib.mjs'
const { ctx, page } = await open()
await fileInput(page, { type: 'Training', person: 'Ranger', from: '2026-07-18', to: '2026-07-18', timed: ['09:00', '12:00'], title: 'Range brief', oil: 'yes' })
console.log(JSON.stringify(await signAndPublish(page, 5)))
await toWeek(page)
const html = await page.evaluate(() => {
  const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][5]
  const g = d.querySelector('.sec-grnd')
  return g ? g.outerHTML.slice(0, 4000) : 'NO sec-grnd'
})
console.log(html)
console.log(await page.evaluate(() => [...document.querySelectorAll('#eWeek .day:not(.peek)')][5].querySelector('.day-head').innerText.replace(/\s+/g, ' ')))
await ctx.close(); await browser.close()
