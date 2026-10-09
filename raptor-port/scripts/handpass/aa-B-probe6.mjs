import { world, fileInput, pic, sleep, tid, go, openBoard, dump, openNew, inputsMonth } from './aa-B-lib.mjs'
const w = await world('desk', 'ad')
const { page } = w
w.tag = 'p6'
const r = await fileInput(page, { iso: '2026-07-17', kind: 'Duty', person: 'allavail', rmk: 'p6w', s: '09:00', e: '12:00', oil: null })
const iid = r.rec.iid
await inputsMonth(page, 2026, 6)
const bar = page.locator(`[data-testid="ib-bar-${iid}"]`)
const b = await bar.boundingBox()
const t = await page.locator('#inpCal [data-icday="2026-07-18"]').boundingBox()
await page.mouse.move(b.x + 10, b.y + b.height / 2)
await page.mouse.down()
for (let i = 1; i <= 12; i++) { await page.mouse.move(b.x + 10 + (t.x - b.x) * i / 12, b.y + b.height / 2 + (t.y + 60 - b.y - b.height / 2) * i / 12); await sleep(30) }
await pic(w, 'dragging')
await page.mouse.up(); await sleep(600)
await pic(w, 'dropped')
console.log(JSON.stringify(await page.evaluate(() => ({ q: !!document.querySelector('[data-testid="oilconf"]'), rec: window.INPUTS.filter(i => i.remarks === 'p6w').map(i => ({ d: i.date, oil: i.oil })) }))))
if (await tid(page, 'oilconf').count()) {
  await page.locator('[data-testid="oilconf"] .abtn.ghost').click(); await sleep(500)
  console.log('after cancel', JSON.stringify(await page.evaluate(() => window.INPUTS.filter(i => i.remarks === 'p6w').map(i => ({ d: i.date, oil: i.oil })))))
  await pic(w, 'cancelled')
}
console.log(w.errors)
await w.browser.close()
