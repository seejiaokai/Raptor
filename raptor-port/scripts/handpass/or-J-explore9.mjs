import { open, fileInput, shot, toWeekDay, errs, browser } from './or-J-lib.mjs'
const { ctx, page } = await open({ fresh: true })
const f = await fileInput(page, { type: 'Training', people: ['Hex', 'Hunter', 'Ranger'], from: '2026-07-13', to: '2026-07-17', timed: ['09:00', '10:00'], title: 'Course wk' })
console.log(await page.evaluate(id => JSON.stringify(window.INPUTS.find(r => r.iid === id)), f[0].iid))
await toWeekDay(page, 1)
console.log(await page.evaluate(() => [1,2,3,4].map(di => di + ': ' + [...[...document.querySelectorAll('#eWeek .day:not(.peek)')][di].querySelectorAll('.sec-grnd .pl-row')].map(r => r.innerText.replace(/\s+/g, ' ').slice(0, 70)).join(' || ')).join('\n')))

console.log(await page.evaluate(() => [0,1,2,3,4].map(di => di + ': ' + ([...document.querySelectorAll('#eWeek .day:not(.peek)')][di].innerText.match(/course wk[^\n]*/gi) || []).join(' / ')).join('\n')))
console.log(await page.evaluate(() => [0,1].map(di => [...[...document.querySelectorAll('#eWeek .day:not(.peek)')][di].querySelectorAll('.sub')].map(s => (s.className.match(/sec-\w+/)||['?'])[0] + ':' + /course wk/i.test(s.innerText)).join(' ')).join('\n')))
await ctx.close(); await browser.close()
