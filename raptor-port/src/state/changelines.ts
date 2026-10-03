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
     deleted by an admin; an approval is the Input's own line ("approved on the Leave War"). THE LEDGER (`lw.ledger`,
     one record per entry — Astra DP-06): an OIL AWARD given, changed or taken, however it was given (the grid's +OIL
     panel, the OIL tracker — one kind of record since [OIL-AWARD-IS-A-GRANT], 29 Sep 26), and every other credit or
     correction, each on its own day. Automatic credits never make a line (they are the schedule's, not a person's). A
     member placing his own bid is not a line (D263 names decisions).
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
import { parseHideDetail } from '../engine/hidedetail'
import { decodeRoleId } from '../engine/mission-role'
import { PEOPLE } from '../engine/people'
import { dateOrd, INPUTS } from '../engine/inputs'
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
  /* every absence line keeps WHOSE it is, by id (`sub` — Fable's read of the fixes, FF4): "To go out" finds its line by it
     when the input it was about has since been re-filed under another id (a move on the war) */
  const at = (extra: any = {}) => ({ iid, sect: 'abs', sub: String((a || b || {}).person || ''), itype: String((a || b || {}).type || ''), ...extra })
  /* whether it is on the programme is read as the week on screen now shows it: since [DB-READINESS] phase 6 (c) a request's
     row is worked out AFTER its command (state/holderbase.ts, phase 8), so its `acc` in the envelope is the one it had
     before — this line is written at phase 9, after the working-out (Fable's round-3 F4.3) */
  const live: any = (INPUTS as any[]).find((r: any) => r && String(r.iid || '') === iid)
  const accNow = (x: any) => (live ? live.acc : x && x.acc)
  if (!b && a) {
    const s = sa
    logAction(null, `${cs(a.person)} · ${a.type} ${war ? 'approved on the Leave War' : 'added'} · ${spanWords(s)}${accNow(a) === 'g' ? ' (on the programme)' : ''}${tail}`,
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
  /* the times as a reader sees them — stored times rewritten under an all-day record are no change to it ([HIST-PHONE-HIDE]
     walk: a Save that changed nothing wrote "times: all day → all day") */
  if (timeWords(b) !== timeWords(a)) logAction(null, `${who} · ${what} ${spanWords(sa)} · times`, base({ from: timeWords(b), to: timeWords(a) }))
  if (!same(b.remarks || '', a.remarks || '')) logAction(null, `${who} · ${what} ${spanWords(sa)} · remarks`, base({ from: String(b.remarks || '—'), to: String(a.remarks || '—') }))
  if (!same(b.acc || '', accNow(a) || '')) logAction(null, `${who} · ${what} ${spanWords(sa)} · filed`, base({ from: filWords(b.acc), to: filWords(accNow(a)) }))
  if (!same(b.oil, a.oil)) logAction(null, `${who} · ${what} ${spanWords(sa)} · OIL`, base({ from: oilWords(b.oil), to: oilWords(a.oil) }))
}

/* A FILING DONE UNDER THE DAY'S OWN COMMAND (accepting a request onto the programme, under Unavailable, taking it off):
   the board's catch-all command diffs every input against the last committed state, so the filing that moved is in its
   envelope and inputLines says it — once. A second writer for that door doubled every such line (Fable's final read, F1). */

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
    logAction(null, `Leave War · ${cs(x.pid)} · ${x.rec.code || ''} ${dayWord(x.date)}${what ? ': ' + what : ''}`.replace('  ', ' '), { date: x.date, sect: 'abs', sub: x.pid, ...extra })
  /* a request that left one day and reached another is a MOVE (the record keeps its id) */
  for (const [id, g] of gone) {
    const c = came.get(id)
    if (c && g.rec.kind === 'request') { came.delete(id); say(c, `moved from ${dayWord(g.date)}`, { wdate: g.date }); continue }
    if (g.rec.kind === 'request') {
      if (approvedFor.has(`${g.pid}|${g.date}`)) continue          // approved — the Input's own line says it
      if (admin) say(g, 'deleted')
    }
  }
  for (const [, c] of came) {
    /* a request that reappears because its approval was taken back is said by the Input's own line; a bid a member
       places is not a decision (D263 names decisions) — only a request that arrives already decided is a line */
    if (c.rec.kind === 'request') { if (!backToBid.has(`${c.pid}|${c.date}`) && c.rec.state !== 'pending') say(c, STATE_WORD[c.rec.state] || c.rec.state); continue }
  }
  for (const { was, now } of both) {
    if (now.rec.kind === 'request' && was.rec.state !== now.rec.state) say(now, STATE_WORD[now.rec.state] || now.rec.state)
  }
}
/* THE WAR'S RECORDS LEAVING IN A COMMAND THAT IS NOT THE WAR'S OWN. Two doors do it: an input filed over a man's bid (the
   Inputs page, the board's + Add, an edit window — leavewar/inputgate.ts replaceBids takes the clashing bid inside the
   INPUT's command; Fable P10), and a person deleted or archived (his records from that day on go inside the people
   command — Astra's final read, ASTRA-DP-FINAL-01). warLines reads only the war's own commands, so without this each left
   without a word. Each bid that left is ONE line on its day, and it says the cause only when the cause is IN the
   envelope: "an input covers it" only when an input in the same command covers that man on that day; otherwise
   plainly "bid removed". What arrives (the half of a bid an input kept, a notice) is not a decision and says nothing; a
   credit the schedule earned (`oil: 'auto'`) is never a line. An OIL award that leaves (a person deleted) is a LEDGER
   entry now, and says so through `ledgerLines`, on its own day ([OIL-AWARD-IS-A-GRANT]). */
