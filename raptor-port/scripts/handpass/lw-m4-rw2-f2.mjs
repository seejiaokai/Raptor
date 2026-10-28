// Re-walk 2 F2 — Undo and Redo after a change of mind (M3): Approve, ONE tap Refuse, Undo, Undo, Redo, Redo; the line and the record each time.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk2'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L, lineLoc, approveBtn, refuseBtn, pressLoc, lineInfo, shotLine, topbarUndo, topbarRedo } = A
const { T, rec, shot, txt, vis, press } = L
console.log('[lw-m4-rw2-f2 v1]')
const w = await L.newCtx('desk'); const P = w.page
const D = 'Mon 2 Feb', WHO = 'slash', ISO = '2026-02-02'
const record = () => P.evaluate(id => { const e = document.querySelector(`[data-testid="${id}"]`); return e ? [...e.querySelectorAll('.c')].map(c => (c.className.match(/\bs-(\w+)/)?.[1] || '?')).join(',') : 'no-cell' }, L.cellId(WHO, ISO))
const lit = i => /lit-(\w+)/.exec(i.cls)?.[1] || 'none'
async function read(tag, pic) {
  const i = await lineInfo(P, D)
  if (pic) await shotLine(w, 'f2-' + pic, D)
  const row = { tag, lit: lit(i), ok: i.ok.p, no: i.no.p, okT: i.ok.t, noT: i.no.t, rec: await record(), head: await txt(P, T('appr-sub')) }
  console.log(JSON.stringify(row)); return row
}
try {
  await L.signIn(w, 'admin')
  await L.openApprovals(w)
  const s0 = await read('pending', '0-pending')
  await pressLoc(w, approveBtn(P, D)); await P.waitForTimeout(500)
  const s1 = await read('approved', '1-approved')
  await pressLoc(w, refuseBtn(P, D)); await P.waitForTimeout(500)
  const s2 = await read('ONE tap Refuse', '2-refused')
  await topbarUndo(w)
  const s3 = await read('Undo 1', '3-undo1'); await shot(w, 'f2-3-undo1-page')
  await topbarUndo(w)
  const s4 = await read('Undo 2', '4-undo2')
  await topbarRedo(w)
  const s5 = await read('Redo 1', '5-redo1')
  const undoDis = await P.evaluate(() => ({ u: document.querySelector('#undoBtn')?.disabled, r: document.querySelector('#redoBtn')?.disabled }))
  console.log('buttons after Redo 1', JSON.stringify(undoDis))
  await topbarRedo(w)
  const s6 = await read('Redo 2', '6-redo2'); await shot(w, 'f2-6-redo2-page')
  const recOK = s0.rec !== 'no-cell'
  console.log('record readable from the hidden grid:', recOK)
  rec('F2.1 Undo once after approve→refuse: the line shows lit "Approved" again', 'desk', s3.lit === 'approved' && s3.ok === 'true' ? 'PASS' : 'FAIL', JSON.stringify(s3), ['f2-3-undo1', 'f2-3-undo1-page'])
  rec('F2.2 …and the record agrees (the grid cell: approved)', 'desk', !recOK ? 'NOT WALKED' : (/\ba\b/.test(s3.rec) || s3.rec === 'a' ? 'PASS' : 'FAIL'), `rec: pending=${s0.rec} approved=${s1.rec} refused=${s2.rec} undo1=${s3.rec}`, [])
  rec('F2.3 Undo again: pending', 'desk', s4.lit === 'none' && s4.ok === 'false' && s4.no === 'false' ? 'PASS' : 'FAIL', JSON.stringify(s4), ['f2-4-undo2'])
  rec('F2.4 …record agrees (pending)', 'desk', !recOK ? 'NOT WALKED' : (s4.rec === s0.rec ? 'PASS' : 'FAIL'), `rec pending=${s0.rec} undo2=${s4.rec}`, [])
  rec('F2.5 Redo: lit "Approved", both buttons working', 'desk', s5.lit === 'approved' && s5.ok === 'true' && s5.no === 'false' ? 'PASS' : 'FAIL', JSON.stringify(s5) + ' ' + JSON.stringify(undoDis), ['f2-5-redo1'])
  rec('F2.6 Redo: lit "Refused"; record agrees', 'desk', s6.lit === 'refused' && s6.no === 'true' && s6.rec === s2.rec ? 'PASS' : 'FAIL', JSON.stringify(s6) + ' refusedRecord=' + s2.rec, ['f2-6-redo2', 'f2-6-redo2-page'])
  // both buttons still work after the redos: tap the lit Refused -> pending
  await pressLoc(w, refuseBtn(P, D)); await P.waitForTimeout(500)
  const s7 = await read('tap lit Refused after redos', '7-after-redos-tap')
  rec('F2.7 after the redos a tap on the lit button still works', 'desk', s7.lit === 'none' ? 'PASS' : 'FAIL', JSON.stringify(s7), ['f2-7-after-redos-tap'])
} catch (e) { rec('ERROR', 'desk', 'FAIL', String(e).slice(0, 400)); await shot(w, 'f2-error').catch(() => {}) }
if (w.errs.length) rec('console', 'desk', 'FAIL', w.errs.join(' || ').slice(0, 600))
await w.ctx.close(); L.writeResults('f2'); await L.closeBrowser(); console.log('DONE')
