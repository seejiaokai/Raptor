# Skill Observation Log

Observations captured during task-oriented work.

**Status key:** OPEN = not yet actioned | ACTIONED (YYYY-MM-DD) = skill
updated/created | DECLINED (YYYY-MM-DD) = user decided not to pursue —
resolved statuses always carry their resolution date

---

## 2026-08-17

### Observation 2: New walkers over shared structures — diff the skip-conditions

**Status:** OPEN
**Date:** 2026-08-17
**Session context:** Wire 4 build (published duty → OIL credit); the medium code-review pass caught that the new `dayOilCredits` walker ignored `cx` cancellation markers and `more[]` extras that every sibling consumer of the same day structures honours.
**Skill:** code-review
**Type:** open-source
**Phase/Area:** review checklist / correctness angle

**Issue:** A brand-new function iterating structures that several existing functions already iterate (day waves / duty rows) silently disagreed with all of them about which entries count: it skipped no cancelled rows and missed the overflow-crew list. Unit tests written by the author alone shared the author's blind spot; the reviewer found it by comparing the new walker's skip-conditions against the existing walkers' line by line.

**Suggested improvement:** When reviewing (or writing) a NEW consumer of a structure that existing code already consumes, explicitly diff its filter/skip conditions against each sibling consumer's — every marker a sibling honours (cancellation flags, overflow lists, sentinel entries) is either honoured or its omission argued in a comment.

**Principle:** A shared structure's existing walkers encode the structure's real semantics; a new walker is wrong wherever it silently diverges from them, and the cheapest complete review of it is a skip-condition diff against its siblings.

### Observation 4: Widening a vocabulary means auditing every pruning filter over its parallel state

**Status:** OPEN
**Date:** 2026-08-17
**Session context:** Leave War medical sync (wire 5) — medical codes joined the set of cell codes that carry an ownership record
**Skill:** New skill candidate: none — extends Observation 2
**Type:** open-source
**Phase/Area:** derived-state reconcilers / load-time sanitisers

**Issue:** A load-time sanitiser (reconcile) dropped any state record on a non-biddable cell. When medical cells started carrying raptor-ownership records, that filter would have silently stripped ownership at every reload — making synced cells editable and re-mintable (a sync loop) with no error anywhere. Found only by grepping every isBiddable call site after widening the ingest gate.

**Suggested improvement:** When a new code/vocabulary starts carrying records in a parallel map, grep every consumer of the old membership predicate (not just the write paths) — especially load-time sanitisers and reverse sweeps, which DELETE based on the predicate.

**Principle:** A membership predicate used to PRUNE shared state is a hidden dependency of every new member; widening what may hold state without auditing the pruners produces silent deletion at the next load, far from the change that caused it.

### Observation 5: Appending CSS to a scope-wrapped stylesheet silently de-scopes the rules

**Status:** OPEN
**Date:** 2026-08-17
**Session context:** Leave War viewer-row highlight — rules appended after the file-wide `#page-leavewar {` wrapper closing brace lost to the wrapper's +1 id specificity; the class applied but nothing painted, caught only by a real-browser e2e assertion on computed background
**Skill:** impeccable (or any CSS-editing workflow)
**Type:** open-source
**Phase/Area:** editing vendored/scoped stylesheets

**Issue:** A stylesheet whose entire body sits inside one nesting wrapper makes tail-appends land OUTSIDE the scope: selectors still match, so nothing errors, but every competing in-scope rule outranks them by the wrapper's specificity. jsdom tests that assert classes pass; only a painted-pixel check fails.

**Suggested improvement:** Before appending to any stylesheet, check whether the file body is wrapped in a scoping selector (head + tail of the file), and insert INSIDE the wrapper; pair any visual rule with a computed-style assertion in a real browser, not a class assertion.

**Principle:** In a scope-wrapped file, the insertion POINT is part of the rule's meaning — a syntactically valid append can be semantically outside the system it targets, and only an end-to-end observation of the rendered result catches it.

### Observation 6: Asserted a feature existed from the user's phrasing without verifying

**Status:** OPEN
**Date:** 2026-08-18
**Session context:** Leave War SXO bug fix; the owner wrote "we will not show the SANS in the leave war however there is a function to still enable this"
**Skill:** verification-before-completion
**Type:** open-source
**Phase/Area:** Reporting — claims about existing system behaviour

**Issue:** The user's message described a behaviour ("SANS hidden, with an enable function") as if it existed. The agent echoed it back as fact — "SANS stays hidden and the switch is intact" — in a shipped-work report, without grepping for it. Neither the hiding nor the switch existed; SANS members were visible the whole time. The false claim survived one full ship cycle and was only caught when the user asked to "check the SANS enable function still works".

**Suggested improvement:** Extend the skill's evidence rule to cover PRESERVATION claims, not just change claims: before reporting "X is unchanged / still works / stays as-is" for any behaviour named by the user, locate the code that implements X (one grep). If it cannot be found, say "I could not find X" instead of affirming it. A user's description of their own system is a hypothesis to verify, not a fact to relay.

