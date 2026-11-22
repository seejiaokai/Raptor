// [SCHED-RIGHT-EDGE] walker A — fourth look: the top bar at 822 wide (125%), how a person reaches Edit Schedule there.
import { chromium } from 'playwright'
import { existsSync } from 'node:fs'
console.log('sre-a-look4 v1')
const BASE = process.env.HP_URL || 'http://localhost:4391'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
for (const w of [822, 1140]) {
  const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}), args: ['--force-device-scale-factor=1.25', `--window-size=${w},864`] })
  const page = await (await browser.newContext({ viewport: null })).newPage()
  await page.goto(BASE + '/?fresh=1')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(600)
  const t = await page.evaluate(() => ({ iw: innerWidth, items: [...document.querySelectorAll('.topbar *')].filter(e => e.children.length === 0 && /Edit Schedule|View-only|Menu|☰/.test(e.textContent + (e.getAttribute('aria-label') || '')) ).map(e => { const r = e.getBoundingClientRect(); return `${e.tagName}.${String(e.className).slice(0, 30)} "${e.textContent.trim()}" aria=${e.getAttribute('aria-label')} ${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)} vis=${getComputedStyle(e).visibility}` }), btns: [...document.querySelectorAll('.topbar button')].filter(b => b.getBoundingClientRect().width > 0).map(b => `"${b.textContent.trim().slice(0, 14)}" aria=${b.getAttribute('aria-label')} ${Math.round(b.getBoundingClientRect().left)}`) }))
  console.log(w, JSON.stringify(t, null, 1))
  await page.screenshot({ path: `.tmp/sre-a/look4-${w}.png` })
  await browser.close()
}
