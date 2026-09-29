/* [TRK-LEFTOVERS] baseline — A: does turning on "✎ Edit chart layout" move a
   chart that has been scrolled down to a ball? (w2 "off-list"; adapted from
   trk-w2-09c-probe-arrange-jump.mjs). Desktop 1440x900, admin.
   The ball is brought to the middle with the wheel (reveal), then the
   Syllabus ✎ menu's own item is pressed; the ball's on-screen position
   (getBoundingClientRect of #flowSvg .ball[data-id=…]) is read before, while
   editing, and after "✓ Done editing chart". */
import { open, shot, save, log, reveal, DESK } from './trk-lib.mjs'
import { sleep, scrollOf } from './trk-w2-lib.mjs'

const L = log()
const { browser, page, errors } = await open({ size: DESK, who: 'a' })
const pos = id => page.evaluate(id => {
  const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id); if (!g) return null
  const r = g.getBoundingClientRect(); const c = (g.querySelector(':scope > circle') || g).getBoundingClientRect()
  return { top: Math.round(r.top), left: Math.round(r.left), cy: Math.round(c.top + c.height / 2), cx: Math.round(c.left + c.width / 2) }
}, id)
const board = () => page.evaluate(() => { const b = document.getElementById('board').getBoundingClientRect(); return { top: Math.round(b.top), h: Math.round(b.height) } })
async function toggle() {
  await page.click('#sylMenuBtn'); await page.waitForSelector('#arrangeBtn', { state: 'visible' })
  const label = (await page.locator('#arrangeBtn').innerText()).trim()
  await page.click('#arrangeBtn'); await sleep(600)
  return label
}
for (const id of ['ACG-04', 'BFM-3']) {
  await reveal(page, id); await sleep(300)
  const before = await pos(id), s0 = await scrollOf(page), b0 = await board()
  await shot(page, `lo-A-${id}-1-before`)
  const l1 = await toggle()
  const on = await pos(id), s1 = await scrollOf(page), b1 = await board()
  await shot(page, `lo-A-${id}-2-editing`)
  const l2 = await toggle()
  const off = await pos(id), s2 = await scrollOf(page), b2 = await board()
  await shot(page, `lo-A-${id}-3-after-done`)
  L.note(`A ${id}: pressed "${l1}" then "${l2}"`, JSON.stringify({ before, on, off, scroll: [s0, s1, s2], board: [b0, b1, b2] }))
  L.ok(`A ${id}: the ball stays put entering edit mode (top ${before.top} → ${on.top}) and after Done (→ ${off.top})`, Math.abs(before.top - on.top) <= 2 && Math.abs(before.top - off.top) <= 2, `top ${before.top} → ${on.top} → ${off.top}; centre y ${before.cy} → ${on.cy} → ${off.cy}`)
}
save('lo-A-arrange-jump', { rows: L.rows, errors })
console.log('errors', JSON.stringify(errors))
await browser.close()
