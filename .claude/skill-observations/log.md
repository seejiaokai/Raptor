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

**Status:** ACTIONED (2026-09-24) — applied the other way round by D140: `HANDOFF.md` became the one handoff and `HANDOFF-NEXT.md` a three-line signpost to it, so his opening line still lands; the session-handoff skill writes `HANDOFF.md ## Now` (its rewrite awaits his approval, D70). The suggestion to make `HANDOFF-NEXT.md` the output is superseded.
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

### Observation 198: A gate piped into `tail` reports its output but loses its verdict

**Status:** OPEN
**Date:** 2026-09-23
**Session context:** [DOCS-GUARD] — building a document gate whose whole job is to fail loudly
**Skill:** New skill candidate: gate-before-commit (or verification-before-completion)
**Type:** open-source
**Phase/Area:** running a check and committing in one chained shell command

**Issue:** The agent ran `node gate.mjs | tail -4 && git add -A && git commit ...`. The gate FAILED
(exit 1, a real finding), but a pipeline's exit status is the LAST command's — `tail`'s 0 — so the
chain went on and committed the failing state. The failure text was on screen, but the decision to
commit had already been made by the shell. Caught one command later only because the agent read the
output of that very command.

**Suggested improvement:** Wherever a skill tells the agent to run a gate before committing, require
the gate's exit code to be captured on its own (`gate > out.txt 2>&1; echo "exit=$?"`, or
`set -o pipefail`) and read BEFORE the commit command is written — never trimmed with a pipe in
the same chain as the commit.

**Principle:** Trimming a check's output with a pipe also throws away its verdict. Read a gate's exit
code separately from its output, and never let the same line that runs a gate also act on it.

### Observation 199: A "load-sensitive" test that fails alone on a quiet machine — replay it at human pace before pacing the test

**Status:** OPEN
**Date:** 2026-09-23
**Session context:** [LW-MONTHJUMP-PHONE] — making three browser tests robust on a slow machine, test-only.
**Skill:** systematic-debugging
**Type:** open-source
**Phase/Area:** Phase 1 (root cause) and condition-based-waiting.md — timing failures

**Issue:** The backlog recorded a phone test as failing "under machine load". Measured, it failed 10/10 run alone on a quiet desktop and PASSED inside a busy full run. Settling the grid between the two taps did not stop it; replaying the scenario at a person's pace (1s, tap, 1.5s, tap) still landed the view a day short about half the time. Cause: an app-side 160ms "in motion" window — a fast machine regrows a month inside it and skips a re-anchor; a slow one lands outside it. Pacing or settling the test would have made it pass while the product stayed wrong.

**Suggested improvement:** In Phase 1 (and condition-based-waiting.md "When to use"), add: "Before you pace or settle a timing-sensitive test, replay its scenario at human pace and on both a slowed and an unloaded machine. If a person at ordinary speed can reach the failing outcome, it is a product finding: file it, keep the test honest, and do not pace the test around it." Extends Observation 195 from state leakage to timing.

**Principle:** A timing failure is a product bug whenever a user at ordinary pace can reach it. Pace a test only to what a user does, never past the bug — and "load-sensitive" can mean it fails on FAST machines.

### Observation 200: Reproduce a slow CI runner on demand, and prove a flake fix at that slowness

**Status:** OPEN
**Date:** 2026-09-23
**Session context:** [LW-MONTHJUMP-PHONE] — two browser scenarios timed out only on GitHub's runner.
**Skill:** systematic-debugging
**Type:** open-source
**Phase/Area:** condition-based-waiting.md — verifying the fix

**Issue:** The timeouts happened only on the CI runner; locally every run passed, so "red before" was impossible to show. Chromium CPU throttling (CDP `Emulation.setCPUThrottlingRate`, behind an opt-in env var) at 2x–4x reproduced the exact failures on the desktop, calibrated against the runner's own durations (a 10s local test took 23s green and over 30s red there). It turned the fix into a table: 3 runs per slowdown, before and after, same bundle.

**Suggested improvement:** Add a "Prove it on a slow machine" section to condition-based-waiting.md: make the slowness reproducible (CPU throttling for browsers, or an N-core busy load), calibrate the factor from the CI durations, and run each changed test several times per factor before and after. Report where it still breaks.

**Principle:** A flake fix is proven only at the slowness that caused it. Make that slowness reproducible, measure against it, and state the factor at which the fix stops holding.

### Observation 201: A condition wait must watch what the next step uses, not a broader proxy

**Status:** OPEN
**Date:** 2026-09-23
**Session context:** [LW-MONTHJUMP-PHONE] — replacing fixed pauses with condition waits.
**Skill:** systematic-debugging
**Type:** open-source
**Phase/Area:** condition-based-waiting.md — choosing the condition

**Issue:** A "grid at rest" wait watched both the scroller's position and the target element. On desktop the grid keeps drawing months to the LEFT for seconds after a jump, each draw re-anchored so nothing visible moves — but the scroller position changes with every draw. The wait therefore waited for the whole background fill, and the step got slower than the fixed pause it replaced. Watching only the target element's on-screen position (what the next click lands on) fixed it.

**Suggested improvement:** In condition-based-waiting.md "Common Mistakes", add: "Waiting on a proxy — a condition that also changes for unrelated background work turns the wait into waiting for that work. Watch exactly the state the next action depends on."

**Principle:** A condition wait should observe precisely the state the next action consumes; a broader proxy silently couples the test to unrelated background work.

### Observation 202: When removing a pause, check what each read returns if its target is not there yet

**Status:** OPEN
**Date:** 2026-09-23
**Session context:** [LW-MONTHJUMP-PHONE] — a reload test compared cell contents before and after a reload.
**Skill:** systematic-debugging
**Type:** open-source
**Phase/Area:** condition-based-waiting.md — false passes

