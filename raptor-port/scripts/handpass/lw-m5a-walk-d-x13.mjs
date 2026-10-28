// glyph check: the minus on each surface for a negative balance — read by char code (Saint, seed world; typed -2 via the box)
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/d'
process.env.LW_TODAY ||= '2026-01-25'
const D = await import('./lw-m5a-walk-d-lib.mjs')
const { L, note } = D
const { T, press, shot } = L
console.log('[x13 v1]')
const w = await L.newCtx('desk'); const P = w.page
await L.signIn(w, 'admin'); await D.openBalances(w)
await D.typeInBox(w, T('bal-LVE-salsa'), -2)
const codes = t => t == null ? null : [...String(t)].filter(c => /[-−–]/.test(c)).map(c => 'U+' + c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')).join(',')
const row = await P.evaluate(() => ({ app: document.querySelector('[data-testid="bal-LVE-salsa"]').value, war: document.querySelector('[data-testid="bal-war-salsa"]').textContent }))
await press(w, T('bal-name-salsa')); await P.waitForTimeout(700)
const pw = await P.evaluate(() => ({ app: document.querySelector('[data-testid="pw-LVE"]').value, war: document.querySelector('[data-testid="pw-LVE-war"]').textContent }))
await shot(w, 'd7b-glyph-window'); await D.closePw(w)
await L.openGrid(w); await P.waitForTimeout(600)
const grid = await D.gridFig(P, 'salsa'); await shot(w, 'd7b-glyph-grid')
console.log('Balances row: box', JSON.stringify(row.app), codes(row.app), '| War bal', JSON.stringify(row.war), codes(row.war))
console.log('window: box', JSON.stringify(pw.app), codes(pw.app), '| War bal', JSON.stringify(pw.war), codes(pw.war))
console.log('grid figure', JSON.stringify(grid), codes(grid))
await w.ctx.close(); await L.closeBrowser()
