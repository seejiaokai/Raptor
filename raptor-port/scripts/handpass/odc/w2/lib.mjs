// W2 walker helper library — [ONE-DATE-CALENDAR] step one walk, 13 Oct 26. VERSION 1
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
export const ROOT = resolve(HERE, '..', '..', '..', '..')
export const SHOTS = resolve(ROOT, 'docs/img/handpass/2026-10-13-one-date-calendar/w2')
mkdirSync(SHOTS, { recursive: true })
export const URL0 = 'http://localhost:4187/'
export const SIZES = { desktop: [1440, 900, false], phone: [390, 844, true] }

export async function openWorld(which, who = 'ad', pass = 'a') {
  const [W, H, TOUCH] = SIZES[which]
  const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
  const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: TOUCH, hasTouch: TOUCH })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push('pageerror ' + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errors.push('console ' + m.text().slice(0, 200)) })
  page.on('response', r => { if (r.status() >= 400) errors.push(`http ${r.status()} ${r.url().slice(0, 120)}`) })
  await page.goto(URL0)
  await login(page, who, pass)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  return { browser, ctx, page, errors, W, H, TOUCH }
}
export async function login(page, who, pass) {
  await page.fill('#luser', who); await page.fill('#lpass', pass); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
}

export function tools(world, prefix) {
  const { page, W, H, TOUCH } = world
  let n = 0
  const results = []
  const shot = async name => { const f = `${prefix}-${name}.png`; await page.screenshot({ path: join(SHOTS, f) }); console.log(`  picture ${f}`); return f }
  const press = async sel => { const l = page.locator(sel).first(); if (TOUCH) await l.tap(); else await l.click(); await page.waitForTimeout(260) }
  const vis = sel => page.evaluate(s => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }, sel)
  const rect = sel => page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height) } }, sel)
  const text = sel => page.locator(sel).first().innerText()
  const val = sel => page.locator(sel).first().evaluate(e => e.getAttribute('data-value'))
  const rec = (id, size, verdict, seen, pic = '') => { results.push({ id, size, verdict, seen, pic }); console.log(`  [${id}] ${verdict} — ${seen}`) }
  async function boxFits(sel, holder, name) {
    const b = await rect(sel), h = await rect(holder)
    const ok = !!b && !!h && b.l >= 0 && b.r <= W && b.l >= h.l - 1 && b.r <= h.r + 1
    console.log(`  ${ok ? 'ok' : 'NOT-OK'} ${name}: box inside form+screen`, JSON.stringify({ b, h, W }))
    return { ok, b, h }
  }
  async function cardOnTop(name) {
    await page.waitForSelector('[data-testid="dcal-card"]', { timeout: 3000 })
    await page.waitForTimeout(220)
    const r = await page.evaluate(() => {
      const c = document.querySelector('[data-testid="dcal-card"]'); const b = c.getBoundingClientRect()
      const at = (x, y) => { const h = document.elementFromPoint(x, y); return !!h && (h === c || c.contains(h)) }
      return { l: Math.round(b.left), t: Math.round(b.top), r: Math.round(b.right), b: Math.round(b.bottom), w: Math.round(b.width), h: Math.round(b.height),
        centre: at(b.left + b.width / 2, b.top + b.height / 2), corners: [at(b.left + 6, b.top + 6), at(b.right - 6, b.top + 6), at(b.left + 6, b.bottom - 6), at(b.right - 6, b.bottom - 6)],
        month: document.querySelector('[data-testid="dcal"]').getAttribute('data-month'), vw: innerWidth, vh: innerHeight }
    })
    r.wholly = r.l >= 0 && r.t >= 0 && r.r <= r.vw && r.b <= r.vh
    r.onTop = r.centre && r.corners.every(Boolean)
    console.log(`  ${name}: calendar wholly on screen=${r.wholly} on top=${r.onTop}`, JSON.stringify(r))
    return r
  }
  const pick = async iso => { await press(`[data-testid="dcal-day-${iso}"]`); await page.waitForTimeout(250) }
  const closeCal = async () => { if (await vis('[data-testid="dcal-scrim"]')) { await page.mouse.click(4, 4); await page.waitForTimeout(250) } }
  const iso = (d) => d.toISOString().slice(0, 10)
  const addDays = (n, from = new Date()) => { const d = new Date(Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10) }
  return { shot, press, vis, rect, text, val, rec, results, boxFits, cardOnTop, pick, closeCal, addDays, iso }
}

export async function adminCategory(page, re) {
  // on a phone the Admin page shows one category at a time; on a desktop the category is a tab/button
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(400)
  await page.evaluate(r => { const re = new RegExp(r); const b = [...document.querySelectorAll('#page-admin button')].find(b => b.getBoundingClientRect().width > 0 && re.test(b.textContent.trim())); if (b) b.click() }, re)
  await page.waitForTimeout(350)
}
export async function adminBack(page) {
  const back = page.locator('#page-admin .adm-back').first()
  if (await back.count() && await back.isVisible()) { await back.tap().catch(() => back.click()); await page.waitForTimeout(300) }
}
export async function step(name, fn, page) {
  console.log(`\n== ${name}`)
  try { await fn() } catch (e) { console.log(`  STEP-ERROR ${String(e).split('\n')[0].slice(0, 260)}`) }
}
