// Walker A, look 8: Show SANS — who joins the grid, and how the settings read with it on and off.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/a/explore'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L } = A
const { T, shot, press } = L
console.log('[lw-m4-walk-a7 v2]')
const w = await L.newCtx('desk')
const P = w.page
await L.signIn(w, 'admin')
const rows = () => P.evaluate(() => [...document.querySelectorAll('[data-testid^="row-"]')].map(r => r.dataset.testid.slice(4)))
const before = await rows()
await press(w, T('settings-open')); await P.waitForTimeout(600)
const sb = P.locator('button.rtbtn', { hasText: /SANS/ })
console.log('Show SANS button class', await sb.first().getAttribute('class'), 'pressed', await sb.first().getAttribute('aria-pressed'))
await sb.first().click(); await P.waitForTimeout(800)
await shot(w, 'a7-settings-sans-on')
console.log('after click: class', await sb.first().getAttribute('class'), 'pressed', await sb.first().getAttribute('aria-pressed'))
const labels = await P.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0).map(b => (b.innerText || '').trim().replace(/\s+/g, ' ')).filter(t => /sans/i.test(t)))
console.log('buttons naming SANS now:', JSON.stringify(labels))
await P.keyboard.press('Escape'); await P.waitForTimeout(500)
const after = await rows()
console.log('rows before', before.length, 'after', after.length, 'added:', after.filter(r => !before.includes(r)).join(' '))
console.log('errs', JSON.stringify(w.errs))
await w.ctx.close(); await L.closeBrowser()
