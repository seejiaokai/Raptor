# [OIL-SEATS-CAN-EARN] — the walk's five are FIXED. The two code reads are what is left.

**Rewritten 22 Sep 26 at the end of the fix session** (this file previously listed
the five open defects; they are closed). Branch `claude/oil-seats-can-earn`,
HEAD `b05d6f52`. **Nothing merged to `main`.** The owner has NOT said "merge live"
and must not be asked until both code reads are back and anything they find is
dealt with.

**In a fresh chat, pick the branch `claude/oil-seats-can-earn`.** Not `main`.

## Read these, in this order

1. **`../../../../DECISIONS.md` — the WHOLE file, not the entries a handoff
   names.** D53 exists because a session grepped for two named entries and
   stopped. D50 is the newest that this job builds.
2. **`../../../../OUTSTANDING.md`** — the priority order. This job is 1;
   `[ALL-AVAIL-WINDOW]` is 2 and REPLACES the in-row crowd and the name bubble,
   so do not patch either of those here.
3. `2026-09-22-oil-seats-can-earn-plan.md` — the approved plan. §5 step 8 is
   struck through (D49 overruled it). §7 is the roll-call.
4. `2026-09-22-oil-seats-behaviour-register.md` — the promises, in plain words,
   each with the test that names it.
5. **`../../handpass/2026-09-22-oil-seats.md` — the evidence sheet.** §2 the
   roll-call (two of them now), §6 what the walk found, **§6a the five it left
   open, what they turned out to be, and the re-walk that proves each fix.**
6. `../../bug-check-order.md` — the standing order. This change is FULL tier.

## WHAT IS DONE

All 11 steps built. The FULL-tier walk run (208 pictures, 88 scripts). The five
defects it left open are fixed, each with a test that was RED first, and each
re-walked in the production bundle. The two tests the walk proved were missing
are written, and both were proved to watch something by breaking the code they
name.

**Do not re-walk what "What the walk PROVED" covers** — the money across the
publish boundary, D45's two halves, the roll-call on every seat kind, the door
check in both orders, the Leave War side, the export, the peek, the roles, both
weeks at both widths. None of the fixes touched those.

### The five, and what they turned out to be

**TWO OF THE FIVE WERE ONE FAULT, AND NOT AN OIL FAULT.** The previous handoff
named a cause beside each symptom; for these two the named cause was wrong. The
symptoms were exactly as reported.

1. **D49's mark on the line.** Two halves: no renderer drew one, and the
   warning's key named a typed BOX, which `anchorEl` could not resolve at all —
   so the tap moved nothing. `engine/validate.ts` now exports one predicate
   (`fltNoLen`) and one sentence (`FLT_NO_LEN_SAYS`), shared by the warning and
   by every surface that draws a flying line; boxes a warning names carry
   `data-warnkey` and `anchorEl` reads it. **FOUR surfaces, not three** — the
   fourth (the next-week peek) was found by writing the roll-call AFTER the fix,
   and is the lesson of the session: `ui/peek.ts` keeps its own copy of the
   week's markup on purpose, so a shared change does not arrive there.
2. **The sim spare seat (D50).** `ui/board-html.ts` `simSpare` opens a spare
   pair whenever the cell holds no empty seat. The test is "is there an empty
   seat", not "is the count even", so a row whose own FCP or RCP is already
   empty costs no height. The CSS rule stands; its stale reason is corrected in
   the same change, as D50 asks.
3. **+ 4. The phantom pending, and the count that disagreed with the money.**
   ONE fault: the demo's posting-out window is written onto the projected person
   and never recorded, so a man who left the squadron in January walked back in
   on every reload. The issued day froze 27 men behind the placeholder; the
   reload gave the live copy 28. **The OIL code was doing exactly what D44/D45
   say.** Fixed in `leavewar/state/store.ts` `setPeople`, which now CAPTURES a
   window arriving on the projection into the store's own posting record — the
   one body that already lays that record back on. `[POSTOUT-LOST]` was filed
   and deliberately deferred last session; that was right on the evidence then
   and wrong once the cause was measured.
5. **The phone count chip.** On a row where the placeholder sits alone the people
   column is exactly one puck wide, so the chip hung 23px into RMKS and was
   painted under the remarks box. The seat now wraps its decoration under the
   puck instead of overflowing (`scheduler.css`, phone media block).

