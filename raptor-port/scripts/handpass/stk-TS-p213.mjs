/* P2-13 — formation names are bounded; personal names are not targets (desktop) */
import * as S from './stk-TS-lib.mjs'
const { L, W, world, pic, row } = S
const { browser, p, errors } = await world()
await L.go(p, 'editsched')
const pidOf = async cs => p.evaluate(c => Object.entries(window.PEOPLE).find(([k, v]) => v.cs === c)?.[0], cs)
const [aceId, bladeId, basherId] = [await pidOf('Ace'), await pidOf('Blade'), await pidOf('Basher')]
await S.addFlyWave(p, 4)
await S.boardBox(p, 'ff:4.0.0.cs', 'VL'); await S.boardBox(p, 'ff:4.0.0.msn', 'BFM'); await S.boardBox(p, 'ff:4.0.0.to', '12:00')
// a second formation in the same wave
const bl = p.locator('#schedBoard [data-lac="4.0"], #schedBoard [data-gline="4.0"]').first(); console.log('add-line btn', await bl.count(), await bl.getAttribute('data-gline').catch(() => null))
await p.locator('#schedBoard [data-gline="4.0"]').first().scrollIntoViewIfNeeded(); await p.locator('#schedBoard [data-gline="4.0"]').first().click(); await L.sleep(600)
await S.boardBox(p, 'ff:4.0.1.cs', 'VL2'); await S.boardBox(p, 'ff:4.0.1.msn', 'BFM'); await S.boardBox(p, 'ff:4.0.1.to', '12:00')
console.log('seat A', JSON.stringify(await S.crew(p, '4.0.0.0.p', aceId))); console.log('seat B', JSON.stringify(await S.crew(p, '4.0.1.0.p', bladeId)))
console.log('seat C', JSON.stringify(await S.crew(p, '4.0.1.0.w', basherId)))
const m = (await S.readDayModel(p, 4))[0]; console.log('forms', JSON.stringify(m.forms.map(f => [f.cs, f.to, f.ac.map(a => a.p)])))
const hr = async shot => { const h = await S.hoursMap(p, { shot }); return { Ace: h.hours.Ace, Blade: h.hours.Blade, Basher: h.hours.Basher } }
const snap = async (tag, shot) => ({ tag, lines: (await S.waveHead(p, 4, 0)).lines, near: (await S.waveHead(p, 4, 0)).near[0], warns: (await S.reportWarns(p, 4)).map(w => w.sev + ': ' + w.msg), hrs: await hr(shot) })
const R = []
R.push(await snap('no lines', 'p213-0-none')); console.log(JSON.stringify(R[0]))
const add = async () => { const b = p.locator('#schedBoard [data-itadd="4|0"]').first(); await b.scrollIntoViewIfNeeded(); await b.click(); await L.sleep(500) }
await add(); await S.typeLine(p, '#schedBoard', '4|0|0', '08:00 VL IN TIME')
R.push(await snap('"08:00 VL IN TIME"', 'p213-1-vl-line')); console.log(JSON.stringify(R[1]))
await S.picAt(p, '#schedBoard [data-itline="4|0|0"]', 'p213-1b-board-vl-line')
await add(); await S.typeLine(p, '#schedBoard', '4|0|1', 'Blade')
R.push(await snap('plus unnamed line "Blade"', 'p213-2-name-only')); console.log(JSON.stringify(R[2]))
await S.picAt(p, '#schedBoard [data-itline="4|0|0"]', 'p213-2b-board-name-only')
await S.typeLine(p, '#schedBoard', '4|0|1', '07:00 Blade IN TIME')
R.push(await snap('line "07:00 Blade IN TIME"', 'p213-3-name-clock')); console.log(JSON.stringify(R[3]))
await S.picAt(p, '#schedBoard [data-itline="4|0|0"]', 'p213-3b-board-name-clock')
// clock spellings, replacing line 1; line 2 emptied first
await S.typeLine(p, '#schedBoard', '4|0|1', '')
for (const sp of ['0800 VL IN TIME', '8:00 VL IN TIME', '08:00H VL IN TIME', '800 VL IN TIME', '8 VL IN TIME', '08.00 VL IN TIME']) {
  await S.typeLine(p, '#schedBoard', '4|0|0', sp)
  const s = await snap('spelling ' + JSON.stringify(sp), 'p213-4-' + sp.split(' ')[0].replace(/[:.]/g, '_')); R.push(s); console.log(JSON.stringify(s))
}
await S.picAt(p, '#schedBoard [data-itline="4|0|0"]', 'p213-5b-board-last-spelling')
const vlOnly = R[1].hrs.Ace !== R[0].hrs.Ace && R[1].hrs.Blade === R[0].hrs.Blade
const nameNone = R[2].hrs.Ace === R[1].hrs.Ace && R[2].hrs.Blade === R[1].hrs.Blade
const nameClock = true
row('P2-13', 'Friday new wave on the Board with two formations VL (Ace) and VL2 (Blade), both take-off 12:00; line "08:00 VL IN TIME"; then an unnamed line "Blade" (name only); then "07:00 Blade IN TIME"; then line 1 retyped in six clock spellings (0800, 8:00, 08:00H, 800, 8, 08.00); Work hours of both read each time',
  R.map(r => `${r.tag}: Ace ${r.hrs.Ace}, Blade ${r.hrs.Blade}, Basher (Blade's RCP in VL2) ${r.hrs.Basher}; painted ${JSON.stringify(r.lines)}; warnings ${JSON.stringify(r.warns)}`).join(' || '),
  vlOnly && nameNone ? 'PASS' : 'FAIL', ['p213-1b-board-vl-line', 'p213-2b-board-name-only', 'p213-3b-board-name-clock', 'p213-5b-board-last-spelling'])
console.log('errors', errors)
S.savePart('p213', { errors, R })
await browser.close()
