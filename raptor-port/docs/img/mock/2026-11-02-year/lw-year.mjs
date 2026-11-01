// [LW-YEAR-CLEAR] (his D1559, 1 Nov 26): "can see if u can design something more intuitive for the year". He filed six
// things on Thu 22 Jul thinking it was July 2026; the grid was on JAN – DEC 27. Drawn on the real Leave War grid, at his
// iPhone's 402 x 874 (WebKit, 3x) and a 1536 desktop (Chromium, 1x):
//   today  — the 2027 period, the grid on 17–30 Jul as in his picture: at the top (the month strip in view) and with
//            the page scrolled down (only the date row stays pinned — the strip has gone).
//   A      — the pinned corner over the names reads the year alone, "2027", in the date number's white, over "CS/Name"
//            (recommended; drawn by the code's kind 'B').
//   B      — the pinned corner reads the month and year, "JUL 2027", in the first date's own month label look (cyan,
//            small), over "CS/Name" (the code's kind 'A').
//   Both follow the first date in view (the left edge of the dates), not the month the strip lights.
//   two years — a period JUL 28 – JUN 29 on the phone, the grid across the new year: today, and A. (1 January's
//            own label carrying the year was tried and dropped: on a phone it runs over 2 January's heading.)
// The corner's words are laid on by hand (a span inserted before the cell's own text, removed again); nothing changes.
// Run from raptor-port/: node docs/img/mock/2026-11-02-year/lw-year.mjs
import path from 'node:path'
import { open, clip, compose, neutral, sleep, OUT } from './lib.mjs'

const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const shots = {}

async function toLeaveWar(P, period) {
  await P.evaluate(() => window.go('leavewar')); await P.waitForSelector('[data-testid="month-strip"]')
  if (period) { await P.selectOption('[data-testid="war-picker"]', period); await sleep(900) }
}
/* the grid scrolled sideways so `iso` is the first date past the frozen columns */
async function gridTo(P, iso) {
  const r = await P.evaluate((iso) => {
    const th = document.querySelector(`[data-testid="head-${iso}"]`)
    let sc = th.parentElement
    while (sc && sc !== document.body) { const o = getComputedStyle(sc).overflowX; if ((o === 'auto' || o === 'scroll') && sc.scrollWidth > sc.clientWidth) break; sc = sc.parentElement }
    const bal = document.querySelector('[data-testid="counter-head"]').getBoundingClientRect()
    sc.scrollLeft += th.getBoundingClientRect().left - bal.right
    return { sl: sc.scrollLeft }
  }, iso)
  await sleep(700)
  return r
}
/* what the month strip has lit — the month the app says is in view (D1477) */
const lit = P => P.evaluate(() => document.querySelector('.mjump.on')?.textContent.trim() || '')

/* THE PROPOSALS: words put before "CS/Name" in every copy of the pinned header the page keeps (the real one and its
   frozen mirror), so whichever is on screen carries them */
async function corner(P, kind, words) {
  return P.evaluate(({ kind, words }) => {
    document.querySelectorAll('.ymock').forEach(n => n.remove())
    document.querySelectorAll('th.who, th.bal').forEach(n => { n.style.outline = ''; n.style.outlineOffset = '' })
    if (!kind) return null
    const out = []
    for (const th of document.querySelectorAll('th.who')) {
      if (!/CS\/Name/.test(th.textContent)) continue
      const s = document.createElement('span')
      s.className = 'ymock' + (kind === 'A' ? ' mon' : '')
      s.textContent = words
      if (kind === 'A') s.style.cssText = 'display:block;white-space:nowrap'
      else s.style.cssText = 'display:block;white-space:nowrap;color:var(--ink);font-size:1.25em;font-weight:800;letter-spacing:.04em;line-height:1.1'
      th.insertBefore(s, th.firstChild)
      // eslint-disable-next-line react-doctor/js-batch-dom-css -- a drawing script sets the mock-up's few styles once, in the page it pictures
      th.style.outline = '2px dashed #ffd400'; th.style.outlineOffset = '-2px'
      const r = th.getBoundingClientRect()
      const rg = document.createRange(); rg.selectNodeContents(s); const tr = rg.getBoundingClientRect()
      const padR = parseFloat(getComputedStyle(th).paddingRight)
      if (r.width) out.push({ cellW: Math.round(r.width), cellH: Math.round(r.height), wordsLeft: Math.round(tr.left - r.left), wordsW: Math.round(tr.width), spare: Math.round(r.right - padR - tr.right), font: getComputedStyle(s).fontSize })
    }
    return out
  }, { kind, words })
}

