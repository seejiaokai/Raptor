// exploration 6: the window on an existing pending bid and an approved one (testids of the actions)
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/d'
process.env.LW_TODAY ||= '2026-01-25'
const D = await import('./lw-m5a-walk-d-lib.mjs')
const { L } = D
const { T, press, vis, txt, shot } = L
console.log('[lw-m5a-walk-d-x6 v1]')
const w = await L.newCtx('desk')
const P = w.page
await L.signIn(w, 'admin')
const dump = async tag => console.log(tag, await P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-picker"] [data-testid], [data-testid="day-list"] [data-testid], [role="dialog"] [data-testid]')].filter(e => !/^(bid-(LL|OL|OIL|CCL|FCL|PL|EL|CL)|span-day)/.test(e.dataset.testid)).map(e => e.dataset.testid + '=' + e.innerText.replace(/\s+/g, ' ').trim().slice(0, 40)).join(' | ')))
await L.openCell(w, 'bane', '2026-02-12')   // pending 12-13 Feb
await dump('pending 12 Feb:'); await shot(w, 'x6-pending'); await L.closeWin(w)
await L.openCell(w, 'bane', '2026-01-26')   // approved 26-27 Jan
await dump('approved 26 Jan:'); await shot(w, 'x6-approved')
await w.ctx.close(); await L.closeBrowser()
