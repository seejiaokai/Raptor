/* Walker B shared helpers (rally box, 19 Oct 26). Phone 402x874 dsf3, finger taps. */
import { existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const HERE = dirname(fileURLToPath(import.meta.url))
export const ROOT = resolve(HERE, '..', '..', '..', '..')
export const BASE = process.env.HP_URL || 'http://localhost:4298'
export const OUT = resolve(ROOT, 'docs/img/handpass/2026-10-19-rally-build/B')
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const LAUNCH = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const errors = []
export const results = []
export const rec = (id, what, expected, seen, verdict, pic) => {
  results.push({ id, what, expected, seen, verdict, pic })
  console.log(`${verdict} [${id}] ${what} | exp: ${expected} | seen: ${typeof seen === 'string' ? seen : JSON.stringify(seen)}${pic ? ' | ' + pic : ''}`)
}
export const launch = () => chromium.launch(LAUNCH)

export async function open(browser, who = 'ad', pass = 'a', size = { width: 402, height: 874, phone: true }) {
  const ctx = await browser.newContext({ viewport: { width: size.width, height: size.height }, deviceScaleFactor: size.phone ? 3 : 1, ...(size.phone ? { isMobile: true, hasTouch: true } : {}) })
  const p = await ctx.newPage()
  p.on('console', m => { if (m.type() === 'error') errors.push(`${m.text()}`) })
  p.on('pageerror', e => errors.push(`PAGEERROR ${e.message}`))
  await p.goto(BASE + '/')
  await p.waitForSelector('#luser', { state: 'visible', timeout: 10000 })
  await p.fill('#luser', who); await p.fill('#lpass', pass); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await p.addStyleTag({ content: '*{scroll-behavior:auto !important} *{caret-color:transparent !important}' })
  return { ctx, p }
}
/* scroll into the middle of the viewport, check the centre is inside, then finger tap (touchscreen.tap rests itself) */
export async function tap(p, loc, opts = {}) {
  await loc.evaluate((e, blk) => e.scrollIntoView({ block: blk, inline: 'center' }), opts.block || 'center')
  await sleep(200)
  const b = await loc.boundingBox()
  const vp = p.viewportSize()
  const cx = b.x + b.width / 2, cy = b.y + b.height / 2
  if (cx < 0 || cy < 0 || cx > vp.width || cy > vp.height) throw new Error(`tap target outside viewport: ${cx},${cy}`)
  await p.touchscreen.tap(cx, cy)
  await sleep(opts.wait ?? 250)
}
export const shot = async (p, name) => { await p.screenshot({ path: `${OUT}/${name}.png` }); return `docs/img/handpass/2026-10-19-rally-build/B/${name}.png` }
export const elShot = async (p, sel, name) => { const el = p.locator(sel).first(); await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(250); await el.screenshot({ path: `${OUT}/${name}.png` }); return `docs/img/handpass/2026-10-19-rally-build/B/${name}.png` }
export const model = (p, di, gi, li) => p.evaluate(([d, g, l]) => { const f = window.DAYS[d].waves[g].formations[l]; return { cs: f.cs, to: f.to, ld: f.ld, br: f.br, rl: f.rl } }, [di, gi, li])
export const PIC = process.env.HP_SHOTS || 'docs/img/handpass/2026-10-19-rally-build/B/'   // the re-walk writes to its own folder (walk-scripts.md §6)
export const bfld = (p, f) => p.locator(`#sbBoard [data-bfld="${f}"]`).first()
export const wk = (p, di, f) => p.locator(`#eWeek .day[data-day="${di}"] [data-txt="${f}"]`)
export const inState = el => el.evaluate(e => ({ value: e.value, ss: e.selectionStart, se: e.selectionEnd, active: document.activeElement === e, ph: e.placeholder }))
export const ceState = el => el.evaluate(e => ({ text: e.textContent, sel: String(window.getSelection()), active: document.activeElement === e, ph: e.dataset.ph, cls: e.className }))
export async function swipeUp(p, x = 200, y0 = 600, dy = 250) {
  const c = await p.context().newCDPSession(p)
  const pt = yy => [{ x, y: yy, id: 1 }]
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(y0) })
  const n = 6
  for (let i = 1; i <= n; i++) { await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(y0 - dy * i / n) }); await sleep(25) }
  await sleep(120)
  await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await sleep(600)
  await c.detach()
}
export const finish = async (name) => { const { writeFileSync } = await import('node:fs'); writeFileSync(`${OUT}/_${name}-results.json`, JSON.stringify({ results, errors }, null, 1)); console.log('errors:', errors.length ? errors.join(' || ') : 'none') }
export async function tapFixed(p, loc, wait = 300) { const b = await loc.boundingBox(); if (!b) throw new Error('no box'); await p.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await sleep(wait) }
