/* THE PICK — the Schedules menu's one act (ui/SquadronMenu.tsx; the second-half plan §3 item 3): the squadron picked comes
   into view, every page that follows it with it, through state/store.ts enterSquadron — the path sign-in and midnight
   take (an open Leave War window holds the war's step, state/typing-hold.ts). Navigation, not a command: nothing saved,
   the Undo list untouched (D148).
   UNSAVED CHART EDITS ARE ASKED ABOUT FIRST (§16 D2′; his D2318, kept by D2395 — the drawing f2d): the Tracker follows the
   squadron picked, so a pick that moves his own pages off it (state/perms.ts ownPageIfPicked) would take it away from
   those edits. The Tracker asks "Save them before switching to 142?" — Save them, Discard them, Stay — where he is
   (tracker/role.js trackerSwitchAsk); the pick goes on only after Save or Discard. With nothing to ask the pick is made at
   once, as before.
   A SQUADRON HE ONLY VIEWS ASKS TOO (his D2637): his own pages stay his squadron's there, but while it is picked he is
   offered only its View-only Sched and Help (D2381), so the Tracker holding the edits is out of reach until he picks his
   own back. The same question, from the top bar and the ☰ menu alike. The member-view switch is not a pick: it comes
   through state/store.ts switchRoleView, never here, and asks nothing. */
import { UNIT } from '../engine/unitview'
import { enterSquadron, notify } from './store'
import { holdNow } from './typing-hold'
import { trkUnitNow, ownPageIfPicked, ownPageMayBe } from './perms'
import { unitById } from './units'
import { trackerSwitchAsk, trackerSwitchNeeds } from '../tracker/role.js'
import { refuse, refusalAt, closeShown, type GuardOpts } from './guard'
import { saveGoing, waitForSave, dropDoorWait } from './doorwait'

/* the pick would move the Tracker off the squadron it is on — his pages leave it, or it is held there for chart work while
   his pages are elsewhere (the member view, D2395) — or bring up a squadron he only views, where the Tracker is not
   offered (D2637, D2381). The bell's entry never reaches the last: it stops first at a squadron his own pages may not be
   (state/belltap.ts enterForLine). */
function movesTrackerAway(u: string): boolean {
  const bound = trkUnitNow()
  return !!bound && (ownPageIfPicked(u) !== bound || !ownPageMayBe(u))
}
/** the Tracker's question before a pick of `u`: null — nothing to ask (no Tracker loaded, the pick leaving his pages on
 *  it with the Tracker still offered, no unsaved edit); else a promise, true to go on */
export function askBeforeEntering(u: string): Promise<boolean> | null {
  if (!movesTrackerAway(u)) return null
  return trackerSwitchAsk(String(unitById(u)?.num ?? u))
}
/** would a pick of `u` be refused by the guard (a window that counts open, a row or form holding a change, a failed
 *  save) — asking nothing, saying nothing: the ☰ menu reads it before it touches its own list, so a refused pick closes
 *  the menu and the note stands at the foot with the window in sight (his D2627 A16; the plan §4.3) */
export function pickRefused(u: string): boolean {
  return u !== UNIT && !!refusalAt('pick', u)
}
/** would a pick of `u` ask that question first — asking nothing (the ☰ menu closes itself first when it will, so the
 *  question is not drawn under its panel: ui/Drawer.tsx — the walk of 23 Nov 26, F2). A pick the guard refuses asks
 *  nothing: it is refused before the question (§4.2) */
export function pickWillAsk(u: string): boolean {
  return u !== UNIT && !refusalAt('pick', u) && movesTrackerAway(u) && trackerSwitchNeeds()
}

/* THE ENTRY — the last step of the door (§4.2 step 6): the windows that only show things close (D2596, D2597) and Logic's
   and Quals' edit modes end (D2627 A4, §18.1 — the guard's closeShown runs each mode's end()), then the squadron is
   entered, the two in one synchronous run and never earlier: a Stay, or a refusal after the question, has closed nothing */
function enterPicked(u: string): void {
  closeShown()
  enterSquadron(u, holdNow() === 'war', true)
  notify()
}
/* THE PICK'S DOOR (the guard rail's plan §4.2, §4.3; his D2403, D2627 A9, A10). In this order, each check made again after
   anything that waited:
   1. the squadron already in view → nothing, as today;
   2. the guard: a window that counts open, a row or form holding a change, a failed save → refused, its "Blocked:" note
      said by the seam (ui/guardnote.ts), and the press ends having changed nothing;
   3. a save still going → wait for the saver's own answer (state/doorwait.ts — never a timer of the door's own, D87),
      then start again from 1: landed, it goes on; "Not saved", 2 refuses with the Retry note. Dropped by his next press;
   4. the Tracker's question about unsaved chart edits, exactly as today;
   5. after Save or Discard, 1 and 2 again — a window or a failed save may have arrived while the question stood — and 3
      again if a save is then going;
   6. the entry (enterPicked).
   With nothing to refuse, no save going and no question to ask the pick is synchronous, as today: UNIT has changed when
   this returns. */
export function pickSquadron(u: string, opts: GuardOpts = {}): void | Promise<void> {
  /* a press of a door drops a press still waiting for a save (the plan's reading, named for him) */
  dropDoorWait()
  return pickFrom(u, opts)
}
function pickFrom(u: string, opts: GuardOpts): void | Promise<void> {
  if (u === UNIT) return
  if (refuse('pick', u, opts)) return
  if (saveGoing()) return waitForSave().then(r => { if (r === 'go') return pickFrom(u, opts) })
  const ask = askBeforeEntering(u)
  if (!ask) { enterPicked(u); return }
  return ask.then(go => { if (go) return afterAsk(u, opts) })
}
function afterAsk(u: string, opts: GuardOpts): void | Promise<void> {
  if (u === UNIT || refuse('pick', u, opts)) return
  if (saveGoing()) return waitForSave().then(r => { if (r === 'go') return afterAsk(u, opts) })
  enterPicked(u)
}
