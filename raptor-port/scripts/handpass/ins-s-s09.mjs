/* Scenario 9 — moving take-off time freezes Work hours as well as the day. */
import * as S from './ins-s-lib2.mjs'
const { B, L, W } = S
const { judge, row, pic, savePart, TUE } = B
B.prefix('s9-')
const { browser, p, errors } = await B.world()
const WHO = ['Warden', 'Basher', 'Outlaw', 'Hex', 'Rebel', 'Cinder']
const long = r => S.typeCount(r, /^Long work/)
const timesNow = async () => p.evaluate(() => { const w = window.DAYS[1].waves; return `f0.0 ${w[0].formations[0].to}–${w[0].formations[0].ld} · f1.1 ${w[1].formations[1].to}–${w[1].formations[1].ld}` })
try {
  await B.toEdit(p)
  await S.publish(p, TUE, 'orig')
  const d0 = await S.dayState(p, TUE)
  const r0 = await S.look(p, 's9-a-original', { foot: true })
  row('9.a', 'Tuesday published (Original); Insights', `times ${await timesNow()} · hours ${JSON.stringify(S.hoursOf(r0, WHO))} · Long work day ${long(r0)} · tile ${r0.tiles[3].n} (${r0.tiles[3].l}) · Tuesday "${S.byDay(r0, 'Tuesday')}" · ${S.dayLine(d0)}`, 'RECORDED', [r0.shot, r0.shot2])

  /* the take-off of wave 1's first formation moved an hour and ten later, its landing too; wave 2's last formation lands very late */
  await S.setTime(p, TUE, 'ff:1.0.0.to', '09:50')
  await S.setTime(p, TUE, 'ff:1.0.0.ld', '11:30')
  await S.setTime(p, TUE, 'ff:1.1.1.ld', '23:59')
  await B.toEdit(p)
  await B.admin(p)   // reload
  const d1 = await S.dayState(p, TUE)
  const r1 = await S.look(p, 's9-b-pending', { foot: true })
  const wkNow = await timesNow()
  judge('9.b', `board time boxes: formation 1 take-off 08:40 → 09:50 and landing 10:05 → 11:30; last formation of wave 2 landing → 23:59; ✓ Done; reload (${wkNow})`, [
    ['the working day shows the new times', /09:50–11:30/.test(wkNow) && /23:59/.test(wkNow), wkNow],
    ['Tuesday waits as pending', /pending/.test(d1.pending), d1.pending],
    ['the working copy\'s own bar differs from the issued face (live working warnings), the published face holds', d1.viewBar === d0.viewBar, `Edit "${d1.editBar}" / View "${d1.viewBar}"`],
    ['Insights identical to 9.a (hours, LONGDAY, warnings)', S.same(r1, r0), S.same(r1, r0) ? '' : S.delta(r0, r1).slice(0, 600)],
  ], [r1.shot, r1.shot2])

  await S.publish(p, TUE, 'al')
  const d2 = await S.dayState(p, TUE)
  const r2 = await S.look(p, 's9-c-al1', { foot: true })
  const hm = S.hoursOf(r0, WHO), hn = S.hoursOf(r2, WHO)
  judge('9.c', 'sign the four and Publish AL1; Insights', [
    ['Tuesday is AL1, nothing pending', /AL1/.test(d2.tag) && !/pending/.test(d2.pending), `${d2.tag} / ${d2.pending}`],
    ['the pilots of the moved formation have new hours (Warden, Basher, Outlaw, Hex)', ['Warden', 'Basher', 'Outlaw', 'Hex'].some(n => hm[n] !== hn[n]), `before ${JSON.stringify(hm)} → after ${JSON.stringify(hn)}`],
    ['the late-landing pair have new hours (Rebel, Cinder)', hm.Rebel !== hn.Rebel || hm.Cinder !== hn.Cinder, `Rebel ${hm.Rebel}→${hn.Rebel}, Cinder ${hm.Cinder}→${hn.Cinder}`],
    ['the warning figures moved with the hours at the same moment (issues tile, Long work day or By day Tuesday)', S.tile(r2, 3) !== S.tile(r0, 3) || long(r2) !== long(r0) || S.byDay(r2, 'Tuesday') !== S.byDay(r0, 'Tuesday'), `tile ${r0.tiles[3].n}→${r2.tiles[3].n}, Long ${long(r0)}→${long(r2)}, Tue "${S.byDay(r0, 'Tuesday')}"→"${S.byDay(r2, 'Tuesday')}"`],
    ['Insights and the day\'s own bar agree on Tuesday\'s issue count', new RegExp(`${/(\d+) issue/.exec(S.byDay(r2, 'Tuesday'))?.[1]} issue`).test(d2.editBar) && new RegExp(`${/(\d+) issue/.exec(S.byDay(r2, 'Tuesday'))?.[1]} issue`).test(d2.viewBar), `By day "${S.byDay(r2, 'Tuesday')}" vs Edit "${d2.editBar}" / View "${d2.viewBar}"`],
  ], [r2.shot, r2.shot2])
  row('9.d', 'everything that moved at AL1', S.delta(r1, r2).slice(0, 1200), 'RECORDED', [])
} catch (e) { row('9.X', 'the script stopped', String(e && e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 's9-X-error')]) }
row('9.err', "the browser's error list", errors.length ? errors.join(' | ').slice(0, 800) : 'none', errors.length ? 'FAIL' : 'PASS')
savePart('s9', { errors })
await browser.close()
