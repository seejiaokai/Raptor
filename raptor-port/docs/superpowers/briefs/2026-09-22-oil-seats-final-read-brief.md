# [OIL-SEATS-CAN-EARN] — the final code read. Brief for BOTH providers, independently.

**Bug-check order §4 rank 2 and §4a:** this change touches MONEY (OIL is earned
leave — a day off banked for the man), an ISSUED record, four signatures and
persistence, so one inspector is not enough. Fable 5.1 and Astra/Codex each read
the finished code, blind to each other. **Neither is shown the other's report
before both exist.**

**The walk has already run.** That is deliberate and is §4a's first rule: reading
for absence works when there is a roll-call in hand, and reading cold does not.
The evidence sheet is part of this brief.

---

## What to read

- Branch `claude/oil-seats-can-earn`, against `main`.
- **The evidence sheet: `raptor-port/docs/handpass/2026-09-22-oil-seats.md`** —
  the eight questions and the tier, the roll-call by hand on every seat kind, the
  door check in both orders, the money across the publish boundary, §6 the walk's
  findings and §6a the five it left open with their fixes and the re-walk.
- The plan: `…/specs/2026-09-22-oil-seats-can-earn-plan.md` (§5 step 8 is struck
  through — D49 overruled it).
- The behaviour register: `…/specs/2026-09-22-oil-seats-behaviour-register.md` —
  every promise in plain words, with the test that names it.
- The rulings: `DECISIONS.md` D24, D27, D28, D31, D32, D33, D35, D37, D42, D43,
  D44, D45, D46, D47, D48, D49, D50. **Read the file, not only those rows** —
  D53 exists because a session grepped for two named entries and stopped.

## The brief itself — use this wording

> Do not merely review the changed code. Starting from the user promise and the
> applicable rulings, enumerate every qualifying object, renderer, visible door,
> writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a
> MISSING call site.** For each item, state where the visible sign and the
> working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would
> disprove correctness. Start with the least-shared or most specialised surface.

And, required of both:

- **Exact, step-by-step fix instructions per finding** — not a direction.
- **Explicit negatives**: "I checked X and found nothing." A confident all-clear
  from one model on an area the other found a defect in is the cheapest possible
  pointer to a real bug.
- **Compare against `main` before calling anything newly introduced.**
  "Pre-existing" never erases severity; the dangerous category is old code a new
  feature has just made reachable.

## Where the money actually is — read these first

1. `src/engine/oilev.ts` — the day's OIL evidence block: what is frozen at
   publication, the TWO projections of one block (the publication comparison
   carries the crowd, the signature's key does not — D45), and `oilSentOf`, the
   one body every reader of "who is behind this puck" goes through.
2. `src/engine/oil.ts` — the walk that finds the day's work and stamps item keys.
3. `src/leavewar/sync.ts` — `availableFor` (who a placeholder stands for),
   `desiredOilCells` / `creditFrom` (only the ISSUED snapshot pays),
   `runOilPass` (the forward and reverse sweeps).
4. `src/engine/publish.ts` — `currentBind` / `signBoundOk`: what a signature
   binds to and when it stops being valid.
5. `src/ui/oilmode.ts`, `src/ui/html.ts`, `src/ui/board.ts`, `src/ui/board-html.ts`
   — the mode, the count chip, the crowd opening, the seats.

## The five the walk left open, and what was changed for them (§6a of the sheet)

Two of the five turned out to be ONE fault and NOT an OIL fault: a posting-out
window was written onto a person and never saved, so a man who left the squadron
walked back in on a reload and every placeholder stood for one more man than the
issued day recorded. Fixed in `leavewar/state/store.ts` `setPeople`.

**Please attack that one specifically.** It is a one-body change on a boot path
that runs before the command layer is ready, and it now persists from a function
that used only to notify. Questions worth asking of it: can it capture a window
that should not be recorded; can it resurrect one an admin cleared; what happens
when it fires after boot, inside a command; does `persistNotify` from `setPeople`
interact badly with the reconciler's lock or a nested causal commit.

## Known and deliberately NOT fixed here

- `[OIL-REQ-NAMEBOX]` — a named man dragged into a request row's name box earns
  nothing. A walk question for the owner, filed.
- `[ALL-AVAIL-WINDOW]` (D38–D41) replaces the in-row crowd and the name bubble.
  The phone's 600px in-row crowd is NOT a defect to fix here; job 2 removes that
  surface. Do not propose two-a-row for the current crowd.
- `[POSTOUT-LOST]`'s remaining half: the seed flies that man in July while the
  demo posts him out in January. Demo data; the dev-phase ruling says clear it
  rather than migrate.
- `[LW-SCRUBBER-FLAKY]` — a Leave War e2e family that times out on a loaded box.
  Pre-existing, not this branch's.
