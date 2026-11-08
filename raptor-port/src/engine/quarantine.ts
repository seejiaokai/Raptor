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
import { stashKeys, stashGet, isPreservedWeek, preservedBlob } from './weekstash'
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

/* WHY A WEEK IS READ-ONLY (owner D1785, 8 Nov 26 — "All as recommended", the pictures round's question 6): a week whose
   saved copy cannot be read says so, and refuses a change in the same terms, where it used to blame "an older version of
   the app" as an older book does. The two cases, told apart by the one test persist and applyWeekModel already make:
     'unreadable' — the saved copy will not read as a week (not JSON, or not an object carrying a `d` days array: a
       damaged row, which state/persist.ts keeps as it is and stores as a record with no days);
     'older'      — it reads, but in a form this app will not edit: an older version's book (amFormatOf 'unsupported'), a
       whole-week old record kept as it is, or records of another week.
   null when the week is not read-only. The LOADED week is read-only by protectedWeek() and the bytes it keeps are its
   preserved blob; a STASHED week by stashProtected(), its bytes the preserved blob if it has one, else its stash.
   Guarded like stashProtected: a damaged blob never throws out of a reader — it reads as unreadable. */
const readsAsWeek = (json: any): boolean => {
  try { const sc = JSON.parse(json); return !!sc && typeof sc === 'object' && Array.isArray(sc.d) } catch { return false }
}
export function weekLockReason(key: any): 'unreadable' | 'older' | null {
  try {
    const k = String(key)
    if (k === String(CURWEEK)) {
      if (!protectedWeek()) return null
      return isPreservedWeek(k) && !readsAsWeek(preservedBlob(k)) ? 'unreadable' : 'older'
    }
    if (!stashProtected(k, stashGet(k))) return null
    return readsAsWeek(isPreservedWeek(k) ? preservedBlob(k) : stashGet(k)) ? 'older' : 'unreadable'
  } catch { return 'unreadable' }
}
/* is ANY week — the loaded one, or any stashed one — unreadable? The refusal's words read this (publish.ts
   lockedWeekNote), not the week the refused change touches: a refusal only ever comes from a read-only week, and the one
   case where the two readings part — an unreadable week somewhere while the change touches only an older-format week —
   needs an older-format week, which only data already stored can hold (owner D56: no fix for a harm that lives only in
   stored data; the scenario design's R2, kept on D56). */
export function anyUnreadableWeek(): boolean {
  if (weekLockReason(CURWEEK) === 'unreadable') return true
  return stashKeys().some(k => k !== CURWEEK && weekLockReason(k) === 'unreadable')
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
