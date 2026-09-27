import { chromium } from '@playwright/test'
const BASE = 'http://localhost:4182'
const browser = await chromium.launch({ headless: true })
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
await page.goto(BASE + '/?fresh=1')
const signIn = async (u, p) => { await page.waitForSelector('#luser'); await page.fill('#luser', u); await page.fill('#lpass', p); await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(400) }
await signIn('hex', 'x')
await page.evaluate(() => { window.raptorRole('admin'); window.go('editsched') })
await page.waitForTimeout(500)
await page.evaluate(() => { window.fillSlot('1.0.0.0.p', 'casper'); window.afterSchedMutate() })
await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Logout/.test(x.textContent || '')); b && b.click() })
await page.waitForTimeout(500)
await signIn('ad', 'a')
await page.evaluate(() => window.go('editsched'))
await page.waitForTimeout(700)
const info = await page.$eval('#eWeek [data-slot="1.0.0.0.p"]', e => {
  const s = getComputedStyle(e, '::after'), p = getComputedStyle(e)
  const chain = []; let x = e; for (let i = 0; i < 6 && x; i++) { const c = getComputedStyle(x); chain.push(`${x.tagName}.${x.className} ov=${c.overflow} pos=${c.position}`); x = x.parentElement }
  return { html: e.outerHTML.slice(0, 300), after: { content: s.content, display: s.display, position: s.position, top: s.top, right: s.right, z: s.zIndex, vis: s.visibility, w: s.width, h: s.height }, seat: { pos: p.position, ov: p.overflow }, chain }
})
console.log(JSON.stringify(info, null, 1))
await browser.close()
