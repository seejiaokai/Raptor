/* probe for P4e-06: how many bars does Insights draw, and is there a Show all control */
import * as R from './stk2-P-run.mjs'
const { newWorld, closeWorld, nav, sleep, pic } = R
for (const st of [true, false]) {
  const page = await newWorld(st ? { state: process.env.STK_STATE } : {})
  await nav(page, 'viewsched')
  await page.locator('#insightBtn').click(); await sleep(600)
  const info = await page.evaluate(() => ({ irows: document.querySelectorAll('#insightBody .irow').length, all: [...document.querySelectorAll('#insightBody button, #insightBody [data-insights-all]')].map(e => e.outerHTML.slice(0, 120)), sections: [...document.querySelectorAll('#insightBody h3, #insightBody h4, #insightBody .ihead, #insightBody .isec')].map(e => e.innerText.slice(0, 40)), text: document.querySelector('#insightBody').innerText.replace(/\s+/g, ' ').slice(0, 500) }))
  console.log(st ? 'SATURDAY WORLD' : 'FRESH DEMO', JSON.stringify(info))
  await pic(page, 'probe6-insights-' + (st ? 'sat' : 'demo'))
}
await closeWorld()
