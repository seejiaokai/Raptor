import * as H from './cal-A-lib2.mjs'
const { tid, sleep, eq } = H
const SIZE = process.env.SIZE || 'desk'
const w = await H.world(SIZE)
const o = {}
const TH = ['2026-07-09', '2026-07-16', '2026-07-23', '2026-07-30', '2026-08-06', '2026-08-13', '2026-08-20']
async function everyThursday(cls, from, until) {
  await H.calGoto(w, '2026-07-16')
  await w.press(tid(w.page, 'days-wd-3')); await tid(w.page, 'win-every').waitFor(); await sleep(400)
  await w.press(tid(w.page, 'every-cls-' + cls))
  await tid(w.page, 'every-from').fill(from)
  if (until) { await w.press(tid(w.page, 'every-until-date')); await tid(w.page, 'every-until').fill(until) }
  await sleep(250)
  const says = (await tid(w.page, 'every-says').innerText()).replace(/\s+/g, ' ').trim()
  const pic = await H.pic(w, 'p109-every-' + cls)
  await w.press(tid(w.page, 'every-save')); await sleep(700)
  const err = (await tid(w.page, 'every-err').count()) ? (await tid(w.page, 'every-err').innerText()).trim() : null
  return { says, err, closed: (await tid(w.page, 'win-every').count()) === 0, pic }
}
const reads = async () => { const r = {}; for (const d of TH) { const c = await H.calRead(w, d); r[d.slice(5)] = c ? c.lit + (c.dot ? '*' : '') : null } return r }
const readCal = async () => { const r = {}; for (const m of ['2026-07-16', '2026-08-13']) { await H.calGoto(w, m); for (const d of TH.filter(x => x.slice(0, 7) === m.slice(0, 7))) { const c = await H.calRead(w, d); r[d.slice(5)] = c.lit + (c.dot ? '*' : '') } } return r }
await H.calOpenFromWar(w)
o.before = await readCal()
o.rule1 = await everyThursday('night', '2026-07-16', null)
o.rule2 = await everyThursday('nf', '2026-07-23', '2026-08-06')
o.afterRules = await readCal()
o.facts1 = {}; for (const d of TH) { const a = (await H.bridge(w, d)).a; o.facts1[d.slice(5)] = a.cls + ':' + a.clsFrom }
const pA = await H.pic(w, 'p109-cal-aug-after-rules')
// the one-date exception: Thu 30 Jul back to day flying
await H.calSet(w, '2026-07-30', 'day')
o.afterException = await readCal()
o.facts2 = {}; for (const d of TH) { const a = (await H.bridge(w, d)).a; o.facts2[d.slice(5)] = a.cls + ':' + a.clsFrom }
await H.calGoto(w, '2026-07-30')
const pB = await H.pic(w, 'p109-cal-jul-after-exception')
await H.calClose(w)
// the SANS months
await H.openSans(w); await H.sansGoto(w, '2026-07-09')
o.sans = {}
for (const d of TH.slice(0, 4)) { const c = await H.sansCell(w, d); o.sans[d.slice(5)] = (c.tag || c.icon) }
const pC = await H.pic(w, 'p109-sans-jul')
await H.sansGoto(w, '2026-08-06')
for (const d of TH.slice(4)) { const c = await H.sansCell(w, d); o.sans[d.slice(5)] = (c.tag || c.icon) }
const pD = await H.pic(w, 'p109-sans-aug')
const L = x => ['07-09', '07-16', '07-23', '07-30', '08-06', '08-13', '08-20'].map(k => k + '=' + x[k]).join(' ')
H.judge('P1-09', `${SIZE}: Calendar > a weekday's heading "Thu": Every Thursday night from 16 Jul (no end); then Every Thursday no-fly from 23 Jul to 6 Aug (ending on a Thursday); then Thu 30 Jul set to day flying by itself; read on the Calendar months, the resolver's class and the SANS months`, [
  ['both rules saved (form closed, no error)', o.rule1.closed && !o.rule1.err && o.rule2.closed && !o.rule2.err, [o.rule1.says.slice(0, 120), o.rule2.says.slice(0, 120)]],
  ['before any rule: all Thursdays are day flying (D)', Object.values(o.before).every(v => v === 'D'), o.before],
  ['Thursdays before the later rule: 9 Jul day (before rule 1), 16 Jul night', o.afterRules['07-09'] === 'D' && o.afterRules['07-16'] === 'N', L(o.afterRules)],
  ['inside the bounded rule: 23 Jul, 30 Jul NF; the end date 6 Aug (inclusive) NF', o.afterRules['07-23'] === 'NF' && o.afterRules['07-30'] === 'NF' && o.afterRules['08-06'] === 'NF', L(o.afterRules)],
  ['after the bounded rule: 13 Aug and 20 Aug fall back to the night rule', o.afterRules['08-13'] === 'N' && o.afterRules['08-20'] === 'N', L(o.afterRules)],
  ['the one-date exception: 30 Jul reads D with the dot; 23 Jul and 6 Aug still NF; 13 Aug still N', o.afterException['07-30'] === 'D*' && o.afterException['07-23'] === 'NF' && o.afterException['08-06'] === 'NF' && o.afterException['08-13'] === 'N', L(o.afterException)],
  ['the resolver agrees (30 Jul is the date\'s own day class; others from the rules)', o.facts2['07-30'].startsWith('day:date') && o.facts2['07-23'].startsWith('nf') && o.facts2['08-13'].startsWith('night'), o.facts2],
  ['SANS months agree: 9 Jul sun, 16 Jul moon, 23 Jul NF, 30 Jul sun, 6 Aug NF, 13 Aug moon', o.sans['07-09'] === 'day' && o.sans['07-16'] === 'night' && o.sans['07-23'] === 'NF' && o.sans['07-30'] === 'day' && o.sans['08-06'] === 'NF' && o.sans['08-13'] === 'night', o.sans],
  ['no console or page errors', w.errors.length === 0, w.errors],
], [o.rule1.pic, o.rule2.pic, pA, pB, pC, pD])
H.savePart('P1-09-' + SIZE, { out: o })
await H.closeAll(w)
