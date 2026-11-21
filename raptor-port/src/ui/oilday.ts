/* THE ONE LIST'S SAVE ([OIL-ASK-NOTIFY] — owner D782, 12 Oct 26: "can the admin answering all the inputs for oil that day
   have a consolidated list that's easy to select oil yes or no for them? And a yes to all or no to all kinda button";
   D783: the list as drawn — docs/mock/2026-10-12-oil-notify/*-hol-3-list.png; the plan
   docs/superpowers/plans/2026-10-12-oil-ask-notify-plan.md §3.2).

   WHAT THE LIST HOLDS is worked out live, never stored (leavewar/sync.ts oilOpenOn): every input on the programme whose
   OIL question has no answer for a day of the run. The window (ui/OilDayList.tsx) keeps only what was picked.

   THE SAVE writes the picked answers in ONE command — one Undo step for the lot. For each input, each of its
   UNANSWERED days IN THE RUN gets its amount (Yes: what its own hours give that day, the amount the single question
   offers) or 0 (No — an answer too). Its other days are not touched: a Friday-to-Saturday input answered here for the
   Friday holiday keeps whatever its Saturday says. Each answer is the input's own ONE answer, for everyone in it
   (D762), stamped as the window's answer-only save stamps it (who changed it, when).
   Only a scheduler — the list is his (D782); a member answers for his own input in its own window, as before. What is
   listed is found again at the save: an input answered or deleted while the list was up is simply not written. */
import { HOOKS } from '../engine/hooks'
import { INPUTS } from '../engine/inputs'
import { canEditSched } from '../state/auth'
import { pageUnit } from '../state/perms'
import { levelIn, signedInAccount } from '../state/accounts'
import { todayIso } from '../state/units'
import { stampChanged } from '../state/inputstamp'
import { oilOpenOn } from '../leavewar/sync'
import { saveBatchX } from './inputedit'
import { sayDate } from './daysfmt'

export type OilPick = 'y' | 'n'

/** AN ADMIN OF THE LIST'S SQUADRON (the blind read's R3 — the reshape plan §19b; D2201, D2241): the role in force is admin
 *  (canEditSched — the member view is a member, D292) and his level in that squadron today is admin — at home there, by
 *  Plan of it, or a master admin (accounts.ts levelIn, the one reader). The list's window and its Save both ask it. A
 *  session with no account behind it (a hand-made test session) answers for the page's own squadron only, as
 *  perms.ts adminOfPage does. */
export function adminOfList(unit: string): boolean {
  if (!canEditSched()) return false
  const today = todayIso()
  const a = signedInAccount()
  return a ? levelIn(a.id, unit, today) === 'admin' : unit === pageUnit('own', today)
}

/** Save the picked answers for the squadron the list lists (`unit` — its own page's squadron where not handed one).
 *  Answers how many inputs were answered; -1 where the save was refused (it said why). */
export function saveOilDay(from: string, to: string, picks: Readonly<Record<string, OilPick | undefined>>, unit: string = pageUnit('own', todayIso())): number {
  /* (THE LIST'S OWN SQUADRON — R3: it saved only the reader's home squadron's answers, so the master admin answering 149's
     list from his 142 page wrote nothing; its door now asks "an admin of that squadron", the role in force) */
  if (!adminOfList(unit)) { HOOKS.toast('Only a scheduler answers from this list', 'warn'); return -1 }
  const todo = oilOpenOn(from, to, unit).filter(o => picks[o.iid] === 'y' || picks[o.iid] === 'n')
  if (!todo.length) return 0
  let n = 0
  const out = saveBatchX(() => {
    for (const o of todo) {
      const r: any = INPUTS.find((x: any) => String(x.iid) === o.iid)
      if (!r) continue
      const oil: Record<string, number> = { ...(r.oil || {}) }
      for (const iso of o.days) oil[iso] = picks[o.iid] === 'y' ? o.amt : 0
      r.oil = oil
      stampChanged(r)
      n++
    }
    return true
  })
  if (!out.ok) return -1
  HOOKS.toast(n === 1 ? 'OIL answered for 1 input' : `OIL answered for ${n} inputs`, 'ok')
  return n
}

/** WHAT A NEW PUBLIC HOLIDAY PUTS OUT OF DATE, said before it is saved (multi-squadron batch 1, step 4 — D2184 R32): the
 *  form's own squadron's published days on its dates were published as working days and must be published again before
 *  their OIL is earned (the day's own amber line says so after, D2003). In his words, D2207 — no squadron's number, since
 *  the holiday is only its own squadron's (D2195): "Already published as working days: Wed 15 Jul and Thu 16 Jul.
 *  Publish them again so the crew on them earn OIL for the holiday." (one day: "Already published as a working day: Wed
 *  15 Jul. Publish it again so the crew on it earn OIL for the holiday."). Here, not in HolidaysPanel.tsx, so that file
 *  exports its window only (the code check's one-component-file rule). '' where nothing is. */
export function outOfDateSaid(list: { unit: string; days: string[] }[]): string {
  const days = [...new Set(list.flatMap(x => x.days))].sort()
  if (!days.length) return ''
  const and = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`)
  const said = and(days.map(sayDate))
  return days.length === 1
    ? `Already published as a working day: ${said}. Publish it again so the crew on it earn OIL for the holiday.`
    : `Already published as working days: ${said}. Publish them again so the crew on them earn OIL for the holiday.`
}
