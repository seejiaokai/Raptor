// MOCK-UPS: the top of the Leave War on a phone, using less height (owner, 8 Oct 26, with a phone picture of the page,
// the area above the grid circled: "how can we optimise the space such that we don't use so much vertical space? Give
// me mock ups for ideas to rearrange or minimise"). Three ideas, each DRAWN INTO THE RUNNING BUILD (D634 — the way to
// draw a change to an existing screen): the real page is opened at phone size and only the top area is re-arranged in
// the live page by this script. NOTHING HERE IS BUILT — the controls in the pictures are the app's own, moved; a menu
// or a bar that does not exist yet is drawn by hand in the app's colours. Not a gate; a person opens the pictures.
//
//   npm run build && npx vite preview --port 4180 --strictPort      (NOT 4173 — the browser tests reuse a server left there)
//   node scripts/handpass/lw-phone-head-mock.mjs <out dir>
//
// Prints, for each picture, where the grid's first row starts and how many more roster rows fit than today.
// The figures are the demo squadron's, so the pictures may go into the repo.
import { chromium, devices } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const OUT = process.argv[2] || 'test-results/lw-phone-head-mock'
mkdirSync(OUT, { recursive: true })

/* each variant: a function run IN THE PAGE that re-arranges the top area */
const VARIANTS = {
  today: () => {},

  /* A — TWO LINES. Line 1: the period, "+", and who he is viewing as. Line 2: the stage (its moves behind the chip),
     the bidding dates, under-manned, Legend. Every word he reads today is still on screen; only the labels go. */
  a: (menu) => {
    const pg = document.querySelector('#page-leavewar'), q = t => pg.querySelector(`[data-testid="${t}"]`)
    const tb = pg.querySelector(':scope > .topbar'), sp = tb.querySelector('.spring'), fl = pg.querySelector(':scope > .filters')
    q('period-label').remove()
    const nw = q('war-new'); if (nw) { nw.textContent = '+'; nw.style.cssText += ';min-width:30px;width:30px;height:30px;padding:0;text-align:center;font-size:17px;line-height:1' }
    tb.style.cssText += ';height:auto;min-height:0;padding:6px 12px 5px'
    sp.style.cssText += ';display:flex;flex-wrap:nowrap;align-items:center;gap:8px;height:auto;min-height:0;flex:1 1 auto;width:100%'
    const vw = q('lw-viewing'); if (vw) vw.style.cssText += ';margin:0 0 0 auto;position:static;flex:0 0 auto'
    const st = q('stage-now'), adv = q('stage-advance'), back = q('stage-back'), win = q('bid-window'), um = q('undermanned'), lg = q('legend-open')
    st.textContent = 'OPEN FOR BIDDING ▾'
    win.textContent = '1 Jan – 31 Mar'
    um.innerHTML = '<span style="opacity:.7;font-weight:500;margin-right:4px">Under</span>0 days'
    fl.replaceChildren(st, win, um, lg)
    fl.style.cssText += ';display:flex;flex-wrap:nowrap;align-items:center;gap:4px;padding:2px 10px 8px;height:auto;min-height:0'
    for (const el of [st, win, um, lg]) el.style.cssText += ';flex:0 0 auto;white-space:nowrap;margin:0;padding-left:7px;padding-right:7px'
    lg.style.marginLeft = 'auto'
    if (menu) {
      const r = st.getBoundingClientRect()
      st.style.outline = '2px solid #3bc6e8'; st.style.outlineOffset = '1px'
      const m = document.createElement('div')
      m.style.cssText = `position:fixed;left:${r.left}px;top:${r.bottom + 6}px;z-index:500;background:#141a21;border:1px solid #34404b;border-radius:10px;padding:8px;box-shadow:0 14px 34px rgba(0,0,0,.6);display:flex;flex-direction:column;gap:7px;min-width:214px`
      const cap = document.createElement('div'); cap.textContent = 'MOVE THE STAGE'
      cap.style.cssText = 'font:600 10px/1 inherit;letter-spacing:.14em;color:#7c8791;padding:2px 2px 0'
      for (const b of [adv, back]) b.style.cssText += ';display:block;width:100%;text-align:left;margin:0;padding:8px 10px;height:auto'
      m.append(cap, adv, back)
      pg.append(m)
    }
  },

  /* B — ONE LINE THAT OPENS. A single bar says the period, the stage and the bidding dates; a tap unfolds today's
     controls under it. Under-manned shows on the bar only when there ARE under-manned days. */
  b: (open) => {
    const pg = document.querySelector('#page-leavewar'), q = t => pg.querySelector(`[data-testid="${t}"]`)
    const tb = pg.querySelector(':scope > .topbar'), fl = pg.querySelector(':scope > .filters')
    const bar = document.createElement('div')
    bar.style.cssText = 'display:flex;align-items:center;gap:8px;margin:7px 12px 6px;padding:6px 10px;background:#141a21;border:1px solid #2f3a45;border-radius:9px;white-space:nowrap'
    const per = document.createElement('b'); per.textContent = 'JAN – DEC 26'; per.style.cssText = 'font-weight:700;font-size:13px;letter-spacing:.05em'
    const st = q('stage-now').cloneNode(true); st.removeAttribute('data-testid'); st.style.cssText += ';flex:0 0 auto;margin:0'
    const dt = document.createElement('span'); dt.textContent = '1 Jan – 31 Mar'; dt.style.cssText = 'font-size:12px;color:#aab4bd'
    const ar = document.createElement('span'); ar.textContent = open ? '▴' : '▾'; ar.style.cssText = 'margin-left:auto;color:#3bc6e8;font-size:13px'
    bar.append(per, st, dt, ar)
    pg.insertBefore(bar, tb)
    if (!open) { tb.style.display = 'none'; fl.style.display = 'none' }
    else bar.style.borderColor = '#3bc6e8'
  },

  /* C — TWO LINES, THE SECOND ONE SWIPES. Line 1 as A's (with "+ New" whole). Line 2 is every control of today's
     three lower lines in ONE row that slides sideways under a thumb, as the month buttons do. Nothing is renamed and
     nothing is behind a menu; what does not fit is a swipe away, and the faded right edge says there is more. */
  c: (swiped) => {
    const pg = document.querySelector('#page-leavewar'), q = t => pg.querySelector(`[data-testid="${t}"]`)
    const tb = pg.querySelector(':scope > .topbar'), sp = tb.querySelector('.spring'), fl = pg.querySelector(':scope > .filters')
    q('period-label').remove()
    tb.style.cssText += ';height:auto;min-height:0;padding:6px 12px 5px'
    sp.style.cssText += ';display:flex;flex-wrap:nowrap;align-items:center;gap:8px;height:auto;min-height:0;flex:1 1 auto;width:100%'
    const vw = q('lw-viewing'); if (vw) vw.style.cssText += ';margin:0 0 0 auto;position:static;flex:0 0 auto'
    fl.querySelector('.lab')?.remove()                              // "Stage": the chip beside it says so
    fl.style.cssText += ';display:flex;flex-wrap:nowrap;align-items:center;gap:6px;padding:2px 12px 8px;height:auto;min-height:0;overflow-x:auto;scrollbar-width:none'
    for (const el of fl.children) el.style.cssText += ';flex:0 0 auto;white-space:nowrap;margin:0'
    for (const lab of fl.querySelectorAll('.lab')) lab.style.marginLeft = '8px'
    const fade = swiped ? 'linear-gradient(90deg,transparent,#000 9%)' : 'linear-gradient(90deg,#000 86%,transparent)'
    fl.style.webkitMaskImage = fade; fl.style.maskImage = fade
    if (swiped) fl.scrollLeft = fl.scrollWidth
  },
}
const SHOTS = [
  ['today', 'today', false], ['a', 'a', false], ['a-menu', 'a', true], ['b', 'b', false], ['b-open', 'b', true], ['c', 'c', false], ['c-swiped', 'c', true],
]

