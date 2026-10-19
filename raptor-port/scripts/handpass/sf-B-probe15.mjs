import { launch, proveBundle, phone, openBoard, wait } from './sf-B-lib.mjs'
import { buildSat } from './sf-B-lib2.mjs'
console.log('sf-B-probe15 v1')
await proveBundle()
const browser = await launch()
try {
  const { ctx, page: p, errors } = await phone(browser, 'a')
  await buildSat(p)
  await p.evaluate(() => { window.DAYS[5].waves[0].formations[0].rl = '06:30' })
  await openBoard(p, 5)
  const anc = sel => p.evaluate(sel => { let e = document.querySelector(sel); const o = []; while (e && e.id !== 'schedBoard') { o.push(e.tagName + '.' + String(e.className).slice(0, 28)); e = e.parentElement } return o.join(' < ') }, sel)
  console.log('chip:', await anc('#schedBoard .saflies'))
  console.log('duty row:', await anc('#schedBoard [data-drcx]'))
  console.log('duty puck:', await anc('#schedBoard [data-dwdel]'))
  console.log('errors', errors)
} finally { await browser.close() }
