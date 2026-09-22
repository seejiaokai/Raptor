# [OIL-SEATS-CAN-EARN] — the WALK is done. FIVE defects are open.

**Rewritten 22 Sep 26 at the end of the walk** (this file previously said the
walk was what remained — it has run). Branch `claude/oil-seats-can-earn`.
**Nothing merged to `main`.** The owner has NOT said "merge live" and must not be
asked until the five open defects are fixed and the two code reads have run.

**In a fresh chat, pick the branch `claude/oil-seats-can-earn`.** Not `main`.

## Read these, in this order

1. **`../../../../DECISIONS.md` — the WHOLE file, not the entries a handoff
   names.** This session put an already-settled design to the owner as an open
   question because it grepped for two named entries and stopped. **D50–D53 are
   new tonight**; D38–D41 govern the next job and were missed. D53 is the ruling
   about that miss.
2. **`../../../../OUTSTANDING.md`** — the priority order. This job is 1;
   **`[ALL-AVAIL-WINDOW]` is 2**, and it matters to job 1's leftovers (below).
3. `2026-09-22-oil-seats-can-earn-plan.md` — the approved plan. §5 step 8 is
   struck through (D49 overruled it). §7 is the roll-call.
4. `2026-09-22-oil-seats-behaviour-register.md` — the promises, in plain words.
5. `../../handpass/2026-09-22-oil-seats.md` — **the walk's evidence sheet**, and
   `parts/` for the four workers' own sheets. 208 pictures, 88 scripts.
6. `../../bug-check-order.md` — the standing order. This change is FULL tier.

## What the walk PROVED — do not re-walk these

Driven in the real production bundle, built from this branch and compared
byte-for-byte with the served copy before a single gesture.

- **The money across the publish boundary is right.** Thirty men behind one
  placeholder on a duty desk, published, signed again. Filing leave for one drops
  the working copy to 29, leaves the issued page at 30 still naming him, raises
  the pending mark, and does NOT touch the four signatures. Changing an OIL
  decision DOES clear them. D44, D44-the-tap, D44-the-mark, both halves of D45.
- **D45's two halves were settled against a contradicting report** (`seat-16`).
  A second walk read the signatures as cleared by an availability change; it had
  not re-signed after publishing, and **publishing SPENDS the signature**. Signed
  again first, both runs kept all four. Do not reopen without that step.
- **The roll-call, by hand, on every seat kind**, both placeholder pucks.
- **The door check, both orders**, including the jet refusal with its reason on
  screen at every door.
- **The Leave War side, all four of the plan's questions.** A man swept up by a
  placeholder earns exactly what a named man earns — checked across all 50.
- **The export, the next-week peek, the roles, both weeks at both widths.**
- **35 of 38 break tests go red**, and all eight placeholder seat kinds are
  separately pinned.

## THE FIVE OPEN DEFECTS — this is the work

1. **D49's mark is not on the line.** A flying line typed with the same take-off
   and landing still earns (that is the ruling, do NOT "fix" it), and the day
   must SAY the times are wrong. It says so ONLY in the warning list; the row
   itself is byte-for-byte identical to a normal one. And tapping that warning
   does nothing, where every other warning lights the man and scrolls to him.
   Three surfaces. Sheet: `parts/…-rules-sweep.md` FAIL 3.
2. **A sim row that is exactly full offers no door for another body** — no spare
   seat, and `.schedboard .ppl.fcprcp .addz{display:none}` hides the strip every
   other cell has. The drag a scheduler would make lands on a seated man and
   REPLACES him silently. **The owner ruled D50: a sim row always shows one spare
   seat, even when full.** Pre-existing (identical on `main`); step 5 is what made
   that seat pay real people. Fix the stale CSS comment in the same change — it
   claims the grid "never packs edge-to-edge and swaps", true for odd counts and
   false for even ones.
3. **A published day carrying a placeholder crowd reopens as "1 pending" after a
   reload, with all four signatures cleared and nobody having touched it.** No
   cell is marked, History is empty, so nothing on screen says what changed.
   One-off per day; publishing the phantom AL settles it. Against the register's
   "No amendment nobody made". NEW. `seat-lw-21-pending-is-it-oil.mjs` reproduces
   it in under a minute. Sheet: `parts/…-leavewar.md` F1.
4. **The count chip includes a man who has posted out; the money correctly
   excludes him.** Chip said 46 and "All 46 earn half a day"; the war paid 45.
   The money side makes an in-the-squadron check and `oilSentOf` does not. NEW.
   Sheet: `parts/…-leavewar.md` F2.
5. **On a phone, on the EDIT WEEK, the count chip cannot be tapped** — it
   overflows into the RMKS column and the press opens the row's remarks box, so a
   scheduler can type a stray character into the schedule. Hits rows where the
   placeholder sits alone. Correct on desktop, on the phone board and on the
   phone view week. Layout fault pre-existing; NEW on the five weekdays, because
   step 9a put the count on days that earn nobody anything. Sheet:
   `parts/…-surfaces.md` S1.

**Two test gaps found by breaking the code on purpose:**

- **The Common Programme's crowd opening (OIL8) has NO test.** Break it and all
  3,301 unit tests stay green. The same break turns 4 red on a duty desk, 4 on a
  sim, 3 on a ground row. It is also one of the three surfaces the owner found
  unwired by hand on 21 Sep. Write it.
- **The signature key's CONTENT is unwatched.** Putting membership back into the
  key — the exact D45 regression — left 1,914 tests green, because the test named
  for the rule passes either way on its fixture. The axis is pinned; the key is
  not. Write it.

