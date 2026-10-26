/* Shared helpers of the look-and-keys walk (21 Oct 26, the Sonnet walker). Imported by lk-walk-*.mjs AFTER they set
   HP_URL / HP_SHOTS. Results are appended as lines to a JSON-lines file per part, so the report can be built from them. */
import { appendFileSync, mkdirSync, existsSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { chromium } from '@playwright/test'
import { BASE, SHOTS, login } from './lib.mjs'
import { fileURLToPath } from 'node:url'
const HERE = dirname(fileURLToPath(import.meta.url))
export const PORT = resolve(HERE, '../..')
export const OUT = resolve(PORT, 'docs/handpass/parts/lk')
mkdirSync(OUT, { recursive: true })

export function recorder(part) {
  const file = resolve(OUT, `walk-${part}.jsonl`)
  writeFileSync(file, '')
  return (id, size, pressed, measured, verdict, pics = []) => {
    const rec = { id, size, pressed, measured, verdict, pics }
    appendFileSync(file, JSON.stringify(rec) + '\n')
    console.log(`[${verdict}] ${id} @${size}: ${measured}${pics.length ? '  pics: ' + pics.join(', ') : ''}`)
  }
}

/* a temporary magenta 2px outline box around viewport rects, removed with unmark */
export async function mark(page, rects) {
  await page.evaluate((rs) => {
    for (const r of rs) {
      const d = document.createElement('div'); d.className = '__lkmark'
      d.style.cssText = `position:fixed;left:${r.x - 1}px;top:${r.y - 1}px;width:${r.w + 2}px;height:${r.h + 2}px;outline:2px solid #ff00ff;outline-offset:0;pointer-events:none;z-index:2147483647;box-sizing:border-box`
      document.body.appendChild(d)
    }
  }, rects)
}
export async function unmark(page) { await page.evaluate(() => document.querySelectorAll('.__lkmark').forEach(e => e.remove())) }

export const rectOf = (page, sel) => page.evaluate((s) => {
  const e = [...document.querySelectorAll(s)].find(x => x.offsetWidth || x.offsetHeight)
  if (!e) return null
  const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }
}, sel)

/* the window against the bar it opens over, and what is under it (copy of lk-win.mjs MEASURE, widened) */
export const WINMEASURE = (sel) => {
  const win = [...document.querySelectorAll(sel)].find(w => !w.hidden && w.offsetWidth)
  const bar = document.getElementById('burger')?.closest('.topbar')
  if (!win) return { open: false }
  const r = win.getBoundingClientRect(), q = bar.getBoundingClientRect()
  const x = r.left + r.width / 2
  const hit = document.elementFromPoint(x, q.bottom - 3)
  const label = (e) => (e.getAttribute('aria-label') || e.getAttribute('title') || (e.textContent || '').trim() || e.id || e.className || e.tagName).toString().replace(/\s+/g, ' ').slice(0, 28)
  /* every button/control of the top bar whose box lies under the window's column (horizontal overlap and vertical overlap with the window) */
  const ctl = [...bar.querySelectorAll('button, a, select, input, [role=button]')].filter(c => c.offsetWidth && c.offsetHeight).map(c => {
    const b = c.getBoundingClientRect()
    const under = b.right > r.left && b.left < r.right
    if (!under) return null
    const cx = b.left + b.width / 2, cy = b.top + b.height / 2
    const h = document.elementFromPoint(cx, cy)
    return { label: label(c), own: !!h && (c === h || c.contains(h) || h.contains(c)) && !win.contains(h), at: `${Math.round(cx)},${Math.round(cy)}` }
  }).filter(Boolean)
  return { open: true, left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top * 10) / 10, foot: Math.round(r.bottom), width: Math.round(r.width),
    barH: Math.round(q.height * 10) / 10, barBottom: Math.round(q.bottom * 10) / 10, vw: innerWidth, vh: innerHeight,
    underBarFoot: hit ? (win.contains(hit) ? 'THE WINDOW' : (hit.closest('.topbar') ? 'the top bar' : hit.tagName + '.' + hit.className)) : 'nothing',
    ctlUnder: ctl, ctlMissed: ctl.filter(c => !c.own).map(c => c.label) }
}

export const BARHEIGHT = () => { const b = document.getElementById('burger')?.closest('.topbar'); if (!b) return null; const r = b.getBoundingClientRect(); return { h: Math.round(r.height * 10) / 10, bottom: Math.round(r.bottom * 10) / 10 } }

export const consoleBlock = (errors) => errors.length ? errors.join(' | ') : 'none'

/* clock installed by lk-lib openAt; here: pick a Common Programme row key of a day */
export const progRows = (page, d) => page.evaluate((d) => [...document.querySelectorAll(`[data-fill^="a:${d}."]:not([data-fill$=".+"])`)].map(e => e.dataset.fill), d)

/* put a roster puck on a fill zone by controls. where = 'week' (Edit Schedule's week and #eRoster) or 'board' (#schedBoard and #sbRoster) */
export async function putAt(page, where, fill, pid = 'allavail') {
  const root = where === 'board' ? '#schedBoard ' : '#eWeek '
  const roster = where === 'board' ? '#sbRoster' : '#eRoster'
  for (let attempt = 0; attempt < 3; attempt++) {
    const z = page.locator(`${root}[data-fill="${fill}"]:visible`).first()
    await z.waitFor({ state: 'visible', timeout: 8000 })
    await z.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
    await page.waitForTimeout(150)
    const b = await z.boundingBox()
    await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
    await page.waitForTimeout(250)
    const armed = await page.evaluate(() => window.ARM && window.ARM.key)
    if (!armed) continue
    const p = page.locator(`${roster} .rpuck[data-person="${pid}"]:visible`).first()
    if (!(await p.count())) { await page.keyboard.press('Escape'); return 'FAILED no puck ' + pid + ' in ' + roster }
    await p.evaluate(e => e.scrollIntoView({ block: 'center' }))
    await page.waitForTimeout(100)
    try { await p.click({ timeout: 2500 }) } catch { const bb = await p.boundingBox(); if (bb) await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2) }
    await page.waitForTimeout(400)
    const key = fill.replace(/\.\+$/, '')
    const filled = await page.evaluate(([f, pid]) => { const m = /^a:(\d+)\.(\d+)/.exec(f); if (!m) return null; const r = window.DAYS[+m[1]].allhands[+m[2]]; return JSON.stringify(r && r.who) }, [fill, pid])
    return 'ok ' + filled
  }
  return 'FAILED not armed ' + fill
}

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
/* like lk-lib openAt, plus a device scale factor (2 by default: crops stay legible) */
export async function openD({ width = 1440, height = 900, who = 'a', clock = '2026-07-14T09:00:00', touch = false, dsf = 2 } = {}) {
  mkdirSync(SHOTS, { recursive: true })
  const browser = await chromium.launch({ headless: true, ...launchOptions })
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: dsf, ...(touch ? { hasTouch: true, isMobile: true } : {}) })
  if (clock) await ctx.clock.install({ time: new Date(clock) })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  await page.goto(BASE + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await login(page, who)
  return { browser, ctx, page, errors }
}
export async function snap(page, name, clip) {
  const file = `${SHOTS}/${name}.png`
  await page.screenshot({ path: file, ...(clip ? { clip } : {}) })
  return name + '.png'
}
export const clipAround = (r, pad = 40, vw = 1440, vh = 900) => { const x = Math.max(0, r.x - pad), y = Math.max(0, r.y - pad); return { x, y, width: Math.min(vw - x, r.w + 2 * pad), height: Math.min(vh - y, r.h + 2 * pad) } }
