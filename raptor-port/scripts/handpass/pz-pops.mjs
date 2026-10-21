/* [BOARD-PHONE-PINCH-ZOOM] — what opens from inside the zoomed day (21 Oct 26): every menu, sheet and window a press on the
   day opens, at zoom 0.6, measured against the screen and the press that opened it, with a picture each.
   Run: HP_URL=http://localhost:<port> HP_SHOTS=<folder> node scripts/handpass/pz-pops.mjs */
import { existsSync, mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'
const { BASE, SHOTS, login, go } = await import('./lib.mjs')
mkdirSync(SHOTS, { recursive: true })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })
const page = await ctx.newPage()
await page.goto(BASE + '/'); await login(page, 'a')
await page.addStyleTag({ content: '#toastEl{visibility:hidden!important}' })
await go(page, 'editsched')
await page.locator('#eWeek [data-sbday="0"]:visible').first().tap(); await sleep(400)
await page.locator('#sbMore').tap(); await page.locator('#sbMoreWide').tap(); await sleep(500)
await page.evaluate(() => { const m = document.querySelector('#schedBoard .sb-main'); m.style.zoom = '0.6' })
await sleep(300)
const fixedNow = () => page.evaluate(() => [...document.querySelectorAll('body *')].filter(e => { const c = getComputedStyle(e); return (c.position === 'fixed' || c.position === 'absolute') && e.getClientRects().length && e.getBoundingClientRect().width > 60 && e.getBoundingClientRect().height > 30 && !e.closest('.sb-top') }).map(e => { const r = e.getBoundingClientRect(); return `${e.tagName}.${String(e.className).slice(0, 30)} [${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}] inMain=${!!e.closest('.sb-main')}` }))
const base = new Set(await fixedNow())
for (const [name, sel] of [['plus-wave', '#schedBoard [data-addwave], #schedBoard button:has-text("+ Wave")'], ['templates', '#schedBoard button:has-text("Templates")'], ['wave-pick', '#schedBoard .sb-wvsel, #schedBoard select'], ['cx', '#schedBoard .sb-line [data-cx], #schedBoard .sb-line button:has-text("CX")'], ['traffic', '#schedBoard button:has-text("Traffic")'], ['time-input', '#schedBoard .sb-arow .rmkin']]) {
  const l = page.locator(sel.split(', ').map(x => x + ':visible').join(', ')).first()
  if (!(await l.count())) { console.log(name, 'not found'); continue }
  await l.scrollIntoViewIfNeeded().catch(() => {})
  const r = await l.boundingBox()
  if (!r) { console.log(name, 'not in view'); continue }
  await l.tap({ timeout: 5000 }).catch(e => console.log(name, 'tap failed', e.message.slice(0, 80)))
  await sleep(500)
  const now = (await fixedNow()).filter(x => !base.has(x))
  console.log(`${name}: pressed at [${Math.round(r.x)},${Math.round(r.y)}] → new: ${now.join(' ; ') || 'nothing new'}`)
  await page.screenshot({ path: `${SHOTS}/pop-${name}.png` })
  await page.keyboard.press('Escape'); await sleep(200)
  await page.touchscreen.tap(200, 860).catch(() => {}); await sleep(300)
}
await browser.close()
