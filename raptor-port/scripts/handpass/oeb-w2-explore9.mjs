import { newWorld, openBoard, oilOn, sleep, close, shot, VERSION } from './oeb-w2-lib.mjs'
console.log(VERSION, 'explore9 placed row html')
const w = await newWorld('pc', 'sat'); const { page } = w
try {
  await openBoard(w)
  const src = page.locator('#sbRoster .puck.allavail', { hasText: 'ALL AVAIL' }).first()
  const t = page.locator('#sbBoard .sb-arow:has([data-bfld="gr:5.0.str"]) [data-bfld="gr:5.0.rmks"]').first(); await t.scrollIntoViewIfNeeded(); await sleep(400)
  const a = await src.boundingBox(), b = await t.boundingBox()
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down()
  await page.mouse.move(a.x + 30, a.y + 5, { steps: 4 }); await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 }); await sleep(200)
  await page.mouse.up(); await sleep(800)
  console.log(await page.evaluate(() => { const f = document.querySelector('#sbBoard [data-bfld="gr:5.0.str"]'); const row = f.closest('.sb-arow'); return row.outerHTML.replace(/\s+/g, ' ').slice(0, 2500) }))
  await oilOn(w, true)
  console.log('oilcounts in board', await page.evaluate(() => [...document.querySelectorAll('#sbBoard .oilcount')].map(c => c.dataset.oilsent + ' ' + c.textContent)))
} finally { await close(w) }
