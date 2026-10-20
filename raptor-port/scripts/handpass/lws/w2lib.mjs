// W2 walker helpers — the Leave War small fixes, 21 Oct 26. VERSION 1
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
export const ROOT = resolve(HERE, '..', '..', '..')
export const SHOTS = resolve(ROOT, 'docs/img/handpass/2026-10-21-leavewar-small/w2')
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
  page.on('pageerror', e => errors.push('pageerror ' + String(e).slice(0, 220)))
  page.on('console', m => { if (m.type() === 'error') errors.push('console ' + m.text().slice(0, 220)) })
  page.on('response', r => { if (r.status() >= 400) errors.push(`http ${r.status()} ${r.url().slice(0, 120)}`) })
  await page.goto(URL0 + '?fresh=1')
  await page.fill('#luser', who); await page.fill('#lpass', pass); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  return { browser, ctx, page, errors, W, H, TOUCH, which }
}

export function tools(world, prefix) {
  const { page, TOUCH, which } = world
  const results = []
  const shot = async name => { const f = `${prefix}-${which}-${name}.png`; await page.screenshot({ path: join(SHOTS, f) }); console.log(`  picture ${f}`); return f }
  // a picture with a row in the middle of the screen (or, when it is not drawn, the neighbour named second)
  const shotRow = async (name, ...sels) => {
    await page.waitForTimeout(2600)
    for (const sel of sels) { const l = page.locator(sel).first(); if (await l.count()) { await l.evaluate(e => { const r = e.getBoundingClientRect(); window.scrollBy(0, r.top - window.innerHeight * 0.4) }); break } }
    await page.waitForTimeout(400)
    return shot(name)
  }
  const press = async sel => { const l = page.locator(sel).first(); if (TOUCH) await l.tap(); else await l.click(); await page.waitForTimeout(260) }
  const vis = sel => page.evaluate(s => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }, sel)
  const rec = (id, size, verdict, seen, pic = '') => { results.push({ id, size, verdict, seen, pic }); console.log(`  [${id}] ${size} ${verdict} — ${seen}`) }
  const addDays = n => { const d = new Date(); const u = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate() + n)); return u.toISOString().slice(0, 10) }
  const pick = async iso => {
    for (let i = 0; i < 6 && !(await page.locator(`[data-testid="dcal-day-${iso}"]`).count()); i++) await press('[data-testid="dcal-next"]')
    await press(`[data-testid="dcal-day-${iso}"]`)
  }
  const lw = async (month) => {
    await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(900)
    if (month) { await press(`[data-testid="month-${month}"]`); await page.waitForTimeout(900) }
  }
  const adminUsers = async () => {
    await page.evaluate(() => window.go('admin')); await page.waitForTimeout(400)
    await page.evaluate(() => { const b = [...document.querySelectorAll('#page-admin button')].find(b => b.getBoundingClientRect().width > 0 && /^Users/.test(b.textContent.trim())); if (b) b.click() })
    await page.waitForTimeout(350)
  }
  // the men drawn: [{id, cs, group}] in order
  const rowsDrawn = () => page.evaluate(() => {
    const out = []; let grp = ''
    for (const tr of document.querySelectorAll('.mx tbody tr')) {
      const t = tr.getAttribute('data-testid') || ''
      if (t.startsWith('group-')) { grp = (tr.innerText || '').replace(/\s+/g, ' ').trim(); continue }
      if (t.startsWith('row-')) out.push({ id: t.slice(4), cs: (tr.querySelector('span.cs')?.textContent || '').trim(), group: grp })
    }
    return out
  })
  const groupHeads = () => page.evaluate(() => [...document.querySelectorAll('[data-testid^="group-"]')].map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()))
  const personId = cs => page.evaluate(c => Object.entries(window.PEOPLE).find(([k, v]) => v.cs === c)?.[0], cs)
  return { shot, shotRow, press, vis, rec, results, addDays, pick, lw, adminUsers, rowsDrawn, groupHeads, personId }
}
