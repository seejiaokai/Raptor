/* [ARCH-STACK] Step 3 — pure derivations for the undo timeline: record→context,
   record→owner, the inverse of a change list, and the §4.3/§8.1 key-family test.

   All PURE: they read a closure's Change[] and its record ids, nothing live. That
   keeps them unit-testable without the store singletons and keeps the timeline's
   hot path allocation-light.
*/
import type { Change, LogicalCollection } from '../command'
import type { RecordCtx, RecordOwner, Module } from './types'

export function recordKey(c: { collection: string; id: string }): string {
  return `${c.collection}/${c.id}`
}

/* ---- context derivation (§8.1) ------------------------------------------- */

const WEEK_COLLS = new Set<string>([
  'days', 'sched.book', 'sched.mutes', 'sched.orig', 'sched.als', 'sched.retired', 'weekstash',
])

/* the week a scheduler record belongs to. Every scheduler-week key is `<wk>`,
   `<wk>#<di>` or `<wk>:<rest>`, so the week is the head before the first ':' or
   '#'. */
export function weekOf(collection: string, id: string): string | null {
  return WEEK_COLLS.has(collection) ? id.split(/[:#]/)[0] : null
}

/* the war a Leave War record belongs to. lw.cell/lw.bid ids are
   `<warId>:<pid>:<date>`; lw.war id IS the warId. The lw ledger/postouts/config
   `all` globals name no war. */
export function warOf(collection: string, id: string): string | null {
  if (collection === 'lw.war') return id
  if (collection === 'lw.cell' || collection === 'lw.bid') return id.split(':')[0]
  return null
}

/* the course a Tracker record belongs to. Course-scoped keys are
   `v3:<course>:<rest…>` (≥3 segments); the global lists (`v3:courses`,
   `v3:sylcat`, …) are 2 segments and name no course. */
export function courseOf(collection: string, id: string): string | null {
  if (!collection.startsWith('trk.')) return null
  const p = id.split(':')
  return p.length >= 3 ? p[1] : null
}

const MODULE_OF_COLL = (collection: string): Module => {
  if (collection === 'inputs') return 'inputs'
  if (collection === 'plan') return 'plan'
  if (collection === 'people') return 'people'
  if (collection === 'settings') return 'settings'
  if (collection.startsWith('lw.')) return 'lw'
  if (collection.startsWith('trk.')) return 'trk'
  return 'sched'
}

/* derive the deduped set of storage contexts a closure touched. */
export function deriveContexts(closure: Change[]): RecordCtx[] {
  const seen = new Set<string>()
  const out: RecordCtx[] = []
  const add = (c: RecordCtx) => {
    const k = c.kind === 'page' ? `page:${c.module}` : `${c.kind}:${(c as any)[c.kind + 'Id']}`
    if (!seen.has(k)) { seen.add(k); out.push(c) }
  }
  for (const ch of closure) {
    const wk = weekOf(ch.collection, ch.id)
    if (wk) { add({ kind: 'week', weekId: wk }); continue }
    const war = warOf(ch.collection, ch.id)
    if (war) { add({ kind: 'war', warId: war }); continue }
    const course = courseOf(ch.collection, ch.id)
    if (course) { add({ kind: 'course', courseId: course }); continue }
    add({ kind: 'page', module: MODULE_OF_COLL(ch.collection) })
  }
  return out
}

/* ---- ownership derivation (§5) ------------------------------------------- */

/* the owning personId of a single change, or null for the no-owner classes.
   inputs/__order is handled at the closure level (union) — this returns null for
   it. */
function ownerOfChange(ch: Change): string | null {
  const { collection, id } = ch
  if (collection === 'lw.cell' || collection === 'lw.bid') {
    // `<warId>:<pid>:<date>` — the pid is the second field FROM THE RIGHT (a warId
    // may itself contain ':', so never split from the left — R3-03/R3-08).
    const p = id.split(':')
    return p.length >= 3 ? p[p.length - 2] : null
  }
  if (collection === 'inputs') {
    if (id === '__order') return null
    const rec = (ch.after ?? ch.before) as any
    return rec && rec.person != null ? String(rec.person) : null
  }
  if (collection === 'people') return id
  return null
}

/* per-change ownership for a whole closure. inputs/__order carries the UNION of
   the owners of the input records present in the same closure (§5): one
   RecordOwner entry per distinct owner, so mayReverse's `.every()` requires the
   member to own them ALL. */
export function deriveOwners(closure: Change[]): RecordOwner[] {
  const inputOwners = new Set<string>()
  for (const ch of closure) {
    if (ch.collection === 'inputs' && ch.id !== '__order') {
      const o = ownerOfChange(ch)
      if (o) inputOwners.add(o)
    }
  }
  const owners: RecordOwner[] = []
  for (const ch of closure) {
    if (ch.collection === 'inputs' && ch.id === '__order') {
      const key = recordKey(ch)
      if (inputOwners.size === 0) owners.push({ key, person: null })
      else for (const p of inputOwners) owners.push({ key, person: p })
    } else {
      owners.push({ key: recordKey(ch), person: ownerOfChange(ch) })
    }
  }
  return owners
}

/* ---- the inverse (§3.2) -------------------------------------------------- */

/* invert one change: a `put` with a `before` restores it; a `put` with no
   `before` (a create) inverts to a `delete`; a `delete` inverts to a `put` of its
   `before`. The result is a write() ENTRY (RecordEntry-shaped Change). */
export function invertChange(ch: Change): Change {
  if (ch.op === 'delete') {
    return { op: 'put', collection: ch.collection, id: ch.id, after: ch.before }
  }
  // op === 'put'
  if (ch.before === undefined) {
    return { op: 'delete', collection: ch.collection, id: ch.id, before: ch.after }
  }
  return { op: 'put', collection: ch.collection, id: ch.id, before: ch.after, after: ch.before }
}

/* the inverse of a whole closure: reverse order, invert each, NEVER coalesced
   (R2-14) — a closure that touched one record twice applies both inverses. */
export function invertClosure(forward: Change[]): Change[] {
  const out: Change[] = []
  for (let i = forward.length - 1; i >= 0; i--) out.push(invertChange(forward[i]))
  return out
}

/* ---- the §4.3 / §8.1 key-family test ------------------------------------- */

/* does a closure's key set share a key (or a weekstash key-family member) with
   `keys`? §8.1: a weekstash key shares with EVERY same-week scheduler key
   (days / sched.book / sched.orig / … / weekstash), both directions; everything
   else shares by exact key. */
export function sharesKeys(a: Set<string>, b: Set<string>): boolean {
  for (const k of a) if (b.has(k)) return true
  // weekstash key-family (both directions)
  const weeksA = weekstashWeeks(a)
  const weeksB = weekstashWeeks(b)
  if (weeksA.size && anyWeekKey(b, weeksA)) return true
  if (weeksB.size && anyWeekKey(a, weeksB)) return true
  return false
}

function weekstashWeeks(keys: Set<string>): Set<string> {
  const out = new Set<string>()
  for (const k of keys) {
    if (k.startsWith('weekstash/')) out.add(k.slice('weekstash/'.length).split(/[:#]/)[0])
  }
  return out
}

/* is any key in `keys` a scheduler-week record (days, sched.book, weekstash, …)
   for one of `weeks`? */
function anyWeekKey(keys: Set<string>, weeks: Set<string>): boolean {
  for (const k of keys) {
    const slash = k.indexOf('/')
    if (slash < 0) continue
    const coll = k.slice(0, slash)
    if (!WEEK_COLLS.has(coll)) continue
    const wk = k.slice(slash + 1).split(/[:#]/)[0]
    if (weeks.has(wk)) return true
  }
  return false
}

export const _test = { ownerOfChange, weekstashWeeks, anyWeekKey }
