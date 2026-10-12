import { open, fileInput, toWeek, toBoard, shot, browser, errs, readRows, inputsRead, signAndPublish, counts } from './or-G-lib.mjs'
const { ctx, page } = await open()
console.log('date', await page.evaluate(() => new Date().toString()))
const f = await fileInput(page, { type: 'Training', person: 'Ranger', from: '2026-07-18', to: '2026-07-18', timed: ['09:00', '12:00'], title: 'Range brief', oil: 'yes' })
console.log('filed', JSON.stringify(f))
await toWeek(page)
const info = await page.evaluate(() => {
  const days = [...document.querySelectorAll('#eWeek .day:not(.peek)')]
  const d = days[5]
  return { n: days.length, text: d.innerText.replace(/\s+/g, ' ').slice(0, 500), plus: [...d.querySelectorAll('[data-slot$=".+"]')].map(e => e.getAttribute('data-slot') + ' ' + e.className + ' ' + e.textContent.trim().slice(0, 20)) }
})
console.log(JSON.stringify(info, null, 1))
console.log('roster', await page.evaluate(() => [...document.querySelectorAll('#eRoster .rpuck')].map(e => (e.dataset.person || '') + ':' + e.textContent.trim()).join(' | ')))
await shot(page, 'x1-week')
console.log(JSON.stringify(await readRows(page, 'Range brief')))
console.log(await signAndPublish(page, 5).then(JSON.stringify))
console.log(JSON.stringify(await counts(page, 5)))
await shot(page, 'x1-after-pub')
console.log('errs', errs)
await ctx.close(); await browser.close()
