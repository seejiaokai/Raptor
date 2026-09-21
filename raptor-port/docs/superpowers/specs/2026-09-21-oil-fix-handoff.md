# HANDOFF — the walk is done, the fixes are not (21 Sep 26, late)

**Branch `claude/oil-auto-remove-design`, PR #424. Nothing merged. Holding for the owner's
"merge live".** This replaces `2026-09-21-oil-handpass-handoff.md`, which asked for the walk. The
walk happened. This one asks for the fixes.

## Read these, in this order, and nothing else first

1. **`raptor-port/docs/handpass/2026-09-21-oil.md`** — the evidence sheet. §6 is the ordered fix
   list and it is the job. §5 is what was reproduced first-hand. §2a is the roll-call.
2. **`raptor-port/docs/handpass/README.md`** — how to re-run any of it in seconds, and the traps.
3. `raptor-port/docs/bug-check-order.md` — the method, if you have not read it this session.

The four part sheets under `docs/handpass/parts/` hold the detail per block. Read the one you are
fixing from, not all four.

## What happened

All 48 scenarios from the two designed lists (Fable's 44, Codex's 24, merged and deduped) were
DRIVEN in the built app by four parallel workers, each with its own isolated copy. 353 pictures.
The owner has seen the first five findings and accepted all of them (D18).

**27 findings. The arithmetic is clean — every boundary case, every envelope, midnight spans, who
ALL AVAIL stands for, awards beside earned days. What is wrong is who the decisions attach to, and
what the screen says.**

Two of them take money off a man who worked, and both are silent. They are numbers 1 and 2 in §6.

## The job

**Work §6 in order.** For each:

1. Write the test that FAILS on the bug first, through the production route, and see it red.
2. Fix it.
3. Re-run the scenario script that found it — they are all committed under
   `raptor-port/scripts/handpass/` and named for their scenario.
4. Re-walk the surfaces the fix touched. The everything-Saturday rebuilds in ~70 seconds, or loads
   from `docs/handpass/state-sat.json` in two.

**Items 1 and 2 are MONEY.** The standing order (§4a) requires BOTH providers to read the finished
code independently and blind to each other, with the evidence sheet in their hands, and asked what
is MISSING as well as what is wrong. That is not optional on this branch.

**Item 8 is a RULING, not a defect** — the owner decided on 21 Sep that a second man on a member's
landed request row EARNS from it (D18). It changes OIL31, which until now let the claim own the row.
Revise the ruling in the register, `docs/engine-rules.md` and `docs/ui-contracts.md` in the same
change, not afterwards.

**Item 9 is a list of small ones.** Take them as one batch at the end; none moves money.

## What is already true, so nobody re-does it

- **The one e2e failure is settled.** `leavewar.spec.ts` "the bottom scrollbar is a year-wide
  scrubber" fails on `main` under the same full-suite load and passes on this branch. Pre-existing,
  filed as `[LW-SCRUBBER-FLAKY]` in `OUTSTANDING.md`. Do not re-investigate it.
- **Gates at this point:** 5350 unit · build · parity 728/0 · rulecheck OK · docsize OK ·
  e2e 447 passed 0 failed. Tracker smoke NOT re-run — run it before reporting.
- The everything-Saturday is built by `scripts/handpass/fixture.mjs` through the app's own
  controls. It is not in the demo seed yet; §7.1 of the order says it should be. Worth doing once
  the fixes land, so a fresh boot opens on it.

## The owner's rulings from this session

`DECISIONS.md` D16, D17, D18. Read them; two change how the work is done, not just what it does.

## The closing report must carry

`Walk:` (§8 of the evidence sheet has the line) and `Rulings:`. A change at this tier cannot be
reported ready for "merge live" without both.
