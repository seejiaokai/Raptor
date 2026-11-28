// Walker a — A5: the half day (D2521 Q2). Ranger files his leaves; Saber changes each in one save; Ranger reads.
// Run: node scripts/handpass/wr4-a-a5.mjs [run]
import { setup } from './wr4-a-common.mjs'
console.log('wr4-a-a5 v1')
const RUN = process.argv[2] || 'a5-r1'
const { L, A } = await setup(RUN)
const { newPage, signIn, handOver, fileInput, editInput, recOf, bundleOf, log, press, RANGER } = L
const c = 'A5'
const span = m => w => press(w, `#inpEditSpan [data-span="${m}"]`)
const day = iso => w => press(w, `#inpEdCal [data-iso="${iso}"]`)
const has = async (w, sel) => !!(await w.page.locator(sel).count())
// [tag, filed on, spec, edit, the day the line names, expected words or null (RECORD)]
const STEPS = [
  ['all-to-AM', '2026-07-15', { type: 'LL', span: 'all' }, span('am'), 'Wed 15 Jul', 'Now LL (AM) · Saber'],
  ['all-to-PM', '2026-07-13', { type: 'LL', span: 'all' }, span('pm'), 'Mon 13 Jul', 'Now LL (PM) · Saber'],
  ['AM-to-all', '2026-07-14', { type: 'LL', span: 'am' }, span('all'), 'Tue 14 Jul', 'Now all day · Saber'],
  ['all-to-Thu-AM', '2026-07-17', { type: 'LL', span: 'all' }, async w => { await day('2026-07-16')(w); await span('am')(w) }, 'Thu 16 Jul', 'Now Thu 16 Jul (AM) · Saber'],
  ['AM-to-0900-1100', '2026-07-20', { type: 'LL', span: 'am' }, async w => {
    if (!(await has(w, '#inpEditSpan [data-span="custom"]'))) { log(c, 'no custom span on LL'); return }
    await span('custom')(w); await w.page.fill('#inpEditPop #inpEditStart', '09:00'); await w.page.fill('#inpEditPop #inpEditEnd', '11:00')
  }, 'Mon 20 Jul', null],
  ['AM-moved-only', '2026-07-21', { type: 'LL', span: 'am' }, day('2026-07-22'), 'Wed 22 Jul', null],
  ['HL-all-to-AM', '2026-07-23', { type: 'HL', span: 'all' }, span('am'), 'Thu 23 Jul', 'Now HL (AM) · Saber'],
]
try {
  let w = await newPage('desk'); await signIn(w, 'us')
  log(c, 'bundle ' + await bundleOf(w.page))
  const made = {}
  for (const [tag, iso, spec] of STEPS) made[tag] = await fileInput(w, c, iso, spec)
  w = await handOver(w, 'desk', 'ad')
  // the Training typed 00:00-12:00: Saber files it for Ranger
  made.train = await fileInput(w, c, '2026-07-24', { type: 'Training', people: [RANGER], from: '09:00', to: '10:00', title: 'Sim prep' })
  for (const [tag, iso, , edit] of STEPS) {
    if (!made[tag]) { A.judge(c, tag + ' fixture', false, 'not filed'); continue }
    const before = await recOf(w.page, made[tag])
    await editInput(w, c, made[tag], iso, () => edit(w))
    log(c, `${tag}: before ${JSON.stringify(before)} after ${JSON.stringify(await recOf(w.page, made[tag]))}`)
  }
  if (made.train) {
    const before = await recOf(w.page, made.train)
    await editInput(w, c, made.train, '2026-07-24', async () => { await w.page.fill('#inpEditPop #inpEditStart', '00:00'); await w.page.fill('#inpEditPop #inpEditEnd', '12:00') })
    log(c, `train: before ${JSON.stringify(before)} after ${JSON.stringify(await recOf(w.page, made.train))}`)
  }
  for (const size of ['phone', 'desk']) {
    w = await handOver(w, size, 'us')
    const r = await A.bell(w, c, 'ranger-bell')
    for (const [tag, , , , d, want] of STEPS) {
      const ls = r.filter(l => l.day === d).map(l => `${l.name} ${l.day} / ${l.what}`)
      A.judge(c, `${size}: ${tag}` + (want ? ` — "${want}"` : ' (RECORD)'), want ? r.some(l => l.day === d && l.what === want) : null, ls)
    }
    const t = r.filter(l => l.day === 'Fri 24 Jul').map(l => `${l.name} ${l.day} / ${l.what}`)
    A.judge(c, `${size}: Training typed 00:00–12:00 — clock times, never "(AM)"`, t.length ? t.some(s => /00:00/.test(s) && /12:00/.test(s)) && !t.some(s => /\(AM\)/.test(s)) : false, t)
  }
  await w.ctx.close()
} catch (e) { L.facts.errors.push('A5: ' + String(e && e.stack || e).slice(0, 500)); log(c, 'ERROR ' + String(e.message || e)) }
await A.done(RUN)
