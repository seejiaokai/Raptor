import { world, pic, sleep, openBoard } from './aa-B-lib.mjs'
import { addGroundRow } from './aa-B-rows.mjs'
const w = await world('desk')
const { page } = w
await openBoard(page, 5)
const slot = await addGroundRow(page, 5, 'NEWROW', '15:00', '16:00', 'rx')
console.log(slot)
console.log(await page.evaluate(() => { const row = [...document.querySelectorAll('#schedBoard .sb-arow')].find(e => [...e.querySelectorAll('textarea')].some(t => t.value === 'rx')); return row ? row.outerHTML.slice(0, 2500) : 'none' }))
await w.browser.close()
