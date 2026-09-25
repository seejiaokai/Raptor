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

### Observation 239: A walk script that saves its pictures into the folder its report cites overwrites the failure evidence when it is re-run as the re-walk

**Status:** OPEN
**Date:** 2026-09-24
**Session context:** Amendment re-test, after the fixes. Every walker's script "prints PASS/FAIL per check, so re-running it IS the re-walk" — a good rule — but each script hard-codes its picture folder, the same folder its report's FAIL rows point at. Re-running them on the fixed build would have replaced every "before" picture with an "after" one under text describing the failure. Caught before running; worked round by committing the walk as it stood, then re-walking from a temporary copy of the scripts with the folder rewritten to `rewalk2/`.
**Skill:** bug-check order §7.2 / §8 (the scripted driver; the re-walk) — `raptor-port/scripts/handpass/lib.mjs` and the per-walker libs
**Type:** open-source
**Phase/Area:** walk tooling — evidence preservation across the re-walk

**Issue:** "Re-running the script is the re-walk" and "the report cites its pictures by name" are both standing practice; together they make the re-walk destroy the evidence it is meant to sit beside. Nothing warns: the files are simply overwritten.

**Suggested improvement:** In the shared walk lib, derive the picture folder from ONE env var with a run label (e.g. `HP_RUN=walk|rewalk`) and have every walker lib honour it instead of a hard-coded path; add a line to bug-check order §8: "commit the walk's pictures before the re-walk, and give the re-walk its own folder".

**Principle:** A re-run that proves the fix must never write over the record of the failure — give each run of a walk its own output place.

### Observation 240: A fix that went past its finding's named symptom overturned a documented design decision — and a reviewer then found the regression it caused

**Status:** OPEN
**Date:** 2026-09-24
**Session context:** Amendment re-test. A walker's finding named two things: after "Load onto working copy" an input stayed "removed" while its row was back, and its "→ Ground" button then did nothing silently. The host fixed the silent button (the house rule the walker cited) AND re-filed the input on every day replacement. The second half contradicted a design decision written in a code comment elsewhere ("a load replaces content, not the input filing", with its review id), two other walkers' scripts asserted that design, and the final code read found the re-file had made a deliberate removal come back as a fresh, flagging input after a plan round trip. It was taken out and filed as a question.
**Skill:** bug-check order §8 (fix the finding, red first) — the fix step
**Type:** open-source
**Phase/Area:** fixing a finding

**Issue:** A finding's symptom list can mix a real defect (a silent control) with a consequence of a deliberate design (the state a load leaves). Fixing "everything the finding describes" silently re-decided the design; nothing in the fix step asked whether a record already decided that behaviour.

**Suggested improvement:** Add to bug-check order §8: before a fix changes behaviour beyond the rule the finding cites, search the code comments and records for a decision covering that behaviour (grep the function the fix touches and its callers for "by design", review ids, "never"); if one exists, fix only the cited defect and file the rest as a question. Re-walk results should carry a disposition per FAIL (a check pinning a pre-fix expectation is not a regression).

**Principle:** Fix the defect the finding's rule names; a behaviour some record chose on purpose is a question, not part of the fix.

### Observation 241: Mock a change to an existing screen by applying it to the real running page, not by rebuilding a comp

**Status:** OPEN
**Date:** 24 Sep 26
**Session context:** the amendment re-test; the owner asked for a mock-up of two filed marks (a man taken off a seat on a published day; the pending mark hiding a warning ring)
**Skill:** New skill candidate: visual mock-up of a change to an existing surface (the house rule in `raptor-port/CLAUDE.md` §Product bar says "a throwaway HTML comp in the app's own stylesheet")
**Type:** open-source
**Phase/Area:** making the picture before product code

**Issue:** The house rule describes a hand-built comp. For a change to a surface that already exists, the mock was instead made by driving the production build with the walk tooling, taking "today" pictures, then injecting the proposal (a few CSS rules and a small markup insert) into the live page and taking the same frames again. Three traps surfaced: (1) the app swaps only the blocks that changed, so markup injected for option A survived into the frames for option B until cleared; (2) marks a few pixels wide were unreadable in full-width pictures — they needed a 2x capture, one crop per location, shown at natural size; (3) the proposal had knock-on effects a hand-built comp would have hidden — the ghost puck counted as "someone on the desk" for an existing rule, so the desk's "+ ADD" lost its outline and needed an extra rule, which is itself a finding for the build.

