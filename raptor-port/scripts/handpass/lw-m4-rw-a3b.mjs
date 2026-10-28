// Re-walk A3b — Undo / Redo after the one-tap switch, read closely (the first Undo after Approve -> Refuse changed nothing on the line in A3).
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk/a'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L, lineLoc, approveBtn, refuseBtn, pressLoc, shotLine, topbarUndo, topbarRedo } = A
const { T, rec, shot, txt } = L
console.log('[lw-m4-rw-a3b v1]')
const w = await L.newCtx('desk')
const P = w.page
const D = 'Mon 2 Feb'
const st = async tag => {
  const u = await P.evaluate(() => ({ undoDis: document.querySelector('#undoBtn')?.disabled, undoTitle: document.querySelector('#undoBtn')?.title, redoDis: document.querySelector('#redoBtn')?.disabled, redoTitle: document.querySelector('#redoBtn')?.title }))
  const cls = await lineLoc(P, D).evaluate(e => e.className)
  const head = await txt(P, T('appr-sub'))
  console.log(tag, '| line:', cls, '| head:', head, '|', JSON.stringify(u))
}
try {
  await L.signIn(w, 'admin')
  await L.openApprovals(w)
  await st('start')
  await pressLoc(w, approveBtn(P, D)); await P.waitForTimeout(500); await st('after Approve')
  await topbarUndo(w); await st('Undo #1 (takes back the Approve)')
  await shotLine(w, 'a3b-1-undo-approve', D)
  await topbarRedo(w); await st('Redo #1')
  await pressLoc(w, refuseBtn(P, D)); await P.waitForTimeout(500); await st('after switch to Refuse')
  await topbarUndo(w); await st('Undo #2 (takes back the switch)')
  await shotLine(w, 'a3b-2-undo-switch', D); await shot(w, 'a3b-2-undo-switch-page')
  await topbarUndo(w); await st('Undo #3')
  await shotLine(w, 'a3b-3-undo-3', D)
  await topbarRedo(w); await st('Redo #3')
  await topbarRedo(w); await st('Redo #4')
  await shotLine(w, 'a3b-4-redo', D)
  // what the grid holds: leave and look at the cell
  await L.openGrid(w); await L.reachCell(w, 'slash', '2026-02-02')
  const cell = await P.locator(T('cell-slash-2026-02-02')).evaluate(e => ({ cls: e.className, txt: e.innerText.replace(/\s+/g, ' ') }))
  console.log('grid cell Mon 2 Feb (Blade):', JSON.stringify(cell))
} catch (e) { console.log('ERR', String(e).slice(0, 300)); await shot(w, 'a3b-error').catch(() => {}) }
await w.ctx.close(); await L.closeBrowser()
