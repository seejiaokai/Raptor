// Re-walk A2 exploration — the DOM of a line's puck (read only).
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk/a'
const { L } = await import('./lw-m4-walk-a-lib.mjs')
console.log('[lw-m4-rw-a2x v1]')
const w = await L.newCtx('desk')
const P = w.page
await L.signIn(w, 'admin')
await L.openApprovals(w)
const html = await P.evaluate(() => {
  const l = document.querySelector('[data-testid="approvals-page"] .appr-line')
  return l.outerHTML.slice(0, 2500)
})
console.log(html)
await w.ctx.close(); await L.closeBrowser()
