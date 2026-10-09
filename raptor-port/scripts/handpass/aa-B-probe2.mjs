import { world, fileInput, pic, sleep, tid, go, openBoard, dump } from './aa-B-lib.mjs'
const w = await world('desk')
const { page } = w
w.tag = 'p2'
console.log(JSON.stringify(await page.evaluate(() => Object.keys(window).filter(k => /^(go|openScheduler|DAYS|INPUTS|PEOPLE|raptor|lw|fly|SBDAY|OILDAY|OILMODE)/i.test(k)))))
const r = await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', rmk: 'p2', oil: 'yes' })
console.log(JSON.stringify(r))
await openBoard(page, 5)
await pic(w, 'board')
console.log(JSON.stringify(await page.evaluate(() => ({
  counts: [...document.querySelectorAll('#schedBoard .oilcount, #sbBoard .oilcount')].map(e => e.outerHTML.slice(0, 300)),
  oilmode: [...document.querySelectorAll('[data-oilmode], #sbOil')].map(e => e.outerHTML.slice(0, 300)),
  roots: ['#schedBoard', '#sbBoard', '#sbSide', '#sbRoster'].map(s => s + '=' + document.querySelectorAll(s).length),
  topbar: (document.querySelector('#schedBoard .sb-top, #schedBoard .topbar') || {}).innerText,
})), null, 1))
const cnt = page.locator('.oilcount:visible').first()
await cnt.click()
await sleep(500)
await pic(w, 'window')
console.log(JSON.stringify(await page.evaluate(() => ({
  win: [...document.querySelectorAll('.availwin')].map(e => e.outerHTML.slice(0, 1500)),
}))))
console.log(w.errors)
await w.browser.close()
