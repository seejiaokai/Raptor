// Walker A, first look: sign in as admin on a fresh world, open Approvals, dump the page.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/a/explore'
const L = await import('./lw-m4-lib.mjs')
const { T, shot, press, txt } = L
console.log('[lw-m4-walk-a0 v1]')
const w = await L.newCtx('desk')
const P = w.page
await L.signIn(w, 'admin')
console.log('tab count', await L.tabCount(P))
console.log('nodes on grid', await P.evaluate(() => document.querySelectorAll('#page-leavewar *').length))
await shot(w, 'a0-grid')
await L.openApprovals(w)
await shot(w, 'a0-approvals')
const lines = await L.apprLines(P)
console.log('lines', lines.length)
for (const l of lines) console.log(l.who, '|', l.text, '|', l.lit, l.stale)
console.log('sub', await txt(P, T('appr-sub')))
const ids = await P.evaluate(() => [...document.querySelectorAll('[data-testid]')].map(e => e.dataset.testid).filter(t => /^appr|approvals/.test(t) && !/^appr-line/.test(t)))
console.log('ids', [...new Set(ids)].join(' '))
console.log('errs', w.errs)
await w.ctx.close(); await L.closeBrowser()
