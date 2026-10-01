/* Scenario 7 — taking a man off, putting him back, and replacing him must move all crew figures together. */
import * as S from './ins-s-lib2.mjs'
import { handPut } from './seat-lib.mjs'
const { B, L, W } = S
const { judge, row, pic, savePart, TUE } = B
B.prefix('s7-')
const { browser, p, errors } = await B.world()
const idle = r => (S.sec(r, 'Not on').find(x => x.startsWith('chips:')) || '').replace('chips:', '').split(',')
const hrs = (r, n) => S.hoursOf(r, [n])[n] || '(no bar)'
const fly = r => S.tile(r, 2)
const SEAT = '1.1.1.0.p'
try {
  await B.toEdit(p)
  await S.publish(p, TUE, 'orig')
  const d0 = await S.dayState(p, TUE, { view: false })
  const r0 = await S.look(p, 's7-a-issued', { foot: true })
  row('7.a', 'Tuesday published (Original). Rebel flies only on Tuesday (second wave, line 2); Anvil flies nothing', `signs after publish [${d0.signs}] · Aircrew flying ${fly(r0)} · Rebel hours ${hrs(r0, 'Rebel')}, Anvil hours ${hrs(r0, 'Anvil')} · idle has Rebel: ${idle(r0).includes('Rebel')}, has Anvil: ${idle(r0).includes('Anvil')} · Sorties ${S.tile(r0, 0)} Formations ${S.tile(r0, 1)}`, 'RECORDED', [r0.shot, r0.shot2])

  /* the four sign again for the next version (a published day's boxes start empty), so "restored" can be told from "never filled" */
  await B.sign4(p, TUE)
  const dS = await S.dayState(p, TUE, { view: false })
  const rS = await S.look(p, 's7-a2-resigned', {})
  row('7.a2', 'the four sign-off boxes filled again for the next version (Edit Schedule)', `signs [${dS.signs}] · chip "${dS.pending}" · Insights ${S.same(rS, r0) ? 'identical to 7.a' : 'DIFFERS: ' + S.delta(r0, rS).slice(0, 200)}`, S.same(rS, r0) && !/·\|·/.test(dS.signs) ? 'PASS' : 'FAIL', [rS.shot])
  d0.signs = dS.signs

  /* take him off */
  await S.takeOff(p, TUE, SEAT); await B.toEdit(p)
  const d1 = await S.dayState(p, TUE, { view: false })
  const r1 = await S.look(p, 's7-b-off', {})
  judge('7.b', 'Rebel dragged off the seat on the board; ✓ Done; Insights', [
    ['Tuesday: 1 pending, sign-offs cleared', /1 pending/.test(d1.pending) && /·\|·\|·\|·/.test(d1.signs), `${d1.pending} / ${d1.signs}`],
    ['Insights identical to 7.a in every section', S.same(r1, r0), S.same(r1, r0) ? '' : S.delta(r0, r1).slice(0, 400)],
  ], [r1.shot])

  /* put him back */
  await S.board(p, TUE)
  const put = await handPut(p, SEAT, 'romeo')
  await B.toEdit(p)
  const d2 = await S.dayState(p, TUE, { view: false })
  const r2 = await S.look(p, 's7-c-back', {})
  judge('7.c', `Rebel picked back onto the same seat (${JSON.stringify({ took: put.took, msg: put.msg })}); ✓ Done`, [
    ['the exact put-back clears pending', !/pending/.test(d2.pending), `chip "${d2.pending}" marker "${d2.nys}"`],
    ['the four sign-offs are restored to the names signed at publication', d2.signs === d0.signs, `${d0.signs} → ${d2.signs}`],
    ['Insights identical to 7.a', S.same(r2, r0), S.same(r2, r0) ? '' : S.delta(r0, r2).slice(0, 400)],
  ], [r2.shot])

  /* replace him with an idle pilot, dragged from the crew list onto the occupied seat */
  await S.board(p, TUE)
  const src = p.locator('#sbRoster .rpuck[data-person="shaft"]:visible').first()
  await W.drag(p, src, p.locator(`#schedBoard [data-slot="${SEAT}"]`).first())
  const holder = await S.seatHolder(p, SEAT)
  await B.toEdit(p)
  const d3 = await S.dayState(p, TUE, { view: false })
  const r3 = await S.look(p, 's7-d-replaced-waiting', { foot: true })
  judge('7.d', `Anvil (idle pilot) dragged onto Rebel's seat (seat now "${holder}"); ✓ Done; Insights`, [
    ['the seat holds Anvil', holder === 'shaft', holder],
    ['Tuesday: 1 pending (a replacement is one change), sign-offs cleared', /1 pending/.test(d3.pending) && /·\|·\|·\|·/.test(d3.signs), `${d3.pending} / ${d3.signs}`],
    ['Insights identical to 7.a (Rebel still flying, Anvil still idle)', S.same(r3, r0), S.same(r3, r0) ? '' : S.delta(r0, r3).slice(0, 400)],
  ], [r3.shot, r3.shot2])

  await S.publish(p, TUE, 'al')
  const d4 = await S.dayState(p, TUE)
  const r4 = await S.look(p, 's7-e-al1', { foot: true })
  judge('7.e', 'sign the four and Publish AL1 (the replacement goes out); Insights', [
    ['Tuesday is AL1, nothing pending', /AL1/.test(d4.tag) && !/pending/.test(d4.pending), `${d4.tag} / ${d4.pending}`],
    ['Sorties and Formations fixed', S.tile(r4, 0) === S.tile(r0, 0) && S.tile(r4, 1) === S.tile(r0, 1), S.brief(r4).slice(0, 80)],
    ['Aircrew flying unchanged (one out, one in)', fly(r4) === fly(r0), `${fly(r0)} → ${fly(r4)}`],
    ["Rebel joins the idle chips; Anvil leaves them", idle(r4).includes('Rebel') && !idle(r4).includes('Anvil'), idle(r4).join(',')],
    ["Anvil's hours change, Rebel's hours change", hrs(r4, 'Anvil') !== hrs(r0, 'Anvil') && hrs(r4, 'Rebel') !== hrs(r0, 'Rebel'), `Anvil ${hrs(r0, 'Anvil')} → ${hrs(r4, 'Anvil')}; Rebel ${hrs(r0, 'Rebel')} → ${hrs(r4, 'Rebel')}`],
  ], [r4.shot, r4.shot2])
  row('7.f', 'what moved at AL1', S.delta(r3, r4).slice(0, 900), 'RECORDED', [])
} catch (e) { row('7.X', 'the script stopped', String(e && e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 's7-X-error')]) }
row('7.err', "the browser's error list", errors.length ? errors.join(' | ').slice(0, 800) : 'none', errors.length ? 'FAIL' : 'PASS')
savePart('s7', { errors })
await browser.close()
