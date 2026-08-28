// The cycle a leave war moves through, and what each stage allows.
//
// It runs forward on its own and an ADMIN can step it back (owner, 10 Aug 26:
// "as an admin I can open bidding again after closing it").
//
// It was forward-only before that, and the reason was real rather than
// arbitrary: a bid arriving after a decision has been made is exactly the
// confusion a cycle with stages exists to prevent, and the old comment here
// said "a period that needs reopening is a new period". What that missed is
// the ordinary case — bidding closes while somebody is on detachment, and a
// whole new war is a heavy answer to one late input.
//
// Two things keep the original guarantee mostly intact, and both matter more
// than the transition itself:
//
//   - **Stepping back is admin-only.** Going forward is not, which is a real
//     asymmetry (see `docs/known-gaps.md`); reversing the cycle is the half
//     worth holding to the account that runs the war.
//   - **Nothing is erased.** The stage is one field. An approved bid stays
//     approved and a refused one stays refused across a reopen, so "why did
//     this change after I bid" still has an answer: it changed because
//     somebody reopened the war, not because the record was rewritten.

import { inBidWindow, type Period, type Stage } from './period'

// Frozen, and typed `readonly`, because an exported array is mutable by
// whoever imports it: a caller who sorted or reversed it in place would
// silently rewrite the cycle for the whole app, and `nextStage` reads this
// same array. Frozen it throws at the mutation instead, which is where the
// bug is rather than three screens away in a wrong transition.
export const STAGE_ORDER: readonly Stage[] = Object.freeze<Stage[]>([
  'draft',
  'open',
  'closed',
  'published',
])

const LABEL: Record<Stage, string> = {
  draft: 'DRAFT',
  open: 'OPEN FOR BIDDING',
  closed: 'BIDDING CLOSED',
  published: 'PUBLISHED',
}

export function nextStage(stage: Stage): Stage | null {
  const i = STAGE_ORDER.indexOf(stage)
  return i < 0 || i === STAGE_ORDER.length - 1 ? null : STAGE_ORDER[i + 1]
}

/** One stage back, or `null` at draft. Reads the same frozen order as
 *  `nextStage` so the two cannot describe different cycles. */
export function previousStage(stage: Stage): Stage | null {
  const i = STAGE_ORDER.indexOf(stage)
  return i <= 0 ? null : STAGE_ORDER[i - 1]
}

/**
 * Whether this role may step the period back from this stage.
 *
 * Admin only, and never from draft — the beginning of the cycle is not a
 * place you return to, it is where you already are. Asked by the store before
 * it moves anything and by the strip before it draws the control, so the
 * refusal and the affordance cannot disagree.
 */
export function canReopen(stage: Stage, role: Role): boolean {
  return role === 'admin' && previousStage(stage) !== null
}

/**
 * Two roles, per the spec's §Roles. The scheduler and management both hold
 * the admin account — the further split between them is a distinction the
 * owner draws in conversation, and it needs real accounts before it can mean
 * anything here.
 *
 * There is no login, so nothing verifies which of these a person actually
 * is. This is the affordance model, not a permission model — see
 * `docs/known-gaps.md`.
 */
export type Role = 'member' | 'admin'

/**
 * Whether this role may write cells at this stage.
 *
 * A member edits only while the war is open, so **closing it is what makes
 * the sheet view-only for the squadron** — there is no second lock that
 * could be left unapplied. An admin edits throughout, because the reason for
 * closing is to stop the picture moving underneath the people deciding on
 * it, not to stop those people correcting it.
 */
export function canEdit(stage: Stage, role: Role): boolean {
  return role === 'admin' || stage === 'open'
}

/**
 * Whether this role may write THIS CELL — stage, role and the bidding window
 * together.
 *
 * A separate function rather than a wider `canEdit`, deliberately. `canEdit`
 * answers "is the sheet writable at all", which is what the stage strip and
 * the role toggle ask and what four files already read; this answers "is that
 * particular day writable", which only the grid asks. Widening the first
 * would have made every caller pass a date it does not have.
 *
 * **An admin is not bound by the window.** The window exists to stop the
 * squadron bidding on months the schedule has not reached — it is not a lock
 * on the people running the war, who close it precisely so they can work on
 * it without the picture moving underneath them.
 */
export function canEditCell(period: Period, role: Role, date: string): boolean {
  if (!canEdit(period.stage, role)) return false
  return role === 'admin' || inBidWindow(period, date)
}

/**
 * Whether this role may write THIS PERSON'S row.
 *
 * A member edits only their OWN row — the person they are viewing as, which
 * the war mirrors from Raptor's "View as" into `viewer`. An admin edits any
 * row. This is the ROW half of the permission, the companion to
 * `canEditCell`'s stage/window/date half: a cell is writable only when BOTH
 * pass, and it is checked at the store's write path as well as the grid's
 * affordance, because the interface hiding a control is not the same as the
 * store refusing the write.
 *
 * A separate pure predicate rather than folding the row into `canEditCell`,
 * for the same reasons `canEditCell` is itself separate from `canEdit`: it
 * answers a different question ("whose row", not "which day"), it reads state
 * — `viewer` — the date check never needed, and one body keeps the grid and
 * the store from drifting apart. In this prototype the identity IS the "View
 * as" selection (there is no login); the future server replaces `viewer` with
 * the real account and this rule is unchanged.
 *
 * `viewer === null` means the session is NOT scoped to any person — an
 * un-scoped view, which imposes no "other people's rows" to protect, so the
 * row rule does not bite. Production never reaches it for a real user: the
 * "View as" picker is a person selector with no empty option, and the war
 * boot mirrors that selection (Raptor's `ME`, itself always a person) into
 * `viewer` before the grid renders. It is only the raw-store / test state.
 *
 * Owner, 27 Aug 26 — "if I am viewing as a member and I view as ranger on the
 * leave war, I shouldn't be able to input on other people's row except mine"
 * (there, `viewer` is 'ranger' — non-null — so the rule bites).
 */
export function canEditRow(role: Role, viewer: string | null, personId: string): boolean {
  return role === 'admin' || viewer === null || personId === viewer
}

/** Decisions are made once bidding has closed and the picture has frozen —
 *  not while bids are still arriving underneath them — and only by an
 *  admin. A member watching the same screen sees the outcome, not the
 *  buttons.
 *
 *  Published counts too (owner, 27 Aug 26 — "if leave war is published, the
 *  admin can still have these functions"): publishing freezes the picture for
 *  the squadron, but the admin still runs it, so a late change tapped in after
 *  publication can be approved/refused/moved exactly as at closed. The gate is
 *  "bidding is no longer open", not "the stage is closed". */
export function canDecide(stage: Stage, role: Role): boolean {
  return role === 'admin' && biddingClosed(stage)
}

/** "Bidding is no longer open" — the squadron can no longer freely place and
 *  shuffle bids, so a decision, and a MOVE that leaves a permanent trace, both
 *  become meaningful. Closed and published are one state for this purpose (see
 *  canDecide). One body so the decision gate, the move-provenance record and
 *  the grid's "moved" mark cannot drift apart on when a move counts. */
export function biddingClosed(stage: Stage): boolean {
  return stage === 'closed' || stage === 'published'
}

export function stageLabel(stage: Stage): string {
  return LABEL[stage]
}
