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

### Observation 35: State-dependent positioning flips must be verified at multiple scroll offsets

**Status:** OPEN
**Date:** 2026-08-26
**Session context:** Bug pass over the roster hide/show slide fix (Raptor edit scheduler)
**Skill:** impeccable
**Type:** open-source
**Phase/Area:** verification / live-view pass

**Issue:** A fix replacing position:fixed with position:absolute for a collapse
animation was verified live only at scroll position 0, where it behaved
perfectly. The element's resting state was position:sticky, so at any real
scroll depth the flip to absolute teleported it ~900px off-screen — the exact
bug family the fix was shipped to cure. Found next session in a dedicated bug
pass.

**Suggested improvement:** When a live verification involves an element whose
CSS position scheme changes on a state toggle (sticky/fixed/absolute/static),
the verification matrix must include at least one deep-scroll state, not only
the page-top state.

**Principle:** A positioning-scheme flip has different geometry at every scroll
offset; verifying it at one offset proves only that offset. Sticky elements
especially: their visual position and static position diverge exactly and only
when scrolled.

### Observation 36: A dedicated adversarial review pass over recently-merged work pays for itself

**Status:** OPEN
**Date:** 2026-08-26
**Session context:** Owner-requested bug pass over the last ten implementations (Raptor)
**Skill:** New skill candidate: post-batch adversarial review
**Type:** open-source
**Phase/Area:** verification / process

**Issue:** Ten implementations had each shipped with green gates (3k+ unit
tests, reference parity, browser geometry suite) and per-change live
verification. A dedicated adversarial pass — two parallel reviewer agents
prompted to refute, walking the project's named gotcha families over the
diffs — still surfaced six confirmed bugs (two silent state-machine
lifecycle bugs, one stale-cache jump, one identity-destroying UI round-trip,
one unescaped sink, one settings-clobber) plus a scroll-state bug found by
re-verifying an already-"verified" fix under a state the original pass never
exercised.

**Suggested improvement:** After a batch of features lands, run a separate
review pass with fresh eyes (subagents prompted adversarially, given the
project's gotcha families and told to produce concrete failure scenarios,
verified first-hand before fixing). Gate greenness is necessary, never
sufficient: tests pin what was imagined at build time; the adversarial pass
hunts what was not.

**Principle:** The tests a feature ships with encode its author's model of
the failure space; a reviewer instructed to refute, working from the diff
plus the system's known drift seams, samples outside that model — which is
exactly where the surviving bugs live.

### Observation 37: Store the decision, derive the amount — a pattern for user-acknowledged derived credit

**Status:** OPEN
**Date:** 2026-08-28
**Session context:** RAPTOR OIL crediting rework (FS/HS→FO/HO, uniform hours rule, input ask-flow)
**Skill:** New skill candidate: none — cross-cutting principle
**Type:** open-source
**Phase/Area:** feature design (Phase C/D split)

**Issue:** The owner's spec said "store whether the input deserves HO or FO". Storing the AMOUNT would have gone stale on every time edit and forked from the pooled-hours credit. The design that held: store only the user's per-day yes/no (with the shown amount as a staleness fingerprint), and always DERIVE the credited amount live from current data at credit time, re-checking applicability (coverage + non-working) live too — so moved inputs and revoked holidays self-heal with zero invalidation code.

