console.log('B s18 v1 (wave bands and availability when R is earlier than the wave in-time; phone)')
import { launch, open, sleep, shot, elShot, tap, rec, wk, ceState, model, finish } from './lib.mjs'
const b = await launch()
const { ctx, p } = await open(b)
await p.evaluate(() => window.go('editsched')); await sleep(800)
const T = '#eWeek .day[data-day="1"]'
const leave = async () => { await tap(p, p.locator(`${T} .day-head`), { block: 'start' }); await sleep(400) }
const availDump = () => p.evaluate(s => {
  const d = document.querySelector(s)
  const secs = [...d.querySelectorAll('.sec-avail')]
  return secs.map(sec => ({ head: (sec.querySelector('.dsec, .sechead, h3, .sec-title') || sec).innerText.replace(/\s+/g, ' ').slice(0, 90), pucks: [...sec.querySelectorAll('.puck')].map(e => e.querySelector('.nm')?.textContent + (/san|unav|part/.test(e.className) ? '*' : '') + (e.title.includes('from') || e.title.includes('until') ? '[' + e.title.split('·').slice(-1)[0].trim().slice(0, 40) + ']' : '')).slice(0, 40) }))
}, T)
const waveHeads = () => p.evaluate(s => [...document.querySelectorAll(s + ' .asd, ' + s + ' .wlabel, ' + s + ' [data-wl]')].map(e => e.textContent.replace(/\s+/g, ' ').trim().slice(0, 60)), T)
console.log('structure of avail sections:', JSON.stringify((await availDump()).map(x => ({ head: x.head, n: x.pucks.length }))))
const before = await availDump()
const hdr0 = await waveHeads()
const m0 = await model(p, 1, 1, 0)
console.log('Tue wave 2 VL before:', JSON.stringify(m0))
/* R earlier than the wave's in-time (12:00 VL / 11:40 RU): type 10:00 on Tue wave 2 VL */
const R = wk(p, 1, 'ff:1.1.0.rl')
await tap(p, R); await p.keyboard.type('1000'); await leave()
const m1 = await model(p, 1, 1, 0)
const after = await availDump()
const hdr1 = await waveHeads()
const changed = JSON.stringify(before) !== JSON.stringify(after)
rec('S18a', 'Tue wave 2 VL: type R 10:00 (earlier than its typed in-time 12:00 / RU 11:40, TO 14:40)', 'RECORD: whether the wave start/band and the available-crew marks move', { rl: m1.rl, wave2hdr: [hdr0, hdr1], availSectionsChanged: changed, before: before.map(x => x.head + ' :: ' + x.pucks.join(',')), after: after.map(x => x.head + ' :: ' + x.pucks.join(',')) }, 'RECORD', await elShot(p, `${T} .sec-avail`, 'B18a-avail-after'))
await b.close()
await finish('s18')
