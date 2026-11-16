// desk4: the eye look (Original), OIL Earn opener, and the plain-user round — desktop Chromium. v1
import { launch, go, pic, cropPic, say, rec, state, press, errors } from './wlib.mjs'
say('desk4 v1')
const { browser, page } = await launch('chromium', false, true)
await go(page, 'editsched')
async function scenario(id, fn) { try { await fn() } catch (e) { rec(id, false, 'SCRIPT ERROR ' + String(e.message).split('\n')[0]) } }
const blur = () => page.evaluate(() => { if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur() })
const esc = async () => { await page.keyboard.press('Escape'); await page.waitForTimeout(400) }
const D0 = '#eWeek .day[data-day="0"]'
// publish Monday through the real sign-offs
for (let i = 0; i < 4; i++) { const sel = page.locator(`${D0} select[data-sign]`).nth(i); await sel.scrollIntoViewIfNeeded(); await sel.selectOption({ index: 1 }); await page.waitForTimeout(250) }
await press(page, page.locator(`${D0} .dbeak`).first(), false); await page.waitForTimeout(900)

await scenario('W1 the look at a published version (Original)', async () => {
  await press(page, page.locator(`${D0} .planselbtn`).first(), false); await page.waitForTimeout(500)
  await page.locator('text=read-only — look, don\'t change').first().click(); await page.waitForTimeout(900)
  await pic(page, 'w1-eye-look-on')
  const chip = page.locator('#eWeek .pv-frozen .oilcount, #eWeek .day[data-day="0"] .oilcount').first()
  const n = await page.locator('#eWeek .pv-frozen .oilcount').count()
  await blur(); await press(page, chip, false); await page.waitForTimeout(500)
  const s1 = await state(page)
  await pic(page, 'w1-eye-look-open')
  await blur(); await esc()
  const s2 = await state(page)
  const keysBack = await page.evaluate(() => { const a = document.activeElement; return !!(a && a.classList.contains('oilcount')) })
  rec('W1 the look at a published version (Original)', s1.ava && !s2.ava && keysBack, `frozen-face counts=${n}; open=${s1.ava}; afterEsc open=${s2.ava}; keysOnCount=${keysBack} (${s2.active})`)
})
// back to the live copy
await scenario('back to live', async () => {
  await press(page, page.locator(`${D0} .planselbtn`).first(), false); await page.waitForTimeout(400)
  await page.locator('text=live now').first().click(); await page.waitForTimeout(700)
})
// OIL Earn on the board — Saturday of the Jul 20 week
await scenario('W1 OIL Earn on the board', async () => {
  await page.getByRole('button', { name: 'Jul 20' }).first().click(); await page.waitForTimeout(900)
  await press(page, page.locator('#eWeek .day[data-day="5"] .dt.sb-open'), false)
  await page.waitForSelector('#schedBoard:not([hidden])'); await page.waitForTimeout(600)
  const oil = page.locator('#sbOil')
  const has = await oil.count()
  if (!has) { rec('W1 OIL Earn on the board', false, 'NOT WALKED: no OIL Earn button on the board for Saturday Jul 25'); return }
  await press(page, oil, false); await page.waitForTimeout(600)
  await pic(page, 'w1-oilearn-on')
  const chip = page.locator('#schedBoard .oilcount').first()
  const nChips = await page.locator('#schedBoard .oilcount').count()
  await blur(); await press(page, chip, false); await page.waitForTimeout(600)
  const s1 = await state(page)
  const tab = await page.evaluate(() => { const t = document.querySelector('.availwin:not([hidden]) .win-tab.on, .availwin:not([hidden]) [aria-selected="true"]'); return t ? t.innerText : '?' })
  await pic(page, 'w1-oilearn-open')
  await blur(); await esc()
  const s2 = await state(page)
  await pic(page, 'w1-oilearn-after-esc')
  rec('W1 OIL Earn on the board', s1.ava && !s2.ava && s2.board, `chips=${nChips}; opened=${s1.ava} on tab "${tab}"; afterEsc open=${s2.ava} boardStays=${s2.board}`)
  // leave OIL mode and the board
  await press(page, page.locator('#sbOil'), false); await page.waitForTimeout(300)
  await press(page, page.locator('#sbDone'), false); await page.waitForTimeout(500)
})
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
