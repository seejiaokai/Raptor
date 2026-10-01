/* Scenario 6 — hidden warnings follow the version that carried the hide. */
import * as S from './ins-s-lib2.mjs'
const { B, L, W } = S
const { judge, row, pic, savePart, TUE, K } = B
B.prefix('s6-')
const { browser, p, errors } = await B.world()
const two = r => S.typeCount(r, /^Conflict — two events/)
const list = async (surf = '#eWeek') => { if (surf === '#eWeek') { await B.toEdit(p) } else { await L.go(p, 'viewsched') } await B.openList(p, surf, TUE); return B.readList(p, surf, TUE) }
const sum = l => `${l.bar} | ${(l.lines || []).map(x => `${x.ix}:${x.struck ? 'STRUCK' : 'plain'}${x.btn ? '[' + x.btn + ']' : ''}`).join(' ')}`
try {
  await B.toEdit(p)
  await S.publish(p, TUE, 'orig')
  const l0 = await list()
  const r0 = await S.look(p, 's6-a-original', { foot: true })
  row('6.a', 'Tuesday published (Original) with four shown issues; Insights', `Tuesday list: ${sum(l0)} · tile ${r0.tiles[3].n} / "${r0.tiles[3].l}" · two-events ${two(r0)} · Tuesday "${S.byDay(r0, 'Tuesday')}"`, 'RECORDED', [r0.shot, r0.shot2])

  /* hide Saint's clash with its ✕, then a reload */
  const did = await B.hide(p, TUE, K.clash.re)
  await B.admin(p)
  const l1 = await list(); const h1 = await S.dayState(p, TUE, { view: false })
  const r1 = await S.look(p, 's6-b-hide-waiting')
  judge('6.b', `✕ on Saint's clash (${did}); reload; the day's list and Insights`, [
    ['the hidden line is struck out in Tuesday\'s list', (l1.lines || []).some(x => x.struck), sum(l1)],
    ['Tuesday waits: 1 pending', /1 pending/.test(h1.pending), h1.pending],
    ['Insights identical to 6.a in every section', S.same(r1, r0), S.same(r1, r0) ? '' : S.delta(r0, r1).slice(0, 400)],
  ], [r1.shot])
  await L.go(p, 'viewsched')
  const rv1 = await S.look(p, 's6-b2-view-only')
  const lv1 = await list('#vWeek')
  row('6.b2', 'same moment on View-only Sched', `${S.same(rv1, r0) ? 'Insights identical to 6.a' : 'DIFFERS ' + S.delta(r0, rv1).slice(0, 300)} · Tuesday face bar: ${sum(lv1)}`, S.same(rv1, r0) ? 'PASS' : 'FAIL', [rv1.shot])

  /* AL1 carries the hide */
  await S.publish(p, TUE, 'al')
  const l2 = await list(); const lv2 = await list('#vWeek')
  const r2 = await S.look(p, 's6-c-al1', { foot: true })
  judge('6.c', 'sign the four and Publish AL1 (the hide goes out)', [
    ['issues tile 33 → 32', +r0.tiles[3].n === 33 && +r2.tiles[3].n === 32, `${r0.tiles[3].n} → ${r2.tiles[3].n}`],
    ['warning subtitle 13 → 12', /^13/.test(r0.tiles[3].l) && /^12/.test(r2.tiles[3].l), `${r0.tiles[3].l} → ${r2.tiles[3].l}`],
    ['Conflicts by type: two events 6 → 5', two(r0) === 6 && two(r2) === 5, `${two(r0)} → ${two(r2)}`],
    ['By day Tuesday 4 → 3 issues', /4 issues/.test(S.byDay(r0, 'Tuesday')) && /3 issues/.test(S.byDay(r2, 'Tuesday')), S.byDay(r2, 'Tuesday')],
    ["the Tuesday bar reads 3 issues on both pages", /3 issues/.test(l2.bar) && /3 issues/.test(lv2.bar), `Edit "${l2.bar}" / View "${lv2.bar}"`],
    ['the struck-out line is reachable in Tuesday\'s list (Edit has ↺, View-only has no button)', (l2.lines || []).some(x => x.struck && x.btn === '↺') && (lv2.lines || []).some(x => x.struck && !x.btn), `Edit ${sum(l2)} / View ${sum(lv2)}`],
  ], [r2.shot, r2.shot2])

  /* unhide */
  const did2 = await B.again(p, TUE, K.clash.re)
  await B.admin(p)
  const l3 = await list(); const h3 = await S.dayState(p, TUE, { view: false })
  const r3 = await S.look(p, 's6-d-unhide-waiting')
  judge('6.d', `↺ on the struck line (${did2}); reload; Insights`, [
    ['the line is flagged again on the working copy (not struck)', !(l3.lines || []).some(x => x.struck), sum(l3)],
    ['Tuesday waits: pending', /pending/.test(h3.pending), h3.pending],
    ['Insights identical to 6.c (still three)', S.same(r3, r2), S.same(r3, r2) ? '' : S.delta(r2, r3).slice(0, 400)],
  ], [r3.shot])

  await S.publish(p, TUE, 'al')
  const r4 = await S.look(p, 's6-e-al2', { foot: true })
  const h4 = await S.dayState(p, TUE)
  judge('6.e', 'sign and Publish AL2 (the unhide goes out)', [
    ['Tuesday is AL2', /AL2/.test(h4.tag), h4.tag],
    ['tile back to 33 / 13 warning', +r4.tiles[3].n === 33 && /^13/.test(r4.tiles[3].l), `${r4.tiles[3].n} ${r4.tiles[3].l}`],
    ['two events back to 6, Tuesday back to 4', two(r4) === 6 && /4 issues/.test(S.byDay(r4, 'Tuesday')), `${two(r4)} / ${S.byDay(r4, 'Tuesday')}`],
    ['tile, types and days agree with each other (sum of By day = tile)', S.sec(r4, 'By day').reduce((a, x) => a + (+(/(\d+) issue/.exec(x) || [0, 0])[1]), 0) === +r4.tiles[3].n, S.sec(r4, 'By day').join(';')],
  ], [r4.shot, r4.shot2])
} catch (e) { row('6.X', 'the script stopped', String(e && e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 's6-X-error')]) }
row('6.err', "the browser's error list", errors.length ? errors.join(' | ').slice(0, 800) : 'none', errors.length ? 'FAIL' : 'PASS')
savePart('s6', { errors })
await browser.close()
