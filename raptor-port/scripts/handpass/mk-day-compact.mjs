// THE MOCK-UP MAKER for [CAL-DAY-LINES-COMPACT] (owner D696, 9 Oct 26 — "Is there a way to use less vertical space per
// input?"; his own idea, D699 — "put the placed by sentence to the 2nd row if the remarks is short. If the remarks is
// too long then move the placed by down to a 3rd row but still the same horizontal alignment … Can give me a mock up").
// It drives the BUILT app to the demo's Thursday with four inputs, copies those real cards to make a busy day of nine
// (a short remark, a long one, none), pictures it AS IT IS TODAY, then re-arranges the same real elements to draw his
// idea, and his idea with shorter small print. It prints each card's height and how many inputs are whole on the first
// screen. A DRAWING: nothing here is built.
//
//   node scripts/handpass/mk-day-compact.mjs <out dir>          (the built bundle on :4180)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
const OUT = process.argv[2] || 'docs/mock/img/day-inputs-compact'
mkdirSync(OUT, { recursive: true })
const URL = (process.env.LOOK_URL || 'http://localhost:4180/') + '?fresh=1'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const ISO = '2026-07-16', H = 667

async function day() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const page = await ctx.newPage()
  await page.goto(URL)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  await page.evaluate(() => window.go('inputs'))
  for (let i = 0; i < 40; i++) {
    const [name, year] = (await page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = 2026 * 12 + 6 - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) break
    await page.locator(d > 0 ? '#icNext' : '#icPrev').click()
  }
  await page.locator(`#inpCal [data-icday="${ISO}"]`).tap({ position: { x: 10, y: 10 } })
  await page.locator('[data-testid="win-inputsday"]').waitFor(); await page.waitForTimeout(400)
  /* A BUSY DAY: the four real cards, and five copies of them with other people and other remarks */
  await page.evaluate(() => {
    const rows = [...document.querySelectorAll('[data-testid="win-inputsday"] [data-testid^="idy-row-"]')]
    const list = rows[0].parentElement
    const more = [
      [1, 'Bolt', 'Appointment', '09:00–10:30', 'Dental', 'Placed by Bolt · 30 Jun 26, 11:20'],
      [3, 'Saint', 'Meeting', '14:00–15:00', 'Safety council, wing HQ — back for the 1600 brief if it ends on time', 'Placed by Saber · 9 Jul 26, 16:05'],
      [0, 'Wisp', 'LL', 'All day', '', 'Placed by Wisp · 1 Jul 26, 08:15'],
      [3, 'Cobra', 'Duty', '07:00–12:00', 'Range safety officer', 'Placed by Saber · 10 Jul 26, 09:40'],
      [1, 'Vector', 'OML', 'till 24 Jul', 'Overseas — family', 'Placed by Vector · 2 Jun 26, 19:31'],
    ]
    for (const [from, who, kind, when, rmk, placed] of more) {
      const c = rows[from].cloneNode(true)
      const open = c.querySelector('.sd-open'), spans = [...open.querySelectorAll('span, b, strong')].filter(n => n.children.length === 0 && n.textContent.trim())
      spans[0].textContent = who; if (spans[1]) spans[1].textContent = kind
      c.querySelector('.sd-hours').textContent = when
      let r = c.querySelector('.sd-rmk')
      if (!rmk && r) r.remove()
      else if (rmk && !r) { r = document.createElement('span'); r.className = 'sd-rmk'; c.insertBefore(r, c.querySelector('.sd-placed') || null); r.textContent = rmk }
      else if (r) r.textContent = rmk
      let pl = c.querySelector('.sd-placed')
      if (!pl) { pl = document.createElement('span'); pl.className = 'sd-placed'; c.appendChild(pl) }
      pl.textContent = placed
      c.querySelectorAll('.sd-late, .sd-latenote').forEach(n => n.remove())
      list.appendChild(c)
    }
    const count = document.querySelector('[data-testid="idy-count"]'); if (count) count.textContent = '9 inputs'
  })
  await page.waitForTimeout(200)
  return { ctx, page }
}
const measure = page => page.evaluate(() => {
  const win = document.querySelector('[data-testid="win-inputsday"]').getBoundingClientRect()
  const rows = [...document.querySelectorAll('[data-testid="win-inputsday"] [data-testid^="idy-row-"]')].map(r => r.getBoundingClientRect())
  return { heights: rows.map(r => Math.round(r.height)), whole: rows.filter(r => r.bottom <= win.bottom - 2).length, of: rows.length, all: Math.round(rows[rows.length - 1].bottom - rows[0].top) }
})
const say = (name, m) => console.log(`${name}: cards ${m.heights.join(', ')}px tall; ${m.whole} of ${m.of} inputs whole on the first screen; the nine take ${m.all}px in all`)
const shot = (page, name) => page.screenshot({ path: join(OUT, name + '.png') })
/* HIS IDEA: the remark and "Placed by" share a row where both fit; where they do not, "Placed by" goes under the remark,
   still at the card's right end. `short` also drops the words "Placed by" and the year, and tightens the card. */
const compact = (page, short) => page.evaluate(short => {
  for (const row of document.querySelectorAll('[data-testid="win-inputsday"] [data-testid^="idy-row-"]')) {
    const rmk = row.querySelector('.sd-rmk'), placed = row.querySelector('.sd-placed')
    const line = document.createElement('span')
    line.style.cssText = 'grid-column:1 / -1;display:flex;flex-wrap:wrap;align-items:baseline;column-gap:12px;row-gap:1px;min-width:0'
    if (!rmk && !placed) continue
    row.insertBefore(line, rmk || placed)
    if (rmk) { line.appendChild(rmk); rmk.style.cssText += ';flex:0 1 auto;min-width:0' }
    if (placed) { line.appendChild(placed); placed.style.cssText += ';margin-left:auto;white-space:nowrap;text-align:right' }
    if (short) {
      if (placed) placed.textContent = placed.textContent.replace(/^Placed by\s+/, '').replace(/ (\d\d)(?=,)/, '').replace(/(\d+ \w{3}) 26,/, '$1,')
      row.style.cssText += ';padding:5px 9px;row-gap:1px;margin-bottom:4px'
      const open = row.querySelector('.sd-open'); if (open) open.style.minHeight = '22px'
    }
  }
}, short)

{ const { ctx, page } = await day(); say('a-today', await measure(page)); await shot(page, 'a-today'); await ctx.close() }
{ const { ctx, page } = await day(); await compact(page, false); say('b-his-idea', await measure(page)); await shot(page, 'b-his-idea'); await ctx.close() }
{ const { ctx, page } = await day(); await compact(page, true); say('c-shorter-words', await measure(page)); await shot(page, 'c-shorter-words'); await ctx.close() }
await browser.close()
