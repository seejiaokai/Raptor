// THE SAME FAULT'S OTHER HOME (25 OCT 26): the Holidays form (Leave War ⚙ → Calendar… → Holidays → + Add) pins its
// buttons to the foot of its scrolling body, as the input window does. Its lowest box to type in is tapped with the keys up
// (kbs-other-rmk.mjs's stand-in keyboard) and checked against the pinned buttons.
// Usage (from raptor-port/): node scripts/handpass/kbs-hol.mjs   [PORT=4180] [H=762] [KB=500] [SHRINK=1]
import { chromium } from 'playwright'
import { existsSync, mkdirSync } from 'node:fs'
const PORT = process.env.PORT || '4180', H = +(process.env.H || 762), KB = +(process.env.KB || 500)
const OUT = 'docs/img/handpass/2026-10-25-lw-drawings/kbs'
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ctx = await b.newContext({ viewport: { width: 402, height: H }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
const page = await ctx.newPage()
const errs = []
page.on('pageerror', e => errs.push(String(e)))
await page.addInitScript(() => {
  class FakeVV extends EventTarget { width = innerWidth; height = innerHeight; offsetTop = 0; offsetLeft = 0; pageTop = 0; pageLeft = 0; scale = 1 }
  const f = new FakeVV()
  Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => f })
  window.__vv = f
})
await page.goto(`http://localhost:${PORT}/`)
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' })
await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(900)
await page.evaluate(() => { const v = window.__vv; v.height = innerHeight; v.width = innerWidth; v.dispatchEvent(new Event('resize')) })
const tid = id => page.locator(`[data-testid="${id}"]`)
await tid('settings-open').tap(); await tid('settings-days').tap()
await tid('win-days').waitFor()
await tid('days-tab-holidays').tap()
await tid('hol-add').tap()
const form = tid('win-holiday')
await form.waitFor()
/* the lowest box to type in */
await page.evaluate(() => {
  const all = [...document.querySelectorAll('[data-testid="win-holiday"] input:not([type=checkbox]):not([type=radio]):not([type=button]), [data-testid="win-holiday"] textarea')]
    .filter(e => e.offsetParent)
  all.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
  all.at(-1)?.setAttribute('data-low', '')
})
const box = page.locator('[data-testid="win-holiday"] [data-low]')
const geo = async tag => {
  const g = await page.evaluate(() => {
    const w = document.querySelector('[data-testid="win-holiday"]'), r = document.querySelector('[data-low]'), acts = w.querySelector('.hol-acts')
    const R = e => { const q = e.getBoundingClientRect(); return [Math.round(q.top), Math.round(q.bottom)] }
    const a = r.getBoundingClientRect(), f = acts.getBoundingClientRect()
    return { win: R(w), box: R(r), acts: R(acts), under: Math.round(Math.max(0, Math.min(a.bottom, f.bottom) - Math.max(a.top, f.top))), kbcap: w.style.getPropertyValue('--kbcap') || (w.closest('[data-kbcap]') ? 'held' : ''), vv: [window.__vv.offsetTop, window.__vv.height], label: r.getAttribute('aria-label') || r.placeholder || r.id }
  })
  console.log(tag, JSON.stringify(g))
}
await geo('before')
await box.evaluate(e => e.scrollIntoView({ block: 'nearest' }))
const bx = await box.boundingBox()
await page.touchscreen.tap(bx.x + bx.width / 2, bx.y + bx.height / 2)
await page.waitForTimeout(100)
if (process.env.SHRINK) await page.setViewportSize({ width: 402, height: H - KB })
await page.evaluate(([kb, h]) => { const v = window.__vv; v.height = h - kb; v.dispatchEvent(new Event('resize')) }, [KB, H])
await page.waitForTimeout(500)
await geo('keys up')
await page.screenshot({ path: `${OUT}/holidays-h${H}-kb${KB}${process.env.SHRINK ? '-shrink' : ''}.png` })
console.log('errors', errs.length ? errs : 'none')
await b.close()
