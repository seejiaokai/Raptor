/* P2-12 (guest) — a person signed in with no access: is the Leave War reachable? */
import { chromium } from '@playwright/test'
import * as B from './cal-B-lib.mjs'
const size = process.argv[2] || 'desk'
const S = B.SIZES[size]
const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: S.w, height: S.h }, ...(S.phone ? { isMobile: true, hasTouch: true } : {}) })
const errors = []
const p = await ctx.newPage()
p.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`) })
p.on('pageerror', e => errors.push(`PAGEERROR ${e.message}`))
p.on('response', r => { if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url()}`) })
await p.goto(B.BASE + '/?fresh=1')
await p.fill('#luser', 'stranger'); await p.fill('#lpass', 'x')
await p.click('#loginForm button[type=submit]'); await B.sleep(1200)
const t1 = await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 500))
const pics = [await B.pic(p, `P2-12-${size}-guest-1-after-signin`)]
const hasLW = await p.evaluate(() => !!document.querySelector('[data-testid="row-slipway"]') || !!window.go)
console.log('after sign-in text:', t1)
/* is the app shell there? is there a Leave War tab? */
const tabs = await p.evaluate(() => [...document.querySelectorAll('.nav button, nav button, .topbar button')].map(b => b.innerText.trim()).filter(Boolean).slice(0, 20))
console.log('buttons:', tabs.join(' | '))
let reached = null
try { await p.evaluate(() => window.go && window.go('leavewar')); await B.sleep(800); reached = await p.evaluate(() => ({ page: window.CURPAGE, rows: !!document.querySelector('[data-testid="row-slipway"]') })) } catch (e) { reached = String(e).slice(0, 100) }
console.log('go(leavewar):', JSON.stringify(reached))
pics.push(await B.pic(p, `P2-12-${size}-guest-2-leavewar-attempt`))
B.row('P2-12-guest', size, 'Signed in as an unknown name ("stranger") — a person with no access / guest', `after sign-in: ${t1.slice(0, 300)} || buttons: ${tabs.join(' | ')} || go(leavewar) via the bridge: ${JSON.stringify(reached)}`, 'RAW', pics)
B.noteErrors('p212g-' + size, errors)
await ctx.close(); await browser.close()
