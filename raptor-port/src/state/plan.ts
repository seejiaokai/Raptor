/* ---------------------------------------------------------------------------
   SCHEDULER PLANNING LAYER — the Inputs page's new month-calendar view.
   A scratch pad a scheduler drops loose to-dos and one-line day remarks onto
   while eyeballing a month at a time; neither touches a slot, a wave or an
   input record, so the flying/duty machinery never reads either of these.

   DELIBERATELY SESSION-ONLY — never wired through HOOKS.storeBackend or
   localStorage. INPUTS itself is session-only (engine/inputs.ts is reseeded
   every boot; the Leave War merge deliberately matched that on 17 Aug 26 —
   see CLAUDE.md's "session-only since 17 Aug 26"), and this calendar sits
   directly on top of INPUTS. The owner's choice here is the same scratch-pad
   semantics: a reload starts clean rather than carrying half-planned pucks
   nobody has committed to anything yet.

   IMPORT-GRAPH CONSTRAINT: this file imports ONLY from ./auth (itself a leaf
   module). history.ts imports PLANPUCKS/DAYRMK to ride them on the undo
   snapshot, and ui/ imports the mutators below — keeping this module
   leaf-like is what keeps neither of those from ever closing into a cycle.

   Every mutator below returns a boolean: true when it actually wrote
   something, false when it was refused (not an admin) or a no-op (nothing to
   change). None of them call notify/histPush/reflow themselves — the caller
   (the calendar UI) wraps the call in writeInputs, the same funnel every
   other Inputs-page write already goes through, so history and repaint
   happen exactly once, in one place. */
import { canEditSched } from './auth'

/* one SECTION dropped on a day, addressed by its own id rather than its
   position, the same reason inpId exists (engine/inputs.ts): an array a
   caller can unshift into must never be addressed by index. Two kinds since
   22 Aug 26 (owner's popover redesign): a NOTE (`kind` absent or 'note' —
   free text, the original planning-note shape, so every pre-existing entry
   reads as one unchanged) and a PUCKS row (`kind:'pucks'`, `ids` a list of
   person ids — "add pucks into it"). The name PLANPUCKS predates the split
   and is kept: history.ts and the tests hold this binding. */
export const PLANPUCKS: any[] = []
/* ISO date ('yyyy-mm-dd') -> the day's free-text TITLE (owner, 22 Aug 26 —
   typed beside the date in the day popover, shown as the cell's own heading
   on the month view, wrapping). This is the same store that carried the old
   "Day remark" — one line of per-day scheduler text — promoted to a title;
   the name is kept because history.ts's `dm` snapshot key and the tests
   hold it. */
export const DAYRMK: Record<string, string> = {}

/* mints ids the same way inpId mints iids (engine/inputs.ts) — monotonic
   within the session, so a puck created after a history snapshot can never
   collide with one a replay of that snapshot hands back. */
let PPN = 0
function nextPuckId() { return 'pp' + (++PPN) }

/* the day's one-line scheduler remark. Trims; an emptied-out remark DELETES
   the key rather than storing '' — a lingering empty string would read as
   "there is a remark, and it says nothing" to any caller that just checks
   the key's presence, which is not the same as "no remark filed". */
export function setDayRemark(iso: string, text: string) {
  if (!canEditSched()) return false
  const t = String(text == null ? '' : text).trim()
  const had = Object.prototype.hasOwnProperty.call(DAYRMK, iso)
  if (!t) {
    if (!had) return false
    delete DAYRMK[iso]
    return true
  }
  if (had && DAYRMK[iso] === t) return false
  DAYRMK[iso] = t
  return true
}

/* drop a new puck on a day. Refuses empty text outright — an empty puck says
   nothing and would only sit there as a blank box on the day; unshifts, in
   the LATE-arriving-first-in-the-list convention the rest of the app uses
   (engine/inputs.ts's own add()). */
export function addPlanPuck(iso: string, text: string) {
  if (!canEditSched()) return false
  const t = String(text == null ? '' : text).trim()
  if (!t) return false
  PLANPUCKS.unshift({ id: nextPuckId(), date: iso, text: t })
  return true
}

/* rewrite a puck's text in place. Emptying it out is refused here — delete
   is removePlanPuck's job, a distinct verb with a distinct undo step, not a
   side door this one falls into. */
export function editPlanPuck(id: string, text: string) {
  if (!canEditSched()) return false
  const p = PLANPUCKS.find((x: any) => x.id === id)
  if (!p) return false
  const t = String(text == null ? '' : text).trim()
  if (!t) return false
  if (p.text === t) return false
  p.text = t
  return true
}

/* drag/redate a puck onto a different day */
export function movePlanPuck(id: string, iso: string) {
  if (!canEditSched()) return false
  const p = PLANPUCKS.find((x: any) => x.id === id)
  if (!p) return false
  if (p.date === iso) return false
  p.date = iso
  return true
}