**Issue:** The test read grid cells by `querySelector(...)?.textContent` before and after a reload and compared the two lists. A cell not drawn yet read `undefined` — on BOTH sides alike — so the comparison could pass without comparing anything. The fixed pause had only been hiding this by usually giving the grid time to draw.

**Suggested improvement:** In condition-based-waiting.md, add: "For every read that follows a removed pause, ask what it returns when its target does not exist yet. A symmetric empty value (undefined/null/'') in a before/after comparison is a false pass — wait for each target to exist first."

**Principle:** A comparison between two reads is only a check if both reads are guaranteed to have found something; symmetric emptiness passes silently.

### Observation 203: Green locally, red on a CI runner on the SAME machine — compare the checkout's settings before the code

**Status:** OPEN
**Date:** 2026-09-23
**Session context:** [CI-TWO-CORES] — moving a repo's CI onto the owner's own Windows PC (self-hosted runner).
**Skill:** systematic-debugging
**Type:** open-source
**Phase/Area:** Phase 1 (root cause) — environment differences

**Issue:** The first CI run on the owner's PC failed two unit test files that passed on that very PC minutes earlier. Same machine, same code, same Node — but not the same checkout: the runner makes a FRESH clone, which took Git for Windows' system default (`core.autocrlf=true`) and came out CRLF, while the owner's working copy had `core.autocrlf=false` in its own `.git/config`. A test helper patched a reference file by exact text spanning a line break and found nothing. `git config --show-origin --get-all core.autocrlf` named the cause in one command; a fresh-clone rehearsal proved the fix (scoped to the runner's clone, never the user's global settings) before spending a 15-minute CI run.

**Suggested improvement:** In Phase 1's "Check Recent Changes → Environmental differences", add: "A run on a NEW checkout (CI, a fresh clone, a new worktree) inherits the machine's defaults, not your repo's local config. When local is green and a fresh checkout is red, diff the checkouts' settings (line endings, `git config --show-origin`) before the code — and rehearse the fix on a fresh clone before re-running the slow pipeline."

**Principle:** "It works on this machine" can hide a per-checkout setting; a fresh checkout is a different environment even on the same computer. Rehearse an environment fix on a disposable copy before paying for another full pipeline run.

### Observation 204: A "docs-only" push to a pull request that carries code re-runs every check and cancels the running one

**Status:** OPEN
**Date:** 2026-09-23
**Session context:** [LW-MONTHJUMP-PHONE] / [CI-TWO-CORES] — recording a ruling while a trial run of the checks was going on the owner's PC.
**Skill:** session-handoff (Step 1, the "docs-only handoff has NO checks" paragraph)
**Type:** open-source
**Phase/Area:** Step 1 — pushing the handoff

**Issue:** The skill said a docs-only handoff runs no checks, because the workflow's `paths-ignore` skips docs. That holds for a push to `main`, not for a pull request: GitHub evaluates a `pull_request` path filter against the WHOLE pull request's diff, so once the PR carries code, a notes-only push starts the full gate run again — and the workflow's `concurrency: cancel-in-progress` cancelled a trial run 7 minutes in. The owner then ruled D151 (never push while a PR's checks are running). The paragraph was corrected in place under the skill's own Rule 7.

**Suggested improvement:** Keep the corrected paragraph; in Step 1's closing checklist add "check that no check run is in progress on the branch before the final push".

**Principle:** A path filter's scope differs by event: on a pull request it sees the whole PR, not your last commit. Before any push to a branch with an open PR, check whether a run is going — the push restarts it, whatever it contains.

### Observation 205: A check made after a wait can never see a one-frame defect — read the state in the task that inserts the element

**Status:** OPEN
**Date:** 2026-09-23
**Session context:** Leave War frozen date bar "scrolling rapidly horizontally" (the owner filmed his desktop with his phone); three follower bars were each placed one painted frame late.
**Skill:** systematic-debugging (Phase 1, reproduce) and test-driven-development (writing the red test)
**Type:** open-source
**Phase/Area:** reproducing a flash/jump; the regression test for it

