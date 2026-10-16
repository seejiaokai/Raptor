/* THE OIL ASK (owner, 28 Aug 26 — "it will ask the user if the duty and
   commitment deserves an applicable OIL"). A duty-&-commitments input whose
   span covers a weekend or public holiday is NEVER credited silently: every
   editor that can save one opens this sheet BEFORE anything is written, and
   the answer rides the same writeInputsBatch as the save — one undo step.
   Cancel writes nothing. No default where the decision is real (the
   UpchitConfirm doctrine): Save stays disabled until a choice is made, and
   an unanswered day credits nothing at all.

   The content comes from leavewar/sync.ts:oilAskPlan — the same body the
   credit pass reads — so what this sheet offers and what the wire then
   posts cannot disagree. The suggested amount is the INPUT's own standing
   (all-day = FO, ≤6h = HO, >6h = FO); the cell finally posted may still
   upgrade where published schedule work stretches the same day's
   start-to-finish envelope (owner, 29 Aug 26).

   A single-day plan is a plain Yes / No. A multi-day plan offers All days /
   Only some days… / No OIL — "some" opens a calendar where only the
   applicable days are tappable; tap to select, tap again to deselect (owner's
   exact ask), then Save.

   THAT CALENDAR IS THE APP'S ONE DATE CALENDAR (owner D923, 15 Oct 26 — shown
   it beside the app's one calendar: "use the new calendar format but allow to
   tap separate days for this function"; [OIL-CONFIRM-DAYGRID]). It drew a
   small month of its own, a near-copy of the calendar every other date pick
   left in calendar step two. Now it is ui/DateCal.tsx in its several-days mode,
   drawn inside the sheet as a form draws it (D797): its head, its lists, its
   Today icon and its sideways finger, the input's non-working days the only
   dates that take a tap and every other date faint. What a tap does and which
   days earn are as they were — the picked days are this sheet's `sel`. */
import { useEffect, useState, useRef } from 'react'
import { clickedSurround } from './outside'
import { useSheetFocus } from './sheetfocus'
import { oilDayLabel } from './inputedit'
import { DateCal } from './DateCal'

/* the day the question is about, with its year where that is not the year in hand — the one label every place that
   names an OIL day uses (ui/inputedit.tsx oilDayLabel; `[CARD-CHECK-SEEN]` 8: "9 Jan" for a day of 2027) */
const dLabel = (v: string) => oilDayLabel(v)
/* …and, in the question's own sentence, its weekday before it — "Sat 18 Jul" (the wording of record, D837). Worked out
   from the date's own numbers in UTC, so the day never shifts with the zone the browser is in. */
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const dowLabel = (v: string) => `${DOW[new Date(Date.UTC(+v.slice(0, 4), +v.slice(5, 7) - 1, +v.slice(8, 10))).getUTCDay()]} ${dLabel(v)}`

/* `lead`, `noLabel`, `yesLabel` — THE QUESTION PUT BEFORE A CHANGE ([OIL-ASK-NOTIFY], owner D783 — the pictures of
   record docs/mock/2026-10-12-oil-notify/*-swap-3-question-waits.png): a swap, an add or a move that raises the
   question is not made until it is answered, so the sheet says what is waiting ("Swapping Tally and Ranger" — a
   statement above the question, never a second question) and its two buttons say what each does ("Don’t swap" /
   "Swap"). Without them it is the input's own save: Back / Save, or Back / Add where the form behind it is adding a new
   input — never "Cancel", which over the form's own Cancel read as if it might throw the input away (the design look's
   L4, owner D830, 13 Oct 26). Drawn by ui/OilWaitSheet.tsx.

   THE WORDS ARE THE WRITING GUIDE'S (owner D837, D839 — 14 Oct 26; the wordings of record
   docs/superpowers/briefs/2026-10-13-wording-recheck.md): the title "OIL: Tally, Range brief", the reason and the question
   as one ordinary sentence (it was a heading in capitals — the look's L3), "Yes: credit HO", "…can raise the credit".
   THE SEVERAL-DAYS FORM KEEPS ITS WORDS: it was not on the page he approved, and goes to the whole-app words pass (D808).

   THE ANSWERS SIT FLAT UNDER THE QUESTION (L1): they were wrapped in `.seg`, which is also the week strip's rule
   (02-shell.css) — so they wore its patch and its line, inside the boxed row of the upchit sheet: a box in a box. They
   have a row of their own now (`.oilconf-answers`). A PICKED ANSWER TAKES THE OUTLINE LOOK (L5, `.on-pick`): filled as
   solid as the main button, the eye no longer knew which to press — the right-hand button stays the one solid one.
   THE FIRST ANSWER TAKES THE KEYBOARD AS THE SHEET OPENS (K7), and the ✕ is the last Tab stop (L2 — ui/sheetfocus.ts).
   Picking an answer answers nothing by itself: the right-hand button still has to be pressed. */
