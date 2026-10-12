// W3 shared helpers - [ONE-DATE-CALENDAR] step one walk, Leave War posting dates. Drives http://localhost:4187/ only.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const HERE = dirname(fileURLToPath(import.meta.url))
export const ROOT = resolve(HERE, '..', '..', '..', '..')
export const OUT = resolve(ROOT, 'docs/img/handpass/2026-10-13-one-date-calendar/w3')
mkdirSync(OUT, { recursive: true })
export const URL0 = 'http://localhost:4187/'
export const SIZES = { desktop: [1440, 900, false], phone: [390, 844, true] }
export const errors = []

export async function newWorld(which, opts = {}) {
  const [W, H, TOUCH] = SIZES[which]
  const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
  const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: TOUCH ? 2 : 1, isMobile: TOUCH, hasTouch: TOUCH })
  const page = await ctx.newPage()
  const tag = `[${which}${opts.tag ? ' ' + opts.tag : ''}]`
  page.on('pageerror', e => errors.push(`${tag} pageerror ${String(e).slice(0, 200)}`))
  page.on('console', m => { if (m.type() === 'error') errors.push(`${tag} console ${m.text().slice(0, 200)}`) })
  page.on('response', r => { if (r.status() >= 400) errors.push(`${tag} http ${r.status()} ${r.url().slice(0, 120)}`) })
  const w = { browser, ctx, page, W, H, TOUCH, which, n: 0, results: [] }
  w.shot = async name => { const f = `${name}.png`; await page.screenshot({ path: join(OUT, f) }); console.log(`  picture ${f}`); return f }
  w.press = async sel => { const l = page.locator(sel).first(); if (TOUCH) await l.tap(); else await l.click(); await page.waitForTimeout(260) }
  w.vis = sel => page.evaluate(s => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }, sel)
  w.text = async sel => (await page.locator(sel).first().innerText()).replace(/\s+/g, ' ').trim()
  w.val = sel => page.locator(sel).first().getAttribute('data-value')
  w.cardOnTop = async name => {
    await page.waitForSelector('[data-testid="dcal-card"]', { timeout: 3000 })
    await page.waitForTimeout(260)
    const r = await page.evaluate(() => {
      const c = document.querySelector('[data-testid="dcal-card"]'); const b = c.getBoundingClientRect()
      const at = (x, y) => { const h = document.elementFromPoint(x, y); return !!h && (h === c || c.contains(h)) }
      return { l: Math.round(b.left), t: Math.round(b.top), r: Math.round(b.right), b: Math.round(b.bottom), centre: at(b.left + b.width / 2, b.top + b.height / 2),
        corners: [at(b.left + 6, b.top + 6), at(b.right - 6, b.top + 6), at(b.left + 6, b.bottom - 6), at(b.right - 6, b.bottom - 6)],
        cut: c.scrollWidth > c.clientWidth || c.scrollHeight > c.clientHeight, month: document.querySelector('[data-testid="dcal"]').getAttribute('data-month'), vw: innerWidth, vh: innerHeight }
    })
    r.ok = r.l >= 0 && r.t >= 0 && r.r <= r.vw && r.b <= r.vh && r.centre && r.corners.every(Boolean) && !r.cut
    console.log(`  ${name}: calendar ${r.ok ? 'ON TOP and wholly on screen' : 'PROBLEM'} ${JSON.stringify(r)}`)
    return r
  }
  w.boxFits = async (sel, holder, name) => {
    const b = await page.evaluate(([s, h]) => { const e = document.querySelector(s), f = document.querySelector(h); if (!e || !f) return null; const r = e.getBoundingClientRect(), q = f.getBoundingClientRect(); return { l: Math.round(r.left), r: Math.round(r.right), w: Math.round(r.width), fl: Math.round(q.left), fr: Math.round(q.right), vw: innerWidth } }, [sel, holder])
    const ok = !!b && b.w > 60 && b.l >= b.fl - 1 && b.r <= b.fr + 1 && b.r <= b.vw
    console.log(`  ${name}: box ${ok ? 'inside its sheet and the screen' : 'PROBLEM'} ${JSON.stringify(b)}`)
    return { ok, b }
  }
  w.pickDay = async iso => { await w.press(`[data-testid="dcal-day-${iso}"]`); await page.waitForTimeout(250) }
  w.gotoMonthAndPick = async iso => {
    const want = +iso.slice(0, 4) * 12 + +iso.slice(5, 7)
    for (let i = 0; i < 480; i++) {
      const at = await page.locator('[data-testid="dcal"]').getAttribute('data-month')
      const d = want - (+at.slice(0, 4) * 12 + +at.slice(5, 7))
      if (!d) break
      await w.press(d > 0 ? '[data-testid="dcal-next"]' : '[data-testid="dcal-prev"]')
    }
    await w.pickDay(iso)
  }
  w.login = async (user = 'ad', pass = 'a') => {
    await page.goto(URL0)
    await page.fill('#luser', user); await page.fill('#lpass', pass); await page.click('#loginForm button[type=submit]')
    await page.waitForSelector('#vWeek .day', { state: 'attached' })
    await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  }
  w.toLeaveWar = async (role = 'admin') => {
    await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(800)
    await page.waitForSelector('[data-testid="row-slipway"]', { timeout: 10000 })
    await page.evaluate(r => window.lwSetRole && window.lwSetRole(r), role); await page.waitForTimeout(300)
    if (await page.locator('[data-testid="month-JUL"]').count()) { await w.press('[data-testid="month-JUL"]'); await page.waitForTimeout(700) }
    // wait for the grid to rest
    await page.waitForSelector('[data-testid="head-2026-07-01"]', { timeout: 8000 }).catch(() => {})
    await page.waitForTimeout(500)
  }
  // tap a day of a man's row (scroll it into view first)
  w.tapCell = async (who, iso) => {
    const sel = `[data-testid="cell-${who}-${iso}"]`
    await page.locator(sel).first().scrollIntoViewIfNeeded()
    await page.waitForTimeout(150)
    await w.press(sel); await page.waitForTimeout(350)
  }
  w.close = async () => { await w.browser.close() }
  return w
}
// the app's hidden person id for a callsign as the Leave War's rows show it (Drifter is "slipway", Ranger is "bane" ...)
export const idOf = (page, name) => page.evaluate(n => { const r = [...document.querySelectorAll('[data-testid^="row-"]')].find(e => new RegExp('^\\s*' + n + '\\b', 'm').test(e.innerText)); return r ? r.getAttribute('data-testid').slice(4) : null }, name)
export const rec =(w, id, verdict, seen, pic = '') => { w.results.push({ id, verdict, seen, pic }); console.log(`>> S${id} ${verdict} - ${seen} ${pic ? '[' + pic + ']' : ''}`) }
