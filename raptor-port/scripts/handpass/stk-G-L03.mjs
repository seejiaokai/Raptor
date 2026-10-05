/* L-03 — "RALLY AFTER IN TIME" with a clock, on one formation's line. */
import * as G from './stk-G-lib.mjs'
import { tap, type, put } from './lib.mjs'
const { L, W } = G
const TAG = process.env.HP_PHONE ? 'ph' : 'dk'
const w = await G.world()
const p = w.p
const D = 5
const out = []
const ID = await p.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([k, v]) => [v.cs, k])))
console.log('ids', ID.Reaper, ID.Ghost, ID.Hunter, ID.Ryder)
await G.boardOn(p, D)
await G.insightsOpen(p)
const base = await G.insightsRead(p)
const pick = (txt, n) => { const m = txt.match(new RegExp('WORK HOURS.*?' + n + ' ([0-9h]+)')); return m ? m[1] : null }
const baseline = Object.fromEntries(['Reaper','Ghost','Hunter','Ryder'].map(n => [n, pick(base.text, n)]))
console.log('BASELINE', JSON.stringify(baseline))
await G.pic(p, 'L03-0-baseline-insights')
await G.insightsClose(p)
await G.addWave(p, D)
await type(p, `[data-bfld="ff:${D}.0.0.cs"]`, 'VL')
await type(p, `[data-bfld="ff:${D}.0.0.to"]`, '11:00')
await type(p, `[data-bfld="ff:${D}.0.0.ld"]`, '12:00')
console.log('VL', await put(p, `[data-slot="${D}.0.0.0.p"]`, [ID.Reaper]), await put(p, `[data-slot="${D}.0.0.0.w"]`, [ID.Ghost]))
await tap(p, `[data-gline="${D}.0"]`)
await type(p, `[data-bfld="ff:${D}.0.1.cs"]`, 'RU')
await type(p, `[data-bfld="ff:${D}.0.1.to"]`, '11:00')
await type(p, `[data-bfld="ff:${D}.0.1.ld"]`, '12:00')
console.log('RU', await put(p, `[data-slot="${D}.0.1.0.p"]`, [ID.Hunter]), await put(p, `[data-slot="${D}.0.1.0.w"]`, [ID.Ryder]))
await G.pic(p, 'L03-1-two-formations')
/* two reporting lines through the button */
await G.tapSel(p, `#schedBoard [data-itadd="${D}|0"]`)
await G.sleep(500)
const l1 = await p.evaluate(() => window.DAYS[5].waves[0].intimes.slice())
console.log('after 1st button', JSON.stringify(l1))
await G.tapSel(p, `#schedBoard [data-itadd="${D}|0"]`)
await G.sleep(500)
console.log('after 2nd button', JSON.stringify(await p.evaluate(() => window.DAYS[5].waves[0].intimes.slice())))
await G.itLine(p, '#schedBoard', D, 0, 0, '08:00H: IN TIME + WX/NOTAMS')
await G.itLine(p, '#schedBoard', D, 0, 1, '08:30H: VL RALLY AFTER IN TIME')
const lines = await p.evaluate(() => window.DAYS[5].waves[0].intimes.slice())
console.log('lines stored', JSON.stringify(lines))

async function read(label) {
  const r = { label }
  r.intimes = await p.evaluate(() => window.DAYS[5].waves[0].intimes.slice())
  r.header = await p.evaluate(() => { const e = document.querySelector('#schedBoard .sb-go-h .asd'); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null })
  r.lineText = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .intimes .itline')].map(e => e.innerText.trim()))
  r.feedback = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-reporting-feedback]')].map(e => e.innerText.trim()))
  r.warns = (await G.warnLines(p, D))
  r.pics = [await G.pic(p, `L03-${label}-board`)]
  await G.insightsOpen(p)
  r.insights = await G.insightsRead(p)
  r.figs = Object.fromEntries(['Reaper','Ghost','Hunter','Ryder'].map(n => [n, pick(r.insights.text, n)]))
  r.insights = { rows: r.insights.rows.filter(x => /^(Reaper|Ghost|Hunter|Ryder) /.test(x)) }
  r.pics.push(await G.pic(p, `L03-${label}-insights`))
  await G.insightsClose(p)
  console.log('READ', label, JSON.stringify(r))
  out.push(r)
  return r
}
await read('A-original-order')
/* swap the order */
await G.itLine(p, '#schedBoard', D, 0, 0, '08:30H: VL RALLY AFTER IN TIME')
await G.itLine(p, '#schedBoard', D, 0, 1, '08:00H: IN TIME + WX/NOTAMS')
await read('B-swapped')
console.log('errors', w.errors)
G.rec('L-03-' + TAG, 'raw', out, 'RAW')
G.save('L03-' + TAG, { baseline, out, errors: w.errors })
await w.browser.close()
