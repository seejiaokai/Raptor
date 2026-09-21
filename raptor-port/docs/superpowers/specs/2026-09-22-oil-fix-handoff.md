# HANDOFF — the two money fixes are in; seven jobs left (22 Sep 26, overnight)

**Branch `claude/oil-auto-remove-design`, PR #424. Nothing merged. Holding for the owner's
"merge live".** This replaces `2026-09-21-oil-fix-handoff.md`, which asked for the fixes to start.
Two of them are done.

## Read these, in this order, and nothing else first

1. **`raptor-port/docs/superpowers/specs/2026-09-22-oil-fixplan-settled.md`** — how the two red
   teams were reconciled against the code, and the SHAPE each remaining job must take. §2 is the
   revised order and it is the job list.
2. **`raptor-port/docs/handpass/2026-09-21-oil.md`** — the evidence sheet. §6 is the original fix
   list; rows 1, 2 and 3 are struck through because the reviews overturned them. §9 records a
   mis-diagnosis that nearly shipped.
3. `raptor-port/docs/handpass/README.md` — how to re-run any scenario in seconds, the traps, and
   **the one door that is still not found** (bottom of the file).

## What is DONE

| Job | State |
|---|---|
| **1 — a request handed to another man pays him nothing** | **BUILT.** Commits `b034398`, `351c600` |
| **2 — a multi-day request pays nothing on the day it was answered for** | **BUILT.** Commit `eb28f2c` |

Every part was proved RED first through its own production function. What each does is in the
commit messages, which are written for you and are the best short account of the reasoning.

**Gates at this point:** unit **5362 passed / 0 failed** (330 files) · build green · tracker smoke
**425 / 0** (re-run this session). NOT re-run since the fixes: parity, rulecheck, docsize, e2e.

## What is NOT done, and must not be reported as done

- **The last step of job 1 is not walked.** Changing a request's holder in the real dialog and
  watching the question come up for the new man. Steps 1–4 of that story DO drive clean. The
  blocker is that the request's edit button is not in the DOM on the board the driver opens — the
  search so far is at the bottom of `docs/handpass/README.md`. **Find that door first**: it unblocks
  every remaining scenario that edits a request.
- **Job 2 is not walked at all.** Same door problem — a multi-day request can only be filed from the
  Inputs page (the board's form has no date field; that is finding 18).
- **The cross-provider code read is running, BOTH halves.** Fable's lands at
  `docs/superpowers/specs/2026-09-22-oil-jobs12-codereview-fable.md`; Codex's at
  `…-codereview-codex.md`. Brief: `docs/superpowers/briefs/2026-09-22-oil-jobs12-codereview.md`.
  §4a makes both non-optional on money, so **the branch is not ready for "merge live" until both
  have been read AND acted on.**

  **How to fire Codex here, because the first attempt was got wrong.** `codex exec --full-auto` is
  REFUSED by this harness — it launches an agent that can edit files unattended. Do not go asking
  for that permission; a reviewer has no business writing to the repo anyway. Run it READ-ONLY and
  capture its answer instead, which is allowed with no settings change at all:

  ```
  codex exec -s read-only --output-last-message <file> "<the brief>"
  ```

  then write that file into `docs/superpowers/specs/` yourself. The lesson, since it cost a
  detour and an owner correction: when the harness refuses a command, the question is not "how do
  I get this allowed" but "can the same job be done with less power". Here it always could.

## The seven jobs left, in order

Shapes are settled in `…-oil-fixplan-settled.md` §2 — do not re-derive them.

3. **The reload "pending" wording.** NOT a phantom (§9). Do not suppress the mark. Only the wording:
   the item says "the OIL decisions on this day changed" when no scheduler decided anything.
4. **A holiday taken off a published day** needs the mirror of the advisory the forward case has.
5. **The mode must be read-only** — shut the two panels and the palette drag. **Sign and Publish
   stay open** (both reviewers). **Undo is NOT one of the doors to shut** — it already reverses an
   OIL tap correctly and that is worth keeping; the rule is a BOUNDARY, and the measurement behind
   it is in the settled plan under fix 5.
6. **A weekend no leave period covers.** Owner's ruling **D19**: name the missing period and offer
   to create it. This reaches the Leave War — bigger than the others around it.
7. **One switch per formation**, on the generic renderer, never per aircraft row. Not an SC special
   case. The spare's own men are safe and proved so (D20) — it is the MAIN crew the stray switch
   takes down.
8. **D18 — a second man on a request row earns.** Split owner/extra inside the source row; the owner
   stays in the input half so his own No is never overridden. Revise OIL31, `engine-rules.md` and
   `ui-contracts.md` in the same change.
9. **The wording batch**, about fourteen. One red test at a time. **Leave "Off day" alone** — it is
   with the owner.

## The owner's rulings this session

`DECISIONS.md` **D19** (name the missing leave war period and offer to create it) and **D20**
(AVALON flight, AVALON duty and BB flight earn no OIL — re-confirmed, and extended to a duty block
MADE from the AVALON template, which nothing had been watching).

## Filed, deliberately not fixed here

- `[POSTOUT-LOST]` in `OUTSTANDING.md` — a posted-out man walks back into the squadron on a reload.
  Not an OIL defect; it reaches the crew picker, ALL AVAIL and the manning counts.
- One stated limit inside job 2: an anchor row CANCELLED in a week nobody has loaded still lets its
  other covered days pay. Named in the code comment on `landedStanding`.

## The closing report must carry

`Walk:` and `Rulings:`. A change at this tier cannot be reported ready for "merge live" without
both — and on this branch, not without Codex's read either.
