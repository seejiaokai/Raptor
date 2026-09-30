/* [ARCH-STACK] Step 3 — the one global undo timeline (design §3–§5, §8).

   A single append-only timeline over the command stream replaces the three
   snapshot stacks. It subscribes to onCommit, folds each user action and its
   transitively-caused projection children into ONE UndoEntry (a causal closure),
   and drives undo/redo by REPLAYING recorded inverse data through each store's
   write() seam — never a reconciler re-derivation (§2, the bug family it
   dissolves).

   Built ADDITIVELY in phase 1: the timeline records and can drive undo, but no
   module is CUT OVER yet (setCutoverModules is empty in production until phase
   2+), so every entry is ineligible and globalUndo/globalRedo are no-ops live —
   the legacy stacks still drive the buttons. The engine + its property tests are
   what phase 1 delivers; the cutover wires it to the buttons (§9, phase 2).

   State is module-level `let`s + functions, the app's own idiom (view.ts,
   commit.ts). Design of record: 2026-09-17-arch-stack-3-global-undo-design.md
*/
import {
  onCommit, commandStream, revisionOf, definePermission, anyone, deriveActor,
} from '../command'
import { commitAs, CmdRefused } from '../command/commit'
import type {
  Actor, Change, CommitEnvelope, EnlistableStore, Module, RecordEntry, Scope,
} from '../command'
import type { RecordCtx, RecordOwner, UndoEntry } from './types'
import {
  deriveContexts, deriveOwners, invertClosure, recordKey, sharesKeys, weekOf, dayKeyOf } from './derive'
import { describeEntry, bubbleText } from './describe'

/* ---- pluggable app hooks (snap, bubble, locks, publish-day resolve) ------- */
export interface UndoHooks {
  /* snap-to-context: bring an off-screen week/war/course into view before the
     inverse applies (§8.1). Multi-context loads happen before any write. `entry`
     is passed so the consumer can tell a week context that is weekstash-ONLY (an
     off-week edit whose only records are the stash blob) from one carrying loaded-
     week records — the former must NOT loadWeek, or the target week becomes CURWEEK
     and the CURWEEK stash-write guard then refuses the off-week apply (C7). */
  loadContext?(ctx: RecordCtx, entry: UndoEntry): void
  /* the view-only snap after contexts are loaded (scroll/select the record). */
  snapView?(entry: UndoEntry, dir: 'undo' | 'redo'): void
  /* pop the undo/redo bubble (§8.2). */
  showBubble?(text: string): void
  /* B1 — carry a seen mark (`type`, its change `seen`) onto an image of the same record an older step will restore:
     return the image with the seen state on, or the same object when nothing changes (carrySeen) */
  seenOverlay?(type: string, seen: Change, image: unknown): unknown
  /* an undo or a redo just SUCCEEDED ([DRAFT-PENDING], 28 Sep 26 — Astra DP-04): the change history writes its line
     here, on the days the step touched, outside the undo timeline so an undo can never undo its own record. Never
     called on a refusal. */
  reversed?(entry: UndoEntry, dir: 'undo' | 'redo'): void
  /* §3.4 — re-install HIST.lock + lw.hist for the restore's duration ONLY, to
     stop a legacy step being pushed; returns a restore(). Does NOT gate the
     reconcilers (they read the private SYNCING). */
  reinstallLocks?(): () => void
  /* §6.3 — resolve a publish boundary's issued verId to its day, when the
     closure carries no days/sched.issuance key to read it from. */
  resolvePublishDay?(id: string): { weekId: string; di: number } | null
  /* §6.2/C5 — a per-entry scheduler adjustment run INSIDE the restore reducer (so
     its mutation is enlisted/derived into the envelope), AFTER the inverse writes.
     Undo of a PUBLISH boundary clears the day's sign-offs (re-sign on republish,
     GU5-005) rather than restoring the pre-publish signed state the inverse carries.
     `pulledBack` (walk W3 F-w3-1, 24 Sep 26) — the days whose publication, made AFTER
     this entry, has since been undone: the entry's recorded images predate that
     publish, so they still carry the sign-offs it spent, and must not hand them back. */
  postRestore?(entry: UndoEntry, dir: 'undo' | 'redo', pulledBack: Array<{ weekId: string; di: number }>): void
  /* the CURRENT effective actor for mayReverse (§5); defaults to deriveActor(). */
  currentActor?(): Actor
  /* A DOMAIN RULE THE RESTORE MUST OBEY (the absence-record re-test, W3-F8, 26 Sep 26): the timeline's own conflict
     test knows only "touches the same thing", so a bid put back by Undo or Redo onto a day a medical had since been
     filed on — a war record beside an Inputs record, no shared key — stood on the sick day. The module that owns a
     rule answers here: the sentence that refuses the restore, or null. Asked BEFORE the view snaps, so a refusal moves
     nothing. */
  restoreRefusal?(changes: Change[], dir: 'undo' | 'redo'): string | null
  /* [POST-OUT-OUTCOMES] (the plan's Round 2, Astra round-2 2, Fable round-2 1): a step whose restore would put a DELETED
     man back (state/person-delete.ts deletedRestoreProblem) can NEVER be taken — a delete is final — so the dispatcher
     passes over it when it chooses the next step (it stays in the list, still guarding older steps that share its
     records), and the button never stalls behind it. The sentence, or null. */
  deadRefusal?(changes: Change[], dir: 'undo' | 'redo'): string | null
  /* D148 (24 Sep 26) — "if someone else has since changed the very same thing, Undo refuses and SAYS WHO". The name a
     person goes by on screen (his callsign), or null — through a hook so the timeline stays free of the roster
     (the change-recording plan B6.3). */
  nameOf?(actor: Actor): string | null
}
let hooks: UndoHooks = {}
export function setUndoHooks(h: UndoHooks): void { hooks = h }

/* ---- collection → store map (the restore reducer's write targets) --------- */
const storeOf = new Map<string, EnlistableStore>()
export function registerUndoStore(store: EnlistableStore, collections: string[]): void {
  for (const c of collections) storeOf.set(c, store)
}

/* ---- eligibility (strangler; §7) ----------------------------------------- */
let cutover = new Set<Module>()
export function setCutoverModules(mods: Module[]): void { cutover = new Set(mods); bumpUndo() }

