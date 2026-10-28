// Walker A, route 5b: a posted-out man on Approvals, two ways: posted out AFTER his requests (1 Mar) and BEFORE them (15 Jan). Fresh admin world each. Desktop.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/a/s9b'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L, pressLoc, lineLoc, lineInfo, approveBtn, refuseBtn, shotLine } = A
const { T, rec, shot, txt, vis, press } = L
console.log('[lw-m4-walk-a-s9b v1]')
L.clearOut()
const size = 'desk'
async function oneCase(label, poIso, outcomeBtn) {
  const w = await L.newCtx('desk')
  const P = w.page
  await L.signIn(w, 'admin')
  await L.openCell(w, 'slash', poIso)
  await press(w, T('bid-more')); await P.waitForTimeout(400)
  await press(w, T('bid-postout')); await P.waitForTimeout(700)
  const dateTxt = await txt(P, T('po-date'))
  const lineTxt = await txt(P, T('po-line'))
  if (outcomeBtn) { await press(w, T(outcomeBtn)); await P.waitForTimeout(300) }
  const lineTxt2 = await txt(P, T('po-line'))
  await shot(w, `a-s9b-${label}-sheet`)
  await press(w, T('po-confirm')); await P.waitForTimeout(900)
  await shot(w, `a-s9b-${label}-after-confirm`)
  console.log(label, 'after confirm: po-confirm visible', await vis(P, T('po-confirm')), 'bid-picker', await vis(P, T('bid-picker')), 'scrim', await vis(P, T('sheet-scrim')), 'text', await txt(P, T('po-line')))
  for (let i = 0; i < 3 && (await vis(P, T('bid-picker')) || await vis(P, T('po-confirm')) || await vis(P, T('sheet-scrim'))); i++) { await P.keyboard.press('Escape'); await P.waitForTimeout(500) }
  await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(300)
  await L.openApprovals(w)
  const lines = (await L.apprLines(P)).filter(l => l.who === 'slash').map(l => l.text)
  const html = await P.evaluate(() => { const l = document.querySelector('[data-testid="appr-line-slash"]'); return l ? l.innerHTML.replace(/ style="[^"]*"/g, '').slice(0, 900) : null })
  await shot(w, `a-s9b-${label}-approvals`)
  await shotLine(w, `a-s9b-${label}-line`, 'Mon 2 Feb').catch(() => {})
  await pressLoc(w, approveBtn(P, 'Mon 2 Feb')); await P.waitForTimeout(600)
  const bi = await lineInfo(P, 'Mon 2 Feb')
  await shotLine(w, `a-s9b-${label}-after-approve`, 'Mon 2 Feb').catch(() => {})
  await shot(w, `a-s9b-${label}-after-approve-page`)
  console.log(label, '\n  sheet date', dateTxt, '| line', lineTxt, '->', lineTxt2, '\n  Blade lines', JSON.stringify(lines), '\n  after Approve', JSON.stringify(bi.text), bi.ok.p, '\n  html', html)
  if (w.errs.length) console.log('errs', w.errs)
  await w.ctx.close()
  return { lines, bi }
}
const late = await oneCase('po-1mar', '2026-03-01', null)
const early = await oneCase('po-15jan', '2026-01-15', null)
const del = await oneCase('po-15jan-delete', '2026-01-15', 'po-delete')
rec('12d posting out on 1 Mar (after his February requests): the tag', size, late.lines.some(t => /PO|posting out/i.test(t)) ? 'PASS' : 'FAIL', `Blade lines: ${JSON.stringify(late.lines)}; after Approve: "${late.bi.text}"`, ['a-s9b-po-1mar-approvals', 'a-s9b-po-1mar-line'])
rec('12e posting out on 15 Jan (before his February requests): the tag and the refusal', size, early.lines.some(t => /PO|posting out/i.test(t)) && /Posted out/.test(early.bi.text) ? 'PASS' : 'FAIL', `Blade lines: ${JSON.stringify(early.lines)}; after Approve: "${early.bi.text}"; Approve pressed ${early.bi.ok.p}`, ['a-s9b-po-15jan-approvals', 'a-s9b-po-15jan-after-approve'])
rec('12f posting out (Delete) on 15 Jan: the tag and the refusal', size, del.lines.some(t => /PO|posting out|auto delete/i.test(t)) && /Posted out/.test(del.bi.text) ? 'PASS' : 'FAIL', `Blade lines: ${JSON.stringify(del.lines)}; after Approve: "${del.bi.text}"; Approve pressed ${del.bi.ok.p}`, ['a-s9b-po-15jan-delete-approvals', 'a-s9b-po-15jan-delete-after-approve'])
L.writeResults('s9b')
await L.closeBrowser()
console.log('DONE')
