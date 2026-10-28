// walker C, script 7 — a posted-out man's window AFTER his date, from his name on the grid (admin), and as seen by another man.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/c/c7'
const { L, T, pwRead, onScreen, closePw, note, rec, shot, press, vis } = await import('./lw-m5a-walk-c-lib.mjs')
console.log('[lw-m5a-walk-c7-desk v1]')
L.clearOut()
const w = await L.newCtx('desk'); const P = w.page
const nameBtn = pid => `[data-testid="row-${pid}"] .whoedit`
await L.signIn(w, 'admin')
try {
  await L.reachCell(w, 'ammo', '2026-02-12')
  await press(w, T('cell-ammo-2026-02-12')); await P.waitForTimeout(700)
  await press(w, T('bid-more')); await P.waitForTimeout(500)
  await press(w, T('bid-postout')); await P.waitForTimeout(600)
  await P.locator(T('po-confirm')).first().click(); await P.waitForTimeout(900)
  await L.closeWin(w)
  await P.evaluate(() => window.lwSetMemberToday('2026-03-01'))
  await L.openGrid(w); await P.waitForTimeout(1000)
  const n = await P.locator(nameBtn('ammo')).count()
  const rowText = await P.evaluate(() => document.querySelector('[data-testid="row-ammo"]')?.innerText.replace(/\s+/g, ' ').slice(0, 80))
  await shot(w, '71a-grid-after-date')
  rec('PO3b after his date (clock 1 Mar) his row stands on the grid', 'desk', n ? 'PASS' : 'FAIL', `row present ${n}; row text "${rowText}"`, ['71a-grid-after-date'])
  if (n) {
    await press(w, nameBtn('ammo')); await P.waitForTimeout(900)
    const pw = await pwRead(P)
    await shot(w, '71b-window-after-date')
    rec('PO4 the posted-out man\'s window from his name on the grid', 'desk', pw && onScreen(pw) ? 'PASS' : 'FAIL', pw ? `"${pw.name}" App ${pw.app} cf ${pw.cf} pend ${pw.pend} war ${pw.war} boxes ${pw.boxes}; lines ${pw.lines.map(l => l.text).join(' | ')}` : 'no window', ['71b-window-after-date'])
    await closePw(w)
  }
} catch (e) { rec('PO (script)', 'desk', 'NOT WALKED', String(e).slice(0, 300), []) }
await w.ctx.close()
rec('errors', 'desk', w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.join(' || ').slice(0, 900) : 'none')
L.writeResults('c7'); await L.closeBrowser(); console.log('DONE')
