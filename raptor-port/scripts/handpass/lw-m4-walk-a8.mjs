// Walker A, look 9: the Post out sheet (test ids, fields) opened from a bid window's more menu.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/a/explore'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L } = A
const { T, shot, press, txt, vis } = L
console.log('[lw-m4-walk-a8 v1]')
const w = await L.newCtx('desk')
const P = w.page
await L.signIn(w, 'admin')
await L.openCell(w, 'slash', '2026-01-15')
await press(w, T('bid-more')); await P.waitForTimeout(400)
await press(w, T('bid-postout')); await P.waitForTimeout(700)
await shot(w, 'a8-postout-sheet')
const info = await P.evaluate(() => {
  const strip = s => s.replace(/ style="[^"]*"/g, '').replace(/<svg[\s\S]*?<\/svg>/g, '<svg/>')
  const ids = [...new Set([...document.querySelectorAll('[data-testid]')].filter(e => e.getBoundingClientRect().width > 0 && /po|post|out|outcome|sheet|date|confirm|save/i.test(e.dataset.testid) && !/^(cell-|head-|row-|month-|count-)/.test(e.dataset.testid)).map(e => e.dataset.testid))]
  const btns = [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0).map(b => (b.innerText || '').trim().replace(/\s+/g, ' ')).filter(t => /post|out|archive|delete|sans|transfer|confirm|cancel|save|ok/i.test(t))
  return { ids, btns }
})
console.log(JSON.stringify(info))
console.log('sheet text:', await P.evaluate(() => { const e = [...document.querySelectorAll('[data-testid]')].find(x => /postout-sheet|po-sheet|post-out/.test(x.dataset.testid)); return e ? e.innerText.replace(/\s+/g, ' ') : null }))
console.log('errs', JSON.stringify(w.errs))
await w.ctx.close(); await L.closeBrowser()
