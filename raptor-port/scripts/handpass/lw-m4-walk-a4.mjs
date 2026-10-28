// Walker A, look 5: the Approve all arm, the Pick dates window (its test ids and pictures). Fresh admin world with the demo's pending lines.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/a/explore'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L, pressLoc } = A
const { T, shot, txt } = L
console.log('[lw-m4-walk-a4 v1]')
const w = await L.newCtx('desk')
const P = w.page
await L.signIn(w, 'admin')
await L.openApprovals(w)
const allBtn = P.locator(T('appr-approve-all'))
console.log('before', await allBtn.innerText(), await allBtn.getAttribute('class'))
await pressLoc(w, allBtn); await P.waitForTimeout(300)
console.log('armed', JSON.stringify(await allBtn.innerText()), await allBtn.getAttribute('class'), await allBtn.getAttribute('aria-live'))
await shot(w, 'a4-armed')
await P.waitForTimeout(3500)
console.log('after 3.5 s', JSON.stringify(await allBtn.innerText()), await allBtn.getAttribute('class'))
await pressLoc(w, P.locator(T('appr-pick'))); await P.waitForTimeout(500)
await shot(w, 'a4-pick')
const html = await P.evaluate(() => {
  const strip = s => s.replace(/ style="[^"]*"/g, '').replace(/<svg[\s\S]*?<\/svg>/g, '<svg/>')
  const ids = [...document.querySelectorAll('[data-testid]')].filter(e => e.getBoundingClientRect().width > 0 && /pick|range|cal|day|date/i.test(e.dataset.testid) && !/^(cell-|head-|row-)/.test(e.dataset.testid)).map(e => e.dataset.testid)
  const pop = document.querySelector('[role="dialog"], .rp, .appr-pop, [data-testid="appr-range"]')
  return { ids: [...new Set(ids)].slice(0, 80), pop: pop ? strip(pop.outerHTML).slice(0, 2500) : null, active: document.activeElement && (document.activeElement.dataset.testid || document.activeElement.tagName) }
})
console.log(JSON.stringify(html, null, 1))
console.log('errs', JSON.stringify(w.errs))
await w.ctx.close(); await L.closeBrowser()
