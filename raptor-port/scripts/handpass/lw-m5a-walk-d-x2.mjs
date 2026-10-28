// exploration 2: the bid windows' "left" for a weekday, a Saturday, a half
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/d'
process.env.LW_TODAY ||= '2026-01-25'
const D = await import('./lw-m5a-walk-d-lib.mjs')
const { L } = D
const { T, press, vis, txt, shot } = L
console.log('[lw-m5a-walk-d-x2 v1]')
const w = await L.newCtx('desk')
const P = w.page
await L.signIn(w, 'admin')
const left = () => P.evaluate(() => Object.fromEntries(['LL', 'OL', 'OIL', 'CCL', 'FCL', 'PL', 'EL', 'CL'].map(k => [k, document.querySelector(`[data-testid="bid-${k}-left"]`)?.textContent.trim()])))
for (const [iso, portion] of [['2026-02-04', 'full'], ['2026-02-07', 'full'], ['2026-02-04', 'pm'], ['2026-02-04', 'am']]) {
  await L.openCell(w, 'bane', iso)
  if (portion !== 'full') { await press(w, T('portion-' + portion)); await P.waitForTimeout(300) }
  console.log(iso, portion, JSON.stringify(await left()), await txt(P, T('bid-dayline')))
  await shot(w, `x2-${iso}-${portion}`)
  await L.closeWin(w)
}
await w.ctx.close(); await L.closeBrowser()
