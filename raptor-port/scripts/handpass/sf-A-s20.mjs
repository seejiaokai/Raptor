import { launch, ctxOpen, sleep, go, shot, openBoard, closeBoard, addStandby, seat, wave, bf, bType, errors, rec, waveShot, chips, summ, bPublish, pending, topShot, toTop, pressChip, reload, login, leaveBox } from './sf-A-lib.mjs'
console.log('sf-A-s20 v1')
const b = await launch()
const DI = 5
const { ctx, p: A } = await ctxOpen(b, 's20A')
const gi = await addStandby(A, DI, 'sc')
await seat(A, DI, gi, [[0, 0], [0, 1], [0, 2], [0, 3]])
await openBoard(A, DI)
console.log('publish', JSON.stringify(await bPublish(A, DI)))
await sleep(1500)
/* tab B in the same browser */
const B = await ctx.newPage()
B.on('console', m => { if (m.type() === 'error') errors.push('B: ' + m.text()) })
B.on('pageerror', e => errors.push('B PAGEERROR ' + e.message))
await B.goto('http://localhost:4322/'); await sleep(1500)
await login(B)
await B.addStyleTag({ content: '#toastEl{display:none !important}' })
await B.evaluate(d => window.go('editsched'), 0); await sleep(600)
await B.evaluate(d => window.openScheduler(d), DI); await B.waitForSelector('#schedBoard'); await sleep(1000)
const L = async (p) => (await chips(p, DI, gi, 0)).map(c => c.chips.length ? (c.chips.some(x => x.on) ? (c.chips.some(x => x.tag === 'BUTTON') ? 'B' : 'L') : 'd') : '-').join('')
const pend = async p => ((await pending(p)).join('|').match(/(\d+) pending/) || [, '0'])[1]
const mdl = async p => p.evaluate(([d, g]) => { const f = window.DAYS[d].waves[g].formations[0]; return { rl: f.rl || '', ticks: f.aircraft.map(a => !!a.fly).join(',') } }, [DI, gi])
console.log('start A', await L(A), 'B', await L(B), 'B has wave:', await B.evaluate(([d, g]) => !!window.DAYS[d].waves[g], [DI, gi]))
/* simultaneous: A ticks, B types R */
await A.bringToFront()
const tickA = pressChip(A, `${DI}.${gi}.0.2`)
const typeB = (async () => { const el = B.locator(bf(DI, gi, 0, 'rl') + ':visible').first(); await el.click(); await B.keyboard.type('0630'); await B.keyboard.press('Enter'); await B.mouse.click(250, 26); await sleep(500) })()
await Promise.all([tickA, typeB])
await sleep(6000)
const r1 = { A: { lit: await L(A), model: await mdl(A), pend: await pend(A) }, B: { lit: await L(B), model: await mdl(B), pend: await pend(B) } }
console.log('after concurrent (no reload)', JSON.stringify(r1))
const pa = await topShot(A, 'A-20-1-tabA-after')
await toTop(B); await shot(B, 'A-20-2-tabB-after')
/* reload both */
await reload(A); await openBoard(A, DI)
await B.reload(); await sleep(900); await login(B); await B.evaluate(d => window.go('editsched')); await sleep(600); await B.evaluate(d => window.openScheduler(d), DI); await B.waitForSelector('#schedBoard'); await sleep(900)
const r2 = { A: { lit: await L(A), model: await mdl(A), pend: await pend(A) }, B: { lit: await L(B), model: await mdl(B), pend: await pend(B) } }
console.log('after reload both', JSON.stringify(r2))
const agree = JSON.stringify(r1.A) === JSON.stringify(r1.B)
rec('20', 'two tabs on Pub Sat: A ticks the SPARE, B types R 06:30 at the same time; wait for sync', 'both tabs agree, chip lit and non-pressable (shift flies), no tick lost or doubled, same pending count', `no reload: ${JSON.stringify(r1)}; after reload: ${JSON.stringify(r2)}`, agree && r1.A.lit === 'LLLL' ? 'PASS' : 'FAIL', 'A/A-20-1-tabA-after.png')
/* second round: A clears R while B unticks */
const stateBefore = { A: await L(A), B: await L(B) }
const clearA = bType(A, bf(DI, gi, 0, 'rl'), '')
const unB = (async () => { const btn = B.locator(`#schedBoard [data-safly="${DI}.${gi}.0.2"]:visible`); if (await btn.count()) { await btn.first().click(); await sleep(500); return 'pressed' } return 'no button on B (R still typed there)' })()
const [, resB] = await Promise.all([clearA, unB])
await sleep(6000)
const r3 = { A: { lit: await L(A), model: await mdl(A), pend: await pend(A) }, B: { lit: await L(B), model: await mdl(B), pend: await pend(B) } }
rec('20', 'A clears R while B presses the chip off at the same time', 'both tabs agree afterwards (RECORD which state wins)', `before ${JSON.stringify(stateBefore)}; B: ${resB}; after (no reload): ${JSON.stringify(r3)}`, JSON.stringify(r3.A) === JSON.stringify(r3.B) ? 'PASS' : 'FAIL', await topShot(A, 'A-20-3-round2-tabA'))
await reload(A); await openBoard(A, DI)
const r4 = { A: { lit: await L(A), model: await mdl(A), pend: await pend(A) } }
console.log('final after reload A', JSON.stringify(r4))
console.log('errors', JSON.stringify(errors))
await ctx.close(); await b.close()
