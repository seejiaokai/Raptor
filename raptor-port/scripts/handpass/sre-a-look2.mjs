// [SCHED-RIGHT-EDGE] walker A — second look: the warning list's lines, the calendar's close, empty seats, the board.
import { chromium } from 'playwright'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const here = path.dirname(fileURLToPath(import.meta.url))
console.log('sre-a-look2 v2')
const BASE = process.env.HP_URL || 'http://localhost:4391'
const OUT = path.resolve(here, '../../.tmp/sre-a'); mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}), args: ['--force-device-scale-factor=1.25', '--window-size=1536,864'] })
const page = await (await browser.newContext({ viewport: null })).newPage()
await page.goto(BASE + '/?fresh=1')
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' })
await page.locator('.topbar').getByText('Edit Schedule', { exact: true }).first().click()
await page.waitForFunction(() => window.CURPAGE === 'editsched'); await page.waitForTimeout(800)
const snap = () => page.evaluate(() => new Set([...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().width > 0).map(e => e)).size)
const desc = e => { const r = e.getBoundingClientRect(); return `${e.tagName}.${String(e.className).slice(0, 50)} [${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}] "${(e.innerText || e.getAttribute('aria-label') || '').trim().slice(0, 60).replace(/\s+/g, ' ')}" attrs=${[...e.attributes].map(a => a.name + '=' + a.value.slice(0, 24)).join(',')}` }
// mark all visible elements
await page.evaluate(() => { for (const e of document.querySelectorAll('body *')) e.__seen = e.getBoundingClientRect().width > 0 })
await page.locator('#eWeek .daywarn:visible').first().click(); await page.waitForTimeout(700)
const fresh = await page.evaluate((d) => { return [...document.querySelectorAll('body *')].filter(e => !e.__seen && e.getBoundingClientRect().width > 0).slice(0, 40).map(e => { const r = e.getBoundingClientRect(); return `${e.tagName}.${String(e.className).slice(0, 50)} [${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}] "${(e.innerText || '').trim().slice(0, 70).replace(/\s+/g, ' ')}" attrs=${[...e.attributes].map(a => a.name + '=' + a.value.slice(0, 24)).join(',')}` }) }, '')
console.log('NEW AFTER DAYWARN', JSON.stringify(fresh, null, 1))
await page.screenshot({ path: path.join(OUT, 'look2-warn.png') })
await page.locator('#eWeek .daywarn:visible').first().click(); await page.waitForTimeout(400)
// empty seats on Monday
const empty = await page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="0"] [data-slot]')].filter(e => e.getBoundingClientRect().width > 0 && !window.slotVal(e.dataset.slot)).slice(0, 8).map(e => { const r = e.getBoundingClientRect(); return `${e.className} slot=${e.dataset.slot} [${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}] "${e.innerText.trim().slice(0, 20)}"` }))
console.log('EMPTY SEATS MON', JSON.stringify(empty, null, 1))
// the calendar's close
await page.locator('button.wk-cal:visible').first().click(); await page.waitForTimeout(500)
const cal = await page.evaluate(() => [...document.querySelectorAll('.weekcal-box *')].filter(e => /✕|close/i.test(e.innerText || e.getAttribute('aria-label') || '') && e.children.length < 2).map(e => `${e.tagName}.${e.className} aria=${e.getAttribute('aria-label')}`))
console.log('CAL CLOSE', JSON.stringify(cal))
await page.keyboard.press('Escape'); await page.waitForTimeout(400)
console.log('cal open after Escape?', await page.locator('.weekcal-box:visible').count())
// the board
await page.locator('#eWeek .day[data-day="2"] [data-sbday="2"]').first().click(); await page.waitForTimeout(900)
const sb = await page.evaluate(() => { const b = document.querySelector('#schedBoard'); const r = b.getBoundingClientRect(); return { box: [r.left, r.top, r.width, r.height], SBDAY: window.SBDAY, done: !!document.querySelector('#sbDone') } })
console.log('BOARD', JSON.stringify(sb))
await page.screenshot({ path: path.join(OUT, 'look2-board.png') })
await page.click('#sbDone'); await page.waitForTimeout(900)
const after = await page.evaluate(() => { const w = document.getElementById('eWeek'); const wl = w.getBoundingClientRect().left; return { sl: w.scrollLeft, days: [...w.querySelectorAll('.day[data-day]')].slice(0, 4).map(d => d.dataset.day + '@' + d.getBoundingClientRect().left.toFixed(1)) } })
console.log('AFTER BOARD DONE', JSON.stringify(after))
await browser.close()
