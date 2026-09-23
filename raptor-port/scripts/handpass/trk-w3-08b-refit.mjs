/* w3 item 8, follow-up. (a) A window resized while the Info tab is showing:
   does the chart come back FITTED to the width when the Flow tab is picked
   again (R101: on a phone the chart fits the width, only scrolls up/down)?
   (b) the grading pop-up open across a widen/narrow — retried with the ball
   brought into view on the Flow tab first. */
import { open, shot, save, log, reveal } from './trk-lib.mjs'
import { sleep, ball, box } from './trk-w3-lib.mjs'

const L = log()
const zoom = page => page.evaluate(() => ({ chart: document.getElementById('fzPct').textContent, sw: document.getElementById('board').scrollWidth, cw: document.getElementById('board').clientWidth }))
const N = { width: 390, height: 844 }, W = { width: 1440, height: 900 }

{
  const { browser, page, errors } = await open({ size: N, who: 'a' })
  const z0 = await zoom(page)
  L.note('(a) arrival at 390', JSON.stringify(z0))
  await page.click('#viewtabs [data-view="info"]'); await sleep(300)
  await page.setViewportSize(W); await sleep(600)
  await page.setViewportSize(N); await sleep(600)
  await page.click('#viewtabs [data-view="flow"]'); await sleep(500)
  const z1 = await zoom(page)
  L.ok('(a) Info tab → wider than 1050 and back → Flow tab: the chart is fitted to the width again', z1.chart === z0.chart && z1.sw <= z1.cw + 1, `arrival ${JSON.stringify(z0)} → after ${JSON.stringify(z1)}`)
  await shot(page, 'w3-08b-a-flow-after-resize-on-info')
  /* the same trip made on the FLOW tab re-fits (control) */
  await page.setViewportSize(W); await sleep(600); await page.setViewportSize(N); await sleep(600)
  L.note('(a) control: the same trip made on the Flow tab', JSON.stringify(await zoom(page)))
  await page.click('#fzReset'); await sleep(300)
  L.note('(a) "reset" puts it right', JSON.stringify(await zoom(page)))
  L.note('errors', errors.join(' | ') || 'none')
  await browser.close()
}
{
  const { browser, page, errors } = await open({ size: N, who: 'a' })
  await reveal(page, 'ST-01'); const b = await ball(page, 'ST-01').boundingBox()
  L.note('(b) ST-01 at 390', JSON.stringify(b))
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await sleep(500)
  const p0 = await box(page, '#pop')
  L.ok('(b) a click on ST-01 opens the pop-up at 390', !!p0, JSON.stringify(p0))
  await page.setViewportSize(W); await sleep(600)
  const p1 = await box(page, '#pop')
  L.ok('(b) widen with it open: still on screen, whole', !!p1 && p1.x >= 0 && p1.y >= 0 && p1.r <= W.width && p1.b <= W.height, JSON.stringify(p1))
  await shot(page, 'w3-08b-b-pop-widened')
  await page.setViewportSize(N); await sleep(600)
  const p2 = await box(page, '#pop')
  L.ok('(b) narrow again: still on screen, whole', !!p2 && p2.x >= 0 && p2.y >= 0 && p2.r <= N.width && p2.b <= N.height, JSON.stringify(p2))
  await shot(page, 'w3-08b-b-pop-narrowed')
  L.note('errors', errors.join(' | ') || 'none')
  await browser.close()
}
save('w3-08b-refit', { rows: L.rows })
