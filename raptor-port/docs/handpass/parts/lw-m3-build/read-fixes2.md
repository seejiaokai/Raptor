# The second narrow read — of `4fa43cdfe` (Q3, Q6, R1–R2) and `73d98d5e2` (Q8, Q9, Q11) — 26 Oct 26

A fresh, blind Opus reader (D790), handed the two commits and what each fix is for, the D56 exclusion in its brief. Its
report, condensed by the host without changing a finding's meaning (D138); the dispositions are in the sheet.

## Findings

**F1 (low) — R1 missed an SC MAIN line whose START and END are blank.** An all-day Meeting moved → Unavail; the line's
MAIN seat picked: the warning list builds the line as a shift with no hours (validate.ts `blankShift`) and gives the soft
advisory (SHIFT_SOFT), but `slotRules` sets `out.sc` only when both times are typed, so `scSoft` kept the Meeting and the
picker crossed him out "meeting". Fix: a flag for "an SC line" set before the times are tested (not `out.sc`, which the SC
currency check reads), read by `scSoft`; a test of a line with no times.

## Questions

1. **The leave buttons still send untyped words to new bids** (`setCells` / `placeApproved` send `wordsOf(words)`; only
   `fileDuty` strips them). Q11 widens it: LL "Family" on 9 Feb and on 12 Feb, a drag 9–12, LL pressed — before, 10–11
   got no words; now "Family", and since a run is keyed by its words the four days become one run — against D1346 (entries
   never join by themselves) and the new comment's "travel to no new filing".
2. **availByWave on a day with no waves:** a man held by a timed course under Unavailable now appears nowhere in the
   free-crew strip — as a man tasked on a ground row that day does; it reverses the comment's "he would vanish" guard for
   this one case (an AM leave keeps it).
3. **The day panel's two counts:** an all-day leave plus a timed commitment under Unavailable counts him in both
   "Aircrew tasked" and the off total — the same overlap a man on a row plus a leave already had.

## Read and found right

R1's condition matches validate.ts (a known, non-absence kind; unknown kinds stay struck, as the validator fails closed;
an SC SPARE, a duty desk, a flying AVALON / BB row and the three tail chains all agree); `dayTasked` is a set, skips
cancelled, information-only and placeholder lines, changes nothing on a day with waves, and is read only by the day panel,
the free-crew strip and the crew list; `offReason` right; Q3's filter applies to a new add only, Goes to on Unavailable
matters only for an Other, and a placeholder is never filed under Unavailable; `keepWords` behaves as before; Q8's rules
outrank the leave join, reach joined half-day bars and every outlined kind, keep a selected day's ring and never touch a
waiting or refused box; Q9's comments are accurate.
