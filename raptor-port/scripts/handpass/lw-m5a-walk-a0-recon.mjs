// walker A recon: the Balances page as it is drawn, to write the real walk from (not a verdict script)
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/a'
process.env.LW_TODAY ||= '2026-01-25'
const A = await import('./lw-m5a-walk-a-lib.mjs')
const { L, T } = A
console.log('[walk-a0-recon v1]')
const w = await L.newCtx('desk')
const P = w.page
await L.signIn(w, 'admin')
await A.openBalances(w)
await A.shotD(w, 'a0-balances-top')
const info = await P.evaluate(() => {
  const heads = [...document.querySelectorAll('.bp-table thead tr')].map(tr => [...tr.children].map(c => c.textContent.trim() + '|' + c.tagName + '.' + c.className))
  const rows = [...document.querySelectorAll('[data-testid^="bal-row-"]')].map(r => r.dataset.testid)
  const sc = document.querySelector('[data-testid="bal-scroll"]')
  const mx = document.querySelector('#page-leavewar .mx-outer')
  return { heads, nrows: rows.length, rows: rows.slice(0, 80).join(','), sc: sc && { cls: sc.className, tag: sc.tagName, h: sc.clientHeight, sh: sc.scrollHeight }, bpbar: [...document.querySelectorAll('[data-testid="balances-page"] > *')].map(e => e.tagName + '.' + e.className + ' ' + e.getBoundingClientRect().height) }
})
console.log(JSON.stringify(info, null, 1))
console.log('row bane', JSON.stringify(await A.balRow(P, 'bane')))
console.log('errs', w.errs)
await w.ctx.close(); await L.closeBrowser()
