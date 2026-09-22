# BRIEF — red-team the OIL fix plan before it is built (21 Sep 26)

Sent independently and blind to Fable 5.1 and to Astra/Codex. Neither sees the other's answer.
This is `docs/bug-check-order.md` §4 rank 3 — attacking the plan before code hardens around it —
and it is run with BOTH providers because two of the fixes change who gets paid.

## What has happened

Branch `claude/oil-auto-remove-design`, PR #424, nothing merged. The OIL feature ("a man who works
a weekend or public holiday earns a day in lieu") was built, reviewed by two frontier models, and
passed 5,300 tests. The owner then opened the app and found three defects in minutes, all of them
surfaces the feature was never wired to.

So a full HAND PASS was run: 48 scenarios, designed by Fable and Codex, DRIVEN in the built app by
four parallel workers, 353 pictures. It found 27 things.

**The arithmetic is clean.** Every boundary case, every envelope, midnight spans, who ALL AVAIL
stands for, an award beside an earned day — all correct. What is wrong is **who the decisions
attach to, and what the screen says.**

## What you are being asked

**Do NOT tell me whether the fix list is right.** A second opinion agreeing with the first proves
nothing. Tell me instead:

1. **Which fix has the WRONG SHAPE** — where the obvious repair creates the mirror-image bug.
2. **What each fix BREAKS elsewhere** in the app. This is a scheduler with a Leave War, a Tracker,
   an amendment/publish workflow and a shared write layer; a fix that is local to OIL may not be.
3. **Which existing RULING each fix contradicts.** The register is
   `docs/superpowers/specs/` (the OIL behaviour register), `docs/engine-rules.md`,
   `docs/ui-contracts.md` and `DECISIONS.md`. A rule made obsolete by a later one is itself a
   finding.
4. **What is MISSING from the list** — a defect of the same SHAPE as one of the 27 that nobody
   walked. Assume every line of code that exists may be correct and the defect may be a missing
   call site, a missing door, or a decision attached to the wrong thing.
5. **For each fix, exact step-by-step instructions**, not a direction. Name the function, the call
   site and the test that should be red first.
6. **Explicit negatives.** Where you checked something and found nothing, say so by name. A
   confident all-clear from one of you on an area the other flags is the cheapest pointer there is.

## What to read

- `raptor-port/docs/handpass/2026-09-21-oil.md` — the evidence sheet. **§6 is the fix list you are
  attacking.** §5 is what was reproduced first-hand, §2a is the roll-call of every place a man is
  drawn.
- `raptor-port/docs/handpass/parts/*.md` — the four workers' own sheets, with the detail per
  finding.
- `raptor-port/docs/superpowers/specs/2026-09-21-oil-bugcheck-fixplan.md` — what was already fixed
  on this branch and why, including the owner's two rulings R-1 and R-2.
- `DECISIONS.md` — the owner's rulings. **D18 is new and it CHANGES a rule**: a second man the
  scheduler puts on a member's landed request row now EARNS from it. Until now the claim owned the
  row and the schedule half skipped everyone else on it (OIL31).
- The code: `raptor-port/src/engine/oil.ts`, `validate.ts`, `leavewar/`, `ui/oilmode.ts`,
  `state/` — as you judge necessary.

## The two that take money off a man, which is where to spend your attention

**FIX 1 — a request handed to a different man carries the first man's refusal.**
Reproduced: Talisman files training on the Saturday; he and Ace are both owed a half day. The
scheduler refuses Talisman's and publishes the amendment — Talisman's cell goes blank, correctly.
The request's PERSON is then changed to Ace. The mode immediately says *"Ace earns nothing from
this event"*. Published, **Ace's Saturday goes blank** and Talisman's comes back. Ace worked and is
paid nothing, silently.

**The question under it, which nobody has answered:** is the decision addressed to the PERSON, to
the REQUEST, or to the pair? Each answer has a different failure:

- keyed to the request alone → this bug;
- keyed to the person alone → a decision survives the man leaving the row and ambushes him later;
- keyed to the pair → handing the request BACK to the first man may silently resurrect a refusal
  everyone believed was cleared. Codex's own scenario 7 named that risk and it was never tested.

Say which it should be, and what the clearing rule is on a person change — and whether that answer
holds when the day is already published and the change is an amendment.

**FIX 2 — a request spanning several days, answered yes for one of them, pays nothing.**
Reproduced: Anvil, Training Fri 17 → Mon 20 Jul. The app asks which non-working days it deserves,
the per-day picker works, the answer is stored correctly (`Sat yes, Sun no`). The request then
lands a row on its FIRST day only, so Saturday never sees it, the mode calls him inert, and no
credit lands on any of the four days.

**The blast radius is the worry.** Making a multi-day request land on every day it covers changes
how ALL requests land — leave, medicals, overseas duty, courses — not just the ones that can earn.
Say whether the fix belongs there at all, or whether the money should read the request directly
without a row existing. Name what the row currently does that the credit path would lose.

## The other six, in the plan's order

3. A plain browser reload manufactures a pending amendment on a day that earns OIL. Press it and an
   empty amendment is issued. A published Wednesday reloads clean, so it is specific to earning
   days. The history says "No changes yet".
4. A holiday taken OFF a published day blanks every green bar, removes the OIL button and grows a
   pending change, while the Leave War keeps paying. The money is right. The forward direction has
   an advisory; the reverse has none.
5. The mode is not read-only where it matters: the Personal Inputs and Unavailable panels still
   take a typed time, still toggle the late mark, and Undo still deletes a ground row from inside
   the mode. Signing, Publish, the plans selector and Unpublish also work from inside it.
6. A weekend no Leave War period covers shows full green, tells the scheduler to publish it so
   people get their OIL, and afterwards reports "No conflicts flagged for this day ✓". No credit
   can ever land there.
7. An SC shift draws ONE "stop this item earning" switch on EVERY line it holds, including empty
   spare lines. Pressing the one beside an empty spare row stops the men on the MAIN row earning.
   It does raise a proper amendment, so no money moves silently.
8. The owner's ruling D18 — a second man on a member's landed request row earns from it.
9. A batch of wording and reach: the ALL AVAIL count missing on the board · no "not in force yet"
   mark on a puck whose decision is unpublished · a placeholder on a desk saying nothing · nothing
   said when a whole day pays nobody · the viewer's own puck never drawing its stripe · 15px tap
   targets in the mode on a phone · two history lines naming a claim by the puck's own text · a
   claim row's name contradicting the puck beside it · "tap to see each one" doing nothing · an
   empty Saturday still nagging to be published · "Off day" doing nothing where "PH" works.

## Rules of engagement

- Do not change any code. This is a review of a PLAN.
- Do not re-litigate the findings; they were reproduced through the real production route on this
  exact revision, and the evidence sheet says which by whom.
- Rank your own findings by what they cost a real squadron, and mark each NEW / KNOWN / DISAGREE.
- If you think a fix should NOT be made, say so and say what to do instead.
