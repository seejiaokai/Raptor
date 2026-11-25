// Walker w6 — D2338: his SANS-days bell line, its life and its tap (Astra's A5 A6 A7 A8 A9 A11 A12 A14 A15 A19 A21 A22
// A23, and which copy drives the line), 23 Nov 26, chat 147. Brief: docs/superpowers/briefs/2026-11-23-d2338-walk-brief.md.
// Run from raptor-port/ (the build served on 4396):
//   W6_RUN=run1 ONLY=build-d,a5-d,... node scripts/handpass/sud-w6.mjs
import './sud-w6-env.mjs'
import * as L from './sud-w6-lib.mjs'
import path from 'node:path'
import { existsSync } from 'node:fs'
const { sleep, J, HEX } = L
const VERSION = 'sud-w6 v1'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
console.log(VERSION, L.URL_, L.OUT, ONLY.join(','))
const D15 = '2026-07-15T09:00:00', D16 = '2026-07-16T09:00:00', D17 = '2026-07-17T09:00:00'
const SAT = 5, FRI = 4
const LINE_ID = 'sansdue:rocky:2026-07-17'
const stateOf = sz => path.join(L.STATE_DIR, `state-${sz.name}.json`)

async function run(name, szKey, fn, o = {}) {
  const sz = L.SIZES[szKey], W = L.mk(name, sz)
  const sf = o.fresh ? null : stateOf(sz)
  if (sf && !existsSync(sf)) { W.rec('NW', 'the saved base world is missing', 'NW', sf); return }
  const { b, ctx, p } = await L.world2(sz, W, o.when || D15, sf)
  try {
    await L.as(p, W, 'ad', 'a')
    W.rec('today', "the app's today (page clock)", null, await L.today(p))
    if (sf) {
      /* a reopened saved world: one fact the fixture made, asserted before any step (walk-scripts §3) */
      const f = await p.evaluate(() => ({ fri: JSON.stringify(window.DAYS[4].ground || []).includes('rocky'), sat: (window.DAYS[5].ground || []).filter(r => JSON.stringify(r).includes('rocky')).length }))
      W.rec('world', 'the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read)', f.fri && f.sat === 2, J(f))
      if (!(f.fri && f.sat === 2)) return
    }
    await fn(p, W, ctx, b)
  } catch (e) {
    W.rec('ERR', 'script stopped', false, String(e && e.message || e).slice(0, 400), await W.pic(p, 'ERR').catch(() => ''))
  }
  W.rec('errors', 'console / page errors / failed requests', W.errs.length === 0, W.errs.slice(0, 8).join(' || '))
  await b.close()
}

/* to the day the posting runs, signed in as Hex */
async function hexOn17(p, W) {
  await L.as(p, W, 'hex')
  const t = await L.moveTo(p, W, D17, 'hex')
  const wk = await p.evaluate(() => window.CURWEEK)
  W.rec('clock', 'clock moved to Fri 17 Jul 09:00 (setSystemTime) and the page reloaded, Hex signed in', /Fri Jul 17 2026/.test(t), `${t} · week loaded ${wk} · Hex ${J(await L.hexRec(p))}`)
}
async function bell(p, W, tag) {
  const b = await L.bellOpen(p, W, tag)
  return b
}
const words = b => `lit ${b.lit} · ${b.lines.length} lines · SANS: ${b.sans.map(L.sansWords).join(' || ') || 'none'}`
async function readIt(p, W, tag) {
  const b = await bell(p, W, tag + '-pre')
  const l = L.active(b)[0]
  if (!l) return { ok: false, b }
  const t = await L.bellTap(p, W, l.id, tag)
  await L.sansClose(p, W)
  await L.go(p, 'viewsched')
  const b2 = await bell(p, W, tag + '-after')
  await L.bellClose(p, W)
  return { ok: L.active(b2)[0] && !L.active(b2)[0].unread, b, t, b2 }
}

/* ---------- build: the base world, through the app's controls, saved ---------- */
async function build(p, W, ctx) {
  const r = await L.build(p, W)
  if (r.ok) {
    await ctx.storageState({ path: stateOf(W.sz) })
    W.rec('saved', 'the base world saved (the browser storage of this size, for the scenarios to reopen)', true, stateOf(W.sz) + ' · ' + J(r.facts.po))
  }
}

/* ---------- A5: one line, the right days ---------- */
async function a5(p, W) {
  await L.as(p, W, 'hex')
  let b = await bell(p, W, 'a5-15')
  W.rec('A5-15', 'Wed 15 Jul, Hex signed in: his bell has no SANS-days line', L.active(b).length === 0 && L.struck(b).length === 0, words(b), b.pic)
  await L.bellClose(p, W)
  let t = await L.moveTo(p, W, D16, 'hex')
  b = await bell(p, W, 'a5-16')
  W.rec('A5-16', `Thu 16 Jul (setSystemTime + reload; ${t}): still no SANS-days line (he flies wave 2 that day, before the posting)`, L.active(b).length === 0, words(b), b.pic)
  await L.bellClose(p, W)
  t = await L.moveTo(p, W, D17, 'hex')
  const wk = await p.evaluate(() => window.CURWEEK)
  b = await bell(p, W, 'a5-17')
  const a = L.active(b)
  const l = a[0]
  const ok = a.length === 1 && l.name === 'Your SANS availability' && /^B\/(700|bold|600|800)/.test(l.nameBold) && l.day === 'Fri 17, Sat 18, Mon 20 Jul' && l.what === 'Planned, no availability filed · 2 more days' && l.unread
  W.rec('A5-17', `Fri 17 Jul (${t}), week loaded ${wk}: ONE active line — "Your SANS availability" bold, "Fri 17, Sat 18, Mon 20 Jul", "Planned, no availability filed · 2 more days" (his days 17, 18, 20, 21, 22: the two Sat rows once, Thu 16 absent, the week of 20 Jul not open), unread`, ok, words(b) + ` · name drawn ${l && l.nameBold} · line id ${l && l.id}`, b.pic)
  W.rec('A5-lit', 'the bell lit for it', b.lit === true, String(b.lit))
  await L.bellClose(p, W)
}

