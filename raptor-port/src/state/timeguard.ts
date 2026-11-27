/* [END-TIME-GUARD] — THE REFUSAL: a sign-off, Publish day or Publish AL pressed while an item on the day is missing a time
   (engine/timegaps.ts decides which). His rulings: D2612 — the day is never published or signed off while one stands;
   D2854 — the words, said in the grey "Blocked:" note; D2855 — a press on the greyed Publish day raises the note, and the
   time is refused BEFORE the day's OIL question is asked (ui/oilsign.ts signPick asks this first).

   THE WORDS ARE HIS (D2854), in one place, exactly: "Blocked: 3 items are missing a time, each outlined in red. Type the
   missing times, then sign." — "… Thursday was not published." for Publish day, "… AL1 was not published." for an
   amendment, the AL named being the one the press would have published (Fable's cold read, 27 Nov 26: never the one
   already out); one item: "Blocked: 1 item is missing a time, outlined in red. Type the missing time, then sign." The
   one-item lead joined to the two publish ends is the ruling's own "…" (the plan's question Q-W2).

   NO SCREEN IS IMPORTED (the fresh Opus red-team read, 4g): the command layer and the sign-off's write call this; the
   note goes out through HOOKS.toast as every refusal's does; the screens hear of a refusal through the hook below (the
   red outline, D2853 — set by the screens, as the publish gate is set by the Leave War wiring). No hook set = the note
   alone. A refusal writes nothing: no command, no history step, no change-history line, no publish gate. */
import { DAYS } from '../engine/data'
import { HOOKS } from '../engine/hooks'
import { nextSeq } from '../engine/publish'
import { timeGapsOf } from '../engine/timegaps'

export type TimeDoor = 'sign' | 'publish' | 'publishAL'

/** the ruled words for `items` missing on day `di` at `door` (D2854) */
export function timeRefusalWords(items: number, door: TimeDoor, di: number): string {
  const one = items === 1
  const lead = one ? 'Blocked: 1 item is missing a time, outlined in red.' : `Blocked: ${items} items are missing a time, each outlined in red.`
  if (door === 'sign') return `${lead} ${one ? 'Type the missing time, then sign.' : 'Type the missing times, then sign.'}`
  if (door === 'publish') return `${lead} ${String((DAYS[+di] || {}).dow || '')} was not published.`
  return `${lead} AL${nextSeq(di)} was not published.`
}

/** the words, or null where the day has nothing missing */
export function timeRefusal(di: number, door: TimeDoor): string | null {
  const g = timeGapsOf(di)
  return g.items ? timeRefusalWords(g.items, door, di) : null
}

let ON_REFUSED: ((di: number, door: TimeDoor) => void) | null = null
/** the screens' ear: a refused press turns the day's outlines red (D2853) */
export function setTimeRefusedHook(fn: ((di: number, door: TimeDoor) => void) | null): void { ON_REFUSED = fn }

/** REFUSE THE PRESS IF A TIME IS MISSING — true when refused (the note said, the screens told), false to go on */
export function refuseForTime(di: number, door: TimeDoor): boolean {
  const words = timeRefusal(di, door)
  if (!words) return false
  HOOKS.toast(words, 'blocked')
  ON_REFUSED?.(+di, door)
  return true
}
