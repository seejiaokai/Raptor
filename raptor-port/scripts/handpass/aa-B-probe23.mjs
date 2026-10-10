import { world, fileInput, pic, sleep, go, openBoard, touchDrag } from './aa-B-lib.mjs'
const w = await world('phone'); w.tag = 'p23'
const { page } = w
const f = await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', rmk: 'P23', s: '09:00', e: '12:00', oil: 'yes' })
await openBoard(page, 5)
await page.locator(`#schedBoard .oilcount[data-oilsent="i:${f.rec.iid}"]:visible`).first().tap(); await sleep(600)
const info = () => page.evaluate(() => { const e = document.querySelector('.availwin'); const cands = [e, ...e.querySelectorAll('*')].filter(x => x.scrollHeight > x.clientHeight + 4 && getComputedStyle(x).overflowY !== 'visible'); return cands.map(x => x.className + ' st=' + Math.round(x.scrollTop) + ' sh=' + x.scrollHeight + ' ch=' + x.clientHeight + ' oy=' + getComputedStyle(x).overflowY + ' ta=' + getComputedStyle(x).touchAction) })
console.log('scrollers before', JSON.stringify(await info()))
const lb = await page.locator('.availwin .rpuck').nth(5).boundingBox()
await touchDrag(page, lb.x + 20, lb.y + 200, lb.x + 20, lb.y - 40, 16)
console.log('after finger drag up from a puck', JSON.stringify(await info()))
const rc = await page.locator('.availwin .rcols').first().boundingBox()
await touchDrag(page, rc.x + 250, rc.y + 300, rc.x + 250, rc.y + 20, 16)
console.log('after finger drag from empty column space', JSON.stringify(await info()))
await page.mouse.move(rc.x + 60, rc.y + 100); await page.mouse.wheel(0, 300); await sleep(300)
console.log('after wheel', JSON.stringify(await info()))
await pic(w, 'after')
await w.browser.close()
