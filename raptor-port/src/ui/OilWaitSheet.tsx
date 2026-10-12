/* THE OIL QUESTION PUT BEFORE A CHANGE, AND THE BAR THAT SAYS IT WAS NOT MADE ([OIL-ASK-NOTIFY] — owner D783, 12 Oct 26,
   "Yes to all"; the pictures of record docs/mock/2026-10-12-oil-notify/, *-swap-3-question-waits.png and
   *-swap-5-after-stays.png; the plan docs/superpowers/plans/2026-10-12-oil-ask-notify-plan.md §3.1).

   A swap, an add or a move that raises the OIL question is NOT MADE until the question is answered. The door wrote
   nothing and left the change waiting (state/view.ts OILWAIT); this draws the question for it — the OIL question's
   own sheet (ui/OilConfirm.tsx), with a line saying what is waiting and two buttons saying what each does. No window
   of the input stands behind it: nothing has changed, so there is nothing of the input to show.
     · the right-hand button, live once an answer is picked → the change and the answer, one command (ui/oilwait.ts);
     · the left-hand button, ✕, Escape, a press outside → nothing is made; both pucks flash and THE BAR stays:
       "Not swapped — OIL not answered" · Answer OIL (the question comes back) · OK (it only closes).
   Mounted at App level, like the medical move's question (ui/MedMoveConfirm.tsx), so it opens over whatever surface
   the gesture was on — the week, the Scheduler Board, the Inputs calendar. Only a scheduler's gesture reaches the
   row's door; the calendar's drag is whoever may move the input; nothing here is shown to anyone a door did not ask. */
import { useEffect } from 'react'
import { OILWAIT, OILBAR } from '../state/view'
import { placeToast } from './toast'
import { OilConfirm } from './OilConfirm'
import { WAIT_WORDS, answerOilWait, leaveOilWait, oilBarAgain, oilBarOk } from './oilwait'
import { useVersion } from './useStore'

export function OilWait() {
  useVersion()
  const w = OILWAIT
  if (!w) return null
  const words = WAIT_WORDS[w.kind]
  return <OilConfirm who={w.gate.who} typeLabel={w.gate.typeLabel} plan={w.gate.plan} prev={w.gate.prev}
    lead={w.lead} noLabel={words.no} yesLabel={words.yes}
    onCancel={leaveOilWait} onSave={dec => { answerOilWait(dec) }} />
}

/* It stays until it is tapped (D783 (2)) — no timer, unlike the "Set as default" offer whose look it wears: a swap
   that was not made is news the scheduler must not miss by looking away for seven seconds. A week, a page or a sign-in
   that changes under it takes it away (state/view.ts). */
export function OilBar() {
  useVersion()
  const b = OILBAR
  const up = !!b && !OILWAIT
  /* a note already showing moves clear of the bar the moment it arrives (ui/toast.ts placeToast — the walk's C3) */
  useEffect(() => { if (up) placeToast() }, [up])
  if (!b || OILWAIT) return null
  return (
    <div className="secdef-snack oilbar" role="status" data-testid="oilbar">
      <span className="secdef-msg" data-testid="oilbar-text">{b.text}</span>
      <button type="button" className="secdef-btn yes" data-testid="oilbar-answer" onClick={oilBarAgain}>Answer OIL</button>
      <button type="button" className="secdef-btn" data-testid="oilbar-ok" onClick={oilBarOk}>OK</button>
    </div>
  )
}