**Suggested improvement:** When a spec asks to persist a user-approved value computed from mutable data, persist the APPROVAL (plus a fingerprint of what was shown, to know when to re-ask) and re-derive the value at read time. Pair it with derived, self-healing pending-predicates (scan-based, like this repo's bugAlert) instead of stored notification flags.

**Principle:** Consent is data; amounts are derivations. Store what only the user can produce, derive everything else at read time, and staleness handling collapses into one re-ask check.

### Observation 38: An owner reversal is cheapest when the change was display-only

**Status:** OPEN
**Date:** 2026-08-30
**Session context:** RAPTOR — owner reversed the previous day's "4-digit times everywhere" ask back to "08:00 everywhere" after realising they had misread the app's dominant format.
**Skill:** New skill candidate: none — CLAUDE.md conventions
**Type:** open-source
**Phase/Area:** Change design / decision records

**Issue:** The 4-digit change had been built as a display-only wrapper (storage and parsers untouched) because the storage format was parity-pinned. When the owner reversed the decision a day later, the reversal was a handful of formatter swaps instead of a data migration — the display-only discipline is what made the U-turn cheap.

**Suggested improvement:** When recording a format/presentation decision in a project's CLAUDE.md, also record WHERE the decision is implemented (display layer vs storage) so a future reversal knows its blast radius immediately.

**Principle:** Implement owner-taste decisions at the shallowest layer that satisfies them; taste reverses more often than data contracts, and a shallow implementation makes reversal a diff, not a migration.

<!-- checkpoint (2026-08-30, session 2e630780, 6th todo completion): no new observations — the hh:mm reversal pass surfaced nothing beyond Observation 38. -->

### Observation 39: A display-only change opens a phantom-edit seam at every shown-vs-stored comparison

**Status:** OPEN
**Date:** 2026-08-30
**Session context:** Owner asked for an adversarial bug-hunt on the just-shipped "every time reads 08:00" change (a display fold: stored compact `0900` now renders `09:00`). The hunt found one real regression.
**Skill:** General engineering practice (surfaced during a task-observer session; no single skill owns it)
**Type:** open-source
**Phase/Area:** Verifying a presentation-layer change

**Issue:** Introducing a display transform (fold `0900`→`09:00` at render, storage unchanged) was reasoned to be safe because "the engine reads through a format-agnostic parser." True for reads — but a separate hazard was missed: any code that detects a change by comparing WHAT IS SHOWN against WHAT IS STORED now sees a false positive on legacy data. A day-step handler committed a still-focused box by comparing the field's folded display (`09:00`) to the raw model (`0900`); they differ only in format, so an untouched box synthesised a no-op write and logged a phantom edit-history row. The commit-level compare had no fold guard; only the higher amendment layer happened to reconcile by parsed value. Separately, the pinning test asserted `ELOG.length` where `ELOG` is `{rows,cap}` — `undefined===undefined` passed vacuously in the runner and was caught only by the typecheck gate.

**Suggested improvement:** When a change adds or alters a display transform, explicitly enumerate every site that compares a displayed value to a stored one (change-detection, dirty flags, "did the user edit this", amendment/history diffing) and fold BOTH sides — or compare by parsed value. Treat "reads are safe through the parser" as answering only half the question; writes-back are the other half. And run the typecheck/build gate even for test-only additions — a vacuous assertion on a mistyped shape passes the test runner but fails the compiler.

**Principle:** A presentation transform is not side-effect-free: it silently desynchronises every equality check that mixes the shown form with the stored form. Audit the write-back and change-detection paths, not just the read paths, whenever display formatting changes.

### Observation 40: Geometry pins must assert meaning, not metric-tuned pixel tolerances

**Status:** OPEN
**Date:** 2026-09-01
**Session context:** Loading the self-hosted design fonts (PR #344)
**Skill:** Raptor gate doctrine (e2e geometry pins)
**Type:** open-source
**Phase/Area:** e2e/geometry.spec.ts

**Issue:** A phone-width pin asserted "the brief cell shares row 1 with the
callsign" as |topA − topB| < 12px. The tolerance was silently calibrated to
SYSTEM-font metrics; the moment the real design fonts loaded, a stacked
hint's line-height moved the delta to 13px and the pin failed with the
layout fully correct.

**Suggested improvement:** When a geometry pin exists to distinguish layout
STATES (same row vs a strip below), assert the distinguishing predicate —
vertical-span overlap, grid-row membership, ordering — never a pixel delta
whose safe margin depends on current font metrics. Reserve pixel tolerances
for pins about actual distances.

**Principle:** A test tolerance that happens to pass under today's rendering
encodes today's rendering as a hidden dependency; pin the invariant that
MEANS the requirement, and the test survives legitimate visual change.

### Observation 41: Profile show/hide cost by phase — layout caches beat keep-alive alone

**Status:** OPEN
**Date:** 2026-09-01
**Session context:** Leave War tab slow-to-open fix (keep the ~28k-node grid mounted between tab visits)
**Skill:** New skill candidate: frontend-perf-diagnosis (or a cross-cutting principle)
**Type:** open-source
**Phase/Area:** choosing the mechanism for a "keep it alive" performance fix

**Issue:** The stored diagnosis framed the fix as "keep the built DOM mounted
vs memoise the computation", and the first build did exactly that (mount kept,
hidden via display:none, plus a React memo firewall) — yet the desktop return
barely improved (1.6s → 1.5s). A 10-line phase experiment then showed the
dominant cost was neither React build nor reconciliation but RELAYOUT on
re-show: display:none discards the subtree's layout, and re-showing re-laid
the giant table out (411–863ms); `content-visibility:hidden` preserves the
layout cache and re-showed in 1–2ms. The memo mattered too, but for a
different bill (hidden re-renders on every unrelated store tick).

**Suggested improvement:** When a perf fix hides/shows a heavy subtree,
measure the three phases separately BEFORE picking a mechanism: (1) build
(framework render), (2) layout on re-show, (3) paint — a trivial
`style.display` / `style.contentVisibility` toggle timed around a forced
`offsetHeight` read isolates (2) in minutes. Prefer `content-visibility:
hidden` (with an `@supports` fallback to display:none) as the hiding
primitive for kept-alive subtrees, and a props-less memo boundary at the
mount seam to stop unrelated parent renders.

**Principle:** "Keep it mounted" only removes the build phase; the re-show
relayout can dwarf it. Hiding primitives differ in WHICH caches they
preserve — pick by measured phase, not by the first mechanism that matches
the feature's name.

### Observation 42: The background-cwd trap bit again despite bold docs — needs structural enforcement

**Status:** OPEN
**Date:** 2026-09-01
**Session context:** Leave War keep-alive fix; launching `npm run test:e2e` as a background task
**Skill:** repo working rules (raptor-port/CLAUDE.md §Build & verify) / harness usage
**Type:** internal
**Phase/Area:** running gates in the background

**Issue:** CLAUDE.md carries a bold, blockquoted warning (added after this
bit twice on 30 Aug 26) that background commands start at the REPO ROOT and
must be prefixed with `cd /home/user/Raptor/raptor-port &&`. It still bit a
third time this session: a backgrounded `npm run test:e2e` died instantly
(exit 144), and only an explicit post-launch check (`/proc/<pid>/cwd`)
confirmed the retry was in the right place. A rule that keeps failing in the
same way is a structural-enforcement candidate, not a louder-docs candidate.

**Suggested improvement:** Enforce structurally instead of textually — e.g. a
root-level `package.json` whose scripts just `cd raptor-port && npm run …`
(making the bare command work from anywhere), or a hook that rejects
backgrounded `npm` commands lacking the cd prefix. Either removes the
failure mode instead of documenting it.

**Principle:** When the same documented rule is violated repeatedly, stop
strengthening the wording and change the environment so the wrong command
cannot fail silently — make the bare form work, or make it refuse loudly.

### Observation 43: Design hook scans engine and test files where design rules cannot apply

**Status:** OPEN
**Date:** 2026-09-01
**Session context:** Bug hunt #3 (reorder/drag machinery) — edits to src/engine/reorder.ts and two test files
**Skill:** impeccable (hooks)
**Type:** open-source
**Phase/Area:** hooks — file filtering

**Issue:** The impeccable design-detector hook fired on every edit to
`src/engine/reorder.ts` (a pure TypeScript engine file) and `*.test.tsx`
files, each time reporting "no deterministic design-quality issues found",
then suppressed itself after 6 edits on the engine file and suggested
`/impeccable audit` — on a file with no UI in it. Pure noise: no design rule
can apply to an engine module or a test file.

**Suggested improvement:** The hook's default file filter should exclude
`*.test.*` and paths matching engine/data layers (or include only files that
emit markup/styles — `.css`, `.tsx` components, html-emitting `.ts`). The
skill's `hooks ignore-file` verb exists; the improvement is shipping sensible
default exclusions so users don't need to discover it.

**Principle:** A hook that watches file edits should scope itself to files
its rules can possibly apply to; firing "no issues" on out-of-scope files
trains the reader to ignore it on in-scope ones.

### Observation 44: Piping a test runner through tail masks its exit code

**Status:** OPEN
**Date:** 2026-09-01
**Session context:** Bug hunt #4 — full e2e run reported exit 0 while 2 specs failed
**Skill:** New skill candidate: none — cross-cutting principle
**Type:** open-source
**Phase/Area:** gate-running / shell habits

**Issue:** `npm run test:e2e 2>&1 | tail -8` exits with tail's status (0), so
a run with 2 failed specs surfaced as "completed (exit code 0)" in the
background-task notification. The failure was only caught because the tail
happened to include the "2 failed" line — read minutes later. The same
pattern repeated on the next run (`| grep` also masked it).

**Suggested improvement:** When running a gate whose EXIT CODE is the
verdict, never pipe it: run bare and read the output file afterwards, or use
`set -o pipefail` in the same command. For background runs, redirect to the
output file without a pipe (`cmd > out 2>&1`) — the harness captures output
anyway.

**Principle:** A pipeline's exit status is its last command's; any gate
command piped through a formatter reports the formatter's success, not the
gate's. Keep verdict-bearing commands unpiped.

### Observation 45: Owner reversed auto-merge — accumulate on the branch, merge only on "merge live"

**Status:** OPEN
**Date:** 2026-09-02
**Session context:** A label-only rename (Off day → PH) took ~40 min wall clock because the session ran the full merge → Pages → live-verify chain; the owner asked "why is it taking so long" and then set a new rule: no automatic merge, stack changes with Vercel links, merge only on an explicit "merge live".
**Skill:** Project house rules (raptor-port/CLAUDE.md §Vercel / §Ship once per session) — updated in the same commit
**Type:** open-source
**Phase/Area:** delivery loop / when to go quiet

**Issue:** Two compounding misses. (1) The 24 Aug "auto-merge is default" rule made a trivial change pay the full CI + rollout cost before the owner heard anything. (2) The session went silent for the whole chain even though the fast feedback surface (the Vercel preview) was ready one minute after the push — the house rule already said to hand over the link the moment it is Ready, and the session waited for the slow chain to finish before replying at all.

**Suggested improvement:** Treat the preview link as the reply-worthy event: push → reply with the link → keep going. Never block a user-visible reply on a multi-minute rollout when a faster verifiable surface exists. Recorded the new merge gate in CLAUDE.md.

**Principle:** When a delivery pipeline has a fast preview stage and a slow publish stage, the user-facing reply belongs at the fast stage; the slow stage is background work, and whether it runs at all is the owner's call, not a default.

### Observation 46: A plan-critique agent pays for itself on a multi-module feature

**Status:** OPEN
**Date:** 2026-09-02
**Session context:** Building the Leave War OIL tracker (engine + store + sheet + docs) from a plan written after three Explore-agent maps.
**Skill:** task-observer (planning discipline; applies to any plan-mode workflow)
**Type:** open-source
**Phase/Area:** Plan mode, Phase 2 (design review before implementation)

**Issue:** The first plan draft looked complete, but a single Plan-agent critique pass against the actual code found four real defects before a line was written: an import CYCLE the plan would have created (counters ↔ oiltracker), a second reader of the same rule that would have drifted (the bid-time balance warning vs the new OIL BAL), a missing date helper (no addMonths existed; end-of-month clamping had to be decided), and an id field that would have leaked on screen (viewer id vs callsign). Each would have surfaced late — as a vitest 'undefined' under a cycle, or as a visible bug.

**Suggested improvement:** For any plan touching three or more modules, run one critique agent with a checklist of exactly these questions: cycles in the proposed import graph, every existing reader of a rule the plan changes, helpers the plan assumes exist, and any id/handle the UI will print. Keep it to one pass; a second rarely finds more.

**Principle:** A plan is cheapest to fix before it is code; one adversarial read of the plan against the real code, with a fixed checklist, catches the class of defect that tests only reveal after the wiring is in.

### Observation 47: Iterating a static mockup with the owner before building a UI rewrite pays for itself

**Status:** OPEN
**Date:** 2026-09-02
**Session context:** Leave War OIL tracker — the first cut (a list sheet + per-person page) was rebuilt the same day as a full-screen grid after seven rounds of mockup feedback (year lanes, per-credit boxes, aligned digits, given-by, no select column), none of which had been in the original ask.
**Skill:** impeccable (critique) / brainstorming
**Type:** open-source
**Phase/Area:** Design before build — "show a picture first"

**Issue:** The owner asked for a screenshot before proceeding; a throwaway HTML mockup rendered with the app's own palette let seven layout decisions be settled in ~30 minutes of back-and-forth, at zero code cost. Running the impeccable critique on the MOCKUP (not the built page) surfaced three P0/P1 layout faults the owner then chose fixes for. Had the grid been built first, each round would have cost a component rewrite plus test churn.

**Suggested improvement:** For any UI whose SHAPE is unsettled, make the mockup loop explicit in the plan: (1) static HTML in the app's tokens, desktop + phone renders; (2) owner feedback rounds on the picture; (3) a critique pass on the final mockup with the owner picking among the fixes; (4) only then the plan and build. Record the accepted mockup as the build's contract.

**Principle:** A picture the client can react to is the cheapest prototype; iterate the picture until it stops changing, then build once.

### Observation 48: A pointer-drag handler without a press guard turns hover into a drag

**Status:** OPEN
**Date:** 2026-09-02
**Session context:** Leave War — owner reported the grid snapping back to January whenever a cell's sheet opened in a later month.
**Skill:** impeccable (craft-floor / harden), and the Leave War bug-hunt habit
**Type:** open-source
**Phase/Area:** pointer gesture handlers

**Issue:** The sheet scrim's sideways-pan handler listened to `pointermove` and committed to an axis from the last `pointerdown` origin — but a mouse fires `pointermove` on a bare hover, so the first motion after the sheet opened (origin still 0,0) was forwarded as `scrollLeft = 0 − clientX` and the grid jumped to the start. It had passed every test because the tests always fired a `pointerdown` first, and every live pass clicked without moving the mouse afterwards. Found by instrumenting the scroller's `scrollLeft` setter with a stack trace, not by reading the code.

**Suggested improvement:** Add to the harden checklist: every `pointermove` handler must gate on a tracked press (set on down, cleared on up/cancel, and for a mouse also cleared when `buttons === 0`), and its tests must include a move with NO preceding down. In live passes, move the mouse after every click — a Playwright click leaves the pointer parked.

**Principle:** Hover is a move. A gesture that reads motion without proving a press will fire on a mouse that is only passing by, and the test suite that never sends a bare move will never see it.


### Observation 49: A hidden-by-default filter is a test-suite-wide sweep, and a sticky offset is a measurement, not a constant

**Status:** OPEN
**Date:** 2026-09-02
**Session context:** OIL tracker third cut — the ARCHIVE column hides used-up credits by default; a vertical word in the header.
**Skill:** impeccable (craft-floor / live pass)
**Type:** open-source
**Phase/Area:** verification

**Issue:** Two small things the unit suite could not see. (1) Making dead credits hidden by default silently invalidated every existing test that asserted a used-up box was PRESENT (four of them across two describe blocks) — each had to learn to open the archive first. (2) The header rows were sized 22 + 28 px and the group rows' sticky offset was written as the constant 50; a rotated word in a new header cell grew the header to 57 px and the sticky rows overlapped it by 7 px. Only the live drive (measuring thead height against the group row's top) caught it.