/* ---------- A6: filing takes days out; by Hex, by Saber for Hex ---------- */
async function a6(p, W) {
  await hexOn17(p, W)
  const r = await readIt(p, W, 'a6-01')
  W.rec('A6-01', 'Hex taps his line (read): the SANS tab opens; the line then reads as read', !!r.ok, `before ${r.b && words(r.b)} · tap opened ${J(r.t && { page: r.t.page, month: r.t.month, win: r.t.win && r.t.win.head })} · after ${r.b2 && words(r.b2)}`, [r.b && r.b.pic, r.t && r.t.pic, r.b2 && r.b2.pic].filter(Boolean).join(', '))
  await L.openSans(p, W)
  const f18 = await L.sansFile(p, W, '2026-07-18', 'Hex')
  W.rec('A6-02', 'Hex files Sat 18 Jul: SANS tab → 18 → + Commitment, OFT, Add (read back: a new input of his)', f18.ok, `person box ${f18.person} · all day ${f18.allday} · made ${J(f18.made)} ${f18.err || ''}`, f18.formPic)
  await L.sansClose(p, W)
  let b = await bell(p, W, 'a6-02')
  let l = L.active(b)[0]
  W.rec('A6-03', 'his line now names 17, 20, 21 (22 counted): "Fri 17, Mon 20, Tue 21 Jul" · "Planned, no availability filed · 1 more day"; never struck', !!l && L.active(b).length === 1 && l.day === 'Fri 17, Mon 20, Tue 21 Jul' && l.what === 'Planned, no availability filed · 1 more day' && L.struck(b).length === 0, words(b), b.pic)
  W.rec('A6-03r', 'whether a read line lights again when a day is filed (RECORD; as built: stays read)', 'REC', l ? (l.unread ? 'UNREAD again' : 'stays read') + ` · bell lit ${b.lit}` : 'no line')
  await L.bellClose(p, W)
  await L.as(p, W, 'ad', 'a')
  await L.openSans(p, W)
  const f17 = await L.sansFile(p, W, '2026-07-17', 'Hex')
  W.rec('A6-04', 'Saber files Fri 17 Jul FOR Hex (SANS tab → 17 → + Commitment, Person Hex, OFT, Add; read back)', f17.ok, `person box ${f17.person} · made ${J(f17.made)} ${f17.err || ''}`, f17.formPic)
  await L.sansClose(p, W)
  await L.as(p, W, 'hex')
  b = await bell(p, W, 'a6-04')
  l = L.active(b)[0]
  W.rec('A6-05', 'Hex\'s line now "Mon 20, Tue 21, Wed 22 Jul" · "Planned, no availability filed"', !!l && L.active(b).length === 1 && l.day === 'Mon 20, Tue 21, Wed 22 Jul' && l.what === 'Planned, no availability filed' && L.struck(b).length === 0, words(b), b.pic)
  W.rec('A6-05r', 'read state after Saber filed for him (RECORD)', 'REC', l ? (l.unread ? 'UNREAD again' : 'stays read') + ` · bell lit ${b.lit}` : 'no line')
  await L.bellClose(p, W)
  await L.openSans(p, W)
  const more = []
  for (const iso of ['2026-07-20', '2026-07-21', '2026-07-22']) { const f = await L.sansFile(p, W, iso, 'Hex'); more.push(iso.slice(8) + ':' + (f.ok ? 'filed' : 'NOT ' + (f.why || f.err || J(f.made)))) }
  await L.sansClose(p, W)
  W.rec('A6-06', 'Hex files Mon 20, Tue 21, Wed 22 Jul (read back)', more.every(s => /filed$/.test(s)), more.join(' · '))
  b = await bell(p, W, 'a6-06')
  W.rec('A6-07', 'every day filed: no SANS-days line left — gone, never struck', b.sans.length === 0, words(b), b.pic)
  await L.bellClose(p, W)
}

/* ---------- A7: taking him off an item takes that day out ---------- */
async function delRow(p, W, di, name) {
  await L.openBoard(p, W, di)
  const ri = await p.evaluate(([di, name, id]) => (window.DAYS[di].ground || []).findIndex(r => r.prog === name && JSON.stringify(r).includes(id)), [di, name, HEX])
  if (ri < 0) return { ok: false, why: 'no such row' }
  await W.press(p, L.B(`[data-grdel="${di}.${ri}"]`), 'grdel')
  await sleep(500)
  const left = await p.evaluate(([di, id]) => (window.DAYS[di].ground || []).filter(r => JSON.stringify(r).includes(id)).map(r => r.prog), [di, HEX])
  const pic = await W.pic(p, `a7-del-${di}-${name}`)
  await L.closeBoard(p, W)
  return { ok: !left.includes(name) || left.filter(x => x === name).length === 0, left, pic }
}
async function a7(p, W) {
  await hexOn17(p, W)
  const r = await readIt(p, W, 'a7-01')
  W.rec('A7-01', 'Hex reads his line first (taps it)', !!r.ok, r.b2 ? words(r.b2) : 'no line', r.b2 && r.b2.pic)
  await L.as(p, W, 'ad', 'a')
  await L.gotoWeek(p, W, '2026-07-20')
  const d1 = await delRow(p, W, 1, 'BRIEF')
  W.rec('A7-02', 'Saber: Tue 21 Jul (next week) — the BRIEF, Hex\'s only item that day, removed by its ✕', d1.ok, `Hex left on Tue: ${J(d1.left)}`, d1.pic)
  await L.gotoWeek(p, W, '2026-07-13')
  await L.as(p, W, 'hex')
  let b = await bell(p, W, 'a7-02')
  let l = L.active(b)[0]
  W.rec('A7-03', 'Hex\'s line: 21 gone — "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 1 more day" (22); never struck', !!l && l.day === 'Fri 17, Sat 18, Mon 20 Jul' && l.what === 'Planned, no availability filed · 1 more day' && L.struck(b).length === 0, words(b), b.pic)
  W.rec('A7-03r', 'read state after a day left (RECORD)', 'REC', l ? (l.unread ? 'UNREAD again' : 'stays read') : 'no line')
  await L.bellClose(p, W)
  await L.as(p, W, 'ad', 'a')
  const d2 = await delRow(p, W, SAT, 'TALK')
  W.rec('A7-04', 'Saber: Sat 18 — the TALK removed (his BRIEF that day stays)', d2.ok, `Hex left on Sat: ${J(d2.left)}`, d2.pic)
  await L.as(p, W, 'hex')
  b = await bell(p, W, 'a7-04'); l = L.active(b)[0]
  W.rec('A7-05', 'Hex\'s line: Sat 18 still named — "Fri 17, Sat 18, Mon 20 Jul"', !!l && l.day === 'Fri 17, Sat 18, Mon 20 Jul' && L.struck(b).length === 0, words(b), b.pic)
  await L.bellClose(p, W)
  await L.as(p, W, 'ad', 'a')
  const d3 = await delRow(p, W, SAT, 'BRIEF')
  W.rec('A7-06', 'Saber: Sat 18 — the BRIEF removed too (nothing of Hex left that day)', d3.ok, `Hex left on Sat: ${J(d3.left)}`, d3.pic)
  await L.as(p, W, 'hex')
  b = await bell(p, W, 'a7-06'); l = L.active(b)[0]
  W.rec('A7-07', 'Hex\'s line: 18 gone — "Fri 17, Mon 20, Wed 22 Jul" · "Planned, no availability filed"', !!l && l.day === 'Fri 17, Mon 20, Wed 22 Jul' && l.what === 'Planned, no availability filed' && L.struck(b).length === 0, words(b), b.pic)
  W.rec('A7-07r', 'read state now (RECORD)', 'REC', l ? (l.unread ? 'UNREAD again' : 'stays read') : 'no line')
  await L.bellClose(p, W)
}

