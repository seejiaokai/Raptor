/* walker B — S09 (+ H-03 on desktop): a typed reporting change is ordinary pending content */
import * as K from './ows-B-lib.mjs'
const { world, judge, row, savePart, sleep, pic, S } = { ...K, S: K }
const PH = !!process.env.HP_PHONE
const { browser, p, errors } = await world()
const SAT = 5, ID = 'bane'
const T = PH ? 'S09ph' : 'S09'
const base = await K.baseline(p, ID)
console.log('BASELINE', base.row.slice(0, 200))
await K.L.go(p, 'editsched'); await sleep(300)
const w = await K.flight(p, SAT, { cs: 'VIPER', to: '12:00', ld: '13:00', p1: ID })
const pub = await K.publishNew(p, SAT); await K.closeBoard(p)
const o1 = await K.oilOf(p, ID, K.SAT, T + 'a-pub')
let h1 = null
if (!PH) { h1 = await K.insightsOf(p, T + 'a-insights') }
const d1 = await K.dayState(p, SAT, T + 'a-day')
judge(T + '.1', 'Ranger seated through the crew list on a new Saturday flying line 12:00–13:00, no In-time/Rally; four signed; published ORIG', [
  ['seated', w.got[0] === ID, w.got], ['published ORIG', pub.head && pub.head.tag === 'ORIG', pub.head && pub.head.tag],
  ['HO', o1.letters === 'HO', o1.cell.text], ['worked 09:00–15:00', /09:00.15:00/.test(o1.row), o1.row.slice(0, 160)],
  ['balance +0.5', !!base.bal && +o1.bal === +base.bal + 0.5, { base: base.bal, now: o1.bal }],
  ['nothing pending', d1.pend === '0', d1.head.pending]], [...o1.pics, ...d1.pics])
if (h1) row('H-03.a', 'Insights → Work hours for Ranger, published, no In-time/Rally typed', K.hrs(h1), 'RECORDED', [h1.pic])

/* type IN TIME 08:30 through "+ In-time / Rally" and the line's text box */
await K.toBoard(p, SAT)
const it = await K.itLine(p, SAT, w.wi, 'IN TIME 08:30')
const fb = await K.feedbackText(p, SAT, w.wi)
const picIt = await pic(p, T + 'b-typed')
await K.closeBoard(p)
const d2 = await K.dayState(p, SAT, T + 'b-day')
const o2 = await K.oilOf(p, ID, K.SAT, T + 'b-typed')
let h2 = null
if (!PH) h2 = await K.insightsOf(p, T + 'b-insights')
judge(T + '.2', 'on the working copy: "+ In-time / Rally", the line typed IN TIME 08:30', [
  ['the + button put a line in', it.first.length === 1, it.first], ['the line reads 08:30', it.after.length === 1 && /08:?30/.test(it.after[0]), it.after],
  ['the day reads 1 pending (waiting chip)', d2.pend === '1', d2.head.pending],
  ['the sign-offs fell', K.signsFall(d2.head), d2.head.signs],
  ['paid HO holds in the cell', o2.letters === 'HO', o2.cell.text], ['worked holds 09:00–15:00', /09:00.15:00/.test(o2.row), o2.row.slice(0, 160)],
  ['balance holds', o2.bal === o1.bal, { was: o1.bal, now: o2.bal }]], [picIt, ...d2.pics, ...o2.pics])
row(T + '.2-list', 'To go out list words after typing', d2.list || '(no list)', 'RECORDED', d2.pics)
if (h2) row('H-03.b', 'Insights → Work hours for Ranger with IN TIME 08:30 typed (working copy, not yet amended)', K.hrs(h2), 'RECORDED', [h2.pic])

/* amend */
const am = await K.publishAm(p, SAT); await K.closeBoard(p)
const o3 = await K.oilOf(p, ID, K.SAT, T + 'c-am')
const d3 = await K.dayState(p, SAT, T + 'c-day')
let h3 = null
if (!PH) h3 = await K.insightsOf(p, T + 'c-insights')
judge(T + '.3', 'the four sign again; Publish AL', [
  ['AL1', am.head && /AL\s*1/.test(am.head.tag), am.head && am.head.tag],
  ['FO', o3.letters === 'FO', o3.cell.text], ['worked 08:30–15:00', /08:30.15:00/.test(o3.row), o3.row.slice(0, 160)],
  ['balance +1 over baseline', !!base.bal && +o3.bal === +base.bal + 1, { base: base.bal, now: o3.bal }],
  ['nothing pending', d3.pend === '0', d3.head.pending]], [...o3.pics, ...d3.pics])
if (h3) row('H-03.c', 'Insights → Work hours for Ranger after the amendment (IN TIME 08:30 published)', K.hrs(h3), 'RECORDED', [h3.pic])
console.log('ERRORS', JSON.stringify(errors))
savePart('ows-B-' + T, { errors })
await browser.close()
