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

/* one puck dropped on a day — a plain to-do, addressed by its own id rather
   than its position, the same reason inpId exists (engine/inputs.ts): an
   array a caller can unshift into must never be addressed by index. */
export const PLANPUCKS: any[] = []
/* ISO date ('yyyy-mm-dd') -> one-line scheduler remark for that day */
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
