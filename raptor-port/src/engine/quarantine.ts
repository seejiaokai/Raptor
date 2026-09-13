/* THE ONE QUARANTINE CLASSIFIER (round-2 fix C, P2-QREV-05/06).
   Round 1 scattered the "is this week/date read-only?" decision across four
   readers that disagreed: state/store.ts protectedDates() classified a stash by
   its publication fields only (so a damaged blob with no `d` array, or the JSON
   text 'null'/'false'/'0', read as editable while UNLOADED); applyWeekModel and
   the Leave-War OIL pass classified the SAME blob as unreadable/preserved. A
   writer could edit dates that one reader called free and another called frozen.
   This module is the single authority every reader now shares:
     stashProtected(key,json) — is a STORED week's blob read-only (unreadable,
       an invalid model shape, a preserved week, or an unsupported/wrong-week
       book)?
     protectedDates()         — every date under quarantine: the loaded week if
       protectedWeek(), plus every stashed week stashProtected() flags.
     inputProtected(inp)      — does this input cover ANY protected date? (the
       global read-only test every input writer preflights against.)
   It lives in the engine so the engine's filing primitives (slots.ts
   acceptInput/unacceptInput) can preflight against the SAME dates the UI and
   state layers do — filing was the writer that bypassed the round-1 funnel. */
import { DATES, inputCoversDate } from './inputs'
import { amFormatOf, protectedWeek } from './publish'
import { stashKeys, stashGet, isPreservedWeek } from './weekstash'
import { weekDatesAbs } from './weeks-data'
import { CURWEEK } from './waves'

/* is a STORED week's blob read-only? A present blob that will not parse, or
   parses to anything but an object carrying a `d` days array, is UNREADABLE
   (P2-QREV-06: 'null'/'false'/'0' parse to falsy/primitive values — treat them
   as damaged, not absent). A preserved week is read-only by definition. An
   otherwise-valid book is read-only iff amFormatOf calls it unsupported. A null
   json (no stored record) is NOT protected — that is a genuinely missing week. */
export function stashProtected(key: any, json: any): boolean {
  if (json == null) return false
  /* ANY failure to classify a PRESENT blob reads as UNREADABLE = protected, never
     an escaped throw (Q2R-04, a regression). amFormatOf's records-belong-to-week
     walk throws on a damaged `als` (a for..of over a non-iterable), and before this
     wrap only JSON.parse was guarded — so the throw escaped protectedDates() and
     broke the input funnel for EVERY week, not just the damaged one. The whole
     classification — preserved check, parse, shape, format — sits inside the guard
     so one damaged stash can never crash a reader. An empty-string blob ('' — a
     truncated whiteboard read) parses-throws here too, so it is protected, not
     mistaken for an absent week (Q2R-08, with the stashGet presence fix). */
  try {
    if (isPreservedWeek(key)) return true
    const sc = JSON.parse(json)
    if (!sc || typeof sc !== 'object' || !Array.isArray(sc.d)) return true
    /* map the stash's short keys onto amFormatOf's shape, threading the week key so
       a wrong-week book is caught too (the same reading applyWeekModel/OIL use). */
    return amFormatOf({ amV: sc.am, als: sc.a, orig: sc.o, cur: sc.cv }, key) === 'unsupported'
  } catch { return true }
}

/* every date label under read-only quarantine — the loaded week if its own book
   is protected, plus every OTHER stashed week stashProtected() flags. INPUTS is
   GLOBAL, so an input covering any of these must be refused from ANY loaded week. */
export function protectedDates(): string[] {
  const out: string[] = []
  if (protectedWeek()) out.push(...DATES)
  for (const k of stashKeys()) {
    if (k === CURWEEK) continue
    /* weekDatesAbs, not weekBundle(k).dates (Q2R-03): a stashed AUTHORED week's
       dates are the fixed BARE labels ('Jul 13'), which dateOrd re-resolves against
       whatever year is LOADED — so a protected 2026 week checked while a 2027 week
       was loaded locked the 2027 weekday of the same label. Year-qualified labels
       compare as absolute dates regardless of the loaded year. */
    if (stashProtected(k, stashGet(k))) out.push(...weekDatesAbs(k))
  }
  return out
}

/* the ONE preflight predicate every input writer checks BEFORE it writes: does
   this input cover any protected date? Empty fast-path when nothing is
   quarantined, so ordinary sessions pay nothing. */
export function inputProtected(inp: any): boolean {
  if (!inp) return false
  const dates = protectedDates()
  return dates.length > 0 && dates.some((dt: any) => inputCoversDate(inp, dt))
}