function crossLines(env: CommitEnvelope): void {
  const covered = new Set<string>()
  for (const c of env.changes) {
    if (c.collection !== 'inputs' || c.id === '__order' || !c.after) continue
    const s = spanOf(c.after), p = (c.after as any).person
    if (!s || !p) continue
    for (let d = s.date; d <= s.end; d = nextIso(d)) covered.add(`${p}|${d}`)
  }
  for (const c of env.changes) {
    if (c.collection !== 'lw.cell') continue
    const { date, pid } = cellParts(String(c.id))
    const bl: any[] = Array.isArray(c.before) ? c.before : [], al: any[] = Array.isArray(c.after) ? c.after : []
    const am = new Set(al.map(r => r.id))
    for (const r of bl) {
      if (am.has(r.id)) continue
      const what = r.kind === 'request' ? (covered.has(`${pid}|${date}`) ? 'bid taken away — an input covers it' : 'bid removed') : ''
      if (what) logAction(null, `Leave War · ${cs(pid)} · ${r.code || ''} ${dayWord(date)}: ${what}`.replace('  ', ' '), { date, sect: 'abs', sub: pid })
    }
  }
}
/* THE WAR'S OWN DOORS ON AN APPROVED LEAVE (Fable's final read, F2; Astra's read of the fixes, 01). The war files its
   approvals as Inputs and takes them back inside its own command — cutting, SPLITTING (a middle day out of three leaves
   two Inputs), extending an Input next to it, re-filing a moved day as a new Input — so no one Input's change says which
   decision it was. The DAYS do: for each man and leave type, the days his changed approvals covered before the command
   and after it. Days gone and days new: a MOVE. Days gone only: an approval taken back (the request that came back says
   back to a bid, refused or acknowledged) or, with none, an approved leave deleted. Days new only: an approval. A split's
   surviving piece covers days it covered before, so it says nothing. ONE line per decision, on the days it concerns (a
   move on the days it left and reached, never between — Astra DP-05). The gone and new days are also what the war's own
   side reads to say nothing twice (a request that left because it was approved, one that came back because an approval
   was taken back). A detail edited with the days unchanged is left to the per-input writer. */