/* ---- timeline state ------------------------------------------------------- */
let entries: UndoEntry[] = []
const bySeq = new Map<number, UndoEntry>()
/* the ROOT user-entry a projection seq chains to, walked transitively (§3.1
   R2-13). Maps every folded envelope seq → its entry's root seq. */
const rootOfSeq = new Map<number, number>()
const expected = new Map<string, number>()   // §4.1 expectation map
const barrier = new Map<string, number>()    // §4.1 sticky out-of-band barriers
/* WHO set each barrier (D148 — the refusal says who): another person's remote change, the app's own pass (the system
   actor), or — for a change found only by its revision — the writer of that revision on the stream. Kept with `barrier`
   across a sign-in (endUndoSession), cleared only by _resetTimeline. */
const BARRIER_BY = new Map<string, Actor>()
let stamp = 0                                // monotonic undoneAt source (R3-06)
let installed = false
let unsub: (() => void) | null = null

/* ---- the timeline's OWN external store (button refresh, C4) ----------------
   The retargeted Undo/Redo controls subscribe to THIS (useSyncExternalStore),
   NOT the domain stores. Notifying schedStore/lwStore just to refresh a button
   would run their reconcilers (roster reproject, OIL, sync) on every
   record/undo/redo and enqueue projections mid-delivery, altering the entry's
   closure/eligibility. This is a pure version counter over undoState(). */
let undoVersion = 0
const undoSubs = new Set<() => void>()
export function getUndoVersion(): number { return undoVersion }
export function subscribeUndo(fn: () => void): () => void { undoSubs.add(fn); return () => { undoSubs.delete(fn) } }
function bumpUndo(): void { undoVersion++; for (const fn of Array.from(undoSubs)) fn() }

export interface UndoResult {
  ok: boolean
  reason?: string      // a plain-words refusal message when !ok
  entry?: UndoEntry
}

/* ---- install -------------------------------------------------------------- */
export function installUndo(h?: UndoHooks): void {
  if (h) hooks = h
  if (installed) return
  installed = true
  definePermission('undo.restore', anyone)   // mayReverse (§5) is the real gate
  unsub = onCommit(ingest)
}

/* ---- ingest one envelope (the stream subscriber) -------------------------- */
function ingest(env: CommitEnvelope): void {
  switch (env.origin) {
    case 'user': {
      if (isNavOnly(env)) { /* navigation is not an entry (§3.1 R2-10) */ trackExpectation(env); return }
      /* B1 — a person's own "seen" mark is never an Undo step: taking it back would bring a note back, not the
         squadron's record, and a member's could never be taken at all (Fable S2) */
      if (NOT_STEPS.has(env.type)) { trackExpectation(env); carrySeen(env); return }
      recordEntry(env)
      break
    }
    case 'projection': {
      /* §11.1 (Fable's red team 1–2) — THE POSTING PASS IS THE APP'S OWN CHANGE, never part of a person's step. It runs
         from the repaint of whatever command came first on the posting's date, so its envelope chains to that command —
         and folded in, a Quals tick would carry an archive, a suspension and a war record, and vanish from Undo (D350)
         or, undone, bring a posted man back. It sets a barrier that names the app instead. */
      if (env.type === 'lw.postoutRun') { outOfBand(env); break }
      const root = resolveRoot(env)
      if (root != null) foldProjection(root, env)   // a tracked causal child
      else if (causedByRestoreOrSeed(env)) advanceExpectedNoBarrier(env)
      else outOfBand(env)
      // ^ an orphan (chained to nothing) is out-of-band the moment it lands: its barrier and its actor are set NOW
      // (§11.1), so a refusal can name it and the pre-check catches it before any snap.
      // ^ §3.4/C8 (Codex GU-P2-007): a projection a RESTORE (our own undo/redo) woke —
      // e.g. undoing a Leave War edit wakes the OIL/sync reconciler. It is out-of-band
      // for FOLDING (E1 stops resolveRoot at the restore, so it never splices into the
      // reversed entry), but its revision bump is REAL and legitimate, so `expected`
      // must advance to it WITHOUT a barrier. Without this, an immediate redo whose
      // closure shares that key pins a stale expected revision and is wrongly refused.
      break
    }
    case 'restore':
    case 'seed':
      trackExpectation(env)   // our own undo/redo, a nav, or the seed baseline
      break
    case 'remote':
      /* D148 — another person's change (Step 5; modelled today). Never an entry of HIS; a barrier on every record it
         wrote, with its actor, so an older step of his on the same thing refuses naming who, and one on anything else
         is untouched (Astra 11–12, Fable S8) */
      outOfBand(env)
      break
  }
}

/* B1 — the commands that are never an Undo step: each person's own "seen" (the changes window's "Mark all as seen", the
   admins' bell, the welcome-back note, "OK, seen" on a Leave War notice — §10) and a waiting person's own request for
   access (he has no Undo door). Their revisions are still tracked, so nothing reads as out-of-band. */
const NOT_STEPS = new Set<string>(['changes.seen', 'access.seen', 'person.backSeen', 'access.request', 'lw.ack'])

/* A seen mark written INTO a record a step also holds (his welcome note on his own roster record, "OK, seen" on a Leave
   War day's list, the admins' bell on the requests) — the older step's before- and after-images still hold it unseen,
   so undoing or redoing that step would bring the note, the notice or the bell back (Fable's final read, F4; Astra's,
   F1). Every image of that record, undone or not, takes the seen state on — through the hook, which knows each mark's
   field; the revision is untouched (trackExpectation already advanced it). */
function carrySeen(env: CommitEnvelope): void {
  const over = hooks.seenOverlay
  if (!over) return
  for (const sc of env.changes) {
    const k = recordKey(sc)
    for (const e of entries) for (const list of [e.inverse, e.forward]) for (let i = 0; i < list.length; i++) {
      const c = list[i]
      if (recordKey(c) !== k) continue
      const before = c.before == null ? c.before : over(env.type, sc, c.before)
      const after = c.after == null ? c.after : over(env.type, sc, c.after)
      if (before !== c.before || after !== c.after) list[i] = { ...c, before, after }
    }
  }
}

/* an envelope out of every entry's causal line (another person's, the app's own pass, an orphan projection): a sticky
   barrier on each record it wrote, the actor kept, and `expected` advanced to what it left. */
function outOfBand(env: CommitEnvelope): void {
  const revs = env.revs
  if (!revs) return
  for (const key of Object.keys(revs)) {
    barrier.set(key, env.seq)
    BARRIER_BY.set(key, env.actor)
    expected.set(key, revs[key])
  }
}

