// Scenario 33 - OD without a programme row. usage: node it-B-s33.mjs desk|phone
import * as L from './it-B-lib.mjs'
const size = process.argv[2] || 'desk'
const DI = 2, ISO = '2026-07-15'
const has = (arr, name, kind) => (arr || []).some(x => x.name === name && (kind === undefined || x.kind === kind))
const FOC = 'overseas visit|detachment visit'
for (const variant of ['A', 'B']) {
  const W = await L.mk(size)
  const p = W.page
  const ranger = await L.csId(p, 'Ranger')
  const tag = `s33-${size}-${variant}`
  await L.fileInput(W, { iso: ISO, type: 'OD', person: ranger, title: 'Overseas visit', rmk: 'od title test' })
  const r = await L.recBy(p, { person: ranger, type: 'OD' })
  console.log('record', JSON.stringify(r))
  const pub = await L.pubDay(W, DI)
  const s0 = await L.snap(W, DI, { focus: FOC, pic: tag + '-0published' })
  console.log('published', JSON.stringify(pub), L.brief(s0))
  const ok0 = !s0.f.pend.length && !s0.f.nys && has(s0.f.unav, 'Overseas visit', 'OD') && !s0.f.rows.length
  await L.retitle(W, r.iid, ISO, 'Detachment visit')
  const rd = async t => { const S = await L.snap(W, DI, { focus: FOC, pic: t }); return { s: S, text: L.brief(S), pics: [t + '-edit.png', t + '-togo.png', t + '-view.png'].filter((x, i) => i !== 1 || S.togo) } }
  const applied = S => S.f.pend.length === 1 && /1 pending/.test(S.f.pend[0]) && /not yet signed/i.test(S.f.nys) && has(S.f.unav, 'Detachment visit', 'OD') && has(S.v.unav, 'Overseas visit', 'OD') && !has(S.v.unav, 'Detachment visit') && !S.f.rows.length && (S.togo === null || (/Overseas visit/.test(S.togo) && /Detachment visit/.test(S.togo)))
  const reverted = S => !S.f.pend.length && !S.f.nys && has(S.f.unav, 'Overseas visit', 'OD') && has(S.v.unav, 'Overseas visit', 'OD') && S.f.signedLn
  const s1 = await rd(tag + '-1retitled')
  const okTogo = /Overseas visit/.test(s1.s.togo || '') && /Detachment visit/.test(s1.s.togo || '')
  L.row('33', size, 'admin', ok0 && applied(s1.s) && okTogo ? 'PASS' : 'FAIL', `[${variant}] OD published (before: ${L.brief(s0)}); retitled: ${s1.text}`, [tag + '-0published-edit.png', ...s1.pics])
  await L.checkpoint(W, variant, { n: '33', tag, read: rd, applied, reverted })
  await W.browser.close()
}
L.saveRows('s33-' + size)
console.log('ERRORS', L.ERRS)
