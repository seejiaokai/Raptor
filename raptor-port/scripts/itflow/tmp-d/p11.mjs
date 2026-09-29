import { browser, fresh, go, box, snap } from './lib.mjs'
const page = await fresh('ad')
await go(page, 'leavewar')
await page.waitForSelector('[data-testid="row-bane"]')
await page.locator('[data-testid="counts-toggle"]').click(); await page.waitForTimeout(300)
await page.locator('[data-testid="figures-toggle"]').click(); await page.waitForTimeout(500)
await page.locator('[data-testid="stage-advance"]').click(); await page.waitForTimeout(500)
async function drag(a, b) {
  const A = await page.locator(`[data-testid="${a}"]`).boundingBox(), B = await page.locator(`[data-testid="${b}"]`).boundingBox()
  await page.mouse.move(A.x+A.width/2, A.y+A.height/2); await page.mouse.down()
  await page.mouse.move(A.x+A.width/2+8, A.y+A.height/2)
  await page.mouse.move(B.x+B.width/2, B.y+B.height/2, { steps: 6 }); await page.mouse.up(); await page.waitForTimeout(400)
}
// A1 many at once
await drag('cell-slash-2026-02-02','cell-slash-2026-02-03')
console.log('sel', await box(page,'[data-testid="select-sheet"]'), (await page.locator('[data-testid="select-sheet"]').innerText()).replace(/\n/g,' | '))
for (const s of ['sel-pending','sel-approve','sel-refuse','sel-move','sel-delete','sel-span']) console.log(s, await box(page,`[data-testid="${s}"]`))
await snap(page, 'p11-seldecide')
await page.locator('[data-testid="sel-approve"]').click(); await page.waitForTimeout(600)
console.log('after', await page.locator('[data-testid="select-sheet"]').count(), await page.locator('[data-testid="cell-slash-2026-02-02"] .c').getAttribute('class'), await page.locator('[data-testid="cell-slash-2026-02-03"] .c').getAttribute('class'))
await snap(page, 'p11-selapproved')
// A2 two halves on 3 Feb
await page.locator('[data-testid="cell-slash-2026-02-03"]').click(); await page.waitForTimeout(400)
console.log('3feb sheet', (await page.$$eval('[data-testid$="-sheet"], [data-testid="bid-picker"], [data-testid="daylist"]', els => els.map(e=>e.getAttribute('data-testid')+': '+e.innerText.replace(/\n/g,' | ')))))
if (await page.locator('[data-testid="portion-am"]').count()) {
  await page.locator('[data-testid="portion-am"]').click(); await page.locator('[data-testid="bid-OL"]').click(); await page.waitForTimeout(500)
  console.log('note', await page.locator('[data-testid="span-note"]').innerText().catch(()=>null))
  if (await page.locator('[data-testid="bid-picker"]').count()) { await page.locator('[data-testid="bid-OL"]').click(); await page.waitForTimeout(500) }
}
console.log('3feb cell', await page.locator('[data-testid="cell-slash-2026-02-03"]').innerText(), await box(page,'[data-testid="mark-slash-2026-02-03"]'), await page.locator('[data-testid="mark-slash-2026-02-03"]').innerText().catch(()=>null))
await page.locator('[data-testid="cell-slash-2026-02-03"]').click(); await page.waitForTimeout(400)
console.log('daylist', await box(page,'[data-testid="daylist"]'), (await page.locator('[data-testid="daylist"]').innerText().catch(()=>'none')).replace(/\n/g,' | '))
const ids = await page.$$eval('[data-testid^="dl-"]', els => els.map(e=>{const r=e.getBoundingClientRect(); return e.getAttribute('data-testid')+'@'+Math.round(r.x)+','+Math.round(r.y)+','+Math.round(r.width)+'x'+Math.round(r.height)}))
console.log(ids.join(' '))
await snap(page, 'p11-daylist')
const mv = page.locator('[data-testid^="dl-move-"]').first()
if (await mv.count()) {
  await mv.click(); await page.locator('[data-testid="move-banner"]').waitFor(); await page.waitForTimeout(500)
  console.log('banner', await page.locator('[data-testid="move-banner"]').innerText())
  await page.locator('[data-testid="cell-slash-2026-02-06"]').click(); await page.waitForTimeout(500)
  console.log('6feb', await page.locator('[data-testid="cell-slash-2026-02-06"]').innerText(), await page.locator('[data-testid="cell-slash-2026-02-06"] .c').getAttribute('class').catch(()=>null), '3feb', await page.locator('[data-testid="cell-slash-2026-02-03"]').innerText())
  await snap(page, 'p11-dlmoved')
}
await browser.close()
