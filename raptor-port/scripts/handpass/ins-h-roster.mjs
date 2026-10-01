/* [INSIGHTS-WHICH-COPY] — the host's re-walk of what the final read's fix touched (Astra's finding 1, 1 Oct 26):
   "Not on the flying programme" follows the rosters the published days went out with. A man added on Admin → Users
   while EVERY day is published is not listed until a day goes out again; with a day not yet published he is listed at
   once. Run on the re-frozen build. Env as the walk's: HP_URL, HP_SHOTS, HP_OUT. */
import * as A from './ins-a-lib.mjs'
import * as U from './dbrA-W2-lib.mjs'
const { L, W, TUE, row, judge } = A
const idleN = r => { const m = /(\d+) available/i.exec(Object.keys(r.secs || {}).find(k => /Not on the flying/i.test(k)) || ''); return m ? +m[1] : null }

await A.run('R1', async p => {
  await A.toEdit(p)
  for (let di = 0; di < 7; di++) { const r = await A.pubOrig(p, di); if (!/Publish/i.test(String(r.r && r.r.label))) row(`R1.pub${di}`, `publishing day ${di}`, JSON.stringify(r.r), 'RECORDED') }
  const tags = []; for (let di = 0; di < 7; di++) tags.push((await A.face(p, di)).tag)
  const i0 = await A.insPic(p, 'r1-a-all-published', 'foot')
  await U.usersPane(p)
  await U.addPerson(p, { cs: 'Newbie', ini: 'NB', seat: 'FCP', cat: 'C' })
  const pid = await U.pidOf(p, 'Newbie')
  const shotU = await A.pic(p, 'r1-b-admin-users-newbie')
  const i1 = await A.insPic(p, 'r1-b-added-insights-on-admin', 'foot')
  await A.toEdit(p)
  const i1e = await A.insNow(p)
  judge('R1.a', `all seven days signed and published (tags ${tags.join(' ')}); Admin → Users: New person "Newbie" (pilot) added (${pid}); Insights opened on Admin and on Edit Schedule`, [
    ['every day is published', tags.every(t => /ORIG/.test(t || '')), tags],
    ['he is on the roster', !!pid],
    ['"Not on the flying programme" does not list him', !A.idleHas(i1, 'Newbie') && !A.idleHas(i1e, 'Newbie')],
    ['its count has not moved', idleN(i0) === idleN(i1), `${idleN(i0)} → ${idleN(i1)}`],
    ['the whole window is word for word as before', A.same(i0, i1) && A.same(i0, i1e), A.diffText(i0, i1)],
  ], [...i0.shots, shotU, ...i1.shots])

  /* an amendment on Tuesday carries today's roster */
  await W.boardOn(p, TUE)
  const off = await A.seatOff(p, '1.1.1.0.p')
  await W.boardOff(p)
  const i2 = await A.insNow(p)
  const al = await A.pubAL(p, TUE)
  const i3 = await A.insPic(p, 'r1-c-after-AL1', 'foot')
  judge('R1.b', `Tuesday: a man taken off a seat on the board (${JSON.stringify(off)}); Insights; then signed and ${al.r && al.r.label}; Insights`, [
    ['waiting: still not listed', !A.idleHas(i2, 'Newbie')],
    ['after AL1 he is listed', A.idleHas(i3, 'Newbie')],
    ['and the count is one more for him and one more for the man taken off', idleN(i3) === idleN(i0) + 2, `${idleN(i0)} → ${idleN(i3)}`],
  ], i3.shots)
})

await A.run('R2', async p => {
  await A.toEdit(p)
  await A.pubOrig(p, TUE)
  const i0 = await A.insNow(p)
  await U.usersPane(p)
  await U.addPerson(p, { cs: 'Rookie', ini: 'RK', seat: 'RCP', cat: 'C' })
  const i1 = await A.insPic(p, 'r2-a-draft-days-added', 'foot')
  judge('R2.a', 'only Tuesday published; Admin → Users: New person "Rookie" (WSO); Insights', [
    ['he is listed at once (six days are the working copy)', A.idleHas(i1, 'Rookie')],
    ['the count is one more', idleN(i1) === idleN(i0) + 1, `${idleN(i0)} → ${idleN(i1)}`],
  ], i1.shots)
})
