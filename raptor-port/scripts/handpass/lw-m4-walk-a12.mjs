// Walker A, measuring: the boxes of the Approvals page against his drawing r22-1 (all in CSS px at 1536 x 860), and the grid card's own box.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/a/explore'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L } = A
const { T, shot } = L
console.log('[lw-m4-walk-a12 v1]')
const w = await L.newCtx('desk'); const P = w.page
await L.signIn(w, 'admin')
const box = sel => P.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.x * 10) / 10, y: Math.round(b.y * 10) / 10, w: Math.round(b.width * 10) / 10, h: Math.round(b.height * 10) / 10 } }, sel)
const tabrow = await box('[data-testid="lw-tab-grid"]')
const gridCard = await P.evaluate(() => { const e = document.querySelector('.mx-outer')?.closest('[class*="card"], section, div'); const m = document.querySelector('[data-testid="counts-toggle"]'); let c = m; for (let i = 0; i < 6 && c; i++) { const b = c.getBoundingClientRect(); if (b.width > 1400) return { x: b.x, y: b.y, w: b.width, h: b.height, cls: c.className.toString().slice(0, 30) }; c = c.parentElement } return null })
console.log('grid tab box', JSON.stringify(tabrow), 'grid card', JSON.stringify(gridCard))
await L.openApprovals(w)
for (const [n, s] of [['tab Approvals', '[data-testid="lw-tab-approvals"]'], ['page', '[data-testid="approvals-page"]'], ['card', '.appr-card'], ['title', '.appr-title'], ['sub', '.appr-sub'], ['filters', '.appr-filters'], ['New chip', '[data-testid="appr-new"]'], ['All chip', '[data-testid="appr-all"]'], ['Jan chip', '[data-testid="appr-m-2026-01"]'], ['Pick', '[data-testid="appr-pick"]'], ['Approve all', '[data-testid="appr-approve-all"]'], ['list', '.appr-list'], ['cols', '.appr-cols'], ['first line', '.appr-line'], ['first puck', '.appr-line .puck'], ['first Approve', '.appr-ok'], ['first Refuse', '.appr-no'], ['first days', '.appr-days'], ['first placed', '.appr-placed']]) console.log(n.padEnd(14), JSON.stringify(await box(s)))
const second = await P.evaluate(() => { const l = document.querySelectorAll('.appr-line'); return l.length > 1 ? Math.round((l[1].getBoundingClientRect().y - l[0].getBoundingClientRect().y) * 10) / 10 : null })
console.log('row pitch', second)
const fonts = await P.evaluate(() => { const g = s => { const e = document.querySelector(s); if (!e) return null; const c = getComputedStyle(e); return `${c.fontSize}/${c.fontWeight}` }; return { title: g('.appr-title'), sub: g('.appr-sub'), date: g('.appr-dlink'), days: g('.appr-days'), bal: g('.appr-bal'), btn: g('.appr-ok'), chip: g('.appr-f'), all: g('.appr-all') } })
console.log('fonts', JSON.stringify(fonts))
await w.ctx.close(); await L.closeBrowser()
