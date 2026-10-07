/* Walker P re-walk: P4c-15 — a visible caret stays reachable on a short screen. Saturday state, a very long wrapped Remarks typed first (on the desktop week),
   then the phone / phone Desktop layout / landscape / short desktop; each in its own fresh world. */
import * as R from './stk2-P-run.mjs'
const { S, finish, nav, openBoard, boxList, clickBox, caret, caretIdx, label, snap, same, sleep, pic, scopeSel, ensureHelper } = R
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null
const want = id => !ONLY || ONLY.includes(id)
const PART = 'short' + (ONLY ? '-' + ONLY.join('+') : '')
const ST = { state: process.env.STK_STATE }
const typeNow = async (page, txt) => { await page.keyboard.press('Control+A'); await page.keyboard.type(txt, { delay: 4 }) }
/* how much of the focused box can a finger land on: sample a 5x3 grid of its on-screen part */
const expose = page => page.evaluate(() => {
  const e = document.activeElement; if (!e || e === document.body) return null
  const r = e.getBoundingClientRect(); const L = Math.max(0, r.left), R = Math.min(innerWidth, r.right), T = Math.max(0, r.top), B = Math.min(innerHeight, r.bottom)
  if (R <= L || B <= T) return { frac: 0, onScreen: false, why: 'outside the window' }
  let ok = 0, n = 0; const cover = {}
  for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) { const x = L + (R - L) * (i + 0.5) / 5, y = T + (B - T) * (j + 0.5) / 3; const h = document.elementFromPoint(x, y); n++; if (h === e || e.contains(h)) ok++; else if (h) { const k = h.id || h.className.toString().slice(0, 24) || h.tagName; cover[k] = (cover[k] || 0) + 1 } }
  const fullyIn = r.left >= -0.5 && r.right <= innerWidth + 0.5 && r.top >= -0.5 && r.bottom <= innerHeight + 0.5
  return { frac: ok / n, onScreen: true, fullyIn, cover, box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }
})
async function tour(page, scope, name, { maxN = 400 } = {}) {
  await ensureHelper(page)
  const list = await boxList(page, scope)
  const s0 = await snap(page)
  await clickBox(page, scope, 0)
  const bad = [], stops = []
  let wrongIx = 0
  const day0 = await page.evaluate(() => window.SBDAY)
  for (let k = 1; k < Math.min(list.length, maxN); k++) {
    await page.keyboard.press('Tab'); await sleep(45)
    const ix = await caretIdx(page, scope); if (ix !== k) { wrongIx++; if (wrongIx < 4) bad.push({ at: k, ix }) }
    const ex = await expose(page)
    stops.push(ex)
    if (!ex || ex.frac < 0.5) bad.push({ at: k, key: list[k].key, ex: ex && { frac: ex.frac, cover: ex.cover, box: ex.box } })
  }
  const lastIx = Math.min(list.length, maxN) - 1
  const bad2 = []
  for (let k = lastIx - 1; k >= 0; k--) {
    await page.keyboard.press('Shift+Tab'); await sleep(45)
    const ix = await caretIdx(page, scope); if (ix !== k) { bad2.push({ at: k, ix }); if (bad2.length > 3) break }
    const ex = await expose(page)
    if (!ex || ex.frac < 0.5) bad2.push({ at: k, key: list[k].key, ex: ex && { frac: ex.frac, cover: ex.cover, box: ex.box } })
  }
  const s1 = await snap(page)
  const day1 = await page.evaluate(() => window.SBDAY)
  const fr = stops.filter(Boolean).map(s => s.frac)
  const partIn = stops.filter(s => s && s.onScreen && !s.fullyIn).length
  return { n: list.length, bad, bad2, same: same(s0, s1), minFrac: Math.min(...fr), partIn, dayKept: day0 === day1 }
}
async function longRemark(page) {
  await page.setViewportSize({ width: 1440, height: 900 }); await sleep(400)
  await nav(page, 'editsched')
  const wk = scopeSel('week', 5); const list = await boxList(page, wk); const ix = list.findIndex(b => b.key === 'fr:5.0.0.0')
  await clickBox(page, wk, ix); await typeNow(page, 'THIS IS A VERY LONG REMARK THAT MUST WRAP ONTO SEVERAL LINES ON A NARROW PHONE SCREEN AND KEEP GOING FOR A WHILE SO THE BOX GROWS TALL ' + 'WRAP '.repeat(14)); await page.keyboard.press('Tab'); await sleep(500)
}
const verdictChecks = (r, extra = []) => [['all ' + r.n + ' boxes reached in order (forward)', r.bad.filter(b => b.ix !== undefined).length === 0, r.bad.filter(b => b.ix !== undefined)], ['every focused box is at least half exposed (nothing — arrows, bars, drawer — sits on top of it)', r.bad.filter(b => b.ex !== undefined).length === 0 && r.bad2.filter(b => b.ex !== undefined).length === 0, { fwd: r.bad.filter(b => b.ex !== undefined).slice(0, 6), back: r.bad2.filter(b => b.ex !== undefined).slice(0, 6), minFrac: r.minFrac }], ['reverse in order', r.bad2.filter(b => b.ix !== undefined).length === 0, r.bad2.filter(b => b.ix !== undefined)], ['no writes; the day unchanged (stops with the box only partly inside the window: ' + r.partIn + ')', r.same && r.dayKept, { partIn: r.partIn, dayKept: r.dayKept }], ...extra]

