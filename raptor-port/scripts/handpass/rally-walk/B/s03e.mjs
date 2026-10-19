console.log('B s03e v1 (tight crew-rest advisory with a typed R later than the nominal; phone)')
import { launch, open, sleep, shot, tap, rec, wk, model, finish } from './lib.mjs'
const b = await launch()
const { ctx, p } = await open(b)
await p.evaluate(() => window.go('editsched')); await sleep(800)
const T = '#eWeek .day[data-day="1"]'
const warnText = async () => {
  for (let i = 0; i < 3; i++) {
    const t = await p.evaluate(s => { const e = document.querySelector(s + ' .dwbox'); return e ? e.innerText : '' }, T)
    if (t.split('\n').length > 3) return t
    await tap(p, p.locator(`${T} .daywarn`)); await sleep(300)
  }
  return await p.evaluate(s => document.querySelector(s + ' .dwbox')?.innerText || '', T)
}
const leave = async () => { await tap(p, p.locator(`${T} .day-head`), { block: 'start' }); await sleep(400) }
const setBox = async (f, txt) => { const el = wk(p, 1, f); await tap(p, el); await p.keyboard.press('Control+A'); await p.keyboard.type(txt); await p.keyboard.press('Enter'); await sleep(350) }
for (let i = 0; i < 2; i++) { await tap(p, p.locator(`${T} [data-itdel]`).first()); await sleep(400) }
await setBox('ff:1.0.0.to', '1330'); await setBox('ff:1.0.0.ld', '1455')
const pk = () => p.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="1"] .puck[data-person="casper"]')].map(e => e.className + ' | ' + e.title + ' | chips:' + [...e.querySelectorAll('.lchip')].map(c => c.textContent + ':' + c.title).join(',')))
const keep = t => t.split('\n').filter(l => !/^(✕|▲|▼)$/.test(l))
let w = await warnText()
rec('S3i-0', 'VL TO 13:30 (nominal report 10:30), no R', 'nominal inside rest (clear 10:45): red crew-rest breach', keep(w).filter(l => /rest|Tight/i.test(l)), /Crew rest/.test(w) ? 'PASS' : 'FAIL', await shot(p, 'B03i-nomBreach'))
const R = wk(p, 1, 'ff:1.0.0.rl')
await tap(p, R)
const placed = await p.evaluate(s => document.querySelector(s + ' [data-txt="ff:1.0.0.rl"]').textContent, T)
await p.keyboard.type('1100'); await leave()
w = await warnText()
const m = await model(p, 1, 0, 0)
rec('S3i-1', 'tap R (placed suggestion 10:30), type 1100 (later than the nominal 10:30, after rest clear 10:45), leave', 'breach gone; a tight-turning advisory appears; RECORD its exact words (does it say "typed in-time" beside a rally?)', { placed, rl: m.rl, lines: keep(w).filter(l => /rest|Tight|in-time|rally/i.test(l)), pucks: await pk() }, 'RECORD', await shot(p, 'B03i-typedLater'))
console.log(w)
await b.close()
await finish('s03e')
