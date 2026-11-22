/* THE PICK — the Schedules menu's one act (ui/SquadronMenu.tsx; the second-half plan §3 item 3): the squadron picked comes
   into view, every page that follows it with it, through state/store.ts enterSquadron — the path sign-in and midnight
   take (an open Leave War window holds the war's step, state/typing-hold.ts). Navigation, not a command: nothing saved,
   the Undo list untouched (D148). */
import { UNIT } from '../engine/unitview'
import { enterSquadron, notify } from './store'
import { holdNow } from './typing-hold'

export function pickSquadron(u: string): void {
  if (u === UNIT) return
  enterSquadron(u, holdNow() === 'war')
  notify()
}
