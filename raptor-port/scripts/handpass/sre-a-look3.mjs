// [SCHED-RIGHT-EDGE] walker A — third look: empty seats / "+ ADD" drop targets, and the arrows after an Undo.
import { chromium } from 'playwright'
import { existsSync } from 'node:fs'
console.log('sre-a-look3 v2')
const BASE = process.env.HP_URL || 'http://localhost:4391'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}), args: ['--force-device-scale-factor=1.25', '--window-size=1536,864'] })
const page = await (await browser.newContext({ viewport: null })).newPage()
await page.goto(BASE + '/?fresh=1')
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' })
await page.locator('.topbar').getByText('Edit Schedule', { exact: true }).first().click()
await page.waitForFunction(() => window.CURPAGE === 'editsched'); await page.waitForTimeout(800)
const t = await page.evaluate(() => {
  const out = {}
  out.emptyAll = [...document.querySelectorAll('#eWeek .seat.empty-slot')].slice(0, 6).map(e => { const r = e.getBoundingClientRect(); return `${e.closest('.day')?.dataset.day} ${e.dataset.slot} "${e.textContent.trim()}" ${Math.round(r.left)},${Math.round(r.top)}` })
  out.emptyCount = document.querySelectorAll('#eWeek .seat.empty-slot').length
  out.adds = [...document.querySelectorAll('#eWeek .day[data-day="0"] *')].filter(e => e.children.length === 0 && /^\+\s*add$/i.test(e.textContent.trim())).slice(0, 4).map(e => { const p = e.closest('[data-drop],[data-cp],[data-fill],[data-slot],[data-people]') || e.parentElement; const r = e.getBoundingClientRect(); return `${e.tagName}.${e.className} parent ${p.tagName}.${p.className} attrs=${[...p.attributes].map(a => a.name + '=' + a.value.slice(0, 20)).join(',')} ${Math.round(r.left)},${Math.round(r.top)}` })
  return out
})
console.log(JSON.stringify(t, null, 1))
// arrows after an Undo
const rd = () => page.evaluate(() => { const w = document.getElementById('eWeek'); const ds = [...w.querySelectorAll('.day[data-day]')].filter(d => d.getBoundingClientRect().left >= -2).sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left); return `sl ${Math.round(w.scrollLeft)} front ${ds[0]?.dataset.day}@${ds[0]?.getBoundingClientRect().left.toFixed(1)}` })
const settle = async () => { let last = -1, s = 0; for (let i = 0; i < 100 && s < 5; i++) { const v = await page.evaluate(() => document.getElementById('eWeek').scrollLeft); s = v === last ? s + 1 : 0; last = v; await page.waitForTimeout(60) } }
await page.locator('#eWeek .day[data-day="0"] [data-air]:visible').first().click(); await page.click('#airAdd'); await page.click('#airDone'); await page.waitForTimeout(400)
for (let i = 0; i < 4; i++) { await page.click('.week-nav.next'); await settle(); console.log('next', await rd()) }
await page.click('#undoBtn'); await page.waitForTimeout(300); await settle(); console.log('undo', await rd())
for (let i = 0; i < 4; i++) { await page.click('.week-nav.next'); await settle(); console.log('next after undo', await rd()) }
await browser.close()
