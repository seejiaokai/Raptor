// Walker d — D2: nothing else moved (fixed build). One world: Saber files and changes; Ranger reads on the phone, then
// the desktop. Run: node scripts/handpass/wr4-d-d2.mjs [run]
import { setup } from './wr4-d-common.mjs'
console.log('wr4-d-d2 v1')
const RUN = process.argv[2] || 'd2-r1'
const { L, A } = await setup(RUN)
const { newPage, signIn, handOver, fileInput, editInput, recOf, bundleOf, log, press, RANGER, HEX } = L
const c = 'D2'
const TR = title => ({ type: 'Training', people: [RANGER, HEX], from: '09:00', to: '10:00', ...(title != null ? { title } : {}) })
const kind = (w, k) => w.page.selectOption('#inpEditPop #inpEditType', k)
const title = (w, t) => w.page.fill('#inpEditPop #inpEditOwnTitle', t)
// [key, filed on, spec, edit, the day the line names, expected words (null = RECORD), expected bold name or null]
const CASES = [
  ['Meeting', '2026-07-13', TR('Meeting'), w => kind(w, 'Meeting'), 'Mon 13 Jul', 'Training changed to Meeting · Saber', null],
  ['Brief', '2026-07-14', TR('Brief'), w => kind(w, 'Meeting'), 'Tue 14 Jul', 'Training changed to Meeting · Saber', 'Brief'],
  ['Safety', '2026-07-15', TR('Training · Safety'), w => kind(w, 'Meeting'), 'Wed 15 Jul', 'Training changed to Meeting · Saber', null],
  ['RangeLL', '2026-07-17', TR('Range brief'), w => kind(w, 'LL'), 'Fri 17 Jul', 'Training changed to LL, renamed — was Range brief · Saber', null],
  ['give', '2026-07-20', TR(null), w => title(w, 'Range brief'), 'Mon 20 Jul', 'Renamed — was Training · Saber', null],
  ['brief', '2026-07-21', TR('brief'), w => title(w, 'Brief'), 'Tue 21 Jul', null, null],
  ['LLOL', '2026-07-22', { type: 'LL', people: [RANGER], span: 'all' }, w => kind(w, 'OL'), 'Wed 22 Jul', 'LL changed to OL · Saber', null],
  ['LLAM', '2026-07-23', { type: 'LL', people: [RANGER], span: 'all' }, w => press(w, '#inpEditSpan [data-span="am"]'), 'Thu 23 Jul', 'Now LL (AM) · Saber', null],
  ['three', '2026-07-24', { ...TR('Training'), remarks: 'Bring your kit' }, async w => { await press(w, '#inpEdCal [data-iso="2026-07-16"]'); await title(w, 'Range brief'); await w.page.fill('#inpEditPop #inpEditRmk', 'Bring water') }, 'Thu 16 Jul', 'Now Thu 16 Jul, renamed — was Training, and 1 more change · Saber', null],
]
try {
  let w = await newPage('desk'); await signIn(w, 'ad')
  log(c, 'bundle ' + await bundleOf(w.page))
  const m = {}
  for (const [k, iso, spec] of CASES) m[k] = await fileInput(w, c, iso, spec)
  for (const [k, iso, , edit] of CASES) {
    if (!m[k]) { A.judge(c, k + ' fixture', false, 'not filed'); continue }
    const b = await recOf(w.page, m[k]); await editInput(w, c, m[k], iso, () => edit(w)); const a = await recOf(w.page, m[k])
    log(c, `${k}: before ${JSON.stringify(b)} after ${JSON.stringify(a)}`)
  }
  for (const size of ['phone', 'desk']) {
    w = await handOver(w, size, 'us')
    log(c, `${size} bundle ` + await bundleOf(w.page))
    const r = await A.bell(w, c, 'ranger-bell')
    for (const [k, , , , d, want, bold] of CASES) {
      const ls = r.filter(l => l.day === d && !/You were added/.test(l.what))
      const got = ls.map(l => `${l.name} ${l.day} / ${l.what}`)
      if (want) {
        A.judge(c, `${size}: ${k} — "${want}"`, ls.some(l => l.what === want), got)
        if (want && !/renamed/i.test(want)) A.judge(c, `${size}: ${k} — no "renamed"`, ls.length > 0 && !ls.some(l => /renamed/i.test(l.what)), got)
        if (bold) A.judge(c, `${size}: ${k} — bold name "${bold}"`, ls.some(l => l.name === bold), got)
      } else A.judge(c, `${size}: ${k} (RECORD)`, null, got)
    }
  }
  await w.ctx.close()
} catch (e) { L.facts.errors.push('D2: ' + String(e && e.stack || e).slice(0, 500)); log(c, 'ERROR ' + String(e.message || e)) }
await A.done(RUN)
