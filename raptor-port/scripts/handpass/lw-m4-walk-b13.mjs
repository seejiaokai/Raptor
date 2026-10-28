// Walker B: does a line's Approve / Refuse move or change width when lit (a control tapped repeatedly must not move)? Chromium 402 and WebKit 402.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/b'
const B = await import('./lw-m4-walk-b-lib.mjs')
const { T, shot, rec } = B
console.log('[lw-m4-walk-b13 v1]')
for (const engine of ['chromium', 'webkit']) {
  const w = await B.newPhone(402, 874, engine)
  const P = w.page
  try {
    await B.signIn(w, 'admin'); await B.openApprovals(w)
    await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 300)
    const rects = () => P.evaluate(() => { const l = document.querySelector('[data-testid="approvals-page"] [data-testid^="appr-line-"]'); const g = s => { const e = l.querySelector(`[data-testid="${s}"]`); if (!e) return null; const r = e.getBoundingClientRect(); return { l: Math.round(r.left * 10) / 10, r: Math.round(r.right * 10) / 10, t: Math.round(r.top), w: Math.round(r.width * 10) / 10 } }; return { dates: g('appr-dates'), approve: g('appr-approve'), refuse: g('appr-refuse'), lineTop: Math.round(l.getBoundingClientRect().top), lineH: Math.round(l.getBoundingClientRect().height) } })
    const clipTop = await P.evaluate(() => Math.round(document.querySelector('[data-testid="approvals-page"] [data-testid^="appr-line-"]').getBoundingClientRect().top))
    const r0 = await rects()
    await shot(w, `s13-${engine}-before`, { scale: 'device', clip: { x: 0, y: clipTop - 6, width: 402, height: 92 } })
    await B.press(w, `${T('approvals-page')} [data-testid^="appr-line-"] ${T('appr-approve')}`, `s13-${engine}-q`); await B.sleep(w, 500)
    const r1 = await rects()
    await shot(w, `s13-${engine}-approved`, { scale: 'device', clip: { x: 0, y: clipTop - 6, width: 402, height: 92 } })
    await B.press(w, `${T('approvals-page')} [data-testid^="appr-line-"] ${T('appr-approve')}`); await B.sleep(w, 500)
    const r2 = await rects()
    console.log(engine, 'before', JSON.stringify(r0)); console.log(engine, 'lit', JSON.stringify(r1)); console.log(engine, 'back', JSON.stringify(r2))
    const moved = Math.abs(r1.approve.l - r0.approve.l) > 0.5 || Math.abs(r1.approve.w - r0.approve.w) > 0.5 || Math.abs(r1.dates.l - r0.dates.l) > 0.5 || Math.abs(r1.refuse.l - r0.refuse.l) > 0.5
    rec(`S13 lit Approve keeps its box [${engine}]`, '402', !moved ? 'PASS' : 'FAIL', `Approve ${r0.approve.l}-${r0.approve.r} (w ${r0.approve.w}) -> lit ${r1.approve.l}-${r1.approve.r} (w ${r1.approve.w}); Refuse ${r0.refuse.l} -> ${r1.refuse.l}; dates ${r0.dates.l} -> ${r1.dates.l}; second tap back to ${r2.approve.l}-${r2.approve.r}`, [`s13-${engine}-before.png`, `s13-${engine}-q.png`, `s13-${engine}-approved.png`])
  } catch (e) { rec('ERROR ' + engine, '402', 'FAIL', String(e).slice(0, 300)) }
  if (w.errs.length) rec('console ' + engine, '402', 'FAIL', w.errs.join(' || ').slice(0, 400))
  await w.ctx.close()
}
B.writeResults('s13')
await B.closeAll()
console.log('DONE')
