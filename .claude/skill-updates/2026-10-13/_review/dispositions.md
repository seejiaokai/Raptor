# Skill review, 13 Oct 26 — every OPEN observation's disposition

The log: `.claude/skill-observations/log.md` — 272 `### Observation` headers (120 to 541), 272 `**Status:**` lines,
all OPEN (the reconciliation guard holds; nothing was resolved since the review of 24 Sep 26). How this repo runs a
review: `.claude/skills/TASK-OBSERVER-VENDORED.md` §Reviews in this repo. Who reads these drafts: one fresh, blind
Opus reader (D810). Drafts sit beside this folder at the live files' relative paths; the whole change set, live to
draft, is `diff.patch`. **Nothing live is changed until he approves** — bar the recording of D810 itself.

**Where lessons land** (settled by the reviews of 23 and 24 Sep 26, followed here): in the skills; in the project's own
method documents where the note is about the bug check (`raptor-port/docs/bug-check-order.md`,
`raptor-port/docs/gates-and-deploy.md`); never as new lines of lessons in `raptor-port/CLAUDE.md` or `.claude/rules/`
(three clauses of ONE paragraph of `shipping.md` are CORRECTED in place — the lock's "always releases", its "stale at two hours", and the "one test file needs no lock" exemption the gate notes had already withdrawn).
**New here:** two reference files that gather notes the logs marked "new skill candidate" again and again —
`raptor-port/docs/walk-scripts.md` (walk scripts, walkers' briefs, break tests: 59 notes) and
`.claude/skills/brainstorming/mockups-on-the-real-app.md` (mock-ups: 16 notes). Both are his to approve as NEW guides.
Lessons about how to talk to HIM go to this machine's memory notes (`_memory/additions.md`), as before.
Lessons that are really a tool to build are filed as two backlog items (`_docs/OUTSTANDING-items.md`).

**Also carried, not observations:** the two guide lines already filed and waiting for a read —
`[WALK-FINGER-NOT-LOCATOR]` (§7.2 and §6) and `[METHOD-LIT-COLOUR]` (§7.1 and anti-pattern 21) — are made in the draft
of `bug-check-order.md`, as each item worded them. Neither item had the Astra and Sol read its own text asks for; they go in on this one Opus read only if he says so — a separate yes or no in the approval — and both are then written on `[NO-ASTRA-LIST]` (D761).

**Codes** (read by the install script): `APPLY` a draft carries it · `REFLECTED` already written where it belongs ·
`FILED` a backlog item carries it · `MEMORY` a memory note carries it · `ASK` recommended closed with no change — his
word · `OPEN` stays open. APPLY, REFLECTED, FILED and MEMORY become `ACTIONED (2026-10-13) — …`; ASK becomes
`DECLINED (2026-10-13) — …` only if he agrees; OPEN is not touched.

**Short names:** BCO `raptor-port/docs/bug-check-order.md` · WS `raptor-port/docs/walk-scripts.md` (new) · GD
`raptor-port/docs/gates-and-deploy.md` · MOCK `brainstorming/mockups-on-the-real-app.md` (new) · SH `session-handoff`
· TDD `test-driven-development/SKILL.md` · WGT `test-driven-development/writing-good-tests.md` · VBC
`verification-before-completion/SKILL.md` · BC `verification-before-completion/browser-checks.md` · SD
`systematic-debugging` · WP `writing-plans` · RCR `receiving-code-review` · DPA `dispatching-parallel-agents` · EP
`executing-plans` · FS `find-skills` · TO `task-observer` · DEC `DECISIONS.md` (the recording steps) · HO `HANDOFF.md`
(its head) · GUARD backlog item `[SHELL-SCRIPT-GUARD]` · TOOLS backlog item `[CHECK-TOOLS-HARDEN]`.

| # | Code | Where it lands / why |
|---|---|---|
| 120 | OPEN | stays open on D73's condition: the "whole app as a new tab" guide is written only if a third app is brought in |
| 122 | OPEN | as 120 (D73) |
| 236 | MEMORY | new note `record-answers-quietly-during-a-round` |
| 237 | APPLY | WS §3 (a fixture that will be saved is built on real storage); the helper's own refusal: TOOLS |
| 238 | APPLY | WS §4 (press the control the app routes) |
| 239 | APPLY | WS §6 (commit the first walk's pictures; the re-walk's own folder); enforcing it in the helper: TOOLS |
| 240 | APPLY | BCO §4, what to do with what they hand back, item 2 (fix only the cited defect; a behaviour a record chose is a question) |
| 241 | APPLY | MOCK, the method |
| 242 | APPLY | MOCK, judging (a mark a few pixels wide) and traps (a script finding its own injected rule) |
| 243 | APPLY | MOCK, judging (one busy state by default) |
| 244 | APPLY | BCO §6 (a navigating action gets one row per opener) |
| 245 | APPLY | BC, CSS Placement (a class on a wide ancestor) |
| 246 | FILED | GUARD; the rule itself is already in memory (`bash-heredoc-apostrophes-fail`, `node-e-in-git-bash-mangles-escapes`, `python-edits-crlf-trap`) |
| 247 | APPLY | WS §6 (a folder taken from the environment only when none is set) and §4 (NOT WALKED, never FAIL); TOOLS |
| 248 | APPLY | WS §4 (aim at the control's own box; a helper says why it failed); its shell half: GUARD |
| 249 | APPLY | MOCK, traps (scroll first, inject last, re-apply before the picture) |
| 250 | APPLY | BCO §6 (a changed quantity: where it is shown and where it is branched on) |
| 251 | APPLY | SD Phase 1 step 2 (an order, not a speed: force the order) |
| 252 | APPLY | BCO §6 (a changed quantity: every early exit and "nothing to do" message) |
| 253 | APPLY | BCO §4, hand-back item 1 (reproduce the finding's stated reason as well as its symptom) |
| 254 | APPLY | VBC Common Failures ("a background run passed") |
| 255 | REFLECTED | the document check now guards the handoff file's shape (`[HANDOFF-SHAPE-GUARD]`, built; `.claude/rules/doc-structure.md` §The check that keeps it) |
| 256 | APPLY | TO, Acting on Observations (a trap that recurs after it was logged); the run itself: VBC "a background run passed" |
| 257 | APPLY | WS §9 (a break that stays green has four readings); BCO §8 item 4 points there |
| 258 | APPLY | SH, "what makes the block something the next chat can act on" (a "to build" list is the agent's reading) |
| 259 | FILED | GUARD; already in memory (as 246) |
| 260 | APPLY | WGT, Reach the state the way production does (a test that reaches past the door copies the real caller) |
| 261 | MEMORY | new note `answer-mid-run-questions-first` |
| 262 | APPLY | WS §9 (commit first; restore from a copy, never `git checkout` on uncommitted work) |
| 270 | FILED | GUARD carries it as a build condition (a blocking hook is wired if / then / else and proved live, one refused and one allowed) |
| 271 | APPLY | MOCK, the method, step 6 (the picked picture or its script is committed, and the decision's record names it) |
| 272 | ASK | recommend closed: a refused write to a rulings file has not been met again, and such writes work under his present settings |
| 273 | APPLY | WS §9 (a mapping is broken with another CURRENT value) |
| 274 | APPLY | WGT (set-up runs the same start-up path the app runs); BCO §8 item 8 |
| 275 | APPLY | TDD Verify RED (an assertion that something is ABSENT); WS §3 (a fixture step asserts that it landed) |
| 276 | APPLY | GD, six more (1) |
| 277 | APPLY | BCO §9 (every "proved by" cell's test is checked to exist) |
| 278 | APPLY | WS §4 (a new card's geometry is measured) |
| 279 | REFLECTED | SH Rule 9 (no choice slot inside the opening line; one complete line per option) |
| 280 | APPLY | WS §5 (a step leaves on screen what it asserted) |
| 281 | APPLY | WS §9 (break where nobody is reading); BCO §4 (the reader's half) |
| 282 | APPLY | WS §9 (reading 2: the break never met a test able to see it) |
| 283 | APPLY | MOCK, showing it (a republish is a sync of the whole set) |
| 284 | APPLY | WP Self-Review 12 (before the design, compare the files each other open branch changes); the change-time half is already `.claude/rules/shipping.md` §The checks, D302 |
| 285 | FILED | GUARD carries it as a build condition (measure the harness's behaviour first; tests take the environment as an input); the guard it was written about is fixed (`[BG-GUARD-FALSE]`) |
| 290 | APPLY | BCO §4, before a brief leaves (a test plan's red team and its scenario design are one round) |
| 291 | APPLY | WS §3 (what an action created is named by the difference) |
| 292 | APPLY | BCO §4, hand-back item 2 (a reproduced behaviour a test pins as intended is a question for him) |
| 293 | APPLY | BCO §9 (every section laid down as an empty heading when the sheet is created) |
| 294 | APPLY | TDD Verify RED (a finding from a device-specific walk) |
| 295 | APPLY | WS §4 (every sentence a script prints is built from what it read) and §6 (the note becomes a check) |
| 296 | APPLY | MOCK, traps (assert the premise at capture) |
| 297 | APPLY | BCO §11 (a change to the look or layout is shown to him before it is built); MOCK, showing it |
| 298 | APPLY | WS §5 (a script writes only under its own checkout); a gate check for it: TOOLS |
| 299 | APPLY | WS §4 (a step whose right result is that nothing changes) |
| 300 | APPLY | WGT (what a single-slot surface is left showing); WS §4 |
| 301 | APPLY | TDD Verify RED (an assertion that something is ABSENT; read the tests that passed) |
| 302 | APPLY | TDD GREEN (a guard that suppresses input) and Verify GREEN (run the older tests of the surface early) |
| 303 | APPLY | EP Step 3 (a branch that merged in another open branch); its second half is already in SD `condition-based-waiting.md` ("load-sensitive can mean it fails on FAST machines") |
| 304 | APPLY | BCO §8 item 8 (a new writer is tested on what it saved) |
| 305 | REFLECTED | memory `python-edits-crlf-trap`, its fourth trap (count raw bytes; compare the commit's size with and without ending differences) |
| 306 | APPLY | WP Self-Review 11 (an inventory with a verdict per site; existing fields keep their meaning) |
| 310 | APPLY | SH, "what makes the block…" (name any size marker carried over) |
| 311 | MEMORY | appended to `python-edits-crlf-trap` (list what a span holds before replacing it); its shell half: GUARD |
| 312 | APPLY | GD, six more (6) |
| 313 | APPLY | WS §3 (a helper answers every confirmation the real control can raise); the Leave War helper itself: TOOLS |
| 314 | APPLY | DEC step 1 (in the home cell backticks are for files only); the gate's own handling: TOOLS |
| 315 | APPLY | WS §4 (a negative assertion first asserts that its subject exists) |
| 316 | APPLY | WS §9 (reading 3: the wire is invisible to that test world) |
| 317 | REFLECTED | BCO §10, anti-pattern 21 (the picture taken, not looked at) |
| 318 | MEMORY | new note `answer-mid-run-questions-first` |
| 319 | APPLY | BCO §4 (the reader's half: nothing rewrites the source a reader reads) |
| 320 | APPLY | WS §9 (a separate worktree at a short path; prove the list runs) |
| 321 | APPLY | WS §5 (one run, one folder) |
| 322 | APPLY | BCO §5 (a fix is new code: its own narrow read, up to the cap) |
| 323 | APPLY | SH Step 1 (a scripted cut matches each marker on its own line; an inserted text may repeat an anchor) |
| 324 | APPLY | SD Phase 1 step 3 (a failure by a consistent amount is a layout shift) |
| 325 | APPLY | TDD Verify RED (a test selected by name is confirmed to have run); WS §9 |
| 326 | APPLY | WS §4 (a gesture meant only to look counts the writes) |
| 327 | APPLY | SH Step 3 (merged between chats — sweep for it) |
| 328 | APPLY | VBC Common Failures ("a count from a new audit script"); its shell half: GUARD |
| 329 | ASK | recommend closed: the method of one finished job, kept in its plan and its commits; `backlog-archive.mjs --move` covers the moving half |
| 330 | MEMORY | new note `owner-questions-need-a-worked-example` |
| 331 | APPLY | WP Self-Review 10 ("A or B" in the source is an unanswered question) |
| 332 | APPLY | WS §8 (for one measured number, swap the touched files from main) |
| 333 | APPLY | TDD Verify RED (an assertion that something is ABSENT) |
| 334 | APPLY | WS §5 (a fixed-coordinate picture scrolls to the top first) |
| 335 | APPLY | VBC Common Failures ("my edits landed") |
| 336 | APPLY | DPA, Agent Prompt Structure (decide where the report lives) |
| 337 | APPLY | DPA (bound it); WS §2 (scope and stopping) |
| 338 | APPLY | WS §6 (the re-walk's command written out in full); enforcing it in the helper: TOOLS |
| 339 | ASK | recommend closed: the method it records is built into the rulings' own tooling (D390) and its plan |
| 340 | APPLY | DEC step 1 (the first sentence keeps its "don't", its exception and its scope) |
| 341 | APPLY | WS §9 (as 262) |
| 342 | APPLY | GD, six more (4); `shipping.md` (ask its holder first); a heartbeat in the lock tool: TOOLS |
| 343 | APPLY | WS §4 (leaving a control) |
| 344 | APPLY | RCR, before applying a reviewer's fix (a cited path that does not exist) |
| 345 | APPLY | TDD Verify RED (an assertion that something is ABSENT — the precondition asserted first); the general rule was already there ("each case asserts its PREMISES") |
| 346 | REFLECTED | VBC, Long check runs (a gate piped into a filter and chained into a commit) |
| 347 | APPLY | WGT (one test through the real door asserts what really arrives) |
| 348 | APPLY | SH Step 1 (a marker matched on its own line, never as a substring) |
| 350 | MEMORY | appended to `guides-fewer-words-more-pictures` (let PowerPoint itself make the PDF and the pictures) |
| 351 | MEMORY | appended to `guides-fewer-words-more-pictures` (marks checked against their picture; pictures shrunk once) |
| 352 | APPLY | SH Step 1 (say in so many words whether he ticks "worktree"; a chat continuing a branch releases it first) - his answer of 13 Oct 26, D811 |
| 353 | APPLY | WP Self-Review 11 (each writer's production caller) |
| 354 | APPLY | WS §7 (reading a FAIL: the script's world first) |
| 355 | APPLY | SH Step 1 (for a design job the opening line says what he will get) |
| 356 | APPLY | WP Self-Review 4 (a claim about a third-party platform is verified and cited first) |
| 360 | APPLY | SH, "what makes the block…" (number ranges given in the block; a pushed block beats a message) |
| 370 | APPLY | HO (list the live chats before starting a named item) |
| 380 | APPLY | WP Self-Review 11 (who reads whether the record EXISTS; each job of every delete loop) |
| 381 | APPLY | TDD GREEN (a fix guarded on an existing flag); SD Phase 1 step 3 (the identical probe on the base revision) |
| 382 | APPLY | TDD Verify RED (red is an observation: a new write path's red is "nothing reached storage") |
| 383 | APPLY | TDD Verify RED (red is an observation: one break per rule, by a script that restores) |
| 384 | APPLY | EP Step 2 ("each of these N sites" is a pointer, not the scope) |
| 385 | MEMORY | new note `lists-he-forwards-are-copyable-files` |
| 386 | APPLY | WS §8 (a storage conversion is walked on data the old build wrote); BCO §2a, the storage row |
| 387 | APPLY | WS §8 (a mechanical check on every step) |
| 388 | ASK | recommend closed with no change: the order of the steps stays as written; starting something early is his word on the day |
| 389 | APPLY | BCO §6 (a storage change adds a column per writer: its first write) |
| 390 | APPLY | BCO §5 (should X be written at all) |
| 391 | APPLY | GD, six more (3); `shipping.md` (a run you stop does not release); the tool itself: TOOLS |
| 392 | APPLY | WP Self-Review 12 (a phase a reviewed plan only sketched) |
| 393 | APPLY | RCR, before applying a reviewer's fix (the orders the old code was protecting) |
| 394 | APPLY | WS §8 (record the running app twice and compare) |
| 395 | APPLY | SH Step 4 (the block carries the opening line); HO (compare the first message with it) |
| 396 | APPLY | WP Self-Review 11 (a derived view on a saved base) |
| 397 | APPLY | VBC Common Failures ("a typecheck or lint is clean"); BCO §4 now names the command; GD already had it |
| 398 | APPLY | TDD Verify RED (an assertion that something is ABSENT: a fixture step that silently refused) |
| 399 | REFLECTED | GD, the four traps met running the checks by hand (`codex exec` ends with `< /dev/null`) |
| 400 | APPLY | RCR, "Can't Happen" Needs Proof (every branch of each definition, and a test anyway) |
| 401 | APPLY | TDD Verify RED (set the fix aside with a copy, not the shared stash) |
| 402 | MEMORY | appended to `python-edits-crlf-trap` (a script that is safe to run twice; repair a script file with the editor); GUARD |
| 403 | FILED | GUARD (it also refuses an in-place stream edit of a tracked file); the rule is in memory `python-edits-crlf-trap`, its fifth trap |
| 404 | APPLY | VBC Common Failures ("a mechanical rewrite across many files is right") |
| 405 | APPLY | DPA (stage by explicit path) |
| 406 | APPLY | SH Step 3 (search the full rows for the item named as a home); DEC step 1 ("filed as [ID]", never a home) |
| 407 | APPLY | DEC step 2 (the cell right after the date); a refusal in the script: TOOLS |
| 408 | APPLY | DEC step 2 (a ruling that ANSWERS an open point is marked too); the gate's message: TOOLS |
| 409 | APPLY | BCO §6 (a mechanism built "like X" is plugged in wherever X is); WP Self-Review 12 |
| 410 | APPLY | BCO §8 item 1 (attach the invariant to the function) |
| 411 | FILED | GUARD; WS §2 (the brief carries the machine's traps — a helper loads none of the host's memory) |
| 412 | APPLY | RCR, before applying a reviewer's fix (a count gets its zero case and its already-settled case) |
| 413 | APPLY | BCO §6 (a rule is asked of every surface that draws the thing) |
| 414 | APPLY | WS §4 (a typed conclusion outlives the fact) |
| 415 | FILED | GUARD; WS §2 |
| 416 | APPLY | BC, Measure (where a view lands is judged at rest); WS §9 (each new test is proved red in its own medium) |
| 417 | APPLY | BCO §4 (walkers may share one server; a chat stops the servers it started) |
| 418 | ASK | recommend closed: overtaken — no further trial of a cheaper walker or reader is run or offered (D787, D790) |
| 419 | APPLY | FS Step 4, item 4 (the skill's own text) |
| 420 | APPLY | SH Step 1 (the opening line for a new job); HO (bring the checkout level before reading) |
| 421 | REFLECTED | `AGENTS.md` — the bridge file exists and names the rule files, each hook's job as a step by hand, the limits and the number ranges |
| 422 | APPLY | WP Self-Review 4 (a text rule is run over the real stored examples; a promised moment names its guard) |
| 423 | REFLECTED | memory `check-usage-before-heavy-task` (D533) |
| 424 | APPLY | BCO §0a step 3 (quote a duration from the last recorded run); memory `quote-measured-gate-times` already had it |
| 425 | APPLY | MOCK, judging (a reproduction written as assertions measures the proposal) |
| 426 | APPLY | DPA (stage by explicit path; read the staged file count) |
| 427 | APPLY | RCR, before applying a reviewer's fix (a broader mechanism: list every consumer) |
| 428 | MEMORY | new note `research-open-the-disconfirming-source` |
| 429 | APPLY | BCO §4, before a brief leaves (the promise copied from the full row) |
| 430 | APPLY | SH Step 2 item 5 (a job given to a named model or tool is probed once) |
| 431 | APPLY | DPA (say how the agent ends); WS §2 (report once; a walker's cost is its own token count) |
| 432 | APPLY | BCO §4 (each walk round is served from its own folder) |
| 433 | APPLY | BCO §6 (a fix that changes when a writer reports "nothing happened") |
| 434 | APPLY | WS §7 (a fault that depends on zoom or scaling is reproduced in a browser STARTED at that scaling); memory `owner-pc-display-125-percent` already had it |
| 435 | APPLY | BCO §6 (a change that removes an event: what else ran on it) |
| 436 | APPLY | WS §4 (a note prints the value it judged; End stops at the wrapped line) and §7 |
| 437 | APPLY | RCR, before applying a reviewer's fix (a record dropped for one missing field) |
| 438 | APPLY | WGT, Derive expectations independently ("behaves like the old one" needs the absolute table) |
| 439 | APPLY | SH Step 1 ("git fetch and check level", never "git pull" in a fresh worktree); HO |
| 440 | APPLY | BCO §4, before a brief leaves (offer a reader only the checks its sandbox can perform) |
| 441 | APPLY | BCO §4, before a brief leaves (the builder's own readings as targets); WP Self-Review 10 |
| 442 | APPLY | VBC Common Failures ("a mechanical rewrite…": evidence files excluded by path) |
| 443 | APPLY | WS §1 (the host's own short walk first; known traps named in the brief); the helper's selector: TOOLS |
| 444 | REFLECTED | GD (a browser-test run of even one file rebuilds the app's files) and memory `no-building-test-during-gate-run`; `shipping.md`'s sentence is corrected to match |
| 445 | APPLY | SD Phase 1 step 2 (a pause BETWEEN the two actions reproduces it, and proves the repair) |
| 446 | APPLY | DEC step 1 (a reading that says what the app will do is checked against what it does today) |
| 447 | APPLY | SH Step 1 (tell him to type a word of his own after pasting) |
| 448 | APPLY | DEC step 2 (read the row sentence by sentence before marking it SPENT or REPLACED) |
| 449 | APPLY | SH, "what makes the block…" (what the new rulings leave stale ON an unmerged branch) |
| 450 | APPLY | DEC step 1 (never a third party's names or figures inside his words) |
| 451 | APPLY | MOCK, the method (new parts cloned from a real neighbour and marked; the script kept) |
| 452 | APPLY | MOCK, judging ("this works like the existing X" is a behaviour claim) |
| 453 | APPLY | MOCK, judging (an existing component is measured, not styled) |
| 454 | APPLY | WP Self-Review 10 (a default that moves his words is a question, not a reading) |
| 455 | APPLY | TDD Verify GREEN (which other tests: suites that reach a shared module from another entry) |
| 456 | APPLY | WGT, Pick the fixture (a key well clear of the seed's) |
| 457 | APPLY | WGT, Pick the fixture (a snapshot taken after start-up) |
| 458 | APPLY | WGT, Pick the fixture (after a refusal hold the id, not the object) |
| 459 | APPLY | TDD Verify RED (red is an observation: a file that cannot load is not red) |
| 460 | FILED | GUARD (as 403); the rule is in memory `python-edits-crlf-trap` |
| 461 | REFLECTED | GD, how the gates lie (a preview already running is reused and never rebuilt) and BC "the server is serving THIS build"; BC now also says how to prove a reused one |
| 462 | APPLY | TDD Verify GREEN (when the change removed data that tests iterate over; compare the test count) |
| 463 | APPLY | WS §9 (a runner that edits source holds the tree); VBC "a background run passed" |
| 464 | REFLECTED | BC, CSS Placement (find the scope wrapper that encloses the insertion point) and BCO §6 (ask the page what is on top); its handoff half: SH (a trap is written from what was measured) |
| 465 | APPLY | WS §9 (reading 4: the line decides nothing) |
| 466 | APPLY | BC, CSS Placement (a short class name in a global stylesheet) |
| 467 | APPLY | SH, "what makes the block…" (what the next chat is told to run is committed) |
| 468 | APPLY | WGT ("before and after are equal" when the set-up made the after); WS §9 |
| 469 | FILED | GUARD |
| 470 | APPLY | WS §8 (for one size, role or mode that must not move) |
| 471 | APPLY | BCO §8 item 4 (the browser runner is named beside the unit one); the runner's own safeguards: TOOLS |
| 472 | FILED | GUARD |
| 473 | APPLY | BC, Drive every state (a control that acts on release) |
| 474 | APPLY | BCO §6 (a change that removes a way out: its positioning rules, and a real-browser press) |
| 475 | APPLY | BCO §8 item 8 (a new optional stored field gets one seeded record) |
| 476 | APPLY | BC, Drive every state (a dragged clone; a hidden twin with the same id) |
| 477 | APPLY | WGT, Pick the fixture (two actors are two different people) |
| 478 | APPLY | BCO §6 (a component that gains a second home); WGT (scope a query to its container) |
| 479 | APPLY | WP, Standing orders (a step that crosses a privacy boundary is its own step) |
| 480 | APPLY | TDD Verify RED (a state-comparison fault gets the pair) |
| 481 | APPLY | VBC Common Failures ("a check deferred to the end still holds") |
| 482 | APPLY | BCO §7.4 (a control that holds state gets its state table) |
| 483 | REFLECTED | `.claude/rules/record-decisions.md` §When a ruling overwrites another (the search covers "code comments and test names") |
| 484 | APPLY | GD, six more (5) |
| 485 | APPLY | GD, six more (2) |
| 486 | APPLY | WS §3 (never the "start fresh" address for a saved-data step) and §4 |
| 487 | APPLY | WS §9 (a rule held in two layers) |
| 488 | APPLY | MOCK, judging (a layout question over a range of content) |
| 489 | REFLECTED | VBC, Long check runs (as 346) |
| 490 | APPLY | BCO §6 (a change that removes a control: the door list from the removed code) |
| 491 | APPLY | TDD Verify GREEN (a replaced control: the failures are the list of promises to restate) |
| 492 | APPLY | SD Phase 4 step 1 (reproduce a reported failure in the running app first) |
| 493 | APPLY | BCO §4, before a brief leaves (a recommended answer is checked against his words); MOCK, traps (a before made by removing a rule prints what it removed) |
| 494 | APPLY | VBC Common Failures ("a typecheck or lint is clean") |
| 495 | FILED | GUARD |
| 496 | APPLY | BCO §7.2 and §6 — the two lines `[WALK-FINGER-NOT-LOCATOR]` proposed, now made |
| 497 | APPLY | TDD Verify RED (red is an observation: in a batch, run the tests before the first fix lands) |
| 498 | APPLY | BCO §6 (a listener added above its own component) |
| 499 | APPLY | BCO §0a step 3 (name no check beyond the tier's list unless its route is traced) |
| 500 | FILED | GUARD |
| 501 | APPLY | RCR, before applying a reviewer's fix (a confirmation: capture what was asked; both directions; re-ask the risk) |
| 502 | APPLY | BCO §7.0 (a designed scenario is left unwalked only for a reason about the scenario) |
| 503 | APPLY | WS §4 (a locator that reads is copied from the markup; the walk before the gates) |
| 504 | REFLECTED | GD (`gatelock.mjs run --from`); making the tool refuse: TOOLS |
| 505 | APPLY | BCO §4 (the reader's half); WS §9 |
| 506 | APPLY | WS §3 (assert one fact the fixture made, straight after reopening); the helper's refusal: TOOLS |
| 507 | APPLY | `raptor-port/docs/doc-budget.md` §4 (an item filed on two branches: drop, leave, declare) |
| 508 | APPLY | WS §1 (a borrowed helper is proved against the present screen first); the helper's message: TOOLS |
| 509 | APPLY | SH Step 1 (the residue check is a read of the block, made when it is removed) |
| 510 | MEMORY | new note `owner-questions-need-a-worked-example` |
| 511 | APPLY | MOCK, the method, step 5 (what the transform had to touch goes into the plan) |
| 512 | APPLY | TO, Acting on Observations (a default in place of a condition) |
| 513 | APPLY | DEC step 1 (a reading says where it was checked, or "not checked") |
| 514 | APPLY | TDD Verify GREEN (tests of a removed behaviour are found by what the user would have seen) |
| 515 | APPLY | VBC Common Failures ("a typecheck or lint is clean") |
| 516 | APPLY | SH, "what makes the block…" (designed but not built: leave the failing tests, parked) |
| 517 | APPLY | BC, Before trusting any browser result (a scratch name proved unused) |
| 518 | APPLY | TO, Acting on Observations |
| 519 | APPLY | SH Step 3 (archive before the last checked commit); DEC step 1 |
| 520 | APPLY | MOCK, showing it (an answer that is a question is a request for the picture) |
| 521 | APPLY | BC, Before trusting any browser result (prove a server you did not start); WS §1 |
| 522 | APPLY | WS §8 (record twice; prove the comparison on two runs of the same build) |
| 523 | APPLY | WS §8 (two equal records prove sameness, not coverage) and §4 (navigate by the screen's own heading) |
| 524 | APPLY | WP Self-Review 11 (what each site returns or passes on) |
| 525 | APPLY | DPA, a brief that worked |
| 526 | FILED | GUARD; already in memory |
| 527 | APPLY | WP Self-Review 11 (a retired field is swept by the field's name, copies included) |
| 528 | APPLY | DPA (each helper's own scratch sub-folder, named in the brief); WS §2 |
| 529 | APPLY | TDD Verify RED (a red test that does not compile stays out of the tree while a run is in flight); VBC "a background run passed" |
| 530 | APPLY | DPA, a brief that worked |
| 531 | APPLY | BCO §8 item 8 (a new kind of record gets one round trip first) |
| 532 | APPLY | WGT (a fixture never edits live state outside a command) |
| 533 | REFLECTED | `raptor-port/CLAUDE.md` §Build & verify (stand up the live view and LOOK), VBC "a screen change works", and BC's opening lines |
| 534 | ASK | recommend closed with no change: the walk stays before the reads; starting a read early is his word on the day, as it was. Its side lesson - a walk's record gives its SCENARIOS apart from its WALKERS - is already how the walk ledger's rows of 12 Oct 26 are written, and gets no guide line |
| 535 | APPLY | RCR (a batch of claims from a read that ran nothing); BCO §4 already said "every claim is written as a failing test" (D790) |
| 536 | APPLY | WS §1 (the clock is set to a start time and left running) |
| 537 | APPLY | WS §2 (a rewrite and its run are never sent in one step); VBC "my edits landed" |
| 538 | APPLY | TDD Verify RED (red is an observation) |
| 539 | APPLY | BCO §4, before a brief leaves (a scenario's EXPECTED line); WS §2 |
| 540 | APPLY | BCO §8 item 4 (a job writes a list, never another copy of the loop); what the runner still lacks: TOOLS |
| 541 | APPLY | SH Step 2 item 5 and Step 4 (running when written); HO |
