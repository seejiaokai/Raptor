// Re-walk A3c — what the data says after Undo of a one-tap switch, and the "stale" line after a Redo.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk/a'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L, lineLoc, approveBtn, refuseBtn, pressLoc, shotLine, topbarUndo, topbarRedo, lineInfo } = A
const { T, rec, shot, txt, press } = L
console.log('[lw-m4-rw-a3c v1]')
const w = await L.newCtx('desk')
const P = w.page
const D = 'Mon 2 Feb'
const line = async tag => { const i = await lineInfo(P, D); console.log(tag, '|', i.cls, '| note:', i.note, '| text:', i.text, '| ok', JSON.stringify(i.ok), 'no', JSON.stringify(i.no)) }
const bidwin = async tag => {
  await L.openGrid(w); await L.openCell(w, 'slash', '2026-02-02')
  const t = await P.evaluate(() => { const e = document.querySelector('[data-testid="bid-picker"]'); return e ? e.innerText.replace(/\s+/g, ' ') : null })
  const lit = await P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-picker"] button')].filter(b => /approve|refuse/i.test(b.dataset.testid || '')).map(b => (b.dataset.testid) + ':' + b.getAttribute('aria-pressed') + ':' + b.className))
  console.log(tag, 'bid window:', t && t.slice(0, 300), '|', JSON.stringify(lit))
  await shot(w, 'a3c-' + tag.replace(/\W+/g, '-'))
  await L.closeWin(w)
}
try {
  await L.signIn(w, 'admin')
  await L.openApprovals(w)
  await pressLoc(w, approveBtn(P, D)); await P.waitForTimeout(500)
  await pressLoc(w, refuseBtn(P, D)); await P.waitForTimeout(500)
  await line('switched to Refuse')
  await topbarUndo(w); await line('Undo #1 after switch')
  await shotLine(w, 'a3c-1-undo-after-switch', D)
  await bidwin('data after Undo 1')
  await L.openApprovals(w)
  await line('Approvals reopened')
  await shot(w, 'a3c-2-reopened')
  // redo from here
  await topbarRedo(w); await line('Redo #1')
  await shotLine(w, 'a3c-3-redo', D)
} catch (e) { console.log('ERR', String(e).slice(0, 300)); await shot(w, 'a3c-error').catch(() => {}) }
await w.ctx.close(); await L.closeBrowser()
