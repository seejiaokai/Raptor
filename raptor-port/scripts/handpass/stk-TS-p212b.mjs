/* P2-12 control — the same seated crew on a blank formation with NO reporting line at all */
import * as S from './stk-TS-lib.mjs'
const { L, W, world, pic, row } = S
const { browser, p, errors } = await world()
await L.go(p, 'editsched')
await S.addFlyWave(p, 4)
const put = await S.crew(p, '4.0.0.0.p', 'dj')
const h = await S.hoursMap(p, { shot: 'p212b-1-no-lines-insights' })
console.log('control: crew seated, no take-off, no reporting line -> Ace', h.hours.Ace, h.widths.Ace, 'put', put.took)
// then give the formation a take-off only
await S.boardBox(p, 'ff:4.0.0.to', '12:00')
const h2 = await S.hoursMap(p, { shot: 'p212b-2-takeoff-only-insights' })
console.log('control: take-off 12:00 only -> Ace', h2.hours.Ace, h2.widths.Ace)
row('P2-12-control', 'Friday new blank wave, Ace seated, NO reporting line; then take-off 12:00 typed', `Ace Work hours: no take-off ${h.hours.Ace} (bar ${h.widths.Ace}); take-off only ${h2.hours.Ace}`, 'RECORDED')
S.savePart('p212b', { errors, h: h.hours.Ace, h2: h2.hours.Ace })
await browser.close()
