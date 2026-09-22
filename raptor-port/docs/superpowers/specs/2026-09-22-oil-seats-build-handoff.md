# [OIL-SEATS-CAN-EARN] — build handoff, ALL ELEVEN STEPS BUILT. The WALK is next.

**Rewritten 22 Sep 26 at a clean committed checkpoint.** Branch
`claude/oil-seats-can-earn`, pushed. Working tree clean. **Nothing merged to
`main`** — the owner has NOT said "merge live", and must not be asked to until
the FULL-tier walk is done and the two code reads have run behind it.

**In a fresh chat, pick the branch `claude/oil-seats-can-earn`.** Not `main` —
none of this is there.

## Read these, in this order, before anything

1. `2026-09-22-oil-seats-can-earn-plan.md` — the approved plan. **§5 step 8 is
   struck through: the owner overruled it (D49).** §2 carries the ruling
   clashes; §7 is the ROLL-CALL the walk re-marks; §9 lists every review finding.
2. `2026-09-22-oil-seats-behaviour-register.md` — **the list the rules sweep
   walks in the RUNNING APP.** Every promise now has a row and a test. This is
   the walk's checklist; do not invent a different one.
3. `../../bug-check-order.md` — the standing order. This change is **FULL** tier.
   §5 gives the order of steps; §6 the roll-call; §7 the walk; §9 the evidence
   sheet and the `Walk:` line the closing report must carry.
4. `2026-09-22-oil-seats-can-earn-review-fable.md` and `…-review-log.md` — only
   if a finding needs chasing back to its words. The build is past them.
5. `../../../../DECISIONS.md` — **D48 and D49 were made during the build** and
   are not in the plan's original text. D49 reverses a step.

## What is BUILT

| Step | What landed | Pinned by |
|---|---|---|
| **1** | The earn rule reads the day's EVIDENCE, not the live day. `itemMasked` / `itemMark` split. Memoised inside `oilReadPass`, opened only by `dayHTML` / `boardHTML`. | `ui/oilmode.test.tsx` |
| **2** | D33/D47 — ALL and ALL AVAIL refused on flying cockpit seats, preflighted at every door, with the reason on screen. The money's own non-expanding belt on the flying branch. | `engine/oilseat-refusal.test.ts`, `ui/oilseat-refusal.test.tsx` |
| **3** | `OilWork.dflt` — the default rides the SPAN. `spanDefault` is the ONE body the screen and the money both read. The toggle cycle that can write a `1`. Five switch sentences. | `engine/oilspandefault.test.ts`, `ui/oilswitch.test.tsx` |
| **4** | All FOUR exempt-kind skips lifted; the four kinds reach the walk, default off, offer the switch. | `engine/oilexempt.test.ts` |
| **5** | **The placeholder counts on every seat it can sit on** — duty `id`/`more`, sim `p`/`w`/`pax`/`more`, ground `more`, the Common Programme's `more`. `putAny` is the one body. The flying branch stays non-expanding; a row with no `rid` gathers nobody (§6's fourth freeze hole, now pinned). | `engine/oilexpand.test.ts` |
| **6** | **The accepted-request row's crowd** — name box AND extras. Resolved once, from the REQUEST's window, and written into the day's membership. The requester stays on his own answer and is never paid twice. The decision-prune leaves a crowd row's decisions alone. | `engine/oilclaimcrowd.test.ts`, `ui/oilclaimcrowd.test.tsx` |
| **7** | **OIL8** — a crowd opens into real pucks on a duty desk and a sim row, each tappable. The sim's people cell becomes the flat list of everyone the walk pays. | `ui/oilrowpucks.test.tsx` |
| **8** | **OVERRULED — see D49.** A nought-minute sortie still earns. What was built instead: `FLT_NO_LEN`, an advisory on the line on any day; and a flying line with crew and no readable times joins the blind list. | `engine/oilflighttimes.test.ts` |
| **9a** | **The count on every seat, every day, mode off.** `oilSentOf` is the ONE resolver behind all four readers; three answers (`resolved` / `none` / `unrecorded`); the live fallback is gone (OSE-T-02); the chip carries its VERSION and both tap sites open it. | `engine/oilsent.test.ts`, `ui/oilcount.test.tsx` |
| **9b** | **Two projections of one block.** The publication comparison carries membership on every day (D44); the signature binds to everything except it (D45). An older block is not compared on membership it never recorded. | `engine/oilmembership.test.ts` |
| **10** | The count says WHICH list it is, in one phrase shared by the chip and its tap. D31's "no identity yet" put into the squadron's words. | `ui/oilwords.test.tsx` |
| **11** | `[OIL-UNDO-WORDS]` — an OIL decision is its own command (`sched.oil`), so undo names it. Backlog item closed. | `undo/oilundo.test.ts` |

## The TWO RULINGS made during the build — they are not in the plan

- **D49 (owner): "It should still earn — leave it as it is."** A flying line
  typed with the SAME take-off and landing keeps paying: the man reported and
  debriefed, so he was at work whatever the times say. **This overrules the
  plan's §5 step 8 and BOTH reviewers**, who read the half day as the app paying
  off its own padding. Nothing about what such a line earns changed. **Do not
  "fix" it back** — `engine/oilflighttimes.test.ts` names the ruling so the next
  reviewer meets it. Carried by `docs/engine-rules.md` and the Logic page.
