import { DAYS } from './data'
import { SCHED, dayApproved, verLabel } from './publish'
import { keyDay } from './keys'

/* PER-DAY ALTERNATE DRAFTS (owner ask, 15 Aug 26 — "allow me to duplicate the
   current day's schedule and edit over it… if one variable change, they can
   select Draft 2… it is not limited to just three").

   A draft is an ALTERNATE CONTENT BLOB for one day, made before that day is
   published. The live DAYS[di] IS the working copy of the SELECTED draft —
   there is no shadow copy being edited somewhere else. Switching drafts stows
   the live day back into the selected entry's blob, then loads the other blob
   in as the live day. Publishing needs no change at all: setDayApproved
   publishes whatever is live, which is by construction the selected draft —
   that is the whole point of the shape.

   State rides SCHED (engine/publish.ts) rather than a module of its own:
     SCHED.drafts   — {di: [{id, name, d}]}   the day's blobs
     SCHED.curDraft — {di: id}                which entry the live day IS
   so it serializes with undo exactly like the AL records do —
   state/history.ts's histSnap/histApply carry both fields explicitly. Like
   the AL list, none of it persists past the session.

   A blob `d` is a deep clone of the WHOLE day object (daySnap's JSON idiom) —
   content only, never a changes slice: a draft is pre-publish by definition,
   so there are no issued marks that could belong to it. The logic lives here,
   not in publish.ts, so that file's verbatim body stays lean; publish.ts's own
   daySnapOf gained the one 'd:<id>' resolution branch (the preview machinery
   reads snapshots only through it), and everything else imports from there. */

export const MAX_DRAFT_NAME = 24

const clone = (o: any) => JSON.parse(JSON.stringify(o))

/* the day's draft list — empty array (not undefined) when the day has none,
   so every caller can .map/.length without a guard */
export function dayDrafts(di: any): any[] {
  return ((SCHED.drafts || {})[+di]) || []
}

/* which entry the live day currently is, or undefined when the day has no
   drafts (or the stamp went stale under a hand-edit — callers treat that the
   same as "no selection", and the next dup/select restamps it) */
export function curDraftId(di: any) {
  return (SCHED.curDraft || {})[+di]
}

/* 'd:<id>' — the version-string shape daySnapOf resolves for a draft preview */
export function isDraftVer(ver: any) {
  return typeof ver === 'string' && ver.slice(0, 2) === 'd:'
}

/* the label a version string reads as wherever versions are labelled: a
   draft ver names its draft, everything else stays verLabel's business */
export function draftVerLabel(di: any, ver: any) {
  if (!isDraftVer(ver)) return verLabel(ver)
  const t = dayDrafts(di).find((x: any) => 'd:' + x.id === ver)
  return t ? t.name : 'Draft'
}

/* ids are per-day (the list lives under its day key and DPREV's 'd:<id>'
   entries are per-day too), minted as max numeric suffix + 1 over the day's
   OWN list rather than a module counter — deterministic across the histApply
   round trips a module counter would not survive, and two days reusing 'dr1'
   can never meet. */
const newId = (list: any[]) => {
  let n = 0
  list.forEach((t: any) => { const m = /^dr(\d+)$/.exec(String(t.id)); if (m) n = Math.max(n, +m[1]!) })
  return 'dr' + (n + 1)
}

/* the next default name: highest existing "Draft N" + 1, so renaming Draft 2
   to "Wet weather" then duplicating again still mints "Draft 3", and deleting
   Draft 2 never lets a later mint collide with a surviving Draft 3 */
const nextNum = (list: any[]) => {
  let n = 0
  list.forEach((t: any) => { const m = /^Draft (\d+)$/.exec(String(t.name)); if (m) n = Math.max(n, +m[1]!) })
  return n + 1
}

/* Duplicate the live day into a new draft and switch the working copy to it.
   FIRST ever call on a day: the live day is stowed as "Draft 1" AND a copy is
   minted as "Draft 2", selected — one tap turns "the schedule" into two named
   alternatives, which is the owner's own phrasing of the feature. Later
   calls: stow live into the selected entry, mint "Draft N" as a copy of live,
   select it.
   REFUSES on a published day (returns null; the caller toasts "Reopen the day
   first") — the same refusal, for the same reason, as applyDayTpl: a draft is
   an alternative to a plan still being made, and minting/switching under a
   live issued document would let the day silently diverge from what the
   squadron holds with no pending mark and no AL trail. The reopen-first flow
   keeps the amendment machinery the only path that changes a published day.
   No histPush/reflow here — the UI caller's afterSchedMutate() owns the one
   undo step, the same contract restoreDayVersion and applyDayTpl carry. */
