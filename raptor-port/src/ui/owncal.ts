/* THE INPUTS CALENDAR'S OWN PLANNING CALENDAR — its notes and day titles, read and written by the page's squadron (the
   reshape plan docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md §3.2 A-ii "The Inputs calendar" — Astra 6 of
   round 1; §3.4 "The planning calendar's one identity").

   The Inputs calendar is an own page: its notes, day titles, their edits, change capture and Undo belong to
   `pageUnit('own', today)` — a master admin's pick, a Plan holder's while his Plan holds, anyone else's own squadron —
   never simply the schedule picked. The page holds ONE planning calendar in memory, the schedule picked's (PLANPUCKS /
   DAYRMK, state/plan.ts — the schedule store's). So:
   - the page's squadron IS the one picked (everyone today, a master admin, a Plan holder): the loaded calendar, read and
     written as always, through the Inputs page's door (writeInputs);
   - it is another (a member or plain admin of 142 with View of 149, 149 picked): that squadron's STORED calendar — read
     from the copy the page kept when it was left (state/plan-foreign.ts keptPlan), else its saved rows; written through
     its stored half (storedPlan), loaded whole before it joins the command, so each note or title it writes is the same
     record it always is, `plan/<unit>@pp:<id>` / `plan/<unit>@dm:<iso>` — its before-image the record as stored, an
     edit a change, its Undo and Redo the timeline's per-record store (undo/timeline.ts) — and nothing of the pick's
     calendar touched.

   ONE BODY OF EDIT RULES: the calendar's verbs (addPlanPuck, editPlanPuck, togglePuckPerson, movePlanSection…) are the
   loaded calendar's, written over PLANPUCKS / DAYRMK (state/plan.ts, not this page's file). Rather than a second copy of
   each, the stored calendar's records are set in those two for the length of the verb, inside the command, and the
   loaded calendar put back exactly as it stood (the same objects, in the same order) before the command's end — so the
   schedule store, enlisted beside, sees no change of its own, and what the verb did is written to the stored half as
   the records it changed. Nothing reads the two between (the verb is synchronous, inside the command). */
import { PLANPUCKS, DAYRMK } from '../state/plan'
import { keptPlan, storedCalendar, storedPlan, type PlanCalendar, type StoredPlan } from '../state/plan-foreign'
import { writeInputs, writeInputsBatchWith } from '../state/store'
import { pageUnit } from '../state/perms'
import { todayIso } from '../engine/editlog'
import { UNIT } from '../engine/unitview'
import { split } from '../storage/unitid'
import { mintOrd, sortByOrd } from '../command/ord'

const puckIdOf = (p: any) => p && p.id
// eslint-disable-next-line react-doctor/no-json-parse-stringify-clone -- compares two records as saving stores them (keys set to undefined dropped)
const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b)

/** the squadron whose planning calendar the Inputs calendar shows today */
export const calUnit = (): string => pageUnit('own', todayIso())

/** the planning calendar the Inputs calendar shows: the loaded one where the page's squadron is the pick, else that
 *  squadron's as stored — READ ONLY (written through writeCal) */
export function calNow(): PlanCalendar {
  const u = calUnit()
  if (u === UNIT) return { pucks: PLANPUCKS, titles: DAYRMK }
  return keptPlan(u) ?? storedCalendar(u)
}

/** a write of the Inputs calendar's notes or titles — `fn` runs one of state/plan.ts's verbs. The page's squadron the
 *  pick: the Inputs page's door, as always. Another: one command over that squadron's stored calendar (above). Answers
 *  as writeInputs does — false only where the command was refused. */
export function writeCal(fn: () => void): boolean {
  const u = calUnit()
  if (u === UNIT) return writeInputs(fn)
  const s = storedPlan(u)
  s.load()                                   // every record of its calendar, read before it joins (plan-foreign.ts)
  return writeInputsBatchWith([s], () => onStored(s, fn))
}

/* the verb run over the stored calendar's records, then what it changed written to the stored half */
function onStored(s: StoredPlan, fn: () => void): void {
  const pucks: any[] = s.notes().map(n => n.note)
  sortByOrd(pucks, puckIdOf)
  const titles: Record<string, string> = {}
  for (const e of s.records().values()) {
    const local = split(String(e.id)).local
    if (local.startsWith('dm:') && typeof e.value === 'string') titles[local.slice(3)] = e.value
  }
  const was = { pucks: new Map(pucks.map(p => [String(p.id), JSON.stringify(p)])), titles: { ...titles } }
  const after = lent(pucks, titles, fn).cal
  const seen = new Set<string>()
  for (const p of after.pucks) {
    if (!p || p.id == null) continue
    const id = String(p.id)
    seen.add(id)
    if (was.pucks.get(id) !== JSON.stringify(p)) s.put(`pp:${id}`, p)
  }
  for (const id of was.pucks.keys()) if (!seen.has(id)) s.drop(`pp:${id}`)
  for (const iso of Object.keys(after.titles)) if (!same(was.titles[iso], after.titles[iso])) s.put(`dm:${iso}`, after.titles[iso])
  for (const iso of Object.keys(was.titles)) if (!(iso in after.titles)) s.drop(`dm:${iso}`)
}

/* the loaded calendar's two stores lent the stored calendar's records for the length of `fn`, each note given its place
   (`ord`) as the schedule store's own apply-end gives the loaded calendar's; then put back exactly as they stood */
function lent<T>(pucks: any[], titles: Record<string, string>, fn: () => T): { out: T; cal: PlanCalendar } {
  const ownP = PLANPUCKS.slice(), ownT = { ...DAYRMK }
  const fill = (p: any[], t: Record<string, string>) => {
    PLANPUCKS.length = 0
    for (const x of p) PLANPUCKS.push(x)
    for (const k of Object.keys(DAYRMK)) delete DAYRMK[k]
    Object.assign(DAYRMK, t)
  }
  fill(pucks, titles)
  try {
    const out = fn()
    mintOrd(PLANPUCKS, puckIdOf)
    return { out, cal: { pucks: PLANPUCKS.slice(), titles: { ...DAYRMK } } }
  } finally { fill(ownP, ownT) }
}

/** a READ of the Inputs calendar's own planning calendar by one of state/plan.ts's readers (planMoveBlock): the loaded
 *  calendar's own where the page's squadron is the pick; else a copy of that squadron's lent for the read */
export function readCal<T>(fn: () => T): T {
  if (calUnit() === UNIT) return fn()
  const cal = calNow()
  // eslint-disable-next-line react-doctor/no-json-parse-stringify-clone -- a copy lent for a read, so nothing the reader does reaches the kept calendar
  return lent(JSON.parse(JSON.stringify(cal.pucks)), { ...cal.titles }, fn).out
}
