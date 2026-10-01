/* Scenario 3 — a draft neighbour moves a warning that is deliberately live on a published face (D183–D185 over D179). */
import * as S from './ins-s-lib2.mjs'
const { B, L, W } = S
const { judge, row, pic, savePart, TUE, MON } = B
B.prefix('s3-')
const { browser, p, errors } = await B.world()
const ph = !!process.env.HP_PHONE
const rest = r => S.typeCount(r, /^Crew rest/)
const tue = r => S.byDay(r, 'Tuesday').replace(/^Tuesday /, '')
const monPuck = async () => { await B.toEdit(p); await W.showDay(p, MON); return B.pk(await B.dayPucks(p, '#eWeek', MON, 'casper')) }
try {
  await B.toEdit(p)
  /* Monday's night line (Outlaw / casper) pulled to the afternoon so Tuesday's early report is clear: two time boxes on the board */
  await S.setTime(p, MON, 'ff:0.1.1.to', '13:00')
  await S.setTime(p, MON, 'ff:0.1.1.ld', '14:25')
  const mp0 = await (async () => { await B.toEdit(p); return monPuck() })()
  const d0 = await S.dayState(p, TUE, { view: false })
  const rW = await S.look(p, 's3-a-before-publish')
  row('3.a', "Monday (draft): Outlaw's second-wave line moved by the board's time boxes to 13:00 – 14:25; Tuesday not yet published", `Tuesday: ${S.dayLine(d0)} · Monday Outlaw's pucks: ${mp0} · Insights: Tuesday ${tue(rW)} · Crew rest ${rest(rW)} · issues tile ${rW.tiles[3].n}`, 'RECORDED', [rW.shot])

  await S.publish(p, TUE, 'orig')
  const d1 = await S.dayState(p, TUE)
  const r1 = await S.look(p, 's3-b-published', { foot: true })
  const mp1 = await monPuck()
  row('3.b', 'Tuesday signed and published (Original)', `Tuesday: ${S.dayLine(d1)} · Monday Outlaw: ${mp1} · Insights: Tuesday ${tue(r1)} · Crew rest ${rest(r1)} · tile ${r1.tiles[3].n} (${r1.tiles[3].l})`, 'RECORDED', [r1.shot, r1.shot2])

  /* Monday's duty made late again: the board's time boxes back to 19:20 – 20:45 */
  await S.setTime(p, MON, 'ff:0.1.1.ld', '20:45')
  await S.setTime(p, MON, 'ff:0.1.1.to', '19:20')
  await B.toEdit(p)
  const mp2 = await monPuck()
  const d2 = await S.dayState(p, TUE)
  const dMon2 = await S.dayState(p, MON, { view: false })
  const r2 = await S.look(p, 's3-c-monday-late', { foot: true })
  judge('3.c', "Monday's line made late again (19:20 – 20:45) on the board; ✓ Done; Tuesday and Insights", [
    ["Tuesday's published day list gains the live crew-rest warning (bar goes up by one)", d2.editBar !== d1.editBar && d2.viewBar !== d1.viewBar, `Edit "${d1.editBar}" → "${d2.editBar}"; View-only "${d1.viewBar}" → "${d2.viewBar}"`],
    ['Monday wears the dotted "breaks tomorrow\'s crew rest" mark on Outlaw', /dotted/.test(mp2), mp2],
    ['Insights: Tuesday gains one issue', /\d+ issue/.test(tue(r2)) && +/(\d+) issue/.exec(tue(r2))[1] === +/(\d+) issue/.exec(tue(r1))[1] + 1, `${tue(r1)} → ${tue(r2)}`],
    ['Insights: Crew rest conflicts +1', rest(r2) === rest(r1) + 1, `${rest(r1)} → ${rest(r2)}`],
    ['Tuesday gets no pending change from the live warning alone', !/pending/.test(d2.pending), `chip "${d2.pending}" marker "${d2.nys}" signs ${d2.signs}`],
    ['Monday stays a working-copy change (still a draft)', /DRAFT/i.test(dMon2.tag) || !/ORIG|AL/.test(dMon2.tag), `Monday tag "${dMon2.tag}"`],
  ], [r2.shot, r2.shot2])
  row('3.c2', 'the figures behind 3.c', S.delta(r1, r2).slice(0, 900), 'RECORDED', [])

  /* Undo the two Monday edits from the top bar */
  let u = []
  for (let i = 0; i < 2; i++) { const d = await W.door(p, 'top', 'undo'); u.push(d.pressed ? 'pressed' : JSON.stringify(d)) }
  await B.toEdit(p)
  const mp3 = await monPuck()
  const d3 = await S.dayState(p, TUE)
  const r3 = await S.look(p, 's3-d-after-undo', { foot: true })
  judge('3.d', `top-bar Undo twice (${u.join(', ')})`, [
    ["Tuesday's bar back to what it was", d3.editBar === d1.editBar && d3.viewBar === d1.viewBar, `${d3.editBar} / ${d3.viewBar}`],
    ["Monday's dotted mark gone", !/dotted/.test(mp3), mp3],
    ['Insights identical to 3.b (every section)', S.same(r3, r1), S.same(r3, r1) ? '' : S.delta(r1, r3).slice(0, 500)],
  ], [r3.shot, r3.shot2])
} catch (e) { row('3.X', 'the script stopped', String(e && e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 's3-X-error')]) }
row('3.err', "the browser's error list", errors.length ? errors.join(' | ').slice(0, 800) : 'none', errors.length ? 'FAIL' : 'PASS')
savePart('s3', { errors })
await browser.close()
