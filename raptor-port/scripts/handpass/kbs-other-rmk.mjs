// HIS REPORT, 25 OCT 26 07:06 — the input window on his iPhone: "Other" picked, Remarks tapped, the keys up — the window
// short, Remarks out of sight, an empty band under Cancel / Add ("The page seems to be too small"). Chromium cannot raise
// an iPhone's keyboard, so — as e2e/kbscroll.spec.ts does — window.visualViewport is a stand-in that shrinks and says so.
// MODE=plain: the keys come up (the visible screen 336 shorter), nothing else.
// MODE=pan: and then, as an iPhone does, the visible screen pans down (offsetTop) to show the focused box where it lies.
// Usage (from raptor-port/): node scripts/handpass/kbs-other-rmk.mjs   [PORT=4180] [KIND=Other] [MODE=plain|pan]
import { chromium } from 'playwright'
import { existsSync, mkdirSync } from 'node:fs'
const PORT = process.env.PORT || '4180', KIND = process.env.KIND || 'Other', MODE = process.env.MODE || 'plain'
const OUT = 'docs/img/handpass/2026-10-25-lw-drawings/kbs'
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const H = +(process.env.H || 874), KB = +(process.env.KB || 336), PAN_MS = +(process.env.PAN_MS || 0), PAN = +(process.env.PAN || 0)
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
await page.goto(`http://localhost:${PORT}/${process.env.KBDEBUG ? '?kbdebug' : ''}`)
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' })
await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(600)
/* the stand-in starts from the size the page had before its width was set; give it the real screen, as a phone's is */
await page.evaluate(() => { const v = window.__vv; v.height = innerHeight; v.width = innerWidth; v.dispatchEvent(new Event('resize')) })
if (process.env.FROM === 'day') {
  /* his recordings of 08:05: the window opened from a calendar day's panel ("+ Input"), the day panel left open behind it */
  await page.click('#inCalBtn'); await page.waitForTimeout(400)
  const cell = page.locator('[data-icday]').nth(10)
  const cb = await cell.boundingBox(); await page.touchscreen.tap(cb.x + cb.width / 2, cb.y + cb.height / 2)
  await page.locator('[data-testid="win-inputsday"]').waitFor()
  await page.locator('#icPopAdd').click()
} else { await page.click('#inListBtn'); await page.click('#inNew') }
const win = page.locator('[data-testid="win-inputedit"]')
await win.waitFor()
/* the Type box: the window's select that offers the kind (the first select can be the person's) */
const found = await page.evaluate(k => {
  const s = [...document.querySelectorAll('[data-testid="win-inputedit"] select')].find(s => [...s.options].some(o => o.text.trim() === k || o.value === k))
  if (!s) return false
  s.setAttribute('data-kind-sel', ''); return true
}, KIND)
if (!found) throw new Error(`no select offers ${KIND}`)
const sel = win.locator('select[data-kind-sel]')
await sel.selectOption({ label: KIND }).catch(async () => { await sel.selectOption(KIND) })
await page.waitForTimeout(300)
const rmk = page.locator('#inpEditRmk')
const geo = async tag => {
  const g = await page.evaluate(() => {
    const w = document.querySelector('[data-testid="win-inputedit"]'), body = w.querySelector('.win-body'), r = document.getElementById('inpEditRmk')
    const R = e => { const q = e.getBoundingClientRect(); return [Math.round(q.top), Math.round(q.bottom)] }
    const covered = (() => { const f = w.querySelector('.airpop-foot'); if (!f || !r) return null; const a = r.getBoundingClientRect(), b = f.getBoundingClientRect(); return Math.round(Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))) })()
    const foot = w.querySelector('.airpop-foot')
    return { win: R(w), body: body ? R(body) : null, bodyScroll: body ? [Math.round(body.scrollTop), body.scrollHeight, body.clientHeight] : null, rmk: R(r), foot: foot ? R(foot) : null,
      translate: w.style.translate, kbcap: w.style.getPropertyValue('--kbcap'), maxH: getComputedStyle(w).maxHeight, vv: [window.__vv.offsetTop, window.__vv.height], focused: document.activeElement === r, rmkUnderFoot: covered,
      day: (() => { const d = document.querySelector('[data-testid="win-inputsday"]'); return d ? R(d) : null })(),
      chain: (() => { const out = []; for (let a = r.parentElement; a && a !== document.body; a = a.parentElement) { const cs = getComputedStyle(a); if (cs.position === 'fixed' || cs.transform !== 'none' || a.dataset.kbcap != null || a.dataset.kblift) out.push((a.getAttribute('data-testid') || a.className.toString().slice(0, 30)) + ':' + cs.position + (cs.transform !== 'none' ? ':T' : '') + (a.dataset.kbcap != null ? ':held' : '') + (a.dataset.kblift ? ':lift' + a.dataset.kblift : '')) } return out.join(' > ') })() }
  })
  console.log(tag, JSON.stringify(g))
  return g
}
await geo('before')
await rmk.evaluate(e => e.scrollIntoView({ block: 'nearest' }))
const bx = await rmk.boundingBox()
await page.touchscreen.tap(bx.x + bx.width / 2, bx.y + bx.height / 2)
await page.waitForTimeout(100)
/* SHRINK=1: the layout itself shortens to the visible screen as the keys come (a browser that does — noteFullHeight in kbscroll.ts) */
if (process.env.SHRINK) await page.setViewportSize({ width: 402, height: H - KB })
await page.evaluate(([kb, h]) => { const v = window.__vv; v.height = h - kb; v.dispatchEvent(new Event('resize')) }, [KB, H])
await page.waitForTimeout(500)
await geo('keys up')
await page.screenshot({ path: `${OUT}/${KIND.toLowerCase()}-${MODE}-h${H}${process.env.SHRINK ? '-shrink' : ''}${process.env.FROM ? '-' + process.env.FROM : ''}-1-keysup.png` })
if (MODE === 'pan') {
  /* the phone's own pan: it scrolls the visible screen down so the focused box (where it lies in the layout) shows above the keys */
  if (PAN_MS) await page.waitForTimeout(PAN_MS)
  await page.evaluate(pan => {
    const v = window.__vv, r = document.getElementById('inpEditRmk').getBoundingClientRect()
    const want = pan || Math.max(0, Math.min(innerHeight - v.height, r.bottom + 8 - (v.offsetTop + v.height) + v.offsetTop))
    v.offsetTop = want; v.pageTop = want; v.dispatchEvent(new Event('scroll'))
  }, PAN)
  await page.waitForTimeout(500)
  await geo('after pan')
  await page.screenshot({ path: `${OUT}/${KIND.toLowerCase()}-${MODE}-h${H}${process.env.SHRINK ? '-shrink' : ''}${process.env.FROM ? '-' + process.env.FROM : ''}-2-afterpan.png` })
}
await page.keyboard.type('a'); await page.waitForTimeout(300)
await geo('after a key')
console.log('errors', errs.length ? errs : 'none')
await b.close()
