// Scenario 31 - Type back the published title. usage: node it-B-s31.mjs desk
import * as L from './it-B-lib.mjs'
const size = process.argv[2] || 'desk'
const WED = 2, THU = 3
const FOC = 'sports day|games afternoon|^event$'
for (const variant of ['A', 'B']) {
  const W = await L.mk(size)
  const p = W.page
  const ranger = await L.csId(p, 'Ranger'), basher = await L.csId(p, 'Basher')
  const tag = `s31-${size}-${variant}`
  await L.fileInput(W, { iso: '2026-07-15', type: 'Event', person: ranger, s: '09:00', e: '10:00', title: 'Sports day', rmk: 'titled one' })
  await L.fileInput(W, { iso: '2026-07-16', type: 'Event', person: basher, s: '11:00', e: '12:00', rmk: 'untitled one' })
  const a = await L.recBy(p, { person: ranger, type: 'Event' }), b = await L.recBy(p, { person: basher, type: 'Event' })
  await L.pubDay(W, WED); await L.pubDay(W, THU)
  /* ---- part 1: a published title, changed, typed back */
  const rd1 = async t => { const S = await L.snap(W, WED, { focus: FOC, pic: t }); return { s: S, text: L.brief(S), pics: [t + '-edit.png', t + '-togo.png'] } }
  const base = await rd1(tag + '-p1-0published')
  await L.retitle(W, a.iid, '2026-07-15', 'Games afternoon')
  const chg = await rd1(tag + '-p1-1changed')
  await L.retitle(W, a.iid, '2026-07-15', 'Sports day')
  const back = await rd1(tag + '-p1-2typedback')
  const clean = S => !S.f.pend.length && !S.f.nys && S.f.rows[0]?.name === 'SPORTS DAY' && S.f.rows[0]?.kind === 'EVENT' && !!S.f.signedLn
  const dirty = S => S.f.pend.length === 1 && /not yet signed/i.test(S.f.nys) && S.f.rows[0]?.name === 'GAMES AFTERNOON'
  const bundle = [base.s, chg.s, back.s]
  const okP1 = clean(base.s) && dirty(chg.s) && clean(back.s)
  L.row('31', size, 'admin', okP1 ? 'PASS' : 'FAIL', `[${variant}] titled Event: published ${L.brief(base.s)} -> changed to Games afternoon ${L.brief(chg.s)} -> typed Sports day back ${L.brief(back.s)}`, [tag + '-p1-0published-edit.png', tag + '-p1-1changed-edit.png', tag + '-p1-1changed-togo.png', tag + '-p1-2typedback-edit.png'])
  /* ---- part 2: an untitled Event, titled, then "eVeNt" */
  const rd2 = async t => { const S = await L.snap(W, THU, { focus: FOC, pic: t }); return { s: S, text: L.brief(S), pics: [t + '-edit.png', t + '-togo.png'] } }
  const base2 = await rd2(tag + '-p2-0published')
  await L.retitle(W, b.iid, '2026-07-16', 'Sports day')
  const chg2 = await rd2(tag + '-p2-1titled')
  await L.retitle(W, b.iid, '2026-07-16', 'eVeNt')
  const back2 = await rd2(tag + '-p2-2eVeNt')
  const rec2 = await L.rec(p, b.iid)
  const clean2 = S => !S.f.pend.length && !S.f.nys && S.f.rows[0]?.name === 'EVENT' && !S.f.rows[0]?.kind && !!S.f.signedLn
  const dirty2 = S => S.f.pend.length === 1 && /not yet signed/i.test(S.f.nys) && S.f.rows[0]?.name === 'SPORTS DAY'
  const okP2 = clean2(base2.s) && dirty2(chg2.s) && clean2(back2.s)
  L.row('31', size, 'admin', okP2 ? 'PASS' : 'FAIL', `[${variant}] untitled Event: published ${L.brief(base2.s)} -> titled Sports day ${L.brief(chg2.s)} -> typed eVeNt ${L.brief(back2.s)} (saved record title: ${JSON.stringify(rec2 && rec2.title)})`, [tag + '-p2-0published-edit.png', tag + '-p2-1titled-edit.png', tag + '-p2-2eVeNt-edit.png'])
  /* ---- checkpoint on part 2's last change (typing back): Undo brings the pending change back; Redo clears; reload keeps it */
  await L.checkpoint(W, variant, { n: '31', tag, read: rd2, applied: s => clean2(s), reverted: s => dirty2(s) })
  await W.browser.close()
}
L.saveRows('s31-' + size)
console.log('ERRORS', L.ERRS)
