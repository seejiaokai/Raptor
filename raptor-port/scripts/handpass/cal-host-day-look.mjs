// A LOOK, not a gate (owner D683, 9 Oct 26 — docs/handpass/2026-10-08-inputs-sans-calendar-check.md §15): the day opened
// on the Inputs calendar, pictured and measured in the built bundle — tall as it opens on a phone, the title box and
// "+ Input" a little shorter, "+ Note" and "+ Pucks" in the bar beside the date. It prints what it measured.
//
//   node scripts/handpass/cal-host-day-look.mjs <out dir>
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
const OUT = process.argv[2] || 'test-results/cal-host-day-look'
mkdirSync(OUT, { recursive: true })
const URL = (process.env.LOOK_URL || 'http://localhost:4180/') + '?fresh=1'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
async function run(tag, viewport, touch, who = ['ad', 'a']) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  await page.goto(URL)
  await page.fill('#luser', who[0]); await page.fill('#lpass', who[1])
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  await page.evaluate(() => window.go('inputs'))
  for (let i = 0; i < 40; i++) {
    const [name, year] = (await page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = 2026 * 12 + 6 - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) break
    await page.locator(d > 0 ? '#icNext' : '#icPrev').click()
  }
  const cell = page.locator('#inpCal [data-icday="2026-07-16"]')
  if (touch) await cell.tap({ position: { x: 10, y: 10 } }); else await cell.click({ position: { x: 8, y: 8 } })
  const win = page.locator('[data-testid="win-inputsday"]'); await win.waitFor(); await page.waitForTimeout(500)
  await page.screenshot({ path: join(OUT, `day-${tag}-1-opened.png`) })
  const m = await page.evaluate(() => {
    const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { w: Math.round(b.width), h: Math.round(b.height), top: Math.round(b.top), bottom: Math.round(b.bottom) } }
    return { win: r('[data-testid="win-inputsday"]'), title: r('#icRmkEdit'), add: r('#icPopAdd'), note: r('#icAddPuck'), pucks: r('#icAddPucks'), x: r('[data-testid="win-inputsday-x"]'), ttl: r('[data-testid="win-inputsday"] .win-ttl'), vh: innerHeight, side: document.documentElement.scrollWidth <= innerWidth, tall: document.querySelector('[data-testid="win-inputsday"]').className.includes('is-tall') }
  })
  console.log(tag, JSON.stringify(m))
  if (touch) {
    await win.locator('.win-ttl').tap(); await page.waitForTimeout(450)
    await page.screenshot({ path: join(OUT, `day-${tag}-2-pulled-down.png`) })
    console.log(tag, 'after a tap on the bar, tall:', await win.evaluate(e => e.className.includes('is-tall')), '· an input opened by mistake:', await page.locator('[data-testid="win-inputedit"]').count())
    await win.locator('.win-ttl').tap(); await page.waitForTimeout(450)
  }
  if (await page.locator('#icAddPuck').count()) {
    if (touch) await page.locator('#icAddPuck').tap(); else await page.locator('#icAddPuck').click()
    await page.waitForTimeout(300)
    await page.screenshot({ path: join(OUT, `day-${tag}-3-note-pressed.png`) })
    console.log(tag, 'the note box up:', await page.locator('.ic-poppuck-edit').count(), '· still tall:', await win.evaluate(e => e.className.includes('is-tall')))
  }
  await ctx.close()
}
await run('phone-admin', { width: 390, height: 844 }, true)
await run('phone-member', { width: 390, height: 844 }, true, ['us', 'us'])
await run('phone-short', { width: 390, height: 568 }, true)
await run('phone-side', { width: 844, height: 390 }, true)
await run('desktop-admin', { width: 1440, height: 900 }, false)
await browser.close()
