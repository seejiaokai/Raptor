import { launch, ctxOpen, sleep, go, shot, openBoard, addStandby, seat, bf, bType, status, errors, chips, summ, pressChip, waveShot, bPublish, topShot, pending, toTop, undo, redo, rec, histTab, reload } from './sf-A-lib.mjs'
console.log('sf-A-s03p v1')
const b = await launch()
const DI = 5
const { ctx, p } = await ctxOpen(b, 's03p')
const gi = await addStandby(p, DI, 'sc')
await seat(p, DI, gi, [[0, 0], [0, 1], [0, 2], [0, 3]])
await openBoard(p, DI)
console.log('publish', JSON.stringify(await bPublish(p, DI)))
const lit = async () => (await chips(p, DI, gi, 0)).map(c => c.chips.some(x => x.on) ? 1 : 0).join('')
const pend = async () => { const x = await pending(p); const m = (x.join(' | ').match(/(\d+) pending/) || [])[1]; return { n: m ? Number(m) : 0, all: x } }
const hist = async () => { const t = await histTab(p, /go out/); await p.keyboard.press('Escape'); await sleep(300); return t && t.replace(/^.*?Waiting to go out/, 'Waiting to go out').slice(0, 500) }

/* 3(d): tick, then type R, then clear R */
const p0 = await pend()
await pressChip(p, `${DI}.${gi}.0.2`)
const p1 = await pend(); const l1 = await lit()
await bType(p, bf(DI, gi, 0, 'rl'), '0630')
const p2 = await pend(); const l2 = await lit(); const h2 = await hist()
await topShot(p, 'A-3d-2-after-R-top')
await bType(p, bf(DI, gi, 0, 'rl'), '')
const p3 = await pend(); const l3 = await lit(); const h3 = await hist()
await topShot(p, 'A-3d-3-after-clear-top')
rec('3d', 'Pub Sat: tick the SPARE, type R 06:30, clear R: the pending count after each step', 'tick=1; after R = what really differs from the issued day (R typed + derived flies); after clearing R = exactly 1 (the tick only), not 3', `start ${p0.n}; after tick ${p1.n} (lit ${l1}); after R ${p2.n} (lit ${l2}) [${h2}]; after clear R ${p3.n} (lit ${l3}) [${h3}]`, p1.n === 1 && p3.n === 1 && l3 === '0010' ? 'PASS' : 'FAIL', 'A/A-3d-3-after-clear-top.png')
/* untick -> back to zero */
await pressChip(p, `${DI}.${gi}.0.2`)
const p4 = await pend(); const l4 = await lit(); const st4 = await status(p)
rec('3d', 'Pub Sat: untick the SPARE (the day now equals its issued form)', 'pending 0, no "Not yet signed", Publish AL button gone', `pending ${p4.n}; lit ${l4}; beak="${st4.beak}"; strip=${JSON.stringify(p4.all)}`, p4.n === 0 && l4 === '0000' ? 'PASS' : 'FAIL', await topShot(p, 'A-3d-4-unticked-top'))

/* Break test 6: hand-tick every row, type R, clear R */
for (let r = 0; r < 4; r++) { await pressChip(p, `${DI}.${gi}.0.${r}`) }
const b1 = await pend(); const bl1 = await lit()
await bType(p, bf(DI, gi, 0, 'rl'), '0630')
const b2 = await pend(); const bl2 = await lit()
await bType(p, bf(DI, gi, 0, 'rl'), '')
const b3 = await pend(); const bl3 = await lit(); const bh3 = await hist()
const ticks = await p.evaluate(([d, g]) => window.DAYS[d].waves[g].formations[0].aircraft.map(a => !!a.fly), [DI, gi])
rec('B6', 'Pub Sat: hand-tick all four rows, type R, clear R', 'after clear R all four stay lit; the pending count says four changes, not eight', `after four ticks: ${b1.n} (lit ${bl1}); after R: ${b2.n} (lit ${bl2}); after clear R: ${b3.n} (lit ${bl3}); stored ticks ${JSON.stringify(ticks)}; list [${bh3}]`, bl3 === '1111' && b3.n === 4 ? 'PASS' : 'FAIL', await topShot(p, 'A-B6-after-clear-top'))
await waveShot(p, DI, gi, 'A-B6-wave')
/* reload: everything persists */
await reload(p); await openBoard(p, DI)
const rl = await lit(); const rp = await pend()
rec('B6', 'reload after the above', 'all four stay lit, pending unchanged', `lit ${rl}; pending ${rp.n}`, rl === '1111' && rp.n === b3.n ? 'PASS' : 'FAIL', await topShot(p, 'A-B6-after-reload-top'))
await ctx.close()
console.log('errors', JSON.stringify(errors))
await b.close()
