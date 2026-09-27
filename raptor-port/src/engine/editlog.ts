import { DAYS } from './data'
import { PEOPLE } from './people'
import { HOOKS, store } from './hooks'
import { ridKey, posKey } from './rowids'
import { CURWEEK } from './waves'
import { dayIso } from './verid'

/* THE EDIT LOG (owner, 11 Aug 26) — who changed which detail, when, and what
   it was before. The board's History toggle reads it two ways: a bubble on
   one detail, and a listed view of the lot in time order.

   WHAT IT IS NOT, and the owner was told so before it was built: this is a
   session log, not an audit trail. The schedule itself lives in one browser
   and clears on reload (HANDOFF's first bullet — no shared data), so the log
   can only hold what was typed on THIS device since login, and `who` is
   whoever is logged in here. The day the app gains a server, `HOOKS.whoami`
   starts returning other people's names and nothing else here changes; that
   is the whole reason the name arrives through a hook rather than being read
   from the session directly (the engine must stay free of state/).

   It is deliberately NOT in histSnap(): an undo restores the schedule, it
   does not un-happen. Undoing a change leaves its entry standing and adds
   nothing new — the log records what a person did, and pressing undo is
   itself something a person did to the schedule, not to the record of it.
   A log you can rewrite by pressing undo is not a log. */

/* THE CHANGE HISTORY ([DRAFT-PENDING], 28 Sep 26 — D168, D170, D336 (b)). The session log above grew into the
   squadron's change history, which the one changes window reads:
   - DURABLE: saved through the settings store (`elog`) and loaded at boot, and NO LONGER cleared at sign-in or
     sign-out (D336 (b), built on yes and put on his look card) — the history is the squadron's record, shared by
     everyone on the browser; what is NEW is per person (state/changes.ts). Still OUTSIDE undo, as it always was:
     written raw, never a command-layer record, so the global undo never rewinds it. Until the database another
     device never sees these lines (one browser per store) — said here, never on screen.
   - WEEK-SAFE: every line keeps its CALENDAR day (`date`, ISO), taken when it is written. `di` alone named a day of
     whichever week was loaded, so a Monday line made on the week of 13 Jul showed under 20 Jul's Monday too.
   - `seq` — a number that only rises, kept across a reload: the line's identity, what "new to you" points at.
   - `end` — the last day of an absence line that spans days; `iid` — the input a line is about. */
export type ELogRow = {
  seq: number         // the line's identity: only rises, kept across a reload
  t: number           // wall clock at the moment of the edit
  who: string         // display name, from HOOKS.whoami() -- the signed-in callsign since [ACCOUNTS]
  pid?: string | null  // the person behind it (HOOKS.whoamiId), so the changes window can draw a renamed callsign live
  di: number | null   // which day of the week LOADED at the time it landed on (null for a note with no day)
  date: string | null // the calendar day (ISO) it is on — the week it belongs to; null for a line with no day
  end?: string        // the last calendar day, for a line that spans days (an absence)
  wdate?: string      // the span BEFORE the change, when it moved (Astra DP-05): an absence moved from 1–2 Aug to 6–7 Aug
  wend?: string       //   shows on both spans, never on the days between
  iid?: string        // the input the line is about (an absence line)
  iids?: string[]     // EVERY input the line is about, when more than one (a war move files the moved day as a new record —
                      //   the line keeps the one it left too, so "To go out" finds it by id: Astra's round-3 read, R3-02)
  days?: string[]     // the EXACT days after, when they are not one run (a gap day between is untouched — R3-03)
  wdays?: string[]    //   and before
  sub?: string        // the PERSON a Quals line is about, by his id (a rename never loses it — Astra's final read, 03)
  fld?: string        //   and which of his details (q, seat, pers, san, sxo, archived, deleted, cs, or a qualification's key)
  sect?: string       // the part of the day a line with no key belongs to (Group by Where — ui/changesmodel.ts sectionOf)
  key: string         // the slot key, '' for a structural note
  lbl: string         // WHAT it was, in words — frozen at log time, see below
  from: string
  to: string
}

/* 2,000 rows (was 400 while the log lived only as long as the tab). One row is a handful of short strings; 2,000 of
   them is a few hundred KB in the browser's store beside the weeks — a busy fortnight of several schedulers. The
   oldest leave first; the database keeps the history properly, with its own retention. */
