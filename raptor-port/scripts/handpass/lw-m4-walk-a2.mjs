// Walker A, third look: build the member's fixture through the bid window, then read Approvals as admin.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/a/explore'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L, bidBatch, scrollState } = A
const { T, shot, txt } = L
console.log('[lw-m4-walk-a2 v1]')
const w = await L.newCtx('desk')
const P = w.page
await L.signIn(w, 'member')
await bidBatch(w, 'bane', [
  { iso: '2026-01-12' }, { iso: '2026-01-14' },
  { iso: '2026-01-19', portion: 'am' }, { iso: '2026-01-20', portion: 'pm' },
  { iso: '2026-01-26' }, { iso: '2026-01-27' },
  { iso: '2026-01-30' }, { iso: '2026-01-31' }, { iso: '2026-02-01' }, { iso: '2026-02-02' },
  { iso: '2026-02-09', type: 'OIL' }, { iso: '2026-02-11', type: 'CCL' }, { iso: '2026-02-16' }, { iso: '2026-02-18' },
])
await L.switchTo(w, 'admin')
console.log('tab', await L.tabCount(P))
await L.openApprovals(w)
for (const l of await L.apprLines(P)) console.log(l.who, '|', l.text)
console.log('sub', await txt(P, T('appr-sub')))
console.log('scroll', JSON.stringify(await scrollState(P)))
await shot(w, 'a2-approvals')
console.log('errs', w.errs)
await w.ctx.close(); await L.closeBrowser()
