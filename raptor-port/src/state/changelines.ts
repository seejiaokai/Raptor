/* THE CHANGE HISTORY'S LINES FOR WHAT THE CELL FUNNELS NEVER SEE ([DRAFT-PENDING], 28 Sep 26).

   A schedule cell writes its own line as it changes (engine/editlog.ts logEdit, from the mutation funnel). Everything
   else a person would want to see in the one changes window arrives here, from the command stream — ONE subscriber, so
   every door that writes the thing leaves its line and no door can forget (the "missing call site" this project keeps
   meeting), and no door writes a second one (Astra DP-03):

   · AN ABSENCE (the owner's D263, "2 yes": every change to an absence is a line — an input edited, cut by a medical,
     moved, deleted; the Leave War's approve, refuse, back-to-bid, move): `inputs/<iid>` before and after — added,
     deleted, and one line per thing a person reads that changed (whose, the type, the dates, the times, the remarks,
     where it is filed, the OIL answer). A line keeps the span AFTER (`date`–`end`) and the span BEFORE (`wdate`–`wend`),
     so it shows on the days it left and the days it reached, never on the days between (Astra DP-05). A door that
     knows WHY (a medical's split) hands its reason in with `elogReason`, inside its command.
   · THE LEAVE WAR (`lw.cell`, `warId:personId:date`): a request acknowledged, refused, put back to a bid, moved,
     deleted by an admin; an approval is the Input's own line ("approved on the Leave War"); a hand-typed OIL award
     given, changed or taken; and the credit form's ledger (`lw.ledger`, Astra DP-06). Automatic credits never make a
     line (they are the schedule's, not a person's). A member placing his own bid is not a line (D263 names decisions).
   · QUALS (`people/<pid>`, Fable F5 / Astra DP-07): the callsign, CAT, seat, ground crew, SANS, SXO, a qualification
     tick, archived, deleted — dated the day it was made (a roster change is on no schedule day).
   · A PUBLISH OR A WITHDRAWAL (Fable F3 / Astra DP-07): read from the command's own boundary — the version ids carry the
     day and the number — "Published — AL1", "AL1 withdrawn".

   Only a person's own command (`origin: 'user'`) makes lines — a projection, a restore (Undo writes its own line, at
   its success — state/store.ts), a seed or a remote change never does. The lines are written inside the command's
   release (the history holds lines while a command runs — command/latch.ts), so a refused command leaves none.
   The subscriber is registered once, at boot (initStore). */
import { onCommit } from '../command'
import type { CommitEnvelope, Change } from '../command/types'
import { logAction } from '../engine/editlog'
import { PEOPLE } from '../engine/people'
import { dateOrd } from '../engine/inputs'
import { parseVerId, dayIso } from '../engine/verid'
import { qualCols } from '../engine/qualcols'
import { actorIsAdmin } from './perms'

/* ---- the reason a door hands in (inside its command) ---- */
const REASONS = new Map<string, string>()
/* A reason lives for the command it was handed in for, and no longer: the subscriber reads it synchronously inside that
   command's commit and clears it; if the door is REFUSED no commit comes, so it is also dropped once this task ends —
   else it would ride the next, unrelated command that names the same input ([DRAFT-PENDING], Fable P12) */
let REASON_DROP = false
export function elogReason(iid: string | null | undefined, why: string) {
  if (!iid || !why) return
  REASONS.set(String(iid), why)
  if (!REASON_DROP) { REASON_DROP = true; queueMicrotask(() => { REASON_DROP = false; REASONS.clear() }) }
}

const pad = (n: number) => String(n).padStart(2, '0')
const isoOfLabel = (lbl: any, yr?: any): string | null => {
  const o = dateOrd(lbl, yr)
  return o == null ? null : `${Math.floor(o / 10000)}-${pad(Math.floor(o / 100) % 100)}-${pad(o % 100)}`
}
const cs = (pid: any) => ((PEOPLE as any)[pid] && (PEOPLE as any)[pid].cs) || String(pid || '')
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
/* '2026-08-01' → '1 Aug' (the day-first voice the rest of the app speaks) */
const dayWord = (iso: string) => { const [, m, d] = iso.split('-').map(Number); return `${d} ${MON[(m || 1) - 1]}` }
/* a week id as the scheduler's records write it ('dd/mm/yyyy', its Monday) and a day index → the calendar day */
const dayIsoOf = (wk: string, di: number) => (Number.isFinite(di) && di >= 0 && di <= 6 ? dayIso(wk, di) : '')
const localToday = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }

