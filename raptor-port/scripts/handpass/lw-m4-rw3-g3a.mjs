// Re-walk 3 G3a — a posting that has RUN (Blade posted out from 4 Jan; the war's today is 5 Jan): bids before and after it, in Approvals and in the bid window. Desktop.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk3'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L, pressLoc, lineLoc, lineInfo, approveBtn, refuseBtn, shotLine } = A
const { T, rec, shot, txt, vis, press } = L
console.log('[lw-m4-rw3-g3a v1]')
const w = await L.newCtx('desk'); const P = w.page
const centreCell = async (who, iso) => { await L.reachCell(w, who, iso); await P.evaluate(id => document.querySelector(`[data-testid="${id}"]`)?.scrollIntoView({ block: 'center', inline: 'center' }), L.cellId(who, iso)); await P.waitForTimeout(400) }
const toTop = async () => { await P.keyboard.press('Escape'); await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(400) }
const winApprove = async name => {
  const sheet = P.locator('[data-testid="daylist-sheet"], [data-testid="bid-picker"]')
  await pressLoc(w, sheet.getByRole('button', { name, exact: true }).first()); await P.waitForTimeout(800)
  return P.evaluate(() => { const s = document.querySelector('[data-testid="daylist-sheet"], [data-testid="bid-picker"]'); return s ? { text: s.innerText.replace(/\s+/g, ' ').trim(), btns: [...s.querySelectorAll('button')].filter(b => /^(Approv|Refus)/.test(b.innerText.trim())).map(b => b.innerText.trim() + ':' + b.getAttribute('aria-pressed')) } : null })
}
const why = /He (posts?|posted) out on [0-9]+ [A-Za-z]+: refuse or delete it/i
try {
  await L.signIn(w, 'admin')
  // two pending bids BEFORE the posting date (admin, "Approve what I enter" off)
  await centreCell('slash', '2026-01-01'); const o1 = await A.placeBid(w, 'slash', '2026-01-01', 'LL', 'full', { adminOff: true }); await toTop()
  await centreCell('slash', '2026-01-03'); const o2 = await A.placeBid(w, 'slash', '2026-01-03', 'LL', 'full', { adminOff: true }); await toTop()
  console.log('placed 1 Jan', o1, '3 Jan', o2)
  // post Blade out from 4 Jan
  await centreCell('slash', '2026-01-04'); await L.openCell(w, 'slash', '2026-01-04')
  await press(w, T('bid-more')); await P.waitForTimeout(400)
  await press(w, T('bid-postout')); await P.waitForTimeout(700)
  const poLine = await txt(P, T('po-line')); console.log('post-out line:', poLine)
  await shot(w, 'g3a-0-postout-sheet')
  await press(w, T('po-confirm')); await P.waitForTimeout(900)
  for (let i = 0; i < 3 && (await vis(P, T('bid-picker')) || await vis(P, T('po-confirm')) || await vis(P, T('sheet-scrim'))); i++) { await P.keyboard.press('Escape'); await P.waitForTimeout(500) }
  await toTop(); await L.openApprovals(w); await shot(w, 'g3a-1-approvals')
  const blade = (await L.apprLines(P)).filter(l => l.who === 'slash'); console.log('Blade lines:', JSON.stringify(blade.map(l => l.text)))
  // Approvals: the bid BEFORE (3 Jan) approves
  await pressLoc(w, approveBtn(P, 'Sat 3 Jan')); await P.waitForTimeout(700)
  const i2 = await lineInfo(P, 'Sat 3 Jan'); await shotLine(w, 'g3a-2-appr-before-2jan', 'Sat 3 Jan').catch(() => {})
  console.log('Approvals 3 Jan:', JSON.stringify(i2))
  rec('G3a Approvals: a bid BEFORE the run posting date (3 Jan, posted out 4 Jan) approves', 'desk', i2.ok.p === 'true' ? 'PASS' : 'FAIL', `line "${i2.text}" Approve lit ${i2.ok.p}`, ['g3a-2-appr-before-2jan'])
  // Approvals: a bid AFTER (2 Feb) is refused with the words
  await pressLoc(w, approveBtn(P, 'Mon 2 Feb')); await P.waitForTimeout(700)
  const i3 = await lineInfo(P, 'Mon 2 Feb'); await shotLine(w, 'g3a-3-appr-after-2feb', 'Mon 2 Feb').catch(() => {})
  const why3 = (i3.text.match(why) || [''])[0]
  console.log('Approvals 2 Feb:', JSON.stringify(i3), 'why:', why3)
  rec('G3a Approvals: a bid AFTER the run posting date (2 Feb) is refused "He posted out on 4 Jan: refuse or delete it"', 'desk', /^He posted out on 4 Jan: refuse or delete it/i.test(why3) && i3.ok.p !== 'true' ? 'PASS' : 'FAIL', `line "${i3.text}" Approve lit ${i3.ok.p}; words "${why3}"`, ['g3a-3-appr-after-2feb'])
  await shot(w, 'g3a-3b-approvals-page')
  // the bid window: 1 Jan (before) approves; 2 Feb (after) refused with the same words
  await L.openGrid(w); await centreCell('slash', '2026-01-01'); await L.openCell(w, 'slash', '2026-01-01'); await shot(w, 'g3a-4-window-1jan')
  const w1 = await winApprove('Approve'); await shot(w, 'g3a-5-window-1jan-after-approve'); console.log('window 1 Jan:', JSON.stringify(w1))
  rec('G3a bid window: a bid BEFORE the run posting date (1 Jan) approves', 'desk', w1 && w1.btns.some(b => /^Approved|^Approve:true/.test(b)) ? 'PASS' : 'FAIL', `buttons ${JSON.stringify(w1 && w1.btns)}; text "${w1 && w1.text.slice(0, 200)}"`, ['g3a-4-window-1jan', 'g3a-5-window-1jan-after-approve'])
  await toTop(); await P.keyboard.press('Escape'); await P.waitForTimeout(300)
  await centreCell('slash', '2026-02-02'); await L.openCell(w, 'slash', '2026-02-02'); await shot(w, 'g3a-6-window-2feb')
  const w2 = await winApprove('Approve'); await shot(w, 'g3a-7-window-2feb-after-approve'); console.log('window 2 Feb:', JSON.stringify(w2))
  const why4 = (w2 && w2.text.match(why) || [''])[0]
  rec('G3a bid window: a bid AFTER the run posting date (2 Feb) refused with the same words', 'desk', /^He posted out on 4 Jan: refuse or delete it/i.test(why4) && !(w2.btns || []).some(b => /^Approved|^Approve:true/.test(b)) ? 'PASS' : 'FAIL', `words "${why4}"; buttons ${JSON.stringify(w2 && w2.btns)}; text "${w2 && w2.text.slice(0, 220)}"`, ['g3a-6-window-2feb', 'g3a-7-window-2feb-after-approve'])
} catch (e) { rec('ERROR', 'desk', 'FAIL', String(e).slice(0, 400)); await shot(w, 'g3a-error').catch(() => {}) }
if (w.errs.length) rec('console', 'desk', 'FAIL', w.errs.join(' || ').slice(0, 400))
await w.ctx.close(); L.writeResults('g3a'); await L.closeBrowser(); console.log('DONE')
