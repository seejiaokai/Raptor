/* w3 item 8, follow-up 3 (w3-F2 on a real phone): start SIDEWAYS on the Flow
   chart (the sideways fit), switch to Info, turn the phone upright, back to
   Flow — does the chart keep the sideways zoom and scroll sideways? */
import { open, shot, save, log } from './trk-lib.mjs'
import { sleep } from './trk-w3-lib.mjs'
const L = log()
const zoom = page => page.evaluate(() => ({ chart: document.getElementById('fzPct').textContent, sw: document.getElementById('board').scrollWidth, cw: document.getElementById('board').clientWidth }))
const tapSel = async (page, sel) => { const b = await page.locator(sel).first().boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await sleep(450) }
const { browser, page, errors } = await open({ size: { width: 844, height: 390 }, who: 'a', touch: true })
const z0 = await zoom(page)
L.note('sideways, Flow chart', JSON.stringify(z0))
await tapSel(page, '#viewtabs [data-view="info"]')
await page.setViewportSize({ width: 390, height: 844 }); await sleep(700)
await tapSel(page, '#viewtabs [data-view="flow"]')
const z1 = await zoom(page)
L.ok('turned upright while on Info, then Flow: the chart fits the upright width (no sideways scroll)', z1.sw <= z1.cw + 1, JSON.stringify(z1))
await shot(page, 'w3-08d-upright-flow-after-info')
L.note('errors', errors.join(' | ') || 'none')
save('w3-08d-rotate-back', { rows: L.rows })
await browser.close()