**Suggested improvement:** In the live-pass checklist: whenever a change adds a default-hidden state, grep the tests for presence assertions on the now-hidden thing before running them; and whenever a sticky offset is a literal, measure the element it is supposed to match in the same pass (assert header height === offset).

**Principle:** A default that hides something rewrites what every existing "it is there" test means; and a sticky offset copied from a sibling's height is a measurement that drifts the moment the sibling's content changes — pin both with a measurement, not a constant.

### Observation 50: Text selection on a touch-first app is a global baseline, not a per-element cleanup

**Status:** OPEN
**Date:** 2026-09-02
**Session context:** Owner reported (with a screenshot of a nav tab caret, and the recurring "the grid selects as blue text when I try to scroll on my phone") that click-only chrome should never be selectable as text; editable fields should.
**Skill:** impeccable
**Type:** open-source
**Phase/Area:** craft-floor / Operate (touch-first app UI)

**Issue:** The codebase had accumulated ~20 scattered per-element `user-select:none` declarations (grips, chips, some tabs, day buttons, drag bodies) added reactively over months, yet the user kept hitting NEW uncovered surfaces — the top nav tabs and the data grid both still painted a blue text range on a tap-hold. Chasing each element is whack-a-mole and never converges. The robust fix was one baseline: `html{user-select:none;-webkit-touch-callout:none}` with `input,textarea,select,[contenteditable]{user-select:text;-webkit-touch-callout:default}`. Before writing it I had to verify the app's editable text wasn't only `<input>` — this one edits via 662 `contenteditable` spans and even sets a selection range programmatically, which the `[contenteditable]` opt-in preserves. A naive "opt-in inputs only" baseline would have silently broken all in-place text editing.

