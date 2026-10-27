// Walker A, second look: what the bid window holds (test ids), as member and as admin.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/a/explore'
const L = await import('./lw-m4-lib.mjs')
const { T, shot, press, txt, vis } = L
console.log('[lw-m4-walk-a1 v1]')
const w = await L.newCtx('desk')
const P = w.page
const dump = async (label) => {
  const ids = await P.evaluate(() => { const root = document.querySelector('[data-testid="bid-picker"]'); return root ? [...root.querySelectorAll('[data-testid]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.testid) : ['NO bid-picker'] })
  console.log(label, [...new Set(ids)].join(' '))
}
await L.signIn(w, 'member')
await L.openCell(w, 'bane', '2026-01-12')
await dump('member bid window:')
await shot(w, 'a1-member-bidwin')
console.log('window text:', await txt(P, T('bid-picker')))
await L.closeWin(w)
await L.switchTo(w, 'admin')
await L.openCell(w, 'bane', '2026-01-13')
await dump('admin bid window:')
await shot(w, 'a1-admin-bidwin')
console.log('window text:', await txt(P, T('bid-picker')))
console.log('errs', w.errs)
await w.ctx.close(); await L.closeBrowser()
