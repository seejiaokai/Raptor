/* R-11 — how a reporting line's clock is read (re-walk, Walker M). Scheduler Board, Wed 15 Jul (day 2). */
import * as G from './stk2-M-lib.mjs'
import * as S from './stk2-M-alib.mjs'
const { L, W } = G
const { world, put, type, tap, sleep } = S
const TAG = process.env.HP_PHONE ? 'ph' : 'dk'
const DI = 2
const w = await world(); const p = w.p
await L.go(p, 'editsched'); await sleep(400)
const out = { steps: [] }
const pool = ['taipan', 'mamba', 'boosh', 'beams', 'bane', 'freak', 'slash', 'stiff', 'piston', 'havoc', 'comet', 'reaper']
const onWedAll = await p.evaluate(ids => ids.filter(i => window.PEOPLE[i] && JSON.stringify(window.DAYS[2]).includes('"' + i + '"')), pool)
const cand = pool.filter(i => !onWedAll.includes(i)).slice(0, 4)
const onWed = onWedAll
console.log('candidates already on Wed:', JSON.stringify(onWed))
const names = await p.evaluate(ids => ids.map(i => window.PEOPLE[i].cs), cand)
out.crew = { VL: [names[0], names[1]], RU: [names[2], names[3]], onWed }
const pickH = h => Object.fromEntries(names.map(n => [n, h[n]]))

async function readAll(label, gi, { insights = true } = {}) {
  const r = { label }
  r.intimes = await p.evaluate(([d, g]) => (window.DAYS[d].waves[g].intimes || []).slice(), [DI, gi])
  r.headers = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-go-h')].map(e => e.innerText.replace(/\s+/g, ' ').trim()))
  r.hdrAsd = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-go-h .asd')].map(e => e.innerText.replace(/\s+/g, ' ').trim()))
  r.feedback = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-reporting-feedback]')].map(e => ({ key: e.getAttribute('data-warnkey'), text: e.innerText.replace(/\s+/g, ' ').trim() })))
  await G.H.boardOpenFold(p)
  r.panel = await G.H.readBoard(p)
  r.panel = { head: r.panel.head, lines: r.panel.lines.map(x => x.text) }
  r.appWarns = (await S.warnsOf(p, DI)).filter(x => /REPORT/.test(x.code) || /report|rally|in-time/i.test(x.msg)).map(x => `${x.sev}/${x.code}: ${x.msg}`)
  r.nan = await p.evaluate(() => /NaN/.test(document.body.innerText))
  if (insights) { const i = await S.insightsOf(p, `R11-${label}-insights`); r.hours = pickH(i.hours); r.hoursPic = i.pic; r.insNaN = JSON.stringify(i).includes('NaN') }
  r.pic = await G.pic(p, `R11-${label}-board`)
  console.log('STEP', JSON.stringify(r))
  out.steps.push(r)
  return r
}

