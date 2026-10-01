/* Scenario 3 — a draft neighbour moves a warning that is deliberately live on a published face (crew rest). */
import * as A from './ins-a-lib.mjs'
const { L, W, MON, TUE, row, judge, pic, savePart } = A
const S = '3', WHO = 'casper'   /* Outlaw: Monday Go 2 RU (lands late), Tuesday Go 1 (reports 06:00) */
const { browser, p, errors } = await A.world()
const issues = s => { const m = /(\d+) issues?/.exec(s || ''); return m ? +m[1] : (/clear|No issues/i.test(s || '') ? 0 : null) }
const rest = r => { const x = A.rowOf(r, /Conflicts by type/i, /^Crew rest \(/); return x === '(none)' ? 0 : +x.replace(/^.*\D(\d+)$/, '$1') }
const dot = async (surf, di) => (await A.pucks(p, `${surf} .day[data-day="${di}"]`, WHO)).filter(x => x.dot).length
async function look(name) {
  const f = await A.face(p, TUE)
  await A.openList(p, '#eWeek', TUE); const el = await A.readList(p, '#eWeek', TUE)
  const fm = await A.face(p, MON)
  const dE = await dot('#eWeek', MON)
  const v = await A.vface(p, TUE)
  await A.openList(p, '#vWeek', TUE); const vl = await A.readList(p, '#vWeek', TUE)
  await W.showDay(p, MON, '#vWeek')
  const dV = await dot('#vWeek', MON)
  await A.puckPic(p, '#vWeek', MON, WHO, name + '-viewonly-monday-puck').then(s => (look.shots = [s]))
  await W.showDay(p, TUE, '#vWeek'); look.shots.push(await pic(p, name + '-viewonly-tuesday'))
  const i = await A.ins(p, name + '-insights', { foot: true })
  return { f, fm, v, el, vl, dE, dV, i, shots: [...look.shots, ...i.shots] }
}
const say = x => `View-only Tuesday bar "${x.v.bar}" (crew-rest line ${A.lineOf(x.vl, /Crew rest breach/i) ? 'shown' : 'absent'}) · Edit Schedule Tuesday: ${A.faceLine(x.f)} (crew-rest line ${A.lineOf(x.el, /Crew rest breach/i) ? 'shown' : 'absent'}) · Monday: chip "${x.fm.pending}", tag ${x.fm.tag}, Outlaw's dotted mark on ${x.dV} puck(s) on View-only and ${x.dE} on Edit Schedule · Insights: tile ${A.tile(x.i, /warning/i)}, "${A.byDay(x.i, 'Mon')}", "${A.byDay(x.i, 'Tue')}", Crew rest ${rest(x.i)}`
try {
  /* the fixture: Monday's late line brought early enough that Outlaw's rest holds; then Tuesday published */
  await A.toEdit(p); await W.boardOn(p, MON)
  await A.boxText(p, 'ff:0.1.1.to', '10:00'); await A.boxText(p, 'ff:0.1.1.ld', '11:25')
  const sA = await pic(p, 's3-a-monday-board-early')
  await W.boardOff(p)
  const pub = await A.pubOrig(p, TUE)
  const a = await look('s3-a')
  judge(`${S}.a`, `Monday (draft) board: Go 2's RU line T/O 19:20→10:00, LD 20:45→11:25 (Outlaw lands early); Tuesday signed and ${pub.r.label}; Monday left draft`, [
    ['Tuesday is Original, nothing pending', /ORIG/.test(a.f.tag) && !A.isPending(a.f), A.faceLine(a.f)],
    ['Monday is a draft', /DRAFT/.test(a.fm.tag), a.fm.tag],
    ['no crew-rest line on Tuesday (View-only and Edit Schedule)', !A.lineOf(a.vl, /Crew rest breach/i) && !A.lineOf(a.el, /Crew rest breach/i), a.v.bar],
    ['Insights: no Crew rest conflict', rest(a.i) === 0, A.byType(a.i).slice(0, 200)],
    ['Insights Tuesday = the Tuesday bar', issues(A.byDay(a.i, 'Tue')) === issues(a.v.bar), `${A.byDay(a.i, 'Tue')} / ${a.v.bar}`],
    ['no dotted mark on Outlaw on Monday', a.dV === 0 && a.dE === 0, [a.dV, a.dE]],
    ['the window on top at its centre', a.i.top === true],
  ], [sA, ...a.shots])

  /* the action: Monday's line made late */
  await A.toEdit(p); await W.boardOn(p, MON)
  await A.boxText(p, 'ff:0.1.1.ld', '20:45')
  await W.boardOff(p)
  const b = await look('s3-b')
  judge(`${S}.b`, 'Monday (draft) board: the same line\'s LD 11:25→20:45 (one edit) — Outlaw now lands late; ✓ Done', [
    ['the published Tuesday list gains the crew-rest line at once (View-only)', !!A.lineOf(b.vl, /Crew rest breach/i) && issues(b.v.bar) === issues(a.v.bar) + 1, b.v.bar],
    ['…and on Edit Schedule', !!A.lineOf(b.el, /Crew rest breach/i) && issues(b.f.bar) === issues(a.f.bar) + 1, b.f.bar],
    ['Monday gains the dotted mark on Outlaw (View-only and Edit Schedule)', b.dV > 0 && b.dE > 0, [b.dV, b.dE]],
    ['Insights adds one Tuesday issue at once', issues(A.byDay(b.i, 'Tue')) === issues(A.byDay(a.i, 'Tue')) + 1, `${A.byDay(a.i, 'Tue')} → ${A.byDay(b.i, 'Tue')}`],
    ['Insights adds one Crew rest conflict', rest(b.i) === rest(a.i) + 1, `${rest(a.i)} → ${rest(b.i)}`],
    ['Insights Tuesday = the published Tuesday bar', issues(A.byDay(b.i, 'Tue')) === issues(b.v.bar), `${A.byDay(b.i, 'Tue')} / ${b.v.bar}`],
    ['the week tile moved by Monday\'s change + Tuesday\'s one', +A.tile(b.i, /warning/i) - +A.tile(a.i, /warning/i) === (issues(A.byDay(b.i, 'Mon')) - issues(A.byDay(a.i, 'Mon'))) + 1, `${A.tile(a.i, /warning/i)} → ${A.tile(b.i, /warning/i)}; Monday ${A.byDay(a.i, 'Mon')} → ${A.byDay(b.i, 'Mon')}`],
    ['Tuesday gets NO pending change from the live warning', !A.isPending(b.f) && !b.f.alpub && !b.f.nys, A.faceLine(b.f)],
    ['Tuesday still Original', /ORIG/.test(b.f.tag), b.f.tag],
    ['Monday still a draft (its change is a working-copy change)', /DRAFT/.test(b.fm.tag), b.fm.tag],
  ], b.shots)
  row(`${S}.b+`, 'what the window said, before → after the Monday edit', A.diffText(a.i, b.i), 'RECORDED')

  /* undo the Monday edit */
  await A.toEdit(p)
  const u = await W.door(p, 'top', 'undo')
  const c = await look('s3-c')
  judge(`${S}.c`, `top bar Undo ("${u.title}")`, [
    ['the crew-rest line is gone from the published Tuesday', !A.lineOf(c.vl, /Crew rest breach/i) && !A.lineOf(c.el, /Crew rest breach/i), c.v.bar],
    ['the dotted mark is gone from Monday', c.dV === 0 && c.dE === 0, [c.dV, c.dE]],
    ['Insights says word for word what it said before the edit', A.same(a.i, c.i), A.diffText(a.i, c.i)],
    ['Tuesday not pending', !A.isPending(c.f), A.faceLine(c.f)],
  ], c.shots)
  row(`${S}.say`, 'the three checkpoints', `BEFORE: ${say(a)} ;; LATE: ${say(b)} ;; UNDONE: ${say(c)}`, 'RECORDED')
} catch (e) { row(`${S}.X`, 'the script stopped', String(e && e.stack || e).slice(0, 700), 'FAIL', [await pic(p, `s${S}-X-error`)]) }
row(`${S}.err`, 'the browser\'s error list through this scenario', errors.length ? errors.join(' | ').slice(0, 800) : 'none', errors.length ? 'FAIL' : 'PASS')
savePart(`s${S}`, { errors })
await browser.close()
