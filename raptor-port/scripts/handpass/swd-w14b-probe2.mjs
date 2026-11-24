// swd-w14b-probe2 — P6's second half: after Saber's tab is reloaded (it opens on the sign-in card) and he signs in again,
// is his Undo list still there? Read on the Quals page, where the Undo said "Undo — Ranger's quals" before the reload.
//   W14B_RUN=probe2 node scripts/handpass/swd-w14b-probe2.mjs
import './swd-w14b-env.mjs'
const Z = await import('./swd-w14b-lib.mjs')
const { T, L, RANGER, sleep, tickOf } = Z
console.log('VERSION swd-w14b-probe2 1')
const ub = async p => `"${await p.locator('#undoBtn').first().getAttribute('title').catch(() => '')}" shown ${await p.locator('#undoBtn:visible').count()} disabled ${await p.locator('#undoBtn').first().isDisabled().catch(() => 'no button')}`
await T.run('probe6b', 'd', async (p, W) => {
  await tickOf(p, W, RANGER, true, 'tick')
  W.rec('a', 'Quals, before the reload: the top bar Undo', 'REC', await ub(p), await W.pic(p, 'before'))
  await L.go(p, 'editsched')
  W.rec('a2', 'Edit Schedule, before the reload: the top bar Undo', 'REC', await ub(p))
  await p.reload(); await sleep(1800)
  W.rec('b', 'reloaded: the page shows', 'REC', (await p.locator('#luser:visible').count()) ? 'the sign-in card' : 'a signed-in page', await W.pic(p, 'reloaded'))
  if (await p.locator('#luser:visible').count()) await L.signIn(p, 'ad', 'a')
  await L.go(p, 'quals')
  W.rec('c', 'Saber signed in again, Quals: the top bar Undo', 'REC', await ub(p), await W.pic(p, 'after'))
  await L.go(p, 'editsched')
  W.rec('d', 'Edit Schedule: the top bar Undo', 'REC', await ub(p), await W.pic(p, 'after-es'))
})
process.exit(0)
