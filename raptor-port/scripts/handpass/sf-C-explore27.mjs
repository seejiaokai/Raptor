import * as L from './sf-C-lib.mjs'
const { launch, ctxOpen, openBoard, bPut, bType, bf, bPublish, sleep, shot, go, chipLine } = L
const b = await launch()
const { p } = await ctxOpen(b, {})
await go(p, 'editsched'); await p.evaluate(() => window.addWave(5, 'sc')); await sleep(500)
await openBoard(p, 5)
await bPut(p, 5, 0, 0, 0, 'p', ['stiff']); await bPut(p, 5, 0, 0, 2, 'p', ['dice'])
await bPublish(p, 5)
const dots = async tag => { const r = await p.locator('#schedBoard [data-slot="5.0.0.0.p"]').first().boundingBox(); await p.screenshot({ path: L.OUT + '/C-A-1b-dots-' + tag + '.png', clip: { x: r.x - 30, y: r.y - 20, width: 520, height: 230 } }) }
await dots('after publish')
await p.locator('#schedBoard [data-safly="5.0.0.2"]:visible').first().click(); await sleep(800)
await dots('after tick')
await b.close()
