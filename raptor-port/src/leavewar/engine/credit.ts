// WHAT ONE OIL CREDIT IS WORTH — the single formula, in a leaf module.
//
// Four places needed this number and each had its own copy of it: the day view
// (summed), the tap list's wording, the bid sheet's wording, and the OIL
// tracker, which reached it a fourth way by reading the day's already-summed
// total. That fourth way stopped working the moment a day could hold TWO
// credits (N16, 21 Sep 26) — the tracker needs it PER CREDIT.
//
// WHY ITS OWN FILE, and not `warrecs.ts` where the record type lives (Astra,
// 21 Sep 26): `warrecs.ts` already imports from `dayview.ts`, so putting it
// there and having `dayview` read it back would close an import loop and make
// module start-up depend on bundler ordering. This file imports nothing.
//
// WHY IT TAKES THE OWNERSHIP and not just the code and the quantity: an
// AUTOMATIC credit is worth exactly what its code says, always. The quantity
// belongs to an AWARD alone — the schedule earns a day for FO and half for HO
// and has no opinion beyond that. Reading `days` off an automatic credit is
// precisely the contamination that made a taken-over 3-day award read as 6
// (both reviewers, independently, 21 Sep 26), so the formula refuses it rather
// than trusting every writer to keep the field clean.

/** A credit, as much of one as the worth depends on. */
export interface CreditWorthOf {
  code: 'FO' | 'HO'
  /** how many days an AWARD is worth, when it is not the code's own worth */
  days?: number
  /** the pass's own credit — `oil: 'auto'`, or a day view's `auto` flag */
  auto?: boolean
  oil?: 'auto' | 'manual'
}

/** The code's own worth: a day for FO, half a day for HO. */
export const codeWorth = (code: 'FO' | 'HO'): number => (code === 'FO' ? 1 : 0.5)

/** What this credit puts in the man's OIL bank. An automatic credit is always
 *  its code's own worth; an award is the quantity it names, or its code's
 *  worth when it names none (the ordinary case, which needs no typing). */
export function creditWorth(c: CreditWorthOf): number {
  const auto = c.auto === true || c.oil === 'auto'
  if (auto) return codeWorth(c.code)
  return c.days ?? codeWorth(c.code)
}

/** "3 days" / "half a day" / "a day" — what a credit is worth, in words. The
 *  tap list, the bid sheet and the day window all say it this way; one wording
 *  for one fact. */
export function creditWorthText(c: CreditWorthOf): string {
  const n = creditWorth(c)
  return n === 1 ? 'a day' : n === 0.5 ? 'half a day' : `${n} days`
}
