// Walker a — A3 (a kind change that adds or drops what a kind has; RECORD) and A4 (a real rename). One world each.
// Run: node scripts/handpass/wr4-a-a34.mjs [run] [A3,A4]
import { setup } from './wr4-a-common.mjs'
console.log('wr4-a-a34 v1')
const RUN = process.argv[2] || 'a34-r1'
const ONLY = (process.argv[3] || '').split(',').filter(Boolean)
const { L, A } = await setup(RUN)
const { newPage, signIn, handOver, fileInput, editInput, recOf, bundleOf, log, press, RANGER } = L
const span = (w, m) => press(w, `#inpEditSpan [data-span="${m}"]`)
const kind = (w, k) => w.page.selectOption('#inpEditPop #inpEditType', k)
const ME = { people: [RANGER] }
async function world(c, ownFilings, saberFilings, edits, reads) {
  let w = await newPage('desk'); await signIn(w, 'us')
  log(c, 'bundle ' + await bundleOf(w.page))
  const m = {}
  for (const [k, iso, spec, own] of ownFilings) { m[k] = await fileInput(w, c, iso, spec); if (m[k] && own) await editInput(w, c, m[k], iso, () => own(w)) }
  w = await handOver(w, 'desk', 'ad')
  for (const [k, iso, spec] of saberFilings) m[k] = await fileInput(w, c, iso, { ...ME, ...spec })
  for (const [k, iso, fn, tag] of edits) {
    if (!m[k]) { A.judge(c, `${tag} fixture`, false, 'not filed'); continue }
    const b = await recOf(w.page, m[k]); await editInput(w, c, m[k], iso, () => fn(w)); const a = await recOf(w.page, m[k])
    A.judge(c, `${tag}: saved input before → after`, null, { before: b, after: a })
  }
  for (const size of ['phone', 'desk']) {
    w = await handOver(w, size, 'us')
    const r = await A.bell(w, c, 'ranger-bell')
    for (const [tag, pick, want] of reads) {
      const ls = r.filter(pick).map(l => `${l.name} ${l.day} / ${l.what}`)
      A.judge(c, `${size}: ${tag}` + (want ? ` — "${want}"` : ' (RECORD)'), want ? r.some(l => pick(l) && l.what === want) : null, ls)
    }
  }
  await w.ctx.close()
}
const notAdded = d => l => l.day === d && !/You were added/.test(l.what)
try {
  if (!ONLY.length || ONLY.includes('A3')) await world('A3',
    [['b', '2026-07-13', { type: 'LL', span: 'all' }], ['d', '2026-07-16', { type: 'LL', span: 'all' }],
     ['e', '2026-07-17', { type: 'Attach', title: 'Exercise Kite' }, w => w.page.fill('#inpEditPop #inpEditTo', '145 Sqn')]],
    [['a', '2026-07-15', { type: 'Training', from: '09:00', to: '10:00', title: 'Range brief' }], ['c', '2026-07-14', { type: 'Training', from: '00:00', to: '12:00' }]],
    [['a', '2026-07-15', w => kind(w, 'LL'), '(a) Training "Range brief" → LL'],
     ['b', '2026-07-13', w => span(w, 'am'), '(b) save 1: LL made AM'],
     ['b', '2026-07-13', w => kind(w, 'Training'), '(b) save 2: AM LL → Training'],
     ['c', '2026-07-14', w => kind(w, 'LL'), '(c) Training 00:00–12:00 → LL'],
     ['d', '2026-07-16', async w => { await kind(w, 'OL'); await span(w, 'am') }, '(d) all-day LL → OL and AM'],
     ['e', '2026-07-17', w => kind(w, 'Training'), '(e) Attach with a "To" → Training']],
    [['(a)', notAdded('Wed 15 Jul')], ['(b) both saves', l => l.day === 'Mon 13 Jul'], ['(c)', notAdded('Tue 14 Jul')], ['(d)', l => l.day === 'Thu 16 Jul'], ['(e)', l => l.day === 'Fri 17 Jul']])
  if (!ONLY.length || ONLY.includes('A4')) await world('A4',
    [['to', '2026-07-23', { type: 'Attach', title: 'Exercise Kite' }, w => w.page.fill('#inpEditPop #inpEditTo', '145 Sqn')],
     ['tonew', '2026-07-24', { type: 'Attach', title: 'Exercise Hawk' }]],
    [['ren', '2026-07-20', { type: 'Training', from: '09:00', to: '10:00', title: 'Training' }], ['give', '2026-07-21', { type: 'Training', from: '09:00', to: '10:00' }],
     ['take', '2026-07-22', { type: 'Training', from: '09:00', to: '10:00', title: 'Brief' }]],
    [['ren', '2026-07-20', w => w.page.fill('#inpEditPop #inpEditOwnTitle', 'Range brief'), 'rename "Training" → "Range brief"'],
     ['give', '2026-07-21', w => w.page.fill('#inpEditPop #inpEditOwnTitle', 'Sim'), 'a title given ("Sim")'],
     ['take', '2026-07-22', w => w.page.fill('#inpEditPop #inpEditOwnTitle', ''), 'a title taken away ("Brief")'],
     ['to', '2026-07-23', w => w.page.fill('#inpEditPop #inpEditTo', '146 Sqn'), 'an Attach\'s "To" changed 145 Sqn → 146 Sqn'],
     ['tonew', '2026-07-24', w => w.page.fill('#inpEditPop #inpEditTo', '145 Sqn'), 'an Attach given a "To"']],
    [['rename', notAdded('Mon 20 Jul'), 'Renamed — was Training · Saber'], ['title given', notAdded('Tue 21 Jul')], ['title taken away', notAdded('Wed 22 Jul')],
     ['"To" changed', l => l.day === 'Thu 23 Jul'], ['"To" given', l => l.day === 'Fri 24 Jul']])
} catch (e) { L.facts.errors.push('A34: ' + String(e && e.stack || e).slice(0, 500)); log('A34', 'ERROR ' + String(e.message || e)) }
await A.done(RUN)