/* ---- an input ---- */
type Span = { date: string; end: string }
function spanOf(inp: any): Span | null {
  if (!inp) return null
  const a = isoOfLabel(inp.date, inp.yr)
  if (!a) return null
  const b = inp.endDate ? isoOfLabel(inp.endDate, inp.yr) : a
  return { date: a, end: b && b > a ? b : a }
}
const spanWords = (s: Span | null) => !s ? '' : s.end > s.date ? `${dayWord(s.date)}–${dayWord(s.end)}` : dayWord(s.date)
const hhmm = (m: any) => { const n = +m; return Number.isFinite(n) ? `${pad(Math.floor(n / 60) % 24)}:${pad(n % 60)}` : '' }
const timeWords = (inp: any) => inp.allday ? (inp.half === 'am' ? 'morning' : inp.half === 'pm' ? 'afternoon' : 'all day') : `${hhmm(inp.s)}–${hhmm(inp.e)}`
const FIL: Record<string, string> = { '': 'not on the programme', g: 'on the programme', u: 'under Unavailable', r: 'taken off the programme' }
const filWords = (a: any) => FIL[String(a || '')] ?? String(a || '')
const oilWords = (o: any) => {
  if (!o || typeof o !== 'object') return 'not asked'
  const v = Object.values(o).map(Number)
  return !v.length ? 'not asked' : v.some(x => x > 0) ? (v.every(x => x === 1) ? 'earns OIL' : 'earns part OIL') : 'earns no OIL'
}
const same = (a: any, b: any) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null)

function inputLines(c: Change, env: CommitEnvelope, war: boolean): void {
  const b: any = c.before, a: any = c.after, iid = String(c.id)
  const why = REASONS.get(iid)
  const tail = why ? ` — ${why}` : ''
  const sa = spanOf(a), sb = spanOf(b)
  const at = (extra: any = {}) => ({ iid, sect: 'abs', ...extra })
  if (!b && a) {
    const s = sa
    logAction(null, `${cs(a.person)} · ${a.type} ${war ? 'approved on the Leave War' : 'added'} · ${spanWords(s)}${a.acc === 'g' ? ' (on the programme)' : ''}${tail}`,
      at({ date: s && s.date, end: s && s.end }))
    return
  }
  if (b && !a) {
    const s = sb
    logAction(null, `${cs(b.person)} · ${b.type} ${war ? 'approval taken back (back to a bid)' : 'deleted'} · ${spanWords(s)}${tail}`,
      at({ date: s && s.date, end: s && s.end }))
    return
  }
  if (!a || !b) return
  const who = cs(a.person), what = a.type
  const base = (x: any) => at({ date: sa && sa.date, end: sa && sa.end, wdate: sb && sb.date, wend: sb && sb.end, ...x })
  if (!same(a.person, b.person)) logAction(null, `${b.type} ${spanWords(sb)} · whose`, base({ from: cs(b.person), to: cs(a.person) }))
  if (!same(a.type, b.type)) logAction(null, `${who} · ${spanWords(sa)} · type`, base({ from: String(b.type), to: String(a.type) }))
  if (!same(sa, sb)) logAction(null, `${who} · ${what}${tail} · dates`, base({ from: spanWords(sb), to: spanWords(sa) }))
  if (!same([b.allday, b.s, b.e, b.half], [a.allday, a.s, a.e, a.half])) logAction(null, `${who} · ${what} ${spanWords(sa)} · times`, base({ from: timeWords(b), to: timeWords(a) }))
  if (!same(b.remarks || '', a.remarks || '')) logAction(null, `${who} · ${what} ${spanWords(sa)} · remarks`, base({ from: String(b.remarks || '—'), to: String(a.remarks || '—') }))
  if (!same(b.acc || '', a.acc || '')) logAction(null, `${who} · ${what} ${spanWords(sa)} · filed`, base({ from: filWords(b.acc), to: filWords(a.acc) }))
  if (!same(b.oil, a.oil)) logAction(null, `${who} · ${what} ${spanWords(sa)} · OIL`, base({ from: oilWords(b.oil), to: oilWords(a.oil) }))
}

