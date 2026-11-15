# The builder's second brief — the FULL check of [WARN-WORDS-STANDALONE] (the night of 16 Nov 26, chat 83)

You built the job (your report: `2026-11-16-warn-words-build-report.md`, this folder). Now carry its FULL check to the
end, by `raptor-port/docs/bug-check-checklist.md` — every step from 6 on that the build stage did not finish, each
section of `raptor-port/docs/bug-check-order.md` it names opened whole as its step comes. Your first brief's "Rules of
the road" still hold (`2026-11-16-warn-words-build-brief.md`).

**The pull request is open: 783, into `main`.** GitHub's run of it is the full gate set (the repo is public, D1086).
Never push while a run of the branch's last pushed commit is `queued` or `in_progress` — a push starts TWO runs, so
read them all: `gh run list --branch claude/warn-words-standalone --limit 6 --json status,workflowName,headSha`.
Batch fixes and push once that run has finished. Do not watch the pull request. One unpushed commit of the
coordinator's (this brief) sits on the branch — your next push carries it.

**The clock:** the night ends about 12:05 (read `date`); the coordinator needs the last hour for the morning report.
Have the check closed — or, if it cannot close, everything committed and pushed and the sheet saying what is open — by
about 10:45. If time runs short, what is left is a re-walk's breadth, never a read or a check skipped silently: say it.

## The order, LOW (one helper at a time, the fewest the checks need)

1. **Scenarios designed by a reader who did not build it** (the order §4): Astra (Codex, the standing reviewer —
   `raptor-port/docs/codex-guide.md`), asked what is MISSING from the walk, not whether the code is wrong; the brief
   names the area files the change touches and their full-text files, and carries the D56 exclusion (§2b). If Astra
   cannot run, a fresh Opus reader does it, and the sheet says so. Save the scenario list into the brief's folder the
   moment it returns.
2. **The roll-call** filled (§6, §2a): every place the app draws a warning's words or the assumed landing's effect —
   no blank cells. **The sizing** (§7.0, `raptor-port/docs/walk-ledger.md` §Before any walk) — five lines into the
   sheet; go through every lesson of the checklist's list, each covered by a scenario or a named test or why it cannot
   apply.
3. **The walk** on a production build served locally (§7.2; `raptor-port/docs/walk-scripts.md` before any script or
   walker's brief), phone and desktop, by **Sonnet 5.5 walkers** (D787), each in its own world and port, ONE at a
   time under LOW — take the checks lock for a fanned-out walk or any browser run of more than one file. It includes the
   plain-user round (§7.0a): the warning list's everyday tasks end to end — a warning tapped lights its crew, a warning
   hidden and shown again, the ALL AVAIL window, print and export, the Logic page's new row changed and Reset, the
   pending list, Insights' "Conflicts by type", View-only Sched — and his Ranger's Friday staged
   (`raptor-port/scripts/handpass/rcb2/rcb2-w3-r1.mjs`) and pictured beside the approved page's proposed rows. Each
   "Conflict:" line measured to fit two rows on a phone; no time range broken across lines. YOU open every picture that
   decides something, cropped to what matters, and reproduce every finding before it counts.
4. **The reads, after the walk** (§4 "Who reads the finished code now", §4a): **Astra AND a fresh, blind Opus reader**
   (an Opus that did not write the code and has seen neither the walk's report nor the other reader's), the same brief,
   each blind to the other, the finished diff against `main`; asked for what is missing; every claim written as a
   failing test before it is believed. Point both at your report's §9 (the reference side's crew-rest tail; the
   published-day OIL test not seen red on its own). **Each reader's report and every copy or summary stay in the
   scratch folder outside the checkout** (`C:/Users/User/AppData/Local/Temp/claude/42b9573624e95a02/4c1797bb-9f38-4e6f-b517-4ac8dd7d50b9/scratchpad/reads/`)
   until BOTH have reported; then save both into the brief's folder. If Astra cannot run, say so in your reply — the
   job then goes on the reads-owed list, which the coordinator writes.
5. **Fix** each real finding red-first; **re-walk what the fixes touched** (a Sonnet walker); the touched tests between
   rounds.
6. **The gates green on the last pushed commit** — GitHub's run of the pull request, both runs read.
7. **The evidence sheet closed** (§9): its `Walk:` line, the §12 boxes ticked, the "look here" card for him (§11) —
   three to five lines in the app's own words — and the `Docs:` and `docsize:` lines from `npm run docsize`. A row in
   `raptor-port/docs/walk-ledger.md` for the walk.

## What stays the coordinator's

`HANDOFF.md`, `OUTSTANDING.md`'s items and the rulings files are not yours to edit. A choice truly his does not stop
you: build or check the rest, and give it in your reply in the shape of the first brief. A fault older than this job,
found on the way: in your reply, with its case and place, for the coordinator to file.

## Your final reply (your report — not a file you call a report)

Conclusions only: (1) the scenarios and who designed them; (2) the walk — walkers, size, PASS counts, each finding and
its disposition, the pictures' folder; (3) each read — who, what they found, what you did with each, and that both were
blind; (4) the fixes, commits, pushed, tests red first; (5) GitHub's runs on the last pushed commit, as read; (6) the
sheet's `Walk:` line, copied; the look card, copied; (7) wording the fixes changed, old → new; (8) questions truly his;
(9) older faults found, for filing; (10) what was not done, and why.
