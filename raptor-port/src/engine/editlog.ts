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

/* the newest entry for one detail — what the bubble shows */
export function elogFor(key: any): ELogRow | null {
  const k = String(key)
  for (let i = ELOG.rows.length - 1; i >= 0; i--) if (ELOG.rows[i]!.key === k) return ELOG.rows[i]!
  return null
}

/* "14:32" for something changed today, "11 Aug 14:32" for anything older.
   The owner asked for the date and time abbreviated; a scheduler working a
   day does not need to be told twice that it is still today, and the date
   appears the moment it stops being true. */
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export function elogWhen(t: number, now?: number) {
  const d = new Date(t), n = new Date(now == null ? Date.now() : now)
  const hm = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
  const sameDay = d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate()
  return sameDay ? hm : `${d.getDate()} ${MON[d.getMonth()]} ${hm}`
}
