/* R-11 (d) only, with the pilot's own Work hours (re-walk, Walker M). Scheduler Board, Wed 15 Jul (day 2). */
import * as G from './stk2-M-lib.mjs'
import * as S from './stk2-M-alib.mjs'
const { L, W } = G
const { world, put, type, tap, sleep } = S
const TAG = process.env.HP_PHONE ? 'ph' : 'dk'
const DI = 2
const w = await world(); const p = w.p
await L.go(p, 'editsched'); await sleep(400)
const out = {}
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
const spare = pool.filter(i => !onWedAll.includes(i))[0]
const spareName = await p.evaluate(i => window.PEOPLE[i].cs, spare)
const b0 = await S.insightsOf(p, 'R11d-0-base-insights'); const base = b0.hours[spareName]
await G.addWave(p, DI)
const gi2 = await p.evaluate(i => window.DAYS[i].waves.length - 1, DI)
await G.tapSel(p, `#schedBoard [data-itadd="${DI}|${gi2}"]`); await sleep(500)
const el = p.locator(`#schedBoard .intimes[data-intimes="${DI}|${gi2}"] .itline`).first()
await el.evaluate(e => e.scrollIntoView({ block: 'center' }))
out.minted = await p.evaluate(([d, g]) => window.DAYS[d].waves[g].intimes.slice(), [DI, gi2])
out.band0 = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .ap-grp')].map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()))
out.hdr0 = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-go-h')].map(e => (e.innerText.match(/In-time \/ Rally[^⇅]*/) || [''])[0].trim()))
out.pic0 = await G.pic(p, 'R11d-0b-minted-line')
await el.click(); await p.keyboard.press('Home'); await p.keyboard.type('0800 ', { delay: 30 }); await el.evaluate(e => e.blur()); await sleep(600)
out.stored = await p.evaluate(([d, g]) => window.DAYS[d].waves[g].intimes.slice(), [DI, gi2])
out.hdr = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-go-h')].map(e => e.innerText.replace(/\s+/g, ' ').trim()))
out.band1 = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .ap-grp')].map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()))
out.pic1 = await G.pic(p, 'R11d-1-line-0800')
const pk = await put(p, `[data-slot="${DI}.${gi2}.0.0.p"]`, [spare])
out.pk = pk
const b1 = await S.insightsOf(p, 'R11d-2-pilot-insights')
out.person = spareName; out.hoursBefore = base; out.hoursAfter = b1.hours[spareName]
out.band2 = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .ap-grp')].map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()))
out.hdr2 = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-go-h')].map(e => e.innerText.replace(/\s+/g, ' ').trim()))
out.nan = (await p.evaluate(() => document.body.innerText)).includes('NaN') || JSON.stringify(b1).includes('NaN')
out.pic2 = await G.pic(p, 'R11d-3-pilot-board')
console.log(JSON.stringify(out))
G.save('R11d-' + TAG, { out, errors: w.errors })
await w.browser.close()
