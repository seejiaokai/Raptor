// Re-walk A1 diagnosis — what does the app show right after a reload (before any tab press)?
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk/a'
const { L, placeBid } = await import('./lw-m4-walk-a-lib.mjs')
const { T, rec, shot, vis, txt } = L
console.log('[lw-m4-rw-a1x v1]')
const w = await L.newCtx('desk')
const P = w.page
const sub = () => txt(P, T('appr-sub'))
try {
  await L.signIn(w, 'admin')
  await L.openApprovals(w)
  await L.openGrid(w)
  await L.switchTo(w, 'member')
  await placeBid(w, 'bane', '2026-01-13')
  await L.switchTo(w, 'admin')
  console.log('signed in as admin, Approvals visible straight after sign in?', await vis(P, T('approvals-page')))
  await L.openApprovals(w)
  console.log('sub 1:', await sub())
  // reload with Approvals showing
  await P.reload(); await P.waitForSelector('#luser')
  await L.signIn(w, 'admin')
  console.log('after reload + sign in: approvals page visible?', await vis(P, T('approvals-page')), '| grid tab?', await vis(P, T('lw-tab-grid')))
  await shot(w, 'a1x-after-reload-signin')
  // sign in -> is the Approvals tab pressed?
  console.log('tab pressed states:', await P.evaluate(() => [...document.querySelectorAll('[data-testid^="lw-tab-"]')].map(e => e.dataset.testid + ':' + e.getAttribute('aria-selected') + ':' + e.className).join(' | ')))
  await L.openApprovals(w)
  console.log('sub after first open post-reload:', await sub())
  await shot(w, 'a1x-first-open-post-reload')
} catch (e) { console.log('ERR', String(e).slice(0, 300)) }
await w.ctx.close()
await L.closeBrowser()
