/* Walker B — shared helpers for the calendar job's check (Leave War share: P2-01..P2-12, H-04).
   A real mouse / keyboard on a desktop, a real finger over CDP on a phone. The probe bridge only to GET somewhere and to READ. */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
export const ROOT = resolve(HERE, '..', '..')
export const BASE = 'http://localhost:4212'
export const SHOTS = resolve(ROOT, 'docs/img/handpass/2026-10-08-inputs-sans-calendar-check/B')
export const OUT = resolve(ROOT, 'docs/handpass/parts/cal-B.json')
mkdirSync(SHOTS, { recursive: true }); mkdirSync(dirname(OUT), { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
export const sleep = ms => new Promise(r => setTimeout(r, ms))

export const SIZES = {
  desk: { w: 1440, h: 900, phone: false },
  phone: { w: 390, h: 844, phone: true },
  short: { w: 390, h: 568, phone: true },
  side: { w: 844, h: 390, phone: true },
  desk1536: { w: 1536, h: 864, phone: false },
}

/* ---------- results, merged into one JSON file across scripts ---------- */
let shots = []
export function row(id, size, did, saw, verdict, pics = []) {
  let all = { rows: [], shots: 0, errors: [] }
  if (existsSync(OUT)) { try { all = JSON.parse(readFileSync(OUT, 'utf8')) } catch {} }
  all.rows = all.rows.filter(r => !(r.id === id && r.size === size))
  all.rows.push({ id, size, did, saw, verdict, pics })
  writeFileSync(OUT, JSON.stringify(all, null, 1))
  console.log(`== ${verdict}  ${id} [${size}] — ${did}\n     saw: ${String(saw).slice(0, 900)}`)
}
export function noteErrors(label, errors) {
  let all = { rows: [], shots: 0, errors: [] }
  if (existsSync(OUT)) { try { all = JSON.parse(readFileSync(OUT, 'utf8')) } catch {} }
  all.errors = all.errors.filter(e => e.label !== label)
  all.errors.push({ label, errors })
  writeFileSync(OUT, JSON.stringify(all, null, 1))
  console.log(`errors [${label}]: ${errors.length}${errors.length ? '\n  ' + errors.join('\n  ').slice(0, 1500) : ''}`)
}
export async function pic(page, name, opts = {}) {
  const f = `${name}.png`
  await page.screenshot({ path: resolve(SHOTS, f), ...opts }).catch(e => console.log('shot failed', name, String(e).slice(0, 100)))
  console.log('   pic', f)
  return f
}

/* ---------- a world ---------- */
export async function world(sizeKey, { who = ['ad', 'a'], goLw = true, fresh = true } = {}) {
  const S = SIZES[sizeKey]
  const browser = await chromium.launch({ headless: true, ...launchOptions })
  const ctx = await browser.newContext({ viewport: { width: S.w, height: S.h }, deviceScaleFactor: 1, ...(S.phone ? { isMobile: true, hasTouch: true } : {}) })
  const errors = []
  const page = await ctx.newPage()
  page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`) })
  page.on('pageerror', e => errors.push(`PAGEERROR ${e.message}`))
  page.on('response', r => { if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url()}`) })
  page.on('dialog', d => { errors.push(`NATIVE DIALOG ${d.message()}`); d.dismiss().catch(() => {}) })
  await page.goto(BASE + (fresh ? '/?fresh=1' : '/'))
  await page.fill('#luser', who[0]); await page.fill('#lpass', who[1])
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await sleep(400)
  if (goLw) {
    await page.evaluate(() => window.go('leavewar'))
    await page.waitForSelector('[data-testid="row-slipway"]', { timeout: 20000 })
    await sleep(600)
  }
  const w = { browser, ctx, page, errors, S, phone: S.phone, key: sizeKey }
  return w
}
export async function close(w) { await w.ctx.close().catch(() => {}); await w.browser.close().catch(() => {}) }

