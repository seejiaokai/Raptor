// Re-walk A7 — the posting-out refusal (D1436), in Approvals and in the bid window; a leave before the date approves; a SANS man's leave approves.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk/a'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L, placeBid, pressLoc, lineLoc, lineInfo, approveBtn, refuseBtn, shotLine } = A
const { T, rec, shot, txt, vis, press } = L
console.log('[lw-m4-rw-a7 v1]')
const centreCell = async (w, who, iso) => { await L.reachCell(w, who, iso); await w.page.evaluate(id => document.querySelector(`[data-testid="${id}"]`)?.scrollIntoView({ block: 'center', inline: 'center' }), L.cellId(who, iso)); await w.page.waitForTimeout(400) }
async function postOut(w, who, iso, outcomeId) {
  const P = w.page
  await centreCell(w, who, iso)
  await L.openCell(w, who, iso)
  await press(w, T('bid-more')); await P.waitForTimeout(400)
  await press(w, T('bid-postout')); await P.waitForTimeout(700)
  const ids = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="po-"]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.dataset.testid))
  console.log('   post-out sheet test ids:', ids.join(' '))
  if (outcomeId) { await press(w, T(outcomeId)); await P.waitForTimeout(300) }
  const line = await txt(P, T('po-line'))
  await press(w, T('po-confirm')); await P.waitForTimeout(900)
  for (let i = 0; i < 3 && (await vis(P, T('bid-picker')) || await vis(P, T('po-confirm')) || await vis(P, T('sheet-scrim'))); i++) { await P.keyboard.press('Escape'); await P.waitForTimeout(500) }
  return { ids, line }
}
const toTop = async w => { await w.page.keyboard.press('Escape'); await w.page.evaluate(() => { window.scrollTo(0, 0) }); await w.page.waitForTimeout(400) }
/* ---- case 1: Blade (slash), pending leaves 2 Feb and 3 Feb PM; add one on 12 Jan; post out from 15 Jan (default outcome) ---- */
{
  const w = await L.newCtx('desk'); const P = w.page
  try {
    await L.signIn(w, 'admin')
    await centreCell(w, 'slash', '2026-01-12')
    const ok = await placeBid(w, 'slash', '2026-01-12', 'LL', 'full', { adminOff: true })
    rec('A7.0 a pending LL of Blade on Mon 12 Jan (before the date)', 'desk', ok ? 'PASS' : 'NOT WALKED', `placed ${ok}`, [])
    const po = await postOut(w, 'slash', '2026-01-15', null)
    console.log('   sheet line:', po.line)
    await toTop(w); await L.openApprovals(w)
    await shot(w, 'a7-1-approvals')
    const lines = (await L.apprLines(P)).filter(l => l.who === 'slash').map(l => l.text)
    console.log('   Blade lines:', JSON.stringify(lines))
    const dates = ['Mon 12 Jan', 'Mon 2 Feb']
    await shotLine(w, 'a7-2-line-before-12jan', dates[0]).catch(() => {}); await shotLine(w, 'a7-2-line-before-2feb', dates[1]).catch(() => {})
    await pressLoc(w, approveBtn(P, dates[0])); await P.waitForTimeout(600)
    const i12 = await lineInfo(P, dates[0]); await shotLine(w, 'a7-3-12jan-approve', dates[0]).catch(() => {})
    rec('A7.1 a leave of his BEFORE the date (12 Jan) approves', 'desk', i12.ok.p === 'true' && !/Posted out/.test(i12.text) ? 'PASS' : 'FAIL', `line "${i12.text}" Approve pressed ${i12.ok.p}`, ['a7-3-12jan-approve'])
    await pressLoc(w, approveBtn(P, dates[1])); await P.waitForTimeout(600)
    const i2 = await lineInfo(P, dates[1]); await shotLine(w, 'a7-4-2feb-approve', dates[1]).catch(() => {})
    await shot(w, 'a7-4-page')
    rec('A7.2 Approve on a leave AFTER the date is refused with its reason, in Approvals', 'desk', /Posted out/.test(i2.text) && i2.ok.p !== 'true' ? 'PASS' : 'FAIL', `line "${i2.text}" Approve pressed ${i2.ok.p}; note "${i2.note}"`, ['a7-4-2feb-approve'])
    await pressLoc(w, refuseBtn(P, dates[1])); await P.waitForTimeout(600)
    const r2 = await lineInfo(P, dates[1]); await shotLine(w, 'a7-5-2feb-refuse', dates[1]).catch(() => {})
    rec('A7.3 Refuse still works on that line', 'desk', r2.no.p === 'true' ? 'PASS' : 'FAIL', `line "${r2.text}" Refuse pressed ${r2.no.p}`, ['a7-5-2feb-refuse'])
    // the bid window on the other leave after the date (3 Feb PM): Approve refused the same way
    await L.openGrid(w); await centreCell(w, 'slash', '2026-02-03'); await L.openCell(w, 'slash', '2026-02-03')
    await shot(w, 'a7-6-bidwin-3feb')
    const wintxt = await txt(P, T('bid-picker'))
    await press(w, T('decide-approve')); await P.waitForTimeout(700)
    await shot(w, 'a7-7-bidwin-after-approve')
    const wintxt2 = await txt(P, T('bid-picker'))
    const lit = await P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-picker"] [data-testid^="decide-"]')].map(b => b.dataset.testid + ':' + b.getAttribute('aria-pressed')))
    console.log('   window before:', wintxt && wintxt.slice(0, 200), '\n   window after Approve:', wintxt2 && wintxt2.slice(0, 260), JSON.stringify(lit))
    rec('A7.4 in the bid window on that leave Approve is refused the same way', 'desk', /Posted out|posts out/i.test(wintxt2 || '') && !lit.some(x => /approve:true/.test(x)) ? 'PASS' : 'FAIL', `after Approve: "${(wintxt2 || '').slice(0, 220)}" lit ${JSON.stringify(lit)}`, ['a7-6-bidwin-3feb', 'a7-7-bidwin-after-approve'])
  } catch (e) { rec('ERROR case1', 'desk', 'FAIL', String(e).slice(0, 300)); await shot(w, 'a7-error1').catch(() => {}) }
  if (w.errs.length) rec('console', 'desk', 'FAIL', w.errs.join(' || ').slice(0, 400))
  await w.ctx.close()
}
/* ---- case 2: Blade posted out as SANS from 15 Jan: his February leave approves ---- */
{
  const w = await L.newCtx('desk'); const P = w.page
  try {
    await L.signIn(w, 'admin')
    const po = await postOut(w, 'slash', '2026-01-15', 'po-sans')
    console.log('   (SANS) sheet line:', po.line)
    await toTop(w)
    if (!po.ids.includes('po-sans')) { rec('A7.5 SANS posting out', 'desk', 'NOT WALKED', `no po-sans control; ids ${po.ids.join(' ')}`, []) }
    else {
      await L.openApprovals(w)
      await shot(w, 'a7-8-sans-approvals')
      const lines = (await L.apprLines(P)).filter(l => l.who === 'slash').map(l => l.text)
      console.log('   (SANS) Blade lines:', JSON.stringify(lines))
      if (!lines.length) rec('A7.5 SANS posting out', 'desk', 'NOT WALKED', 'his lines are not on the Approvals list after posting out as SANS (SANS off the war)', ['a7-8-sans-approvals'])
      else {
        await pressLoc(w, approveBtn(P, 'Mon 2 Feb')); await P.waitForTimeout(600)
        const i = await lineInfo(P, 'Mon 2 Feb'); await shotLine(w, 'a7-9-sans-approve', 'Mon 2 Feb').catch(() => {})
        rec('A7.5 a man posted out as SANS, leave after his date: Approve works', 'desk', i.ok.p === 'true' && !/Posted out/.test(i.text) ? 'PASS' : 'FAIL', `line "${i.text}" Approve pressed ${i.ok.p}`, ['a7-9-sans-approve'])
      }
    }
  } catch (e) { rec('ERROR case2', 'desk', 'FAIL', String(e).slice(0, 300)); await shot(w, 'a7-error2').catch(() => {}) }
  if (w.errs.length) rec('console', 'desk', 'FAIL', w.errs.join(' || ').slice(0, 400))
  await w.ctx.close()
}
L.writeResults('a7'); await L.closeBrowser(); console.log('DONE')
