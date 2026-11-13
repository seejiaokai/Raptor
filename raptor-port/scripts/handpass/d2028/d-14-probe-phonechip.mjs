/* d-14-probe-phonechip v1 — probe: what a tap on the ALL AVAIL count does on the phone's View-only page and Edit Schedule (WebKit). */
process.env.HP_URL ||= 'http://localhost:4174'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-11-13-rules-check-small-batch/d2028/probe-phonechip'
console.log('d-14 v1')
const F = await import('./d-lib2.mjs')
const { D, X, L, sleep, j, SAT } = F
const w = await D.world('phone')
const { page } = w
await F.buildD1(w, { logic: false })
const up = () => page.evaluate(() => !![...document.querySelectorAll('.win-bar')].find(e => e.offsetWidth))
for (const surf of ['view', 'edit']) {
  await D.toSurface(w, surf, SAT)
  const sc = D.chipScope(surf, SAT)
  const el = page.locator(sc + ' .oilcount:visible').first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
  const b = await el.boundingBox()
  console.log(surf, 'chip box', j(b), 'html', await el.evaluate(e => e.outerHTML.slice(0, 250)), 'topEl', await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.className || e.tagName) + ' | ' + e.outerHTML.slice(0, 120) : null }, [b.x + b.width / 2, b.y + b.height / 2]))
  await el.tap(); await sleep(60); await D.shot(page, `pc-${surf}-1-locatortap-at60ms`); await sleep(800)
  console.log(surf, 'after locator.tap: window up', await up(), 'ARM', await page.evaluate(() => window.ARM && window.ARM.key))
  await D.shot(page, `pc-${surf}-2-locatortap-settled`)
  if (await up()) { await D.closeAA(w) }
  if (!(await up())) {
    await page.evaluate(() => { if (window.ARM) { const d = document.querySelector('[data-disarm]'); d && d.click() } })
    await D.toSurface(w, surf, SAT); await sleep(400)
    const el2 = page.locator(sc + ' .oilcount:visible').first(); const b2 = await el2.boundingBox()
    await page.touchscreen.tap(b2.x + b2.width / 2, b2.y + b2.height / 2); await sleep(900)
    console.log(surf, 'after touchscreen.tap: window up', await up(), 'ARM', await page.evaluate(() => window.ARM && window.ARM.key))
    await D.shot(page, `pc-${surf}-3-touchscreen-settled`)
    if (await up()) await D.closeAA(w)
  }
}
await w.browser.close()