export const ELOG: { rows: ELogRow[]; cap: number; next: number } = { rows: [], cap: 2000, next: 1 }

/* test and admin-sweep helper: the in-memory list emptied (the saved record follows on the next save). A sign-out
   no longer calls it (D336 (b)). */
export function elogClear() { ELOG.rows.length = 0; ELOG.next = 1 }

/* the calendar day of a day index of the week loaded NOW — taken at write time, so a week switch never moves it */
export function dateOfDi(di: number | null | undefined): string | null {
  if (di == null || !Number.isFinite(+di) || +di < 0 || +di > 6) return null
  try { return dayIso(CURWEEK, +di) } catch (_) { return null }
}

/* today's calendar day, in the browser's own time — the day a line with no schedule day of its own is on (a roster
   change, the history cleared) */
export function todayIso(): string {
  const d = new Date(), p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/* does a line cover this calendar day? (an absence line covers every day from `date` to `end`, and — when it moved —
   every day of the span it came from, `wdate` to `wend`; never the days between the two. When its days are not one run
   it keeps them exactly — `days`, `wdays` — and only those count: a gap day between is untouched, Astra's round-3 read) */
const inSpan = (a: string | null | undefined, b: string | null | undefined, iso: string) =>
  !!a && a <= iso && iso <= (b && b > a ? b : a)
export function rowTouches(r: { date: string | null; end?: string; wdate?: string; wend?: string; days?: string[]; wdays?: string[] }, iso: string): boolean {
  return (r.days ? r.days.includes(iso) : inSpan(r.date, r.end, iso)) || (r.wdays ? r.wdays.includes(iso) : inSpan(r.wdate, r.wend, iso))
}
const spanMeets = (a: string | null | undefined, b: string | null | undefined, lo: string, hi: string) =>
  !!a && a <= hi && (b && b > a ? b : a) >= lo

/* the seven calendar days of a week key ('dd/mm/yyyy', its Monday) */
export function weekDates(weekKey: string = CURWEEK): string[] {
  const out: string[] = []
  for (let i = 0; i < 7; i++) { try { out.push(dayIso(weekKey, i)) } catch (_) { /* a malformed key reads no days */ } }
  return out
}

/* every line on any day of a week, NEWEST FIRST — the changes window's whole data path for a week */
export function elogWeekRows(weekKey: string = CURWEEK): ELogRow[] {
  const days = weekDates(weekKey)
  if (!days.length) return []
  const lo = days[0]!, hi = days[6]!
  return ELOG.rows.filter(r => spanMeets(r.date, r.end, lo, hi) || spanMeets(r.wdate, r.wend, lo, hi)).reverse()
}

/* ---- saving and loading (D336 (b)) ----
   One write per burst of edits, never per keystroke: a save is queued on the microtask queue and every line pushed in
   the same run of the page rides it. `elogFlush` writes at once (a sign-out, a page hide, the tests). */
let SAVE_QUEUED = false
export function elogFlush(): void {
  SAVE_QUEUED = false
  store.set('elog', { v: 1, next: ELOG.next, rows: ELOG.rows })
}
function queueSave() {
  if (SAVE_QUEUED) return
  SAVE_QUEUED = true
  Promise.resolve().then(() => { if (SAVE_QUEUED) elogFlush() })
}
const str = (v: any) => (typeof v === 'string' ? v : '')
const isoOk = (v: any) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)
/* read the saved history back (boot). Read defensively and never written back here: a line missing its identity or
   its time is dropped, the rest keep their order by number. */