/* the frame: from the grid's bar to a few rows under the dates (top), or the pinned top of the page (scrolled) */
async function frameTop(P, dev) {
  return P.evaluate((dev) => {
    const bar = document.querySelector('[data-testid="counts-toggle"]').getBoundingClientRect()
    const head = document.querySelector('[data-testid^="head-"]').getBoundingClientRect()
    return { x: 0, y: bar.top - 10, w: dev === 'phone' ? 402 : 1100, h: head.bottom - bar.top + 10 + (dev === 'phone' ? 150 : 120) }
  }, dev)
}
async function frameScrolled(P, dev) {
  return { x: 0, y: 0, w: dev === 'phone' ? 402 : 1100, h: dev === 'phone' ? 300 : 230 }
}

for (const dev of ['phone', 'desk']) {
  const { b, P } = await open(dev)
  await toLeaveWar(P, 'y2027')
  await P.click('[data-testid="month-JUL"]'); await sleep(900)
  await gridTo(P, '2027-07-17')
  console.log(dev, 'lit after the sideways scroll:', await lit(P))
  const pickerWords = await P.evaluate(() => { const s = document.querySelector('[data-testid="war-picker"]'); return s.options[s.selectedIndex].text })
  console.log(dev, 'View picker reads:', pickerWords)
  await P.evaluate(() => window.scrollTo(0, 0)); await sleep(300)
  // the top frame: bring the grid's bar just under the app's top bar
  await P.evaluate(() => { const bar = document.querySelector('[data-testid="counts-toggle"]'); window.scrollBy(0, bar.getBoundingClientRect().top - 80) }); await sleep(500)
  await neutral(P)
  const yearsInView = async () => P.evaluate(() => { const t = document.body.innerText; return (t.match(/\b20\d\d\b|\b(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC) \d\d\b/g) || []).slice(0, 6) })
  const words = `JUL 2027`
  for (const [k, w] of [[null, ''], ['A', words], ['B', '2027']]) {
    // eslint-disable-next-line react-doctor/async-await-in-loop -- a drawing script takes its pictures one after another in one browser, in order
    const m = await corner(P, k, w)
    if (m) console.log(dev, k, 'top', JSON.stringify(m))
    shots[`${dev}-top-${k || 'today'}`] = await clip(P, `lw-${dev}-top-${({ A: 'monthyear', B: 'year' })[k] || 'today'}.png`, await frameTop(P, dev))
  }
  await corner(P, null)
  // scrolled down: the strip has gone, the date row stays
  await P.evaluate(() => window.scrollBy(0, 420)); await sleep(700)
  const pinned = await P.evaluate(() => {
    const strip = document.querySelector('[data-testid="month-strip"]').getBoundingClientRect()
    const whos = [...document.querySelectorAll('th.who')].filter(t => /CS\/Name/.test(t.textContent)).map(t => Math.round(t.getBoundingClientRect().top))
    return { stripTop: Math.round(strip.top), cornerTops: whos }
  })
  console.log(dev, 'scrolled: strip top', pinned.stripTop, 'corner tops', pinned.cornerTops.join(','))
  for (const [k, w] of [[null, ''], ['A', words], ['B', '2027']]) {
    // eslint-disable-next-line react-doctor/async-await-in-loop -- a drawing script takes its pictures one after another in one browser, in order
    const m = await corner(P, k, w)
    if (m) console.log(dev, k, 'scrolled', JSON.stringify(m))
    await neutral(P)
    shots[`${dev}-down-${k || 'today'}`] = await clip(P, `lw-${dev}-down-${({ A: 'monthyear', B: 'year' })[k] || 'today'}.png`, await frameScrolled(P, dev))
  }
  await corner(P, null)

  if (dev === 'phone') {
    // A PERIOD ACROSS TWO YEARS — made through the app's own "+ New period"
    await P.evaluate(() => window.scrollTo(0, 0)); await sleep(300)
    await P.selectOption('[data-testid="war-picker"]', { label: '+ New period' }); await P.waitForSelector('[data-testid="war-sheet"]')
    await P.fill('[data-testid="war-name"]', 'JUL 28 - JUN 29')
    const at = async () => { const ym = await P.getAttribute('[data-testid="war"]', 'data-month'); return +ym.slice(0, 4) * 12 + (+ym.slice(5, 7) - 1) }
    // eslint-disable-next-line react-doctor/async-await-in-loop -- a drawing script takes its pictures one after another in one browser, in order
    const go = async iso => { let d = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1) - await at(); for (; d > 0; d--) await P.click('[data-testid="war-next"]'); for (; d < 0; d++) await P.click('[data-testid="war-prev"]') }
    await go('2028-07-01'); await P.click('[data-testid="war-day-2028-07-01"]')
    await go('2029-06-30'); await P.click('[data-testid="war-day-2029-06-30"]')
    await sleep(250)
    console.log('new period:', (await P.innerText('[data-testid="war-selection"]')).replace(/\s+/g, ' '))
    await P.click('[data-testid="war-create"]'); await sleep(1200)
    const strip = await P.$$eval('.mjump', els => els.map(e => e.textContent.trim()).join(' '))
    const stripFit = await P.evaluate(() => { const s = document.querySelector('[data-testid="month-strip"]'); const r = s.getBoundingClientRect(); const last = [...s.querySelectorAll('.mjump')].pop().getBoundingClientRect(); return { w: Math.round(r.width), lastRight: Math.round(last.right), vw: innerWidth, sw: s.scrollWidth, cw: s.clientWidth } })
    console.log('two-year strip:', strip, JSON.stringify(stripFit))
    await P.click('[data-testid="month-DEC-28"]'); await sleep(900)
    await gridTo(P, '2028-12-26')
    const l2 = await lit(P)
    console.log('two-year lit:', l2)
    await P.evaluate(() => { const bar = document.querySelector('[data-testid="counts-toggle"]'); window.scrollBy(0, bar.getBoundingClientRect().top - 80) }); await sleep(500)
    await neutral(P)
    shots['phone-2y-today'] = await clip(P, 'lw-phone-2y-today.png', await frameTop(P, dev))
    console.log('two-year corner:', JSON.stringify(await corner(P, 'B', '2028')))
    shots['phone-2y-A'] = await clip(P, 'lw-phone-2y-year.png', await frameTop(P, dev))
    await corner(P, null)
  }
  await b.close()
}

