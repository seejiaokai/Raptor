/* w3 item 8, follow-up 2: the version a PHONE can reach — turned sideways
   while the Info tab is showing, then the Flow tab. Does the chart take the
   landscape fit (as it does when turned on the Flow tab)? And does a tap on a
   ball still grade in the state left by (a) of 08b? */
import { open, shot, save, log, reveal } from './trk-lib.mjs'
import { sleep, ball, box } from './trk-w3-lib.mjs'

const L = log()
const zoom = page => page.evaluate(() => ({ chart: document.getElementById('fzPct').textContent, sw: document.getElementById('board').scrollWidth, cw: document.getElementById('board').clientWidth }))
const P = { width: 390, height: 844 }, LS = { width: 844, height: 390 }
const tapSel = async (page, sel) => { const b = await page.locator(sel).first().boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await sleep(450) }

const { browser, page, errors } = await open({ size: P, who: 'a', touch: true })
/* control: turned sideways ON the Flow tab */
const zp = await zoom(page)
await page.setViewportSize(LS); await sleep(700)
const zl = await zoom(page)
L.note('control — turned sideways on the Flow tab', `${zp.chart} → ${zl.chart}`)
await page.setViewportSize(P); await sleep(700)
L.note('control — and back upright', (await zoom(page)).chart)
/* the case: turned sideways while the Info tab shows, then Flow */
await tapSel(page, '#viewtabs [data-view="info"]')
await page.setViewportSize(LS); await sleep(700)
await tapSel(page, '#viewtabs [data-view="flow"]')
const z2 = await zoom(page)
L.ok('turned sideways ON THE INFO TAB, then Flow: the chart takes the landscape fit', z2.chart === zl.chart, `landscape fit is ${zl.chart}; got ${JSON.stringify(z2)}`)
await shot(page, 'w3-08c-landscape-flow-after-info')
/* a ball tap in that state */
await reveal(page, 'ST-01'); const b = await ball(page, 'ST-01').boundingBox()
await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await sleep(500)
L.ok('a tap on ST-01 still opens the grading pop-up', !!(await box(page, '#pop')), JSON.stringify(await box(page, '#pop')))
L.note('errors', errors.join(' | ') || 'none')
save('w3-08c-rotate', { rows: L.rows })
await browser.close()
