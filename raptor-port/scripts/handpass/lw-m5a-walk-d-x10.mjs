process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/d'
process.env.LW_TODAY ||= '2026-12-20'
const D = await import('./lw-m5a-walk-d-lib.mjs')
const { L } = D
const { T, press } = L
console.log('[x10 v1]')
const w = await L.newCtx('desk'); const P = w.page
await L.signIn(w, 'admin'); await L.openGrid(w)
await press(w, T('month-DEC')); await P.waitForTimeout(1500)
console.log('row-ignite', await P.locator(T('row-ignite')).count(), 'cells ignite', await P.locator('[data-testid^="cell-ignite-"]').count(), 'cells bane', await P.locator('[data-testid^="cell-bane-"]').count())
console.log(await P.evaluate(() => [...document.querySelectorAll('[data-testid^="cell-ignite-"]')].slice(0, 3).map(e => e.dataset.testid)))
console.log(await P.evaluate(() => [...document.querySelectorAll('[data-testid^="row-"]')].map(e => e.dataset.testid.slice(4)).join(',')))
console.log(await P.evaluate(() => [...document.querySelectorAll('[data-testid^="bal-"]')].filter(e=>/^bal-[a-z]+$/.test(e.dataset.testid)).length))
console.log('after scroll cells ignite', await P.locator('[data-testid^="cell-ignite-"]').count(), await P.evaluate(() => [...document.querySelectorAll('[data-testid^="cell-ignite-"]')].slice(0, 3).map(e => e.dataset.testid)))
await L.shot(w, 'x10')
await w.ctx.close(); await L.closeBrowser()
