/* [DB-READINESS] phase 7 — WALKER A, part 8: the published day, retyped (Astra's scenario 28, one cell of it) — and the
   POSITIVE CONTROL for "nobody earns from a Personal crowd": the same crowd DOES earn once the request asks the OIL
   question and that version is published. Saturday: Personal (Ranger) with ALL AVAIL, published → retype to Training
   (Yes) on the working copy → the issued face unchanged, pending, sign-offs fall → sign, Publish AL1 → the Leave War:
   the crowd men now wear HO → retype back to Personal, sign, Publish AL2 → the credits are gone again. */
import { boot, world, fileTimed, oilButton } from './p6-lib.mjs'
import * as S from './seat-lib.mjs'
import { lwCell } from './lib.mjs'
import * as A from './p7-a-lib.mjs'
const { L, W } = await boot()
const W2 = await import('./dbrA-W2-lib.mjs')
const { browser, p, errors } = await world(L)
await W.toastSpy(p)
const SAT = A.SAT, iso = A.ISO[SAT]
A.scen('A28b', 'published Saturday (Personal, Ranger, ALL AVAIL): ✎ type → Training (OIL question: Yes) on the working copy; then the four signed and Publish AL1; then ✎ type → Personal, signed, Publish AL2 — the issued face, the pending mark, the sign-offs and the Leave War after each')
try {
  const iid = await fileTimed(L, p, { person: A.RANGER, type: 'Personal', iso, from: '10:00', to: '11:00', remarks: 'P7 A28b' })
  await W.boardOn(p, SAT)
  A.ok('ALL AVAIL placed', (await A.place(S, p, SAT, await A.rowIdx(p, SAT, iid), 'extras', 'allavail')).took)
  const w0 = await A.openChip(p, '#schedBoard', iid); await A.closeWin(p)
  const N = String(w0.n); const three = w0.ids.filter(id => !['stiff', A.RANGER].includes(id)).slice(0, 3); const names = await A.csOf(p, three)
  await W.boardOff(p); await W.toEdit(L, p); await W.showDay(p, SAT)
  await W.signDay(p, SAT); const pub = await W.publishDay(p, SAT)
  A.ok('Saturday published (ORIG)', pub.pressed && /ORIG/.test((await W.head(p, SAT)).tag))
  await W.signDay(p, SAT)
  const lw0 = await lwCell(p, [...three, A.RANGER], iso)
  A.data(`Leave War after ORIG (Personal): ${JSON.stringify(lw0)}`)
  A.ok('ORIG (Personal): no FO / HO for the crowd men or Ranger', Object.values(lw0).every(c => c !== 'NO CELL DRAWN' && !/FO|HO/.test(c.text || '')), lw0)

  /* retype on the working copy */
  const e = await A.editReq(L, W2, p, iid, { type: 'Training' }, { oil: 'Yes' })
  A.said('editor (type → Training): ' + JSON.stringify(e).slice(0, 300) + '; toasts ' + JSON.stringify(await W.toasts(p)))
  await W.toEdit(L, p); await A.showWeekChip(p, '#eWeek', SAT, iid)
  const ec = await A.chips(p, `#eWeek .day[data-day="${SAT}"]`, iid)
  await W.showDay(p, SAT); const h = await W.head(p, SAT)
  A.said(`working copy: chip "${ec[0] && ec[0].txt}" — "${ec[0] && ec[0].title}"; head: tag "${h.tag}", pending "${h.pending}", sign-off boxes ${JSON.stringify(h.signs)}`)
  A.ok('WORKING COPY: as Training the chip says the crowd earns', ec[0] && /earn half a day|earn/.test(ec[0].title) && !/None of these/.test(ec[0].title), ec[0])
  A.ok('the day reads pending and the four sign-offs fall (D103)', /pending/.test(h.pending) && W.signsEmpty(h), h)
  await A.pic(L, p, 'A28b-1-editweek-retyped-pending')
  await L.go(p, 'viewsched'); await A.showWeekChip(p, '#vWeek', SAT, iid)
  const vc = await A.chips(p, `#vWeek .day[data-day="${SAT}"]`, iid)
  const vrow = await p.evaluate(([d, i]) => { const c = document.querySelector(`#vWeek .day[data-day="${d}"] .oilcount[data-oilsent="i:${i}"]`); const r = c && c.closest('tr, .grow, .arow, li, div'); return r ? r.innerText.replace(/\s+/g, ' ').slice(0, 80) : null }, [SAT, iid])
  A.said(`View-only Sched (issued Original): chip "${vc[0] && vc[0].txt}" — "${vc[0] && vc[0].title}"; the row reads "${vrow}"`)
  A.ok(`ISSUED FACE unchanged: still ${N}, "None of these ${N} earn OIL today", "when this day was issued"`, vc[0] && vc[0].txt === N && /None of these/.test(vc[0].title) && /when this day was issued/.test(vc[0].title), vc[0])
  await A.pic(L, p, 'A28b-2-viewsched-issued-unchanged')
  const lw1 = await lwCell(p, [...three, A.RANGER], iso)
  A.data(`Leave War with the retype pending (issued is still Personal): ${JSON.stringify(lw1)}`)
  A.ok('LEAVE WAR while pending: still no FO / HO for the crowd men (only the issued version earns — D2, D142)', three.every((id, k) => !/FO|HO/.test((lw1[names[k]] || {}).text || '')), lw1)

  /* publish AL1 */
  await W.toEdit(L, p); await W.showDay(p, SAT)
  const sg = await W.signDay(p, SAT); const al = await W.publishAL(p, SAT)
  const h2 = await W.head(p, SAT)
  A.said(`signed ${JSON.stringify(sg)}; Publish AL → ${JSON.stringify(al)}; head: tag "${h2.tag}", pending "${h2.pending}"; toasts ${JSON.stringify(await W.toasts(p))}`)
  A.ok('AL1 published', al.pressed && /AL1/.test(h2.tag), h2)
  const lw2 = await lwCell(p, [...three, A.RANGER], iso)
  A.data(`Leave War after AL1 (Training, the OIL question Yes): ${JSON.stringify(lw2)}`)
  A.ok('POSITIVE CONTROL — after AL1 the three crowd men and Ranger DO wear HO', [...names, 'Ranger'].every(n => /HO|FO/.test((lw2[n] || {}).text || '')), lw2)
  await p.evaluate(([id, d]) => { const c = document.querySelector(`[data-testid="cell-${id}-${d}"]`); if (c) c.scrollIntoView({ block: 'center', inline: 'center' }) }, [three[0], iso]); await L.sleep(400)
  await A.pic(L, p, 'A28b-3-leavewar-after-AL1-training')
  await L.go(p, 'viewsched'); await A.showWeekChip(p, '#vWeek', SAT, iid)
  const vc2 = await A.chips(p, `#vWeek .day[data-day="${SAT}"]`, iid)
  A.said(`View-only Sched (issued AL1): chip "${vc2[0] && vc2[0].txt}" — "${vc2[0] && vc2[0].title}"`)

  /* back to Personal, AL2 */
  const e2 = await A.editReq(L, W2, p, iid, { type: 'Personal' })
  A.said('editor (type → Personal): ' + JSON.stringify(e2) + '; toasts ' + JSON.stringify(await W.toasts(p)))
  await W.toEdit(L, p); await W.showDay(p, SAT)
  const h3 = await W.head(p, SAT)
  A.ok('the day reads pending again, the four fallen', /pending/.test(h3.pending) && W.signsEmpty(h3), h3)
  const sg3 = await W.signDay(p, SAT); const al2 = await W.publishAL(p, SAT)
  const h4 = await W.head(p, SAT)
  A.said(`signed ${JSON.stringify(sg3)}; Publish AL → ${JSON.stringify(al2)}; head: tag "${h4.tag}", pending "${h4.pending}"`)
  A.ok('AL2 published', al2.pressed && /AL2/.test(h4.tag), h4)
  const lw3 = await lwCell(p, [...three, A.RANGER], iso)
  A.data(`Leave War after AL2 (Personal again): ${JSON.stringify(lw3)}`)
  A.ok('after AL2 (Personal again) the crowd men and Ranger wear no FO / HO — the credits are swept out', [...names, 'Ranger'].every(n => !/HO|FO/.test((lw3[n] || {}).text || '')), lw3)
  await p.evaluate(([id, d]) => { const c = document.querySelector(`[data-testid="cell-${id}-${d}"]`); if (c) c.scrollIntoView({ block: 'center', inline: 'center' }) }, [three[0], iso]); await L.sleep(400)
  await A.pic(L, p, 'A28b-4-leavewar-after-AL2-personal')
  await L.go(p, 'viewsched'); await A.showWeekChip(p, '#vWeek', SAT, iid)
  const vc3 = await A.chips(p, `#vWeek .day[data-day="${SAT}"]`, iid)
  A.said(`View-only Sched (issued AL2): chip "${vc3[0] && vc3[0].txt}" — "${vc3[0] && vc3[0].title}"`)
  A.ok('ISSUED AL2: "None of these … earn OIL today"', vc3[0] && /None of these/.test(vc3[0].title), vc3[0])
  const n0 = L.results.length
  await L.reloadCompare(p, 'A28b', 'a', { page: 'editsched' })
  A.ok('a reload gives back what was there and writes nothing', L.results.slice(n0).every(r => r.ok), L.results.slice(n0).filter(r => !r.ok))
} catch (e) { A.ok('the scenario ran', false, String(e && e.stack || e).slice(0, 700)); await A.pic(L, p, 'A28b-X-error').catch(() => {}) }
A.ok('no console error, page error or 4xx', errors.length === 0, errors.slice(0, 5))
A.saveRows(process.env.HP_OUT.replace(/\.json$/, '-walk8.json'), { errors })
await browser.close()
