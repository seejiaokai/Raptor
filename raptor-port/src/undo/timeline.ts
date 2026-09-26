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
import { commitAs } from '../command/commit'
import type {
  Actor, Change, CommitEnvelope, EnlistableStore, Module, RecordEntry, Scope,
} from '../command'
import type { RecordCtx, RecordOwner, UndoEntry } from './types'
import {
  deriveContexts, deriveOwners, invertClosure, recordKey, sharesKeys, weekOf,
} from './derive'
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
  /* §3.4 — re-install HIST.lock + lw.hist for the restore's duration ONLY, to
     stop a legacy step being pushed; returns a restore(). Does NOT gate the
     reconcilers (they read the private SYNCING). */
  reinstallLocks?(): () => void
  /* §6.3 — resolve a publish boundary's issued verId to its day, when the
     closure carries no days/sched.orig key to read it from. */
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
let stamp = 0                                 // monotonic undoneAt source (R3-06)
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
      recordEntry(env)
      break
    }
    case 'projection': {
      const root = resolveRoot(env)
      if (root != null) foldProjection(root, env)   // a tracked causal child
      else if (causedByRestoreOrSeed(env)) advanceExpectedNoBarrier(env)
      // ^ §3.4/C8 (Codex GU-P2-007): a projection a RESTORE (our own undo/redo) woke —
      // e.g. undoing a Leave War edit wakes the OIL/sync reconciler. It is out-of-band
      // for FOLDING (E1 stops resolveRoot at the restore, so it never splices into the
      // reversed entry), but its revision bump is REAL and legitimate, so `expected`
      // must advance to it WITHOUT a barrier. Without this, an immediate redo whose
      // closure shares that key pins a stale expected revision and is wrongly refused.
      // A TRUE orphan (chained to nothing) still updates nothing — the barrier catches
      // it at the next tracked update (§4.1).
      break
    }
    case 'restore':
    case 'seed':
      trackExpectation(env)   // our own undo/redo, a nav, or the seed baseline
      break
    case 'remote':
      // out-of-band (Step 5): the barrier guards against it; no expectation update
      break
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
    }
    expected.set(key, revs[key])
  }
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
function touchesDeferred(entry: UndoEntry): boolean {
  return entry.forward.some(ch => deferredCollections.has(ch.collection))
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
export function mayReverse(entry: UndoEntry, cur: Actor): boolean {
  if (cur.role === 'admin') return true
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
    if (ch.collection === 'sched.orig') {
      const [wk, di] = ch.id.split(':')
      return { weekId: wk, di: Number(di) }
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

/* the weekId#di a scheduler-week change belongs to (days / sched.orig carry di). */
function dayKeysOf(entry: UndoEntry): string[] {
  const out: string[] = []
  for (const ch of entry.forward) {
    if (ch.collection === 'days') { const [wk, di] = ch.id.split('#'); out.push(`${wk}#${di}`) }
    else if (ch.collection === 'sched.orig') { const [wk, di] = ch.id.split(':'); out.push(`${wk}#${di}`) }
  }
  return out
}

/* ---- conflict pre-checks (§4) -------------------------------------------- */
function undoConflict(entry: UndoEntry): string | null {
  const keys = keySet(entry)
  for (const key of keys) {
    const b = barrier.get(key)
    if (b != null && b > entry.seq) return 'Something else changed this after your action — it can’t be undone now.'
  }
  // publication barrier (§6.3): an edit behind a later publish of the same day
  const pubBar = computePubBar()
  for (const dk of dayKeysOf(entry)) {
    const pb = pubBar.get(dk)
    /* name the door the scheduler has — the day's Unpublish button (register AM39c; it said "take the
       published day back", which no control is called — [HUMAN-RETEST] amendment re-test, 24 Sep 26) */
    if (pb != null && pb > entry.seq) return 'A day on this week was published after that change — tap Unpublish on that day first, or edit its working copy.'
  }
  // non-linear: a newer not-undone entry shares a key (§4.3). An INELIGIBLE newer
  // entry (a deferred-collection closure) is still a hard barrier — refuse whole,
  // never skip it (skipping would let this older before-image overwrite the newer
  // value, the SEQ-003 stale-inverse hazard) — but the refusal must not tell the
  // owner to "undo that first" when they can't (C1).
  for (const o of entries) {
    if (o === entry || o.undone || o.seq <= entry.seq) continue
    if (sharesKeys(keySet(o), keys))
      return isEligible(o)
        ? 'A later change touches the same thing — undo that first.'
        : 'A later change touches the same thing and can’t be undone yet.'
  }
  return null
}
function redoConflict(entry: UndoEntry): string | null {
  const keys = keySet(entry)
  for (const o of entries) {
    if (o === entry) continue
    // an ABANDONED entry is never redone, so it can never be "redone first" (F-w3-2)
    if (o.undone && !o.abandoned && o.seq < entry.seq && sharesKeys(keySet(o), keys)) {
      return 'An earlier undone change touches the same thing — redo that first.'
    }
    if (!o.undone && o.seq > entry.seq && sharesKeys(keySet(o), keys)) {
      return 'A later change touches the same thing — it can’t be redone over.'
    }
  }
  return null
}

/* ---- apply an inverse/forward as one restore commit (§3.2) --------------- */
function toRecordEntry(ch: Change): RecordEntry {
  return ch.op === 'delete'
    ? { collection: ch.collection, id: ch.id, op: 'delete' }
    : { collection: ch.collection, id: ch.id, value: ch.after, op: 'put' }
}
function applyRestore(entry: UndoEntry, changes: Change[], dir: 'undo' | 'redo'): { ok: boolean; reason?: string } {
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
        const relock = hooks.reinstallLocks ? hooks.reinstallLocks() : undefined
        try {
          // C5 — enlist EVERY store in the closure FIRST, so a later store's refusal
          // rolls back every earlier store's snapshot (publish closures are multi-store).
          for (const [store] of byStore) txn.enlist(store)
          for (const [store, list] of byStore) store.write!(list, { allowIssued: true, restore: true })
          if (hooks.postRestore) hooks.postRestore(entry, dir, pulledBack)
        } finally { if (relock) relock() }
      },
    },
    { actor: cur, origin: 'restore', causedBy: entry.seq },
  )
  if ((r as any).ok === false) return { ok: false, reason: (r as any).message || 'conflict' }
  return { ok: true }
}

