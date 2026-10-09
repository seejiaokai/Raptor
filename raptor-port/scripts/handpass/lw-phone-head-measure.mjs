// MEASURE the top of the Leave War — the Period line and the Stage line — at phone, tablet and desktop size, and write
// every control's words, box and type size to a JSON file ([LW-PHONE-HEADER-SPACE], D678 / D679). Run ONCE on the build
// before a change to that area and once after: the tablet's and the desktop's files must be byte for byte the same
// (D679 — "keep the same for desktop": nothing of the desktop's look may move as a side effect of the phone's build),
// and the phone's show what moved. Not a gate; the browser tests in e2e/leavewar.spec.ts pin the rules.
//
//   npm run build && npx vite preview --port 4180 --strictPort      (NOT 4173 — the browser tests reuse a server left there)
//   node scripts/handpass/lw-phone-head-measure.mjs <out dir>
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const OUT = process.argv[2] || 'test-results/lw-phone-head-measure'
mkdirSync(OUT, { recursive: true })
const URL = (process.env.LOOK_URL || 'http://localhost:4180/') + '?fresh=1'

const SIZES = [
  ['phone-360', { width: 360, height: 740 }, true],
  ['phone-390', { width: 390, height: 844 }, true],
  ['phone-430', { width: 430, height: 932 }, true],
  ['edge-431', { width: 431, height: 932 }, false],
  ['tablet-768', { width: 768, height: 1024 }, false],
  ['desktop-1440', { width: 1440, height: 900 }, false],
]
/* who is looking, and at which stage: an admin sees "+ New" and the stage's moves, a member neither */
const VIEWS = [
  ['admin-open', 'admin', 0],
  ['admin-closed', 'admin', 1],
  ['member-open', 'member', 0],
]

const browser = await chromium.launch(launchOptions)
for (const [size, viewport, touch] of SIZES) {
  for (const [view, role, advance] of VIEWS) {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, hasTouch: touch, isMobile: touch })
    const page = await ctx.newPage()
    await page.goto(URL)
    await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
    await page.click('#loginForm button[type=submit]')
    await page.waitForSelector('#vWeek .day')
    await page.evaluate(() => window.go('leavewar'))
    await page.waitForSelector('[data-testid="row-slipway"]')
    await page.waitForTimeout(400)
    for (let i = 0; i < advance; i++) await page.evaluate(() => window.lwAdvanceStage ? window.lwAdvanceStage() : null)
    if (advance) {
      /* through the page's own control where it is in sight; behind the stage button where it is not */
      const adv = page.locator('[data-testid="stage-advance"]')
      if (!(await adv.isVisible().catch(() => false))) await page.locator('[data-testid="stage-now"]').click()
      await adv.click()
      await page.waitForTimeout(250)
    }
    if (role === 'member') { await page.evaluate(() => { window.raptorRole('member'); window.lwSetRole('member') }); await page.waitForTimeout(250) }
    await page.mouse.move(viewport.width - 4, viewport.height - 4)
    const m = await page.evaluate(() => {
      const pg = document.querySelector('#page-leavewar')
      const box = el => { const r = el.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(n => Math.round(n * 10) / 10) }
      const one = el => {
        const cs = getComputedStyle(el)
        return {
          tag: el.tagName.toLowerCase(), cls: el.className && el.className.baseVal === undefined ? el.className : '', testid: el.getAttribute('data-testid') || '',
          text: el.children.length ? '' : (el.textContent || '').trim(), box: box(el), shown: cs.display !== 'none' && cs.visibility !== 'hidden',
          font: cs.fontSize + ' / ' + cs.fontWeight, pad: cs.padding, color: cs.color, bg: cs.backgroundColor, border: cs.border,
        }
      }
      const walk = root => root ? [one(root), ...[...root.querySelectorAll('*')].filter(el => !el.closest('svg') || el.tagName === 'svg').map(one)] : []
      return {
        topbar: walk(pg.querySelector(':scope > .topbar')),
        filters: walk(pg.querySelector(':scope > .filters')),
        gridTop: Math.round(pg.querySelector('.mx-outer').getBoundingClientRect().top * 10) / 10,
        pageOver: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      }
    })
    writeFileSync(join(OUT, `${size}-${view}.json`), JSON.stringify(m, null, 1))
    await page.screenshot({ path: join(OUT, `${size}-${view}.png`), clip: { x: 0, y: 0, width: viewport.width, height: Math.min(viewport.height, 430) } })
    console.log(`${size} ${view}: the grid starts at ${m.gridTop}px; the page runs ${m.pageOver}px past the screen`)
    await ctx.close()
  }
}
await browser.close()