## ALREADY FIXED THIS SESSION — do not re-report

All three pinned by `src/ui/oilwalkwords.test.tsx`, proved red before the fix.

- A chip reading "30 of 30 earn" captioned "Some of these men earn OIL and some
  do not". `bar` is null both when some earn nothing AND when all earn at
  different rates; the two now have their own words. Found on **ten** surfaces
  including the issued page.
- An exempt row's switch painted in the earning green while its own words said it
  earns nothing (D24). Found on **six** surfaces. New to this branch — step 4 is
  what brought exempt kinds into the mode.
- An **empty** exempt row reading "Earns OIL — tap to stop this item earning",
  because counting men on a row with nobody on it gave zero on and zero off. The
  walk now carries each row's own default out with it (`oilItemDefaults`),
  decided in the same body that decides the money.

## THE RULINGS MADE TONIGHT — D50 to D53

- **D50** — a sim row always shows one spare seat, even when full. Costs one row
  of height on full sim rows; he accepted that against filing it.
- **D51** — a crowd opens two across, pilots left and WSOs right. **Corrected the
  same hour: this is D38–D41 and is NOT built here.** The surface is
  `[ALL-AVAIL-WINDOW]`, job 2. **Do not patch two-a-row into the in-row crowd —
  job 2 replaces it.**
- **D52** — ground crew: a named ground crewman earns; ALL / ALL AVAIL do not
  include ground crew; both correct, leave them. The walk finding is closed as
  not-a-defect.
- **D53** — the record was fine and the agent never read it. Before telling him
  anything is undecided, before putting ANY choice to him, and before calling
  anything missing: search `DECISIONS.md` and `OUTSTANDING.md` FIRST, not the
  code. Now in `.claude/rules/record-decisions.md`.

## WHAT JOB 2 CHANGES ABOUT JOB 1's LEFTOVERS

`[ALL-AVAIL-WINDOW]` (D38–D41, approved mock-up at `../../mock/allavail-window.html`)
replaces the name bubble AND the in-row crowd with **one** movable, resizable,
non-blocking window of real pucks — and the SAME window serves both counters. So:

- The phone's 600px in-row crowd (75% of the screen, one man per row) is **not a
  defect to fix here** — job 2 removes that surface.
- The toast behind the counter is a **placeholder, not a design**. The comment in
  `src/ui/board.ts` that used to call the shape "not yet ruled" has been corrected.

## Gate status at this checkpoint

| Gate | Result |
|---|---|
| `npm test` | **5629 / 5629** across 352 files (was 5618; +11 is the new pin file) |
| `npm run build` | OK |
| `node reference/tfin.js` | **728 / 0** |
| `npm run rulecheck` | OK (53 rulings named by a test, 7 by nothing — the recorded baseline) |
| `npm run test:e2e` | **447 passed, 45 skipped, 0 failed** (3.7 min) |
| `npm run smoke:tracker` | **425 passed, 0 failed** |

**ALL SIX GREEN**, re-run after this session's three fixes and the engine change.

**The flaky family is load, not the tree.** The machine has 16 GB and the test
workers peak at ~11 GB, so a timing-sensitive jsdom test can lose its window
during a full run. Never run the unit gate concurrently with the browser gates,
and re-run alone before calling a failure a finding.

## Traps this session paid for — do not re-learn them

- **Tapping a seat that already holds a man does NOT arm it** — it selects the
  man. A placement onto an occupied seat silently does nothing and reads exactly
  like a correct refusal. Nine roll-call rows were measurement artefacts before
  this was found. Create the empty seat through the app's own add controls, and
  assert `window.ARM.key` before believing any outcome.
- **The app's toast is `#toastEl` and carries NO class.** A reader built from
  `.toast` / `[class*=toast]` / `[role=alert]` misses it and reports "nothing
  opened" for a tap that worked. It nearly produced a false defect report against
  the count chip. It is also only FADED, never removed, so read its opacity.
- **A fixed-position sheet has `offsetParent === null`** — filtering on that
  hides it. Same class of error; it cost a second worker a false negative.
- **The board has THREE "+ Inputs" doors**: `.g` is ground request types, `.u` is
  UNAVAILABILITY (leave, medical, overseas duty), `.s` is SANS. Only `.u` changes
  who is available.
- **A newly added sim block arrives with NO TIMES**, and a row with no readable
  times correctly earns nothing. Type them or you test a row that was never going
  to pay anybody.
- **The mode has two doors and only one is ever visible**: desktop `#sbOil`,
  phone `[data-oilmode="<day>"]`. `lib.mjs`'s `oilMode()` knows only the desktop
  one and hangs at phone width.
- **The plans selector is `[data-planmenu="<day>"]`**; its issued rows carry
  `data-planpv`; the way back out is `[data-golive="<day>"]`, which sits under
  the sticky top bar and needs `tap()`.
- **A parallel worker restoring its own edits with `git checkout` destroys
  everyone else's uncommitted work**, silently — it happened twice tonight. If
  work is fanned out while anyone is editing, forbid every git command that
  writes to the working tree.

## Order of what is left

1. Fix the five defects, each with a test that is red first.
2. Write the two missing tests.
3. Rebuild, and **re-walk only what the fixes touched** — the walk's scripts make
   that cheap. Everything in "what the walk PROVED" stands unless a fix touched it.
4. All six gates.
5. **Both providers read the finished code, blind to each other, with the
   evidence sheet in hand** (bug-check order §4 rank 2 — this is money).
6. Fix, re-walk what that touched, gates, finish the sheet.
7. The owner's look, then his "merge live".
