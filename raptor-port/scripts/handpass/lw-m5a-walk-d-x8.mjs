// exploration 8: the Inputs page's input window (testids)
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/d'
process.env.LW_TODAY ||= '2026-01-25'
const D = await import('./lw-m5a-walk-d-lib.mjs')
const { L } = D
const { T, press, vis, txt, shot } = L
console.log('[lw-m5a-walk-d-x8 v1]')
const w = await L.newCtx('desk')
const P = w.page
await L.signIn(w, 'admin')
await P.evaluate(() => window.go('inputs')); await P.waitForTimeout(1200)
const ids = () => P.evaluate(() => [...new Set([...document.querySelectorAll('[data-testid]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.testid))].join(','))
console.log('page:', await ids())
const lst = P.locator('text=List').first(); await lst.click(); await P.waitForTimeout(800)
console.log('list:', await ids())
await shot(w, 'x8-list')
await P.locator('[data-testid="in-new"]').click(); await P.waitForTimeout(900)
await shot(w, 'x8-new')
console.log('NEW:', await P.evaluate(() => [...document.querySelectorAll('[role="dialog"] [data-testid], .sheet [data-testid], .modal [data-testid]')].map(e => e.dataset.testid + '=' + e.innerText.replace(/\s+/g, ' ').trim().slice(0, 25)).filter(x => !/^(head-|cell-|day-)/.test(x)).join(' | ')))
await w.ctx.close(); await L.closeBrowser()
