# Skill Observation Log

Observations captured during task-oriented work.

**Status key:** OPEN = not yet actioned | ACTIONED (YYYY-MM-DD) = skill
updated/created | DECLINED (YYYY-MM-DD) = user decided not to pursue —
resolved statuses always carry their resolution date

---

## 2026-08-17

## 2026-09-06

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

## 2026-09-23 — [HUMAN-RETEST] the Tracker

### Observation 236: While the owner is answering a list, record each answer briefly and stay in the conversation

**Status:** OPEN
**Date:** 2026-09-24
**Session context:** The owner answered a numbered list of backlog questions in several messages; after "1-4 yes" the agent cut a new branch, rewrote the handoff and the backlog's priority list before replying, and he interrupted: "we havent answered all the questions, what are u doing".
**Skill:** New skill candidate: owner Q&A rounds (or `.claude/rules/record-decisions.md`)
**Type:** internal
**Phase/Area:** recording rulings mid-conversation

**Issue:** "Record a ruling the moment he says it" was carried out as the whole downstream job (new branch, homes in three documents, the handoff rewritten) between his first and second answers, so the conversation stalled and he could not tell what was happening.

**Suggested improvement:** When he is answering a list, record each answer as its rulings row plus its minimal home in one quick step, reply in one line ("recorded, next?"), and do the wider set-up (branch, handoff, backlog reshuffle) once the round ends — saying so.

**Principle:** Recording a decision at the moment it is made should be quick and quiet; the work the decision implies can wait for the end of the conversation it belongs to.

## 2026-09-24 — [HUMAN-RETEST] the amendment system

### Observation 237: A saved-world fixture built in the app's "fresh" mode saves nothing — the walk then runs on an empty world

**Status:** OPEN
**Date:** 2026-09-24
**Session context:** Building the amendment re-test's "everything week" through the app's own controls and saving it (Playwright storage state) so parallel walkers could each start from a copy. The builder opened the app with `?fresh=1`, which runs the memory-only backend; every publish worked on screen, but the captured storage was empty, and the first roll-call walk showed every day as DRAFT.
**Skill:** bug-check order §7.1/§7.7 (fixtures) — `raptor-port/scripts/handpass/lib.mjs` `open()`
**Type:** internal
**Phase/Area:** building and saving a walk fixture

**Issue:** `open({fresh:true})` is the right default for a throwaway walk and exactly wrong for a fixture that is SAVED and handed to other walkers — the app's fresh mode deliberately persists nothing. Nothing failed loudly; the saved file was 36 bytes. Caught only because the next walk read the heads.

**Suggested improvement:** In `lib.mjs`, make `open()` refuse (or warn) when a caller later calls `ctx.storageState` on a fresh-mode page; or have the fixture builders assert the saved file carries the week record (`raptor:weeks/<wk>`) before reporting success. Add one line to bug-check-order §7.7: "a fixture you will SAVE is built on the persisting backend — never `?fresh=1`".

**Principle:** A fixture step that can succeed on screen while saving nothing needs a check on the saved artefact itself, not on the screen.

### Observation 238: A walk script that picks a menu row by its visible text can tap a neighbour whose caption repeats that text

**Status:** OPEN
**Date:** 2026-09-24
**Session context:** Amendment re-test walk. The plans menu's LIVE row carries a caption naming the issued version ("Live working copy ● live now — differences from Original go out as AL1"), so a script matching the issued row by /Original/ tapped the live row instead; the preview never opened and the step looked like an app defect ("no read-only bar"). A second trap the same hour: the helper read the toast from a guessed selector and got an empty string.
**Skill:** bug-check order §7.2 (the scripted driver) — `raptor-port/scripts/handpass/lib.mjs` / `am-lib.mjs`
**Type:** open-source
**Phase/Area:** walk tooling — choosing a control

**Issue:** Visible-text selectors are ambiguous wherever a UI echoes one control's label inside another's caption or tooltip; the failure reads exactly like a missing door, which is the class the walk exists to find, so it costs a debugging detour or, worse, a false finding.

**Suggested improvement:** In the walk helpers, select a control by its action attribute (the data-* the click router reads) and use text only to choose AMONG those; add a sentence to bug-check order §7.2 ("the driver presses the control the app routes, never 'whatever says X'") beside the existing "a scripted gesture that fails is looked at on its picture before it is called a defect".

**Principle:** Drive a control by what the app routes on, not by what it says — a label can appear in more than one place, an action attribute cannot.
