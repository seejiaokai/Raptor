# The narrow read of the Q2 fixes (`f454b59cd`, `12b50c81f`) — 25 Oct 26

A fresh, blind Opus reader (D790), handed the two commits and the rulings they answer (D1372, D1357), asked "is each fix
right and complete, and what did it break beside it?", with the D56 exclusion in its brief. Its report, condensed by the
host without changing a finding's meaning (D138); the dispositions are the host's, in the sheet.

## Findings

**R1 (medium) — a Meeting under Unavailable crossed out of an SC MAIN seat while the warning list only advises.** Viper's
Meeting 09:00–10:00 moved → Unavail; an SC AM MAIN seat (07:00–13:00) picked: crossed out "meeting", out of "N free";
planted, the warning list raises only the amber advisory (validate.ts's Meeting branch). Before: nothing in the picker.
Cause: `isAway` now true for every commitment under Unavailable, so `slotBar`'s four absence chains take it for an SC MAIN
slot with no soft-kind check. Fix: in each chain drop a commitment that is not shift-hard on an SC MAIN slot
(`!(r.sc && !r.scSpare && isPersonal && !shiftHardInput)`); a test that a Meeting is not struck there and a course is.

**R2 (low) — the day panel no longer agrees with the crew list for a course with hours.** Before, its Ground row counted
him in "Aircrew tasked"; now the crew list fades him (palette-html), the day panel's count (`html.ts dayEngaged(d).size`)
leaves him out, "Leave / downchit" counts only all-day ones, and on a day with no waves `availByWave` puts him in "Free
all day". Cause: the timed-commitment addition lived only in the crew list. Fix: one function in `avail.ts` (dayEngaged
plus a timed commitment under Unavailable) read by the crew list, the day panel and `availByWave`; one test of all three.

## Questions

- A seat with no hours yet: a timed course under Unavailable now strikes him from a duty, ground or sim row with no hours
  (the absence blocks fail closed), while the validator's no-hours check reads only whole-day inputs — the same drift a
  half-day leave or a timed overseas duty already has.
- ATT B plus an all-day course: struck, but `offReason` may name the ATT B ("may still work") — prefer an input that is not
  ATT B.
- A cancelled leave or medical: `isAway`'s leave/medical/OD leg has no `inputSilent` guard (older than this change).
- The reason now reads "course (CSE)" (`offWord`) in place of "already on CSE 06:00–18:00" — the hours and an Attach's "To"
  no longer shown.

## Read and found right

The ALL AVAIL crowd unchanged (it filters removed and cancelled inputs first, and keeps every commitment out); OIL has no
`isAway` reader; SC SPARE / AVALON / BB still cleared by `canSpare`; ATT B untouched; timed windows feed `availByWave` as
the row's hours did; the SANS section and `groundedOnly` right; a cancelled Attach now free, as the warning list reads it;
`eng0` safe (a fresh set, ignored when a seat is picked, standby men read tasked as their course row made them, "N free"
right, placeholders guarded, one line a named person, each day an input covers); yesterday's overnight tail does not fade
him today (as the row never did), while a picked seat still catches it.