**Suggested improvement:** A mock-up procedure for existing surfaces: capture today; inject the proposal into the running page; capture the same frames; clear injected nodes before staging an alternative; capture at 2x and crop per location; keep the injected CSS in a committed script so the build starts from it; lay the pictures out today-beside-proposed with a desktop/phone switch.

**Principle:** A change to an existing screen is best mocked on the real screen — it is pixel-true, it exposes the knock-on effects a clean comp hides, and the proposal's styling becomes the build's starting point.

### Observation 242: Judge a small visual mark at the screen's real pixel size, not only in enlarged captures

**Status:** OPEN
**Date:** 24 Sep 26
**Session context:** the amendment re-test's mock-up of a fix for a warning ring hidden under an amendment mark; the owner asked to see examples of the fix
**Skill:** New skill candidate: visual mock-up of a change to an existing surface (see Observation 241)
**Type:** open-source
**Phase/Area:** judging the proposal before showing it

**Issue:** The first mock-up captured the page at twice the screen's density and showed the pictures enlarged, and the proposal (move the mark out onto the element around the badge) looked right. Rebuilding the examples from real situations and capturing at the desktop's real density (1x) showed it failing: the wrapper was exactly the badge's size and neighbouring badges sat 3px apart, so the moved mark and the existing ring sat half a pixel apart and blurred into one thick ring, and any larger offset ran into the neighbour. Measuring the two boxes and the gap first would have ruled the design out before any picture. A second trap in the same session: a script that toggles injected styles by finding "the original rule" found its OWN injected copy on the second toggle, so every later "today" picture silently showed half of the proposal — caught only by looking at each picture.

**Suggested improvement:** For any mark a few pixels wide: measure the element boxes and neighbour gaps before designing; capture at the target screens' real densities (1x desktop, 3x phone) and show those at true size, with an enlarged copy only as a detail view; state on the page which pictures are real size. When a mock script swaps styles, keep the app's original rule once, skip its own injected sheet, and eyeball every "before" picture.

**Principle:** Enlargement hides sub-pixel collisions; a design for a tiny mark is only proven at the pixel size people will actually see.

### Observation 243: Show a fix on the busiest realistic state, not only on the case that reproduces the bug

**Status:** OPEN
**Date:** 24 Sep 26
**Session context:** the ring-fix mock-up; the owner asked to see the fix "in a schedule that has 3 AL and multiple changes"
**Skill:** New skill candidate: visual mock-up of a change to an existing surface (see Observations 241, 242)
**Type:** open-source
**Phase/Area:** choosing what the examples show

**Issue:** The first examples were built around the defect as reported (a mark hiding the red rings), one situation per ring, and the fix drawn let only the red rings through. The owner's request for a busier state (several amendments out, more waiting, mixed warnings) surfaced a case the minimal examples could not: the same rule also wiped the thinner amber and grey warning rings, so the fix as drawn was incomplete. The owner, not the agent, asked for the state that exposed it.

**Suggested improvement:** When mocking a fix, include one "busy" state by default — the fullest realistic mix of the elements the fix touches (every mark colour, every ring kind, issued and pending together, a plain case) — and derive the fix's scope from what the rule being changed actually affects (here: every box-shadow the rule wipes), not from the bug's first description.

**Principle:** A fix scoped from the bug report covers the reported case; a fix checked against the busiest realistic state covers the rule.

### Observation 244: A control reused on a second surface needs its own "where does it land" row in the roll-call