/* ---------- A8: only Hex's bell ---------- */
async function a8(p, W) {
  await hexOn17(p, W)
  const users = [['hex', 'x', 'Hex'], ['us', 'us', 'Ranger'], ['ad', 'a', 'Saber'], ['ad2', 'a2', 'Hunter'], ['ad9', 'a9', 'Kestrel'], ['us9', 'us9', 'Osprey']]
  for (const [u, pw, nm] of users) {
    if (u !== 'hex') await L.as(p, W, u, pw)
    const b = await bell(p, W, 'a8-' + u)
    const all = b.lines.map(x => `${x.name} · ${x.day} · ${x.struck ? '~' + x.struck + '~ ' : ''}${x.what}`).join(' || ')
    if (u === 'hex') W.rec('A8-hex', 'Hex: one SANS-days line', L.active(b).length === 1, words(b), b.pic)
    else W.rec('A8-' + u, `${nm}: no SANS-days line about Hex (other lines RECORDED)`, b.sans.length === 0 && !b.lines.some(x => /no availability filed/.test(x.what + x.struck)), `lit ${b.lit} · ${b.lines.length} lines: ${all.slice(0, 600)}`, b.pic)
    await L.bellClose(p, W)
  }
}

/* ---------- A9: the tap reaches a usable SANS calendar ---------- */
async function a9(p, W) {
  await hexOn17(p, W)
  await L.openSans(p, W)
  const m = await L.sansGoto(p, W, '2026-09-01')
  await L.go(p, 'viewsched')
  W.rec('A9-01', 'Hex left the SANS tab on another month, then went to View', /sep/i.test(m), `SANS month left on "${m}" · page ${await p.evaluate(() => window.CURPAGE)}`, await W.pic(p, 'a9-01-view'))
  const b = await bell(p, W, 'a9-02')
  const l = L.active(b)[0]
  if (!l) { W.rec('A9-02', 'his line to tap', 'NW', words(b), b.pic); return }
  const t = await L.bellTap(p, W, l.id, 'a9-03')
  const ok = t.page === 'inputs' && t.sansTab && t.cal && /jul/i.test(t.month) && /2026/.test(t.month) && t.win && /17/.test(t.win.head) && t.win.inScreen && t.win.topIsWin && !t.bellOpen
  W.rec('A9-03', 'the tap: Inputs → SANS tab at July 2026, Fri 17 Jul\'s window open, on screen and on top, the bell closed', ok, J({ page: t.page, tab: t.sansTab, cal: t.cal, month: t.month, win: t.win, bellOpen: t.bellOpen }), t.pic)
  const f = await L.sansFileOpen(p, W, '2026-07-17', 'Hex')
  W.rec('A9-04', 'in that window, + Commitment → OFT → Add: his availability for Fri 17 Jul is made (read back)', f.ok, `${f.why || ''} person ${f.person} · made ${J(f.made)} ${f.err || ''}`, f.formPic + ', ' + await W.pic(p, 'a9-04-filed'))
  await L.sansClose(p, W)
  const b2 = await bell(p, W, 'a9-05')
  const l2 = L.active(b2)[0]
  W.rec('A9-05', 'the line then starts at Sat 18: "Sat 18, Mon 20, Tue 21 Jul"', !!l2 && l2.day === 'Sat 18, Mon 20, Tue 21 Jul', words(b2), b2.pic)
  await L.bellClose(p, W)
}

/* ---------- A11: the posting moved later or undone after the line appeared, unread or read ---------- */
async function a11(p, W, how, read) {
  await hexOn17(p, W)
  const b0 = await bell(p, W, 'a11-01')
  W.rec('A11-01', 'Fri 17: his line is there', L.active(b0).length === 1, words(b0), b0.pic)
  await L.bellClose(p, W)
  if (read) {
    const r = await readIt(p, W, 'a11-02')
    W.rec('A11-02', 'Hex reads it (taps the line)', !!r.ok, r.b2 ? words(r.b2) : 'no line', r.b2 && r.b2.pic)
  }
  await L.as(p, W, 'ad', 'a')
  const s = await L.postSheet(p, W, '2026-07-17', 'a11-03')
  let act = ''
  if (how === 'move') {
    await W.press(p, '[data-testid="postout-date"]:visible', 'po-date')
    const d = p.locator('[data-iso="2026-07-20"]:visible').first()
    if (await d.count()) await W.press(p, d, 'po-date-20')
    await sleep(600)
    act = 'PO from moved to Mon 20 Jul'
  } else { await W.press(p, '[data-testid="postout-undo"]:visible', 'po-undo'); await sleep(800); act = 'Undo post out (PO)' }
  const line2 = (await p.locator('[data-testid="postout-line"]:visible').first().textContent().catch(() => '')) || ''
  const err = (await p.locator('[data-testid="postout-err"]:visible').first().textContent().catch(() => '')) || ''
  const rec = await L.hexRec(p)
  const pic = await W.pic(p, 'a11-04-' + how)
  await L.sheetClose(p, W)
  const okAct = how === 'move' ? rec.san === false : rec.san === false
  W.rec('A11-03', `Saber: Hex's posting sheet (${s.kind}) → ${act} (read back: he is not SANS today)`, okAct, `sheet line before "${s.line}" · after "${line2.trim()}" ${err ? '· said "' + err + '"' : ''} · record ${J(rec)}`, s.pic + ', ' + pic)
  await L.as(p, W, 'hex')
  const b = await bell(p, W, 'a11-05')
  if (!read) W.rec('A11-04', `unread line, posting ${how === 'move' ? 'moved later' : 'undone'}: the line simply goes (nothing struck, nothing active)`, b.sans.length === 0, words(b), b.pic)
  else {
    const st = L.struck(b), ac = L.active(b)
    W.rec('A11-04', `read line, posting ${how === 'move' ? 'moved later' : 'undone'}: struck "Planned, no availability filed", then "taken back · Saber", unread; no active line`, st.length === 1 && ac.length === 0 && /Planned, no availability filed/.test(st[0].struck) && /taken back · Saber/.test(st[0].what) && st[0].unread, words(b), b.pic)
  }
  await L.bellClose(p, W)
  await L.reload(p, 'hex')
  const b2 = await bell(p, W, 'a11-06')
  W.rec('A11-05', 'after a reload: the same', J(b2.sans.map(L.sansWords)) === J(b.sans.map(L.sansWords)), words(b2), b2.pic)
  await L.bellClose(p, W)
}

