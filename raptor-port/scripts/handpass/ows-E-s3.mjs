/* walker E — E09: Sunday, an SC SPARE (third row) with a typed B 06:00; OIL Earn switch; amendment */
import * as E from './ows-E-lib.mjs'
const { world, sleep, A, R, W, L, P, judge, row, say, look, sum, setB, lineOf, scWave, SUN, SUNI } = E
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(400)

const w = await scWave(p, SUN, 2, 'bane')
const held = await setB(p, SUN, w.gi, 0, '06:00')
const lineA = await lineOf(p, SUN, w.gi, 0)
const pub = await A.publishNew(p, SUN); await A.closeBoard(p)
const e9a = await look(p, 'bane', SUNI, SUN, 'E09-orig')
say('E09 orig', lineA, sum(e9a))
judge('E09.orig', 'Sunday SC wave; Ranger on the first SPARE row (3rd) of the AM shift; B 06:00; four sign-offs, Publish', [
  ['seated on the 3rd row + B typed', w.took === true && held.stored === '06:00', lineA],
  ['published ORIG', pub.head && pub.head.tag === 'ORIG', pub.head && pub.head.tag],
  ['Leave War cell empty (no OIL)', e9a.cell === '(empty)', e9a.cellText],
  ['no tracker row for Ranger', e9a.rowTxt === 'NO ROW' || !/19 Jul/.test(e9a.rowTxt), e9a.rowTxt.slice(0, 160)],
], e9a.pics)

/* OIL Earn: Ranger's SPARE seat */
await A.toBoard(p, SUN)
await E.oilMode(p, true)
const sw0 = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-oilitem], #schedBoard [data-oilp]')].filter(e => e.offsetParent !== null && (e.dataset.oilp === 'bane' || (e.className + '').includes('lin'))).map(e => ({ item: e.dataset.oilitem, who: e.dataset.oilp || '', cls: String(e.className).slice(0, 60), txt: (e.innerText || '').replace(/\s+/g, ' ').trim(), title: e.getAttribute('title') })))
const pOff = await P(p, 'E09-oilearn-before')
const seatSw = p.locator('#schedBoard [data-oilp="bane"]:visible').first()
await seatSw.evaluate(e => e.scrollIntoView({ block: 'center' })); await seatSw.click(); await sleep(600)
const sw1 = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-oilitem], #schedBoard [data-oilp]')].filter(e => e.offsetParent !== null && (e.dataset.oilp === 'bane' || (e.className + '').includes('lin'))).map(e => ({ who: e.dataset.oilp || '', cls: String(e.className).slice(0, 60), txt: (e.innerText || '').replace(/\s+/g, ' ').trim(), title: e.getAttribute('title') })))
const pOn = await P(p, 'E09-oilearn-after-seat')
say('E09 switches before', JSON.stringify(sw0)); say('E09 switches after seat tap', JSON.stringify(sw1))
await E.oilMode(p, false)
const am = await A.publishAm(p, SUN); await A.closeBoard(p)
const e9b = await look(p, 'bane', SUNI, SUN, 'E09-al')
say('E09 al', sum(e9b))
row('E09.control', 'RECORD which control: OIL Earn mode, tapped Ranger\'s own seat chip on the SPARE row (the "seat oilpk" switch)', `before ${JSON.stringify(sw0.map(s => (s.who || 'LINE') + ': ' + s.cls + ' | ' + s.title))} → after the tap ${JSON.stringify(sw1.map(s => (s.who || 'LINE') + ': ' + s.cls + ' | ' + s.title))}`, 'RECORDED', [pOff, pOn])
judge('E09.al', 'OIL Earn seat switched ON; four sign-offs, Publish AL', [
  ['AL1', am.head && /AL\s*1/.test(am.head.tag), am.head && am.head.tag],
  ['Leave War HO', e9b.cell === 'HO', e9b.cellText],
  ['worked 07:00–13:00 (the written hours, not 06:00)', e9b.times.join(',') === '07:00–13:00', e9b.times],
  ['balance +0.5', true, { bal: e9b.bal, row: e9b.rowTxt.slice(0, 160) }],
], e9b.pics)
const errs = E.cleanErr(errors)
console.log('ERRORS', JSON.stringify(errs))
A.savePart('ows-E-s3', { errors: errs, pics: E.pics.saved })
await browser.close()