**Issue:** Four existing tests of the frozen header all passed: each scrolled the page, waited 200–400ms, then measured — by which time the jump was over. The defect lived in exactly ONE painted frame (the element mounted and its position was set in an effect that runs after paint). It was reproduced by sampling from inside the page on every animation frame (a requestAnimationFrame loop recording the bar's offset from the grid it copies), and pinned by a test that reads the element inside a MutationObserver callback — which fires after the framework's commit and before the browser can paint. A roll-call of every element that "appears, then gets positioned" found the same one-frame-late shape in two more bars.

**Suggested improvement:** systematic-debugging Phase 1: "If the report is a flash, a jump or a flicker, a post-wait assertion cannot see it. Reproduce by sampling per frame from inside the page; pin it with a check that runs in the same task as the change (a MutationObserver callback), never after a timeout." test-driven-development, Verify RED: "a test that waits before asserting passes on a one-frame defect."

**Principle:** Measure a transient defect at the moment it happens; a settle-wait is exactly what hides it.

### Observation 206: Identical numbers before and after a fix have two explanations — I told the owner one before checking

**Status:** OPEN
**Date:** 2026-09-23
**Session context:** Proving red-before/green-after for three Leave War fixes on a locally built bundle.
**Skill:** systematic-debugging (Red Flags) / verification-before-completion
**Type:** open-source
**Phase/Area:** interpreting a re-run

**Issue:** The green-after run reproduced the red-before failure numbers to the decimal. I told the owner "that run was invalid — the previous run's server was left running, so it tested the old app" and only then checked: the run HAD rebuilt; the result was real and the fix was incomplete (a second, browser-level cause remained). Two explanations fitted the evidence — "the run did not test the fix" and "the fix does not work" — and I reported one as fact. Corrected in the next message after checking the build log.

**Suggested improvement:** systematic-debugging, Red Flags: "Identical results before and after a change mean either the change did nothing or the run did not exercise it. Run the one check that tells them apart (build timestamp, served bundle, server reuse) BEFORE stating either to anyone."

**Principle:** Before reporting a cause, run the one check that distinguishes it from the other explanation that fits the same evidence.

### Observation 207: A red-first test that passes on the old code has found a second cure hiding in the scenario

**Status:** OPEN
**Date:** 2026-09-23
**Session context:** [LW-HBAR-RESYNC] — a month pressed inside the scrollbar's 250ms drag hold must still move the thumb.
**Skill:** test-driven-development (Verify RED)
**Type:** open-source
**Phase/Area:** Verify RED — the test fails for the right reason

**Issue:** The rewritten test passed 3 of 3 on the unfixed code. Its jump (January → September) also hid a posted-out man's row; that row change made the grid re-measure ~200ms later, AFTER the hold had ended, which re-synced the thumb — an incidental cure unrelated to the fix. Moving the scenario to months where no row comes or goes (found by listing the rows each month shows) made the old code fail 5 of 5 and the fixed code pass 5 of 5.

**Suggested improvement:** In Verify RED: "If the test passes on the old code, do not just tighten the assertion — find what healed the symptom in that scenario and choose one where only the fix can make it pass. List the side effects of each step (here: which rows each month shows) to find it."

**Principle:** A red-first failure must come from the missing fix, not from timing; when the old code passes, the scenario contains a second path to the right answer.

### Observation 208: Step-by-step instructions to a non-technical user must put "copy it" BEFORE the button that can take it away, and say what the screen should show

**Status:** OPEN
**Date:** 2026-09-23
**Session context:** Guiding the owner to re-register his PC's GitHub runner as a Windows service (a credential step the agent must not do itself).
**Skill:** New skill candidate: guiding a non-technical user through a setup the agent may not perform
**Type:** internal
**Phase/Area:** writing the numbered steps

**Issue:** The steps said "click Remove, copy the command it shows". He clicked through and the runner was removed on GitHub with the command never copied, leaving the PC's copy still registered (recovered by moving its dead registration files aside). He also followed the page's own Download box into a NEW nested folder, so the service now runs from `C:\actions-runner\actions-runner` — harmless, but a later "tidy up the old folder" would delete the live one. He asked for the steps again once, mid-way.

**Suggested improvement:** For any hand-held setup: (1) the copy/record step comes BEFORE any button that could close or complete the dialog; (2) each step names what the screen should show next (e.g. the exact folder in the prompt), so a wrong turn is visible at once; (3) give a recovery line for the likely mistake up front; (4) verify the result read-only afterwards and say where things actually ended up.

**Principle:** A non-technical user follows the screen, not the plan; write each step so the screen confirms it, and order steps so no single click can lose information needed later.

### Observation 209: Who can modify a local CI runner's files includes the AI tools' own sandbox accounts

**Status:** OPEN
**Date:** 2026-09-23
**Session context:** Moving a repo's checks onto the owner's Windows PC as a self-hosted runner service; an independent reviewer flagged the install folder's inherited permissions.
**Skill:** security-review (and any skill that sets up local services)
**Type:** open-source
**Phase/Area:** threat model — local accounts

**Issue:** The runner folder sat under C:\ and inherited "Authenticated Users: Modify", so any local account could replace the runner's binaries, which then run as the service account on every CI job. "It's a personal PC with one user" was the natural dismissal — but listing the enabled local accounts showed two more: the sandbox accounts a coding agent's CLI creates to run commands. The reviewer's finding was sharper than it looked because the "other local user" was the agent tooling itself.

**Suggested improvement:** In security-review, for anything installed as a local service or runner: enumerate ENABLED local accounts (not just "who uses this PC"), check the install folder's inherited ACL, and prefer a folder that does not inherit broad write rights (or remove them) before trusting the service account's restriction.

**Principle:** A restricted service account only helps if nobody else can rewrite what it runs; count every local account — including tool-created sandbox users — as a potential writer.

### Observation 210: A CI runner moved into a Windows service can hang forever on a credential prompt nobody can see

**Status:** OPEN
**Date:** 2026-09-23
**Session context:** The first check run on the owner's PC after its GitHub runner became a Windows service (NETWORK SERVICE); the browser-test step sat 30 minutes doing nothing.
**Skill:** systematic-debugging (Phase 1, environment differences)
**Type:** open-source
**Phase/Area:** diagnosing a hung CI step

**Issue:** Trial runs of the same workflow had passed when the runner ran by hand in the owner's desktop session. As a service, the browser step hung with near-zero CPU, no browser processes and nothing on its port. The live log was not readable locally (buffered), so the process table did the diagnosis: parent/child chains and creation times (not command lines — another account's are hidden) showed a git process started two seconds into the step, waiting in the credential manager. The test tool fetches from the remote in CI to describe the diff; a security fix earlier the same day had stopped the checkout storing a token; and a service has no screen for a sign-in prompt.

**Suggested improvement:** Phase 1: "When a step that used to pass hangs after an environment change (interactive → service, user → service account), check for anything waiting on interaction: credential managers, UAC, first-run prompts. With idle CPU, read the process tree's creation times to find what started when the step began." And for CI on a self-hosted service: set  and  so a prompt fails instead of waiting, and switch off tools' optional network look-ups.

**Principle:** A service cannot answer a prompt; anything that might ask one must be made to fail fast, or the job waits until its timeout with no error at all.

## 2026-09-23 — [HUMAN-RETEST] the Tracker

### Observation 211: A scripted gesture that "fails" is the driver's until the picture says otherwise

**Status:** OPEN
**Date:** 2026-09-23
**Session context:** [HUMAN-RETEST] hands-on re-test of the Tracker tab (Raptor), driven by Playwright scripts. Numbered past every entry on the pushed branches (max 198); first written as #199–#201 on `claude/tracker-human-retest-8d3411` and renumbered #211–#213 when `main` (with the Leave War chat's #199–#210) was merged in.
**Skill:** raptor-port/docs/bug-check-order.md (§7.2 "Stand up the real thing")
**Type:** open-source
**Phase/Area:** the walk — driving a surface with its own gestures