/* ---------- A12: midnight with the page open ---------- */
const crewNote = (p, id = HEX) => p.evaluate(id => {
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
  const body = document.querySelector('.ros-body'); if (!body) return { day: 'no panel' }
  const day = ((body.querySelector('.er-dayname') || {}).textContent || '').trim()
  const e = [...body.querySelectorAll(`.puck[data-person="${id}"]`)][0]
  if (!e) return { day, puck: 'none' }
  const rp = e.closest('.rpuck, .rsans-row')
  return { day, shown: vis(e), where: e.closest('.rsans') ? 'SANS Avail' : 'crew', title: e.getAttribute('title') || '', rpTitle: rp ? rp.getAttribute('title') || '' : '', why: rp ? (rp.getAttribute('data-why') || '') : '', rwhy: rp ? ((rp.querySelector('.rwhy') || {}).textContent || '') : '' }
}, id)
const noteOf = n => [n.title, n.rpTitle, n.why, n.rwhy].filter(Boolean).join(' | ')
const LOOK = 'SANS from Fri 17 Jul: no availability filed. It can be filed from that day on the Inputs page\'s SANS tab.'
async function crewTo(p, W, dow) {
  if (W.isPhone) {
    const shown = await p.evaluate(() => { const b = document.querySelector('.ros-body'); if (!b) return false; const r = b.getBoundingClientRect(); return r.width > 40 && r.left < window.innerWidth - 40 })
    if (!shown) await W.press(p, '#rosTab', 'crew-tab')
  }
  for (let i = 0; i < 8; i++) {
    const cur = ((await p.locator('.ros-body .er-dayname').first().textContent().catch(() => '')) || '').trim().toLowerCase()
    if (cur.startsWith(dow)) return cur
    const order = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
    const dir = order.indexOf(dow) > order.indexOf(cur.slice(0, 3)) ? 1 : -1
    await W.press(p, `.ros-body [data-crewstep="${dir}"]`, 'crewstep'); await sleep(300)
  }
  return 'not reached'
}
async function a12s(p, W) {
  const t = await L.moveTo(p, W, '2026-07-16T23:59:50', 'ad', 'a')
  await L.go(p, 'editsched')
  const day = await crewTo(p, W, 'sat')
  const n0 = await crewNote(p)
  W.rec('A12s-01', `Thu 16 Jul 23:59:50 (${t}), Saber on Edit Schedule, the crew list on Sat 18 (${day}): Hex's note is the look-ahead words`, noteOf(n0).includes(LOOK), J(n0), await W.pic(p, 'a12s-01'))
  await p.clock.fastForward(12000)
  await sleep(1500)
  let t2 = await L.today(p), n1 = await crewNote(p)
  W.rec('A12s-02', `clock fast-forwarded 12 s, no reload (${t2}): the note follows the new day — "SANS — no availability filed for today", the look-ahead words gone`, /no availability filed for today/.test(noteOf(n1)) && !noteOf(n1).includes('SANS from'), J(n1), await W.pic(p, 'a12s-02'))
  if (!/no availability filed for today/.test(noteOf(n1))) {
    await p.clock.runFor(65000); await sleep(1500)
    t2 = await L.today(p); n1 = await crewNote(p)
    W.rec('A12s-03', `a further 65 s run (${t2}), still no reload: the note now`, /no availability filed for today/.test(noteOf(n1)) && !noteOf(n1).includes('SANS from'), J(n1), await W.pic(p, 'a12s-03'))
  }
  await L.reload(p, 'ad', 'a')
  await L.go(p, 'editsched')
  await crewTo(p, W, 'sat')
  const n2 = await crewNote(p)
  W.rec('A12s-04', `after a reload on Fri 17 (${await L.today(p)}): the usual words`, /no availability filed for today/.test(noteOf(n2)) && !noteOf(n2).includes('SANS from'), J(n2), await W.pic(p, 'a12s-04'))
}
async function a12h(p, W, ctx) {
  await L.as(p, W, 'hex')
  const t = await L.moveTo(p, W, '2026-07-16T23:59:50', 'hex')
  await L.openSans(p, W)
  await L.sansOpenDay(p, W, '2026-07-18')
  const s0 = await L.readSansPage(p)
  await L.sansClose(p, W)
  await L.go(p, 'viewsched')
  const lit0 = await L.bellLit(p)
  const b0 = await bell(p, W, 'a12h-01')
  W.rec('A12h-01', `Thu 16 Jul 23:59:50 (${t}), Hex on View: no SANS-days line; on the SANS tab Sat 18's + Commitment greyed (RECORD its words)`, L.active(b0).length === 0 && s0.win && s0.win.add !== 'enabled', `bell lit ${lit0} · ${words(b0)} · Sat 18 window ${J(s0.win)}`, b0.pic)
  await L.bellClose(p, W)
  await p.clock.fastForward(12000); await sleep(1500)
  let t2 = await L.today(p), lit1 = await L.bellLit(p)
  let b1 = await bell(p, W, 'a12h-02')
  W.rec('A12h-02', `fast-forwarded 12 s, no reload (${t2}): the bell lit and his line there`, lit1 === true && L.active(b1).length === 1, `lit before opening ${lit1} · ${words(b1)}`, b1.pic)
  await L.bellClose(p, W)
  if (!(L.active(b1).length === 1)) {
    await p.clock.runFor(65000); await sleep(1500)
    t2 = await L.today(p); lit1 = await L.bellLit(p)
    b1 = await bell(p, W, 'a12h-03')
    W.rec('A12h-03', `a further 65 s (${t2}), no reload: the bell and the line`, lit1 === true && L.active(b1).length === 1, `lit ${lit1} · ${words(b1)}`, b1.pic)
    await L.bellClose(p, W)
  }
  await L.openSans(p, W)
  await L.sansOpenDay(p, W, '2026-07-18')
  const s1 = await L.readSansPage(p)
  const f = await L.sansFileOpen(p, W, '2026-07-18', 'Hex')
  W.rec('A12h-04', 'still no reload: on the SANS tab Sat 18\'s + Commitment offered and his availability filed (read back)', s1.win && s1.win.add === 'enabled' && f.ok, `window ${J(s1.win)} · ${f.why || ''} made ${J(f.made)}`, f.formPic || await W.pic(p, 'a12h-04'))
  await L.sansClose(p, W)
  b1 = await bell(p, W, 'a12h-05')
  W.rec('A12h-05', 'the line then leaves out Sat 18 ("Fri 17, Mon 20, Tue 21 Jul") — one line, no duplicate', L.active(b1).length === 1 && L.active(b1)[0].day === 'Fri 17, Mon 20, Tue 21 Jul', words(b1), b1.pic)
  await L.bellClose(p, W)
}
/* the page hidden across midnight (a second tab brought to the front), then shown again */
async function a12x(p, W, ctx) {
  await L.as(p, W, 'hex')
  const t = await L.moveTo(p, W, '2026-07-16T23:59:50', 'hex')
  await L.go(p, 'viewsched')
  const b0 = await bell(p, W, 'a12x-01'); await L.bellClose(p, W)
  const p2 = await ctx.newPage(); await p2.goto('about:blank'); await p2.bringToFront(); await sleep(500)
  const vis = await p.evaluate(() => document.visibilityState)
  if (vis !== 'hidden') { W.rec('A12x', 'the page hidden across midnight', 'NW', `the test browser left the first tab "${vis}" with a second tab in front — hiding it cannot be played here`); await p2.close(); return }
  await p.clock.fastForward(12000); await sleep(1000)
  await p.bringToFront(); await sleep(1500)
  const b1 = await bell(p, W, 'a12x-02')
  W.rec('A12x-02', `hidden across midnight (${t} → ${await L.today(p)}), shown again: one line, no early or duplicate line`, L.active(b0).length === 0 && L.active(b1).length === 1, `before ${words(b0)} · after ${words(b1)} · visibility while hidden ${vis}`, b1.pic)
  await L.bellClose(p, W)
}

