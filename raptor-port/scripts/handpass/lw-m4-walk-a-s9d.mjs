// Walker A, look 10: the 2027 view's grid and Trident's person id.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/a/explore'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L, pressLoc } = A
const { T, shot, txt } = L
console.log('[lw-m4-walk-a-s9d v1]')
const w = await L.newCtx('desk'); const P = w.page
await L.signIn(w, 'admin'); await L.openApprovals(w)
console.log('person ids on the 2027 lines after the link:')
await pressLoc(w, P.locator(T('appr-elsewhere'))); await P.waitForTimeout(800)
console.log((await L.apprLines(P)).map(l => l.who).join(' '))
await L.openGrid(w); await P.waitForTimeout(1200)
await shot(w, 'a-s9d-grid-27')
console.log('cells', await P.evaluate(() => [...document.querySelectorAll('[data-testid^="cell-"]')].slice(0, 3).map(e => e.dataset.testid)), 'rows', await P.evaluate(() => [...document.querySelectorAll('[data-testid^="row-"]')].length))
console.log('month strip', await P.evaluate(() => [...document.querySelectorAll('[data-testid^="month-"]')].map(e => e.dataset.testid).slice(0, 14).join(' ')))
console.log('period label', await P.evaluate(() => document.querySelector('[data-testid="period-label"]')?.innerText), '| picker', await P.evaluate(() => document.querySelector('[data-testid="war-picker"]')?.value || document.querySelector('[data-testid="war-picker"]')?.innerText.slice(0,60)))
await w.ctx.close(); await L.closeBrowser()
