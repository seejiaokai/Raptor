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

### Observation 254: A background test run over files still being edited reports failures that are not there

**Status:** OPEN
**Date:** 2026-09-26
**Session context:** Overnight build of [LEAVE-LATE-PUBLISHED] (D181); a full unit run was started in the background after step 1, and step 2's source edits were applied while it ran.
**Skill:** New skill candidate: background verification discipline (or raptor-executor / bug-check-order §5 "between fix rounds")
**Type:** open-source
**Phase/Area:** verification while building

**Issue:** The runner loads each test file (and its imports) when it reaches it, not at start. Source edits made during the run reached the later test files half-applied: 113 failures, every one a phantom — a clean re-run of the same code was 4 of 5,939, all expected. Only the timing showed which were real; the failure list itself looked like genuine regressions.

**Suggested improvement:** When a full suite runs in the background, stage the next edits in a scratch file (a script of exact replacements) and apply them only after the run ends; or run it in a separate worktree. A run that overlapped any source edit is discarded, never triaged.

**Principle:** A test result is evidence only about the exact code it loaded. If the code changed while the run was loading it, the result describes no revision at all — throw it away rather than read it.

### Observation 255: The one handoff file lost a whole section to a span replace, and the document gate passed it into main

**Status:** OPEN
**Date:** 2026-09-26
**Session context:** Picking up from HANDOFF.md at the start of the overnight session; the `## Next, in order` section, a block's end marker and the `## Gate baseline` heading were missing on main.
**Skill:** session-handoff (and the docs gate it relies on)
**Type:** internal
**Phase/Area:** writing / checking HANDOFF.md

**Issue:** A replacement anchored on text inside one `## Now` block ran to text in the gate-baseline paragraph, silently deleting everything between (commit 119dff45). Three later commits and a merge carried the damage; `npm run docsize` checks backlog items and rulings line by line but not the handoff file's own shape. The next chat only noticed because its own block write needed the missing end marker.

**Suggested improvement:** The handoff skill re-reads HANDOFF.md's headings and markers after every write and compares them with before (one `<!-- /now -->` per `<!-- now:`, each of `## Now`, `## Next, in order`, `## Gate baseline` once, in order); the gate enforces the same (filed as OUTSTANDING.md [HANDOFF-SHAPE-GUARD]).

**Principle:** A file that every session starts from needs a structural invariant checked by machine after each edit; a content check that ignores the file's skeleton lets the skeleton disappear unnoticed.

### Observation 256: An OPEN observation held "in awareness" was repeated the same night it was logged

**Status:** OPEN
**Date:** 2026-09-26
**Session context:** Morning continuation of [LEAVE-LATE-PUBLISHED]; observation 254 (a background suite run over files still being edited describes no revision) was scanned at session start, then the agent started the full unit suite in the background and applied three source edits while it ran.
**Skill:** task-observer (Session Start Protocol step 2) and raptor-executor (verification)
**Type:** open-source
**Phase/Area:** applying open observations during work

**Issue:** The run happened to pass (5964/5964), which made it look like evidence; by 254's own principle it describes no single revision and had to be repeated on the committed code. Scanning OPEN observations at session start did not stop the exact failure hours later, because nothing at the moment of starting a background run points back to them.

**Suggested improvement:** When an OPEN observation names a trigger action ("start a background run", "replace a span in HANDOFF.md"), copy its one-line rule into the place that action is taken — here the Bash description habit: a background test run is started only on a committed, clean tree (`git status --short` empty), checked in the same command.

**Principle:** A lesson scanned at the start of a session is not in force at the moment it matters; tie it to the action that triggers it, ideally as a check inside that action.

### Observation 257: A break test with no red can be a redundant guard, and the order's rule "write a test" then contradicts D56

**Status:** OPEN
**Date:** 2026-09-26
**Session context:** Break tests on [LEAVE-LATE-PUBLISHED]: cutting the medical line in `events.ts inpShow` turned nothing red, because the frozen inputs (layer 1) already keep a late downchit off the published face and out of the detector; the cut line is reached only by a version issued before the freeze — stored demo data.
**Skill:** bug-check order (raptor-port/docs/bug-check-order.md §8 rule 4)
**Type:** internal
**Phase/Area:** break tests

