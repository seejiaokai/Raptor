// swd-w11-lib — walker w11's helpers (the SANS change lines A–E, D2391; D2394, D2421), 24 Nov 26, chat 156.
// Built on the recipes the brief names: sah-w10-lib, sah-w8-lib, asp-w2-lib. window.* is only READ here (and window.go, the
// recipes' own page switch). Every staging step goes through the app's own controls.
import './swd-w11-env.mjs'
export const X = await import('./sah-w8-lib.mjs')
export const T = await import('./sah-w10-lib.mjs')
export const L = T.L
export const { RANGER, HEX } = X
export const sleep = L.sleep
export const D = { 15: '2026-07-15', 16: '2026-07-16', 17: '2026-07-17', 18: '2026-07-18', 19: '2026-07-19', 20: '2026-07-20', 23: '2026-07-23' }
export const WK1 = '2026-07-13', WK2 = '2026-07-20'

/* ---- the words the brief gives, exact ---- */
const back = one => `It comes back if you're SANS ${one ? 'that day' : 'those days'} again.`
const saber = '· Saber'
export const WORDS = {
  A: (date, days, one) => ({ title: `Your SANS date moved to ${date}.`, who: saber, body: `You're active until then, so the SANS availability you filed for ${days} is hidden. ${back(one)}` }),
  B: (days, one) => ({ title: "You're no longer posted out as SANS.", who: saber, body: `You're active again, so the SANS availability you filed for ${days} is hidden. ${back(one)}` }),
  C: (days, one) => ({ title: "You're no longer SANS.", who: saber, body: `You're active again, so the SANS availability you filed for ${days} is hidden. ${back(one)}` }),
  D: date => ({ title: `Your SANS date moved to ${date}.`, who: saber, body: '' }),
  E: (days, one) => ({ title: "You're no longer posted out as SANS.", who: saber, body: `The SANS availability you filed for ${days} is hidden while you're not SANS ${one ? 'that day' : 'those days'}.` }),
  /* a change title with nothing filed: the title alone */
  bare: title => ({ title, who: saber, body: '' }),
  rem: (date, days) => ({ title: `You're SANS from ${date}.`, body: `You're planned on ${days} with nothing filed. Tap to file for availability.` }),
  needed: days => ({ title: 'Your SANS availability is needed.', body: `You're planned on ${days} with nothing filed. Tap to file for availability.` }),
}
export const lineIs = (l, e) => !!l && l.title === e.title && l.who === e.who && l.body === e.body && !l.struck.length
export const remIs = (l, e) => !!l && l.title === e.title && l.body === e.body && !l.struck.length

