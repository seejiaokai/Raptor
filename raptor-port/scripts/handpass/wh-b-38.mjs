/* WALKER B — Astra's scenario 38: publish first, then hide, then amend. WH_KIND=long (Static's long work day — it
   freezes on a published face) or rest (Outlaw's crew-rest breach — it stays live on a published face). */
import * as B from './wh-b-lib.mjs'
const { L, W, TUE, MON, judge, row, pic, savePart, nIssues, lineOf, short, pk, flagged } = B
const kind = process.env.WH_KIND || 'long', k = B.K[kind], S = kind === 'long' ? '38a' : '38b'
const { browser, p, errors } = await B.world()
const monDot = async surf => (await B.dayPucks(p, surf, MON, 'casper'))
try {
  /* setup — Tuesday published with all four warnings flagged */
  await B.toEdit(p)
  const pub = await B.pubOrig(p, TUE)
  let w = await B.work(p, TUE), l = lineOf(w.list, k.re), ps = await B.dayPucks(p, '#eWeek', TUE, k.who)
  let s0 = await pic(p, `s${S}-0-published-flagged`)
  judge(`${S}.0`, `Edit Schedule: Tuesday's four sign-off selects, then Publish day — ${k.name} still flagged`, [
    ['Publish day was pressed', pub.r.pressed, pub.r], ['the day reads ORIG', /ORIG/.test(w.head.tag), w.head.tag],
    ['the bar reads 4 issues', nIssues(w.list) === 4, w.list.bar], ['its line is plain, with ✕', !!l && !l.struck && l.btn === '✕', short(w.list)],
    [`${k.cs}'s puck is flagged`, flagged(ps).length > 0, pk(ps)]], [s0])

  /* 1 — hide it on the working copy */
  const did = await B.hide(p, TUE, k.re)
  w = await B.work(p, TUE); l = lineOf(w.list, k.re); ps = await B.dayPucks(p, '#eWeek', TUE, k.who)
  const md1 = kind === 'rest' ? await monDot('#eWeek') : null
  let s1 = await pic(p, `s${S}-1-work-hidden`), s1p = await B.puckPic(p, '#eWeek', TUE, k.who, `s${S}-1-work-hidden-puck`)
  judge(`${S}.1`, `✕ on the line "${k.cs} …" in Tuesday's list (Edit Schedule) — the working copy`, [
    ['the ✕ was pressed', did === 'pressed', did], ['the line is painted struck', !!l && l.struck, short(w.list)], ['its button is ↺, the thing a finger lands on', !!l && l.btn === '↺' && l.btnTop === true, l && [l.btn, l.btnTop]],
    ['the bar reads 3 issues', nIssues(w.list) === 3, w.list.bar], ['the bar says nothing of a hidden one', !/hidden/i.test(w.list.bar), w.list.bar],
    [`${k.cs}'s Tuesday pucks carry no flag`, ps.length > 0 && flagged(ps).length === 0, pk(ps)],
    ['the day\'s chip reads 1 pending', /^1\s*pending/.test(w.head.pending), w.head.pending], ['the marker reads Not yet signed', w.head.nys === 'Not yet signed', w.head.nys],
    ['the four sign-offs fell', W.signsEmpty(w.head), w.head.signs], ['the button reads Publish AL1', w.head.alpub === 'Publish AL1', w.head.alpub]], [s1, s1p])
  if (md1) row(`${S}.1m`, 'RECORDED — Edit Schedule, Monday: Outlaw\'s "breaks Tuesday" dotted mark while the hide is pending', pk(md1), 'RECORDED', [s1])

  /* 2 — a reload, signed in again as the scheduler */
  await B.admin(p)
  w = await B.work(p, TUE); l = lineOf(w.list, k.re); ps = await B.dayPucks(p, '#eWeek', TUE, k.who)
  let s2 = await pic(p, `s${S}-2-work-after-reload`)
  judge(`${S}.2`, 'a reload and a fresh sign-in as the scheduler — the working copy again', [
    ['the line is still painted struck, with ↺', !!l && l.struck && l.btn === '↺', short(w.list)], ['3 issues', nIssues(w.list) === 3, w.list.bar],
    [`${k.cs}'s pucks carry no flag`, ps.length > 0 && flagged(ps).length === 0, pk(ps)], ['1 pending', /^1\s*pending/.test(w.head.pending), w.head.pending],
    ['Not yet signed', w.head.nys === 'Not yet signed', w.head.nys], ['four sign-offs empty', W.signsEmpty(w.head), w.head.signs]], [s2])

  /* 3 — the published face: the member, View-only Sched */
  let m = await B.member(p, TUE, [k.who], `s${S}-3-member-pending`, kind === 'rest' ? () => monDot('#vWeek') : null)
  l = lineOf(m.list, k.re)
  judge(`${S}.3`, 'a reload, signed in as the member (Ranger) — View-only Sched, Tuesday as issued, while the hide waits', [
    ['the day shows the Original, as issued', /ORIG/.test(m.hd.tag) && /as issued/.test(m.hd.sel), [m.hd.tag, m.hd.sel]],
    ['the bar still reads 4 issues', nIssues(m.list) === 4, m.list.bar], ['the line is NOT struck', !!l && !l.struck, short(m.list)],
    ['no ✕ / ↺ anywhere in the list', m.list.lines.every(x => !x.btn) && m.hd.woff === 0, short(m.list)],
    [`${k.cs}'s puck still carries its flag`, flagged(m.pks[k.who]).length > 0, pk(m.pks[k.who])],
    ['no pending chip, no marker on the published face', !m.hd.pend && !m.hd.nys, [m.hd.pend, m.hd.nys]],
    ...(kind === 'rest' ? [['Monday: Outlaw\'s dotted "breaks Tuesday" mark is still drawn (Tuesday still flags it)', m.more.some(x => x.dot), pk(m.more)]] : [])], m.shots)

  /* 4 — sign the four over the pending hide, publish AL1 */
  await B.admin(p)
  const sg = await B.sign4(p, TUE)
  let h = await B.head(p, TUE)
  let s4 = await pic(p, `s${S}-4-signed-over-hide`)
  const al = await W.publishAL(p, TUE); await L.sleep(400)
  w = await B.work(p, TUE); l = lineOf(w.list, k.re); ps = await B.dayPucks(p, '#eWeek', TUE, k.who)
  const md4 = kind === 'rest' ? await monDot('#eWeek') : null
  let s4b = await pic(p, `s${S}-4-work-after-AL1`)
  judge(`${S}.4`, 'the scheduler again: the four sign-off selects, then Publish AL1', [
    ['after signing the marker reads Not yet published', h.nys === 'Not yet published', h.nys], ['the four are signed', W.signsFull(h), h.signs],
    ['Publish AL1 was pressed', al.pressed && /AL1/.test(al.label || ''), al], ['the day reads AL1', /AL1/.test(w.head.tag), w.head.tag],
    ['nothing pending', !/pending/.test(w.head.pending), w.head.pending], ['no marker', !w.head.nys, w.head.nys], ['no Publish AL button', !w.head.alpub, w.head.alpub],
    ['the line is still struck with ↺ on the working copy', !!l && l.struck && l.btn === '↺', short(w.list)], ['3 issues', nIssues(w.list) === 3, w.list.bar],
    [`${k.cs}'s pucks carry no flag`, ps.length > 0 && flagged(ps).length === 0, pk(ps)]], [s4, s4b])
  if (md4) row(`${S}.4m`, 'RECORDED — Edit Schedule, Monday: Outlaw\'s dotted mark after AL1 went out with the hide', pk(md4), 'RECORDED', [s4b])

  /* 5 — the published face after AL1 */
  m = await B.member(p, TUE, [k.who], `s${S}-5-member-after-AL1`, kind === 'rest' ? () => monDot('#vWeek') : null)
  l = lineOf(m.list, k.re)
  judge(`${S}.5`, 'a reload, signed in as the member — View-only Sched, Tuesday as issued, after AL1', [
    ['the day shows AL1, as issued', /AL1/.test(m.hd.tag) && /as issued/.test(m.hd.sel), [m.hd.tag, m.hd.sel]],
    ['the bar reads 3 issues', nIssues(m.list) === 3, m.list.bar], ['the line is painted struck', !!l && l.struck, short(m.list)],
    ['the struck line has NO button', !!l && !l.btn && m.hd.woff === 0, short(m.list)],
    [`${k.cs}'s puck carries no flag`, m.pks[k.who].length > 0 && flagged(m.pks[k.who]).length === 0, pk(m.pks[k.who])],
    ...(kind === 'rest' ? [['Monday: Outlaw\'s dotted "breaks Tuesday" mark is gone', m.more.length > 0 && !m.more.some(x => x.dot), pk(m.more)]] : [])], m.shots)
} catch (e) { row(`${S}.X`, 'the script stopped', String(e && e.stack || e).slice(0, 600), 'FAIL', [await pic(p, `s${S}-X-error`)]) }
row(`${S}.err`, 'the browser\'s error list through this scenario', errors.length ? errors.join(' | ').slice(0, 800) : 'none', errors.length ? 'FAIL' : 'PASS')
savePart(`s${S}`, { errors })
await browser.close()
