/* S20 — previewing and loading an older version differ: ORIGINAL report 08:30, AL1 report 10:00, then debrief 2h30 */
import * as D from './ows-D-lib.mjs'
import * as K from './wh-b-lib.mjs'
const { world, sleep, A, R, W, L, P, judge, pend, signsOf, ISO } = D
const SAT = 5
const log = (...a) => console.log('>>', ...a)
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(300)
const w = await D.flyingWave(p, SAT, { cs: 'VIPER', to: '12:00', ld: '13:00', p1: 'bane' })
await A.closeBoard(p); await A.toWeek(p); await W.showDay(p, SAT)
await A.addItBtn(p, SAT, w.wi); await A.setItLine(p, SAT, w.wi, 0, 'IN TIME 0830')
const pub = await A.publishNew(p, SAT); await A.closeBoard(p)
const o1 = await D.oilOf(p, 'bane', ISO[SAT], 'S20-orig')
await A.toWeek(p); await W.showDay(p, SAT)
await A.setItLine(p, SAT, w.wi, 0, 'IN TIME 1000')
const am = await A.publishAm(p, SAT); await A.closeBoard(p)
const o2 = await D.oilOf(p, 'bane', ISO[SAT], 'S20-al1')
log('ORIG', o1.cell.text, o1.row.slice(0, 150), '| AL1', am.head && am.head.tag, o2.cell.text, o2.row.slice(0, 150))
const set = await A.logicSet(p, 'debrief', '2h30')
const d3 = await D.dayState(p, SAT, 'S20-debrief')
const o3 = await D.oilOf(p, 'bane', ISO[SAT], 'S20-debrief')
log('after debrief 2h30: chip', d3.head.pending, '| list', d3.list.slice(0, 300), '| paid', o3.cell.text, o3.row.slice(0, 150))
/* preview ORIGINAL (read only) */
const lk = await K.look(p, SAT, /Original/i)
log('look', JSON.stringify(lk).slice(0, 200))
const faceOrig = await p.evaluate(i => { const d = document.querySelector(`#eWeek .day[data-day="${i}"]`); const pk = [...d.querySelectorAll('[data-person="bane"]')].filter(e => e.offsetParent !== null); return { bar: (d.querySelector('.dprev-bar') || {}).innerText || '', pucks: pk.map(e => (String(e.className).match(/oilbar-(fo|ho)/) || ['none'])[0]), it: ((window.DAYS[i].waves[0].intimes) || []).slice() } }, SAT)
const picLook = await P(p, 'S20-preview-orig')
const oL = await D.oilOf(p, 'bane', ISO[SAT], 'S20-while-previewing')
log('preview face', JSON.stringify(faceOrig), '| paid while previewing', oL.cell.text, oL.row.slice(0, 150))
/* back to the live copy, then load ORIGINAL onto the working copy */
await A.toWeek(p); await W.showDay(p, SAT)
const lk2 = await K.look(p, SAT, /Original/i)
const ld = await K.load(p, SAT, { confirm: true })
log('load said', JSON.stringify(ld))
await A.toWeek(p); await W.showDay(p, SAT)
const itAfter = await p.evaluate(i => (window.DAYS[i].waves[0].intimes || []).slice(), SAT)
const d4 = await D.dayState(p, SAT, 'S20-loaded')
const o4 = await D.oilOf(p, 'bane', ISO[SAT], 'S20-loaded')
await A.toBoard(p, SAT); await D.oilMode(p, true)
const figLoaded = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .puck[data-person="bane"]')].filter(e => e.offsetParent !== null && !e.closest('#sbRoster')).map(e => e.innerText.replace(/\s+/g, ' ').trim()))
const picMode = await P(p, 'S20-loaded-mode'); await D.oilMode(p, false); await A.closeBoard(p)
log('loaded: line', JSON.stringify(itAfter), '| mode', JSON.stringify(figLoaded), '| chip', d4.head.pending, '| list', d4.list.slice(0, 300), '| paid', o4.cell.text, o4.row.slice(0, 150))
const am2 = await A.publishAm(p, SAT); await A.closeBoard(p)
const o5 = await D.oilOf(p, 'bane', ISO[SAT], 'S20-al2')
log('AL2', am2.head && am2.head.tag, o5.cell.text, o5.row.slice(0, 160))
judge('S20', 'ORIGINAL IN TIME 08:30 published; IN TIME 10:00 published as AL1; Logic debrief 2h → 2h30; looked at ORIGINAL (read only); then "Load onto working copy"; then four sign and Publish AL', [
  ['ORIG paid FO 08:30–15:00', o1.letters === 'FO' && /08:30.15:00/.test(o1.row), `${o1.cell.text} | ${o1.row.slice(0, 140)}`],
  ['AL1 paid HO 10:00–15:00', o2.letters === 'HO' && /10:00.15:00/.test(o2.row), `${o2.cell.text} | ${o2.row.slice(0, 140)}`],
  ['debrief change reads pending and names the Logic value', pend(d3.head) !== '0' && /Flight debrief/.test(d3.list), { chip: d3.head.pending, list: d3.list.slice(0, 200) }],
  ['previewing ORIGINAL: its face reads IN TIME 08:30 and the FULL-day (FO) edge', /08:?30/.test((faceOrig.it || []).join(' ')) && faceOrig.pucks.some(x => /fo/.test(x)), faceOrig],
  ['previewing changes no money: paid still HO 10:00–15:00', oL.letters === 'HO' && /10:00.15:00/.test(oL.row), `${oL.cell.text} | ${oL.row.slice(0, 140)}`],
  ['loaded onto the working copy: line is IN TIME 08:30 again', /0?8:?30/.test((itAfter || []).join(' ')), itAfter],
  ['loaded candidate under today\'s values: still a full day (FO) in the mode', /FO/.test(figLoaded.join(' ')), figLoaded],
  ['paid latest AL1 still HO 10:00–15:00 until reissue', o4.letters === 'HO' && /10:00.15:00/.test(o4.row), `${o4.cell.text} | ${o4.row.slice(0, 140)}`],
  ['reissued AL2: FO, worked 08:30–15:30 (420 min under debrief 2h30)', o5.letters === 'FO' && /08:30.15:30/.test(o5.row), `${o5.cell.text} | ${o5.row.slice(0, 140)}`],
], [d3.pics[0], picLook, ...oL.pics, d4.pics[0], picMode, ...o4.pics, ...o5.pics])
console.log('ERRORS', JSON.stringify(D.cleanErr(errors)))
D.savePart('ows-D-s20', { errors: D.cleanErr(errors), pics: D.pics.saved })
await browser.close()
