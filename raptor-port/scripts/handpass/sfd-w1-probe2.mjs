// w1 probe 2 — the phone's routes: board crew list, Edit Schedule crew panel, next week and back. node scripts/handpass/sfd-w1-probe2.mjs
import { chromium, webkit } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const VERSION = 'sfd-w1-probe2 v1'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '../..')
const OUT = path.join(ROOT, 'docs/img/handpass/2026-11-22-sans-from-date/w1/probe')
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const PHONE = process.env.PHONE !== '0'
const T = PHONE ? 'p' : 'd'
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
const vis = 'e=>e.getBoundingClientRect().width>0'
const who = scope => p.evaluate(s => [...document.querySelectorAll(`${s} [data-person="rocky"]`)].filter(e => e.getBoundingClientRect().width > 0).map(e => ({ cls: e.className, inner: (e.querySelector('[class*="san"]') || {}).className || '', title: e.getAttribute('title') || (e.querySelector('[title]') || {}).title || '', sec: (e.closest('.rcol,.rsans,.rall') || {}).className || 'row' })), scope)
await go('editsched')
await p.screenshot({ path: path.join(OUT, `p2-edit-${T}.png`) })
console.log('rosTab', await p.locator('#rosTab').count(), JSON.stringify(await p.evaluate(() => { const e = document.getElementById('rosTab'); return e ? e.getBoundingClientRect() : null })))
console.log('edit rocky', JSON.stringify(await who('#eWeek, .ros-body')))
console.log('sec-avail', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.sec-avail .ap-h')].map(e => e.innerText.replace(/\s+/g, ' ')).slice(0, 8))))
console.log('wkcal btns', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.filt-cal, [data-peek-day], #weekPrev, #weekNext')].map(e => e.className + '|' + (e.dataset.peekDay || '') + '|' + (e.getBoundingClientRect().width > 0)))))
const d = p.locator('#eWeek [data-sbday="5"]').first()
await d.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
if (PHONE) await d.tap(); else await d.click()
await p.waitForSelector('#schedBoard'); await sleep(900)
await p.screenshot({ path: path.join(OUT, `p2-board-${T}.png`) })
console.log('board rocky', JSON.stringify(await who('#schedBoard')))
console.log('board nav', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#schedBoard button, #schedBoard [data-sbday]')].filter(e => e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().top < 200).map(e => (e.id || e.className) + ':' + (e.dataset.sbday || '') + ':' + e.innerText.trim().slice(0, 12)))))
await b.close()
