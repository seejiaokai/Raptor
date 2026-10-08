/* THE LATE CUT-OFF'S FIELDS — one body for the two settings windows that set one (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.9; owner D628: "either as a number of days or as a
   weekday of a number of weeks before (for example the Wednesday two weeks prior)"; D639: "set behind each calendar's
   own settings gear — the SANS calendar and the Inputs calendar each have their own").

   The SANS calendar's window drew these first (ui/SansSettings.tsx, step 4); the Inputs calendar's window
   (ui/InputsSettings.tsx) needs the same two shapes, the same ranges and the same worked date, so they are drawn once
   here and each window keeps only its own draft and its own Save. What is typed is a DRAFT — a string for the day
   count, so "" and "x" stay what he typed and are refused in words, never read as 0. The ranges and the sum are the
   engine's own (state/cutoff.ts → engine/rules.ts RULE_SPEC, engine/inputs.ts cutBackOf).

   A WORKED DATE sits under the fields — "For the week of Mon 19 Oct, inputs are due by the end of Mon 5 Oct." — from
   the draft, so he sees what a choice means before he saves it (the calendars' "How this works" states the rule only,
   D646). `prefix` names the fields for each window's own tests; the look is one (`sset-…`, 24-sans-calendar.css). */
import { cutExample, cutProblem, type CutRule, type CutSet } from '../state/cutoff'
import { WD_LONG, isoToday } from './daysfmt'
import { dayWord } from './sanscal-model'

export interface CutDraft { mode: 0 | 1; lead: string; wd: number; weeks: number }
/* a typed figure: a whole number, or NaN for anything that is not one */
const num = (v: string): number => (/^\d+$/.test(v.trim()) ? +v.trim() : NaN)
export const cutDraftOf = (c: CutRule): CutDraft => ({ mode: c.mode, lead: String(c.lead), wd: c.wd, weeks: c.weeks })
export const cutRuleOf = (d: CutDraft): CutRule => ({ mode: d.mode, lead: num(d.lead), wd: d.wd, weeks: d.weeks })

export function CutFields({ set, prefix, draft, onChange, noun }: {
  set: CutSet
  /** the window's own name for its fields' test ids — `sset`, `iset` */
  prefix: string
  draft: CutDraft
  onChange: (d: CutDraft) => void
  /** what is due: "commitments" on the SANS calendar, "inputs" on the Inputs calendar */
  noun: string
}) {
  const rule = cutRuleOf(draft)
  const shown = cutProblem(set, rule) ? null : cutExample(rule, isoToday())
  return (
    <>
      <div className="sset-seg" role="group" aria-label="The cut-off is set as">
        <button type="button" className={'sset-opt' + (draft.mode === 0 ? ' lit' : '')} data-testid={prefix + '-mode-days'} aria-pressed={draft.mode === 0} onClick={() => onChange({ ...draft, mode: 0 })}>Days before</button>
        <button type="button" className={'sset-opt' + (draft.mode === 1 ? ' lit' : '')} data-testid={prefix + '-mode-wd'} aria-pressed={draft.mode === 1} onClick={() => onChange({ ...draft, mode: 1 })}>A weekday</button>
      </div>
      {draft.mode === 0 ? (
        <label className="sset-row">
          <span className="sset-lbl">Days before the week starts</span>
          <input className="sset-num" data-testid={prefix + '-lead'} inputMode="numeric" autoComplete="off" value={draft.lead} aria-label="Days before the week starts"
            onChange={e => onChange({ ...draft, lead: e.target.value })} />
        </label>
      ) : (
        <div className="sset-pair">
          <select data-testid={prefix + '-wd'} aria-label="Weekday" value={draft.wd} onChange={e => onChange({ ...draft, wd: +e.target.value })}>
            {WD_LONG.map((w, i) => <option key={w} value={i}>{w}</option>)}
          </select>
          <select data-testid={prefix + '-weeks'} aria-label="Weeks before" value={draft.weeks} onChange={e => onChange({ ...draft, weeks: +e.target.value })}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n === 1 ? 'the week before' : `${n} weeks before`}</option>)}
          </select>
        </div>
      )}
      {shown && <p className="sset-example" data-testid={prefix + '-example'}>For the week of {dayWord(shown.week)}, {noun} are due by the end of {dayWord(shown.due)}.</p>}
    </>
  )
}