export function elogLoad(): void {
  const raw = store.get('elog', null)
  const rows: ELogRow[] = []
  let top = 0
  for (const x of (raw && Array.isArray(raw.rows)) ? raw.rows : []) {
    if (!x || !Number.isFinite(x.seq) || !Number.isFinite(x.t)) continue
    const r: ELogRow = {
      seq: +x.seq, t: +x.t, who: str(x.who), pid: typeof x.pid === 'string' ? x.pid : null,
      di: Number.isFinite(x.di) ? +x.di : null, date: isoOk(x.date) ? x.date : null,
      key: str(x.key), lbl: str(x.lbl), from: str(x.from), to: str(x.to),
    }
    if (isoOk(x.end)) r.end = x.end
    if (isoOk(x.wdate)) { r.wdate = x.wdate; if (isoOk(x.wend)) r.wend = x.wend }
    if (typeof x.iid === 'string' && x.iid) r.iid = x.iid
    if (typeof x.sect === 'string' && x.sect) r.sect = x.sect
    if (typeof x.sub === 'string' && x.sub) { r.sub = x.sub; if (typeof x.fld === 'string' && x.fld) r.fld = x.fld }
    const strs = (v: any, ok: (s: string) => boolean) => Array.isArray(v) ? v.filter((s: any) => typeof s === 'string' && ok(s)) : []
    const ids = strs(x.iids, s => !!s), ds = strs(x.days, isoOk), ws = strs(x.wdays, isoOk)
    if (ids.length > 1) r.iids = ids
    if (ds.length) r.days = ds
    if (ws.length) r.wdays = ws
    rows.push(r)
    if (r.seq > top) top = r.seq
  }
  rows.sort((a, b) => a.seq - b.seq)
  ELOG.rows.length = 0
  rows.slice(-ELOG.cap).forEach(r => ELOG.rows.push(r))
  ELOG.next = Math.max(top + 1, Number.isFinite(raw && raw.next) ? +raw.next : 1)
}

/* A COMMAND THAT IS REFUSED LEAVES NO LINE. A line written while a command runs is held and kept only if the command
   commits (the command layer's latch — command/latch.ts names logEdit/logAction among the effects it holds). The
   engine cannot import the command layer, so the state layer installs the deferral here (state/store.ts wireStore);
   headless, every line is written at once, as before. */
let DEFER: ((fn: () => void) => boolean) | null = null
export function setElogDefer(fn: ((fn: () => void) => boolean) | null) { DEFER = fn }

/* THE ADMIN SWEEP (owner, 25 Aug 26 — "clear the history of edits. On specific
   dates or a range or from this day till history onwards"). Bounds are wall
   clock ms, [lo, hi) — either side null for open-ended. The CALLER turns
   calendar dates into LOCAL midnights, because the list prints local dates
   (elogWhen) and an entry cleared "on 25/8" must be one the list showed as
   25/8. Engine-pure on purpose: the role gate and the period grammar live at
   the one funnel in ui/inputedit.tsx, the same split the data sweep uses.
   NOT undoable and not snapshot-carried — the log was never in histSnap (see
   the header above), so clearing it is permanent, which is exactly what the
   Admin panel's wording promises. */
export function elogSweep(lo: number | null, hi: number | null, dry?: boolean): number {
  const keep = ELOG.rows.filter(r => !((lo == null || r.t >= lo) && (hi == null || r.t < hi)))
  const n = ELOG.rows.length - keep.length
  if (dry || !n) return n
  ELOG.rows.length = 0
  keep.forEach(r => ELOG.rows.push(r))
  queueSave()
  return n
}

/* THE LOG'S ADDRESSES MOVE WITH THE KEY SPACE (audit, 12 Aug 26). A delete
   or reorder renumbers every index-addressed key — keys.ts rewrites pending,
   changes, added and the issued ALs, and until this hook it left ELOG alone,
   so an old row kept its BIRTH key forever: the changes list then jumped to
   whatever row had slid into that address and pinned one man's history onto
   another, while the row that really held the edit answered hover with
   nothing. keys.ts calls this with the same `move` it applies to the
   amendment book, so the two can never drift again.
   `move` returning null means the addressed row itself was deleted: the key
   is dropped and the entry becomes a plain keyless row — still listed (what
   was typed is still true), just no longer a jump, exactly like a
   structural sentence. The deletion's own "what it held" line sits beside
   it in the list. */
export function elogRemap(move: (k: any) => any) {
  let any = false
  ELOG.rows.forEach(r => { if (r.key) { const m = move(r.key); const k = m == null ? '' : m; if (k !== r.key) { r.key = k; any = true } } })
  if (any) queueSave()
}