/* an envelope whose changes are ALL navigation (lw.current, and — refined at the
   Tracker cutover — a trk.plan pointer-only change). Not an undo entry, and never
   truncates redo (§3.1). */
function isNavOnly(env: CommitEnvelope): boolean {
  if (env.changes.length === 0) return false
  return env.changes.every(c => c.collection === 'lw.current')
}

/* walk causedBy UPWARD transitively to the root user entry, or null if this
   projection is an orphan / chains to no tracked entry (§3.1 R2-13). */
function resolveRoot(env: CommitEnvelope): number | null {
  let cause = env.causedBy
  const guard = new Set<number>()
  while (cause != null && !guard.has(cause)) {
    guard.add(cause)
    if (bySeq.has(cause)) return cause                 // reached a tracked user entry
    const parent = rootOfSeq.get(cause)                // a folded projection → its root
    if (parent != null) return parent
    const env2 = findEnv(cause)
    if (!env2) return null
    // §3.4 — a restore/seed in the chain is a HARD STOP. A projection caused by our
    // own undo/redo (or by the seed) is out-of-band; it must NOT fold into the entry
    // the restore was reversing. applyRestore commits the restore with causedBy =
    // entry.seq, so without this stop resolveRoot would walk restoreSeq → env2(restore)
    // → entry.seq → the original entry, and foldProjection would splice the reconciler's
    // write into that entry's closure — corrupting its redo and its eligibility. Invisible
    // in phase 1 (restores wake no reconciler); fires the moment Leave War is cut over.
    if (env2.origin === 'restore' || env2.origin === 'seed') return null
    cause = env2.causedBy
  }
  return null
}
function findEnv(seq: number): CommitEnvelope | undefined {
  const s = commandStream()
  for (let i = s.length - 1; i >= 0; i--) if (s[i].seq === seq) return s[i]
  return undefined
}

/* §3.4/C8 — does this projection's causal chain reach a restore/seed envelope (vs a
   tracked user entry, or nothing at all)? resolveRoot returns null both for a
   restore-descended projection and for a true orphan; this tells the two apart so the
   former can advance `expected` while the latter is left for the barrier. */
function causedByRestoreOrSeed(env: CommitEnvelope): boolean {
  let cause = env.causedBy
  const guard = new Set<number>()
  while (cause != null && !guard.has(cause)) {
    guard.add(cause)
    if (bySeq.has(cause) || rootOfSeq.has(cause)) return false   // a tracked entry — not restore-descended
    const env2 = findEnv(cause)
    if (!env2) return false
    if (env2.origin === 'restore' || env2.origin === 'seed') return true
    cause = env2.causedBy
  }
  return false
}
/* advance `expected` for every touched record WITHOUT the barrier check — the caller
   has established the change is legitimate (restore-caused), so it is accounted for,
   not out-of-band. */
function advanceExpectedNoBarrier(env: CommitEnvelope): void {
  const revs = env.revs
  if (!revs) return
  for (const key of Object.keys(revs)) expected.set(key, revs[key])
}

/* record a fresh user action as a new entry (its projection children fold in as
   they arrive, later in the same synchronous drain). */
function recordEntry(env: CommitEnvelope): void {
  const forward = env.changes.slice()
  const entry: UndoEntry = {
    seq: env.seq,
    scope: env.scope,
    contexts: deriveContexts(forward),
    actor: env.actor,
    type: env.type,
    label: '',
    owners: deriveOwners(forward),
    inverse: invertClosure(forward),
    forward,
    revs: { ...(env.revs || {}) },
    boundary: env.boundary,
    ...(env.detail ? { detail: env.detail } : {}),
    eligible: false,      // recomputed lazily (modules may cut over after record)
    undone: false,
  }
  entry.label = describeEntry(entry)
  entries.push(entry)
  bySeq.set(entry.seq, entry)
  abandonForkedRedo(entry)
  trackExpectation(env)
  bumpUndo()
}

/* §4.3 — "refuse redo of E if … any newer entry committed after E's undo shares a key". That makes E
   dead for good the moment such a change is committed, but the code only refused E while the newer
   entry stood; E stayed an "earlier undone change" and, once the newer entry was undone too, refused
   ITS redo with "redo that first" — which no control can do, since Redo only ever offers the most
   recently undone (walk W3 F-w3-2, 24 Sep 26: sign Friday, undo, sign Saturday, undo, Redo → stuck).
   So a NEW change ABANDONS every undone entry it shares a record with — the redo tail a classic undo
   stack drops — and, transitively, every undone entry NEWER than an abandoned one that shares a record
   with it (its images were built on top of it: redoing it would bring half of the abandoned step
   back). An undone entry touching none of those records stays redoable, as before. Called again as a
   projection child widens the entry's closure. */
function abandonForkedRedo(fresh: UndoEntry): void {
  const freshKeys = keySet(fresh)
  const dead: UndoEntry[] = []
  for (const o of entries) {
    if (o === fresh || !o.undone || o.abandoned) continue
    if (sharesKeys(keySet(o), freshKeys)) { o.abandoned = true; dead.push(o) }
  }
  for (let i = 0; i < dead.length; i++) {
    const d = dead[i], dk = keySet(d)
    for (const o of entries) {
      if (o === fresh || !o.undone || o.abandoned || o.seq <= d.seq) continue
      if (sharesKeys(keySet(o), dk)) { o.abandoned = true; dead.push(o) }
    }
  }
}

/* fold a causal projection child into its root entry's closure (§3.1). */
function foldProjection(rootSeq: number, env: CommitEnvelope): void {
  const entry = bySeq.get(rootSeq)
  if (!entry) return
  rootOfSeq.set(env.seq, rootSeq)
  entry.forward.push(...env.changes)
  // recompute the closure-derived fields (contexts/owners/inverse) over the whole
  // forward list; NEVER coalesce a doubly-touched record (R2-14 — invertClosure
  // keeps both).
  entry.contexts = deriveContexts(entry.forward)
  entry.owners = deriveOwners(entry.forward)
  entry.inverse = invertClosure(entry.forward)
  Object.assign(entry.revs, env.revs || {})
  entry.label = describeEntry(entry)
  abandonForkedRedo(entry)   // the child's records fork the timeline too (F-w3-2)
  trackExpectation(env)
  bumpUndo()
}

