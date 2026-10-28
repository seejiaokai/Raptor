// walker A: look at the "+ New period" sheet to make a past period through the app's own control
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/a/a2b'
process.env.LW_TODAY ||= '2026-01-25'
const A = await import('./lw-m5a-walk-a-lib.mjs')
const { L, T, press, shotD } = A
console.log('[lw-m5a-walk-a2b v1]')
L.clearOut()
const w = await L.newCtx('desk'); const P = w.page
await L.signIn(w, 'admin'); await A.openBalances(w)
await P.locator('select[data-testid="war-picker"]').selectOption({ label: '+ New period' }); await P.waitForTimeout(800)
await shotD(w, 'new-period')
console.log(JSON.stringify(await P.evaluate(() => {
  const s = document.querySelector('[data-testid="war-sheet"]')
  return s ? { text: s.innerText.replace(/\s+/g, ' ').slice(0, 400), ids: [...s.querySelectorAll('[data-testid]')].map(e => e.tagName + ':' + e.dataset.testid).slice(0, 60) } : null
})))
await w.ctx.close(); await L.closeBrowser()