/* A FILING DONE UNDER THE DAY'S OWN COMMAND. Accepting a request onto the programme (or under Unavailable, or taking it
   off) changes the day and the request's filing in place and runs under the board's catch-all command, whose envelope
   carries the day but not the input record — so the subscriber never sees it. That one door writes its line here, in
   the same words, and cannot double it: its command carries no input for the subscriber to read. */
export function logFiling(inp: any, wasAcc: any): void {
  if (!inp || String(wasAcc || '') === String(inp.acc || '')) return
  const s = spanOf(inp)
  logAction(null, `${cs(inp.person)} · ${inp.type} ${spanWords(s)} · filed`,
    { iid: inp.iid, sect: 'abs', date: s && s.date, end: s && s.end, from: filWords(wasAcc), to: filWords(inp.acc) })
}

/* ---- the Leave War ---- */
const cellParts = (id: string) => {
  const iDate = id.lastIndexOf(':'), rest = id.slice(0, iDate), iPid = rest.lastIndexOf(':')
  return { date: id.slice(iDate + 1), pid: rest.slice(iPid + 1) }
}
const STATE_WORD: Record<string, string> = { pending: 'back to a bid', acknowledged: 'acknowledged', refused: 'refused' }
function warLines(env: CommitEnvelope, approvedFor: Set<string>, backToBid: Set<string>): void {
  type R = { rec: any; pid: string; date: string }
  const gone = new Map<string, R>(), came = new Map<string, R>(), both: Array<{ was: R; now: R }> = []
  for (const c of env.changes) {
    if (c.collection !== 'lw.cell') continue
    const { date, pid } = cellParts(String(c.id))
    const bl: any[] = Array.isArray(c.before) ? c.before : [], al: any[] = Array.isArray(c.after) ? c.after : []
    const bm = new Map(bl.map(r => [r.id, r])), am = new Map(al.map(r => [r.id, r]))
    for (const r of bl) if (!am.has(r.id)) gone.set(r.id, { rec: r, pid, date })
    for (const r of al) if (!bm.has(r.id)) came.set(r.id, { rec: r, pid, date })
    for (const r of al) { const o = bm.get(r.id); if (o && !same(o, r)) both.push({ was: { rec: o, pid, date }, now: { rec: r, pid, date } }) }
  }
  const admin = actorIsAdmin(env.actor)
  const say = (x: R, what: string, extra: any = {}) =>
    logAction(null, `Leave War · ${cs(x.pid)} · ${x.rec.code || ''} ${dayWord(x.date)}${what ? ': ' + what : ''}`.replace('  ', ' '), { date: x.date, sect: 'abs', ...extra })
  /* a request that left one day and reached another is a MOVE (the record keeps its id) */
  for (const [id, g] of gone) {
    const c = came.get(id)
    if (c && g.rec.kind === 'request') { came.delete(id); say(c, `moved from ${dayWord(g.date)}`, { wdate: g.date }); continue }
    if (g.rec.kind === 'request') {
      if (approvedFor.has(`${g.pid}|${g.date}`)) continue          // approved — the Input's own line says it
      if (admin) say(g, 'deleted')
    } else if (g.rec.kind === 'credit' && g.rec.oil === 'manual') say(g, `OIL award taken away`)
  }
  for (const [, c] of came) {
    /* a request that reappears because its approval was taken back is said by the Input's own line; a bid a member
       places is not a decision (D263 names decisions) — only a request that arrives already decided is a line */
    if (c.rec.kind === 'request') { if (!backToBid.has(`${c.pid}|${c.date}`) && c.rec.state !== 'pending') say(c, STATE_WORD[c.rec.state] || c.rec.state); continue }
    if (c.rec.kind === 'credit' && c.rec.oil === 'manual') say(c, `OIL award given${c.rec.givenBy ? ' by ' + c.rec.givenBy : ''}`)
  }
  for (const { was, now } of both) {
    if (now.rec.kind === 'request' && was.rec.state !== now.rec.state) say(now, STATE_WORD[now.rec.state] || now.rec.state)
    else if (now.rec.kind === 'credit' && now.rec.oil === 'manual') say(now, 'OIL award changed')
  }
}
/* A BID AN INPUT TOOK AWAY. Filing an input over a man's bid (the Inputs page, the board's + Add, an edit window) removes
   the clashing bid in the SAME command (leavewar/inputgate.ts replaceBids) — an Inputs command, not the Leave War's, so
   warLines never reads it and the bid left without a word ([DRAFT-PENDING], Fable P10; the plan §2.2 "taken away"). Each
   bid that left is a line on its day, beside the input's own; a half it kept (the morning or the afternoon) is not a
   decision and says nothing. */
