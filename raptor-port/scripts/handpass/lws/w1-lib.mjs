// W1 walker library — the Leave War small fixes, Item 7 (Post out sheet's date asks before a delete). VERSION 1
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
export const ROOT = resolve(HERE, '..', '..', '..')
export const SHOTS = resolve(ROOT, 'docs/img/handpass/2026-10-21-leavewar-small/w1')
mkdirSync(SHOTS, { recursive: true })
export const URL0 = process.env.HP_URL || 'http://localhost:4292/'
export const SIZES = { desktop: [1400, 900, false], phone: [390, 844, true] }

export async function openWorld(which, who = 'ad', pass = 'a') {
  const [W, H, TOUCH] = SIZES[which]
  const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
  const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: TOUCH, hasTouch: TOUCH })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push('pageerror ' + String(e).slice(0, 240)))
  page.on('console', m => { if (m.type() === 'error') errors.push('console ' + m.text().slice(0, 240)) })
  page.on('response', r => { if (r.status() >= 400) errors.push(`http ${r.status()} ${r.url().slice(0, 120)}`) })
  await page.goto(URL0)
  await page.fill('#luser', who); await page.fill('#lpass', pass); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  return { browser, ctx, page, errors, W, H, TOUCH, which }
}

export function tools(world, prefix) {
  const { page, W, H, TOUCH } = world
  const results = []
  const shot = async name => { const f = `${prefix}-${name}.png`; await page.screenshot({ path: join(SHOTS, f) }); console.log(`  picture ${f}`); return f }
  const press = async sel => { const l = page.locator(sel).first(); if (TOUCH) await l.tap(); else await l.click(); await page.waitForTimeout(280) }
  const vis = sel => page.evaluate(s => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }, sel)
  const text = async sel => (await page.locator(sel).count()) ? (await page.locator(sel).first().innerText()).trim() : null
  const val = sel => page.locator(sel).first().evaluate(e => e.getAttribute('data-value'))
  const rec = (id, size, verdict, seen, pic = '') => { results.push({ id, size, verdict, seen, pic }); console.log(`  [${id}] ${verdict} — ${seen}`) }
  const iso = d => d.toISOString().slice(0, 10)
  const addDays = n => { const d = new Date(); const u = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate() + n)); return u.toISOString().slice(0, 10) }
  const monthOf = i => ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][+i.slice(5, 7) - 1]
  const go = async p => { await page.evaluate(x => window.go(x), p); await page.waitForTimeout(700) }
  /** is the calendar's card wholly inside the viewport */
  const calOnScreen = () => page.evaluate(() => {
    const c = document.querySelector('[data-testid="dcal-card"]'); if (!c) return null
    const b = c.getBoundingClientRect()
    return { wholly: b.left >= 0 && b.top >= 0 && b.right <= innerWidth && b.bottom <= innerHeight, l: Math.round(b.left), t: Math.round(b.top), r: Math.round(b.right), b: Math.round(b.bottom), vw: innerWidth, vh: innerHeight }
  })
  /** open a date box (by its test id), walk the calendar to iso, press the day. Asserts the card is on screen first. */
  const pickDate = async (boxSel, target) => {
    await press(boxSel)
    await page.waitForSelector('[data-testid="dcal-card"]', { timeout: 3000 })
    await page.waitForTimeout(250)
    const on = await calOnScreen()
    if (!on || !on.wholly) console.log('  WARNING calendar card not wholly on screen', JSON.stringify(on))
    for (let i = 0; i < 26 && !(await page.locator(`[data-testid="dcal-day-${target}"]`).count()); i++) {
      const cur = await page.locator('[data-testid="dcal"]').first().getAttribute('data-month')
      const dir = cur && cur > target.slice(0, 7) ? 'dcal-prev' : 'dcal-next'
      await press(`[data-testid="${dir}"]`)
    }
    const n = await page.locator(`[data-testid="dcal-day-${target}"]`).count()
    if (!n) { await page.keyboard.press('Escape'); await page.waitForTimeout(250); if (await page.locator('[data-testid="dcal-card"]').count()) await page.mouse.click(3, 3); await page.waitForTimeout(250); throw new Error('calendar has no day ' + target + ' (calendar showing ' + (await page.locator('[data-testid="dcal"]').first().getAttribute('data-month')) + ')') }
    await press(`[data-testid="dcal-day-${target}"]`)
    await page.waitForTimeout(300)
    return on
  }
  const people = () => page.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([k, v]) => [k, { cs: v.cs, deleted: !!v.deleted, archived: !!v.archived }])))
  const idOf = async cs => (await page.evaluate(c => Object.entries(window.PEOPLE).find(([k, v]) => v.cs === c)?.[0], cs))
  return { shot, press, vis, text, val, rec, results, iso, addDays, monthOf, go, calOnScreen, pickDate, people, idOf }
}
