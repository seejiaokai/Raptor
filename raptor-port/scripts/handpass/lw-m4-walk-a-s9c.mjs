// Walker A, route 5c: a man posting out in the FUTURE (the app's real today is 27 Oct 26, so a 2027 date is still ahead): Trident's request on 13-16 Apr 27, posted out from 1 Mar 27. Desktop, admin.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/a/s9c'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L, pressLoc, lineLoc, lineInfo, approveBtn, refuseBtn, shotLine } = A
const { T, rec, shot, txt, vis, press } = L
console.log('[lw-m4-walk-a-s9c v1]')
L.clearOut()
const size = 'desk'
const w = await L.newCtx('desk')
const P = w.page
try {
  await L.signIn(w, 'admin')
  await L.openApprovals(w)
  await pressLoc(w, P.locator(T('appr-elsewhere'))); await P.waitForTimeout(800)
  console.log('view now', await txt(P, T('period-label')))
  const before = (await L.apprLines(P)).map(l => l.text)
  console.log('2027 lines', JSON.stringify(before))
  await shot(w, 'a-s9c-0-2027')
  await L.openGrid(w); await P.waitForTimeout(800)
  console.log('view on the grid', await txt(P, T('period-label')))
  await L.openCell(w, 'harpoon', '2027-03-01')
  console.log('bid window', await vis(P, T('bid-picker')), await txt(P, T('bid-picker')))
  await press(w, T('bid-more')); await P.waitForTimeout(400)
  await press(w, T('bid-postout')); await P.waitForTimeout(700)
  console.log('sheet date', await txt(P, T('po-date')), '| line', await txt(P, T('po-line')))
  await shot(w, 'a-s9c-1-sheet')
  await press(w, T('po-confirm')); await P.waitForTimeout(900)
  console.log('after confirm: sheet', await vis(P, T('po-confirm')), 'bid-picker', await vis(P, T('bid-picker')))
  for (let i = 0; i < 3 && (await vis(P, T('bid-picker')) || await vis(P, T('po-confirm'))); i++) { await P.keyboard.press('Escape'); await P.waitForTimeout(500) }
  await shot(w, 'a-s9c-2-after-confirm')
  await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(300)
  await L.openApprovals(w)
  console.log('view', await txt(P, T('period-label')))
  const lines = (await L.apprLines(P)).map(l => l.text)
  console.log('lines', JSON.stringify(lines))
  await shot(w, 'a-s9c-3-approvals')
  await shotLine(w, 'a-s9c-13-posting-out-line', 'Apr').catch(() => {})
  const tagged = lines.some(t => /Trident/.test(t) && /PO|posting out/i.test(t))
  await pressLoc(w, approveBtn(P, '13 – Fri 16 Apr')); await P.waitForTimeout(600)
  const bi = await lineInfo(P, '13 – Fri 16 Apr')
  await shotLine(w, 'a-s9c-13-posting-out-after-approve', '13 – Fri 16 Apr').catch(() => {})
  await shot(w, 'a-s9c-4-after-approve')
  console.log('after Approve:', JSON.stringify(bi))
  rec('12g a man posting out in the future: the line is tagged "posting out ..."', size, tagged ? 'PASS' : 'FAIL', `lines: ${JSON.stringify(lines)}`, ['a-s9c-3-approvals', 'a-s9c-13-posting-out-line'])
  rec('12h Approve on his line (requests after the posting-out date) says "Posted out — refuse or delete it"', size, /Posted out/.test(bi.text) && bi.ok.p !== 'true' ? 'PASS' : 'FAIL', `line after Approve: "${bi.text}"; Approve pressed ${bi.ok.p}`, ['a-s9c-4-after-approve', 'a-s9c-13-posting-out-after-approve'])
  /* Refuse is dimmed while Approve is lit (read above): first Approve back to pending, then Refuse */
  const dimmed = (await lineInfo(P, '13 – Fri 16 Apr')).no.dis
  await pressLoc(w, approveBtn(P, '13 – Fri 16 Apr')); await P.waitForTimeout(500)
  const afterSecond = await lineInfo(P, '13 – Fri 16 Apr')
  console.log('Refuse dimmed while Approve lit:', dimmed, '| after the second Approve tap:', JSON.stringify(afterSecond.ok), JSON.stringify(afterSecond.no))
  await shot(w, 'a-s9c-5a-after-second-approve-tap')
  await pressLoc(w, refuseBtn(P, '13 – Fri 16 Apr')); await P.waitForTimeout(600)
  const bi2 = await lineInfo(P, '13 – Fri 16 Apr')
  await shotLine(w, 'a-s9c-5-refused', '13 – Fri 16 Apr').catch(() => {})
  rec('12i Refuse works on his line', size, bi2.no.p === 'true' ? 'PASS' : 'FAIL', `line: "${bi2.text}"; Refuse ${JSON.stringify(bi2.no)}; Approve ${JSON.stringify(bi2.ok)}`, ['a-s9c-5-refused'])
} catch (e) {
  rec('ERROR', size, 'FAIL', String(e).slice(0, 500))
  await shot(w, 'a-s9c-error').catch(() => {})
}
console.log('errs', JSON.stringify(w.errs))
L.writeResults('s9c')
await w.ctx.close(); await L.closeBrowser()
console.log('DONE')
