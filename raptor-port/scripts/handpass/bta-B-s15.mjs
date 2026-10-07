/* S15 — all-day Training landed on the Ground Programme (owner X = Vandal); a second man (Zulu) added to its row and given OL;
   the owner given an independent ATT C. No warning against its own request; Zulu's OL and Vandal's ATT C appear. */
import * as T from './bta-B-lib.mjs'
import * as Q from './bta-B-lib2.mjs'
const { K, B, C, D, L, W, P6, ID, CSN, TUE, sleep, R, pic } = T
const t = T.mk('s15')
const Z = 'bullet', ZC = 'Zulu'
const { browser, p, errors } = await K.fresh()
try {
  const f = await T.file(p, { type: 'Training', di: TUE, allday: true, remarks: 'Range course' })
  const g0 = await Q.groundRowsOf(p, TUE, f.iid)
  const v0 = await T.see(p, 's15-0-owner')
  t.add('S15.0', `Training, All day, filed for ${CSN} (Tuesday); its Ground Programme row: ${JSON.stringify(g0)}`, T.says(v0), g0.length === 1 && v0.held.length === 0 ? 'PASS' : 'FAIL', v0.pics)

  await K.boardTo(p, TUE)
  const ri = g0[0].ri
  const put = await K.handPut(p, `g:${TUE}.${ri}.+`, Z)
  const g1 = await Q.groundRowsOf(p, TUE, f.iid)
  const more = await p.evaluate(([i, r]) => JSON.stringify(window.DAYS[i].ground[r].more || []), [TUE, ri])
  const z1 = await T.see(p, 's15-1-zulu', { id: Z, cs: ZC })
  const v1 = await T.see(p, 's15-1-owner')
  t.add('S15.1', `${ZC} put on that row from the crew list (took ${put.took}; the app said ${JSON.stringify(put.msg)}; row's extra people ${more}); no leave filed for him yet`, `${ZC}: ${T.says(z1)} || ${CSN}: ${T.says(v1)}`, put.took && z1.held.length === 0 && v1.held.length === 0 ? 'PASS' : 'FAIL', [...z1.pics])

  const o = await T.file(p, { person: Z, type: 'OL', di: TUE, allday: true, remarks: 'Overseas course' })
  const z2 = await T.see(p, 's15-2-zulu', { id: Z, cs: ZC })
  const v2 = await T.see(p, 's15-2-owner')
  t.add('S15.2', `OL, All day, filed for ${ZC} for Tuesday on the Inputs page (stored: ${await T.rec(p, o.iid)}; asked ${o.asked.join(',') || 'nothing'})`, `${ZC}: ${T.says(z2)} || ${CSN}: ${T.says(v2)}`,
    z2.held.some(x => /On leave but tasked — TRAINING/i.test(x) || /leave but tasked — TRAINING/i.test(x)) && z2.ring && v2.held.length === 0 ? 'PASS' : 'FAIL', [...z2.pics, ...v2.pics])

  const d = await T.file(p, { type: 'ATT C', di: TUE, allday: true, remarks: 'Fever' })
  const z3 = await T.see(p, 's15-3-zulu', { id: Z, cs: ZC })
  const v3 = await T.see(p, 's15-3-owner')
  const training = [...z3.held, ...v3.held].filter(x => /Training (clashes|but tasked)/i.test(x))
  t.add('S15.3', `ATT C, All day, filed for ${CSN} for Tuesday (stored: ${await T.rec(p, d.iid)}); his Training row stands on the Ground Programme`, `${ZC}: ${T.says(z3)} || ${CSN}: ${T.says(v3)}`,
    z3.held.some(x => /leave but tasked — TRAINING/i.test(x)) && v3.held.some(x => /Downchit but tasked — TRAINING/i.test(x)) && training.length === 0 ? 'PASS' : 'FAIL', [...v3.pics, ...z3.pics])
  t.add('S15.3a', 'any "Training clashes" / "Training but tasked" line against its own row, for either man', JSON.stringify(training) || 'none', training.length === 0 ? 'PASS' : 'FAIL')

  await B.reloadAs(p, 'a'); await B.toEdit(p)
  const z4 = await T.see(p, 's15-4-zulu', { id: Z, cs: ZC, noPics: true }), v4 = await T.see(p, 's15-4-owner', { noPics: true })
  t.add('S15.4', 'reload and sign in again', `${ZC}: ${T.says(z4)} || ${CSN}: ${T.says(v4)}`, z4.held.some(x => /leave but tasked — TRAINING/i.test(x)) && v4.held.some(x => /Downchit but tasked — TRAINING/i.test(x)) ? 'PASS' : 'FAIL')
} catch (e) { R('S15.X', 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await pic(p, 's15-X')]) }
R('S15.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
await browser.close()
T.done('bta-B-s15')
