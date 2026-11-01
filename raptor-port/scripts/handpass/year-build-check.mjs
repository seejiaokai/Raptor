// The build check of [LW-YEAR-CLEAR] (D1561), [CAL-MONTH-YEAR-JUMP] (D1562) and [LW-MONTHSTRIP-TWO-YEARS], 2 Nov 26.
// Drives the built app (served on PORT, default 4243) at his iPhone's size in WebKit (402 × 874) and a desktop's (1536,
// Chromium), measures what each ruling says and takes the pictures the evidence sheet and the drawing check use.
// Run from raptor-port/: node scripts/handpass/year-build-check.mjs
import path from 'node:path'
import { mkdirSync } from 'node:fs'
import { open, sleep } from '../../docs/img/mock/2026-11-02-year/lib.mjs'

const OUT = path.resolve('docs/img/handpass/2026-11-02-year-build')
mkdirSync(OUT, { recursive: true })
const fails = []
const check = (ok, what) => { console.log((ok ? 'PASS ' : 'FAIL ') + what); if (!ok) fails.push(what) }
const shot = (P, name, box) => P.screenshot({ path: path.join(OUT, name), clip: box })

async function toLeaveWar(P, period) {
  await P.evaluate(() => window.go('leavewar')); await P.waitForSelector('[data-testid="month-strip"]')
  if (period) { await P.selectOption('[data-testid="war-picker"]', period); await sleep(900) }
}
/* the grid scrolled sideways so `iso` is the first date past the frozen columns, with `into` px of it under them */
async function gridTo(P, iso, into = 0) {
  await P.evaluate(([iso, into]) => {
    const th = document.querySelector(`[data-testid="head-${iso}"]`)
    let sc = th.parentElement
    while (sc && sc !== document.body) { const o = getComputedStyle(sc).overflowX; if ((o === 'auto' || o === 'scroll') && sc.scrollWidth > sc.clientWidth) break; sc = sc.parentElement }
    const bal = document.querySelector('[data-testid="counter-head"]').getBoundingClientRect()
    sc.scrollLeft += th.getBoundingClientRect().left - bal.right + into
  }, [iso, into])
  await sleep(700)
}
/* the year the corner shows on screen — the copy that is drawn on top (the frozen mirror once scrolled down) */
const shownYear = P => P.evaluate(() => {
  const els = [...document.querySelectorAll('.lw-yr')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.top >= 0 && r.top < innerHeight })
  return els.map(e => e.textContent).join(',')
})
const cornerBox = P => P.evaluate(() => {
  const els = [...document.querySelectorAll('th.who')].filter(e => e.querySelector('.lw-yr') && e.getBoundingClientRect().top >= 0)
  const th = els[els.length - 1]; const r = th.getBoundingClientRect(); const day = th.parentElement.querySelector('th.day').getBoundingClientRect()
  const yr = th.querySelector('.lw-yr').getBoundingClientRect()
  return { top: r.top, h: Math.round(r.height), dayH: Math.round(day.height), yrRight: Math.round(yr.right), thRight: Math.round(r.right), overflow: th.scrollHeight > th.clientHeight + 1 }
})