if (want('phone-week')) await S(PART, 'P4c-15-phone-week', 'Phone 390x844, Edit Schedule week, Saturday (long day, one very long wrapped Remarks): Tabbed from the first box through every open box and Shift+Tabbed back, measuring how much of each focused box a finger can land on', ST, async page => {
  await longRemark(page)
  await page.setViewportSize({ width: 390, height: 844 }); await sleep(600)
  await nav(page, 'editsched')
  const r = await tour(page, scopeSel('week', 5), 'week')
  return { checks: verdictChecks(r), pics: [await pic(page, 'P4c-15-phone-week-end')] }
})
if (want('phone-board')) await S(PART, 'P4c-15-phone-board', 'Phone 390x844, Scheduler Board (phone layout), Saturday: same route', ST, async page => {
  await longRemark(page)
  await page.setViewportSize({ width: 390, height: 844 }); await sleep(600)
  await openBoard(page, 5)
  const r = await tour(page, scopeSel('board', 5), 'board')
  return { checks: verdictChecks(r), pics: [await pic(page, 'P4c-15-phone-board-end')] }
})
if (want('phone-wide')) await S(PART, 'P4c-15-phone-board-desktop-layout', 'Phone 390x844, Scheduler Board in the Desktop layout (More → Desktop layout), panned sideways to the far end; same route', ST, async page => {
  await longRemark(page)
  await page.setViewportSize({ width: 390, height: 844 }); await sleep(600)
  await openBoard(page, 5)
  await page.locator('#sbMore').click(); await sleep(300); await page.locator('#sbMoreWide').click(); await sleep(800)
  const wide = await page.evaluate(() => document.querySelector('#schedBoard').classList.contains('sb-wide'))
  await page.evaluate(() => { const b = document.querySelector('#schedBoard'); const s = [b, ...b.querySelectorAll('*')].find(e => e.scrollWidth > e.clientWidth + 50 && getComputedStyle(e).overflowX !== 'visible'); if (s) s.scrollLeft = s.scrollWidth })
  await sleep(300)
  const p = [await pic(page, 'P4c-15-phone-desktop-layout-panned')]
  const r = await tour(page, scopeSel('board', 5), 'wide')
  p.push(await pic(page, 'P4c-15-phone-desktop-layout-end'))
  const sx = await page.evaluate(() => { const b = document.querySelector('#schedBoard'); const s = [b, ...b.querySelectorAll('*')].find(e => e.scrollWidth > e.clientWidth + 50 && getComputedStyle(e).overflowX !== 'visible'); return s ? { left: Math.round(s.scrollLeft), max: s.scrollWidth - s.clientWidth } : null })
  return { checks: verdictChecks(r, [['the Desktop layout is on (class sb-wide)', wide, wide], ['sideways pan position after the route (for the record)', true, sx]]), pics: p }
})
if (want('landscape')) await S(PART, 'P4c-15-landscape-board', 'Phone on its side 844x390, Scheduler Board: same route', ST, async page => {
  await longRemark(page)
  await page.setViewportSize({ width: 844, height: 390 }); await sleep(700)
  await openBoard(page, 5)
  const r = await tour(page, scopeSel('board', 5), 'land')
  return { checks: verdictChecks(r), pics: [await pic(page, 'P4c-15-landscape-board-end')] }
})
if (want('short')) await S(PART, 'P4c-15-short-desktop-board', 'Short desktop 1280x700, Scheduler Board: same route', ST, async page => {
  await longRemark(page)
  await page.setViewportSize({ width: 1280, height: 700 }); await sleep(700)
  await openBoard(page, 5)
  const r = await tour(page, scopeSel('board', 5), 'short')
  return { checks: verdictChecks(r), pics: [await pic(page, 'P4c-15-1280x700-board-end')] }
})
if (want('short-week')) await S(PART, 'P4c-15-short-desktop-week', 'Short desktop 1280x700, Edit Schedule week, Saturday: same route', ST, async page => {
  await longRemark(page)
  await page.setViewportSize({ width: 1280, height: 700 }); await sleep(700)
  await nav(page, 'editsched')
  const r = await tour(page, scopeSel('week', 5), 'shortw')
  return { checks: verdictChecks(r), pics: [await pic(page, 'P4c-15-1280x700-week-end')] }
})
await finish(PART)
