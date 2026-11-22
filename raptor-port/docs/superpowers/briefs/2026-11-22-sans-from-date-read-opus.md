# The fresh, blind Opus code read — SANS from its date (D2313), the publish note (D2314)

22 Nov 26, chat 140. Read on the exported copy `rc140b` of commit `1a1be5a7e`, to the brief
`2026-11-22-sans-from-date-read-brief.md`; the reader changed no file and saw no other report. Its report came back as
a message; this is its content, kept for the record, with what the host did with each finding.

## Findings, worst first

1. **A hand re-tick reached back over the days he was a regular (medium).** Post Hex out as SANS from Mon 13 Jul (today
   Wed 15); untick him by hand the same day (SANS on 13–14 only); publish Thu 16 with him in its ALL AVAIL crowd; tick him
   again on Fri 17. `state/quals-write.ts` handed the re-tick the POSTING's date, and `sansStart` folded the ended
   stretch into the new one: SANS from Mon 13 with no gap, so the published Thursday read pending and lost its four
   sign-offs — against "earlier published days keep their crowd". The untick already keeps the posting's days as an
   ended stretch, so the lookup of the posting's date was not needed. Fix: `sansStart(p, todayIso())`.
   **Host: reproduced as a failing test, FIXED** (`sans-from-date.test.ts` "a re-tick two days after a hand untick leaves a
   day published in the gap as it went out"; `sansPostedFrom` removed; the builder's own test, which had the re-tick fill
   the gap, corrected). The reading — the gap stays a regular's — is told to the owner.
2. **After a hand untick, the posting's SANS days outlive the posting (low to medium).** Post out as SANS from Tue 14;
   untick by hand on Wed 15 (keeps 14 as a SANS day, and drops the posting's mark); then "Undo post out", or the posting
   moved to a later date: Tue 14 still reads SANS though the posting is gone or now says a later day. Fix named: tag the
   stretch a posting made when a hand untick ends it, and drop tagged stretches in the take-back and the re-run.
   **Host: FILED** — `[FABLE-READ-FAULTS]` found-not-fixed (j): since the hand tick was built, a tick touched by hand is
   the admin's own and a take-back leaves it alone; whether the days before the hand untick should go with the posting
   is put to the owner. Its failing test is in this finding's words: post out Tue, untick, `undoPostOut`, expect
   `sansOn(TUE)` false.
3. **The SANS day says "no longer SANS" of a man who is not SANS YET (low, words).** A man SANS from Wed 15 with a SANS
   availability covering Mon 13: the SANS day of Mon 13 lists him "no longer SANS" (`ui/sanscal-model.ts sansDayGroups`).
   Fix: "not yet SANS" where he is SANS today — new words on screen, so drawn for the owner first (D1625).
   **Host: FILED** — (k), a question for him with its picture.
4. **The commit gate holds the two new dates to nothing on a member's own row (low; for the security review, D1411).** A
   crafted own-row command could set SANS "from always" or write an ended stretch over old published days; the screen
   only ever writes today. Fix named: accept only today's start, or one new stretch ending today.
   **Host: FILED** — (l), with the security review before the database step.

## Explicit negatives
Every remaining read of today's tick (none counts or draws a day beyond those named on purpose); the draw-day scope
(every puck caller inside it, restored in `finally`, nested calls restore the outer day, the copy only read); the dates'
arithmetic (no date, empty start, a year's end, same-day on and off); the published day (the compare, the freeze, the
amendment, an older version, both previews); OIL (the crowd by the day; apart from finding 1 no credit moves without an
amendment); saving (the whole record saved, the posting pass's list, Undo and Redo); the publish note's four forms and
its apostrophe. An edge, not filed: two two-person inputs in one note read with ambiguous "and"s — D2314 rules nothing
about joining inputs.

## Tidiness note (filed, not fixed)
The "SANS on this day" read is written out five times where one helper would do; `restoreBody`'s `sanBy === 'po'` branch
is probably dead (an archive already clears the mark); `sansStart`'s flag `apart` and `sansErase` ("never was", though
ended stretches stay) are named loosely; the schema's note on `sanWas` says "by an archive" where only a posting-made
SANS is ended there.
