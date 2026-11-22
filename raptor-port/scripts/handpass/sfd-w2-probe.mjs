// w2's exploration probe 2: how the week moves on Edit Schedule (SANS from its date walk, 22 Nov 26).
import { chromium } from '@playwright/test'
import { existsSync } from 'node:fs'
const VERSION = 'sfd-w2-probe v2'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
console.log(VERSION)
const sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ctx = await b.newContext({ viewport: { width: 1536, height: 864 } })
await ctx.clock.install({ time: new Date('2026-07-22T09:00:00') })
const p = await ctx.newPage()
await p.goto('http://localhost:4322/')
await p.waitForSelector('#luser'); await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a')
await p.click('#loginForm button[type=submit]')
await p.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(700)
await p.evaluate(() => window.go('editsched')); await sleep(800)
const info = () => p.evaluate(() => ({ dt: window.DAYS.map(d => d.dt).join(','), cw: window.CURWEEK, btns: ['weekNext', 'weekPrev', 'weekCal'].map(i => { const e = document.getElementById(i); return i + ':' + (e ? e.getBoundingClientRect().width + '/' + e.tagName + '/' + e.className : 'none') }), wk: [...document.querySelectorAll('[data-wk]')].slice(0, 4).map(e => e.dataset.wk + '=' + e.textContent.trim().slice(0, 20) + '/' + e.getBoundingClientRect().width) }))
console.log(JSON.stringify(await info()))
await p.locator('#weekNext').first().click().catch(e => console.log('click err', e.message.slice(0, 100)))
await sleep(900)
console.log(JSON.stringify(await info()))
await b.close()
