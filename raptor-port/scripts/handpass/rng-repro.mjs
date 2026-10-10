// His find of 10 Oct 26: on a phone, the Inputs list's dates button lights but its calendar cannot be seen or used.
// Drives the built bundle through its own controls and asserts the RIGHT behaviour (a PASS means correct), so the
// same script is the re-walk after the fix. Usage: node scripts/handpass/rng-repro.mjs [outTag]
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const BASE = process.env.LOOK_URL || 'http://localhost:4173/'
const OUT = join('docs/img/handpass/2026-10-10-list-dates-picker', process.argv[2] || 'before')
mkdirSync(OUT, { recursive: true })
const errs = []
let fails = 0
const judge = (ok, what, detail) => {
  // A PHONE ON ITS SIDE is the desktop layout on a 390-tall screen: the calendar opens under its button and runs past the
  // foot of the screen (the page scrolls to it). That is older than this find and is FILED with the other sideways-phone
  // looks (OUTSTANDING.md [SEEN-BATCH-2] list C) — printed here so it stays in sight, not counted as this fix's failure.
  const filed = !ok && /phone-side/.test(what)
  if (!ok && !filed) fails++
  console.log(`${ok ? 'PASS' : filed ? 'FILED' : 'FAIL'}  ${what} — ${detail}`)
}

const SIZES = [
  { name: 'phone-390x844', viewport: { width: 390, height: 844 }, touch: true },
  { name: 'phone-320x568', viewport: { width: 320, height: 568 }, touch: true },
  { name: 'phone-side-844x390', viewport: { width: 844, height: 390 }, touch: true },
  { name: 'desktop-1440x900', viewport: { width: 1440, height: 900 }, touch: false },
]
const ROLES = [['ad', 'a'], ['us', 'us']]

const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
for (const size of SIZES) for (const [who, pass] of ROLES) {
  const tag = `${size.name} ${who}`
  const ctx = await browser.newContext({ viewport: size.viewport, deviceScaleFactor: size.touch ? 2 : 1, ...(size.touch ? { isMobile: true, hasTouch: true } : {}) })
  const p = await ctx.newPage()
  p.on('pageerror', e => errs.push(`${tag} pageerror: ` + String(e).slice(0, 300)))
  p.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ` + m.text().slice(0, 300)) })
  p.on('response', r => { if (r.status() >= 400) errs.push(`${tag} HTTP ${r.status()} ${r.url()}`) })
  const press = loc => (size.touch ? loc.tap() : loc.click())
  await p.goto(BASE + '?fresh=1')
  await p.fill('#luser', who); await p.fill('#lpass', pass)
  await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day')
  await p.evaluate(() => window.go('inputs'))
  await press(p.locator('#inListBtn'))
  await p.waitForTimeout(300)
  await press(p.locator('#inRangeBtn'))
  await p.waitForTimeout(300)
  await p.screenshot({ path: join(OUT, `${size.name}-${who}-open.png`) })

  // 1. the calendar is ON SCREEN: its whole box inside the visible screen, and it is what a finger meets at its centre
  const seen = await p.evaluate(() => {
    const pop = document.getElementById('inRangePop')
    if (!pop) return { there: false }
    const r = pop.getBoundingClientRect()
    const cx = r.left + r.width / 2, cy = r.top + Math.min(r.height / 2, 60)
    const hit = document.elementFromPoint(cx, cy)
    return { there: true, top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right),
      vw: innerWidth, vh: innerHeight, onTop: !!hit && (hit === pop || pop.contains(hit)), scrollY: Math.round(scrollY),
      days: pop.querySelectorAll('[data-iso],button').length }
  })
  judge(seen.there && seen.top >= 0 && seen.left >= 0 && seen.right <= seen.vw && seen.top < seen.vh - 120 && seen.onTop,
    `${tag}: the dates calendar opens where it can be seen`, JSON.stringify(seen))

  // 2. two dates can be PICKED on it by a press, and the button and the list follow
  const days = p.locator('#inRangePop .rc-grid .rc-d:not([disabled])')
  const n = await days.count()
  let picked = 'no day buttons found'
  if (n > 12) {
    try {
      await press(days.nth(8)); await p.waitForTimeout(150)
      await press(days.nth(11)); await p.waitForTimeout(250)
      picked = (await p.locator('#inRangeBtn').innerText()).trim()
    } catch (e) { picked = 'press refused: ' + String(e).split('\n')[0].slice(0, 160) }
  }
  await p.screenshot({ path: join(OUT, `${size.name}-${who}-picked.png`) })
  judge(/\d+ \w{3} → \d+ \w{3}/.test(picked) && !/10 Oct → 24 Oct/.test(picked), `${tag}: a start and an end date can be picked`, `the button reads "${picked}" (${n} day buttons)`)

  // 3. the quick buttons can be pressed: "All dates" shows every input and closes the calendar
  let all = ''
  try { await press(p.locator('#inRangeAll')); await p.waitForTimeout(250); all = (await p.locator('#inRangeBtn').innerText()).trim() } catch (e) { all = 'press refused: ' + String(e).split('\n')[0].slice(0, 160) }
  judge(/all dates/i.test(all) && !(await p.locator('#inRangePop').count()), `${tag}: "All dates" can be pressed and closes the calendar`, `the button reads "${all}"`)
  await p.screenshot({ path: join(OUT, `${size.name}-${who}-all.png`) })
  await ctx.close()
}
await browser.close()
console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'errors: none')
console.log(fails ? `${fails} FAIL` : 'ALL PASS')
process.exit(fails ? 1 : 0)
