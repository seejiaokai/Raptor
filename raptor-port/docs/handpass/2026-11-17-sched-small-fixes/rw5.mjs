// rw5: R2 (the ⋯ menus over windows) + R7 phone tap, phone 402x874 touch; ENGINE=webkit|chromium. v1
import { rwlaunch, shot, rec, say, state, go, errors, bringIn } from './rwlib.mjs'
const ENGINE = process.env.ENGINE || 'chromium'
const T = ENGINE === 'webkit' ? 'wk' : 'cr'
const { browser, page } = await rwlaunch(ENGINE, 402, 874, true)
async function sc(id, fn) { try { await fn() } catch (e) { rec(id, false, 'SCRIPT ERROR ' + String(e.message).split('\n')[0]) } }
const tap = async loc => { await bringIn(loc); const b = await loc.boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2) }
const menuUp = sel => page.locator(sel).count().then(n => n > 0)
const esc = async () => { await page.keyboard.press('Escape'); await page.waitForTimeout(400) }
async function clean() { for (let i = 0; i < 4; i++) { const s = await state(page); if (!s.ava && !s.chg && !s.board && !s.arm) break; await page.evaluate(() => { if (document.activeElement) document.activeElement.blur() }); await esc() } }
async function menuTest(id, tag, countSel, moreSel, menuSel) {
  if (tag !== 'board') await clean()
  await page.evaluate(() => window.scrollTo(0, 0))
  const c = page.locator(countSel).first()
  await tap(c); await page.waitForTimeout(600)
  const s0 = await state(page); await shot(page, `rw2-${T}-${tag}-1-window`)
  await page.evaluate(() => window.scrollTo(0, 0))
  const m = page.locator(moreSel).first()
  await tap(m); await page.waitForTimeout(600)
  const mu1 = await menuUp(menuSel), s1 = await state(page); await shot(page, `rw2-${T}-${tag}-2-menu`)
  await esc()
  const mu2 = await menuUp(menuSel), s2 = await state(page); await shot(page, `rw2-${T}-${tag}-3-esc1`)
  await esc()
  const mu3 = await menuUp(menuSel), s3 = await state(page); await shot(page, `rw2-${T}-${tag}-4-esc2`)
  rec(`${id} [${ENGINE}]`, s0.ava && mu1 && s1.ava && !mu2 && s2.ava && !s3.ava, `window=${s0.ava}; menu opened=${mu1} windowStill=${s1.ava}; Esc1 menu=${mu2} window=${s2.ava} board=${s2.board}; Esc2 window=${s3.ava} menu=${mu3} board=${s3.board}`)
}
await go(page, 'editsched')
await sc('R2 Edit Schedule ⋯', () => menuTest('R2 Edit Schedule', 'edit', '#eWeek .day[data-day="0"] [data-fill="g:0.0.+"] .oilcount', '#editSchedMore', '#editSchedMoreMenu'))
await go(page, 'viewsched')
await sc('R2 View-only ⋯', () => menuTest('R2 View-only Sched', 'view', '#vWeek .day[data-day="0"] .oilcount', '#viewSchedMore', '#viewSchedMoreMenu'))
await go(page, 'editsched')
await sc('R2 Board ⋯', async () => {
  await clean()
  await page.evaluate(() => window.scrollTo(0, 0))
  const open = page.locator('#eWeek .day[data-day="0"] .dt.sb-open').first()
  await tap(open); await page.waitForSelector('#schedBoard:not([hidden])'); await page.waitForTimeout(700)
  await shot(page, `rw2-${T}-board-0-open`)
  await menuTest('R2 Board', 'board', '#schedBoard .oilcount', '#sbMore', '#sbMoreMenu')
})
// R7 phone: a tap on the count opens the window and arms nothing
await go(page, 'editsched')
await sc('R7 phone tap', async () => {
  await clean()
  await page.evaluate(() => window.scrollTo(0, 0))
  const c = page.locator('#eWeek .day[data-day="0"] [data-fill="a:0.0.+"] .oilcount').first()
  await bringIn(c); const b = await c.boundingBox()
  await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2)
  await shot(page, `rw7-${T}-ph-tap-instant`)
  await page.waitForTimeout(600)
  const s = await state(page); await shot(page, `rw7-${T}-ph-tap-settled`)
  rec(`R7 phone tap [${ENGINE}]`, s.ava && !s.arm, `window=${s.ava} armed=${s.arm}`)
})
say('errors', JSON.stringify(errors))
await browser.close()
