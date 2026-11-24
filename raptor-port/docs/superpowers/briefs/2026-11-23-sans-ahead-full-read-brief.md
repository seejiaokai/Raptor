# Code read — the FULL check of `claude/allavail-sans-postout-141`'s last round: D2340 (filing ahead), D2341 (hidden on a day not SANS), D2342 (the bell's words), D2346 (the fade) — chat 152, 23 Nov 26

You are a reviewer. Read only; change no file of the app. You have not seen any other reader's report or any walk report,
and you must not look for one (this branch's handoff, the evidence sheet, the walk reports and this round's other briefs are
taken out of this copy on purpose). Report in plain text. Every claim comes with: the exact state (named people — the demo
week is Mon 13 Jul 26, Hex is `rocky`, Ranger signs in as `us` — dates, what was pressed), what the app does, what the rule
says, the cause (file and function) and the fix, step by step. Where you can, write the claim as a failing test (a new file
under `raptor-port/src/`, which the host will copy and run) — the host believes nothing it has not seen fail. Ask what is
MISSING, not only whether the lines are right.

## What to read
- The change: `FIX-DIFF.patch` at the root of this copy = `git diff f292ab846 <head> -- raptor-port/src`; the copy holds the
  code after it. Its parts: the SANS readers that hide a record on a day its man is not SANS (`engine/inputs.ts sansShownOn`,
  `sansShownAny`, asked by `inputsOn`, `inputsOnDay`, `inputsFor`, `ui/InputsCal.tsx`, `ui/sans-calendar-model.ts`,
  `ui/sanscal-model.ts sansDayGroups`); who may be filed for (`engine/people.ts sansFiler`, `sansAheadDate`, `ui/sansadd.ts`,
  `ui/peoplepick-model.ts`, `ui/inputedit.tsx sansRefusal` — by the day filed); the bell lines (`leavewar/sansunfiled.ts`,
  `leavewar/sync.ts` take-back, `state/notices.ts`, `state/perms.ts` — the `sansback` line's hidden days); the fade
  (`ui/sanscal-model.ts sansBeforeMine`, `ui/SansCal.tsx`, `24-sans-calendar.css`); three fixes from the walk
  (`ui/sansadd.ts openSansAdd`'s refusal, `sansRoster`, `sansDayGroups`' placed line). Tests: `src/leavewar/sans-ahead.test.ts`,
  `sans-before.test.tsx`, `sans-ahead-walk152.test.tsx`, `sans-unfiled*.test.ts`.
- Docs that state it: `raptor-port/docs/notifications-register.md` B13; `docs/data-model.md` §11; `docs/ui-contracts.md`
  §The SANS calendar.

## The rules (full rows: `grep -h '^| D2340 |' .claude/decisions-full/*.md`, the same for each)
- **D2340:** a man whose SANS posting is saved may have SANS availability filed, by himself or an admin, from the moment it
  is saved, for days from its date — by the day filed, not today; the crew-list note before the date: "SANS from Fri 17 Jul: no
  availability filed. File it on the Inputs page's SANS tab."; his bell from the moment the posting is saved: "You're SANS from
  Fri 17 Jul. You're planned on Sat 18, Mon 20 Jul with nothing filed. Tap to file." — shrinking as he files, gone once all
  are filed. **D2341:** SANS availability shows and counts only on a day he is SANS: filed for a day that stops being SANS (his
  posting moved later, undone, another outcome; a Quals untick or an archive too) it is hidden on every screen and in every
  count, as if deleted, back by itself once the day is SANS again; only a posting's take-back writes his line "Your SANS
  availability for Sat 18 Jul is hidden while you're not SANS that day." **D2342:** the line is a plain sentence. **D2343,
  D2346:** his own days before his SANS date faded on the SANS calendar, his view only, gone from that date.
- **D1693, D1699, D1710:** a bell line is taken back by the undo of what made it; unread goes; read keeps its words struck,
  "taken back · <who>". **D2194:** no line of one squadron's business reaches another's people. **D2313, D2327, D2329:** SANS
  read by the day. **D44, D45, D178:** a published day freezes; a change to what it shows reads pending. **D350:** the Undo
  button never takes back a posting. **D200, D1411:** one place answers who may do what (`state/perms.ts`), mirroring
  `data-model.md` §11; a change to what one person may write or see of another gets a security read.

## Not findings (D56, D785)
A problem only in data already stored (demo data, cleared before the database step) unless new data is hurt too; a
scheduler who is not an admin.

## What to answer
1. Every reader of SANS availability: does any still show or count a record on a day its man is not SANS — a shared record
   of several men above all (one SANS that day, one not), a published face, a frozen copy, the Leave War, Insights, the
   warning list, the change history, an export? Is any record wrongly hidden (a day he IS SANS)?
2. Who may file for whom, by the day filed: can a member file or change another man's SANS availability; can anyone file a
   day before a man's SANS date by any door (the calendar's drag, keys, the input window's dates changed after opening, an
   edit of an existing record, a paste, the people picker, the save boundary); a posting changed while a window is open.
3. The bell lines: the reminder from the posting's save — does it appear at once whatever week is loaded or edited; the
   take-back line — written once per man and posting, naming the right days (filed ones, never unfiled), read vs unread,
   struck words he never saw, the line after the posting is put back; can any command forge or erase one (the permissions
   check)?
4. Speed: anything in the hiding that runs per day per record in a hot path (the month, the week, the board's redraw).
5. Tests missing for any of the above.