/* §4.1 — before EVERY expectation update (a tracked entry, a folded child, a
   restore, a nav, the seed), check the out-of-band barrier, then update
   `expected`. `before = revs[key]-1` because one envelope bumps each touched
   record's revision by exactly one (commit.ts finalize). */
function trackExpectation(env: CommitEnvelope): void {
  const revs = env.revs
  if (!revs) return
  for (const key of Object.keys(revs)) {
    const before = revs[key] - 1
    if (expected.has(key) && expected.get(key) !== before) {
      barrier.set(key, env.seq)   // an unaccounted change slipped in — sticky
      const w = writerOf(key, before)
      if (w) BARRIER_BY.set(key, w.actor); else BARRIER_BY.delete(key)
    }
    expected.set(key, revs[key])
  }
}

/* the envelope that left `key` at revision `rev` (newest first), or undefined — the belt for naming who, when a change
   was found only by its revision (D148; Fable's red team 2) */
function writerOf(key: string, rev: number): CommitEnvelope | undefined {
  const s = commandStream()
  for (let i = s.length - 1; i >= 0; i--) if (s[i].revs && s[i].revs![key] === rev) return s[i]
  return undefined
}
function liveRevision(key: string): number {
  const slash = key.indexOf('/')
  return revisionOf(key.slice(0, slash), key.slice(slash + 1))
}

/* ---- eligibility + key helpers ------------------------------------------- */
function modulesOf(entry: UndoEntry): Set<Module> {
  const mods = new Set<Module>([entry.scope.module])
  for (const ch of entry.forward) mods.add(moduleOfColl(ch.collection))
  return mods
}
function moduleOfColl(collection: string): Module {
  if (collection === 'inputs') return 'inputs'
  if (collection === 'plan') return 'plan'
  if (collection === 'people') return 'people'
  if (collection === 'settings') return 'settings'
  if (collection.startsWith('lw.')) return 'lw'
  if (collection.startsWith('trk.')) return 'trk'
  return 'sched'
}
/* Collections whose MODULE is cut over but which cannot be restored yet, so an
   entry whose closure touches one is ineligible until its phase lands (§7, C2).
   `lw.postouts`: restoring the record does not rebuild the roster posting-out
   windows (that reproject is §10.1 / phase 5), so an undo would leave a person
   visibly posted-out with the record removed. `lw.config` is deliberately NOT
   here — it restores cleanly (applyLwRecord + reprojectRoster re-reads it), and
   LW's settings undo depends on it. `people`/`settings`/`trk.*` need no entry
   here: their modules aren't cut over, so module-level eligibility already
   excludes them. Remove `lw.postouts` when §10.1 lands (phase 5).
   AND WHEN IT DOES, §10.1's re-lay becomes MANDATORY, not a tidy-up (the
   independent code read, 22 Sep 26). `leavewar/state/store.ts` `setPeople` now
   CAPTURES a posting window that arrives on a person with no record behind it —
   which is what stopped the demo's posting-out date being lost on every reload.
   Lift this deferral without re-laying restored `postOuts` over the projection
   and the two meet: an undo restores the record without the person, and the next
   roster change re-captures the window the admin had just undone. The undo would
   read as reversed on screen and stand in the record. */
const deferredCollections = new Set<string>(['lw.postouts'])
/* D350 (28 Sep 26) by the ACT, not only by the record it writes: adding a person (alone, with his sign-in, or a request
   given access as a new person), Archive, Restore / Restore as, Delete and a posting are not undone in this build — each
   has its own way back. Every production door writes the war's stints (lw.postouts) and is caught above too; this is
   the belt for a door that ever skips the post-in date. Lift with `[UNDO-POSTING-RECORD]`. */
const NOT_UNDONE_TYPES = new Set<string>(['person.add', 'account.addNew', 'access.approveNew', 'person.archive', 'person.restore', 'person.delete', 'lw.postout'])
function touchesDeferred(entry: UndoEntry): boolean {
  return NOT_UNDONE_TYPES.has(entry.type) || entry.forward.some(ch => deferredCollections.has(ch.collection))
}
function isEligible(entry: UndoEntry): boolean {
  for (const m of modulesOf(entry)) if (!cutover.has(m)) return false
  if (touchesDeferred(entry)) return false
  return true
}
function keySet(entry: UndoEntry): Set<string> {
  return new Set(entry.forward.map(recordKey))
}

/* ---- authorization: mayReverse (§5) -------------------------------------- */
function currentActor(): Actor {
  return hooks.currentActor ? hooks.currentActor() : deriveActor()
}
/* why a step is not his to reverse, in his words ([POST-OUT-OUTCOMES], D292 — Fable F12): a step he made AS ADMIN,
   refused while he is in the member view, is his own — he is told to switch back, not that it was someone else's */
function reverseRefusal(entry: UndoEntry, dir: 'undo' | 'redo'): string {
  const cur = currentActor()
  if (entry.actor.role === 'admin' && cur.role !== 'admin' && cur.personId != null && entry.actor.personId === cur.personId)
    return `Switch back to the admin view to ${dir} that.`
  return dir === 'undo' ? 'You can’t undo that — it was someone else’s change.' : 'You can’t redo that — it was someone else’s change.'
}
/* D148 (24 Sep 26) — "Undo reverses only your OWN changes": the same PERSON, whatever the role he made it in. Chosen on
   the person alone, so his own admin step, in the member view (D292), is still his next step — and then refused with
   "switch back" by mayReverse, every press (Astra's red team 6), never skipped to an older member step. No person on
   either side (a session with no account — the localhost bridge, a headless test) is one and the same. */
function isOwn(entry: UndoEntry, cur: Actor): boolean {
  return (entry.actor.personId ?? null) === (cur.personId ?? null)
}
export function mayReverse(entry: UndoEntry, cur: Actor): boolean {
  /* an admin may reverse only his own (D148 — the change-recording plan B6.1: "admin may reverse anything" is gone) */
  if (cur.role === 'admin') return isOwn(entry, cur)
  return (
    entry.actor.role !== 'admin' &&
    cur.personId != null &&
    entry.actor.personId === cur.personId &&
    entry.owners.every(o => o.person == null || o.person === cur.personId)
  )
}