**Issue:** §8.4 says "if nothing goes red, that surface has no test, by proof — write one before continuing". Here the only test that could go red would build a pre-freeze version, which D56 forbids spending time on. The honest disposition was: name the layer that pins the behaviour (its own break test is red) and why the cut wire is unreachable for new data.

**Suggested improvement:** Add to §8.4: a no-red break is either a missing test OR a redundant guard; for the second, record which other wire's break test pins the same behaviour and why the cut one is unreachable for new data — and consider deleting the redundant guard in a later, separate change.

**Principle:** A break test measures whether a wire is observed, not whether it is needed; "no red" has two readings, and the disposition must say which.

### Observation 258: A handoff's build list narrowed the ruling it was built from

**Status:** OPEN
**Date:** 2026-09-26
**Session context:** Picking up [LEAVE-LATE-PUBLISHED]: HANDOFF.md said "LIVE_ON_FACE += CREW_REST, DAYS_RUN, QUAL" for his "a lapsed qualification" (D185). The code shows a lapsed SC or AAR currency raises SC_QUAL / AAR_QUAL / AAR_INSTR, not QUAL; and the crew-rest check's other answer (CREW_TIGHT) left frozen made a neighbour's change read pending on the published day.
**Skill:** session-handoff (what a handoff's "to build" list is)
**Type:** open-source
**Phase/Area:** turning a ruling into a build list at handoff

**Issue:** The list was written from memory of the code's names at handoff, as a finished spec. Built literally, the most literal case of his ruling (a lapsed currency) would have stayed frozen, and a new test would have shown a published day going pending for a change the ruling made live.

**Suggested improvement:** In the handoff skill: a "to build" line that turns a ruling into code names says so ("the agent's reading") and the next session re-derives the list from the ruling's words against the code before building, recording any widening on the ruling's row.

**Principle:** A code-name list in a handoff is a pointer to a ruling, not a replacement for it; re-derive it from the ruling at build time.

### Observation 259: In this Windows Bash tool a doubled backslash inside a quoted heredoc reaches the program single

**Status:** OPEN
**Date:** 2026-09-26
**Session context:** [LEAVE-LATE-PUBLISHED] morning; Python edit scripts passed through `python - <<'EOF'` failed their exact-match assertions four times on strings holding an escaped quote (`Monday\'s` in the source).
**Skill:** New skill candidate: repo edit-script discipline (beside the memory "Python edits turn LF into CRLF")
**Type:** internal
**Phase/Area:** mechanical source edits from the shell

**Issue:** A quoted heredoc should pass text verbatim, but here a Python source line written with a doubled backslash arrived with one, so the literal Python saw was different from the file's text and the replacement matched nothing (the scripts asserted, so nothing was damaged — only time lost). Writing the same script with the Write tool into the scratchpad and running it worked every time.

**Suggested improvement:** For any edit script whose search text contains a backslash, write the script with the Write tool and run it; keep the assert-exactly-one-match guard in every such script.

**Principle:** When a shell layer might rewrite escapes, move the program text out of the shell (a file written by a tool that does not interpret it), and keep an exact-match assertion so a mangled pattern fails loudly instead of editing nothing — or the wrong thing.

### Observation 260: A pin that calls a builder differently from its real caller can pass with the fix cut out

**Status:** OPEN
**Date:** 2026-09-26
**Session context:** [LEAVE-LATE-PUBLISHED], the pins for D187's read fixes; an exempt-desk pin drew the board's duty panel with the "look" flag as its THIRD argument, while the board passes it as the FOURTH (read only) — so the pin drew the working copy and passed with the fix cut out (break test B36: 0 red). Redrawn as the board draws it, it went red.
**Skill:** raptor-port/docs/bug-check-order.md (break tests) — no skill file yet
**Type:** open-source
**Phase/Area:** writing a regression test for a render fix

**Issue:** The test called an internal builder directly and guessed its arguments from its signature's names (`pv`, `ro`); the real caller passes a different value in the slot the fix reads. The test asserted the right outcome of the wrong drawing, and only the break test showed it.

**Suggested improvement:** When a pin calls an internal builder directly, copy the arguments from its real caller (grep the call site) and assert one fact that proves the drawing is the intended mode (here: no write surface under a look). Keep the break test for every new pin — it is what caught this.

**Principle:** A test that reaches past the public door must reproduce the door's exact call, and prove it did; otherwise only cutting the fix shows whether the test was ever looking at it.

### Observation 270: A hook wired as `test && run || exit 0` swallows its own refusal

**Status:** OPEN
**Date:** 2026-09-26
**Session context:** [BG-CWD-GUARD] — a PreToolUse hook that refuses a backgrounded npm command outside raptor-port (numbered 270, past 260, because two parallel chats — claude/accounts and a Tracker-colours chat — may be appending unpushed entries)
**Skill:** repo hook wiring (.claude/settings.json; the pattern in `record-decisions.sh`'s and `task-observer`'s entries)
**Type:** open-source
**Phase/Area:** writing a blocking hook's settings command

**Issue:** The repo's existing hook commands use `[ -f script ] && bash script || exit 0` for fail-open. That is harmless for hooks that always exit 0, but copied onto a BLOCKING hook it turns the hook's exit 2 (refuse) into exit 0 (allow): `||` fires on any non-zero exit of the script, not only on a missing file. The guard was written with `if [ -f … ] && command -v node …; then node …; else exit 0; fi` instead, and proved live (refused, then allowed).

**Suggested improvement:** Where this repo documents how to add a hook (file-map row for `settings.json`, or a note beside the hooks), say: a hook that can BLOCK uses `if …; then …; else exit 0; fi`, never `&& … || exit 0`; and prove a new blocking hook live with one refused and one allowed call.

**Principle:** Fail-open wrappers must distinguish "the check could not run" from "the check said no"; a shell `a && b || c` conflates them and silently disables every refusal.

### Observation 271: A ruling that picks from a PICTURE must save the picture's recipe, or the build has to dig it out of an old chat

**Status:** OPEN
**Date:** 2026-09-26
**Session context:** Building [TRK-PALETTE-ASK] — the owner had chosen "C" from three pictures of the Tracker's chart in other colours (D157, 24 Sep 26). Numbered 271–273 (first written as 262–264): the parallel `claude/accounts` branch holds 261 and `main` reached 270 (`claude/bg-cwd-guard`) before this merged.
**Skill:** internal — the project's record-decisions rule (`.claude/rules/record-decisions.md`), and the session-handoff skill's checkpoint sweep
**Type:** internal
**Phase/Area:** Recording a ruling whose answer is a visual choice

**Issue:** The ruling row said only "C — fully Raptor … sim turns from yellow to amber". The exact colours he approved lived in a throwaway script the earlier chat deleted, and in pictures in that chat's temp folder. Two days later the build could reproduce "C" exactly only by searching old session transcripts and pulling the deleted script back out of the transcript file. A fresh device, or a cleared temp folder, would have left the build guessing, and possibly shipping colours he never saw.

**Suggested improvement:** When the owner rules by picking a picture (a mock, a comparison, "A/B/C"), the ruling's "Where it lives now" names a committed copy of what he picked: the picture (or its source HTML/script) under `raptor-port/docs/mock/` or the evidence folder, with the exact values (colours, sizes) written out. Add it to the record-decisions rule and the handoff checkpoint sweep ("a visual ruling has its picture in the repo").

**Principle:** A decision made by pointing at a picture is only reproducible if the picture, or the recipe that drew it, is kept with the decision; the words describing it are a summary, not the spec.

### Observation 272: The permission classifier refuses edits to the rulings files, which the project's own process requires

**Status:** OPEN
**Date:** 2026-09-26
**Session context:** Same session. The first step — record the owner's go-ahead as ruling D230 in `.claude/rules/decisions/tracker.md` before the work, per `.claude/rules/record-decisions.md` and the hook on every message — was refused by the auto-mode classifier as "instruction poisoning" (the file loads as instructions in later sessions).
**Skill:** internal — the record-decisions process (its hook, `.claude/hooks/record-decisions.sh`, and `DECISIONS.md` step 1)
**Type:** internal
**Phase/Area:** Writing a ruling row under auto mode

**Issue:** The project's rule says a ruling is written the moment he gives it, into a file under `.claude/rules/decisions/`. Under auto mode that write can be refused outright, so the "record it FIRST" step silently becomes "ask him, then record it later" — the exact gap the rule exists to close. Nothing in the rule says what to do when the write is refused; the agent correctly did not work around it and told the owner.

**Suggested improvement:** Add one line to `.claude/rules/record-decisions.md`: if the rulings file cannot be written (a permission refusal), say so to him in the same message, park the row's exact text in this chat's `HANDOFF.md` block under "rulings to file", and file it once he approves the edit — never skip it silently, never route around the refusal. Optionally the owner adds a permission rule for `.claude/rules/decisions/**` so the step works under auto mode.

**Principle:** A process whose first step writes to a protected location needs a stated fallback for when the write is refused; otherwise the refusal quietly removes the step.

### Observation 273: A break test that puts back a RETIRED value only proves the retired list — break with another CURRENT value too

**Status:** OPEN
**Date:** 2026-09-26
**Session context:** `[TRK-PALETTE-ASK]` (D157) bug check. The first 15 break tests each put an OLD Tracker colour back; all went red — but most went red only through the "no retired colour anywhere" test. Astra's read showed a key that painted Sim in the Test token (both current colours) would have passed every test. Six new breaks using another current value then drove three new, sharper tests.
**Skill:** internal — `raptor-port/docs/bug-check-order.md` §8.4 (the break test)
**Type:** internal
**Phase/Area:** Break tests for a mapping (a palette, a lookup table, a label → token wiring)

**Issue:** For a change that maps many things to many values, breaking a wire by restoring its OLD value is caught by any "the old value must not come back" guard, so every break goes red even when nothing checks that each thing maps to the RIGHT new value. The break test reported 15/15 while a whole class of wrong wiring (two current values swapped) was unguarded.

**Suggested improvement:** §8.4 gains one line: when the change is a mapping, at least one break per wired place swaps in ANOTHER CURRENT value (a neighbour's token, a real colour the app uses elsewhere), not only the retired one; a break that is caught only by the "retired value" guard does not count as that place's test.

**Principle:** A break test proves a check only if the break is one the retired-value guard cannot see; swap in a legitimate-but-wrong value, not just the old one.

### Observation 261: Text written between tool calls did not reach the owner; a copy-paste prompt had to be re-sent as a file

**Status:** OPEN
**Date:** 2026-09-26
**Session context:** `[ACCOUNTS]` planning; the owner asked mid-turn for a prompt to start a parallel worktree chat
**Skill:** New skill candidate: parallel-chat launcher (and the session-handoff skill's "ready-to-paste opening line")
**Type:** open-source
**Phase/Area:** answering a mid-turn question while tool calls continue

**Issue:** The owner asked, mid-turn, what he could run in parallel and then for the opening prompt. The answer (with the prompt in a fenced block) was written as text between tool calls; he replied "I dont see the prompt". Re-sent as a file with SendUserFile, it arrived. The same happened to be true for the next answer, which went straight to a file.

**Suggested improvement:** When a mid-turn answer carries something the person must COPY or ACT on (a prompt, a command, a decision), deliver it as a file (SendUserFile) or end the turn with it — never only as interleaved text. A parallel-chat launcher skill could standardise the prompt it hands over: the worktree, the model, a claimed ruling range, the port, "never two full check runs at once", "later merge takes main first".

**Principle:** A deliverable the person has to act on must travel by a channel that is guaranteed to reach them; interleaved narration between tool calls is not one.

### Observation 262: Reverting a break test with `git checkout <file>` threw away the file's uncommitted rewrite

**Status:** OPEN
**Date:** 2026-09-26
**Session context:** `[ACCOUNTS]` build step 1 — the drift test's break test on `docs/data-model.md` §11
**Skill:** bug-check order §8 rule 4 (the break test) / test-driven-development
**Type:** open-source
**Phase/Area:** the break test's undo step

**Issue:** To prove the new drift test goes red, one letter of the (uncommitted, freshly rewritten) permissions table was changed, the test run, and the change undone with `git checkout docs/data-model.md`. That restored the LAST COMMIT — the old table — silently discarding the whole rewrite. Only a `cp` taken before the edit (made by habit, not by rule) saved it.

**Suggested improvement:** The break-test step says: break the wire, watch a named test go red, then restore FROM A COPY TAKEN JUST BEFORE THE BREAK (or break with a reversible in-place edit and reverse that exact edit) — never `git checkout`/`git restore` on a file with uncommitted work; or commit before breaking.

**Principle:** An undo must return to the state just before the break, not to the last commit; on a dirty file those are different, and the tool that confuses them reports success.

### Observation 274: A test that calls the loader by hand hides a loader nobody calls at boot

**Status:** OPEN
**Date:** 2026-09-26
**Session context:** [ACCOUNTS] FULL bug check — the walk (numbered past 273, the highest on the parallel branches claude/tracker-palette and claude/bg-cwd-guard)
**Skill:** New skill candidate: bug-check order (raptor-port/docs/bug-check-order.md) — the walk's reload step
**Type:** open-source
**Phase/Area:** test fixtures vs the boot path; the walk's "reload" step

**Issue:** A new settings loader was registered in the settings-rollback list but never called in the app's start-up routine, so every account an admin added was forgotten at the next page reload. 6,137 unit tests were green: the accounts suite's setup called the loader by hand right after the start-up routine, so no test ever exercised "start-up alone". The walk's reload step caught it in the first run.

**Suggested improvement:** (1) The walk's roll-call always includes "reload the page and check the new data is still there" for any feature that stores something. (2) A test's setup should run the SAME start-up path the app runs, never add the step under test by hand after it; where two lists must stay in step (the rollback loaders and the boot loaders), a structural test compares them.

**Principle:** A fixture that performs the step under test by hand proves the step works, not that anything performs it; test the path the product actually takes, and test "survives a reload" for anything stored.

### Observation 275: A fixture helper that refuses silently makes every assertion after it vacuous

**Status:** OPEN
**Date:** 2026-09-26
**Session context:** [ACCOUNTS] FULL bug check — the guest-view test
**Skill:** New skill candidate: bug-check order (raptor-port/docs/bug-check-order.md) — writing the test that pins a walk finding
**Type:** open-source
**Phase/Area:** red-first proof of a fix

**Issue:** A test meant to prove "the guest sees a published day, with medical detail hidden" called the publish function without the four sign-offs it requires; publish refused silently, every day read "Not published yet", and the test's "no medical detail" check passed because nothing was drawn at all. Found only because a new assertion added for a walk finding passed WITHOUT its fix — the red-first step exposed it.

**Suggested improvement:** Every fixture step that can refuse gets an assertion that it landed (e.g. "the fixture day is published") before the assertions that depend on it; and the red-first run (revert the fix, watch the test fail) is mandatory for every new assertion, not only new tests.

**Principle:** Assert the fixture before the behaviour; a negative check ("X is not shown") passes trivially on an empty screen.

### Observation 276: A results folder with a shared name is read as your own run

**Status:** OPEN
**Date:** 2026-09-26
**Session context:** [ACCOUNTS] FULL check — the gate run
**Skill:** New skill candidate: bug-check order (raptor-port/docs/bug-check-order.md) — running the gates
**Type:** open-source
**Phase/Area:** reading gate results while parallel sessions share a machine

**Issue:** The gates were logged to `/tmp/gates/`, a folder another session had used that morning. Its old summary file said "unit tests failed, browser tests failed", and the agent reported that to the owner as its own result before noticing the timestamps — its own run was still in progress. Corrected within a minute, but the owner was briefly told something false.

**Suggested improvement:** Every gate run writes to a folder named for the run (branch + time), created fresh; a report of a gate result quotes the log's own timestamp or the run's start line. Never read a summary file you did not create in this run.

**Principle:** A shared scratch location is someone else's evidence until proven otherwise; name results by the run that produced them.

### Observation 277: An evidence cell that names a test must be checked against the file tree

**Status:** OPEN
**Date:** 2026-09-26
**Session context:** [ACCOUNTS] FULL check — the evidence sheet's roll-call
**Skill:** New skill candidate: bug-check order (raptor-port/docs/bug-check-order.md) — §6 roll-call and §9 evidence
**Type:** open-source
**Phase/Area:** the roll-call's "proved by" column

**Issue:** The roll-call row for a security-relevant surface claimed "pinned by the unit test that loads it under a non-local host". No such test existed; the claim was carried from the plan's intention into the sheet. An independent code reviewer's remark led to a search that found none; the test was then written (and the behaviour hardened).

**Suggested improvement:** Before the sheet is handed to reviewers, every file or test named in a "proved by" cell is checked to exist (a one-line glob per cell, or a small script over the sheet's backticked paths). A plan's "proved by" column is a promise; the sheet's must be a fact.

**Principle:** A cell that names its proof is a claim until the proof is opened; check it exists before anyone relies on it (the anti-pattern "the comment that vouches", applied to evidence).

### Observation 278: A defect in the walk's own picture, missed by looking — measure new cards, don't only look

**Status:** OPEN
**Date:** 2026-09-26
**Session context:** [ACCOUNTS] — the owner's look after "merge live"
**Skill:** New skill candidate: bug-check order (raptor-port/docs/bug-check-order.md) — §7 the walk, §9 the pictures
**Type:** open-source
**Phase/Area:** looking at the walk's pictures

**Issue:** The owner found a button sitting 10px right of the boxes above it and poking past its card's edge. The walk had photographed that exact screen twice, and the agent looked at both pictures and passed them. A shared class lent the button another component's side margins; nothing on the page asserted alignment.

**Suggested improvement:** For every NEW card, form or panel a build adds, the walk asserts its geometry, not only its content: primary controls aligned with the fields above (left and right edges equal) and inside the container. Cheap in a scripted walk (bounding boxes), and the assertion catches what a glance normalises.

**Principle:** Looking confirms the picture matches your expectation of the content; it rarely notices a few pixels of misalignment. Measure what "looks right" means for new surfaces.

### Observation 290: One blind round can be both the plan's red team and the scenario design

**Status:** OPEN
**Date:** 2026-09-26
**Session context:** [HUMAN-RETEST] the absence record — planning the re-test (numbered past the parallel branches: claude/five-flags-batch-build at 285)
**Skill:** New skill candidate: bug-check order (raptor-port/docs/bug-check-order.md) — §4 rank 1 and rank 3, §4a
**Type:** open-source
**Phase/Area:** where to spend the other models before a walk

**Issue:** For a re-test the "plan" IS a test plan (roll-call, doors, fixture, walker split). One brief asked both outside models, blind, to attack the plan for what it misses AND to design ranked failure scenarios. Both independently found the same top defect (a drag door that skips a confirmation sheet the dialog door asks) and the same plan error (a roll-call row naming the wrong component) — two findings that a code review and the builder's own plan had both missed.

**Suggested improvement:** In the order's §4 / §4a, say that when the work is a re-test or a walk, the plan red team and the scenario design are one round with one brief (the finder wording + "what does this plan miss"), capped at one round, folded in before the walk.

**Principle:** When the plan is itself a test plan, reviewing it and designing its scenarios are the same question — ask it once, blind, to two models.

### Observation 291: An inherited walk helper found the "new" record by position — identity must come from the difference

**Status:** OPEN
**Date:** 2026-09-26
**Session context:** [HUMAN-RETEST] the absence record — the host's first walk
**Skill:** New skill candidate: bug-check order — §7.2 the scripted drivers (raptor-port/scripts/handpass/)
**Type:** open-source
**Phase/Area:** reusing a previous walk's helpers

**Issue:** A helper from an earlier walk returned "the last record in the list" as the one it had just filed. This app puts a new record at the TOP of that list (another door puts it at the bottom), so the helper named an unrelated record; the walk then deleted the wrong one, and the app's (correct) count of 2 read like a defect for several minutes.

**Suggested improvement:** Walk helpers name what they created by the DIFFERENCE between the ids before and after the action, never by position; and the first use of any inherited helper is on a case whose answer is known.

**Principle:** Identify what an action created by the before/after difference, never by where it landed — position is an implementation detail that differs by door.

### Observation 292: A reviewer's "confirmed defect" that a test pins as intended is a question, not a fix

**Status:** OPEN
**Date:** 2026-09-26
**Session context:** [HUMAN-RETEST] the absence record — dispositioning the plan reviews' findings
**Skill:** New skill candidate: bug-check order — §4 "what to do with what they hand back"
**Type:** open-source
**Phase/Area:** dispositioning a reviewer's finding

**Issue:** A reviewer marked a behaviour CONFIRMED-defective (a sheet's Clear removes an award on the same day) with an exact fix. Reproduced on screen, it was real — and an existing test pinned it as the intended "admin's clear". Applying the fix would have silently reversed a design someone chose; leaving it would have left money disappearing with no word.

**Suggested improvement:** Add a step to §4's list: before fixing a confirmed finding, search the tests for one that pins the opposite as intended; if one exists, the finding goes to the owner as a question (with the safe interim — e.g. make the action SAY what it removes), not into a fix.

**Principle:** A reproduced behaviour that a test deliberately pins is a design disagreement; settle it with the owner, not with the reviewer's fix.

### Observation 293: Scaffold the evidence sheet with every required section when the walk starts

**Status:** OPEN
**Date:** 2026-09-26
**Session context:** [HUMAN-RETEST] the absence record, FULL tier, five walkers fanned out; numbered past the parallel branches' logs (highest seen elsewhere: 285).
**Skill:** internal — the bug-check standing order (`raptor-port/docs/bug-check-order.md` §9) and the walker brief template
**Type:** internal
**Phase/Area:** the evidence sheet, written during the walk

**Issue:** The sheet was opened with §0 (status), §1 (the eight answers), §2 (scope) and §3 (findings) and grew only where findings landed. The sections §9 requires — the consolidated roll-call with no blank cell, the orders walked, the break tests, errors seen, what was NOT walked, the gate counts — did not exist until the close, when they had to be assembled from six separate walk records. Each walker had kept its own roll-call rows, so nothing was lost, but the consolidated table (the owner's check 3 in §9) was a closing-time job, and a blank row could only be seen then.

**Suggested improvement:** When the evidence sheet is created, lay down EVERY §9 section as an empty heading, and the roll-call table with one row per surface and its columns already drawn. Each walker's hand-back then fills rows of the ONE table (the host copies them in as each report lands), so a row nobody walked is visible as a blank during the walk, not at the report. Add the skeleton to the walker brief template.

**Principle:** A required output format is scaffolded at the start, so a missing part shows as a visible gap while there is still time to fill it, instead of being discovered when the work is being closed.

### Observation 294: A red-first test that reproduces the symptom in the wrong environment passes a fix the app still fails

**Status:** OPEN
**Date:** 2026-09-26
**Session context:** [HUMAN-RETEST] the absence record; a phone finding (a held finger's trailing tap closing the sheet it opened) fixed red first, then re-walked on the rebuilt app. Numbered past the parallel branches' logs (highest seen elsewhere: 293).
**Skill:** internal — the bug-check standing order (`raptor-port/docs/bug-check-order.md` §8.4, "red first") and the executor's fix loop
**Type:** open-source
**Phase/Area:** fixing a walk finding; the red-first test

**Issue:** The fix's test went red before and green after, and the defect survived in the running app at every hold length. The test drove the gesture machine on a bare DOM: no sheet mounted, and the test environment has no `matchMedia`, so the touch-only listener that actually closed the sheet (a second document listener the open sheet installs on a coarse pointer) was never present. The test reproduced the symptom's first cause (a timing window) and missed the second (a sibling listener on the same node that `stopPropagation` does not stop). Only the re-walk on the rebuilt bundle caught it.

**Suggested improvement:** When a finding's evidence came from a device-specific walk (phone, touch, a coarse pointer), the red-first test must mount the real surface the walk saw (the sheet, the popup) and stub the environment switch the code branches on (`matchMedia('(pointer: coarse)')`), or it is renamed to say what it proves. And the re-walk of such a fix is never skipped on the strength of the unit test.

**Principle:** A test proves a fix only in the environment it reproduces; when the defect was found on a specific device, the test must stand up that device's branches, or the walk remains the only proof.

### Observation 295: A test of an ABSENCE passes before the feature exists unless it first asserts the precondition was reached

**Status:** OPEN
**Date:** 2026-09-27
**Session context:** Building D260–D262 on the absence-record branch (the Leave War's one-chip Move); red-first tests written before the code. Numbered past every open branch's log (highest seen: 294 here, 282 elsewhere).
**Skill:** test-driven-development (the "watch it fail" step)
**Type:** open-source
**Phase/Area:** RED — verifying the new tests fail for the right reason

**Issue:** Of 27 new tests for a new "move mode", 10 passed before any code was written. Several of them asserted that something was GONE after an action ("the move banner is gone after Undo / a stage change / leaving the page / a click outside the grid"). Before the feature existed, the step that should have ENTERED move mode silently did nothing (the button was still disabled), so the banner was never there, and "gone" was trivially true. The red run looked healthy (17 red) and hid 5 tests that could never have caught their own regression.

**Suggested improvement:** In the RED step, read every test that passed and ask whether it passed for the right reason. For any assertion of absence, assert the precondition first in the same test (e.g. `expect(banner).toBeTruthy()` right after entering the mode, then the action, then `expect(banner).toBeNull()`). Then break the feature once (the break test) and confirm each such test goes red.

**Principle:** An assertion that something is absent proves nothing unless the same test first shows it was present; a red run is judged by the tests that passed as much as by the ones that failed.
