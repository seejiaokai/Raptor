/* [BOARD-PHONE-PINCH-ZOOM] (D1107–D1110) — the walk, by real fingers over CDP (two-finger pinches, a held puck), at his
   iPhone's size (402 × 874, touch). Every line asserts the RIGHT behaviour, so re-running it is the re-walk.
   Run: HP_URL=http://localhost:<port> HP_SHOTS=<folder> [PZ_ONLY=board|quals] node scripts/handpass/pz-walk.mjs */
console.log('pz-walk v1')
import { existsSync, mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'
const { BASE, SHOTS, login, go } = await import('./lib.mjs')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const ONLY = process.env.PZ_ONLY || ''
mkdirSync(SHOTS, { recursive: true })
const sleep = ms => new Promise(r => setTimeout(r, ms))
let fails = 0
const check = (ok, what, extra = '') => { console.log(`${ok ? 'PASS' : 'FAIL'} ${what}${extra ? ' — ' + extra : ''}`); if (!ok) fails++ }

const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const ctx = await browser.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })
await ctx.clock.install({ time: new Date('2026-07-14T09:00:00') })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
await page.goto(BASE + '/')
await login(page, 'a')
await page.addStyleTag({ content: '#toastEl{visibility:hidden!important}' })
const cdp = await ctx.newCDPSession(page)
const T = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x: Math.round(x), y: Math.round(y), id: i + 1 })) })

/** two fingers about (cx, cy), from d0 apart to d1 apart, sideways, in steps; the centre may slide by (mx, my) */
async function pinch(cx, cy, d0, d1, { steps = 12, mx = 0, my = 0, liftOne = false } = {}) {
  const at = i => { const d = d0 + (d1 - d0) * i / steps, x = cx + mx * i / steps, y = cy + my * i / steps; return [[x - d / 2, y], [x + d / 2, y]] }
  await T('touchStart', [at(0)[0]]); await sleep(30)
  await T('touchStart', at(0)); await sleep(30)
  for (let i = 1; i <= steps; i++) { await T('touchMove', at(i)); await sleep(20) }
  if (liftOne) { await T('touchEnd', [at(steps)[0]]); await sleep(40) }
  await T('touchEnd', []); await sleep(350)
}
async function swipe(x1, y1, x2, y2, steps = 10) {
  await T('touchStart', [[x1, y1]])
  for (let i = 1; i <= steps; i++) { await T('touchMove', [[x1 + (x2 - x1) * i / steps, y1 + (y2 - y1) * i / steps]]); await sleep(18) }
  await T('touchEnd', []); await sleep(400)
}
const hits = sel => page.evaluate(s => {
  const b = document.querySelector(s); if (!b || !b.getClientRects().length) return false
  const q = b.getBoundingClientRect(), at = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2)
  return !!at && (at === b || b.contains(at)) && q.left >= 0 && q.right <= innerWidth
}, sel)

