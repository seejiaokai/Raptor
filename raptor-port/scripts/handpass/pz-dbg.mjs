/* [BOARD-PHONE-PINCH-ZOOM] debugging probe — why a sideways swipe does or does not slide the desktop layout (21 Oct 26).
   HP_URL=http://localhost:<port> node scripts/handpass/pz-dbg.mjs */
import { chromium } from '@playwright/test'
const { BASE, login, go } = await import('./lib.mjs')
const sleep = ms => new Promise(r => setTimeout(r, ms))
const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 402, height: 874 }, hasTouch: true, isMobile: true })
const page = await ctx.newPage()
await page.goto(BASE + '/'); await login(page, 'a'); await go(page, 'editsched')
await page.locator('#eWeek [data-sbday="0"]:visible').first().tap(); await sleep(500)
await page.locator('#sbMore').tap(); await page.locator('#sbMoreWide').tap(); await sleep(600)
const st = () => page.evaluate(() => document.getElementById('schedBoard').scrollLeft)
console.log(await page.evaluate(() => {
  const out = []
  for (let n = document.elementFromPoint(300, 600); n; n = n.parentElement) {
    const c = getComputedStyle(n)
    out.push(`${n.tagName}.${String(n.className || '').slice(0, 30)} ox=${c.overflowX} oy=${c.overflowY} ob=${c.overscrollBehaviorX} ta=${c.touchAction} sw=${n.scrollWidth}/${n.clientWidth}`)
  }
  return out.join('\n')
}))
for (const [x, y] of [[300, 600], [200, 40], [380, 300]]) {
  await page.mouse.move(x, y); await page.mouse.wheel(150, 0); await sleep(400)
  console.log(`wheel at ${x},${y}:`, await st())
  await page.evaluate(() => { document.getElementById('schedBoard').scrollLeft = 0 })
}
const cdp = await ctx.newCDPSession(page)
await cdp.send('Input.synthesizeScrollGesture', { x: 200, y: 40, xDistance: -200, yDistance: 0, gestureSourceType: 'touch', speed: 800 }); await sleep(500)
console.log('touch scroll on the bar:', await st())
const T = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x, y, id: i + 1 })) })
for (const y of [600, 40]) {
  await page.evaluate(() => { document.getElementById('schedBoard').scrollLeft = 0 })
  await T('touchStart', [[300, y]]); for (let i = 1; i <= 12; i++) { await T('touchMove', [[300 - 18 * i, y]]); await sleep(16) } await T('touchEnd', []); await sleep(600)
  console.log('finger swipe at y', y, ':', await st())
}
await browser.close()