/* the press that matches the device: a real tap on a phone, a real click on a desktop */
export async function press(w, loc, opts = {}) {
  if (w.phone) { await loc.scrollIntoViewIfNeeded().catch(() => {}); const b = await loc.boundingBox(); if (!b) throw new Error('no box to tap'); await touchTap(w, b.x + (opts.dx ?? b.width / 2), b.y + (opts.dy ?? b.height / 2)) }
  else await loc.click(opts.dx != null ? { position: { x: opts.dx, y: opts.dy } } : {})
  await sleep(180)
}
let cdpCache = new WeakMap()
export async function cdp(w) { if (!cdpCache.has(w.page)) cdpCache.set(w.page, await w.ctx.newCDPSession(w.page)); return cdpCache.get(w.page) }
export async function touchTap(w, x, y) {
  const c = await cdp(w)
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
  await sleep(40)
  await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}
export const mid = async l => { const b = await l.boundingBox(); if (!b) throw new Error('no box'); return { x: b.x + b.width / 2, y: b.y + b.height / 2 } }
/* a pick across cells: mouse = down, 8px, move in steps, up (optionally Shift held / a pause before moving); finger = hold, move, lift */
export async function dragPick(w, from, to, { shift = false, pause = 0, holdMs = 260 } = {}) {
  const a = await mid(from), b = await mid(to)
  if (w.phone) {
    const c = await cdp(w)
    await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [a] })
    await sleep(holdMs)
    for (let i = 1; i <= 8; i++) { await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: a.x + ((b.x - a.x) * i) / 8, y: a.y + ((b.y - a.y) * i) / 8 }] }); await sleep(25) }
    await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  } else {
    if (shift) await w.page.keyboard.down('Shift')
    await w.page.mouse.move(a.x, a.y); await w.page.mouse.down()
    if (pause) await sleep(pause)
    await w.page.mouse.move(a.x + 8, a.y); await w.page.mouse.move(b.x, b.y, { steps: 8 }); await w.page.mouse.up()
    if (shift) await w.page.keyboard.up('Shift')
  }
  await sleep(300)
}
export const cell = (w, r, iso) => w.page.locator(`[data-testid="${r}-${iso}"]`)
export const tid = (w, id) => w.page.locator(`[data-testid="${id}"]`)
export async function txt(loc) { return (await loc.count()) ? (await loc.first().innerText()).replace(/\s+/g, ' ').trim() : '(none)' }
/* what a cell shows */
export async function figs(w, r, isos) { const o = {}; for (const d of isos) o[d] = await txt(cell(w, r, d)); return o }
/* bring a Required cell comfortably into view (middle of the window horizontally) */
export async function reveal(w, iso, row = 'req-p') {
  await w.page.evaluate(([i, r]) => {
    const e = document.querySelector(`[data-testid="${r}-${i}"]`); if (!e) return
    e.scrollIntoView({ block: 'center', inline: 'center' })
  }, [iso, row])
  await sleep(300)
}
export async function undo(w) { await press(w, w.page.locator('#undoBtn')); await sleep(350) }
export async function redo(w) { await press(w, w.page.locator('#redoBtn')); await sleep(350) }

/* make an ordinary counter through the real controls: ⚙ -> + Counter -> name, crew -> Add counter */
export async function makeCounter(w, name, { seat = 'pilot', amber = null, red = null } = {}) {
  await press(w, tid(w, 'settings-open')); await sleep(300)
  await press(w, tid(w, 'counter-add')); await sleep(400)
  await tid(w, 'cform-name').fill(name)
  await press(w, tid(w, `cf-seat-${seat}`))
  if (amber !== null) await tid(w, 'cform-amber').fill(String(amber))
  if (red !== null) await tid(w, 'cform-red').fill(String(red))
  await press(w, tid(w, 'cform-save')); await sleep(500)
  /* a settings sheet may still be up */
  for (let i = 0; i < 2; i++) { if (await tid(w, 'settings-sheet').count()) { await w.page.keyboard.press('Escape'); await sleep(250) } }
}
/* the Manning block's rows top to bottom, by test id */
export const blockOrder = w => w.page.$$eval('.mx tbody.counts > tr', els => els.map(e => e.getAttribute('data-testid')))
