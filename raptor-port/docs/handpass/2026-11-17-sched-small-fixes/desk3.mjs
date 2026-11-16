// desk3: W5 (a question sheet / an input's own window with ALL AVAIL), OIL Earn opener, published look (eye) — desktop Chromium. v1
import { launch, go, pic, cropPic, say, rec, state, press, errors } from './wlib.mjs'
say('desk3 v1')
const { browser, page } = await launch('chromium', false, true)
await go(page, 'editsched')
async function scenario(id, fn) { try { await fn() } catch (e) { rec(id, false, 'SCRIPT ERROR ' + String(e.message).split('\n')[0]) } }
const blur = () => page.evaluate(() => { if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur() })
const esc = async () => { await page.keyboard.press('Escape'); await page.waitForTimeout(400) }
const inpWin = () => page.locator('#inpEditPop')
const inpOpen = async () => (await inpWin().count()) > 0 && await inpWin().first().isVisible()
await page.getByRole('button', { name: 'Jul 20' }).click(); await page.waitForTimeout(800)
const SAT = '#eWeek .day[data-day="5"]'
say('inpedit buttons on Sat', await page.locator(`${SAT} [data-inpedit]`).count(), 'on Wed', await page.locator('#eWeek .day[data-day="2"] [data-inpedit]').count())
const chipLoc = () => page.locator(`${SAT} .oilcount`).first()
async function openAva() { await blur(); await press(page, chipLoc(), false); await page.waitForTimeout(500) }
async function openInput() {
  const b = page.locator('#eWeek .day[data-day="3"] [data-inpedit]').first()
  await press(page, b, false); await page.waitForTimeout(700)
}
async function cleanup() { for (let i = 0; i < 4; i++) { const s = await state(page); const io = await inpOpen(); if (!s.ava && !s.chg && !io) break; await esc() } }

await scenario('W5 question sheet', async () => {
  await openAva()
  await openInput()
  const sOpen = await state(page), io = await inpOpen()
  await pic(page, 'w5-both-open')
  // make an unsaved change so the ✕ asks the question
  await inpWin().locator('button', { hasText: /^AM$/ }).first().click(); await page.waitForTimeout(250)
  await pic(page, 'w5-input-edited')
  await inpWin().locator('.airpop-head button').first().click(); await page.waitForTimeout(500)
  const q = await page.locator('[data-testid="inped-escask"]').count()
  await pic(page, 'w5-question-up')
  await blur(); await esc()
  const qAfter = await page.locator('[data-testid="inped-escask"]').count()
  const s2 = await state(page), io2 = await inpOpen()
  await pic(page, 'w5-question-after-esc')
  rec('W5 question sheet', io && sOpen.ava && q > 0 && qAfter === 0 && io2 && s2.ava, `inputWinOpen=${io} avail=${sOpen.ava}; question shown=${q > 0}; after Escape question=${qAfter} inputWin=${io2} avail=${s2.ava}`)
  await cleanup()
  // dirty window may still be up: close it by the question's lose button
  if (await inpOpen()) { await page.locator('#inpEditCancel').click().catch(() => {}); await page.waitForTimeout(400); const lose = page.locator('[data-testid="inped-escask"] button').first(); if (await lose.count()) await lose.click(); await page.waitForTimeout(300) }
  await cleanup()
})
await scenario('W5 ALL AVAIL first, then the input window in front', async () => {
  await cleanup()
  await openAva(); await openInput()
  const s0 = await state(page), io0 = await inpOpen()
  await esc()
  const s1 = await state(page), io1 = await inpOpen()
  await esc()
  const s2 = await state(page), io2 = await inpOpen()
  await pic(page, 'w5-order-input-first-then-avail-closed')
  rec('W5 input window in front of ALL AVAIL', s0.ava && io0 && !io1 && s1.ava && !s2.ava, `both up=${s0.ava && io0}; esc1 -> inputWin=${io1} avail=${s1.ava}; esc2 -> inputWin=${io2} avail=${s2.ava}`)
  await cleanup()
})
await scenario('W5 input window first, then ALL AVAIL in front', async () => {
  await cleanup()
  await openInput();
  await openAva()
  const s0 = await state(page), io0 = await inpOpen()
  await pic(page, 'w5-input-then-avail-open')
  await esc()
  const s1 = await state(page), io1 = await inpOpen()
  await esc()
  const s2 = await state(page), io2 = await inpOpen()
  rec('W5 ALL AVAIL closed by Escape, input window still up', s0.ava && io0 && !s1.ava && io1 && !io2, `both up=${s0.ava && io0}; esc1 -> avail=${s1.ava} inputWin=${io1} (should: avail closed, input up); esc2 -> inputWin=${io2}`)
  await cleanup()
})
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
