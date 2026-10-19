console.log('B s03 v1 (crew rest across days, phone; Outlaw lands Mon 20:45 and flies Tue VL)')
import { launch, open, sleep, shot, elShot, tap, rec, wk, ceState, model, finish } from './lib.mjs'
const b = await launch()
const { ctx, p } = await open(b)
await p.evaluate(() => window.go('editsched')); await sleep(800)
const T = '#eWeek .day[data-day="1"]'
const warnText = async () => {
  for (let i = 0; i < 2; i++) {
    const t = await p.evaluate(s => { const e = document.querySelector(s + ' .dwbox'); return e ? e.innerText : '' }, T)
    if (/Crew rest|issues|Conflict|long|No time/i.test(t) && t.split('\n').length > 3) return t
    await tap(p, p.locator(`${T} .daywarn`)); await sleep(300)
  }
  return await p.evaluate(s => document.querySelector(s + ' .dwbox')?.innerText || '', T)
}
const crewLines = t => t.split('\n').filter(l => /rest|rally|in-time|report/i.test(l))
const leave = async () => { await tap(p, p.locator(`${T} .day-head`), { block: 'start' }); await sleep(400) }
const outlawClasses = () => p.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="0"] .puck[data-person="casper"]')].map(e => e.className + ' | ' + e.title.slice(0, 120)))
/* baseline */
const base = await warnText()
console.log('BASELINE Tue warnings:\n' + base)
console.log('Mon casper pucks (baseline):', JSON.stringify(await outlawClasses()))
/* fixture: remove Tue wave 1 typed in-time lines, move VL to TO 14:00 / LD 15:25 */
for (let i = 0; i < 2; i++) { await tap(p, p.locator(`${T} [data-itdel]`).first()); await sleep(400) }
const it0 = await p.evaluate(() => window.DAYS[1].waves[0].intimes.length)
const setBox = async (f, txt) => { const el = wk(p, 1, f); await tap(p, el); await p.keyboard.press('Control+A'); await p.keyboard.type(txt); await p.keyboard.press('Enter'); await sleep(350) }
await setBox('ff:1.0.0.to', '1400'); await setBox('ff:1.0.0.ld', '1525')
const m0 = await model(p, 1, 0, 0)
rec('S3-fix', 'removed the two Tue wave-1 in-time lines (X), set VL TO 14:00 / LD 15:25 by finger', 'intimes 0; to 14:00; ld 15:25', { intimes: it0, to: m0.to, ld: m0.ld }, it0 === 0 && m0.to === '14:00' && m0.ld === '15:25' ? 'PASS' : 'FAIL')
const clean = await warnText()
rec('S3-base', 'Tue warnings after the fixture (no R typed)', 'no crew-rest warning for Outlaw (rest clear at 10:45, report 11:00)', crewLines(clean), /Crew rest/.test(clean) ? 'FAIL' : 'PASS', await shot(p, 'B03a-clean'))
console.log(clean)
/* (a) tap R: placed 11:00; type 1000 */
const R = wk(p, 1, 'ff:1.0.0.rl')
await tap(p, R)
const placed = await ceState(R)
await p.keyboard.type('1000'); await leave()
const m1 = await model(p, 1, 0, 0)
const wt = await warnText()
rec('S3a', 'tap R (suggestion), type 1000 (before 10:45), leave', 'placed 11:00; R saved 10:00; red Crew rest warning for Outlaw naming the rally', { placed: placed.text, rl: m1.rl, lines: crewLines(wt) }, placed.text === '11:00' && m1.rl === '10:00' && /Crew rest/.test(wt) ? 'PASS' : 'FAIL', await shot(p, 'B03a-breach'))
console.log(wt)
const mon = await outlawClasses()
rec('S3b', 'Monday: the landing man Outlaw\'s puck on Mon night (RU)', 'dotted red ring class (D1013) after the R breach', mon, mon.some(x => /rest|dot|rr/i.test(x)) ? 'RECORD' : 'RECORD', await (async () => { await p.evaluate(() => document.querySelector('#eWeek .day[data-day="0"] .puck[data-person="casper"]')?.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300); return await shot(p, 'B03b-monday-puck') })())
await b.close()
await finish('s03')
