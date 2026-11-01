// The drawing of [LW-INPUT-RANGE-WHOLE] (his D1563, 2 Nov 26): a tap on any day of an entry of several days filed on the
// Inputs page opens it whole, as a leave of several days placed on the war does (D1448, D1461). Drawn on the real app
// (the build served on PORT, default 4243), at his iPhone's size in WebKit (402) and a desktop's (1536), on his own case:
// Quill's OML of 6–9 Jul 26 (the demo's), tapped on Tue 7 Jul.
//   Today — the real window as it opens now: one day, "Pick a range".
//   A (recommended) — opened whole: the title names its dates, its four days marked, and on the Duration row "All 4 days"
//     (lit) / "Tue 7" in place of "Pick a range", choosing what Grant OIL, CSE, OD and the ⋯ act on; the date after
//     Remarks follows the choice ("till 9 Jul").
//   B — opened whole to look at only: the title and the marks, but the window still acts on the day tapped ("Pick a
//     range" stays).
// The parts drawn in are the app's own: the war leave's "All n days" pair and its marked days are recorded first from a
// real three-day LL placed by a real drag on the desktop, and cloned onto Quill's window. Every drawn part wears a
// dashed yellow outline. Nothing in the app changes.
// Run from raptor-port/: node scripts/handpass/lw-input-range-draw.mjs
import path from 'node:path'
import { mkdirSync } from 'node:fs'
import { chromium, webkit, devices } from '@playwright/test'
import { compose } from '../../docs/img/mock/2026-11-02-year/lib.mjs'

const PORT = process.env.PORT || 4243
const OUT = path.resolve('docs/img/mock/2026-11-02-input-range')
const RAW = path.join(OUT, 'raw')
mkdirSync(RAW, { recursive: true })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const q = t => `[data-testid="${t}"]`

async function open(dev) {
  const phone = dev === 'phone'
  const b = phone ? await webkit.launch() : await chromium.launch()
  const ctx = phone ? await b.newContext({ ...devices['iPhone 13'], viewport: { width: 402, height: 874 }, deviceScaleFactor: 3 })
    : await b.newContext({ viewport: { width: 1536, height: 864 } })
  const P = await ctx.newPage()
  await P.clock.setFixedTime(new Date('2026-06-20T09:00:00+08:00'))
  await P.goto(`http://localhost:${PORT}/?fresh=1`); await P.waitForSelector('#luser')
  await P.fill('#luser', 'ad'); await P.fill('#lpass', 'a'); await P.click('#loginForm button[type=submit]')
  await P.waitForSelector('#vWeek .day', { state: 'attached' })
  await P.evaluate(() => window.go('leavewar')); await P.waitForSelector(q('month-strip'))
  await P.selectOption(q('war-picker'), 'y2026'); await sleep(900)
  await P.locator(q('month-JUL')).click(); await sleep(900)
  return { b, P, phone }
}
const rowOf = (P, name) => P.evaluate(n => {
  for (const td of document.querySelectorAll('td.who')) if (td.innerText.trim().startsWith(n)) { const tr = td.closest('tr'); const c = tr?.querySelector('td[data-testid^="cell-"]'); if (c) return c.dataset.testid.replace(/^cell-/, '').slice(0, -11) }
  return null
}, name)

/* the war's own whole-leave window, recorded: a three-day LL placed by a real drag on a desktop */
async function recordWarLeave() {
  const { b, P } = await open('desktop')
  const id = await rowOf(P, 'Rune') || await rowOf(P, 'Cinder')
  const cell = d => P.locator(`[data-testid="cell-${id}-${d}"]`)
  // staged as the project's own whole-leave test stages one (e2e/wholeleave-leavewar.spec.ts): three next-door LL days,
  // which the war reads as one leave (D1346) — only to record how its window draws, never pictured as his data
  await P.evaluate(i => { for (const d of ['2026-06-30', '2026-07-01', '2026-07-02']) if (!window.lwSetCell(i, d, 'LL')) throw new Error('not placed ' + d) }, id)
  await sleep(500)
  await P.mouse.click(5, 5); await sleep(300)
  const before = await P.evaluate(i => [...document.querySelectorAll(`td[data-testid^="cell-${i}-2026-07-0"]`)].map(t => t.className), id)
  await cell('2026-07-01').click(); await sleep(600)
  const rec = await P.evaluate(i => {
    const pick = document.querySelector('[data-testid="bid-picker"]')
    const all = pick.querySelector('[data-testid="scope-all"]'), day = pick.querySelector('[data-testid="scope-day"]')
    const cells = [...document.querySelectorAll(`td[data-testid^="cell-${i}-2026-07-0"]`)].map(t => t.className)
    return { pair: all && day ? all.parentElement.outerHTML : '', allText: all?.textContent, dayText: day?.textContent, when: pick.querySelector('.bidsheet-hd .when')?.textContent, cells }
  }, id)
  rec.before = before
  await P.screenshot({ path: path.join(RAW, 'desktop-war-leave-real.png'), clip: { x: 0, y: 0, width: 1536, height: 864 } })
  await b.close()
  // the class the marked days gain, read off the real cells
  const gained = new Set()
  rec.cells.forEach((c, k) => { for (const w of c.split(/\s+/)) if (w && !(rec.before[k] || '').split(/\s+/).includes(w)) gained.add(w) })
  rec.mark = [...gained]
  console.log('war leave window:', rec.when, '|', rec.allText, '/', rec.dayText, '| marked days gain:', rec.mark.join(' '))
  if (!rec.pair) throw new Error('the war leave did not open whole — nothing to copy')
  return rec
}

