/* WALKER B — Astra's scenario 23, the issued and older-version faces: the day's ⓘ panel counts the SHOWN warnings and
   lists every one, the hidden ones struck in place; each face (the working copy, the published face, a look at an
   older version) reads its OWN hides. */
import * as B from './wh-b-lib.mjs'
const { L, W, TUE, judge, row, pic, savePart, nIssues, lineOf, short, K, infoShort } = B
const S = '23', k = K.long
B.prefix('s23-')
const { browser, p, errors } = await B.world()
const struckIx = r => (r.lines || []).map((l, i) => l.struck ? i : -1).filter(i => i >= 0).join(',')
try {
  await B.toEdit(p)
  await B.pubOrig(p, TUE)
  await B.hide(p, TUE, k.re); const a1 = await B.pubAL(p, TUE)
  const h1 = await B.hide(p, TUE, K.clash.re), h2 = await B.hide(p, TUE, K.rest.re), h3 = await B.hide(p, TUE, K.brief.re)
  let w = await B.work(p, TUE)
  let s0 = await pic(p, `s${S}-0-work-all-hidden`)
  judge(`${S}.0`, 'setup: Original flagged → ✕ long day → AL1; then ✕ on the other three on the working copy (3 pending)', [
    ['AL1 went out', a1.r.pressed && /AL1/.test(w.head.tag), [a1.r, w.head.tag]], ['the three ✕ were pressed', [h1, h2, h3].every(x => x === 'pressed'), [h1, h2, h3]],
    ['the working copy: all four struck, the bar reads "✓ No issues"', w.list.lines.length === 4 && w.list.lines.every(x => x.struck) && /No issues/.test(w.list.bar), short(w.list)],
    ['3 pending', /^3\s*pending/.test(w.head.pending), w.head.pending]], [s0])

  /* the working copy's ⓘ (every issue hidden) */
  let r = await B.dayInfo(p, '#eWeek', TUE, `s${S}-1-info-work`)
  judge(`${S}.1`, 'Edit Schedule, the working copy: ⓘ on Tuesday (every issue hidden)', [
    ['it says nothing is flagged — no "N warning" count', !/\d+ (warning|advisor|note)/i.test(r.sev + ' ' + r.under) && /nothing flagged|no issues|✓/i.test(r.sev + ' ' + r.under), r.sev + ' | ' + r.under],
    ['it still lists all four lines', r.lines.length === 4, infoShort(r)], ['all four are painted struck', r.lines.every(l => l.struck), infoShort(r)], ['no button on any line', r.lines.every(l => !l.btn), r.lines.map(l => l.btn)]], [r.shot])

  /* a look at the Original, then at AL1 — each its own hides */
  await B.look(p, TUE, /^Original/)
  r = await B.dayInfo(p, '#eWeek', TUE, `s${S}-2-info-look-original`)
  judge(`${S}.2`, 'Edit Schedule: a 👁 look at the Original, then its ⓘ', [
    ['the counts read 2 warning · 1 advisory · 1 note', /2 warning/i.test(r.sev) && /1 advisory/i.test(r.sev) && /1 note/i.test(r.sev), r.sev], ['four lines, none struck', r.lines.length === 4 && r.lines.every(l => !l.struck), infoShort(r)]], [r.shot])
  await B.backLive(p, TUE)
  await B.look(p, TUE, /^AL1/)
  r = await B.dayInfo(p, '#eWeek', TUE, `s${S}-3-info-look-AL1`)
  judge(`${S}.3`, 'Edit Schedule: a 👁 look at AL1, then its ⓘ', [
    ['the counts read 2 warning · 1 advisory, and no note', /2 warning/i.test(r.sev) && /1 advisory/i.test(r.sev) && !/note/i.test(r.sev), r.sev],
    ['four lines; only the long work day (the fourth) is struck, in its place', r.lines.length === 4 && struckIx(r) === '3' && /Static/.test(r.lines[3].text), infoShort(r)], ['no button', r.lines.every(l => !l.btn), r.lines.map(l => l.btn)]], [r.shot])
  await B.backLive(p, TUE)

  /* the published face (AL1) while the three hides wait */
  let m = await B.member(p, TUE, [], `s${S}-4-member-AL1`)
  r = await B.dayInfo(p, '#vWeek', TUE, `s${S}-4-info-member-AL1`)
  judge(`${S}.4`, 'the member, View-only Sched: Tuesday as issued (AL1) while three hides wait — its bar and its ⓘ', [
    ['the day bar reads 3 issues, only the long day struck', nIssues(m.list) === 3 && m.list.lines.filter(x => x.struck).length === 1 && lineOf(m.list, k.re).struck, short(m.list)],
    ['ⓘ counts 2 warning · 1 advisory, no note', /2 warning/i.test(r.sev) && /1 advisory/i.test(r.sev) && !/note/i.test(r.sev), r.sev],
    ['ⓘ lists four lines, only the fourth struck', r.lines.length === 4 && struckIx(r) === '3', infoShort(r)], ['no button', r.lines.every(l => !l.btn), r.lines.map(l => l.btn)]], [...m.shots, r.shot])

  /* AL2 goes out with every issue hidden */
  await B.admin(p)
  const a2 = await B.pubAL(p, TUE)
  m = await B.member(p, TUE, ['salsa', 'casper', 'wolf'], `s${S}-5-member-AL2`)
  r = await B.dayInfo(p, '#vWeek', TUE, `s${S}-5-info-member-AL2`)
  const anyFlag = ['salsa', 'casper', 'wolf'].flatMap(id => B.flagged(m.pks[id]))
  judge(`${S}.5`, 'the scheduler signs and publishes AL2 (every issue hidden); the member again — the bar, the pucks, the ⓘ', [
    ['AL2 went out', a2.r.pressed && /AL2/.test(m.hd.tag), [a2.r, m.hd.tag]],
    ['the day keeps a quiet "✓ No issues" bar', /No issues/.test(m.list.bar), m.list.bar], ['it opens the list: four lines, all struck, no button', m.list.lines.length === 4 && m.list.lines.every(x => x.struck && !x.btn), short(m.list)],
    ['Saint, Outlaw and Static carry no flag', anyFlag.length === 0, ['salsa', 'casper', 'wolf'].map(id => id + ': ' + B.pk(m.pks[id]))],
    ['ⓘ says nothing is flagged', !/\d+ (warning|advisor|note)/i.test(r.sev + ' ' + r.under) && /nothing flagged|no issues|✓/i.test(r.sev + ' ' + r.under), r.sev + ' | ' + r.under],
    ['ⓘ still lists all four, struck', r.lines.length === 4 && r.lines.every(l => l.struck), infoShort(r)]], [...m.shots, r.shot])

  /* and an older version after it: AL1 still reads its own */
  await B.admin(p)
  await B.look(p, TUE, /^AL1/)
  r = await B.dayInfo(p, '#eWeek', TUE, `s${S}-6-info-look-AL1-after-AL2`)
  await B.openList(p, '#eWeek', TUE)
  const vl = await B.readList(p, '#eWeek', TUE)
  judge(`${S}.6`, 'the scheduler: a 👁 look at AL1 after AL2 is out — its list and its ⓘ', [
    ['the look\'s list: 3 issues, only the long day struck', nIssues(vl) === 3 && vl.lines.filter(x => x.struck).length === 1 && lineOf(vl, k.re).struck, short(vl)],
    ['ⓘ counts 2 warning · 1 advisory; only the fourth line struck', /2 warning/i.test(r.sev) && /1 advisory/i.test(r.sev) && struckIx(r) === '3', r.sev + ' · ' + infoShort(r)]], [r.shot])
} catch (e) { row(`${S}.X`, 'the script stopped', String(e && e.stack || e).slice(0, 600), 'FAIL', [await pic(p, `s${S}-X-error`)]) }
row(`${S}.err`, 'the browser\'s error list through this scenario', errors.length ? errors.join(' | ').slice(0, 800) : 'none', errors.length ? 'FAIL' : 'PASS')
savePart(`s${S}`, { errors })
await browser.close()
