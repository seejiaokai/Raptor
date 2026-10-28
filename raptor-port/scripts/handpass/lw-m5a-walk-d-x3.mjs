// exploration 3: everyone's row on the Balances page, and the grid's figure lines
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/d'
process.env.LW_TODAY ||= '2026-01-25'
const D = await import('./lw-m5a-walk-d-lib.mjs')
const { L } = D
console.log('[lw-m5a-walk-d-x3 v1]')
const w = await L.newCtx('desk')
const P = w.page
await L.signIn(w, 'admin')
await L.openGrid(w)
const grid = await P.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-testid^="bal-"]')].filter(e => /^bal-[a-z0-9]+$/.test(e.dataset.testid)).map(e => [e.dataset.testid.slice(4), e.innerText.replace(/\s+/g, ' ').trim()])))
await D.openBalances(w)
const rows = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="bal-row-"]')].map(r => {
  const pid = r.dataset.testid.slice(8)
  const v = id => { const e = document.querySelector(`[data-testid="${id}"]`); return e ? (e.tagName === 'INPUT' ? e.value : e.textContent.trim()) : null }
  return [pid, document.querySelector(`[data-testid="bal-name-${pid}"]`)?.innerText.trim(), r.querySelector('.cat, .chip')?.textContent.trim(), v(`bal-grade-${pid}`)?.slice(0, 22), v(`bal-LVE-${pid}`), v(`bal-cf-${pid}`), v(`bal-pend-${pid}`)].join(' ; ')
}))
console.log(rows.join('\n'))
console.log(JSON.stringify(grid))
await w.ctx.close(); await L.closeBrowser()