/* ---- the publication barrier (§6.3) -------------------------------------- */
function resolveBoundaryDay(entry: UndoEntry): { weekId: string; di: number } | null {
  for (const ch of entry.forward) {
    if (ch.collection === 'sched.issuance') {
      const dk = dayKeyOf(ch.collection, ch.id)
      if (dk && dk.includes('#')) { const [wk, di] = dk.split('#'); return { weekId: wk, di: Number(di) } }
    }
  }
  for (const ch of entry.forward) {
    if (ch.collection === 'days') {
      const [wk, di] = ch.id.split('#')
      return { weekId: wk, di: Number(di) }
    }
  }
  const id = entry.boundary?.ids[0]
  return id && hooks.resolvePublishDay ? hooks.resolvePublishDay(id) : null
}
/* the newest not-undone publish seq per day, cleared by a newer not-undone
   unpublish (DERIVED, keyed weekId#di — §6.3). */
function computePubBar(): Map<string, number> {
  const bar = new Map<string, number>()
  const unpub = new Map<string, number>()
  for (const e of entries) {
    if (e.undone || !e.boundary) continue
    const day = resolveBoundaryDay(e)
    if (!day) continue
    const dk = `${day.weekId}#${day.di}`
    if (e.boundary.kind === 'publish') bar.set(dk, Math.max(bar.get(dk) ?? -1, e.seq))
    else unpub.set(dk, Math.max(unpub.get(dk) ?? -1, e.seq))
  }
  for (const [dk, upseq] of unpub) {
    const pb = bar.get(dk)
    if (pb != null && upseq > pb) bar.delete(dk)
  }
  return bar
}
/* §6.2/C5 — the days whose publication, made AFTER `entry`, has since been undone (an abandoned one
   too: it was still pulled back). GU5-005: "a published day that is pulled back always re-signs on
   republish, whether pulled back by Undo or by the button" — the publish SPENT the day's sign-offs, but
   every older entry's recorded images (the sign-offs ride one week-wide record) still carry them, so
   undoing or redoing such an entry handed them back and "Publish day" worked with nobody re-signing
   (walk W3 F-w3-1, 24 Sep 26). postRestore clears them again. Errs towards clearing: a day unpublished
   by the button in between re-signs as well, which costs a re-sign and never lets a day out unsigned. */
function pulledBackDays(entry: UndoEntry): Array<{ weekId: string; di: number }> {
  const out: Array<{ weekId: string; di: number }> = []
  for (const e of entries) {
    if (e === entry || !e.undone || e.seq <= entry.seq || e.boundary?.kind !== 'publish') continue
    const d = resolveBoundaryDay(e)
    if (d && !out.some(x => x.weekId === d.weekId && x.di === d.di)) out.push(d)
  }
  return out
}

/* the weekId#di a scheduler-week change belongs to (a day's content, or an issued version of it). */
function dayKeysOf(entry: UndoEntry): string[] {
  const out: string[] = []
  for (const ch of entry.forward) {
    if (ch.collection === 'days') { const [wk, di] = ch.id.split('#'); out.push(`${wk}#${di}`) }
    else if (ch.collection === 'sched.issuance') { const dk = dayKeyOf(ch.collection, ch.id); if (dk && dk.includes('#')) out.push(dk) }
  }
  return out
}

/* ---- conflict pre-checks (§4) -------------------------------------------- */
/* D148 — the refusal for a change made OUTSIDE his line of steps on the same thing, naming who made it: another person
   (his callsign), the app's own posting pass, or — when nothing names it — today's words. */
const OUT_OF_BAND = 'Something else changed this after your action — it can’t be undone now.'
function outOfBandWords(key: string): string {
  let a = BARRIER_BY.get(key)
  if (!a) { const w = writerOf(key, liveRevision(key)); if (w && w.origin !== 'user' && w.origin !== 'restore') a = w.actor }
  if (!a) return OUT_OF_BAND
  if (a.role === 'system') {
    const w = writerOf(key, liveRevision(key))
    return w && w.type === 'lw.postoutRun'
      ? 'The app changed this after your action (a posting out ran) — it can’t be undone now.'
      : 'The app changed this after your action — it can’t be undone now.'
  }
  const cur = currentActor()
  if (a.personId != null && a.personId === cur.personId) return 'You changed this somewhere else after this action — it can’t be undone now.'
  const nm = hooks.nameOf ? hooks.nameOf(a) : null
  return nm ? `${nm} changed this after your action — it can’t be undone now.` : OUT_OF_BAND
}
/* a refusal, and whether it can NEVER pass (a sticky barrier — someone else's, or the app's, change on the same thing):
   only those are passed over on the next press (§11.5 (a)); every other conflict refuses every press */
interface Conflict { text: string; sticky: boolean }
/* the sticky part of the check, shared by undo and redo: the barrier after `since`, and the stateless revision check
   (§8.1, B6.5 — a record whose revision is not the one this timeline expects has been changed by someone outside it:
   refused in words BEFORE the view moves, never reaching the restore's "stale revision") */
