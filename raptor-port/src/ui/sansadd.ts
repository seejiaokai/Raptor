/* "+ COMMITMENT" — the ONE way the SANS calendar starts a new SANS availability (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.5), for one day or a picked run of days. The opened
   day's button and the month's own gestures (a drag over several days, a held press) both call this, so the two can
   never seed the editor differently.

   WHO MAY: a SANS man his own, an admin anyone's (D658 — a member never files SANS availability for another man; the
   editor and the write path hold that rule themselves, this only decides whether the door opens at all).
   WHOSE: the signed-in man's when he is SANS; for an admin who is not, the first SANS man on the roster — the editor's
   person list is then his to choose from.
   WHAT IS TICKED: Fly, as it always was — except on a day set as NO FLY, where flying is not on offer (D642: a no-fly
   day still takes OFT and AMT): nothing is ticked, and he chooses. A run of days starts with Fly whatever lies inside
   it. */
import { defaultAllday } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { isAdmin, me } from '../state/perms'
import { notify } from '../state/store'
import { flyAnswer } from '../leavewar/sync'
import { fmt } from './inputedit'
import { setInpEdit } from './pops'

const TYPE = 'SANS Availability'
const isSans = (id: string | null | undefined): boolean => !!id && !!PEOPLE[id] && !!PEOPLE[id].san

export const maySansAdd = (): boolean => isAdmin() || isSans(me())

export function openSansAdd(from: string, until?: string): boolean {
  if (!maySansAdd()) return false
  const [iso, end] = until && until < from ? [until, from] : [from, until]
  const mine = me()
  const who = isSans(mine) ? mine
    : Object.keys(PEOPLE).find(id => PEOPLE[id].san && !PEOPLE[id].archived && !PEOPLE[id].deleted && !PEOPLE[id].special)
  const single = !end || end === iso
  setInpEdit({
    _new: true, _calendar: true, _ctx: 's', person: who, type: TYPE,
    date: fmt(iso), endDate: single ? undefined : fmt(end),
    allday: defaultAllday(TYPE), s: 360, e: 1080,
    sans: single && flyAnswer(iso).cls === 'nf' ? {} : { f: true },
  })
  notify()
  return true
}