function replacedLines(env: CommitEnvelope): void {
  for (const c of env.changes) {
    if (c.collection !== 'lw.cell') continue
    const { date, pid } = cellParts(String(c.id))
    const bl: any[] = Array.isArray(c.before) ? c.before : [], al: any[] = Array.isArray(c.after) ? c.after : []
    const am = new Set(al.map(r => r.id))
    for (const r of bl) if (r.kind === 'request' && !am.has(r.id))
      logAction(null, `Leave War · ${cs(pid)} · ${r.code || ''} ${dayWord(date)}: bid taken away — an input covers it`.replace('  ', ' '), { date, sect: 'abs' })
  }
}
function ledgerLines(c: Change): void {
  const bl: any[] = Array.isArray(c.before) ? c.before : [], al: any[] = Array.isArray(c.after) ? c.after : []
  const bm = new Map(bl.map(r => [r.id, r])), am = new Map(al.map(r => [r.id, r]))
  /* the counter as the app names it — OIL, ANNUAL, CCL … (the Leave War's labels are its keys in capitals; D25: OIL) */
  const words = (e: any) => `${cs(e.personId)} · ${String(e.counter || '').toUpperCase()} ${+e.amount > 0 ? '+' : ''}${e.amount}${e.reason ? ' — ' + e.reason : ''}`
  const at = (e: any) => ({ date: /^\d{4}-\d{2}-\d{2}$/.test(e.date) ? e.date : localToday(), sect: 'abs' })
  for (const e of al) { const o = bm.get(e.id); if (!o) logAction(null, `Leave War · ${words(e)}: given`, at(e)); else if (!same(o, e)) logAction(null, `Leave War · ${words(e)}: changed`, { ...at(e), from: words(o), to: words(e) }) }
  for (const e of bl) if (!am.has(e.id)) logAction(null, `Leave War · ${words(e)}: taken away`, at(e))
}

/* ---- Quals ---- */
const PERSON_FIELDS: Record<string, string> = {
  cs: 'callsign', q: 'CAT', seat: 'seat', pers: 'ground crew', san: 'SANS', sxo: 'SXO', archived: 'archived', deleted: 'deleted',
}
const val = (v: any) => typeof v === 'boolean' ? (v ? 'yes' : 'no') : (v == null || v === '' ? '—' : String(v))
function personLines(c: Change): void {
  const b: any = c.before, a: any = c.after, pid = String(c.id)
  if (a && a.special) return
  const at = { date: localToday(), sect: 'quals' }
  if (!b && a) { logAction(null, `${a.cs || pid} · added to the roster`, at); return }
  if (!a || !b) return
  /* absent, false and '' are the same "not set" — a tick added then cleared is no change */
  const norm = (v: any) => (v == null || v === false || v === '') ? null : v
  const qv = (v: any) => v === 'I' ? 'I (instructor)' : val(v)
  const seen = new Map<string, { from: string; to: string }>()
  for (const k of Object.keys(PERSON_FIELDS)) {
    if (same(norm(b[k]), norm(a[k]))) continue
    seen.set(PERSON_FIELDS[k]!, { from: val(b[k]), to: val(a[k]) })
  }
  /* a qualification tick lives in the person's `quals` (Quals' own columns, named by their heading); a tick that is
     also a flag on the person (SANS, SXO) is said once */
  for (const q of qualCols()) {
    const x = b.quals && b.quals[q.k], y = a.quals && a.quals[q.k]
    if (same(norm(x), norm(y)) || seen.has(q.h)) continue
    seen.set(q.h, { from: qv(x), to: qv(y) })
  }
  const name = seen.has('callsign') ? val(b.cs) : (a.cs || pid)
  for (const [field, v] of seen) logAction(null, `${name} · ${field}`, { ...at, from: v.from, to: v.to })
}

