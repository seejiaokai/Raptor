// RX2-9 (the list's foot, three sizes) — arg: desk | p844 | l390. A new world each.
import { launch, world, bye, rec, FRI, sleep, logf } from './on-RX2-lib.mjs'
const SZ = process.argv[2] || 'desk'
const browser = await launch()
const w = await world(browser, { tag: 'R9-' + SZ, size: SZ }); const { page, tid, VW, VH, touch } = w
const L = '[data-testid="win-oilday"]'
w.say('Warden admin', await w.giveWarden())
// ten short inputs on Fri 17, different people
const pids = await page.evaluate(() => Object.keys(window.PEOPLE).filter(k => !['stiff', 'nact'].includes(k)).slice(0, 14))
w.say('people ids tried', pids)
const need = 10
const made = []
// filing is set up at the phone's upright size
if (SZ === 'l390') await page.setViewportSize({ width: 390, height: 844 })
for (const p of pids) {
  if (made.length >= need) break
  const i = made.length
  const hh = String(8 + (i % 9)).padStart(2, '0')
  const iid = await w.fileIt(FRI, { type: 'Meeting', people: [p], from: `${hh}:00`, to: `${hh}:30`, title: 'Short ' + (i + 1) })
  if (iid) made.push(iid); else w.say('could not file for', p)
}
w.say('ten filed', made.length)
if (SZ === 'l390') { await page.setViewportSize({ width: VW, height: VH }); await sleep(400) }
const d = await w.makeHoliday('National Day', FRI)
w.say('form dates', d)
const info = await w.listInfo()
w.say('list', info)
const R = {}
R.title = info && info.title; R.count0 = info && info.count; R.cards = info && info.cards.length
const scrollBody = pos => page.evaluate(([L, pos]) => {
  const win = document.querySelector(L); const e = [...win.querySelectorAll('*')].find(e => /(auto|scroll)/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 2)
  if (!e) return null
  e.scrollTop = pos === 'end' ? e.scrollHeight : pos === 'mid' ? Math.round((e.scrollHeight - e.clientHeight) / 2) : 0
  return { top: Math.round(e.scrollTop), sh: e.scrollHeight, ch: e.clientHeight, cls: e.className.toString().slice(0, 30) }
}, [L, pos])
// is any card showing through the foot? sample a grid of points over the foot's box
const footProbe = () => page.evaluate(L => {
  const win = document.querySelector(L)
  const later = win.querySelector('[data-testid="odl-later"]'), save = win.querySelector('[data-testid="odl-save"]'), left = win.querySelector('[data-testid="odl-left"]')
  let foot = later; while (foot && !foot.contains(save)) foot = foot.parentElement
  const fr = foot.getBoundingClientRect(), wr = win.getBoundingClientRect()
  const sc = [...win.querySelectorAll('*')].find(e => /(auto|scroll)/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 2)
  const sr = sc ? sc.getBoundingClientRect() : null
  let cardHits = 0, pts = 0
  for (let ix = 1; ix < 12; ix++) for (let iy = 1; iy < 4; iy++) {
    const x = fr.left + fr.width * ix / 12, y = fr.top + fr.height * iy / 4; pts++
    const h = document.elementFromPoint(x, y); if (h && h.closest('.icard')) cardHits++
  }
  const cards = [...win.querySelectorAll('.icard')].map(c => c.getBoundingClientRect())
  const overlapFoot = cards.filter(r => r.bottom > fr.top + 1 && r.top < fr.bottom - 1 && r.right > fr.left && r.left < fr.right).length
  return { foot: { top: Math.round(fr.top), bottom: Math.round(fr.bottom), h: Math.round(fr.height) }, win: { top: Math.round(wr.top), bottom: Math.round(wr.bottom) }, scroller: sr ? { top: Math.round(sr.top), bottom: Math.round(sr.bottom) } : null, scrollerEndsAboveFoot: sr ? sr.bottom <= fr.top + 1 : null, footBottomAtWindowBottom: Math.abs(fr.bottom - wr.bottom) <= 14, samples: pts, cardHitsInFoot: cardHits, cardsOverlappingFoot: overlapFoot }
}, L)
const snap = async name => {
  const o = { win: await w.measure(L), later: await w.measureT('odl-later'), save: await w.measureT('odl-save'), yesall: await w.measureT('odl-yesall'), noall: await w.measureT('odl-noall'), foot: await footProbe() }
  o.pageScroll = await page.evaluate(() => [window.scrollX, window.scrollY])
  await w.hush(); await w.shot(`R9-${SZ}-${name}`)
  return o
}
R.top = (await scrollBody('top'), await sleep(250), await snap('1-top'))
R.scMid = await scrollBody('mid'); await sleep(250)
R.mid = await snap('2-middle')
R.scEnd = await scrollBody('end'); await sleep(250)
R.end = await snap('3-end')
w.say('top', R.top); w.say('mid', R.mid); w.say('end', R.end)
// the real tap / click at a measured centre (no scrolling into view)
const hit = async t => {
  const m = await w.measureT(t)
  if (!m || !m.onTop || !m.inside) return { ok: false, m }
  const x = m.x + m.w / 2, y = m.y + m.h / 2
  if (touch) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y)
  await sleep(500)
  return { ok: true, m }
}
await scrollBody('top'); await sleep(250)
R.yesallTap = await hit('odl-yesall')
R.countAfter = (await w.tid('odl-count').innerText()).trim()
R.leftAfter = (await w.tid('odl-left').innerText()).trim()
R.saveLive = !(await w.tid('odl-save').isDisabled())
R.saveBeforeTap = await w.measureT('odl-save')
await w.hush(); await w.shot(`R9-${SZ}-4-after-yes-to-all-at-top`)
R.saveTap = await hit('odl-save')
R.closed = (await w.tid('win-oilday').count()) === 0
R.written = await page.evaluate(ids => ids.map(i => JSON.stringify((window.INPUTS.find(r => r.iid === i) || {}).oil || null)), made)
R.writtenCount = R.written.filter(x => x !== 'null').length
R.undo = await w.undoInfo()
R.toast = await w.toast()
w.say('R', R)
R.errors = await bye(w)
w.say('errors', R.errors)
await browser.close()
import { writeFileSync } from 'node:fs'
writeFileSync(`docs/handpass/parts/on-RX2-r9-${SZ}.json`, JSON.stringify(R, null, 1))
