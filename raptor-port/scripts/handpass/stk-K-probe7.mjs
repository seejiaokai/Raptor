import * as K from './stk-K-lib.mjs'
const { L, W, H } = K
const { browser, p, errors } = await H.world({ who: 'a', phone: false })
await W.boardOn(p, 1)
await W.boardText(p, 'ff:1.0.1.to', '1030')
await L.sleep(800)
const src = p.locator('#sbRoster .rpuck[data-person="nact"]:visible').first()
console.log('src count', await src.count())
const dst = p.locator('#schedBoard [data-slot="1.0.1.0.p"]:visible').first()
console.log('dst', await dst.count(), await dst.evaluate(e => e.outerHTML.slice(0, 300)))
await dst.evaluate(e => e.scrollIntoView({ block: 'center' }))
await src.evaluate(e => e.scrollIntoView({ block: 'center' })); await K.sleep(200); console.log('src box', JSON.stringify(await src.boundingBox()), 'vp', JSON.stringify(p.viewportSize())); try { await W.drag(p, src, dst) } catch (e) { console.log('drag err', e.message) }
console.log('seat now', await p.evaluate(() => window.DAYS[1].waves[0].formations[1].aircraft[0].p))
await H.pic(p, 'probe-drag')
await browser.close()