/* ---- the bell ---- */
const readLines = p => p.evaluate(() => {
  const list = [...document.querySelectorAll('[data-testid="bell-list"]')].find(e => e.getBoundingClientRect().width > 0)
  if (!list) return null
  const t = e => e ? (e.textContent || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim() : ''
  const vw = document.documentElement.clientWidth
  const lines = [...list.querySelectorAll('.bl-line')].map(e => {
    const r = e.getBoundingClientRect(), name = e.querySelector('.bl-name'), whats = [...e.querySelectorAll('.bl-what')]
    const parts = [name, ...whats].filter(Boolean)
    /* a word cut off shows as a part wider than its line, or a block whose words overflow it */
    const fit = r.left >= -0.5 && r.right <= vw + 0.5 && parts.every(x => { const b = x.getBoundingClientRect(); return b.right <= r.right + 1 && b.left >= r.left - 1 && (getComputedStyle(x).display === 'inline' || x.scrollWidth <= x.clientWidth + 1) })
    return { id: (e.dataset.testid || '').replace('bell-line-', ''), unread: e.classList.contains('unread'), title: t(name), who: t(e.querySelector('.bl-day')), body: whats.map(t).filter(Boolean).join(' '), struck: [...e.querySelectorAll('.bl-struck, s')].map(t).filter(Boolean), all: t(e.querySelector('.bl-main')), ago: t(e.querySelector('.bl-ago')), fit }
  })
  const m = list.querySelector('[data-testid="bell-markall"]') || document.querySelector('[data-testid="bell-markall"]')
  let markAll = 'none'
  if (m) { const b = m.getBoundingClientRect(); markAll = b.width > 0 && b.top >= 0 && b.bottom <= innerHeight + 0.5 ? 'in view' : 'off screen' }
  return { lines, markAll }
})
const CHANGE = /^(Your SANS date moved|You're no longer)/
export async function bell(p, W, tag) {
  await T.closeAll(p, W)
  const lit = await p.evaluate(() => { const b = [...document.querySelectorAll('.bellbtn')].find(e => e.getBoundingClientRect().width > 0); return b ? b.classList.contains('on') : 'no bell' })
  await W.press(p, '.bellbtn:visible', 'bell')
  await p.waitForSelector('[data-testid="bell-list"]', { timeout: 5000 }).catch(() => {})
  await sleep(350)
  const r = await readLines(p)
  const lines = r ? r.lines : []
  const pic = tag ? await W.pic(p, tag) : ''
  const isChange = l => CHANGE.test(l.title) || l.struck.some(s => CHANGE.test(s))
  return { opened: !!r, lit, lines, markAll: r ? r.markAll : 'no list', pic,
    rem: lines.find(l => l.id.startsWith('sansdue')) || null,
    change: lines.filter(isChange),
    struck: lines.filter(l => l.struck.length),
    hiddenSaid: lines.filter(l => !l.struck.length && /is hidden|hidden while/.test(l.body)),
    activeSaid: lines.filter(l => !l.struck.length && /active again/.test(l.body)),
    allFit: lines.every(l => l.fit) }
}
export const say = l => l ? `${l.unread ? '[unread]' : '[read]'} "${l.title}" "${l.who}" "${l.body}"${l.struck.length ? ' struck[' + l.struck.join(' | ') + ']' : ''}` : 'no line'
export const sayB = b => `lit ${b.lit} · ${b.lines.length} line(s) · Mark all read ${b.markAll} · ` + (b.lines.map(say).join(' || ') || 'empty')

/* his reminder read, by a tap on it or by "Mark all read"; read back from the bell */
export async function readReminder(p, W, route, tag) {
  const b = await bell(p, W, tag)
  if (!b.rem) return { ok: false, why: 'no reminder to read: ' + sayB(b), pic: b.pic }
  if (route === 'markall') await W.press(p, '[data-testid="bell-markall"]:visible', 'markall')
  else await X.bellTap(p, W, b.rem.id, tag + '-tap')
  await T.closeAll(p, W)
  const b2 = await bell(p, W, tag + '-read')
  await T.closeAll(p, W)
  return { ok: !!b2.rem && !b2.rem.unread, before: b, after: b2, why: sayB(b2), pic: b.pic + ', ' + b2.pic }
}

/* ---- staging, each step asserted (walk-scripts §3); a set-up that could not act stops the scenario as NOT WALKED ---- */
export class NotWalked extends Error {}
export function need(W, id, what, ok, note, pic) {
  W.rec(id, 'set-up: ' + what, ok ? true : 'NW', note, pic)
  if (!ok) throw new NotWalked(what)
}
export const asR = (p, W) => T.as(p, W, 'us', 'us')
export const asS = (p, W) => T.as(p, W, 'ad', 'a')
/* the Leave War opens behind its loading claw on its first open after a sign-in (D1607); on the phone run with two browsers
   busy it outlasted the recipe's fixed 900ms and the cell was "missing" (run 1). Wait on the grid itself (walk-scripts §4). */
export async function warReady(p) {
  await L.go(p, 'leavewar')
  await p.waitForSelector('[data-testid^="cell-"]', { state: 'attached', timeout: 30000 }).catch(() => {})
  await sleep(400)
}
export async function post(p, W, id, iso, sid) {
  await warReady(p)
  const r = await L.postOut(p, W, id, iso, sid)
  need(W, sid, `Post out → SANS from ${iso}`, /becomes SANS/.test(r.line || ''), `"${r.line}" ${L.J(r.after)}`, r.pic)
  return r
}
/* a row naming Ranger late in the evening (clear of his demo flights), so the week is a saved one and his demo days count */
export async function planRow(p, W, wk, di, sid) {
  const r = await X.row(p, W, wk, di, 'W11 BRIEF', '22:00', '22:30', RANGER)
  need(W, sid, `a Ground Programme row 22:00–22:30 naming Ranger, week ${wk} day ${di}`, r.ok, L.J(r.row))
  await T.gotoWeek(p, W, WK1)
}
export async function file(p, W, from, to, sid) {
  const f = await T.file(p, W, from, null, ['fly'], null, sid, to && to !== from ? { endIso: to } : {})
  need(W, sid, `Ranger files Fly ${from}${to && to !== from ? ' to ' + to : ''} on the SANS tab`, !!f.iid, f.iid ? L.J(f.made) : f.refused, f.pic)
  await T.closeAll(p, W)
  return f
}
export async function move(p, W, cell, to, sid) {
  await warReady(p)
  const m =await T.movePo(p, W, RANGER, cell, to, sid)
  need(W, sid, `Saber moves PO from ${cell} to ${to} on the posting sheet`, m.ok && new RegExp(`On ${+to.slice(8)} Jul`).test(m.line || ''), `"${m.before}" → "${m.line}" ${m.err || ''}`, m.pic)
  return m
}
export async function undoPost(p, W, cell, sid, id = RANGER) {
  await warReady(p)
  const u =await T.undoPo(p, W, id, cell, sid)
  need(W, sid, `Saber presses Undo post out (posting of ${cell})`, u.ok && !u.err, `"${u.before}" ${u.err || ''} ${L.J(u.rec)}`, u.pic)
  return u
}
export async function chip(p, W, cell, sid) {
  await warReady(p)
  const c =await T.sansChip(p, W, RANGER, cell, sid)
  need(W, sid, 'Saber taps the SANS chip on the posting sheet', c.ok && !c.err, `"${c.before}" → "${c.line}" · chips ${c.chips} ${c.err || ''}`, c.pic)
  return c
}
export async function tick(p, W, want, sid) {
  const q = await L.qualsTick(p, W, RANGER, sid)
  need(W, sid, `Quals → Edit → Ranger's SANS ${want ? 'ticked' : 'unticked'} → Done`, q.st && q.st.san === want, L.J(q.st), q.pic)
  await sleep(200)
  return q
}

/* a day of the SANS calendar read: does the man's filing show, and the day's count */
export async function seen(p, W, iso, tag, who = 'Ranger') {
  const r = await T.sansRead(p, W, iso, tag)
  /* the cell draws "F10": F, then pilots, then WSOs; the count is the two figures added */
  const f = String((r.cell && r.cell.f) || '').replace(/\D/g, '').split('').reduce((a, x) => a + +x, 0)
  return { has: r.has(who), n: r.n, f, words: `${iso.slice(8)} Jul: ${T.rowsLine(r.day)} · ${T.cellLine(r.cell)}`, pic: r.pic }
}
/* how many of his SANS filings the store holds (read only): a return must never make a second one */
export const filings = async (p, id = RANGER) => (await T.sansInputs(p)).filter(r => r.people.includes(id))

/* one scenario: a set-up that could not act is NOT WALKED, never a FAIL (walk-scripts §4) */
export const scene = fn => async (p, W, ctx) => {
  try { await fn(p, W, ctx) } catch (e) {
    if (e instanceof NotWalked) { W.rec('stopped', 'the rest of this scenario', 'NW', 'its set-up could not be made: ' + e.message, await W.pic(p, 'NW').catch(() => '')); return }
    throw e
  }
}
