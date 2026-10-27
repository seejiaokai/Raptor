// Re-walk 3 probe — geometry of the open "Pick dates…" calendar and the first lines at 402 and 440 wide (phone).
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk3'
const B = await import('./lw-m4-walk-b-lib.mjs')
const { L, T, shot } = B
console.log('[lw-m4-rw3-probe v1]')
for (const width of [402, 440]) {
  const w = await B.newPhone(width, 874, 'chromium'); const P = w.page
  try {
    await L.signIn(w, 'admin'); await L.openApprovals(w); await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(300)
    await L.press(w, T('appr-pick')); await P.waitForTimeout(700)
    await shot(w, `probe-${width}-open`)
    const g = await P.evaluate(() => {
      const r = e => { const b = e.getBoundingClientRect(); return [b.left, b.top, b.right, b.bottom].map(Math.round) }
      const rg = document.querySelector('[data-testid="appr-range"]')
      const ls = [...document.querySelectorAll('[data-testid="approvals-page"] .appr-line')].filter(e => e.getBoundingClientRect().height > 0)
      return { vw: innerWidth, scrollY: scrollY, range: r(rg), rangeParent: rg.parentElement ? [rg.parentElement.className, r(rg.parentElement)] : null,
        lines: ls.slice(0, 4).map(l => ({ line: r(l), ok: r(l.querySelector('.appr-ok')), no: r(l.querySelector('.appr-no')), text: l.innerText.replace(/\s+/g, ' ').slice(0, 60) })),
        head: document.querySelector('[data-testid="appr-sub"]')?.innerText, grid: !!document.querySelector('[data-testid="lw-tab-grid"]'), gridTab: (() => { const t = document.querySelector('[data-testid="lw-tab-grid"]'); return t ? r(t) : null })() }
    })
    console.log(width, JSON.stringify(g))
  } catch (e) { console.log('ERR', e) }
  await w.ctx.close()
}
await B.closeAll()