function outOfBandConflict(entry: UndoEntry, since: number): Conflict | null {
  for (const key of keySet(entry)) {
    const b = barrier.get(key)
    if (b != null && b > since) return { text: outOfBandWords(key), sticky: true }
    if (expected.has(key) && liveRevision(key) !== expected.get(key)) return { text: outOfBandWords(key), sticky: true }
  }
  return null
}
function undoConflictOf(entry: UndoEntry): Conflict | null {
  const keys = keySet(entry)
  const oob = outOfBandConflict(entry, entry.seq)
  if (oob) return oob
  // publication barrier (§6.3): an edit behind a later publish of the same day
  const pubBar = computePubBar()
  for (const dk of dayKeysOf(entry)) {
    const pb = pubBar.get(dk)
    /* name the door the scheduler has — the day's Unpublish button (register AM39c; it said "take the
       published day back", which no control is called — [HUMAN-RETEST] amendment re-test, 24 Sep 26) */
    if (pb != null && pb > entry.seq) return { text: 'A day on this week was published after that change — tap Unpublish on that day first, or edit its working copy.', sticky: false }
  }
  // non-linear: a newer not-undone entry shares a key (§4.3). An INELIGIBLE newer
  // entry (a deferred-collection closure) is still a hard barrier — refuse whole,
  // never skip it (skipping would let this older before-image overwrite the newer
  // value, the SEQ-003 stale-inverse hazard) — but the refusal must not tell the
  // owner to "undo that first" when they can't (C1). Nor when the newer step is one
  // the dispatcher passes over for good (a deleted man's — deadFor): walker A1-F1,
  // 28 Sep 26 — "undo that first" pointed at a publish no press could ever reach.
  for (const o of entries) {
    if (o === entry || o.undone || o.seq <= entry.seq) continue
    if (sharesKeys(keySet(o), keys)) {
      if (isEligible(o) && !deadFor(o, 'undo')) return { text: 'A later change touches the same thing — undo that first.', sticky: false }
      /* the newer step is one Undo never takes (D350): say which act, and that the way back is by hand (plan B3; Fable's
         final read, F3 — the generic sentence left a suspension behind an added person with no way forward) */
      if (NOT_UNDONE_TYPES.has(o.type)) return { text: 'A later change to a person (added, archived, restored or posted) touches the same thing, so this can’t be undone — change it back by hand.', sticky: false }
      return { text: isEligible(o) ? 'A later change touches the same thing and can’t be undone.' : 'A later change touches the same thing and can’t be undone yet.', sticky: false }
    }
  }
  return null
}
function undoConflict(entry: UndoEntry): string | null { const c = undoConflictOf(entry); return c ? c.text : null }
function redoConflictOf(entry: UndoEntry): Conflict | null {
  const keys = keySet(entry)
  /* B6.4 — Redo has a barrier too: a change made by someone else while the step stood undone (Fable 3c-3) */
  const oob = outOfBandConflict(entry, entry.undoneSeq ?? entry.seq)
  if (oob) return oob
  for (const o of entries) {
    if (o === entry) continue
    // an ABANDONED entry is never redone, so it can never be "redone first" (F-w3-2)
    if (o.undone && !o.abandoned && o.seq < entry.seq && sharesKeys(keySet(o), keys)) {
      return { text: 'An earlier undone change touches the same thing — redo that first.', sticky: false }
    }
    if (!o.undone && o.seq > entry.seq && sharesKeys(keySet(o), keys)) {
      return { text: 'A later change touches the same thing — it can’t be redone over.', sticky: false }
    }
  }
  return null
}
function redoConflict(entry: UndoEntry): string | null { const c = redoConflictOf(entry); return c ? c.text : null }

/* ---- apply an inverse/forward as one restore commit (§3.2) --------------- */
function toRecordEntry(ch: Change): RecordEntry {
  return ch.op === 'delete'
    ? { collection: ch.collection, id: ch.id, op: 'delete' }
    : { collection: ch.collection, id: ch.id, value: ch.after, op: 'put' }
}
function applyRestore(entry: UndoEntry, changes: Change[], dir: 'undo' | 'redo'): { ok: boolean; reason?: string; seq?: number } {
  // group the write entries by their owning store
  const byStore = new Map<EnlistableStore, RecordEntry[]>()
  const missing: string[] = []
  for (const ch of changes) {
    const store = storeOf.get(ch.collection)
    if (!store) { missing.push(ch.collection); continue }
    let list = byStore.get(store)
    if (!list) { list = []; byStore.set(store, list) }
    list.push(toRecordEntry(ch))
  }
  if (missing.length) return { ok: false, reason: `no restore target for ${missing.join(', ')}` }
  // pin the expected revisions of every written record (§4.2 atomic net)
  const expectedRevs: Record<string, number> = {}
  for (const ch of changes) {
    const k = recordKey(ch)
    if (expected.has(k)) expectedRevs[k] = expected.get(k)!
  }
  const cur = currentActor()
  const pulledBack = pulledBackDays(entry)   // read BEFORE the apply, from the timeline as it stands
  const r = commitAs(
    {
      type: 'undo.restore',
      scope: entry.scope,
      expectedRevs,
      apply: (txn) => {
        /* THE RULES AGAIN, INSIDE, before any write (the change-recording plan §11.3 — Astra's red team 2): the view-snap
           ran between the first ask and here (a week loaded, projections ran), so the world the first ask saw may have
           moved. A refusal now rolls back nothing, because nothing was written — and keeps its own words. */
        const again = (hooks.deadRefusal && hooks.deadRefusal(changes, dir)) || (hooks.restoreRefusal && hooks.restoreRefusal(changes, dir))
        if (again) throw new CmdRefused(again)
        const relock = hooks.reinstallLocks ? hooks.reinstallLocks() : undefined
        try {
          // C5 — enlist EVERY store in the closure FIRST, so a later store's refusal
          // rolls back every earlier store's snapshot (publish closures are multi-store).
          for (const [store] of byStore) txn.enlist(store)
          for (const [store, list] of byStore) store.write!(list, { allowIssued: true, restore: true })
          if (hooks.postRestore) hooks.postRestore(entry, dir, pulledBack)
          /* the change history's Undo / Redo line, INSIDE the restore ([DB-READINESS] group A, phase 4.1 — F2-03): it is
             kept with the restore's own latched effects, so it travels in the restore's saved group and its change-log
             batch — and a restore refused after this point leaves no line */
          if (hooks.reversed) hooks.reversed(entry, dir)
        } finally { if (relock) relock() }
      },
    },
    { actor: cur, origin: 'restore', causedBy: entry.seq },
  )
  /* a DELIBERATE refusal raised inside (CmdRefused — a restore rule's second check, B5 §11.3) keeps its own sentence */
  if ((r as any).ok === false) return { ok: false, reason: (r as any).reason === 'refused' && (r as any).message ? `REFUSE: ${(r as any).message}` : ((r as any).message || 'conflict') }
  return { ok: true, seq: (r as any).seq }
}

/* ---- snap-to-context (§8.1) ---------------------------------------------- */
function snap(entry: UndoEntry, dir: 'undo' | 'redo'): void {
  if (hooks.loadContext) for (const ctx of entry.contexts) hooks.loadContext(ctx, entry)
  if (hooks.snapView) hooks.snapView(entry, dir)
}

/* §4/N11 — the restore reducer's own refusals (a stale-revision conflict, a
   missing store) are technical strings; the owner never reads them. Any
   applyRestore ok:false maps to plain words here. */
