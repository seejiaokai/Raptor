import * as L from './sf-C-lib.mjs'
const { launch, ctxOpen, openBoard, closeBoard, bPut, bType, bf, bPublish, sleep, shot, go, oilOpen, oilClose, errors } = L
const b = await launch()
const { p } = await ctxOpen(b, {})
await go(p, 'editsched')
await p.evaluate(() => window.addWave(5, 'avalon')); await sleep(500)
await openBoard(p, 5)
for (const [ai, pid] of [[0, 'stiff'], [1, 'bane'], [2, 'slipway'], [3, 'dj']]) await bPut(p, 5, 0, 0, ai, 'p', [pid])
const hdr = async tag => { await oilOpen(p); const t = await p.evaluate(() => { const e = document.querySelector('#schedBoard .oilbar, #schedBoard [class*=oilhead], #schedBoard .sb-oilbar'); const all = [...document.querySelectorAll('#schedBoard *')].filter(x => /Nothing today earns|earn(s|ed)? OIL|OIL EARN/i.test(x.childNodes.length === 1 ? x.textContent : '')).slice(0, 4).map(x => x.className + '|' + x.textContent.trim().slice(0, 100)); return all }); console.log(tag, JSON.stringify(t)); await shot(p, 'x12-' + tag); await oilClose(p) }
await hdr('unpub')
await bPublish(p, 5)
await hdr('pubORIG')
await bType(p, bf(5, 0, 0, 'rl'), '18:30')
await hdr('pending')
await bPublish(p, 5)
await hdr('AL1')
await b.close()
