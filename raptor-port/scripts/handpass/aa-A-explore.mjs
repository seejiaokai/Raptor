import { world, closeAll, toInputs, pic, sleep } from './aa-A-lib.mjs'
const w = await world({ who: 'us', size: 'p' })
const page = w.page
await toInputs(page)
await page.locator('#burger').click(); await sleep(600)
await pic(page, 'x24-drawer')
console.log(await page.evaluate(() => [...document.querySelectorAll('button, a')].filter(b => /log ?out|sign ?out/i.test(b.innerText) && b.offsetParent).map(b => b.id + '|' + b.className + '|' + b.innerText.trim())))
await closeAll()