**Status:** OPEN
**Date:** 25 Sep 26
**Session context:** the owner's five-minute look at the amendment re-test (a FULL-tier bug check with a roll-call of 22 surfaces, four parallel walkers and two code reads)
**Skill:** New skill candidate: the bug-check roll-call (the project's standing order `raptor-port/docs/bug-check-order.md` §6)
**Type:** open-source
**Phase/Area:** the roll-call's "can the person ACT on it there" column

**Issue:** The change list's "tap a row to jump to that change" was built for one surface (the scheduler board) and later given a second opener on another page (a top-bar button on the edit page) that reused the same handler. The roll-call row for the list recorded "a value row jumps to the detail" and was walked, but nothing asked WHERE the jump lands when opened from the second page: it silently left the page the user was on and opened the board. The owner found it in minutes; every automated and model check had passed it, because the action did exactly what its code said.

**Suggested improvement:** In the roll-call, give every action that NAVIGATES (a jump, a "go to", a link) one row per OPENER, with a column for "the user is still on the page they started from — YES / NO-because". Seed the list from every call site of the opener, not from the surface the feature was designed on.

**Principle:** A reused handler inherits its first surface's assumptions; the roll-call has to ask each new entry point where it leaves the user.

### Observation 245: A body class named like an element class silently broke every closest()-based exclusion

**Status:** OPEN
**Date:** 2026-09-25
**Session context:** Raptor amendment batch, overnight (item 11 — hiding the page behind a full-screen overlay while it is open)
**Skill:** New skill candidate: css-state-class-hygiene (or a rule in the executor / bug-check order)
**Type:** open-source
**Phase/Area:** Build — adding a state class to `document.body`

**Issue:** A state class was added to `<body>` while an overlay was open, reusing a short name ("sb-open") that already existed as an ELEMENT class (the date button that opens the overlay). The app's click router decides "is this a blank tap?" with `target.closest('…, .sb-open, …')`; with the class on `<body>`, every element's `closest()` matched it, so no blank tap ever cleared the selection. Nothing errored; nine tests went red only in the full-suite run, far from the change. Bisecting three commits found it in two minutes.

**Suggested improvement:** Before adding any class to `html`/`body` (or any ancestor-wide container), grep the codebase for that class name used in `closest(`, `matches(`, `querySelector` and CSS selectors; prefer a namespaced state name (`is-…`, `…-up`, `has-…`) that no element uses. When a broad full-suite failure appears with no thrown error, bisect by commit before reading code.

**Principle:** A class placed on an ancestor is inherited by every `closest()` query below it — a state class on the body must never share a name with an element class that code tests ancestry against.

### Observation 246: Long inline Python edit scripts in a bash heredoc corrupted quotes three times — write the script to a file

**Status:** OPEN
**Date:** 2026-09-25
**Session context:** Raptor amendment batch, overnight — many multi-file mechanical edits done with small Python scripts
**Skill:** New skill candidate: safe-scripted-edits (Windows + Git Bash)
**Type:** open-source
**Phase/Area:** Editing files with scripted find/replace

**Issue:** Three times a Python script passed through a bash heredoc produced wrong text: `\'` inside a non-raw Python string wrote a bare apostrophe into a single-quoted TypeScript string (a syntax error in a test file); a regex with `\s` triggered escape warnings; one heredoc failed to parse at all ("unexpected EOF"). Each cost a re-run. Writing the script to a scratch file with the editor tool and running it by path worked every time, and the `assert s.count(old) == 1` guard caught every miss before anything was written.

**Suggested improvement:** For any scripted edit longer than a few lines, or containing quotes, backslashes or regexes, write the script to a scratch file first and run it by path; keep the one-match assertion before each replacement; never embed target-language string escapes inside a non-raw host-language string.

**Principle:** Two layers of quoting (shell → script → target file) multiply escaping errors; remove a layer by writing the script to a file, and guard every replacement with an exact-match count.

### Observation 247: Walk scripts hard-coded their picture folder, so the re-walk could not keep the first walk's evidence

**Status:** OPEN
**Date:** 2026-09-25
**Session context:** Raptor amendment batch — three parallel walkers, then a re-walk of the fixes
**Skill:** raptor-port/docs/bug-check-order.md §5 (the re-walk) / the walk brief template
**Type:** internal
**Phase/Area:** Walk scripts and the re-walk

**Issue:** The standing order says the re-walk re-runs the walk scripts into a SEPARATE output folder, so the first walk's pictures remain the defect's evidence. All three walkers wrote `process.env.HP_SHOTS = '<fixed folder>'` at the top of every script, so re-running them would have overwritten the defect pictures; each had to be patched (`process.env.HP_REWALK || '<folder>'`) before the re-walk. Separately, one walker's "fail" on re-walk was its script not finding a delete control — a not-walked step reported as a failure.

**Suggested improvement:** Put in the walk brief template (and `lib.mjs`'s header): "set HP_SHOTS only if it is not already set (`process.env.HP_SHOTS ||= '<folder>'`), so a re-walk can point elsewhere"; and "a check whose own setup step could not act must report NOT WALKED, never FAIL".

**Principle:** Evidence-producing scripts must let the caller choose where output goes, and must distinguish "the app did the wrong thing" from "the script could not do the thing".

### Observation 248: A walk helper that taps an element's CENTRE hits whatever child sits there — and the heredoc-escape slip (#246) recurred

**Status:** OPEN
**Date:** 2026-09-25
**Session context:** Raptor amendment batch, overnight — the re-walk of the two code reads' fixes
**Skill:** New skill candidate: app-walk scripting (Playwright hand pass)
**Type:** open-source
**Phase/Area:** Driving the running app from a script

**Issue:** The shared "put a man in this row" helper tapped the middle of a crowd row's drop zone. Once the row held people, the middle was a seated man's puck, so the tap selected him instead of arming the row — the add silently failed ("FAILED", or one man short), and a first reading blamed the app. Tapping the row's own "+ add" box by its coordinates armed it every time. Separately, #246's slip happened again: a regex written inside a non-raw Python string turned \b into a backspace character in the target file, so a correct result read as a failure until the file was inspected.

**Suggested improvement:** Walk helpers target the AFFORDANCE (the add box, the button) by its own box, never the container's centre; a helper that fails returns why ("not armed", "nobody offered") rather than a bare FAILED. For #246, make it structural: edit scripts that contain a regex or a backslash are written with the editor tool as raw strings, never typed into a heredoc.

**Principle:** Clicking a container's centre is a guess about what lies there; aim at the control itself, and make every helper failure say which step failed so the app is not blamed for the script.

### Observation 249: Mock-ups injected into a live app are wiped by its own repaints — inject after the scroll, re-apply just before the picture

**Status:** OPEN
**Date:** 2026-09-25
**Session context:** Raptor — nine owner-requested mock-ups drawn by injecting proposed markup into the real running app
**Skill:** New skill candidate: live-app mock-ups (Playwright)
**Type:** open-source
**Phase/Area:** Drawing a proposed design on top of the real app

**Issue:** Four times a picture came out without the injected change: a tag set on a day disappeared because the day re-rendered as it scrolled into view; a select's value set by script was redrawn back a moment later; an app toast from the set-up covered a button; a sticky header covered the top of a clipped region. Each cost a redraw and a look. What worked: scroll first, inject second, wait, re-apply the fragile part immediately before the screenshot, hide transient toasts, and frame by testing that the element's own top edge is what the page shows at that point (elementFromPoint) rather than trusting scrollIntoView.

**Suggested improvement:** A mock-up helper that (1) scrolls, (2) injects, (3) re-applies the injection right before the shot, (4) hides toasts, (5) frames clear of sticky bars by elementFromPoint; and a rule to LOOK at every picture before sending, since each failure above passed the script with no error.

**Principle:** A live app owns its DOM; anything drawn into it for a picture must be applied at the last moment and checked by eye, because the app's own repaints fail silently.

### Observation 250: A ruling that names its surfaces — the build's tests walked every surface that reads the changed body, and missed the one that re-derives the same number itself

**Status:** OPEN
**Date:** 2026-09-25
**Session context:** D114's FULL check (Raptor, `claude/amendment-batch`) — a request taken off a published day counts one pending change on every count
**Skill:** New skill candidate: none — the project's bug-check order (`raptor-port/docs/bug-check-order.md` §6, the roll-call)
**Type:** open-source
**Phase/Area:** building a counting change; the roll-call

**Issue:** The ruling listed seven surfaces by name, including the load's "Discard N edits". The build changed the one counting body and red-first-tested the day head, the board, the info panel, the list, the panel and the publish message — every surface that READS that body. "Discard N edits" computes its number in a sibling function that re-derives the same unit by itself (content units + the filings the load will put back), so it never saw the pairing and read 2 beside the day head's 1. The build's own tests were all green; the mechanical roll-call (grep every reader of the count, then check each named surface) found it in minutes, before the app was opened.

**Suggested improvement:** In the roll-call step, when a ruling names surfaces, map EACH named surface to the function that computes its number, and flag any surface whose function is not the changed body — that surface needs its own red test, or the two functions must share one body.

**Principle:** "Every reader of the changed function" is not the same set as "every place the number is shown". A sibling that re-derives the same quantity is a drift seam the changed function's callers list can never reveal; enumerate from the surfaces the ruling names, not from the call graph of the code you changed.

### Observation 251: Slowing the whole browser does not reproduce an ORDERING race — force the order in one in-page step instead

**Status:** OPEN
**Date:** 2026-09-25
**Session context:** Raptor `[TRK-SMOKE-ADD-RACE]` (D190) — the Tracker smoke suite's "+ Add" stopped GitHub's checks three times; the cause was a 30ms focus timer landing between the two halves of Playwright's `fill` (focus+select, then `Input.insertText` to whatever holds focus). Numbered 251 while a parallel chat (the D175 branch) may also append — the later merge renumbers per the skill's rule 4.
**Skill:** systematic-debugging
**Type:** open-source
**Phase/Area:** Phase 1 (reproduce) for intermittent browser-test failures

**Issue:** The first reproduction attempt was the obvious one: CDP CPU throttling at 1x–12x around the failing step, ten runs, heavily instrumented. It passed every time — slowing the renderer evenly slows the app's timer and the test driver's steps together, so the one narrow interleaving never came up. What reproduced it at once, deterministically, on every surface: reading the test tool's own source to learn that `fill` is two round trips, then forcing the suspect order in ONE in-page task (open the box, put the cursor in, type — all before the timer), and only then letting the timer fire. The old build then failed 26 of 38 walk checks on ten surfaces; the fixed build passed all of them.

**Suggested improvement:** In systematic-debugging's reproduction phase, for an intermittent UI failure: (1) name the two actors that race (an app timer / effect / async save vs. a multi-step driver action or a user's input); (2) read the driver's implementation to find its step boundaries; (3) force each candidate ORDER in one in-page task with a DOM observer, measuring the gap; reserve uniform slow-down for load-dependent (not order-dependent) failures.

**Principle:** A load-dependent flake and an order-dependent race look the same in CI logs but need different reproductions: throttling tests "is it too slow?", forcing the order tests "is it wrong in this order?" — and only the second finds a bug whose window is a few milliseconds wide.
### Observation 252: A handler's early exit is a surface — a change to the number it tests can make its sentence untrue

**Status:** OPEN
**Date:** 2026-09-25
**Session context:** Raptor — D175 (a load leaves out a request row that now stands on another day); the load's "Discard N edits" count was changed to measure against the day as the load will leave it
**Skill:** New skill candidate: bug-check roll-call (project method `raptor-port/docs/bug-check-order.md` §6)
**Type:** open-source
**Phase/Area:** roll-call — which sentences a door can say

**Issue:** The change made the load's discard count read 0 when the only difference left was the row the load must leave out — correct for the count. But the load handler also used that count (plus "is this the current version?") to take an early exit that says "Monday is already at Original" and does nothing. With the count now 0, the exit fired on a day that still read "1 pending", so the door said something untrue and never showed the new "left out" sentence. Every engine test passed; only the app-level test that clicked the real button and read its message caught it.

**Suggested improvement:** In the roll-call, for every quantity the change alters, list not only the places that DISPLAY it but every place that BRANCHES on it (early returns, "nothing to do" / "already done" toasts, confirm gates), and check each branch's sentence is still true in the new states.

**Principle:** A value a handler tests to decide "nothing to do" is load-bearing twice: once as a number shown, once as a decision taken. Changing what the number means can silently flip the decision; enumerate the branches on a changed quantity, not just its displays.

### Observation 253: Reproduce a finding's PREMISE, not only its symptom — "nothing visible changed" must be checked against every reader of the state

**Status:** OPEN
**Date:** 2026-09-25
**Session context:** Raptor — dispositioning a blind code read of D174 (a request filed since publishing, then taken off, reads 0 pending)
**Skill:** New skill candidate: bug-check dispositions (project method `raptor-port/docs/bug-check-order.md` §4, "what to do with what they hand back")
**Type:** open-source
**Phase/Area:** dispositioning reviewer findings

**Issue:** A reviewer reported that a day reading "1 pending" was wrong because "the day's face is unchanged", and gave a clean, test-backed fix that would have made it 0. The symptom reproduced exactly (the count was 1). The premise did not: the request still took effect on that day through a second reader (it closed the person's hours and fed the warnings on every day it covered), so the day genuinely differed from its published version. Reproducing only the symptom would have "confirmed" the finding and shipped a fix that hid a real change.

**Suggested improvement:** In the disposition step, split "reproduce" into two checks: (a) the observed behaviour happens, and (b) the reviewer's stated reason it is wrong holds — enumerate every reader of the state the finding says is "unchanged" / "invisible" (renderers, validators, availability, downstream consumers) and probe each. Record findings that fail (b) as "not a defect — checked", with the reader that disproves them, and pin the correct behaviour with a test so a later rule cannot absorb it.

**Principle:** A finding is two claims — "this happens" and "this is wrong because…". Reproduction usually tests only the first. The second is where false positives live, and a false positive with a ready-made fix is more dangerous than a missed finding, because it arrives looking verified.
