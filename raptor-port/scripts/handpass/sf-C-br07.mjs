import * as L from './sf-C-lib.mjs'
const { launch, ctxOpen, openBoard, closeBoard, bPut, bType, bf, sleep, shot, rec, go, errors, chipLine, weekHead, warnLines, undo } = L
const S = 'B7'
const b = await launch()
const { p } = await ctxOpen(b, {})
await go(p, 'editsched'); await p.evaluate(() => window.addWave(4, 'sc')); await sleep(500)
await openBoard(p, 4)
const seat = await bPut(p, 4, 0, 0, 2, 'p', ['dice'])
await p.locator('#schedBoard [data-safly="4.0.0.2"]:visible').first().click(); await sleep(600)
const c0 = await chipLine(p), h0 = await weekHead(p, 4)
const model0 = () => p.evaluate(() => window.DAYS[4].waves[0].formations.map((f, li) => f.aircraft.map((a, ai) => `${li}.${ai}:${(window.PEOPLE[a.p] || {}).cs || '-'}:${a.role || ''}:fly=${a.fly ? 1 : 0}`).join(' ')))
const m0 = await model0()
await shot(p, 'B7-1-before-drag')
rec(S, 'a hand-ticked SC AM SPARE row (Reaper, row 2)', 'lit, a button', { seat, c0, h0, m0 }, /4\.0\.0\.2:SPARE\+ON/.test(c0) ? 'PASS' : 'NOT WALKED', 'C-B7-1-before-drag.png')
// drag its grip onto the SC PM SPARE row (4.0.1.3)
const src = p.locator('#schedBoard [data-move="mv:ac.4.0.0.2"] .sb-grip').first()
const dst = p.locator('#schedBoard [data-move="mv:ac.4.0.1.3"]').first()
await src.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
const sb = await src.boundingBox()
await dst.evaluate(e => e.scrollIntoView({ block: 'nearest' })); await sleep(150)
const sb2 = await src.boundingBox(), db = await dst.boundingBox()
console.log('src', sb2, 'dst', db)
let ok = false
if (sb2 && db) {
  await p.mouse.move(sb2.x + sb2.width / 2, sb2.y + sb2.height / 2); await p.mouse.down(); await sleep(150)
  const tx = db.x + db.width * 0.5, ty = db.y + db.height * 0.7
  for (let i = 1; i <= 14; i++) { await p.mouse.move(sb2.x + (tx - sb2.x) * i / 14, sb2.y + (ty - sb2.y) * i / 14); await sleep(40) }
  await sleep(300)
  await shot(p, 'B7-2-mid-drag')
  await p.mouse.up(); await sleep(900); ok = true
}
const c1 = await chipLine(p), h1 = await weekHead(p, 4), m1 = await model0(), w1 = await warnLines(p)
await shot(p, 'B7-3-after-drag')
rec(S, 'drag the ticked SC AM SPARE row onto the SC PM SPARE row', 'the tick travels or is dropped consistently; the badge counts it in the right shift', { dragged: ok, c1, h1, m1 }, 'RECORD', 'C-B7-3-after-drag.png')
const pushed = JSON.stringify(m1) !== JSON.stringify(m0)
rec(S, 'did the row move across shifts at all', 'RECORD', { moved: pushed, before: m0, after: m1 }, 'RECORD')
await undo(p)
const c2 = await chipLine(p), m2 = await model0()
rec(S, 'Undo the drag', 'back as before', { c2, m2 }, JSON.stringify(m2) === JSON.stringify(m0) ? 'PASS' : 'FAIL')
rec(S, 'browser error list', 'empty', errors, errors.length ? 'FAIL' : 'PASS')
await b.close()
