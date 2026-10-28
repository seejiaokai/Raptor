// Walker D, script d5: Undo and Redo of a typed figure, a grade change, the grades list, the lock; a reload after each. Admin, desktop, seed.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/d'
process.env.LW_TODAY ||= '2026-01-25'
const D = await import('./lw-m5a-walk-d-lib.mjs')
const { L, note, eq } = D
const { T, press, vis, txt, shot } = L
console.log('[lw-m5a-walk-d-d5 v1]')
const w = await L.newCtx('desk')
const P = w.page
const exp = (label, got, want) => ({ label, got, want, ok: eq(got, want) })
function judge(id, checks, pics, extra = '') {
  const bad = checks.filter(c => !c.ok)
  note(id, 'desk', bad.length ? 'FAIL' : 'PASS', checks.map(c => `${c.label} ${c.got}${c.ok ? '' : ' (expected ' + c.want + ')'}`).join('; ') + (extra ? ' · ' + extra : ''), pics)
}
const undoState = () => P.evaluate(() => ['undoBtn', 'redoBtn'].map(id => { const b = document.getElementById(id); return id.replace('Btn', '') + ' ' + (b ? (b.disabled ? 'off' : 'on') : 'none') }).join(', '))
const lockState = () => P.locator(T('bal-lock')).getAttribute('aria-checked')
const gradeOf = async pid => (await D.balRow(P, pid))?.grade
const gradeRows = async () => { await press(w, T('bal-grades')); await P.waitForTimeout(600); const r = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="grade-name-"]')].map(e => e.value ?? e.innerText)); await shot(w, 'd5-grades-open'); await P.keyboard.press('Escape'); await P.waitForTimeout(400); return r }
const notesNow = () => D.notes(P)
try {
  await L.signIn(w, 'admin'); await D.openBalances(w)
  // ---- a typed figure
  await D.typeInBox(w, T('bal-LVE-bane'), 16)
  let r = await D.balRow(P, 'bane'); console.log('typed:', r.app, r.war, await undoState())
  await L.undo(w); const u1 = await D.balRow(P, 'bane'), n1 = await notesNow(); await shot(w, 'd5-fig-undo')
  await L.redo(w); const rd1 = await D.balRow(P, 'bane'); await shot(w, 'd5-fig-redo')
  judge('U1 typed figure: 15 → 16, Undo, Redo', [exp('typed', r.app, '16'), exp('after Undo', u1.app, '15'), exp('after Redo', rd1.app, '16')], ['d5-fig-undo', 'd5-fig-redo'], `Undo note: ${n1.join(' | ') || 'none'}`)
  await D.reloadAs(w, 'admin', '2026-01-25'); await D.openBalances(w)
  const rl1 = await D.balRow(P, 'bane'), us1 = await undoState(); await shot(w, 'd5-fig-reload')
  judge('U1 after a reload', [exp('App bal kept', rl1.app, '16'), exp('Undo list empty (D148)', us1, 'undo off, redo off')], ['d5-fig-reload'])
  // ---- a grade change
  await press(w, T('bal-grade-bane')); await P.waitForTimeout(400); await press(w, T('bal-grade-opt-jp')); await P.waitForTimeout(600)
  const g1 = await gradeOf('bane'); await shot(w, 'd5-grade-set')
  await L.undo(w); const g2 = await gradeOf('bane'); await shot(w, 'd5-grade-undo')
  await L.redo(w); const g3 = await gradeOf('bane'); await shot(w, 'd5-grade-redo')
  judge('U2 grade change Senior → Junior, Undo, Redo', [exp('after pick', g1, 'Junior pilot+33'), exp('after Undo', g2, 'Senior pilot+36'), exp('after Redo', g3, 'Junior pilot+33')], ['d5-grade-set', 'd5-grade-undo', 'd5-grade-redo'])
  await D.reloadAs(w, 'admin', '2026-01-25'); await D.openBalances(w)
  judge('U2 after a reload', [exp('grade kept', await gradeOf('bane'), 'Junior pilot+33')], [])
  // ---- the grades list
  const before = await gradeRows()
  await press(w, T('bal-grades')); await P.waitForTimeout(500)
  await press(w, T('grade-add')); await P.waitForTimeout(400)
  await press(w, T('grade-draft-name')); await P.keyboard.type('Walker D grade', { delay: 20 })
  await press(w, T('grade-draft-days')); await P.keyboard.press('Control+A'); await P.keyboard.type('10', { delay: 20 }); await P.keyboard.press('Enter'); await P.waitForTimeout(600)
  await shot(w, 'd5-grades-added')
  const inWindow = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="grade-name-"]')].map(e => e.value ?? e.innerText))
  // Undo with the window open — it updates in place?
  await P.keyboard.press('Escape'); await P.waitForTimeout(400)
  await L.undo(w)
  const afterUndo = await gradeRows()
  await L.redo(w)
  const afterRedo = await gradeRows()
  judge('U3 grades list: + Grade "Walker D grade" +10, Undo, Redo', [exp('before', before.length, 5), exp('in the window after adding', inWindow.length, 6), exp('after Undo', afterUndo.length, 5), exp('after Redo', afterRedo.length, 6)], ['d5-grades-added', 'd5-grades-open'], `names after Redo: ${afterRedo.join(' / ')}`)
  await D.reloadAs(w, 'admin', '2026-01-25'); await D.openBalances(w)
  const afterReload = await gradeRows()
  judge('U3 after a reload', [exp('the added grade kept', afterReload.length, 6)], [])
  // ---- the lock
  await press(w, T('bal-lock')); await P.waitForTimeout(600)
  const l1 = await lockState(); await shot(w, 'd5-lock-on')
  await L.undo(w); const l2 = await lockState(); const n2 = await notesNow(); await shot(w, 'd5-lock-undo')
  await L.redo(w); const l3 = await lockState(); await shot(w, 'd5-lock-redo')
  judge('U4 the lock: on, Undo, Redo (the lock is an Undo step — reading)', [exp('after pressing', l1, 'true'), exp('after Undo', l2, 'false'), exp('after Redo', l3, 'true')], ['d5-lock-on', 'd5-lock-undo', 'd5-lock-redo'], `Undo note: ${n2.join(' | ') || 'none'}`)
  await D.reloadAs(w, 'admin', '2026-01-25'); await D.openBalances(w)
  judge('U4 after a reload', [exp('the lock kept', await lockState(), 'true')], [])
  // history window words for these changes
  await P.evaluate(() => 0)
} catch (e) { note('ERROR', 'desk', 'FAIL', String(e).slice(0, 500)); await shot(w, 'd5-error').catch(() => {}) }
note('errors (console, page, 4xx)', 'desk', w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.join(' || ').slice(0, 800) : 'none')
D.dumpResults('d5')
await w.ctx.close(); await L.closeBrowser()
console.log('DONE')
