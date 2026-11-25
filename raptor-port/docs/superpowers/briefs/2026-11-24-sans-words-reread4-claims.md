# What the builder says round 3's fixes do (commit 0e59ea5f3) — claims to check, not facts

- **The owner's D2560 — the hidden planning mark removed whole.** The `sansplan:<pid>:<iso>` rows, their stamp clock
  (`nextStamp`), `planOf`, `sansPlanOwed`, `planOwedBy`, the `sans.planned` projection and its `onCommit` subscriber, and
  the gate's `sansPlanViolation` / `SANSPLAN_OWED` / `SANSPLAN_REPLAY` (with its trust of `causedBy`) are gone
  (`leavewar/sansunfiled.ts`, `state/perms.ts`, `state/people-settings-commit.ts`, `storage/keyowner.ts`). In their place:
  a read reminder's id names the days it held (`sansdue:<pid>[:<n>]~<iso>,<iso>…`); his read record keeps every day he
  has seen of that reminder (`state/noticeseen.ts reminderDays`, `keepReminders`); the reminder is lit when he has read
  none of it, or when a day it names now is not among the days he read. A record in the older shape
  (`2026-07-18.<stamp>`) reads as its days. A `sansplan:` row stored by an older build is read by nothing.
  Claimed to close round 3's Astra F1, SEC-R3-1 and SEC-R3-2 by removing their cause.
- **The builder's reading of D2560 changes four answers older tests pinned** (judge each against the ruling's words):
  (a) planned Sat and Sun, Sat filed, he reads (the line names Sun only), the Sat filing deleted → now lit (was dark);
  (b) the same, Sat planned after he read while it was filed → lit; (c) his SANS date moved earlier over a day he is
  already planned on → lit by that day; (d) a week brought on screen that names him on days no saved week holds → lit
  while that week is on screen, read again once it leaves. Also: a day dropped and planned again → read (was lit); a
  day planned again followed by his date moving past it → he is told "Your SANS date moved to …" (was no line).
  "The same posting made again is news" is kept: the reminder's base counts the lines that ended his SANS.
- **O3-1 (Undo then Redo of an untick).** One shared body, `sansRetracted` in `state/notices.ts`: a line is taken back
  only when the latest word said of it (by time, then the list's order) is a "taken back"; a newer "again" copy wins.
  `sansunfiled.ts` (`dueBase`, `sansUndoToldNow`) and the bell's `sansLineOut` both use it; the old `retracted` is gone.
- **Astra F2 (a man moved squadron kept a stale reminder day).** `engine/roster.ts` home handle gains `sig()`;
  `state/units.ts` supplies it (every Home row, sorted); `engine/overlay.ts landingSig()` is one signature of the men
  deleted, the requests, the loaded week's request rows and the homes; `weeksHeld`'s key is `landingSig() | week on
  screen | squadron in view`, a changed key replacing the whole kept entry; the past-week skip kept.
- **O3-2 (speed).** `engine/overlay.ts loadedSrcSig` leaves out rows no request landed, so a plain row added to or taken
  off the week on screen does not re-read the held weeks; a request's row still does. A change of week still re-reads.

New tests: `raptor-port/src/leavewar/sans-reads-r3.test.tsx`; rewritten cases in `sans-reads-156.test.tsx`,
`sansplan-sec156.test.ts`, `sans-words-156.test.tsx`. Documents corrected: `data-schema.md`, `data-model.md` (§11),
`notifications-register.md`, `file-map.md`.
