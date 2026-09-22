/* [ARCH-STACK] Step 3 — the ONE central undo describer (design §8.2, owner 18 Sep
   26). Reads only what the entry already holds (type, scope, contexts, change
   counts) and returns a short, plain-words label for the undo bubble. A new
   command type gets a correct GENERIC label for free — never a per-feature string
   stored at write time, so it adds no maintenance seam and can never break the
   bubble or cause a data bug. A nicer phrasing for a known action is one optional
   line in the TYPE_PHRASE table below.

   The bubble prepends "Undid: " / "Redid: "; this returns the bare label. */
import type { UndoEntry } from './types'

/* known command types → a specific plain phrase. Optional: any type absent here
   falls back to a safe generic label from its module. */
const TYPE_PHRASE: Record<string, string> = {
  'sched.slot': 'a change to the schedule',
  'sched.fill': 'a change to the schedule',
  'sched.text': 'a note on the schedule',
  'sched.delete': 'a deletion on the schedule',
  'sched.section.move': 'a move on the schedule',
  'sched.section.reorder': 'a reorder on the schedule',
  'sched.approve': 'publishing a day',
  'sched.publishAL': 'publishing an amendment',
  'sched.unpublish': 'taking a published day back',
  'sched.discard': 'clearing a day’s draft changes',
  'sched.sign': 'a sign-off',
  /* NOT "a change to the schedule" ([OIL-UNDO-WORDS], found by driving the app
     22 Sep 26). Taking a man off an event does not move the schedule — the earn
     mode exists so that it cannot — so the generic label contradicted the very
     screen the bubble appeared on. */
  'sched.oil': 'an OIL decision',
  'sched.signClear': 'clearing a sign-off',
  'inputs.write': 'a personal input',
  'inputs.batch': 'a batch of inputs',
}

/* a safe generic label from the entry's module, used when the type is unknown. */
function genericLabel(entry: UndoEntry): string {
  switch (entry.scope.module) {
    case 'sched': return 'a change to the schedule'
    case 'inputs': return 'a change to the inputs'
    case 'plan': return 'a change to the plan'
    case 'people': return 'a change to the roster'
    case 'settings': return 'a settings change'
    case 'lw': return 'a change to the leave board'
    case 'trk': return 'a change to the tracker'
    default: return 'a change'
  }
}

export function describeEntry(entry: UndoEntry): string {
  return TYPE_PHRASE[entry.type] || genericLabel(entry)
}

/* the full bubble text for an undo or a redo of `entry`. */
export function bubbleText(entry: UndoEntry, dir: 'undo' | 'redo'): string {
  return `${dir === 'undo' ? 'Undid' : 'Redid'}: ${entry.label}`
}
