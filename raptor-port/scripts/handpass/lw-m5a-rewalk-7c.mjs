// M5a re-walk 7c — what is below the Balances page that makes the phone's document 994 high
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/rewalk/r7b'
process.env.LW_TODAY ||= '2026-01-25'
const R = await import('./lw-m5a-rewalk-lib.mjs')
const { L } = R
console.log('[lw-m5a-rewalk-7c v1]')
const w = await L.newCtx('phone'); const P = w.page
await L.signIn(w, 'admin'); await R.openBalances(w)
const r = await P.evaluate(() => [...document.querySelectorAll('body *')].map(e => { const b = e.getBoundingClientRect(); return { who: e.tagName + (e.id ? '#' + e.id : '') + '.' + String(e.className).slice(0, 30) + (e.dataset.testid ? '[' + e.dataset.testid + ']' : ''), top: Math.round(b.top), bottom: Math.round(b.bottom), pos: getComputedStyle(e).position, disp: getComputedStyle(e).display } }).filter(x => x.bottom > 880 && x.top < 1100 && x.disp !== 'none').sort((a, b) => b.bottom - a.bottom).slice(0, 8))
console.log(JSON.stringify(r, null, 0))
await w.ctx.close(); await L.closeBrowser()