**Principle:** "Verified vs assumed, always distinguished" applies with full force to statements about what ALREADY exists — the cheapest lies to ship are affirmations of the status quo, because nothing red-flags them.

### Observation 7: Widened field domains leave stale validators behind

**Status:** OPEN
**Date:** 2026-08-18
**Session context:** Leave War per-event tags — extending the untrusted war reader
**Skill:** New skill candidate: none — cross-cutting reviewing principle
**Type:** open-source
**Phase/Area:** data-model changes / untrusted-input readers

**Issue:** A feature widened event rows from exactly 2 to up to 6, but the stored-data reader still dropped any band whose line was not 0 or 1 — silently deleting data on reload. Found only because an adjacent change touched the same reader.

**Suggested improvement:** When a change widens a field's legal domain (enum grows, count becomes variable), grep for every reader/validator that hard-codes the old domain before calling the change done.

**Principle:** A domain widening is not complete until every validator of that domain is re-derived from the new bound, not the old literal.

### Observation 8: A thead cannot sit mid-table — CSS paints it at the top regardless

**Status:** OPEN
**Date:** 2026-08-18
**Session context:** Leave War layout reorder (header row moved below count rows)
**Skill:** New skill candidate: none — frontend layout gotcha
**Type:** open-source
**Phase/Area:** table layout / row reordering

**Issue:** Moving a table's header row below other row groups in JSX does nothing visually: CSS table layout renders the table-header-group first wherever it appears in the DOM. The row had to become a classed tbody to obey DOM order.

**Suggested improvement:** When reordering table row groups, remember thead/tfoot are position-independent display groups; use tbody + class for any header that must sit mid-table.

**Principle:** display: table-header-group is a rendering role, not a position — DOM order only governs plain row groups.

*Checkpoint 19 Aug 26 (Leave War manning-explainer session): no observations — mid-build, nothing skill-worthy yet.*

### Observation 9: A JS-synced follower element driven off the scroll event lags the compositor — drive it from rAF

**Status:** OPEN
**Date:** 2026-08-19
**Session context:** Leave War frozen header — the owner reported the sticky header stuttered and "lags the grids below, trying to catch up" on a sideways scroll. It was a fixed mirror whose scrollLeft was copied from the grid's `scroll` event.
**Skill:** New skill candidate: none — cross-cutting frontend-performance principle (home: docs/feature-impact.md drift-seams, or a code-review perf angle)
**Type:** open-source
**Phase/Area:** scroll-linked UI / sticky-follower elements

**Issue:** An element positioned to track a scroller (a frozen header mirroring a horizontally-scrolled grid) was kept in lockstep by writing its scrollLeft inside the scroller's `scroll` event handler. On a touch device the scroller moves on the compositor thread at full frame rate, but `scroll` fires COALESCED on the main thread — often fewer than once per painted frame during a fling — so the follower always trailed by a frame or more and visibly chased the content. The fix was to sample the scroller's position inside a requestAnimationFrame loop (started on scroll, stopped ~200ms after rest so idle pages still idle), applying the match in the same frame the content paints.

**Suggested improvement:** When one element must visually track another's scroll position via JS, do not rely on the `scroll` event as the sole driver — it is throttled/coalesced and always lags compositor-driven scrolling. Drive the follower from a rAF loop that reads the source's scroll offset each frame while scrolling. Prefer a compositor-friendly write (transform) over layout-inducing ones (scrollLeft) where the follower's own sticky children permit it.

**Principle:** A scroll-linked effect computed on the main thread from the `scroll` event is inherently a frame or more behind compositor scrolling; sampling the scroll offset in requestAnimationFrame is what puts the follower in the same frame as the content it tracks.

### Observation 10: Controls embedded in a contenteditable must be drawn by the same builder the heal uses

**Status:** OPEN
**Date:** 2026-08-21
**Session context:** RAPTOR — adding per-line add/remove controls to the per-wave in-time block (a contenteditable div healed from the model on focusout)
**Skill:** New skill candidate: none — cross-cutting frontend principle (sibling of Observations 8/9)
**Type:** open-source
**Phase/Area:** implementation design

**Issue:** A delete button placed inside a contenteditable region that is "healed" (innerHTML rebuilt from the model on blur) gets torn out of the DOM between its own pointerdown and click whenever the heal's expected markup omits it — the click then lands on a detached node and dies silently, a dead first tap that no unit test catches (the second tap works).

**Suggested improvement:** When embedding interactive islands (contenteditable="false" buttons) inside an editable region, render them from the SAME builder function the heal/diff path uses, so the equality check sees identical markup and never rebuilds under a live tap. Keep the commit scrape keyed to the text elements only (spans), so the island never leaks into the committed value.

**Principle:** Any DOM region that is periodically rebuilt from a single source-of-truth builder must have ALL its interactive children owned by that builder — a control rendered by a second path is destroyed by the first at exactly the moment it is being used.

### Observation 11: A single shared contenteditable is the wrong unit for a list — iOS breaks it two ways at once

