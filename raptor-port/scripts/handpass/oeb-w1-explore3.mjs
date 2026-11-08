console.log('oeb-w1-explore3 v3')
import { launch, closeAll, open, oilOn, sleep, pic, toTop } from './oeb-w1-lib.mjs'
const size = process.argv[2] || 'pc'
const W = await launch(size, { saved: true })
try {
  await open(W); await oilOn(W)
  const c = W.page.locator('#schedBoard .oilcount').filter({ visible: true }).first()
  await c.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
  if (W.phone) await c.tap(); else await c.click()
  await sleep(800)
  await pic(W, 'explore-win-' + size, { full: true })
  console.log(await W.page.evaluate(() => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
    const w = [...document.querySelectorAll('[class*=win], [role=dialog], .fwin, .aawin')].filter(vis)
    return w.slice(0, 5).map(e => e.tagName + '.' + e.className + ' => ' + e.outerHTML.slice(0, 900))
  }))
  console.log(await W.page.evaluate(() => [...document.querySelectorAll('#sbMore, #sbHist, #sbHl')].map(e => e.outerHTML.slice(0, 200))))
} finally { await closeAll(W) }
