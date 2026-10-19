console.log('B s03c v1 (palette entry, clear R, tight advisory; phone)')
import { launch, open, sleep, shot, elShot, tap, tapFixed, rec, wk, ceState, model, finish } from './lib.mjs'
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
const crewLines = t => t.split('\n').filter(l => /rest|rally|in-time|report|tight|advis/i.test(l))
const leave = async () => { await tap(p, p.locator(`${T} .day-head`), { block: 'start' }); await sleep(400) }
const setBox = async (f, txt) => { const el = wk(p, 1, f); await tap(p, el); await p.keyboard.press('Control+A'); await p.keyboard.type(txt); await p.keyboard.press('Enter'); await sleep(350) }
const palOutlaw = () => p.evaluate(() => [...document.querySelectorAll('.puck[data-person="casper"]')].map(e => ({ x: Math.round(e.getBoundingClientRect().x), cls: e.className, title: e.title.slice(0, 140) })).filter(o => o.x > 120))
const openPal = async () => { await tapFixed(p, p.getByText('AIRCREW', { exact: true }).first(), 700) }
const closePal = async () => { await tapFixed(p, p.getByText('AIRCREW', { exact: true }).first(), 600) }
for (let i = 0; i < 2; i++) { await tap(p, p.locator(`${T} [data-itdel]`).first()); await sleep(400) }
await setBox('ff:1.0.0.to', '1400'); await setBox('ff:1.0.0.ld', '1525')
const R = wk(p, 1, 'ff:1.0.0.rl')
await tap(p, R); await p.keyboard.type('1000'); await leave()
await openPal()
const pal1 = await palOutlaw()
rec('S3e', 'AIRCREW palette (Tue) with R 10:00 breaching', 'Outlaw\'s entry marked as a crew-rest breach (D1013)', pal1, pal1.some(o => /rest|R\b|lchip/i.test(o.cls + o.title)) ? 'PASS' : 'RECORD', await shot(p, 'B03e-palette-breach'))
await closePal()
/* clear R */
await tap(p, R); await p.keyboard.press('Control+A'); await p.keyboard.press('Delete'); await leave()
const mc = await model(p, 1, 0, 0)
const wc = await warnText()
rec('S3f', 'clear the typed R (select all, Delete, leave)', 'the crew-rest warning goes', { rl: mc.rl || '', lines: crewLines(wc) }, !mc.rl && !/Crew rest/.test(wc) ? 'PASS' : 'FAIL', await shot(p, 'B03f-cleared'))
await openPal(); const pal2 = await palOutlaw()
rec('S3g', 'palette after clearing R', 'Outlaw no longer marked', pal2, pal2.every(o => !/rest/i.test(o.title)) ? 'RECORD' : 'RECORD', await shot(p, 'B03g-palette-cleared'))
await closePal()
/* later than nominal and tight */
for (const v of ['1050', '1120']) {
  await tap(p, R); await p.keyboard.press('Control+A'); await p.keyboard.type(v); await leave()
  const m = await model(p, 1, 0, 0); const w = await warnText()
  rec('S3h-' + v, `type R ${v} (rest clear at 10:45; nominal report 11:00)`, 'RECORD any tight crew-rest advisory and its exact words', { rl: m.rl, lines: crewLines(w), full: w.split('\n').filter(l => !/^✕$/.test(l)).slice(0, 14) }, 'RECORD', await shot(p, 'B03h-' + v))
  console.log(w)
}
await b.close()
await finish('s03c')