**Status:** OPEN
**Date:** 2026-08-21
**Session context:** RAPTOR — the in-time editor's first cut (one contenteditable block of spans, ✕ buttons as contenteditable=false islands inside it) failed on the owner's iPhone: the ✕ was un-tappable, and typing after a deletion duplicated a line
**Skill:** New skill candidate: none — cross-cutting frontend principle (extends Observation 10)
**Type:** open-source
**Phase/Area:** implementation design / device verification

**Issue:** Two independent iOS failures shared one root — a list edited as ONE contenteditable region. (1) iOS Safari does not reliably deliver taps to buttons inside a contenteditable, even contenteditable="false" islands, so a control that works in desktop Chrome and passes jsdom tests is dead on the phone. (2) WebKit's editing engine clones/splits child spans around deletions, so a commit that scrapes child elements re-reads cloned content as new items — data duplication invisible to any test that types via textContent.

**Suggested improvement:** Edit lists per-item: each item its own small contenteditable, controls as ordinary buttons OUTSIDE any editable region, commits reading exactly one item's textContent. Treat "does this control sit inside a contenteditable?" as a design smell to catch at review time, and treat contenteditable behaviour as device-verified only — jsdom and even desktop Chromium cannot exercise WebKit's editing engine.

**Principle:** The unit of contenteditable should equal the unit of commit. A region larger than one committed value hands the browser's editing engine authority over your data structure — and WebKit exercises that authority differently from every test environment you have.


### Observation 12: A rule's prose lives in more places than its code — sweep them all on every rule change

**Status:** OPEN
**Date:** 2026-08-21
**Session context:** Widening RAPTOR's crew-rest rule (any prior-day event now rest-bearing)
**Skill:** New skill candidate: rule-change sweep (or a CLAUDE.md discipline line)
**Type:** open-source
**Phase/Area:** Docs/consistency pass after an engine rule change

**Issue:** The morning's duty-widening pass updated the engine, the reference patch, the tests and two docs files — but missed the Logic page (`logic-html.ts`), a user-facing surface that states the same rule in prose. It was found stale only because the NEXT rule change happened to touch the same paragraph hours later. A rule that renders its own description is a copy of the rule, and copies drift.

**Suggested improvement:** After changing any engine rule, grep the whole repo for the old rule's distinctive WORDING (not just its code identifiers) — e.g. "sortie or a shift" — to find prose restatements in UI copy, docs, and comments. The repo's feature-impact.md drift-seam list could name "rule prose surfaces" (engine comments, engine-rules.md, remarks-vocabulary.md, logic-html.ts) as a standing seam.

**Principle:** When behaviour and its human-readable description are maintained separately, every behaviour change must be paired with a text search for the old description's wording; identifier-based greps find code, only wording-based greps find prose.

### Observation 13: Test fixtures must speak the model's stored format, not the UI's accepted format

**Status:** OPEN
**Date:** 2026-08-21
**Session context:** RAPTOR editable-rules pass — an engine test silently produced no warning
**Skill:** New skill candidate: engine-test fixtures (or a testing discipline note)
**Type:** open-source
**Phase/Area:** Writing engine-level tests that mutate the data model directly

