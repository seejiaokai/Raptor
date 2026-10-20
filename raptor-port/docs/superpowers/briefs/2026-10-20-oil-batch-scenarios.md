# The OIL batch (20 Oct 26) — the scenario designer's brief

You are a fresh reader. You did NOT build this and you are not told how it was built: do not read the branch's commits
or diff (`git log` / `git diff` of `claude/oil-small-fixes-1020` against `main`). Read `main`'s code and documents as you
need to understand the app. **Change no file except your one output file:**
`raptor-port/docs/handpass/parts/oil-batch/scenarios.md`.

## The job
Design the test scenarios a hand walk of the RUNNING app (a scripted real browser, desktop 1440 and phone 390) should
drive for the three changes below — and above all, name what could be MISSING. Use this wording, from the bug-check
order §4:

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
> where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
> least-shared or most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
> **Do not report a problem whose harm exists only in data already stored when the code is already correct going
> forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
> NEW data, report it.

Give each scenario: an id, the setup (through the app's own controls), the action, the EXPECTED result (cite the ruling
it comes from; where you cannot say what is right, write "RECORD exactly what it says"), and what would disprove it.
Add up to eight break tests (inputs a careless person types). End with a short list "most likely missing". Explicit
negatives too ("I checked X and found nothing to test there, because…").

## The three changes — the promise (OIL is earned leave, time off banked, never pay — D25)

1. **[UNPUB-WARN-AL-RESTORES]** — Edit Schedule, a published weekend day, its "Unpublish" button. When taking the day's
   OIL credits away would put a credited person's OIL balance below zero (he has already spent them on the Leave War),
   the first tap only warns, the second withdraws (`[GLOBAL-UNDO]` §6.6). Unpublishing the ORIGINAL makes the day a draft:
   it earns nothing (D2 — only the issued schedule pays). Unpublishing an AMENDMENT (AL1, AL2…) makes the version before
   it the issued schedule again (D101: its changes wait on the working copy as pending), and a day's OIL comes from its
   latest published version (D142). The promise now: **the warning reckons the OIL the day will carry AFTER the press —
   none for the Original, the earlier version's for an amendment — and warns only if that leaves someone below zero; its
   words say which case it is.** The Original's words of record are N4 / N2 (D837): "Some of Saturday’s OIL credits are
   already spent on the Leave War. Unpublishing withdraws them until you republish. Tap again to confirm." and, done,
   "… Its OIL credits are withdrawn from the Leave War until it is republished."
2. **[OIL-ZERO-SPAN-SORTIE]** — a flying line typed with the SAME take-off and landing still earns, from the report
   before it and the debrief after it (D49); a seat with nothing to measure earns nothing (D31); the report is the
   formation's earliest applicable entered in-time / rally, else the Logic page's nominal lead (D591, D592). With neither —
   the entered in-time IS the take-off and Logic's "Flight debrief after land" is zero, or both Logic values zero — the
   line earns nothing. The promise now: **the line's advisory says it earns nobody any OIL (not "the day still earns from
   the report and debrief"), and the day's "no usable times" warning (weekends / holidays) names the line**, wherever the
   app prints either — the day's warning list, the marked time box's own words on Edit Schedule's week, the Scheduler
   Board and the next-week peek, and the note after publishing.
3. **[LW-OIL-DATECHIP-HIDDEN]** — the Leave War's OIL tracker, an admin taps a correction (a negative entry) to edit it
   and taps its date box: the date calendar must open ON TOP of the tracker's rows, in the screen, and a day pressed in it
   is the date saved (filed 30 Sep 26: it opened hidden behind the rows below; the app's one date calendar, D901, may have
   cured it).

## Read first
`.claude/rules/decisions/oil.md` (and full rows: `grep -h '^| D49 |' .claude/decisions-full/*.md`, likewise D31, D2,
D142, D591, D592, D101, D103, D837), `raptor-port/docs/bug-check-order.md` §6 and §7.4, the backlog items in
`OUTSTANDING.md` (`[UNPUB-WARN-AL-RESTORES]`, `[OIL-ZERO-SPAN-SORTIE]`, `[LW-OIL-DATECHIP-HIDDEN]`), and as much of the code
on `main` as you need (`raptor-port/src/ui/interactions.ts` the Unpublish button; `src/leavewar/sync.ts`; `src/engine/oil.ts`,
`src/engine/validate.ts`; `src/leavewar/ui/OilTracker.tsx`). The demo world: sign in `ad` / `a` (admin); the seed week's
Saturday 18 Jul 2026 has an SDO duty desk (plasma) and is a weekend; the Logic page holds the report and debrief values.
