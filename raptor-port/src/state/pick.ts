/* THE PICK — the Schedules menu's one act (ui/SquadronMenu.tsx; the second-half plan §3 item 3): the squadron picked comes
   into view, every page that follows it with it, through state/store.ts enterSquadron — the path sign-in and midnight
   take (an open Leave War window holds the war's step, state/typing-hold.ts). Navigation, not a command: nothing saved,
   the Undo list untouched (D148).
   UNSAVED CHART EDITS ARE ASKED ABOUT FIRST (§16 D2′; his D2318 — the drawing f2d): the Tracker keeps the squadron it
   loaded until the next sign-in, so a pick that moves his own pages off it (state/perms.ts ownPageIfPicked) would leave
   those edits where they can no longer be saved. The Tracker asks "Save them before switching to 142?" — Save them,
   Discard them, Stay — where he is (tracker/role.js trackerSwitchAsk); the pick goes on only after Save or Discard. With
   nothing to ask the pick is made at once, as before. */
import { UNIT } from '../engine/unitview'
import { enterSquadron, notify } from './store'
import { holdNow } from './typing-hold'
import { pageUnit, trkUnitNow, ownPageIfPicked } from './perms'
import { unitById } from './units'
import { trackerSwitchAsk, trackerSwitchNeeds } from '../tracker/role.js'

/* the pick would move his own pages off the Tracker he loaded */
function movesTrackerAway(u: string): boolean {
  const bound = trkUnitNow()
  return !!bound && bound === pageUnit('own') && ownPageIfPicked(u) !== bound
}
/** the Tracker's question before his pages move to `u`'s: null — nothing to ask (no Tracker loaded, its squadron not his
 *  pages' now, the pick leaving his pages on it, no unsaved edit); else a promise, true to go on */
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
