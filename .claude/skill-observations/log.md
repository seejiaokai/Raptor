# Skill Observation Log

Observations captured during task-oriented work.

**Status key:** OPEN = not yet actioned | ACTIONED (YYYY-MM-DD) = skill
updated/created | DECLINED (YYYY-MM-DD) = user decided not to pursue —
resolved statuses always carry their resolution date

---

## 2026-08-17

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

## 2026-09-06

### Observation 43: Design hook scans engine and test files where design rules cannot apply

**Status:** ACTIONED (2026-09-23) — `.impeccable/config.json` added with exactly the contents approved in D71, riding the `[ALL-AVAIL-WINDOW]` merge (the next change that touches code)
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

### Observation 120: Vendoring a whole app as a tab is a repeatable recipe — worth a skill

**Status:** OPEN — deferred by the owner (D73, 2026-09-23): write the "whole app as a new tab" guide only if a third app is brought in as a tab
**Date:** 2026-09-07
**Session context:** Merging the standalone OCU Progress Tracker (seejiaokai/Tracker) into Raptor as a new tab — the second time this repo has vendored a whole React app (Leave War, 16 Aug 26), and the steps were the same both times.
**Skill:** New skill candidate: vendor-app-as-tab
**Type:** open-source
**Phase/Area:** whole workflow

**Issue:** Both merges followed one unwritten sequence, re-derived from the first merge's comments each time: (1) intersect the two apps' element IDs and CLASS names before touching anything (this merge found 2 id collisions and 5 bare-class collisions — `.day`, `.modal`, `.sub` … — the class ones only surfaced when the vendored browser suite ran inside the host); (2) wrap the vendored stylesheet in the host's page-section selector with native CSS nesting, converting `:root`/`body`/`#root` rules to `&` and moving body-appended elements' rules OUTSIDE the wrapper; (3) replace the vendored app's storage/sync layers with one small doorway module of the same async shape; (4) put the host→guest role flag in a no-import module so the host can set it without loading the guest bundle (the first cut pulled ~280 KB into the host's first download via a store import); (5) keep the guest mounted after first visit when its render is imperative/once-only, and gate its document-level listeners on an `active` prop; (6) adapt the guest's browser suite by replacing every `goto`/`reload` with ONE "open via host login + tab" helper; (7) enforce the host's roles at the guest's write paths AND its affordances, and pin the pair with a test.

**Suggested improvement:** Write a `vendor-app-as-tab` skill whose core is that ordered checklist plus the two audits as runnable one-liners (id intersection; class intersection restricted to bare-class rules in the host stylesheet). Include the "measure the guest's column height off the section's own top edge, not a hard-coded bar height" note and the "lazy chunk regression guard" test pattern.

**Principle:** A second occurrence of a multi-hour integration is the moment to capture it as a skill; the two collision audits are the part nobody remembers and the browser suite is the only thing that catches what they miss.

### Observation 122: "Keep it mounted" is not enough when the HOST unmounts everything — a once-only imperative init needs a remount redraw

**Status:** OPEN — deferred by the owner (D73, 2026-09-23): write the "whole app as a new tab" guide only if a third app is brought in as a tab
**Date:** 2026-09-07
**Session context:** Bug sweep after vendoring the OCU Tracker into Raptor as a tab. The tab was kept mounted across tab switches because its flow board is drawn imperatively by a once-only init — but Raptor's logout swaps the WHOLE shell for the login screen, so the next login remounted the tab with an empty board and the guarded init drew nothing. Found only by a scenario that crossed a session boundary; every tab-switch test passed.
**Skill:** New skill candidate: vendor-app-as-tab (extends observation 120)
**Type:** open-source
**Phase/Area:** integration checklist — lifecycle

**Issue:** The "keep the guest mounted so its once-only render survives" rule (obs 120, step 5) has a hole: any host lifecycle that unmounts ABOVE the guest (logout, a route change, an error boundary reset) brings the guest back with fresh DOM and a guard that refuses to re-run. Tab-switch tests cannot see it.