**Issue:** Two scripted steps failed in ways that read like app defects: "the header intercepts pointer events" on a ball, and a ball drag that did not move the ball. Both were the driver's: a generic scroll-into-view had left the ball above the chart's own scroll box (under the toolbar), and in the chart's edit mode the wheel ZOOMS and the view pans by dragging empty space, so a wheel-scroll never moved it. The screenshot showed it in one look; the error text alone would have produced two false findings.

**Suggested improvement:** In §7.2, add: "The driver moves the view with the surface's OWN gesture (its scroll, its drag-to-pan) and checks the target sits inside the scroll box before acting. A scripted gesture that fails is looked at on its picture before it is called a defect."

**Principle:** A driver that moves the view differently from a person manufactures defects; look at the picture before believing a failed gesture.

### Observation 212: A fix or ruling applied to ONE of two places that draw or write the same thing — twice in one tab

**Status:** OPEN
**Date:** 2026-09-23
**Session context:** [HUMAN-RETEST] the Tracker — the walk found a wording ruling applied to one of two editors that carry the same box, and a data-leak fix applied to one of two writers of the same record.
**Skill:** raptor-port/docs/bug-check-order.md (§6 the roll-call) and raptor-port/CLAUDE.md (the robustness doctrine's "grep for the old wording")
**Type:** open-source
**Phase/Area:** fixing — reach of a fix

**Issue:** A ruling changed a hint's wording in the details window; Show All's inline editor, which shows the same box, kept the old words. Earlier, a leak (one chart's event details stored as every chart's) was fixed in the details window's writer; the chart editor's ball box, a second writer of the same record, kept the leak. The standing "grep for the old wording" rule existed both times. Both were found only by walking both surfaces.

**Suggested improvement:** Add to §6: "A wording ruling, or a fix to a writer, gets its own small roll-call in the same commit — every place that draws that text or writes that record — and the fix is STRUCTURAL: one shared constant or one shared body, with a test that renders or drives each place."

**Principle:** When several places draw or write the same thing, make them share one body and test every place; a "remember to grep" rule is already known to fail.

### Observation 213: Walkers need the artifact frozen while the host fixes in parallel

**Status:** OPEN
**Date:** 2026-09-23
**Session context:** [HUMAN-RETEST] the Tracker — three parallel walkers drove the built preview while the host wrote fixes for findings already confirmed.
**Skill:** raptor-port/docs/bug-check-order.md (§4, the fan-out paragraph from D16)
**Type:** open-source
**Phase/Area:** fan-out walks — sharing one running build

**Issue:** The walkers drive the production build served from the working tree's output folder; a host rebuild mid-walk would swap the bundle under them and mix pre- and post-fix behaviour in one walk. So while they walked, the host could only typecheck without emitting and run unit tests, and the rebuild, the full gates and the re-walk waited for their reports. Separately: fresh browser contexts isolate storage, so the walkers shared ONE preview port with no clash — the "own port each" advice is unnecessary when every walker starts a fresh context.

**Suggested improvement:** In §4's fan-out paragraph: "Walkers may share one preview (a fresh browser context each isolates storage). While they walk, nobody rebuilds that preview: the host fixing in parallel typechecks with no output and runs unit tests; the rebuild, the gates and the re-walk of the fixes come after the walkers report."

**Principle:** Parallel checks against one running artifact need that artifact frozen; name who may change it, and when.

### Observation 214: A walker's own "should" script is the re-walk — send its output to a second folder, and read its FAILs against the fixed flow

**Status:** OPEN
**Date:** 2026-09-23
**Session context:** [HUMAN-RETEST] the Tracker, resumed — re-walking every fix the three walkers never saw (they drove the build from before the fixes).
**Skill:** raptor-port/docs/bug-check-order.md (§5 "re-walk only what the fixes touched"; §9 the evidence)
**Type:** open-source
**Phase/Area:** the re-walk after fixes

**Issue:** The walkers had written their scripts as assertions of the RIGHT behaviour (PASS = correct), so re-running them on the new build was the re-walk for free — but by default they overwrite the first walk's pictures and results, which are the evidence of the defect. And three re-walk "FAILs" were the fix itself changing the flow: Export now offers to save the unsaved edit, so the script's later steps ("the dropdown asks about the unsaved edit") had nothing unsaved left to test; and a refusal now drawn ON TOP of the Export window blocked the old script's click behind it (a crash that proves the fix).

**Suggested improvement:** In §5/§9: "Write walk scripts as assertions of the correct behaviour so they re-run as the re-walk. Give the driver an output-folder switch and re-walk into a separate folder — the first walk's pictures are the defect's evidence. Read every re-walk FAIL against the NEW flow before calling it a regression: a step whose premise the fix consumed is re-walked with a fresh premise, not reported."

**Principle:** A re-run of a pre-fix script proves the fix only where its premises still hold; keep the before-evidence, and re-establish premises the fix itself removed.

### Observation 215: A decision recorded as "left as it is today" can hide a two-part rule — read it as behaviour, not as licence to simplify

**Status:** OPEN
**Date:** 2026-09-23
**Session context:** [HUMAN-RETEST] the Tracker — building D123 (Last Flown is the latest day actually flown), whose record also says a hand-typed Last Flown is "left as it is today".
**Skill:** raptor-port/docs/bug-check-order.md (§5 question 8, the rules sweep) and .claude/rules/record-decisions.md
**Type:** open-source
**Phase/Area:** turning a ruling into code

**Issue:** The obvious build — "work Last Flown out from the flights marked done" — would also have overridden a day typed by hand the moment any older flight was marked, which is NOT how it behaves today (a typed day stands until a LATER flight). The ruling's last sentence kept that half unchanged; honouring both halves needed a small marker on the stored record (typed-by-hand) so a derived value never silently replaces a typed one. The first draft of the test had the wrong expectation until the sentence was re-read as a behaviour to preserve.

**Suggested improvement:** In the rules sweep: "When a ruling leaves part of a behaviour 'as it is today', write that part down as its own test against today's behaviour BEFORE building the new half — the new half must not absorb it."

**Principle:** "Unchanged" clauses in a ruling are requirements too; pin them with a test before building the changed part.

### Observation 216: A layout that passes at the two standard sizes can still break at a SHORT one — padding on a scroll box sets its smallest height

**Status:** OPEN
**Date:** 2026-09-23
**Session context:** [HUMAN-RETEST] the Tracker, re-walk after fixes — a phone turned on its side (844×390).
**Skill:** raptor-port/docs/bug-check-order.md (§7.2 both widths; §2a the cross-platform row)
**Type:** open-source
**Phase/Area:** the walk — viewport coverage

**Issue:** The chart's "room to scroll past the last event" was bottom padding on the scrolling box. At 390×844 and 1440×900 (the two sizes every check used) the box was tall enough, so nothing showed. In the 165px a phone on its side leaves, padding (which a box can never shrink below) made the box 182px and pushed the zoom control off the bottom of the screen. The first fix round had made the pop-up fit the same screen and the re-walk only caught the zoom control because it measured every control against the screen edge, not just the one being fixed.

**Suggested improvement:** In §7.2 / §2a: "Phone AND desktop is two sizes of one shape. Walk a SHORT screen too (a phone on its side, a laptop window of 700px height) for any surface built as a viewport-tall column; measure every control against the screen edges, not only the control being changed." And a CSS note for column layouts: scroll room belongs inside the scroll box (a spacer), never as padding on it.

**Principle:** Width is not the only axis; a full-height column must be walked at a short height, and every edge-docked control measured, not just the one in the finding.

### Observation 217: Two fixes from one walk can point at each other — a door one removes, the other's words still name

**Status:** OPEN
**Date:** 2026-09-23
**Session context:** [HUMAN-RETEST] the Tracker — the full gates after three fix rounds; the vendored browser suite had not been run since round one.
**Skill:** raptor-port/docs/bug-check-order.md (§5 FULL order — gates between the walk's fixes and the reads)
**Type:** open-source
**Phase/Area:** fixing — interaction between fixes

**Issue:** Round one fixed F4 (the details bubble must say how to reach the details editor: "tap the ball, then ✎ Edit details") and F9 (on a chart with nobody on it, a tap opens NO pop-up). Each was right alone and each had its own red-first test. Together, on a studentless chart, the hint named a door F9 had just removed. Nothing caught it for two rounds because the surface's own browser suite was not run between rounds; its first run stopped on exactly this (a step tapping a ball for details on such a chart).

**Suggested improvement:** In §5: "Run the surface's own suite after EACH fix round, not once at the end. And when a fix removes or gates a door, search for every sentence on screen that names that door (the roll-call's 'what else points here' column)."

**Principle:** A fix that closes a door must find every hint that still points through it; run the whole surface's suite after each round so two correct fixes cannot quietly contradict.

### Observation 218: A gesture check must measure what the person sees, not that a value changed

**Status:** OPEN
**Date:** 2026-09-23
**Session context:** The owner's live report the evening the Tracker [HUMAN-RETEST] merged: "the zoom does not follow where my fingers open or close". The FULL-tier walk had pinched in Edit chart layout and passed it. (Numbered past main's highest, #217; a parallel branch may hold the same number — renumber on merge, rule 4.)
**Skill:** raptor-port/docs/bug-check-order.md (§7 the walk; §4 the door check for a gesture)
**Type:** open-source
**Phase/Area:** the walk — what a gesture step asserts

**Issue:** The walk's pinch step recorded "the pinch zooms (100% → 147%)" and passed. The zoom was aimed 800px away from the fingers on a phone — the bug was in WHERE it zoomed, which the step never measured. Nobody had driven two fingers at all in the normal chart view, because two-finger input looked hard to script; it is one CDP call (Input.dispatchTouchEvent with two touchPoints) and gives real pointer events.

**Suggested improvement:** In §7: "A gesture step asserts the EFFECT a person sees, in screen terms, not that a value moved: for a zoom, the thing under the fingers stays under them (measure its on-screen position before and after, against where the fingers end); for a drag, the thing follows the finger. Drive multi-finger gestures for real (CDP touch points), in BOTH modes a surface has." Add the pinch driver (scripts/handpass/trk-pinch.mjs) as the worked example.

**Principle:** "Did the value change?" passes a gesture that goes to the wrong place; assert the relationship the user relies on (under the finger stays under the finger), measured on screen.

### Observation 219: A red-first test must be red for the RIGHT reason — read the failure, prove the premise

**Status:** OPEN
**Date:** 2026-09-24
**Session context:** [TRK-PINCH-DRAGS-BALL] — red-first browser checks for "a pinch starting on a drawn line with Delete leaves the line".
**Skill:** raptor-port/docs/bug-check-order.md (§8.4 red first, and the break test)
**Type:** open-source
**Phase/Area:** building the regression test before the fix

**Issue:** The new check went red on the unfixed code — twice — and both times for the wrong reason. First, an earlier case had left the Line tool mid-line, so the test's own "draw a line" step failed ("no line could be drawn"). Second, the check's own setup click deleted the line: a freshly drawn line stays SELECTED, and pressing the Delete tool button with a line selected deletes it on the spot — so "the line was deleted" was the test's doing, not the pinch's. A third check ("a line exists") passed vacuously because the chart ships 82 drawn lines. On the fixed code the same setup step then made the check fail, which is how it surfaced. Separately, a mode-switch measurement read chart coordinates through the SVG's getScreenCTM on a CSS-zoomed ancestor and reported 135 px of drift that was the measurement, not the app (ball rectangles said 1 px).

**Suggested improvement:** In §8.4 add: "Red first is not enough — read the red. The failure's detail must name the defect's own effect (the ball moved, the undo step appeared), not a setup step. Each case asserts its PREMISE (the object it acts on exists, is the one it created, the tool is the one it chose, nothing else is selected) before the action, and identifies what it made by id, never by a count the fixture already satisfies. Measure positions with element rectangles, not a transform matrix, where CSS zoom is in play."

**Principle:** A test that fails on the bug for the wrong reason proves nothing and will lie again on the fixed code; check that each red names the defect's own effect and that every precondition is asserted, not assumed.

### Observation 220: A fix across a mode switch must wait for the layout the switch causes

**Status:** OPEN
**Date:** 2026-09-24
**Session context:** [TRK-PINCH-DRAGS-BALL] — keeping the chart steady going in and out of Edit chart layout.
**Skill:** raptor-port/docs/bug-check-order.md (§7 the walk — the order list); raptor-port/docs/ui-contracts.md
**Type:** open-source
**Phase/Area:** implementation / measurement

**Issue:** The placement was computed synchronously inside the toggle, but the UI framework only draws the new chrome (a tool strip 240 px tall appears above the board, a zoom bar leaves below) on its next render — so the board moved AFTER the placement, and the chart jumped 239 px the other way. Coming out, a margin cut for the old, smaller board left no room to centre the point. Both were visible only by timing samples (click → microtask → animation frame): the board's size changed between the microtask and the first frame.

**Suggested improvement:** When a change keeps something steady across a mode switch, place it again in the first animation frame after the switch (after the framework has laid out the new chrome, before paint), recompute any size-derived padding first, and assert "the point in the middle stays in the middle" rather than "nothing moved on screen" — the viewport itself moves.

**Principle:** Anything anchored across a UI state change must be anchored against the layout AFTER the change settles, and the check must measure relative to the moved viewport, not absolute screen positions.

### Observation 221: A walk in one browser engine cannot see another engine's event delivery — simulate it on purpose

**Status:** OPEN
**Date:** 2026-09-24
**Session context:** [TRK-PINCH-DRAGS-BALL] — Fable's final read (F1): Safari can deliver a touch's later events to the element it landed on even after a redraw removed it; the walk used Chromium, which retargets them.
**Skill:** raptor-port/docs/bug-check-order.md (§7 the walk; §8 making checks find)
**Type:** open-source
**Phase/Area:** the walk — device/engine coverage

**Issue:** Every gesture check passed in Chromium while the change redrew the element under a held finger — exactly the case where engines differ. The fix could not be walked on the owner's real device. What made it testable here was dispatching synthetic pointer events the way the other engine would (a lift sent to the now-detached element; two touches whose lifts never arrive) — and that simulated check then found an unrelated real defect in Chromium too: after the heal, the next touch still missed its ball because a stale 36 px scroll made the chart hop on the first redraw.

**Suggested improvement:** In §7 add: "When a change redraws or removes the element under a held finger (or relies on which element receives the lift), list how each engine the owner uses delivers those events, and add a synthetic check per difference — dispatch the other engine's event sequence directly on the element it would reach. Name in the sheet any line that only a real device can prove, and make the owner's look card test it."

**Principle:** A walk proves behaviour in the engine it ran; where engines are known to differ, reproduce the other engine's event sequence synthetically and name what only the real device can confirm.

### Observation 222: An intermittent gate stop gets evidence and a filed item before its one re-run

**Status:** OPEN
**Date:** 2026-09-24
**Session context:** [TRK-PINCH-DRAGS-BALL] — PR #431's check run on the owner's PC stopped in the Tracker smoke suite on a step an earlier session had fixed and recorded as "no longer re-run-and-hope"; the same step had stopped once in a local run of the same code.
**Skill:** raptor-port/docs/bug-check-order.md (§9 gates); the project's CI habits (HANDOFF "no re-run-and-hope")
**Type:** open-source
**Phase/Area:** gates — an intermittent failure blocking a merge

**Issue:** Two stops in three full runs looked like a regression. What settled it without guessing: (1) reading which code the failing step runs and confirming the change does not act there; (2) an isolated probe of exactly that step, repeated 24 times on the change's build AND on the base's build (0 and 0); (3) the full suite passing on the same code; (4) the step's own comment naming a known residual race. Only then one re-run — with the residual filed as its own backlog item and the evidence written into the sheet — which passed. Re-running first would have been "hope"; refusing to merge forever would have blocked on a race the change did not touch.

**Suggested improvement:** In §9 add: "A gate that stops intermittently is not re-run until (a) the failing step's code path is checked against the diff, (b) the step is reproduced in isolation on the change's build and on the base's, and (c) the residual is filed with that evidence. Then one re-run, citing the item. Two stops on the change's build and none on the base's in the isolated probe is a regression — stop."

**Principle:** Re-running a flaky gate is legitimate only after evidence shows the change is not the cause and the flake is filed; the re-run is a decision on the record, never a hope.

### Observation 225: A second sign-in in a walk or e2e test brings back a demo world without its OIL story

**Status:** OPEN
**Date:** 2026-09-24
**Session context:** Fixing the OIL tracker's cut credit-box labels (branch claude/oil-credit-tags); writing the red e2e test and the walk script. Numbered past 223-224 in case the parallel demo chat appends to its own copy of this log.
**Skill:** run
**Type:** internal
**Phase/Area:** Driving the app — setting up a fixture before walking it

**Issue:** The test first re-signed-in as admin (`openLeaveWar(page, 'a')` after the beforeEach's member login). That sign-in reloads the page, and a fresh demo world that nobody has written to yet comes back WITHOUT its Leave War OIL story (openings, awards, grants) while the days taken (Inputs) survive — so rows read "taken · not covered", a new grant is consumed by the old takes and folds into the archive, and the test looked for a box that was not there. It cost three runs to see. A world written to once (any Leave War write) persists whole. Harmless to real data (D56), but it bites every test or walk that reloads before its first write — and a demo recording that reloads.

**Suggested improvement:** In the run skill's browser-driven pattern (and the e2e helpers' header): "Change role without reloading (`lwRole` + `raptorRole`), or make one write before any reload; never re-sign-in mid-fixture on a fresh demo world."

**Principle:** A seeded demo world may be only partly persisted until its first write; a fixture that reloads before writing is testing a different world. Change state in place, or write before you reload.

### Observation 226: To assert that text stayed on one line, count line positions, not client rects

**Status:** OPEN
**Date:** 2026-09-24
**Session context:** The same OIL tracker fix — pinning that an award's "· 3 days" moves to the next line whole.
**Skill:** New skill candidate: browser layout assertions (or verification-before-completion)
**Type:** open-source
**Phase/Area:** Writing layout assertions in a real browser

**Issue:** The check `el.getClientRects().length > 1` reported "· 3 days" as split over two lines when it was on one: the span holds three text pieces (" · ", "3", " days" — JSX interpolation makes separate text nodes), and each piece gets its own rect on the SAME line. Only measuring the rects' tops showed it.

**Suggested improvement:** Wherever a skill tells the agent to assert wrapping in a browser: count distinct rounded `top` values of `getClientRects()`, never the number of rects; and print the rects once before trusting a new layout check.

**Principle:** A browser returns one rect per inline fragment, not per line; any "is it on one line" assertion must count line positions. Before trusting a new measurement, look at its raw numbers once.

### Observation 227: An owner ruling that lands mid-review makes a frozen review brief stale — point reviewers at the live file

**Status:** OPEN
**Date:** 2026-09-24
**Session context:** [DOC-TRIM] notes-only pass. The plan (sort DECISIONS.md into area sections) was frozen into a brief and sent to Fable and Astra in parallel; while they read, the owner ruled D137 (split the rulings into auto-loaded per-area files), which changed the plan's form.
**Skill:** claudex-loop
**Type:** open-source
**Phase/Area:** plan review — building the reviewer brief; folding findings

**Issue:** Both reviewers were briefed on a snapshot of the plan. They caught the new ruling only because the brief told them to read the live rulings file, where the builder had recorded D137 before continuing — both then flagged "the design is superseded by D137" as their first finding, and their classification findings still carried over. Had the brief been self-contained, one or both rounds would have reviewed a dead design.

**Suggested improvement:** In the brief-building step, require the brief to point reviewers at the LIVE source-of-truth files (the ruling/decision record, the plan file on disk) rather than paste them, and add a fold-in step: when the owner rules mid-review, record it in the live file at once, let in-flight reviews finish, and re-scope only the findings the ruling invalidates instead of restarting the round.

**Principle:** A review brief should reference the live record, not snapshot it; a decision that lands while reviewers read then reaches them for free, and only the invalidated findings need redoing.

### Observation 228: A repo skill drifted from what sessions actually do — the handoff went to a file the skill never names

**Status:** ACTIONED (2026-09-24) — a duplicate of #194, applied by the same change (the skill rewritten to the one handoff; awaits his approval, D70).
**Date:** 2026-09-24
**Session context:** Spring clean ([DOC-TRIM]) mapping every file a fresh chat reads
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** Step 1 (where the handoff is written) and Step 3 (the HANDOFF.md shape)

**Issue:** The skill writes `raptor-port/docs/session-state.md` and keeps open items in `HANDOFF.md` §Open, but for days sessions had been writing a root `HANDOFF-NEXT.md` instead, and the backlog rules ([DOCS-GUARD] F7) had already declared `HANDOFF.md` §Open "not a backlog". A fresh chat met three handoff files; the one the skill maintains was a four-line stub kept alive only so a promise in CLAUDE.md held. Nothing flagged the drift because nothing compares a skill’s named files with what sessions actually write.

**Suggested improvement:** When the spring clean makes `HANDOFF.md` the one handoff (D140), rewrite Steps 1/3/4 to write that file’s `## Now` block (one per chat), send open residue to `OUTSTANDING.md`, and retire `session-state.md`. Add a line to Rule 7: if the session wrote its handoff somewhere the skill does not name, fix the skill in the same commit.

**Principle:** A skill that names specific files must be checked against where sessions actually write; when practice and skill disagree, one of them is wrong and the other silently accumulates.

### Observation 229: Helpers started with a model override do not inherit the chat’s thinking level

**Status:** OPEN
**Date:** 2026-09-24
**Session context:** Spring clean; the owner asked what thinking level Fable helpers run at when the chat is on Opus 5.5 max
**Skill:** claudex-loop
**Type:** open-source
**Phase/Area:** reviewer launch — model and effort

**Issue:** The Agent tool takes a model but no effort; per the Claude Code docs a subagent uses its own definition’s `effort:` frontmatter, else the model’s default — it does NOT inherit the parent’s effort (extended thinking itself is inherited). The Claudex runner passes `--effort` only when asked, else the CLI’s own default; his settings set none. So "Fable at high" was an assumption in both routes.

**Suggested improvement:** In the reviewer-launch step, pass `--effort high` explicitly on every Claudex call that should run at high, and offer a project agent definition (`model: fable`, `effort: high`) when the owner wants in-chat Fable helpers pinned — it applies from the next session.

**Principle:** A reviewer’s thinking level is a launch parameter, not an inheritance; state it explicitly at every launch route or you are reviewing at an unknown depth.

### Observation 230: Moving text between documents needs an exact mover and a "left but never arrived" report

**Status:** OPEN
**Date:** 2026-09-24
**Session context:** Spring clean — moving whole sections of CLAUDE.md, HANDOFF.md and OUTSTANDING.md under the owner’s "a summary never changes the meaning" (D138)
**Skill:** New skill candidate: doc-mover (lives in backlog-archive.mjs --move + docsize.mjs --moves)
**Type:** open-source
**Phase/Area:** the move itself and its verification

**Issue:** A hand move (or a one-off script) had already destroyed two backlog items on 22 Sep 26. The existing mover only handled whole backlog items and ruling rows; a section, a paragraph or a bullet run had no exact route, and nothing checked that every line which LEFT a document ARRIVED somewhere.

**Suggested improvement:** Built: `backlog-archive.mjs --move` (exact-once start anchor, `--to-line` or `--section`, one line ending, lands exactly once, inventory clean, else every file put back) and `docsize.mjs --moves` (multiset of removed vs added non-blank lines across all Markdown touched — the residue is exactly what a meaning reviewer must read). Teach both in the always-loaded doc-structure rule.

**Principle:** A move is verifiable only as "everything that left arrived"; give the mover exact anchors and rollback, and give the reviewer the residue — the lines that did not arrive — rather than the whole diff.

### Observation 231: Build the enforcement before the migration, and let it check the migration

**Status:** OPEN
**Date:** 2026-09-24
**Session context:** Spring clean ([DOC-TRIM]) — restructuring the repo's documents so sessions load by relevance
**Skill:** New skill candidate: doc-restructure (with task-observer's own log-safety rules as prior art)
**Type:** open-source
**Phase/Area:** ordering of a large documentation migration

**Issue:** The misfiling checks and the exact mover were built and self-tested BEFORE any large move. During the moves they caught three of the migration's own slips at once — a new archive folder outside the one docs tree, two new reference docs no map named, and new always-loaded rule files nobody had registered — each refused with its fix named. Had the checks come after the moves, all three would have been baked into the result and found (if ever) by a reviewer.

**Suggested improvement:** For any structural migration of shared documents: (1) write the rules of the target structure as executable checks first, (2) replay the known failure modes in a self-test (including a control case against the OLD checker, to prove each test can fail), (3) only then migrate, letting the checks gate every step, and (4) hand reviewers the residue report (what left and did not arrive), not the whole diff.

**Principle:** Enforcement written after a migration can only audit it; enforcement written before it shapes it. Build the check, prove it can fail, then let it gate the work.

### Observation 232: A handoff's "its only leftover is X" was incomplete — re-read the whole item before closing it

**Status:** OPEN
**Date:** 2026-09-24
**Session context:** Closing the spring clean's backlog item ([DOC-TRIM]) from the previous chat's handoff block
**Skill:** session-handoff
**Type:** open-source
**Phase/Area:** the block's "Unfinished" line — how the leftovers of an item about to close are listed

**Issue:** The handoff said the item's only leftover was one config-file pin. Re-reading the whole item before closing it found a second deliverable it had named since its first version (sub-headings for the long reference docs) — never done, filed nowhere else. The handoff had summarised the latest plan's leftovers, not the whole item's; trusting it would have archived an open job with the item.

**Suggested improvement:** Where the skill writes "Unfinished" for a backlog item that is about to close, list the leftovers by walking EVERY deliverable the item ever named, oldest block included, each marked done / filed as <id> / dropped by a ruling. The closing session repeats that walk instead of trusting the line.

**Principle:** A summary of what is left is a claim, not a check. Before closing a record, re-derive what is left from the whole record, its oldest parts included.

### Observation 233: On Windows Git Bash, `git show <branch>:<path>` is silently mangled — the parallel-branch numbering check reads "none"

**Status:** OPEN
**Date:** 2026-09-24
**Session context:** Numbering discipline rule 4 (number past entries on other open branches) before appending to this log
**Skill:** task-observer
**Type:** open-source
**Phase/Area:** How to Log → Numbering discipline, rule 4 (parallel branches)

**Issue:** The natural check — `git show origin/<branch>:.claude/skill-observations/log.md | grep …` in a loop, errors sent to /dev/null — reported no entries for EVERY branch, the current one included: Git Bash (MSYS) rewrites the `rev:path` argument into a Windows path and git fails. With the error hidden, the failure reads as "no other branch has entries", the unsafe answer. `MSYS_NO_PATHCONV=1` fixed it and the real maxima appeared.

**Suggested improvement:** In rule 4, give the cross-branch check with a built-in sanity test: run it on the CURRENT branch first and require it to return the local maximum before trusting "none" for any other branch; note `MSYS_NO_PATHCONV=1` for Git Bash on Windows.

**Principle:** A check whose failure looks like "nothing found" must first prove it can find something — run it on a known-positive case before trusting its negatives.

### Observation 234: A red team's "not in this pass" had no home — cross-provider briefs should hand over the path-scoped rules

**Status:** OPEN
**Date:** 2026-09-24
**Session context:** Closing the spring clean ([DOC-TRIM]); checking each red-team disposition had a live home before the item left the backlog
**Skill:** claudex-loop
**Type:** open-source
**Phase/Area:** building the reviewer brief for the other provider (also codex-review)

**Issue:** The spring clean's red team (Astra/Codex) asked that a brief for Codex name the rules files of every area the change touches, because Codex loads none of the host's path-scoped rules by itself. The disposition put that rule in the always-loaded structure doc (D140, `.claude/rules/doc-structure.md`) and left the review skills' brief templates "NOT changed in this pass" — a deferral filed nowhere, so it would have left with the closed item.

**Suggested improvement:** In the brief-building step, add: list the host's path-scoped rules files whose paths match the changed files and hand them to the reviewer by path. A change to these skills is read by Fable and Astra before the owner approves it (D70).

**Principle:** Context that loads automatically for one provider must be handed explicitly to the other; a cross-provider brief names it by path.