**Suggested improvement:** In the Operate/craft-floor guidance, add a reflex: for a touch-first or app-shell (non-document) UI, default `user-select:none` at the root and opt text selection back IN only for genuinely editable/copyable surfaces — do not add `user-select:none` per element. And before flipping the baseline, enumerate every editable surface (inputs, textareas, selects, AND contenteditable — grep for `contenteditable`/`getSelection`/`execCommand`), because a document-style editor hidden behind an app shell breaks invisibly if the opt-in misses it.

**Principle:** A behavior that should hold for "everything except a named few" belongs at the root as a default plus explicit opt-ins, not as a growing list of per-element rules — the per-element approach never converges and each gap ships as a fresh annoyance. When inverting such a default, first enumerate the exceptions from the code (grep the actual mechanism), because the ones you can't see on screen are the ones that break silently.

### Observation 51: A "survives a reload" live check must first confirm the app boots on a persistent backend

**Status:** OPEN
**Date:** 2026-09-04
**Session context:** Leave War bug hunt #4 — verifying a store-level fix (saved qualification groups pruned at boot) in the live browser
**Skill:** New skill candidate: live-verification pass (project)
**Type:** open-source
**Phase/Area:** Live verification design

**Issue:** A unit-tested storage fix was "verified" live by adding a group, reloading, and looking for it — it was gone, which looked like the fix had failed. The live app deliberately boots that store on a MEMORY backend (nothing survives a reload by design), so the check could never pass and cost two extra live rounds and a debug trace before the boot file explained it.