**Issue:** A test planted a formation take-off as '1800' (the format the UI's input boxes accept and normalise) where the model stores '18:00'. The model-level reader (`toMin`, colon-only) returned NaN, every check for that line switched off silently, and the test failed with "no warning raised" — pointing at the rule under test rather than at the fixture. Fifteen minutes of debugging landed on the fixture, not the feature.

**Suggested improvement:** When a test writes into the data model directly (bypassing the UI write path), first read one SEED value of the same field and match its format exactly. A one-line comment in the test naming the stored format prevents the next writer repeating it. For the repo: fixtures copying seed shapes beat hand-built literals.

**Principle:** UI write paths normalise; direct model writes don't. A test that bypasses the write path inherits the obligation to produce exactly what the write path would have stored — the quickest proof is copying the format of an existing seed value.

### Observation 14: A rule from a non-technical owner arrives in layers — restate the decision table before coding each layer

**Status:** OPEN
**Date:** 2026-08-21
**Session context:** RAPTOR crew-rest rule — four owner corrections in one day (duties count → everything counts → NAAR is wave-not-clock → the day starts at its first commitment)
**Skill:** New skill candidate: rules-engine elicitation (or a CLAUDE.md confidence-rule note)
**Type:** open-source
**Phase/Area:** Requirements capture for validation-rule changes

**Issue:** Each implementation pass was correct against the owner's literal words, and each was then revealed incomplete by the next message: "duty rows count" became "anything that ends the day prior", then the analogous same-day side ("anything earlier like a meeting") arrived only after the prior-day side shipped. The rule the owner held all along was symmetrical and simple — "12 clear hours before the person's working day, if they fly" — but it was delivered as corrections to visible behaviour, one screenshot at a time.

**Suggested improvement:** When a rule change comes from observed behaviour ("no warning here"), before building, restate the WHOLE rule as a plain-language decision table (what counts, on both sides of the boundary; what triggers the requirement; what is exempt) and ask one confirm question if any cell is inferred. The restatement costs a sentence; a missed cell costs a full build-test-ship cycle.

**Principle:** A correction to a rule is usually a sample from a simpler, more general rule the person already holds. After the second correction to the same rule, stop patching cells and propose the general rule back for confirmation.

### Observation 15: pkill -f in a compound command kills its own shell — bracket the pattern

**Status:** OPEN
**Date:** 2026-08-21
**Session context:** RAPTOR gate runs — `pkill -f "vite preview" ; npm run build && …` chains died with exit 144 and no output, three times before diagnosis
**Skill:** New skill candidate: shell-command hygiene (or a note in any run-the-gates skill)
**Type:** open-source
**Phase/Area:** Killing a stale dev server before running browser gates

**Issue:** `pkill -f "vite preview"` matches FULL command lines, and the wrapper shell executing the compound command carries the literal text "vite preview" inside its own `sh -c` arguments — so pkill killed its own process group. The chain died before any later command ran, with a bare exit 144 that read like a harness quirk; one run silently skipped the build+e2e gates entirely, and only reading the empty output file revealed nothing had run.

**Suggested improvement:** In compound commands, write the pattern so it cannot match itself: `pkill -f "vite [p]review"` (the character class is absent from the pattern's own text). Also treat "exit 144 with an empty output file" as "the chain never ran" — verify the gate actually produced its result line before counting it green.

**Principle:** A process-killing command embedded in a larger command line is itself a match candidate; make the pattern self-excluding, and never count a gate as run without seeing its output.

### Observation 16: Two settings holding the same default for one physical moment are a latent drift seam — merge on discovery

**Status:** OPEN
**Date:** 2026-08-21
**Session context:** RAPTOR — the owner asked "will this rule still work if I change the rules for step default timing?"; the answer was NO because `showLead` (crew-rest late-show line) and `step` (busy-window pad) were separate keys both at 60
**Skill:** New skill candidate: rules-engine robustness review (or a CLAUDE.md doctrine note — added there this session)
**Type:** open-source
**Phase/Area:** Editable-settings design in a validation engine

**Issue:** Two settings were born at different times for what a domain expert regards as ONE moment (the crew steps to the jet). Because both defaulted to 60 they were indistinguishable in every test and every message — the seam was invisible until the owner asked what happens when he edits one of them. Editing "Step before take-off" would have moved the busy windows and the tight-turn floor but silently NOT the crew-rest breach line, which would keep printing a time derived from the other, unedited key.

**Suggested improvement:** When auditing editable settings (or adding one), group keys by VALUE and by the real-world moment they describe: any two keys sharing a default deserve the question "are these the same thing wearing two names?" The user's own vocabulary is the test — if the domain has one word for it ("step"), the engine gets one key for it.

**Principle:** Identical defaults hide duplicated concepts; a settings audit should diff meanings, not just look for hard-coded literals.

### Observation 17: Ad-hoc Playwright drive scripts fail outside the project tree

**Status:** OPEN
**Date:** 2026-08-21
**Session context:** Double-turn counter fix — driving the built bundle to check the Logic-tab wording
**Skill:** New skill candidate: none — target is raptor-port/CLAUDE.md §Build & verify (project doc, not a skill)
**Type:** internal
**Phase/Area:** Live-view pass / browser drive recipe

**Issue:** The documented live-view recipe says "a short Playwright script" and gives the executablePath rule, but a script written to the session scratchpad failed twice before running: (1) Node resolves modules upward from the script's own directory, so a script outside raptor-port never finds node_modules; (2) the repo ships `@playwright/test`, not `playwright`, so `require('playwright')` fails even in-tree. Both are invisible in the doc and cost two failed runs.

**Suggested improvement:** Add one line to CLAUDE.md §Build & verify's drive recipe: place ad-hoc drive scripts inside raptor-port (or set NODE_PATH) and import from '@playwright/test' — the e2e suite's package is the only Playwright installed.

**Principle:** A documented "write a quick script" recipe should state where the script must live and which package name to import, because module resolution and package aliasing fail before the recipe's own content ever runs.

### Observation 18: Fixed CSS tracks sized from font arithmetic were wrong three times in one pass — probe-measure in the built page

**Status:** OPEN
**Date:** 2026-08-22
**Session context:** Reworking the Inputs page's phone cards into a grid of aligned columns (fixed callsign/type tracks). Estimated widths from font-size arithmetic three times and was wrong all three: a chip estimated 90px measured 100; a chip estimated 125px measured 129 (wrapped at a 128px cell); the longest callsign estimated 70px measured 76. Each miss shipped a build + screenshot round to discover. The fix each time was a probe span injected into the LIVE page (same classes, whiteSpace:nowrap, read getBoundingClientRect) which gave the exact number in one round.
**Skill:** New skill candidate: css-track-sizing (or a rule in the repo's UI-work guidance)
**Type:** open-source
**Phase/Area:** layout implementation — choosing fixed grid/table column widths

**Issue:** When a fixed track must fit known text, estimating width as chars × per-glyph advance is reliably off by 5–15% (letter-spacing, font metrics, padding, bold), and a 1px miss makes the text wrap — a binary failure discovered only by screenshot.

**Suggested improvement:** Before choosing any fixed track/column width that must fit specific text: inject a probe span with the target's real classes into the built page, measure every candidate string (longest label, longest name, widest time run), and derive the track from the measured max plus a stated margin. Record the measured numbers in the CSS comment (this repo's existing convention) so the next editor re-measures rather than re-estimates.

**Principle:** A layout number that makes text fit is a measurement, not a calculation — take it from the rendering engine that will enforce it, with the exact styles that will apply, before writing it into a stylesheet.

### Observation 19: Delegated UI tests must drive real controls, not state setters

**Status:** OPEN
**Date:** 2026-08-22
**Session context:** Building the Inputs month-calendar; a delegated subagent's month-stepping buttons never repainted (setCalMonth without notify) yet its 11 jsdom tests passed, because the tests stepped months via the state setter + manual notify instead of clicking the real ‹ › buttons. Caught only on the live-view screenshot pass.
**Skill:** New skill candidate: delegated-ui-specs (or a rule for dispatching-parallel-agents)
**Type:** open-source
**Phase/Area:** Subagent spec-writing for UI tasks

**Issue:** A spec told the agent WHAT to test (month navigation works) but not HOW (through the rendered control). The agent tested the model transition directly, which cannot catch a missing repaint wire between control and store.

**Suggested improvement:** When speccing UI work for a code-writing agent, require at least one test per interactive control that dispatches a real event on the rendered element and asserts the visible outcome (textContent/DOM), naming this as a hard requirement in the spec. Orchestrator review should specifically ask "does any test click the actual button?"

**Principle:** In frameworks where rendering is subscription-driven, a test that mutates state directly bypasses the exact wiring (mutate → notify → repaint) most likely to be missing; only an event on the real control exercises it.

### Observation 20: Capture full-suite output to a file on the first run

**Status:** OPEN
**Date:** 2026-08-22
**Session context:** Tightening the Inputs page person choice (member self-only); the full vitest suite (~5 min) reported 2 failures but only a `tail -5` was kept, forcing a second full run just to learn WHICH tests failed
**Skill:** New rule candidate for raptor-port/CLAUDE.md §Token discipline (project instruction, not a standalone skill)
**Type:** internal
**Phase/Area:** verification / gate-running workflow

**Issue:** Piping a long-running full test suite through `tail` discards the failure detail; when the run is red, identifying the failing files costs a complete re-run (~5 min here). A second, backgrounded double-run was started and had to be killed — pure waste.

**Suggested improvement:** Always redirect a full-suite run to a scratchpad log file (`> run.log 2>&1; tail run.log`), so a red result can be diagnosed by grepping the file instead of re-running. One sentence in CLAUDE.md §Token discipline would encode it.

**Principle:** Expensive verification runs should be captured in full the first time; the cost of keeping output is zero, the cost of re-producing it is the whole run.

### Observation 21: pkill -f self-match kills the calling shell

**Status:** OPEN
**Date:** 2026-08-22
**Session context:** Removing the repeat-weeks feature; killing a leftover vite preview before an e2e run
**Skill:** New rule candidate for raptor-port/CLAUDE.md §Build & verify (project instruction)
**Type:** open-source
**Phase/Area:** gate-running workflow / shell hygiene

**Issue:** `pkill -f "vite preview"` inside a compound Bash command matched the calling shell's own command line (the pattern text appears in it) and killed the whole command — the test run it was chained to died with exit 144 and its log was never written.

**Suggested improvement:** When pkill/pgrep -f must run inside a larger command whose text contains the pattern, break the self-match with a character class: `pkill -f "vite [p]review"`. Worth one line wherever the preview-kill step is documented (HANDOFF's stale-preview trap).

**Principle:** A full-command-line process match can always match the process doing the matching; neutralise the pattern (bracket class) or run the kill as its own minimal command.

### Observation 22: Checkpoint — no new skill observation

**Status:** ACTIONED (2026-08-22) — checkpoint marker, no change needed
**Date:** 2026-08-22
**Session context:** Shipping the calendar day-popover remark line (3rd deliverable of the session)
**Skill:** task-observer
**Type:** internal
**Phase/Area:** mandatory 3rd-completion checkpoint

**Issue:** Checkpoint reached after completing three deliverables (member person-scope, repeat-weeks removal, calendar remarks). Observations #20 (capture full-suite output) and #21 (pkill self-match) already cover the friction seen; nothing further accumulated.

**Suggested improvement:** None — marker only.

**Principle:** Writing an explicit no-new-observation marker at the checkpoint keeps the enforcement honest without inventing low-signal entries.

### Observation 23: CI-only flake — unstubbed browser API + abandoned timer in jsdom

**Status:** ACTIONED (2026-08-22) — stubbed document.elementFromPoint in the affected test file
**Date:** 2026-08-22
**Session context:** Shipping calendar changes; a PR gate failed on a test the local suite passed
**Skill:** New rule candidate for raptor-port/CLAUDE.md §Build & verify (the "green on PR, red on CI" hazard section)
**Type:** internal
**Phase/Area:** verification / CI-vs-local test isolation

**Issue:** A test that arms a gesture machine which calls a browser-only DOM API (document.elementFromPoint) via a setTimeout hold-timer passed locally but failed on the ~30% slower CI runner: the abandoned timer fired mid-test, threw "elementFromPoint is not a function" (jsdom does not define it), and the uncaught async error poisoned an unrelated assertion (SBDAY expected 6 got 2). Local timing cleared the timer before it fired, masking the gap. The fix already existed as a pattern in a sibling test file (caldrag.test.tsx stubs the same API) but had not been applied to the newer file.

**Suggested improvement:** When a test drives code that hit-tests through document.elementFromPoint (or any jsdom-absent browser API) on a timer, stub it in beforeAll — null return = "nothing under the pointer". Better: a global vitest setup stub so no future touch-drag test can regress. Diagnose a PR-passed/main-failed (or intermittent) failure by reading for the uncaught async error FIRST, not the assertion it corrupts.

**Principle:** A jsdom-absent browser API called from an abandoned timer is a latent CI flake that hides behind local timing; stub the API at the environment boundary rather than chasing the corrupted assertion downstream, and apply the stub wherever the pattern recurs — precedent in one test file is a checklist item for the next.

### Observation 24: Stop-hook "commit and push" fires while a background agent owns the working tree

**Status:** OPEN
**Date:** 2026-08-23
**Session context:** Ten-ask UI batch on Raptor — orchestrator session delegating implementation waves to background agents that commit per work package
**Skill:** New skill candidate: orchestrating-implementation-agents (or a rule for dispatching-parallel-agents)
**Type:** open-source
**Phase/Area:** Delegated implementation / git hygiene

**Issue:** A stop hook that checks for uncommitted/unpushed changes fired mid-session while a delegated background agent was actively editing the shared working tree. Blindly obeying it would have committed a half-finished work package out from under the agent (which commits per-package itself after its tests pass). The correct response was to push only the already-committed work and explicitly decline to commit the in-flight tree until the agent's completion notification.

**Suggested improvement:** When orchestrating background agents that share the orchestrator's working tree, treat generic "commit your changes" prompts (hooks, reminders) as scoped to work the orchestrator owns: push committed history freely, but never commit a tree an active delegate is mutating. State the reason once and wait for the agent's completion.

**Principle:** Automated hygiene prompts don't know about delegated ownership of shared state; the orchestrator must partition "safe to act on now" (committed history) from "owned by an in-flight worker" (the dirty tree) before complying.

### Observation 25: Concurrent subagents collided on a repo-tree scratch file

**Status:** OPEN
**Date:** 2026-08-23
**Session context:** Cross-week validation engine build; test-writing and docs agents ran in parallel
**Skill:** dispatching-parallel-agents
**Type:** open-source
**Phase/Area:** parallel delegation hygiene

**Issue:** A docs-editing agent accidentally deleted (then restored) a `_scratch.test.ts` working file that a concurrently running test-writing agent had placed in the repo tree. The restore was from the docs agent's earlier read, so a mid-flight version could have been clobbered silently.

**Suggested improvement:** When dispatching parallel agents that share a repo, instruct each to keep temporary/working files in its own scratchpad directory, never the repo tree, and instruct agents to treat unrecognized untracked files as another agent's property (never delete/restore them).

**Principle:** Parallel agents sharing a filesystem need an explicit working-file convention; "don't touch files that aren't yours" must include untracked strays.

### Observation 26: Implementing agent caught a plan-prose error by tracing the loop bound

**Status:** OPEN
**Date:** 2026-08-23
**Session context:** Cross-week validation engine; plan said "maxRun=7, 8-day run" for the two-prior-weeks test
**Skill:** subagent-driven-development
**Type:** open-source
**Phase/Area:** spec-to-implementation handoff

**Issue:** The plan's test spec (maxRun=7 exercising the second-prior-week walk) was unreachable — the walk loop runs k=1..maxRun, and k=8 only engages when maxRun>7. The test-writing agent traced the bound, corrected to maxRun=8, and reported the deviation with reasoning instead of writing a vacuously-passing test.

**Suggested improvement:** Keep instructing implementer agents to verify spec parameters against the actual code path they exercise, and to report deviations-with-reasoning rather than silently obeying or silently fixing; add this phrasing to the standard delegation prompt template.

**Principle:** A test that cannot reach the code path it claims to pin passes vacuously; implementers must prove reachability, and a good delegation contract makes "correct the spec and say so" the expected move.

### Observation 27: Partition files explicitly when two builders share one working tree

**Status:** OPEN
**Date:** 2026-08-23
**Session context:** Mid-session priority shift — owner reported a data-loss bug while a feature agent was already building in the same branch/tree; a second implementation agent was launched in parallel.
**Skill:** dispatching-parallel-agents
**Type:** open-source
**Phase/Area:** agent briefing

**Issue:** Two general-purpose agents edited the same working tree concurrently. Collision was avoided only because the second brief named the first agent's files explicitly ("do NOT touch X, Y, Z — write it up instead"), turning an implicit hope into a contract. A prior session (Obs 25) had exactly this collision on a scratch file.

**Suggested improvement:** When dispatching a second writer into a tree where another writer is active, the brief must list the other agent's owned files as read-only and give an escape hatch ("report the needed change instead of making it"). The orchestrator then applies cross-boundary edits itself during integration review.

**Principle:** Parallel writers in one workspace need an explicit file-ownership contract in their briefs, plus an orchestrator-owned integration pass for changes that cross the boundary.

### Observation 28: A "declined as theoretical" engine finding the owner later proved real

**Status:** OPEN
**Date:** 2026-08-24
**Session context:** Raptor cross-year date-anchoring fix (owner challenged a bug-sweep finding declined as "can't actually happen")
**Skill:** none — general review methodology
**Type:** open-source
**Phase/Area:** Bug-sweep verification / finding triage

**Issue:** A review finding about ambiguous date resolution was declined as theoretical without tracing actual reachability. The owner's one-line question exposed that the ambiguity was reachable through an existing navigation feature, and the fix touched 15 files — the "theoretical" framing had hidden a multi-site defect family (matching, auto-landing, labels, caches, editors, sync).

**Suggested improvement:** Triaging a finding as "can't happen" requires a positive reachability argument (what would have to be true for it to fire, and why no product path satisfies that), not an absence-of-evidence argument. If the data model itself is ambiguous (a value whose meaning depends on ambient state), treat it as a defect family, not a single site.

**Principle:** A stored value whose meaning depends on ambient state is a latent bug everywhere it is read; declining one read-site as theoretical says nothing about the other read-sites the same ambiguity feeds.

### Observation 29: Widening a list's scope invalidates per-row reads of ambient context

**Status:** OPEN
**Date:** 2026-08-24
**Session context:** Owner filed a Dec 24 → Jan 8 leave from the live site while viewing an August week; the Inputs page stamped it LATE though it was filed 4 months early. Root cause: the late-input deadline is computed from the CURRENTLY LOADED week (CURWEEK), which was correct while the Inputs page was week-scoped, and became wrong when inputs went global (22 Aug) — a far-future input is now judged against whatever week the viewer happens to have loaded.
**Skill:** CLAUDE.md rules-engine robustness doctrine (gotcha families)
**Type:** open-source
**Phase/Area:** post-change audit scope

**Issue:** When a display surface widens its scope (week-scoped list → global list), per-row computations that silently assumed the old scope (here: "the loaded week IS this row's week") keep compiling and keep rendering — they just become wrong for the rows the widening added. The cross-year audit walked readers of the row's own fields (date/endDate) but not readers of ambient context (CURWEEK) that the old scope had made coincidentally correct.

**Suggested improvement:** Add to the gotcha-family walk: when a change widens the population a computation runs over, list every ambient input (loaded week, base year, current page, viewer) the computation reads and ask whether the old population guaranteed it matched the row and the new one does not.

**Principle:** A scope-widening change must re-audit not only what each row carries but what each row's computations borrow from the environment — assumptions that were invariants under the old scope become bugs under the new one without any code in the computation changing.

### Observation 30: Intent caches must hook every manual channel, and tolerances must match their misalignment source

**Status:** OPEN
**Date:** 2026-08-24
**Session context:** Owner reported the desktop week arrow needing 2 clicks from Saturday to reach Sunday. Two distinct root causes reproduced in a real browser: (1) a free scroll parks the strip a few dozen px shy of a day boundary, and the arrow's hairline 0.02-day tolerance — sized for arithmetic rounding drift — read that human parking imprecision as "still on the previous day", making the first click an invisible nudge; (2) the arrows' burst-corridor cache (which remembers the last commanded scroll target) was invalidated on shift+wheel and scrollbar grabs but NOT on plain horizontal wheel/trackpad pans, so a stale target made one click from Saturday jump a whole week.
**Skill:** CLAUDE.md rules-engine robustness doctrine (gotcha families)
**Type:** open-source
**Phase/Area:** UI state caching / tolerance sizing

**Issue:** Both halves came from the same earlier fix (the mid-glide burst corridor): the cache of user intent was hooked only to the manual-pan channels the feature was tested with, and the boundary tolerance was reused from a context (float drift) whose error magnitude is orders below the new context (where a pointer rests).

**Suggested improvement:** When adding state that caches intent to override live readings, enumerate every input channel that can move the live state (wheel with and without modifiers, touch, pointer drags, keyboard, programmatic) and invalidate on each — grep the listener wiring, not memory. When reusing a tolerance, name the source of misalignment it must absorb and size it to that source.

**Principle:** A cache of user intent is only as correct as the completeness of its invalidation list, and a tolerance calibrated for one error source silently under-covers a larger one — both fail invisibly, as actions that "work" but answer a stale or mis-read position.

### Observation 31: Paginated list tools that ignore their page-size params need a parse-the-file reflex

**Status:** OPEN
**Date:** 2026-08-24
**Session context:** Raptor ship chain — polling GitHub Actions run status repeatedly while merging PRs
**Skill:** New skill candidate: none — cross-cutting tooling practice
**Type:** open-source
**Phase/Area:** CI status polling via MCP list tools

**Issue:** The Actions list tool overflowed the token limit on every single call this session even with per_page=1 in the resource URI — the pagination param was silently ignored and the full 72KB response saved to a file each time. Four calls, four overflows, four identical python-parse recoveries.

**Suggested improvement:** When a list tool ignores its pagination parameter once, stop re-trying variations of the parameter; go straight to the saved-file parse (one-line python/jq) as the standard recipe for the rest of the session, and note the recipe in the session's working notes the first time.

**Principle:** A tool parameter that provably has no effect will not start working on the next call — after one confirmed ignore, route around it permanently instead of re-negotiating with it each time.

### Observation 32: Renames must sweep the local-only gate scripts, not just CI

**Status:** OPEN
**Date:** 2026-08-24
**Session context:** Raptor — SC MAIN/SPARE badge session; full local gate run found all six adapted probes and the perf probe broken
**Skill:** New skill candidate: none — repo CLAUDE.md doctrine
**Type:** open-source
**Phase/Area:** Build & verify gates

**Issue:** A login rename (admin a/a → ad/a) shipped with CI green, but the six adapted probes and the perf probe log in with hard-coded credentials and are LOCAL-ONLY gates — they silently broke and stayed broken until the next session's full gate run. The perf probe then needed a per-build split (the read-only reference keeps the old accounts), and the reference-probe runner needed a source-substitution shim.

**Suggested improvement:** When renaming any credential, account, id or selector, grep the ENTIRE gate surface — including scripts CI never runs (probes/, perf, runners) — not just src/ and the CI-exercised suites. In this repo: `grep -rn <old-literal> probes/ e2e/` belongs in the rename checklist alongside the src sweep.

**Principle:** A rename that passes CI can still break gates that only run locally; the sweep for old literals must cover every script that exercises the system, not just the code and the CI path — and paired read-only fixtures (a frozen reference build) may deliberately KEEP the old literal, so the sweep must split by target, not blanket-replace.

### Observation 33: vite preview with base './' serves at root — '/Raptor/' path is a silent SPA-fallback trap

**Status:** OPEN
**Date:** 2026-08-25
**Session context:** Live-driving the Admin Data panel's new clearing controls against a local vite preview build
**Skill:** New skill candidate: raptor-live-drive (or CLAUDE.md probes section)
**Type:** internal
**Phase/Area:** Local preview + Playwright drive recipe

**Issue:** The app's vite base is './', so `vite preview` serves it at http://localhost:PORT/ — but the deployed URL shape (/Raptor/) also answers 200 via the SPA fallback, returning index.html whose RELATIVE asset refs then 404. curl -w '%{http_code}' on both the page AND an asset path reported 200 (the asset "200" was the fallback HTML), so the recipe looked verified while Chromium showed a blank #root. Cost three debug rounds; also found multiple leftover 'vite preview' processes from a prior background e2e run squatting alongside the new one.

**Suggested improvement:** In the repo's drive recipe (CLAUDE.md or probes doc): (1) always drive http://localhost:PORT/ (root, never /Raptor/) against local previews; (2) verify an asset URL by CONTENT-TYPE or first bytes, never by status code, since SPA fallbacks make every path a 200; (3) before starting a preview, kill stale ones with a ps-based sweep, not a single pkill pattern.

**Principle:** Against any SPA server with a history fallback, an HTTP 200 proves nothing about a path being right — verify by content, and verify the port is served by exactly the process you just started.

### Observation 34: An insertion into a 5,000-line CSS file landed in the wrong @media block — geometry probe caught what no unit test could

**Status:** OPEN
**Date:** 2026-08-25
**Session context:** Fixing phone day-header layout shifting when "· Today" widens the title
**Skill:** projectSettings:impeccable (verify phase) / repo CLAUDE.md conventions
**Type:** open-source
**Phase/Area:** CSS editing + verification

**Issue:** New phone-only rules were inserted next to plausible-looking neighbours (.day-head padding overrides) that actually sat inside the DESKTOP @media (min-width:821px) block — the enclosing query opened 20+ lines above the insertion point and nothing at the edit site said so. The build succeeded, the rules appeared in dist, and only a real-browser geometry measurement (comparing control offsets across two days at 390px) revealed they never applied on the phone — and were silently mis-applying on desktop.

**Suggested improvement:** When inserting into a large stylesheet, first print the nearest preceding @media line (grep -n '@media' | awk range) to confirm the enclosing block; and verify layout CSS changes by measuring rendered geometry in a real browser (the repo's e2e geometry suite), never by grepping dist for the rule's presence — presence proves shipping, not applying.

**Principle:** In any large file with long-range enclosing scopes (media queries, namespaces, conditional blocks), the lines adjacent to an insertion point tell you nothing about scope — resolve the enclosing construct explicitly before inserting, and verify behaviour where the scope condition is true.
