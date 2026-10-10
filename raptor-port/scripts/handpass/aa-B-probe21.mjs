import { world, pic, sleep, openBoard } from './aa-B-lib.mjs'
const w = await world('desk'); w.tag = 'p21'
const { page } = w
await openBoard(page, 2)
const seat = page.locator('#schedBoard [data-inpseat]').first(); await seat.scrollIntoViewIfNeeded(); await seat.click(); await sleep(300)
const src = page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first(); await src.scrollIntoViewIfNeeded()
const before = await page.evaluate(() => document.body.innerText.split(/\n/).map(l => l.trim()))
await src.click(); await sleep(120)
const after = await page.evaluate(() => document.body.innerText.split(/\n/).map(l => l.trim()))
console.log('new lines:', JSON.stringify(after.filter(l => l && !before.includes(l)).slice(0, 8)))
await pic(w, 'quick')
await sleep(900)
const later = await page.evaluate(() => document.body.innerText.split(/\n/).map(l => l.trim()))
console.log('new lines later:', JSON.stringify(later.filter(l => l && !before.includes(l)).slice(0, 8)))
await w.browser.close()
