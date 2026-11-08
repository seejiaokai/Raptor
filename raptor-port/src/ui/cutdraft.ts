/* THE LATE CUT-OFF'S DRAFT — what the two settings windows hold while he types (ui/CutFields.tsx draws the fields).
   MOVED WHOLE out of CutFields.tsx on 8 Nov 26 so that file exports only components (React Doctor's
   only-export-components, D1534 — [RD-LEFT-1108]). What is typed is a DRAFT: a string for the day count, so "" and "x"
   stay what he typed and are refused in words, never read as 0. */
import type { CutRule } from '../state/cutoff'

export interface CutDraft { mode: 0 | 1; lead: string; wd: number; weeks: number }
/* a typed figure: a whole number, or NaN for anything that is not one */
const num = (v: string): number => (/^\d+$/.test(v.trim()) ? +v.trim() : NaN)
export const cutDraftOf = (c: CutRule): CutDraft => ({ mode: c.mode, lead: String(c.lead), wd: c.wd, weeks: c.weeks })
export const cutRuleOf = (d: CutDraft): CutRule => ({ mode: d.mode, lead: num(d.lead), wd: d.wd, weeks: d.weeks })
