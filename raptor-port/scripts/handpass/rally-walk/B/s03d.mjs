console.log('B s03d v1 (where does the tight crew-rest advisory show? phone)')
import { launch, open, sleep, shot, tap, rec, wk, model, finish } from './lib.mjs'
const b = await launch()
const { ctx, p } = await open(b)
await p.evaluate(() => window.go('editsched')); await sleep(800)
const T = '#eWeek .day[data-day="1"]'
const leave = async () => { await tap(p, p.locator(`${T} .day-head`), { block: 'start' }); await sleep(400) }
const setBox = async (f, txt) => { const el = wk(p, 1, f); await tap(p, el); await p.keyboard.press('Control+A'); await p.keyboard.type(txt); await p.keyboard.press('Enter'); await sleep(350) }
for (let i = 0; i < 2; i++) { await tap(p, p.locator(`${T} [data-itdel]`).first()); await sleep(400) }
await setBox('ff:1.0.0.to', '1400'); await setBox('ff:1.0.0.ld', '1525')
const R = wk(p, 1, 'ff:1.0.0.rl')
const pucks = () => p.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="1"] .puck[data-person="casper"], #eWeek .day[data-day="0"] .puck[data-person="casper"]')].map(e => e.closest('.day').dataset.day + ': ' + e.className + ' | ' + e.title))
/* no R: nominal report 11:00 → rest 12h15 */
console.log('no R:', JSON.stringify(await pucks()))
for (const v of ['1050', '1100', '1120']) {
  await tap(p, R); await p.keyboard.press('Control+A'); await p.keyboard.type(v); await leave()
  const pk = await pucks()
  const m = await model(p, 1, 0, 0)
  rec('S3h-' + v, `R ${v}: Outlaw's pucks Mon and Tue`, 'RECORD any tight-rest advisory words', { rl: m.rl, pucks: pk }, 'RECORD')
}
await b.close()
await finish('s03d')