export function draftDup(di: any) {
  di = +di
  if (!DAYS[di] || dayApproved(di)) return null
  SCHED.drafts = SCHED.drafts || {}
  SCHED.curDraft = SCHED.curDraft || {}
  const list = SCHED.drafts[di] = SCHED.drafts[di] || []
  if (!list.length) {
    list.push({ id: newId(list), name: 'Draft 1', d: clone(DAYS[di]) })
    const t = { id: newId(list), name: 'Draft 2', d: clone(DAYS[di]) }
    list.push(t)
    SCHED.curDraft[di] = t.id
    return t
  }
  const cur = list.find((x: any) => x.id === SCHED.curDraft[di])
  if (cur) cur.d = clone(DAYS[di])
  const t = { id: newId(list), name: 'Draft ' + nextNum(list), d: clone(DAYS[di]) }
  list.push(t)
  SCHED.curDraft[di] = t.id
  return t
}

/* Switch the live day to another draft: stow live into the currently-selected
   entry, install a CLONE of the target blob as DAYS[di] (a clone, so editing
   the live day never reaches back into the stowed copy), re-stamping `.today`
   from the live day — 'today' tracks the calendar, not the document (the
   restoreDayVersion precedent, engine/restore.ts:90-110). The day's own
   SCHED.pending/SCHED.added keys are retired the same way restoreDayVersion
   retires them: the swap does not line up old and new row indices, so a stale
   address may now point at a different row entirely — each draft's edits were
   recorded while IT was live and stop meaning anything the moment it is not.
   (Draft days carry no changes-marks worth special-casing — the published-day
   refusal below keeps it that way, same reasoning as applyDayTpl's.)
   Deliberately NO histPush and NO reflow — the UI caller's afterSchedMutate()
   is the single undo step, exactly the restore/applyDayTpl contract.
   Refuses (returns false): unknown id, already-selected id (nothing to do,
   and "stow then reload yourself" must not clobber live edits with a stale
   stow), or a published day (see draftDup above). */
export function draftSelect(di: any, id: any) {
  di = +di
  if (!DAYS[di] || dayApproved(di)) return false
  const list = dayDrafts(di)
  const t = list.find((x: any) => x.id === id)
  if (!t) return false
  const curId = curDraftId(di)
  if (id === curId) return false
  const cur = list.find((x: any) => x.id === curId)
  /* a stale/missing selection stamp means there is no entry that owns the
     live content — skip the stow rather than guess which blob to overwrite */
  if (cur) cur.d = clone(DAYS[di])
  const nd = clone(t.d)
  nd.today = !!(DAYS[di] && DAYS[di].today)
  DAYS[di] = nd
  Object.keys(SCHED.pending).forEach((k: any) => { if (keyDay(k) === di) delete SCHED.pending[k] })
  Object.keys(SCHED.added || {}).forEach((k: any) => { if (keyDay(k) === di) delete SCHED.added[k] })
  SCHED.curDraft = SCHED.curDraft || {}
  SCHED.curDraft[di] = id
  return true
}

/* rename: trimmed, 1..24 chars, and never a duplicate within the day — two
   drafts answering to one name would make the switch toast, the version
   labels and the picker ambiguous at once */
export function draftRename(di: any, id: any, name: any) {
  di = +di
  const list = dayDrafts(di)
  const t = list.find((x: any) => x.id === id)
  if (!t) return false
  const nm = String(name == null ? '' : name).trim().slice(0, MAX_DRAFT_NAME)
  if (!nm) return false
  if (list.some((x: any) => x.id !== id && x.name === nm)) return false
  t.name = nm
  return true
}

/* delete: any entry EXCEPT the selected one — the selected draft IS the live
   day, and deleting the thing being edited from underneath itself is exactly
   the ambiguity this refusal exists to prevent (the caller toasts "Switch to
   another draft first"). A list holding one entry is legal: deleting the
   others just leaves the selected plan as the only named one. */
export function draftDelete(di: any, id: any) {
  di = +di
  if (id === curDraftId(di)) return false
  const list = dayDrafts(di)
  const i = list.findIndex((x: any) => x.id === id)
  if (i < 0) return false
  list.splice(i, 1)
  return true
}