/* ---- snap-to-context (§8.1) ---------------------------------------------- */
function snap(entry: UndoEntry, dir: 'undo' | 'redo'): void {
  if (hooks.loadContext) for (const ctx of entry.contexts) hooks.loadContext(ctx, entry)
  if (hooks.snapView) hooks.snapView(entry, dir)
}

/* §4/N11 — the restore reducer's own refusals (a stale-revision conflict, a
   missing store) are technical strings; the owner never reads them. Any
   applyRestore ok:false maps to plain words here. */
function plainRestoreReason(reason?: string): string {
  // Fable#2 — an off-week change captured on the week's SAVED COPY (weekstash) can't
  // be undone while that week is the one loaded (its live copy is authoritative, so
  // the stash write is refused). Say what to do, not "something changed".
  if (reason && /weekstash write to the loaded week/.test(reason))
    return 'That change is on the saved copy of this week. Open a different week first, then undo it.'
  return 'That couldn’t be completed just now — something else changed on this week. Try again.'
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
function newestUndoable(): UndoEntry | null {
  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i]
    if (!e.undone && isEligible(e)) return e
  }
  return null
}
function mostRecentlyUndone(): UndoEntry | null {
  let best: UndoEntry | null = null
  for (const e of entries) {
    if (e.undone && !e.abandoned && isEligible(e) && (best == null || (e.undoneAt ?? 0) > (best.undoneAt ?? 0))) best = e
  }
  return best
}

export function globalUndo(): UndoResult {
  const entry = newestUndoable()
  if (!entry) return { ok: false, reason: 'Nothing to undo.' }
  if (!mayReverse(entry, currentActor())) return { ok: false, reason: 'You can’t undo that — it was someone else’s change.' }
  const conflict = undoConflict(entry)
  if (conflict) return { ok: false, reason: conflict }
  const ruleU = hooks.restoreRefusal ? hooks.restoreRefusal(entry.inverse, 'undo') : null   // W3-F8
  if (ruleU) return { ok: false, reason: ruleU }
  // C7(b) — refuse an unrestorable closure BEFORE the view-snap moves anything.
  if (missingStores(entry.inverse).length) return { ok: false, reason: plainRestoreReason() }
  snap(entry, 'undo')
  // N11 — loadContext's loadWeek can emit orphan projections that bump revisions
  // AFTER the pre-check, so re-run the conflict check now that the target week is
  // on screen; a fresh barrier here refuses cleanly instead of applyRestore failing
  // phase-5 with a technical "stale revision" string.
  const postConflict = undoConflict(entry)
  if (postConflict) return { ok: false, reason: postConflict }
  const r = applyRestore(entry, entry.inverse, 'undo')
  if (!r.ok) return { ok: false, reason: plainRestoreReason(r.reason) }
  entry.undone = true
  entry.undoneAt = ++stamp
  bumpUndo()
  if (hooks.showBubble) hooks.showBubble(bubbleText(entry, 'undo'))
  return { ok: true, entry }
}

export function globalRedo(): UndoResult {
  const entry = mostRecentlyUndone()
  if (!entry) return { ok: false, reason: 'Nothing to redo.' }
  if (!mayReverse(entry, currentActor())) return { ok: false, reason: 'You can’t redo that — it was someone else’s change.' }
  const conflict = redoConflict(entry)
  if (conflict) return { ok: false, reason: conflict }
  const ruleR = hooks.restoreRefusal ? hooks.restoreRefusal(entry.forward, 'redo') : null   // W3-F8
  if (ruleR) return { ok: false, reason: ruleR }
  if (missingStores(entry.forward).length) return { ok: false, reason: plainRestoreReason() }
  snap(entry, 'redo')
  // N11 — see globalUndo: re-check after the view-snap loaded the target week.
  const postConflict = redoConflict(entry)
  if (postConflict) return { ok: false, reason: postConflict }
  const r = applyRestore(entry, entry.forward, 'redo')
  if (!r.ok) return { ok: false, reason: plainRestoreReason(r.reason) }
  entry.undone = false
  entry.undoneAt = undefined
  bumpUndo()
  if (hooks.showBubble) hooks.showBubble(bubbleText(entry, 'redo'))
  return { ok: true, entry }
}

/* ---- UI state (for the buttons the cutover wires, phase 2) --------------- */
export function undoState(): { canUndo: boolean; canRedo: boolean; undoLabel: string | null; redoLabel: string | null } {
  const u = newestUndoable()
  const r = mostRecentlyUndone()
  return {
    canUndo: !!u,
    canRedo: !!r,
    undoLabel: u ? u.label : null,
    redoLabel: r ? r.label : null,
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
