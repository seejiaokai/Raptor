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

### Observation 279: A ready-to-paste opening line must not carry a bracketed choice the owner has to edit

**Status:** OPEN
**Date:** 2026-09-26
**Session context:** `[ACCOUNTS-NEW-PERSON]` — the new chat opened with the handoff's pasted line.
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** the ready-to-paste opening line for the next chat

**Issue:** The previous chat's handoff gave the owner an opening line reading "The mock-up … is approved [or: change X]. Build …". He pasted it as it stood, bracket and all, so the new chat had to guess whether he approved the mock-up or meant to name a change. It read it as approved (no change was named) and said so, but an approval gate was left resting on an unedited template.

**Suggested improvement:** In session-handoff's closing step (the ready-to-paste line), when the next step waits on a decision of his, give one complete line per answer ("If you approve it: …" / "If you want a change: tell me the change, then …"), never a single line with a bracketed alternative to fill in.

**Principle:** A non-technical user pastes a handoff prompt exactly as given. Any placeholder or bracketed alternative in it will reach the next session unedited, so every line must already be a complete, true instruction.

### Observation 280: A walk step's picture must show what the step asserted — never close the thing inside the step

**Status:** OPEN
**Date:** 2026-09-26
**Session context:** `[ACCOUNTS-NEW-PERSON]` fix round — re-walking the approve form's note after Fable's code read #1
**Skill:** New skill candidate / project method: `raptor-port/docs/bug-check-order.md` §7 (the walk) and the handpass drivers (`scripts/handpass/*.mjs`, the shared `step()` shape)
**Type:** open-source
**Phase/Area:** the scripted walk — its evidence pictures

**Issue:** The walk's `step(id, what, fn)` takes its picture AFTER `fn` returns. The approve-note steps opened the approve form, read the note, then pressed Cancel inside `fn` — so the saved pictures showed the plain waiting list, not the note they asserted. Two walks (47/47) and a code reviewer then cited those pictures as the note's evidence; nobody noticed they showed nothing of it. Numbered past 279 on this branch; the two parallel worktree chats sat at 278, so a clash at merge is renumbered per the skill's parallel-branch rule.

