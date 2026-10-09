import { world, fileInput, pic, sleep, tid, go, openBoard, dump, setTimes } from './aa-B-lib.mjs'
const w = await world('desk')
const { page } = w
w.tag = 'p4'
const r = await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', rmk: 'p4', oil: 'no' })
console.log(JSON.stringify(r))
await openBoard(page, 5)
await page.locator('#sbOil').click(); await sleep(700)
await pic(w, 'oilmode')
console.log(JSON.stringify(await page.evaluate(() => ({
  ground: [...document.querySelectorAll('#schedBoard .sb-arow')].filter(e => /p4/.test(e.innerHTML)).map(e => e.innerText.replace(/\s+/g, ' ')),
  counts: [...document.querySelectorAll('#schedBoard .oilcount')].map(e => e.outerHTML.slice(0, 300)),
  hints: [...document.querySelectorAll('#schedBoard [data-oilitem]')].map(e => e.outerHTML.slice(0, 400)).slice(0, 3),
  side: (document.querySelector('#sbSide') || {}).innerText.slice(0, 600),
})), null, 1))
await page.locator('#schedBoard .oilcount:visible').first().click(); await sleep(500)
await pic(w, 'oilwin')
console.log(JSON.stringify(await page.evaluate(() => {
  const w = document.querySelector('.availwin')
  return {
    tabs: [...w.querySelectorAll('button, [role=tab]')].map(e => e.outerHTML.slice(0, 200)).slice(0, 8),
    one: (w.querySelector('.win-one') || {}).innerText,
    hint: [...w.querySelectorAll('.win-hint, .hint, .oilhint, small')].map(e => e.innerText).slice(0, 5),
    seats: [...w.querySelectorAll('.seat.oilpk')].slice(0, 3).map(e => e.outerHTML.slice(0, 400)),
    nseats: w.querySelectorAll('.seat.oilpk').length,
    cls: [...w.querySelectorAll('.seat.oilpk')].reduce((a, e) => { const c = ['on', 'off', 'inert'].find(k => e.classList.contains(k)); a[c] = (a[c] || 0) + 1; return a }, {}),
    text: w.innerText.slice(0, 700),
  }
}), null, 1))
console.log(w.errors)
await w.browser.close()
