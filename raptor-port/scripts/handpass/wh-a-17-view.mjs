/* [WARN-HIDE-KEPT] walker A — a day NOT yet published, seen read-only: View-only Sched's list (the scheduler's own
   view of it, then the member's after a reload and his sign-in) — the struck line with NO button (WH7, the approved
   picture's fifth frame); and, on a phone, the crew drawer beside the week and beside the board. One world. */
import { world, reloadAs, openList, readList, tapLine, closeList, pk, marked, sum, dayInfo, judge, row, savePart, pic, guard, toastNow, L, W, PHONE } from './wh-a-lib.mjs'
const S = '#eWeek', V = '#vWeek', TUE = 1
const { browser, p, errors } = await world(); p.setDefaultTimeout(8000)
const view = async (tag) => {
  await L.go(p, 'viewsched'); await openList(p, V, TUE)
  const l = await readList(p, V, TUE); const st = await pk(p, `${V} .day[data-day="1"]`, 'wolf'); const sa = await pk(p, `${V} .day[data-day="1"]`, 'salsa')
  const anyBtn = await p.evaluate(() => document.querySelectorAll('#vWeek .day[data-day="1"] [data-dwbox] button').length)
  await W.showDay(p, TUE, V); const f = await pic(p, tag)
  return { l, st, sa, anyBtn, f }
}
await guard('view', 'View-only Sched on a draft day', async () => {
  await L.go(p, 'editsched'); await openList(p, S, TUE)
  await tapLine(p, S, TUE, 3); const t1 = await toastNow(p)
  const v1 = await view('V1-view-only-one-hidden')
  const d1 = await dayInfo(p, V, TUE, () => pic(p, 'V1-view-only-dayinfo'))
  judge('21 / WH7 (View-only Sched, a draft day, the scheduler looking)', `Edit Schedule, Tuesday: ✕ on Static's long day (the app says "${t1}"); then the View-only Sched tab, Tuesday's bar tapped open; its ⓘ`, [
    ['the bar reads 3 issues · 2 warning', /3 issues/.test(v1.l.bar) && /2 warning/.test(v1.l.bar), v1.l.bar],
    ['four lines, the fourth painted struck and darker', v1.l.lines.length === 4 && v1.l.lines[3].struck && !v1.l.lines[0].struck && v1.l.lines[3].color !== v1.l.lines[0].color, v1.l.lines.map(x => x.struck)],
    ['NO button on any line — no ✕, no ↺', v1.l.lines.every(x => !x.btn) && v1.anyBtn === 0, `${v1.anyBtn} buttons`],
    ['Static is plain there; Saint still wears red C', v1.st.length >= 1 && marked(v1.st).length === 0 && v1.sa.some(x => x.ring === 'red'), `Static ${sum(v1.st)} | Saint ${sum(v1.sa)}`],
    ['its ⓘ counts 2 warning · 1 advisory and lists the struck line with no button', /2 warning/i.test(d1.sev) && /1 advisory/i.test(d1.sev) && !/note/i.test(d1.sev) && d1.lines.length === 4 && d1.lines[3].struck && d1.buttons === 0, `${d1.sev} · buttons ${d1.buttons}`],
  ], [v1.f, d1.pic])
  /* all four */
  await L.go(p, 'editsched'); await openList(p, S, TUE); for (const ix of [0, 1, 2]) await tapLine(p, S, TUE, ix)
  const v2 = await view('V2-view-only-all-hidden')
  await closeList(p, V, TUE); const shut = await readList(p, V, TUE); const f2 = await pic(p, 'V2-view-only-all-hidden-shut'); await openList(p, V, TUE); const again = await readList(p, V, TUE)
  judge('21 / WH6 (View-only Sched, every issue hidden)', 'Edit Schedule: the other three hidden; View-only Sched, Tuesday', [
    ['the bar is still there, quiet, reading "✓ No issues"; shut it reads "tap to review"', /✓ No issues/.test(v2.l.bar) && !/hard|adv/.test(v2.l.barCls) && /tap to review/.test(shut.bar), `${v2.l.bar} | ${shut.bar}`],
    ['it opens the four struck lines, none with a button', again.lines.length === 4 && again.lines.every(x => x.struck && !x.btn) && v2.anyBtn === 0, again.lines.map(x => `${x.struck}/${x.btn || 'none'}`)],
    ['Static and Saint are both plain', marked([...v2.st, ...v2.sa]).length === 0, `${sum(v2.st)} | ${sum(v2.sa)}`],
  ], [v2.f, f2])
  /* the member, after a reload */
  await L.settle(p); await reloadAs(p, 'm'); await L.sleep(500)
  await openList(p, V, TUE); const lm = await readList(p, V, TUE); const stm = await pk(p, `${V} .day[data-day="1"]`, 'wolf')
  const btnM = await p.evaluate(() => document.querySelectorAll('#vWeek .day[data-day="1"] [data-dwbox] button').length)
  await W.showDay(p, TUE, V); const f3 = await pic(p, 'V3-member-view-only-all-hidden')
  judge('21 / WH7 (the member\'s View-only Sched, the same draft day)', 'a reload, then the member (Ranger) signs in; Tuesday\'s bar tapped open', [
    ['he sees "✓ No issues" and the four struck lines', /✓ No issues/.test(lm.bar) && lm.lines.length === 4 && lm.lines.every(x => x.struck), lm.bar],
    ['he has no button on any line', lm.lines.every(x => !x.btn) && btnM === 0, `${btnM} buttons`],
    ['Static is plain for him too', stm.length >= 1 && marked(stm).length === 0, sum(stm)],
  ], [f3])
}, () => pic(p, 'V-error'))

