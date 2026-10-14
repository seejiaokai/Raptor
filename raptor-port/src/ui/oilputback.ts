/* WHAT A WHOLE-DAY REPLACEMENT PUT BACK THAT STILL NEEDS AN OIL ANSWER — the ONE reading both doors that replace a day
   share: "Load onto working copy" of a published version (owner D818, 13 Oct 26; D862) and "Switch to this plan" (owner
   D865, 15 Oct 26 — his question 3, "as recommend": the load's short note and list). Moved here from the load's own
   handler (ui/interactions.ts) so the two cannot count it, or open the list, two ways.

   Neither door is held: a replacement can put several inputs back at once, so it is not a door that waits as Accept is
   (D793). It is made, and then says so — "N input(s) need(s) an OIL answer." at the end of its note — and opens the one
   list for the days that need the answer. "Put back" = standing on the day after the replacement and not before;
   "needs an answer" is the list's own reading (leavewar/sync.ts oilOpenOn — never a cancelled or information-only
   input, D814; one under Unavailable counts, D804). Nothing is added and nothing opens where none needs one. The list
   is a scheduler's, as both doors are; what is answered there notifies nobody (D781), and "Later" leaves the "OIL?"
   signs and the bell as they are.

   Use: `const after = oilPutBackWatch(di)` BEFORE the replacement; `const n = after()` once it is made (and the day
   re-checked) — it opens the list where n > 0; the note's tail is `oilNeedSaid(n)`. */
import { INPUTS, inpId, inputCoversDate } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { dayIso } from '../engine/verid'
import { oilOpenOn, dayFacts, holidayOwnName } from '../leavewar/sync'
import { unfmt } from './inputedit'
import { setOilList } from './pops'

export function oilPutBackWatch(di: number): () => number {
  /* WHICH INPUTS STAND ON THIS DAY BEFORE THE REPLACEMENT — on its programme or under Unavailable — so that what it PUTS
     BACK can be told from what was there all along */
  const stands = (x: any) => !!x && (x.acc === 'g' || x.acc === 'u') && !!DAYS[di] && inputCoversDate(x, DAYS[di].dt)
  const iso = dayIso(CURWEEK, di)
  /* …standing there AND already needing an answer: those were his to answer before and are not its doing. An input that
     stood there silent — cancelled, information-only — and comes out of the replacement live is counted, should one ever
     bring it back so (the scenario designer's S30: the un-cancel's gap must not return by this door). */
  /* …READ OVER EVERY DAY THE INPUTS OF THIS DAY COVER, not the replaced day alone (the fresh read of the finished code,
     F1 — 14 Oct 26): an input of several days has ONE row, on its first day, and the day it has no answer for can be
     another of its days — a Fri–Sat input put back on Friday still needs its Saturday's answer, and it is counted (D862).
     The day's date does not change with its content, so the same inputs cover it before and after. */
  let lo = iso, hi = iso
  for (const x of INPUTS as any[]) {
    if (!x || !DAYS[di] || !inputCoversDate(x, DAYS[di].dt)) continue
    const a = unfmt(x.date, x.yr) || iso, b = x.endDate ? (unfmt(x.endDate, x.yr) || a) : a
    if (a < lo) lo = a
    if (b > hi) hi = b
  }
  const openNow = () => new Map(oilOpenOn(lo, hi).map(o => [o.iid, o.days] as const))
  const openWas = openNow()
  const stood = new Set(INPUTS.filter((x: any) => stands(x) && openWas.has(String(inpId(x)))).map((x: any) => String(inpId(x))))
  return () => {
    const open = openNow()
    const back = INPUTS.filter((x: any) => stands(x) && !stood.has(String(inpId(x))) && open.has(String(inpId(x))))
    /* THE LIST OPENS FOR THE DAYS THOSE INPUTS NEED AN ANSWER FOR — the replaced day, almost always; another day of a
       several-day input where that is the one unanswered (F1, D862). It names the holiday where every such day is one —
       by the holiday's OWN name, never the preset's word ("Public holiday · PH": the read's F2; sync.ts holidayOwnName is
       what the holiday's own save and the bell read it through) — and on a plain weekend says nothing of a holiday. */
    if (back.length) {
      const days = [...new Set(back.flatMap((x: any) => open.get(String(inpId(x))) || []))].sort()
      const allPh = days.length > 0 && days.every(d => dayFacts(d).kind === 'ph')
      const names = allPh ? [...new Set(days.map(d => holidayOwnName(d)))] : []
      setOilList({ from: days[0] || iso, to: days[days.length - 1] || iso, name: names.length === 1 ? names[0]! : '', fresh: false, plain: !allPh })
    }
    return back.length
  }
}

/* the note's last sentence, in his words (D818): '' where none needs an answer */
export const oilNeedSaid = (n: number) => n ? ` ${n} input${n === 1 ? ' needs' : 's need'} an OIL answer.` : ''