/* Which keys address a PERSON rather than text — a flying seat carries no
   prefix, and d:/s:/g:/a: are the duty, sim, ground and programme crews.
   Everything else in the grammar is a typed field. Parsing the key beats
   testing whether the value happens to be in PEOPLE: a scheduler can type
   "bane" into a remarks box, and that must not print as a callsign. */
/* keys.ts's keyDay does exactly this, and is deliberately not imported: keys.ts
   imports publish.ts for SCHED, and publish.ts calls in here, so taking the
   import would close a three-module load cycle to save two lines. */
function dayOf(key: string) {
  const c = key.indexOf(':')
  const n = parseInt((c < 0 ? key : key.slice(c + 1)).split('.')[0]!, 10)
  return (Number.isFinite(n) && n >= 0 && n < DAYS.length) ? n : null
}

const PERSON_PFX = ['d', 's', 'g', 'a']
function isPersonKey(key: string) {
  const c = key.indexOf(':')
  return c < 0 ? true : PERSON_PFX.includes(key.slice(0, c))
}

/* a stored value as the log KEEPS it. '—' rather than an empty string, because "changed to nothing" has to be visible
   in a bubble. A person key keeps the PERSON'S ID, never his callsign of the day ([DRAFT-PENDING], Fable F4, 28 Sep 26):
   the history is durable now, and a callsign can be renamed or — once its man is archived — given to someone new (D286),
   so a frozen callsign would read months of old lines as the wrong man. Readers say it through `elogVal`. */
function say(key: string, v: any) {
  const s = String(v == null ? '' : v)
  if (!s) return '—'
  return s
}
/* a line's before or after, as a reader should see it NOW: a person key's value is a person, named by his live callsign
   (the elogWho pattern); anything else as typed. A value the roster does not hold reads as stored. */
export function elogVal(r: { key: string; from: string; to: string }, side: 'from' | 'to'): string {
  const v = r[side]
  if (!v || v === '—' || !r.key || !isPersonKey(r.key)) return v
  return (PEOPLE as any)[v] ? String((PEOPLE as any)[v].cs) : v
}
export { isPersonKey }

/* WHAT the changed detail is called, in plain words — "MONSOON 1 · FCP",
   "Duty · SOF", "Ground · MASS BRIEF · start".

   Computed at LOG time and frozen into the row, never derived when the list
   renders. The row it names can be deleted a minute later, and re-deriving
   then would either throw or print the wrong row's name once the indices
   below it shift up. The key is kept alongside for the bubble to match on;
   the words are the record.

   state/view.ts's slotTitle() answers a similar question for the arm
   picker's title, and is deliberately NOT reused: it emits HTML with inline
   styles, it covers only the seat and crew keys, and it lives in state/,
   which the engine cannot import. If a third caller ever wants this, merge
   THAT one into this — not the other way round. */
const TXT_FLD: any = {
  cs: 'callsign', msn: 'mission', to: 'take-off', ld: 'land', br: 'brief',
  str: 'start', end: 'end', prog: 'item', sub: 'detail', role: 'role',
  label: 'label', rmks: 'remarks',
}
const NOTE_LBL: any = {
  dn: 'Day note', sn: 'Sim notes', pn: 'Programme notes',
  dtn: 'Duty notes', gn: 'Ground notes',
}

/* WHICH JET of a line, for the four keys that address one aircraft rather than
   the formation — a flying seat, `fr:` remarks and `st:` stores. Two seats in
   one formation printed identically before (11 Aug 26): the demo Monday opens
   with two "VL BFM" lines of two jets each, so "VL BFM · FCP" and "VL · stores"
   each named four different details. The bubble was never wrong — it matches on
   the key — but the changes list is the surface you read after the fact.
   Empty where there is nothing to tell apart, so a single-ship reads as it
   always did, and empty on a formation that has gone (the caller is inside the
   try, and a missing line falls through to 'Schedule' as before). */
function jetOf(f: any, ai: any) {
  return (f && (f.aircraft || []).length > 1) ? `#${+ai + 1} ` : ''
}

/* `days` (25 Sep 26): which day list to read the names from — the live DAYS by default; the pending list
   (ui/pendlist.ts) names a REMOVED row from the issued version it was removed from, where it still stands */
