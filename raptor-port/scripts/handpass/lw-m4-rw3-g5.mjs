// Re-walk 3 G5 — three changes of mind (desktop): Approve, Refuse, Approve, then Undo, Undo, Redo, Redo; the line and the record each time.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk3'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L, pressLoc, lineInfo, approveBtn, refuseBtn, shotLine, topbarUndo, topbarRedo } = A
const { T, rec, shot, txt } = L
console.log('[lw-m4-rw3-g5 v1]')
const w = await L.newCtx('desk'); const P = w.page
const D = 'Mon 2 Feb', WHO = 'slash', ISO = '2026-02-02'
const record = () => P.evaluate(id => { const e = document.querySelector(`[data-testid="${id}"]`); return e ? [...e.querySelectorAll('.c')].map(c => (c.className.match(/\bs-(\w+)/)?.[1] || '?')).join(',') : 'no-cell' }, L.cellId(WHO, ISO))
const lit = i => /lit-(\w+)/.exec(i.cls)?.[1] || 'none'
async function read(tag, pic) {
  const i = await lineInfo(P, D)
  await shotLine(w, 'g5-' + pic, D)
  const row = { tag, lit: lit(i), ok: i.ok.p, no: i.no.p, okDis: i.ok.dis, noDis: i.no.dis, okT: i.ok.t, noT: i.no.t, rec: await record(), head: await txt(P, T('appr-sub')) }
  console.log(JSON.stringify(row)); return row
}
try {
  await L.signIn(w, 'admin'); await L.openApprovals(w)
  const s0 = await read('pending', '0-pending')
  await pressLoc(w, approveBtn(P, D)); await P.waitForTimeout(500); const s1 = await read('Approve', '1-approved')
  await pressLoc(w, refuseBtn(P, D)); await P.waitForTimeout(500); const s2 = await read('Refuse (one tap)', '2-refused')
  await pressLoc(w, approveBtn(P, D)); await P.waitForTimeout(500); const s3 = await read('Approve (third)', '3-approved-again')
  await topbarUndo(w); const u1 = await read('Undo 1', '4-undo1'); await shot(w, 'g5-4-undo1-page')
  await topbarUndo(w); const u2 = await read('Undo 2', '5-undo2'); await shot(w, 'g5-5-undo2-page')
  await topbarRedo(w); const r1 = await read('Redo 1', '6-redo1'); await shot(w, 'g5-6-redo1-page')
  await topbarRedo(w); const r2 = await read('Redo 2', '7-redo2'); await shot(w, 'g5-7-redo2-page')
  const recOK = s0.rec !== 'no-cell'
  const bothWork = r => r.okDis === false && r.noDis === false
  rec('G5.1 the three presses: Approved, Refused, Approved', 'desk', s1.lit === 'approved' && s2.lit === 'refused' && s3.lit === 'approved' ? 'PASS' : 'FAIL', `${s1.lit} / ${s2.lit} / ${s3.lit}; records ${s1.rec} / ${s2.rec} / ${s3.rec}`, ['g5-1-approved', 'g5-2-refused', 'g5-3-approved-again'])
  rec('G5.2 Undo once: the line shows the middle state lit "Refused", record agrees', 'desk', u1.lit === 'refused' && u1.no === 'true' && (!recOK || u1.rec === s2.rec) ? 'PASS' : 'FAIL', JSON.stringify(u1) + ' middle-record ' + s2.rec, ['g5-4-undo1', 'g5-4-undo1-page'])
  rec('G5.3 Undo, Undo: lit "Approved", both buttons working, record agrees', 'desk', u2.lit === 'approved' && u2.ok === 'true' && bothWork(u2) && (!recOK || u2.rec === s1.rec) ? 'PASS' : 'FAIL', JSON.stringify(u2) + ' approved-record ' + s1.rec, ['g5-5-undo2', 'g5-5-undo2-page'])
  rec('G5.4 Redo: lit "Refused", record agrees', 'desk', r1.lit === 'refused' && r1.no === 'true' && bothWork(r1) && (!recOK || r1.rec === s2.rec) ? 'PASS' : 'FAIL', JSON.stringify(r1), ['g5-6-redo1', 'g5-6-redo1-page'])
  rec('G5.5 Redo: lit "Approved", record agrees', 'desk', r2.lit === 'approved' && r2.ok === 'true' && bothWork(r2) && (!recOK || r2.rec === s3.rec) ? 'PASS' : 'FAIL', JSON.stringify(r2), ['g5-7-redo2', 'g5-7-redo2-page'])
  // both buttons still do their job after all that
  await pressLoc(w, refuseBtn(P, D)); await P.waitForTimeout(500); const f1 = await read('Refuse after redos', '8-refuse-after')
  await pressLoc(w, approveBtn(P, D)); await P.waitForTimeout(500); const f2 = await read('Approve after redos', '9-approve-after')
  rec('G5.6 after the redos both buttons still work', 'desk', f1.lit === 'refused' && f2.lit === 'approved' ? 'PASS' : 'FAIL', `${f1.lit} then ${f2.lit}`, ['g5-8-refuse-after', 'g5-9-approve-after'])
} catch (e) { rec('ERROR', 'desk', 'FAIL', String(e).slice(0, 400)); await shot(w, 'g5-error').catch(() => {}) }
if (w.errs.length) rec('console', 'desk', 'FAIL', w.errs.join(' || ').slice(0, 400))
await w.ctx.close(); L.writeResults('g5'); await L.closeBrowser(); console.log('DONE')
