import { open, go, version, shot, tapBox, bringLow, keysUp, keysDown, state, record, scenario } from './kbs-A-lib.mjs'
version('A1 rerun + O4 O5 O6')
const board = async (page) => { await go(page, 'editsched'); await page.evaluate(() => window.openScheduler(0)); await page.waitForSelector('#schedBoard'); await page.waitForTimeout(800) }
const scr = (page) => page.evaluate(() => { const m = document.querySelector('.sb-main'); return { sbmain: m ? m.scrollTop : null, wrap: (document.querySelector('.sb-boardwrap') || {}).scrollTop, page: document.scrollingElement.scrollTop } })
// A1 rerun (stand-in now synced) + O4
{
  const { browser, page, errors } = await open()
  await board(page)
  const box = page.locator('#schedBoard textarea.nts:visible').nth(2)
  await scenario(page, 'A1', box, { what: 'board remarks of a flying line (rerun, stand-in synced)', inWindow: true, keepUp: true })
  // O4: 3 seconds later, a resize to a keyboard of 300
  const s0 = await state(page, box); const sc0 = await scr(page)
  await page.waitForTimeout(3000)
  const s1 = await state(page, box); const sc1 = await scr(page)
  await page.evaluate(() => { const v = window.__vv; v.height = innerHeight - 300; v.dispatchEvent(new Event('resize')) }); await page.waitForTimeout(700)
  const s2 = await state(page, box); const sc2 = await scr(page)
  await shot(page, 'O4-after-late-resize')
  const same = JSON.stringify(s1.rect) === JSON.stringify(s2.rect) && JSON.stringify(sc1) === JSON.stringify(sc2)
  record({ id: 'O4', what: 'A1 box focused, keys up; 3s later keyboard height changes to 300: nothing moves', pass: same, rect: [s0.rect, s1.rect, s2.rect], scroll: [sc0, sc1, sc2], vvh: s2.vvh, summary: `O4 ${same ? 'PASS' : 'FAIL'} rect after lift ${JSON.stringify(s0.rect)} | after 3s ${JSON.stringify(s1.rect)} | after resize(300) ${JSON.stringify(s2.rect)}; scrolls ${JSON.stringify(sc1)} -> ${JSON.stringify(sc2)}; vv height ${s2.vvh}` })
  console.log('errors', errors); await browser.close()
}
// O6: pinch scale 2, keys up: nothing moves
{
  const { browser, page, errors } = await open()
  await board(page)
  const box = page.locator('#schedBoard textarea.nts:visible').nth(2)
  const low = await bringLow(box, 800)
  const a = await state(page, box); const sa = await scr(page)
  await tapBox(page, box); await page.waitForTimeout(500)
  await page.evaluate(() => { window.__vv.scale = 2 })
  await keysUp(page); await page.waitForTimeout(500)
  const b = await state(page, box); const sb = await scr(page)
  await shot(page, 'O6-pinch-keys-up')
  const same = JSON.stringify(a.rect) === JSON.stringify(b.rect) && JSON.stringify(sa) === JSON.stringify(sb)
  record({ id: 'O6', what: 'stand-in scale=2 (pinch zoom), keys up: nothing moves', pass: same, rect: [a.rect, b.rect], scroll: [sa, sb], scale: b.vvScale, summary: `O6 ${same ? 'PASS' : 'FAIL'} scale ${b.vvScale}; rect before ${JSON.stringify(a.rect)} after ${JSON.stringify(b.rect)}; scrolls ${JSON.stringify(sa)} -> ${JSON.stringify(sb)}; focused ${b.focused}` })
  console.log('errors', errors); await browser.close()
}
// O5: desktop click
{
  const { browser, page, errors } = await open({ width: 1440, height: 900, mobile: false, stub: false })
  await board(page)
  const box = page.locator('#schedBoard textarea.nts:visible').nth(2)
  const low = await bringLow(box, 820)
  const a = await state(page, box); const sa = await scr(page)
  const bb = await box.boundingBox(); await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.waitForTimeout(1200)
  const b = await state(page, box); const sb = await scr(page)
  await shot(page, 'O5-desktop-board-click')
  const same1 = JSON.stringify(a.rect) === JSON.stringify(b.rect) && JSON.stringify(sa) === JSON.stringify(sb) && b.focused
  record({ id: 'O5a', what: 'desktop 1440x900 mouse click on A1 board box: nothing scrolls', pass: same1, rect: [a.rect, b.rect], scroll: [sa, sb], summary: `O5a ${same1 ? 'PASS' : 'FAIL'} rect ${JSON.stringify(a.rect)} -> ${JSON.stringify(b.rect)}; scrolls ${JSON.stringify(sa)} -> ${JSON.stringify(sb)}; focused ${b.focused}` })
  await go(page, 'logic'); await page.evaluate(() => document.getElementById('lgEdit').click()); await page.waitForTimeout(600)
  const last = page.locator('input.lgin:visible').last()
  await bringLow(last, 820)
  const c = await state(page, last); const sc = await scr(page)
  const lb = await last.boundingBox(); await page.mouse.click(lb.x + lb.width / 2, lb.y + lb.height / 2); await page.waitForTimeout(1200)
  const d = await state(page, last); const sd = await scr(page)
  await shot(page, 'O5-desktop-logic-click')
  const same2 = JSON.stringify(c.rect) === JSON.stringify(d.rect) && JSON.stringify(sc) === JSON.stringify(sd) && d.focused
  record({ id: 'O5b', what: 'desktop mouse click on A8 Logic last box: nothing scrolls', pass: same2, rect: [c.rect, d.rect], scroll: [sc, sd], summary: `O5b ${same2 ? 'PASS' : 'FAIL'} rect ${JSON.stringify(c.rect)} -> ${JSON.stringify(d.rect)}; scrolls ${JSON.stringify(sc)} -> ${JSON.stringify(sd)}; focused ${d.focused}` })
  console.log('errors', errors); await browser.close()
}
