// rw3: R6 (input window + ALL AVAIL) and R5 look at the bell. desktop 1536 chromium. v1
import { rwlaunch, shot, act, blur, esc, rec, say, state, go, errors } from './rwlib.mjs'
const { browser, page } = await rwlaunch('chromium', 1536, 864, false)
await go(page, 'editsched')
await page.getByRole('button', { name: 'Jul 20' }).click(); await page.waitForTimeout(900)
async function sc(id, fn) { try { await fn() } catch (e) { rec(id, false, 'SCRIPT ERROR ' + String(e.message).split('\n')[0]) } }
const inpOpen = async () => (await page.locator('#inpEditPop').count()) > 0 && await page.locator('#inpEditPop').first().isVisible()
const cnt = page.locator('#eWeek .day[data-day="5"] [data-fill="g:5.0.+"] .oilcount').first()
async function cleanup() { for (let i = 0; i < 5; i++) { const s = await state(page); const io = await inpOpen(); if (!s.ava && !s.chg && !io) break; await blur(page); await esc(page) } }
await sc('R6 AA then input, close AA by X', async () => {
  await cleanup(); await blur(page)
  await act(page, cnt, false); await page.waitForTimeout(500)
  await act(page, page.locator('#eWeek .day[data-day="3"] [data-inpedit]').first(), false); await page.waitForTimeout(700)
  const s0 = await state(page), io0 = await inpOpen(); await shot(page, 'rw6-both-open')
  let how = 'click'
  try { await page.locator('.availwin:not([hidden]) .win-x').click({ timeout: 4000 }) } catch (e) { how = 'BLOCKED ' + String(e.message).split('\n')[0] }
  await page.waitForTimeout(500)
  const s1 = await state(page), io1 = await inpOpen(); await shot(page, 'rw6-after-x')
  await blur(page); await esc(page)
  const s2 = await state(page), io2 = await inpOpen(); await shot(page, 'rw6-after-esc')
  rec('R6 (AA first)', s0.ava && io0 && !s1.ava && io1 && !io2, `both up=${s0.ava && io0}; X (${how}) -> ava=${s1.ava} input=${io1}; Esc -> input=${io2} ava=${s2.ava}`)
  await cleanup()
})
await sc('R6 input first, then AA', async () => {
  await cleanup(); await blur(page)
  await act(page, page.locator('#eWeek .day[data-day="3"] [data-inpedit]').first(), false); await page.waitForTimeout(700)
  let how = 'click'
  try { await cnt.click({ timeout: 4000 }) } catch (e) { how = 'BLOCKED ' + String(e.message).split('\n')[0] }
  await page.waitForTimeout(500)
  const s0 = await state(page), io0 = await inpOpen(); await shot(page, 'rw6b-input-then-aa')
  if (s0.ava) {
    await page.locator('.availwin:not([hidden]) .win-x').click({ timeout: 4000 }).catch(() => {}); await page.waitForTimeout(400)
    await blur(page); await esc(page)
    const s2 = await state(page), io2 = await inpOpen(); await shot(page, 'rw6b-after-esc')
    rec('R6 (input first)', io0 && !s2.ava && !io2, `AA opened (${how}); after X + Esc input=${io2}`)
  } else say('R6 input-first: ALL AVAIL could not be opened over the input window:', how, 'inputOpen', io0)
  await cleanup()
})
// R5: look for the OIL answer list
await sc('R5 look', async () => {
  await cleanup()
  await page.locator('#notifyBell').click(); await page.waitForTimeout(600)
  await shot(page, 'rw5-bell')
  const t = await page.evaluate(() => document.body.innerText.match(/OIL[^\n]{0,80}/g))
  say('OIL text on screen with bell open:', JSON.stringify(t && t.slice(0, 10)))
  const lists = await page.evaluate(() => ({ oilBtn: !!document.querySelector('#oilAnswer, [data-oillist], .oillist, #oilList'), bellItems: [...document.querySelectorAll('.belllist *, #bellList *')].length, bar: [...document.querySelectorAll('button')].map(b => b.textContent.trim()).filter(x => /answer/i.test(x)) }))
  say('lists', JSON.stringify(lists))
  await esc(page)
})
say('errors', JSON.stringify(errors))
await browser.close()