const PW = 402, DW = 1100
await compose(path.join(OUT, 'lw-1-today.png'), {
  title: 'Leave War grid — today (the real app, 2027 period, 17–30 Jul)',
  sub: 'Nowhere near the dates does it say 2027. The month buttons read JAN … DEC, the dates THU 22. Once the page is scrolled down (right), even the month buttons are gone — only the row of dates stays pinned.',
  items: [{ tag: 'At the top', src: shots['phone-top-today'], w: PW }, { tag: 'Scrolled down', src: shots['phone-down-today'], w: PW }], dpr: 3,
})
await compose(path.join(OUT, 'lw-2-phone-options.png'), {
  title: 'Leave War grid on the iPhone — scrolled down, as he was when he filed',
  sub: 'The corner over the names (dashed yellow) is the one place that never scrolls away — up, down or sideways. A and B are drawn on the real app; the words in the corner are the only change. Each names the first date in view.',
  items: [{ tag: 'Today', src: shots['phone-down-today'], w: PW }, { tag: 'A (recommended)', cap: 'the year alone, "2027", bright', src: shots['phone-down-B'], w: PW }, { tag: 'B', cap: 'month and year, "JUL 2027", in the small month label', src: shots['phone-down-A'], w: PW }], dpr: 3, colW: PW,
})
await compose(path.join(OUT, 'lw-3-phone-top.png'), {
  title: 'Leave War grid on the iPhone — at the top, the month buttons in view',
  items: [{ tag: 'Today', src: shots['phone-top-today'], w: PW }, { tag: 'A (recommended)', src: shots['phone-top-B'], w: PW }, { tag: 'B', src: shots['phone-top-A'], w: PW }], dpr: 3, colW: PW,
})
await compose(path.join(OUT, 'lw-4-desktop.png'), {
  title: 'Leave War grid on a desktop (1536 wide) — scrolled down',
  items: [{ tag: 'Today', src: shots['desk-down-today'], w: DW }, { tag: 'A (recommended)', src: shots['desk-down-B'], w: DW }, { tag: 'B', src: shots['desk-down-A'], w: DW }], dpr: 1, stack: true,
})
await compose(path.join(OUT, 'lw-5-two-years.png'), {
  title: 'A period across two years (JUL 28 – JUN 29, made with + New period) — the grid across the new year',
  sub: 'Today the month buttons carry a two-digit year ("JAN 29") only in such a period, only while the page is at the top, and on the iPhone the strip runs past the right edge (MAY 29 and JUN 29 out of view). With A the corner names the year of the first date in view (2028 here, from 26 Dec) and turns to 2029 once 1 Jan reaches the left edge. (Writing the year on the heading of 1 January was tried: on a phone it runs over the heading of 2 January, so it is not proposed.)',
  items: [{ tag: 'Today', src: shots['phone-2y-today'], w: PW }, { tag: 'A (recommended)', src: shots['phone-2y-A'], w: PW }], dpr: 3, colW: PW,
})
