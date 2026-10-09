// Scenario 7 — ALL and ALL AVAIL: T2 T3 T5 T6 T8 through the Calendar window, List Add, List pencil and Board Add (admin and member filer).
import { launch, open, table, errs, people, shot, sleep, press, allRecs, enableMemberFiling, asMember, closeAnyWin } from './it-A-lib.mjs'
import { calDoor, listDoor, penDoor, listD, boardDoor, runCase, closeBoardAny } from './it-A-doors.mjs'

const browser = await launch()
const T = table('s7')
const SIZES = (process.argv[2] || 'desk,phone').split(',')
const ROLES = (process.argv[3] || 'admin,member').split(',')
const PHS = (process.argv[4] || 'allavail,all').split(',')
const cases = ['T2', 'T3', 'T5a', 'T5b', 'T6', 'T8']
const DAY = { allavail: { cal: '2026-07-20', list: '2026-07-22', pen: '2026-07-24', board: 0 }, all: { cal: '2026-07-21', list: '2026-07-23', pen: '2026-07-27', board: 1 } }
const hour = i => [`0${8 + i}:00`.slice(-5), `0${9 + i}:00`.slice(-5)]

for (const size of SIZES) for (const role of ROLES) for (const ph of PHS) {
  const { ctx, page } = await open(browser, size)
  if (role === 'member') { await enableMemberFiling(page); await asMember(page, 'Ranger') }
  const tag = `s7-${size === 'phone' ? 'p' : 'd'}-${role === 'admin' ? 'a' : 'm'}-${ph === 'all' ? 'all' : 'aa'}`
  const out = []
  const run = async (label, door, c, base, t, opts) => {
    try { const r = await runCase(page, door, c, base, t, opts); out.push({ label, c, ...r }); console.log(tag, label, c, r.ok ? 'ok' : 'NO', r.ok ? '' : r.say.slice(0, 600)); return r }
    catch (e) { out.push({ label, c, ok: false, say: 'SCRIPT ERROR ' + String(e.message).split('\n').slice(0, 5).join(' | '), pics: [] }); console.log(tag, label, c, 'ERR', String(e.message).split('\n').slice(0, 5).join(' | ')); await shot(page, `${t}-${c}-err`).catch(() => {}); try { await closeAnyWin(page); await closeBoardAny(page) } catch {} }
  }
  const D = DAY[ph]
  /* a fixture: an untitled Event for the placeholder through the Calendar window */
  const fixture = async (iso, i) => {
    const before = new Set((await allRecs(page)).map(r => r.iid))
    const d0 = calDoor(); const [st, en] = hour(i)
    await d0.openNew(page, { iso, person: ph, type: 'Event', st, en }); await d0.submit(page)
    const fx = (await allRecs(page)).filter(r => !before.has(r.iid))[0]
    await closeAnyWin(page)
    return fx
  }
  for (const [i, c] of cases.entries()) { const [st, en] = hour(i); await run('calendar window', calDoor(), c, { iso: D.cal, person: ph, st, en }, `${tag}-cal`) }
  for (const [i, c] of cases.entries()) { const [st, en] = hour(i); await run('List Add', listDoor(), c, { iso: D.list, person: ph, st, en }, `${tag}-list`) }
  for (const [i, c] of cases.entries()) {
    try { const fx = await fixture(D.pen, i); await run('List pencil', listD(), c, { rec: fx, ph }, `${tag}-pen`) } catch (e) { out.push({ label: 'List pencil', c, ok: false, say: 'SCRIPT ERROR (fixture) ' + String(e.message).split('\n')[0], pics: [] }); await closeAnyWin(page).catch(() => {}) }
  }
  if (role === 'admin') for (const [i, c] of cases.entries()) { const [st, en] = hour(i); await run('Board Add', boardDoor(D.board), c, { person: ph, st, en }, `${tag}-board`) }
  const bad = out.filter(x => !x.ok)
  T.add({ n: 7, sub: `${ph}`, size: page.sizeName, role: role === 'admin' ? 'admin' : 'member filer (Ranger)' + ' · ' + (ph === 'all' ? 'ALL' : 'ALL AVAIL'), verdict: bad.length ? 'FAIL' : 'PASS',
    say: (bad.length ? 'Missed: ' + bad.map(b => `${b.label} ${b.c}: ${b.say}`).join(' || ') : `T2 T3 T5 T6 T8 held for ${ph === 'all' ? 'ALL' : 'ALL AVAIL'} at the Calendar window, List Add, List pencil${role === 'admin' ? ' and Board Add' : ' (a member has no Board)'}; the placeholder stayed; LL refused for it`),
    pics: out.flatMap(x => x.pics), detail: { out } })
  T.save()
  await ctx.close()
}
await browser.close()
console.log('errors', JSON.stringify([...new Set(errs)].slice(0, 8)))
