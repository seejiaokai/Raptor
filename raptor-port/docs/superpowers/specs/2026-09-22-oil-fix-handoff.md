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
| **7 — one switch drawn per aircraft row instead of per formation** | **BUILT.** Commit `07f7a86`. Measured before/after: 20 switches with two drawn four times → 14, none duplicated. The plan's second clause ("never on an empty line") is deliberately NOT built — Fable is right that OIL7 needs a switch to cover a man added later |
| **8 — a second man on a request row earns (D18)** | **BUILT.** Commit `35b786e`. Rule revised in the register, engine-rules and ui-contracts in the same change |

Every part was proved RED first through its own production function. What each does is in the
commit messages, which are written for you and are the best short account of the reasoning.

**Gates at this point:** unit **5372 passed / 0 failed** (330 files) · build green · rulecheck **OK** ·
docsize **OK** · tracker smoke **425 / 0**. NOT re-run since the fixes: parity, e2e.

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

## FABLE'S REVIEW IS IN — read it before the remaining jobs

`docs/superpowers/specs/2026-09-22-oil-jobs12-codereview-fable.md` (422 lines). What it changed:

- **F3 — FIXED, commit `195943e`.** Job 2 would have flagged every already-published weekend the
  moment the owner opened the app. My defect, reproduced and fixed non-destructively (the missing
  field is reconstructed from `acc`, rather than Fable's schema bump, which would have cleared his
  data at two in the morning). If the reconstruction ever proves wrong, the bump is the fallback.
- **F4 — already closed**, independently, by job 8's own test. Fable predicted it as a forward risk.
- **F1 — OPEN, filed as `[OIL-XWEEK-DENY]`.** Job 1 is NOT closed for a stashed week. Money, silent.
  **This vindicates Codex's M1 over the cheaper repair chosen here**, and §0 of the settled plan now
  says so.
- **F2 — OPEN, filed as `[OIL-XWEEK-ELSEWHERE]`.** Job 2's cross-week branch is unreachable in the
  real app, so the hole it was meant to close is still open. Pre-existing, not introduced.
- **Verified clean by Fable:** the read-side prune cannot touch an issued record · both editors'
  commit order · undo of a hand-over · the ✕ on a landed row · plan switch, recovery and template ·
  the key's order-independence. Apart from F3 it found no path that keys an unchanged day
  differently.

## CODEX'S REVIEW IS IN TOO — and its verdict is **"not ready to close"**

`docs/superpowers/specs/2026-09-22-oil-jobs12-codereview-codex.md`. Written blind to Fable's.

- **Rank 1 — FIXED, commit `3df527d`. It was the worst defect on the branch.** My own F3 repair
  fixed the KEY and not the MONEY READER: an already-issued day whose row was cancelled would have
  STARTED PAYING, no amendment raised, the frozen schedule still saying the work never happened.
  The premise that `acc:'g'` meant "landed and paying" was simply false. Now reconstructed from the
  frozen schedule itself.
- **Rank 2 — OPEN.** The same A→B→A resurrection Fable found as F1, reached by a second route.
  Filed as `[OIL-XWEEK-DENY]`. **Two independent reviewers found this, which is the strongest
  signal on the branch.** Codex adds the undo requirement: one undo must restore the assignment AND
  the off-week decision together.
- **Rank 3 — OPEN.** Codex DISAGREES that the unloaded-anchor limit can stay open; Fable says the
  same as F2. Filed as `[OIL-XWEEK-ELSEWHERE]`. **Both reviewers want it closed before merge live.**
- **Rank 4 — OPEN, NOT yet assessed.** Persisted SIGNATURES still break, and some unchanged days
  still manufacture amendments. Read this before trusting `3df527d` as complete — it repaired the
  reader, and Codex says the signature half remains.
- **Ranks 5 and 6 — OPEN, both MISSING ask paths.** The calendar date drag bypasses the question,
  and both in-place time editors reprice an answered day without asking. **These are job 1's bug
  through two more doors** — the same shape as the drag-reassign that was closed.

**Read Codex's §4 too: it DISAGREES IN PART with the read-side prune**, which Fable verified clean.
Where two reviewers split, settle it with evidence, not by majority.

## The FIVE jobs left, in order

**Watch for collisions between fixes.** Jobs 1 and 8 already collided once and only job 8's own
test caught it: job 1's read-side prune deletes a decision naming anyone who is not the request's
holder, which was true until D18 let a second man on the row earn. Whenever two of these jobs touch
the same body, write a test that exercises BOTH.


Shapes are settled in `…-oil-fixplan-settled.md` §2 — do not re-derive them.

3. **The reload "pending" wording.** LOW value now — its real defect is filed out as
   `[POSTOUT-LOST]`, and the "sentence" turns out to be only a COUNT in the amendment panel
   (`diffCounts`), not a literal string anywhere in the source. Decide whether it is worth doing at
   all before spending on it. NOT a phantom (§9). Do not suppress the mark. Only the wording:
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
