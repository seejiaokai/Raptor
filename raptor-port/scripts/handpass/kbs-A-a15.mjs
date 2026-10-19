import { open, go, version, shot, tapBox, scenario } from './kbs-A-lib.mjs'
version('a15')
{
  const { browser, page, errors } = await open()
  await go(page, 'tracker'); await page.waitForTimeout(1500)
  await page.touchscreen.tap(138, 100); await page.waitForTimeout(800)
  await scenario(page, 'A15a', page.locator('#hSearch'), { what: 'Tracker search box (top, in sight: must not move)', skipLow: true })
  console.log('errors', errors); await browser.close()
}
{
  const { browser, page, errors } = await open()
  await go(page, 'tracker'); await page.waitForTimeout(1500)
  await page.touchscreen.tap(226, 195); await page.waitForTimeout(900)
  await page.touchscreen.tap(250, 578); await page.waitForTimeout(900)
  const pre = page.locator('textarea[placeholder*="AVI-02"]')
  console.log('prereq count', await pre.count())
  await scenario(page, 'A15b', pre, { what: 'Tracker event details dialog: Prerequisites box', skipLow: true, inWindow: true, keepUp: true })
  const g = await page.evaluate(() => { let e = document.querySelector('textarea[placeholder*="AVI-02"]'); const out = []; for (; e && e !== document.body; e = e.parentElement) { const cs = getComputedStyle(e); if (/fixed/.test(cs.position) || e.style.translate || (/(auto|scroll)/.test(cs.overflowY) && e.scrollHeight > e.clientHeight)) { const r = e.getBoundingClientRect(); out.push(`${String(e.className).slice(0,20)} ${Math.round(r.top)}-${Math.round(r.bottom)} tr=${e.style.translate} st=${e.scrollTop}`) } } return out })
  console.log('dialog up', JSON.stringify(g))
  await page.evaluate(() => { const v = window.__vv; v.height = innerHeight; v.dispatchEvent(new Event('resize')) }); await page.waitForTimeout(500)
  console.log('dialog down', JSON.stringify(await page.evaluate(() => { const e = document.querySelector('textarea[placeholder*="AVI-02"]'); const r = e.getBoundingClientRect(); return [Math.round(r.top), Math.round(r.bottom), e.closest('[style*=translate]') && e.closest('[style*=translate]').style.translate] })))
  console.log('errors', errors); await browser.close()
}
