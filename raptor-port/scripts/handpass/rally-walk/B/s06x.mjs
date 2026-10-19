console.log('B s06x v1 (follow-ups to S6b / S6c, phone board)')
import { launch, open, sleep, shot, tap, rec, bfld, inState, model, finish } from './lib.mjs'
const b = await launch()
const openBoard = async (p, di) => { await p.evaluate(() => window.go('editsched')); await sleep(700); await p.evaluate(d => window.openScheduler(d), di); await p.waitForSelector('#schedBoard', { timeout: 8000 }); await sleep(900) }
const leave = async p => { await tap(p, p.locator('#sbDay'), { block: 'start' }) }
let ctx, p
/* B alone */
;({ ctx, p } = await open(b)); await openBoard(p, 1)
let B = bfld(p, 'ff:1.0.1.br')
await tap(p, B); const s1 = await inState(B)
rec('S6x1', 'tap B alone (RU), nothing before', 'placed 07:20 highlighted', s1, s1.value === '07:20' && s1.se === 5 ? 'PASS' : 'FAIL', await shot(p, 'B06x1-B-alone'))
await ctx.close()
/* R then B, then a second tap on B */
;({ ctx, p } = await open(b)); await openBoard(p, 1)
let R = bfld(p, 'ff:1.0.1.rl'); B = bfld(p, 'ff:1.0.1.br')
await tap(p, R); await tap(p, B, { block: 'nearest' })
const s2 = await inState(B)
await tap(p, B, { block: 'nearest' })
const s3 = await inState(B)
rec('S6x2', 'tap R, tap B (unplaced), tap B again', 'RECORD whether the 2nd tap places it', { afterFirst: s2, afterSecond: s3, rl: (await model(p, 1, 0, 1)).rl }, 'RECORD', await shot(p, 'B06x2-B-second-tap'))
await ctx.close()
/* R, wait, then B */
;({ ctx, p } = await open(b)); await openBoard(p, 1)
R = bfld(p, 'ff:1.0.1.rl'); B = bfld(p, 'ff:1.0.1.br')
await tap(p, R); await sleep(1200); await tap(p, B, { block: 'nearest' })
const s4 = await inState(B)
rec('S6x3', 'tap R, wait 1.2 s, tap B', 'B placed (timing check)', s4, s4.value === '07:20' ? 'PASS' : 'FAIL')
await ctx.close()
/* B then R (other order) */
;({ ctx, p } = await open(b)); await openBoard(p, 1)
R = bfld(p, 'ff:1.0.1.rl'); B = bfld(p, 'ff:1.0.1.br')
await tap(p, B); await tap(p, R, { block: 'nearest' })
const s5 = await inState(R)
rec('S6x4', 'tap B then R', 'R placed 06:40', { R: s5, br: (await model(p, 1, 0, 1)).br }, s5.value === '06:40' ? 'PASS' : 'FAIL', await shot(p, 'B06x4-BthenR'))
await ctx.close()
/* Enter behaviours */
;({ ctx, p } = await open(b)); await openBoard(p, 1)
R = bfld(p, 'ff:1.0.0.rl'); const TO = bfld(p, 'ff:1.0.0.to')
await tap(p, TO); await p.keyboard.type('0850'); await p.keyboard.press('Enter'); await sleep(400)
rec('S6x5', 'baseline: tap TO (typed), type 0850, Enter', 'RECORD what Enter does on a plain board time box', { box: await inState(TO), to: (await model(p, 1, 0, 0)).to }, 'RECORD')
await tap(p, R); await p.keyboard.type('0535'); await p.keyboard.press('Enter'); await sleep(400)
rec('S6x6', 'tap R, type 0535, Enter', 'RECORD saved?', { box: await inState(R), rl: (await model(p, 1, 0, 0)).rl }, 'RECORD', await shot(p, 'B06x6-typed-enter'))
await ctx.close()
await b.close()
await finish('s06x')
