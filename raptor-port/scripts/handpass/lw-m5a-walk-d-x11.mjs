process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/d'
process.env.LW_TODAY ||= '2026-12-20'
const D = await import('./lw-m5a-walk-d-lib.mjs')
const { L } = D
const { T, press } = L
console.log('[x11 v1]')
const w = await L.newCtx('desk'); const P = w.page
await L.signIn(w, 'admin'); await L.openGrid(w)
await P.selectOption(T('war-picker'), { label: 'JAN - DEC 27' }); await P.waitForTimeout(900)
await press(w, T('month-JAN')); await P.waitForTimeout(1000)
console.log(await P.evaluate(() => [...document.querySelectorAll('[data-testid^="event-"], [data-testid*="ev-"]')].slice(0, 8).map(e => e.dataset.testid + '=' + e.innerText.trim())))
console.log(await P.evaluate(() => [...new Set([...document.querySelectorAll('[data-testid]')].map(e => e.dataset.testid.replace(/\d{4}-\d\d-\d\d/, 'DATE')))].filter(t => /ev|hol|PH/i.test(t)).join(',')))
await press(w, T('event-0-2027-01-01')); await P.waitForTimeout(900)
await L.shot(w, 'x11-event')
console.log(await P.evaluate(() => [...document.querySelectorAll('[role="dialog"] [data-testid], .sheet [data-testid]')].map(e => e.dataset.testid + '=' + e.innerText.replace(/\s+/g, ' ').trim().slice(0, 25)).join(' | ')))
await w.ctx.close(); await L.closeBrowser()
