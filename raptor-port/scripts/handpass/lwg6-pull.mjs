/* The host's look at the fix of the fresh code read's F1 (chat 8, 8 Nov 26): on a phone, a pull of the Leave War day
   window by its bar must stay under the held finger while the "↓ N more" count changes. Phone Chromium (402×874, touch
   by CDP): the war, November, Mon 30 Nov (Away 19) opened; a finger on the bar moved 150px up in 10px steps and HELD;
   the window's top and its inline height read at each step and after a 400ms hold, a picture while held and after the lift.
   Run from raptor-port/ against a preview of dist, in the walk's world (19 away on Mon 30 Nov — lwg6-walk.mjs's set-up):
     HP_URL=http://localhost:4395 LWG6_STATE=<scratch>/lwg6-state.json node scripts/handpass/lwg6-pull.mjs
   Pictures: docs/img/handpass/2026-11-08-lw-group6/fix-f1-*.png; the readings printed and in fix-f1.json beside them. */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { chromium } from '@playwright/test'
process.env.HP_URL ||= 'http://localhost:4395'
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(HERE, '../../docs/img/handpass/2026-11-08-lw-group6'); mkdirSync(OUT, { recursive: true })
const { BASE, login, go } = await import('./lib.mjs')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const T = id => `[data-testid="${id}"]`
const DAY = '2026-11-30'

const b = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const ctx = await b.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, ...(process.env.LWG6_STATE ? { storageState: process.env.LWG6_STATE } : {}) })
const P = await ctx.newPage()
const errors = []
P.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
P.on('console', m => { if (m.type() === 'error') errors.push('console ' + m.text()) })
P.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
await P.goto(BASE + '/'); await login(P, 'a')
await P.addStyleTag({ content: '*{scroll-behavior:auto!important} .toast,.snack{display:none!important}' })
await go(P, 'leavewar'); await P.waitForSelector('[data-testid^="month-"]'); await sleep(900)
for (let i = 0; i < 4 && !(await P.locator(`td[data-testid$="-${DAY}"]`).count()); i++) {
  await P.evaluate(() => window.scrollTo(0, 0)); await sleep(200)
  await P.locator(T('month-NOV')).first().tap(); await sleep(1200)
}
const h = P.locator(T('head-' + DAY)).first()
await h.evaluate(e => e.scrollIntoView({ block: 'nearest', inline: 'center' })); await sleep(300)
await h.tap(); await sleep(900)
const read = () => P.evaluate(() => {
  const w = document.querySelector('[data-testid="win-lwday"]'), body = w?.querySelector('.win-body')
  const r = w?.getBoundingClientRect()
  return w && { top: Math.round(r.top), bottom: Math.round(r.bottom), styleTop: w.style.top, styleH: w.style.height, bodyH: Math.round(body.getBoundingClientRect().height),
    foot: document.querySelector('[data-testid="lwday-more"]')?.textContent ?? null }
})
const rest = await read()
if (!rest) throw new Error('the day window did not open')
const cdp = await ctx.newCDPSession(P)
const bar = await P.locator(`${T('win-lwday')} .win-bar`).first().boundingBox()
const x = bar.x + bar.width / 2; let y = bar.y + bar.height / 2
const steps = []
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
for (let moved = 0; moved < 150; moved += 10) {
  y -= 10
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] })
  await sleep(16)
  steps.push({ fingerY: Math.round(y), ...(await read()) })
}
await sleep(400)
const held = await read()
await P.screenshot({ path: `${OUT}/fix-f1-pulled-held.png` })
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
await sleep(700)
const lifted = await read()
await P.screenshot({ path: `${OUT}/fix-f1-after-lift.png` })
/* the finger's last place: the window's top must follow it (within the bar's own offset) at every step and while held */
const offset = Math.round(bar.y - rest.top)
const snapped = steps.filter(s => Math.abs(s.top - (s.fingerY - bar.height / 2 - offset)) > 6)
const out = { rest, held, lifted, offset, steps, snappedSteps: snapped.length, heldFollows: Math.abs(held.top - (Math.round(y) - bar.height / 2 - offset)) <= 6, errors }
writeFileSync(`${OUT}/fix-f1.json`, JSON.stringify(out, null, 1))
console.log(JSON.stringify({ rest, held, lifted, snappedSteps: snapped.length, heldFollows: out.heldFollows, errors }, null, 1))
await b.close()