function plainRestoreReason(reason?: string, entry?: UndoEntry): string {
  // Fable#2 — an off-week change captured on the week's SAVED COPY (weekstash) can't
  // be undone while that week is the one loaded (its live copy is authoritative, so
  // the stash write is refused). Say what to do, not "something changed".
  if (reason && /weekstash write to the loaded week/.test(reason))
    return 'That change is on the saved copy of this week. Open a different week first, then undo it.'
  /* a refusal a restore rule raised inside the reducer (B5's second check) keeps its own words */
  if (reason && /^REFUSE: /.test(reason)) return reason.slice(8)
  /* B6.6 — a stale revision can never succeed on a retry: say what happened, never "Try again" (Fable 3c-5) */
  if (reason && /stale revision/.test(reason)) return OUT_OF_BAND
  /* "this week" only for a week's records (Fable 3c-5 — it read "this week" for a war or roster record) */
  const onWeek = !entry || entry.forward.some(c => weekOf(c.collection, c.id) != null)
  return onWeek ? 'That couldn’t be completed just now — something else changed on this week.' : 'That couldn’t be completed just now.'
}

/* §8.1/C7(b) — the applicability pre-check, run BEFORE snap: every collection in
   the change set must have a registered store, or applyRestore would refuse AFTER
   the view already moved. Returns the unregistered collections (empty = all fine). */
function missingStores(changes: Change[]): string[] {
  const out: string[] = []
  for (const ch of changes) if (!storeOf.has(ch.collection) && !out.includes(ch.collection)) out.push(ch.collection)
  return out
}

/* ---- the dispatcher: globalUndo / globalRedo (§9) ------------------------ */
/* a step that can never be taken (deadRefusal) — decided once and kept, since a delete is final */
function deadFor(e: UndoEntry, dir: 'undo' | 'redo'): string | null {
  const k = dir === 'undo' ? '__deadU' : '__deadR'
  if ((e as any)[k]) return (e as any)[k]
  const r = hooks.deadRefusal ? hooks.deadRefusal(dir === 'undo' ? e.inverse : e.forward, dir) : null
  if (r) (e as any)[k] = r
  return r
}
/* the sentence of the newest step passed over, when nothing else was left — said instead of "Nothing to undo" */
let LAST_DEAD: string | null = null
/* B3 (D350, 28 Sep 26) — the steps the one Undo does not take in this build: adding a person, Archive, Restore, Delete and
   a posting. Each writes the war's record of when a man is in the squadron (his stints), which Undo cannot yet put back
   (CMDLF-002, `[UNDO-POSTING-RECORD]`). The greyed button says so instead of going quiet (the plan's §11.4 wording —
   "a delete is final", D287: no door undoes one). */
export const NOT_UNDONE_HERE = 'Adding, archiving or restoring a person, and a posting, aren’t undone here — use Restore, Delete or the posting sheet’s own Undo. A delete is final.'
let LAST_INELIG: UndoEntry | null = null
/* the newer own step of that kind an Undo went past, named in its bubble (walker A2-F3: "a person who has just posted a
   man out and presses Undo sees his bid vanish and the PO remain") */
function notUndoneWhat(e: UndoEntry): string {
  if (e.type === 'lw.postout' || e.forward.every(c => c.collection === 'lw.postouts')) return 'posting'
  if (e.type === 'person.delete') return 'delete'
  if (e.type === 'person.archive') return 'archive'
  if (e.type === 'person.restore') return 'restore'
  return 'change to a person'
}
/* §11.5 — a step passed over after its refusal was said once (a sticky barrier: someone else's, or the app's, change on
   the same thing — it can NEVER be taken). It stays `undone:false`, so it still guards every older step that shares its
   records (undoConflict's non-linear rule, SEQ-003); only the choice of the NEXT step moves past it. */
const BLOCKED_U = '__blockedU', BLOCKED_R = '__blockedR'
let LAST_BLOCKED: string | null = null
function newestUndoable(): UndoEntry | null {
  LAST_DEAD = null; LAST_INELIG = null; LAST_BLOCKED = null
  const cur = currentActor()
  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i]
    if (e.undone) continue
    /* D148 — only his own; another person's step is passed over silently, never refused on */
    if (!isOwn(e, cur)) continue
    if (!isEligible(e)) { if (!LAST_INELIG && touchesDeferred(e) && allCutOver(e)) LAST_INELIG = e; continue }
    const dead = deadFor(e, 'undo')
    if (dead) { if (!LAST_DEAD) LAST_DEAD = dead; continue }
    if ((e as any)[BLOCKED_U]) { if (!LAST_BLOCKED) LAST_BLOCKED = (e as any)[BLOCKED_U]; continue }
    return e
  }
  return null
}
function allCutOver(e: UndoEntry): boolean { for (const m of modulesOf(e)) if (!cutover.has(m)) return false; return true }
/* what the greyed Undo (or a press with nothing to take) says: a step said blocked, a deleted man's, one not undone here */
function nothingToUndoWhy(): string | null {
  return LAST_BLOCKED || LAST_DEAD || (LAST_INELIG ? NOT_UNDONE_HERE : null)
}
function mostRecentlyUndone(): UndoEntry | null {
  let best: UndoEntry | null = null
  LAST_DEAD = null; LAST_BLOCKED = null
  const cur = currentActor()
  for (const e of entries) {
    if (e.undone && !e.abandoned && isEligible(e) && isOwn(e, cur) && (best == null || (e.undoneAt ?? 0) > (best.undoneAt ?? 0))) {
      const dead = deadFor(e, 'redo')
      if (dead) { if (!LAST_DEAD) LAST_DEAD = dead; continue }
      if ((e as any)[BLOCKED_R]) { if (!LAST_BLOCKED) LAST_BLOCKED = (e as any)[BLOCKED_R]; continue }
      best = e
    }
  }
  return best
}
/* §11.5 (c) — the first refusal of a sticky step, naming who; it names the step the NEXT press will take, so one button
   never does two different things with nothing said between */
function sayBlocked(entry: UndoEntry, dir: 'undo' | 'redo', text: string): string {
  ;(entry as any)[dir === 'undo' ? BLOCKED_U : BLOCKED_R] = text
  const next = dir === 'undo' ? newestUndoable() : mostRecentlyUndone()
  bumpUndo()
  return next ? `${text} Press ${dir === 'undo' ? 'Undo' : 'Redo'} again for: ${next.label}.` : text
}

