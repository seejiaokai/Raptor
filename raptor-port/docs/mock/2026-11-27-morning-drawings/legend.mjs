/* Picture set 1 — Edit Schedule's Legend with his line drawn at its foot (D2803): an outlined empty time box in grey,
   one in red, beside "Time missing, fill it". The outlines are read from the app's own outlined box on the page. */
import { BASE, login, open, go, sleep, L, setTxt, press, signPill, shot, mark, unmark, rectOf } from './draw-lib.mjs'
const dev = process.argv[2] || 'D'
const { browser, page, errors } = await open(dev)
await go(page, 'editsched')
const DI = 3, K = 'ap:3.1.end'
const look = () => page.evaluate((K) => {
  const e = document.querySelector(`#eWeek [data-txt="${K}"]`); const cs = getComputedStyle(e); const r = e.getBoundingClientRect()
  return { cls: e.className, shadow: cs.boxShadow, radius: cs.borderRadius, w: Math.round(r.width), h: Math.round(r.height), font: cs.fontSize }
}, K)
// 1. a real box made empty (grey, drafting), then a refused sign-off (red) — the app's own two outlines
await setTxt(page, K, '')
await page.evaluate(() => document.activeElement && document.activeElement.blur()); await sleep(300)
const grey = await look(); L('grey', grey)
await press(page, signPill(page, DI, 'cur'), { force: true }); await sleep(600)
const red = await look(); L('red', red)
// a fresh demo world for the picture, so the day carries no change from reading the outlines
await page.goto(BASE + '/?fresh=1'); await login(page, 'a'); await go(page, 'editsched')
// 2. the Legend opened as a person opens it
await page.evaluate(() => scrollTo(0, 0)); await sleep(200)
await press(page, page.locator('#eLegendBox > summary'))
await sleep(400)
const legStyle = await page.evaluate(() => {
  const last = [...document.querySelectorAll('#eLegend > span')].pop(); const q = last.querySelector('.qk')
  const cs = getComputedStyle(last), qs = getComputedStyle(q)
  return { text: last.textContent, font: cs.fontSize + ' ' + cs.fontFamily, color: cs.color, qkH: qs.height, qkR: qs.borderRadius, qkMr: qs.marginRight }
})
L('legend last item', legStyle)
// 3. his line, drawn in the Legend's own item shape (a swatch, then the words), at its foot
await page.evaluate(({ g, r }) => {
  const box = (sh) => `<span class="qk" style="background:transparent;box-shadow:${sh};border-radius:4px;min-width:26px;padding:0;margin-right:3px"></span>`
  const s = document.createElement('span'); s.id = 'drawLine'; s.style.marginLeft = '8px'
  s.innerHTML = box(g) + box(r).replace('margin-right:3px', 'margin-right:5px') + 'Time missing, fill it'
  document.getElementById('eLegend').appendChild(s)
}, { g: grey.shadow, r: red.shadow })
await sleep(200)
const drawn = await page.evaluate(() => { const e = document.getElementById('drawLine'); const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return { font: cs.fontSize + ' ' + cs.fontFamily, color: cs.color, r: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], vw: innerWidth } })
L('drawn', drawn)
await page.evaluate(() => scrollTo(0, 0)); await sleep(300)
L('legend box', await page.evaluate(() => { const r = document.getElementById('eLegendBox').getBoundingClientRect(); return [Math.round(r.top), Math.round(r.bottom), innerHeight] }))
await shot(page, `legend-${dev}`)
await mark(page, '#drawLine', 5)
await shot(page, `legend-${dev}-crop`, await rectOf(page, '#eLegendBox', 10))
await unmark(page)
L('errors', errors)
await browser.close()
