// walker A, script 3 — admin, desktop: Grades… (rename, "+ days", reorder by drag, delete one people hold, Undo, add), a row's grade box and
// its list, the lock on and off. node scripts/handpass/lw-m5a-walk-a3.mjs
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/a/a3'
process.env.LW_TODAY ||= '2026-01-25'
const A = await import('./lw-m5a-walk-a-lib.mjs')
const { L, T, rec, press, vis, txt, balRow, typeInBox, shotD } = A
console.log('[lw-m5a-walk-a3 v1]')
L.clearOut()
const S = 'desk'
const ok = c => (c ? 'PASS' : 'FAIL')
const w = await L.newCtx('desk'); const P = w.page
const undoTip = () => P.evaluate(() => document.querySelector('#undoBtn')?.getAttribute('title') || document.querySelector('#undoBtn')?.getAttribute('aria-label'))
const gradeRows = () => P.evaluate(() => [...document.querySelectorAll('[data-testid^="grade-row-"]')].map(r => ({ id: r.dataset.testid.slice(10), name: r.querySelector('[data-testid^="grade-name-"]')?.value, days: r.querySelector('[data-testid^="grade-days-"]')?.value, holds: r.querySelector('[data-testid^="grade-holds-"]')?.textContent.trim(), top: Math.round(r.getBoundingClientRect().top) })))
const order = async () => (await gradeRows()).map(g => g.id).join(',')
const sheetBox = () => P.evaluate(() => { const s = document.querySelector('[data-testid="grades-sheet"]'); if (!s) return null; const b = s.getBoundingClientRect(); return { left: Math.round(b.left), top: Math.round(b.top), right: Math.round(b.right), bottom: Math.round(b.bottom), vh: innerHeight } })
const gradeOf = pid => P.evaluate(pid => document.querySelector(`[data-testid="bal-grade-${pid}"]`)?.textContent.replace(/\s+/g, ' ').trim() ?? null, pid)
try {
  await L.signIn(w, 'admin'); await A.openBalances(w)
  const g0 = await gradeOf('bane'), gRec0 = await gradeOf('prism')
  /* Grades… opens */
  await press(w, T('bal-grades')); await P.waitForTimeout(600)
  const rows0 = await gradeRows(), box0 = await sheetBox()
  await shotD(w, '20-grades-open')
  rec('A20 Grades… opens (beside m5c-c1-grades)', S, ok(rows0.length === 5), `sheet box ${JSON.stringify(box0)}; ${rows0.map(r => `${r.name} ${r.holds} +${r.days}`).join(' / ')}`, ['20-grades-open'])
  // can the grid behind still be worked while it is open (non-blocking)? press Ranger's App bal box with the sheet open
  const sc = await P.evaluate(() => { const s = document.querySelector('[data-testid="grades-sheet"]'); return { ids: [...s.querySelectorAll('[data-testid]')].map(e => e.dataset.testid).join(' ') } })
  console.log('sheet testids:', sc.ids)

  /* rename g2 */
  const nameIn = id => `[data-testid="grade-name-${id}"]`, daysIn = id => `[data-testid="grade-days-${id}"]`
  await P.locator(nameIn('jp')).click(); await P.keyboard.press('Control+A'); await P.keyboard.type('Junior pilot X', { delay: 25 }); await P.keyboard.press('Enter'); await P.waitForTimeout(500)
  const gr1 = await gradeRows(); const rec1 = await gradeOf('prism')
  await shotD(w, '21-renamed')
  rec('A21 rename Junior pilot → "Junior pilot X"', S, ok(gr1[1].name === 'Junior pilot X' && /Junior pilot X/.test(rec1 || '')), `sheet row 2 "${gr1[1].name}"; Recon's grade box reads "${rec1}"; Undo tip "${await undoTip()}"`, ['21-renamed'])
  // duplicate name refused
  await P.locator(nameIn('jp')).click(); await P.keyboard.press('Control+A'); await P.keyboard.type('Senior pilot', { delay: 25 }); await P.keyboard.press('Enter'); await P.waitForTimeout(500)
  const dupWords = await P.evaluate(() => { const s = document.querySelector('[data-testid="grades-sheet"]'); return [...s.querySelectorAll('[role="alert"], .gw-err, [class*="err"], [data-testid$="-err"]')].map(e => e.textContent.trim()).filter(Boolean) })
  const gr2 = await gradeRows()
  await shotD(w, '22-rename-duplicate')
  rec('A22 rename to a name another grade has', S, ok(dupWords.length && gr2[1].name !== 'Senior pilot'), `words ${JSON.stringify(dupWords)}; row 2 now "${gr2[1].name}"`, ['22-rename-duplicate'])
  await P.keyboard.press('Escape'); await P.waitForTimeout(400)
  const sheetStill = await vis(P, T('grades-sheet'))
  rec('A22b Escape in a refused name box (reverts, then closes?)', S, 'PASS', `READING: sheet still open after one Escape: ${sheetStill}; row 2 name "${(await gradeRows())[1]?.name}"`, [])
  if (!sheetStill) { await press(w, T('bal-grades')); await P.waitForTimeout(500) }
  // empty name
  await P.locator(nameIn('jp')).click(); await P.keyboard.press('Control+A'); await P.keyboard.press('Backspace'); await P.keyboard.press('Enter'); await P.waitForTimeout(500)
  const emptyWords = await P.evaluate(() => [...document.querySelectorAll('[data-testid="grades-sheet"] [role="alert"], [data-testid="grades-sheet"] [class*="err"]')].map(e => e.textContent.trim()).filter(Boolean))
  await shotD(w, '23-rename-empty')
  rec('A23 rename to an empty name', S, ok(emptyWords.length), `words ${JSON.stringify(emptyWords)}; row 2 "${(await gradeRows())[1]?.name}"`, ['23-rename-empty'])
  await P.keyboard.press('Escape'); await P.waitForTimeout(300)
  if (!(await vis(P, T('grades-sheet')))) { await press(w, T('bal-grades')); await P.waitForTimeout(500) }
  // + days 33 -> 35 on g2 (the grade now Junior pilot X)
  await P.locator(daysIn('jp')).click(); await P.keyboard.press('Control+A'); await P.keyboard.type('35', { delay: 25 }); await P.keyboard.press('Enter'); await P.waitForTimeout(500)
  const rec3 = await gradeOf('prism'); const gr3 = await gradeRows()
  rec('A24 "+ days" 33 → 35', S, ok(gr3[1].days === '35' && /35/.test(rec3 || '')), `row 2 days "${gr3[1].days}"; Recon's grade box "${rec3}"; Undo tip "${await undoTip()}"`, [])
  for (const [v, lab] of [['-1', 'neg'], ['36.5', 'half'], ['x', 'x']]) {
    await P.locator(daysIn('jp')).click(); await P.keyboard.press('Control+A'); await P.keyboard.type(v, { delay: 25 }); await P.keyboard.press('Enter'); await P.waitForTimeout(500)
    const words = await P.evaluate(() => [...document.querySelectorAll('[data-testid="grades-sheet"] [role="alert"], [data-testid="grades-sheet"] [class*="err"]')].map(e => e.textContent.trim()).filter(Boolean))
    const g = (await gradeRows())[1]
    await shotD(w, '24-days-' + lab)
    rec(`A24 "+ days" ${v}`, S, 'PASS', `READING: row 2 days box "${g.days}"; Recon's box "${await gradeOf('prism')}"; words ${JSON.stringify(words)}`, ['24-days-' + lab])
    await P.keyboard.press('Escape'); await P.waitForTimeout(300)
    if (!(await vis(P, T('grades-sheet')))) { await press(w, T('bal-grades')); await P.waitForTimeout(500) }
  }
  // restore 33
  await P.locator(daysIn('jp')).click(); await P.keyboard.press('Control+A'); await P.keyboard.type('33', { delay: 25 }); await P.keyboard.press('Enter'); await P.waitForTimeout(400)

  /* reorder by drag: grip of g5 above g1 */
  const before = await order()
  const gp = await P.locator(T('grade-grip-opsa')).boundingBox(), tg = await P.locator(T('grade-row-sp')).boundingBox()
  await P.mouse.move(gp.x + gp.width / 2, gp.y + gp.height / 2); await P.mouse.down()
  await P.mouse.move(gp.x + gp.width / 2, gp.y - 20, { steps: 5 })
  await P.mouse.move(gp.x + gp.width / 2, tg.y + 4, { steps: 25 }); await P.waitForTimeout(300)
  const lines = await P.evaluate(() => [...document.querySelectorAll('[class*="drop"], [class*="land"], [class*="gw-line"], .rdline')].filter(e => e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().height < 8).map(e => e.className + '@' + Math.round(e.getBoundingClientRect().top)))
  await shotD(w, '25-drag-mid')
  await P.mouse.up(); await P.waitForTimeout(600)
  const after = await order()
  await shotD(w, '26-drag-done')
  rec('A25 reorder by drag: Ops A up to the top (one landing line while dragging)', S, ok(before !== after && after.startsWith('opsa')), `order before ${before}, after ${after}; landing-line candidates while dragging: ${JSON.stringify(lines)}; Undo tip "${await undoTip()}"`, ['25-drag-mid', '26-drag-done'])
  // the order in the grade list of a row
  await P.keyboard.press('Escape'); await P.waitForTimeout(300)
  if (!(await vis(P, T('grades-sheet')))) { await press(w, T('bal-grades')); await P.waitForTimeout(500) }

  /* delete one people hold: g2 (8 people) */
  const holdsBefore = (await gradeRows()).find(g => g.id === 'jp').holds
  await press(w, T('grade-del-jp')); await P.waitForTimeout(500)
  const ask = await txt(P, T('grade-ask'))
  await shotD(w, '27-delete-ask')
  rec('A26 delete a grade people hold asks first', S, ok(ask && /8|hold|No grade/i.test(ask)), `holds before "${holdsBefore}"; the question: "${ask}"`, ['27-delete-ask'])
  await press(w, T('grade-del-keep')); await P.waitForTimeout(400)
  rec('A26b "keep" leaves it', S, ok((await gradeRows()).some(g => g.id === 'jp')), `rows ${await order()}`, [])
  await press(w, T('grade-del-jp')); await P.waitForTimeout(400)
  await press(w, T('grade-del-sure')); await P.waitForTimeout(700)
  const recAfter = await gradeOf('prism'), recStyle = await P.evaluate(() => { const e = document.querySelector('[data-testid="bal-grade-prism"]'); const cs = getComputedStyle(e); return { color: cs.color, border: cs.borderTopStyle + ' ' + cs.borderTopColor } })
  const rowsAfterDel = await order()
  await shotD(w, '28-after-delete')
  rec('A27 delete confirmed: holders show "No grade" in amber', S, ok(/No grade/.test(recAfter || '') && !rowsAfterDel.includes('jp')), `sheet order now ${rowsAfterDel}; Recon's box "${recAfter}" style ${JSON.stringify(recStyle)}; Undo tip "${await undoTip()}"`, ['28-after-delete'])
  // Undo with the Grades window open
  await L.undo(w)
  const rowsU = await order(), recU = await gradeOf('prism')
  await shotD(w, '29-undo-delete')
  rec('A28 Undo of the delete, Grades window open (updates in place)', S, ok(rowsU.includes('jp') && /Junior pilot/.test(recU || '')), `sheet order ${rowsU}; Recon's box "${recU}"; window still open ${await vis(P, T('grades-sheet'))}`, ['29-undo-delete'])
  await L.redo(w); await L.undo(w)

  /* add one */
  await press(w, T('grade-add')); await P.waitForTimeout(400)
  await shotD(w, '30-add-draft')
  const draftIds = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="grade-draft"]')].map(e => e.dataset.testid))
  await P.locator(T('grade-draft-name')).fill('Test grade'); await P.locator(T('grade-draft-days')).fill('12'); await P.keyboard.press('Enter'); await P.waitForTimeout(600)
  const rowsA = await gradeRows()
  await shotD(w, '31-added')
  rec('A29 + Grade (name + days, Enter)', S, ok(rowsA.some(g => g.name === 'Test grade' && g.days === '12')), `draft ids ${draftIds.join(',')}; rows ${rowsA.map(g => g.name + ' +' + g.days).join(' / ')}; Undo tip "${await undoTip()}"`, ['30-add-draft', '31-added'])
  // duplicate/empty/bad days in the draft
  await press(w, T('grade-add')); await P.waitForTimeout(300)
  await P.locator(T('grade-draft-name')).fill('Test grade'); await P.locator(T('grade-draft-days')).fill('5'); await P.keyboard.press('Enter'); await P.waitForTimeout(500)
  const derr = await txt(P, T('grade-draft-err'))
  await shotD(w, '32-add-dup')
  rec('A30 + Grade with a name already live', S, ok(derr), `words "${derr}"`, ['32-add-dup'])
  await P.locator(T('grade-draft-name')).fill('Another'); await P.locator(T('grade-draft-days')).fill('x'); await P.keyboard.press('Enter'); await P.waitForTimeout(500)
  const derr2 = await txt(P, T('grade-draft-err'))
  rec('A30b + Grade with days "x"', S, ok(derr2), `words "${derr2}"`, [])
  await P.keyboard.press('Escape'); await P.waitForTimeout(300)
  await L.undo(w)
  rec('A31 Undo of the add', S, ok(!(await gradeRows()).some(g => g.name === 'Test grade')) , `order ${await order()}; names ${(await gradeRows()).map(g => g.name).join('/')}`, [])
  // close the sheet by its ✕
  if (!(await vis(P, T('grades-sheet')))) { await press(w, T('bal-grades')); await P.waitForTimeout(500) }
  await press(w, T('grades-close')); await P.waitForTimeout(400)
  rec('A31b ✕ closes the Grades window', S, ok(!(await vis(P, T('grades-sheet')))), `focus ${await A.focusId(P)}`, [])

  /* a row's grade box and its list */
  await press(w, T('bal-grade-prism')); await P.waitForTimeout(500)
  const lst = await P.evaluate(() => { const l = document.querySelector('[data-testid="bal-grade-list"]'); if (!l) return null; const b = l.getBoundingClientRect(); return { top: Math.round(b.top), bottom: Math.round(b.bottom), vh: innerHeight, opts: [...l.querySelectorAll('[data-testid^="bal-grade-opt-"]')].map(e => e.dataset.testid.slice(14) + ':' + e.textContent.replace(/\s+/g, ' ').trim()) } })
  await shotD(w, '33-grade-list')
  rec('A32 a row\'s grade box opens its list (beside m5c-c1-picker)', S, ok(lst && lst.opts.length >= 6), JSON.stringify(lst), ['33-grade-list'])
  await P.keyboard.press('ArrowDown'); await P.keyboard.press('ArrowDown'); await P.keyboard.press('Enter'); await P.waitForTimeout(600)
  const pick1 = await gradeOf('prism')
  rec('A32b keyboard: two Down + Enter picks a grade', S, ok(pick1 && pick1 !== gRec0), `Recon's box was "${gRec0}" now "${pick1}"; list still open ${await vis(P, T('bal-grade-list'))}; focus ${await A.focusId(P)}; Undo tip "${await undoTip()}"`, [])
  await press(w, T('bal-grade-prism')); await P.waitForTimeout(400)
  await press(w, T('bal-grade-opt-none')); await P.waitForTimeout(600)
  const pick2 = await gradeOf('prism'); const st2 = await P.evaluate(() => { const e = document.querySelector('[data-testid="bal-grade-prism"]'); const cs = getComputedStyle(e); return { color: cs.color, border: cs.borderTopStyle + ' ' + cs.borderTopColor } })
  await shotD(w, '34-no-grade')
  rec('A32c pick "No grade"', S, ok(/No grade/.test(pick2 || '')), `box "${pick2}" style ${JSON.stringify(st2)}`, ['34-no-grade'])
  await L.undo(w); await L.undo(w)
  rec('A32d Undo twice restores the grade', S, ok((await gradeOf('prism')) === gRec0), `box "${await gradeOf('prism')}" (was "${gRec0}")`, [])
  await press(w, T('bal-grade-prism')); await P.waitForTimeout(300); await P.keyboard.press('Escape'); await P.waitForTimeout(300)
  rec('A32e Escape closes the list, focus back on the box', S, ok(!(await vis(P, T('bal-grade-list'))) && (await A.focusId(P)) === 'bal-grade-prism'), `list open ${await vis(P, T('bal-grade-list'))}; focus ${await A.focusId(P)}`, [])

  /* the lock */
  await press(w, T('bal-lock')); await P.waitForTimeout(500)
  const on = await P.locator(T('bal-lock')).getAttribute('aria-checked'), onTxt = await txt(P, T('bal-lock'))
  await shotD(w, '35-lock-on')
  // admin keeps his boxes while locked (scn 47)
  const bx = await P.locator('[data-testid="bal-row-bane"] input').count()
  await typeInBox(w, T('bal-LVE-bane'), 14)
  const adm = await balRow(P, 'bane')
  rec('A33 lock on (beside m5c-c3-lock); admin keeps his boxes and can still type (scn 47)', S, ok(on === 'true' && bx === 7 && adm.app === '14'), `aria-checked ${on}; button words "${onTxt}"; Ranger's boxes ${bx}; Saber typed Ranger 14 → App ${adm.app}`, ['35-lock-on'])
  await L.undo(w)
  await press(w, T('bal-lock')); await P.waitForTimeout(500)
  const off = await P.locator(T('bal-lock')).getAttribute('aria-checked')
  await shotD(w, '36-lock-off')
  rec('A34 lock off', S, ok(off === 'false'), `aria-checked ${off}`, ['36-lock-off'])
} catch (e) {
  rec('ERROR', S, 'FAIL', String(e).slice(0, 600), [])
  await L.shot(w, 'error').catch(() => {})
}
rec('errors', S, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.join(' || ').slice(0, 900) : 'no console error, page error or 4xx')
L.writeResults('a3')
await w.ctx.close(); await L.closeBrowser()
console.log('DONE')