export function keyLabel(key: any, days: any[] = DAYS): string {
  /* accepts EITHER key form (Fable #7): the stored log key is rid-anchored,
     but this reads live rows by position, so resolve a rid key to its current
     positional address first. A note / positional / gone-row key is unchanged
     by posKey (a gone row → null → keep the raw key, which falls through to the
     'Schedule' fallback below). */
  const pk = posKey(key, days)
  const k = String(pk == null ? key : pk), c = k.indexOf(':')
  try {
    /* a flying seat: di.gi.li.ai.seat — named by the line it is in, then the
       jet, then the seat */
    if (c < 0) {
      const a = k.split('.')
      const f = days[+a[0]].waves[+a[1]].formations[+a[2]]
      const seat = a[4] === 'p' ? 'FCP' : a[4] === 'w' ? 'RCP' : String(a[4] || '').toUpperCase()
      return `${f.cs || 'Line'} ${f.msn || ''}`.trim() + ` · ${jetOf(f, a[3])}${seat}`
    }
    const p = k.slice(0, c), a = k.slice(c + 1).split('.'), d = days[+a[0]]
    const fld = (n: number) => TXT_FLD[a[n]] ? ` · ${TXT_FLD[a[n]]}` : ''
    if (NOTE_LBL[p]) return NOTE_LBL[p]
    if (p === 'd') return `Duty · ${d.dutywaves[+a[1]].rows[+a[2]].role || 'row'}`
    if (p === 'dl') return `Duty block · ${d.dutywaves[+a[1]].label || 'label'}`
    if (p === 'dr') return `Duty · ${d.dutywaves[+a[1]].rows[+a[2]].role || 'row'}${fld(3)}`
    if (p === 's') return `Sim · ${String(a[1]).toUpperCase()} ${d.sims[a[1]][+a[2]].label || ''}`.trim()
    if (p === 'sr') return `Sim · ${String(a[1]).toUpperCase()} ${d.sims[a[1]][+a[2]].label || ''}`.trim() + fld(3)
    if (p === 'g') return `Ground · ${d.ground[+a[1]].prog || 'row'}`
    if (p === 'gr') return `Ground · ${d.ground[+a[1]].prog || 'row'}${fld(2)}`
    if (p === 'a') return `Programme · ${d.allhands[+a[1]].prog || 'row'}`
    if (p === 'ap') return `Programme · ${d.allhands[+a[1]].prog || 'row'}${fld(2)}`
    if (p === 'wl') return `Wave · ${d.waves[+a[1]].label || 'label'}`
    const f = () => d.waves[+a[1]].formations[+a[2]]
    if (p === 'ff') return `${f().cs || 'Line'}${fld(3)}`
    /* fr: and st: are per-AIRCRAFT (…li.ai), unlike ff:/ar:/at: above and
       below, which address the formation — so these two carry the jet */
    if (p === 'fr') return `${f().cs || 'Line'} · ${jetOf(f(), a[3])}remarks`
    if (p === 'it') return `${d.waves[+a[1]].label || 'Wave'} · in-times`
    if (p === 'st') return `${f().cs || 'Line'} · ${jetOf(f(), a[3])}stores`
    if (p === 'ar') return `${f().cs || 'Line'} · area`
    if (p === 'at') return `${f().cs || 'Line'} · area time`
    if (p === 'tr') return `${d.waves[+a[1]].label || 'Wave'} · traffic`
  } catch (_) {}
  return 'Schedule'
}

/* the one writer: numbers the line, keeps the newest `cap`, and queues the save. Held while a command runs (DEFER) —
   the number is given when the line is KEPT, so a refused command burns none and the order is the order kept. */
function push(row: Omit<ELogRow, 'seq'>) {
  const keep = () => {
    ELOG.rows.push({ ...row, seq: ELOG.next++ } as ELogRow)
    if (ELOG.rows.length > ELOG.cap) ELOG.rows.splice(0, ELOG.rows.length - ELOG.cap)
    queueSave()
  }
  if (DEFER && DEFER(keep)) return
  keep()
}

/* Record one value change. Called from the two choke points every schedule
   write already passes through — noteChange() in slots.ts and markEdit() in
   publish.ts — and only when the caller hands over both values. That is what
   keeps the log free of noise: afterSchedMutate()'s bare markEdit() epilogue
   fires after EVERY mutation and carries no key, and the structural
   markEdit(key) calls that follow an add carry a key but no values. Neither
   reaches here, so neither leaves a phantom row. */