async function leaveWar(dev) {
  const { b, P } = await open(dev)
  const W = dev === 'phone' ? 402 : 1536
  await toLeaveWar(P, 'y2027')
  await P.click('[data-testid="month-JUL"]'); await sleep(900)
  await gridTo(P, '2027-07-17')
  check((await shownYear(P)).split(',').every(y => y === '2027'), `${dev}: the corner reads 2027 on 17 Jul 2027 at the top (${await shownYear(P)})`)
  let c = await cornerBox(P)
  check(!c.overflow && c.h === c.dayH, `${dev}: the corner adds no height — its row ${c.h} = a date's ${c.dayH}, nothing spills`)
  check(c.yrRight <= c.thRight, `${dev}: the year fits inside the corner (${c.yrRight} ≤ ${c.thRight})`)
  await shot(P, `${dev}-lw-top.png`, { x: 0, y: Math.max(0, c.top - 60), width: W, height: 180 })
  await P.evaluate(() => { const bar = document.querySelector('[data-testid="counts-toggle"]'); window.scrollBy(0, bar.getBoundingClientRect().top + 900) }); await sleep(700)
  check((await shownYear(P)).includes('2027'), `${dev}: scrolled down, the pinned corner still reads 2027 (${await shownYear(P)})`)
  c = await cornerBox(P)
  await shot(P, `${dev}-lw-down.png`, { x: 0, y: 0, width: W, height: Math.min(360, c.top + c.h + 200) })
  // A PERIOD ACROSS TWO YEARS, made through "+ New period"
  await P.evaluate(() => window.scrollTo(0, 0)); await sleep(300)
  await P.selectOption('[data-testid="war-picker"]', { label: '+ New period' }); await P.waitForSelector('[data-testid="war-sheet"]')
  await P.fill('[data-testid="war-name"]', 'JUL 28 - JUN 29')
  const at = async () => { const ym = await P.getAttribute('[data-testid="war"]', 'data-month'); return +ym.slice(0, 4) * 12 + (+ym.slice(5, 7) - 1) }
  // eslint-disable-next-line react-doctor/async-await-in-loop -- a check script drives one browser one step at a time
  const go = async iso => { let d = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1) - await at(); for (; d > 0; d--) await P.click('[data-testid="war-next"]'); for (; d < 0; d++) await P.click('[data-testid="war-prev"]') }
  await go('2028-07-01'); await P.click('[data-testid="war-day-2028-07-01"]')
  await go('2029-06-30'); await P.click('[data-testid="war-day-2029-06-30"]')
  await sleep(250); await P.click('[data-testid="war-create"]'); await sleep(1200)
  const fit = await P.evaluate(() => {
    const s = document.querySelector('[data-testid="month-strip"]'); const btns = [...s.querySelectorAll('.mjump')]
    const last = btns[btns.length - 1].getBoundingClientRect()
    const cut = btns.filter(x => x.scrollWidth > x.clientWidth + 1).map(x => x.textContent)
    return { n: btns.length, lastRight: Math.round(last.right), vw: innerWidth, cut, words: btns.map(x => x.innerText.replace(/\s+/g, ' ')).join(' | '), top: s.getBoundingClientRect().top }
  })
  check(fit.n === 12 && fit.lastRight <= fit.vw, `${dev}: the two-year strip's 12 buttons all in view (last right ${fit.lastRight} ≤ ${fit.vw})`)
  check(fit.cut.length === 0, `${dev}: no month button's words cut (${fit.cut.join(',') || 'none'}) — ${fit.words}`)
  await shot(P, `${dev}-lw-2y-strip.png`, { x: 0, y: Math.max(0, fit.top - 50), width: W, height: 120 })
  await P.click('[data-testid="month-DEC-28"]'); await sleep(900)
  await gridTo(P, '2028-12-31', 6)
  check((await shownYear(P)).split(',').every(y => y === '2028'), `${dev}: 31 Dec 2028 first in view, part under the names — the corner reads 2028 (${await shownYear(P)})`)
  await gridTo(P, '2029-01-01')
  check((await shownYear(P)).split(',').every(y => y === '2029'), `${dev}: 1 Jan 2029 at the left edge — the corner reads 2029 (${await shownYear(P)})`)
  c = await cornerBox(P)
  await shot(P, `${dev}-lw-2y-jan.png`, { x: 0, y: Math.max(0, c.top - 60), width: W, height: 180 })
  await gridTo(P, '2028-12-30')
  check((await shownYear(P)).split(',').every(y => y === '2028'), `${dev}: back to 30 Dec — 2028 again (${await shownYear(P)})`)
  await b.close()
}

