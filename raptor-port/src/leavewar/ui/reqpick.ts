/* WHICH PICKED DAYS TAKE THE NUMBER — the Required panel's one rule, pure (the Inputs / SANS redesign, plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.3 "Picking several"; owner D637).

   A drag over the Required rows picks a run of dates; what the number is written to is worked out from what each of
   those days IS, by the one resolver's answer (sync.ts flyAnswer) — never re-derived here:

     · a NO-FLY day is always left out: it needs nobody, and its cell reads NF whatever is typed under it;
     · an ORDINARY day — day or night flying, on no holiday or Off day — always takes it;
     · a weekend not set to fly, a public holiday or an Off day CAN take a typed figure (D637), so: where the pick is
       ONLY such days they are filled; where it mixes them with ordinary days they are LEFT OUT — a drag from Friday
       to Monday means "Friday and Monday" far more often than "and the weekend" — and the panel says so, with one
       press to take them in (`include`).

   A RUNNING figure ("From <date> on") is the resolver's own business: it skips weekends, holidays, Off days and no-fly
   days whatever is picked. It starts on the first FLYING WEEKDAY of the pick (so the day it starts is a day it shows
   on, and wears the corner mark), and the figures typed for the picked flying weekdays themselves are cleared with
   it — he picked those cells and said "18 from here on"; a figure left typed on one of them would hide the run there. */
import type { DayAnswer } from '../sync'

export interface PickPlan {
  /** the dates "These days" writes the number to */
  take: string[]
  /** no-fly days in the pick — always left alone */
  nf: string[]
  /** weekend / holiday / Off days in a MIXED pick that are being left out (empty once included) */
  out: string[]
  /** how many such days the pick holds beside ordinary ones, left out or included — what the Include line counts */
  special: number
  /** the date a running figure would start on */
  runStart: string
  /** the dates whose own typed figure a running figure takes away with it */
  runClear: string[]
}

export function planPick(dates: readonly string[], answerOf: (iso: string) => DayAnswer, include: boolean): PickPlan {
  const nf: string[] = [], ordinary: string[] = [], special: string[] = [], runClear: string[] = []
  for (const iso of dates) {
    const a = answerOf(iso)
    if (a.cls === 'nf') { nf.push(iso); continue }
    if (!a.kind && (a.cls === 'day' || a.cls === 'night')) {
      ordinary.push(iso)
      if (!a.weekend) runClear.push(iso)          // a run never shows on a weekend, even one set to fly
    } else special.push(iso)
  }
  const mixed = ordinary.length > 0 && special.length > 0
  const takes = new Set(mixed && !include ? ordinary : [...ordinary, ...special])
  return {
    take: dates.filter(d => takes.has(d)),
    nf,
    out: mixed && !include ? special : [],
    special: mixed ? special.length : 0,
    runStart: runClear[0] ?? dates[0] ?? '',
    runClear,
  }
}