**Suggested improvement:** Before designing any live persistence/reload check, read the app's boot wiring for which backend the store is mounted on; if it is memory-only, verify the fix at the unit level and say so in the report instead of a live reload.

**Principle:** A live verification step is only as meaningful as the environment's ability to exhibit the behaviour — confirm the precondition (here: persistence exists) before treating a failed check as a failed fix.

### Observation 52: Instrument the invariant, not the reproduction, when a flake will not reproduce

**Status:** OPEN
**Date:** 2026-09-02
**Session context:** Fixing a Leave War drag-select e2e that failed 4/8 on the owner's machine but passed 20/20 here; the handoff listed two timing suspects.
**Skill:** systematic-debugging
**Type:** open-source
**Phase/Area:** Reproduction / root-cause phase for timing-dependent (flaky) failures

**Issue:** The flake did not reproduce locally (0/20), which would normally stall a "reproduce first" workflow. Instead of chasing reproduction, a replay script recorded the *invariants the assertion depends on* during the gesture — every scroll event on the container and the page, what `elementFromPoint` returned at the release point, and how many cells were painted. Even on passing runs those showed the mechanism plainly (the page scrolled 18px/frame under a purely horizontal drag; 36–39 cells painted for a 3-cell drag; a heading under the release point), which pinned the root cause in one run and ruled out the other suspect.