/* ---------- A14: the posting's outcome changed ---------- */
async function setOutcome(p, W, iso, chip, tag) {
  const s = await L.postSheet(p, W, iso, tag)
  let said = ''
  if (chip === 'none') await W.press(p, '[data-testid="postout-sans"]:visible', 'po-sans-again')
  else if (chip === 'delete') {
    await W.press(p, '[data-testid="postout-delete"]:visible', 'po-delete')
    said = ((await p.locator('[data-testid="postout-delete-ask"]').first().innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim()
    await W.pic(p, tag + '-delete-ask')
    await W.press(p, '[data-testid="postout-delete-go"]:visible', 'po-delete-go')
  } else await W.press(p, `[data-testid="postout-${chip}"]:visible`, 'po-' + chip)
  await sleep(800)
  const line = ((await p.locator('[data-testid="postout-line"]:visible').first().textContent().catch(() => '')) || '').trim()
  const err = ((await p.locator('[data-testid="postout-err"]:visible').first().textContent().catch(() => '')) || '').trim()
  const pic = await W.pic(p, tag + '-after')
  await L.sheetClose(p, W)
  return { kind: s.kind, before: s.line, line, err, said, rec: await L.hexRec(p), pic: s.pic + ', ' + pic }
}
async function hexBellOrNot(p, W, tag) {
  await L.signOut(p, W)
  await L.signIn(p, 'hex', 'x').catch(() => {})
  await sleep(600)
  if (await p.locator('#luser:visible').count()) {
    const err = ((await p.locator('#lerr').textContent().catch(() => '')) || '').trim()
    return { signedIn: false, err, pic: await W.pic(p, tag + '-signin') }
  }
  if (!(await p.locator('.bellbtn:visible').count())) {
    /* a screen of its own (his access suspended): its words, then its own Sign out */
    const err = ((await p.evaluate(() => document.body.innerText)) || '').replace(/\s+/g, ' ').trim().slice(0, 200)
    const pic = await W.pic(p, tag + '-signin')
    const so = p.getByRole('button', { name: /Sign out/ })
    if (await so.count()) { await W.press(p, so.first(), 'sign-out'); await p.waitForSelector('#luser', { timeout: 8000 }).catch(() => {}) }
    return { signedIn: false, err, pic }
  }
  const badge = await p.evaluate(() => { const b = document.querySelector('#roleBadge'); return b ? (b.textContent || '').replace(/\s+/g, ' ').trim() : '' })
  const b = await bell(p, W, tag)
  await L.bellClose(p, W)
  return { signedIn: true, badge, b, pic: b.pic }
}
async function a14(p, W, when, chip, read) {
  if (when === 'pre') {
    const o = await setOutcome(p, W, '2026-07-17', chip, 'a14-01')
    W.rec('A14-01', `Wed 15 (before it runs): Saber's posting sheet (${o.kind}) → ${chip === 'none' ? 'SANS tapped again (no outcome)' : chip}`, true, `before "${o.before}" · after "${o.line}" ${o.err ? '· said "' + o.err + '"' : ''} ${o.said ? '· asked "' + o.said + '"' : ''} · record ${J(o.rec)}`, o.pic)
    await L.moveTo(p, W, D17, 'ad', 'a')
    W.rec('A14-02', 'clock to Fri 17 (setSystemTime + reload): Hex\'s record', 'REC', J(await L.hexRec(p)))
    const h = await hexBellOrNot(p, W, 'a14-03')
    if (!h.signedIn) W.rec('A14-03', 'Hex signs in to look at his bell', 'REC', `he cannot sign in: "${h.err}" (his bell not readable — the line is worked out only for the man signed in)`, h.pic)
    else W.rec('A14-03', `Hex's bell on Fri 17: no SANS-days line (signed in as ${h.badge})`, h.b.sans.length === 0, words(h.b), h.pic)
    return
  }
  await hexOn17(p, W)
  const b0 = await bell(p, W, 'a14-01'); await L.bellClose(p, W)
  W.rec('A14-01', 'Fri 17: his line is there', L.active(b0).length === 1, words(b0), b0.pic)
  if (read) { const r = await readIt(p, W, 'a14-02'); W.rec('A14-02', 'Hex reads it', !!r.ok, r.b2 ? words(r.b2) : '', r.b2 && r.b2.pic) }
  await L.as(p, W, 'ad', 'a')
  const o = await setOutcome(p, W, '2026-07-17', chip, 'a14-03')
  W.rec('A14-03', `Saber: the posting sheet (${o.kind}) → ${chip === 'none' ? 'SANS tapped again (no outcome)' : chip}`, true, `before "${o.before}" · after "${o.line}" ${o.err ? '· said "' + o.err + '"' : ''} ${o.said ? '· asked "' + o.said + '"' : ''} · record ${J(o.rec)}`, o.pic)
  const h = await hexBellOrNot(p, W, 'a14-04')
  if (!h.signedIn) W.rec('A14-04', 'Hex signs in to look at his bell', 'REC', `he cannot sign in: "${h.err}" · his stored lines (window.NOTICES, read): ${J(await (async () => { await L.signIn(p, 'ad', 'a'); return L.hexNotices(p) })())}`, h.pic)
  else if (!read) W.rec('A14-04', 'unread line: it simply goes', h.b.sans.length === 0, words(h.b), h.pic)
  else { const st = L.struck(h.b); W.rec('A14-04', 'read line: struck, "taken back · Saber", unread; nothing active', st.length === 1 && L.active(h.b).length === 0 && /taken back · Saber/.test(st[0].what) && st[0].unread, words(h.b), h.pic) }
}

/* ---------- A15: read state survives a reload; no second line ---------- */
async function a15(p, W) {
  await hexOn17(p, W)
  let b = await bell(p, W, 'a15-01'); await L.bellClose(p, W)
  const id0 = L.active(b)[0] && L.active(b)[0].id
  await L.reload(p, 'hex')
  let b2 = await bell(p, W, 'a15-02'); await L.bellClose(p, W)
  W.rec('A15-01', 'unread, then a reload: one line, still unread, the same line', L.active(b2).length === 1 && L.active(b2)[0].unread && L.active(b2)[0].id === id0, `before ${words(b)} · after ${words(b2)}`, b.pic + ', ' + b2.pic)
  const r = await readIt(p, W, 'a15-03')
  await L.reload(p, 'hex')
  b2 = await bell(p, W, 'a15-04'); await L.bellClose(p, W)
  W.rec('A15-02', 'read (tapped), page left and back, reloaded: one line, still read', !!r.ok && L.active(b2).length === 1 && !L.active(b2)[0].unread && b2.lit !== true, `after reading ${r.b2 && words(r.b2)} · after reload ${words(b2)}`, (r.b2 && r.b2.pic) + ', ' + b2.pic)
  await L.openSans(p, W)
  const f = await L.sansFile(p, W, '2026-07-18', 'Hex'); await L.sansClose(p, W)
  await L.reload(p, 'hex')
  b2 = await bell(p, W, 'a15-05'); await L.bellClose(p, W)
  W.rec('A15-03', 'Sat 18 filed, reloaded: one line, 18 not back, read state kept', f.ok && L.active(b2).length === 1 && !/Sat 18/.test(L.active(b2)[0].day) && !L.active(b2)[0].unread, `filed ${J(f.made)} · ${words(b2)}`, b2.pic)
  await L.openSans(p, W)
  const more = []
  for (const iso of ['2026-07-17', '2026-07-20', '2026-07-21', '2026-07-22']) { const g = await L.sansFile(p, W, iso, 'Hex'); more.push(iso.slice(8) + (g.ok ? ' filed' : ' NOT')) }
  await L.sansClose(p, W)
  await L.reload(p, 'hex')
  b2 = await bell(p, W, 'a15-06'); await L.bellClose(p, W)
  W.rec('A15-04', 'every day filed, reloaded: no SANS-days line comes back', more.every(s => / filed$/.test(s)) && b2.sans.length === 0, `${more.join(' · ')} · ${words(b2)}`, b2.pic)
}

/* ---------- A19: archive, restore, delete ---------- */
async function restoreHex(p, W, iso, tag) {
  await L.usersOpen(p, W)
  if (!(await p.locator('#accArchList').count())) await W.press(p, '#accArchToggle', 'arch-toggle')
  await W.press(p, `#accArchList [data-person="${HEX}"] .acc-tap`, 'arch-row')
  await W.press(p, '#accArPostIn', 'postin-box')
  const day = p.locator(`[data-iso="${iso}"]:visible`).first()
  if (await day.count()) await W.press(p, day, 'postin-day')
  await sleep(300)
  const val = ((await p.locator('#accArPostIn').innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim()
  const pic1 = await W.pic(p, tag + '-restore-date')
  await W.press(p, '#accArRestore', 'restore'); await sleep(700)
  return { val, said: await L.toastSaid(p), rec: await L.hexRec(p), pic: pic1 + ', ' + await W.pic(p, tag + '-restored') }
}
async function a19(p, W, kind) {
  await hexOn17(p, W)
  const b0 = await bell(p, W, 'a19-01'); await L.bellClose(p, W)
  W.rec('A19-01', 'Fri 17: his line is there', L.active(b0).length === 1, words(b0), b0.pic)
  if (kind === 'read') { const r = await readIt(p, W, 'a19-02'); W.rec('A19-02', 'Hex reads it', !!r.ok, r.b2 ? words(r.b2) : '', r.b2 && r.b2.pic) }
  await L.as(p, W, 'ad', 'a')
  if (kind === 'delete') {
    await L.usersOpen(p, W)
    await W.press(p, `#accList [data-person="${HEX}"] .acc-tap`, 'acc-row')
    await W.press(p, '#accEdDel:visible', 'del-1')
    const armed = ((await p.locator('#accEdDel').innerText().catch(() => '')) || '').trim()
    const pic1 = await W.pic(p, 'a19-03-del-armed')
    await W.press(p, '#accEdDel:visible', 'del-2'); await sleep(700)
    W.rec('A19-03', 'Saber: Admin → Users → Hex → Delete, Tap again (read back)', (await L.hexRec(p)).deleted === true || (await L.hexRec(p)) === 'no record', `first press "${armed}" · toast "${await L.toastSaid(p)}" · record ${J(await L.hexRec(p))}`, pic1 + ', ' + await W.pic(p, 'a19-03-deleted'))
    const notes = await L.hexNotices(p)
    const h = await hexBellOrNot(p, W, 'a19-04')
    W.rec('A19-04', 'Hex after the delete: his sign-in, and his stored lines (window.NOTICES, read) (RECORD)', 'REC', `${h.signedIn ? 'HE SIGNED IN: ' + words(h.b) : 'cannot sign in: "' + h.err + '"'} · stored lines ${J(notes)}`, h.pic)
    return
  }
  const ar = await L.archive(p, W, HEX, 'a19-03')
  W.rec('A19-03', 'Saber: Admin → Users → Hex → Archive (read back)', ar.archived, `note "${ar.said}"`, ar.pic)
  const h = await hexBellOrNot(p, W, 'a19-04')
  W.rec('A19-04', 'Hex tries to sign in while archived: his sign-in suspended (RECORD what the screen says)', 'REC', h.signedIn ? `HE SIGNED IN (${h.badge}): ${words(h.b)}` : `refused: "${h.err}"`, h.pic)
  if (h.signedIn) await L.signOut(p, W)
  await L.signIn(p, 'ad', 'a')
  const rs = await restoreHex(p, W, '2026-07-17', 'a19-05')
  W.rec('A19-05', 'Saber: Archived → Hex → Post in Fri 17 Jul → Restore (read back)', rs.rec.archived === false, `post-in "${rs.val}" · note "${rs.said}" · record ${J(rs.rec)}`, rs.pic)
  const h2 = await hexBellOrNot(p, W, 'a19-06')
  if (!h2.signedIn) { W.rec('A19-06', 'Hex after the restore', 'REC', `cannot sign in: "${h2.err}"`, h2.pic); return }
  W.rec('A19-06', `Hex after the restore: his SANS status ${J(rs.rec)}, his bell (RECORD; a request only if his restored status is SANS)`, rs.rec.san ? 'REC' : L.active(h2.b).length === 0, words(h2.b), h2.pic)
  await L.openSans(p, W)
  await L.sansOpenDay(p, W, '2026-07-18')
  const s = await L.readSansPage(p)
  W.rec('A19-07', 'Hex\'s SANS tab after the restore: Sat 18\'s window, + Commitment (RECORD)', 'REC', J(s.win), await W.pic(p, 'a19-07-sans'))
  await L.sansClose(p, W)
}

/* ---------- A21: undone, then made again ---------- */
async function a21(p, W) {
  await hexOn17(p, W)
  const r = await readIt(p, W, 'a21-01')
  W.rec('A21-01', 'Hex reads his line', !!r.ok, r.b2 ? words(r.b2) : '', r.b2 && r.b2.pic)
  await L.as(p, W, 'ad', 'a')
  const s = await L.postSheet(p, W, '2026-07-17', 'a21-02')
  await W.press(p, '[data-testid="postout-undo"]:visible', 'po-undo'); await sleep(800)
  const rec1 = await L.hexRec(p)
  await L.sheetClose(p, W)
  W.rec('A21-02', `Saber: posting sheet (${s.kind}) → Undo post out (PO) (read back)`, rec1.san === false, J(rec1), s.pic + ', ' + await W.pic(p, 'a21-02-undone'))
  const po = await L.postOut(p, W, HEX, '2026-07-17', 'a21-03')
  W.rec('A21-03', 'Saber: the same posting made again — Hex\'s 17 Jul cell → ⋯ → Post out → SANS → Post out (today: it runs at once; read back)', po.after.san === true, `line "${po.line}" · ${J(po.after)}`, po.pic)
  await L.as(p, W, 'hex')
  const b = await bell(p, W, 'a21-04'); await L.bellClose(p, W)
  const st = L.struck(b), ac = L.active(b)
  W.rec('A21-04', 'Hex\'s bell: the taken-back line struck AND one new active line, unread', st.length === 1 && /taken back · Saber/.test(st[0].what) && ac.length === 1 && ac[0].unread, words(b), b.pic)
  await L.reload(p, 'hex')
  const b2 = await bell(p, W, 'a21-05'); await L.bellClose(p, W)
  W.rec('A21-05', 'after a reload: the same two', L.struck(b2).length === 1 && L.active(b2).length === 1 && J(b2.sans.map(L.sansWords)) === J(b.sans.map(L.sansWords)), words(b2), b2.pic)
}

/* ---------- A22: a cancelled or info-only item ---------- */
async function rowBtn(p, W, wkMon, di, name, attr, tag) {
  if (wkMon) await L.gotoWeek(p, W, wkMon)
  await L.openBoard(p, W, di)
  const ri = await p.evaluate(([di, name, id]) => (window.DAYS[di].ground || []).findIndex(r => r.prog === name && JSON.stringify(r).includes(id)), [di, name, HEX])
  if (ri < 0) { await L.closeBoard(p, W); return { ok: false, why: 'no row' } }
  await W.press(p, L.B(`[data-gr${attr}="${di}.${ri}"]`), 'gr' + attr)
  await sleep(500)
  /* CX asks for a reason first ("Cancel this item"): left blank for a plain CX, then "Cancel line" */
  let asked = ''
  const cl = p.getByRole('button', { name: 'Cancel line' })
  if (await cl.count() && await cl.first().isVisible()) { asked = 'asked "Cancel this item", answered Cancel line (blank reason)'; await W.pic(p, tag + '-ask'); await W.press(p, cl.first(), 'cancel-line'); await sleep(500) }
  /* …and taking the CX off asks "This item is cancelled — reason": Un-cancel */
  const un = p.getByRole('button', { name: 'Un-cancel' })
  if (await un.count() && await un.first().isVisible()) { asked = 'asked "This item is cancelled — reason", answered Un-cancel'; await W.pic(p, tag + '-ask'); await W.press(p, un.first(), 'un-cancel'); await sleep(500) }
  /* any other question left standing is recorded and closed by its ✕ */
  const left = await p.evaluate(() => { const m = [...document.querySelectorAll('[role="dialog"], .modal, .floatwin')].find(e => e.getBoundingClientRect().width > 0 && !e.closest('#schedBoard .sb-side') && /reason|OIL|\?/.test(e.innerText || '') && (e.innerText || '').length < 600); return m ? (m.innerText || '').replace(/\s+/g, ' ').slice(0, 200) : '' })
  if (left) { asked += ' · still open: "' + left + '"'; await W.pic(p, tag + '-ask2'); await p.keyboard.press('Escape'); await sleep(400) }
  const row =await p.evaluate(([di, ri]) => { const r = window.DAYS[di].ground[ri]; return { prog: r.prog, cx: !!r.cx, info: !!r.info } }, [di, ri])
  const pic = await W.pic(p, tag)
  await L.closeBoard(p, W)
  if (wkMon) await L.gotoWeek(p, W, '2026-07-13')
  return { ok: true, row: { ...row, asked }, pic }
}
async function a22(p, W) {
  await hexOn17(p, W)
  const b0 = await bell(p, W, 'a22-01'); await L.bellClose(p, W)
  W.rec('A22-01', 'Fri 17: his line', L.active(b0).length === 1, words(b0), b0.pic)
  const steps = [
    ['2026-07-20', 1, 'BRIEF', 'cx', 'Tue 21 BRIEF (his only item that day) cancelled — CX'],
    ['2026-07-20', 1, 'BRIEF', 'cx', 'Tue 21 BRIEF restored — CX again'],
    ['2026-07-20', 1, 'BRIEF', 'info', 'Tue 21 BRIEF made Info only — ⓘ'],
    ['2026-07-20', 1, 'BRIEF', 'info', 'Tue 21 BRIEF back to a checked item — ⓘ again'],
    [null, SAT, 'TALK', 'cx', 'control: Sat 18 TALK cancelled while his BRIEF that day stands'],
  ]
  let k = 2
  for (const [wk, di, name, attr, what] of steps) {
    await L.as(p, W, 'ad', 'a')
    const r = await rowBtn(p, W, wk, di, name, attr, `a22-0${k}-${attr}`)
    await L.as(p, W, 'hex')
    const b = await bell(p, W, `a22-0${k}-hex`); await L.bellClose(p, W)
    const l = L.active(b)[0]
    W.rec(`A22-0${k}`, `${what} (RECORD the line)`, r.ok ? 'REC' : 'NW', `row now ${J(r.row || r.why)} · ${words(b)}`, [r.pic, b.pic].filter(Boolean).join(', '))
    k++
  }
}

/* ---------- A23: across a month's and a year's end; a long line on the phone ---------- */
async function a23(p, W, which) {
  const o = which === 'jul'
    ? { po: '2026-07-31', rows: [], next: [['2026-07-27', 4, 'BRIEF', '08:00', '09:00'], ['2026-08-03', 0, 'BRIEF', '08:00', '09:00'], ['2026-08-03', 1, 'BRIEF', '08:00', '09:00'], ['2026-08-03', 3, 'BRIEF', '08:00', '09:00']], when: '2026-07-31T09:00:00' }
    : { po: '2026-12-31', rows: [], next: [['2026-12-28', 3, 'BRIEF', '08:00', '09:00'], ['2026-12-28', 4, 'BRIEF', '08:00', '09:00']], when: '2026-12-31T09:00:00' }
  const r = await L.build(p, W, o)
  if (!r.ok) return
  const t = await (async () => { await L.as(p, W, 'hex'); return L.moveTo(p, W, o.when, 'hex') })()
  const b = await bell(p, W, 'a23-' + which)
  const l = L.active(b)[0]
  const rows = b.lines.map(x => x.h)
  W.rec('A23-' + which + '-1', `clock to the posting's date (${t}): one active line; the days and months read right, nothing doubled or invented (RECORD the words)`, L.active(b).length === 1 ? 'REC' : false, `${words(b)} · facts ${J(r.facts.hex)} · next weeks before: ${Object.entries(r.facts).filter(([k]) => k.startsWith('before')).map(([k, v]) => k + ' ' + v).join(' ; ')}`, b.pic)
  if (l) {
    W.rec('A23-' + which + '-2', `the line's box: ${l.w}×${l.h} px at x ${l.x}..${l.right} of ${p.viewportSize().width}; one entry in the list (RECORD; phone: wraps inside the screen)`, l.right <= p.viewportSize().width && L.active(b).length === 1, `line heights in the list ${J(rows)}`)
    const tp = await L.bellTap(p, W, l.id, 'a23-' + which + '-tap')
    W.rec('A23-' + which + '-3', 'its tap: the SANS tab at the first day\'s month, that day\'s window open', tp.page === 'inputs' && tp.win && tp.win.inScreen && tp.win.topIsWin, J({ page: tp.page, month: tp.month, win: tp.win }), tp.pic)
  }
}

/* ---------- WP: which copy drives the line — a draft-only removal and a draft-only addition ---------- */
async function wp(p, W) {
  await L.moveTo(p, W, D17, 'ad', 'a')
  await L.openBoard(p, W, SAT)
  const lab = await L.publish(p, W, SAT)
  const pe = await L.pendingOf(p, SAT)
  W.rec('WP-01', `Saber: Sat 18 signed and published (${lab}), Hex on its BRIEF and TALK`, pe.pend === 0 && !pe.notSigned, J(pe), await W.pic(p, 'wp-01'))
  await L.closeBoard(p, W)
  const d1 = await delRow(p, W, SAT, 'TALK')
  const d2 = await delRow(p, W, SAT, 'BRIEF')
  await L.openBoard(p, W, SAT)
  const pe2 = await L.pendingOf(p, SAT)
  W.rec('WP-02', 'draft only: both Sat 18 rows naming Hex removed from the working copy, not published', d2.ok && pe2.pend > 0, `left ${J(d2.left)} · ${J(pe2)}`, await W.pic(p, 'wp-02'))
  await L.closeBoard(p, W)
  /* the draft-only addition: Sun 19 published bare first, then Hex named in the working copy */
  await L.openBoard(p, W, 6)
  const lab2 = await L.publish(p, W, 6)
  const g = await L.groundRow(p, W, 6, 'BRIEF', '08:00', '09:00', HEX)
  const pe3 = await L.pendingOf(p, 6)
  W.rec('WP-03', `draft only: Sun 19 published (${lab2}) without Hex, then a BRIEF naming him added to the working copy`, !!(g.row && J(g.row.who).includes(HEX)) && pe3.pend > 0, `${J(g.row)} · ${J(pe3)}`, await W.pic(p, 'wp-03'))
  await L.closeBoard(p, W)
  await L.as(p, W, 'hex')
  const b = await bell(p, W, 'wp-04'); await L.bellClose(p, W)
  const l = L.active(b)[0]
  W.rec('WP-04', 'Hex\'s line: which copy drives it (RECORD) — 18 named = the published copy for the removal; 19 named = the working copy for the addition', 'REC', `${words(b)} → Sat 18 ${l && /Sat 18/.test(l.day) ? 'NAMED' : 'not named'} · Sun 19 ${l && /Sun 19|19/.test(l.day) ? 'NAMED' : 'not named'}`, b.pic)
}

const FN = {
  build: [build, { fresh: true }], a5: [a5], a6: [a6], a7: [a7], a8: [a8], a9: [a9],
  a11um: [(p, W) => a11(p, W, 'move', false)], a11rm: [(p, W) => a11(p, W, 'move', true)],
  a11uu: [(p, W) => a11(p, W, 'undo', false)], a11ru: [(p, W) => a11(p, W, 'undo', true)],
  a12s: [a12s], a12h: [a12h], a12x: [a12x],
  a14po: [(p, W) => a14(p, W, 'pre', 'overseas')], a14pn: [(p, W) => a14(p, W, 'pre', 'none')],
  a14uo: [(p, W) => a14(p, W, 'post', 'overseas', false)], a14rn: [(p, W) => a14(p, W, 'post', 'none', true)],
  a14rd: [(p, W) => a14(p, W, 'post', 'delete', true)],
  a15: [a15], a19u: [(p, W) => a19(p, W, 'unread')], a19r: [(p, W) => a19(p, W, 'read')], a19d: [(p, W) => a19(p, W, 'delete')],
  a21: [a21], a22: [a22], a23j: [(p, W) => a23(p, W, 'jul'), { fresh: true }], a23d: [(p, W) => a23(p, W, 'dec'), { fresh: true }], wp: [wp],
}
for (const k of ONLY) {
  const i = k.lastIndexOf('-'), name = k.slice(0, i), sz = k.slice(i + 1)
  if (!FN[name]) { console.log('unknown', k); continue }
  const [fn, o] = FN[name]
  await run(name, sz, fn, o || {})
  L.saveResults('w6-' + (process.env.W6_TAG || ONLY.join('_')).slice(0, 80))
}
console.log('done')
