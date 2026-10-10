import { world, pic, sleep, go, openBoard } from './aa-B-lib.mjs'
const w = await world('desk'); w.tag = 'p20'
const { page } = w
await openBoard(page, 5)
console.log(await page.evaluate(() => [...document.querySelectorAll('#schedBoard button')].filter(b => /\+ (Item|Row|Block|Pax|Seat)/i.test(b.innerText)).map(b => JSON.stringify(b.dataset) + '|' + b.innerText.trim()).slice(0, 14)))
console.log(await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-slot]')].map(e => e.dataset.slot).filter(s => !/^g:/.test(s)).slice(0, 14)))
await w.browser.close()