export function logEdit(key: any, from: any, to: any) {
  if (key == null || from === undefined || to === undefined) return
  /* stored rid-anchored, so a delete or reorder never renumbers the log's
     addresses (keys.ts is inert on a rid key) and elogFor/elogAllFor find the
     row by translating the query in. say() only reads the prefix, and keyLabel
     accepts either form, so both take the incoming key. The log is session-only
     and never migrated, so an id-less row simply logs its positional key. */
  const store = String(ridKey(key, DAYS))
  const a = say(store, from), b = say(store, to)
  if (a === b) return
  /* a person key compares by person: the same man stored once as his id and once as a legacy callsign is no change */
  if (isPersonKey(store) && elogVal({ key: store, from: a, to: b }, 'from') === elogVal({ key: store, from: a, to: b }, 'to')) return
  const di = dayOf(store)
  push({ t: Date.now(), who: HOOKS.whoami(), pid: HOOKS.whoamiId(), di, date: dateOfDi(di), key: store, lbl: keyLabel(key), from: a, to: b })
}

/* Record something that is not a value change — a line, wave, row or note
   added or removed. Those go through markEdit() with NO key on purpose (a
   delete must not re-mark the address it just removed), so there is nothing
   for logEdit to compare; the calling site names the action instead, in the
   same words its toast already uses. */
/* `at` (28 Sep 26, [DRAFT-PENDING]): a line with no day of the loaded week names its own calendar days — an absence
   (an input, a Leave War record) is on ITS dates, which may lie in any week; `iid` names the input it is about. */
export type LineAt = {
  date?: string | null; end?: string | null; wdate?: string | null; wend?: string | null
  iid?: string | null; key?: string; sect?: string; from?: string; to?: string; sub?: string; fld?: string
  iids?: string[]; days?: string[]; wdays?: string[]
}
export function logAction(di: any, text: string, at?: LineAt) {
  const d = di == null ? null : +di
  const date = at && at.date ? at.date : dateOfDi(d)
  const row: Omit<ELogRow, 'seq'> = {
    t: Date.now(), who: HOOKS.whoami(), pid: HOOKS.whoamiId(), di: d, date, key: (at && at.key) || '', lbl: text,
    from: (at && at.from) || '', to: (at && at.to) || '',
  }
  if (at && at.end && date && at.end > date) row.end = at.end
  if (at && at.wdate && (at.wdate !== date || (at.wend || at.wdate) !== (row.end || date))) {
    row.wdate = at.wdate
    if (at.wend && at.wend > at.wdate) row.wend = at.wend
  }
  if (at && at.iid) row.iid = at.iid
  if (at && at.sect) row.sect = at.sect
  if (at && at.sub) { row.sub = at.sub; if (at.fld) row.fld = at.fld }
  if (at && at.iids && at.iids.length > 1) row.iids = at.iids.slice()
  if (at && at.days && at.days.length) row.days = at.days.slice()
  if (at && at.wdays && at.wdays.length) row.wdays = at.wdays.slice()
  push(row)
}

/* newest first, optionally narrowed to one day — the listed view's whole
   data path. A copy, so a caller cannot sort the live log out of order. */
/* one day = that CALENDAR day of the loaded week (a line keeps its date; its weekday index alone would match the same
   weekday of every week — Fable's final read, F9) */
const onDay = (r: ELogRow, di: number) => { const iso = dateOfDi(di); return iso ? rowTouches(r, iso) : r.di === di }
export function elogRows(di?: any): ELogRow[] {
  const rows = (di == null) ? ELOG.rows.slice() : ELOG.rows.filter(r => onDay(r, +di))
  return rows.reverse()
}

/* the newest entry for one detail — what the bubble shows collapsed */
/* a line is about the loaded week's copy of a detail only when its calendar day is that day of the loaded week — a
   positional or note key ('dn:0.0') would otherwise match the same weekday of every week */
