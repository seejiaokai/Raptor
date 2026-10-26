/* [BOARD-PHONE-PINCH-ZOOM] (D1107, D1108) — the design questions' DRAWN pictures, on the real app at his iPhone's size
   (402 × 874, touch, 3x). ONE named transform each, nothing restyled: the browser's own `zoom` applied to what would zoom.
   · board-A-<s>: the desktop layout's DAY zoomed to s, the bar left alone (the bar picture is cut from the phone
     layout's real bar: bar-phone.png, laid over by the question page — drawn in, said so there)
   · board-B-fit: the whole board zoomed to fit, its bar included (option B)
   · quals-fit / quals-mid: Quals' table zoomed, the top bar, the buttons and the Pilots / WSOs switch left alone
   Every picture asserts its transform is still on the page before it is taken.
   Run: HP_URL=http://localhost:<port> HP_SHOTS=<folder> node scripts/handpass/pz-mock.mjs */
console.log('pz-mock v1')
import { existsSync, mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'
const { BASE, SHOTS, login, go } = await import('./lib.mjs')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
mkdirSync(SHOTS, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const ctx = await browser.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true })
await ctx.clock.install({ time: new Date('2026-07-14T09:00:00') })
const page = await ctx.newPage()
await page.goto(BASE + '/')
await login(page, 'a')
const noToasts = () => page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = 'hidden' })
await go(page, 'editsched')
await page.locator('#eWeek [data-sbday="0"]:visible').first().tap()
await page.waitForSelector('#schedBoard:not([hidden])')
await page.waitForTimeout(500)
/* the phone layout's real bar, cut out */
await noToasts()
const barH = await page.evaluate(() => Math.ceil(document.querySelector('#schedBoard .sb-top').getBoundingClientRect().bottom))
await page.screenshot({ path: `${SHOTS}/bar-phone.png`, clip: { x: 0, y: 0, width: 402, height: barH } })
console.log('phone bar height', barH)
await page.locator('#sbMore').tap(); await page.locator('#sbMoreWide').tap()
await page.waitForTimeout(600)

const zoomDay = (s, bar) => page.evaluate(([s, bar]) => {
  const b = document.getElementById('schedBoard')
  for (const c of b.children) if (bar || !c.classList.contains('sb-top')) (c).style.zoom = String(s)
  b.dataset.mockzoom = String(s)
}, [s, bar])
const assertMock = async (s) => { const z = await page.evaluate(() => document.getElementById('schedBoard').dataset.mockzoom); if (z !== String(s)) throw new Error('mock transform lost') }

for (const s of [0.341, 0.6]) {
  await zoomDay(s, false)
  await page.waitForTimeout(300)
  /* the day starts under the phone bar in the drawn picture: scroll so the board's content top is at the bar's foot */
  await noToasts(); await assertMock(s)
  const top = await page.evaluate(() => Math.round(document.querySelector('#schedBoard .sb-top').getBoundingClientRect().bottom))
  await page.screenshot({ path: `${SHOTS}/board-A-${s}.png`, clip: { x: 0, y: top, width: 402, height: 874 - top } })
  console.log(`board-A-${s}: content from y ${top}`)
}
await zoomDay(0.341, true)
await page.waitForTimeout(300)
await noToasts(); await assertMock(0.341)
await page.screenshot({ path: `${SHOTS}/board-B-fit.png` })
await zoomDay(1, true)
await page.locator('#schedBoard').evaluate(b => { b.scrollLeft = 0 })

/* Quals */
await page.evaluate(() => { for (const c of document.getElementById('schedBoard').children) c.style.zoom = '' })
await page.locator('#sbDone').tap().catch(async () => { await page.evaluate(() => window.closeScheduler && window.closeScheduler()) })
await page.waitForTimeout(400)
await go(page, 'quals')
await page.waitForTimeout(600)
for (const [name, s] of [['quals-fit', 0.324], ['quals-mid', 0.6]]) {
  await page.evaluate(s => { const w = document.querySelector('#page-quals .qwrap'); w.style.zoom = String(s); w.dataset.mockzoom = String(s) }, s)
  await page.waitForTimeout(300)
  await noToasts()
  const ok = await page.evaluate(s => document.querySelector('#page-quals .qwrap').dataset.mockzoom === String(s), s)
  if (!ok) throw new Error('quals mock lost')
  await page.screenshot({ path: `${SHOTS}/${name}.png` })
}
await page.evaluate(() => { const w = document.querySelector('#page-quals .qwrap'); w.style.zoom = '' })
await noToasts()
await page.screenshot({ path: `${SHOTS}/today-quals.png` })
await browser.close()
console.log('done')
