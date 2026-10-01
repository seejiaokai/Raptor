/* walker C — scenario 5 (desktop only): the next-week preview's red time boxes follow a PUBLISHED next Monday's ISSUED
   hides, not its working copy: they stay while a hide is pending, go only after the amendment, stay gone while a
   flag-again is pending, and return only after that amendment. */
import * as C from './wh-c-lib.mjs'
const { H } = C, { L, W } = H
const RE = /take-off and landing are the same/i
const { browser, p, errors } = await H.world({ who: 'a' })
const both = async tag => {
  await L.go(p, 'editsched'); await C.toWeek(p, C.WK1)
  const e = await C.peekLook(p, '#eWeek'); const pe = await H.pic(p, `05-${tag}-preview-edit`)
  await L.go(p, 'viewsched'); const v = await C.peekLook(p, '#vWeek'); const pv = await H.pic(p, `05-${tag}-preview-view`)
  await L.go(p, 'editsched')
  return { e, v, pics: [pe, pv] }
}
const mon = async () => { await L.go(p, 'editsched'); await C.toWeek(p, C.WK2); await W.showDay(p, 0); return { s: await C.see(p, '#eWeek', 0, RE), red: await C.weekRed(p, '#eWeek', 0), h: await H.head(p, 0) } }
const amend = async () => { await W.showDay(p, 0); const signs = await W.signDay(p, 0); const pub = await W.publishAL(p, 0); await L.settle(p); return { signs, pub } }
const has = (x, n, label) => [[`${label}the preview on Edit Schedule: ${n ? 'both red boxes' : 'no red box'}`, x.e.drawn && x.e.n === n, x.e.n], [`${label}the preview on View-only Sched: ${n ? 'both red boxes' : 'no red box'}`, x.v.drawn && x.v.n === n, x.v.n]]
try {
  if (H.PHONE) { H.row('5', 'the next-week preview', 'not drawn on a phone', 'NOT WALKED (desktop only — the preview is not drawn on a phone)'); throw new Error('phone') }
  await L.go(p, 'editsched'); await C.toWeek(p, C.WK2); await W.showDay(p, 0)
  await W.weekText(p, 'ff:0.0.1.ld', '0840'); await L.settle(p)
  let m = await mon()
  const IX = m.s.line.ix
  await W.showDay(p, 0); const signs = await W.signDay(p, 0); const pub = await W.publishDay(p, 0); await L.settle(p)
  m = await mon()
  const p0 = await both('0')
  H.judge('5.0', 'setup: Monday 20 Jul — RU BFM landing typed = take-off; the four sign-offs; Publish day (the nought-minute line showing); the week of 13 Jul\'s preview', [['Monday is published (ORIG) with the line plain and two red boxes', pub.pressed && /ORIG/.test(m.h.tag) && !m.s.line.struck && m.red === 2, JSON.stringify({ pub, tag: m.h.tag, red: m.red })], ...has(p0, 2, '')], p0.pics)

  await mon(); await H.tapLine(p, '#eWeek', 0, IX); await L.settle(p)
  m = await mon()
  const picM1 = await C.picLine(p, '#eWeek', 0, IX, '05-1-monday-hide-pending')
  const p1 = await both('1')
  H.judge('5.1', '✕ on the published Monday\'s nought-minute line (waits for an amendment); the preview', [['Monday working copy: struck, its own red boxes gone, 1 pending, "Publish AL1"', m.s.line.struck && m.red === 0 && /^1 pending/.test(m.h.pending) && /AL1/.test(m.h.alpub), JSON.stringify({ red: m.red, chip: m.h.pending, alpub: m.h.alpub })], ...has(p1, 2, 'KEPT while the hide is pending — ')], [picM1, ...p1.pics])
  await H.reloadAs(p, 'a')
  const p1r = await both('1r')
  H.judge('5.2', 'reloaded; the preview', has(p1r, 2, 'still kept — '), p1r.pics)

  m = await mon(); const a1 = await amend(); m = await mon()
  const p2 = await both('2')
  H.judge('5.3', 'Monday\'s four sign-offs, "Publish AL1"; the preview', [['AL1 went out', a1.pub.pressed && /AL1/.test(m.h.tag) && !m.h.alpub, JSON.stringify({ pub: a1.pub, tag: m.h.tag })], ...has(p2, 0, 'gone after the amendment — ')], p2.pics)

  await mon(); await H.tapLine(p, '#eWeek', 0, IX); await L.settle(p)                 // ↺ pending
  m = await mon()
  const p3 = await both('3')
  H.judge('5.4', '↺ on Monday\'s struck line (a flag-again waiting for an amendment); the preview', [['Monday working copy: plain, its own two boxes red, 1 pending, "Publish AL2"', !m.s.line.struck && m.red === 2 && /^1 pending/.test(m.h.pending) && /AL2/.test(m.h.alpub), JSON.stringify({ red: m.red, chip: m.h.pending, alpub: m.h.alpub })], ...has(p3, 0, 'still gone while the flag-again is pending — ')], p3.pics)
  await H.reloadAs(p, 'a')
  const p3r = await both('3r')
  H.judge('5.5', 'reloaded; the preview', has(p3r, 0, 'still gone — '), p3r.pics)

  m = await mon(); const a2 = await amend(); m = await mon()
  const p4 = await both('4')
  H.judge('5.6', 'Monday\'s four sign-offs, "Publish AL2"; the preview', [['AL2 went out', a2.pub.pressed && /AL2/.test(m.h.tag) && !m.h.alpub, JSON.stringify({ pub: a2.pub, tag: m.h.tag })], ...has(p4, 2, 'back after that amendment — ')], p4.pics)
} catch (e) { if (String(e.message) !== 'phone') H.row('5.X', 'the script', String(e && e.stack || e).slice(0, 700), 'FAIL', [await H.pic(p, '05-X-error')]) }
C.done('05', errors)
await browser.close()
