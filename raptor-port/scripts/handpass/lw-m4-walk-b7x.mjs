// Walker B: find a bid that raises the manning bubble (exploration only). Places LL for men of one group on one day until it appears.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/b/x'
const B = await import('./lw-m4-walk-b-lib.mjs')
const { L, T, shot } = B
console.log('[lw-m4-walk-b7x v2]')
const w = await B.newPhone(402, 874, 'chromium')
const P = w.page
await B.signIn(w, 'admin')
const rows = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="row-"]')].map(e => ({ id: e.dataset.testid.slice(4), t: e.innerText.replace(/\s+/g, ' ').trim() })))
console.log('rows', rows.map(r => r.id + '=' + r.t).join(' | '))
const DAY = '2026-01-15'
const log = []
for (const r of rows) {
  if (!/\bIW\b/.test(r.t) && !/\bIR\b/.test(r.t)) continue
  await L.openCell(w, r.id, DAY)
  if (!(await B.vis(P, T('bid-picker')))) { log.push(r.id + ':nowin'); continue }
  await L.placeLeave(w, 'LL'); await B.sleep(w, 600)
  const bub = await B.vis(P, T('manning-bubble'))
  log.push(r.t + ':' + bub)
  await shot(w, `x-${r.id}`)
  if (bub) { console.log('BUBBLE', await B.txt(P, T('manning-bubble'))); break }
}
console.log(log.join(' '))
await w.ctx.close(); await B.closeAll()
console.log('DONE')
