// Scenario 28 - Publish, then title. usage: node it-B-s28.mjs desk|phone
import * as L from './it-B-lib.mjs'
const size = process.argv[2] || 'desk'
const DI = 2, ISO = '2026-07-15'

async function build(W, ranger) {
  await L.fileInput(W, { iso: ISO, type: 'Event', person: ranger, s: '09:00', e: '10:00', rmk: 'untitled event' })
  const r = await L.recBy(W.page, { person: ranger, type: 'Event' })
  const pub = await L.pubDay(W, DI)
  return { iid: r.iid, pub }
}

for (const variant of ['A', 'B']) {
  const W = await L.mk(size)
  const p = W.page
  const ranger = await L.csId(p, 'Ranger')
  const tag = `s28-${size}-${variant}`
  const { iid, pub } = await build(W, ranger)
  const s0 = await L.snap(W, DI, { focus: 'sports day|^event$', pic: tag + '-0published' })
  console.log('published:', JSON.stringify(pub), L.brief(s0))
  await L.retitle(W, iid, ISO, 'Sports day')
  const s1 = await L.snap(W, DI, { focus: 'sports day|^event$', pic: tag + '-1retitled' })
  console.log('S1 retitled:', L.brief(s1))
  const ok1 = s1.f.pend.length === 1 && /1 pending/.test(s1.f.pend[0]) && /not yet signed/i.test(s1.f.nys) && s1.f.rows[0]?.name === 'SPORTS DAY' && s1.f.rows[0]?.kind === 'EVENT'
    && s1.v.rows[0]?.name === 'EVENT' && !s1.v.rows[0]?.kind && /Ranger/.test(s1.togo || '') && /Event/.test(s1.togo || '') && /Sports day/.test(s1.togo || '')
  const ok0 = !s0.f.pend.length && !s0.f.nys && s0.f.rows[0]?.name === 'EVENT' && !s0.f.rows[0]?.kind
  L.row('28', size, 'admin', ok0 && ok1 ? 'PASS' : 'FAIL', `[${variant}] published then retitled: ${L.brief(s1)}`, [tag + '-1retitled-edit.png', tag + '-1retitled-togo.png', tag + '-1retitled-view.png'])
  if (!(ok0 && ok1)) console.log('ok0', ok0, 'ok1', ok1)
  const u = await L.undo(W)
  const s2 = await L.snap(W, DI, { focus: 'sports day|^event$', pic: tag + '-2undo' })
  console.log('undo', JSON.stringify(u), L.brief(s2))
  if (variant === 'A') {
    const ok2 = u.pressed && !s2.f.pend.length && !s2.f.nys && s2.f.rows[0]?.name === 'EVENT' && !s2.f.rows[0]?.kind && s2.f.signedLn && s2.v.rows[0]?.name === 'EVENT'
    L.row('28', size, 'admin', ok2 ? 'PASS' : 'FAIL', `[A] Undo: ${L.brief(s2)}`, [tag + '-2undo-edit.png'])
    const rd = await L.redo(W)
    const s3 = await L.snap(W, DI, { focus: 'sports day|^event$', pic: tag + '-3redo' })
    const ok3 = rd.pressed && s3.f.pend.length === 1 && /not yet signed/i.test(s3.f.nys) && s3.f.rows[0]?.name === 'SPORTS DAY' && s3.v.rows[0]?.name === 'EVENT'
    L.row('28', size, 'admin', ok3 ? 'PASS' : 'FAIL', `[A] Redo: ${L.brief(s3)}`, [tag + '-3redo-edit.png'])
    await L.reload(W)
    const s4 = await L.snap(W, DI, { focus: 'sports day|^event$', pic: tag + '-4reload' })
    const ok4 = s4.f.pend.length === 1 && /not yet signed/i.test(s4.f.nys) && s4.f.rows[0]?.name === 'SPORTS DAY' && s4.f.rows[0]?.kind === 'EVENT' && s4.v.rows[0]?.name === 'EVENT'
    L.row('28', size, 'admin', ok4 ? 'PASS' : 'FAIL', `[A] after reload: ${L.brief(s4)}`, [tag + '-4reload-edit.png'])
  } else {
    await L.reload(W)
    const s4 = await L.snap(W, DI, { focus: 'sports day|^event$', pic: tag + '-4reload' })
    const ok4 = !s4.f.pend.length && !s4.f.nys && s4.f.rows[0]?.name === 'EVENT' && !s4.f.rows[0]?.kind && s4.v.rows[0]?.name === 'EVENT'
    L.row('28', size, 'admin', ok4 ? 'PASS' : 'FAIL', `[B] Undo then reload: ${L.brief(s4)}`, [tag + '-4reload-edit.png'])
  }
  await W.browser.close()
}
L.saveRows('s28-' + size)
console.log('ERRORS', L.ERRS)