/* ------------------------------------------------------------------ the board */
if (ONLY !== 'quals') {
  await go(page, 'editsched')
  await page.locator('#eWeek [data-sbday="0"]:visible').first().tap()
  await page.waitForSelector('#schedBoard:not([hidden])'); await sleep(500)
  await page.locator('#sbMore').tap(); await page.locator('#sbMoreWide').tap(); await sleep(600)
  const B = () => page.evaluate(() => {
    const b = document.getElementById('schedBoard'), m = b.querySelector('.sb-main'), t = b.querySelector('.sb-top')
    const z = parseFloat(m.style.zoom || '1')
    return { z, sw: b.scrollWidth, cw: b.clientWidth, sl: b.scrollLeft, barW: Math.round(t.getBoundingClientRect().width), barH: Math.round(t.getBoundingClientRect().height), barL: Math.round(t.getBoundingClientRect().left), mainW: Math.round(m.getBoundingClientRect().width), tf: m.style.transform }
  })
  let s = await B()
  check(s.barW === 402 && s.barL === 0, "B1 the desktop layout's bar is the screen's width", JSON.stringify(s))
  check(await hits('#sbDone') && await hits('#sbNextDay') && await hits('#sbCal'), 'B1 ✓ Done, the next-day arrow and the calendar take a press at once')
  check(s.z === 1 && s.mainW === 1180, 'B1 the day opens at today\'s size', `zoom ${s.z}, day ${s.mainW} wide`)
  await page.screenshot({ path: `${SHOTS}/b1-opens.png` })
  /* B2 pinch right out */
  await pinch(200, 450, 220, 40)
  s = await B()
  check(Math.abs(s.z - 402 / 1180) < 0.01, 'B2 a pinch out stops where the whole day fits', `zoom ${s.z.toFixed(3)}`)
  check(s.sw <= s.cw + 1, 'B2 nothing left to slide sideways', `${s.sw} / ${s.cw}`)
  check(!s.tf, 'B2 the stretch is gone at the lift (laid out sharp)')
  check(s.barW === 402 && Math.abs(s.barH - 75) <= 4, 'B2 the bar did not zoom', `${s.barW}×${s.barH}`)
  check(await hits('#sbDone'), 'B2 ✓ Done takes a press zoomed out')
  await page.screenshot({ path: `${SHOTS}/b2-fit.png` })
  /* B3 pinch in, past twice */
  await pinch(200, 450, 60, 180)
  s = await B()
  check(s.z > 0.9 && s.z < 1.1, 'B3 a pinch in three times wider comes back near today\'s size', `zoom ${s.z.toFixed(3)}`)
  await pinch(200, 450, 60, 300)
  s = await B()
  check(Math.abs(s.z - 2) < 0.001, 'B3 a pinch further in stops at twice', `zoom ${s.z}`)
  await page.screenshot({ path: `${SHOTS}/b3-twice.png` })
  /* B4 the spot under the fingers stays under them: pinch out about a time box and find it near the same place */
  await pinch(200, 450, 200, 120)
  s = await B()
  const z4 = s.z
  const target = await page.evaluate(() => { const e = document.elementFromPoint(200, 450); return e ? (e.getAttribute('data-k') || e.className || e.tagName) + '|' + (e.textContent || '').trim().slice(0, 20) : '' })
  await pinch(200, 450, 120, 80)
  const after = await page.evaluate(() => { const e = document.elementFromPoint(200, 450); return e ? (e.getAttribute('data-k') || e.className || e.tagName) + '|' + (e.textContent || '').trim().slice(0, 20) : '' })
  s = await B()
  console.log(`  B4 under the fingers: before "${target}" (zoom ${z4.toFixed(2)}), after "${after}" (zoom ${s.z.toFixed(2)})`)
  check(target === after, 'B4 what was under the fingers is still under them after the lift')
  /* B5 a day change keeps the zoom */
  const zKeep = s.z
  await page.locator('#sbNextDay').tap(); await sleep(700)
  s = await B()
  check(Math.abs(s.z - zKeep) < 0.001, 'B5 the next day keeps the zoom', `${zKeep.toFixed(3)} → ${s.z.toFixed(3)}`)
  await page.locator('#sbPrevDay').tap(); await sleep(700)
  /* B6 one finger still scrolls sideways */
  const sl0 = (await B()).sl
  await swipe(300, 600, 100, 600)
  const sl1 = (await B()).sl
  check(sl1 > sl0 + 50, 'B6 one finger still slides the day sideways', `${sl0} → ${sl1}`)
  /* B7 the edge scroll: a puck from the crew list carried to the screen's left edge slides the day back, then dropped */
  await pinch(200, 450, 100, 60)   // about 0.6 of today's size
  s = await B()
  await page.evaluate(() => { const b = document.getElementById('schedBoard'); b.scrollLeft = b.scrollWidth })
  await sleep(300)
  const puck = await page.evaluate(() => {
    const p = [...document.querySelectorAll('#schedBoard .sb-roster [data-drag]')].find(e => { const r = e.getBoundingClientRect(); return !/^ALL/.test((e.textContent || '').trim()) && r.width && r.left > 0 && r.right < innerWidth && r.top > 200 && r.bottom < innerHeight - 20 })
    if (!p) return null
    const r = p.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, cs: (p.textContent || '').trim().split(/\s+/)[0] }
  })
  if (!puck) check(false, 'B7 a crew puck in view at the right end')
  else {
    const slStart = (await B()).sl
    await T('touchStart', [[puck.x, puck.y]]); await sleep(320)                     // the hold picks it up
    for (let i = 1; i <= 10; i++) { await T('touchMove', [[puck.x - (puck.x - 14) * i / 10, 420]]); await sleep(20) }
    await sleep(1600)                                                                // held still at the edge
    const slEdge = (await B()).sl
    check(slEdge < slStart - 150, 'B7 a puck held at the left edge slides the day back', `${slStart} → ${slEdge}`)
    await page.screenshot({ path: `${SHOTS}/b7-edge.png` })
    /* now over a seat: the first empty FCP seat of the first wave */
    const seat = await page.evaluate(() => {
      const c = [...document.querySelectorAll('#schedBoard .sb-arow [data-fill]')].find(e => { const r = e.getBoundingClientRect(); return r.width && r.left > 60 && r.right < innerWidth - 60 && r.top > 120 && r.bottom < innerHeight - 60 && !e.querySelector('.puck') })
      if (!c) return null
      const r = c.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, k: c.getAttribute('data-slot') || c.getAttribute('data-k') }
    })
    if (!seat) { check(false, 'B7 an empty Common Programme row in view after the edge scroll'); await T('touchEnd', []) }
    else {
      for (let i = 1; i <= 8; i++) { await T('touchMove', [[14 + (seat.x - 14) * i / 8, 420 + (seat.y - 420) * i / 8]]); await sleep(25) }
      await sleep(200)
      const lit = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); const t = e && e.closest('[data-fill]'); return !!t && t.classList.contains('dragover') }, [seat.x, seat.y])
      check(lit, 'B7 the empty row under the finger lights as the drop target, zoomed')
      await T('touchEnd', []); await sleep(600)
      const landed = await page.evaluate(([x, y, cs]) => { const e = document.elementFromPoint(x, y); const t = e && e.closest('[data-fill]'); return t ? (t.textContent || '').includes(cs) : false }, [seat.x, seat.y, puck.cs])
      check(landed, `B7 ${puck.cs} landed on that row`)
      await page.screenshot({ path: `${SHOTS}/b7-dropped.png` })
    }
  }
  /* B8 a second finger during the hold makes a pinch, not a pick-up */
  const p2 = await page.evaluate(() => { const p = [...document.querySelectorAll('#schedBoard [data-drag]')].find(e => { const r = e.getBoundingClientRect(); return r.width && r.left > 40 && r.right < innerWidth - 120 && r.top > 200 && r.bottom < innerHeight - 40 }); if (!p) return null; const r = p.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
  if (p2) {
    const z8 = (await B()).z
    await T('touchStart', [[p2.x, p2.y]]); await sleep(60)
    await T('touchStart', [[p2.x, p2.y], [p2.x + 80, p2.y]]); await sleep(30)
    for (let i = 1; i <= 10; i++) { await T('touchMove', [[p2.x - 4 * i, p2.y], [p2.x + 80 + 8 * i, p2.y]]); await sleep(20) }
    const ghost = await page.evaluate(() => !!document.querySelector('.tdghost'))
    await T('touchEnd', []); await sleep(400)
    const z8b = (await B()).z
    check(!ghost && z8b > z8, 'B8 a finger on a puck then a second finger: a pinch, no puck lifted', `ghost ${ghost}, zoom ${z8.toFixed(2)} → ${z8b.toFixed(2)}`)
  }
  /* B9 ✓ Done and back: today's size again */
  await page.locator('#sbDone').tap(); await sleep(500)
  await page.locator('#eWeek [data-sbday="0"]:visible').first().tap(); await sleep(600)
  s = await B()
  check(s.z === 1, 'B9 after ✓ Done the board opens at today\'s size', `zoom ${s.z}`)
  /* B10 the phone layout: a pinch changes nothing (no zoom of its own), and the page never zooms */
  await page.locator('#sbMore').tap(); await page.locator('#sbMoreWide').tap(); await sleep(500)
  await pinch(200, 450, 200, 60)
  const ph = await page.evaluate(() => ({ z: document.querySelector('#schedBoard .sb-main').style.zoom, wide: document.getElementById('schedBoard').classList.contains('sb-wide'), vv: window.visualViewport ? visualViewport.scale : 1 }))
  check(!ph.wide && !ph.z, 'B10 the phone layout keeps no zoom of its own', JSON.stringify(ph))
  await page.locator('#sbDone').tap(); await sleep(400)
}

/* ------------------------------------------------------------------ Quals */
if (ONLY !== 'board') {
  await go(page, 'quals'); await sleep(600)
  const Q = () => page.evaluate(() => {
    const w = document.querySelector('#page-quals .qwrap'), t = document.getElementById('qtbl')
    return { z: parseFloat(t.style.zoom || '1'), tw: Math.round(t.getBoundingClientRect().width), ww: w.clientWidth, sw: w.scrollWidth, bar: Math.round(document.querySelector('.qbar').getBoundingClientRect().height), seg: Math.round(document.querySelector('.segview').getBoundingClientRect().width), tf: t.style.transform }
  })
  /* the middle of the table where it is on the screen: a pinch must land on the table */
  const mid = () => page.evaluate(() => { const r = document.getElementById('qtbl').getBoundingClientRect(); return [Math.round(Math.min(Math.max(r.left + r.width / 2, 120), innerWidth - 120)), Math.round(Math.min(Math.max(r.top + Math.min(r.height, 400) / 2, 300), innerHeight - 100))] })
  let q = await Q()
  const q0 = q
  check(q.z === 1, 'Q1 Quals opens at today\'s size', JSON.stringify(q))
  let [mx, my] = await mid()
  await pinch(mx, my, 220, 40)
  q = await Q()
  check(q.sw <= q.ww + 1, 'Q2 a pinch out stops where the whole table fits', `zoom ${q.z.toFixed(3)}, ${q.sw}/${q.ww}`)
  check(q.bar === q0.bar && q.seg === q0.seg, 'Q2 the buttons and the Pilots · WSOs switch did not zoom', `${q.bar}/${q0.bar}, ${q.seg}/${q0.seg}`)
  check(!q.tf, 'Q2 laid out sharp at the lift')
  await page.screenshot({ path: `${SHOTS}/q2-fit.png` })
  ;[mx, my] = await mid(); await pinch(mx, my, 60, 300); ;[mx, my] = await mid(); await pinch(mx, my, 60, 300)
  q = await Q()
  check(Math.abs(q.z - 2) < 0.001, 'Q3 a pinch in stops at twice', `zoom ${q.z}`)
  ;[mx, my] = await mid(); await pinch(mx, my, 200, 120)
  console.log('  Q4 zoom', (await Q()).z.toFixed(3))
  /* Q4 scrolled down, the pinned heading row lines up with the zoomed columns */
  await page.evaluate(() => window.scrollTo(0, 900)); await sleep(500)
  await page.evaluate(() => { const w = document.querySelector('#page-quals .qwrap'); w.scrollLeft = 150 }); await sleep(500)
  const line = await page.evaluate(() => {
    const m = document.querySelector('[data-testid="qsticky-head"]'); if (!m) return { pinned: false }
    const real = [...document.querySelectorAll('#qtbl thead tr:last-child > th')].slice(1, 8).map(t => Math.round(t.getBoundingClientRect().left))
    const mir = [...m.querySelectorAll('.qfixed-scroll thead tr:last-child > th')].slice(1, 8).map(t => Math.round(t.getBoundingClientRect().left))
    const realW = [...document.querySelectorAll('#qtbl thead tr:last-child > th')].slice(1, 8).map(t => Math.round(t.getBoundingClientRect().width))
    const mirW = [...m.querySelectorAll('.qfixed-scroll thead tr:last-child > th')].slice(1, 8).map(t => Math.round(t.getBoundingClientRect().width))
    return { pinned: true, real, mir, realW, mirW }
  })
  const off = line.pinned ? Math.max(...line.real.map((x, i) => Math.abs(x - line.mir[i])), ...line.realW.map((x, i) => Math.abs(x - line.mirW[i]))) : 99
  check(line.pinned && off <= 2, 'Q4 the pinned heading row lines up with the zoomed table', JSON.stringify(line))
  const nameCol = await page.evaluate(() => { const c = document.querySelector('#qtbl tbody td.qname'); const r = c && c.getBoundingClientRect(); const w = document.querySelector('#page-quals .qwrap').getBoundingClientRect(); return r ? Math.round(r.left - w.left) : null })
  check(nameCol !== null && Math.abs(nameCol) <= 2, 'Q4 the name column stays pinned at the left, zoomed', `offset ${nameCol}`)
  await page.screenshot({ path: `${SHOTS}/q4-pinned.png` })
  /* Q5 the switch keeps the zoom */
  const zq = (await Q()).z
  await page.evaluate(() => window.scrollTo(0, 0)); await sleep(300)
  await page.locator('#qViewW').tap(); await sleep(500)
  check(Math.abs((await Q()).z - zq) < 0.001, 'Q5 WSOs keeps the zoom')
  /* Q6 leaving Quals and coming back: today's size */
  await go(page, 'editsched'); await go(page, 'quals'); await sleep(500)
  check((await Q()).z === 1, 'Q6 back on Quals: today\'s size')
}
check(errors.length === 0, 'no console errors', errors.join(' | '))
console.log(fails ? `${fails} FAIL` : 'ALL PASS')
await browser.close()
process.exit(fails ? 1 : 0)