- **D48 (owner): "keep what's published until corrected."** When a rule changes
  under an already-published day, the day keeps the money it went out with until
  somebody corrects it and re-publishes. **Nothing was built for it** — D49
  removed the rule change it was given about. It stands as the answer for the
  NEXT rule change that would move published money.

## What is LEFT — the walk, and nothing before it

**In this order** (bug-check order §5, FULL tier). The walk goes BEFORE the two
code reads, so the reviewers read the final code with the roll-call in hand.

1. **The ROLL-CALL, re-marked in the running app** — the plan's §7 table, every
   row created BY HAND (where a thing can be PUT, not where the fixture already
   has it). No blank cells. That omission is how the owner found the original
   defect.
2. **The door check**, both orders of every gesture: drag from the roster, drag
   as a swap, armed placement, the palette's placeholder row, the tap on a
   chip, the tap on a puck, the tap on a row name.
3. **THE WALK**, at phone and desktop width, with pictures. The surface axis is
   in §7: board at both widths, edit week, view week, **the version preview —
   the only place "as issued" is visible, so it MUST be walked** — the CSV
   export (a written NO-because), and the next-week peek (must show no chip).
4. **The Leave War side**, which round 1 missed entirely: the OIL tracker figure
   per man, the FO/HO cell on the date, the clash strip when one of the crowd
   has leave that day, and the reverse sweep after a switch is turned off on a
   published day plus an amendment.
5. **The rules sweep** — walk the behaviour register ruling by ruling in the
   running app, reporting pass/fail per ruling.
6. Fix what the walk finds → gates → **both providers read the finished code**,
   blind to each other, with the evidence sheet in their hands → fix → re-walk
   only what the fixes touched → gates → the evidence sheet → the owner's look
   → his "merge live".

### The owner's open questions FOR the walk — put these to him, do not decide them

- **Crediting an activated SC spare is done by tapping the man** (Fable M2
  option A). If the walk shows that reads badly, the recorded fallback is to
  give spare aircraft rows their own item off the aircraft rid, with the switch
  on the MAIN/SPARE badge.
- **Where 27 opened pucks go in a sim row's people cell at phone width.** The
  mode replaces the seat grid with a flat list; nobody has seen it with a real
  crowd on it.
- **Two "free" counts on one screen.** The Available-crew panel says "Pilots · N
  free" from a different body than the puck's count. A D37 wording question, not
  a defect.
- **`[OIL-REQ-NAMEBOX]`** (filed in `OUTSTANDING.md`): can a scheduler put
  someone ELSE in a request row's name box, and if so should he earn from it?
  Deferred deliberately — it is one line plus a test if he says yes.
- **Fable S9's expected side effect:** every new placeholder seat makes an
  already-issued day read "pending" the moment anyone files an input for that
  date. Correct — the money moved — pre-existing, now multiplied. The walk
  should EXPECT it rather than report it as a bug.

## Gate status at this checkpoint

| Gate | Result |
|---|---|
| `npm test` | **5618 / 5618** |
| `npm run build` | OK |
| `node reference/tfin.js` | **728 / 0** |
| `npm run rulecheck` | OK |
| `npm run test:e2e` | **447 passed, 45 skipped, 0 failed** (2.9 min) |
| `npm run smoke:tracker` | **425 passed, 0 failed** |

**ALL SIX GATES GREEN at this checkpoint** — the two browser gates included,
which the previous handoff had left unrun.

**The flaky family, and it is NOT this change.** Three separate full unit runs
each failed ONE DIFFERENT jsdom timing test — `figselect`, `inputscal`,
`figdrawer` — at 1.6 s, 22.5 s and 23.1 s, and every one passed alone. Measured
cause: the machine runs out of memory during a full run (physical memory hits
100%, the test workers alone peak at 11 GB, and about 30 GB is served off disk),
so timing-sensitive tests wait on the disk. A fourth run, measured end to end,
passed clean — which is what a load-dependent flake looks like. Already recorded
as `[LW-SCRUBBER-FLAKY]`, widened to a family on 22 Sep. None of those tests
touch anything this change alters.

## Traps this build actually hit — do not re-learn them

- **`dayOilCredits` / `dayOilSpans` are NOT the money.** They are the raw walk.
  The money is `oilEarnedWork`. Check which one a failing test asserts on.
- **The seed Saturday already carries flying, duty and sim work.** Any "nobody
  earns" assertion needs the day stripped first, and the test must say which
  property forced that.
- **`setDayApproved` only snapshots a day that is fully SIGNED**, and publishing
  then SPENDS the signature (`signClear`). A test that signs after publishing
  gets no snapshot; one that checks `daySigned` straight after publishing gets
  false. The real sequence is sign → publish → sign again for the next issue.
- **A sim row with a `pax` array does not draw its `p`/`w` seats outside the
  mode** — but the walk pays them. The mode deliberately shows everyone the day
  credits; that difference is pinned, not accidental.
- **An arm does not survive an `act()` boundary in a fresh jsdom harness.** Arm
  and place inside ONE `act`.
- **`view.DPREV` is view state and survives a `DAYS` reset**; a day listed in it
  refuses every arm silently.
- **Every scripted edit must assert its anchor matched.** A silent no-op costs a
  debugging cycle pointed at the wrong file.
- **The build's tsconfig is stricter than `tsconfig.json`** — run `npm run
  build`, not just `npx tsc --noEmit`.
- **A new field on the evidence block must be declared in `engine/schema.ts`'s
  spec**, and a new warning code must be documented on the Logic page. Both
  gates caught exactly that this session, which is what they are for.
