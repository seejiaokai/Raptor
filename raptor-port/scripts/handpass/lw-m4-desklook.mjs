// M4 — the desktop Approvals page beside his drawing r22-1-desk (his question, 27 Oct 26)
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/desklook'
const L = await import('./lw-m4-lib.mjs')
console.log('[lw-m4-desklook v1]')
L.clearOut()
const w = await L.newCtx('desk')
await L.signIn(w, 'admin')
await L.openApprovals(w)
await w.page.evaluate(() => window.scrollTo(0, 0))
await L.shot(w, 'desk-approvals')
const m = await w.page.evaluate(() => {
  const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.left), r: Math.round(b.right), y: Math.round(b.top), h: Math.round(b.height) } }
  return { card: r('.appr-card'), filters: r('.appr-filters'), all: r('[data-testid="appr-approve-all"]'), cols: r('.appr-cols'), line: r('.appr-line'), btns: r('.appr-line .appr-btns') }
})
console.log(JSON.stringify(m))
await w.ctx.close(); await L.closeBrowser()
console.log('DONE')
