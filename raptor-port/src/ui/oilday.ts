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
import { stampChanged } from '../state/inputstamp'
import { oilOpenOn } from '../leavewar/sync'
import { saveBatchX } from './inputedit'

export type OilPick = 'y' | 'n'

/** Save the picked answers. Answers how many inputs were answered; -1 where the save was refused (it said why). */
export function saveOilDay(from: string, to: string, picks: Readonly<Record<string, OilPick | undefined>>): number {
  if (!canEditSched()) { HOOKS.toast('Only a scheduler answers from this list', 'warn'); return -1 }
  const todo = oilOpenOn(from, to).filter(o => picks[o.iid] === 'y' || picks[o.iid] === 'n')
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
