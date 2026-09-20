# [S4-BUGHUNT] handoff — for the next session (20 Sep 26, second pass)

Branch **`claude/s4-bughunt`**, 32 commits off `main` (`e904d44`). **Nothing merged. Working tree
clean.** The owner has not said "merge live".

## Read exactly one file first

**`raptor-port/docs/superpowers/specs/2026-09-20-CURRENT-STATE.md`.**

It is still the single destination, and it is now true again: §1 lists eighteen things built, §2 says
all five items are done, §6 records the owner's answers to the three questions that were open, and
§8 states what is left. §5 is still the section that matters most — the rules set aside, which must
not be re-applied.

## What this session was, in one paragraph

The previous session ended with five items to build and three questions only the owner could answer.
He answered all three; one answer replaced a mechanism rather than picking from the options, so the
work grew a sixth item. All six are built, all gates have been run, and the hand-testing pass that
had been owed since the branch started has been done — it found one real defect, which is fixed.

## The owner's three answers, because they are the load-bearing part

1. **The 15-day rule stays as it is.** A day where leave touches the morning and more leave touches
   the afternoon is a full annual day, even with hours uncovered between them. His reasoning in
   effect: leave is counted in HALVES, so half plus half is a day. **No code changed** — the
   plain-language rule said "covered" when the app means "touches", so the words moved, not the
   behaviour.
2. **"We need a post in button just like post out"**, and then: *"Allow these inputs to be placed
   outside of the post in and post out dates. Because those dates are official dates. But they can
   be for e.g still taking leave after or before they post in or out."* That replaced the five
   sub-questions with one rule: the admin sets both ends by hand, those dates decide MANNING and
   nothing else, and a record dated outside them is allowed, shown and charged, with the ROW
   stretching to reach it.
3. **"Keep the bid and flag the day, both ways."** Publishing no longer throws an undecided bid
   away.

## What was built

| | What | Where to look |
|---|---|---|
| F | **Post in (PI)**, the mirror of Post out. The app had NO joining date before — the field existed and every manning path read it, but nothing ever wrote it, so everyone read as having always been here. | `setPostIn`, `PostInSheet` |
| B | **A row stretches to reach its records.** A man posted out in January with clearing leave in September was charged for it and could not be seen. | `merge.ts` spans, `rowInWindow` |
| C | **Days outside a person's time in the squadron are tappable at both ends.** Admin's tap manages the posting, the person's own tap places leave. | `actionable` in Matrix |
| Q3 | **Publishing keeps the bid and flags the day**, and tells the admin so. | `publishFlagsBids` |
| E | **Hours on a hand-typed OIL credit.** | `setCellHours`, the tracker's reason editor |
| D | **The free half beside Inputs-filed leave is biddable**, free half only, with the locked half named. | `freeHalfBeside`, `onlyPortion` |
| A | **A member is told his bid is still live**, by name, on his own clashed day. | `DayList` clash line, the mark's tooltip |

All three constraints the reviewers put on item B were held, and the third one — an archived person
with no posting date at all — is recorded as a limit in CURRENT-STATE §2 rather than quietly
skipped.

## Gate status at handoff — ALL SEVEN RUN

| Gate | Result |
|---|---|
| `npm test` | **326 files / 5164 green** |
| `npm run build` | clean |
| `node reference/tfin.js` | **728 / 0** |
| `npm run rulecheck` | **OK** — 21 of 26 rulings named by a test, 5 in the recorded baseline |
| `npm run test:e2e` | **447 passed / 0 failed** on a clean run — see the caveat below |
| `npm run perf` | **4 passed / 0 failed**, both DOM ceilings held |
| `npm run smoke:tracker` | **425 passed / 0 failed** (one known add-student flake on the first attempt, passes on a re-run) |
| **Hand test in the running app** | **DONE** — see below |

**`npm run perf` was DEAD on this machine and nobody knew.** It hard-coded the dev container's
Chromium path, so on the Windows desktop it failed instantly with "executable doesn't exist", which
reads like a broken probe rather than a missing browser. It now uses the same fallback as
`playwright.config.ts`. If another probe ever "fails instantly", suspect this shape first.