/* ---- publish / withdraw ---- */
const verWord = (seq: number) => seq === 0 ? 'the Original' : `AL${seq}`
function boundaryLines(env: CommitEnvelope): void {
  const bd: any = env.boundary
  if (!bd || !Array.isArray(bd.ids)) return
  for (const id of bd.ids) {
    const { iso, seq } = parseVerId(String(id))
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) continue
    if (bd.kind === 'publish') logAction(null, `Published — ${verWord(seq)}`, { date: iso, sect: 'day' })
    else if (bd.kind === 'unpublish') logAction(null, `${seq === 0 ? 'The Original' : 'AL' + seq} withdrawn`, { date: iso, sect: 'day' })
  }
}

/* ---- an undo or a redo (Astra DP-04) ----
   Written at the global undo's success (undo/timeline.ts `reversed`), never on a refusal, and never by the restore's own
   command (a restore is not a person's forward change — the subscriber skips it). The days are the step's own records:
   a day of a week (`days/<wk>#<di>`), an input's span before and after, a Leave War day, an issued version's day. One
   line per run of neighbouring days, in the undo's own words ("Undo — Warden put on RU 1 back seat"). */
export function logReversed(entry: { label?: string; forward?: Change[] }, dir: 'undo' | 'redo'): void {
  const days = new Set<string>()
  const addSpan = (s: Span | null) => { if (!s) return; for (let d = s.date; d <= s.end; d = nextIso(d)) days.add(d) }
  for (const c of entry.forward || []) {
    const id = String(c.id)
    if (c.collection === 'days') { const [wk, di] = id.split('#'); try { const iso = dayIsoOf(wk!, +di!); if (iso) days.add(iso) } catch (_) { /* a malformed id names no day */ } }
    else if (c.collection === 'inputs' && id !== '__order') { addSpan(spanOf(c.before)); addSpan(spanOf(c.after)) }
    else if (c.collection === 'lw.cell') days.add(cellParts(id).date)
    else if (c.collection === 'sched.orig' || c.collection === 'sched.als') { const m = /\d{4}-\d{2}-\d{2}/.exec(id); if (m) days.add(m[0]) }
  }
  const sorted = [...days].filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort()
  const what = `${dir === 'undo' ? 'Undo' : 'Redo'}${entry.label ? ' — ' + entry.label : ''}`
  if (!sorted.length) { logAction(null, what, { date: localToday(), sect: 'day' }); return }
  let a = sorted[0]!, b = a
  const flush = () => logAction(null, what, { date: a, end: b, sect: 'day' })
  for (const d of sorted.slice(1)) { if (d === nextIso(b)) b = d; else { flush(); a = b = d } }
  flush()
}

/* ---- the subscriber ---- */
export function changeLinesFor(env: CommitEnvelope): void {
  try {
    if (env.origin !== 'user') return
    const war = !!(env.scope && (env.scope as any).module === 'lw')
    /* in a Leave War decision an Input added is the approval of the request it replaced, and an Input taken away
       is the approval taken back — so the war's own side of those is not said twice */
    const approvedFor = new Set<string>(), backToBid = new Set<string>()
    if (war) for (const c of env.changes) {
      if (c.collection !== 'inputs' || c.id === '__order') continue
      const s = spanOf(c.after || c.before), p = (c.after || c.before as any)?.person
      if (!s || !p) continue
      for (let d = s.date; d <= s.end; d = nextIso(d)) (c.after && !c.before ? approvedFor : !c.after && c.before ? backToBid : new Set()).add(`${p}|${d}`)
    }
    for (const c of env.changes) {
      if (c.collection === 'inputs' && c.id !== '__order') inputLines(c, env, war)
      else if (c.collection === 'lw.ledger') ledgerLines(c)
      else if (c.collection === 'people') personLines(c)
    }
    if (war) warLines(env, approvedFor, backToBid)
    else replacedLines(env)
    boundaryLines(env)
  } finally {
    REASONS.clear()
  }
}
function nextIso(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + 1)
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}

let wired = false
export function registerChangeLines(): void {
  if (wired) return
  wired = true
  onCommit(changeLinesFor)
}
