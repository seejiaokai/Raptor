/* walker B shared helpers: browser, sign-in, notes, pictures. Pictures to docs/img/handpass/2026-11-03-week-swipe/walk/B/ */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const HERE = dirname(fileURLToPath(import.meta.url))
export const OUT = resolve(HERE, '../../docs/img/handpass/2026-11-03-week-swipe/walk/B')
mkdirSync(OUT, { recursive: true })
export const PORT = '4173'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'

export async function start({ width = 1536, height = 864, touch = false } = {}) {
  const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
  const ctx = await browser.newContext({ viewport: { width, height }, ...(touch ? { hasTouch: true, isMobile: true } : {}) })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push('pageerror ' + e.message))
  page.on('console', m => { if (m.type() === 'error') errors.push('console ' + m.text()) })
  page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()) })
  page.on('requestfailed', r => errors.push('requestfailed ' + r.url()))
  return { browser, ctx, page, errors }
}

export async function signIn(page) {
  await page.goto(`http://localhost:${PORT}/`)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(500)
}

export async function editTab(page) {
  await page.evaluate(() => window.go('editsched'))
  await page.waitForSelector('#eWeek .day[data-day="0"] .dt.sb-open', { state: 'attached' })
  await page.waitForTimeout(500)
}

export function recorder() {
  const rows = []
  const note = (id, ok, detail = '', pics = '') => { rows.push({ id, ok, detail, pics }); console.log((ok ? 'PASS ' : 'FAIL ') + id + (detail ? ' — ' + detail : '')) }
  return { rows, note }
}

export const shotter = page => async (name, clip) => { await page.screenshot({ path: `${OUT}/${name}.png`, ...(clip ? { clip } : {}) }); return name + '.png' }

export const at = page => page.evaluate(() => {
  const a = document.activeElement
  if (!a) return null
  const cs = getComputedStyle(a)
  return { tag: a.tagName, id: a.id, cls: String(a.className).slice(0, 30), sbday: a.dataset.sbday ?? null, air: a.dataset.air ?? null, info: a.classList.contains('dinfobtn'), inBoard: !!a.closest('#schedBoard'), ring: a.matches(':focus-visible'), outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor }
})

export const boardOpen = page => page.locator('#schedBoard:not([hidden])').count().then(n => n > 0)

/* a clip round an element, with room, kept on the screen */
export async function around(page, sel, pad = 60, vw = 1536, vh = 864) {
  await page.locator(sel).first().scrollIntoViewIfNeeded().catch(() => {})
  const b = await page.locator(sel).first().boundingBox()
  if (!b || b.y + b.height < 0 || b.y > vh || b.x > vw || b.x + b.width < 0) return undefined
  const x = Math.max(0, b.x - pad), y = Math.max(0, b.y - pad)
  return { x, y, width: Math.max(10, Math.min(vw - x, b.width + pad * 2 + 200)), height: Math.max(10, Math.min(vh - y, b.height + pad * 2)) }
}

export function writeJson(name, obj) { writeFileSync(resolve(HERE, name), JSON.stringify(obj, null, 1)) }