function onLoadedDay(r: ELogRow, k: string): boolean {
  if (r.date == null) return true
  const di = dayOf(k)
  return di == null || r.date === dateOfDi(di)
}
export function elogFor(key: any): ELogRow | null {
  const k = String(ridKey(key, DAYS))            // translate the DOM key in — the log stores rid keys
  for (let i = ELOG.rows.length - 1; i >= 0; i--) { const r = ELOG.rows[i]!; if (r.key === k && onLoadedDay(r, k)) return r }
  return null
}

/* EVERY entry for one detail, OLDEST FIRST — the expanded bubble and an
   unfolded group in the list (owner, 11 Aug 26: "it will show every change
   related to that"). Oldest first because this one is a story rather than a
   feed: you read how the detail got to where it is, and the last line is what
   it says now. The flat list stays newest-first, which is the opposite and
   deliberately so — that answers "what just happened", this answers "how did
   this end up like this". */
export function elogAllFor(key: any): ELogRow[] {
  const k = String(ridKey(key, DAYS))            // translate the DOM key in — the log stores rid keys
  return ELOG.rows.filter(r => r.key === k && onLoadedDay(r, k))
}

/* ONE ROW PER DETAIL for the grouped view (owner, 11 Aug 26), newest-touched
   first, each carrying its own changes oldest-first.

   A STRUCTURAL entry has no key, so it cannot be grouped with anything — a
   line removed and a wave added are different events that happen to share an
   empty address. Each stays its own group of one, keyed by its position in
   the log so two identical sentences never fold together. */
export type ELogGroup = { key: string; lbl: string; di: number | null; rows: ELogRow[]; last: number; lastIx: number }
export function elogGroups(di?: any): ELogGroup[] {
  const src = (di == null) ? ELOG.rows : ELOG.rows.filter(r => onDay(r, +di))
  const by = new Map<string, ELogGroup>()
  src.forEach((r, i) => {
    const id = r.key || ` act${i}`
    let g = by.get(id)
    if (!g) { g = { key: r.key, lbl: r.lbl, di: r.di, rows: [], last: 0, lastIx: -1 }; by.set(id, g) }
    g.rows.push(r)
    /* the group's NAME is the newest one's — keyLabel is frozen per row, so a
       line renamed between two edits would otherwise head its own group with
       the name it has since stopped having */
    g.lbl = r.lbl; g.di = r.di; g.last = r.t; g.lastIx = i
  })
  /* NEWEST-TOUCHED FIRST, DETERMINISTICALLY (13 Sep 26): order by the newest
     row's POSITION in the log, not its wall-clock stamp. Edits made in one tick
     can share a millisecond, and a ms-tie left the order to depend on how fast
     the loop ran — a flake once the per-edit work grew (a note takes a rid at
     each baseline). The log is appended in edit order, so lastIx is exact
     recency and never ties. `last` is kept for the display stamp only. */
  return [...by.values()].sort((a, b) => b.lastIx - a.lastIx)
}

/* "11/8 14:32" — ALWAYS the date, day/month, then the clock (owner, 11 Aug 26:
   "There is no date stated on the change too like for e.g 11/8").

   It used to print the clock alone for anything changed today and add the date
   only once that stopped being true, on the reasoning that a scheduler working
   a day does not need telling twice that it is still today. The owner asked
   for the date outright, and he is right for a reason worth writing down: the
   log is stamped with a WALL clock but the rows are about SCHEDULE days, so a
   bare "14:32" beside "Monday" invites reading it as 14:32 on the Monday being
   planned. The date removes that, and a tab left open past midnight stops
   silently relabelling yesterday's work as today's.
   `now` is still taken for the tests; nothing reads it any more. */
/* WHO made a change, by his LIVE callsign ([ACCOUNTS] — D166 (5) and the one-identity rule;
   Fable's code read, 26 Sep 26): read through the person the row keeps, so a rename since is
   followed, as every other list follows it; the name as recorded only when the row has none. */
export function elogWho(r: { who?: any; pid?: string | null }): string {
  return String((r.pid && (PEOPLE as any)[r.pid] && (PEOPLE as any)[r.pid].cs) || r.who || '')
}
export function elogWhen(t: number, _now?: number) {
  const d = new Date(t)
  const hm = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
  return `${d.getDate()}/${d.getMonth() + 1} ${hm}`
}