**The one thing NOT certified.** The month-window pair in `e2e/leavewar.spec.ts` (tests at 4210 and
4301) failed 4 times in 14 runs on this branch, all four clustered while the machine was also
building a second worktree and serving three previews. It never failed in 9 runs of the code from
before this branch's changes. Three direct measurements say it is not a regression: the roster row
set is identical month by month on both builds, the prune the test waits for takes 4ms on both, and
the perf gate passes. The test calls itself "a reading of a TRANSIENT" and its own comment records
that a couple of hundred milliseconds once flipped it 4 times in 4. It could not be reproduced on a
quiet machine. **Watch it in CI; do not assume it is nothing.**

## The hand test, and what it found

Driven in the built bundle at desktop and phone widths. Passing on screen: the Post in control, its
sheet and its undo; a pre-joining day being tappable; a man posted out in February whose September
leave brings his row back — charged and visible — with the manning count unmoved on that day; the
bid sheet opening on the free half beside Inputs-filed morning leave and naming what holds the
morning; the hours box saving, refusing what it cannot read, and not saving the reason on its own
when it refuses; and a member reading *"Your LL bid is still live — nothing has been thrown out"* on
his own clashed day. The publish ruling is driven end to end by the two rewritten browser tests,
because the demo Saturday carries no duty crew and so cannot be published into a clash by hand.

**It found one real defect, and only it could have.** On a phone the two new hours boxes squeezed
the reason box to ELEVEN PIXELS and pushed Save past the edge of the card. The unit tests assert
what the row contains, and jsdom reports every rect as 0×0, so every one of them passed.

**The reason it took three attempts to fix is worth more than the fix.** Every rule in
`oiltracker.css` is scoped under `#page-leavewar`, so every rule in that file carries an id's
specificity. New rules written without the prefix lose to their own neighbours however far down the
file they sit — silently, no error, no failing test. **When adding CSS to a Leave War stylesheet,
carry the `#page-leavewar` prefix.**

## What to do next

1. **Hand him the Vercel preview link** if it is not already with him, and **wait**. Nothing merges
   without his explicit "merge live".
2. **On "merge live":** gates → PR → merge on green → wait for Pages → load the real page and look
   at the thing that changed → one notification.
3. **Then the scenario hunt's original ground**, still largely untouched —
   `plans/2026-09-20-s4-bughunt-plan.md`. The Inputs-page calendar (the one door with no test at
   all), the medical dialog's cascade, bulk gestures driven by a real drag, switching wars with a
   sheet open, storage faults, phone touch, figures on multi-record days.
4. **Two things worth raising with him**, both found while hand-testing and neither urgent:
   - **An admin cannot type an FO or HO credit anywhere in the app.** The store accepts one and the
     hours box now edits one, but the only writers are the automatic pass and the demo seed. Item E
     assumed a door that does not exist. Ask whether he wants one.
   - **An admin tapping a day outside someone's posting dates always gets the posting sheet**, so he
     cannot file leave there from the grid — only the person themself can. That mirrors the post-out
     end exactly and was deliberate, but it is the first time both ends have existed, so it is worth
     his eye.

## Standing rules that bit during this session

- **The newest owner ruling wins, and an answer can REPLACE the question.** Q2 offered three ways to
  decide which records extend a row; he answered with a control that made the question moot. Take
  the answer, then say plainly what it does and does not solve — a post-in button does not on its
  own fix a man posted out in January, and saying so is what produced the second half of his ruling.
- **Hand-testing is not a formality.** It was the only thing that could have found the phone defect,
  and it found it in the first five minutes.
- **A CSS file's own scoping is a rule, not a style.** See above.
- **Prove "pre-existing flake" before saying it.** The month-window wobble was checked against a
  worktree of the code before the change, nine runs, plus three direct measurements — and it is
  still reported as uncertain rather than dismissed.
- **Python edit scripts on Windows:** `store.ts` is CRLF, most of `leavewar/` is LF. Always
  `open(..., newline='')` AND detect the file's own line ending before matching — a hard-coded
  `\r\n` matches nothing in an LF file and the script reports success having changed nothing.
