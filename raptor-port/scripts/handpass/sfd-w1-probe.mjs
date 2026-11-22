// w1 probe — learn the world before the walk (SANS from its date, 22 Nov 26). Run from raptor-port/: node scripts/handpass/sfd-w1-probe.mjs
import { chromium, webkit } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const VERSION = 'sfd-w1-probe v1'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '../..')
const OUT = path.join(ROOT, 'docs/img/handpass/2026-11-22-sans-from-date/w1/probe')
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const PHONE = process.env.PHONE === '1'
console.log(VERSION, PHONE ? 'phone' : 'desktop')
const sleep = ms => new Promise(r => setTimeout(r, ms))
const eng = PHONE ? webkit : chromium
const b = await eng.launch(!PHONE && existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ctx = await b.newContext(PHONE ? { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 } : { viewport: { width: 1536, height: 864 } })
await ctx.clock.install({ time: new Date('2026-07-22T09:00:00') })
const p = await ctx.newPage()
p.on('pageerror', e => console.log('PAGEERROR', e.message))
await p.goto('http://localhost:4321/')
await p.waitForSelector('#luser'); await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a')
await p.click('#loginForm button[type=submit]')
await p.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(800)
const go = async t => { await p.evaluate(t => window.go(t), t); await p.waitForFunction(t => window.CURPAGE === t, t); await sleep(600) }
console.log(JSON.stringify(await p.evaluate(() => ({
  today: new Date().toISOString(), days: (window.DAYS || []).map(d => d.dt || d.date),
  rocky: (({ cs, seat, san, sanFrom }) => ({ cs, seat, san, sanFrom }))(window.PEOPLE.rocky),
  nick: (({ cs, seat, san, sanFrom }) => ({ cs, seat, san, sanFrom }))(window.PEOPLE.nick),
  keys: Object.keys(window).filter(k => /^(go|CURWEEK|loadWeek|weekGo|setWeek|DAYS|PEOPLE|CURPAGE|lw|raptor)/.test(k)),
}))))
await go('editsched')
console.log('wk buttons', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('[data-wk]')].map(e => ({ v: e.dataset.wk, t: e.innerText, vis: e.getBoundingClientRect().width > 0, on: e.className })))))
console.log('peek', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#eWeek .day.peek, #eWeek [data-peek-day]')].map(e => ({ cls: e.className, pd: e.dataset.peekDay, txt: e.innerText.slice(0, 80) })))))
await p.screenshot({ path: path.join(OUT, `editsched-${PHONE ? 'p' : 'd'}.png`) })
const d = p.locator('#eWeek [data-sbday="5"]').first()
await d.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
await d.click(); await p.waitForSelector('#schedBoard'); await sleep(800)
console.log('board heads', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#schedBoard .rh2')].filter(e => e.getBoundingClientRect().width > 0).map(h => h.innerText.replace(/\s+/g, ' ')))))
console.log('board bar', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#schedBoard button')].filter(e => e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().top < 150).map(e => (e.id || '') + ':' + e.innerText.trim().slice(0, 20)))))
await p.screenshot({ path: path.join(OUT, `board-sat-${PHONE ? 'p' : 'd'}.png`) })
const nx = p.locator('#sbNextDay:visible').first()
if (await nx.count()) { await nx.click(); await sleep(800); console.log('after next: sbday', await p.evaluate(() => window.SBDAY), JSON.stringify(await p.evaluate(() => (window.DAYS || []).map(d => d.dt)))) ; await nx.click(); await sleep(800); console.log('after next2: sbday', await p.evaluate(() => window.SBDAY), JSON.stringify(await p.evaluate(() => (window.DAYS || []).map(d => d.dt)))); await p.screenshot({ path: path.join(OUT, `board-next2-${PHONE ? 'p' : 'd'}.png`) }) }
await b.close()
