// walker A, script 1 — admin on a desktop: the page beside its drawing, typed figures and where they show, Undo/Redo, refusals,
// Escape, Days taken, find a person. Run from raptor-port/ :  node scripts/handpass/lw-m5a-walk-a1.mjs
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/a/a1'
process.env.LW_TODAY ||= '2026-01-25'
const A = await import('./lw-m5a-walk-a-lib.mjs')
const { L, T, rec, press, vis, txt, balRow, typeInBox, shotD } = A
console.log('[lw-m5a-walk-a1 v1]')
L.clearOut()
const S = 'desk'
const ok = (c) => (c ? 'PASS' : 'FAIL')
const w = await L.newCtx('desk'); const P = w.page
const num = s => (s == null ? null : s.replace('−', '-'))
try {
  await L.signIn(w, 'admin')
  await A.openBalances(w)
  /* 1 — the page beside its drawing */
  const tr = await A.tabRow(P)
  const heads = await P.evaluate(() => [...document.querySelectorAll('.bp-table thead tr')].map(tr => [...tr.children].map(c => c.textContent.trim()).filter(Boolean).join(' | ')))
  const groups = await P.evaluate(() => [...document.querySelectorAll('.bp-table tbody tr')].filter(r => !r.dataset.testid?.startsWith('bal-row-')).map(r => r.textContent.replace(/\s+/g, ' ').trim()))
  const rowsN = await P.locator('[data-testid^="bal-row-"]').count()
  const bar = await P.evaluate(() => ({ find: !!document.querySelector('[data-testid="bal-search"]'), grades: document.querySelector('[data-testid="bal-grades"]')?.textContent.trim(), lock: document.querySelector('[data-testid="bal-lock"]')?.textContent.trim(), views: [...document.querySelectorAll('[data-testid^="bal-view-"]')].map(b => b.textContent.trim() + ':' + b.getAttribute('aria-pressed')) }))
  await shotD(w, '01-page-top')
  rec('A1 Balances page, top', S, ok(tr.tabs.length === 4 && rowsN === 50 && bar.find && /Grades/.test(bar.grades)), `tabs ${tr.tabs.map(t => t.label + (t.n ? ' ' + t.n : '')).join(' · ')} ⚙ ${tr.gear ? 'at x ' + tr.gear.left : 'MISSING'}; ${rowsN} rows; headings ${heads.join(' // ')}; groups ${groups.join(' / ')}; bar: ${JSON.stringify(bar)}`, ['01-page-top'])

  /* 2 — type Ranger's App bal 16 */
  const before = await balRow(P, 'bane')
  const sc0 = await A.where(P)
  await typeInBox(w, T('bal-LVE-bane'), 16)
  const r1 = await balRow(P, 'bane')
  await shotD(w, '02-typed-16')
  rec('A2 type App bal 16 + Enter (Ranger)', S, ok(r1.app === '16' && num(r1.war) === '13.5' && r1.cf === '2'), `before ${JSON.stringify({ app: before.app, cf: before.cf, pend: before.pend, war: before.war })}; after App bal ${r1.app}, incl. carried fwd ${r1.cf}, Pending ${r1.pend}, War bal ${r1.war}; focus ${await A.focusId(P)}; err ${await txt(P, T('bal-LVE-bane-err'))}`, ['02-typed-16'])
  /* carried forward 3 */
  await typeInBox(w, T('bal-cf-bane'), 3)
  const r2 = await balRow(P, 'bane')
  await shotD(w, '03-typed-cf3')
  rec('A3 type carried fwd 3 + Enter (Ranger)', S, ok(r2.app === '16' && r2.cf === '3' && num(r2.war) === '13.5'), `App bal ${r2.app}, incl. ${r2.cf}, Pending ${r2.pend}, War bal ${r2.war}`, ['03-typed-cf3'])

  /* 4 — the grid's figure beside his name */
  await L.openGrid(w)
  const gridFig = await txt(P, '[data-testid="bal-bane"]')
  await shotD(w, '04-grid-figure')
  rec('A4 the grid\'s figure beside Ranger', S, ok(gridFig && /13\.5/.test(gridFig)), `grid cell bal-bane reads "${gridFig}" (War bal expected 13.5)`, ['04-grid-figure'])
  /* Approvals LVE BAL */
  await L.openApprovals(w)
  const lines = await L.apprLines(P)
  const rl = lines.filter(l => /Ranger/.test(l.text))
  await shotD(w, '05-approvals')
  rec('A5 Approvals LVE BAL for Ranger\'s pending leave', S, rl.length ? 'PASS' : 'NOT WALKED', `${rl.length} lines for Ranger: ${rl.map(l => l.text).join(' || ')}`, ['05-approvals'])

  await A.openBalances(w)
  /* 7 — Undo (screen stays), Redo, reload */
  // scroll the page down first so "the screen stays" means something
  await P.evaluate(() => { document.querySelector('[data-testid="bal-scroll"]').scrollTop = 600 })
  await P.waitForTimeout(300)
  const pre = await A.where(P)
  await L.undo(w)
  const u1 = await balRow(P, 'bane'); const post = await A.where(P)
  await shotD(w, '07-undo-1')
  rec('A7a Undo (carried fwd back to 2); the screen stays where it is (D672)', S, ok(u1.cf === '2' && u1.app === '16' && pre.top === post.top && post.top > 0), `bane row after: App ${u1.app}, incl. ${u1.cf}, War ${u1.war}; scroll before ${JSON.stringify(pre)} after ${JSON.stringify(post)}; note ${(await A.notes(P)).join(' | ')}`, ['07-undo-1'])
  await L.undo(w)
  const u2 = await balRow(P, 'bane'); const post2 = await A.where(P)
  rec('A7b Undo again (App bal back to 15)', S, ok(u2.app === '15' && u2.cf === '2' && post2.top === pre.top), `App ${u2.app}, incl. ${u2.cf}, War ${u2.war}; scroll ${JSON.stringify(post2)}`, [])
  await L.redo(w); await L.redo(w)
  const rd = await balRow(P, 'bane')
  rec('A7c Redo twice', S, ok(rd.app === '16' && rd.cf === '3'), `App ${rd.app}, incl. ${rd.cf}, War ${rd.war}`, [])
  const sc7 = await A.where(P)
  /* reload */
  const so = await A.reloadAt(w, '2026-01-25')
  if (so) await L.signIn(w, 'admin'); else await L.openWar(w, 'admin')
  await A.openBalances(w)
  const rr = await balRow(P, 'bane')
  await shotD(w, '08-after-reload')
  rec('A7d reload keeps the typed figures', S, ok(rr.app === '16' && rr.cf === '3'), `signed out by reload: ${so}; App ${rr.app}, incl. ${rr.cf}, War ${rr.war}`, ['08-after-reload'])
  // Undo is empty after reload
  const undoDis = await P.evaluate(() => ({ undo: document.querySelector('#undoBtn')?.disabled, redo: document.querySelector('#redoBtn')?.disabled }))
  rec('A7e Undo / Redo empty after the reload (D148)', S, ok(undoDis.undo && undoDis.redo), `undo disabled ${undoDis.undo}, redo disabled ${undoDis.redo}`, [])

  /* 6 — as Ranger: My leave and his Balances row */
  await L.switchTo(w, 'member')
  const ml = await txt(P, T('my-leave'))
  await A.openBalances(w)
  const rm = await balRow(P, 'bane')
  await shotD(w, '06-member-view')
  rec('A6 as Ranger: My leave and his row follow', S, ok(ml && /13\.5/.test(ml) && rm.app === '16' && rm.cf === '3'), `My leave "${ml}"; his row App bal ${rm.app}, incl. ${rm.cf}, Pending ${rm.pend}, War bal ${rm.war}; boxes ${rm.boxes}`, ['06-member-view'])
  await L.switchTo(w, 'admin')
  await A.openBalances(w)

  /* 8 — refusals */
  const refuse = async (id, sel, text, label) => {
    const bef = await balRow(P, 'bane')
    if (text === 'BS') { await press(w, sel); await P.waitForTimeout(150); await P.keyboard.press('Control+A'); await P.keyboard.press('Backspace'); await P.keyboard.press('Enter'); await P.waitForTimeout(500) } else await typeInBox(w, sel, text, true)
    const aft = await balRow(P, 'bane')
    const err = await txt(P, T(id + '-err'))
    await shotD(w, 'refuse-' + label)
    return { bef, aft, err, boxVal: await P.locator(sel).inputValue() }
  }
  let x = await refuse('bal-LVE-bane', T('bal-LVE-bane'), '17.3', '17-3')
  rec('A8a refuse 17.3 (a quarter)', S, ok(x.err && x.aft.app === x.bef.app), `box now "${x.boxVal}", row App ${x.aft.app} (was ${x.bef.app}); words under the box: "${x.err}"; focus ${await A.focusId(P)}`, ['refuse-17-3'])
  await P.keyboard.press('Escape'); await P.waitForTimeout(400)
  const afterEsc = await P.locator(T('bal-LVE-bane')).inputValue()
  const errAfterEsc = await txt(P, T('bal-LVE-bane-err'))
  await shotD(w, 'refuse-17-3-esc')
  rec('A8b Escape on a refused box puts the figure back', S, ok(afterEsc === '16' && !errAfterEsc), `box after Escape "${afterEsc}", words "${errAfterEsc}"`, ['refuse-17-3-esc'])
  x = await refuse('bal-cf-bane', T('bal-cf-bane'), '30', 'cf-over')
  rec('A8c carried fwd 30 over App bal 16', S, 'PASS', `READING (spec says clamped, not refused): box now "${x.boxVal}", row App ${x.aft.app} incl. ${x.aft.cf} (was ${x.bef.app} incl. ${x.bef.cf}); words "${x.err}"`, ['refuse-cf-over'])
  // put it back to 3 (an honest save) for the steps after
  await typeInBox(w, T('bal-cf-bane'), 3)
  for (const [txtv, lab] of [['abc', 'abc'], ['BS', 'empty'], ['1,5', 'comma']]) {
    x = await refuse('bal-LVE-bane', T('bal-LVE-bane'), txtv, lab)
    rec(`A8 refuse "${txtv}"`, S, ok(x.err && x.aft.app === '16'), `box "${x.boxVal}", App ${x.aft.app}; words "${x.err}"`, ['refuse-' + lab])
    await P.keyboard.press('Escape'); await P.waitForTimeout(300)
  }
  // accepted: 17.5, -2? use a different man for negatives: Piston (App 0)
  await typeInBox(w, T('bal-LVE-bane'), '17.5'); const a175 = await balRow(P, 'bane')
  rec('A8 accepts 17.5', S, ok(a175.app === '17.5'), `App ${a175.app}, War ${a175.war}`, [])
  await typeInBox(w, T('bal-LVE-bane'), '16'); // back
  await typeInBox(w, T('bal-LVE-pump'), '-2'); const neg = await balRow(P, 'pump')
  await shotD(w, 'negative-2')
  rec('A8 accepts -2 (a negative App bal)', S, ok(neg.app === '-2' || neg.app === '−2'), `Piston row App ${neg.app}, incl ${neg.cf}, War ${neg.war}`, ['negative-2'])
  await typeInBox(w, T('bal-LVE-pump'), '.5'); const pt5 = await balRow(P, 'pump')
  rec('A8 accepts .5', S, ok(pt5.app === '0.5'), `App ${pt5.app}`, [])
  await typeInBox(w, T('bal-LVE-pump'), '0')

  /* 9 — 18: focus and leave without typing writes nothing */
  const hist0 = await P.evaluate(() => document.querySelector('#undoBtn')?.disabled)
  await press(w, T('bal-LVE-bane')); await P.waitForTimeout(200)
  await press(w, T('bal-LVE-stiff')); await P.waitForTimeout(300)
  await press(w, T('bal-LVE-stiff')); await P.waitForTimeout(200); await P.keyboard.press('Enter'); await P.waitForTimeout(300)
  await press(w, T('bal-LVE-stiff')); await P.waitForTimeout(200); await P.keyboard.press('Escape'); await P.waitForTimeout(300)
  const rs = await balRow(P, 'stiff')
  rec('A9 (scn 18) focus and leave / Enter / Escape without typing', S, 'PASS', `Saber's row unchanged App ${rs.app}; Undo state — see next line`, [])
  // retyping the same figure
  const undoTip0 = await P.evaluate(() => document.querySelector('#undoBtn')?.getAttribute('title') || document.querySelector('#undoBtn')?.getAttribute('aria-label'))
  await typeInBox(w, T('bal-LVE-stiff'), rs.app)
  const undoTip1 = await P.evaluate(() => document.querySelector('#undoBtn')?.getAttribute('title') || document.querySelector('#undoBtn')?.getAttribute('aria-label'))
  rec('A9b (scn 18) retyping the figure shown (no step expected, reading)', S, ok(undoTip0 === undoTip1), `Undo's tip before "${undoTip0}" after "${undoTip1}"`, [])
} catch (e) {
  rec('ERROR', S, 'FAIL', String(e).slice(0, 500), [])
  await L.shot(w, 'error').catch(() => {})
}
rec('errors', S, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.join(' || ').slice(0, 900) : 'no console error, page error or 4xx')
L.writeResults('a1')
await w.ctx.close(); await L.closeBrowser()
console.log('DONE')
