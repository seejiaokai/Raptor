console.log('B s03f v1 (arming a seat with the R breach standing; phone)')
import { launch, open, sleep, shot, tap, tapFixed, rec, wk, model, finish } from './lib.mjs'
const b = await launch()
const { ctx, p } = await open(b)
await p.evaluate(() => window.go('editsched')); await sleep(800)
const T = '#eWeek .day[data-day="1"]'
const leave = async () => { await tap(p, p.locator(`${T} .day-head`), { block: 'start' }); await sleep(400) }
const setBox = async (f, txt) => { const el = wk(p, 1, f); await tap(p, el); await p.keyboard.press('Control+A'); await p.keyboard.type(txt); await p.keyboard.press('Enter'); await sleep(350) }
for (let i = 0; i < 2; i++) { await tap(p, p.locator(`${T} [data-itdel]`).first()); await sleep(400) }
await setBox('ff:1.0.0.to', '1400'); await setBox('ff:1.0.0.ld', '1525')
await tap(p, wk(p, 1, 'ff:1.0.0.rl')); await p.keyboard.type('1000'); await leave()
/* arm a Tue VL seat held by another man: tap his puck */
const seat = p.locator(`${T} [data-slot="1.0.0.0.p"] .puck`).first()
await tap(p, seat); await sleep(500)
const armed = await p.evaluate(() => ({ arm: document.querySelector('.seat.armed, [class*=armed]')?.getAttribute('data-slot'), bar: document.body.className }))
console.log(JSON.stringify(armed)); console.log(await shot(p, 'B03j-seat-tapped'))
await tapFixed(p, p.getByText('AIRCREW', { exact: true }).first(), 700)
const pal = await p.evaluate(() => [...document.querySelectorAll('.puck[data-person="casper"]')].map(e => ({ x: Math.round(e.getBoundingClientRect().x), cls: e.className, title: e.title.slice(0, 200) })).filter(o => o.x > 120 && o.x < 400))
rec('S3j', 'tap a Tue VL seat (arm it), open AIRCREW palette, look at Outlaw', 'RECORD: Outlaw barred with the reason', { armed, pal }, 'RECORD', await shot(p, 'B03j-palette-armed'))
await b.close()
await finish('s03f')
