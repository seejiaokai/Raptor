/* WALKER B — Astra's scenario 41: Unpublish puts the prior issued face back and keeps the working hides (D101).
   Original flagged, AL1 hidden; Unpublish AL1. Then (a second world) the Original itself unpublished. */
import * as B from './wh-b-lib.mjs'
const { L, W, TUE, judge, row, pic, savePart, nIssues, lineOf, short, pk, flagged, K } = B
const S = '41', k = K.long
B.prefix('s41-')
let { browser, p, errors } = await B.world()
try {
  await B.toEdit(p)
  await B.pubOrig(p, TUE)
  await B.hide(p, TUE, k.re)
  const al = await B.pubAL(p, TUE)
  let w = await B.work(p, TUE), l = lineOf(w.list, k.re)
  let s0 = await pic(p, `s${S}-0-AL1-hidden`)
  judge(`${S}.0`, 'setup: Tuesday published flagged (Original); ✕ on Static\'s long work day; the four sign-offs; Publish AL1', [
    ['AL1 went out', al.r.pressed && /AL1/.test(w.head.tag), [al.r, w.head.tag]], ['the line is struck, 3 issues, nothing pending', !!l && l.struck && nIssues(w.list) === 3 && !/pending/.test(w.head.pending), [short(w.list), w.head.pending]],
    ['the Unpublish button is offered', /Unpublish/.test(w.head.unpub), w.head.unpub]], [s0])

  await W.showDay(p, TUE)
  const un = await W.unpublish(p, TUE); await L.sleep(500)
  const a = await B.auth(p, TUE)
  w = await B.work(p, TUE); l = lineOf(w.list, k.re)
  let ps = await B.dayPucks(p, '#eWeek', TUE, k.who)
  let s1 = await pic(p, `s${S}-1-after-unpublish`)
  const it = a.win && a.win.out ? a.win.out.out : []
  judge(`${S}.1`, 'Unpublish on Tuesday\'s head (its confirm pressed) — the working copy', [
    ['Unpublish was pressed', un.pressed, un], ['the day is back at the Original', /ORIG/.test(w.head.tag), w.head.tag],
    ['the working copy keeps the hide: the line struck with ↺, 3 issues', !!l && l.struck && l.btn === '↺' && nIssues(w.list) === 3, short(w.list)],
    ['Static\'s pucks carry no flag on the working copy', ps.length > 0 && flagged(ps).length === 0, pk(ps)],
    ['it reads 1 pending', /^1\s*pending/.test(w.head.pending), w.head.pending], ['the button reads Publish AL1 — never "Reissue"', w.head.alpub === 'Publish AL1' && !/reissue/i.test(JSON.stringify(a)), w.head.alpub],
    ['"To go out · AL1" holds ONE line, "Warning · … flagged → hidden"', it.length === 1 && /^Warning · /.test(it[0].where) && /flagged → hidden/.test(it[0].chg), it.map(i => i.text)],
    ['Amendments: Tue · 1 change', !!a.panel && a.panel.days.length === 1 && /^Tue · 1 change$/.test(a.panel.days[0].text), a.panel && a.panel.days]], [s1, ...(a.win ? a.win.shots : [])])

  let m = await B.member(p, TUE, [k.who], `s${S}-2-member-after-unpublish`)
  l = lineOf(m.list, k.re)
  judge(`${S}.2`, 'a reload, signed in as the member — the published face after the Unpublish', [
    ['the day shows the Original, as issued', /ORIG/.test(m.hd.tag) && /Original/.test(m.hd.sel), [m.hd.tag, m.hd.sel]], ['the bar reads 4 issues', nIssues(m.list) === 4, m.list.bar],
    ['the line is NOT struck, no button', !!l && !l.struck && !l.btn, short(m.list)], ['Static\'s puck is flagged', flagged(m.pks[k.who]).length > 0, pk(m.pks[k.who])]], m.shots)

  await B.admin(p)
  w = await B.work(p, TUE); l = lineOf(w.list, k.re)
  let s3 = await pic(p, `s${S}-3-scheduler-after-reload`)
  const al2 = await B.pubAL(p, TUE)
  const w2 = await B.work(p, TUE)
  let s3b = await pic(p, `s${S}-3-AL1-again`)
  judge(`${S}.3`, 'a reload, signed in as the scheduler; then the four sign-offs and Publish AL1 again', [
    ['after the reload: the line struck, 1 pending, Publish AL1', !!l && l.struck && /^1\s*pending/.test(w.head.pending) && w.head.alpub === 'Publish AL1', [short(w.list), w.head.pending, w.head.alpub]],
    ['Publish AL1 was pressed and the day reads AL1, nothing pending', al2.r.pressed && /AL1/.test(w2.head.tag) && !/pending/.test(w2.head.pending), [al2.r, w2.head.tag, w2.head.pending]]], [s3, s3b])
  m = await B.member(p, TUE, [k.who], `s${S}-4-member-AL1-again`)
  l = lineOf(m.list, k.re)
  judge(`${S}.4`, 'the member again — AL1 is back out with the hide', [['AL1, 3 issues, the line struck with no button', /AL1/.test(m.hd.tag) && nIssues(m.list) === 3 && !!l && l.struck && !l.btn, [m.hd.tag, short(m.list)]],
    ['Static\'s puck carries no flag', m.pks[k.who].length > 0 && flagged(m.pks[k.who]).length === 0, pk(m.pks[k.who])]], m.shots)
} catch (e) { row(`${S}.X`, 'the script stopped', String(e && e.stack || e).slice(0, 600), 'FAIL', [await pic(p, `s${S}-X-error`)]) }
const errs1 = errors.slice()
await browser.close()