export function globalUndo(): UndoResult {
  const entry = newestUndoable()
  if (!entry) return { ok: false, reason: nothingToUndoWhy() || 'Nothing to undo.' }
  /* the newest own step of the kind not undone here, if Undo is about to go past it (A2-F3) — read before the apply */
  const passedInelig = LAST_INELIG && LAST_INELIG.seq > entry.seq ? LAST_INELIG : null
  if (!mayReverse(entry, currentActor())) return { ok: false, reason: reverseRefusal(entry, 'undo') }
  const conflict = undoConflictOf(entry)
  if (conflict) return { ok: false, reason: conflict.sticky ? sayBlocked(entry, 'undo', conflict.text) : conflict.text }
  const ruleU = hooks.restoreRefusal ? hooks.restoreRefusal(entry.inverse, 'undo') : null   // W3-F8
  if (ruleU) return { ok: false, reason: ruleU }
  // C7(b) — refuse an unrestorable closure BEFORE the view-snap moves anything.
  if (missingStores(entry.inverse).length) return { ok: false, reason: plainRestoreReason() }
  snap(entry, 'undo')
  // N11 — loadContext's loadWeek can emit orphan projections that bump revisions
  // AFTER the pre-check, so re-run the conflict check now that the target week is
  // on screen; a fresh barrier here refuses cleanly instead of applyRestore failing
  // phase-5 with a technical "stale revision" string.
  const postConflict = undoConflictOf(entry)
  if (postConflict) return { ok: false, reason: postConflict.sticky ? sayBlocked(entry, 'undo', postConflict.text) : postConflict.text }
  const r = applyRestore(entry, entry.inverse, 'undo')
  if (!r.ok) return { ok: false, reason: plainRestoreReason(r.reason, entry) }
  entry.undone = true
  entry.undoneAt = ++stamp
  entry.undoneSeq = r.seq
  bumpUndo()
  if (hooks.showBubble) hooks.showBubble(bubbleText(entry, 'undo') + (passedInelig ? ` — the later ${notUndoneWhat(passedInelig)} stays; it isn’t undone here.` : ''))
  return { ok: true, entry }
}

export function globalRedo(): UndoResult {
  const entry = mostRecentlyUndone()
  if (!entry) return { ok: false, reason: LAST_BLOCKED || LAST_DEAD || 'Nothing to redo.' }
  if (!mayReverse(entry, currentActor())) return { ok: false, reason: reverseRefusal(entry, 'redo') }
  const conflict = redoConflictOf(entry)
  if (conflict) return { ok: false, reason: conflict.sticky ? sayBlocked(entry, 'redo', conflict.text) : conflict.text }
  const ruleR = hooks.restoreRefusal ? hooks.restoreRefusal(entry.forward, 'redo') : null   // W3-F8
  if (ruleR) return { ok: false, reason: ruleR }
  if (missingStores(entry.forward).length) return { ok: false, reason: plainRestoreReason() }
  snap(entry, 'redo')
  // N11 — see globalUndo: re-check after the view-snap loaded the target week.
  const postConflict = redoConflictOf(entry)
  if (postConflict) return { ok: false, reason: postConflict.sticky ? sayBlocked(entry, 'redo', postConflict.text) : postConflict.text }
  const r = applyRestore(entry, entry.forward, 'redo')
  if (!r.ok) return { ok: false, reason: plainRestoreReason(r.reason, entry) }
  entry.undone = false
  entry.undoneAt = undefined
  bumpUndo()
  if (hooks.showBubble) hooks.showBubble(bubbleText(entry, 'redo'))
  return { ok: true, entry }
}

/* ---- UI state (for the buttons the cutover wires, phase 2) --------------- */
export function undoState(): { canUndo: boolean; canRedo: boolean; undoLabel: string | null; redoLabel: string | null; undoWhy: string | null; redoWhy: string | null } {
  const u = newestUndoable()
  /* [POST-OUT-OUTCOMES]: nothing left but steps that can never be taken — the greyed button says why (its hover);
     B3 (D350): and a step not undone here says so too */
  const undoWhy = u ? null : nothingToUndoWhy()
  const r = mostRecentlyUndone()
  const redoWhy = r ? null : (LAST_BLOCKED || LAST_DEAD)
  return {
    canUndo: !!u,
    canRedo: !!r,
    undoLabel: u ? u.label : null,
    redoLabel: r ? r.label : null,
    undoWhy,
    redoWhy,
  }
}

/** WHERE THE TIMELINE STANDS RIGHT NOW — the seq of the entry Undo would
 *  reverse next, or -1 when there is nothing to reverse. NOT 0: seq 0 is a real
 *  entry, so 0 would make "nothing to undo" and "the very first change" the same
 *  answer, and a screen comparing marks would stop one press too early. An opaque marker: a
 *  screen that must stop Undo at the point it OPENED records one on the way in
 *  and compares on every press, rather than counting presses itself (which
 *  cannot survive a redo, a refusal, or anything else writing in between).
 *  The OIL Earn mode is the first caller — see ui/oilmode.ts. */
export function undoMark(): number {
  const u = newestUndoable()
  return u ? u.seq : -1
}

/* ---- the end of a sign-in ([ACCOUNTS], 26 Sep 26) ----------------------------
   Undo is per login session (owner, 13 Sep 26) and "the list clears when they sign
   out" (D148). The global undo never cleared it, so an admin who signed in after a
   member could reverse the member's change under his own name (Fable R1-7, Astra
   R1-10). state/store.ts resetSession calls this on every sign-in and sign-out.
   Empties the entries AND the seq maps (bySeq, rootOfSeq — so a projection caused by a
   pre-sign-in command cannot fold into an entry no longer listed, Fable R2-7); KEEPS
   the installed stream subscription, the registered stores, the cutover, `expected`
   (D148's conflict detection rides it) and `barrier` (the publication barrier). */
export function endUndoSession(): void {
  entries = []
  bySeq.clear(); rootOfSeq.clear()
  bumpUndo()
}

/* ---- test-only inspectors + reset ---------------------------------------- */
export function _timelineEntries(): readonly UndoEntry[] { return entries }
export function _undoConflict(entry: UndoEntry): string | null { return undoConflict(entry) }
export function _redoConflict(entry: UndoEntry): string | null { return redoConflict(entry) }
export function _pubBar(): Map<string, number> { return computePubBar() }
export function _barrier(): Map<string, number> { return barrier }
export function _expected(): Map<string, number> { return expected }
export function _resetTimeline(): void {
  if (unsub) unsub()
  unsub = null
  entries = []
  bySeq.clear(); rootOfSeq.clear(); expected.clear(); barrier.clear()
  storeOf.clear(); cutover = new Set(); stamp = 0; installed = false; hooks = {}
  undoVersion = 0; undoSubs.clear()
}