type WarInputs = { said: Set<Change>; approvedFor: Set<string>; backToBid: Set<string> }
function runsWords(ds: string[]): string {
  const out: string[] = []
  let a = ds[0]!, b = a
  for (const d of ds.slice(1)) { if (d === nextIso(b)) b = d; else { out.push(spanWords({ date: a, end: b })); a = b = d } }
  out.push(spanWords({ date: a, end: b }))
  return out.join(', ')
}
function warInputLines(env: CommitEnvelope): WarInputs {
  const res: WarInputs = { said: new Set(), approvedFor: new Set(), backToBid: new Set() }
  const came = new Map<string, string>()
  for (const c of env.changes) {
    if (c.collection !== 'lw.cell') continue
    const { date, pid } = cellParts(String(c.id))
    const bl: any[] = Array.isArray(c.before) ? c.before : [], al: any[] = Array.isArray(c.after) ? c.after : []
    const had = new Set(bl.map(r => r.id))
    for (const r of al) if (r.kind === 'request' && !had.has(r.id)) came.set(`${pid}|${date}`, String(r.state))
  }
  type G = { p: string; t: string; was: Set<string>; now: Set<string>; changes: Array<{ c: Change; b: string[]; a: string[] }> }
  const groups = new Map<string, G>()
  const daysOf = (inp: any): string[] => { const s = spanOf(inp), out: string[] = []; if (s) for (let d = s.date; d <= s.end; d = nextIso(d)) out.push(d); return out }
  for (const c of env.changes) {
    if (c.collection !== 'inputs' || c.id === '__order') continue
    const ref: any = c.after || c.before
    if (!ref || !ref.person) continue
    const k = `${ref.person}|${ref.type}`
    let g = groups.get(k)
    if (!g) { g = { p: String(ref.person), t: String(ref.type), was: new Set(), now: new Set(), changes: [] }; groups.set(k, g) }
    const bd = c.before ? daysOf(c.before) : [], ad = c.after ? daysOf(c.after) : []
    g.changes.push({ c, b: bd, a: ad })
    bd.forEach(d => g!.was.add(d)); ad.forEach(d => g!.now.add(d))
  }
  const oneRun = (ds: string[]) => ds.every((d, i) => i === 0 || d === nextIso(ds[i - 1]!))
  for (const g of groups.values()) {
    const gone = [...g.was].filter(d => !g.now.has(d)).sort(), fresh = [...g.now].filter(d => !g.was.has(d)).sort()
    gone.forEach(d => res.backToBid.add(`${g.p}|${d}`))
    fresh.forEach(d => res.approvedFor.add(`${g.p}|${d}`))
    if (!gone.length && !fresh.length) continue
    g.changes.forEach(x => res.said.add(x.c))
    /* the record the line points at is the one holding the days it is ABOUT — the new days for an approval or a move (a
       split's untouched remainder is never it — Astra's round-3 read, R3-01), the days that left otherwise; and it keeps
       every record of the decision (R3-02) */
    const holds = (side: 'a' | 'b', ds: string[]) => { const x = g.changes.find(y => y[side].some(d => ds.includes(d))); return x ? String(x.c.id) : '' }
    const iid = fresh.length ? holds('a', fresh) : holds('b', gone)
    const iids = [iid, ...g.changes.map(x => String(x.c.id)).filter(x => x !== iid)]
    const exact = (ds: string[]) => oneRun(ds) ? undefined : ds
    const who = `${cs(g.p)} · ${g.t}`
    const at = (ds: string[]) => ({ date: ds[0]!, end: ds[ds.length - 1]! })
    const base = { iid, iids, sect: 'abs', sub: g.p, itype: g.t }
    if (gone.length && fresh.length) {
      /* what MOVED is the whole of each piece that landed on new days, and what it left is where those days were — so a
         two-day leave slid one day reads "2 Feb–3 Feb → 3 Feb–4 Feb", not "2 Feb → 4 Feb" (Fable's round-3 read, G1) */
      const landed = g.changes.filter(x => !x.c.before && x.a.some(d => fresh.includes(d)))
      const toDays = [...new Set([...fresh, ...landed.flatMap(x => x.a)])].sort()
      const fromDays = [...new Set([...gone, ...toDays.filter(d => g.was.has(d))])].sort()
      const was = at(fromDays), now = at(toDays)
      logAction(null, `${who} moved on the Leave War · ${runsWords(fromDays)} → ${runsWords(toDays)}`,
        { ...base, date: now.date, end: now.end, wdate: was.date, wend: was.end, days: exact(toDays), wdays: exact(fromDays) })
    } else if (gone.length) {
      const st = gone.map(d => came.get(`${g.p}|${d}`)).find(x => x != null), was = at(gone)
      logAction(null, st != null
        ? `${who} approval taken back — ${STATE_WORD[st] || st} · ${runsWords(gone)}`
        : `${who} approved leave deleted on the Leave War · ${runsWords(gone)}`,
        { ...base, date: was.date, end: was.end, days: exact(gone) })
    } else {
      const now = at(fresh)
      logAction(null, `${who} approved on the Leave War · ${runsWords(fresh)}`, { ...base, date: now.date, end: now.end, days: exact(fresh) })
    }
  }
  return res
}
/* A POSTING, set, changed or taken back on the war (Fable's final read, F4 — an admin's decision, D229, whose maker D169
   wants seen). The war keeps each man's window in the squadron (`from` his first day, `to` his last — the posting-out
   date he typed is the day after it), so the lines are that window's changes: "posting out 14 Oct · Overseas Sqn",
   "posting out changed · 14 Oct → 21 Oct", "posting out taken back", and the same for a posting in. On the day it
   RUNS the posting pass does it — no person, so no line. A man archived, restored or deleted in the same command is
   said by his Quals line ("archived", "deleted") and his window's change is part of that act, so it says nothing more
   (one act, one line). */
