// Re-walk 2 F3 — a lit line changed elsewhere (M7): approve a line, tap its dates, put that leave back to a bid on the grid, Back.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk2'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L, lineLoc, approveBtn, refuseBtn, pressLoc, lineInfo, shotLine } = A
const { T, rec, shot, txt, vis, press } = L
console.log('[lw-m4-rw2-f3 v1]')
const D = 'Thu 8 Jan'
async function run(variant) {
  const w = await L.newCtx('desk'); const P = w.page
  const tag = 'f3' + variant
  const linesFor = async () => (await L.apprLines(P)).filter(l => l.text.includes(D))
  try {
    await L.signIn(w, 'admin'); await L.openApprovals(w)
    const l0 = await linesFor(); const who = l0[0].who
    console.log(variant, 'start lines for', D, JSON.stringify(l0))
    if (variant === 'a') await pressLoc(w, approveBtn(P, D)); else await pressLoc(w, refuseBtn(P, D))
    await P.waitForTimeout(500)
    const l1 = await linesFor(); await shotLine(w, `${tag}-1-lit`, D)
    console.log(variant, 'after decide', JSON.stringify(l1))
    await pressLoc(w, lineLoc(P, D).locator('[data-testid="appr-dates"]')); await P.waitForTimeout(1200)
    await shot(w, `${tag}-2-grid`)
    await L.openCell(w, who, '2026-01-08'); await P.waitForTimeout(500)
    await shot(w, `${tag}-3-window`)
    const wt = (await txt(P, T('bid-picker'))) || (await txt(P, T('daylist-sheet')))
    console.log(variant, 'window before put back:', wt)
    if (variant === 'a') {
      // second tap on the lit Approve sends the leave back to waiting
      const b = P.locator(`${T('bid-picker')} ${T('decide-approve')}, ${T('daylist-sheet')} [data-testid^="dl-approve-"]`).first()
      await b.click(); await P.waitForTimeout(700)
    } else {
      // second tap on the lit Refuse sends it back to waiting
      const b = P.locator(`${T('bid-picker')} ${T('decide-refuse')}, ${T('daylist-sheet')} [data-testid^="dl-refuse-"]`).first()
      await b.click(); await P.waitForTimeout(700)
    }
    await shot(w, `${tag}-4-window-after`)
    const wt2 = (await txt(P, T('bid-picker'))) || (await txt(P, T('daylist-sheet')))
    console.log(variant, 'window after put back:', wt2)
    // close the window
    for (let i = 0; i < 3 && (await vis(P, T('bid-picker')) || await vis(P, T('daylist-sheet'))); i++) { const x = P.locator(`${T('bid-picker')} button:has-text("✕"), ${T('daylist-sheet')} button:has-text("✕")`).first(); if (await x.count()) await x.click(); else await P.keyboard.press('Escape'); await P.waitForTimeout(400) }
    await shot(w, `${tag}-5-grid-before-back`)
    await press(w, T('appr-back')); await P.waitForTimeout(900)
    await shot(w, `${tag}-6-after-back`)
    const l2 = await linesFor(); await shotLine(w, `${tag}-7-line`, D).catch(() => {})
    const info = await lineInfo(P, D).catch(() => null)
    console.log(variant, 'after Back', JSON.stringify(l2), JSON.stringify(info))
    const notLit = l2.length >= 1 && l2.every(l => l.lit === '')
    rec(`F3${variant} a line ${variant === 'a' ? 'approved' : 'refused'} here, put back to a bid on the grid, Back: no longer lit, shown once`, 'desk',
      l2.length === 1 && notLit && info && info.ok.p === 'false' && info.no.p === 'false' ? 'PASS' : 'FAIL',
      `lines for ${D} after Back: ${JSON.stringify(l2)}; buttons ${JSON.stringify(info && [info.ok, info.no])}; window after put-back "${(wt2 || '').slice(0, 160)}"`, [`${tag}-6-after-back`, `${tag}-7-line`])
  } catch (e) { rec('ERROR ' + variant, 'desk', 'FAIL', String(e).slice(0, 400)); await shot(w, tag + '-error').catch(() => {}) }
  if (w.errs.length) rec('console ' + variant, 'desk', 'FAIL', w.errs.join(' || ').slice(0, 400))
  await w.ctx.close()
}
await run('a')
await run('b')
L.writeResults('f3'); await L.closeBrowser(); console.log('DONE')
