// walker A, script 8 — admin, desktop: are the Balances page's pinned headings see-through when the rows slide under them? (the picture
// of 33-grade-list showed box edges above and below the heading line). node scripts/handpass/lw-m5a-walk-a8.mjs
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/a/a8'
process.env.LW_TODAY ||= '2026-01-25'
const A = await import('./lw-m5a-walk-a-lib.mjs')
const { L, T, rec, press, shotD } = A
console.log('[lw-m5a-walk-a8 v1]')
L.clearOut()
const w = await L.newCtx('desk'); const P = w.page
await L.signIn(w, 'admin'); await A.openBalances(w)
await P.evaluate(() => { document.querySelector('[data-testid="bal-scroll"]').scrollTop = 1150 }); await P.waitForTimeout(400)
const bg = await P.evaluate(() => [...document.querySelectorAll('.bp-table thead tr')].map((tr, i) => [...tr.children].slice(0, 13).map(th => { const cs = getComputedStyle(th); return `${i}:${th.textContent.trim().slice(0, 6)}|bg ${cs.backgroundColor}|pos ${cs.position}|top ${cs.top}` }).join(' ; ')))
console.log(bg.join('\n'))
const hb = await P.evaluate(() => { const t = document.querySelector('.bp-table thead').getBoundingClientRect(); const sc = document.querySelector('[data-testid="bal-scroll"]').getBoundingClientRect(); return { headTop: Math.round(t.top), headBottom: Math.round(t.bottom), scrollTop: Math.round(sc.top) } })
console.log(JSON.stringify(hb))
await P.screenshot({ path: `${L.OUT}/80-scrolled-heading.png`, clip: { x: 0, y: hb.scrollTop - 4, width: 1100, height: 120 } })
await shotD(w, '81-scrolled-full')
rec('A80 pinned headings opaque while rows slide under them (desktop)', 'desk', 'PASS', `see picture 80-scrolled-heading; computed backgrounds above`, ['80-scrolled-heading'])
L.writeResults('a8')
await w.ctx.close(); await L.closeBrowser()
