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
import { cutBackOf, setCutOfUnit } from '../engine/inputs'
import { RULE_SPEC, RULE_STD, VCONF, rulesSave } from '../engine/rules'
import { store, unitSetting, unitSettingKey } from '../engine/hooks'
import { UNIT } from '../engine/unitview'
import { validate } from '../engine/validate'
import { isAdmin, pageUnit } from './perms'
import { todayIso } from '../engine/editlog'
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
/* BY SQUADRON (the reshape plan §3.2 A-ii; the host's ruling of 21 Nov 26 for phase 2): a calendar's settings window edits
   the squadron of the page it was opened from — the Logic page's door the pick, a calendar's gear its own squadron. The
   loaded squadron's values are VCONF, as always; another's are read from its own stored `rules` record, the standard
   under what it overrides (each checked as engine/rules.ts rulesLoad checks it), never put into VCONF. */
export function getCut(set: CutSet, unit: string = UNIT): CutRule {
  const k = KEYS[set], V = unit === UNIT ? VCONF : rulesOf(unit)
  return { mode: V[k.mode] === 1 ? 1 : 0, lead: +V[k.lead] || 0, wd: +V[k.wd] || 0, weeks: +V[k.weeks] || 1 }
}
/* …and an input's late mark asks the same of its own squadron (engine/inputs.ts inputOwnDueISO — the reshape's phase 3):
   another squadron's days back, by the very sum the loaded squadron's go through (engine/inputs.ts cutBackOf over the
   stored values, as cutBackDays reads VCONF's) */
setCutOfUnit((unit, set) => {
  const k = KEYS[set === 'sans' ? 'sans' : 'inputs'], V = rulesOf(unit)
  return cutBackOf(V[k.mode], V[k.lead], V[k.wd], V[k.weeks])
})
/* a squadron's stored `rules` record as its two halves — the values it overrides and the hard kinds — each a copy */
function storedRules(unit: string): { v: Record<string, unknown>; s: Record<string, unknown> } {
  const r: any = unitSetting(unit, 'rules', null)
  const half = (x: unknown) => (x && typeof x === 'object' && !Array.isArray(x) ? { ...(x as Record<string, unknown>) } : {})
  return { v: half(r && r.v), s: half(r && r.s) }
}
/* a squadron's number values: the standard, then each stored override inside its range */
function rulesOf(unit: string): Record<string, any> {
  const out: Record<string, any> = { ...RULE_STD.v }
  const { v } = storedRules(unit)
  for (const key of Object.keys(v)) {
    if (!Object.prototype.hasOwnProperty.call(RULE_SPEC, key)) continue
    const sp = RULE_SPEC[key], n = v[key]
    if (sp.kind !== 'text' && typeof n === 'number' && isFinite(n) && n >= sp.lo && n <= sp.hi) out[key] = n
  }
  return out
}

/* THE SQUADRON EACH SETTINGS WINDOW EDITS — the Inputs calendar's, the SANS calendar's and the Calendar window. Each
   window is mounted once (ui/App.tsx) and opened by a flag (ui/pops.ts), so the door that opens it says whose it is
   here, first: a calendar's gear and the SANS day's "Calendar…" name their own page's squadron; the Logic page's doors
   name none, so the window edits the pick, as it always did. A window forgets its squadron when it closes (each window
   calls forgetWin), so the next opening that names none is the pick's again. */
export type CutWin = 'inputs' | 'sans' | 'days'
const WIN_UNIT: Record<CutWin, string | null> = { inputs: null, sans: null, days: null }
export function openWinFor(win: CutWin, unit: string | null): void { WIN_UNIT[win] = unit }
export function winUnit(win: CutWin): string { return WIN_UNIT[win] ?? UNIT }
export function forgetWin(win: CutWin): void { WIN_UNIT[win] = null }
/* A WINDOW A PAGE'S DOOR OPENED IS THAT PAGE'S SQUADRON'S — AND GOES WITH IT (the fix round of 22 Nov 26, Opus's read F5,
   Astra's F1 and F3): once the page shows another squadron — his own move taking effect at midnight, a master admin's
   pick — the window was still bound to the old one, its Save written there (or refused and read as saved), and the
   Calendar window's Holidays half showed and wrote the loaded squadron's. Each window closes itself when this says so
   (no words of a held window are approved for these three — his D2243 Q7 gives the band for the Leave War's and the
   Tracker's — so it is closed, never held). A window the Logic page's doors opened names no squadron and follows the
   pick, as it always did. */
export function winStale(win: CutWin): boolean { const u = WIN_UNIT[win]; return u != null && u !== pageUnit('own', todayIso()) }

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
export function saveCut(set: CutSet, r: CutRule, unit: string = UNIT): CutSave {
  if (!isAdmin()) return { ok: false, message: 'Only an admin can change the late cut-off.' }
  const bad = cutProblem(set, r)
  if (bad) return { ok: false, message: bad }
  const k = KEYS[set]
  const next: Record<string, number> = r.mode === 0 ? { [k.mode]: 0, [k.lead]: r.lead } : { [k.mode]: 1, [k.wd]: r.wd, [k.weeks]: r.weeks }
  if (unit !== UNIT) return saveCutOf(unit, next)
  const keys = Object.keys(next).filter(key => VCONF[key] !== next[key])
  if (!keys.length) return { ok: true, changed: false }
  for (const key of keys) VCONF[key] = next[key]
  /* the Logic page's own three: write and persist, re-run the checks, repaint */
  rulesSave(); validate(); notify()
  return { ok: true, changed: true }
}
/* ANOTHER SQUADRON'S CUT-OFF: one write of THAT squadron's whole `rules` record — every other value and hard kind it holds
   kept as stored, a value back at the standard taken out of it, as rulesSave stores only what differs — so it is one
   `settings.rules` command and one Undo step, judged as an admin of that squadron by the gate. VCONF and the checks are
   the loaded squadron's and are left alone. */
function saveCutOf(unit: string, next: Record<string, number>): CutSave {
  const cur = rulesOf(unit)
  const keys = Object.keys(next).filter(key => cur[key] !== next[key])
  if (!keys.length) return { ok: true, changed: false }
  const rec = storedRules(unit)
  for (const key of keys) { if (next[key] === RULE_STD.v[key]) delete rec.v[key]; else rec.v[key] = next[key] }
  /* READ BACK, never taken as saved (the fix round of 22 Nov 26, Opus's read F5): the gate refuses this write for one who
     is not an admin of that squadron — Hunter, saving 142's window after the midnight he became 149's — storing nothing
     and throwing nothing here, and the window closed as if saved. No ruling gives this refusal words of its own: the
     generic ones. */
  let threw = false
  try { store.set(unitSettingKey(unit, 'rules'), Object.keys(rec.v).length || Object.keys(rec.s).length ? { v: rec.v, s: rec.s } : null) } catch { threw = true }
  notify()
  const now = rulesOf(unit)
  if (threw || Object.keys(next).some(key => now[key] !== next[key])) return { ok: false, message: 'This change could not be saved.' }
  return { ok: true, changed: true }
}