const OUTCOME_WORD: Record<string, string> = { overseas: 'Overseas Sqn', delete: 'Delete', sans: 'SANS', none: 'no outcome' }
function postoutLines(c: Change, env: CommitEnvelope): void {
  /* a person's own act on Admin → Users — Archive, Restore, Delete — is said by his Quals line ("archived", "deleted");
     his window's change is part of it (one act, one line). The Leave War's posting doors are the posting command
     (`lw.postout` — setting one, moving it, taking it back, before or after it ran: Astra's read of the fixes, 02), and
     there the posting line is the one line (personLines leaves out what the posting made) */
  if (env.type === 'person.archive' || env.type === 'person.restore' || env.type === 'person.delete') return
  /* one man's window per change since the war's records went into rows ([DB-READINESS] group A, phase 3 — its id is his
     person id); a change of the whole map, from before that shape, is still read man by man */
  const whole = c.id === 'all'
  const wrap = (v: unknown): any => (v && typeof v === 'object' ? (whole ? v : { [String(c.id)]: v }) : {})
  const bm: any = wrap(c.before), am: any = wrap(c.after)
  /* a man MADE in the same command (Add a person with his post-in date) is said by "added to the roster" */
  const quiet = new Set<string>()
  for (const x of env.changes) if (x.collection === 'people' && !x.before) quiet.add(String(x.id))
  for (const pid of new Set([...Object.keys(bm), ...Object.keys(am)])) {
    if (quiet.has(pid)) continue
    /* a Leave War line, keeping WHOSE it is and WHAT it is by id — the changes window files it under "Leave War · <him>"
       by these, never by its words ([CHG-BY-ITEM]; Fable F3, Astra 05) */
    const at = (d: string, extra: any = {}) => ({ date: d, sect: 'abs', sub: pid, fld: 'posting', ...extra })
    const b: any = bm[pid] || {}, a: any = am[pid] || {}
    const name = `Leave War · ${cs(pid)}`
    const bOut = b.to ? nextIso(String(b.to)) : null, aOut = a.to ? nextIso(String(a.to)) : null
    const aWord = OUTCOME_WORD[String(a.poOutcome || '')] || ''
    if (bOut !== aOut) {
      if (!bOut && aOut) logAction(null, `${name} · posting out ${dayWord(aOut)}${aWord ? ' · ' + aWord : ''}`, at(aOut))
      else if (bOut && !aOut) logAction(null, `${name} · posting out taken back · ${dayWord(bOut)}`, at(bOut))
      else if (bOut && aOut) logAction(null, `${name} · posting out changed · ${dayWord(bOut)} → ${dayWord(aOut)}${aWord ? ' · ' + aWord : ''}`, at(aOut, { wdate: bOut }))
    } else if (aOut && String(b.poOutcome || '') !== String(a.poOutcome || '')) {
      logAction(null, `${name} · posting out ${dayWord(aOut)} · outcome`, at(aOut, { from: OUTCOME_WORD[String(b.poOutcome || '')] || '—', to: aWord || '—' }))
    }
    const bIn = b.from ? String(b.from) : null, aIn = a.from ? String(a.from) : null
    if (bIn !== aIn) {
      if (!bIn && aIn) logAction(null, `${name} · posting in ${dayWord(aIn)}`, at(aIn))
      else if (bIn && !aIn) logAction(null, `${name} · posting in taken back · ${dayWord(bIn)}`, at(bIn))
      else if (bIn && aIn) logAction(null, `${name} · posting in changed · ${dayWord(bIn)} → ${dayWord(aIn)}`, at(aIn, { wdate: bIn }))
    }
  }
}
function ledgerLines(c: Change): void {
  /* ONE ENTRY PER CHANGE since the ledger went into small pieces ([OIL-AWARD-IS-A-GRANT], 29 Sep 26); an array is still
     read, entry by entry, so a change from before that shape says the same */
  const bl: any[] = Array.isArray(c.before) ? c.before : c.before ? [c.before] : []
  const al: any[] = Array.isArray(c.after) ? c.after : c.after ? [c.after] : []
  const bm = new Map(bl.map(r => [r.id, r])), am = new Map(al.map(r => [r.id, r]))
  const award = (e: any) => e && e.counter === 'oil' && +e.amount > 0
  const iso = (d: any) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)
  const at = (e: any) => ({ date: iso(e.date) ? e.date : localToday(), sect: 'abs', sub: String(e.personId || '') })
  /* AN OIL AWARD reads as it always did in the changes window — "Leave War · <him> · FO 9 Feb: OIL award given by …" —
     whichever door gave it, now with what it is worth (the amount, never worked back from its FO / HO label); any other
     entry by its counter as the app names it — OIL, ANNUAL, CCL … (D25: OIL) */
  const head = (e: any) => award(e)
    ? `Leave War · ${cs(e.personId)} · ${+e.amount === 0.5 ? 'HO' : 'FO'}${iso(e.date) ? ' ' + dayWord(e.date) : ''}`
    : `Leave War · ${cs(e.personId)} · ${String(e.counter || '').toUpperCase()} ${+e.amount > 0 ? '+' : ''}${e.amount}${iso(e.date) ? ' ' + dayWord(e.date) : ''}${e.reason ? ' — ' + e.reason : ''}`
  const worth = (e: any) => `${e.amount} ${+e.amount === 1 ? 'day' : 'days'}${e.reason ? ' — ' + e.reason : ''}${e.givenBy ? ' (given by ' + e.givenBy + ')' : ''}${iso(e.date) ? ' · ' + dayWord(e.date) : ''}`
  for (const e of al) {
    const o = bm.get(e.id)
    if (!o) logAction(null, award(e) ? `${head(e)}: OIL award given${e.givenBy ? ' by ' + e.givenBy : ''} · ${e.amount} ${+e.amount === 1 ? 'day' : 'days'}` : `${head(e)}: given`, at(e))
    /* a correction moved to another day shows on the day it left too (Fable F8; an award's day never moves — D260) */
    else if (!same(o, e)) logAction(null, award(e) ? `${head(e)}: OIL award changed` : `${head(e)}: changed`, { ...at(e), from: award(o) ? worth(o) : head(o), to: award(e) ? worth(e) : head(e), ...(o.date !== e.date && iso(o.date) ? { wdate: o.date } : {}) })
  }
  for (const e of bl) if (!am.has(e.id)) logAction(null, award(e) ? `${head(e)}: OIL award taken away` : `${head(e)}: taken away`, at(e))
}