/* the Original itself unpublished: the day is a draft again, its hide kept, and View-only Sched follows the working copy */
;({ browser, p, errors } = await B.world())
try {
  await B.toEdit(p)
  await B.hide(p, TUE, k.re)
  await B.pubOrig(p, TUE)
  await W.showDay(p, TUE)
  const un = await W.unpublish(p, TUE); await L.sleep(500)
  const w = await B.work(p, TUE), l = lineOf(w.list, k.re)
  const s5 = await pic(p, `s${S}-5-orig-unpublished`)
  judge(`${S}.5`, 'a second world: ✕ on the long work day, Tuesday published (Original, hidden), then Unpublish', [
    ['Unpublish was pressed', un.pressed, un], ['the day reads DRAFT', /DRAFT/.test(w.head.tag), w.head.tag], ['the line is still struck with ↺, 3 issues', !!l && l.struck && l.btn === '↺' && nIssues(w.list) === 3, short(w.list)],
    ['nothing reads pending', !/pending/.test(w.head.pending) && !w.head.nys, [w.head.pending, w.head.nys]]], [s5])
  const m = await B.member(p, TUE, [k.who], `s${S}-6-member-orig-unpublished`)
  const lm = lineOf(m.list, k.re)
  judge(`${S}.6`, 'the member — Tuesday is a draft again; View-only Sched follows the working copy\'s hides', [
    ['the day reads DRAFT', /DRAFT/.test(m.hd.tag), m.hd.tag], ['3 issues, the line struck with no button', nIssues(m.list) === 3 && !!lm && lm.struck && !lm.btn, short(m.list)],
    ['Static\'s puck carries no flag', m.pks[k.who].length > 0 && flagged(m.pks[k.who]).length === 0, pk(m.pks[k.who])]], m.shots)
} catch (e) { row(`${S}.X2`, 'the script stopped', String(e && e.stack || e).slice(0, 600), 'FAIL', [await pic(p, `s${S}-X2-error`)]) }
const all = [...errs1, ...errors]
row(`${S}.err`, 'the browser\'s error list through this scenario', all.length ? all.join(' | ').slice(0, 800) : 'none', all.length ? 'FAIL' : 'PASS')
savePart(`s${S}`, { errors: all })
await browser.close()