**Suggested improvement:** In the reproduction phase, add a rule: when a timing-dependent failure will not reproduce, do not keep re-running it — instrument the passing path (log the state the assertion depends on at each step: what moved, what was under the pointer, what was painted) and read the mechanism off a passing run. A passing run that shows the wrong intermediate state is as good as a failure.

**Principle:** A flake is a race between a mechanism and an assertion; the mechanism is present on every run, only the assertion outcome varies. Observe the mechanism directly rather than waiting for the outcome to vary.

### Observation 53: Fan-out research before a cross-cutting feature turned a 3-file guess into a 20-touch map

**Status:** OPEN
**Date:** 2026-09-03
**Session context:** Adding a new leave type (CL) plus a weekend/PH counting rule across two vendored apps in one repo
**Skill:** dispatching-parallel-agents
**Type:** open-source
**Phase/Area:** Before building — scoping a feature that "affects everywhere leave is concerned"

**Issue:** The owner's ask named three surfaces (counters, legend, rules engine). Three parallel read-only Explore agents — one per app plus one for the docs — came back with the real touch list (~20 places: derived tables that needed nothing, hand-written lists that needed edits, tests pinning exact lists, a silent-drop seam in the sync bridge, and the one pure predicate to extract). Building from the three-surface guess would have shipped a type that synced across and vanished silently on the far side.

**Suggested improvement:** In dispatching-parallel-agents, add a pattern: for a feature the user describes as "everywhere X is concerned", split research by BOUNDARY (each vendored app / package, plus the docs) rather than by topic, and ask each agent to classify every hit as "derives automatically", "hand-written — must edit", or "test pins exact list". The classification is what turns the report into a checklist.

**Principle:** When an ask says "everywhere", the deliverable of research is a classified touch list (auto / manual / pinned), split along the code's own boundaries, gathered in parallel before the first edit.

### Observation 54: Tracing categories that inflate the numbers they attribute

**Status:** OPEN
**Date:** 2026-09-03
**Session context:** Measuring the Leave War grid's first-open cost (CPU profile + devtools timeline trace at 1x/4x/8x) before choosing a fix
**Skill:** New skill candidate: browser-perf-measurement (or the HANDOFF perf recipe)
**Type:** open-source
**Phase/Area:** Attribution pass (which JS caller forced a layout / style recalc)

**Issue:** Enabling `disabled-by-default-devtools.timeline.invalidationTracking` (+ `.stack`) to get caller stacks on Layout/UpdateLayoutTree events made the one big style recalc read 2545ms where the plain-categories trace of the same open read ~324ms total style time. The attribution (which function forced it) was correct; the duration was an artefact of the tracking itself. Trusting the instrumented duration would have pointed the fix at CSS selector cost, which a scan then showed was not there.

**Suggested improvement:** Two passes, never one: TIME with the plain `devtools.timeline` categories, ATTRIBUTE with the stack/invalidation categories, and only ever quote durations from the first. Same rule for the CPU profiler's sampling interval. Add to the perf recipe alongside "attribute by experiment, not by stack".

**Principle:** Instrumentation that explains a cost also changes it. Measure and attribute in separate runs, and quote numbers only from the run that measured.

### Observation 55: A perf diagnosis given in chat, before measuring, pointed at the wrong half

**Status:** OPEN
**Date:** 2026-09-03
**Session context:** Leave War grid speed — the previous session's chat answer split the wait into "download the chunk" vs "draw 25,000 cells, one unsplittable chunk" and recommended virtualisation; the measurement showed download ~0, cell-building ~a tenth, and half the time in post-draw self-measurement plus repeated React rebuilds
**Skill:** New skill candidate: browser-perf-measurement (pairs with observation 54)
**Type:** open-source
**Phase/Area:** Diagnosis before recommendation

