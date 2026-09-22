import { open, board } from './lib.mjs'
const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json'
const { browser, page } = await open({ state: STATE, width: 390, height: 844 })
await board(page, 5)
await page.evaluate(() => {
  const c = [...document.querySelectorAll('#schedBoard .oilcount')].filter(e => e.offsetParent)[0]
  c.closest('.sb-arow, .sb-line').scrollIntoView({ block: 'center' })
})
await page.waitForTimeout(400)
const box = await page.evaluate(() => {
  const c = [...document.querySelectorAll('#schedBoard .oilcount')].filter(e => e.offsetParent)[0]
  const row = c.closest('.sb-arow, .sb-line')
  const r = row.getBoundingClientRect()
  const x = Math.max(0, Math.round(r.left) - 4), y = Math.max(0, Math.round(r.top) - 10)
  return { x, y, width: Math.min(390 - x, Math.round(r.width) + 8), height: Math.min(844 - y, Math.round(r.height) + 20) }
})
await page.screenshot({ path: 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-21-oil/w11-zoom-390.png', clip: box })
console.log('clip', JSON.stringify(box))
await browser.close()