**Suggested improvement:** In bug-check order §7 (and a comment on the drivers' `step()`), one line: "a step leaves on screen what it asserted — close a dialog at the START of the next step, not inside this one; when reading a re-walk's pictures, open each picture a step's claim depends on and check it shows the claim". Optionally `step()` could take the picture before any cleanup callback the step returns.

**Principle:** Evidence captured after cleanup proves nothing about the state before it — a screenshot must be taken while the asserted state is still on screen, and a reviewer citing a picture must look at it, not at its filename.

### Observation 281: Break tests go in a scratch checkout while reviewers read the working copy

**Status:** OPEN
**Date:** 2026-09-26
**Session context:** `[ACCOUNTS-NEW-PERSON]` fix round — break tests run while Fable and Astra did a read-only fix check in the background
**Skill:** New skill candidate / project method: `raptor-port/docs/bug-check-order.md` §8.4 (red first, and the break test)
**Type:** open-source
**Phase/Area:** break tests run in parallel with independent code reads

**Issue:** Break tests edit source on purpose. Run in the working tree while two reviewers were reading it, a reviewer could have read a deliberately broken file and reported it (or trusted it). They were run instead in a detached `git worktree` of the committed fix, with its `node_modules` a junction to the main checkout's, by one script that applies each break, runs the named test files, records the red tests and restores the file byte for byte — 27 breaks with the reviewers never exposed to one.

**Suggested improvement:** Bug-check order §8.4: "break tests never run in a checkout someone else is reading — commit first, then break in a scratch worktree (a junction for the installed packages)"; keep the runner shape (find exactly once → break → run → restore → record) as a reusable script under `scripts/handpass/`.

**Principle:** Deliberate fault injection must be isolated from every concurrent reader of the same files; commit the good state first so the break is always one restore away.

### Observation 282: A break test that stays green may be aimed at the wrong tests — find the one that boots the real wiring before writing a new one

**Status:** OPEN
**Date:** 2026-09-26
**Session context:** `[ACCOUNTS-NEW-PERSON]` break tests — "a new person survives a reload" (removing the roster's save inside the add command)
**Skill:** New skill candidate / project method: `raptor-port/docs/bug-check-order.md` §8.4 (the break test)
**Type:** open-source
**Phase/Area:** choosing which tests a deliberate break is run against

**Issue:** The break of the roster's save stayed GREEN. The rule says "nothing went red → that surface has no test, by proof — write one". But the break had been run only against the feature's own unit files, whose store has no storage behind it (the save writes to a whiteboard that is null in those tests), so they could never see it. A storage-wiring test (`txn-wiring.test.ts`, which boots the real storage stack) already asserted the saved roster — run against it, the same break went red at once. A second break matched its target text twice and was skipped rather than run. Both would have read as "tested" or "untested" wrongly without a look.

**Suggested improvement:** Bug-check order §8.4: "a break that stays green is first a question about WHICH tests were run: search the whole suite for an assertion on that surface (especially tests that boot the real storage / wiring) and re-run the break against it before writing a new test; a break whose target text is not unique is re-targeted, never counted". The runner should refuse a non-unique match (it does: find must match exactly once).

**Principle:** A negative result from fault injection is only as good as the observer you pointed at it — before concluding "no test covers this", confirm the break was run against every test able to see the layer it cut.

### Observation 283: A republish must carry every file that differs from the published copy, not only this chat's

**Status:** OPEN
**Date:** 2026-09-27
**Session context:** Trimming the approved post-out mock-up's words (D300) and republishing it to its existing Artifact link.
**Skill:** New skill candidate: live-app mock-ups (Playwright) (see Observations 241, 242, 243, and the Playwright one)
**Type:** open-source
**Phase/Area:** republishing a multi-file page (the page plus its pictures)

**Issue:** The previous chat redrew two pictures in the repo but did not republish (its handoff said so). This chat changed six more. Listing the Artifact's published files (with their sizes) before publishing showed the two earlier pictures were still the old ones live, so all eight went up. Had the publish carried only this chat's six, the live page would have shown the old post-out sheet under text describing the new one.

**Suggested improvement:** In the mock-up workflow: before any republish, list the page's published files and compare each with the local copy (size is enough to flag a difference); pass every file that differs, whoever changed it. After a redraw, `git status` on the picture folder is the other half: it names exactly which pictures the redraw changed, so nothing unchanged is re-uploaded and nothing changed is missed.

**Principle:** When a published copy and a working copy can drift across sessions, a republish is a sync of the whole set against what is live, not an upload of what this session touched.

### Observation 284: Diff the other open branches before planning — an overlap decides the build order

**Status:** OPEN
**Date:** 2026-09-27
**Session context:** Planning [POST-OUT-OUTCOMES] while two other chats had open PRs on the same repo.
**Skill:** writing-plans (and the claudex-loop planning step)
**Type:** open-source
**Phase/Area:** before the plan is written — scoping the files a feature will touch

**Issue:** The feature had to extend the posting-out code. A quick `git diff --name-only $(git merge-base origin/main <branch>) <branch>` over the other two open branches showed one of them had already reworked exactly that code (a single route for every posting door, a new "made by the post out" mark, undo taking back only its own archive). Planning against main's version would have produced a large merge conflict and, worse, two changes that each work but disagree. Knowing it at plan time let the plan split the build (the parts in no other branch's files first; the overlapping part on the other branch's code) and let the chats agree who touches what before any code was written.

**Suggested improvement:** In writing-plans: a step before the design — list the other open branches (open PRs, worktrees), diff their changed files against the files the plan will touch, and for each overlap write in the plan which version the build sits on and in what order; tell the other chat (or its owner) what you will and will not change there.

**Principle:** Parallel work fails at the merge, but the collision is visible at the plan: compare the files every open branch changes before deciding what to build first, and settle overlaps between the workers before either writes code.

### Observation 285: A guard hook built on an unmeasured claim about the harness

**Status:** OPEN
**Date:** 2026-09-26
**Session context:** five-flags batch, [BG-GUARD-FALSE] (numbered 285, past 279 on the parallel `claude/accounts-new-person` and a gap for the absence-record chat)
**Skill:** New skill candidate: guard hooks in `.claude/hooks/` (how a PreToolUse guard is written and tested)
**Type:** open-source
**Phase/Area:** writing a hook that encodes an environment fact

**Issue:** A background-command guard was built on the project note "a background shell starts at the REPO ROOT". Another chat, whose session had started inside the sub-folder, was refused and then misled by the guard's own advice. Measuring it (a foreground `cd`, then a background `pwd`) showed background shells start in the chat's STARTING folder, not the repo root and not the foreground's current folder.

**Suggested improvement:** When a hook or rule encodes how the harness behaves (where shells start, what env vars exist, what a tool returns), measure it in the current harness first, write the measurement into the hook's header, and make the hook's tests take the environment as an explicit input (so they pass from any starting folder).

**Principle:** An environment fact written as a rule is a claim until it is measured in the environment the rule runs in; a guard built on an unmeasured claim refuses the wrong things and gives wrong advice with authority.

### Observation 295: A walk script's NOTE that states the state goes stale the moment a fix changes it

**Status:** OPEN
**Date:** 2026-09-27
**Session context:** five-flags batch, the re-walk after the code reads (numbered 295, past 294 on the parallel `claude/absence-record-d147-af6a50`)
**Skill:** New skill candidate: bug-check order (raptor-port/docs/bug-check-order.md) — §5 "the re-walk", the walk scripts in `raptor-port/scripts/handpass/`
**Type:** open-source
**Phase/Area:** walk scripts written as assertions, re-run as the re-walk

**Issue:** The first walk wrote its "report, don't judge" findings as NOTE lines whose TEXT described what it saw ("the purple ring AND its purple glow stay under the dots"). A reviewer's later finding removed that glow. On the re-walk the script printed the same sentence beside data that now read "no blur layers" — the log said the opposite of the measurement, and every check still passed, because a note is never judged. Only reading the raw values caught it.

**Suggested improvement:** In §5's re-walk paragraph (and the walk brief): a NOTE's words are built from what was measured (a ternary on the reading), never a fixed description; and once a reviewer's finding is fixed, the note that observed it becomes a CHECK asserting the fixed behaviour before the re-walk runs — so the re-walk proves the fix instead of printing the old story.

**Principle:** Anything a script prints as a description of the screen must be computed from the screen; a hard-coded observation is a comment that vouches, and a re-run makes it lie.

### Observation 296: A mock-up picture whose premise is hand-set state must check the premise at the moment it is taken

**Status:** OPEN
**Date:** 2026-09-27
**Session context:** five-flags batch, the mock-up for his look (`raptor-port/scripts/handpass/am/mk-five-flags.mjs`)
**Skill:** New skill candidate: the mock-up recipe (`raptor-port/docs/mock/`, `scripts/handpass/am/mk-*.mjs` — pictures of the real app with the proposal injected)
**Type:** open-source
**Phase/Area:** drawing a proposal onto the running app

**Issue:** To picture "your own puck" for other men, the script put the app's "this is you" class on their pucks, then called the usual close-up helper — which scrolls the target into view. The scroll repainted the day and silently stripped the hand-set class, so two "today" pictures showed a plain puck beside "after" pictures that were right. The pictures looked plausible; only comparing each pair by eye caught it.

**Suggested improvement:** In the mock-up recipe: do every scroll first, apply the injected state last, and have the capture step assert the state is still there (log a WARNING into the output, or refuse the picture) — the same way the walk scripts assert what they photograph.

**Principle:** When a picture's meaning depends on state you injected, the premise is part of the picture: verify it at capture time, after anything that can repaint, or the picture silently shows something else.

### Observation 297: A visual change filed as a defect by a walker was built and FULL-checked before he saw a picture — and he rejected it on sight

**Status:** OPEN
**Date:** 2026-09-27
**Session context:** five-flags batch, item 4 ([VIEW-ARROW-OVER-LIST]): the desktop week's room beside the ‹ arrow
**Skill:** New skill candidate: bug-check order (raptor-port/docs/bug-check-order.md) — where a mock-up sits for a change the owner did not ask for
**Type:** open-source
**Phase/Area:** before building a visual change

**Issue:** A walker filed "the floating arrow covers the start of an opened warning list" as a defect. It was built in a batch, walked by four walkers, read by two models and taken through the full gates — five older browser tests had to be re-pointed at the new front. Shown the result full screen beside the old look, the owner chose the old one ("I still prefer these"); the whole change now comes out again. The house rule (a picture before product code for a visual direction) was read as applying to his own asks, not to a walker's finding that changes how a surface he uses every day looks.

**Suggested improvement:** In the bug-check order (or the look card's rules): any item that changes the LOOK or LAYOUT of a surface he uses daily — whoever filed it, and even when it is framed as a defect — gets a full-screen before/after picture put to him before it is built. The look card then carries only questions about behaviour.

**Principle:** Whether a visual change is an improvement is the user's call, not the finder's; show the whole screen before and after before paying for the build and the check.

### Observation 298: A walk script's picture folder must default to its OWN checkout, never an absolute worktree path

**Status:** OPEN
**Date:** 2026-09-27
**Session context:** re-walking the five-flags batch after building D270–D272 and reverting the arrow room, in a different worktree folder from the one that wrote the walk scripts
**Skill:** bug-check order (raptor-port/docs/bug-check-order.md §7.2, the walk drivers in raptor-port/scripts/handpass/)
**Type:** internal
**Phase/Area:** the re-walk — "write walk scripts as assertions of the RIGHT behaviour so re-running them IS the re-walk"

**Issue:** ff-w1.mjs and ff-w3.mjs defaulted their picture folder to an ABSOLUTE path inside the worktree that wrote them (`.claude/worktrees/five-flags-batch-build-ef7d85/...`). By the next day that folder had been reused by ANOTHER chat for a different branch, so a plain re-run from this chat's worktree would have written its re-walk pictures into the other chat's checkout (and its git status). Caught only because the header was read before running; fixed by defaulting to `new URL('../../docs/img/handpass/…', import.meta.url)` and passing FF_SHOTS explicitly. The shared libs (`am/w2-lib.mjs`, `am/w1-lib.mjs`) still hard-code the MAIN checkout for their fixture state files.

**Suggested improvement:** in bug-check-order §7.2 (or `docs/handpass/README.md`'s traps), one line: a walk script resolves every path it WRITES relative to itself (`import.meta.url`), never an absolute worktree path; reads of shared fixtures name their source. And a quick grep in the docs gate for `.claude/worktrees/` inside `scripts/handpass/*.mjs` write paths.

**Principle:** A script meant to be re-run later must not remember WHERE it was first run — worktree folders are reused by other sessions, so any absolute path into one is a write into someone else's work.

### Observation 299: A walk step that proves a REFUSAL must also prove the gesture happened

**Status:** OPEN
**Date:** 2026-09-27
**Session context:** walking D271 (a man put on a row he is already on is refused) — scripted drags whose expected outcome is "nothing written"
**Skill:** bug-check order (raptor-port/docs/bug-check-order.md §7.8, §8)
**Type:** open-source
**Phase/Area:** the walk — gesture steps whose correct result is NO change

**Issue:** Three walk parts (a move from another row, a finger drag on the phone, a drop on the edit week) came back "nothing written" — exactly what a refusal looks like — while the press had in fact landed off the screen (the source below the fold) or been let go over the tab bar: no ghost ever rode the pointer. Only the missing toast gave it away; had the check read just the data ("both rows as they were, 0 pending"), all three would have PASSED on a drag that never happened. Fixed by requiring a ghost (`!!h.ghost`) and the refusal's own caption before the data check counts.

**Suggested improvement:** §7.8 ("a gesture step asserts what the person SEES") gains a line: when the correct outcome of a gesture is that NOTHING changes (a refusal, a no-op), the step must also assert positive evidence that the gesture was performed — the drag ghost, the caption under it, the refusal's own words — or a missed press passes as a correct refusal.

**Principle:** An assertion that "nothing changed" cannot tell a correct refusal from an action that never happened; pair every negative outcome with positive proof the action was attempted.

### Observation 300: Check the message the screen is LEFT showing, not the list of messages raised

**Status:** OPEN
**Date:** 2026-09-27
**Session context:** D271's hand-over fix — a note raised inside a shared save path ("kept once, as its holder")
**Skill:** bug-check order (§7.8) and test-driven-development (assertions on user-visible state)
**Type:** open-source
**Phase/Area:** the walk / the test spy

**Issue:** The unit test and the first walk both captured every toast raised (a spy on the toast hook) and found the note among them — PASS. The screen, which has ONE toast slot, showed "Input updated" instead: the caller's own success line followed the save and replaced the note in the same tick. Only a walk step reading the toast element's final text caught it. Fixed by raising the note on the next tick and asserting on the element's text and opacity; the unit test now asserts the note is the LAST message.

**Suggested improvement:** where the UI has a single-slot surface (a toast, a banner, a status line), tests and walk steps assert what the slot SHOWS after the whole action, not that a message was emitted; and a message raised deep in a shared path is checked against every caller's own follow-up message.

**Principle:** Emitting a message is not showing it — assert on the final visible state of a single-slot surface, because a later message in the same action silently wins.


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

### Observation 301: A test of an ABSENCE passes before the feature exists unless it first asserts the precondition was reached

**Status:** OPEN
**Date:** 2026-09-27
**Session context:** Building D260–D262 on the absence-record branch (the Leave War's one-chip Move); red-first tests written before the code. Numbered past every open branch's log (highest seen: 294 here, 282 elsewhere; renumbered from 295 at the merge with main, which had its own 295).
**Skill:** test-driven-development (the "watch it fail" step)
**Type:** open-source
**Phase/Area:** RED — verifying the new tests fail for the right reason

**Issue:** Of 27 new tests for a new "move mode", 10 passed before any code was written. Several of them asserted that something was GONE after an action ("the move banner is gone after Undo / a stage change / leaving the page / a click outside the grid"). Before the feature existed, the step that should have ENTERED move mode silently did nothing (the button was still disabled), so the banner was never there, and "gone" was trivially true. The red run looked healthy (17 red) and hid 5 tests that could never have caught their own regression.

**Suggested improvement:** In the RED step, read every test that passed and ask whether it passed for the right reason. For any assertion of absence, assert the precondition first in the same test (e.g. `expect(banner).toBeTruthy()` right after entering the mode, then the action, then `expect(banner).toBeNull()`). Then break the feature once (the break test) and confirm each such test goes red.

**Principle:** An assertion that something is absent proves nothing unless the same test first shows it was present; a red run is judged by the tests that passed as much as by the ones that failed.

### Observation 302: A guard against an accident must key on what makes it an accident, and the builder's own tests cannot see the harm of a guard they were written around

**Status:** OPEN
**Date:** 2026-09-27
**Session context:** D262 (the Leave War's one-chip Move) — a guard against a double-click on "Move" landing the chip; numbered past every open branch's log (highest seen: 295 here, 282 elsewhere; renumbered from 296 at the merge with main, which had its own 296).
**Skill:** test-driven-development (and the executor's red-first loop)
**Type:** open-source
**Phase/Area:** designing a guard; which tests can falsify it

**Issue:** To stop a double-click's second click from landing the picked-up item, the first cut ignored EVERY click for 400 ms after the mode began. All the new unit tests passed — because every one of them, written by the same author, waited 420 ms before its deliberate click (encoding the guard's own assumption). The full browser suite then failed one OLDER test, written months before the guard, that clicks a landing day straight after "Move": a fast deliberate click was silently dropped. The accident (the second click of a double-click) differs from the deliberate act by PLACE (it lands where the first click did), not only by time; the fix keyed the guard on both.

**Suggested improvement:** (1) When adding a guard that suppresses user input, write down what distinguishes the accident from the intended act (time, place, target, pointer type) and key the guard on the narrowest such property, with one test of the accident AND one test of a fast legitimate act that must still pass. (2) Run the pre-existing suites that exercise the same surface EARLY (right after the guard is added), not only at the final gate — they were written without knowledge of the guard, so they are the tests able to falsify it.

**Principle:** Tests written alongside a guard inherit its assumptions and cannot expose its cost; the older tests of the same surface are the independent check, and a guard should discriminate on the property that actually defines the accident, not on a proxy like elapsed time.

### Observation 304: A new write path's unit tests read the live model — none read the saved copy — and the delete was never saved

**Status:** OPEN
**Date:** 2026-09-27
**Session context:** `[POST-OUT-OUTCOMES]` FULL check, the walk of a delete from Admin → Users (numbered past 296, the highest on this branch and on PR #444's pushed head)
**Skill:** internal — the Raptor bug-check order (`raptor-port/docs/bug-check-order.md` §8)
**Type:** internal
**Phase/Area:** §8 "making the checks find" — tests of a new writer

**Issue:** Seventeen unit tests of a new multi-store delete all passed; every one read the live in-memory model. The walk planted a man on two future days, deleted him, reloaded — and he was back: the command never took the schedule's save step (the deferred `HOOKS.histPush`), so the week on screen was never written to storage. No test looked at what was saved, so nothing could go red.

**Suggested improvement:** Add to §8: every NEW writer (a command, a pass, a door) gets at least one test that reads the SAVED copy (wire a Whiteboard with `wirePersist`, act, read `wb.get(...)`) — not only the live model. And the walk's reload step stays mandatory for any change that writes.

**Principle:** A test of a write that never reads back what was persisted proves the memory, not the save; for every new writer, assert on the stored copy at least once.

### Observation 305: Line endings measured with Git Bash `grep -c $'\r$'` misreport — and a normalise-to-CRLF edit rewrote three LF files

**Status:** OPEN
**Date:** 2026-09-27
**Session context:** `[POST-OUT-OUTCOMES]`, scripted edits to Leave War files; a parallel chat then raised the same false alarm
**Skill:** internal — memory `python-edits-crlf-trap` (the scripted-edit recipe)
**Type:** internal
**Phase/Area:** scripted file edits on the Windows desktop; checking a commit before push

**Issue:** A script that normalised a file to LF, edited it, and wrote it back with CRLF was applied to three files that are LF on `main`, committing a 15,000-line endings-only diff. The check used (`grep -c $'\r$'` in Git Bash) reported every line of those LF files as CRLF, so it could neither prevent nor catch it; a parallel chat used the same count and warned the fix was wrong. Raw byte counting (node over `git cat-file -p`) settled it.

**Suggested improvement:** In the recipe: decide each file's ending from `main`'s stored bytes before writing (node: `execFileSync('git',['cat-file','-p','origin/main:<f>']).includes(13)`), keep that ending, and before every push compare `git show --stat` with `git show --stat --ignore-cr-at-eol` — a gap is ending churn.

**Principle:** Measure line endings in raw bytes, never with a tool that may translate them; and check each commit's size with and without ending differences.

### Observation 303: A branch built on another chat's in-flight branch must re-take that branch's FINAL head before its own final gates — and a timing-window test can be green under a loaded full run yet red alone

**Status:** OPEN
**Date:** 2026-09-27
**Session context:** `[POST-OUT-OUTCOMES]` (claude/post-out-outcomes, PR #446), built on PR #444's posting code by merging #444's branch mid-way (its head then, 7b6c4a21). Numbered 303, past main's 300 and #444's 302 (the "parallel branches are parallel writers" rule).
**Skill:** New skill candidate: parallel-branch stacking (and the bug-check order's §gates)
**Type:** open-source
**Phase/Area:** building on a sibling branch; the final gates

**Issue:** #444 kept working after I merged it — its final code-read fixes changed a Leave War move rule (a click on the same spot straight after "Move…" is now a double-click and lands nothing) and reworded the unit test that pins it, and it cherry-picked a CI fix for three browser tests. My branch carried the half-way state. My own full local gate run was ALL GREEN on it, but GitHub went red on the unit test and the three browser tests, and a single-file run locally was red three times out of three. The unit test depends on a time window: under the load of the full suite the two clicks were far enough apart to pass; alone, on a fast run, they were not. Bisect: my code alone green, #444's final head green, #444's half-way head red on its own.

**Suggested improvement:** (1) When a branch has merged in another open branch, compare that branch's current head with the merged commit (`git log <merged>..origin/<branch> -- <src dirs>`) before the final gates and before reporting ready; re-merge if code moved. (2) When CI and a local full run disagree, run the failing file ALONE before blaming CI speed — a test with a time window can fail on a FAST run and pass under load, the reverse of the usual flaky.

**Principle:** Code taken from a sibling branch is a snapshot of work still moving. Re-check the sibling's head before calling your own work checked. A green full run is not proof a timing-sensitive test passes: load can hide a failure that shows when the test runs quickly.

### Observation 306: A data-shape ruling is planned from a verdict inventory, and the old fields keep meaning "the current one"

**Status:** OPEN
**Date:** 2026-09-27
**Session context:** [ONE-DOOR] plan — the owner ruled (D320) that the Leave War keeps every stint a man has in the squadron, where the code modelled ONE in/out window read in ~30 places. Numbered 306–309 by agreement with the parallel [LW-MOVE-STANDARD] chat (310–319).
**Skill:** writing-plans
**Type:** open-source
**Phase/Area:** planning a change to a widely-read record

**Issue:** The ruling touched a field read by dozens of call sites across two apps. A read-only sweep that returned a TABLE — file:line, the expression read, what it decides, and a verdict (only asks the shared predicate = stays right; reads the field directly for a range = must change; unsure + why) — made the design choice obvious: keep the existing fields meaning the CURRENT instance and add the history beside them, so every reader that asks about "now" stays untouched and only the dozen verdict-NEEDS-CHANGE sites move. Without the verdict column the list would have been a grep dump.

**Suggested improvement:** In writing-plans, add a step for any change to a record's shape or meaning: commission (or do) a read-only inventory of every reader AND writer with a per-site verdict column, and prefer the design in which existing fields keep their current meaning and new meaning is added beside them. Put the inventory's NEEDS-CHANGE list into the plan as a table, and pin the "unchanged" half with tests.

**Principle:** When a ruling changes what a widely-read field means, classify every reader first; choose the shape that leaves the most readers correct by construction, and plan only the ones the inventory says must move.

### Observation 310: A docs-only branch cannot pass the document gate while a shared file on main is already over its tripwire

**Status:** OPEN
**Date:** 2026-09-27
**Session context:** `[LW-MOVE-STANDARD]` — the mock-up committed before any code (the house rule: a picture first). Numbered 310, leaving 306–309 for the parallel `[ONE-DOOR]` chat (the "parallel branches are parallel writers" rule).
**Skill:** New skill candidate: the mock-up recipe (`raptor-port/docs/mock/`, `scripts/handpass/am/mk-*.mjs`) — and the document gate's ceiling rule (`raptor-port/scripts/docsize.mjs`)
**Type:** internal
**Phase/Area:** committing a mock-up (docs and a script, no `raptor-port/src`) for his approval

**Issue:** `OUTSTANDING.md` on `main` was already 122 lines over its 1330 ceiling (two earlier merges carried code, so the gate only DEFERRED it). The mock-up's commit adds a 5-line note to its backlog item and touches no `src`, so `docsize` fails it: "a docs-only change IS the trim pass". The same holds for every chat that opens a mock-up-only pull request — each would have to do the whole backlog tidy (a shared file two parallel chats both edit) or wait for code. Here the branch was pushed with no pull request (no GitHub check runs on a plain branch push), deferring the question to the first code commit.

**Suggested improvement:** When a merge leaves a tier-0 file over its ceiling "deferred", file the docs-only tidy as its own backlog item with an owner and a place in the order at once, and say in the handoff that every docs-only PR is blocked until it lands. In the mock-up recipe: push the mock-up branch without a PR while the gate is red for a file the mock-up did not grow; open the PR with the first code commit.

**Principle:** A deferral that is legal on one change becomes a blocker for the next change of a different kind; whoever defers must file the debt where the next writer will meet it.

### Observation 311: A scripted "replace everything between two anchors" edit silently deleted a function that lived between them

**Status:** OPEN
**Date:** 2026-09-27
**Session context:** `[LW-MOVE-STANDARD]`, rewriting the Leave War store's move functions by a script that swapped the text from one comment to the next anchor (the file is CRLF, so the Edit tool was avoided). Numbered in this chat's agreed range (310–319).
**Skill:** internal — memory `python-edits-crlf-trap` (the scripted-edit recipe)
**Type:** internal
**Phase/Area:** scripted edits of large source files

**Issue:** The span chosen ran from the first move function's comment to a later, unrelated function — and a door that still had callers (`moveAbsenceById`) sat inside it. The new text did not carry it, the typecheck passed (its callers were only tests and a component being rewritten), and only the older test files that call it caught the loss. Separately, Bash heredocs holding TSX (backticks, `${…}`, unbalanced apostrophes) failed to parse through the tool twice; writing the script with the Write tool and running it worked every time.

**Suggested improvement:** Before a span replacement, list every top-level declaration inside the old span (`grep -n "^export function\|^function\|^const\|^export type" <span>`) and check each is in the new text or deliberately retired, in the edit script itself (assert). Put multi-line code edits in a script file written with the Write tool, never in a heredoc.

**Principle:** A span edit replaces everything in the span, including what you did not mean to touch; enumerate what the span held before you replace it.

### Observation 312: Stopping "my" background run by process NAME killed a parallel chat's run too — and the fact that would have avoided the restart was already in memory

**Status:** OPEN
**Date:** 2026-09-27
**Session context:** `[LW-MOVE-STANDARD]`, the final code reads; a parallel chat (`[ONE-DOOR]`) works on the same PC. Numbered in this chat's agreed range (310–319).
**Skill:** internal — memory `astra-codex-cli-available`; the parallel-chats rule (D302, `.claude/rules/shipping.md`)
**Type:** internal
**Phase/Area:** running the cross-provider read; process hygiene on a shared machine

**Issue:** Astra's first run failed in seconds (the Codex config's default model is refused on this account). The working model was already written in the memory note, but the note was not opened before experimenting, so a run was started on a weaker model and then stopped to restart on the right one — with `taskkill /IM codex.exe`, which ended every Codex process on the PC, including one that may have been the parallel chat's. The other chat was told at once.

**Suggested improvement:** (1) Before invoking any external CLI reviewer, open its memory note (it holds the exact working command). (2) On a PC shared by parallel chats, stop a background job only by ITS OWN id (the harness's task id or the PID captured at launch), never by an image name or command pattern — the same rule the project already applies to preview servers ("kill by PORT, never by a command-line pattern"), extended to every process.

**Principle:** On shared infrastructure, a cleanup must name the one thing it started; anything broader destroys someone else's work silently.

### Observation 313: A walk script that presses a leave chip directly trips the sheet's "below zero — tap again" ask, twice in one session

**Status:** OPEN
**Date:** 2026-09-27
**Session context:** `[LW-MOVE-STANDARD]` walk scripts (`scripts/handpass/ms/`). Numbered in this chat's agreed range (310–319).
**Skill:** New skill candidate: the Leave War walk helpers (`scripts/handpass/ab/ab-lib.mjs`, `mv/mv-lib.mjs`)
**Type:** internal
**Phase/Area:** building a Leave War fixture through the app's own controls

**Issue:** `bidOn` answers the negative-balance confirm ("That takes X to -1 … Tap the same leave again"), but a step that picks a range or a portion first and then presses `bid-LL` with `sheetPress` does not — the sheet stays open asking, the fixture silently lacks its bid, and the step fails far from the cause (a THREW on a later click; a banner counting the wrong records). It cost two debugging probes, each time reading as a possible app defect first.

**Suggested improvement:** Add `pressLeave(page, testid)` to the shared helpers — press, and if the sheet answers "Tap the same leave again", press once more — and use it for every leave chip in a fixture; `bidOn` becomes a caller of it. In the recipe: a fixture step asserts its premise (the record exists) before the step that relies on it.

**Principle:** A fixture helper must answer every confirmation the real control can raise, or fixtures fail silently and the failure is blamed on the code under test.

### Observation 314: A branch name in backticks in a ruling row reads as a missing file to the document gate

**Status:** OPEN
**Date:** 2026-09-27
**Session context:** [LW-MOVE-STANDARD] paperwork after PR #447 merged: marking D264–D267 and D330–D335 built and archiving the two backlog items (the ONE-DOOR chat, running in parallel, holds 306–309; this chat's range is 310–319)
**Skill:** New skill candidate: backlog / rulings paperwork (the repo's archive script and document gate)
**Type:** internal
**Phase/Area:** filing a ruling row's "Where it lives now" cell

**Issue:** The rows were marked "BUILT … on `claude/rulings-d264-d266-leave-war-f0f4ab`". The document gate's homes check reads every backticked text with a slash in a rulings row as a FILE home, so it failed ten rows with "no such file exists". Because the archive script runs the gate after each move and rolls back when it is not clean, both item moves were undone, safely. The older rows (D262, D260) write the branch plainly, "on the branch claude/…", which is why they pass.

**Suggested improvement:** In `record-decisions.md` or at the head of `DECISIONS.md` (the filing steps), add one line: in a "Where it lives now" cell, backticks are for files only; write a branch, PR or commit in plain text. Or teach the homes check to skip a `claude/…` branch-shaped path.

**Principle:** When a checker infers meaning from formatting (backticks = a file path), that formatting convention is part of the checker's contract and belongs where writers read, not only in the checker's code.

### Observation 315: A walk step that asserts "not X" passes silently when the element was never drawn

**Status:** OPEN
**Date:** 2026-09-27
**Session context:** `[ONE-DOOR]` FULL check (numbered past 314, which `claude/lw-move-standard-paperwork` holds)
**Skill:** New skill candidate: bug-check walk scripts (raptor-port/docs/bug-check-order.md §5 "the re-walk", §8)
**Type:** open-source
**Phase/Area:** Writing walk assertions; break tests

**Issue:** The walk checked "counted on this day" as `!/\bgone\b/.test(cellClass || '')`. When the grid hid the whole row, the cell's class was null, the test read `''`, and the step PASSED. It surfaced only because a break test (a build with the row filter broken) left the walk green; with a strict helper (`here()` — the cell must exist AND not be greyed) the broken build failed 6 steps.

**Suggested improvement:** In the bug-check order's walk-script guidance: every negative assertion ("not away", "no corner", "no error line") first asserts the thing it inspects exists; and a surface that a unit test cannot see (layout, a window of drawn rows) gets its break test run against a real build, not only the unit suite.

**Principle:** A negative check is only evidence when its subject is present; assert existence first, and prove a watcher by breaking the wire it watches.

### Observation 316: A break test that turns nothing red can mean the wire is invisible to the test runner, not untested by chance

**Status:** OPEN
**Date:** 2026-09-27
**Session context:** `[ONE-DOOR]` break tests (`od-breaks.py`, 32 wires)
**Skill:** New skill candidate: bug-check break tests (raptor-port/docs/bug-check-order.md §8.4)
**Type:** open-source
**Phase/Area:** Break tests

**Issue:** Three wires turned nothing red. Two got ordinary unit tests. The third — the grid's row filter — returns "draw it" whenever no window of months has been measured, which is always true under jsdom, so NO unit test could ever watch it. The first real-browser check written for it was also blind (the loaded months happened to cover the case). Only a scenario chosen to fall outside every loaded window (a man back next year), run against a build with the wire broken, proved a watcher.

**Suggested improvement:** When a break test stays green, first ask whether the test environment can observe the wire at all (layout, scroll windows, timers, real events); if not, write the watcher in the real browser and prove it against a deliberately broken build before counting the surface as covered.

**Principle:** "Nothing went red" has two causes — no test, or a test environment that cannot see the wire; the second needs a real-browser watcher proved against a broken build.

### Observation 317: The walk had the picture of the defect and asserted only the class

**Status:** OPEN
**Date:** 2026-09-28
**Session context:** `[ONE-DOOR]` — the owner's look found a row outline that skipped the pinned first column
**Skill:** New skill candidate: bug-check walk scripts (raptor-port/docs/bug-check-order.md §7, §10 anti-pattern 21)
**Type:** open-source
**Phase/Area:** Walk assertions; looking at the pictures

**Issue:** The walk step asserted a highlight class was on the row and saved a picture of it. The picture showed the outline starting at the second column — a sticky first cell paints its own background over a row outline — and it was never opened. The owner found it by eye.

**Suggested improvement:** A highlight, outline or mark is asserted as PAINTED on each element it must cover (a computed style per cell, especially pinned/sticky ones), and every picture a step saves is opened before the step counts as looked at. Added to the bug-check order as anti-pattern 21.

**Principle:** A class is intent, not paint; assert what renders on every element it must cover, and a saved picture counts only once someone has looked at it.

### Observation 318: A question he sends mid-run is answered in the very next message, before any more tool calls

**Status:** OPEN
**Date:** 28 Sep 26
**Session context:** the overnight D336 run — waiting on the PR's checks, then planning [DRAFT-PENDING]; he asked "After this is merged what's next" twice, then "So what do u plan to do when I'm sleeping", "Reply me now", "I want to sleep".
**Skill:** New skill candidate: working-while-he-waits (or an addition to session-handoff's overnight section)
**Type:** internal
**Phase/Area:** the gap between his mid-run message and the agent's answer

**Issue:** His first "what's next" arrived while background checks and read-only research ran. The agent answered it in a line and went back to long tool calls (reading rulings, mock-ups, the bug-check order) with only one-line status notes between them; when he asked again, and then what the night would bring, several more tool calls ran before a plain answer. He had to say "Reply me now" and "I want to sleep" — he was waiting on a reply to go to bed.

**Suggested improvement:** When he sends a question mid-run, the very next message answers it in full, plainly, BEFORE another tool call — especially late at night or before an unattended run: what happens next, in order, what he will find in the morning, and that he can go. Status one-liners between tool calls do not count as the answer.

**Principle:** A question from the person waiting on you outranks the work queue: answer first, then resume — a one-line "still working" is not an answer to "what are you going to do".

### Observation 319: Building while the red team reads the same working tree

**Status:** OPEN
**Date:** 28 Sep 26
**Session context:** [DRAFT-PENDING] overnight run — the plan went to Fable and Astra for a blind red team, and steps 1–2 of the build were written in the same checkout while they read.
**Skill:** claudex-loop
**Type:** open-source
**Phase/Area:** the plan-review phase (host waits on the reviewers)

**Issue:** The owner's order was plan → red team → build. While the two reviewers ran (15+ minutes), the host started building the parts it judged "unlikely to change". Both reviewers noticed the working tree changing under them (one read half-built files as the plan's current state), one flagged the deviation from the order, and one finding was answered only because it happened to match what was built. Nothing needed undoing, but the review was partly of a moving target and the order was broken without the owner's say.

**Suggested improvement:** In the review phase, either (a) wait — use the time for read-only work (docs, the walk's fixture design, the roll-call), or (b) build in a separate worktree the reviewers are not pointed at, and say so in the brief. Never edit the checkout the reviewers are reading.

**Principle:** A reviewer should read a fixed snapshot; the host's waiting time goes to work that does not change what is under review.

### Observation 320: A break test must not break the checkout a reviewer is reading at the same time

**Status:** OPEN
**Date:** 2026-09-28
**Session context:** [DRAFT-PENDING] FULL check, overnight — two independent final code reads running in the background while the break tests (bug-check order §5) were about to start
**Skill:** New skill candidate: bug-check-order (raptor-port/docs/bug-check-order.md §5, the break tests)
**Type:** open-source
**Phase/Area:** break tests / running reviews in parallel

**Issue:** The break tests deliberately break one wiring at a time, run the guarding tests, and restore. The two final reviewers were reading the SAME files at the same time, from the same folder — a reviewer that opened a file mid-break would have read broken code and reported it (or, worse, read the fix as missing). Caught before starting: the break tests ran in a separate detached worktree at a SHORT path (the first path, under the session's temp folder, failed on Windows' path-length limit for the repo's long picture names), with node_modules joined in by a directory junction. The same run found that two of the guard-suite file names were wrong (a .tsx that is a .ts, a file under state/ not engine/): the baseline run reported fewer files than listed — so the baseline is also a check on the list itself.

**Suggested improvement:** In the bug-check order's break-test step: (1) when any reviewer or walker is reading the live checkout, break in a separate worktree (short path; node_modules via a junction/symlink), never in place; (2) run the guard suite once unbroken first and compare its file count with the list — a mismatch is a mistyped name, and a break "guarded" by a file that never ran is not guarded.

**Principle:** Deliberate breakage is shared state: do it where no concurrent reader can see it, and prove the guard list runs before trusting its reds.

### Observation 321: A re-walk's picture folder must start empty

**Status:** OPEN
**Date:** 2026-09-28
**Session context:** [DRAFT-PENDING] re-walk after fixing Fable's predicted defects (new walk steps inserted mid-story)
**Skill:** New skill candidate: bug-check-order (raptor-port/docs/bug-check-order.md §7, the evidence sheet's pictures)
**Type:** open-source
**Phase/Area:** walk scripts / evidence

**Issue:** The walk script numbers its pictures in the order it takes them. After new steps were inserted, the re-run wrote "05-clock-icon.png" beside the first run's "05-mon-to-go-out.png", "06-window-tue-new.png" beside "06-week-all.png", and so on — the folder the evidence sheet links to held two runs' pictures under interleaved numbers, and a reader could not tell which picture belonged to the build being reported. Fixed by emptying the folder at the start of every run.

**Suggested improvement:** Any script that writes an evidence folder empties it first (or writes into a per-run folder); the evidence sheet links only a folder written by one run of the build it reports.

**Principle:** Evidence from two runs in one folder is no evidence: one run, one folder.

### Observation 322: A review's fixes are new code — read the fix commit on its own, and cap the rounds

**Status:** OPEN
**Date:** 2026-09-28
**Session context:** [DRAFT-PENDING] FULL check — two blind final reads (12 findings), then narrow reads of each fix commit
**Skill:** New skill candidate: bug-check-order (raptor-port/docs/bug-check-order.md §4 / §5 — after the final reads)
**Type:** open-source
**Phase/Area:** the final code read and what follows it

**Issue:** The final reads' fixes included a rewritten reader (how a Leave War decision on an approved leave becomes one history line). A narrow read of just that fix commit, by both reviewers independently, found two real defects IN the fixes (a split leave read as a move; a posting's own undo went silent) — and a third narrow round, on the fixes of the fixes, found four more (the wrong record id, a gap day marked, an overlapping slide misworded, stale comments). Every one was reproducible red through the real doors. Without the narrow rounds all of them would have shipped behind "all findings fixed, gates green". The rounds converged (Medium → Low severities, both reviewers finding the same things), and the third was declared the last (the ~3-round cap), with the final fixes carried by tests and the re-walk.

**Suggested improvement:** In the bug-check order, after the final reads: when a fix rewrites logic (not a one-line guard), give the fix commit its own narrow read ("is each fix right and complete, and what did it break beside it") by both providers; repeat on each round's fixes up to the ~3-round cap; state in the evidence sheet which round was last and what carries the rest.

**Principle:** A fix is new code with the same odds of being wrong as the code it fixes; "all findings fixed" is a claim about the findings, not about the fixes.

### Observation 323: A scripted cut must anchor on text that is unique AFTER the insert too

**Status:** OPEN
**Date:** 2026-09-28
**Session context:** [DRAFT-PENDING] handoff — one script replaced this chat's HANDOFF block, then cut the "## Gate baseline" section to rewrite it
**Skill:** session-handoff (and any skill that edits shared docs by script)
**Type:** open-source
**Phase/Area:** editing a shared document programmatically

**Issue:** The script inserted the new block first, then located the section to replace with `index('## Gate baseline')` — but the new block itself mentioned "`## Gate baseline`", so the index landed INSIDE the new block and the cut to "## Standing constraints" silently deleted the rest of the block, another chat's whole block, and "## Next, in order". Caught only because the structure (headings and block markers) was listed after the write. Recovered by restoring the file from the last commit and redoing the edit anchored on "\n## Gate baseline\n" (a heading at line start), with an assertion that the cut runs forward.

**Suggested improvement:** For any scripted cut in a shared document: anchor on a line-start heading or a marker, assert exactly one match in the CURRENT text (after earlier edits in the same script), assert the cut's start precedes its end, and list the document's headings/markers after writing. Prefer doing the cut before any insert that could repeat the anchor.

**Principle:** An anchor unique before an edit can stop being unique after it; check uniqueness against the text you are actually cutting, and verify the structure after every scripted rewrite of a shared file.

### Observation 324: A test that flakes only on CI may be the app's layout moving under it — measure the geometry ON the CI machine, per frame, before touching the test

**Status:** OPEN
**Date:** 2026-09-28
**Session context:** [LW-FIGSEL-FLAKE] — a browser drag test selected 5 or 1 cells instead of 3 on about half of GitHub's runs, never on the dev PC, even with the CPU throttled six-fold.
**Skill:** systematic-debugging
**Type:** open-source
**Phase/Area:** Phase 1 (root-cause investigation) — reproducing environment-only failures

**Issue:** The backlog's own lead was a timing race (a redraw mid-selection), and the natural fixes on offer were "make the test wait" or "retry". The real cause was environmental LAYOUT, not timing: a transient status pill ("Saving…") appeared/disappeared in a wrapping flex top bar after every change; on the CI runner's wider Linux fonts the bar had ~18px to spare against the pill's ~90px, so it wrapped to two lines and the whole page shifted ~46px under the mouse mid-drag (±2 rows → 5 or 1 selected). Throttling the CPU locally could never reproduce it because the missing ingredient was font metrics, not speed. What found it: a text-only probe committed on a throwaway branch with a push-triggered workflow, recording per animation frame the scroll position, the target row's top and the top bar's height, plus a mutation log of nodes added/removed outside the grid, and the pointer's hit-test per move — then measuring the same bar locally at narrower widths, where it also jumped (a real user-facing defect at 1366px).

**Suggested improvement:** In systematic-debugging's Phase 1, add: "When a UI/browser test fails only in CI and the numbers it gets are off by a consistent AMOUNT (N rows, N px) in BOTH directions, suspect a layout shift from a transient element whose size depends on the environment (fonts, DPI, scrollbar width). Don't reach for waits or retries: record per-frame geometry and DOM mutations ON the CI machine (text log, no screenshots needed), and re-measure the same surface locally at other viewport widths — the CI environment is often just another width." Also: a flake whose cause is found should be fixed in the app when the app is what moves; the test then passes without being changed.

**Principle:** An environment-only failure is a clue to WHICH input differs (fonts, widths, speed); vary that input deliberately and measure the geometry on the machine where it fails, rather than assuming the difference is speed.

### Observation 325: A break-test harness must assert that the named test RAN — a name with regex characters matched nothing and read as "green"

**Status:** OPEN
**Date:** 2026-09-28
**Session context:** [HIST-PHONE-HIDE] + [CHG-BY-ITEM] break tests — each wire broken once, the named test expected red. (Numbered past #324, which sits on the sibling branch `claude/lw-figsel-flake`.)
**Skill:** test-driven-development
**Type:** open-source
**Phase/Area:** verifying a test actually guards a line ("watch it fail")

**Issue:** The harness ran `vitest run <file> -t "<test name>"` per broken wire and called it red when the run exited non-zero with "failed" in the output. Two wires came back GREEN ("no test catches this wire"). Both were the harness: `-t` takes a PATTERN, and one test name held parentheses ("a look (a saved plan, an issued version) …"), the other a double quote that broke the shell command — so ZERO tests ran, the run exited 0, and "no test caught it" was a false alarm that could as easily have been a false all-clear in the other direction.

**Suggested improvement:** In the skill's "Verify RED" step, add: when a test is selected by name (`-t`, `-g`, `--grep`), check the run's summary says it actually ran (e.g. "1 passed" or "1 failed", not "0 tests" / "N skipped") before reading the exit code, and select by a plain fragment with no regex or shell metacharacters.

**Principle:** A check that can pass by running nothing must prove it ran something; "no failure" and "no test" look identical in an exit code.

### Observation 326: A "look, don't touch" gesture on an editable cell must be walked for writes — the tap that reads can be the tap that saves

**Status:** OPEN
**Date:** 2026-09-28
**Session context:** [HIST-PHONE-HIDE] walk — a phone's History invites a tap on a dotted detail to read its story; the walk step added after the final reads asserted the bubble AND that the tap wrote nothing.
**Skill:** New skill candidate: bug-check walk (raptor-port/docs/bug-check-order.md §7)
**Type:** open-source
**Phase/Area:** the walk — asserting a read-only gesture has no side effect

**Issue:** Two independent code reads passed the feature. The tap landed on an editable cell inside the dotted row (an empty "all day" time box); focus left it unchanged, and its blur handler saved anyway — rewriting stored fields and writing a false history line ("times: all day → all day"). The defect was older than the feature, but the feature's own gesture led straight to it. Only an assertion on the side effect ("the history gained no line") caught it; the bubble assertion alone passed.

**Suggested improvement:** In the walk guidance, when a feature adds a READ gesture (tap / hover to inspect) on surfaces that are also editable, add to the step a count of writes before and after (history lines, stored record) and require zero. Separately: a blur-to-save handler should compare the text left against what the cell showed and save nothing when equal; and a change log should compare what a reader sees, not raw stored fields.

**Principle:** A gesture meant only to look must be proven to write nothing — measure the side effect, not just the thing it shows.

### Observation 327: A post-merge tidy found two more merged pieces still described as waiting — the handoff only checks the block it is named for

**Status:** OPEN
**Date:** 2026-09-28
**Session context:** A documents-only tidy after PR #455 merged: the owner named one HANDOFF block and two backlog items to retire. Checking every open PR's real state (`gh pr view`) showed two more stale records he had not named: the backlog's priority list still called the changes-window item "waiting for his merge live" (its PR had merged that morning), and a `## Now` block from 27 Sep sat on for a PR merged a day earlier.
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** the step that removes merged blocks and files open work

**Issue:** Each chat's handoff rewrites its OWN block and the items it built; nothing re-checks the other blocks' and items' "waiting for merge" claims against the PR host. A merge happens between chats (on the owner's word), so the chat that built the thing is gone when its status goes stale, and the next chat only retires what the owner names. Stale "waiting" lines then mislead the "what is next" answer.

**Suggested improvement:** In the handoff (and any post-merge tidy), add a mechanical sweep: for every `## Now` block and every priority-list line that says "waiting for … merge", read the named PR's state from the host; list each one that has merged with its residue check, and retire or rewrite it in the same change — or name it to the owner if its residue is unclear.

**Principle:** A status written by a chat that has ended goes stale at an event it never sees; the next writer must re-derive such statuses from the system of record, not trust the prose — and a tidy scoped to what the user named should still sweep for the same staleness next to it.

### Observation 328: A scripted audit's first count must be checked against one case by hand before it is believed

**Status:** OPEN
**Date:** 2026-09-28
**Session context:** [RULING-HOMES-AUDIT] — a scratch script listing every ruling whose named document home never mentions its D-number.
**Skill:** New skill candidate: repo-docs-audit (or a line in the task-observer's own "verify" habits)
**Type:** open-source
**Phase/Area:** Running a one-off audit script over many records

**Issue:** The first run reported 182 of 264 rulings uncited, against the 24 the backlog item had counted four days earlier. One hand check (a home file that plainly contained "D60") showed the script was wrong: the regex word-boundary `\b` had been written through a shell heredoc inside a JavaScript template literal and arrived as a backspace character, so almost nothing matched. The corrected run gave 44 and, filtered to durable homes, 24.

**Suggested improvement:** When an audit script's first number is far from any prior count, pick one record it flagged and check it by hand before using the number. Write audit scripts with the file tool, not a heredoc, when they carry regex escapes.

**Principle:** A count produced by a new script is a hypothesis until one of its hits has been checked by hand; a surprising number is a reason to check the instrument first.

### Observation 329: Heading-only restructuring scales well with read-only placers and a proving insert script

**Status:** OPEN
**Date:** 2026-09-28
**Session context:** [DOC-SUBHEADS] — 81 sub-headings into four reference docs (8,000 + 3,400 + 1,000 + 700 lines), none rewording anything (owner rule: a move never rewords).
**Skill:** New skill candidate: doc-subheads (restructure long docs without changing a word)
**Type:** open-source
**Phase/Area:** Adding navigation to long documents

**Issue:** Placing headings well means reading every line of every long run. Three read-only helpers each read a share in full and returned anchors (the exact start of the line to insert before, checked unique) plus heading text; the main session applied them with a script that refuses a non-unique anchor or one that does not start a block, and proves the file minus the inserted lines equals the original byte for byte. Two structural traps were caught by the helpers, not the script: a long bullet list with no blank lines (a heading needs a blank line on each side there), and a numbered ledger whose written numbers already disagreed with the rendered ones (a heading restarts an ordered list at its first written number, so it may only go where written = rendered). They also found section names other docs already pointed at that had no heading, and one stretch stranded under the wrong section.

**Suggested improvement:** For any heading-only pass: anchors by text, never by line number; a byte-identity proof; brief the placers on list splits and ordered-list renumbering; ask them to report existing "§name" pointers with no heading and prefer those names.

**Principle:** A restructuring that must not change meaning is safest as pure insertion, proved mechanically; judgement goes into WHERE, and the proof covers everything else.

### Observation 336: A delegated reviewer's report must land in a file from the start, not only in its hand-back message

**Status:** OPEN
**Date:** 2026-09-28
**Session context:** the change-recording re-test (Raptor): Fable subagents designed scenarios, reviewed a list and red-teamed a plan; Codex (Astra) ran the same jobs.
**Skill:** dispatching-parallel-agents
**Type:** open-source
**Phase/Area:** briefing a subagent — where its output goes

**Issue:** The Codex runs wrote their reports straight to a file (`-o <path>`), but the read-only Claude subagents returned theirs only as the final hand-back message; the task's output file was empty. Saving each report for the record meant retyping it into a file, so every long report sat in the host's context twice. Late in the session the host had to message the running agents mid-flight to shorten their answers and write files instead.

**Suggested improvement:** In the brief section of the skill: when a subagent's report must be kept, say at dispatch where it goes — an agent that may write files writes the full report to a named path and returns a short summary (count, one line per finding, the path); a read-only agent is told a length cap up front and the host saves its message once, verbatim, by a script, never by retyping.

**Principle:** Decide where a delegated report lives before dispatching it; a report that arrives only as a chat message costs the host its full length twice when it has to be kept.

### Observation 337: A scripted-walk subagent needs a scope bound, or it spends the budget of a whole session

**Status:** OPEN
**Date:** 2026-09-28
**Session context:** the same re-test; two Opus walkers each drove the running app through ~12 scenarios at two widths.
**Skill:** dispatching-parallel-agents
**Type:** open-source
**Phase/Area:** briefing a walker — scope and cost

**Issue:** Each walker ran 370–500 tool calls and 800–880k tokens (48–56 minutes), more than all the reviewers together. The brief listed scenarios but set no bound on retries, picture count or depth, and asked for pictures of everything at both widths.

**Suggested improvement:** Brief walkers with a bound: a scenario count per walker, one picture per assertion that matters, a stop-and-report rule after N failed attempts at one gesture, and a summary-plus-file return. Split by cost, not only by area.

**Principle:** A walker's cost is set by its brief; name the stopping rule and the evidence you actually need, or it will gather everything.
### Observation 339: Condensing a large decision log into a loaded index + a searched full text — the method that held up

**Status:** OPEN
**Date:** 2026-09-28
**Session context:** Raptor rulings slim-down (D390): 265 owner rulings, ~110k tokens loaded per chat, cut to one short line each with the full row moved whole beside it. Numbered 339 past the parallel branches' own entries (change-recording 337, small fixes 338, Tracker leftovers 332).
**Skill:** New skill candidate: decision-log-condensation
**Type:** open-source
**Phase/Area:** planning, conversion tooling, review

**Issue:** The first plan used each entry's own bold heading as its short form ("an extract, not a rewrite") and a raw "keep both sides" for merge conflicts. Both red teams (two providers, independently) broke both: ~25% of headings are containers ("the three readings stand as built:") or state a rule a later entry changed ("Fully delete", renamed later), and raw conflict unions leave two table headers, stale prose and silently lose one side's edits. What held: classify every entry (heading stands alone and unchanged → extract; else hand-write the rule AS IT STANDS), a change tail whose set must equal the full entry's change marks (checked both ways), identity = the full entry (the short line is a gated index), a converter that REFUSES and names the fix, and a merge that never reads conflict blocks — it starts from the side in the new layout and replays the other side's per-ID changes three-way, stopping on two-sided edits and printing (never writing) prose changes. Real `git merge` fixtures in both orders in the self-test caught an ordering bug before real data did.

**Suggested improvement:** A skill for condensing any append-only decision/ruling log that must stay loaded: measure first (bytes→tokens calibrated to the user's own readings), design pairs + gate + converter + merge replay, red-team with scenario-first briefs, then an independent meaning read with explicit omission questions ("would a reader acting on this line alone skip a required step?"), not only "does it say more".

**Principle:** When an index replaces loaded full text, make the full text the identity and gate the index against it; never let a merge tool union raw conflict text in a structured record — replay per-record changes three-way from a known-good side.

### Observation 340: A one-line summary written to a character cap drops the rule's own "don't" first

**Status:** OPEN
**Date:** 2026-09-28
**Session context:** Condensing 35 guide blocks into one-line short forms of at most 350 characters (D391), then an independent meaning read.
**Skill:** New skill candidate: condensing-standing-rules (or the doc-structure rules)
**Type:** open-source
**Phase/Area:** writing short forms / summaries of standing rules under a length cap

**Issue:** Tightening each short form to fit the cap, the author cut exactly the clauses a reader would break without opening the full text: an exception ("a wide visual change is still MEDIUM"), a carve-out ("sim who stays free text"), a "don't" ("don't restyle the bare .hl-grp"), a tie-breaker ("in doubt, a one-line heads-up"), and in one case widened a supersession ("the 17 Sep text is history" when only the 7 Sep text was). The reviewer caught all five; the author's own pass, done while cutting for length, did not.

**Suggested improvement:** When condensing a rule, list its negative clauses, exceptions and scope limits BEFORE cutting, and keep those ahead of examples, dates and rationale; state a supersession's scope with the exact dates it names. Keep the independent meaning read as the gate.

**Principle:** In a compressed rule, the prohibitions and exceptions carry the most risk per character: drop the examples and the story first, never the "don't" or the "except".
### Observation 345: A unit test of "this change is recorded" can pass vacuously when the store's record source is absent in the test world

**Status:** OPEN
**Date:** 2026-09-28
**Session context:** change-recording build (Raptor), B2 — cutting the settings store over to the one undo; its records are read from persisted storage, which the undo-wire test file never installed.
**Skill:** test-driven-development
**Type:** open-source
**Phase/Area:** red-first — writing the failing test

**Issue:** The first red run of "a Logic rule change is undone" failed for the wrong reason: with no storage backend in the test world, the settings store's before/after images were both null, so no change was recorded at all. Had the implementation already been in place, the test would have failed the same way and been "fixed" by chasing the wrong cause; conversely a looser assertion (e.g. only "undo returned ok:false") would have passed vacuously.

**Suggested improvement:** In the red-first step, add: "before trusting a red, confirm it is red for the RIGHT reason — assert the precondition the feature depends on (the change was actually recorded / the entry exists) as its own expectation, so a missing fixture fails loudly and differently from a missing feature."

**Principle:** A red test proves nothing until you know WHY it is red; pin the precondition separately from the behaviour so a broken fixture cannot impersonate a missing feature.

### Observation 346: A commit chained after a FILTERED test run commits red — the filter's exit code, not the tests', gates it

**Status:** OPEN
**Date:** 2026-09-28
**Session context:** change-recording build (Raptor), B8 — "npx vitest run … | grep -E '×|Tests' ; … && git commit" went in with two failing tests, because the pipe's last command (grep) succeeded.
**Skill:** verification-before-completion
**Type:** open-source
**Phase/Area:** committing after a test run

**Issue:** The test output was read through a filter to save space, and the commit was chained in the same command. The chain's success condition was the filter's exit status, so a red run still committed; it was caught only by reading the printed lines afterwards, and needed a follow-up fix commit.

**Suggested improvement:** Add a rule: never chain a commit (or any irreversible step) onto a command whose test output passes through a pipe; run the tests with their exit code captured (to a file, `echo exit $?`) and commit in a separate step only after reading a green result.

**Principle:** The gate on an irreversible step must be the check's own exit code — a pipe or filter in between silently replaces it with the filter's.

### Observation 330: A question put to the owner needs a worked example with real names, not an abstract rule

**Status:** OPEN
**Date:** 2026-09-28
**Session context:** Tracker leftovers (branch claude/tracker-leftovers-f79d36) — six product choices put to the owner on one Artifact page, each with pictures of the real app and a recommendation. (Numbered past #329, held on the parallel branch claude/docs-tidy-subheads-audit-ec8f87.)
**Skill:** New skill candidate: owner-choices page (the "put the open product questions to him" step of the bug-check order §11 and the plain-language rule)
**Type:** internal
**Phase/Area:** Writing the questions

**Issue:** He answered four at once and sent two back ("4 explain clearly", "5 what do u mean goes after your own courses"). Both had been worded as rules ("refuse a future day in these four boxes", "a course new to the app goes after the app's own courses"). The four he answered first had a picture or a concrete before/after. The re-put versions that he answered at once each opened with a worked example in the app's own words: "Today is 28 Sep. You grade a flight done and type 29 Sep by mistake…", "Your app has 26ABSG, 27ABSG; you import a file carrying 25ABSG…".

**Suggested improvement:** Every owner question opens with a concrete worked example — a date, a name, a course, what he would press, what he would see — before the rule and the options; a question with no picture must have the example. Check before sending: could he answer it without imagining a scenario himself?

**Principle:** A non-technical decision-maker judges consequences, not rules; a question that makes the reader build the scenario in their head comes back unanswered.

### Observation 331: A backlog item that offers "do A, or B" is a choice for the owner — the plan must not pick one silently

**Status:** OPEN
**Date:** 2026-09-28
**Session context:** Tracker leftovers — [TRK-SESSION-PICK] said "start each sign-in on the default course and no student, OR keep the last pick per person". The plan picked "per person" and called it the agent's call; Astra's plan red team (F-08) flagged that no ruling chose between them; put to him, he chose the same ("7 own place", D376).
**Skill:** claudex-loop (plan review) / the bug-check order's rules sweep
**Type:** open-source
**Phase/Area:** Planning — separating implementation choices from product choices

**Issue:** The agent classified a user-visible behaviour choice as an implementation detail because it had a good reason for one option (it changed least of an existing feature). The reviewer caught it only because the brief asked "is anything the plan decided itself actually his?".

**Suggested improvement:** When a plan is written from a backlog item, scan the item for alternatives it names ("or", "either", "one of") and list each as an owner question unless a recorded ruling already picks one; keep the brief's "is anything the plan decided itself actually the user's?" question in every plan red team.

**Principle:** Alternatives written into a task by a previous session are an unanswered question, not an invitation to choose; having a good reason for one option does not make it yours to pick.

### Observation 332: "Compare against main" for a measured number — swap the touched files from main, rebuild, measure, restore

**Status:** OPEN
**Date:** 2026-09-28
**Session context:** Tracker leftovers — the walk measured the Tracker's bar at 87px (two rows) at 1060–1150px wide and it looked like a regression from the save-corner change. Swapping the two touched files (the stylesheet and the header component) back to origin/main's versions, rebuilding in place, running the same walk script, then copying the branch's files back showed main is 87px there too — pre-existing, not this work — in five minutes, with no second checkout or install.
**Skill:** bug-check order (raptor-port/docs/bug-check-order.md §4 "what to do with what they hand back", step 3 "compare against main")
**Type:** internal
**Phase/Area:** Walk — dispositioning a measured difference

**Issue:** The order says to compare against main before calling anything newly introduced, but gives no cheap way to do it for a runtime measurement (a height, a row count) that only a built bundle shows; a second worktree with its own install is slow, so the comparison tends to be skipped or guessed.

**Suggested improvement:** Add a line to §4 step 3 (or §7): for a measured number, copy the files the change touched aside, `git show origin/main:<path> > <path>` for each, rebuild, run the SAME walk script into a scratch folder, then copy the branch's files back and `git diff --stat` them to prove they are restored. Never while walkers are served that build.

**Principle:** A baseline you can measure in minutes gets measured; one that costs a fresh checkout gets assumed — make the honest comparison the cheap one.

### Observation 338: A re-walk run with the first walk's output folders silently overwrites the defect evidence

**Status:** OPEN
**Date:** 2026-09-28
**Session context:** Tracker leftovers — re-walking walker b's four scripts after fixing its findings (numbered past #333–#337 on `claude/change-recording-retest`)
**Skill:** New skill candidate: bug-check re-walk (raptor-port/docs/bug-check-order.md §5 "The re-walk")
**Type:** internal
**Phase/Area:** the re-walk step, after the fixes

**Issue:** The order says a re-walk goes to a separate output folder because the first walk's pictures are the defect's evidence. The re-walk was launched by copying the walk's own command line — the same `HP_OUT` / `HP_SHOTS` — and it overwrote walker b's uncommitted final run (step logs and pictures). The committed first run survived only because an earlier commit happened to carry it. Nothing warned: the scripts write wherever the environment points.

**Suggested improvement:** Make the helper refuse it: `trk-lib.mjs` (and `lib.mjs`) could refuse to write a step log or picture over a file that is tracked or modified in git unless `HP_REWALK=1` points at a folder named `rewalk`; or the walk scripts could take `rewalk` as an argument that switches both folders. Until then, the re-walk command in each evidence sheet should be written out in full with its `rewalk/` folders, beside the first walk's.

**Principle:** A rule that protects evidence ("write the re-run somewhere else") must be enforced where the write happens; a re-run is almost always launched by reusing the first run's command, so the default path IS the overwrite.

### Observation 343: A test or walk script that "leaves" a date box with one Tab never leaves it in Chrome

**Status:** OPEN
**Date:** 2026-09-28
**Session context:** Tracker leftovers — the Tracker smoke failed a re-date after the date boxes were changed to save when LEFT (numbered past #342: #333–#335 and #341–#342 are the small-fixes branch's, #336–#337 the change-recording branch's)
**Skill:** New skill candidate: bug-check walk scripts (raptor-port/docs/bug-check-order.md §7)
**Type:** internal
**Phase/Area:** browser test and walk scripts that type into `<input type="date">`

**Issue:** The suite did `fill(dateBox)` then `press(dateBox, 'Tab')` and read the result 300ms later — nothing had saved. In Chrome a Tab inside a date box steps to its next part (day → month → year) before it leaves the box, so after `fill()` one Tab never blurred it; the save landed only when the list closed. It read as an app defect until a probe recorded where the focus was after the Tab.

**Suggested improvement:** In the walk/test helpers, leave a date box with Enter (when the app commits on Enter) or a click elsewhere, never a single Tab; when a "left the box" step fails, record `document.activeElement` before blaming the app.

**Principle:** A composite native control (date, time, datetime) keeps keyboard focus across its parts; a script's "leave" gesture must be one that leaves the whole control.

### Observation 344: A reviewer's file:line evidence can name files that do not exist — check the path before trusting the lines

**Status:** OPEN
**Date:** 2026-09-28
**Session context:** Tracker leftovers — Astra's final code read
**Skill:** New skill candidate: acting on cross-provider review findings
**Type:** open-source
**Phase/Area:** triaging a reviewer's findings before fixing

**Issue:** The reviewer's report cited `public/legacy/core.js` and `src/App.jsx`; neither exists (the real files are `src/tracker/app/core.js` and `src/tracker/App.jsx`), so every line number it gave was unreliable. Two of its three "high" findings did not hold on the real code (one misread how the export file relates to earlier bakes; one described a race that the synchronous storage makes impossible), and its suggested fix for one would have destroyed data.

**Suggested improvement:** Before acting on a finding, confirm every cited path exists and re-trace the claim on the real code; classify each as fixed / not a defect (with the reason) / cannot happen here (with the evidence, and filed for when it can).

**Principle:** A finding is a claim to verify, not a task to execute; wrong paths are the cheapest early signal that the evidence needs re-deriving.

### Observation 347: A test driven by a hand-made record passed while the real door produced a different record — the fix did nothing in the app

**Status:** OPEN
**Date:** 2026-09-29
**Session context:** change-recording build (Raptor), fixing Fable's final-read F2 ("a calendar change should open the Inputs calendar"). Numbered past #344 (#341–#342 are the small-fixes branch's; this branch's two were renumbered #345–#346).
**Skill:** test-driven-development
**Type:** open-source
**Phase/Area:** red-first — choosing how the failing test produces its input

**Issue:** The landing tests were written against a hand-built undo entry (`{ scope: { module: 'plan' }, forward: [...] }`) so they could be red quickly. The fix keyed on that area, the test went red then green — and the walk showed the real calendar save is filed under a DIFFERENT area ('inputs'), so the fix never fired in the app. The hand-made record encoded the author's belief about the code path, which was exactly the thing under test. It was caught only because a walk script drove the real control.

**Suggested improvement:** In the red-first step: a test's input must come from the production door (call the real writer the button calls) unless the door cannot run in the test world; when a hand-made record is unavoidable, add one test through the real door that asserts the record really has that shape (area, collection, type), so a wrong belief fails loudly. Name this in the skill's "red for the right reason" section.

**Principle:** A fabricated input proves the code handles what you THINK arrives; only the real door proves what arrives — the belief under test must not be baked into the test's fixture.

### Observation 341: A break test on an uncommitted file must be undone from a backup, never by "git checkout -- <file>"

**Status:** OPEN
**Date:** 2026-09-28
**Session context:** Small-fixes batch (claude/small-fixes-batch-d223f6) — the break test for [GHOST-FLAG-SHADOW]: the new CSS rule was put back to the old one with sed to watch the new test go red, then "restored" with git checkout.
**Skill:** New skill candidate: break-test discipline (bug-check order §8 item 4 — "break that wire once on purpose and watch a named test go red")
**Type:** open-source
**Phase/Area:** Verification — the break test

**Issue:** The fix itself was not yet committed. `git checkout -- src/ui/scheduler.css` restored the file to HEAD, which silently threw away the fix along with the deliberate break. It was recovered only because a copy had been taken before the sed; without it the fix would have had to be rewritten from memory, and a hurried rewrite is where a break test's own purpose (proving the wire) is lost.

**Suggested improvement:** In any break-test step: (1) commit the fix first, OR copy the file aside before breaking it; (2) undo the break by restoring that copy (or `git checkout` only when the fix is committed); (3) confirm with `git diff --stat` that the fix is back before moving on.

**Principle:** Undoing a deliberate break must restore the exact pre-break bytes, not the last commit — commit or copy before you break, and verify the fix survived the restore.

### Observation 333: A "no X anywhere on screen" check must prove it can see the screen — the break test is what exposes it

**Status:** OPEN
**Date:** 2026-09-28
**Session context:** Small-fixes batch — [LW-ISO-DATES]: a roll-call test rendering every Leave War sheet and asserting no raw `2026-07-17` date in its text.
**Skill:** New skill candidate: break-test discipline (bug-check order §8 item 4); also test-driven-development
**Type:** open-source
**Phase/Area:** Verification — negative assertions

**Issue:** The first cut passed for two independent reasons, both vacuous: (1) the sheets render through a portal into the page body, while the test read the render CONTAINER, which was empty; (2) the date regex used a word boundary (`\b\d{4}-…`), but an element's textContent runs adjacent spans together ("Ranger2026-02-11"), so the boundary never matched. Only the break test (putting one raw date back and seeing the test stay green) showed that the check proved nothing.

**Suggested improvement:** Every negative assertion ("never shows X") ships with two guards: a positive precondition in the same test (the thing is actually on the page — its own words are read), and a break test run once that re-introduces X and must turn it red. When reading textContent, never rely on word boundaries between elements.

**Principle:** A test that asserts absence passes on an empty view; pair it with a presence check and prove it once by breaking it.

### Observation 334: A walk picture taken after the page scrolled hid a whole row under the app's sticky bar — and read as a new defect

**Status:** OPEN
**Date:** 2026-09-28
**Session context:** [SMALL-FIXES] batch, `[ABSENCE-SMALL-SEEN]` 2 (the Leave War's "VIEWING AS" chip), re-walking the fix at 390px.
**Skill:** bug-check order §7 (the walk) — raptor-port/docs/bug-check-order.md; the walk scripts under scripts/handpass/
**Type:** open-source
**Phase/Area:** the walk's pictures

**Issue:** After the fix, the "top of the page" picture showed the chip but NOT the row's first line (the period picker, + New). It looked like the fix had pushed the controls off the screen. Measuring showed the layout was right: an earlier clip-screenshot helper had scrolled the chip into view, and the page's own row (not sticky) had moved up under the app's sticky top bar, so the fixed-coordinate picture taken after it cut the first line out.

**Suggested improvement:** A walk that takes a fixed-coordinate "top of page" picture scrolls to the top first, and asserts the positions it relies on (here: the row's other controls sit above the chip) rather than trusting the picture alone. Order the steps so any helper that scrolls runs AFTER the fixed-coordinate picture.

**Principle:** A picture taken at fixed coordinates is only evidence of the state at that scroll position; any step that scrolls before it can manufacture a false defect. Measure the claim, then picture it.

### Observation 335: A transient permission-check outage applied some of a batch of edits and refused the rest — re-read before building on them

**Status:** OPEN
**Date:** 2026-09-28
**Session context:** [SMALL-FIXES] batch, `[AMEND-SMALL-SEEN]` 3 (callsign widths) — four edits to one walk script sent in one message during a classifier outage.
**Skill:** task execution (tool use), no single skill
**Type:** open-source
**Phase/Area:** parallel tool calls

**Issue:** Four independent edits to one file were sent together; the safety check had no verdict for three and applied the fourth — which referenced a variable one of the refused edits was meant to define. The file was left broken in a way no error announced (the one success read as normal). An earlier shell edit in the same outage also did not run although nothing said so beyond the refusal message.

**Suggested improvement:** When any call in a batch is refused or errors, treat the whole batch as unknown: re-read the file (or grep for each edit's marker) before the next step, and re-send only what is missing. Prefer one edit per call while the checker is unstable.

**Principle:** A partially applied batch is worse than a failed one — it looks like progress. After any refusal inside a batch, verify each intended change by reading, not by the absence of an error on the others.

### Observation 342: A queued waiter on a shared lock nearly broke a LIVE run as "stale" — the lock's recorded process was the one that took it, not the run

**Status:** OPEN
**Date:** 2026-09-28
**Session context:** [SMALL-FIXES] batch — the full gates queued with `gatelock.mjs run` behind a parallel chat that had taken the PC check lock by hand ~2 h earlier.
**Skill:** repo tooling (`raptor-port/scripts/gatelock.mjs`), not a skill
**Type:** open-source
**Phase/Area:** shared-resource locking between parallel sessions

**Issue:** The lock script's waiter breaks any lock older than 2 hours. The holder had taken the lock by hand (`take`) and run several suites under it; the pid in its owner file was the short-lived `take` process, already gone, so "the process is dead" looked like proof the lock was stale. Asking the holder showed its last suite had started a minute earlier — the automatic break would have fired inside it three minutes later. The queued run was stopped in time.

**Suggested improvement:** A waiter must never break a lock on age alone: the holder refreshes a heartbeat (touch the owner file) during its run, and "stale" means no heartbeat for N minutes; a hand-taken lock records the session, not the take command's pid. Until then, before a queued run reaches the stale mark, ask the holder.

**Principle:** Staleness for a shared lock must be judged by a heartbeat from the work it protects, not by age or by the pid of the command that acquired it.

### Observation 350: On Windows without LibreOffice, let PowerPoint itself make the PDF and the QA pictures

**Status:** OPEN
**Date:** 29 Sep 26
**Session context:** building a picture-led PowerPoint + PDF guide with pptxgenjs on a Windows PC ([IT-FLOW-GUIDE]); numbered after #348 on the handoff-review branch
**Skill:** anthropic-skills:pptx
**Type:** open-source
**Phase/Area:** QA (Converting to Images) and the PDF deliverable

**Issue:** The skill's render path is `soffice` → PDF → `pdftoppm`; neither existed on the machine, but PowerPoint did. Driving PowerPoint over COM (`Presentations.Open(path, readOnly, untitled, withWindow=false)`, `SaveAs(pdf, 32)`, `Slide.Export(png, 'PNG', w, h)`) gave the PDF deliverable AND exact slide pictures for visual QA in one short script — more faithful than a LibreOffice render (real fonts, no substitution caveats). Separately, pptxgenjs was not preinstalled; installing it into a scratch folder and loading it with `createRequire(<folder>)` kept it out of the project's package.json.

**Suggested improvement:** In "Converting to Images" add: "If PowerPoint is installed (Windows/macOS), prefer exporting through it — PDF via SaveAs format 32, per-slide PNG via Slide.Export — the render is exact and needs no font caveats." In Dependencies: "if pptxgenjs is missing, install it outside the user's project (scratch folder + createRequire) rather than adding a dependency."

**Principle:** Render QA with the same engine the audience will open the file in when it is available; and a tool needed only to produce a document should not become a dependency of the product it documents.

### Observation 351: Annotated screenshots in a generated deck need two guards — marks refused off their picture, rings clipped to it — and media shrunk once

**Status:** OPEN
**Date:** 29 Sep 26
**Session context:** a 42-slide picture-led guide built with pptxgenjs from scripted screenshots, each with numbered click marks laid over it as shapes ([IT-FLOW-GUIDE])
**Skill:** anthropic-skills:pptx
**Type:** open-source
**Phase/Area:** Creating with pptxgenjs; Visual QA

**Issue:** Marks computed from element boxes went wrong in two silent ways: an element outside the crop produced a ring drawn off the picture (in the middle of the slide), and an element larger than the crop produced a ring spilling across neighbouring content. Both passed the build and only showed in the rendered pictures. Separately, pptxgenjs embeds an image once per addImage, so pictures reused across slides and 2x screenshots made the deck 22 MB; shrinking each picture once (sharp, 1100px, JPEG 78) brought it to 13.6 MB with no visible loss at slide size.

**Suggested improvement:** Add to "Creating with pptxgenjs — gotchas": (1) when overlaying annotation shapes on images from computed coordinates, refuse (throw) any mark whose centre falls outside its image and clip every ring to the image bounds; (2) images are stored per use — downscale to the largest size actually shown (about 1100px for a third-of-slide picture) before adding, and reuse sparingly.

**Principle:** Coordinates computed from another system must be bounds-checked at the boundary where they are applied — fail loudly when out of range, clip when merely oversized — because the render will not complain.
### Observation 348: Removing a delimited block by "first closing marker after the opener" cuts inside a block that QUOTES its own marker

**Status:** OPEN
**Date:** 2026-09-29
**Session context:** A handoff review removing four merged blocks from the handoff file's list of open chats, by script.
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** removing another chat's merged block

**Issue:** The script found each block's end as the first closing marker after its opener (a plain substring search). One block's own text quoted the closing marker in backticks (it described a check that looks for that marker), so the cut ended mid-block and left an orphaned closer; the document gate caught it ("a closing marker closes no block"). Restored from git and redone with a line-anchored, non-greedy match (the marker alone on its own line).

**Suggested improvement:** In the session-handoff skill's step that removes merged blocks, say: match both markers anchored to the start of their own line (multiline regex), never a substring search; run the document check before committing.

**Principle:** A delimiter search over prose must be anchored to the delimiter's structural position (its own line), because documentation about a format will quote the format's own delimiters.

### Observation 352: A handoff told him "no new worktree — reuse this chat's folder", which the app cannot do

**Status:** OPEN
**Date:** 2026-09-29
**Session context:** Handing a job to a fresh chat on this chat's own branch (D368 — say whether a worktree is needed).
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** the new-chat instructions (worktree and branch)

**Issue:** The handoff said the new chat needs no worktree and "reuses this chat's folder". The app offers only two choices: the main folder (it tries to switch it to the branch) or a NEW worktree. The switch failed ("Couldn't switch branches") because the branch was still checked out in this chat's worktree, and git allows a branch in one folder at a time. The owner had to ask why the advice flipped. (Numbered past #350–#351, held by the parallel IT-flow-guide chat.)

**Suggested improvement:** In session-handoff's new-chat step: when the next chat continues THIS chat's branch, (1) release the branch from this folder first (detach, after checking everything is pushed), and (2) tell him to tick "worktree", naming the branch — never "reuse this folder". Say it once, the same way every time.

**Principle:** Setup instructions must match the options the user's tool actually shows; verify the mechanism (here, one branch per folder) before telling a non-technical user a step is unnecessary.

### Observation 353: A plan's door table written before the writer map named a door no screen offers

**Status:** OPEN
**Date:** 2026-09-29
**Session context:** Planning [OIL-AWARD-IS-A-GRANT] (Raptor, branch claude/award-earned-vs-granted-2ed66d); numbered past 352 (handoff-review branch) and 350 (IT flow guide branch).
**Skill:** New skill candidate: refactor-planning (moving one stored fact to a new store)
**Type:** open-source
**Phase/Area:** planning — the writers/readers table

**Issue:** The first plan draft's "doors" table listed `setCell(…, 'FO'|'HO')` as the grid's award door, from reading the store. A read-only explorer's map, returned later, showed no screen calls it (only tests and a debug bridge); the real door was a different function reached from the bid sheet's panel. Three single-field editors in the same file also had no production caller. The draft was fixed before review, but only because the map arrived before the reviewers were sent.

**Suggested improvement:** When a plan moves a stored fact, build the writer/reader map (every call site, and for each writer its PRODUCTION caller — a screen control) BEFORE drafting the door table; mark any writer with no production caller as "test-only / dead" in the plan so the build either retires it or keeps it deliberately.

**Principle:** A door is a control a person can press, not a function that can write. Map writers to their on-screen callers before planning around them; a function with no production caller is a test seam or dead code, never "the door".

### Observation 354: A walk FAIL is first checked against what the world really holds, and the phone's own route

**Status:** OPEN
**Date:** 2026-09-29
**Session context:** [OIL-AWARD-IS-A-GRANT] re-walk of the final reads' fixes
**Skill:** bug-check order (raptor-port/docs/bug-check-order.md, the walk step)
**Type:** internal
**Phase/Area:** the walk — reading a scripted walk's FAIL

**Issue:** Three walk FAILs this session were the script's, not the app's: a check expected "bid and OIL award" on a day whose seed holds only an award; a phone run looked for an Admin → Users row the phone hides behind its Admin menu; a member opened in a fresh browser profile (a new demo world). Each cost a re-run before the cause was read.

**Suggested improvement:** In the walk step, before treating a FAIL as a finding: (1) confirm from the seed or the page what the target day really holds; (2) for a phone run, confirm the surface's phone route (menus, folded panels) — take one picture at the failing step. Record script mistakes on the evidence sheet as such.

**Principle:** A failing assertion is a claim about the world the script believes in; check that world before blaming the app.

### Observation 355: A design job for the owner needs its "why now, and what you'll get" said before the work starts

**Status:** OPEN
**Date:** 29 Sep 26
**Session context:** `[DB-SYNC-MODEL]` — the day-lock mock-up and data-model §9, started from a one-line opening prompt
**Skill:** session-handoff (the opening line it writes) · plain-language rule
**Type:** internal
**Phase/Area:** the start of a job handed over from an earlier chat

**Issue:** The job started straight into reading and picture-taking. Within the first half hour the owner asked three
questions that one opening paragraph would have answered: "is this the step before the database?", "what is the lock
controls?", "should we design the lock when it's in the database?" — each while the agent was mid-work. The handoff's
opening line named the job by its backlog id and its three steps, but not why it had to happen now (the lock decides the
tables' shape) or what he would get (a page of pictures and six questions; nothing in the app changes).

**Suggested improvement:** when a chat starts a job from a handoff, its first message to him says in three plain lines:
what the job is in his words, why it is due now, and what he will get and when. The session-handoff skill's opening line
could carry the "why now" so the next chat has it to repeat.

**Principle:** A non-technical owner judges a job by its purpose and its output; state both before starting, or he will
ask mid-work and the answers arrive piecemeal.

### Observation 360: Parallel chats' number ranges collide when claimed by message before any pushed record

**Status:** OPEN
**Date:** 2026-09-29
**Session context:** Leave War drag / flaky-tests batch, run beside two database chats (D302 coordination by message). Numbered #360 past the day-lock branch's #355 and the ranges the three chats agreed (#356–#359 day-lock, #360–#369 this chat, #370+ the DB-sync chat).
**Skill:** session-handoff (and the D302 coordination step it implies)
**Type:** open-source
**Phase/Area:** starting a parallel chat — claiming a ruling-number / observation-number range

**Issue:** Three chats started within minutes and each announced a ruling range by message. Two picked the same range (D430–D439); the messages crossed, each proposed a different resolution, and it took four more messages to converge. The chat that had already written its claim into a PUSHED handoff block was the one the others deferred to — the pushed record, not the message, was the tie-breaker everyone accepted.

**Suggested improvement:** In session-handoff (or the start-of-chat step that reads HANDOFF.md): before announcing a range, read every open branch's HANDOFF block for claimed ranges (`git show origin/<branch>:HANDOFF.md`), take the next free block, and state the rule "first claim in a pushed block wins; a message-only claim yields". Say it in the first coordination message so crossed messages resolve without a round-trip.

**Principle:** When parallel agents allocate from a shared counter, the tie-breaker must be a durable, readable record that exists before the announcement — messages cross; a written claim does not.

### Observation 370: A chat told to "start" a backlog item found another live chat already half-way through it

**Status:** OPEN
**Date:** 29 Sep 26
**Session context:** the owner opened a fresh chat with "start [DB-SYNC-MODEL] … show me the mock-up". HANDOFF.md and OUTSTANDING.md on `main` both still listed the item as not started. A parallel chat had in fact made the mock-up, published it to him and pushed its branch about 30 minutes earlier. Only `ListAgents` (a session titled "Day lock mock-up…") and `git branch -r` showed it. Numbered #370 because the ranges agreed by message were #356–#359 for the day-lock chat and #360–#369 for the Leave War chat.
**Skill:** session-handoff (the opening checks a new chat runs) / the D302 coordination rule in `.claude/rules/shipping.md`
**Type:** internal
**Phase/Area:** start of a chat, before any work on a named item

**Issue:** The records on `main` lag every open branch. An item a parallel chat has taken still reads "to do" there until that branch merges. The D302 rule checks for clashes by comparing the FILES two branches change, and that only runs once you are about to edit. It does not catch two chats being handed the same ITEM. This time it was caught before anything was built, only because the coordination step happened to run first.

**Suggested improvement:** Add one opening check to the session-handoff skill's "starting a chat" guidance (or to shipping.md §Parallel chats): before starting a named backlog item, run `ListAgents` and `git branch -r --sort=-committerdate | head`, and look for a session title or branch naming the item. If one exists, message that chat and tell the owner before building anything.

**Principle:** Shared records on the main line show only what has merged. Before claiming a unit of work, ask the live workers what they hold, not just the merged record.

### Observation 356: A design red team against a platform should check the platform's facts in round 1, not discover them round by round

**Status:** OPEN
**Date:** 29 Sep 26
**Session context:** `[DB-SYNC-MODEL]` — the day lock's data model for Dataverse, three red-team rounds (Astra and Fable)
**Skill:** claudex-loop (the red-team brief) · New skill candidate: platform-design-review
**Type:** open-source
**Phase/Area:** writing the round-1 brief for a design that leans on a vendor platform

**Issue:** The author wrote platform claims from memory ("row ownership makes it firm with no custom code", "change
tracking gives a cross-table cursor", "Assign at Business-unit depth"). Round 1 caught the cross-table claim; round 2
caught that ownership cannot hand a row between users without a privilege that also allows writing; round 3 caught that
the owner team needs a read role, the check must run as SYSTEM, change tracking is off by default, and a Custom API
alone is bypassable. Each round spent a full review on facts one documentation pass would have settled, and the owner
had to be told a "no custom code" promise was wrong.

**Suggested improvement:** In the red-team brief template, add a mandatory first section: "List every claim this design
makes about the platform (privileges, defaults, limits, ordering, transactions) and verify each against the vendor's
documentation, citing it." And have the author mark platform claims as "unverified" until then, so none reaches the
owner as fact.

**Principle:** A design's claims about a third-party platform are facts to verify, not reasoning to review; check them
against the vendor's documentation first, before anyone spends review rounds or tells the stakeholder a guarantee.

### Observation 380: When a plan removes or reshapes a stored record, search for every reader of its PRESENCE, not only of its content

**Status:** OPEN
**Date:** 30 Sep 26
**Session context:** `[DB-READINESS]` group A plan — splitting big stored records (inputs/all, leavewar/wars, one-per-week) into one record per row; round-1 red team (Astra, Fable)
**Skill:** writing-plans · claudex-loop (the red-team brief)
**Type:** open-source
**Phase/Area:** the plan's inventory step, before the red team

**Issue:** Three read-only sweeps inventoried every writer and reader of each record's CONTENT. Both reviewers then found
what they missed: the boot decided "seed the demo or not" from whether two of those records merely EXISTED, and a
deleting reconcile also covered an undo-to-pristine case its comment named. Removing the records would have silently
re-seeded demo data over real data and brought an undone edit back after a reload. The sweeps were asked about
content, so nothing looked for "has(...)" checks or for the second purpose of a delete loop.

**Suggested improvement:** In the planning/inventory step for any storage reshape, add two mandatory questions per record:
(1) "Who reads whether this record EXISTS (has / presence / a flag derived from it)?" and (2) "For each loop that deletes
or rewrites it, list every case its comments or tests say it covers." Put both in the red-team brief's "what is
MISSING" list too.

**Principle:** A stored record carries meaning by its existence as well as its content; before removing, renaming or
splitting one, find every reader of its presence and every job its delete path does, or the change silently removes a
signal nobody listed.

### Observation 381: A guard on an existing state flag must be proven against when the flag REALLY flips — its comment is a claim

**Status:** OPEN
**Date:** 30 Sep 26
**Session context:** `[DB-READINESS]` group A phase 0 — a boot-only save was guarded on the Leave War's `LW_READY`, whose declaration comment says "enabled after boot (lwHistInit)"; the red test stayed red because `initStore` itself calls `lwHistInit`, so the flag was already true at the point the new code ran and the guarded save silently did nothing.
**Skill:** test-driven-development (the green step) · systematic-debugging
**Type:** open-source
**Phase/Area:** writing the minimal fix; attributing a failure

**Issue:** The fix read correct against the flag's own comment, and only the still-red test exposed that the guard was a no-op. Separately, before deciding whether a surprising failure was caused by the new change, the cheapest decisive step was to stash the change and run the SAME probe test on the base — it showed the defect already on `main`, which changed its disposition from "my regression" to "pre-existing, in scope, fix with a red test".

**Suggested improvement:** In test-driven-development's green step: "when the fix is guarded on an existing flag or mode, find every writer of that flag (grep the assignments) before trusting its comment — a lifecycle comment is a claim, not a proof; if the red test stays red, check the guard first." In systematic-debugging: "to attribute a failure, stash the change and run the identical probe on the base revision before theorising — one run decides new vs pre-existing."

**Principle:** A flag's documented lifecycle is evidence only until its assignments are read; and "is this mine?" is answered by running the same probe on the base, not by reasoning.

### Observation 382: A new write path's integration tests can be written first — "nothing was written" is the red

**Status:** OPEN
**Date:** 30 Sep 26
**Session context:** `[DB-READINESS]` group A phase 1 — the schedule saved as rows from the command stream
**Skill:** test-driven-development
**Type:** open-source
**Phase/Area:** "write the failing test first" when the feature is a whole mechanism (a new storage path)

**Issue:** The plan said red tests first for every phase. For the pure parts (split/join, per-day change records) the
tests were written first and failed for the right reason. For the storage path (rows written from each command,
week navigation saving only its delta, the other-day writers) the code was written first and the tests after, because
the tests "needed the mechanism wired". That was not true: every one of those tests would have failed first on "no
rows were written" or "the wrong rows were written". To regain the proof, each mechanism had to be broken on purpose
afterwards (three break runs) to show its test could go red.

**Suggested improvement:** In the skill's section on when a test is hard to write first, add: an integration test of a
NEW write path is never blocked by the path not existing — its first failure is "nothing was written". Write it
against the storage the app already has; if it was written after, break each mechanism once and watch its named test
fail before calling it proven.

**Principle:** A test is "first" when it fails for the reason the feature exists. For a new write path that reason is
"nothing reached storage", which is available before a line of the path is written; writing the test after costs a
break test per mechanism to recover the same proof.

### Observation 383: Recovering "red first" for tests written after the code — one break-and-restore script, not hand edits

**Status:** OPEN
**Date:** 30 Sep 26
**Session context:** `[DB-READINESS]` group A phase 3 — the Leave War saved one row per record (a new write path again)
**Skill:** test-driven-development
**Type:** open-source
**Phase/Area:** the recovery step #382 proposes, when some tests were written after the mechanism they guard

**Issue:** Most of this phase's tests were written first and ran red (21 of 24). A few (the reconcile turn's rows, the
undo's rows) were added after the code. #382's recovery — break each mechanism once and watch its test go red — was done
this time as ONE script: a list of (file, exact text, replacement, what it breaks); for each it swaps the text in,
runs only the focused test file, records the failing count, and writes the file's ORIGINAL BYTES back in a `finally`.
Six mechanisms proved in one command, every one red, nothing left broken — including a file with Windows line
endings, which a hand edit-and-revert would have risked converting. One snag: printing the test runner's Unicode to the
Windows console crashed the script after the first break (the `finally` still restored the file); running it with
`PYTHONIOENCODING=utf-8` fixed it.

**Suggested improvement:** In the skill's "written after" note (with #382's), give the recipe: a break table plus a
harness that applies one break, runs the narrowest test file, restores the original bytes in `finally`, and prints the
red count per break; a break that stays green means that mechanism is unguarded.

**Principle:** Post-hoc proof that a test guards a mechanism is cheapest as an automated break table with byte-exact
restore — repeatable, all-or-nothing, and safe for files whose bytes (line endings) matter.

### Observation 384: A plan's hand-made list of "writers that break the rule" is a first draft — sweep for all of them, then enforce with a test that watches every occurrence

**Status:** OPEN
**Date:** 2026-09-30
**Session context:** Building [DB-READINESS] group A phase 4 (one change-log batch per saved group) from a plan red-teamed three rounds by two reviewers.
**Skill:** executing-plans
**Type:** open-source
**Phase/Area:** executing a plan step whose correctness depends on an enumerated list (call sites, writers, exceptions)

**Issue:** The plan named, after three review rounds, the writers that reach storage outside a transaction (a week switch, a reconciler's idle writes, two history-line callers, a one-time seed). A read-only sweep delegated at the start of the phase found the list incomplete in the largest way: nearly EVERY save of one sub-app ran its transaction on an in-memory mirror and wrote storage a step later, outside it. The phase's own acceptance test ("every group carries exactly one batch, except the named ones") would have failed on that — or, worse, been "fixed" by exempting it.

**Suggested improvement:** In executing-plans, add a rule: when a plan step says "each of these N sites must be handled", (1) re-derive the full set with an exhaustive read-only sweep before building (the plan's list is a pointer, not a scope), and (2) turn the property into a runtime test that OBSERVES every occurrence (drive a battery of every kind of action and assert each event against the rule, with the exemptions named in the test) — then break one site on purpose to see it fail.

**Principle:** An enumerated list in a plan is evidence of what the reviewers saw, not of what exists; a property over "all sites" is only enforced by a test that watches all sites at runtime, with every exemption named inside the test.

### Observation 385: A list the owner will forward to a third party — make it a copyable, self-explaining text from the first answer

**Status:** OPEN
**Date:** 2026-09-30
**Session context:** `[DB-READINESS]` group A phase 5 — before building, the owner asked for "all the IT questions" so he could get answers first.
**Skill:** session-handoff (its handoff block's "open questions" line) and the plain-language rule (new-skill candidate if it recurs: "questions for a third party")
**Type:** open-source
**Phase/Area:** answering "list me the questions for X" / a handoff's open-questions line

**Issue:** The first answer was a technical list in the chat (IT's own vocabulary, one line each). The owner then asked, in turn, "explain in layman", then "make it in text format that I can copy and provide the context for each question and space each question out", then "change the name from <the IT person> to IT". Three round trips for one deliverable. Separately, the handoff block's "open questions for IT" line carried 5 of the 29 open questions and missed the one the very next phase creates (who is the first admin of an empty shared database).

**Suggested improvement:** When the owner asks for a list he will pass to someone else: (1) produce, first time, a plain-text FILE (sent with SendUserFile) — each item spaced out as a heading, "Question:" and "Context:" (why it is asked, what depends on it), urgent group first, "already agreed" at the foot — worded for the recipient, with no named individuals unless he names them; (2) give him, in chat, a short plain-language summary of what the list asks and which items are urgent. In session-handoff: the "open questions for <third party>" line names where the FULL list lives and adds any question the next phase will raise.

**Principle:** A forwarded list has two readers — the recipient, who needs each question's context, and the owner, who needs to understand what he is sending; serve both in the first answer, as a copyable artefact, rather than a chat list that must be reformatted.

### Observation 386: A storage conversion is walked on data the OLD app really wrote — build the old app from a slim extract and serve both on one address

**Status:** OPEN
**Date:** 2026-09-30
**Session context:** `[DB-READINESS]` group A phase 5b — the Tracker's lists split one row per thing; the last converter made the one-time boot conversion (the fold) live for every browser, his included.
**Skill:** bug-check order (raptor-port/docs/bug-check-order.md §2a "Saved data / storage: … older saved data read", §7 the walk)
**Type:** open-source
**Phase/Area:** walking a change that converts stored data

**Issue:** The unit tests fed the converter hand-made "old" records — written by the builder from his picture of the old shape. That proves the converter against that picture, not against what the old release actually stores. A full `git worktree` of the base branch into the session's scratch folder failed on Windows (the long scratch path pushed checked-in picture filenames past the path limit), which nearly dropped the step.

**Suggested improvement:** In the bug-check order's storage row (§2a) and §7, add a recipe: (1) `git archive <base> <app source dirs, config files>` into a short scratch folder (only the source, never the docs/pictures), with its dependencies linked from the working checkout (a junction), and build it; (2) serve the OLD build on a fixed address, create the owner's kind of work through the app's own controls, and save the browser's storage (a Playwright storage state); (3) serve the NEW build on the SAME address (storage belongs to an address), open that storage, and assert the new app reads — and exports — exactly what the old one did, with no old record left.

**Principle:** A conversion is proven against records the previous release really wrote, on the same address a real browser has used — never only against the builder's own reconstruction of the old shape.

### Observation 387: A storage-shape change is walked with a generic per-step audit, not only by eye

**Status:** OPEN
**Date:** 2026-09-30
**Session context:** [DB-READINESS] group A's group-wide FULL walk (every saved record moved to one row per thing, written from a command's changes, one change-log record per saved action)
**Skill:** bug-check order (`raptor-port/docs/bug-check-order.md` §2a "Saved data / storage" row, §7) — project method, internal
**Type:** internal
**Phase/Area:** the walk — what each step asserts

**Issue:** When the change is HOW things are saved and nothing on screen is meant to move, a person's eye (and a picture) cannot see the defect class that matters: a save that goes nowhere, a save with no change-log record, a reload that rewrites the store. The walk's shared driver (`scripts/handpass/dbrA-lib.mjs`) made three mechanical checks per step — every row the gesture changed is named by that gesture's change-log record with the right op; the app's in-memory state before a reload equals the state after it; the reload itself writes nothing — and within minutes of a first trial found a real missing line (the boot's re-landing of a request onto a saved week writes a day row with no change-log record) that no per-phase test covered, because every test drove the "after boot" world.

**Suggested improvement:** In §2a's "Saved data / storage" row and §7, add: for a storage change, every walk step runs the three mechanical checks (rows named by their record; reload gives the state back; reload writes nothing) as part of the step, through one shared driver the walkers all use — and the boot / reload itself is a step, not only the thing between steps.

**Principle:** When the change is invisible by design, the walk's assertions must be about what the eye cannot see — derive them from the change's own invariants and run them on every step, including the reload.

### Observation 388: A long scenario-design run need not hold the walkers back

**Status:** OPEN
**Date:** 2026-09-30
**Session context:** [DB-READINESS] group A's FULL walk — the independent scenario designer (Astra) read a 140-file diff for over 40 minutes
**Skill:** bug-check order §4 rank 1 / §5 FULL order — project method, internal
**Type:** internal
**Phase/Area:** sequencing the other model's scenarios and the fan-out walk

**Issue:** The order puts the other model's scenarios before the walk. On a very large diff the designer's read ran far longer than the usual 5–10 minutes, and the walkers would have sat idle.

**Suggested improvement:** Say in §5 that the fan-out may start on the plan's own walk list while the designer reads, with each walker told that more scenarios will arrive by message, and the host forwards the designer's list per walker the moment it lands — the scenarios still reach the walk before the reads.

**Principle:** Keep the independent input's ORDER relative to what it must precede (the reads), not relative to work it only adds to.

### Observation 389: In a one-row-per-thing store, hunt the "first write stores everything" path — it recurs

**Status:** OPEN
**Date:** 2026-09-30
**Session context:** [DB-READINESS] group A's group-wide FULL walk — every record split into one row per thing
**Skill:** bug-check order (`raptor-port/docs/bug-check-order.md` §6 roll-call, §2a "Saved data / storage") — project method, internal
**Type:** internal
**Phase/Area:** the roll-call's columns for a storage change

**Issue:** The same hole turned up four separate times in one walk, each in a different part of the app: a week's FIRST save wrote all seven day rows from the saver's copy (two people on two days of a new week — one wiped); the Tracker's FIRST chart-order save placed every chart (a stale tab undid it); a demo store's FIRST account write stored every account it held (a stale tab undid a suspension); and a decision that moved a record to the end of its list re-placed its neighbour. Each was correct for one browser and each broke the promise of the change ("two people changing different things never overwrite each other"). The per-phase tests all exercised the steady state, after the first write.

**Suggested improvement:** In §6, for a storage-shape change, add a roll-call column per writer: "on its FIRST write (nothing of it stored yet), and when it re-places a list, does it write ONLY what its own action changed?" — and a two-tab step in the walk for each writer whose answer is not a plain yes, with the second tab opened before the first write.

**Principle:** A row-per-thing store is only as good as its least disciplined write; the first write and any re-ordering write are where "everything I hold" sneaks back in — check them by name.

### Observation 390: A "missing batch" fix wrapped a write that should not have existed at all

**Status:** OPEN
**Date:** 2026-09-30
**Session context:** [DB-READINESS] group A's group-wide FULL check — the walk, then Fable's and Astra's blind code reads
**Skill:** bug-check order (`raptor-port/docs/bug-check-order.md` §5 "fix", §7 findings) — project method, internal
**Type:** internal
**Phase/Area:** choosing the fix for a MISSING-line finding

**Issue:** The walk found the boot writing a day row bare, outside every saved group (H1). The fix wrapped that write in a group with its change-log batch — which made the walk's check pass. Both reviewers, independently, then found the write itself was the defect: it saved this browser's (possibly stale) copy of a day another person may have changed, and made a member's browser the writer of days a member may not write. The right fix removed the write. The same happened to a week load's landing save, which the evidence sheet had already reasoned about and called "not a loss, not a clash".

**Suggested improvement:** In §5's fix step, for a finding of the form "X is written outside the rules", ask first — and write the answer in the disposition — "should X be written at all, by this actor, from this copy?" before making the write conform. Name the two questions in the evidence sheet's disposition column for any storage finding.

**Principle:** A check that verifies HOW something is written invites a fix that makes the write compliant; ask WHETHER it should be written before fixing how.

### Observation 391: Stopping a locked full-gate run leaves the PC lock held

**Status:** OPEN
**Date:** 2026-09-30
**Session context:** [DB-READINESS] group A — a gate run was stopped mid-way because a reviewer's finding meant a code change
**Skill:** `raptor-port/scripts/gatelock.mjs` / `.claude/rules/shipping.md` §The checks — project tooling, internal
**Type:** internal
**Phase/Area:** the gate lock's release

**Issue:** `gatelock.mjs run` promises to always release, but stopping its task kills it before its release runs; the lock folder stayed, and would have blocked a parallel chat for up to two hours (the stale limit) had it not been released by hand.

**Suggested improvement:** In shipping.md's lock paragraph add one line: "a run you stop is not released — release it yourself at once (`gatelock.mjs release`)"; or have `run` record its pid and let `take` break a lock whose pid is gone.

**Principle:** A cleanup that lives in the process being killed is not a cleanup; say so where the kill happens, or make the next taker check the owner is alive.

### Observation 392: A phase that a reviewed plan only sketched needs its own code sweep before it is detailed — the sketch's premises were wrong in four places

**Status:** OPEN
**Date:** 2026-09-30
**Session context:** Planning [DB-READINESS] group A phase 6 (a four-line sketch inside a plan red-teamed three rounds by two providers).
**Skill:** writing-plans
**Type:** open-source
**Phase/Area:** turning a plan's sketched later phase into a buildable plan

**Issue:** The parent plan's phase 6 was a few lines, carried through three review rounds that focused on the earlier phases. Three parallel read-only sweeps of the code before detailing it overturned four premises: one sub-step was already half built (a read-side filter existed; only one ordering case needed a new stamp), one was already cosmetic (the counts it named were computed elsewhere), one was far narrower than its "18 readers" wording implied (only one category of record is ever written into a day), and one had no single choke point the sketch assumed. Two owner rulings (a restore that deliberately brings back a deleted item's row; a live filing that lands as pending) also constrained the design in ways the sketch never mentioned.

**Suggested improvement:** In writing-plans, add: "When detailing a phase that an earlier, reviewed plan only sketched, treat the sketch's premises as unverified: run a fresh read-only sweep of every mechanism it names (writers, readers, tests that pin today's behaviour) and list which premises held, before writing steps. Review of a plan validates what it details, not what it sketches."

**Principle:** A review certifies the level of detail it was shown; a sketched step inherits none of that confidence and must be re-grounded in the code before it is planned.

### Observation 393: A reviewer's proposed fix is a hypothesis — test it against every order the replaced mechanism guarded before applying it

**Status:** OPEN
**Date:** 2026-09-30
**Session context:** Folding a plan red team's finding into an already-built step ([DB-READINESS] phase 6 (a), an earned-leave refusal stamp).
**Skill:** receiving-code-review
**Type:** open-source
**Phase/Area:** applying a reviewer's "Fix — build" instructions

**Issue:** The reviewer's finding was real (a refusal about a man added to a row was dropped once the request was handed to him), and the report gave exact step-by-step fix instructions. Applied as written, the fix would have reintroduced the very bug the old mechanism existed to prevent, on a longer order (added → handed to him → handed away → back to him: the refusal revives). The reviewer had even flagged that order and asked to "pin it" as today's rule — but it was not today's rule; the removed code had voided it. Checking the proposed fix against every order the old code guarded (not only the reviewer's scenario) found a simpler, stricter design (record on the request when it LEFT each man) that satisfied all orders.

**Suggested improvement:** In receiving-code-review, add: "When a finding comes with exact fix steps, treat the steps as a hypothesis. Before applying, list the orders of actions the code being replaced was protecting (its tests, its comments), and check the proposed fix against each — especially any order the reviewer calls 'today's behaviour'; verify that claim against the code before pinning it."

**Principle:** A precise fix instruction can still be wrong on an order its author did not trace; the orders the old mechanism guarded are the checklist for any replacement, whoever proposed it.

### Observation 394: A "nothing on screen changes" build is checked by walking it AND the build before it with one script, and diffing what the screen said

**Status:** OPEN
**Date:** 2026-09-30
**Session context:** The FULL bug check of [DB-READINESS] phase 6 (a), (b), (d) — storage-only changes whose plan promised no visible change bar two named ones.
**Skill:** `raptor-port/docs/bug-check-order.md` §7 / §8 (the project's bug-check method) — internal
**Type:** internal
**Phase/Area:** the walk — how to prove a "no visible change" promise

**Issue:** Assertion-style walk steps encode the builder's picture of what should stay the same, so they cannot see a visible change nobody predicted. The check built the commit before the change from a `git archive` export (a worktree failed on Windows path length), served both builds, ran each walk script against both with a `fact(key, value)` recorder of what the screen said at every step (day heads, the Amendments panel, pending lists, OIL switches, who sits where), and diffed the two fact files. It surfaced two visible changes the plan never listed — a panel's count that dropped (the change's side effect) and a defect of the OLD build that the change fixed — both invisible to the assertions, which passed on both builds.

**Suggested improvement:** Add to the bug-check order §8: "When a change promises that nothing on screen changes, run the walk on the build before it too (export that commit's `src` + config to a short path, symlink `node_modules`, build, serve on another port), record screen facts per step, and diff them (`scripts/handpass/p6-compare.mjs` is the worked example). Every difference is either intended storage or a finding; say which." Mention the Windows path-length trap for `git worktree add` on this repo.

**Principle:** To prove "nothing changed", compare against the thing before the change, fact for fact; assertions written from the new code's intent only prove what the author thought to assert.

### Observation 395: A new chat was opened with the PREVIOUS chat's opening line; the handoff block's "Pick up here" caught it, but only because it was read against the ask

**Status:** OPEN
**Date:** 2026-09-30
**Session context:** Opening a chat on an in-flight branch; the owner pasted "plan and build phase 6" — the line the last chat had started with — while the handoff block said the next job was the FULL check (his own ruling, D467).
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** the next chat's first step / the handoff block's contents

**Issue:** The block names the next job in prose ("Pick up here"), but not the exact opening line the owner was given, so nothing flags a pasted stale line except the agent comparing the ask with the block by hand. Here that comparison showed the ask would have jumped ahead of a ruling and built on unchecked work; the owner confirmed the recorded order when asked.

**Suggested improvement:** In session-handoff, write the ready-to-paste opening line INTO the block (a `Opening line:` bullet), and add to the "next chat" guidance: "compare the opening message with the block's Opening line and Pick up here; if they differ, name the difference and ask before starting."

**Principle:** A handoff should carry the instruction it hands over verbatim, so the receiver can tell a stale instruction from a new one instead of guessing.

### Observation 396: A derived view over a saved base must track exactly what the persistence layer writes, including effects that run before the writer reads

**Status:** OPEN
**Date:** 2026-10-01
**Session context:** [DB-READINESS] phase 6 (c) v3 — designing a "holder base" so a request's derived effect on a day is reversible by Undo and identical right after an act and after a reload.
**Skill:** writing-plans (and claudex-loop plan red-teams)
**Type:** open-source
**Phase/Area:** Plan design — derived state vs stored state

**Issue:** The design had to keep an in-memory "base" per day that must equal the stored row at all times. Reading the command engine showed the row writer (a phase-9 stream consumer) reads the command layer's baseline AFTER phase-8 effects have run and re-synced it — so an after-command effect that recomputes derived state also changes what gets stored for any day the command wrote. A base updated only from the command's own changes would silently diverge from storage. The fix was "absorb, then bake": a day the command wrote takes the live day as its base, and after the derived view is worked out, the view itself becomes the base — because that is what the writer will store. Also: the in-memory copy written when leaving a screen had to become the base, not the view, or a return to the screen would differ from a reload.

**Suggested improvement:** In writing-plans, add a checklist item for any plan that layers a derived/computed view over persisted state: (1) name the exact moment and source the persistence writer reads; (2) state the invariant "base == stored" and show each writer (commands, effects, caches written on navigation) preserves it; (3) require a test that compares "right after the act" with "after a reload" for every act, including Undo/Redo.

**Principle:** When a derived view sits on a saved base, the base must be defined as what the persistence layer actually writes, at the moment it writes it — trace every effect that runs before the writer, and every cache written on navigation, or "right after" and "after a reload" drift apart.

### Observation 397: A typecheck that checks nothing reads as a clean pass — confirm the command covers the source first

**Status:** OPEN
**Date:** 2026-10-01
**Session context:** [DB-READINESS] phase 6 (c) v3 build — typechecking each edit while building.
**Skill:** verification-before-completion
**Type:** open-source
**Phase/Area:** Verification commands — "does this check actually look at my change?"

**Issue:** For most of the build the agent ran `tsc --noEmit -p tsconfig.json`, which in this repo is a solution-style root config with no files of its own (the real settings are in `tsconfig.app.json`, reached by `tsc -b`). Every run printed nothing and was read as "clean". Three files used a new helper without importing it; the gap surfaced only as a runtime ReferenceError inside a unit test ("reducer threw (rolled back)"), which first looked like a design failure.

**Suggested improvement:** In verification-before-completion, add: before trusting a silent checker, prove it checks the change — introduce (or recall) a known error once and see it reported, or use the project's own build script (`npm run build` → `tsc -b`). A checker that has never been seen to fail on this repo is not evidence.

**Principle:** Silence from a check is evidence only if that check has been seen to catch a defect in the same setup; otherwise confirm its coverage first.

### Observation 398: A test helper that renames a field silently drops it — a fixture assertion catches the mis-set-up, not the feature

**Status:** OPEN
**Date:** 2026-10-01
**Session context:** [DB-READINESS] phase 6 (c) — red-first tests for round-3 findings.
**Skill:** test-driven-development
**Type:** open-source
**Phase/Area:** Break tests / red-first verification

**Issue:** A new test passed with its fix removed. Investigation showed the helper (`file({ end: ... })`) built its draft from a record field named `endDate`, so the `end` the test passed was silently dropped: the "two-day request" was a one-day request and never exercised the bug. The break test (removing the fix and re-running) is what exposed it; a green run alone would have shipped a test that proves nothing.

**Suggested improvement:** In test-driven-development's red-green cycle, add: when a test stays green with its fix removed, first assert the fixture's premise (e.g. `expect(req.endDate).toBe(...)`) before suspecting the fix; and write premise assertions into the test so a mis-built fixture fails loudly.

**Principle:** A test must assert its own set-up where the set-up is the point; the break test is how you find a fixture that silently didn't build the scenario.

### Observation 399: A reviewer CLI started in a background shell sat waiting on its input for minutes — close the input explicitly

**Status:** OPEN
**Date:** 2026-10-01
**Session context:** [DB-READINESS] phase 6 (c) FULL check — the scenario-design run of the second-provider reviewer (Codex, "Astra") started with `run_in_background`.
**Skill:** claudex-loop / codex-review
**Type:** open-source
**Phase/Area:** Launching the independent reviewer

**Issue:** The reviewer command (`codex exec … "<prompt>" > log`) printed "Reading additional input from stdin..." and then nothing for four minutes; the log showed no session header. Given a prompt argument, the CLI still appends whatever arrives on standard input, and a background shell leaves standard input open, so it waited forever. The same command had run fine in the foreground earlier the same day. The run was stopped and restarted with `< /dev/null`, and completed.

**Suggested improvement:** In the codex-review / claudex-loop launch recipe, always close standard input on a non-interactive reviewer run (`codex exec … < /dev/null`), and check the log for the session header a minute after launch before walking away.

**Principle:** A command-line tool that can read extra input from standard input will hang silently when launched detached with the input left open; close it explicitly on every unattended run, and confirm the first sign of progress rather than assuming the run started.

### Observation 400: A reviewer's "missing call site" was closed by an invariant that missed one case — an invariant disposition must enumerate every way the definition is met, and still get a test

**Status:** OPEN
**Date:** 2026-10-01
**Session context:** [DB-READINESS] phase 6 (c) FULL check — the scenario designer marked four OIL helpers MISSING because they find "the request's row" by its id instead of the shared standing-row predicate.
**Skill:** bug-check order (raptor-port/docs/bug-check-order.md §7.6, dispositions)
**Type:** open-source
**Phase/Area:** Dispositioning a static finding

**Issue:** Three MISSING lines beside it were real and fixed red first. The fourth was closed as "not a defect, by construction": a "dead" row, the argument went, can only sit on a day its request no longer covers, so the one-day raw lookup and the predicate always agree. The definition of "dead" had THREE branches (not covering, not an activity, filed under Unavailable) and the argument used one. The final code read (the same provider, blind) built the missed branch — a request filed under Unavailable still covers its day — and a test with its premise checked showed a second man on that row being paid. Written up as settled, the wrong disposition would have shipped a money defect.

**Suggested improvement:** In §7.6, allow "not a defect, by construction" only when (a) the disposition lists EVERY branch of each definition it rests on and argues each, and (b) a test pins the case anyway (the invariant becomes an assertion, not prose). An argument that cannot be turned into a test is a hypothesis.

**Principle:** A proof that a failure cannot happen is only as good as its enumeration of the definitions it uses; pin it with a test, because the branch you did not list is exactly where the next reviewer — or the bug — will be.
