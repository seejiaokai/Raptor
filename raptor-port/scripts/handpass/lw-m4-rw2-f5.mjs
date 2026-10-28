// Re-walk 2 F5 — posting out (M5): one rule in Approvals and in the bid window. desk: to come (15 Jan) and run (3 Jan); phone: to come.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk2'
const A = await import('./lw-m4-walk-a-lib.mjs')
const B = await import('./lw-m4-walk-b-lib.mjs')
const { L, pressLoc, lineLoc, lineInfo, approveBtn, refuseBtn, shotLine } = A
const { T, rec, shot, txt, vis, press } = L
console.log('[lw-m4-rw2-f5 v1]')
async function run(size, poIso, label) {
  const w = size === 'phone' ? await B.newPhone(402, 874, 'chromium') : await L.newCtx('desk'); const P = w.page
  const tag = `f5${size[0]}-${label}`
  const centreCell = async (who, iso) => { await L.reachCell(w, who, iso); await P.evaluate(id => document.querySelector(`[data-testid="${id}"]`)?.scrollIntoView({ block: 'center', inline: 'center' }), L.cellId(who, iso)); await P.waitForTimeout(400) }
  const toTop = async () => { await P.keyboard.press('Escape'); await P.evaluate(() => { window.scrollTo(0, 0) }); await P.waitForTimeout(400) }
  try {
    await L.signIn(w, 'admin')
    // post Blade out from poIso (default outcome)
    await centreCell('slash', poIso); await L.openCell(w, 'slash', poIso)
    await press(w, T('bid-more')); await P.waitForTimeout(400)
    await press(w, T('bid-postout')); await P.waitForTimeout(700)
    const poLine = await txt(P, T('po-line'))
    await shot(w, `${tag}-0-postout-sheet`)
    await press(w, T('po-confirm')); await P.waitForTimeout(900)
    for (let i = 0; i < 3 && (await vis(P, T('bid-picker')) || await vis(P, T('po-confirm')) || await vis(P, T('sheet-scrim'))); i++) { await P.keyboard.press('Escape'); await P.waitForTimeout(500) }
    console.log(tag, 'post-out sheet line:', poLine)
    await toTop(); await L.openApprovals(w)
    await shot(w, `${tag}-1-approvals`)
    const blade = (await L.apprLines(P)).filter(l => l.who === 'slash').map(l => l.text)
    console.log(tag, 'Blade lines:', JSON.stringify(blade))
    const D = 'Mon 2 Feb'
    // Approvals: Approve on a leave after the date
    const ap = size === 'phone' ? lineLoc(P, '2 Feb').locator('[data-testid="appr-approve"]') : approveBtn(P, D)
    const lloc = size === 'phone' ? lineLoc(P, '2 Feb') : lineLoc(P, D)
    await pressLoc(w, ap, size === 'phone' ? `${tag}-2-approve-q` : null); await P.waitForTimeout(700)
    const info = await lloc.evaluate(e => ({ text: e.innerText.replace(/\s+/g, ' ').trim(), ok: e.querySelector('.appr-ok')?.getAttribute('aria-pressed'), why: e.querySelector('[data-testid="appr-why"]')?.innerText || '' }))
    const lb = await lloc.boundingBox(); await shot(w, `${tag}-2-approvals-after-approve`, { clip: { x: 0, y: Math.max(0, lb.y - 10), width: size === 'phone' ? 402 : 1536, height: lb.height + 40 } })
    console.log(tag, 'Approvals after Approve:', JSON.stringify(info))
    // Refuse still works there
    await pressLoc(w, size === 'phone' ? lineLoc(P, '2 Feb').locator('[data-testid="appr-refuse"]') : refuseBtn(P, D)); await P.waitForTimeout(600)
    const rinfo = await lloc.evaluate(e => ({ no: e.querySelector('.appr-no')?.getAttribute('aria-pressed'), text: e.innerText.replace(/\s+/g, ' ').trim() }))
    // undo the refusal so the bid window case starts from a pending bid: tap the lit Refuse again
    await pressLoc(w, size === 'phone' ? lineLoc(P, '2 Feb').locator('[data-testid="appr-refuse"]') : refuseBtn(P, D)); await P.waitForTimeout(600)
    // the bid window on that leave
    await L.openGrid(w); await centreCell('slash', '2026-02-02'); await L.openCell(w, 'slash', '2026-02-02', size === 'phone' ? `${tag}-3-window-q` : null)
    await shot(w, `${tag}-3-bidwin`)
    const wbtns = await P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-picker"] button, [data-testid="daylist-sheet"] button')].filter(b => b.getBoundingClientRect().height > 0).map(b => b.innerText.trim()).filter(t => /^(Approve|Refuse)/.test(t)))
    console.log(tag, 'window buttons', JSON.stringify(wbtns), 'decide ids', await P.evaluate(() => [...document.querySelectorAll('[data-testid^="decide-"]')].map(e => e.dataset.testid)))
    await pressLoc(w, P.locator('[data-testid="daylist-sheet"], [data-testid="bid-picker"]').getByRole('button', { name: 'Approve', exact: true }).first(), size === 'phone' ? `${tag}-4-win-approve-q` : null); await P.waitForTimeout(800)
    await shot(w, `${tag}-4-bidwin-after-approve`)
    const wt = (await txt(P, T('daylist-sheet'))) || (await txt(P, T('bid-picker')))
    const lit = await P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-picker"] button, [data-testid="daylist-sheet"] button')].filter(b => /^(Approve|Refuse)/.test(b.innerText.trim())).map(b => b.innerText.trim() + ':' + b.getAttribute('aria-pressed')))
    console.log(tag, 'window after Approve:', wt && wt.slice(0, 260), JSON.stringify(lit))
    const apWords = (info.why || info.text).match(/(posts? out|posted out)[^.]*?(refuse or delete it)/i)?.[0] || ''
    const winWords = (wt || '').match(/(posts? out|posted out)[^.]*?(refuse or delete it)/i)?.[0] || ''
    rec(`F5.${label} ${size}: Approvals refuses Approve on a leave after the posting date, with its reason`, size, /(posts? out|posted out)/i.test(info.text) && info.ok !== 'true' ? 'PASS' : 'FAIL', `line "${info.text}" Approve lit ${info.ok}; why "${info.why}"`, [`${tag}-2-approvals-after-approve`])
    rec(`F5.${label} ${size}: Refuse still works in Approvals on it`, size, rinfo.no === 'true' ? 'PASS' : 'FAIL', JSON.stringify(rinfo), [])
    rec(`F5.${label} ${size}: the bid window refuses Approve with the SAME words as Approvals`, size, winWords && winWords.toLowerCase() === apWords.toLowerCase() && !lit.some(x => /^Approved|^Approve:true/.test(x)) ? 'PASS' : 'FAIL', `Approvals words "${apWords}" / window words "${winWords}"; window lit ${JSON.stringify(lit)}; window text "${(wt || '').slice(0, 200)}"`, [`${tag}-4-bidwin-after-approve`])
    // a leave BEFORE the date approves (only to-come case: 12 Jan before 15 Jan) — checked in the desk to-come case below
    if (label === 'tocome' && size === 'desk') {
      await L.closeWin(w); await P.keyboard.press('Escape'); await toTop()
      const ok = await A.placeBid(w, 'slash', '2026-01-12', 'LL', 'full', { adminOff: true })
      await toTop(); await L.openApprovals(w)
      await pressLoc(w, approveBtn(P, 'Mon 12 Jan')); await P.waitForTimeout(600)
      const i12 = await lineInfo(P, 'Mon 12 Jan'); await shotLine(w, `${tag}-5-12jan`, 'Mon 12 Jan').catch(() => {})
      rec('F5.tocome desk: a leave BEFORE the posting date approves', 'desk', ok && i12.ok.p === 'true' ? 'PASS' : (ok ? 'FAIL' : 'NOT WALKED'), `placed ${ok}; line "${i12.text}" lit ${i12.ok.p}`, [`${tag}-5-12jan`])
    }
  } catch (e) { rec('ERROR ' + tag, size, 'FAIL', String(e).slice(0, 400)); await shot(w, tag + '-error').catch(() => {}) }
  if (w.errs.length) rec('console ' + tag, size, 'FAIL', w.errs.join(' || ').slice(0, 400))
  await w.ctx.close()
}
await run('desk', '2026-01-15', 'tocome')
await run('desk', '2026-01-03', 'run')
await run('phone', '2026-01-15', 'tocome')
L.writeResults('f5'); await B.closeAll(); console.log('DONE')
