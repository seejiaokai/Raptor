/* D260–D262 walk (27 Sep 26) — shared helpers on top of the absence re-test's drivers (../ab/ab-lib.mjs, ../ab/w3-lib.mjs).
   The build is served on 4175 (this chat's port, D228); pictures go to docs/img/handpass/2026-09-27-d260-d262/<width>/.
   A PHONE here is a real touch device (hasTouch, isMobile): taps go through the touchscreen, and a held finger or a
   hold-and-drag is sent over CDP as real touch events (bug-check order §7.8), so the pointer events the app sees are
   `pointerType: touch` — the device branches the code takes. Everything drives the app's own controls; reads of the
   saved world are for the evidence table only. */
import { WIDTH, ROOT, RUN } from './mv-env.mjs'
import { existsSync, mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'
import { login, BASE, sheetNow } from '../ab/w3-lib.mjs'
export * from '../ab/w3-lib.mjs'
export { WIDTH, ROOT, RUN }
export const PHONE = WIDTH === 'phone'

/** The browser, at desktop 1440×900 or a 390×844 touch phone, signed in. */
export async function openMv(who = 'a') {
  const CH = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
  mkdirSync(process.env.HP_SHOTS, { recursive: true })
  const browser = await chromium.launch({ headless: true, ...(existsSync(CH) ? { executablePath: CH } : {}) })
  const ctx = await browser.newContext(PHONE
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true }
    : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  await page.goto(BASE + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await login(page, who)
  const cdp = PHONE ? await ctx.newCDPSession(page) : null
  return { browser, page, errors, cdp }
}

/** Sign in as the other person the way he does: a reload brings the sign-in card back. */
export async function signInAs(page, who) {
  await page.reload()
  await page.waitForTimeout(1200)
  if (await page.locator('#luser:visible').count()) await login(page, who)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' }).catch(() => {})
  await page.waitForTimeout(400)
}

/** The centre of a box on screen, after bringing it into view — and whether it is what sits there. */
export async function centre(page, testid) {
  const c = page.locator(`[data-testid="${testid}"]`).first()
  if (!(await c.count())) return null
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await page.waitForTimeout(300)
  return c.evaluate(e => { const b = e.getBoundingClientRect(); const x = b.left + b.width / 2, y = b.top + b.height / 2
    const h = document.elementFromPoint(x, y); return { x, y, ok: !!h && (h === e || e.contains(h)), over: h ? `${h.tagName}[${h.getAttribute('data-testid') || h.className}]` : 'nothing' } })
}
/** Where a box is NOW, without scrolling (a move in flight must not be disturbed by a scroll the person did not make). */
export async function at(page, testid) {
  return page.locator(`[data-testid="${testid}"]`).first().evaluate(e => { const b = e.getBoundingClientRect(); const x = b.left + b.width / 2, y = b.top + b.height / 2
    const h = document.elementFromPoint(x, y); return { x, y, ok: !!h && (h === e || e.contains(h)) } }).catch(() => null)
}

/** A person's tap (a finger on the phone, a mouse click on the desktop) at a point. */
export async function tapAt(page, x, y) {
  if (PHONE) await page.touchscreen.tap(x, y)
  else await page.mouse.click(x, y)
  await page.waitForTimeout(500)
}
/** Tap a box where it is now (no scrolling). */
export async function tapBox(page, testid) {
  const p = await at(page, testid)
  if (!p) return { tapped: false, why: 'no box' }
  if (!p.ok) return { tapped: false, why: 'covered' }
  await tapAt(page, p.x, p.y)
  return { tapped: true }
}
/** Press a control in the open sheet (or anywhere) with a finger on the phone. */
export async function press(page, testid) {
  const b = page.locator(`[data-testid="${testid}"]:visible`).last()
  if (!(await b.count())) return { pressed: false, why: 'absent' }
  if (await b.isDisabled()) return { pressed: false, why: 'disabled' }
  if (PHONE) await b.tap(); else await b.click()
  await page.waitForTimeout(600)
  return { pressed: true }
}

/** A finger held, then (optionally) dragged through `path` points, then lifted — real touch events over CDP. */
export async function fingerHoldDrag(page, cdp, start, path = [], { holdMs = 260, stepMs = 30, dwellMs = 0 } = {}) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: start.x, y: start.y, id: 7 }] })
  await page.waitForTimeout(holdMs)
  let last = start
  for (const p of path) {
    const n = 6
    for (let i = 1; i <= n; i++) {
      const x = last.x + (p.x - last.x) * i / n, y = last.y + (p.y - last.y) * i / n
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y, id: 7 }] })
      await page.waitForTimeout(stepMs)
    }
    last = p
    if (p.dwell) await page.waitForTimeout(p.dwell)
  }
  if (dwellMs) await page.waitForTimeout(dwellMs)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await page.waitForTimeout(600)
}
/** A quick sideways swipe (no hold) — the grid's own scroll. */
export async function fingerSwipe(page, cdp, from, to) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from.x, y: from.y, id: 8 }] })
  for (let i = 1; i <= 8; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from.x + (to.x - from.x) * i / 8, y: from.y + (to.y - from.y) * i / 8, id: 8 }] })
    await page.waitForTimeout(12)
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await page.waitForTimeout(1300)                 // let the fling settle: a tap during it only stops the scroll
}

/** The move banner's words, or '' when no move is on. */
export async function banner(page) {
  const b = page.locator('[data-testid="move-banner"]:visible')
  return (await b.count()) ? (await b.innerText()).replace(/\s+/g, ' ').trim() : ''
}
/** The grid's sideways scroll, and the days the landing preview has painted. */
export async function gridState(page) {
  return page.evaluate(() => {
    const w = document.querySelector('.mx-wrap')
    return { scrollLeft: w ? Math.round(w.scrollLeft) : null, landing: [...document.querySelectorAll('.mvland')].map(e => e.getAttribute('data-testid')) }
  })
}
/** The day under a point on screen (a roster box's date), or null. */
export async function dayAt(page, x, y) {
  return page.evaluate(([x, y]) => { const h = document.elementFromPoint(x, y); const c = h && h.closest('[data-testid^="cell-"]'); return c ? c.getAttribute('data-testid').slice(-10) : null }, [x, y])
}
/** The grid's box on screen, the days' left edge (past the frozen columns) and the move banner's top. */
export async function gridBox(page) {
  return page.evaluate(() => {
    const w = document.querySelector('.mx-wrap').getBoundingClientRect()
    const fr = document.querySelector('.mx .who, td.who, [data-testid^="person-"]')
    const whoR = fr ? fr.getBoundingClientRect() : null
    const b = document.querySelector('[data-testid="move-banner"]')
    const bal = [...document.querySelectorAll('[data-testid^="bal-"]')].map(e => e.getBoundingClientRect().right).filter(x => x > 0)
    return { left: Math.round(w.left), right: Math.round(w.right), top: Math.round(w.top), bottom: Math.round(w.bottom), inner: [innerWidth, innerHeight], namesRight: whoR ? Math.round(whoR.right) : null, daysLeft: bal.length ? Math.round(Math.max(...bal)) : null, bannerTop: b ? Math.round(b.getBoundingClientRect().top) : null }
  })
}
export { sheetNow }
