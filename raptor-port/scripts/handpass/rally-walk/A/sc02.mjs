import { launch, ctxOpen, SIZES, sleep, shot, buildSat, bType, bf, bPut, hours, setIt, delIt, addIt, addLine, itLines, warns, rec, errors } from './lib.mjs'
console.log('sc02 v1')
const b = await launch()
const { ctx, p } = await ctxOpen(b, SIZES.desk, 'sc02')
await buildSat(p)                       // VL line: Saber/Echo, TO 12:00 LD 13:00
await addLine(p, 5, 0)
await bType(p, bf(5, 0, 1, 'cs'), 'RU'); await bType(p, bf(5, 0, 1, 'to'), '12:00'); await bType(p, bf(5, 0, 1, 'ld'), '13:00')
const pu = await bPut(p, 5, 0, 1, 0, 'p', ['bane', 'ace', 'anvil'])
console.log('RU pilot', pu)
const NAMES = ['Saber', 'Ranger']
if (pu === 'FAILED') { console.log('could not seat RU'); await b.close(); process.exit(0) }
const H = async () => { const h = await hours(p, ['Saber', 'Ranger']); return h }
const R = (li, v) => bType(p, bf(5, 0, li, 'rl'), v)
const base = await H()
console.log('base', JSON.stringify(base))
/* calibration: each box alone, both formations the same */
const cal = {}
for (const t of ['06:00', '07:00', '07:30', '08:00']) { await R(0, t); await R(1, t); cal[t] = await H() }
await R(0, ''); await R(1, '')
console.log('cal', JSON.stringify(cal))
const eq = (x, y) => x === y
const pic = async (n) => shot(p, n, p.locator('#schedBoard .sb-go').first())
/* (a) whole-wave IN TIME 06:00 + VL R 07:00 */
await addIt(p, 5, 0); await setIt(p, 5, 0, 0, '06:00H: IN TIME')
await R(0, '07:00')
let h = await H(); let w = await warns(p)
const pa = await pic('A02a-intime0600-VLR0700')
rec('2a', 'desk', 'whole-wave "06:00H: IN TIME" + VL R 07:00', 'VL starts 06:00 (D1034: rally never an in-time; earliest wins), RU 06:00', { lines: await itLines(p), h, cal06: cal['06:00'], warn: w.slice(0, 4) }, eq(h.Saber, cal['06:00'].Saber) && eq(h.Ranger, cal['06:00'].Ranger) ? 'PASS' : 'FAIL', pa)
await delIt(p, 5, 0, 0)
h = await H()
rec('2a', 'desk', 'remove the in-time line with its X', 'VL back to R 07:00 start (box alone), RU back to its base', { h, cal07: cal['07:00'].Saber, base: base.Ranger, lines: await itLines(p) }, eq(h.Saber, cal['07:00'].Saber) && eq(h.Ranger, base.Ranger) ? 'PASS' : 'FAIL')
await R(0, '')
/* (b) "RU IN TIME 08:00" + RU R 07:00 */
await addIt(p, 5, 0); await setIt(p, 5, 0, 0, '08:00H: RU IN TIME')
await R(1, '07:00')
h = await H(); w = await warns(p)
const pb = await pic('A02b-RUintime0800-RUR0700')
const pbs = await shot(p, 'A02b-warning-panel')
rec('2b', 'desk', '"08:00H: RU IN TIME" + RU R 07:00', 'RU starts 07:00 (earlier of the two), and a red timings-out-of-order warning', { lines: await itLines(p), h, cal07: cal['07:00'].Ranger, warn: w.slice(0, 6) }, eq(h.Ranger, cal['07:00'].Ranger) && w.some(x => /in-time|rally/i.test(x)) ? 'PASS' : 'FAIL', pb)
await delIt(p, 5, 0, 0); h = await H()
rec('2b', 'desk', 'remove that line with X', 'RU stays at R 07:00 start', { h, cal07: cal['07:00'].Ranger }, eq(h.Ranger, cal['07:00'].Ranger) ? 'PASS' : 'FAIL')
await R(1, '')
/* (c) "VL RALLY 07:30" + VL R 08:00 */
await addIt(p, 5, 0); await setIt(p, 5, 0, 0, '07:30H: VL RALLY')
await R(0, '08:00')
h = await H()
const pc = await pic('A02c-VLrally0730-VLR0800')
rec('2c', 'desk', '"07:30H: VL RALLY" + VL R 08:00', 'VL starts 07:30 (earliest of typed line and box, D506); RU unchanged', { lines: await itLines(p), h, cal0730: cal['07:30'].Saber, calbase: base.Ranger }, eq(h.Saber, cal['07:30'].Saber) && eq(h.Ranger, base.Ranger) ? 'PASS' : 'FAIL', pc)
await delIt(p, 5, 0, 0); h = await H()
rec('2c', 'desk', 'remove that line with X', 'VL moves to R 08:00 start', { h, cal08: cal['08:00'].Saber }, eq(h.Saber, cal['08:00'].Saber) ? 'PASS' : 'FAIL')
/* (d) whole-wave RALLY 07:00 + VL R 08:00, RU box empty */
await addIt(p, 5, 0); await setIt(p, 5, 0, 0, '07:00H: RALLY')
h = await H()
const pd = await pic('A02d-wave-rally0700-VLR0800')
rec('2d', 'desk', '"07:00H: RALLY" (whole wave) + VL R 08:00, RU box empty', 'VL 08:00 (own box replaces the general one, D505), RU 07:00', { lines: await itLines(p), h, cal08: cal['08:00'].Saber, cal07: cal['07:00'].Ranger }, eq(h.Saber, cal['08:00'].Saber) && eq(h.Ranger, cal['07:00'].Ranger) ? 'PASS' : 'FAIL', pd)
await delIt(p, 5, 0, 0); h = await H()
rec('2d', 'desk', 'remove that line with X', 'RU goes back to its base start; VL stays 08:00', { h, base: base.Ranger, cal08: cal['08:00'].Saber }, eq(h.Saber, cal['08:00'].Saber) && eq(h.Ranger, base.Ranger) ? 'PASS' : 'FAIL')
console.log('errors', JSON.stringify(errors))
await b.close()
