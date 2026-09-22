/* [OIL-SEATS-CAN-EARN] walk — SURFACES. The duty-desk and ground-row people
   cells on the WEEK did not arm when pressed in the middle: the press landed on
   the man already sitting there. Find where the empty part of the cell is and
   press THAT — the "+ add" strip the cell always carries under its pucks. */
import { open, go, shot, STATE } from './lib.mjs'

const di = 5
const { browser, page, errors } = await open({ state: STATE })
await go(page, 'editsched'); await page.waitForTimeout(900)

const geo = await page.evaluate(d => {
  const out = []
  for (const k of [`d:${d}.0.0.+`, `d:${d}.1.0.+`, `g:${d}.0.+`, `g:${d}.3.+`, `a:${d}.0.+`, `s:${d}.oft.0.+`]) {
    const c = document.querySelector(`#eWeek [data-fill="${k}"]`)
    if (!c) { out.push({ k, cell: null }); continue }
    const b = c.getBoundingClientRect()
    const pucks = [...c.querySelectorAll('[data-person]')].map(e => { const r = e.getBoundingClientRect()
      return { who: e.dataset.person, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } })
    const addz = c.querySelector('.addz')
    const ab = addz ? addz.getBoundingClientRect() : null
    out.push({ k, cell: { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) },
      cls: c.className, pucks, addz: ab ? { x: Math.round(ab.x), y: Math.round(ab.y), w: Math.round(ab.width), h: Math.round(ab.height),
        disp: getComputedStyle(addz).display, pe: getComputedStyle(addz).pointerEvents } : 'NO addz' })
  }
  return out
}, di)
for (const g of geo) console.log(JSON.stringify(g))

/* press the cell at a point that is NOT on a puck — the strip below them */
async function pressGap(key) {
  const spot = await page.evaluate(k => {
    const c = document.querySelector(`#eWeek [data-fill="${k}"]`); if (!c) return null
    c.scrollIntoView({ block: 'center', inline: 'center' })
    const b = c.getBoundingClientRect()
    const ps = [...c.querySelectorAll('[data-person]')].map(e => e.getBoundingClientRect())
    /* walk the cell's own box looking for a point no puck covers */
    for (let fy = 0.9; fy >= 0.1; fy -= 0.1) for (let fx = 0.9; fx >= 0.1; fx -= 0.1) {
      const x = b.x + b.width * fx, y = b.y + b.height * fy
      if (!ps.some(r => x >= r.x && x <= r.right && y >= r.y && y <= r.bottom)) {
        const el = document.elementFromPoint(x, y)
        return { x, y, hit: el ? el.className.toString().slice(0, 50) + '|' + el.tagName : 'none',
          box: { w: Math.round(b.width), h: Math.round(b.height) } }
      }
    }
    return { none: true, box: { w: Math.round(b.width), h: Math.round(b.height) } }
  }, key)
  if (!spot || spot.none) return { key, why: 'every point in the cell is covered by a puck', spot }
  await page.waitForTimeout(120)
  await page.mouse.click(spot.x, spot.y)
  await page.waitForTimeout(280)
  const armed = await page.evaluate(() => (window.ARM && window.ARM.key) || null)
  return { key, spot, armed }
}
console.log('\n--- pressing the gap ---')
for (const k of [`d:${di}.0.0.+`, `d:${di}.1.0.+`, `g:${di}.0.+`, `g:${di}.3.+`]) {
  const r = await pressGap(k)
  console.log(JSON.stringify(r))
  await page.keyboard.press('Escape'); await page.waitForTimeout(150)
}
console.log('\nerrors:', errors.slice(0, 6))
await browser.close()