/* ---- Quals ---- */
const PERSON_FIELDS: Record<string, string> = {
  cs: 'callsign', q: 'CAT', seat: 'seat', pers: 'ground crew', san: 'SANS', sxo: 'SXO', archived: 'archived', deleted: 'deleted',
}
const val = (v: any) => typeof v === 'boolean' ? (v ? 'yes' : 'no') : (v == null || v === '' ? '—' : String(v))
function personLines(c: Change, env?: CommitEnvelope): void {
  const b: any = c.before, a: any = c.after, pid = String(c.id)
  /* inside the posting command the archive and the SANS tick are what the POSTING made or took back — its own line says
     it (postoutLines; Astra's read of the fixes, 02) */
  const posting = !!env && env.type === 'lw.postout'
  const byPosting = (k: string) => posting && (k === 'archived' || k === 'san')
  if (a && a.special) return
  const at = { date: localToday(), sect: 'quals' }
  /* whose it is, by id, and what it is — "Quals · <him>" in the changes window ([CHG-BY-ITEM]; Fable F3, Astra 05) */
  if (!b && a) { logAction(null, `${a.cs || pid} · added to the roster`, { ...at, sub: pid, fld: 'roster' }); return }
  if (!a || !b) return
  /* absent, false and '' are the same "not set" — a tick added then cleared is no change */
  const norm = (v: any) => (v == null || v === false || v === '') ? null : v
  const qv = (v: any) => v === 'I' ? 'I (instructor)' : val(v)
  const seen = new Map<string, { from: string; to: string; fld: string }>()
  for (const k of Object.keys(PERSON_FIELDS)) {
    if (same(norm(b[k]), norm(a[k])) || byPosting(k)) continue
    seen.set(PERSON_FIELDS[k]!, { from: val(b[k]), to: val(a[k]), fld: k })
  }
  /* a qualification tick lives in the person's `quals` (Quals' own columns, named by their heading); a tick that is
     also a flag on the person (SANS, SXO) is said once */
  for (const q of qualCols()) {
    const x = b.quals && b.quals[q.k], y = a.quals && a.quals[q.k]
    if (same(norm(x), norm(y)) || seen.has(q.h) || byPosting(q.k)) continue
    seen.set(q.h, { from: qv(x), to: qv(y), fld: q.k })
  }
  const name = seen.has('callsign') ? val(b.cs) : (a.cs || pid)
  /* each line keeps WHOSE detail it was and WHICH, by id (sub, fld): the words carry the callsign of the day, and a later
     rename must not lose who changed it (the To go out tab reads these — ui/pendlist.ts qualsLine; Astra's final read, 03) */
  for (const [field, v] of seen) logAction(null, `${name} · ${field}`, { ...at, from: v.from, to: v.to, sub: pid, fld: v.fld })
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
    if (c.collection === 'insights.role') { const role=decodeRoleId(id); if(role) days.add(role.dayISO) }
    /* a day of a week — its content, or the warnings hidden on it (`sched.mutes/<wk>#<di>`, [WARN-HIDE-KEPT]) */
    if (c.collection === 'days' || c.collection === 'sched.mutes') { const [wk, di] = id.split('#'); try { const iso = dayIsoOf(wk!, +di!); if (iso) days.add(iso) } catch (_) { /* a malformed id names no day */ } }
    else if (c.collection === 'inputs' && id !== '__order') { addSpan(spanOf(c.before)); addSpan(spanOf(c.after)) }
    else if (c.collection === 'lw.cell') days.add(cellParts(id).date)
    /* a ledger entry's Undo / Redo lands on its own day (both old and new, for a correction moved) — Astra's round-2
       read R2-04, Fable's N4 */
    else if (c.collection === 'lw.ledger') for (const e of [c.before, c.after]) { const d = e && (e as any).date; if (typeof d === 'string') days.add(d) }
    else if (c.collection === 'sched.issuance' || c.collection === 'sched.retraction') { const m = /:(\d{4}-\d{2}-\d{2})#/.exec(id); if (m) days.add(m[1]) }
  }
  const sorted = [...days].filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort()
  const what = `${dir === 'undo' ? 'Undo' : 'Redo'}${entry.label ? ' — ' + entry.label : ''}`
  if (!sorted.length) {
    /* an Undo line only where its change wrote a line of its own (the change-recording plan §11.9, walker A2-F5): the
       roster, the war's ledger and its postings write theirs dated today (changeLinesFor below), so their Undo does too;
       a Leave War ⚙ setting, a stage move, a war's dates, a balance, the OIL policy and every settings record write none
       — until `[HIST-PER-PAGE]` gives Admin, Logic and the war's settings a place — so their Undo writes none either */
    const wrote = (entry.forward || []).some(c => c.collection === 'people' || c.collection === 'lw.ledger' || c.collection === 'lw.postouts')
    if (wrote) logAction(null, what, { date: localToday(), sect: 'day' })
    return
  }
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
    /* in a Leave War decision the approvals are read by the DAYS they cover (warInputLines) — which is also what tells
       the war's own side which request left because it was approved, and which came back because an approval was taken
       back, so neither is said twice */
    const wi: WarInputs = war ? warInputLines(env) : { said: new Set(), approvedFor: new Set(), backToBid: new Set() }
    for (const c of env.changes) {
      if (c.collection === 'insights.role') {
        const role=decodeRoleId(c.id)
        if (!role) continue
        let detail:any=null
        try { detail=JSON.parse(env.detail || 'null') } catch { /* a copy's enclosing command may carry other facts */ }
        const name=typeof detail?.name==='string'?detail.name.replace(/\s+/g,' ').trim().slice(0,80):role.formationRid
        const origin=typeof detail?.origin==='string'?detail.origin.slice(0,80):'copied with the day template'
        const side=(value:any)=>value?.side==='blue'?'Blue':value?.side==='red'?'Red':'Unresolved'
        logAction(null,`${name} · mission role · ${origin}`,{date:role.dayISO,sect:'day',sub:role.formationRid,fld:'mission-role',from:side(c.before),to:side(c.after)})
      }
      if (c.collection === 'inputs' && c.id !== '__order') { if (!wi.said.has(c)) inputLines(c, env, war) }
      else if (c.collection === 'lw.ledger') ledgerLines(c)
      else if (c.collection === 'lw.postouts') postoutLines(c, env)
      else if (c.collection === 'people') personLines(c, env)
    }
    /* A WARNING HIDDEN, OR FLAGGED AGAIN ([WARN-HIDE-KEPT], owner D469, 1 Oct 26). A hide is kept with its day for
       everyone "until another person unhides it" — so who hid it, and when, has to be answerable from the change
       history. One line, led by its item (D340), under "The day" (D346), written from the command's own words. */
    if (env.type === 'sched.warnMute') {
      const h = parseHideDetail((env as any).detail)
      if (h && env.changes.some(c => c.collection === 'sched.mutes'))
        logAction(h.di, `Warning · ${h.words}`, { sect: 'day', from: h.hidden ? 'flagged' : 'hidden', to: h.hidden ? 'hidden' : 'flagged again' })
    }
    if (war) warLines(env, wi.approvedFor, wi.backToBid)
    else crossLines(env)
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
