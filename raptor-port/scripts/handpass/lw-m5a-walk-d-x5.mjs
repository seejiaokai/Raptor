// exploration 5: Approvals lines for Ranger; the person window on a desktop from a Balances name
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/d'
process.env.LW_TODAY ||= '2026-01-25'
const D = await import('./lw-m5a-walk-d-lib.mjs')
const { L } = D
const { T, press, vis, txt, shot } = L
console.log('[lw-m5a-walk-d-x5 v1]')
const w = await L.newCtx('desk')
const P = w.page
await L.signIn(w, 'admin')
await L.openApprovals(w)
const lines = await L.apprLines(P)
for (const l of lines.filter(l => /bane/.test(l.who))) console.log(JSON.stringify(l))
console.log(lines.length, 'lines; people:', [...new Set(lines.map(l => l.who))].join(','))
await shot(w, 'x5-approvals')
console.log(await P.evaluate(() => [...new Set([...document.querySelectorAll('[data-testid="approvals-page"] [data-testid]')].map(e => e.dataset.testid.replace(/-[a-z0-9]+$/, '-*')))].join(',')))
await D.openBalances(w)
await press(w, T('bal-name-bane')); await P.waitForTimeout(600)
const pw = await D.pwRead(P)
console.log(JSON.stringify(pw))
await shot(w, 'x5-pw')
await D.closePw(w)
await w.ctx.close(); await L.closeBrowser()
