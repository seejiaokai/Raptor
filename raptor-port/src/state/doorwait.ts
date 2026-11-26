/* THE DOORS' WAIT FOR A SAVE STILL GOING (the guard rail's plan §4.2 step 3; his D2627 A9, D2742; step K4, chat 204).

   A press of a door that changes the squadron in view or the view — the pick (state/pick.ts), the view switch and a bell
   line (K5, K6) — made while a change is still on its way to the store waits for the saver's own answer before it goes
   on: never a timer of the door's own (D87), so the wait ends exactly when the saver says it has landed or that it was
   refused ("Not saved", which the guard then refuses with the Retry note). No give-up is built: with the stores the app
   ships a save answers in the same turn (D2742 — the give-up is filed with the database step, [MSQ-SAVE-GIVEUP-DB]).

   ONE WAITING PRESS AT A TIME, DROPPED BY HIS NEXT PRESS (the plan's reading, named for him): a press that waits is
   dropped by any later press of a door (a second waitForSave, or a door's dropDoorWait at its start) and by any
   pointer-down or key-down on the page while the wait stands — otherwise a pick could land seconds later, under his next
   press. Dropped means nothing happens when the save answers: no entry, no note.

   Imports nothing from ui/: the doors live in state/, and the saver's state is storage/savewait.ts's. */
import { saveSettling, saveRefused, onSaveStatus, flushSaves } from '../storage/savewait'

export type DoorWait = 'go' | 'dropped'

/** a save is on its way (written and not yet sent, or in flight) and has not been refused — the door waits */
export const saveGoing = (): boolean => saveSettling() && !saveRefused()

let waiting: { drop: () => void } | null = null

/** drops the press that is waiting, if any — every door calls it as it is pressed */
export function dropDoorWait(): void { waiting?.drop() }

/** waits for the saver's own answer: 'go' once nothing is on its way any more (landed) or the save was refused — the door
 *  then starts again from its first check; 'dropped' when he pressed anything else meanwhile */
export function waitForSave(): Promise<DoorWait> {
  dropDoorWait()
  return new Promise<DoorWait>(resolve => {
    let done = false
    let off = (): void => {}
    const doc = typeof document !== 'undefined' ? document : null
    const onDown = (): void => { finish('dropped') }
    function finish(r: DoorWait): void {
      if (done) return
      done = true
      off()
      doc?.removeEventListener('pointerdown', onDown, true)
      doc?.removeEventListener('keydown', onDown, true)
      if (waiting === me) waiting = null
      resolve(r)
    }
    const me = { drop: () => finish('dropped') }
    waiting = me
    off = onSaveStatus(() => { if (!saveGoing()) finish('go') })
    doc?.addEventListener('pointerdown', onDown, true)
    doc?.addEventListener('keydown', onDown, true)
    /* the change he made is sent now rather than after the saver's own short gather-up wait — the same send, sooner */
    void flushSaves()
    if (!saveGoing()) finish('go')
  })
}
