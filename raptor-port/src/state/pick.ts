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
/** would a pick of `u` ask that question first — asking nothing (the ☰ menu closes itself first when it will, so the
 *  question is not drawn under its panel: ui/Drawer.tsx — the walk of 23 Nov 26, F2) */
export function pickWillAsk(u: string): boolean {
  return u !== UNIT && movesTrackerAway(u) && trackerSwitchNeeds()
}

function enterPicked(u: string): void {
  enterSquadron(u, holdNow() === 'war', true)
  notify()
}
export function pickSquadron(u: string): void | Promise<void> {
  if (u === UNIT) return
  const ask = askBeforeEntering(u)
  if (!ask) { enterPicked(u); return }
  return ask.then(go => { if (go && u !== UNIT) enterPicked(u) })
}
