// phone2: W2 on the phone (402x874 touch): the changes window, Hide / slim bar, Escape, tap outside. ENGINE=webkit|chromium. v1
import { launch, go, pic, say, rec, state, errors, bringIn } from './wlib.mjs'
const ENGINE = process.env.ENGINE || 'chromium'
const T = ENGINE === 'webkit' ? 'wk' : 'cr'
say('phone2 v1', ENGINE)
const { browser, page } = await launch(ENGINE, true, true)
async function scenario(id, fn) { try { await fn() } catch (e) { rec(id, false, 'SCRIPT ERROR ' + String(e.message).split('\n')[0]) } }
const tap = async loc => { const b = await loc.boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2) }
const histOn = () => page.evaluate(() => document.querySelector('#histBtn').classList.contains('on'))
await go(page, 'editsched')
await page.evaluate(() => window.scrollTo(0, 0))
async function closeAll() { for (let i = 0; i < 3; i++) { if (!(await state(page)).chg) break; await page.keyboard.press('Escape'); await page.waitForTimeout(300) } }
await scenario(`W2 ${ENGINE} phone Escape`, async () => {
  await tap(page.locator('#histBtn')); await page.waitForTimeout(600)
  const s1 = await state(page); await pic(page, `w2-${T}-ph-open`)
  await page.evaluate(() => { if (document.activeElement) document.activeElement.blur() })
  await page.keyboard.press('Escape'); await page.waitForTimeout(400)
  const s2 = await state(page); await pic(page, `w2-${T}-ph-after-esc`)
  rec(`W2 ${ENGINE} phone Escape`, s1.chg && !s2.chg && !(await histOn()), `open=${s1.chg} afterEsc open=${s2.chg} histOn=${await histOn()}`)
})
await scenario(`W2 ${ENGINE} phone Hide then slim bar then Escape`, async () => {
  await closeAll()
  await tap(page.locator('#histBtn')); await page.waitForTimeout(600)
  await tap(page.locator('.chgwin:not([hidden]) .win-hide')); await page.waitForTimeout(600)
  const s1 = await state(page); await pic(page, `w2-${T}-ph-slim`)
  const slim = await page.evaluate(() => { const w = document.querySelector('.chgwin:not([hidden])'); if (!w) return 'gone'; const r = w.getBoundingClientRect(); return Math.round(r.height) + 'px tall at y=' + Math.round(r.y) })
  const hOn1 = await histOn()
  await page.evaluate(() => { if (document.activeElement) document.activeElement.blur() })
  await page.keyboard.press('Escape'); await page.waitForTimeout(400)
  const s2 = await state(page); await pic(page, `w2-${T}-ph-slim-after-esc`)
  rec(`W2 ${ENGINE} phone Hide then slim bar then Escape`, s1.chg && !s2.chg && hOn1 && !(await histOn()), `slim bar window=${slim} stillOpen=${s1.chg} histOn=${hOn1}; afterEsc open=${s2.chg} histOn=${await histOn()}`)
})
await scenario(`W2 ${ENGINE} phone Hide then Show then X`, async () => {
  await closeAll()
  await tap(page.locator('#histBtn')); await page.waitForTimeout(600)
  await tap(page.locator('.chgwin:not([hidden]) .win-hide')); await page.waitForTimeout(500)
  await tap(page.locator('.chgwin:not([hidden]) .win-hide, .chgwin:not([hidden]) button').first()); await page.waitForTimeout(500)
  await pic(page, `w2-${T}-ph-show-again`)
  const full = await page.evaluate(() => { const w = document.querySelector('.chgwin:not([hidden])'); return w ? Math.round(w.getBoundingClientRect().height) : 0 })
  await tap(page.locator('.chgwin:not([hidden]) .win-x')); await page.waitForTimeout(500)
  const s = await state(page)
  rec(`W2 ${ENGINE} phone Hide then Show then X`, full > 300 && !s.chg && !(await histOn()), `height after Show=${full}; after X open=${s.chg} histOn=${await histOn()}`)
})
await scenario(`W2 ${ENGINE} phone tap outside`, async () => {
  await closeAll()
  await tap(page.locator('#histBtn')); await page.waitForTimeout(600)
  const s1 = await state(page)
  await page.touchscreen.tap(200, 140); await page.waitForTimeout(500)   // the toolbar row above the window
  const s2 = await state(page); await pic(page, `w2-${T}-ph-tap-outside`)
  rec(`W2 ${ENGINE} phone tap outside (as shipped: the changes window closes, D167/D338)`, s1.chg && !s2.chg, `open=${s1.chg}; after a tap outside open=${s2.chg} histOn=${await histOn()}`)
})
await scenario(`W2 ${ENGINE} phone day count`, async () => {
  await closeAll()
  await page.evaluate(() => window.scrollTo(0, 0))
  const c = page.locator('#eWeek .day[data-day="0"] .dchg').first()
  await bringIn(c); await tap(c); await page.waitForTimeout(600)
  const s1 = await state(page); await pic(page, `w2-${T}-ph-daycount`)
  await page.evaluate(() => { if (document.activeElement) document.activeElement.blur() })
  await page.keyboard.press('Escape'); await page.waitForTimeout(400)
  const s2 = await state(page)
  rec(`W2 ${ENGINE} phone day count`, s1.chg && !s2.chg, `open=${s1.chg} afterEsc open=${s2.chg}`)
})
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
