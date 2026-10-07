/* walker E — E12 (AVALON: its B moves nothing) and E13 (Insights' work hours grow with an SC shift's B) */
import * as E from './ows-E-lib.mjs'
const { world, sleep, A, R, W, L, P, judge, row, say, look, sum, setB, lineOf, scWave, SUN, SUNI, SAT, SATI } = E
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(400)

/* ---------- E12 ---------- */
const av = await R.addStandby(p, SUN, 'avalon')
const s = await R.seat(p, SUN, av.gi, 0, 0, 'p', 'bane')
const lineBefore = await lineOf(p, SUN, av.gi, 0)
const held = await setB(p, SUN, av.gi, 0, '17:00', { close: false })
await E.oilMode(p, true)
const sw0 = await E.switches(p)
const swb = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-oilitem], #schedBoard [data-oilp]')].filter(e => e.offsetParent !== null).map(e => ({ who: e.dataset.oilp || '', cls: String(e.className).slice(0, 60), txt: (e.innerText || '').replace(/\s+/g, ' ').trim(), title: e.getAttribute('title') })))
const pBefore = await P(p, 'E12-oilearn-before')
const seatSw = p.locator('#schedBoard [data-oilp="bane"]:visible').first()
await seatSw.evaluate(e => e.scrollIntoView({ block: 'center' })); await seatSw.click(); await sleep(600)
const swa = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-oilitem], #schedBoard [data-oilp]')].filter(e => e.offsetParent !== null).map(e => ({ who: e.dataset.oilp || '', cls: String(e.className).slice(0, 60), txt: (e.innerText || '').replace(/\s+/g, ' ').trim(), title: e.getAttribute('title') })))
const pAfter = await P(p, 'E12-oilearn-after')
await E.oilMode(p, false)
const lineAfter = await lineOf(p, SUN, av.gi, 0)
const pub = await A.publishNew(p, SUN); await A.closeBoard(p)
const e12 = await look(p, 'bane', SUNI, SUN, 'E12')
say('E12', lineAfter, JSON.stringify(swb), JSON.stringify(swa), sum(e12))
row('E12.control', 'RECORD which control: OIL Earn mode, Ranger\'s own seat chip on the AVALON line', `before ${JSON.stringify(swb.map(x => (x.who || 'LINE') + ': ' + x.cls + ' | ' + x.title))} → after ${JSON.stringify(swa.map(x => (x.who || 'LINE') + ': ' + x.cls + ' | ' + x.title))}`, 'RECORDED', [pBefore, pAfter])
row('E12', 'Sunday AVALON wave; Ranger first MAIN row; typed 17:00 in its B box; OIL Earn seat ON; four sign-offs, Publish', `line ${lineBefore} → ${lineAfter} · ${sum(e12)}`, 'RECORDED', e12.pics)
judge('E12.exp', 'expected: worked times start 19:00 (the written shift), never 17:00', [
  ['seated + B typed', s.took === true && held.stored === '17:00', lineAfter],
  ['published ORIG', pub.head && pub.head.tag === 'ORIG', pub.head && pub.head.tag],
  ['worked times start at 19:00', e12.times.length > 0 && e12.times.every(t => t.startsWith('19:00')), e12.times],
  ['never 17:00', !/17:00/.test(e12.rowTxt), e12.rowTxt.slice(0, 200)],
], e12.pics)

/* ---------- E13 (a fresh world: Saturday SC, no publish) ---------- */
const w2 = await E.world()
const p2 = w2.p
await L.go(p2, 'editsched'); await sleep(400)
const w = await scWave(p2, SAT, 0, 'bane')
await A.closeBoard(p2)
const i0 = await A.insightsOf(p2, 'E13-before')
await setB(p2, SAT, w.gi, 0, '06:00')
const i1 = await A.insightsOf(p2, 'E13-after')
say('E13', JSON.stringify(i0.hours), JSON.stringify(i0.days), JSON.stringify(i1.hours), JSON.stringify(i1.days))
row('E13', 'Saturday SC, Ranger first MAIN AM, unpublished; Insights (week) work hours before and after typing B 06:00', `before: Ranger ${JSON.stringify(i0.hours.Ranger)} (tooltip ${JSON.stringify((i0.days || {}).Ranger)}), bar ${i0.hoursW.Ranger}; after: Ranger ${JSON.stringify(i1.hours.Ranger)} (tooltip ${JSON.stringify((i1.days || {}).Ranger)}), bar ${i1.hoursW.Ranger}; whole list before ${JSON.stringify(i0.hours)} after ${JSON.stringify(i1.hours)}`, 'RECORDED', [i0.pic, i1.pic])
const errs = E.cleanErr([...errors, ...w2.errors])
console.log('ERRORS', JSON.stringify(errs))
A.savePart('ows-E-s5', { errors: errs, pics: E.pics.saved })
await w2.browser.close()
await browser.close()
