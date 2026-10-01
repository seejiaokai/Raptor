/* WALKER B — Astra's scenarios 37 (hide first, then publish) and 39 (hide, publish, flag again, amend), one world:
   39 starts from where 37 ends. WH_KIND=long (Static's long work day) or rest (Outlaw's crew-rest breach). */
import * as B from './wh-b-lib.mjs'
const { L, W, TUE, MON, judge, row, pic, savePart, nIssues, lineOf, short, pk, flagged } = B
const kind = process.env.WH_KIND || 'long', k = B.K[kind], V = kind === 'long' ? 'a' : 'b'
B.prefix(`s39${V}-`)
const { browser, p, errors } = await B.world()
const monDot = surf => B.dayPucks(p, surf, MON, 'casper')
try {
  /* ---------- 37 ---------- */
  let S = `37${V}`
  await B.toEdit(p)
  const did = await B.hide(p, TUE, k.re)
  let w = await B.work(p, TUE), l = lineOf(w.list, k.re), ps = await B.dayPucks(p, '#eWeek', TUE, k.who)
  let s1 = await pic(p, `s${S}-1-draft-hidden`), s1p = await B.puckPic(p, '#eWeek', TUE, k.who, `s${S}-1-draft-hidden-puck`)
  judge(`${S}.1`, `Tuesday still a draft: ✕ on "${k.cs} …" in its list (Edit Schedule)`, [
    ['the ✕ was pressed', did === 'pressed', did], ['the day reads DRAFT', /DRAFT/.test(w.head.tag), w.head.tag], ['the line is painted struck, with ↺', !!l && l.struck && l.btn === '↺' && l.btnTop === true, short(w.list)],
    ['the bar reads 3 issues', nIssues(w.list) === 3, w.list.bar], [`${k.cs}'s pucks carry no flag`, ps.length > 0 && flagged(ps).length === 0, pk(ps)],
    ['nothing reads pending on a draft day', !/pending/.test(w.head.pending) && !w.head.nys, [w.head.pending, w.head.nys]]], [s1, s1p])

  await B.admin(p)
  w = await B.work(p, TUE); l = lineOf(w.list, k.re)
  let s2 = await pic(p, `s${S}-2-draft-after-reload`)
  judge(`${S}.2`, 'a reload and a fresh sign-in as the scheduler', [['the line is still struck, with ↺', !!l && l.struck && l.btn === '↺', short(w.list)], ['3 issues', nIssues(w.list) === 3, w.list.bar]], [s2])

  const pub = await B.pubOrig(p, TUE)
  const a = await B.auth(p, TUE)
  w = await B.work(p, TUE); l = lineOf(w.list, k.re); ps = await B.dayPucks(p, '#eWeek', TUE, k.who)
  let s3 = await pic(p, `s${S}-3-published-hidden`)
  judge(`${S}.3`, 'the four sign-off selects, then Publish day — the Original goes out with the warning hidden', [
    ['Publish day was pressed', pub.r.pressed, pub.r], ['the day reads ORIG', /ORIG/.test(w.head.tag), w.head.tag],
    ['the chip does not say pending', !/pending/.test(w.head.pending), w.head.pending], ['no marker', !w.head.nys, w.head.nys], ['no Publish AL button', !w.head.alpub && !a.btn, [w.head.alpub, a.btn]],
    ['Amendments names no day with changes', !!a.panel && a.panel.days.length === 0, a.panel && [a.panel.line, a.panel.days]],
    ['the changes window has nothing "To go out"', !a.win || !a.win.out || a.win.out.out.length === 0 || /Nothing is waiting/.test(JSON.stringify(a.win.out)), a.win && a.win.out && [a.win.out.tabs, a.win.out.out.map(o => o.text)]],
    ['the line is still struck with ↺', !!l && l.struck && l.btn === '↺', short(w.list)], ['3 issues', nIssues(w.list) === 3, w.list.bar],
    [`${k.cs}'s pucks carry no flag`, ps.length > 0 && flagged(ps).length === 0, pk(ps)]], [s3])

  let m = await B.member(p, TUE, [k.who], `s${S}-4-member-orig`, kind === 'rest' ? () => monDot('#vWeek') : null)
  l = lineOf(m.list, k.re)
  judge(`${S}.4`, 'a reload, signed in as the member — View-only Sched, Tuesday as issued (the Original)', [
    ['the day shows the Original, as issued', /ORIG/.test(m.hd.tag) && /as issued/.test(m.hd.sel), [m.hd.tag, m.hd.sel]],
    ['the bar reads 3 issues', nIssues(m.list) === 3, m.list.bar], ['the line is painted struck', !!l && l.struck, short(m.list)], ['it has NO button', !!l && !l.btn && m.hd.woff === 0, short(m.list)],
    [`${k.cs}'s puck carries no flag`, m.pks[k.who].length > 0 && flagged(m.pks[k.who]).length === 0, pk(m.pks[k.who])],
    ...(kind === 'rest' ? [['Monday: Outlaw carries no dotted "breaks Tuesday" mark', m.more.length > 0 && !m.more.some(x => x.dot), pk(m.more)]] : [])], m.shots)

  /* ---------- 39 ---------- */
  S = `39${V}`
  await B.admin(p)
  const did2 = await B.again(p, TUE, k.re)
  const a2 = await B.auth(p, TUE)
  w = await B.work(p, TUE); l = lineOf(w.list, k.re); ps = await B.dayPucks(p, '#eWeek', TUE, k.who)
  const it = a2.win && a2.win.out ? a2.win.out.out : []
  let s5 = await pic(p, `s${S}-1-work-flagged-again`), s5p = await B.puckPic(p, '#eWeek', TUE, k.who, `s${S}-1-work-flagged-again-puck`)
  judge(`${S}.1`, `the scheduler again: ↺ on "${k.cs} …" (the Original went out with it hidden) — the working copy`, [
    ['the ↺ was pressed', did2 === 'pressed', did2], ['the line is plain again, with ✕', !!l && !l.struck && l.btn === '✕', short(w.list)], ['the bar reads 4 issues', nIssues(w.list) === 4, w.list.bar],
    [`${k.cs}'s puck is flagged again`, flagged(ps).length > 0, pk(ps)], ['the chip reads 1 pending', /^1\s*pending/.test(w.head.pending), w.head.pending],
    ['the marker reads Not yet signed', w.head.nys === 'Not yet signed', w.head.nys], ['the button reads Publish AL1', w.head.alpub === 'Publish AL1', w.head.alpub],
    ['"To go out" holds ONE line', it.length === 1, it.map(i => i.text)], ['it reads "Warning · … hidden → flagged again"', it.length === 1 && /^Warning · /.test(it[0].where) && /hidden → flagged again/.test(it[0].chg), it.map(i => i.text)]], [s5, s5p, ...(a2.win ? a2.win.shots : [])])

  m = await B.member(p, TUE, [k.who], `s${S}-2-member-pending`, kind === 'rest' ? () => monDot('#vWeek') : null)
  l = lineOf(m.list, k.re)
  judge(`${S}.2`, 'a reload, signed in as the member — the published face while the flag-again waits', [
    ['still the Original, as issued', /ORIG/.test(m.hd.tag), [m.hd.tag, m.hd.sel]], ['the bar still reads 3 issues', nIssues(m.list) === 3, m.list.bar],
    ['the line is still painted struck, no button', !!l && l.struck && !l.btn, short(m.list)], [`${k.cs}'s puck still carries no flag`, m.pks[k.who].length > 0 && flagged(m.pks[k.who]).length === 0, pk(m.pks[k.who])],
    ...(kind === 'rest' ? [['Monday: still no dotted mark for Outlaw', m.more.length > 0 && !m.more.some(x => x.dot), pk(m.more)]] : [])], m.shots)

  await B.admin(p)
  w = await B.work(p, TUE); l = lineOf(w.list, k.re)
  const keep = !!l && !l.struck && /^1\s*pending/.test(w.head.pending)
  const al = await B.pubAL(p, TUE)
  w = await B.work(p, TUE); l = lineOf(w.list, k.re)
  let s7 = await pic(p, `s${S}-3-work-after-AL1`)
  judge(`${S}.3`, 'a reload as the scheduler (the flag-again is kept), the four sign-off selects, Publish AL1', [
    ['after the reload the line was still plain and 1 pending', keep, keep], ['Publish AL1 was pressed', al.r.pressed, al.r], ['the day reads AL1, nothing pending, no marker', /AL1/.test(w.head.tag) && !/pending/.test(w.head.pending) && !w.head.nys, [w.head.tag, w.head.pending, w.head.nys]],
    ['the line is plain with ✕, 4 issues', !!l && !l.struck && l.btn === '✕' && nIssues(w.list) === 4, short(w.list)]], [s7])

  m = await B.member(p, TUE, [k.who], `s${S}-4-member-after-AL1`, kind === 'rest' ? () => monDot('#vWeek') : null)
  l = lineOf(m.list, k.re)
  judge(`${S}.4`, 'a reload, signed in as the member — the published face after AL1', [
    ['the day shows AL1, as issued', /AL1/.test(m.hd.tag), [m.hd.tag, m.hd.sel]], ['the bar reads 4 issues', nIssues(m.list) === 4, m.list.bar],
    ['the line is NOT struck, no button', !!l && !l.struck && !l.btn, short(m.list)], [`${k.cs}'s puck is flagged`, flagged(m.pks[k.who]).length > 0, pk(m.pks[k.who])],
    ...(kind === 'rest' ? [['Monday: Outlaw\'s dotted "breaks Tuesday" mark is drawn again', m.more.some(x => x.dot), pk(m.more)]] : [])], m.shots)
} catch (e) { row(`37-39${V}.X`, 'the script stopped', String(e && e.stack || e).slice(0, 600), 'FAIL', [await pic(p, `s37-39${V}-X-error`)]) }
row(`37-39${V}.err`, 'the browser\'s error list through these two scenarios', errors.length ? errors.join(' | ').slice(0, 800) : 'none', errors.length ? 'FAIL' : 'PASS')
savePart(`s37-39${V}`, { errors })
await browser.close()
