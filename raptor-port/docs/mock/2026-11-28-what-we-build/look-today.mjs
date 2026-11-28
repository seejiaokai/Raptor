// Chat 196, 28 Nov 26 — a look at today's app before drawing "what we would build": the Scheduler Board's Personal
// Inputs panel and Ground Programme on the demo Monday (D2883's "To review"), and the Leave War's period list (D2890).
// Reads only; nothing under raptor-port/src changes. Run from the main folder's raptor-port/ (for playwright):
//   node <this file> --size d|p [--url http://127.0.0.1:4181/]
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d }
const SIZE = arg('size', 'd'), URL = arg('url', 'http://127.0.0.1:4181/'), PHONE = SIZE === 'p'
const HERE = path.dirname(fileURLToPath(import.meta.url)), IMG = path.join(HERE, 'img', 'look')
mkdirSync(IMG, { recursive: true })
const PW = createRequire(process.cwd() + '/package.json')('playwright')
const sleep = ms => new Promise(r => setTimeout(r, ms))
const browser = await PW.chromium.launch()
const ctx = await browser.newContext(PHONE ? { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1 })
const p = await ctx.newPage(); p.setDefaultTimeout(15000)
p.on('pageerror', e => console.log('PAGEERROR', e.message))
await p.goto(URL); await p.waitForSelector('#luser')
await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
await p.waitForSelector('#vWeek .day'); await sleep(800)
await p.evaluate(() => window.go('editsched')); await sleep(1500)
const di = 0
await p.evaluate(d => document.querySelector(`#eWeek .day[data-day="${d}"] [data-sbday="${d}"]`)?.click(), di); await sleep(1500)
const head = p.locator('#sbBoard .sb-panel.pinp [data-pitog]').first()
console.log('folded heading:', (await head.textContent())?.replace(/\s+/g, ' '))
await head.click(); await sleep(600)
const rows = await p.evaluate(() => [...document.querySelectorAll('#sbBoard .sb-panel.pinp .inprow')].map(r => r.textContent.replace(/\s+/g, ' ').trim().slice(0, 120)))
console.log('Personal Inputs rows:', rows)
const ground = await p.evaluate(() => {
  const ps = [...document.querySelectorAll('#sbBoard .sb-panel')].map(x => ({ cls: x.className, head: x.querySelector('.sb-ph')?.textContent.replace(/\s+/g, ' ').trim().slice(0, 60), rows: x.querySelectorAll('.inprow').length, btns: [...x.querySelectorAll('.lctl button, .lctl [data-acc], .lctl span')].map(b => b.textContent.trim()).filter(Boolean).slice(0, 8) }))
  return ps
})
console.log(JSON.stringify(ground, null, 1))
const pi = p.locator('#sbBoard .sb-panel.pinp').first()
await pi.scrollIntoViewIfNeeded(); await sleep(300)
await pi.screenshot({ path: path.join(IMG, `pinp-${PHONE ? 'phone' : 'desktop'}.png`) })
const gp = await p.evaluate(() => { const x = [...document.querySelectorAll('#sbBoard .sb-panel')].find(e => /Ground/i.test(e.querySelector('.sb-ph')?.textContent || '')); if (x) x.id = 'lookGP'; return !!x })
if (gp) { await p.locator('#lookGP').scrollIntoViewIfNeeded(); await p.locator('#lookGP').screenshot({ path: path.join(IMG, `ground-${PHONE ? 'phone' : 'desktop'}.png`) }) }
const un = await p.evaluate(() => { const x = [...document.querySelectorAll('#sbBoard .sb-panel')].find(e => /^Unavailable/i.test(e.querySelector('.sb-ph')?.textContent.trim() || '')); if (x) x.id = 'lookUN'; return !!x })
if (un) { await p.locator('#lookUN').scrollIntoViewIfNeeded(); await p.locator('#lookUN').screenshot({ path: path.join(IMG, `unavail-${PHONE ? 'phone' : 'desktop'}.png`) }) }
/* the Leave War's period list */
await p.locator('#sbDone:visible, #sbClose:visible').first().click().catch(() => {}); await sleep(600)
await p.evaluate(() => window.go('leavewar')); await sleep(3000)
const opts = await p.evaluate(() => { const s = document.querySelector('[data-testid="war-picker"]'); if (!s) return null; const r = s.getBoundingClientRect(); return { box: [r.x, r.y, r.width, r.height], opts: [...s.options].map(o => o.textContent), value: s.value } })
console.log('period list:', JSON.stringify(opts))
await p.screenshot({ path: path.join(IMG, `war-top-${PHONE ? 'phone' : 'desktop'}.png`), clip: { x: 0, y: 0, width: PHONE ? 402 : 1536, height: PHONE ? 260 : 200 } })
await browser.close()
