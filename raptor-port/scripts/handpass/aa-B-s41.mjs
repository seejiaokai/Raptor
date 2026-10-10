import { world, fileInput, pic, sleep, go, openBoard, oilOn, openCount, tabTo, winState, availSet, closeWin, touchDrag, signIn, savePart } from './aa-B-lib.mjs'
const log = []
const say = (...a) => { const s = a.join(' '); log.push(s); console.log('  ' + s) }
const out = {}
const size = process.argv[2] || 'phone'
const who = process.argv[4] || 'ad'
const w = await world(size, who); w.tag = 's41' + size + who
const { page } = w
const f = await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', rmk: 'S41', s: '09:00', e: '12:00', oil: 'yes' })
const iid = f.rec.iid; say('filed', JSON.stringify(f.rec).slice(0, 120))
if (who === 'us') { await go(page, 'viewsched'); await sleep(600) } else await openBoard(page, 5)
if (who !== 'us' && process.argv[3] !== 'noearn') { const b = page.locator('[data-oilmode="5"]:visible, #sbOil:visible').first(); say('OIL Earn button found:', await b.count()); if (await b.count()) { await b.tap(); await sleep(700) } }
const vp = page.viewportSize()
const geo = () => page.evaluate(() => {
  const e = document.querySelector('.availwin'); if (!e) return null
  const r = e.getBoundingClientRect(); const cs = getComputedStyle(e)
  const cols = [...e.querySelectorAll('.rcol')].map(c => { const rr = c.getBoundingClientRect(); return { x: Math.round(rr.x), w: Math.round(rr.width), head: (c.querySelector('.rh') || {}).innerText, pucks: [...c.querySelectorAll('.rpuck, .seat')].length, ys: [...c.querySelectorAll('.rpuck, .seat')].slice(0, 4).map(p => Math.round(p.getBoundingClientRect().y)) } })
  const body = e.querySelector('.win-body') || e
  return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), bottom: Math.round(r.bottom), resize: cs.resize, cols, scrollH: body.scrollHeight, clientH: body.clientHeight }
})
const cnt = page.locator(who === 'us' ? `#vWeek .oilcount[data-oilsent="i:${iid}"]` : `#schedBoard .oilcount[data-oilsent="i:${iid}"]:visible`).first(); await cnt.scrollIntoViewIfNeeded(); await cnt.tap(); await sleep(600)
if ((await page.locator('.availwin .win-tab').count()) > 1) { await page.locator('.availwin .win-tab').first().tap(); await sleep(300) }
let g = await geo(); out.open = g; say('opened', JSON.stringify(g), `| viewport ${vp.width}x${vp.height}, height fraction ${(g.h / vp.height).toFixed(2)}`); await pic(w, 'open')
const tabs = await availSet(page); say('tabs', JSON.stringify(tabs.tabs))
// scroll the lists to the bottom with a finger
const lb = await page.locator('.availwin .rcols').first().boundingBox(); const bb = { x: lb.x, width: lb.width, y: lb.y, height: lb.height }
const scrollList = async () => { const lb = await page.locator('.availwin .rpuck, .availwin .seat.oilpk').nth(5).boundingBox(); for (let i = 0; i < 3; i++) await touchDrag(page, lb.x + 20, lb.y + 220, lb.x + 20, lb.y - 40, 16) }
await scrollList()
g = await geo(); say('after finger scrolls: window geometry', JSON.stringify({ y: g.y, h: g.h })); await pic(w, 'scrolled')
const lastP = await page.evaluate(() => { const c = document.querySelectorAll('.availwin .rcol'); return [...c].map(col => { const ps = [...col.querySelectorAll('[data-awp], .seat')]; const l = ps[ps.length - 1]; if (!l) return null; const r = l.getBoundingClientRect(); return { id: l.dataset.awp || l.dataset.oilp, y: Math.round(r.y), bottom: Math.round(r.bottom), vis: r.bottom <= innerHeight && r.y >= 0 } }) })
say('last man of each column reachable', JSON.stringify(lastP)); out.last = lastP
// earn tab (admin only)
if (tabs.tabs.length > 1) {
  await page.locator('.availwin .win-tab').nth(1).click(); await sleep(700)
  say('earn tab seats:', await page.locator('.availwin .seat.oilpk').count(), '| active tab:', await page.locator('.availwin .win-tab.on').innerText())
  await scrollList()
  const last = await page.evaluate(() => { const ss = [...document.querySelectorAll('.availwin .seat.oilpk[data-oilp]')]; const l = ss[ss.length - 1]; return l ? l.dataset.oilp : null })
  const before = await winState(page)
  const el = page.locator(`.availwin .seat.oilpk[data-oilp="${last}"]`).first(); await el.scrollIntoViewIfNeeded(); await el.tap(); await sleep(500)
  const after = await winState(page)
  say('lowest man in the list', last, 'switch', before.seats[last], '->', after.seats[last], '|', after.tabs[1]); out.low = { last, before: before.seats[last], after: after.seats[last] }
  await pic(w, 'earn-low')
}
// move the panel with a finger on its grip
const grip = await page.locator('.availwin .win-grip').boundingBox()
await touchDrag(page, grip.x + 4, grip.y + 4, grip.x + 4, grip.y - 160)
const g2 = await geo(); say('after dragging the grip upward: y', g.y, '->', g2.y); out.moved = { from: g.y, to: g2.y }; await pic(w, 'moved')
out.errors = w.errors
await w.browser.close()
savePart('s41-run' + size + who, { out, log })