### The two tests that were missing

- **OIL8, the Common Programme's crowd opening.** Breaking it used to leave all
  3,301 tests green; it now turns **4 red**. `ui/oilrowpucks.test.tsx` gained
  blocks for the Common Programme and the ground row — the two surfaces it never
  asserted, because it was written to the surfaces step 7 ADDED.
- **The signature key's CONTENT.** Putting membership back into it — the exact
  D45 regression — used to leave 1,914 tests green; it now turns **2 red**.
  `engine/oilmembership.test.ts` asserts the key itself rather than a behaviour
  a fixture can satisfy by accident.

## WHAT IS LEFT

1. **Both providers read the finished code, blind to each other** (bug-check
   order §4 rank 2 — this is money). The brief is written:
   `../briefs/2026-09-22-oil-seats-final-read-brief.md`. **Codex cannot take the
   whole-branch diff through `runner.py inspect` — it is 2.6M characters and the
   CLI's ceiling is 1M.** Drive `codex exec -s read-only` directly with a prompt
   that tells it to READ THE REPO ITSELF and inlines only the newest commit.
2. Fix what they find, re-walk only what those fixes touch, gates again.
3. Finish the evidence sheet's §8–§10 and the `Walk:` line.
4. The owner's look, then his "merge live".

## Gate status at this checkpoint

| Gate | Result |
|---|---|
| `npm test` | **5664 / 5664** across 354 files |
| `npm run build` | OK |
| `node reference/tfin.js` | **728 / 0** |
| `npm run rulecheck` | OK (53 rulings named by a test, 7 by nothing — the recorded baseline) |
| `npm run test:e2e` | **449 passed, 45 skipped, 0 failed** (3.6 min) |
| `npm run smoke:tracker` | **425 passed, 0 failed** |
| `npm run perf` | DOM ceilings OK. **Check B fails — and fails IDENTICALLY with these changes stashed, byte for byte. Pre-existing, not this branch's.** |
| `npm run docsize` | **FAIL on 3 files — two never touched here, and `OUTSTANDING.md` was already 37 lines over its ceiling at the branch head.** D29 rule 3 forbids trimming docs inside a fix, so it is reported, not carved up. |

**A second `npm test` run, made while both code reads were working, came back
5663/5664.** That is the flaky family the previous handoff names: the machine has
16 GB and the workers peak at ~11 GB, so a timing-sensitive jsdom test can lose
its window under load. **Re-run the unit gate ALONE before calling that a
finding** — it has not been re-run alone since.

## Traps this session paid for — do not re-learn them

- **A handoff's SYMPTOM is evidence; its CAUSE is a hypothesis.** Two of the five
  had a named cause that was wrong, and one of those causes named a function that
  already made the check it was accused of missing — with a passing test. Measure
  the mechanism before writing a fix.
- **Several "independent" defects can share one cause.** These two were written up
  on different nights from different screens, which is exactly how a common root
  hides inside a list.
- **`vite preview` serves what is on disk.** A browser-level check that reuses an
  existing server will fail identically before and after a CSS change until the
  bundle is rebuilt — which reads as "the fix does not work".
- **A test proves its assertion, not its title.** An existing test asserted that
  the D49 warning "carries an address ending `.ld`". True, and nothing could
  resolve that address. Before trusting a test, break the behaviour and watch.
- **Write the roll-call AFTER the fix as well as before.** That is what found the
  fourth surface, and the cell that found it was one being filled from memory.
- **Argument order in a JavaScript call is left to right.** A test written as
  `cellOf(boardHTML(day), fixture())` built the markup BEFORE the fixture existed
  and reported a clean pass on a row that was not there.
- The previous handoff's traps all still stand: tapping an occupied seat selects
  the man rather than arming the seat; the toast is `#toastEl` with no class and
  is only faded, never removed; a fixed-position sheet has `offsetParent === null`;
  the board has THREE "+ Inputs" doors and only `.u` changes availability; a new
  sim block arrives with no times; the mode has two doors and `lib.mjs`'s
  `oilMode()` knows only the desktop one; `window.shiftWeek` is NOT on the probe
  bridge — drive the week strip's own `[data-wk]` buttons, and take the `:visible`
  one (the strip is rendered twice).
