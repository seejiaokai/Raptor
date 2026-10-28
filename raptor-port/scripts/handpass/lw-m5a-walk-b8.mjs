// Walker B, script 8: does the window itself scroll on the Balances page of a phone (a few points taller than the screen)?
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/b'
const B = await import('./lw-m5a-walk-b-lib.mjs')
const { L, T, rec, shot, openBalances, swipe } = B
console.log('[lw-m5a-walk-b8 v1]')
const w = await L.newCtx('phone'); const P = w.page
await L.signIn(w, 'admin')
const m = async tag => console.log(tag, JSON.stringify(await P.evaluate(() => ({ sh: document.documentElement.scrollHeight, bh: document.body.scrollHeight, ih: innerHeight, sy: scrollY, pageH: Math.round(document.getElementById('page-leavewar').getBoundingClientRect().height), pageB: Math.round(document.getElementById('page-leavewar').getBoundingClientRect().bottom) }))))
await m('grid tab')
await openBalances(w); await m('balances tab')
await swipe(w, 200, 150, 200, 60, { steps: 6, dwell: 16, rest: 100 }); await P.waitForTimeout(500)
await m('after a swipe up from the top bar area')
await shot(w, 'y-window-scroll')
await P.evaluate(() => scrollTo(0, 0)); await P.waitForTimeout(300); await L.openApprovals(w); await m("approvals tab")
await P.waitForTimeout(100)
await B.press(w, T('oil-tracker')); await P.waitForTimeout(800); await m('OIL tab')
await L.switchTo(w, 'member'); await openBalances(w); await m('member balances')
await w.ctx.close(); await L.closeBrowser()
