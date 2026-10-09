# Brief — design the test scenarios for "an input filed for ALL AVAIL / ALL" and the new input kind "Event" (Astra; read-only)

**You are the scenario designer of a FULL bug check** (the checking order `raptor-port/docs/bug-check-order.md` §4, rank
1 — D6: the other provider designs the scenarios; Opus 5.5 builds and then walks the running app with your list).
The build is in progress on the branch `claude/day-window-compact`; some of it is already in the tree, some is not.
**Design from what was PROMISED — the owner's rulings and the plan — not from what happens to be built.**
Change no file. Run nothing.

## The promise
- The plan, whole: `raptor-port/docs/superpowers/plans/2026-10-09-input-all-avail-plan.md` (version 2, read clean by
  two readers; its §5 is the builder's own roll-call, its §6 the builder's own test list — your job is what they MISS).
- The rulings, one line each in `.claude/rules/decisions/scheduler.md`: **D700, D702, D711, D712, D713, D714**; the
  placeholders: D27, D33, D36, D37, D38–D41, D44, D45, D47, D51, D65, D66, D77, D278, D360, D361; the shared input and
  who files: D654–D663, D682; a published day: D103, D178, D179, D174, D176. `.claude/rules/decisions/oil.md`: all,
  above all D2, D18, D28, D31, D43, D46, D48, D52, D142, D470. `.claude/rules/decisions/people-accounts.md`: D200,
  D213, D215, D297, D327. Open a ruling's full row before leaning on its detail:
  `grep -h '^| D711 |' .claude/decisions-full/*.md`.
- The backlog items: `OUTSTANDING.md` `[INPUT-ALL-AVAIL]`, `[INPUT-EVENT-KIND]`.
- What each surface is and how one edit flows: `raptor-port/docs/feature-impact.md`; the screens' contracts:
  `raptor-port/docs/ui-contracts.md` (search "ALL AVAIL", "Inputs month", "people picker", "OIL Earn").

## Your task — use this wording as your method (the order's §4, verbatim)
> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
> where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
> least-shared or most specialised surface.

## NOT a finding (owner D56) — and so not a scenario
> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
> **Do not report a problem whose harm exists only in data already stored when the code is already correct going
> forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
> NEW data, report it: that is a real finding and this exclusion does not touch it.
Not open either: the owner's own choices (the filer's one answer and no answer of a man's own; the six kinds; one day;
the filer's bell only; Event clashing red; no "count me in / out").

## What to hand back
A numbered list of scenarios a person (or a script driving the real app through its own controls) can walk, **ranked,
most likely to find a real defect first**. For each:
- **ID** (S1, S2 …) · **the ruling(s) it tests** · **role** (admin / member / guest) · **size** (phone 390×844 /
  desktop 1440×900 / either);
- **SETUP** through the app's own controls (the demo week is 13–19 Jul 2026; Sat 18 and Sun 19 Jul are the weekend; the
  admin signs in as `ad`, a member as `us`);
- **ACTION**, step by step, naming the on-screen control;
- **EXPECTED** — what the screen shows AND, where OIL is involved, who is credited what (on the OIL tracker / the Leave
  War, not only on the schedule);
- **DISPROVES** — the one observation that would show it is wrong.
Cover at least: every screen that draws an input's person (the picker in each editor; the Inputs List row, its three
person filters, its pencil editor; the month's bar and tip; the opened day's card; the schedule's request row on the
week and on the Scheduler Board with its count and the ALL AVAIL window; Personal Inputs; the changes window, the
pending list, the Undo label; print / export; the bell); every role; both orders around publishing (file → publish →
change the answer / the crowd / the people → amend; and the reverse), each with Undo, Redo and a reload; OIL Earn's
switches after a Yes, a No and no answer, in both orders with the filer answering again; a holiday declared after
filing; the members' switch turned off after a member filed; both placeholders; each refused kind and each refusal
door; and for Event — every list of kinds, the SC MAIN clash against Meeting's, crew rest, the OIL question, an Event
for several people and for ALL AVAIL, a hand-typed ground row named EVENT.
Then, separately and briefly: **MISSING CALL SITES you suspect from reading** (a file and a function that should carry
this and does not, with the reason) — each is a lead for the walk, not a verdict.

Keep it to scenarios that can FAIL. End with `Rulings: none this session`.
