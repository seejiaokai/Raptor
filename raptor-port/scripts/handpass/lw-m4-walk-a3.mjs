// Walker A, fourth look: the DOM of an Approvals line (the cells' test ids and classes), one fresh admin world.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/a/explore'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L } = A
console.log('[lw-m4-walk-a3 v1]')
const w = await L.newCtx('desk')
const P = w.page
await L.signIn(w, 'admin')
await L.openApprovals(w)
const html = await P.evaluate(() => {
  const l = document.querySelector('[data-testid="appr-line-bruise"]')
  const strip = s => s.replace(/ style="[^"]*"/g, '').replace(/<svg[\s\S]*?<\/svg>/g, '<svg/>')
  return strip(l.outerHTML).slice(0, 4000) + '\n---HEAD---\n' + strip(document.querySelector('[data-testid="approvals-page"]').outerHTML.slice(0, 3000))
})
console.log(html)
await w.ctx.close(); await L.closeBrowser()