await S.toBoard(p, DI)
const base = await S.insightsOf(p, 'R11-0-base-insights'); out.base = pickH(base.hours); out.basePic = base.pic
console.log('BASE hours', JSON.stringify(out.base))
const gi = await p.evaluate(i => window.DAYS[i].waves.length, DI)
const wv = await S.addFlyingWave(p, DI, { cs: 'VL', to: '11:00', ld: '12:00', p1: cand[0], w1: cand[1] })
await tap(p, `[data-gline="${DI}.${wv.wi}"]`)
await type(p, `[data-bfld="ff:${DI}.${wv.wi}.1.cs"]`, 'RU')
await type(p, `[data-bfld="ff:${DI}.${wv.wi}.1.to"]`, '11:00')
await type(p, `[data-bfld="ff:${DI}.${wv.wi}.1.ld"]`, '12:00')
const t3 = await put(p, `[data-slot="${DI}.${wv.wi}.1.0.p"]`, [cand[2]]), t4 = await put(p, `[data-slot="${DI}.${wv.wi}.1.0.w"]`, [cand[3]])
console.log('seats', JSON.stringify(wv.got), JSON.stringify(t3), JSON.stringify(t4))
out.seats = { got: wv.got, t3, t4 }
const WI = wv.wi
await readAll('1-built-no-lines', WI)
/* two lines through the button */
await G.tapSel(p, `#schedBoard [data-itadd="${DI}|${WI}"]`); await sleep(500)
out.firstPress = await p.evaluate(([d, g]) => window.DAYS[d].waves[g].intimes.slice(), [DI, WI])
await G.tapSel(p, `#schedBoard [data-itadd="${DI}|${WI}"]`); await sleep(500)
out.secondPress = await p.evaluate(([d, g]) => window.DAYS[d].waves[g].intimes.slice(), [DI, WI])
/* (a) */
await G.itLine(p, '#schedBoard', DI, WI, 0, '08:00H: IN TIME + WX/NOTAMS')
await G.itLine(p, '#schedBoard', DI, WI, 1, '08:30H: VL RALLY AFTER IN TIME')
await readAll('a1-original-order', WI)
await G.itLine(p, '#schedBoard', DI, WI, 0, '08:30H: VL RALLY AFTER IN TIME')
await G.itLine(p, '#schedBoard', DI, WI, 1, '08:00H: IN TIME + WX/NOTAMS')
await readAll('a2-swapped', WI)
/* (b) one line */
async function delLine1() {
  const x = p.locator(`#schedBoard [data-itdel="${DI}|${WI}|1"]`).first()
  if (await x.count()) { await x.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await x.click(); await sleep(500) }
}
await delLine1()
for (const [lab, txt] of [['b1', '8h00 VL IN TIME'], ['b2', '8.00 IN TIME'], ['b3', '0800IN TIME + WX/NOTAMS'], ['c1', 'IN TIME BLDG 12'], ['c2', 'RALLY AT FL240']]) {
  await G.itLine(p, '#schedBoard', DI, WI, 0, txt)
  const r = await readAll(`${lab}`, WI)
  r.typed = txt
}
/* (d) a new wave with no take-off */
await G.addWave(p, DI)
const gi2 = await p.evaluate(i => window.DAYS[i].waves.length - 1, DI)
await G.tapSel(p, `#schedBoard [data-itadd="${DI}|${gi2}"]`); await sleep(500)
const el = p.locator(`#schedBoard .intimes[data-intimes="${DI}|${gi2}"] .itline`).first()
await el.evaluate(e => e.scrollIntoView({ block: 'center' }))
out.dLineMinted = await p.evaluate(([d, g]) => window.DAYS[d].waves[g].intimes.slice(), [DI, gi2])
await el.click(); await p.keyboard.press('Home'); await p.keyboard.type('0800 ', { delay: 30 }); await el.evaluate(e => e.blur()); await sleep(600)
const rd0 = await readAll('d1-0800-in-front', gi2, { insights: false })
rd0.avail = await p.evaluate(() => { const t = e => (e.innerText || '').replace(/\s+/g, ' ').trim(); return { heads: [...document.querySelectorAll('#schedBoard .ap-h, #schedBoard [data-avtog]')].map(t), groups: [...document.querySelectorAll('#schedBoard .ap-grp')].map(t) } })
console.log('AVAIL', JSON.stringify(rd0.avail))
const spare = pool.filter(i => !onWedAll.includes(i) && !cand.includes(i))[0]
const pk = await put(p, `[data-slot="${DI}.${gi2}.0.0.p"]`, [spare])
out.dPilot = pk
const rd1 = await readAll('d2-pilot-on-line', gi2)
rd1.avail = await p.evaluate(() => { const t = e => (e.innerText || '').replace(/\s+/g, ' ').trim(); return { heads: [...document.querySelectorAll('#schedBoard .ap-h, #schedBoard [data-avtog]')].map(t), groups: [...document.querySelectorAll('#schedBoard .ap-grp')].map(t) } })
out.dPilotName = await p.evaluate(i => window.PEOPLE[i].cs, spare)
console.log('errors', JSON.stringify(w.errors))
G.save('R11-' + TAG, { out, errors: w.errors })
await w.browser.close()
