/* THE LATE CUT-OFF, AS A CALENDAR'S SETTINGS SET IT (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.9; owner D628: "the late cut-off can be set either
   as a number of days or as a weekday of a number of weeks before (for example the Wednesday two weeks prior)"; D639:
   "set behind each calendar's own settings gear — the SANS calendar and the Inputs calendar each have their own").

   The rule itself is the engine's (engine/inputs.ts — cutSetOf, cutBackOf, isLateInput) and its four values a set are
   Logic rules (engine/rules.ts VCONF + RULE_SPEC: inputLead / inputCutMode / inputCutWd / inputCutWeeks and the SANS
   set's own four). THIS is the door a settings window writes them through: it checks all four against the engine's own
   ranges, changes only what differs, and saves through THE COMMIT THE LOGIC PAGE USES — the rule values written, then
   `rulesSave()`, which is one write of the `rules` settings record and so one Undo step. One setting, two ways in
   (D639): the Logic page shows the same values.

   Only the values of the mode chosen are written: choosing "a weekday" leaves the day count as it was, so going back
   to "days before" finds the squadron's old figure, not a nought. */
import { cutBackOf } from '../engine/inputs'
import { RULE_SPEC, VCONF, rulesSave } from '../engine/rules'
import { validate } from '../engine/validate'
import { isAdmin } from './perms'
import { notify } from './store'

export type CutSet = 'inputs' | 'sans'
export interface CutRule {
  /** 0 = a number of days before the week's Monday; 1 = a weekday of a number of weeks before */
  mode: 0 | 1
  lead: number
  /** Monday = 0 … Sunday = 6 */
  wd: number
  weeks: number
}
const KEYS: Record<CutSet, { lead: string; mode: string; wd: string; weeks: string }> = {
  inputs: { lead: 'inputLead', mode: 'inputCutMode', wd: 'inputCutWd', weeks: 'inputCutWeeks' },
  sans: { lead: 'sansLead', mode: 'sansCutMode', wd: 'sansCutWd', weeks: 'sansCutWeeks' },
}
export function getCut(set: CutSet): CutRule {
  const k = KEYS[set]
  return { mode: VCONF[k.mode] === 1 ? 1 : 0, lead: +VCONF[k.lead] || 0, wd: +VCONF[k.wd] || 0, weeks: +VCONF[k.weeks] || 1 }
}

const whole = (v: unknown, lo: number, hi: number): v is number => typeof v === 'number' && Number.isInteger(v) && v >= lo && v <= hi
/** why a rule cannot be saved — '' when it can. The ranges are the engine's own (RULE_SPEC), so the Logic page and this
 *  door can never accept different figures. */
export function cutProblem(set: CutSet, r: CutRule): string {
  const k = KEYS[set]
  if (r.mode !== 0 && r.mode !== 1) return 'Choose days before, or a weekday.'
  if (r.mode === 0) {
    const s = RULE_SPEC[k.lead]
    return whole(r.lead, s.lo, s.hi) ? '' : `The number of days must be a whole number from ${s.lo} to ${s.hi}.`
  }
  const w = RULE_SPEC[k.weeks], d = RULE_SPEC[k.wd]
  if (!whole(r.wd, d.lo, d.hi)) return 'Choose a weekday.'
  return whole(r.weeks, w.lo, w.hi) ? '' : `The number of weeks must be from ${w.lo} to ${w.hi}.`
}

/** A WORKED DATE for a rule — saved or not: for a week some way ahead of `todayIso`, that week's Monday and the last
 *  day an entry for it may be touched and still be on time. The sum is the engine's own (cutBackOf), so what the
 *  window shows before Save is what the mark will judge by after it. */
export function cutExample(r: CutRule, todayIso: string): { week: string; due: string } {
  const ms = (iso: string) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10))
  const iso = (t: number) => new Date(t).toISOString().slice(0, 10)
  const ahead = ms(todayIso) + 21 * 86400000
  const monday = ahead - (((new Date(ahead).getUTCDay() + 6) % 7) * 86400000)
  return { week: iso(monday), due: iso(monday - cutBackOf(r.mode, r.lead, r.wd, r.weeks) * 86400000) }
}

export interface CutSave { ok: boolean; message?: string; changed?: boolean }
export function saveCut(set: CutSet, r: CutRule): CutSave {
  if (!isAdmin()) return { ok: false, message: 'Only an admin can change the late cut-off.' }
  const bad = cutProblem(set, r)
  if (bad) return { ok: false, message: bad }
  const k = KEYS[set]
  const next: Record<string, number> = r.mode === 0 ? { [k.mode]: 0, [k.lead]: r.lead } : { [k.mode]: 1, [k.wd]: r.wd, [k.weeks]: r.weeks }
  const keys = Object.keys(next).filter(key => VCONF[key] !== next[key])
  if (!keys.length) return { ok: true, changed: false }
  for (const key of keys) VCONF[key] = next[key]
  /* the Logic page's own three: write and persist, re-run the checks, repaint */
  rulesSave(); validate(); notify()
  return { ok: true, changed: true }
}
