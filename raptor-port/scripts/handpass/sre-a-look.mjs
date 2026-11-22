// [SCHED-RIGHT-EDGE] walker A — a short look at the running page to find controls not in the recipes (22 Nov 26).
import { chromium } from 'playwright'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const here = path.dirname(fileURLToPath(import.meta.url))
console.log('sre-a-look v3')
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
const info = await page.evaluate(() => {
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden' }
  const d = e => { const r = e.getBoundingClientRect(); return `${e.tagName.toLowerCase()}#${e.id}.${String(e.className).slice(0, 60)} [${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}] "${(e.innerText || e.getAttribute('aria-label') || '').trim().slice(0, 40)}"` }
  const out = {}
  out.jump = [...document.querySelectorAll('button[aria-label="Jump to a date"]')].map(d)
  out.daywarn = [...document.querySelectorAll('#eWeek .daywarn')].filter(vis).map(d).slice(0, 7)
  out.sbday = [...document.querySelectorAll('#eWeek [data-sbday]')].filter(vis).map(d).slice(0, 3)
  out.redo = [...document.querySelectorAll('#redoBtn,#undoBtn,#histBtn')].map(d)
  out.inputs = [...document.querySelectorAll('#eWeek .day[data-day="0"] :is(input,textarea,[contenteditable=true])')].filter(vis).map(e => d(e) + ' attrs=' + [...e.attributes].map(a => a.name).join(',')).slice(0, 12)
  out.slots = [...document.querySelectorAll('#eWeek .day[data-day="0"] [data-slot]')].filter(vis).slice(0, 12).map(e => d(e) + ' slot=' + e.dataset.slot + ' val=' + (window.slotVal ? window.slotVal(e.dataset.slot) : '?'))
  out.roster = [...document.querySelectorAll('#eRoster .rpuck[data-person]')].filter(vis).slice(0, 3).map(d)
  out.rosHead = [...document.querySelectorAll('#page-editsched .eroster *')].filter(e => vis(e) && /AIRCREW/i.test(e.innerText || '') && e.children.length < 6).slice(0, 4).map(d)
  out.arrows = [...document.querySelectorAll('.week-nav')].map(d)
  out.rail = [...document.querySelectorAll('.ros-rail')].map(d)
  out.wkpad = getComputedStyle(document.getElementById('eWeek')).paddingLeft
  return out
})
writeFileSync(path.join(OUT, 'look.json'), JSON.stringify(info, null, 1)); console.log(JSON.stringify(info, null, 1))
await page.screenshot({ path: path.join(OUT, 'look-1.png') })
// open the first day's warning bar
const dw = page.locator('#eWeek .daywarn:visible').first()
if (await dw.count()) {
  await dw.click(); await page.waitForTimeout(600)
  const w = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && /issue|warn/i.test(String(e.className)) && e.children.length < 8 }).slice(0, 25).map(e => { const r = e.getBoundingClientRect(); return `${e.tagName}.${String(e.className).slice(0, 50)} [${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}] "${(e.innerText || '').trim().slice(0, 50).replace(/\s+/g, ' ')}" attrs=${[...e.attributes].map(a => a.name).join(',')}` }))
  console.log('AFTER DAYWARN', JSON.stringify(w, null, 1))
  await page.screenshot({ path: path.join(OUT, 'look-2-warn.png') })
}
await page.keyboard.press('Escape'); await page.waitForTimeout(300)
const jb = page.locator('button[aria-label="Jump to a date"]:visible').first()
if (await jb.count()) {
  await jb.click(); await page.waitForTimeout(600)
  const c = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && /cal|dc-|jump/i.test(String(e.className)) && e.children.length < 50 }).slice(0, 30).map(e => { const r = e.getBoundingClientRect(); return `${e.tagName}.${String(e.className).slice(0, 50)} [${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}] "${(e.innerText || e.getAttribute('aria-label') || '').trim().slice(0, 40).replace(/\s+/g, ' ')}" attrs=${[...e.attributes].map(a => a.name + '=' + a.value.slice(0, 20)).join(',')}` }))
  console.log('AFTER JUMP', JSON.stringify(c, null, 1))
  await page.screenshot({ path: path.join(OUT, 'look-3-jump.png') })
}
await browser.close()