**Issue:** A plausible mechanism ("25k cells is the cost") was offered as the diagnosis and the fix (virtualise) sized to it, with no measurement. The real split was different enough that the cheap fixes halved the wait and took the grid out of every tap entirely, before any virtualisation.

**Suggested improvement:** For any "why is X slow" question: refuse to name a cause before one profile + one phase-split trace exist; report the split as a table; only then rank fixes. Include the React-specific checks that were decisive here — (a) does a local UI state change re-render a large memo-less tree, (b) do mount-time measurements store state that re-renders it, (c) are DOM queries scoped to the smallest subtree.

**Principle:** A mechanism that could explain the symptom is a hypothesis, not a diagnosis; the recommendation follows the measurement, never the story.

### Observation 56: The after-measurement must cover every interaction, not the headline

**Status:** OPEN
**Date:** 2026-09-03
**Session context:** Leave War column window (Phase 2) — the first open dropped 5.7 s → 3.8 s at 4x, but the same script showed the month jump unchanged (2.8 → 2.7 s): the windowed design moved a full-grid rebuild from the open to every far jump
**Skill:** New skill candidate: browser-perf-measurement (with observations 54, 55)
**Type:** open-source
**Phase/Area:** After-measurement / reporting

**Issue:** A change that shrinks the headline cost can relocate it. Had the after-run measured only the first open, the jump regression-in-place would have been reported as a pure win and found by the owner on SIS instead.

**Suggested improvement:** The measuring script is a fixed list of interactions (open, tap, close, jump, return, scroll) run identically before and after; the report is the whole table, with any row that did not improve called out and explained. A perf change is not done until every row is understood.

**Principle:** Optimisation moves cost as often as it removes it; measure the same set of interactions before and after and report the ones that did not move.

### Observation 57: Split the cost before choosing the fix — the drop's engine half was not the expensive half

**Status:** OPEN
**Date:** 2026-09-04
**Session context:** Edit-week puck drop felt slow on the owner's laptop (~1.1 s). The instinct (and an earlier chat guess) was that the rules engine validating the move was the cost. A 4× CPU profile on an UNMINIFIED build, split by phase, was run before touching anything.
**Skill:** New skill candidate: browser-perf-measurement (extends Observations 54–56)
**Type:** open-source
**Phase/Area:** Diagnosis before a targeted optimisation

**Issue:** Of the ~0.6 s blocking task at 4×, the rules engine (both `validate` calls + the bar solver) was ~45 ms; the rest was redraw — the changed day being rebuilt as one ~1,500-element string, re-parsed, re-styled and laid out, plus the drop paying TWO forced style+layout passes at pointer-up before it measured anything. Naming the engine as the cause would have aimed a risky change at the one part that was both cheap and safety-critical, and left the real 90% (pure redraw) untouched. Measuring first put the whole fix on the redraw side and left every engine validation byte-for-byte unchanged (parity stayed 728/0).

**Suggested improvement:** For any "this interaction is slow" where a rules/validation step is a plausible suspect, profile and phase-split BEFORE proposing a fix, and quote the split as a table (engine vs parse vs style vs layout vs paint). The safety-critical half is usually the cheap half; proving that with a number is what lets the optimisation stay entirely on the redraw side and keep the correctness guarantee free.

**Principle:** The scary-looking half of an interaction (the one that could be wrong) and the expensive half (the one worth optimising) are rarely the same half — a phase-split measurement is what tells them apart, and it is the difference between a safe redraw-only change and a risky engine change that buys almost nothing.

### Observation 58: A rejected optimisation is a result worth writing down — record dead ends where the next session will look

**Status:** OPEN
**Date:** 2026-09-04
**Session context:** The drop round: after the two fixes that worked, two more plausible-sounding ideas were measured and both came out worse — seven CSS paint-isolation variants on the week (contain, isolation, will-change, own-layer, etc.) all measured equal or worse than no change, and a "quiet path" rewrite of the highlight pass measured ~2× slower than the loop it replaced and was reverted.
**Skill:** New skill candidate: browser-perf-measurement / a "record negative results" discipline (home: HANDOFF perf recipe + the code comment at the reverted site)
**Type:** open-source
**Phase/Area:** After-measurement / handoff

**Issue:** Both dead ends are the kind of idea that looks obviously-worth-trying from the code and will occur to the next person (and to a future me) unprompted. Without a durable record — a comment at the reverted site AND a handoff line — the next session spends the same hour re-measuring them to the same negative conclusion. On an ephemeral container the log alone does not persist, so the record has to land somewhere that survives (a code comment at the site, and the repo handoff).