const DASH = '2px dashed #ffd400'
async function drawQuill(dev, rec, kind) {
  const { b, P, phone } = await open(dev)
  const id = await rowOf(P, 'Quill')
  const cell = d => P.locator(`[data-testid="cell-${id}-${d}"]`)
  await cell('2026-07-07').scrollIntoViewIfNeeded(); await sleep(300)
  if (phone) await cell('2026-07-07').tap(); else await cell('2026-07-07').click()
  await sleep(800)
  const ok = await P.$(q('bid-picker'))
  if (!ok) throw new Error(dev + ': Quill\'s 7 Jul did not open the bid window')
  const today = await P.evaluate(() => {
    const pk = document.querySelector('[data-testid="bid-picker"]')
    return { when: pk.querySelector('.bidsheet-hd .when')?.textContent, range: !!pk.querySelector('[data-testid="span-range"]'), till: [...pk.querySelectorAll('*')].find(e => /^till /.test(e.textContent || '') && e.children.length === 0)?.textContent }
  })
  if (kind !== 'today') {
    await P.evaluate(([i, rec, kind, DASH]) => {
      const pk = document.querySelector('[data-testid="bid-picker"]')
      const w = pk.querySelector('.bidsheet-hd .when'); w.textContent = '6–9 Jul'; w.style.outline = DASH; w.style.outlineOffset = '2px'
      for (const d of ['06', '07', '08', '09']) {
        const td = document.querySelector(`td[data-testid="cell-${i}-2026-07-${d}"]`)
        for (const c of rec.mark) td.classList.add(c)
      }
      if (kind === 'A') {
        const r = pk.querySelector('[data-testid="span-range"]')
        const box = document.createElement('div'); box.innerHTML = rec.pair
        const pair = box.firstElementChild
        pair.querySelector('[data-testid="scope-all"]').textContent = 'All 4 days'
        pair.querySelector('[data-testid="scope-day"]').textContent = 'Tue 7'
        pair.style.outline = DASH; pair.style.outlineOffset = '2px'
        r.replaceWith(pair)
        const till = [...pk.querySelectorAll('*')].find(e => /^till /.test(e.textContent || '') && e.children.length === 0)
        if (till) { till.textContent = 'till 9 Jul'; till.style.outline = DASH; till.style.outlineOffset = '2px' }
      }
    }, [id, rec, kind, DASH])
    await sleep(150)
  }
  // a neutral tap so no control is left pressed (the guide's trap)
  await P.evaluate(() => document.activeElement?.blur?.())
  const shot = path.join(RAW, `${dev}-${kind}.png`)
  if (phone) await P.screenshot({ path: shot, clip: { x: 0, y: 0, width: 402, height: 874 } })
  else {
    const pk = await P.locator(q('bid-picker')).boundingBox()
    const c = await cell('2026-07-06').boundingBox()
    const y0 = Math.max(0, Math.min(pk.y, c.y) - 40)
    await P.screenshot({ path: shot, clip: { x: 0, y: y0, width: 1536, height: Math.min(864 - y0, Math.max(pk.y + pk.height, c.y + c.height) - y0 + 30) } })
  }
  await b.close()
  return { shot, today }
}

const rec = await recordWarLeave()
const shots = {}
for (const dev of ['phone', 'desktop']) {
  for (const kind of ['today', 'A', 'B']) {
    // eslint-disable-next-line react-doctor/async-await-in-loop -- one picture after another, each in a fresh page
    const r = await drawQuill(dev, rec, kind)
    shots[`${dev}-${kind}`] = r.shot
    if (kind === 'today') console.log(dev, 'today:', JSON.stringify(r.today))
  }
}
const items = dev => [
  { tag: 'Today', cap: 'one day, "Pick a range"', src: shots[`${dev}-today`], w: dev === 'phone' ? 330 : 900 },
  { tag: 'A (recommended)', cap: 'opened whole: "All 4 days" / "Tue 7" choose what Grant OIL, CSE, OD act on', src: shots[`${dev}-A`], w: dev === 'phone' ? 330 : 900 },
  { tag: 'B', cap: 'opened whole to look at; acts on the day tapped', src: shots[`${dev}-B`], w: dev === 'phone' ? 330 : 900 },
]
await compose(path.join(OUT, 'range-phone.png'), { title: 'Quill\'s OML 6–9 Jul (filed on the Inputs page), Tue 7 tapped — on the iPhone', sub: 'Real app. Dashed yellow: drawn in, copied from the war\'s own whole-leave window (Rune\'s LL 30 Jun – 2 Jul placed by a real drag).', items: items('phone'), colW: 330 })
await compose(path.join(OUT, 'range-desktop.png'), { title: 'The same on a desktop (1536)', items: items('desktop'), stack: true, colW: 900 })
