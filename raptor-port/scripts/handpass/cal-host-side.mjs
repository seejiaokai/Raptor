// THE HOST'S OWN RUN, calendar job's bug check (docs/handpass/2026-10-08-inputs-sans-calendar-check.md — walker D's F1):
// on a phone turned on its SIDE (844 x 390), does a day opened on the SANS calendar and on the Inputs calendar show its
// entries, and can the last one be reached? A PASS is the right behaviour, so the fixed build's run is the re-walk.
//
//   node scripts/handpass/cal-host-side.mjs <out dir>
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = process.argv[2] || 'test-results/cal-host-side'
mkdirSync(OUT, { recursive: true })
const URL = (process.env.LOOK_URL || 'http://localhost:4180/') + '?fresh=1'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
let bad = 0
for (const [name, tab, day, win, rowSel] of [
  ['the SANS day', '#inSansMode', '[data-testid="sc-day-2026-10-07"]', 'win-sansday', '.sd-list [data-testid^="sd-row-"]'],
  ['the Inputs day', '#inMemberMode', '[data-icday="2026-07-14"]', 'win-inputsday', '[data-testid="idy-list"] [data-testid^="idy-row-"]'],
]) {
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const page = await ctx.newPage()
  await page.goto(URL)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  await page.evaluate(() => window.go('inputs'))
  await page.locator(tab).tap()
  /* to the month that holds the day: October for the SANS demo, July for the Inputs demo */
  const wantM = day.includes('2026-07') ? 7 : 10
  for (let i = 0; i < 24; i++) {
    const lab = page.locator(tab === '#inSansMode' ? '[data-testid="sc-month"]' : '#inpCal .ic-mon')
    const [mm, yy] = (await lab.textContent()).trim().toLowerCase().split(/\s+/)
    const at = +yy * 12 + ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].indexOf(mm.slice(0, 3))
    const d = 2026 * 12 + (wantM - 1) - at
    if (!d) break
    await page.locator(tab === '#inSansMode' ? `[data-testid="${d > 0 ? 'sc-next' : 'sc-prev'}"]` : (d > 0 ? '#icNext' : '#icPrev')).tap()
  }
  await page.locator(day).scrollIntoViewIfNeeded()
  await page.locator(day).tap({ position: { x: 8, y: 8 } })
  const w = page.locator(`[data-testid="${win}"]`)
  await w.waitFor()
  await page.waitForTimeout(400)
  await page.screenshot({ path: join(OUT, `${win}-side-1-opened.png`) })
  const m = await page.evaluate(([win, rowSel]) => {
    const w = document.querySelector(`[data-testid="${win}"]`)
    const rows = [...w.querySelectorAll(rowSel)]
    const wr = w.getBoundingClientRect()
    const vis = r => { const b = r.getBoundingClientRect(); return b.height > 0 && b.top >= wr.top - 1 && b.bottom <= Math.min(wr.bottom, innerHeight) + 1 }
    const before = rows.filter(vis).length
    const scrollers = [w, ...w.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(e).overflowY))
    for (const s of scrollers) s.scrollTop = s.scrollHeight
    const last = rows[rows.length - 1]
    const lb = last ? last.getBoundingClientRect() : null
    const hit = lb ? document.elementFromPoint(lb.left + lb.width / 2, lb.top + Math.min(lb.height / 2, 12)) : null
    return { rows: rows.length, seenAtOpen: before, win: [Math.round(wr.top), Math.round(wr.bottom)], vh: innerHeight,
      lastOnScreen: !!lb && lb.top >= 0 && lb.bottom <= innerHeight + 1, lastLands: !!hit && !!last && (hit === last || last.contains(hit)) }
  }, [win, rowSel])
  await page.screenshot({ path: join(OUT, `${win}-side-2-scrolled.png`) })
  /* the top may fill a 270px window by itself: what matters is that every entry is REACHED by scrolling the window */
  const ok = m.rows > 0 && m.lastOnScreen && m.lastLands
  if (!ok) bad++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name} at 844x390: window ${m.win.join('..')} of ${m.vh}; ${m.rows} entries, ${m.seenAtOpen} in view when opened; after scrolling the window the last is on screen ${m.lastOnScreen} and a finger lands on it ${m.lastLands}`)
  await ctx.close()
}
await browser.close()
process.exit(bad ? 1 : 0)
