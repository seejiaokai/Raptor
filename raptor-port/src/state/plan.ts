/* ---------------------------------------------------------------------------
   SCHEDULER PLANNING LAYER — the Inputs page's new month-calendar view.
   A scratch pad a scheduler drops loose to-dos and one-line day remarks onto
   while eyeballing a month at a time; neither touches a slot, a wave or an
   input record, so the flying/duty machinery never reads either of these.

   SAVED since the storage seam (8 Sep 26): PLANPUCKS and DAYRMK ride the
   whiteboard as the `plan` record (state/persist.ts), written on every
   history step exactly like INPUTS, which this calendar sits directly on top
   of. Before the seam both were session-only by the owner's choice (a reload
   started clean); with INPUTS persisted the scratch pad persists with it, and
   a logout no longer clears it (resetSession — clearing the memory copy
   destroyed the saved one on the next edit). Still never wired through
   HOOKS.storeBackend directly: the seam is the one door.

   IMPORT-GRAPH CONSTRAINT: this file imports ONLY from ./auth (itself a leaf
   module) and engine/newid (a zero-import module). history.ts imports PLANPUCKS/DAYRMK to ride them on the undo
   snapshot, and ui/ imports the mutators below — keeping this module
   leaf-like is what keeps neither of those from ever closing into a cycle.

   Every mutator below returns a boolean: true when it actually wrote
   something, false when it was refused (not an admin) or a no-op (nothing to
   change). None of them call notify/histPush/reflow themselves — the caller
   (the calendar UI) wraps the call in writeInputs, the same funnel every
   other Inputs-page write already goes through, so history and repaint
   happen exactly once, in one place. */
import { canEditSched } from './auth'
import { newId } from '../engine/newid'

/* one SECTION dropped on a day, addressed by its own id rather than its
   position, the same reason inpId exists (engine/inputs.ts): an array a
   caller can unshift into must never be addressed by index. ONE kind since
   D684 (9 Oct 26 — "a function to add pucks on the text written, instead of a
   +pucks button"): a NOTE — `text` its words, `ids` its people (PEOPLE ids,
   '' a gap), either or both, never neither. From 22 Aug 26 until then there
   were two (a note, and a PUCKS row `kind:'pucks'`): a record saved as one
   still loads — it is a note with people and no words — and no reader asks
   a section its `kind` any more. The name PLANPUCKS predates all of it and is
   kept: history.ts and the tests hold this binding. */
export const PLANPUCKS: any[] = []
/* ISO date ('yyyy-mm-dd') -> the day's free-text TITLE (owner, 22 Aug 26 —
   typed beside the date in the day popover, shown as the cell's own heading
   on the month view, wrapping). This is the same store that carried the old
   "Day remark" — one line of per-day scheduler text — promoted to a title;
   the name is kept because history.ts's `dm` snapshot key and the tests
   hold it. */
export const DAYRMK: Record<string, string> = {}

/* mints ids the way inpId mints iids (engine/inputs.ts) — the app's one opaque minter, random, never a per-browser
   counter ([DB-READINESS] group A, phase 2 — F2-07): once each note is its own stored row, two schedulers adding a note
   from two browsers booted from one store would both have minted 'pp1' and written the same row. A note saved before
   keeps its old id. */
function nextPuckId() { return newId('pp') }

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

/* THE PEOPLE A SECTION CARRIES — read the same way by every door: its `ids`, whatever `kind` it was saved with. Since
   D684 (9 Oct 26) there is ONE kind of section, a note with words, people, or both; a record saved as the old pucks
   row (`kind:'pucks'`, his asks of 22–24 Aug 26) is a note with people and no words, and loads as one (D56). */
const idsOf = (p: any): string[] => Array.isArray(p.ids) ? p.ids : (p.ids = [])
const hasPeople = (p: any) => Array.isArray(p.ids) && p.ids.some(Boolean)
const hasWords = (p: any) => !!String(p.text == null ? '' : p.text).trim()

/* drop a new NOTE on a day — its words, its people, or both (owner D684: "a function to add pucks on the text
   written"; D695: a note may hold people and no words). One with NEITHER is refused: it says nothing and would only
   sit there as a blank box. The people may come as the picker's batch — deduped, since its category buttons can pick
   a man twice. Unshifts, in the LATE-arriving-first-in-the-list convention the rest of the app uses (engine/inputs.ts's
   own add()). */
