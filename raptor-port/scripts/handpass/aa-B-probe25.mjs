import { world, pic, sleep, openBoard, tid } from './aa-B-lib.mjs'
const w = await world('desk'); w.tag = 'p25'
const { page } = w
await openBoard(page, 5)
await page.locator('#schedBoard [data-inpadd="5.g"]').first().click(); await sleep(600)
await pic(w, 'adddialog')
console.log(await page.evaluate(() => [...document.querySelectorAll('.airpop, [role=dialog], .floatwin')].filter(e => e.innerText.length > 5).map(e => e.id + '|' + e.className.slice(0, 30) + '|' + [...e.querySelectorAll('select,input,button')].map(x => (x.id || x.dataset.testid || x.innerText.slice(0, 12)) + ':' + x.type).join(',')).slice(0, 4)))
await w.browser.close()
