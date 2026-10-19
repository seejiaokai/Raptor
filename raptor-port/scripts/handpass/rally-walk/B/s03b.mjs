console.log('B s03b v1 (crew rest trace, palette, clear R, tight advisory; phone)')
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
for (let i = 0; i < 2; i++) { await tap(p, p.locator(`${T} [data-itdel]`).first()); await sleep(400) }
await setBox('ff:1.0.0.to', '1400'); await setBox('ff:1.0.0.ld', '1525')
const R = wk(p, 1, 'ff:1.0.0.rl')
await tap(p, R); await p.keyboard.type('1000'); await leave()
/* the Tuesday puck: title (the trace) and classes */
const tuePuck = await p.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="1"] .puck[data-person="casper"]')].map(e => e.className + ' | ' + e.title))
rec('S3c', 'Tue: Outlaw\'s puck in VL after R 10:00', 'RECORD: a title/trace naming the rally', tuePuck, 'RECORD')
/* tap the crew-rest warning row to see what it lights / its trace */
const wt = await warnText()
const row = p.locator(`${T} .dwbox`).getByText(/Outlaw — Crew rest breach/).first()
await tap(p, row); await sleep(400)
const afterRow = await p.evaluate(() => ({ lit: [...document.querySelectorAll('.puck.wlit, .puck.hl, .puck.warnlit, .puck[class*=lit]')].map(e => e.dataset.person + ' ' + e.className).slice(0, 4), toast: [...document.querySelectorAll('.toast,#toast,[class*=toast]')].filter(e => e.offsetParent !== null).map(e => e.innerText.slice(0, 120)) }))
rec('S3d', 'tap the crew-rest warning row', 'RECORD what lights/ explains', afterRow, 'RECORD', await shot(p, 'B03d-warnrow'))
/* palette */
await tapFixed(p, p.locator('.aircrew-tab, #acTab, [class*=aircrew]').first().or(p.getByText('AIRCREW', { exact: true }).first()), 700)
const pal = await p.evaluate(() => {
  const ps = [...document.querySelectorAll('.puck[data-person="casper"]')].filter(e => e.closest('[id*=pal],[class*=pal],[class*=crew]'))
  return { n: ps.length, rows: ps.map(e => e.className + ' | ' + e.title.slice(0, 160)), bodyHasPalette: !!document.querySelector('[class*=palette],#palette') }
})
rec('S3e', 'open the AIRCREW palette (Tuesday), find Outlaw', 'his entry marked (D1013) with the reason', pal, pal.n ? 'RECORD' : 'NOT WALKED', await shot(p, 'B03e-palette'))
console.log(JSON.stringify(pal))
await b.close()
await finish('s03b')
