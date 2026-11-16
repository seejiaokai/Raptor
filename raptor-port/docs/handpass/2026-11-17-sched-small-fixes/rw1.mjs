// rw1: R1 (burger over windows, 820x864 chromium). v1
import { rwlaunch, shot, gcount, act, blur, esc, rec, say, state, go, errors } from './rwlib.mjs'
const { browser, page } = await rwlaunch('chromium', 820, 864, false)
await go(page, 'editsched')
const drawer = () => page.evaluate(() => !!document.querySelector('#drawer.open'))
const st = async () => ({ ...(await state(page)), drawer: await drawer() })
async function sc(id, fn) { try { await fn() } catch (e) { rec(id, false, 'SCRIPT ERROR ' + String(e.message).split('\n')[0]) } }
await sc('R1 ALL AVAIL', async () => {
  await blur(page)
  await act(page, page.locator(gcount(0)).first(), false); await page.waitForTimeout(500)
  const s0 = await st(); await shot(page, 'rw1-aa-open')
  await act(page, page.locator('#burger'), false); await page.waitForTimeout(500)
  const s1 = await st(); await shot(page, 'rw1-aa-menu-open')
  await esc(page); await page.waitForTimeout(300)
  const s2 = await st(); await shot(page, 'rw1-aa-after-esc1')
  await esc(page)
  const s3 = await st(); await shot(page, 'rw1-aa-after-esc2')
  rec('R1 ALL AVAIL', s0.ava && !s0.drawer && s1.drawer && s1.ava && !s2.drawer && s2.ava && !s3.ava, JSON.stringify({ s0: [s0.ava, s0.drawer], s1: [s1.ava, s1.drawer], s2: [s2.ava, s2.drawer], s3: [s3.ava, s3.drawer] }))
})
await sc('R1 changes', async () => {
  for (let i = 0; i < 3; i++) { const s = await st(); if (!s.ava && !s.chg && !s.drawer) break; await esc(page) }
  await blur(page)
  await act(page, page.locator('#histBtn'), false); await page.waitForTimeout(600)
  const s0 = await st(); await shot(page, 'rw1-chg-open')
  await act(page, page.locator('#burger'), false); await page.waitForTimeout(500)
  const s1 = await st(); await shot(page, 'rw1-chg-menu-open')
  await esc(page)
  const s2 = await st(); await shot(page, 'rw1-chg-after-esc1')
  await esc(page)
  const s3 = await st(); await shot(page, 'rw1-chg-after-esc2')
  rec('R1 changes', s0.chg && s1.drawer && s1.chg && !s2.drawer && s2.chg && !s3.chg, JSON.stringify({ s0: [s0.chg, s0.drawer], s1: [s1.chg, s1.drawer], s2: [s2.chg, s2.drawer], s3: [s3.chg, s3.drawer] }))
})
say('errors', JSON.stringify(errors))
await browser.close()
