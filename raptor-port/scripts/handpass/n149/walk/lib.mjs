// The FULL walk of batch 1's second half (night of 22–23 Nov 26) — shared helpers. Every step presses the app's own
// controls; the bridge (window.*) is read for facts only, never to change data, except where a script says so.
// Run from raptor-port/ under the checks lock; each script starts and stops its own `vite preview` on 4477.
import { chromium, webkit } from '@playwright/test'
import { spawn, execSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'

export const PORT = +(process.env.MQ_PORT || 4477)   // the re-walk of 23 Nov 26 serves on its own free port
export const URL_ = `http://localhost:${PORT}/`
export const OUT = process.env.MQ_OUT || 'n149-walk-out'
mkdirSync(OUT, { recursive: true })
export const SIZES = {
  d: { engine: chromium, desk: true, opts: { viewport: { width: 1536, height: 864 } } },
  p: { engine: webkit, desk: false, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
}
export const errs = [], facts = {}, log = []
export const note = (...a) => { const s = a.join(' '); log.push(s); console.log(s) }
const browsers = {}
let server = null

export async function serve() {
  server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { shell: true, stdio: 'pipe' })
  server.stdout.on('data', () => {}); server.stderr.on('data', d => note('[server]', String(d).trim()))
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(URL_); if (r.ok) return } catch {}
    await new Promise(r => setTimeout(r, 500))
  }
  throw new Error('server did not start')
}
export async function stop() {
  for (const b of Object.values(browsers)) await b.close().catch(() => {})
  if (server) { try { execSync(`taskkill /pid ${server.pid} /T /F`, { stdio: 'ignore' }) } catch {} }
  try {
    const out = execSync(`netstat -ano | findstr :${PORT}`, { encoding: 'utf8' })
    for (const l of out.split('\n')) { const m = l.trim().match(/LISTENING\s+(\d+)/); if (m) try { execSync(`taskkill /pid ${m[1]} /T /F`, { stdio: 'ignore' }) } catch {} }
  } catch {}
}
export function save(name) {
  writeFileSync(`${OUT}/${name}.json`, JSON.stringify({ errs, facts, log }, null, 1))
}

export async function newPage(sz, ctxOpts = {}) {
  const S = SIZES[sz]
  const key = S.engine === webkit ? 'wk' : 'cr'
  if (!browsers[key]) browsers[key] = await S.engine.launch()
  const ctx = await browsers[key].newContext({ ...S.opts, ...ctxOpts })
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push(`[${sz}] PAGEERROR ${e}`))
  page.on('console', m => { if (m.type() === 'error') errs.push(`[${sz}] CONSOLE ${m.text()}`) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`[${sz}] ${r.status()} ${r.url()}`) })
  page.on('dialog', d => { note(`[${sz}] DIALOG ${d.type()}: ${d.message()}`); d.accept().catch(() => {}) })
  return { ctx, page, sz, desk: S.desk }
}
export async function signIn(s, user, pass, { pending = false } = {}) {
  const { page } = s
  await page.goto(URL_); await page.waitForSelector('#luser')
  await page.fill('#luser', user); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  if (pending) await page.waitForTimeout(1500)
  else { await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 30000 }); await page.waitForTimeout(900) }
  await page.addStyleTag({ content: '*{transition:none !important;animation:none !important}' })
}
export async function session(sz, user, pass, o) { const s = await newPage(sz); await signIn(s, user, pass, o); return s }

/* the top bar's tabs by their words, pressed as a person presses them (desktop: the bar; phone: the drawer) */
export async function tab(s, words) {
  const { page } = s
  const visible = page.locator(`nav button:visible, .tabs button:visible, [role=tab]:visible`, { hasText: words })
  if (await visible.count()) { await visible.first().click(); await page.waitForTimeout(700); return true }
  // phone: the drawer
  const menu = page.locator('#hamb:visible, .hamb:visible, button[aria-label*="enu"]:visible').first()
  if (await menu.count()) {
    await menu.click(); await page.waitForTimeout(400)
    const item = page.locator('.drawer button:visible, #drawer button:visible, .drw button:visible', { hasText: words })
    if (await item.count()) { await item.first().click(); await page.waitForTimeout(700); return true }
  }
  note(`[${s.sz}] TAB NOT FOUND: ${words}`)
  return false
}
export async function pick(s, num) {
  const { page } = s
  await page.locator('#sqnMenuBtn:visible').first().click(); await page.waitForTimeout(300)
  const row = page.locator('#sqnMenu .sqm-row', { hasText: num }).first()
  if (!(await row.count())) { note(`[${s.sz}] PICK: no row ${num}`); await page.keyboard.press('Escape'); return false }
  await row.click(); await page.waitForTimeout(800)
  return true
}
export async function menuRows(s) {
  const { page } = s
  const btn = page.locator('#sqnMenuBtn:visible')
  if (!(await btn.count())) return null
  await btn.first().click(); await page.waitForTimeout(300)
  const rows = await page.evaluate(() => [...document.querySelectorAll('#sqnMenu .sqm-row')].map(r => r.textContent.replace(/\s+/g, ' ').trim()))
  await page.keyboard.press('Escape'); await page.waitForTimeout(200)
  return rows
}
export async function shot(s, file, sels, pad = 16) {
  const { page } = s
  await page.mouse.move(1, 1).catch(() => {})
  await page.waitForTimeout(150)
  let clip
  if (sels) {
    const r = await page.evaluate(sels => {
      let L = 1e9, T = 1e9, R = -1e9, B = -1e9
      for (const sel of sels) for (const e of document.querySelectorAll(sel)) {
        const b = e.getBoundingClientRect(); if (!(b.width > 0 && b.height > 0)) continue
        L = Math.min(L, b.left); T = Math.min(T, b.top); R = Math.max(R, b.right); B = Math.max(B, b.bottom)
      }
      return L < 1e9 ? { L, T, R, B, W: innerWidth, H: innerHeight } : null
    }, sels)
    if (r) { const x = Math.max(0, r.L - pad), y = Math.max(0, r.T - pad); clip = { x, y, width: Math.max(10, Math.min(r.W, r.R + pad) - x), height: Math.max(10, Math.min(r.H, r.B + pad) - y) } }
  }
  await page.screenshot({ path: `${OUT}/${file}`, ...(clip ? { clip } : {}) })
}
export const text = (s, sel) => s.page.evaluate(sel => { const e = document.querySelector(sel); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null }, sel)
export const vis = (s, sel) => s.page.evaluate(sel => [...document.querySelectorAll(sel)].some(e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && getComputedStyle(e).visibility !== 'hidden' }), sel)
