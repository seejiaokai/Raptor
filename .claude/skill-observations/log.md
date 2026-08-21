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
