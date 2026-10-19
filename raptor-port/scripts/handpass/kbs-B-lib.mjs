// Walker B shared driver — one tap then typing replaces (D1080). VERSION 1
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = dirname(fileURLToPath(import.meta.url))
export const ROOT = resolve(HERE, '..', '..')
export const OUT = resolve(ROOT, 'docs/img/handpass/2026-10-19-keyboard-scroll/walk/B')
mkdirSync(OUT, { recursive: true })
export const URL0 = 'http://localhost:4333/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const SIZES = { desktop: { w: 1440, h: 900, touch: false }, phone: { w: 402, h: 874, touch: true } }
export async function launch(size, who = 'ad') {
  const S = SIZES[size]
  const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
  const ctx = await browser.newContext({ viewport: { width: S.w, height: S.h }, deviceScaleFactor: S.touch ? 3 : 1, isMobile: S.touch, hasTouch: S.touch, colorScheme: 'dark' })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push('pageerror ' + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errors.push('console ' + m.text().slice(0, 200)) })
  page.on('response', r => { if (r.status() >= 400) errors.push(`http ${r.status()} ${r.url().slice(0, 120)}`) })
  await page.goto(URL0)
  const script = await page.evaluate(() => [...document.scripts].map(s => s.src).filter(Boolean).join(','))
  console.log('served script:', script)
  await page.fill('#luser', who); await page.fill('#lpass', who === 'ad' ? 'a' : who)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await page.waitForTimeout(500)
  const api = { browser, ctx, page, errors, S, size, n: 0 }
  api.shot = async name => { const f = `${size}-${name}.png`; await page.screenshot({ path: join(OUT, f) }); console.log('  picture', f); return f }
  api.go = async p => { await page.evaluate(p => window.go(p), p); await page.waitForTimeout(500) }
  // press at the centre of a box: mouse on desktop, finger on a phone
  api.pressEl = async (loc, off) => {
    const h = typeof loc === 'string' ? page.locator(loc).first() : loc
    const b = await h.boundingBox(); if (!b) throw new Error('no box for press')
    const x = b.x + (off?.x ?? b.width / 2), y = b.y + (off?.y ?? b.height / 2)
    if (S.touch) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y)
    await page.waitForTimeout(150)
  }
  api.val = async loc => (typeof loc === 'string' ? page.locator(loc).first() : loc).evaluate(e => e.value)
  api.active = () => page.evaluate(() => { const e = document.activeElement; return e ? (e.tagName + '#' + e.id + '.' + (e.className || '') + ' [' + (e.getAttribute('data-testid') || '') + ']') : null })
  api.close = async () => { await browser.close() }
  return api
}
export const log = (...a) => console.log(...a)
export const dumpInputs = page => page.evaluate(() => [...document.querySelectorAll('input,textarea,select')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }).map(e => `${e.tagName} type=${e.type} id=${e.id} cls=${e.className} ph=${e.placeholder} val=${JSON.stringify(e.value)} testid=${e.getAttribute('data-testid')||''} aria=${e.getAttribute('aria-label')||''} name=${e.name||''}`))
export const dumpBtns = page => page.evaluate(() => [...document.querySelectorAll('button,[role=button],[data-testid]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }).map(e => `${e.tagName} id=${e.id} cls=${String(e.className).slice(0,40)} testid=${e.getAttribute('data-testid')||''} txt=${(e.innerText||'').slice(0,30).replace(/\n/g,' ')}`))
