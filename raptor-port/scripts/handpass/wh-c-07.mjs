/* walker C — scenario 7: Sunday's dotted "Breaks Monday" mark follows a PUBLISHED next Monday only after the amendment —
   across a reload and a second scheduler's sign-in — and the same in reverse for a flag-again.
   Setup: Hex made an admin (Admin → Users); Ranger's late Sunday duty (the board); Monday 20 Jul signed and published
   with its Crew rest line showing. */
import * as C from './wh-c-lib.mjs'
const { H } = C, { L, W } = H
const WHO = 'bane', MRE = /Crew rest.*Ranger|Ranger.*Crew rest/i
const { browser, p, errors } = await H.world({ who: 'a' })
const sundayBoth = async tag => {
  await L.go(p, 'editsched'); await C.toWeek(p, C.WK1)
  const e = await C.sundayLook(p, '#eWeek'); const pe = await C.picSunday(p, '#eWeek', `07-${tag}-sunday-edit`)
  await L.go(p, 'viewsched'); const v = await C.sundayLook(p, '#vWeek'); const pv = await C.picSunday(p, '#vWeek', `07-${tag}-sunday-view`)
  await L.go(p, 'editsched')
  return { e, v, pics: [pe, pv] }
}
const marked = (s, label) => [[`${label}Sunday (Edit Schedule): dotted mark + chip + "Breaks Monday" line`, s.e.dot && s.e.cr && s.e.breaks, s.e.cls + ' · breaks ' + s.e.breaks], [`${label}Sunday (View-only Sched): dotted mark + chip`, s.v.dot && s.v.cr, s.v.cls]]
const clean = (s, label) => [[`${label}Sunday (Edit Schedule): no dotted mark, no chip, no "Breaks Monday" line`, !s.e.dot && !s.e.cr && !s.e.breaks, s.e.cls + ' · breaks ' + s.e.breaks], [`${label}Sunday (View-only Sched): no dotted mark, no chip`, !s.v.dot && !s.v.cr, s.v.cls]]
const monday = async () => { await L.go(p, 'editsched'); await C.toWeek(p, C.WK2); await W.showDay(p, 0); return { s: await C.see(p, '#eWeek', 0, MRE, WHO), h: await H.head(p, 0) } }
const publishAmend = async () => { await W.showDay(p, 0); const signs = await W.signDay(p, 0); const h1 = await H.head(p, 0); const pub = await W.publishAL(p, 0); await L.settle(p); return { signs, marker: h1.nys, pub, h: await H.head(p, 0) } }
try {
  await C.makeHexAdmin(p)
  await L.go(p, 'editsched'); await C.toWeek(p, C.WK1)
  const duty = await C.lateSundayDuty(p)
  let m = await monday()
  const IX = m.s.line.ix
  const signs = await W.signDay(p, 0), pub = await W.publishDay(p, 0); await L.settle(p)
  m = await monday()
  const picM0 = await C.picLine(p, '#eWeek', 0, IX, '07-0-monday-published')
  const s0 = await sundayBoth('0')
  H.judge('7.0', 'setup: Ranger\'s late Sunday duty (board); week of 20 Jul: Monday\'s four sign-offs, Publish day, the Crew rest line showing', [['the duty row took', !!duty.row && duty.row.who.includes(WHO), JSON.stringify(duty.row)], ['Monday 20 Jul is published (ORIG)', pub.pressed && /ORIG/.test(m.h.tag), JSON.stringify({ pub, tag: m.h.tag })], ['its Crew rest line is plain, 11 issues', m.s.n === 11 && !m.s.line.struck, m.s.bar], ...marked(s0, '')], [picM0, ...s0.pics])

  /* hide on the published Monday → pending */
  await monday(); await H.tapLine(p, '#eWeek', 0, IX); await L.settle(p)
  m = await monday()
  const picM1 = await C.picLine(p, '#eWeek', 0, IX, '07-1-monday-hide-pending')
  const s1 = await sundayBoth('1')
  H.judge('7.1', '✕ on the published Monday\'s Crew rest line (the hide waits for an amendment); back to 13 Jul, Sunday', [['Monday working copy: struck, ↺, 10 issues', m.s.n === 10 && m.s.line.struck && m.s.line.btn === '↺', m.s.bar], ['one pending, "Publish AL1" offered, sign-offs fallen', /^1 pending/.test(m.h.pending) && /AL1/.test(m.h.alpub) && W.signsEmpty(m.h), JSON.stringify({ chip: m.h.pending, alpub: m.h.alpub, nys: m.h.nys })], ...marked(s1, 'the mark has NOT moved — ')], [picM1, ...s1.pics])

  /* a reload, a second scheduler */
  await H.reloadAs(p, C.HEX)
  const who2 = await p.evaluate(() => (document.querySelector('#roleBadge') || {}).innerText || '')
  const s2 = await sundayBoth('2')
  H.judge('7.2', 'reloaded; signed in as the second scheduler (Hex · Admin); Sunday 19 Jul', [['signed in as Hex · Admin', /HEX/i.test(who2) && /ADMIN/i.test(who2), who2], ...marked(s2, 'still there — ')], s2.pics)

  /* the amendment goes out (by Hex) */
  m = await monday()
  const a1 = await publishAmend()
  m = await monday()
  await L.go(p, 'viewsched'); await C.toWeek(p, C.WK2); const mv = await C.see(p, '#vWeek', 0, MRE, WHO); const picMv = await C.picLine(p, '#vWeek', 0, IX, '07-3-monday-AL1-viewonly'); await L.go(p, 'editsched')
  const s3 = await sundayBoth('3')
  H.judge('7.3', 'Hex: Monday 20 Jul\'s four sign-offs, "Publish AL1"; View-only Sched Monday; then Sunday 19 Jul', [['AL1 went out', a1.pub.pressed && /AL1/.test(m.h.tag) && !m.h.alpub, JSON.stringify({ pub: a1.pub, tag: m.h.tag, alpub: m.h.alpub, marker: a1.marker })], ['the published Monday now shows the line struck, no button, 10 issues', mv.n === 10 && !!mv.line && mv.line.struck && !mv.line.btn, mv.bar], ...clean(s3, 'the mark has gone — ')], [picMv, ...s3.pics])
  await H.reloadAs(p, 'a')
  const s4 = await sundayBoth('4')
  H.judge('7.4', 'reloaded; signed in as Saber; Sunday 19 Jul', clean(s4, 'still gone — '), s4.pics)

  /* the reverse: flag again on the published Monday → pending; then AL2 */
  await monday(); await H.tapLine(p, '#eWeek', 0, IX); await L.settle(p)
  m = await monday()
  const picM5 = await C.picLine(p, '#eWeek', 0, IX, '07-5-monday-flag-again-pending')
  const s5 = await sundayBoth('5')
  H.judge('7.5', '↺ on Monday\'s struck Crew rest line (a flag-again waiting for an amendment); Sunday 19 Jul', [['Monday working copy: plain, ✕, 11 issues', m.s.n === 11 && !m.s.line.struck && m.s.line.btn === '✕', m.s.bar], ['one pending, "Publish AL2" offered', /^1 pending/.test(m.h.pending) && /AL2/.test(m.h.alpub), JSON.stringify({ chip: m.h.pending, alpub: m.h.alpub })], ...clean(s5, 'the mark has NOT come back yet — ')], [picM5, ...s5.pics])
  await H.reloadAs(p, C.HEX)
  const s6 = await sundayBoth('6')
  H.judge('7.6', 'reloaded; signed in as Hex; Sunday 19 Jul', clean(s6, 'still not back — '), s6.pics)
  m = await monday()
  const a2 = await publishAmend()
  m = await monday()
  const s7 = await sundayBoth('7')
  H.judge('7.7', 'Hex: Monday\'s four sign-offs, "Publish AL2"; Sunday 19 Jul', [['AL2 went out', a2.pub.pressed && /AL2/.test(m.h.tag) && !m.h.alpub, JSON.stringify({ pub: a2.pub, tag: m.h.tag })], ...marked(s7, 'the mark is back — ')], s7.pics)
  await H.reloadAs(p, 'a')
  const s8 = await sundayBoth('8')
  H.judge('7.8', 'reloaded; signed in as Saber; Sunday 19 Jul', marked(s8, 'still back — '), s8.pics)
} catch (e) { H.row('7.X', 'the script', String(e && e.stack || e).slice(0, 700), 'FAIL', [await H.pic(p, '07-X-error')]) }
C.done('07', errors)
await browser.close()