**Suggested improvement:** Add to the vendor-app-as-tab checklist: "for every once-only init in the guest, make the mount effect 'boot if not ready, else REDRAW' — and test mount → unmount → mount explicitly, plus the host's session boundary (logout/login) in the browser sweep." The bug sweep's scenario list (session boundary, in-between widths, live resize, host overlays over the guest, host notify while the guest is up) is the reusable part.

**Principle:** A guard against double-initialisation is also a guard against re-initialisation; wherever a host can recreate the guest's DOM, the guest needs a redraw path that is not the init path — and the test that proves it must cross the host's own lifecycle boundaries, not just the guest's.

### Observation 191: A new floating surface needs a browser test that proves it paints ON TOP

**Status:** OPEN
**Date:** 2026-09-23
**Session context:** [ALL-AVAIL-WINDOW] build + a repo-privacy check, Raptor
**Skill:** raptor-port/docs/bug-check-order.md (§6 roll-call, column 3 'what else is painted on the same pixels')
**Type:** open-source
**Phase/Area:** see Skill

**Issue:** A new movable window shipped with z-index 150 while the full-screen board it must float over is 400, so on the board it opened invisibly. 5,727 jsdom tests and the builder's own reading passed it; jsdom has no stacking. Fable's scenario design (§4 rank 1) found it by reading two CSS rules side by side.

**Suggested improvement:** Add to §6: for any NEW overlay/floating surface, the roll-call's third column must name every full-screen or fixed surface it can open over, and a browser test must assert `document.elementFromPoint` at the surface's centre returns the surface itself, on each of them.

**Principle:** Layering is a missing-line defect that only a real browser can see; a new floating surface earns an elementFromPoint assertion over every surface it can open on top of.

### Observation 192: A privacy sweep keyed on the owner's literal terms missed a synonym

**Status:** OPEN
**Date:** 2026-09-23
**Session context:** [ALL-AVAIL-WINDOW] build + a repo-privacy check, Raptor
**Skill:** New skill candidate: identifying-information sweep (or a section in session-handoff / bug-check-order)
**Type:** open-source
**Phase/Area:** see Skill

**Issue:** The owner asked for a unit designation and a service name removed 'everywhere'. The sweep grepped exactly those strings and reported clean; an aircraft variant that identifies the same country just as well survived in ~12 files and was only found by chance while reading a guide. The same sweep missed a binary (.pptx) in history.

**Suggested improvement:** When removing identifying information, first enumerate what IDENTIFIES (unit, service, country, variant designations, place names, document citations) with the owner, then sweep for each, and list what kinds of file the sweep cannot read (binaries, history).

**Principle:** Sweep for what identifies, not for the strings named — and state which file kinds the sweep could not see.

### Observation 193: A clean result must state its scope, or it reads wider than it was

**Status:** OPEN
**Date:** 2026-09-23
**Session context:** [ALL-AVAIL-WINDOW] build + a repo-privacy check, Raptor
**Skill:** Cross-cutting principle candidate (reporting checks)
**Type:** open-source
**Phase/Area:** see Skill

**Issue:** Two clean verdicts this session were narrower than their wording: 'no restricted material was ever uploaded' (checked markings and demo data, never opened a 222-event syllabus) and 'removed everywhere' (a text sweep; a binary deck kept the term). Both were corrected, but only after a later finding.

**Suggested improvement:** When reporting any check as clean, say in the same sentence what it looked at and what it did not.

**Principle:** A clean verdict is only as wide as what was examined — say the examined scope in the verdict itself.

### Observation 194: The handoff skill names a file the owner does not use as his entry point

