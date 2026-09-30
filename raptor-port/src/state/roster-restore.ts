/* WHAT AN UNDO OR REDO OF A ROSTER OR SETTINGS STEP MUST RE-CHECK — the change-recording re-test, B5 (28 Sep 26).

   Owner, 16 Sep 26: "roster and settings edits ARE undoable" (register AM39d, narrowed by D350) — built by
   [UNDO-ROSTER-SETTINGS] on this branch. The timeline's own conflict test knows only "touches the same thing", and a
   roster restore can break rules that live between DIFFERENT records: a rename undone onto a callsign another man has
   taken since (D286 — two men on one callsign), an account change undone onto a list that no longer has an admin, an
   archived man's sign-in turned back on (D322). Each is refused whole, in the app's words, and the step stays next.

   ONE body, asked twice (the plan's §11.3, Astra's red team 2): before the view moves (undo-wire.ts restoreRefusal) and
   again INSIDE the restore, before anything is written (undo/timeline.ts applyRestore) — over the ONE combined candidate:
   every people and settings image the restore would write, laid over the roster and the accounts as they stand now.
   Never `accountsLoad`'s forgiving repair (it would hide the lock-out it quietly fixes).

   Role comparisons on account records stay in accounts.ts (perms-scan.test.ts): this module never compares a role. */
import { PEOPLE } from '../engine/people'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { stashKeys, stashGet } from '../engine/weekstash'
import { PLANPUCKS } from './plan'
import { accountsRestoreProblem, accountsAfter, requestsAfter } from './accounts'
import { getState as lwState } from '../leavewar/state/store'

const clone = (v: any) => (v == null ? v : JSON.parse(JSON.stringify(v)))
const lower = (s: any) => String(s ?? '').trim().toLowerCase()
const active = (p: any) => !!p && !p.archived && !p.deleted

/* the roster as the restore would leave it (a delete removes the record; a put replaces it) */
function candidatePeople(changes: any[]): Record<string, any> {
  const out: Record<string, any> = {}
  for (const id of Object.keys(PEOPLE)) out[id] = (PEOPLE as any)[id]
  for (const ch of changes) {
    if (!ch || ch.collection !== 'people') continue
    if (ch.op === 'delete') delete out[ch.id]
    else out[ch.id] = clone(ch.after)
  }
  return out
}

/* D286 (and PID-01, engine/people.ts callsignTakenBy): who else on the roster — or a placeholder, or any person's id —
   holds this callsign in the candidate roster */
function callsignHolder(roster: Record<string, any>, cs: string, selfId: string): string | null {
  const k = lower(cs)
  if (!k) return null
  for (const id of Object.keys(roster)) {
    if (id === selfId) continue
    const q = roster[id]
    if (!q || !(q.special || active(q))) continue
    if (lower(q.cs) === k) return id
  }
  const idHit = roster[cs] ? cs : roster[k] ? k : null
  return idHit && idHit !== selfId ? idHit : null
}

/* is a man still named anywhere that would outlive his record (the loaded week, a stored week, an input, the planning
   calendar, the war)? A belt: under D350 no step Undo takes removes a person (an add is not undone here), so this only
   guards a future lifting of it — fail closed. */
const holds = (v: any, id: string): boolean => { try { return JSON.stringify(v ?? null).includes(`"${id}"`) } catch (_e) { return true } }
function stillNamed(id: string): boolean {
  if (holds(DAYS, id)) return true
  for (const k of stashKeys()) if (holds(stashGet(k), id)) return true
  if ((INPUTS as any[]).some(r => r && String(r.person) === id)) return true
  if (PLANPUCKS.some(e => e && Array.isArray(e.ids) && e.ids.includes(id))) return true
  try { if (lwState().wars.some((w: any) => w && w.recs && w.recs[id])) return true } catch (_e) { return true }
  return false
}

export function rosterRestoreProblem(changes: any[], _dir: 'undo' | 'redo'): string | null {
  const people = (changes || []).filter(ch => ch && ch.collection === 'people')
  /* the accounts and the requests are one row each ([DB-READINESS] group A, phase 4.4): the candidate is what is stored
     now with this step's rows put back (accounts.ts accountsAfter — the seeded list when no account row would be left) */
  const next = accountsAfter(changes)
  const rq = requestsAfter(changes)
  if (!people.length && !next && !rq) return null
  const roster = candidatePeople(changes)
  /* 1. one callsign on the roster (D286, D295): a man whose callsign changes, or who comes back onto the roster */
  for (const ch of people) {
    if (ch.op === 'delete') continue
    const live = (PEOPLE as any)[ch.id], next = ch.after
    if (!next || !active(next)) continue
    const moved = !live || lower(live.cs) !== lower(next.cs) || !active(live)
    if (moved && callsignHolder(roster, next.cs, ch.id)) return `${String(next.cs).trim()} is taken on the roster now — rename one of them first.`
  }
  /* 3. a man the restore would remove is not still named somewhere (fail closed) */
  for (const ch of people) {
    if (ch.op !== 'delete') continue
    const live = (PEOPLE as any)[ch.id]
    if (live && stillNamed(ch.id)) return `${live.cs} is on the schedule, an input or the Leave War — take him off first.`
  }
  /* 2. the accounts — the write path's own guards, over the candidate (accounts.ts) */
  if (next || rq || people.length) {
    const bad = accountsRestoreProblem(next, rq, roster)
    if (bad) return bad
  }
  return null
}