export function OilConfirm({ who, typeLabel, plan, prev, onSave, onCancel, lead, noLabel, yesLabel }: {
  who: string
  typeLabel: string
  plan: { iso: string, amt: 0.5 | 1 }[]
  prev: Record<string, number>
  onSave: (decisions: Record<string, number>) => void
  onCancel: () => void
  lead?: string
  noLabel?: string
  yesLabel?: string
}) {
  const multi = plan.length > 1
  const amt = plan[0].amt                                    // one window → one standing for every day
  const amtWord = amt === 1 ? 'FO — a full day' : 'HO — half a day'          // the several-days form's, left whole (D808)
  const amtName = amt === 1 ? 'FO, a full day' : 'HO, half a day'             // the one-day question's (D837)
  /* the forced choice — unset until the filer picks, even on a re-ask; the
     prior answers only pre-seed WHICH days "some" starts from */
  const [mode, setMode] = useState<'' | 'yes' | 'no' | 'all' | 'some' | 'none'>('')
  const [sel, setSel] = useState<Set<string>>(
    () => new Set(plan.filter(p => (prev[p.iso] ?? 0) > 0).map(p => p.iso)))
  const ready = mode !== ''
  const toggle = (d: string) => setSel(s => {
    const n = new Set(s); n.has(d) ? n.delete(d) : n.add(d); return n
  })
  const save = () => {
    const dec: Record<string, number> = {}
    for (const p of plan) {
      const yes = mode === 'yes' || mode === 'all' || (mode === 'some' && sel.has(p.iso))
      dec[p.iso] = yes ? p.amt : 0
    }
    onSave(dec)
  }
  /* its own Escape = cancel THIS sheet only — the UpchitConfirm idiom */
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onCancel() } }
    document.addEventListener('keydown', esc, true)
    return () => document.removeEventListener('keydown', esc, true)
  })
  const seg = (k: typeof mode, label: string, tid: string) => (
    <button type="button" className={'upconf-seg' + (mode === k ? ' on-pick' : '')} data-testid={tid} aria-pressed={mode === k}
      onClick={() => setMode(k)}>{label}</button>
  )
  /* the sheet takes the keyboard when it opens (W12 — ui/sheetfocus.ts), on its first answer (K7) */
  const boxRef = useRef<HTMLDivElement>(null)
  useSheetFocus(boxRef, true, box => box.querySelector<HTMLElement>('.oilconf-answers .upconf-seg'))
  return (
    <div className="airpop upconf-pop oilconf-pop" data-testid="oilconf"
      onClick={e => { if (clickedSurround(e, 'upconf-pop')) onCancel() }}>
      <div className="airpop-box upconf-box" ref={boxRef} tabIndex={-1} style={{ outline: 'none' }}>
        <div className="airpop-head"><b>OIL: {who}, {typeLabel}</b>
          <button className="x" aria-label="Close" onClick={onCancel}>✕</button></div>
        <div className="airpop-body upconf-body">
          {lead && <div className="oilconf-what oilconf-lead" data-testid="oilconf-lead"><b>{lead}</b></div>}
          {multi ? <>
            <div className="upconf-h">This input covers {plan.length} non-working days (weekend / PH)</div>
            <div className="oilconf-what">Each confirmed day earns <b>{amtWord}</b> of OIL. Which days does it deserve?</div>
            <div className="oilconf-answers">
              {seg('all', 'All days', 'oil-all')}
              {seg('some', 'Only some days…', 'oil-some')}
              {seg('none', 'No OIL', 'oil-none')}
            </div>
            {mode === 'some' && <>
              <div className="dcal-inline oilconf-cal">
                <DateCal mode="many" tid="oilcal" only={plan.map(p => p.iso)} picked={[...sel]} at={plan[0].iso} onToggle={toggle} />
              </div>
              {/* "the highlighted days" became "a day": the days that take a tap are no longer tinted — they are the dates
                  in full ink, every other date faint (the one calendar's look for a date that may not be picked) */}
              <div className="oilconf-count" data-testid="oil-count">
                {sel.size ? `${sel.size} of ${plan.length} days selected — tap a day to change it` : 'No days selected — tap a day to credit it'}
              </div>
            </>}
          </> : <>
            <div className="oilconf-what" data-testid="oilconf-ask">This input falls on {dowLabel(plan[0].iso)}, a non-working day (weekend/PH). Does it deserve <b>{amtName}</b> of OIL?</div>
            <div className="oilconf-answers">
              {seg('yes', `Yes: credit ${amt === 1 ? 'FO' : 'HO'}`, 'oil-yes')}
              {seg('no', 'No OIL', 'oil-no')}
            </div>
          </>}
          {/* (NO SMALL PRINT HERE, AND NO "CHOOSE AN OPTION ABOVE" IN THE FOOT — owner D846, 14 Oct 26: he circled both on the
              built question, "these are the examples of things u can delete and they are self explanatory". The sentence said
              where the credit lands and that published work the same day can raise it — how the app works, not what to do;
              the Leave War shows the credit as it ends up. The hint said a button was waiting with the answers right above
              it. The design guide's §1 carries the rule; the upchit question and the day's one list keep their hint until he
              has seen them.) */}
        </div>
        <div className="airpop-foot upconf-foot">
          <span style={{ flex: 1 }}></span>
          <button className="abtn ghost" data-testid="oilconf-cancel" onClick={onCancel}>{noLabel || 'Back'}</button>
          <button className="abtn primary" data-testid="oilconf-save" disabled={!ready} onClick={save}>{yesLabel || 'Save'}</button>
        </div>
      </div>
    </div>
  )
}