const browser = await chromium.launch(launchOptions)
let base = null
for (const [name, variant, arg] of SHOTS) {
  const ctx = await browser.newContext({ ...devices['iPhone 13'] })
  const page = await ctx.newPage()
  await page.goto((process.env.LOOK_URL || 'http://localhost:4180/') + '?fresh=1')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector('[data-testid="row-slipway"]')
  await page.waitForTimeout(500)
  /* a counter and the running figures, so the grid under the head looks as his does */
  await page.evaluate(() => {
    window.setFlyRun('2026-01-02', { p: 16, w: 16 })
    window.lwSaveManningRule({ id: 'sc-d', label: 'SC D', count: { kind: 'people', filter: { seats: ['wso'] } }, threshold: { amber: 0, red: 0 } })
  })
  await page.waitForSelector('[data-testid="count-sc-d"]')
  await page.mouse.move(380, 660)                      // off the grid: a still pointer tints the row under it
  await page.evaluate(VARIANTS[variant], arg)
  await page.waitForTimeout(350)
  const m = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('[data-testid^="row-"]')]
    const h = rows[1].getBoundingClientRect().top - rows[0].getBoundingClientRect().top
    const seen = rows.filter(r => r.getBoundingClientRect().bottom <= innerHeight).length
    const fl = document.querySelector('#page-leavewar > .filters')
    return { grid: Math.round(document.querySelector('#page-leavewar .mx-outer').getBoundingClientRect().top), rowH: Math.round(h), seen, over: fl ? Math.round(fl.scrollWidth - fl.clientWidth) : 0 }
  })
  if (name === 'today') base = m
  console.log(`${name}.png — the grid starts at ${m.grid}px (today ${base.grid}): ${base.grid - m.grid}px saved, ${m.seen} names on screen (today ${base.seen})` + (m.over > 0 ? ` — the second line runs ${m.over}px past the screen` : ''))
  await page.screenshot({ path: join(OUT, `${name}.png`) })
  await ctx.close()
}
await browser.close()
