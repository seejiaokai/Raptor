/* Scenario 8 — a cancelled aircraft line and a cancelled formation obey the same boundary. */
import * as S from './ins-s-lib2.mjs'
const { B, L, W } = S
const { judge, row, pic, savePart, TUE } = B
B.prefix('s8-')
const { browser, p, errors } = await B.world()
const load = (r, n) => { const x = S.sec(r, 'Flying load').find(t => t.startsWith(n + '=')); return x ? x.split('=')[1] : '(not in the top twelve)' }
const cxState = async () => p.evaluate(() => window.DAYS[1].waves.flatMap((w, gi) => w.formations.map((f, fi) => 'f' + gi + '.' + fi + ':' + (f.cx ? 'FCX' : '-') + '/' + f.aircraft.map(a => (a.cx ? 'x' : 'o')).join(''))).join(' '))
const dayHead = async () => p.evaluate(() => { const d = document.querySelector('#eWeek .day[data-day="1"]'); const e = d && [...d.querySelectorAll('*')].find(x => /^\d X \d|^\d x \d/i.test((x.innerText || '').trim()) && x.children.length === 0); return e ? e.innerText.trim() : '?' })
try {
  await B.toEdit(p)
  await S.publish(p, TUE, 'orig')
  const r0 = await S.look(p, 's8-a-original', { foot: true })
  row('8.a', 'Tuesday published (Original); Insights', `Sorties ${S.tile(r0, 0)}, Formations ${S.tile(r0, 1)}, Aircrew ${S.tile(r0, 2)} · Drifter load ${load(r0, 'Drifter')}, Gambit load ${load(r0, 'Gambit')}, Warden ${load(r0, 'Warden')} · Tuesday "${S.byDay(r0, 'Tuesday')}" · cx ${await cxState()}`, 'RECORDED', [r0.shot, r0.shot2])

  await S.cx(p, TUE, '1.0.0.0', 'walk: one aircraft line')
  await B.toEdit(p)
  await S.cx(p, TUE, '1.0.1.0', 'walk: formation, first aircraft')
  await S.cx(p, TUE, '1.0.1.1', 'walk: formation, second aircraft')
  await B.toEdit(p)
  await B.admin(p)   // a reload, as the same admin
  const cs1 = await cxState(); const d1 = await S.dayState(p, TUE, { view: false }); const hd1 = await dayHead()
  const r1 = await S.look(p, 's8-b-pending', { foot: true })
  judge('8.b', 'on the board: CX the first aircraft of wave 1 formation 1, then both aircraft of formation 2 (whole formation); ✓ Done; reload; Insights', [
    ['the working copy holds the cancellations', /x/.test(cs1) && /f0\.1:FCX/.test(cs1), cs1],
    ['Tuesday waits: pending, sign-offs cleared', /pending/.test(d1.pending), d1.pending],
    ['Insights identical to 8.a in every section (nothing disappears before AL)', S.same(r1, r0), S.same(r1, r0) ? '' : S.delta(r0, r1).slice(0, 500)],
  ], [r1.shot, r1.shot2])
  row('8.b2', "the day's own head on Edit Schedule meanwhile", `day head "${hd1}" · bar "${d1.editBar}"`, 'RECORDED', [])

  await S.publish(p, TUE, 'al')
  const d2 = await S.dayState(p, TUE)
  const r2 = await S.look(p, 's8-c-al1', { foot: true })
  const sumDay = r => S.sec(r, 'By day').reduce((a, x) => a + (+(/(\d+) sorties/.exec(x) || [0, 0])[1]), 0)
  judge('8.c', 'sign the four and Publish AL1; Insights', [
    ['Tuesday is AL1, nothing pending', /AL1/.test(d2.tag) && !/pending/.test(d2.pending), `${d2.tag} / ${d2.pending}`],
    ['Sorties 32 → 29 (one line + the two of the cancelled formation leave)', S.tile(r0, 0) === 32 && S.tile(r2, 0) === 29, `${S.tile(r0, 0)} → ${S.tile(r2, 0)}`],
    ['Formations 16 → 15 (only the whole formation leaves)', S.tile(r0, 1) === 16 && S.tile(r2, 1) === 15, `${S.tile(r0, 1)} → ${S.tile(r2, 1)}`],
    ['Tuesday row agrees: 5 sorties · 3 formations', /5 sorties · 3 formations/.test(S.byDay(r2, 'Tuesday')), S.byDay(r2, 'Tuesday')],
    ['the By-day sorties add up to the Sorties tile', sumDay(r2) === S.tile(r2, 0), `${sumDay(r2)} vs ${S.tile(r2, 0)}`],
    ['the affected flyers\' loads fell (Drifter, Gambit)', load(r2, 'Drifter') !== load(r0, 'Drifter') && load(r2, 'Gambit') !== load(r0, 'Gambit'), `Drifter ${load(r0, 'Drifter')} → ${load(r2, 'Drifter')}; Gambit ${load(r0, 'Gambit')} → ${load(r2, 'Gambit')}`],
  ], [r2.shot, r2.shot2])
  row('8.d', 'everything that moved at AL1', S.delta(r1, r2).slice(0, 1100), 'RECORDED', [])

  /* and the reverse: un-cancel the single line, pending again; Insights holds AL1 */
  await S.uncx(p, TUE, '1.0.0.0'); await B.toEdit(p)
  const d3 = await S.dayState(p, TUE, { view: false })
  const r3 = await S.look(p, 's8-e-uncx-pending')
  judge('8.e', 'the single cancelled line un-cancelled on the board (a change waiting on AL1); Insights', [
    ['Tuesday pending again', /pending/.test(d3.pending), d3.pending],
    ['Insights identical to AL1 (8.c)', S.same(r3, r2), S.same(r3, r2) ? '' : S.delta(r2, r3).slice(0, 300)],
  ], [r3.shot])
} catch (e) { row('8.X', 'the script stopped', String(e && e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 's8-X-error')]) }
row('8.err', "the browser's error list", errors.length ? errors.join(' | ').slice(0, 800) : 'none', errors.length ? 'FAIL' : 'PASS')
savePart('s8', { errors })
await browser.close()