**Suggested improvement:** Treat a measured-and-rejected optimisation as a deliverable, not a discard: leave a one-line comment at the exact site the idea would touch ("tried X here, measured N vs M at 4×, reverted") and a handoff line, so the negative result is found by anyone who arrives at that code with the same idea. Name the variants tried, not just "we tried isolation" — the next person's idea is a specific one of them.

**Principle:** A negative measurement is as reusable as a positive one and costs the same to obtain; it only pays back if it is recorded where the next attempt will start — at the code site the idea targets, and in the durable handoff, not only in a session-scoped log.

### Observation 59: Hit-test before you take the drag ghost down — order the pointer-up teardown by what each step reads

**Status:** OPEN
**Date:** 2026-09-04
**Session context:** The drop round — pointer-up handler in the shared drag machine (`drag.ts`). It was removing the floating drag ghost and the body drag markers first, then hit-testing under the pointer and measuring the target seat.
**Skill:** New skill candidate: none — cross-cutting frontend pointer-machine principle (sibling of Observation 48)
**Type:** open-source
**Phase/Area:** pointer gesture teardown / drop handling

**Issue:** Removing the ghost and toggling the body's drag-state classes BEFORE the hit-test meant the browser had a dirtied style+layout tree when `elementsFromPoint` and the seat measurement ran, forcing an extra synchronous layout — two forced layouts at pointer-up where one would do. Reordering so the hit-test runs with the ghost still up (and skipping the ghost itself in the elementsFromPoint stack), then removing the ghost, then leaving the marker cleanup to the existing clear step, dropped ~55 ms of that at 4×. The DOM read has to happen before the DOM writes that would invalidate what it reads.

**Suggested improvement:** In a pointer-up / drop teardown, sequence by data dependency, not by tidy-up instinct: do every measurement the drop needs (hit-test under the point, target geometry) FIRST, against the still-settled layout, and only then perform the teardown writes (remove the ghost, clear the body markers). When the ghost overlaps the drop point, exclude it from the hit-test rather than removing it early. Read-then-write, batched — the same rule that avoids layout thrash in a render loop applies to a one-shot handler.

**Principle:** Interleaving DOM reads and writes forces a layout per read; a pointer-up handler that measures after it has begun tearing down pays for a layout it did not need. Order the handler so all reads precede all writes, even when the natural writing order (clean up first) reads the other way.

### Observation 67: Read a phone screen recording by its frame cadence — a decaying fling, a held finger, and a one-frame jump are three different signatures — and know which bug classes the desktop browser can never reproduce

**Status:** OPEN
**Date:** 2026-09-05
**Session context:** The owner's iPhone recording of the phone week carousel resting off its snap point ("the pages don't fit") on the #361 preview. No WebKit in the container. Numbered 67 on this branch (`claude/phone-snap-hold`); 60–66 are on three other open branches.
**Skill:** New skill candidate: none — cross-cutting evidence-reading principle for device-only bugs (sibling of Observations 60–61, which read a recording frame by frame for a scroll bug)
**Type:** open-source
**Phase/Area:** root-cause investigation without the device

**Issue:** The recording could not be played here, so it was decoded to 10 fps frames and each frame diffed against the previous one. That cadence separated three things a still frame cannot: a released fling (pixel change decaying smoothly over ~1 s, ending flush on a snap point — every fling in the clip did), a finger held down (zero change, then motion at constant speed — those "rests" were not bugs), and a one-frame jump (a programmatic write or a repaint — the 40 px vertical shift mid-rest, ~110 ms after the strip stopped). Only the last matched the code path that fires ~110 ms after scroll events stop (the palette's day-follow → notify → the week's B54 hold writing `scrollLeft` back to itself). Chromium then could not reproduce the resting-off-snap at all, and the reason is structural, not timing: Chromium re-snaps after a programmatic scroll (spec), iOS Safari does not — so a "write the current position back" is harmless on the desk and fatal on the phone.

**Suggested improvement:** For a device-only visual bug with a recording: decode at ≥10 fps, diff consecutive frames, and classify every motion run by its shape (decay / constant / single frame) before deciding what is a rest and what is a gesture; then match the single-frame events to timers in the code. Keep a short list of browser-engine asymmetries that make a class of bugs unreproducible here (WebKit: no re-snap after programmatic scroll, row reconciliation in tables, touch-fling momentum) so the investigation goes to the device gate with a hypothesis and a fix preview instead of a "cannot reproduce".

**Principle:** A recording's frame-to-frame cadence is evidence about what the code was doing; classify motion by its shape before trusting any single frame, and when the desktop engine cannot reproduce a device bug, look for an engine asymmetry rather than a timing one.
