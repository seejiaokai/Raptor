# Red team brief — the day lock and a row per day (`[DB-SYNC-MODEL]`, D355, D356) — 29 Sep 26

**You are one of two independent reviewers (Fable 5.1 and Astra), each reading alone** (D353: an important plan's red
team is both providers). Opus 5.5 wrote the design; do not assume it is right. **Read only; change no file.**

## What to read (live files — read them, do not trust this summary)

1. **The rulings**, full rows: `grep -h '^| D35[56] |' .claude/decisions-full/*.md` — his words for the day lock (D355)
   and the three settled answers (D356). Also the scheduler area's short lines, `.claude/rules/decisions/scheduler.md`
   (D148 undo only takes back your own changes and refuses if someone changed the same thing since; D178 / D179 a member's
   input change on a published day is a pending change; D103 any pending change wipes the four sign-offs), and
   `.claude/rules/decisions/people-accounts.md` (roles). How-we-work D56 (below).
2. **The design under review** — `raptor-port/docs/data-model.md`:
   - §3 **ScheduleWeek** and **ScheduleDay at stage 1, and DayLock** (new) — the week stored as a small week row plus
     one row per day; the claim that every field of today's persisted week record belongs to exactly one day;
   - §9 **Conflict policy** table (changed rows) and **The day lock** (new, rules 1–10 and the `DayLock` table);
   - §11 the note on the lock's permissions above "The server enforces, the browser mirrors";
   - §12 Open questions 6 (narrowed), **8 and 9** (new);
   - §5 the `raptor:weeks/…` row, §6 stage 1, §7 "Per-row writes", §9 "The change feed" (edited lines).
   - What it replaced, for comparison: `raptor-port/docs/archive/data-model-2026-09-29.md`.
   - `git diff origin/main -- raptor-port/docs/` shows every change in one place.
3. **The screens** — `raptor-port/docs/mock/day-lock.html` (open the HTML; the pictures are `img/day-lock/*.jpg`) and
   its six questions to the owner.
4. **The app as it is**, to test the claims: the persisted week record `raptor-port/src/state/store.ts` (`weekStashSnap`,
   around line 461, and its reader around 530–560), `raptor-port/src/state/history.ts` `schedFields`, `SCHED` in
   `raptor-port/src/engine/publish.ts` (line ~54), `warnMuteKey` in `raptor-port/src/state/view.ts`, how an accepted input
   lands on a day (`autoAcceptSeedInputs` and the input landing code under `raptor-port/src/engine/`), the storage seam
   `raptor-port/src/storage/` (backend, postman, fan-out), and the as-is map `raptor-port/docs/data-schema.md`.

## What we want from you

**What is MISSING or WRONG in this design, before the IT team builds tables from it.** In particular — but do not stop
at these:

- **The split by day.** Is there any field of today's week record, or any write the scheduler makes, that names no
  single day (so it would still write the week row, or two day rows at once)? Cross-week effects (the forward crew-rest
  trace, the 7-day run, a move to next week's Monday)? Amendments and sign-offs that span days?
- **The lock itself.** Races: two people taking one free day; a take of an expired lock racing the holder's own touch;
  a release lost on page close; a take-over while the holder's save is in flight; a holder on two devices or two tabs
  (the same user); "Edit days…" partly failing; the 30-minute clock (store time vs device time, the once-a-minute touch).
  Is "advisory unless a plug-in" acceptable, and is rule 8's claim true that the version check still stops every silent
  overwrite?
- **Writes the lock does not cover** (rule 9, Open question 9): member inputs, Leave War decisions, OIL credits,
  the post-out pass, a person archived or deleted (their pucks on days to come), a callsign rename. Which of them write a
  day today, and what happens to each when a scheduler holds that day? Is the recommendation (a) sound?
- **Undo** (D148) across a release, a take-over and another person's change; the one changes window / `EditLog`.
- **Publishing and signing** under the lock (rule 2) — anything in the publish or amendment flow that writes more than the
  day it publishes?
- **The 30-second check** (rule 7): cost, what "arrives" means for a screen mid-drag or mid-typing, a phone in the
  background, Dataverse change tracking as the feed.
- **Anything in the mock-up** that contradicts §9, or a state it does not draw that the owner will meet (a published
  day held; a day held on the next week; the board opened on a held day from a link).
- **The tables IT will build**: is `DayLock` as a separate table right (vs columns on `ScheduleDay`)? Anything missing
  from it? Is the §11 note enough?

## Out of scope — do not report

- **D56 (owner, 23 Sep 26):** a problem that lives ONLY in data already stored is not a finding — all stored data is
  demo data, wiped before the database. It applies only when the design is correct going forward.
- Anything about the app's current single-browser behaviour that the design does not change.
- Wording and style of the docs, unless a sentence says something false.
- The Tracker's syllabus data (D62).

## How to answer

A numbered list of findings, **most severe first**. For each: **what is wrong or missing** (one or two sentences), **the
evidence** (file and line, or the rule it breaks), **a concrete scenario** where it bites, and **an exact fix** — the
words or rule to write into `data-model.md` (or the screen change), step by step, not a direction (his standing ask:
a reviewer gives detailed fix specs). Mark each **BLOCKER** (the tables would be built wrong), **MAJOR** (a real hole the
build would have to invent an answer for) or **MINOR**. Then one line: your overall verdict — **APPROVE**,
**APPROVE WITH FIXES** or **REVISE**. No preamble.