async function calendars(dev) {
  const { b, P } = await open(dev)
  const W = dev === 'phone' ? 402 : 1536
  await P.evaluate(() => window.go('inputs')); await sleep(500)
  if (await P.$('#inCalBtn')) { await P.click('#inCalBtn'); await sleep(400) }
  const row = () => P.evaluate(() => {
    const t = document.querySelector('.ic-mon'); const w = t.querySelector('.mjt-w')
    const r = id => Math.round(document.querySelector(id).getBoundingClientRect().left)
    return { prev: r('#icPrev'), next: r('#icNext'), today: r('#icToday'), title: Math.round(t.getBoundingClientRect().width), words: t.textContent, cut: w.scrollWidth > w.clientWidth + 1, arrow: getComputedStyle(t, '::after').content, top: t.getBoundingClientRect().top }
  })
  const r0 = await row()
  check(r0.arrow.includes('▾'), `${dev}: the Inputs title wears the ▾ (${r0.arrow})`)
  check(!r0.cut, `${dev}: "${r0.words}" with its ▾ fits the title's ${r0.title}px room`)
  // the widest month's words still fit, and › and Today never move from month to month (D1122)
  const seen = []
  for (let i = 0; i < 12; i++) {
    // eslint-disable-next-line react-doctor/async-await-in-loop -- one month after another in one browser
    const r = await row(); seen.push(r)
    // eslint-disable-next-line react-doctor/async-await-in-loop -- one month after another in one browser
    await P.click('#icNext'); await sleep(120)
  }
  check(seen.every(r => !r.cut), `${dev}: every month's words fit beside the ▾ (${seen.filter(r => r.cut).map(r => r.words).join(',') || 'all twelve'})`)
  check(seen.every(r => r.next === r0.next && r.today === r0.today), `${dev}: › and Today stand still across twelve months`)
  await shot(P, `${dev}-ic-title.png`, { x: 0, y: Math.max(0, r0.top - 50), width: Math.min(W, 760), height: 110 })
  await P.click('.ic-mon'); await sleep(500)
  const card = await P.evaluate(() => { const c = document.querySelector('[data-testid="dcal-card"]').getBoundingClientRect(); return { x: c.x, y: c.y, w: c.width, h: c.height, lists: !!document.querySelector('[data-testid="mjump-lists"]'), open: document.querySelector('.ic-mon').classList.contains('is-open') } })
  check(card.lists && card.open, `${dev}: a tap on the title opens the card on its wheels, the title lit`)
  await shot(P, `${dev}-ic-open.png`, dev === 'phone' ? { x: 0, y: 0, width: W, height: 874 } : { x: 0, y: 0, width: 900, height: Math.ceil(card.y + card.h + 30) })
  const before = await P.evaluate(() => document.querySelector('.ic-mon').textContent)
  await P.keyboard.press('Tab'); await P.keyboard.press('ArrowDown'); await sleep(300)
  const after = await P.evaluate(() => document.querySelector('.ic-mon').textContent)
  check(after !== before && /20\d\d/.test(after), `${dev}: a year turned on the wheel turns the page (${before} → ${after})`)
  await P.keyboard.press('Escape'); await sleep(300)
  check(!(await P.$('[data-testid="dcal-card"]')), `${dev}: Escape closes the card`)
  // the SANS calendar's title
  await P.evaluate(() => document.getElementById('inSansMode')?.click()); await sleep(500)
  const sm = await P.$('[data-testid="sc-month"]')
  if (sm) {
    const s = await P.evaluate(() => { const t = document.querySelector('[data-testid="sc-month"]'); const w = t.querySelector('.mjt-w'); return { cut: w.scrollWidth > w.clientWidth + 1, top: t.getBoundingClientRect().top, words: t.textContent } })
    check(!s.cut, `${dev}: the SANS title "${s.words}" fits with its ▾`)
    await shot(P, `${dev}-sc-title.png`, { x: 0, y: Math.max(0, s.top - 50), width: Math.min(W, 760), height: 110 })
  } else check(false, `${dev}: the SANS tab was not reached`)
  await b.close()
}

for (const dev of ['phone', 'desktop']) {
  // eslint-disable-next-line react-doctor/async-await-in-loop -- the two sizes run one after another
  await leaveWar(dev)
  // eslint-disable-next-line react-doctor/async-await-in-loop -- the two sizes run one after another
  await calendars(dev)
}
console.log(fails.length ? `\n${fails.length} FAILED` : '\nall passed')
process.exit(fails.length ? 1 : 0)
