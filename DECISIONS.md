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

## 21 Sep 2026

| # | His ruling, in his words where short enough | What it means | Where it lives now |
|---|---|---|---|
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
