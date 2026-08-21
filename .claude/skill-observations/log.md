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

