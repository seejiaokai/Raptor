# What else in the app DET affects — the brief (chat 101, 17 Nov 26)

The owner's call (end of chat 100): Fable AND Astra each look for what else in the app DET affects — two readers, blind
to each other, on this one brief. READ ONLY: change no file in the repo except your own report, commit nothing.
Write your whole report to the path you are given.

## What DET is (his ruling D2146 — read its full row first)

`grep -h '^| D2146 |' .claude/decisions-full/*.md` (the shell; a full row is one long line).

A man goes on a detachment (a squadron's people flying away from home for some days, with a schedule of its own — "249 ·
Exercise North") by a new input, **DET**, naming the detachment. On the Leave War he **still counts as his squadron's
manpower**. The overseas duty input (OD) stays for duties away such as a staff trip, which count him out as today.
D2146 replaced D2102 and narrowed D2101, D2120, D2131, D2135; it worked through only the Leave War, OIL, dates, Close
and the transfer. Your job is everything else.

Nothing of it is built; it is built at the database step (Power Apps code app on Dataverse). This is a design check.

Read: the design note `raptor-port/docs/superpowers/specs/2026-11-16-multi-sqn-detachment-design.md` (whole: the
detachment passages and §Round 6, where DET is); the rulings D2087–D2149 and D2159 (short lines in
`.claude/rules/decisions/scheduler.md` and `people-accounts.md`; full rows by grep as above). Then the app's code, to
see where an OD or an Unavailable input is read TODAY: `raptor-port/src/` (the rules engine `src/engine/`, the Leave
War `src/leavewar/`, the Tracker `src/tracker/`, inputs, Insights, OIL, the SANS calendar, notifications), and the
documents `raptor-port/docs/engine-rules.md`, `feature-impact.md`, `data-model.md`, `notifications-register.md`,
`.claude/rules/decisions/inputs.md`, `oil.md`, `leave-war.md`, `tracker.md`.

## The questions

For each place below — and any other you find — say (a) where today's app reads an OD, or any Unavailable input, by
file and function; (b) what DET must do there, and why; (c) what goes wrong if the build forgets it, as a named case.

1. The Leave War's counts (Available rows, manning warnings, months, bids), and the SANS calendar's need read from them.
2. OIL — does DET ask the OIL question; the detachment's own published days paying his weekends; a DET crossing a weekend.
3. Insights and work hours — whose hours, which schedule, a day at the detachment.
4. The Tracker — a student on a DET flying the detachment's schedule.
5. Quals and currencies — sorties flown at the detachment; a currency running out while away.
6. Crew rest, days in a row and the long day between the detachment's schedule and home (D2122, D2123, round 6's R5).
7. The man's own phone view — what he sees at home and at the detachment, before, during and after.
8. Notifications (the bell) — filing, changing, Close, Reject (round 6's F4).
9. Logic's count rows (who a row counts — the scheduler page, D637–D674) and the day's count (D2096).
10. Publishing and sign-offs — a DET filed or changed on a published day, at home and at the detachment; the late mark.
11. The IT side's table list (`raptor-port/docs/data-model.md`, `handover-dataverse.md`) — what DET adds.
12. Anything else: print and export, Undo (D148, D350), the input window, the people check across squadrons (D2108),
    archive / post out / transfer (D2136, D2147), ALL AVAIL (D2097), the several-people picker (D2131).

## How to write each finding

All four or it is not a finding: **the concrete failure** — who, which day, what he presses, what goes wrong on screen
or in the record; **where today's app does it** — file and function, opened and read by you (a claim you did not check
in the code is marked "unchecked"); **the fix** — exact, with a recommendation, and the other choice where it is the
owner's product call; **its weight** — HIGH (wrong published record, wrong OIL, lost data, someone editing what they
must not), MEDIUM (a check that misses, a confusing screen), LOW.

HIGH first, numbered. Then one line per place in the list above that DET does NOT affect, with the reason. Keep it to
what matters.

## What is not a finding

- A problem only in data already stored — the whole store is demo data, cleared before the database step (D56) —
  unless new data would be hurt too.
- A choice he has ruled on, merely because you would choose differently — unless it contradicts another ruling or
  makes a concrete failure; then say which.
- A question already answered: search `.claude/decisions-full/`, `DECISIONS-ARCHIVE.md` and `OUTSTANDING.md` first.
- Code style, or code not yet written. Words: the bare squadron number only, never the squadron or service abbreviation.

## Blind

Do not open any file named `*det-check*` other than this brief, nor any `*red-team*` report under
`raptor-port/docs/superpowers/briefs/` — other readers are writing them now.
