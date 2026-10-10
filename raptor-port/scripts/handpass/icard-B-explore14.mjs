import * as L from './icard-B-lib.mjs'
const browser = await L.launch()
for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  const touch = vp.width < 500
  const { ctx, page: p } = await L.open(browser, vp, 'ad', 'a', touch)
  const sab = await L.csId(p, 'Saber')
  await L.fileInput(p, touch, { iso: '2026-07-20', type: 'ATT C', who: sab, doc: L.DOC })
  const m0 = await L.rec(p, { type: 'ATT C', person: sab }); await L.openFromList(p, touch, m0.iid); await L.attachDoc(p, L.DOC2); await L.saveWin(p, touch); await L.closeAll(p)
  const m = await L.rec(p, { type: 'ATT C', person: sab })
  await L.openFromList(p, touch, m.iid)
  await L.press(touch, p.locator(`${L.WIN} [data-testid="inped-docview"]`)); await p.locator('#docViewPop:not([hidden])').waitFor()
  await p.waitForTimeout(400)
  const g = await p.evaluate(() => {
    const box = document.querySelector('#docViewPop .airpop-box'); const bs = [...document.querySelectorAll('#docViewPop button')].map(b => { const r = b.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { t: b.textContent.trim().slice(0, 12), top: Math.round(r.top), bottom: Math.round(r.bottom), visible: r.bottom <= innerHeight && r.top >= 0, hit: !!hit && (hit === b || b.contains(hit)) } })
    const b = box.getBoundingClientRect()
    return { vh: innerHeight, box: { top: Math.round(b.top), bottom: Math.round(b.bottom) }, scrollH: box.scrollHeight, clientH: box.clientHeight, overflowY: getComputedStyle(box).overflowY, buttons: bs }
  })
  console.log(vp.width, JSON.stringify(g))
  await L.shot(p, `x14-viewer-${vp.width}`)
  await ctx.close()
}
await browser.close()
