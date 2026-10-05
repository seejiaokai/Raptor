/* Walker D, world 5: P4c-15 — a visible caret stays reachable on a short screen (phone, phone Desktop layout, landscape, short desktop).
   Built Saturday (a long day); a long wrapped Remarks typed first. */
import * as H from './stk-D-lib.mjs'
const { open, nav, openBoard, boxList, clickBox, caret, caretIdx, label, snap, same, sleep, pic, row, savePart, scopeSel, ensureHelper } = H
const { browser, page, errors } = await open({ width: 390, height: 844, who: 'a', fresh: false, state: process.env.STK_STATE })
page.setDefaultTimeout(9000)
async function S(id, did, fn) {
  try {
    const r = await fn()
    const bad = r.checks.filter(c => !c[1])
    row(id, did, r.checks.map(c => `${c[1] ? '✓' : '✗'} ${c[0]}${c[2] !== undefined ? ' [' + (typeof c[2] === 'string' ? c[2] : JSON.stringify(c[2])).slice(0, 700) + ']' : ''}`).join(' · '), r.verdict || (bad.length ? 'FAIL' : 'PASS'), r.pics || [])
  } catch (e) { row(id, did, 'ERROR ' + String(e.message || e).slice(0, 500), 'NOT WALKED (script error — re-run)', [await pic(page, 'ERR-' + id)]) }
  savePart('world5')
}
const typeNow = async txt => { await page.keyboard.press('Control+A'); await page.keyboard.type(txt, { delay: 4 }) }
/* how much of the focused box can a finger land on: sample a 5x3 grid of its on-screen part, count the points whose topmost element is the box */
const expose = () => page.evaluate(() => {
  const e = document.activeElement; if (!e || e === document.body) return null
  const r = e.getBoundingClientRect(); const L = Math.max(0, r.left), R = Math.min(innerWidth, r.right), T = Math.max(0, r.top), B = Math.min(innerHeight, r.bottom)
  if (R <= L || B <= T) return { frac: 0, onScreen: false, why: 'outside the window' }
  let ok = 0, n = 0, cover = {}
  for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) { const x = L + (R - L) * (i + 0.5) / 5, y = T + (B - T) * (j + 0.5) / 3; const h = document.elementFromPoint(x, y); n++; if (h === e || e.contains(h)) ok++; else if (h) { const k = h.id || h.className.toString().slice(0, 24) || h.tagName; cover[k] = (cover[k] || 0) + 1 } }
  const fullyIn = r.left >= -0.5 && r.right <= innerWidth + 0.5 && r.top >= -0.5 && r.bottom <= innerHeight + 0.5
  return { frac: ok / n, onScreen: true, fullyIn, cover, box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }
})
async function tour(scope, name, { maxN = 400, pics = [], shotEvery = 0 } = {}) {
  await ensureHelper(page)
  const list = await boxList(page, scope)
  const s0 = await snap(page)
  await clickBox(page, scope, 0)
  const bad = [], worst = []
  let wrongIx = 0
  const stops = []
  for (let k = 1; k < Math.min(list.length, maxN); k++) {
    await page.keyboard.press('Tab'); await sleep(45)
    const ix = await caretIdx(page, scope); if (ix !== k) { wrongIx++; if (wrongIx < 4) bad.push({ at: k, ix }) }
    const ex = await expose()
    stops.push(ex)
    if (!ex || ex.frac < 0.5) bad.push({ at: k, key: list[k].key, ex: ex && { frac: ex.frac, cover: ex.cover, box: ex.box } })
    if (shotEvery && k % shotEvery === 0) pics.push(await pic(page, `${name}-stop${k}`))
  }
  // reverse from the last stop
  const lastIx = Math.min(list.length, maxN) - 1
  const bad2 = []
  for (let k = lastIx - 1; k >= 0; k--) {
    await page.keyboard.press('Shift+Tab'); await sleep(45)
    const ix = await caretIdx(page, scope); if (ix !== k) { bad2.push({ at: k, ix }); if (bad2.length > 3) break }
    const ex = await expose()
    if (!ex || ex.frac < 0.5) bad2.push({ at: k, key: list[k].key, ex: ex && { frac: ex.frac, cover: ex.cover, box: ex.box } })
  }
  const s1 = await snap(page)
  const fr = stops.filter(Boolean).map(s => s.frac)
  const notFullyIn = stops.filter(s => s && s.onScreen && !s.fullyIn).length
  return { n: list.length, bad, bad2, same: same(s0, s1), minFrac: Math.min(...fr), partIn: notFullyIn }
}
await nav(page, 'editsched')
// a long wrapped Remarks on the first flying line (typed on the week)
await page.setViewportSize({ width: 1440, height: 900 }); await sleep(400)
{
  const wk = scopeSel('week', 5); const list = await boxList(page, wk); const ix = list.findIndex(b => b.key === 'fr:5.0.0.0')
  await clickBox(page, wk, ix); await typeNow('THIS IS A VERY LONG REMARK THAT MUST WRAP ONTO SEVERAL LINES ON A NARROW PHONE SCREEN AND KEEP GOING FOR A WHILE SO THE BOX GROWS TALL ' + 'WRAP '.repeat(14)); await page.keyboard.press('Tab'); await sleep(500)
}
await page.setViewportSize({ width: 390, height: 844 }); await sleep(600)
await nav(page, 'editsched')
const pics = []
await S('P4c-15-phone-week', 'Phone 390x844, Edit Schedule week, Saturday (long day, one very long wrapped Remarks): Tabbed from the first box through every open box and Shift+Tabbed back, measuring how much of each focused box a finger can land on', async () => {
  const r = await tour(scopeSel('week', 5), 'P4c-15-phone-week')
  const p = [await pic(page, 'P4c-15-phone-week-end')]
  return { checks: [['all ' + r.n + ' boxes reached in order (forward)', r.bad.filter(b => b.ix !== undefined).length === 0, r.bad.filter(b => b.ix !== undefined)], ['every focused box is at least half exposed (nothing sits on top of it)', r.bad.filter(b => b.ex !== undefined).length === 0 && r.bad2.filter(b => b.ex !== undefined).length === 0, { fwd: r.bad.filter(b => b.ex !== undefined).slice(0, 5), back: r.bad2.filter(b => b.ex !== undefined).slice(0, 5), minFrac: r.minFrac }], ['reverse in order', r.bad2.filter(b => b.ix !== undefined).length === 0, r.bad2.filter(b => b.ix !== undefined)], ['no writes; stops with the box only partly inside the window', r.same, { partIn: r.partIn }]], pics: p }
})
await openBoard(page, 5)
await S('P4c-15-phone-board', 'Phone 390x844, Scheduler Board (phone layout), Saturday: same route', async () => {
  const r = await tour(scopeSel('board', 5), 'P4c-15-phone-board')
  const p = [await pic(page, 'P4c-15-phone-board-end')]
  return { checks: [['all ' + r.n + ' boxes reached in order (forward)', r.bad.filter(b => b.ix !== undefined).length === 0, r.bad.filter(b => b.ix !== undefined)], ['every focused box at least half exposed', r.bad.filter(b => b.ex !== undefined).length === 0 && r.bad2.filter(b => b.ex !== undefined).length === 0, { fwd: r.bad.filter(b => b.ex !== undefined).slice(0, 6), back: r.bad2.filter(b => b.ex !== undefined).slice(0, 6), minFrac: r.minFrac }], ['reverse in order', r.bad2.filter(b => b.ix !== undefined).length === 0, r.bad2.filter(b => b.ix !== undefined)], ['no writes', r.same, { partIn: r.partIn }]], pics: p }
})
await S('P4c-15-phone-board-desktop-layout', 'Phone 390x844, Scheduler Board in the Desktop layout (More → Desktop layout), panned sideways to the Remarks end; same route', async () => {
  await page.locator('#sbMore').click(); await sleep(300); await page.locator('#sbMoreWide').click(); await sleep(800)
  const wide = await page.evaluate(() => document.querySelector('#schedBoard').classList.contains('sb-wide'))
  // pan sideways to the far end
  await page.evaluate(() => { const b = document.querySelector('#schedBoard'); const s = [b, ...b.querySelectorAll('*')].find(e => e.scrollWidth > e.clientWidth + 50 && getComputedStyle(e).overflowX !== 'visible'); if (s) s.scrollLeft = s.scrollWidth })
  await sleep(300)
  const p = [await pic(page, 'P4c-15-phone-desktop-layout-panned')]
  const r = await tour(scopeSel('board', 5), 'P4c-15-wide', { maxN: 400 })
  p.push(await pic(page, 'P4c-15-phone-desktop-layout-end'))
  const sx = await page.evaluate(() => { const b = document.querySelector('#schedBoard'); const s = [b, ...b.querySelectorAll('*')].find(e => e.scrollWidth > e.clientWidth + 50 && getComputedStyle(e).overflowX !== 'visible'); return s ? { left: Math.round(s.scrollLeft), max: s.scrollWidth - s.clientWidth } : null })
  return { checks: [['the Desktop layout is on (class sb-wide)', wide, wide], ['all ' + r.n + ' boxes reached in order (forward)', r.bad.filter(b => b.ix !== undefined).length === 0, r.bad.filter(b => b.ix !== undefined)], ['every focused box at least half exposed (arrows, bars, crew drawer not on top)', r.bad.filter(b => b.ex !== undefined).length === 0 && r.bad2.filter(b => b.ex !== undefined).length === 0, { fwd: r.bad.filter(b => b.ex !== undefined).slice(0, 6), back: r.bad2.filter(b => b.ex !== undefined).slice(0, 6), minFrac: r.minFrac }], ['reverse in order', r.bad2.filter(b => b.ix !== undefined).length === 0, r.bad2.filter(b => b.ix !== undefined)], ['sideways pan position after the route (the app scrolled to the boxes)', true, sx], ['no writes', r.same, { partIn: r.partIn }]], pics: p }
})
await page.locator('#sbMore').click().catch(() => {}); await sleep(300); await page.locator('#sbMorePhone').click().catch(() => {}); await sleep(500)
await page.setViewportSize({ width: 844, height: 390 }); await sleep(700)
await S('P4c-15-landscape-board', 'Phone on its side 844x390, Scheduler Board: same route', async () => {
  const r = await tour(scopeSel('board', 5), 'P4c-15-landscape')
  const p = [await pic(page, 'P4c-15-landscape-board-end')]
  return { checks: [['all ' + r.n + ' boxes reached in order (forward)', r.bad.filter(b => b.ix !== undefined).length === 0, r.bad.filter(b => b.ix !== undefined)], ['every focused box at least half exposed', r.bad.filter(b => b.ex !== undefined).length === 0 && r.bad2.filter(b => b.ex !== undefined).length === 0, { fwd: r.bad.filter(b => b.ex !== undefined).slice(0, 6), back: r.bad2.filter(b => b.ex !== undefined).slice(0, 6), minFrac: r.minFrac }], ['reverse in order', r.bad2.filter(b => b.ix !== undefined).length === 0, r.bad2.filter(b => b.ix !== undefined)], ['no writes', r.same, { partIn: r.partIn }]], pics: p }
})
await page.setViewportSize({ width: 1280, height: 700 }); await sleep(700)
await S('P4c-15-short-desktop-board', 'Short desktop 1280x700, Scheduler Board: same route', async () => {
  const r = await tour(scopeSel('board', 5), 'P4c-15-1280x700')
  const p = [await pic(page, 'P4c-15-1280x700-board-end')]
  return { checks: [['all ' + r.n + ' boxes reached in order (forward)', r.bad.filter(b => b.ix !== undefined).length === 0, r.bad.filter(b => b.ix !== undefined)], ['every focused box at least half exposed', r.bad.filter(b => b.ex !== undefined).length === 0 && r.bad2.filter(b => b.ex !== undefined).length === 0, { fwd: r.bad.filter(b => b.ex !== undefined).slice(0, 6), back: r.bad2.filter(b => b.ex !== undefined).slice(0, 6), minFrac: r.minFrac }], ['reverse in order', r.bad2.filter(b => b.ix !== undefined).length === 0, r.bad2.filter(b => b.ix !== undefined)], ['no writes', r.same, { partIn: r.partIn }]], pics: p }
})
console.log('ERRORS', JSON.stringify(errors))
row('ERRORS-world5', 'console / page errors / 4xx during world 5', errors.length ? errors.join(' || ') : 'none', errors.length ? 'FINDING' : 'PASS')
savePart('world5', { errors })
await browser.close()