**Status:** OPEN
**Date:** 2026-09-23
**Session context:** [ALL-AVAIL-WINDOW] build + a repo-privacy check, Raptor
**Skill:** session-handoff (Step 1 and the template's file path)
**Type:** open-source
**Phase/Area:** see Skill

**Issue:** The skill writes raptor-port/docs/session-state.md, but the owner opens every session with 'Read HANDOFF-NEXT.md first'. The previous session wrote a current HANDOFF-NEXT.md and left session-state.md describing merged work — the exact stale-leftover the skill warns about. This session kept the full handoff in HANDOFF-NEXT.md and reduced session-state.md to a pointer.

**Suggested improvement:** Make HANDOFF-NEXT.md the skill's primary output (the owner's entry point) and session-state.md a short pointer that exists only while something is unfinished — or retire it and update CLAUDE.md's promise.

**Principle:** A handoff file is only useful if it is the one the next reader is actually pointed at; match the owner's entry point, not the skill's historical path.

### Observation 195: A test failing on another test's leftovers can be the product bug, not the test's

**Status:** OPEN
**Date:** 2026-09-23
**Session context:** [ALL-AVAIL-WINDOW] bug check — a new unit test failed because the window's footer still carried the previous test's sentence.
**Skill:** systematic-debugging
**Type:** open-source
**Phase/Area:** Phase 1 (root cause) — test-isolation failures

**Issue:** The reflex for a test that fails on state left by an earlier test is to add cleanup to the test. Here the leftover was a real defect — a UI component that is never unmounted kept per-window state in a ref, so the next window a user opened showed the last one's text. The fix was in the product (reset the state where every open/close already passes), and cleanup would have hidden it.

**Suggested improvement:** In Phase 1, add: "When a test fails on state left by a previous test, first ask whether a USER could hit the same carry-over (reopen, navigate, re-login). If yes, it is a product finding — reproduce it as its own test; do not add test cleanup."

**Principle:** Test leakage is evidence about state lifetime; before isolating the test, check whether the product has the same leak.

### Observation 196: Owner wants in-flight notes condensed at the end, as their own commit

**Status:** OPEN
**Date:** 2026-09-23
**Session context:** Long autonomous overnight session; owner warned about context at ~47% and ruled D68 (read fully) and D69 (condense the saved context at the end).
**Skill:** session-handoff
**Type:** internal
**Phase/Area:** Closing a long session — what happens to progress notes written for compaction safety

**Issue:** Writing state into the repo at every clean point keeps a long session compaction-safe, but it leaves a trail of progress notes. The owner asked (D69) that at the end they be summarised down to what the next session needs, in a separate docs-only commit — not left to bloat the repo, and not trimmed inside a fix (D29).

**Suggested improvement:** Add a closing step: "Condense the notes THIS session wrote (progress blocks, working notes) to state + decisions + pointers, as its own docs-only commit, before the handoff is final."

**Principle:** Scaffolding written for resilience has a lifetime; the handoff procedure should end it deliberately.

### Observation 197: A handoff's "reply with" card gets pasted back with the choice still unfilled

**Status:** OPEN
**Date:** 2026-09-23
**Session context:** Merging a finished feature branch; the previous session's closing report gave the owner a ready-to-paste reply containing an inline choice
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** closing report / ready-to-paste opening prompt

**Issue:** The closing report handed the owner a paste-ready reply with an inline choice written as a template slot (`Phone resize: <build a corner handle / leave it>`). He pasted it verbatim with the slot unfilled, together with "merge live" — and then asked "should I merge live?". The next session could not act: one half of the message authorised an irreversible step, while the other half still carried a choice that had to be made before that step. It had to stop and ask, and his answer was again free text.

**Suggested improvement:** In the handoff skill's closing-report guidance: never embed a choice inside a paste-ready prompt as a `<a / b>` slot. Put each open choice to the user as its own numbered question (or a structured question tool, where one exists) BEFORE the paste-ready prompt, and give one complete prompt per option — or leave the choice out of the prompt and have the next session ask it first.

**Principle:** A paste-ready prompt is only paste-ready if it can be sent unchanged. A template slot inside it for a non-technical user will be sent unfilled, and an irreversible instruction sitting beside it then becomes ambiguous.
