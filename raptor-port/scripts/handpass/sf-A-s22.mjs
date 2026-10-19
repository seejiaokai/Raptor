import { launch, ctxOpen, sleep, go, shot, openBoard, closeBoard, addStandby, seat, wave, bf, bType, errors, rec, waveShot, chips, summ, bPublish, pending, topShot, toTop, pressChip, reload, cxRow } from './sf-A-lib.mjs'
console.log('sf-A-s22 v1')
const b = await launch()
const DI = 5
const { ctx, p } = await ctxOpen(b, 's22')
const seatAll = async (gi) => { const w = await wave(p, DI, gi); const spec = []; w.f.forEach((f, li) => f.ac.forEach((a, ai) => spec.push([li, ai]))); return seat(p, DI, gi, spec) }
const gSC = await addStandby(p, DI, 'sc'); await seatAll(gSC)
const gAV = await addStandby(p, DI, 'avalon'); await seatAll(gAV)
const gBB = await addStandby(p, DI, 'bb'); await seatAll(gBB)
await openBoard(p, DI)
await bType(p, bf(DI, gSC, 0, 'rl'), '0630')
await pressChip(p, `${DI}.${gSC}.1.2`)
await pressChip(p, `${DI}.${gAV}.0.2`)
await bType(p, bf(DI, gBB, 0, 'rl'), '0800')
await cxRow(p, DI, gSC, 0, 3)
console.log('publish', JSON.stringify(await bPublish(p, DI)))
await pressChip(p, `${DI}.${gAV}.0.3`)       // one pending change after publishing
const snap = async () => p.evaluate(di => {
  const waves = window.DAYS[di].waves.map(w => ({ kind: w.kind, f: w.formations.map(f => ({ rl: f.rl || '', br: f.br || '', ac: f.aircraft.map(a => (a.p || '-') + '/' + (a.w || '-') + ':' + a.role + (a.fly ? ':fly' : '') + (a.cx ? ':cx' : '')).join(' ') })) }))
  return JSON.stringify(waves)
}, DI)
const shapes = async () => { const o = {}; for (const [n, g] of [['SC', gSC], ['AV', gAV], ['BB', gBB]]) { const w = await wave(p, DI, g); for (let li = 0; li < w.f.length; li++) o[n + li] = (await chips(p, DI, g, li)).map(c => c.chips.length ? (c.chips.some(x => x.on) ? 'L' : 'd') : '-').join('') } return o }
const pend = async () => ((await pending(p)).join('|').match(/(\d+) pending/) || [, '0'])[1]
const before = { snap: await snap(), shapes: await shapes(), pend: await pend() }
console.log('before', JSON.stringify(before.shapes), 'pend', before.pend)
const pic0 = await waveShot(p, DI, gSC, 'A-22-1-before-SC')
await reload(p); await openBoard(p, DI)
const after = { snap: await snap(), shapes: await shapes(), pend: await pend() }
const pic1 = await waveShot(p, DI, gSC, 'A-22-2-after-reload-SC')
rec('22', 'reload on a Pub Sat holding: SC AM R typed (one row CX), SC PM one ticked SPARE, AVALON one ticked + one more ticked after publishing, BB R typed', 'every hand tick and lit chip comes back exactly; wave/row order unchanged; pending count unchanged', `before ${JSON.stringify(before.shapes)} pend ${before.pend}; after ${JSON.stringify(after.shapes)} pend ${after.pend}; model identical: ${before.snap === after.snap}`, before.snap === after.snap && JSON.stringify(before.shapes) === JSON.stringify(after.shapes) && before.pend === after.pend ? 'PASS' : 'FAIL', pic1)
/* the week and View-only after the reload */
await closeBoard(p); await go(p, 'editsched')
const w = await p.evaluate(di => { const d = document.querySelector(`#eWeek .day[data-day="${di}"]`); return { lit: d.querySelectorAll('.saflies.on').length, dash: d.querySelectorAll('.saflies:not(.on)').length, btn: d.querySelectorAll('button.saflies').length, badge: d.querySelector('.badge').textContent.trim() } }, DI)
await go(p, 'viewsched')
const v = await p.evaluate(di => { const d = document.querySelectorAll('#page-viewsched .day')[di]; return { lit: d.querySelectorAll('.saflies.on').length, dash: d.querySelectorAll('.saflies:not(.on)').length, btn: d.querySelectorAll('button.saflies').length, badge: d.querySelector('.badge').textContent.trim() } }, DI)
rec('22', 'the week and View-only Sched after the reload', 'lit chips only; the week shows the working copy (10 lit, AVALON term 2) and View-only shows the issued day without the one pending tick (9 lit, AVALON term 1)', `week ${JSON.stringify(w)}; view-only ${JSON.stringify(v)}`, w.lit === v.lit + 1 && w.dash === 0 && v.dash === 0 && w.btn === 0 && v.btn === 0 ? 'PASS' : 'FAIL')
rec('22', 'the browser error list across this script (console errors, page errors, HTTP 4xx/5xx)', 'empty', JSON.stringify(errors), errors.length === 0 ? 'PASS' : 'FAIL')
console.log('errors', JSON.stringify(errors))
await ctx.close(); await b.close()