export function removePlanPuck(id: string) {
  if (!canEditSched()) return false
  const ix = PLANPUCKS.findIndex((x: any) => x.id === id)
  if (ix < 0) return false
  PLANPUCKS.splice(ix, 1)
  return true
}

/* ---- the pucks-row section (owner, 22 Aug 26 — "+pucks button to enable me
   to add pucks into it … using the full width") ----------------------------- */

/* an EMPTY pucks row is legal on creation — unlike a note, its content is
   added by picking people one at a time, so refusing empty would refuse the
   only way to start one. Appends (not unshifts): the owner arranges section
   order by hand, and a new section belongs at the end of what is already
   arranged, not on top of it. */
export function addPuckRow(iso: string, ids?: string[]) {
  if (!canEditSched()) return false
  /* an initial roster may come from the multi-select picker (owner, 23 Aug 26
     — "select a few pucks at 1 go … then press ok"): dedupe it, since the
     picker's category buttons can select the same person twice. Absent ids
     keep the empty-row-on-creation behaviour the + Pucks button always had. */
  const seed = ids ? [...new Set(ids)] : []
  PLANPUCKS.push({ id: nextPuckId(), date: iso, kind: 'pucks', ids: seed })
  return true
}

/* add SEVERAL people to an existing pucks row in one write (the picker's OK) —
   only those not already on the row, so re-adding is a no-op rather than a
   duplicate. Returns whether anything landed. */
export function addPuckPeople(id: string, personIds: string[]) {
  if (!canEditSched()) return false
  const p = PLANPUCKS.find((x: any) => x.id === id)
  if (!p || p.kind !== 'pucks') return false
  const ids: string[] = p.ids || (p.ids = [])
  let added = false
  for (const pid of personIds) if (pid && !ids.includes(pid)) { ids.push(pid); added = true }
  return added
}

/* add/remove one person on a pucks row — one verb, because the UI is one
   control (pick a name to add it, drag it off / right-click to drop it) and
   two mutators would be two write paths for one gesture. Refuses a note
   section: `ids` on a note would be silent garbage nothing renders.
   REMOVAL LEAVES A GAP, not a splice (owner, 24 Aug 26 — "when I remove the
   added pucks the rest of the pucks that was in place will not move …
   the space that was empty will remain empty"): the slot is blanked to ''
   so every surviving puck keeps its grid position, and only TRAILING blanks
   are trimmed so the row never carries dead cells past its last puck. A blank
   is skipped by every reader (`ids.filter(Boolean)`), never persisted (this
   state is session-only), and never reaches the engine. Adds still append. */
export function togglePuckPerson(id: string, personId: string) {
  if (!canEditSched()) return false
  const p = PLANPUCKS.find((x: any) => x.id === id)
  if (!p || p.kind !== 'pucks' || !personId) return false
  const ids: string[] = p.ids || (p.ids = [])
  const ix = ids.indexOf(personId)
  if (ix >= 0) {
    ids[ix] = ''
    while (ids.length && !ids[ids.length - 1]) ids.pop()
  } else ids.push(personId)
  return true
}

/* reorder one day's sections by drag (owner, 22 Aug 26 — "the admin is able
   to shift these up and down by drag and dropping"). `beforeId` null means
   the end of that day's run. Same-day only: a cross-day move is caldrag's
   movePlanPuck, a different verb with a different meaning. The splice works
   on the GLOBAL array but computes its target from the day's own sequence,
   so sections of other days are never disturbed. */
export function movePlanSection(id: string, beforeId: string | null) {
  if (!canEditSched()) return false
  const p = PLANPUCKS.find((x: any) => x.id === id)
  if (!p || id === beforeId) return false
  const before = beforeId ? PLANPUCKS.find((x: any) => x.id === beforeId) : null
  if (beforeId && (!before || before.date !== p.date)) return false
  const from = PLANPUCKS.indexOf(p)
  PLANPUCKS.splice(from, 1)
  if (before) {
    const to = PLANPUCKS.indexOf(before)
    PLANPUCKS.splice(to, 0, p)
    if (PLANPUCKS.indexOf(p) === from) return false // landed where it began — no-op
  } else {
    /* to the end of THIS day's run: after the last same-day section, which
       (with the day's sections contiguous or not) is simply after the last
       entry carrying this date. */
    let last = -1
    PLANPUCKS.forEach((x: any, i: number) => { if (x.date === p.date) last = i })
    PLANPUCKS.splice(last + 1, 0, p)
    if (PLANPUCKS.indexOf(p) === from) return false
  }
  return true
}

/* the session-reset hook (state/store.ts's resetSession) — NOT a user verb,
   so it carries no canEditSched gate, the same as view.ts's LATEOFF/WARNOFF
   clears there. Both stores are emptied IN PLACE (length=0 / delete each
   key) rather than reassigned: ESM cannot reassign an exported binding from
   outside its own module, and every reader (history.ts, the calendar UI)
   holds these two identities for the life of the session. */
export function clearPlan() {
  PLANPUCKS.length = 0
  for (const k of Object.keys(DAYRMK)) delete DAYRMK[k]
}
