# Scenario-design brief — the FULL check of `claude/allavail-sans-postout-141`: D2340 (filing ahead), D2341 (hiding), D2342 (the bell's words), D2346 (the fade)

**For:** Astra (the standing reviewer). **Job:** design the scenarios for a walk of the RUNNING app — hunt for what is
MISSING. You did not build this. The build IS in this copy (it is finished); read the code as you like. Read only; change
no file. State each scenario in your output the moment it is settled, so a stopped run keeps it. You cannot run anything:
where a case needs running, name the exact input and the host will run it. **Do not read `HANDOFF.md`'s chat blocks or the
evidence sheet** (`raptor-port/docs/handpass/2026-11-22-allavail-sans-posted.md`) — a walk's or builder's account would
anchor you. **Written:** 23 Nov 26, chat 152.

## What was already walked (do NOT redesign these; cover only what is new or what the new rules change)
Earlier rounds walked: ALL AVAIL counting a SANS man posted out only when planned with us (D2329), his post-in date
(D2328), the crew-list look-ahead note and the bell line's first build (D2338), the archive/restore/delete of a no-row man.
**New since, and the subject of this check:**
- **D2340 (23 Nov 26):** a man whose SANS posting is saved may have SANS availability filed, by himself or an admin, from
  the moment it is saved, for days from its date — who may be filed for goes by the DAY FILED, not by today. The crew-list
  note before the date: "SANS from Fri 17 Jul: no availability filed. File it on the Inputs page's SANS tab." His bell,
  from the moment the posting is saved: "You're SANS from Fri 17 Jul. You're planned on Sat 18, Mon 20 Jul with nothing
  filed. Tap to file." — shrinking as he files, gone once every day is filed, its tap opening the SANS calendar on the
  first day. Agent's readings told to him: a filing is accepted when he is SANS on at least one of its days, its other days
  hidden; one with none is refused with "<callsign> is SANS from <date>…".
- **D2341 (23 Nov 26):** SANS availability shows and counts only on a day the man is SANS. Filed for a day that stops
  being SANS — his posting moved later, undone (Undo post out), given another outcome; also a Quals untick or an archive —
  it is HIDDEN on every screen and in every count, as if deleted, and shows and counts again by itself once that day is
  SANS again. Only a posting's take-back writes his bell line: "Your SANS availability for Sat 18 Jul is hidden while
  you're not SANS that day." (once a man and posting; a read line keeps its words struck "taken back · <who>", D1699).
  He was promised the SANS calendar and the schedule would not get noticeably slower — the host will time them.
- **D2342:** the bell line is a plain sentence, D2340's words; past three days "and 2 more".
- **D2343 / D2346:** on the SANS calendar a man posted out as SANS from a date ahead sees his OWN days before that date
  faded (colour wash off, figures dimmed) — his view only, an admin's view unchanged, only while the date is ahead, gone
  from that date; a faded day still opens, "+ Commitment" greyed for him.
- Full rows: `grep -h '^| D2340 ' .claude/decisions-full/*.md` (and D2341, D2342, D2343, D2346, D2327, D2313, D2329,
  D1693, D1699, D1710, D2194, D350). Area pages: `.claude/rules/decisions/inputs.md`, `scheduler.md` (§Crew and pucks),
  `people-accounts.md`, `leave-war.md`, `.claude/rules/raptor-executor.md`.
- Code, for orientation: `raptor-port/src/engine/inputs.ts` (the SANS readers), `src/leavewar/sansunfiled.ts` (the bell
  line), `src/leavewar/sync.ts` (takeBack), `src/state/notices.ts`, `src/state/perms.ts`, `src/ui/sansadd.ts`
  (`maySansAdd`), `src/ui/sanscal-model.ts`, `SansCal.tsx`, `SansDay.tsx`, `InputWindow.tsx`, `inputedit.tsx`,
  `peoplepick-model.ts`, `InputsCal.tsx`, `topbits.tsx`, `src/engine/avail.ts`, `src/ui/sans-calendar-model.ts`.
  The diff of the whole round: `git diff f292ab846..HEAD -- raptor-port/src`.

## Exclusions — not findings (D56, D785)
- A problem living only in data already stored (the store is demo data, cleared before the database step) is not a
  finding, unless new data would be hurt too. A scheduler is always an admin: no case of a scheduler who is not one.

## What to give back
1. **Scenarios**, numbered S1…, each: the state (named people from the demo — the demo week is Mon 13 Jul 26; "today" is
   set by the browser's clock; name who signs in: admin `ad` (Saber) or member `us` (Ranger), or another member account an
   admin adds), the presses in the app's own words, and the EXPECTED result on screen at both sizes (desktop 1536, iPhone
   402). Cover, for D2340: every door that files SANS availability (the SANS calendar's day "+ Commitment" for himself; an
   admin filing for him and for several SANS men at once; the Inputs page's input window with SANS chosen; the people
   picker's SANS group; a drag across days on the SANS calendar), before the date, on it, across it (a run of days part
   before, part after), and a man with NO posting ahead (refused as before). For D2341: every reader that must hide a
   hidden day — the SANS calendar's month counts and colours, its opened day, the Inputs calendar, the Inputs list, the
   crew list's SANS Avail panel (Edit Schedule, the Scheduler Board), the armed seat's bar, ALL AVAIL and the flying
   counts, the warning list, the bell — and its return (posting moved back, redo, outcome changed back), before and after
   publishing a day; each cause (posting moved later, Undo post out, another outcome, Quals untick, archive). For D2346:
   the fade at both sizes, his view vs an admin's, the day the date arrives (clock moved past midnight with the page
   open), a posting moved earlier/later while the calendar is open.
2. **What is MISSING** — states the promise covers that a builder is likely to forget; readings you think wrong (each:
   supported / contradicted / the owner's to decide).
3. Keep it to what a walker can press; mark any case only a unit test can reach.
