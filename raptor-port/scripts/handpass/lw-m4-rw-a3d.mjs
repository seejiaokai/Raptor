// Re-walk A3d — the stale line after Undo, Undo, Redo of a one-tap switch: its words and picture.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk/a'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L, lineLoc, approveBtn, refuseBtn, pressLoc, shotLine, topbarUndo, topbarRedo, lineInfo } = A
const { T, rec, shot, txt } = L
console.log('[lw-m4-rw-a3d v1]')
const w = await L.newCtx('desk')
const P = w.page
const D = 'Mon 2 Feb'
const line = async tag => { const i = await lineInfo(P, D); console.log(tag, '|', i.cls, '| note:', i.note, '| text:', i.text) }
try {
  await L.signIn(w, 'admin')
  await L.openApprovals(w)
  await pressLoc(w, approveBtn(P, D)); await P.waitForTimeout(500)
  await pressLoc(w, refuseBtn(P, D)); await P.waitForTimeout(500)
  await topbarUndo(w); await line('Undo #1 after switch')
  await topbarUndo(w); await line('Undo #2')
  await shotLine(w, 'a3d-1-two-undos', D)
  await topbarRedo(w); await line('Redo #1')
  await shotLine(w, 'a3d-2-redo-1', D); await shot(w, 'a3d-2-redo-1-page')
  await topbarRedo(w); await line('Redo #2')
  await shotLine(w, 'a3d-3-redo-2', D)
} catch (e) { console.log('ERR', String(e).slice(0, 300)); await shot(w, 'a3d-error').catch(() => {}) }
await w.ctx.close(); await L.closeBrowser()
