// Re-walk A1b — the visit survives a reload: visit, a bid after it, reload, sign in, open -> the words name the visit's time.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk/a'
const { L, placeBid } = await import('./lw-m4-walk-a-lib.mjs')
const { T, rec, shot, vis, txt } = L
console.log('[lw-m4-rw-a1b v1]')
const w = await L.newCtx('desk')
const P = w.page
const sub = () => txt(P, T('appr-sub'))
const newTxt = () => txt(P, T('appr-new'))
try {
  await L.signIn(w, 'admin')
  await L.openApprovals(w)
  const visitAt = new Date()
  console.log('visit made at', visitAt.toString(), '| sub', await sub())
  await L.openGrid(w)
  await L.switchTo(w, 'member')
  await placeBid(w, 'bane', '2026-01-13')
  await P.waitForTimeout(65000) // a minute passes, so the visit's minute differs from the bid's and the reading
  await P.reload(); await P.waitForSelector('#luser')
  await L.signIn(w, 'admin')
  await L.openApprovals(w)
  const s = await sub(); const n = await newTxt()
  console.log('after reload: sub', s, '| new', n)
  await shot(w, 'a1b-visit-survives-reload')
  const hh = String(visitAt.getHours()).padStart(2, '0'), mm = String(visitAt.getMinutes()).padStart(2, '0')
  rec('A1.3b visit saved, then a bid, reload: words name the visit time', 'desk', /1 new since you last looked/.test(s || '') && (s || '').includes(`${hh}:${mm}`) && /New\s*1/.test(n || '') ? 'PASS' : 'FAIL', `visit at ${hh}:${mm}; sub="${s}" new="${n}"`, ['a1b-visit-survives-reload'])
  await L.openGrid(w); await L.openApprovals(w)
  const s2 = await sub(); const n2 = await newTxt()
  rec('A1.3c then leave and reopen: New 0, no since', 'desk', !/since/.test(s2 || '') && /New\s*0/.test(n2 || '') ? 'PASS' : 'FAIL', `sub="${s2}" new="${n2}"`, [])
} catch (e) {
  rec('ERROR', 'desk', 'FAIL', String(e).slice(0, 300)); await shot(w, 'a1b-error').catch(() => {})
}
if (w.errs.length) rec('console', 'desk', 'FAIL', w.errs.join(' || ').slice(0, 600))
await w.ctx.close()
L.writeResults('a1b')
await L.closeBrowser()
console.log('DONE')
