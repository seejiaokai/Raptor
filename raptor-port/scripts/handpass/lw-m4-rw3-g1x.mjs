// Re-walk 3 G1 extra — (b) again with the tap right under the calendar card (above the column headings), 402 wide, by finger.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk3'
const B = await import('./lw-m4-walk-b-lib.mjs')
const { L, T, shot, rec } = B
console.log('[lw-m4-rw3-g1x v1]')
const w = await B.newPhone(402, 874, 'chromium'); const P = w.page
const snap = () => P.evaluate(() => ({ head: document.querySelector('[data-testid="appr-sub"]')?.innerText.trim(), tab: document.querySelector('[data-testid="lw-approvals-count"]')?.innerText.trim(), open: !!document.querySelector('[data-testid="appr-range"]') && document.querySelector('[data-testid="appr-range"]').getBoundingClientRect().height > 0, lines: [...document.querySelectorAll('[data-testid="approvals-page"] .appr-line')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.className.match(/lit-(\w+)/)?.[1] || '-').join(',') }))
try {
  await L.signIn(w, 'admin'); await B.openApprovals(w); await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(300)
  await B.press(w, T('appr-pick')); await P.waitForTimeout(700)
  const s0 = await snap()
  for (const y of [714, 722]) {
    const hit = await P.evaluate(y => { const h = document.elementFromPoint(281, y); return h ? h.tagName + '.' + String(h.className).slice(0, 40) + ' "' + (h.innerText || '').slice(0, 20) + '"' : null }, y)
    await shot(w, `g1x-${y}-before`)
    await B.tapAt(w, 281, y, `g1x-${y}-q`); await P.waitForTimeout(900); await shot(w, `g1x-${y}-after`)
    const s = await snap(); console.log(y, hit, JSON.stringify(s0), '->', JSON.stringify(s))
    rec(`G1b' tap just under the calendar card at y ${y} (x 281 = line 1 Approve)`, 'phone402', s.lines === s0.lines && s.head === s0.head && s.tab === s0.tab ? 'PASS' : 'FAIL', `hit ${hit}; open ${s0.open} -> ${s.open}; after ${JSON.stringify(s)}`, [`g1x-${y}-before`, `g1x-${y}-q`, `g1x-${y}-after`])
    if (!s.open) { await P.evaluate(() => window.scrollTo(0, 0)); await B.press(w, T('appr-pick')); await P.waitForTimeout(700) }
  }
} catch (e) { rec('ERROR', 'phone402', 'FAIL', String(e).slice(0, 300)) }
if (w.errs.length) rec('console', 'phone402', 'FAIL', w.errs.join(' || ').slice(0, 300))
await w.ctx.close(); L.writeResults('g1x'); await B.closeAll(); console.log('DONE')