/* the phone's crew drawer (the crew list is a drawer there) */
if (PHONE) {
  const { browser: b2, p: q, errors: e2 } = await world(); q.setDefaultTimeout(8000)
  await guard('drawer', 'the phone\'s crew drawer', async () => {
    await L.go(q, 'editsched'); await openList(q, S, TUE)
    const drawer = async () => { const dn = q.locator(`${S} .day[data-day="1"] [data-crewday="1"]`).first(); await dn.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await dn.click(); await L.sleep(400); if (!(await q.evaluate(() => document.body.classList.contains('ros-open')))) { await q.locator('#rosTab').click(); await L.sleep(500) } const st = await pk(q, '#eRoster', 'wolf'), sa = await pk(q, '#eRoster', 'salsa'); const up = await q.evaluate(() => { const r = document.querySelector('#eRoster .puck[data-person="wolf"]'); if (!r) return false; const b = r.getBoundingClientRect(); return b.width > 0 && b.left >= 0 && b.right <= innerWidth }); return { st, sa, up } }
    const closeDrawer = async () => { if (await q.evaluate(() => document.body.classList.contains('ros-open'))) { await q.locator('#rosTab').click(); await L.sleep(500) } }
    const d0 = await drawer(); await q.evaluate(() => { const e = document.querySelector('#eRoster .puck[data-person="wolf"]'); if (e) e.scrollIntoView({ block: 'center' }) }); await L.sleep(250); const f0 = await pic(q, 'P1-crew-drawer-before'); await closeDrawer()
    await openList(q, S, TUE); await tapLine(q, S, TUE, 3)
    const d1 = await drawer(); await q.evaluate(() => { const e = document.querySelector('#eRoster .puck[data-person="wolf"]'); if (e) e.scrollIntoView({ block: 'center' }) }); await L.sleep(250); const f1 = await pic(q, 'P2-crew-drawer-static-plain'); await closeDrawer()
    judge('20 (phone: the crew drawer beside the week)', 'phone, Edit Schedule: Tuesday\'s name tapped → the AIRCREW drawer; closed; ✕ on Static\'s long day; the drawer again', [
      ['before: Static wears the grey ring and L in the drawer', d0.up && d0.st.some(x => x.ring === 'grey' && x.chip === 'L'), sum(d0.st)],
      ['after: Static is plain in the drawer; Saint still wears red C there', d1.up && d1.st.length >= 1 && marked(d1.st).length === 0 && d1.sa.some(x => x.ring === 'red'), `Static ${sum(d1.st)} | Saint ${sum(d1.sa)}`],
    ], [f0, f1])
  }, () => pic(q, 'P-error'))
  errors.push(...e2); await b2.close()
}
console.log('ERRORS', JSON.stringify(errors))
if (errors.length) row('errors (17-view)', 'the browser\'s error list through this file', errors.join(' | ').slice(0, 600), 'FAIL', [])
savePart('17-view', { errors })
await browser.close()
