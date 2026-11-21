/* [ARCH-STACK] Step 3 — one global undo: the timeline entry + supporting types
   (design §3.1). An UndoEntry is a causal CLOSURE (a user action plus its
   transitively-caused projection children), reversible as a single restore.

   Design of record: docs/superpowers/specs/2026-09-17-arch-stack-3-global-undo-design.md
*/
import type { Actor, Boundary, Change, Scope, Module } from '../command'

/* A storage context a closure touched, DERIVED from the closure's record ids
   (NOT from scope — round-2 GU2-007). Snap-to-context (§8.1) loads every context
   before applying the inverse; a week/war/course that is off-screen is brought
   into view first. `page` is a context with no per-record load (inputs / plan /
   people / settings / the LW or Tracker globals). */
export type RecordCtx =
  | { kind: 'week'; weekId: string }
  | { kind: 'war'; warId: string }
  | { kind: 'course'; courseId: string }
  | { kind: 'page'; module: Module }

/* Per-change ownership derived at forward time (§5). `person` is the owning
   personId, or null for the no-owner record classes (days / sched.* / plan /
   settings / weekstash / most lw.* / trk.*), which are reversible by the SAME
   actor who made them or an admin. */
export interface RecordOwner {
  key: string            // `${collection}/${id}`
  person: string | null
}

/* One timeline entry (design §3.1). Built incrementally from the stream as the
   closure's envelopes arrive (the user root first, its projection children
   after, all within one synchronous commit drain). */
export interface UndoEntry {
  seq: number               // the user envelope's seq — the entry's identity
  scope: Scope              // primary display destination for the snap (§8)
  contexts: RecordCtx[]     // ALL storage contexts from the closure's record ids
  actor: Actor              // WHO — snapshot at commit; role AND personId gate reversal (§5)
  type: string
  label: string             // plain-words description for the bubble (§8.2)
  owners: RecordOwner[]     // per-change ownership, derived at forward time (§5)
  inverse: Change[]         // invert(), reverse order, NEVER coalesced (R2-14)
  forward: Change[]         // the closure's forward changes, in order
  revs: Record<string, number>  // the closure's post-commit revisions (seeds §4)
  boundary?: Boundary       // present on publish/unpublish entries (§6)
  eligible: boolean         // false until the entry's module(s) are cut over (§7)
  undone: boolean
  undoneAt?: number         // monotonic stamp for the redo LIFO pick (R3-06)
  /* the seq of the restore that undid it — Redo's out-of-band barrier counts from here (D148; the change-recording plan
     B6.4: a change someone else made while the step stood undone refuses its redo, naming who) */
  undoneSeq?: number
  /* WHEN, by the clock (fix read 10, fault E — O10-1, Fable F10-5): `madeAt` the moment the step was made, `undoneOn` the
     moment its Undo went through. A right an Undo puts back went off on the step's own day; one a Redo puts back went off
     on the day of the Undo that took it off — the redate hook keeps the right's recorded day only when its man has not
     moved squadron since then (state/perms.ts restoreRedated) */
  madeAt?: number
  undoneOn?: number
  /* (fix read 11, fault G — F11-5a): the moment its latest Redo went through — the step made again, so a right that
     Redo took off went off THEN, and an Undo after it reads this before `madeAt` */
  redoneOn?: number
  /* (fix read 12, fault E — Astra 2): each record as it STOOD just before the latest restore in that direction wrote it
     (key `collection/id`) — a right or a link that restore took away kept the day an earlier restore had given it, and
     the restore that reverses it puts that day back, never its step's older recorded one (state/perms.ts restoreRedated) */
  stoodBefore?: { undo?: Record<string, unknown>; redo?: Record<string, unknown> }
  /* the text box a `sched.text` wrote (the envelope's `detail`) — Undo's words read it (describe.ts; B8) */
  detail?: string
  /* an undone entry a later NEW change forked away from (§4.3: "any newer entry committed after
     E's undo shares a key" — permanently, not only while that newer entry stands). It is never
     redone and never blocks a redo (walk W3 F-w3-2, 24 Sep 26). Still `undone` for every other reader. */
  abandoned?: boolean
  /* D1263 — the record keys this step changed on a Leave War day already closed for its maker when he made it (the
     `closedAtStep` hook, asked as the step was recorded). Only an Undo of such a step may put a bid back there. */
  closedAt?: string[]
  /* A-v (the reshape plan §3.2) — the squadron each world it wrote held when it was made (the envelope's stamp, its folded
     children's added): its Leave War and Tracker records are keyed by it (derive.ts recordKey), and it is eligible only
     while each of those worlds holds that squadron again. Absent: no world door, or a step that wrote neither world. */
  stamp?: Record<string, string>
}

export type { Actor, Boundary, Change, Scope, Module }
