import * as C from './it-C-lib.mjs'
const { row, sleep } = C
const size = 'desk'
const w = await C.world(size, 'ad', { fresh: false })
const p = w.page
const rg = await C.pid(p, 'Ranger')
const pics = []
const sc = await C.scShift(w, 4, rg)
console.log('SC', JSON.stringify(sc))
await C.fileNew(w, { iso: '2026-07-17', type: 'Event', person: rg, s: '10:00', e: '11:00', rmk: 'c50' })
const R = await C.recBy(p, { remarks: 'c50' })
const state = async (label) => {
  const all = await C.warnAll(p, 4)
  const mine = all.filter(x => x.code !== 'CREW_REST')
  const rec = await C.recBy(p, { remarks: 'c50' })
  await C.openBoard(w, 4)
  const side = (await C.warnLines(p)).filter(x => /clash|advis|overlap|&|called/i.test(x) && !/Crew rest/.test(x)).slice(0, 4)
  const ring = await p.evaluate(() => { const s = document.querySelector('#schedBoard [data-slot="4.0.0.0.p"] .puck'); return s ? (s.className.replace(/\s+/g, ' ') + ' | ' + (s.title || '')) : 'no puck' })
  await C.closeBoard(p)
  const wh = await C.workHours(w)
  return { label, rules: mine.map(x => `${x.sev}/${x.code}: ${x.msg}`), side, ring, wh, s: rec.s, e: rec.e, type: rec.type, title: rec.title, person: rec.person, hasTitle: rec.hasTitle }
}
const results = []
const ctl = await state('control (untitled Event)'); results.push(ctl)
console.log(JSON.stringify(ctl))
pics.push(await C.pic(w, 's50-control'))
const TITLES = ['Meeting', 'Training', 'SC', 'Brief', 'Off', 'Event', 'OD', 'Ranger', '08:00']
const sig = r => r.rules.map(x => x.split(':')[0]).join(',')
const bad = []
for (const t of TITLES) {
  await C.winRetitle(w, '2026-07-17', R.iid, { title: t })
  const s = await state('Event titled ' + t); results.push(s)
  console.log(JSON.stringify(s))
  const sameSev = sig(s) === sig(ctl)
  const sameTimes = s.s === ctl.s && s.e === ctl.e && s.person === ctl.person && s.type === 'Event'
  const sameWH = s.wh === ctl.wh
  if (!sameSev || !sameTimes || !sameWH) bad.push(`${t}: sev ${sig(s)} vs ${sig(ctl)}, times ${s.s}-${s.e}, person ${s.person}, type ${s.type}, wh ${s.wh}`)
  if (t === 'Meeting' || t === 'Off') pics.push(await C.pic(w, 's50-title-' + t.replace(/\W/g, '')))
}
// now a Meeting kind
await C.winRetitle(w, '2026-07-17', R.iid, { title: '', type: 'Meeting' })
await C.winRetitle(w, '2026-07-17', R.iid, { title: 'Meeting' })
const mctl = await state('Meeting kind, title untouched/own name')
console.log(JSON.stringify(mctl))
pics.push(await C.pic(w, 's50-meeting-control'))
const mres = [mctl]
const mbad = []
for (const t of ['Training', 'Event']) {
  await C.winRetitle(w, '2026-07-17', R.iid, { title: t })
  const s = await state('Meeting titled ' + t); mres.push(s); console.log(JSON.stringify(s))
  if (sig(s) !== sig(mctl) || s.type !== 'Meeting') mbad.push(`${t}: ${sig(s)} vs ${sig(mctl)}`)
  pics.push(await C.pic(w, 's50-meeting-title-' + t))
}
const sevOf = r => r.rules.filter(x => /DOUBLE|clash|OVERLAP|ADVIS/i.test(x)).join(' ; ')
row(50, size, 'admin', (ctl.rules.some(x => /^hard\/DOUBLE_BOOK/.test(x)) && bad.length === 0 && mbad.length === 0 && /^soft|^advis|^info|amber|^warn/i.test(mctl.rules.find(x => !/CREW_REST/.test(x)) || '')) ? 'PASS' : 'CHECK',
  `Ranger on SC AM (07:00-13:00) Fri 17 Jul. Untitled Event 10:00-11:00: ${ctl.rules.filter(x => !/CREW_REST/.test(x)).join(' ; ')}. Titles ${TITLES.join(', ')} -> ${results.slice(1).map(r => r.label.replace('Event titled ', '') + ': ' + r.rules.filter(x => !/CREW_REST/.test(x)).join(' ; ')).join(' | ')}. As a Meeting: ${mctl.rules.filter(x => !/CREW_REST/.test(x)).join(' ; ')}; titled Training/Event: ${mres.slice(1).map(r => r.rules.filter(x => !/CREW_REST/.test(x)).join(' ; ')).join(' | ')}. Work hours (Insights, Ranger): ${ctl.wh} all the same? ${results.every(r => r.wh === ctl.wh)}. Differences vs control: ${bad.concat(mbad).join(' || ') || 'none'}`, pics)
await C.finish(w, 's50')
