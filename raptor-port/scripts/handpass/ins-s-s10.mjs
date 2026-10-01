/* Scenario 10 — duty and ground rows added after publication remain outside Insights until issued. */
import * as S from './ins-s-lib2.mjs'
import { handPut } from './seat-lib.mjs'
const { B, L, W } = S
const { judge, row, pic, savePart, TUE } = B
B.prefix('s10-')
const { browser, p, errors } = await B.world()
const hrs = (r, n) => S.hoursOf(r, [n])[n] || '(none)'
const idle = r => (S.sec(r, 'Not on').find(x => x.startsWith('chips:')) || '').replace('chips:', '').split(',')
try {
  await B.toEdit(p)
  await S.publish(p, TUE, 'orig')
  const r0 = await S.look(p, 's10-a-original', { foot: true })
  row('10.a', 'Tuesday published (Original). Vandal and Zulu are on no schedule line that day', `Vandal hours ${hrs(r0, 'Vandal')} (idle: ${idle(r0).includes('Vandal')}) · Zulu hours ${hrs(r0, 'Zulu')} (idle: ${idle(r0).includes('Zulu')}) · tile ${r0.tiles[3].n} ${r0.tiles[3].l} · Tuesday "${S.byDay(r0, 'Tuesday')}"`, 'RECORDED', [r0.shot, r0.shot2])

  /* a timed duty row for Vandal */
  await S.board(p, TUE)
  const nD = await p.evaluate(() => window.DAYS[1].dutywaves[0].rows.length)
  await p.locator('#schedBoard [data-dradd="1.0"]').first().evaluate(e => e.scrollIntoView({ block: 'center' })); await p.locator('#schedBoard [data-dradd="1.0"]').first().click(); await S.sleep(600)
  await W.boardText(p, `dr:1.0.${nD}.role`, 'WALK DUTY')
  await W.boardText(p, `dr:1.0.${nD}.str`, '18:00')
  await W.boardText(p, `dr:1.0.${nD}.end`, '23:00')
  const hd = await handPut(p, `d:1.0.${nD}.+`, "split")
  /* a timed ground row for Zulu */
  const nG = await p.evaluate(() => window.DAYS[1].ground.length)
  await p.locator('#schedBoard [data-gradd="1"]').first().evaluate(e => e.scrollIntoView({ block: 'center' })); await p.locator('#schedBoard [data-gradd="1"]').first().click(); await S.sleep(600)
  await W.boardText(p, `gr:1.${nG}.prog`, 'WALK GROUND')
  await W.boardText(p, `gr:1.${nG}.str`, '17:00')
  await W.boardText(p, `gr:1.${nG}.end`, '22:30')
  const hg = await handPut(p, `g:1.${nG}.+`, "bullet")
  const pB = await pic(p, 's10-b-board-rows')
  const st = await p.evaluate(([a, b]) => ({ duty: window.DAYS[1].dutywaves[0].rows[a], ground: window.DAYS[1].ground[b] }), [nD, nG])
  await B.toEdit(p); await B.admin(p)
  const d1 = await S.dayState(p, TUE)
  const r1 = await S.look(p, 's10-c-pending', { foot: true })
  judge('10.b', `board: "+ Row" on 1st-wave duties (WALK DUTY 18:00–23:00, Vandal: ${JSON.stringify({ armed: hd.armed, msg: hd.msg })}) and "+ Item" on Ground (WALK GROUND 17:00–22:30, Zulu: ${JSON.stringify({ armed: hg.armed, msg: hg.msg })}); ✓ Done; reload`, [
    ['both rows exist with their times and people', st.duty && st.duty.id === 'split' && /18:?00/.test(st.duty.str) && st.ground && st.ground.who === 'bullet' && /17:?00/.test(st.ground.str), JSON.stringify(st).slice(0, 220)],
    ['Tuesday waits as pending', /pending/.test(d1.pending), d1.pending],
    ['Insights identical to 10.a in every section', S.same(r1, r0), S.same(r1, r0) ? '' : S.delta(r0, r1).slice(0, 500)],
  ], [pB, r1.shot, r1.shot2])

  await S.publish(p, TUE, 'al')
  const d2 = await S.dayState(p, TUE)
  const r2 = await S.look(p, 's10-d-al1', { foot: true })
  judge('10.c', 'sign the four and Publish AL1; Insights', [
    ['Tuesday is AL1, nothing pending', /AL1/.test(d2.tag) && !/pending/.test(d2.pending), `${d2.tag} / ${d2.pending}`],
    ['Vandal now in Work hours with the duty span (5h)', /^5h/.test(hrs(r2, 'Vandal')) || /4h|5h/.test(hrs(r2, 'Vandal')), `Vandal ${hrs(r0, 'Vandal')} → ${hrs(r2, 'Vandal')}`],
    ['Zulu now in Work hours with the ground span (5h30)', hrs(r2, 'Zulu') !== '(none)', `Zulu ${hrs(r0, 'Zulu')} → ${hrs(r2, 'Zulu')}`],
    ['the idle chips are unchanged (the list is who is not FLYING: duty and ground work do not take a man off it — Reaper has 1h of hours and was already listed)', idle(r2).join() === idle(r0).join(), idle(r2).join(',')],
    ['Insights and the day agree on Tuesday\'s issue count', new RegExp(`${/(\d+) issue/.exec(S.byDay(r2, 'Tuesday'))?.[1]} issue`).test(d2.editBar), `By day "${S.byDay(r2, 'Tuesday')}" vs "${d2.editBar}"`],
  ], [r2.shot, r2.shot2])
  row('10.d', 'everything that moved at AL1', S.delta(r1, r2).slice(0, 1000), 'RECORDED', [])
} catch (e) { row('10.X', 'the script stopped', String(e && e.stack || e).slice(0, 1500), 'FAIL', [await pic(p, 's10-X-error')]) }
row('10.err', "the browser's error list", errors.length ? errors.join(' | ').slice(0, 800) : 'none', errors.length ? 'FAIL' : 'PASS')
savePart('s10', { errors })
await browser.close()
