// THE HOST'S OWN RUN, calendar job's bug check (docs/handpass/2026-10-08-inputs-sans-calendar-check.md): on a short phone,
// can the last button of each settings window be REACHED — brought on screen by scrolling inside the window, and then be
// the thing a finger lands on? A PASS is the right behaviour, so running it on the fixed build is the re-walk.
//
//   node scripts/handpass/cal-host-short.mjs <out dir>
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = process.argv[2] || 'test-results/cal-host-short'
mkdirSync(OUT, { recursive: true })
const URL = (process.env.LOOK_URL || 'http://localhost:4180/') + '?fresh=1'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
let bad = 0
for (const h of [844, 664, 568]) {
  for (const [tab, gear, win, save] of [['#inSansMode', '[data-testid="sc-gear"]', 'win-sansset', 'sset-save'], ['#inMemberMode', '#inGear', 'win-inputsset', 'iset-save']]) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
    const page = await ctx.newPage()
    await page.goto(URL)
    await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
    await page.click('#loginForm button[type=submit]')
    await page.waitForSelector('#vWeek .day')
    await page.evaluate(() => window.go('inputs'))
    await page.locator(tab).tap()
    await page.locator(gear).tap()
    const w = page.locator(`[data-testid="${win}"]`)
    await w.waitFor()
    await page.waitForTimeout(300)
    await page.screenshot({ path: join(OUT, `${win}-${h}-1-opened.png`) })
    const m = await page.evaluate(([win, save]) => {
      const w = document.querySelector(`[data-testid="${win}"]`), b = document.querySelector(`[data-testid="${save}"]`)
      const body = w.querySelector('.win-body')
      const before = b.getBoundingClientRect()
      /* scroll the way a finger would: the window's own body, to its end */
      const scrollers = [body, w, ...w.querySelectorAll('*')].filter(e => e && e.scrollHeight > e.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(e).overflowY))
      for (const s of scrollers) s.scrollTop = s.scrollHeight
      const r = b.getBoundingClientRect(), wr = w.getBoundingClientRect()
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2
      const hit = document.elementFromPoint(cx, cy)
      return {
        winTop: Math.round(wr.top), winBottom: Math.round(wr.bottom), vh: innerHeight,
        saveBefore: [Math.round(before.top), Math.round(before.bottom)], saveAfter: [Math.round(r.top), Math.round(r.bottom)],
        scrollers: scrollers.length, onScreen: r.top >= 0 && r.bottom <= innerHeight, lands: !!hit && (hit === b || b.contains(hit)),
        pageScroll: document.documentElement.scrollHeight > innerHeight + 1,
      }
    }, [win, save])
    await page.screenshot({ path: join(OUT, `${win}-${h}-2-scrolled.png`) })
    const ok = m.onScreen && m.lands
    if (!ok) bad++
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${win} at 390x${h}: window ${m.winTop}..${m.winBottom} of ${m.vh}; Save at ${m.saveBefore.join('..')} when opened, ${m.saveAfter.join('..')} after scrolling the window (${m.scrollers} scrolling part(s)); on screen ${m.onScreen}, a finger lands on it ${m.lands}`)
    await ctx.close()
  }
}
await browser.close()
console.log(bad ? `\n${bad} not reachable` : '\nevery Save reachable')
process.exit(bad ? 1 : 0)