export function addPlanPuck(iso: string, text: string, ids?: string[]) {
  if (!canEditSched()) return false
  const t = String(text == null ? '' : text).trim()
  const who = [...new Set((ids || []).filter(Boolean))]
  if (!t && !who.length) return false
  PLANPUCKS.unshift({ id: nextPuckId(), date: iso, text: t, ...(who.length ? { ids: who } : {}) })
  return true
}

/* rewrite a note's words in place. Emptying them out is refused where the note has no people — delete is
   removePlanPuck's job, a distinct verb with a distinct undo step, not a side door this one falls into. A note WITH
   people may lose its words and stay, as its people alone (D695 — "the pencil adds words later"). */
export function editPlanPuck(id: string, text: string) {
  if (!canEditSched()) return false
  const p = PLANPUCKS.find((x: any) => x.id === id)
  if (!p) return false
  const t = String(text == null ? '' : text).trim()
  if (!t && !hasPeople(p)) return false
  if (String(p.text == null ? '' : p.text) === t) return false
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

/* ---- a note's people (owner D684, 9 Oct 26; the pucks row of 22–24 Aug 26 before it) ---------------------------- */

/* add SEVERAL people to a note in one write (the picker's OK) — only those not already on it, so re-adding is a
   no-op rather than a duplicate. Returns whether anything landed. */
export function addPuckPeople(id: string, personIds: string[]) {
  if (!canEditSched()) return false
  const p = PLANPUCKS.find((x: any) => x.id === id)
  if (!p) return false
  const ids = idsOf(p)
  let added = false
  for (const pid of personIds) if (pid && !ids.includes(pid)) { ids.push(pid); added = true }
  return added
}

/* add/remove one person on a note — one verb, because the UI is one control (pick a name to add it, drag it off /
   right-click to drop it) and two mutators would be two write paths for one gesture.
   REMOVAL LEAVES A GAP, not a splice (owner, 24 Aug 26 — "when I remove the added pucks the rest of the pucks that
   was in place will not move … the space that was empty will remain empty"): the slot is blanked to '' so every
   surviving puck keeps its grid position, and only TRAILING blanks are trimmed so the note never carries dead cells
   past its last puck. A blank is skipped by every reader (`ids.filter(Boolean)`) and never reaches the engine. The
   planning layer IS persisted (corrected 17 Sep 26): a trailing blank is trimmed before it can be stored; an interior
   blank does persist, and must, or surviving pucks would shift position on reload. Adds still append.
   THE LAST MAN OFF A NOTE WITH NO WORDS TAKES THE NOTE WITH HIM (D695's reading: a note with neither words nor people
   is not kept) — the old pucks row stayed as an empty band for the scheduler to delete; there is nothing to keep. */
export function togglePuckPerson(id: string, personId: string) {
  if (!canEditSched()) return false
  const p = PLANPUCKS.find((x: any) => x.id === id)
  if (!p || !personId) return false
  const ids = idsOf(p)
  const ix = ids.indexOf(personId)
  if (ix >= 0) {
    ids[ix] = ''
    while (ids.length && !ids[ids.length - 1]) ids.pop()
    if (!ids.length && !hasWords(p)) PLANPUCKS.splice(PLANPUCKS.indexOf(p), 1)
  } else ids.push(personId)
  return true
}

/* SWAP two slots of a note's people (owner, 24 Aug 26 — "shift the pucks around … when I move pucks over each other
   it will swap the crew"). Dragging a puck onto another exchanges the two; dropping it onto an empty slot moves it
   there (the blank rides back to the vacated slot). Trailing blanks are trimmed after, exactly as a removal does, so
   moving the last puck earlier doesn't leave a dangling empty cell — internal gaps still hold their place. */
export function movePuckPerson(id: string, from: number, to: number) {
  if (!canEditSched()) return false
  const p = PLANPUCKS.find((x: any) => x.id === id)
  if (!p) return false
  const ids = idsOf(p)
  if (from === to || from < 0 || to < 0 || from >= ids.length || to >= ids.length) return false
  const t = ids[from]; ids[from] = ids[to]; ids[to] = t
  while (ids.length && !ids[ids.length - 1]) ids.pop()
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
