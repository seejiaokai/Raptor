// Walker D, script d6: the member's typing, his Undo/Redo, and the lock landing under his open box (the stand-in: lockViaBridge). SIZE=desk|phone.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/d'
process.env.LW_TODAY ||= '2026-01-25'
const D = await import('./lw-m5a-walk-d-lib.mjs')
const { L, note, eq } = D
const { T, press, vis, txt, shot } = L
const size = process.env.SIZE || 'desk'
console.log('[lw-m5a-walk-d-d6 v1]', size)
const w = await L.newCtx(size)
const P = w.page
const S = n => `d6-${size}-${n}`
const exp = (label, got, want) => ({ label, got, want, ok: eq(got, want) })
function judge(id, checks, pics, extra = '') {
  const bad = checks.filter(c => !c.ok)
  note(id, size, bad.length ? 'FAIL' : 'PASS', checks.map(c => `${c.label} ${c.got}${c.ok ? '' : ' (expected ' + c.want + ')'}`).join('; ') + (extra ? ' · ' + extra : ''), pics)
}
const undoState = () => P.evaluate(() => ['undoBtn', 'redoBtn'].map(id => { const b = document.getElementById(id); return id.replace('Btn', '') + ' ' + (b ? (b.disabled ? 'off' : 'on') : 'none') }).join(', '))
const figs = async () => { const r = await D.balRow(P, 'bane'); return r ? { app: r.app, cf: r.cf, war: r.war, boxes: r.boxes, ro: r.readOnly.join(' ') } : null }
const lockedWords = () => txt(P, T('bal-locked'))
try {
  await L.signIn(w, 'member'); await D.openBalances(w)
  const f0 = await figs()
  await shot(w, S('00-start'))
  // ---- his own typing: two figures, Undo both, Redo both
  await D.typeInBox(w, T('bal-LVE-bane'), 16); const f1 = await figs()
  await D.typeInBox(w, T('bal-LVE-bane'), 17); const f2 = await figs()
  await shot(w, S('01-typed-17'))
  await L.undo(w); const u1 = await figs(); await L.undo(w); const u2 = await figs()
  await shot(w, S('02-undone-both'))
  await L.redo(w); await L.redo(w); const rd = await figs()
  await shot(w, S('03-redone-both'))
  judge('46 member own typing: 15 → 16 → 17, Undo twice, Redo twice (unlocked)', [exp('start', f0.app, '15'), exp('typed 16', f1.app, '16'), exp('typed 17', f2.app, '17'), exp('Undo 1', u1.app, '16'), exp('Undo 2', u2.app, '15'), exp('Redo twice', rd.app, '17')], [S('01-typed-17'), S('02-undone-both'), S('03-redone-both')], `his row: boxes ${f0.boxes}, War bal at 17: ${f2.war}`)
  // ---- the lock lands under his open box (typed 14, no Enter)
  await press(w, T('bal-LVE-bane')); await P.waitForTimeout(w.phone ? 650 : 200)
  await P.keyboard.press('Control+A'); await P.keyboard.type('14', { delay: 30 })
  const typed = await P.locator(T('bal-LVE-bane')).inputValue()
  await shot(w, S('04-box-open-14'))
  const lb = await D.lockViaBridge(w, true); await P.waitForTimeout(900)
  const f3 = await figs(), n3 = await D.notes(P), lw = await lockedWords()
  const focus = await P.evaluate(() => document.activeElement?.dataset?.testid || document.activeElement?.tagName)
  await shot(w, S('05-lock-landed'))
  console.log('lock landed:', JSON.stringify(lb), JSON.stringify(f3), n3, lw, focus)
  judge('44 the lock lands under his open box (14 typed, no Enter) — the lock flipped by lockViaBridge, the stand-in for the admin', [exp('box typed value before', typed, '14'), exp('his boxes after', f3.boxes, '0'), exp('App bal shown', f3.app ?? f3.ro.split(' ')[0], '17')], [S('04-box-open-14'), S('05-lock-landed')], `bridge ${JSON.stringify(lb)}; "Locked by admin" words: "${lw}"; note(s) on screen: ${n3.join(' | ') || 'none'}; read-only figures ${f3.ro}; focus on ${focus}`)
  // his Enter: there is no box to press it in
  await P.keyboard.press('Enter'); await P.waitForTimeout(500)
  const f3b = await figs(); const n3b = await D.notes(P)
  note('44b his Enter after the lock landed (no box left)', size, 'NOT WALKED', `there is no box left to press Enter in (boxes ${f3b.boxes}); an Enter with nothing focused changed nothing: figures ${f3b.ro}; notes ${n3b.join(' | ') || 'none'}`, [S('05-lock-landed')])
  // ---- his Undo of his earlier change: a real press
  const us = await undoState()
  await L.undo(w); const f4 = await figs(), n4 = await D.notes(P)
  await shot(w, S('06-undo-refused'))
  judge('44c his Undo while locked (real press) — refused', [exp('App bal unchanged', f4.app ?? f4.ro.split(' ')[0], '17'), exp('refused (a note says so)', n4.length > 0, 'true')], [S('06-undo-refused')], `Undo button before the press: ${us}; the words: ${n4.join(' | ') || 'none'}`)
  // ---- unlocked again: the boxes come back; the same Undo accepted
  const lb2 = await D.lockViaBridge(w, false); await P.waitForTimeout(800)
  const f5 = await figs()
  await shot(w, S('07-unlocked'))
  await L.undo(w); const f6 = await figs(), n6 = await D.notes(P)
  await shot(w, S('08-undo-accepted'))
  judge('44d unlocked again by the stand-in: the 7 boxes come back live', [exp('boxes back', f5.boxes, '7'), exp('App bal', f5.app, '17')], [S('07-unlocked')])
  note('46 the same Undo accepted once unlocked', size, 'NOT WALKED', `the stand-in's lock and unlock are themselves steps on HIS Undo list (the bridge writes them as the person signed in), so his Undo meets the unlock step first and is refused again with "${n6.join(' | ') || 'no words'}"; figure after the press ${f6.app} — the real order (another person's lock never sits on his list) cannot be reproduced through the bridge`, [S('08-undo-accepted')])
  // ---- a reload keeps what he typed, and clears Undo
  await D.reloadAs(w, 'member', '2026-01-25'); await D.openBalances(w)
  const f7 = await figs(), us7 = await undoState()
  judge('45 reload as the member: his figure kept, Undo list empty', [exp('App bal', f7.app, '17'), exp('Undo', us7, 'undo off, redo off')], [])
  // ---- and the admin sees it, named Ranger
  await L.switchTo(w, 'admin'); await D.openBalances(w)
  const fa = await figs()
  note('45 Saber reads Ranger\'s typed figure', size, fa.app === '17' ? 'PASS' : 'FAIL', `Ranger's row as the admin sees it: App bal ${fa.app}, incl. ${fa.cf}, War bal ${fa.war}`, [])
} catch (e) { note('ERROR', size, 'FAIL', String(e).slice(0, 500)); await shot(w, S('error')).catch(() => {}) }
note('errors (console, page, 4xx)', size, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.join(' || ').slice(0, 800) : 'none')
D.dumpResults('d6-' + size)
await w.ctx.close(); await L.closeBrowser()
console.log('DONE')
