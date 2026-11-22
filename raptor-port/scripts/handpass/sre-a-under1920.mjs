// [SCHED-RIGHT-EDGE] walker A — S8 follow-up: at 1920 wide (125%) the folded CREW tab lies over part of a day's
// "Templates" button. Is the rest of that button pressable, and what does pressing it do? Pictures into a/only-under1920.
import { chromium } from 'playwright'
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
console.log('sre-a-under1920 v2')
const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(here, '../../docs/img/handpass/2026-11-22-sched-right-edge/a/only-under1920')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const BASE = process.env.HP_URL || 'http://localhost:4391'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const errs = []
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}), args: ['--force-device-scale-factor=1.25', '--window-size=1920,864'] })
const page = await (await browser.newContext({ viewport: null })).newPage()
page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
await page.goto(BASE + '/?fresh=1')
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' })
await page.locator('.topbar').getByText('Edit Schedule', { exact: true }).first().click()
await page.waitForFunction(() => window.CURPAGE === 'editsched'); await page.waitForTimeout(700)
await page.click('.ros-rail'); await page.waitForFunction(() => document.body.classList.contains('ros-collapsed')); await page.waitForTimeout(700)
await page.mouse.move(700, 500); await page.waitForTimeout(300)
const info = await page.evaluate(() => {
  const rail = document.querySelector('.ros-rail').getBoundingClientRect()
  const b = [...document.querySelectorAll('#eWeek .day .dhbtn')].find(e => { const r = e.getBoundingClientRect(); return r.right > rail.left && r.left < rail.right && r.bottom > rail.top && r.top < rail.bottom })
  if (!b) return null
  b.setAttribute('data-sre-t', '1')
  const r = b.getBoundingClientRect()
  const x = (r.left + rail.left) / 2, y = r.top + r.height / 2
  const top = document.elementFromPoint(x, y)
  const covered = document.elementFromPoint(rail.left + 4, y)
  return { day: b.closest('.day')?.dataset.day, text: b.textContent.trim(), box: [r.left, r.right, r.top, r.bottom].map(n => +n.toFixed(1)), rail: [rail.left, rail.right, rail.top, rail.bottom].map(n => +n.toFixed(1)), x, y, visibleIsIt: !!top && (top === b || b.contains(top)), coveredBy: covered ? covered.tagName + '.' + covered.className : null }
})
console.log('TEMPLATES UNDER THE TAB', JSON.stringify(info))
await page.screenshot({ path: path.join(OUT, 'u1-templates-under-tab.png'), clip: { x: 1920 - 420, y: 120, width: 420, height: 220 } })
if (info) {
  await page.mouse.click(info.x, info.y); await page.waitForTimeout(700)
  const opened = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 150 && r.height > 80 && (cs.position === 'fixed' || cs.position === 'absolute') && cs.visibility !== 'hidden' && +cs.zIndex > 10 }).slice(0, 3).map(e => { const r = e.getBoundingClientRect(); return `${e.tagName}.${String(e.className).slice(0, 40)} ${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)} "${(e.innerText || '').trim().slice(0, 40).replace(/\s+/g, ' ')}"` }))
  console.log('AFTER PRESSING ITS UNCOVERED PART', JSON.stringify(opened))
  await page.screenshot({ path: path.join(OUT, 'u2-after-press.png') })
  await page.keyboard.press('Escape')
}
console.log('errors', errs.length, errs.slice(0, 3))
await browser.close()
