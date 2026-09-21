# DECISIONS — every ruling the owner has made, and where each one lives

**Why this file exists.** The owner, 21 Sep 26: *"This is a recurring problem. Whenever we
discussed something important to note down. I dont see u noting them down. How do we fix your
behavior lapse?"* He was right, and the cause is not forgetting. A ruling stated mid-task gets
absorbed into the WORK — executed correctly — and that feels like it has been handled. The work
absorbing a ruling is not the record keeping it. Because the work comes out right, nothing feels
missing, which is why it kept happening.

**So this is the artefact that would not exist if the step were skipped.** Append-only. Newest at
the top. One entry per ruling, and **every entry names the file that now carries it** — this file
is the INDEX of decisions, never the only home of one. A ruling recorded only here is still lost,
because nobody reads an index while building.

**The rule, in one line:** the moment he states a decision, preference, correction or ruling that
outlives the current task, it is appended here BEFORE the work it implies is done — and the closing
report carries a `Rulings:` line. Full rule: `.claude/rules/record-decisions.md`.

**What counts.** A ruling ("do it this way from now on"), a product decision ("green only where it
counted"), a correction to how I work, a preference, a "leave it", a supersession of an earlier
ruling, or an explicit no. **Not** ordinary task instructions ("run the tests", "check that file")
— those die with the task and belong nowhere.

---

## 22 Sep 2026

| # | His ruling, in his words where short enough | What it means | Where it lives now |
|---|---|---|---|
| D20 | *"Likewise for Avalon flight and duty and BB flight too. No oil"* · *"Or when someone creates a new block using the Avalon rules it will also not get OIL credited"*. | **RE-CONFIRMS D15 and EXTENDS it to the creation path.** AVALON flying lines, AVALON duty desks and BB flying lines earn no OIL — and neither does a duty block a user MAKES from a template whose "For wave" is AVALON. The second half is the new part: D15 was pinned by a test that hand-built an AVALON desk, so it watched the engine and not the mint. Driven in the app and now pinned by a test with a control, all three refuse to earn even when the strongest possible green is forced onto them, because the exempt wave is skipped before anyone enters the calculation | `src/engine/oil.test.ts` (the new template-mint test, named for D15); evidence in `docs/superpowers/specs/2026-09-22-oil-fixplan-settled.md` §2 item 8 |
| D19 | *"6. Perhaps indicate that the leave war period doesn't exist, create it"* | **A weekend or holiday that no Leave War period covers must NAME the reason and offer the way out, not just refuse.** Today the day shows a full green bar, promises "earns a full day of OIL", tells the scheduler to publish it, and afterwards reports "No conflicts flagged for this day ✓" — while no period exists for that date, so nothing can ever land. The fix is no longer "say it cannot earn": the day says **the leave war period for that year does not exist**, and offers to create it. Creating a period is a real Leave War record with bidding dates and a stage, so it is never made silently from a schedule screen — the offer creates it and hands the scheduler to the Leave War to set the window. **This widens fix 6 from a wording change into one that reaches the Leave War**, which is the owner's call and he has made it | `docs/handpass/2026-09-21-oil.md` §6 row 6; `docs/superpowers/specs/2026-09-22-oil-fixplan-settled.md` §2 item 5; on build: `docs/ui-contracts.md` and the OIL behaviour register |

## 21 Sep 2026

| # | His ruling, in his words where short enough | What it means | Where it lives now |
|---|---|---|---|
| D18 | *"I agree with all so far. 1-5. for 2 he should earn."* | **All five hand-pass findings accepted as real, and finding 2 settled his way: a second man the scheduler puts on a member's landed request row EARNS from it, the same as the man who filed it.** This CHANGES the input-row rule (OIL31), which until now let the claim own the row so the schedule half skipped everyone else standing on it. The other four are his approval to fix: the shift switch drawn on empty lines, the missing "not in force yet" mark on a puck, the silent placeholder on a desk, and the missing line when a day pays nobody | `docs/engine-rules.md` §Weekend/PH work earns OIL (the rule itself); the OIL behaviour register (OIL31 revised); `docs/ui-contracts.md` §The green edge; evidence `docs/handpass/parts/blocks-ab.md` |
| D17 | *"Isint playwright the same as browser test? Why didn't u choose that in the first place?"* | **For a long hand pass, drive the app with a SCRIPTED real browser from the start**, not the in-app browser panel. Both run the real bundle, but the panel is one click per message, resizes under you and times out on screenshots, so the pictures the standing order requires come out unusable. The scripted driver replays a whole day in about a minute, saves full-size pictures to disk, and is what makes handing the work to parallel agents possible. Looking at the pictures is still the agent's job — the tool changed, the looking did not | `raptor-port/docs/bug-check-order.md` §7.2; the reusable driver `raptor-port/scripts/handpass/` |
| D16 | *"Should we run agents to expedite this?"* → *"But if u spawn agents that are opus would that be better?"* | **A long hand-test pass is FANNED OUT across parallel Opus agents, not walked serially.** Partition by WORLD (its own port, its own browser tab, its own copy of the demo data) so no two agents share a fixture; hand each the fixture recipe rather than letting each rediscover it. The standing caution is unchanged and is the price of the speed: an agent's "found nothing" is weaker evidence than the host's own look, so each returns PICTURES and a filled table, and the host REPRODUCES every finding before it enters the evidence sheet | `raptor-port/docs/bug-check-order.md` §4 (a new paragraph under "where to spend the other models"); this session's evidence sheet `raptor-port/docs/handpass/2026-09-21-oil.md` |
| D15 | *"SC MAIN should be earning OIL. SC Spare not earning"* · *"Flying waves should be earning OIL"* · *"Common programme should be earning oil"* · *"Avalon and BB not earning OIL is ok. The duties for Standard. SC shift should be earning OIL, but Avalon duties should not"* | **The acceptance criteria for the whole feature, in his words** — said while looking at a real Saturday. EARN: flying lines, SC MAIN, Common Programme, Standard and SC-shift duty desks, ground rows. DO NOT: SC SPARE, AVALON/BB lines, AVALON/BB desks, ⓘ rows. Confirms what the engine already did; now pinned by tests rather than assumed | register OIL19/OIL21a; `ui/oilmode.test.tsx` §the green strip reaches every kind of seat; verified by hand on the board AND the week |
| D14 | *"theres going to be alot of context for the AI to read ... you record down word for word on what i mentioned. Not sure if u can summarise it ... reading so much context as an AI it starts to hallucinate"* | Records state the DECISION, not the transcript. Quote him only where the exact words are load-bearing; otherwise one line + date + a pointer. Docs are tiered by how often they must be read, and the always-read tier has a budget that can only go DOWN | `raptor-port/docs/doc-budget.md`; gate `npm run docsize`; `OUTSTANDING.md` → `[DOC-TRIM]` |
| D13 | *"How do we fix your behavior lapse?"* (on rulings not being written down) | Record a ruling the moment it is made, in `DECISIONS.md`, before doing the work it implies — enforced by a hook on every message and a `Rulings:` line in every report | `.claude/rules/record-decisions.md`; `.claude/hooks/record-decisions.sh`; this file |
| D12 | *"Just to confirm the bug check is not designed only for this OIL check scenario right? ... it can be interface, rules, cross platform and more"* | The bug-check order must adapt to any kind of work, not just this feature | `raptor-port/docs/bug-check-order.md` §2a |
| D11 | *"how does it integrate with the Claudex review workflow. Make sure that's covered"* | Claudex owns the plan and the code read; the order owns the running app. The walk goes BEFORE Claudex's final inspection, and money work needs both providers, not one | `…/bug-check-order.md` §4a; `.claude/rules/bug-check.md` |
| D10 | *"The previous methods I told I to bug check. I think this is the most comprehensive one. So just follow this instead"* | The bug-check order SUPERSEDES the 16 Sep scenario rule, the 20 Sep rules sweep and the 21 Sep test-like-a-human rule. One method, not four | `…/bug-check-order.md` §0a; the three superseded memories now point at it |
| D9 | *"the bug check order auto automatically kick in based on the right scenario and will recommend what checks to do ... So that i dont need to figure out what kind of bug checks to execute"* | The order fires itself; the agent states the tier and the checks; the owner never picks them | `…/bug-check-order.md` §0a; `.claude/rules/bug-check.md` |
| D8 | *"Can u ask fable and codex to come up with a robust way to bug check, I want to save that as a standing order"* | Both providers proposed independently; the merged result is the adopted order | `…/bug-check-order.md`, plus both proposals verbatim in `…/superpowers/briefs/` |
| D7 | *"there are also different way to execute bug tests ... Do we think we should execute all 3 to be robust?"* — answered yes, proportionately | Code read, automated tests and a hand pass each catch what the others cannot; run all three, scaled by what the change touches | `…/bug-check-order.md` §3 and §5 |
| D6 | *"U can ask fable and codex to think through all the possible scenarios to test for bugs and opus be the executor"* | The other providers DESIGN the scenarios; Opus executes them in the running app | `…/bug-check-order.md` §4 rank 1; the two lists in `…/specs/2026-09-21-oil-scenarios-{fable,codex}.md` |
| D5 | *"Remember this way of testing henceforth when a bug test is made"* | Driving the running app IS the bug test; a code review plus green tests is not one | `…/bug-check-order.md` §0; memory `bug-tests-drive-the-app-like-a-human` |
| D4 | *"all the previous bug tests we did there will be bugs not captured ... perhaps the next session we can do that after this task is truely completed"* | Every earlier feature checked the review-plus-tests way is carrying the same class of defect; sweep them after OIL closes | `OUTSTANDING.md` → `[HUMAN-RETEST]`, priority 1a |
| D3 | **R-2** — the two pre-existing money bugs are fixed on this branch, not filed | They share the root cause with R-1, so they are one coherent change | `…/specs/2026-09-21-oil-bugcheck-fixplan.md`; `docs/engine-rules.md` §Weekend/PH work earns OIL |
| D2 | **R-1** — only the issued schedule pays, BOTH directions | A holiday declared after publication waits for a republication and the day says so; revoking one no longer sweeps money silently | `docs/engine-rules.md`; `…/oil-bugcheck-fixplan.md`; tests in `leavewar/oilsync.test.ts` |
| D1 | **O-1** — the green bar shows only on the events that COUNTED towards a man's day | Supersedes §2.10 / OIL21 ("repeated on every puck he wears"). The ALL AVAIL count chip agrees with it again (O-3 re-examined) | register OIL21 + OIL21a/b; `docs/ui-contracts.md` §The green edge; `ui/oilmode.ts` |

### Carried, still open for him

| # | The question | Why it is his |
|---|---|---|
| Q1 | On a published day, an OIL decision not yet published changes the green bar on the scheduler's own screen while the Leave War still pays the issued figure — and nothing on the puck says "pending". A typed edit gets a dotted amendment mark; an OIL decision gets only the day's aggregate "1 change". | Product direction: whether a pending money change should look different from one in force. Raised by Fable's S4; to be shown to him in the app first. |

---

## Before this file existed

Rulings made before 21 Sep 26 are not listed here — they are in `raptor-port/CLAUDE.md`
§Stable decisions, in the per-feature behaviour registers under `docs/superpowers/specs/`, and in
the memory index. **Do not back-fill them wholesale**; add an old ruling here only when it is
re-confirmed, superseded or found to be stale, so this file stays a record of live decisions rather
than a second copy of the archive.
