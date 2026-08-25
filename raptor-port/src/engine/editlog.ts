import { DAYS } from './data'
import { PEOPLE } from './people'
import { HOOKS } from './hooks'

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

export type ELogRow = {
  t: number           // wall clock at the moment of the edit
  who: string         // display name, from HOOKS.whoami()
  di: number | null   // which schedule day it landed on (null for a structural note)
  key: string         // the slot key, '' for a structural note
  lbl: string         // WHAT it was, in words — frozen at log time, see below
  from: string
  to: string
}

/* 400 rows. HIST caps at 60 because each of its entries is a whole serialised
   schedule; one of these is a handful of short strings, so the same memory
   buys far more of them. 400 covers a heavy day of planning (a full day built
   from nothing runs to a couple of hundred edits) and still cannot grow
   without bound in a tab left open for a week. Oldest falls off the end. */
export const ELOG: { rows: ELogRow[]; cap: number } = { rows: [], cap: 400 }

export function elogClear() { ELOG.rows.length = 0 }

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
  ELOG.rows.forEach(r => { if (r.key) { const m = move(r.key); r.key = m == null ? '' : m } })
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

/* a stored value as a reader would say it. '—' rather than an empty string,
   because "changed to nothing" has to be visible in a bubble. */
function say(key: string, v: any) {
  const s = String(v == null ? '' : v)
  if (!s) return '—'
  if (isPersonKey(key)) return PEOPLE[s] ? PEOPLE[s].cs : s
  return s
}

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

export function keyLabel(key: any): string {
  const k = String(key), c = k.indexOf(':')
  try {
    /* a flying seat: di.gi.li.ai.seat — named by the line it is in, then the
       jet, then the seat */
    if (c < 0) {
      const a = k.split('.')
      const f = DAYS[+a[0]].waves[+a[1]].formations[+a[2]]
      const seat = a[4] === 'p' ? 'FCP' : a[4] === 'w' ? 'RCP' : String(a[4] || '').toUpperCase()
      return `${f.cs || 'Line'} ${f.msn || ''}`.trim() + ` · ${jetOf(f, a[3])}${seat}`
    }
    const p = k.slice(0, c), a = k.slice(c + 1).split('.'), d = DAYS[+a[0]]
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

function push(row: ELogRow) {
  ELOG.rows.push(row)
  if (ELOG.rows.length > ELOG.cap) ELOG.rows.splice(0, ELOG.rows.length - ELOG.cap)
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
  const k = String(key)
  const a = say(k, from), b = say(k, to)
  if (a === b) return
  push({ t: Date.now(), who: HOOKS.whoami(), di: dayOf(k), key: k, lbl: keyLabel(k), from: a, to: b })
}

/* Record something that is not a value change — a line, wave, row or note
   added or removed. Those go through markEdit() with NO key on purpose (a
   delete must not re-mark the address it just removed), so there is nothing
   for logEdit to compare; the calling site names the action instead, in the
   same words its toast already uses. */
export function logAction(di: any, text: string) {
  push({ t: Date.now(), who: HOOKS.whoami(), di: di == null ? null : +di, key: '', lbl: text, from: '', to: '' })
}

/* newest first, optionally narrowed to one day — the listed view's whole
   data path. A copy, so a caller cannot sort the live log out of order. */
export function elogRows(di?: any): ELogRow[] {
  const rows = (di == null) ? ELOG.rows.slice() : ELOG.rows.filter(r => r.di === +di)
  return rows.reverse()
}

/* the newest entry for one detail — what the bubble shows collapsed */
export function elogFor(key: any): ELogRow | null {
  const k = String(key)
  for (let i = ELOG.rows.length - 1; i >= 0; i--) if (ELOG.rows[i]!.key === k) return ELOG.rows[i]!
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
  const k = String(key)
  return ELOG.rows.filter(r => r.key === k)
}

/* ONE ROW PER DETAIL for the grouped view (owner, 11 Aug 26), newest-touched
   first, each carrying its own changes oldest-first.

   A STRUCTURAL entry has no key, so it cannot be grouped with anything — a
   line removed and a wave added are different events that happen to share an
   empty address. Each stays its own group of one, keyed by its position in
   the log so two identical sentences never fold together. */
export type ELogGroup = { key: string; lbl: string; di: number | null; rows: ELogRow[]; last: number }
export function elogGroups(di?: any): ELogGroup[] {
  const src = (di == null) ? ELOG.rows : ELOG.rows.filter(r => r.di === +di)
  const by = new Map<string, ELogGroup>()
  src.forEach((r, i) => {
    const id = r.key || ` act${i}`
    let g = by.get(id)
    if (!g) { g = { key: r.key, lbl: r.lbl, di: r.di, rows: [], last: 0 }; by.set(id, g) }
    g.rows.push(r)
    /* the group's NAME is the newest one's — keyLabel is frozen per row, so a
       line renamed between two edits would otherwise head its own group with
       the name it has since stopped having */
    g.lbl = r.lbl; g.di = r.di; g.last = r.t
  })
  return [...by.values()].sort((a, b) => b.last - a.last)
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
export function elogWhen(t: number, _now?: number) {
  const d = new Date(t)
  const hm = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
  return `${d.getDate()}/${d.getMonth() + 1} ${hm}`
}
