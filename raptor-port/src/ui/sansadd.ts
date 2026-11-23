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
import { PEOPLE, sansFiler, sansOnP } from '../engine/people'
import { isAdmin, me, pageUnit } from '../state/perms'
import { rosterOf } from '../engine/roster'
import { notify } from '../state/store'
import { flyAnswer } from '../leavewar/sync'
import { todayIso } from '../engine/editlog'
import { fmt, sansRefusal } from './inputedit'
import { HOOKS } from '../engine/hooks'
import { setInpEdit } from './pops'

const TYPE = 'SANS Availability'
/* (a SANS man — SANS today, or by a SANS posting saved for a date ahead: he may be filed for from the moment it is saved,
   owner D2340, 23 Nov 26; until then SANS today only, D2327). With a day, SANS on that day: his own "+ Commitment" opens
   only on a day he can be filed for, so it never seeds a filing the save would refuse. */
const isSans = (id: string | null | undefined, iso?: string): boolean =>
  !!id && !!PEOPLE[id] && (iso ? sansOnP(PEOPLE[id], iso) : sansFiler(PEOPLE[id]))

export const maySansAdd = (iso?: string): boolean => isAdmin() || isSans(me(), iso)

export function openSansAdd(from: string, until?: string): boolean {
  const [iso, end] = until && until < from ? [until, from] : [from, until]
  if (!maySansAdd(iso)) {
    /* A SANS MAN WHOSE SANS STARTS LATER THAN THE RUN HE PICKED IS TOLD WHY, never met with nothing (the FULL check's
       walk, chat 152, W8-1: Ranger, posted out as SANS from Fri 17 Jul, dragged Thu 16 → Sat 18 and no window opened and
       nothing was said). The words are the save's own refusal (ui/inputedit.tsx sansRefusal), so the calendar and the
       window never differ. A man who is not SANS at all is offered no add on this calendar, so his stays silent. */
    const mine = me()
    if (!isAdmin() && mine && sansFiler(PEOPLE[mine])) {
      const why = sansRefusal(mine, { f: true }, iso, end || iso)
      if (why) HOOKS.toast(why, 'warn')
    }
    return false
  }
  const mine = me()
  const who = isSans(mine, iso) ? mine
    /* (a SANS man of the page's own squadron — the SANS calendar stays on his own, D2132; the reshape plan §3.2 A-ii) */
    : rosterOf(pageUnit('own'), iso).find(id => isSans(id, iso) && !PEOPLE[id].archived && !PEOPLE[id].deleted && !PEOPLE[id].special)
  const single = !end || end === iso
  setInpEdit({
    _new: true, _calendar: true, _ctx: 's', person: who, type: TYPE,
    date: fmt(iso), endDate: single ? undefined : fmt(end),
    allday: defaultAllday(TYPE), s: 360, e: 1080,
    /* (the page's own squadron's flying plan — the SANS calendar is an own page — never the war loaded's) */
    sans: single && flyAnswer(iso, pageUnit('own', todayIso())).cls === 'nf' ? {} : { f: true },
  })
  notify()
  return true
}
