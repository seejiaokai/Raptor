// M5a re-walk 7b — B-F5 in a fresh phone context (no viewport changes before): the document's height on each tab, and what a swipe does
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/rewalk/r7b'
process.env.LW_TODAY ||= '2026-01-25'
const R = await import('./lw-m5a-rewalk-lib.mjs')
const { L, T, note, press, swipe, shot, where } = R
console.log('[lw-m5a-rewalk-7b v1]')
L.clearOut()
const w = await L.newCtx('phone'); const P = w.page
const ok = c => (c ? 'PASS' : 'FAIL')
const doc = () => P.evaluate(() => { const pg = document.getElementById('page-leavewar').getBoundingClientRect(); const bp = document.querySelector('[data-testid="balances-page"]')?.getBoundingClientRect(); const bs = document.querySelector('[data-testid="bal-scroll"]')?.getBoundingClientRect(); return { sh: document.documentElement.scrollHeight, bodyH: document.body.scrollHeight, ih: innerHeight, vvh: Math.round(visualViewport.height), sy: Math.round(scrollY), pageTop: Math.round(pg.top), pageB: Math.round(pg.bottom), balPageB: bp ? Math.round(bp.bottom) : null, balScrollB: bs ? Math.round(bs.bottom) : null } })
await L.signIn(w, 'admin')
const g = await doc(); console.log('grid tab', JSON.stringify(g))
await L.openApprovals(w); const a = await doc(); console.log('approvals tab', JSON.stringify(a))
await R.openBalances(w); const b = await doc(); console.log('balances tab', JSON.stringify(b))
await shot(w, '01-balances')
await swipe(w, 200, 150, 200, 60, { steps: 6, dwell: 16, rest: 100 }); await P.waitForTimeout(500)
const c = await doc(); console.log('after swipe from the tab row', JSON.stringify(c)); await shot(w, '02-after-swipe')
note('B5 fresh phone: Balances document height vs the screen (no page scroll)', '402', ok(b.sh <= b.ih && c.sy === 0), `Grid ${g.sh}, Approvals ${a.sh}, Balances ${b.sh} on a ${b.ih} screen; page bottom ${b.pageB}, Balances page bottom ${b.balPageB}, its scroller bottom ${b.balScrollB}; a swipe from the tab row: scrollY ${c.sy}`, ['01-balances', '02-after-swipe'])
R.dump('r7b')
await w.ctx.close(); await L.closeBrowser()
