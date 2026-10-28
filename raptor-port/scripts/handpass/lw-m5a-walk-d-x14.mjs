// exploration 14: change an input's kind on the Inputs page (a filed LL → CCL)
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/d'
process.env.LW_TODAY ||= '2026-01-25'
const D = await import('./lw-m5a-walk-d-lib.mjs')
const { L } = D
const { T, press, txt, shot } = L
console.log('[x14 v1]')
const w = await L.newCtx('desk'); const P = w.page
await L.signIn(w, 'admin'); await D.openBalances(w)
console.log('before', JSON.stringify(await D.balRow(P, 'bane')))
console.log(JSON.stringify(await D.fileInput(w, 'Ranger', 'LL', '2026-07-15', '2026-07-16')))
await L.openWar(w, 'admin'); await D.openBalances(w)
const r1 = await D.balRow(P, 'bane'); console.log('after filing LL 15-16 Jul', r1.app, r1.cf, r1.CCL)
await P.evaluate(() => window.go('inputs')); await P.waitForTimeout(900)
await P.locator('text=List').first().click(); await P.waitForTimeout(600)
// the list shows 29 Oct → 12 Nov; open "All dates" if offered
await shot(w, 'x14-list')
console.log(await P.evaluate(() => [...document.querySelectorAll('button, [role="button"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.trim()).filter(t => t && t.length < 30).slice(0, 40).join(' | ')))
await w.ctx.close(); await L.closeBrowser()
