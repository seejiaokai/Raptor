# Outstanding — ARCHIVE

Items from `OUTSTANDING.md` that are FINISHED and carry no instruction to a future session.
**Search this file; never read it whole, and never append to it by hand** — the same shape as
`HANDOFF-ARCHIVE.md`. An item arrives here only when it is done AND says nothing a later session has
to obey; a finished item that still warns somebody off re-doing something STAYS in the live backlog,
which is why several merged items are not here.

Established 22 Sep 26 by the owner's D29, after a trim made to satisfy the size gate destroyed two
filed items — one of them a ruling's only home. The live backlog is read at the start of every
session, so every line there costs every session; this file costs nothing until it is searched.

**Since 23 Sep 26 ([DOCS-GUARD]):** the only way in is `node raptor-port/scripts/backlog-archive.mjs
<ID> --homes <file>`, and the test for "finished" is no longer the heading's words — every fact a
later session needs gets a pointer elsewhere FIRST (`OUTSTANDING.md` §Maintaining). The file is
append-only and the document gate fails any line removed from it.

---

### [INP-CSID] Stable ids for personal inputs — DONE (13 Sep 2026, ARCH-STACK 1A item 1)
Delivered by ARCH-STACK step 1A: personal inputs are filed/accepted/undone/edited by their
stable opaque `iid` (`newId('i')`), not the content key `inpKey`. Twins file independently and
the accept guard is a same-input idempotency check; `inpKey` stays only as a display/dedup hint.
Merged live in PR #396. Finding J (`DU-007`) closed.

### [OIL-XWEEK-DENY] A refusal survived a hand-back in a week nobody had loaded — CLOSED, 22 Sep 26

**Money, silent, and both reviewers found it (Fable F1, Codex rank 2).** The clear that kills a
scheduler's refusal when a request changes hands walked only the LOADED week, and the read-side
prune merely HIDES a key while somebody else holds the request — so a hand-over and hand-back made
while a different week was on screen brought a dead refusal back to life. On an already-published
day nothing flagged it. It vindicated Codex's M1 over the cheaper repair that was chosen.

**CLOSED.** The clear reaches every readable stashed week (`stashEditDays`), skipping the loaded
week and every byte-frozen one — the hazard this note asked to be respected. The prune stays as the
guard for exactly those two cases. The week stash joins the input batch on a person change, so ONE
Undo restores the assignment and the off-week refusal together, proved by a test that fails if the
enlistment is removed. Commit `26f9de5`; background in the two reviews' §F1 / rank 2.

### [OIL-XWEEK-ELSEWHERE] A cancelled anchor in an unloaded week kept paying — CLOSED, 22 Sep 26

**Money, and pre-existing rather than introduced by job 2** (Fable F2, Codex rank 3; both wanted it
closed before merge live). A request running into the next week, whose ONE row was CANCELLED in the
first, went on paying its later days. The build's note named the wrong mechanism — such a request
does not read "elsewhere", it reads as never-landed, and the money paid it at a short-circuit before
the row's state was read — so the repair it sketched would never have fired.

**CLOSED.** The standing resolves the anchor's own week and reads its stashed days: no stash entry
means the week was never edited, so nothing contradicts the man and he is paid; an entry that cannot
be read does NOT pay (Codex's conservative answer, taken over Fable's degrade-to-seed); a row found
gives its own state. The short-circuit is gone, and the key now records only what the standing
decides — earns or does not — so a row merely moving into an unloaded week no longer offers an
amendment with no money behind it. Commit `7045067`.

### [AMEND-SEL-FOLLOWUPS] Plans-selector 7 follow-ups (incl. the signature-leak bug) — DONE + LIVE 15 Sep 26
The owner's 15 Sep batch of seven changes, built test-first and merged as **PR #405** (`9ba253c`).
The one worth remembering: **signatures are PER-PLAN** (his option a) — each saved plan carries
its own four sign-offs, so signing one never fills another, and a plan whose content moved out
from under a signature reads empty. The other six were selector wording and layout.
**Full resolutions are in PR #405 and the commit messages**, which is where a finished batch's
detail belongs (`doc-budget.md` §3). Nothing outstanding.

### [LW-OPEN] Leave War opens on the war being WORKED — DONE 17 Sep 26
Owner ruling (17 Sep 26, restating his 7 Sep rule under newest-instruction-wins):
the tab always opens on the war open for bidding, else closed, else published,
else draft — never on the one last viewed. Was a REGRESSION, not a missing
feature: the 8 Sep storage seam made the tab persist, so the stored `current`
started winning from the second visit; before that nothing was stored and the
stage pick ran every load, so the rule held by accident.
**Resolved:** `state/store.ts initStore` now always stage-picks and ignores the
stored `current` (still recorded at every switch, for the shared database and
so a switch holds for the rest of the session). Pinned by three tests in
`state/store.test.ts`, one of which REPLACES an older test that asserted the
opposite ("remembers which war was on screen across a reload") — reversed by
owner ruling, noted in place. Gates: vitest 4865/4865, parity 728/0, build,
e2e (only the 2 known pre-existing failures, proved pre-existing by re-running
them against a stashed tree), tracker smoke. LIVE-DRIVEN on the built bundle:
opened on JAN-DEC 26 -> switched to the 27 draft -> switch held -> reload came
back on JAN-DEC 26 with the bidding border showing, no console errors.


### [TRK-IMPORT] Tracker import-conflict refusal — DONE (12 Sep 2026)
Import now refuses when a file names a *different person* under a callsign already
on the course, before writing anything — so the existing student is no longer
silently dropped and their marks orphaned. Rebased on current `main`, full gates
green, independent Astra/Codex bug-check run **on the fix**: it found the refusal
scan read only the per-syllabus rosters and missed a course still on the ORIGINAL
pre-syllabus flat roster (v3:<c>:roster), which a conflicting import could still
overwrite. Closed that (the scan reads the flat roster + its links too) and made
the refusal message honest that charts imported first may already be in. Astra
re-check: sound. Merged as **PR #386**, deployed, confirmed live (Tracker renders,
no console errors).

### [TRK-LEDGER] Tracker legacy-import ledger (Decision B) — DONE (12 Sep 2026)
A half-finished first-time legacy import used to seal itself done on the first
`raptor:` key and hide the rest forever; it now resumes via a per-key ledger and
grandfathers existing installs. Rebased on `main`, gates green, Astra bug-check on
the fix found a residual: if the store was so full that even the ledger write
failed, the next boot grandfathered and lost the rest. Closed with a
`__legacy__/started` marker written before the first copy, and gated persistence on
that marker being durable (a persisted record always has its marker). One inherent
corner documented (a record deleted seconds after migration on an already-full
store can be re-copied — resume without a durable ledger can't tell "not copied"
from "copied then deleted"). Astra re-check: sound. Merged as **PR #387**, deployed,
confirmed live.

### [SEC-ALTIP] AL panel tooltip HTML injection (AM-08) — DONE (11 Sep 2026)
The amendment sign-off tooltip could run injected code from a crafted callsign;
it's now escaped at display time, so already-saved names are covered too. Verified
end to end: merged as **PR #393** to `main` (CI green), deployed, and confirmed on
the live site (Amendments panel renders normally, no errors). Found by the
Astra/Codex amendment review; fixed in its own spawned session.

### [OIL-SEATS-CAN-EARN] — MERGED AND LIVE 23 Sep 26 (PR #425). The item as it stood while in flight.

*Kept because the reasoning behind D24/D27/D28/D31/D43 and the two halves of the change are here in
the words they were settled in. The BUILD's own story is the evidence sheet
`raptor-port/docs/handpass/2026-09-22-oil-seats.md`.*

**STATUS 22 Sep 26: ALL 11 STEPS BUILT, the FULL-tier WALK DONE, and the five defects it left open
now FIXED and re-walked, on branch `claude/oil-seats-can-earn`. NOT merged.** What remains before
"merge live" may be asked for: **both providers reading the finished code, blind to each other**
(bug-check order §4 rank 2 — this is money), then fixing what they find, re-walking that, the
gates, and the owner's look.
**Context → `raptor-port/docs/superpowers/specs/2026-09-22-oil-seats-build-handoff.md`** (the resume
doc) · **the walk's evidence → `raptor-port/docs/handpass/2026-09-22-oil-seats.md`**, §6a for the
five and their fixes · **behaviour register →
`…/specs/2026-09-22-oil-seats-behaviour-register.md`** — the list the rules sweep walks.

**D28 merged two items into this one.** His principle: *"If everywhere in the schedule can earn oil,
then the all avail or all puck should also be able to earn oil"* — every seat can earn, the DEFAULT
decides whether it does, the admin can always override. That replaced both his own earlier lean
(ALL AVAIL not on duty) and the agent's per-seat allow-list, and it removes the class of defect
rather than enumerating around it. **Nothing earns by default that does not earn today.**

**Half one — the exempt kinds (D24).** *"is it too late to revert that SC spare, Avalon and BB could
also earn OIL? … But by default they are not going to earn OIL."* SC SPARE, AVALON lines and desks,
and BB lines must OFFER the switch, defaulting to OFF. Today they are wholly inert — no switch, no
door. **Not a flag flip:** all three are skipped BEFORE anyone enters the calculation (`engine/oil.ts`
— `saExemptKind`, `f.spare`/`ac.spare`), so no item key and no person window exist for a credit to
attach to. **Supersedes D15 and D20 on the DOOR only**; D20's second half carries forward (a duty
block MADE from an AVALON template gets the same treatment). **D35 (22 Sep 26) makes that
explicit: the SWITCH reaches the template-minted block too**, not only the no-earn default —
otherwise the same seat answers differently depending on how it was made.

**Half two — ALL AVAIL / ALL, which the OWNER FOUND (22 Sep 26).** A duty desk he added on his phone,
Dash and ALL AVAIL on it: **on that seat ALL AVAIL credits NOBODY** — the day pays the 2 named people
and writes no key for the sentinel, a silent drop. Cause: `putWho` expands a sentinel, `put` drops
anything that is not a person, and only the Common Programme and Ground Programme PRIMARY seats use
`putWho` — flying lines, sims, duty desks and **the extras array of every row type** use `put`.
**PRE-EXISTING** (`main` has the same structure) but newly consequential. Measured in
`raptor-port/scripts/handpass/w11-duty.mjs`; roll-call table in the walk sheet §11.

**Half three — D27, the display half.** ALL AVAIL / ALL are a SCHEDULING feature: dropped anywhere
they work out who would be available and SHOW THE COUNT, with OIL Earn OFF. Extends
`[ALL-AVAIL-REDEF]` (WHO counts as available) by settling WHERE the answer shows.

**ANSWERED — D31 (22 Sep 26).** A seat the rules genuinely cannot MEASURE (no times, zero length,
cancelled, ⓘ) offers NO switch, and says why on screen instead. That is the ONE boundary on D28:
every measurable seat offers the switch, but where there is no window a credit would be invented
rather than earned. The refusal must NAME its reason — never a silent absence.

**RED-TEAMED 22 Sep 26 — BOTH PROVIDERS RETURNED REVISE; the plan is NOT buildable as written.**
Fable (7 must-fix, 9 should-fix) and Codex/Astra (7, four high), blind to each other, nothing
rejected, four findings change its shape. **Read `…/2026-09-22-oil-seats-can-earn-review-log.md`
before touching the plan** (Fable's text verbatim beside it). **D43 settles the default, more
simply than either reviewer proposed:** the placeholder pucks are ON by default wherever they can
land, like named people; only the four exempt KINDS default off (D24/D35). That closes the worst
finding outright — nothing is switched off, so no issued Saturday loses credits silently.

**Tier: FULL** — money, reaches an issued day, adds roll-call rows on every seat type. **Sequencing,
his: NEXT — `[OIL-AUTO-REMOVE]` merged 22 Sep 26**, so this is unblocked and at the head of the
queue, ahead of `[OIL-NEXT-TWO]`. **THE PLAN IS WRITTEN:**
`raptor-port/docs/superpowers/specs/2026-09-22-oil-seats-can-earn-plan.md` — it carries D24/D27/D28/
D31/D32/D33/D35, the roll-call of all six seat types, four findings read off the code (the earn
default is ON today; the earn rule is written twice; the sentinel drop is one helper not six call
sites; placement is unrestricted today) and the order of work. **Red-team it across BOTH providers
before a line is written.** The
display-versus-earning cost analysis and the size estimate are in
`raptor-port/docs/handpass/2026-09-22-oil-walk.md` §11 and §11a. Rulings: `DECISIONS.md` D24, D27, D28.


*Moved here 2026-09-23 by backlog-archive.mjs. Forward facts: `raptor-port/docs/doc-budget.md`, `raptor-port/docs/superpowers/specs/2026-09-22-backlog-process-attack.md`.*

### [DOCS-GUARD] Nothing detected a destroyed record — ALL FOUR STEPS DONE 23 Sep 26. CLOSED.

Fable's order (D30), all of it; step 4 brought forward by the owner's "Ok do it" (D83). Branch
`claude/docs-guard`. `npm run docsize` fails a lost, doubled or truncated backlog record, a lost or
doubled D-number, a ruling home that does not exist and a rule-map id with no register entry; it
runs in CI (`docs-guard.yml`) and as a Stop hook, and never demands a trim inside a code change.
Finished items move only by `scripts/backlog-archive.mjs`. How it all works:
`raptor-port/docs/doc-budget.md` §4; what was found and done:
`raptor-port/docs/superpowers/specs/2026-09-22-backlog-process-attack.md`.


*Moved here 2026-09-23 by backlog-archive.mjs. Forward facts: `raptor-port/docs/handpass/2026-09-23-lw-monthjump.md`, `.github/workflows/deploy.yml`, `raptor-port/docs/ui-contracts.md`.*

### [LW-MONTHJUMP-PHONE] On a phone a month button can land a day short — an APP bug; the phone test is right (23 Sep 26)

**The desktop half is DONE** (branch `claude/lw-monthjump-phone`, owner D87): the two
`e2e/step4-leavewar.spec.ts` scenarios that timed out on GitHub ("LL 14–18 Jul … undo restores",
"a reload (not ?fresh) …") now wait on what each step needs, not fixed 100–700ms pauses, and the
reload one reads a person's three figures from ONE opening of their sheet, not three. Measured with
the new slow-browser switch (`E2E_CPU_THROTTLE=3`, `e2e/app.ts`): the reload test went from failing
at 2x slower to passing at 3x (29s, at the edge; 4x still fails); the other from failing 2 of 3 at 4x
to passing 3 of 3 (28s).
Evidence: `raptor-port/docs/handpass/2026-09-23-lw-monthjump.md`.
**The phone half was misread as load — it is the app, and it shows on a FAST machine.**
`e2e/leavewar.spec.ts` "a month button works from wherever the grid already is" (lw-phone) fails
10/10 run alone on a quiet desktop and passes in a busy full run. Paced like a person (1s, SEP,
1.5s, MAR) it lands March a whole day short about half the time — 1 March under the frozen name
column (both pictures in the evidence sheet). **Measured:** February is drawn at the open with a
posted-out man's row showing (ignite) and its width is remembered; by September his row is hidden;
back at March the window regrows February within 160ms of the jump, the fill engine treats the
remembered width as exact, and on a touch screen skips the re-anchor "in motion" (`Matrix.tsx`,
`!(inMotion && coarsePointer())`). February now draws 20px narrower, so March slides 20px left —
one day at the phone's 0.8 zoom. A slower machine regrows after 160ms, gets re-anchored, passes.
**FIXED 23 Sep 26 on `claude/lw-monthjump-phone` (evidence sheet PART TWO, §8–§14): not the jump-override
below but its root — a remembered width counts as exact only under the rows it was measured with
(`widthGen`/`widthExact`), which also stops the same hop in a backward finger fling; phone test red 3/3 →
green 3/3; the test now measures once, after February is drawn and the grid holds still.** Was:
**NEXT CHAT, on this same branch, BEFORE it merges (owner, D152 — supersedes D150's order). Fix (app, WALK tier, phone) — Astra's spec:** in `Matrix.tsx`'s fill
effect, let a recent programmatic jump (`Date.now() - jumpAtRef.current < 1200`) override the
coarse-pointer/in-motion suppression and take `anchorNow` before `setColWin` (and/or forget remembered
widths when the row set changes) — without bringing back the fling-killing scroll write (30 Aug). Then
make the test wait for the March header to hold still past the rest/fill window before asserting; drop
the first-success poll (today a sample taken before the shift can pass it). **Not paced in the test on
purpose:** waiting longer between taps does not stop it, and pacing around it would hide the bug.
**Until then (owner, D84):** a Leave War desktop timeout on GitHub gets ONE re-run of the failed
group, not an investigation; a second failure of the same group is new evidence — stop and report.


*Moved here 2026-09-23 by backlog-archive.mjs. Forward facts: `raptor-port/docs/handpass/2026-09-23-lw-monthjump.md`, `raptor-port/src/leavewar/ui/Matrix.tsx`.*

### [LW-HBAR-RESYNC] The Leave War bottom scrollbar is left out of step after a drag (23 Sep 26)

After the bar is dragged the grid→bar follow is off for 250ms (`Matrix.tsx` `syncHbar`, `hbarUserTsRef`)
and nothing re-syncs when that ends, so a grid move inside the window leaves the thumb stale until the next
grid scroll — forced 5/5 (drag, then SEP at once: grid at September, thumb at 0). The e2e now waits it
out. Fix: one trailing `syncHbar` when the window closes. **In the next chat, with the phone fix (D150).**
**FIXED 23 Sep 26 on `claude/lw-monthjump-phone`, with `[LW-MONTHJUMP-PHONE]` and the owner's filmed
frozen-bar jump** — red 5/5 before, green 5/5 after; evidence sheet PART TWO
(`raptor-port/docs/handpass/2026-09-23-lw-monthjump.md` §8–§14). Archive both once the branch merges.


*Moved here 2026-09-23 by backlog-archive.mjs. Forward facts: `.github/workflows/deploy.yml`, `HANDOFF.md`.*

### [CI-TWO-CORES] GitHub's machine halved when the repo went private — the checks are tuned for 4 cores (23 Sep 26)

Private repo = GitHub's 2-core machines (public = 4): from the switch (22 Sep ~17:40 UTC) every parallel check
doubled (a run ~20 min) and billed ~60 of the month's minutes (Free 2,000 · Pro 3,000 — minutes, not speed). **CHOSEN (D89): the checks run on HIS PC** — a Windows self-hosted runner ("JK",
registered 23 Sep 26 by hand in an admin window; a Windows service is next). BUILT on
`claude/lw-monthjump-phone`: the `pc` job in `deploy.yml` (one job, cmd shell, line endings as stored,
e2e on 4273 / smoke on 4279), the old jobs behind `CI_ON_GITHUB`. Trials on the PC: every gate runs (~14 min
green), and it exposes FAST-machine races the slow runner hid — the phone month test is red there until
`[LW-MONTHJUMP-PHONE]` is fixed, so `CI_ON_GITHUB=true` was set 23 Sep 26 — **DELETED the same afternoon, with
the fix in; the next push ran on the PC** (PR #428's checks). Astra's second
read added: the PC runs only HIS OWN changes in a PRIVATE repo, and the runner never as Administrator.
**23 Sep 26, afternoon:** the runner is a Windows SERVICE (`actions.runner.seejiaokai-Raptor.JK`) under
NT AUTHORITY\NETWORK SERVICE, auto-start, installed by him at `C:\actions-runner\actions-runner`
(one folder deeper than the first copy — never delete `C:\actions-runner`). Astra's third read (SEC-102):
`Authenticated Users` inherit MODIFY on that folder from `C:\`, and the PC has two Codex-sandbox
accounts besides his — **FIXED BY HIM 23 Sep 26, 16:38** (the four `icacls` lines, evidence sheet §14);
verified: only Administrators, SYSTEM and the runner's own group may change its files, Users read; online.
The first run AS A SERVICE hung 30 min in the browser gate: Playwright's CI git-info `git fetch` waited on
Git Credential Manager, which a service cannot show (no stored token since SEC-003). Fixed:
`captureGitInfo` off in `playwright.config.ts`; `GIT_TERMINAL_PROMPT=0`/`GCM_INTERACTIVE=never` in the job.


*Moved here 2026-09-24 by backlog-archive.mjs. Forward facts: `raptor-port/docs/handpass/2026-09-23-tracker-pinch-ball.md`, `HANDOFF-NEXT.md`.*

### [TRK-PINCH-DRAGS-BALL] A pinch in Edit chart layout with a finger on a ball drags that ball (23 Sep 26)
**BUILT on `claude/tracker-pinch-drags-ball` (24 Sep 26), FULL-tier bug check in progress — sheet
`raptor-port/docs/handpass/2026-09-23-tracker-pinch-ball.md`.** Carries the owner's report of the same night
too — *"the left side of the tracker chart is cut off"*: leaving Edit chart layout left its canvas's pan and
zoom on the ordinary chart, where the next pinch painted them on (fixed on the same branch). Archive on merge.
Found walking the pinch fix
(`raptor-port/docs/handpass/2026-09-23-tracker-pinch.md` F-B). In Edit chart layout, a first finger that
lands ON a ball starts that ball's drag; the second finger makes it a pinch, but the drag carries on: the
ball moves (36px on a phone), an undo step appears, and the move saves itself. Older than the pinch fix.
The shape of the fix: the moment a second finger lands, cancel the ball's drag and put it back — no move,
no undo step, nothing saved. **FULL tier** (it touches a saved change): both reads, not one.


*Moved here 2026-09-24 by backlog-archive.mjs. Forward facts: `raptor-port/scripts/tracker/smoke.mjs`.*

### [TRK-SMOKE] The `addStudent` tracker smoke check — DONE 17 Sep 26, MERGED (PR #408)
**Not a flake.** Two independent causes, both fixed and both pinned: the shared add-student box
cleared its text field in a post-paint step that ran AFTER the box had been read (a shipped
bug, not a test bug), and a second race on back-to-back adds. Proven by instrumenting the
running app at the failing add and reading what the box actually held at submit time.
**The full diagnosis is in the commit message**, which is where a how-it-was-found story
belongs (`doc-budget.md` §3). Nothing outstanding; kept only until it merges.


*Moved here 2026-09-24 by backlog-archive.mjs. Forward facts: `raptor-port/docs/superpowers/specs/2026-09-17-arch-stack-cmdl-finish-design.md`.*

### [CMDL-FINISH] Finish the command layer for Leave War + Tracker — DONE + LIVE (18 Sep 26)

ARCH-STACK step 2 completion: the causal both-side envelope, the per-record write seam,
one-envelope-per-Tracker-gesture, guarded lw/trk stores, `TRK_RESTORING`, `sched.als` re-key, and the
cross-provider inspection punch-list. Merged as PR #412 (build) + PR #415 (finish), plus the undo
front-door doc #413. **Two items were deferred INTO `[GLOBAL-UNDO]` and remain open there:** the
Leave War posting-window rebuild on a postouts restore (CMDLF-002), and grouping a whole Import as
one undo step.

**Still open, tracked in `[SYNC-INTEG]` not here:** P6 a Quals ✕ confirm (superseded by `[RECALL]`);
P7 a stale "Leave War session-only" line in the ROOT CLAUDE.md (raptor-port's copy is corrected).

Full story: `git log` for those PRs, and `docs/undo-contract.md` for the contract it established.


*Moved here 2026-09-24 by backlog-archive.mjs. Forward facts: `raptor-port/docs/superpowers/specs/2026-09-17-arch-stack-3-global-undo-design.md`.*

### [GLOBAL-UNDO-REV6] design record (Rev 6) — MOVED OUT 22 Sep 26

The full Rev 6 design record lived here after the work was built, merged and went live on
18 Sep 26. A backlog is for what is NOT done, and every line of this file is read by every session
that opens it, so it is retired to git history rather than carried forever: `git log -S"Rev 6"
-- OUTSTANDING.md` finds it, and the shipped behaviour is in `docs/undo-contract.md`.


*Moved here 2026-09-24 by backlog-archive.mjs. Forward facts: `raptor-port/CLAUDE.md`, `raptor-port/docs/data-schema.md`.*

### [TRK-CSID] Give courses & syllabuses their own hidden ids — SPLIT (owner, 13 Sep 26)
Two passes (courses first — clean; syllabuses second — the tangled global/built-in half).

**1B-i — COURSE ids — DONE + LIVE (13 Sep 26; PR #398 code + #399 docs, merged to `main`, deployed & live-verified).**
*(Deploy note: #398's first publish failed on the known `addStudent` smoke flake so it was NOT live despite an earlier handoff saying so; re-published via workflow_dispatch — green — and live-verified this session.)*
`COURSES` is `{id,name}[]`, `course` is the current course id, every per-course key
files under the id, so **renaming a course is a label change that moves nothing**
(the old copy-verify-delete apparatus in `renCourse` is gone). New `app/courseIds.js`
(mint/upgrade/reconcile) + `migrateCourseIds` (resumable, read-back-verified,
`list()`-prefix move with a reserved skiplist + fail-closed preflight, translates
`v3:links`). Fail-closed boot (`bootError` → App reload panel). Import carries
`{id,name}` courses (file v2), reconciles to the store's ids by name, refuses a
reserved name / bad id. Spec + 4-round Astra red-team (APPROVED):
`raptor-port/docs/superpowers/specs/2026-09-13-trk-csid-course-ids-spec.md`.
Known limitation (inherited, NOT new): the migration's durability + two-tab safety
match the shipped enrolment migration (read-back proves the in-memory whiteboard,
not the backend) — this is `[TRK-DISK]`, owned by `[DB-STEP]` (RC5); no interim
patch built. Fable-high final review of the built diff before merge.

**1B-ii — SYLLABUS ids — DONE + LIVE (14 Sep 26; PR #400 build → #401 Fable-review fixes → #402 Codex re-review fixes).**
*(Finished via an independent Codex re-review of the merged Fable fix: it found RR-01 an
order-dependent layout-conflict brick, RR-02 raw-text layout equality + one-sided empty
guard, RR-03 a suppressed legacy def resurrected as a visible custom; plus owner-requested
RR-03b a hidden built-in's edited def vanishing. All fixed with fail-first tests and merged
in PR #402; gates green, deployed.)*
Syllabuses now carry stable hidden ids: built-ins get **deterministic shipped ids**
from a `BUILTIN_SYL` table (`app/sylIds.js` — `sb2024`/`sb2026`/`sbtx2026`/
`sbagaa2026`), user charts a minted `sc…`; grammar `^s[bc][0-9a-z]+$`. The global
catalogue is `SYLS`=`{id,name,base?,userNamed?}[]` (`v3:master:sylcat`), `base`
authoritative from the table. **Renaming a syllabus is a label change that moves
nothing** (`renSyl` = set name + `userNamed`; `moveSylData`/`purgeLegacySyl`/
`SYL_ALIAS`/`SYL_RENAME` all deleted). Conversion = **"keep charts, reset marks"**
(owner): `migrateSylIds` converts the global catalogue IN PLACE via a durable
**payload journal** (compute-once, whole-object writes, `purge = sources ∖
destinations`, verify after all purges; two flags `kSylCatMig`/`kSylReset`; legacy
layout event-ids translated via `padId`/`SPECIAL` incl. `__font`) and RESETS the
per-(course,syllabus) student layer. Boot reconcile `reconcileBuiltins` (also in
`reloadFromStore`). `plan.sylId` replaces `plan.sylName`. **Import guardrail
(owner, §19):** charts import from any version; student marks/dates/rosters import
ONLY from an id-native v3 file with a `sylcat` (pre-v3 / unresolved → refused, plain
message; charts still import). File version → 3. **Colon relaxed** on syllabus/
chart names (course names keep the refusal). One converter `app/sylIds.js` shared
with Import. Spec + 7-round Astra red-team (APPROVED):
`raptor-port/docs/superpowers/specs/2026-09-13-trk-csid-syllabus-ids-spec.md` (§§14–19 binding).
Tests: `app/sylIds.test.ts` (pure), `app/sylIds.migration.test.ts` (KEEP/RESET
journal harness), tracker.test.tsx re-baselined (rename/reorder/delete/dup/guardrail),
smoke fixtures → ids + v3. Inherited `[TRK-DISK]` durability limitation stands.
- **Done:** merged and live 14 Sep 26 (PR #402). The inherited `[TRK-DISK]` durability
  limitation still stands (owned by `[DB-STEP]`).


*Moved here 2026-09-24 by backlog-archive.mjs. Forward facts: `raptor-port/docs/superpowers/plans/2026-09-19-arch-stack-4-build-log.md`.*

### [ARCH-STACK-4] One absence record — BUILT 20 Sep 26, MERGED (PR #421)
Step 4 of the [ARCH-STACK] backbone. Branch `claude/db-step4-one-absence`. An absence is ONE record
(the Input); the Leave War stores only its own records (requests, OIL credits, replaced-bid notices)
as a list per person/date and DERIVES what each day shows on read; approving on the war writes the
Input in the same command; every save is all-or-nothing (phase 0). The owner's clash rules run at
one seat in the inputs door (`leavewar/inputgate.ts`) and on undo/redo; publishing a weekend/PH day
replaces a clashing bid. The multi-record box (grey `+n` / amber `!`) and its tap list are built;
screenshots in `raptor-port/docs/img/step4-shots/`.
- **Read to resume:** the build log `raptor-port/docs/superpowers/plans/2026-09-19-arch-stack-4-build-log.md`
  (what is built where + status), the rules of record
  `raptor-port/docs/superpowers/specs/2026-09-20-arch-stack-4-clash-check.md`, the inspection brief
  `…/plans/2026-09-20-arch-stack-4-inspection-brief.md`.
- **Left:** fold in the cross-provider code inspection (Codex + Fable) and the scenario tester's
  findings; hold for the owner's "merge live". Deferred on purpose: OIL itself as a read-time
  derivation (design §7), per-year balances `[LEAVE-YEAR]`, published-day Unavailable `[PUB-UNAVAIL]`.


*Moved here 2026-09-24 by backlog-archive.mjs. Forward facts: `raptor-port/docs/superpowers/plans/2026-09-20-s4-bughunt-plan.md`.*

### [S4-BUGHUNT] Full scenario bug hunt of the one-absence model — NEXT (owner, 20 Sep 26)
The owner's next task: a full end-to-end bug test of the step-4 scenarios NOT yet covered. **Fable and
Codex PLAN the hunt (a scenario list each, cross-provider), Opus EXECUTES** in the running app and fixes
what it finds. Everything the planners need is in
`raptor-port/docs/superpowers/plans/2026-09-20-arch-stack-4-test-coverage.md` — bugs already caught, what
the 18 e2e + the unit suites already cover, and §3's list of untested ground (other Input doors, answer
A's weekday case, pre-posting-in leave, medical corners, the OIL pass vs absences, cross-war dates, bulk
gestures, undo depth, storage faults, phone touch, figures on multi-record days). Rules of record:
`specs/2026-09-20-arch-stack-4-clash-check.md`. Do it on the step-4 branch (or on main once it merges).


*Moved here 2026-09-24 by backlog-archive.mjs. Forward facts: `raptor-port/docs/engine-rules.md`, `raptor-port/docs/superpowers/specs/2026-09-21-oil-auto-remove-decisions.md`.*

### [ALL-AVAIL-REDEF] What ALL AVAIL and ALL actually mean (owner, 21 Sep 26) — BUILT 21 Sep 26
His ruling, in short: no ground crew by default; a SANS man only when planned with us that day;
ATT B still in; anyone whose own tasking clashes in time is out. **His exact words and the full
before/after table are §2.6 of the decisions doc** — quoted there, not here.

Split out of [OIL-AUTO-REMOVE] because it changes **who gets planted on a row**, not only who gets
credited, and because it closed a real disagreement: two answers to "is this man available" living
in one app.

- **Do it WITH or BEFORE [OIL-AUTO-REMOVE]**: the OIL mode's sentinel expansion depends on what ALL
  AVAIL means.
- **Consider merging with [LW-COMMIT-MANNING]** below — same root cause, same seam.
- **It fixes a live bug as a side effect** (§5 of the doc): a man whose Training input was answered
  "no OIL" is still swept into an ALL AVAIL family day and credited anyway, for an event he is not
  at. If this item is deferred, that needs its own guard.


*Moved here 2026-09-24 by backlog-archive.mjs. Forward facts: `raptor-port/docs/handpass/2026-09-22-oil-walk.md`.*

### [OIL-PHONE-TARGETS] The OIL mode's phone tap targets — CLOSED, RULED "leave it" (owner, D26, 22 Sep 26)

**Nothing to build. Do not re-open or re-file as a defect.** At 390px the mode draws 71 tappable
things, median 15px tall, all under 44px — measured and true. What was wrong was the agent's
INFERENCE from it; he corrected that directly: *"I can still settle OIL on my phone easily from my
point of view."* He uses it, so his judgment governs. Kept as a RULED item with its date (standing
order §7.6) so a later session cannot rediscover the measurement and "fix" it. Detail: the walk sheet
§6 item 12.


*Moved here 2026-09-24 by backlog-archive.mjs. Forward facts: `raptor-port/docs/superpowers/specs/2026-09-22-oil-seats-behaviour-register.md`.*

### [OIL-UNDO-WORDS] — DONE 22 Sep 26, folded into [OIL-SEATS-CAN-EARN] step 11 (NOT merged)

**Resolved:** an OIL decision is now its own command (`sched.oil`) rather than riding the catch-all
mutation backstop, so the one central describer names it "an OIL decision". Pinned by
`raptor-port/src/undo/oilundo.test.ts`, which installs the real timeline and reverses a real
decision. Holding on the branch with the rest of the change until the owner says "merge live".
The original entry follows.



Found in the walk while proving fix 5's boundary. Inside OIL Earn, the first two presses of the
board's Undo correctly reverse the OIL decisions — and each says **"Undid: a change to the
schedule"**. Taking a man off an event is not a schedule change; the mode exists precisely because
the schedule must not move while OIL is being decided, so the words contradict the screen they appear
on. The third press, which leaves the mode, says the right thing ("Left OIL Earn — the next undo
would change the day itself").

**Tier: NONE** (words only, one string). The label comes from the undo entry's own description, so
the fix is to give an OIL decision its own wording rather than inheriting the generic one. Evidence:
`raptor-port/docs/handpass/2026-09-22-oil-walk.md` §5.1; re-run with
`scripts/handpass/j5-undo.mjs`. **Fold into `[OIL-SEATS-CAN-EARN]` or `[OIL-WORDS]`** — not worth its
own pass.


*Moved here 2026-09-24 by backlog-archive.mjs. Forward facts: `raptor-port/docs/handpass/2026-09-22-oil-seats.md`.*

### [OIL-SEATS-CAN-EARN-CLOSED] Every seat can earn, the default decides — **MERGED AND LIVE 23 Sep 26 (PR #425). CLOSED.** (the full record is `[OIL-SEATS-CAN-EARN]` in the archive)

Every seat can earn, the DEFAULT decides, the admin can always override (D24/D27/D28); the two
placeholder pucks behave like named people wherever they can land (D43). The FULL-tier walk left five
defects; closing them turned up thirteen more — **eighteen in all, each with a test red first** — and
the last of them was found by the owner asking why the speed gate was failing. **Two of his five were
one bug and not an OIL bug** (a man's leaving date never saved, so he walked back into the squadron on
every reload). Both providers read the finished code twice, blind, and agreed on the same four
findings. Live page checked after the merge.
**Full detail moved to `OUTSTANDING-ARCHIVE.md` (D29 rule 1).** The story is
`raptor-port/docs/handpass/2026-09-22-oil-seats.md` (the evidence sheet, §6a the five and §6b the
reads) and `…/specs/2026-09-22-oil-seats-final-read-reconciled.md`. Rulings: D43–D50, D54, D55.
**What it deliberately left**: `[OIL-READ-LEFTOVERS]`, `[STORE-READER-SWEEP]`, `[OIL-REQ-NAMEBOX]`,
and `[POSTOUT-LOST]`'s remaining half.


*Moved here 2026-09-24 by backlog-archive.mjs. Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/handpass/2026-09-23-allavail-window.md`.*

### [ALL-AVAIL-WINDOW] The counter opens a movable window of PUCKS, not a bubble of names (owner, D38, 22 Sep 26)

**STATUS 23 Sep 26 — LIVE ON `main`** (his look on Vercel, then "merge live"; merged after the skill review, full gates re-run on the combined tree). Was: BUG-CHECKED AT FULL TIER on `claude/all-avail-window`. Walked on the real bundle (four passes, both widths), every Fable scenario dispositioned, both final reads (Fable + Astra, blind) reconciled and fixed, each fix red first. Evidence: `raptor-port/docs/handpass/2026-09-23-allavail-window.md`. **Waiting on: his look, then his "merge live"** — the browser gate is green (a load-sensitive Leave War test is filed as `[LW-MONTHJUMP-PHONE]`). Left open and filed: `[OIL-PERSONAL-PLACEHOLDER]`, `[CROWD-SIM-BRIEF]`; one question for him: on a phone the window moves but cannot be resized (D38 said "resizable") — **ANSWERED D77: leave it, no phone resize corner.**

**His words:** *"the current interface to show just names on a bubble … is not intuitive … a window
that is movable and … resizable and a user can still click and edit/scroll the schedule behind while
that window is still opened … show the pucks just like how the placeholder shows the personnel and I
can click on the flagging as well … pilot then wso, left right column … Perhaps make a mock up before
we execute this."*

**ONE WINDOW, TWO JOBS.** Tapping either counter opens the same panel: (a) who is AVAILABLE behind an
ALL AVAIL / ALL puck, and (b) who is CREDITED OIL — and in (b) he switches individual pucks off.
Today (a) is a one-line string of names and (b) lives inside the mode's own decoration.

**What makes it different from every panel the app already has:**
- **MOVABLE and RESIZABLE by the user**, and it **does not block the schedule** — he scrolls AND
  EDITS behind it while it is open. Not a `Sheet` (scrim + Escape, blocks everything) and not an
  inline popup (dismisses on an outside click — the 4 Sep 26 standing rule). **This is a THIRD
  transient-surface kind and the first one the app has; it needs its own contract**, and the outside-
  click rule has to be stated as not applying to it, or a later session will "fix" it.
- **Real pucks in the placeholder's own layout** — pilots left column, WSOs right — carrying the same
  warning flags the rest of the app draws, and clickable.

**WHY THE FLAGS ARE THE POINT, in his example:** a man whose ops brief sits inside his standard
debrief must APPEAR, flagged, so the scheduler sees the overlap and judges it. **That is the other
half of D36** — availability stays narrow (he IS available) precisely because the app's job here is
to SURFACE the clash, not to remove him from the list. Do not let this item drift into "filter him
out"; that is the change D36 refuses.

**MOCK-UP BUILT AND APPROVED 22 Sep 26 (D41 — "that mock up looks good"). IT IS THE DESIGN OF
RECORD; changing it now needs his word.** `raptor-port/docs/mock/allavail-window.html`, a working comp in the
app's OWN stylesheet (it drags, resizes, and the schedule behind it scrolls and types). Also published
as an Artifact for him: <https://claude.ai/artifact/3kHfkdRobBjgtmhnyGvkdi>. **He reviewed it across
three rounds and ruled four times: D39** — one puck per row at every width, and the counter chip drops
the word "free"; **D40** — the window opens SKINNY at **212px wide** (the two 74px pucks, their gap
and about 16px of slack per column; **186px is the floor**, below which a puck clips), and its drag
handle is the app's own six-dot grip, not a dashed or hamburger glyph. **Build to those numbers.** A flagged man's reason wraps under his
puck at that width and moves beside him when the window is dragged wider; it is never dropped.

**THE MODE RULE, confirmed with him 22 Sep 26.** Tapping the counter always shows WHO IS AVAILABLE —
any day, OIL or not. The **"Who earns OIL" half exists only while OIL Earn is switched on**; with the
mode off there are no tabs at all, just the one list, and on an ordinary weekday (which cannot earn)
it never appears. That is D27 carried through: availability is a scheduling fact, earning is a mode.

**A CONSTRAINT THE BUILD MUST RESPECT:** a puck is a MEASURED 74×15 (`--puck-w`/`--puck-h`, pinned
with `!important` in `scheduler.css` and watched by the browser geometry gate). Do NOT stretch pucks
to fill this window's columns. The mock instead gives each man a full ROW — puck at its true size,
the rest of the row carrying his flag's reason inline, which is what makes the list scannable and is
exactly the case he opened this with.

**Sequencing: AFTER `[OIL-SEATS-CAN-EARN]`**, which builds the counters this window opens from, and
which settles where they appear. Ruling: `DECISIONS.md` D38; the related ones are D27 (the count is a
scheduling feature), D36 (the narrow window) and D37 (the count reads as what it is).


*Moved here 2026-09-24 by backlog-archive.mjs. Forward facts: `raptor-port/docs/superpowers/specs/2026-09-21-oil-award-add-design.md`.*

### [OIL-AWARD-ADD] An award and a worked day ADD UP — MERGED to main, 21 Sep 26 (PR #423)

**DONE.** Rulings N16–N19 built, all in the OIL behaviour register and each named by a test that
`npm run rulecheck` watches — so the register, not this file, is where they live. Design:
`specs/2026-09-21-oil-award-add-design.md`; what the two review rounds found and what was done with
each: `…-review-log.md`, **worth reading before any further OIL work**. The take-over-and-hand-back
machinery was retired, which was the point — both silent balance bugs of 20–21 Sep lived in its
snapshot. **One half is NOT done and is tracked separately: `[LW-COMMIT-MANNING]`** (N17's other
half — duty and commitments must reduce the Leave War manning).


*Moved here 2026-09-24 by backlog-archive.mjs. Forward facts: `raptor-port/docs/superpowers/specs/2026-09-20-one-absence-behaviour-register.md`.*

### [OIL-AWARD-ADD-RULING] The ruling as it was given, kept for the reasoning

> "Yes an award and a worked day add up. So it's 4. The auto oil credits don't get affected by
> manual OIL inputs."

**The ruling.** A 3-day award on a Saturday the man then works is worth **4** — the award's 3 plus
the day's 1. The two are INDEPENDENT: what the schedule earns is never changed by what a person
typed, and what a person typed is never changed by the schedule.

**BUILT — PR #423, 21 Sep 26; ruling D82, register N16.** Everything below is the reasoning as it
stood BEFORE that build, kept for why; it does not describe the app now.

**What the app did then (wrong under this ruling).** One credit record per person per day. When
the schedule earns a credit on a day that already holds an award, it TAKES THE AWARD OVER in place
and stashes it in a snapshot for the unpublish hand-back. Since 21 Sep it keeps the LARGER of the
two (3), which was the safe reading of a defect Fable found — before that fix it kept only the
schedule's 1 and the man silently lost two days.

**What this ruling actually asks for, and why it SIMPLIFIES the app.** Two records on the day, side
by side: the app's own credit and the award, each keeping its own worth, reason and giver. The whole
take-over-and-hand-back machinery exists ONLY because they were sharing one slot — under this ruling
it can go. The day view already sums `earnsOil` across every credit and already asks `.some(auto)`
for duty, so the engine is ready; the work is in the store and the tracker.

**The pieces:**
1. `ingestDutyCredit` writes the app's credit BESIDE an award instead of over it; the `manual`
   snapshot and the hand-back retire (keep the reader for records already stored).
2. `setManualCredit` stops refusing an award on a day the schedule already earns ("That day already
   earns OIL from the published schedule").
3. The reverse sweep (`clearRaptorCell`) removes only the app's own credit, never the award.
4. The OIL tracker lists ONE ENTRY PER CREDIT on the day, not the first one it finds.
5. The day window and the tap list read back both.
6. The grid cell holds one code: the app's own (starred) shows, with the award behind the `+1` mark
   — the same way the app already shows a day carrying more than one record.

**Do this in a FRESH session, not at the tail of one.** It moves persisted OIL balances, which is
where both of the night's silent bugs lived; the project's own rule escalates that kind of change.
Build it test-first and put it through both reviewers.


*Moved here 2026-09-24 by backlog-archive.mjs. Forward facts: `raptor-port/docs/plans-selector-followups.md`.*

### [REPO-CLEANUP] Repo-wide space/redundancy sweep — DONE, NOTHING REMOVED (18 Sep 26)
**The repo is already tidy; there is nothing worth removing. Do not re-open without a new
reason.** Checked: 0 dead source files across 522 modules; dead CSS ~0.9 KB (the rest are
dynamically built class names, false positives); `ts-prune` output was barrel re-exports and
keep-list symbols, acting on it would be a bug. The only real weight is ~0.6 MB of design
write-ups for shipped features, and the owner ruled **KEEP** — a note in the tree is browsable
history; git keeps it either way, so deleting saved nothing.
- Method note for a future sweep: strip the leading `YYYY-MM-DD-` before testing whether a doc
  is referenced, because OUTSTANDING/HANDOFF cite design docs by their date-elided tail.
- **NOTE (21 Sep 26): this was about disk space, which was never the problem.** The problem is
  how much must be READ per session — that is `[DOC-TRIM]`, a different measure entirely.

*Moved here 2026-09-24 by backlog-archive.mjs. Forward facts: `raptor-port/docs/engine-rules.md`, `.claude/rules/decisions/oil.md`.*

### [OIL] Lock earned OIL on an already-worked day — STANDBY (after [AMEND])
An amendment that removes a person re-derives Leave War auto-OIL from the current
published version and sweeps it away — correct for a **future** day, wrong for a
**past** day already worked.
- **Decision (owner leaning, 11 Sep 26):** earned OIL on an already-worked day is
  **locked**; amendments only affect OIL for days not yet flown. Exception: an
  amendment whose explicit purpose is "he didn't work it after all."
- **Cross-feature, verified:** `src/leavewar/sync.ts` `runOilPass`/`desiredOilCells`
  + `src/engine/oil.ts`; acknowledged claims (`row.oil`) are the only sticky source
  today. Sequenced after [AMEND].
- **Model:** build on Opus; a Fable-high bug-check (touches money + saved data).


*Moved here 2026-09-24 by backlog-archive.mjs. Forward facts: `raptor-port/docs/superpowers/specs/2026-09-12-amendment-core-build-plan.md`.*

### [BUG2] Verify the reopen control during version preview — SMALL (folds into [AMEND])
Astra says the original Bug 2 may **not** reproduce (EditWeek `ed=false`; SchedBoard
`pv=true` → no controls emitted). Verify; keep the defensive handler guards.
- **Model:** Fable, high — short, focused verification.


*Moved here 2026-09-24 by backlog-archive.mjs. Forward facts: `raptor-port/docs/undo-contract.md`.*

### [XWEEK-UNDO] Cross-week "snap-to-page" undo — FUTURE FEATURE
**Behaviour (owner, 13 Sep 26):** undoing something not on the current page snaps you to
that week and shows what the undo did. Builds on Phase 2's per-week persistent undo.
Future multi-user rules: undo is scoped to the login SESSION (logout clears it), never
affects another user, but others see every change live from the shared DB.
- **Context:** the sync spec §Parked; memory `future-undo-semantics-multiuser`.


*Moved here 2026-09-24 by backlog-archive.mjs. Forward facts: `raptor-port/docs/superpowers/specs/2026-09-20-CURRENT-STATE.md`.*

### [S4-BUGHUNT-MERGED] MERGED to main (PR #422, 21 Sep 26) — 34 commits. Kept for what it SET ASIDE.
**Read `raptor-port/docs/archive/HANDOFF-S4-BUGHUNT.md` (archived 24 Sep 26), then `raptor-port/docs/superpowers/specs/2026-09-20-CURRENT-STATE.md`
and nothing else first.** That spec is the single destination: what is built, what is parked, and the
RULES SET ASIDE today that must not be re-applied — B4's "overlap means no credit", BOTH halves of
B5 (the bid-door refusal AND "publishing replaces an undecided bid"), §26.3's refusal of leave over
recorded work, Q5's skip, H2 used to decide whether a medical and leave clash at all, and the August
rules about posted-out and pre-joining rows. Several older documents still read as live and are not.
- **Twenty fixes built and green.** The five items that were left to build are DONE, plus a sixth
  the owner asked for in the same breath (a Post in date — the app had no joining date at all
  before), plus two more from questions the hand test raised and he answered: an admin can now
  RECORD that someone worked (FO/HO with reason, who said so and hours, **on any day** — his
  ruling), and can place leave or OIL on a day outside someone's posting dates. **Three parked**
  with their reasons, **one closed** as not a defect.
- **The owner's three open questions are ANSWERED** and recorded in CURRENT-STATE §6. One of them
  changed how leave is charged — it does not: he ruled the app was right and the written rule had
  the wrong word.
- **ALL SEVEN GATES RUN** — unit 327/5181, build, tfin 728/0, rulecheck, e2e 447/0, perf 4/0,
  Tracker smoke 425/0 — **and the hand-testing pass in the running app is DONE.** It found one real
  defect (the new hours box was unusable on a phone), now fixed. One test pair is not certified: see
  the handoff's "the one thing NOT certified".
- **`npm run perf` was dead on the Windows desktop** and silently so — it hard-coded the container's
  Chromium path. Fixed to the repo's own fallback. If another probe "fails instantly", suspect this.
- Came out of it and now standing: the behaviour register, `npm run rulecheck`, the rules-first red
  team as a third review, and the CLAUDE.md standing order to sweep the rules and hand-test against
  them on every build.
- **TWO OWNER RULINGS — BUILT 21 Sep 26** (D80/D81, register N13/N14;
  `specs/2026-09-20-NEXT-TASK-oil-award-and-oil-warning.md` is the record): (1) an OIL AWARD stops flagging a leave day (he did
  NOT rule on `duty` — ask), and (2) warn, on the day AND at publish, when a worked weekend earns
  nobody anything because the duty desk has no times. The second came from him testing DASH on SDO
  for Sun 16 Aug and getting no credit.
- **Both things that were to be put to the owner are ANSWERED AND BUILT.** The ruling to carry
  forward: **OIL may be credited by hand on ANY day** — the weekend/public-holiday restriction
  belongs to the AUTOMATIC pass, which reads the published schedule, not to a credit the squadron
  types itself (D79, register N11).


*Moved here 2026-09-24 by backlog-archive.mjs. Forward facts: `raptor-port/docs/superpowers/specs/2026-09-20-one-absence-behaviour-register.md`, `raptor-port/docs/ui-contracts.md`.*

### [LW-OIL-DETAIL] What a credited OIL day says when you click it (owner, 20–21 Sep 26)
Clicking an FO or HO shows, at the bottom of the day window: the **reason**, **given by**, and **days
granted**. Both kinds, one shape:
- **An award** (hand-typed) — all three editable, as the OIL tracker already allows.
- **OIL the app credited itself** — the same three lines, filled in: the reason in the words the
  engine already computes (`Duty`, `FLT`, `SIM`, `FLT + SIM`), the giver **"Weekend/PH"**, or
  **"Duty input"** where the credit came from an accepted duty-and-commitments input rather than a
  weekend. Automatic credits must also appear **in the OIL tracker like every other credit**.


*Moved here 2026-09-24 by backlog-archive.mjs. Forward facts: `DECISIONS-ARCHIVE.md`.*

### [OIL-NEXT-TWO] The two the owner parked until after the bug check (21 Sep 26)
**His words: "We can do point 2 and 3 later after the 3 things above are done."** The three being
the browser gates, the hand test in the running app, and the cross-provider bug check on
[OIL-AWARD-ADD]. So these are queued BEHIND that branch being finished, not forgotten.

1. **[OIL-EARNED-VS-GRANTED]** — below. The recommendation put to him was DO IT, as its own small
   change, because it changes two figures he reads and he should be looking at it deliberately
   rather than finding it inside another job.
2. **His own look at the Vercel preview** — build a Saturday with an award, publish it, and see
   whether 4 reads the way he expects. Nothing merges before that.

**Both belong in a FRESH chat**, agreed with him on 21 Sep: they are new work, and the point to
switch is once [OIL-AWARD-ADD] is green or merged. The handoff note names the branch.


*Moved here 2026-09-24 by backlog-archive.mjs. Forward facts: `raptor-port/docs/superpowers/specs/2026-09-19-sync-integ-guardrails-build-plan.md`.*

### [SYNC-INTEG] Leave War ↔ inputs guardrails (NON-undo part) — small, ready
A read-only cross-provider audit (Codex + Fable, 13 Sep 26) of DELETE/UNDO across the
Leave War ↔ inputs ↔ documents seams found a family of data-integrity + permission
issues. **All decisions, findings and the fix plan are in**
`raptor-port/docs/superpowers/specs/2026-09-13-sync-delete-undo-integrity-spec.md`.
**DECISION 13 Sep 26 (owner):** the whole UNDO/permission half of this — the delete-vs-undo
resurrection, the undo-family bugs, and the member-undoes-admin gap — is NOT patched here;
it is dissolved wholesale by a single **global undo re-architecture → see [GLOBAL-UNDO]**,
done as a step BEFORE the database. Do NOT build interim two-system undo patches (they'd be
thrown away). Rationale: pre-promulgation demo data (no live users), and the root cause is
having two separate undo systems over shared data — remove the root, don't patch each face.
- **MEDICAL GUARDRAIL BATCH — BUILT + ALL GATES GREEN, held for "merge live" (19 Sep 26,
  branch `claude/sync-integ-medical-guardrails`).** THREE items built test-first on Opus 4.8:
  (1) **P2 medical member-filed only** — the war blocks medical creation for ALL roles incl admin
  (store write path) and the medical pickers are gone; it still DISPLAYS member-filed medical that
  syncs in; war→Raptor no longer crosses medical; the demo's war-created medical is reset via
  `leavewar` added to the versioned storage reset (SCHEMA_VERSION 2→3) and re-shown as a member-filed
  example. (2) **Relaxed document prompt** — filing a medical with no certificate PROMPTS once
  ([Upload]/[No document]) instead of hard-refusing; "No document" files it with none; the
  replace-don't-strip guard stays (`docGate` + `DocConfirm`, wired into all three editors). (3) **P4
  "Clear old data" is CLUTTER-ONLY** — clears only past pucks + day notes; never an input, a balance,
  a stashed week, or the loaded week; renamed "Clear old clutter"; validates real calendar dates.
  Process: pre-build plan red-teamed by Codex (APPROVED after 1 revise round); post-build code
  inspected by Codex + Fable (Fable: no permission/data-loss holes; all findings folded in). Gates:
  unit 4985/0, build, parity 728/0, e2e, smoke 425/0. **Plan + dispositions:**
  `raptor-port/docs/superpowers/specs/2026-09-19-sync-integ-guardrails-build-plan.md`.
  **SCOPE NOTE (owner's call):** the backlog listed "clear genuinely-empty past weeks" under P4; the
  red-team proved dropping a stashed week can lose a day's amendment history (SYNC-003) or resurrect a
  deliberately-emptied authored week (SYNC-005), so per the guardrail-over-cascade rule the sweep
  drops NO stashed weeks. A narrow safe empty-week drop is a possible later follow-up.
- **STILL OPEN in [SYNC-INTEG] (NOT in this batch):** **P6** a Quals ✕ confirm (a confirmation that
  archiving removes the person's leave; small; superseded by the fresh-recall feature [RECALL]);
  **P7** fix CLAUDE.md's stale "Leave War session-only" line (the 8 Sep storage work persists the LW
  world; already corrected in raptor-port/CLAUDE.md but re-verify the root CLAUDE.md / any stale copy).
- **Urgency:** low (pre-live). Model: Opus build, gates, no merge without "merge live".
- **Context:** the build plan above + the 13 Sep sync spec (findings, dispositions).


*Moved here 2026-09-24 by backlog-archive.mjs. Forward facts: `raptor-port/scripts/docsize.mjs`.*

### [DOCSGUARD-MERGE] The docs guard reads a merged branch's pre-merge history as its own moves (23 Sep 26)
**FIXED 24 Sep 26 on `claude/spring-clean`** (Astra's red team of the spring clean): the inventory no longer
re-audits an item already archived AT THE BASE (`raptor-port/scripts/docsize.mjs`, the comment names this item);
the self-test replays the merge graph, and a control run proved `main`'s gate fails it while the fix passes it and
still catches a real loss on that branch.
`npm run docsize` walks every commit since the base that touched `OUTSTANDING.md`. On a branch that
merged `main` in (D78), that includes the branch's commits from BEFORE the merge, whose copy of an item
`main` later rewrote and archived — so it reports "left OUTSTANDING.md but N lines did not arrive" for
a move that happened, and was checked, on `main` (`[LW-MONTHJUMP-PHONE]` on the Tracker branch). The
Tracker branch records it with the guard's own `Docs-guard-allow:` trailer. **Fix, not done here (a
gate is not edited to pass a change):** skip an item already archived AT THE BASE — its move was
checked on the base's own history. **Place:** before the next branch that merges `main` in.


*Moved here 2026-09-24 by backlog-archive.mjs ([LW-UI-WINDOW]). Forward facts: `raptor-port/docs/superpowers/specs/2026-09-20-one-absence-behaviour-register.md`.*

### [LW-UI-WINDOW] The Leave War input window — Ack, four buttons, every stage (owner, 20–21 Sep 26)
Four asks, given in one sitting while the OIL rulings were being built. A mock-up of all four windows
was shown to the owner and approved before he slept (the only change he asked for: "Duty input", not
"Duty claim", as the giver of OIL credited from an accepted input).
1. **"Pending" becomes "Ack"** — EVERYWHERE the word shows: the decision button, the legend, the
   corner-mark tooltips, the warning list. The button already WRITES `acknowledged`; only the label
   was "Pending" (owner, 27 Aug 26) — so this is a rename, and it **supersedes that 27 Aug naming**
   (`newest-instruction-wins`). Fix the stale text in the same change.
2. **One click on an input gives all four decisions** — Ack, Approve, Refuse, and **Move** with its
   own date box, so a single click can move an input exactly as a drag-select + Move does today.
3. **The same window in EVERY stage** — Open for bidding, Bidding closed, Published. Same size: the
   extra controls are squeezed in, the move date sits beside the decision buttons.
4. **Published behaves as it does today, with the new window's controls.** An input that is approved
   AND published: clicking it lets member and admin write REMARKS, nothing else — to change it, an
   admin goes back to Open for bidding or Bidding closed. An input NOT yet approved on a published
   day stays editable exactly as it is now, with the new buttons (LL / Clear / +OIL / PO / PI and the
   rest).
**Context:** the approved mock-up is in the 21 Sep session; re-draw from this item if it is lost.

## Moved 24 Sep 26 — the old model line, priority list and "In plain terms" block (the spring clean: live items only in the backlog, D141)

**Model guidance (owner's standing rule):** build / voluminous multi-file / lots
of reading → **Opus 4.8, default**; hard-reasoning review, bug-check, verify or a
tricky design call → **Fable 5.1, high**; mechanical / low-risk → a cheaper model.

---

## Priority — logical order (updated 13 Sep 2026)

**NEW backbone (owner, 13 Sep 26): [ARCH-STACK]** — a whole-app architectural review (both
providers) reframed much of the backlog as ONE ordered stack (stable ids → one write/command
layer → global undo → one-Absence-record → storage door/DB → remove quarantine). Owner's rule:
**fix the architecture first, then individual bugs.** `[GLOBAL-UNDO]`, `[INP-CSID]`, `[TRK-CSID]`,
`[CMDL-FINISH]`, `[DB-STEP]` are STEPS of it. STOP: interim two-system undo patches + further
quarantine rounds.

**STACK PROGRESS (updated 18 Sep 26):** step 1 (stable ids) DONE; step 1b quick wins DONE;
**step 2 (the one command/commit layer) DONE + LIVE** — follow-up #1 (routing every scheduler
write, PR #409/#410) AND **`[CMDL-FINISH]`** (finishing the command layer for Leave War + Tracker:
the causal both-side envelope, the per-record write seam, one-envelope-per-Tracker-gesture, guarded
lw/trk stores, `TRK_RESTORING`, `sched.als` re-key, and the cross-provider inspection punch-list)
both merged and live — PR #412 (build) + PR #415 (finish), plus the undo front-door doc #413.
**step 3 (`[GLOBAL-UNDO]`) — PHASE 1 + PHASE 2 BUILT + MERGED LIVE (18 Sep 26).** The one global
undo timeline is live: every Undo/Redo (scheduler/board/Leave War) drives it, plus the Unpublish
button and off-week undo. Built test-first (Opus high), driven in the app, dual-reviewed (Fable +
Codex) and folded in. Two `[CMDL-FINISH]` items were deferred INTO it and remain open (the Leave War
posting-window rebuild on a postouts restore = CMDLF-002; grouping a whole Import as one undo step),
plus the phase-2 review deferrals under the item below. **NEXT = step 4 (one Absence record) / [DB-STEP].**

**NEXT AFTER THE OIL BRANCH MERGES (owner, 22 Sep 26 — D24, D27, D28):**
`[OIL-SEATS-CAN-EARN]` — one change on his principle that every seat can earn, the default decides,
and the admin can override. It sits immediately after `[OIL-AUTO-REMOVE]` goes live and AHEAD of
`[OIL-NEXT-TWO]`, in a FRESH chat, at FULL tier. Kept OFF `claude/oil-auto-remove-design`, which is
at its last gate.

Below is the older item ordering (kept for the non-stack items); land what's **cheap, done, or
in-flight and risk-reducing** first.

1. **[AMEND]** — the main project. Decisions resolved; brief re-frozen & re-reviewed;
   **CORE built + round-3 in progress** on `claude/amendment-engine-core`. **[BUG2]**
   folds in here.
   - **[AMEND-SEL-FOLLOWUPS] — DONE + LIVE (merged 15 Sep 26, PR #405).** Archived — the
     resolution is in `OUTSTANDING-ARCHIVE.md`. The 7 changes (incl. the signature-leak bug, taken the
     per-plan way) were built, cross-provider bug-checked, and merged to `main`.
   - **[REPO-CLEANUP] (owner, 15 Sep 26) — DONE (18 Sep 26). Nothing removed, by owner's choice.**
     Step 1 (delete the handoff screenshots) was done earlier. Step 2, the repo-wide space/
     redundancy sweep, was RUN this session and found the repo already tidy — so do NOT re-run it:
     **zero dead source files** (all 522 checked by an import-graph scan), and only **~0.9 KB** of
     genuinely-dead CSS (every other unused-looking class is built dynamically at runtime, e.g.
     `seat-${seat}`, the `g-*` group family — removing them would break the app). The only real
     weight was **~0.6 MB of design write-ups for already-shipped features**; the owner chose to
     **KEEP them on purpose** — better for history-keeping (a note left in the tree is browsable;
     a git-deleted one is only recoverable if you know it existed). No files removed. Archived 24 Sep 26 —
     the full result is in `OUTSTANDING-ARCHIVE.md`.
1b. **[TRK-SMOKE] — DONE + MERGED LIVE (17 Sep 26, PR #408, squash `93deab7` on `main`).**
   Code-only cherry-pick; the rest of this branch stayed unmerged. It was NOT a flake: two real
   causes. See `OUTSTANDING-ARCHIVE.md` for the
   full diagnosis; in short — (a) the add-student box cleared its field a beat after it
   opened, so a machine-speed fill was wiped and the add silently no-op'd; (b) a failing run
   abandoned its preview server, and on Windows even a passing run did, so the next run
   couldn't bind the port and failed on clean code. Both fixed, cross-provider reviewed
   (Codex + Fable), gates green. The follow-up #1 build can run its per-phase gate set.
1b. **[DOC-TRIM] — NEW, owner 21 Sep 26 (D14), AFTER [OIL-AUTO-REMOVE] merges.**
   A session reads ~4,000 lines before it can work. The ratchet (`npm run docsize`) already
   stops further growth; this is the trim itself. Do it after OIL merges, not before —
   a third of tonight's new lines are that task's scaffolding and become archive the day it
   closes. See the item below.
**TOP OF THE QUEUE (updated 23 Sep 26).** **[OIL-AUTO-REMOVE] AND [OIL-SEATS-CAN-EARN] ARE BOTH
MERGED AND LIVE.**
1) **[ALL-AVAIL-WINDOW]** — **LIVE on `main` (23 Sep 26)**, after his look on Vercel and his "merge live"; no phone
resize corner (D77). Archived 24 Sep 26; the built contract is `raptor-port/docs/ui-contracts.md`
§[ALL-AVAIL-WINDOW]. 2) **[DOCS-GUARD]** LIVE 23 Sep 26 (archived);
nothing left. 3) **[HUMAN-RETEST]** — the Tracker part MERGED 23 Sep 26 (his look done); the amendment system next. 4) **[DOC-TRIM]** — unblocked now that the OIL scaffolding has become
archive. 5) The stack resumes at **[DB-STEP]**.
**Small OIL follow-ups, any time, none blocking:** `[OIL-READ-LEFTOVERS]` (4 items the final reads
raised and the branch deliberately left), `[STORE-READER-SWEEP]`, `[OIL-REQ-NAMEBOX]`,
`[POSTOUT-LOST]`'s remaining half, `[OIL-WORDS]`, and from the window's bug check
`[OIL-PERSONAL-PLACEHOLDER]` and `[CROWD-SIM-BRIEF]` (both further down this file).
`[LW-MONTHJUMP-PHONE]` and `[LW-HBAR-RESYNC]` — FIXED on `claude/lw-monthjump-phone` (PR #428) with the
owner's filmed frozen-bar jump, and archived; MERGED to `main` 23 Sep 26 on his "merge live" (look done). Left from it:
`[LW-FROZEN-BAR-GAP]` (a one-frame blink, further down this file). **Tracker, 23 Sep 26 (night):** his
pinch-zoom report is FIXED and MERGED on his "merge live" (`claude/tracker-pinch-anchor`, walked, gates green);
filed from it `[TRK-PINCH-DRAGS-BALL]` (with his "left side cut off" report — FULL-tier checked and MERGED 24 Sep 26 on D133, archived; left from it `[TRK-PINCH-ASK]`), `[TRK-EDIT-SIDEWAYS]`, `[TRK-TAP-AFTER-DRAG]`. `[CI-TWO-CORES]` — DONE and
archived: the checks run on his PC as a Windows service, its folder permissions tightened.

**STALE ABOVE, CORRECTED 22 Sep 26:** the "STACK PROGRESS (updated 18 Sep 26)" block says the next
stack item is step 4 (one Absence record). **Step 4 SHIPPED on 20 Sep 26** — `raptor-port/CLAUDE.md`
records it (an absence is ONE record, the Raptor Input; `runInbound`/`runOutbound`/`retractLwRow`/
`ingestFromRaptor` deleted). The stack's real next item is **[DB-STEP]**.
**Open for the owner:** he has not picked whether to do the one cheap `CLAUDE.md` trim (~30 min,
a move not a cut, ~700 lines off EVERY later session) as a warm-up before the scenarios, or to
leave all of [DOC-TRIM] until after the merge. Either is fine; the ratchet already stops growth.

1a. **[HUMAN-RETEST] — NEW, owner 21 Sep 26, HIGH once [OIL-AUTO-REMOVE] is closed.**
   Re-run the hands-on pass over EVERY feature whose "bug test" was really a code review plus
   unit tests. See the item below for the full reasoning — the short version is that the OIL
   build passed two model reviews and 5328 tests, and the owner then found three defects in
   minutes by opening the app, all of them surfaces that were never wired up. Any earlier
   build checked the same way is carrying the same class of defect, unfound.
2. **[SYNC-INTEG]** — now just the small NON-undo guardrails (medical member-filed,
   clutter-only clear-data, Quals ✕ confirm, doc fix). Low urgency (pre-live); cheap batch.
   *The undo/permission half was pulled out into [GLOBAL-UNDO] (owner, 13 Sep 26).*
3. **[EOD]** — the end-of-day feature split out of [AMEND]; design-first follow-on,
   after the core lands.
4. **[OIL]** — depends on [AMEND]; do straight after.
5. ~~**[TRK-CSID]** / **[INP-CSID]**~~ — **DONE + LIVE (13–14 Sep 26), both archived.** Was: the stable-id work (Tracker courses/syllabuses;
   schedule personal inputs); independent, medium, not urgent.
6. **[TRK-ATTEMPTS]** — small new feature, low urgency.
7. **[RECALL]** — future feature (fresh recall from archive); design when reached.
7a. **[CMDL-FINISH] — DONE + LIVE (18 Sep 26, PR #412 build + PR #415 finish).** The one command
   layer is finished for **Leave War + Tracker** (causal both-side envelope, per-record write seam,
   one-envelope-per-Tracker-gesture, guarded lw/trk stores, `TRK_RESTORING`, `sched.als` re-key,
   cross-provider punch-list). DONE + LIVE — archived 24 Sep 26 (`OUTSTANDING-ARCHIVE.md`). Its two deferred items fold
   into `[GLOBAL-UNDO]`.
8. **[GLOBAL-UNDO] — PHASE 1 + PHASE 2 BUILT + MERGED LIVE (18 Sep 26).** The one-global-undo
   re-architecture; absorbs [XWEEK-UNDO] and the whole delete/undo bug family. Live cutover done
   (scheduler/board/Leave War undo + Unpublish + off-week). Deferred review items + the two inherited
   [CMDL-FINISH] deferrals under the item below; the multi-user/per-session refinements land at [DB-STEP].
9. **[DB-STEP]** / **[XFER]** — the future database milestone and multi-squadron
   transfer; **[TRK-DISK]** (Decision A) is fixed inside [DB-STEP].

**NEXT, added 21 Sep 26 — the OIL pair, ahead of the numbered list above.**
**NEXT: a CROSS-PROVIDER BUG CHECK of the OIL build**, then the owner's "merge live". The code was
written on Opus 5, so the check goes to **Fable 5.1 (high)** and **Astra (Codex, high)**, both, and
each finding must come back with exact step-by-step fix instructions. Where to point them, what the
build decided on its own, what the rules walk already found, and the ONE design question still open
(should the green bar show on every puck a man wears, or only on the events that counted towards his
day?) are all in `raptor-port/docs/superpowers/specs/2026-09-21-oil-build-handoff.md`.

*(Done 21 Sep 2026: **[ALL-AVAIL-REDEF]** and **[OIL-AUTO-REMOVE]** — built together on branch
`claude/oil-auto-remove-design`, MERGED 22 Sep 26 (D34); `[ALL-AVAIL-REDEF]` archived 24 Sep 26. The line that stood here
said both "need a Codex red team before anything is written"; that was STALE the day it was
written — Codex red-teamed the design TWICE and reviewing was closed by the owner's own cap, as
§9 of the decisions doc records. Corrected in the build's PR. What the build had to obey, and the
two rule clashes it found, are in
`raptor-port/docs/superpowers/specs/2026-09-21-oil-behaviour-register.md`.)*

*(Done 12 Sep 2026: **[TRK-IMPORT]** and **[TRK-LEDGER]** — both merged live, now in `OUTSTANDING-ARCHIVE.md`. [TRK-LEDGER]'s one
inherent corner — a record deleted just after migration on a full store can be re-copied — was moved to
`raptor-port/docs/tracker/known-gaps.md` on 22 Sep 26, because the archive is searched and never read.)*

---

## In plain terms (quick read)

One line each, no jargon:

- **[AMEND] — The amendment engine rebuild (the big one).** Each day gets its own
  amendments, published is locked, every change is a new AL, no take-backs. Decisions
  made; now being built, phase by phase. The end-of-day "record actuals" part is split
  off as **[EOD]** to build later.
- **[EOD] — The end-of-day "what actually flew" record.** A quick end-of-day note of
  what really happened (scrubs, changes), with no sign-off. Designed, but it needs its
  own careful round before building — set aside so the main rebuild ships first.
- **[OIL] — Don't wipe off-in-lieu someone already earned.** Removing a person by
  amendment currently erases their weekend/holiday OIL — wrong if they'd already
  worked the day. Lock it once the day's been worked. After the amendment rebuild.
- **[BUG2] — Double-check one suspected bug.** A reopen button might act on the wrong
  version while you're viewing history — Astra thinks it may not actually happen.
  Quick check, folded into the amendment work.
- **[SYNC-INTEG] — Small safety guardrails for leave.** Medical can only be filed by the
  member (not created on the Leave War); the "clear old data" button only clears clutter and
  never touches leave/balances; a warning on the Quals ✕; a doc fix. (The bigger delete/undo
  fixes moved to [GLOBAL-UNDO].) Low urgency — we're not live yet.
- **[CMDL-FINISH] — Finish the shared foundation for Leave War + Tracker. DONE + LIVE 18 Sep 26 (archived).**
  The "command layer" (the app's one proper doorway for changes) was finished for the main schedule
  but only half-done for Leave War and the Tracker — some of it was quietly left for later. Global
  undo can't be built safely until it's finished. Found by red-teaming the undo design on paper
  before building. This is the next build; global undo comes right after.
- **[GLOBAL-UNDO] — One undo for the whole app, before the database step.** Today each
  section has its own separate undo, and that's the root of the weird delete/undo bugs. One
  shared undo (per login session, never touching another user) removes that whole class of
  bugs instead of patching each. A step to do before going live / before the database.
- **[RECALL] — Bring a posted-out person back, fresh.** When someone leaves the whole app
  and returns, they come back with new quals and new leave balances (past kept as record) —
  not their old ones. Future feature.
- **[XWEEK-UNDO] — Undo across weeks (part of [GLOBAL-UNDO]).** If you undo something on a
  week you're not viewing, the app takes you to that week and shows what changed. Built as
  part of the one-global-undo step.
- **[XFER] — Move a person to another squadron, data intact.** In the multi-squadron future,
  transferring someone carries all their data across (unlike leaving the system, which resets).
- **[INP-CSID] — Give leave/personal inputs a permanent hidden tag. DONE 13 Sep 26 (archived).** Like schedule rows and
  students already have, so two look-alike entries can't cross when one is deleted.
- **[TRK-CSID] — Give courses and syllabuses a permanent hidden tag. DONE + LIVE 13–14 Sep 26 (archived).** Students and
  schedule rows already have one (so they survive being moved or renamed); courses
  and syllabuses don't yet, so renaming one is riskier. Medium job, not urgent.
- **[TRK-ATTEMPTS] — Remember a student's earlier attempts.** Today only the latest
  grade is kept; this would keep the earlier tries too. Small new feature.
- **[TRK-DISK] — A rare "nearly-full storage" data-loss gap.** On upgrades or renames
  the app trusts its own memory instead of confirming the save really reached storage
  before deleting the original. Rare, mostly self-heals. Best fixed with the database
  step.
- **[DB-STEP] — The big future move to a shared database.** Today everything saves
  only in your own browser — nothing is shared across people or devices. This is the
  large future project (Dataverse) that several parked items fold into.

## Moved 24 Sep 26 — [HUMAN-RETEST]'s chat-scheduling lines (D153, D154, D155, D135, D125 — every one spent and archived)

**D153 (23 Sep 26): the TRACKER chat starts NOW, on its own worktree from `main`, beside the Leave War
fix on `claude/lw-monthjump-phone`** — which still merges FIRST. Tracker chat: preview 4180, e2e
`E2E_PORT=4182`, smoke `SMOKE_PORT=4181`, rulings from D120; never a full gate run while the Leave War
chat or the PC runner (`gh run list`) is mid-run. **D154: a third chat builds a presentation to
commanders and a demo video** on its own worktree (preview 4185, rulings from D170); D58 holds for the
deck/video. **D155: the Tracker chat is PAUSED** at its own handoff — the demo video first (the Leave War
fixes are live on `main`); it resumes on his word, bringing `main` in first (D78).
**D135 (24 Sep 26): the demo is DONE** — the PC is no longer shared with it; D86's one-full-run-at-a-time stands.
**D125 (23 Sep 26): the Tracker chat RESUMES** beside the demo chat, on `claude/tracker-human-retest-8d3411`
(`main` merged in) — the demo has first call on the PC: heavy runs one at a time, only on a quiet PC, and the
Tracker pauses at its next clean point if the demo slows.

*Moved here 2026-09-24 by backlog-archive.mjs ([DOC-TRIM]). Forward facts: `raptor-port/docs/doc-budget.md`, `.claude/rules/doc-structure.md`, `raptor-port/scripts/docsize.mjs`, `raptor-port/docs/superpowers/specs/2026-09-24-spring-clean-plan.md`.*

### [DOC-TRIM] The repo is too heavy to read (owner, 21 Sep 26 — D14)
**CLOSED 24 Sep 26 — the spring clean is built on `claude/spring-clean`, checked, and offered for his "merge live".**
A fresh chat reads ~58k tokens before it starts work, not ~118k (the spring clean's measure). `raptor-port/CLAUDE.md`
keeps what every task needs; each area's settled decisions and architecture moved whole to its file under
`.claude/rules/decisions/`, which loads by itself; `HANDOFF.md` is the one handoff, current state only; this file holds
live items only; how a change ships and where each new fact goes are always loaded (`.claude/rules/shipping.md`,
`.claude/rules/doc-structure.md`). Both meaning checks (D138) done, by Fable and Astra, every finding fixed; the
session-handoff skill change approved (D145); the old worktrees are gone from his PC. **Every line figure and target
below is the plan as it was written — WITHDRAWN by D141 (no line targets: is each block needed where it sits?).
History, not a goal.** Nor was `docs/stable-decisions.md` (below) ever made: those decisions went to the area files
(D140). **Its lasting facts live in:** `raptor-port/docs/doc-budget.md` (the policy and tiers),
`.claude/rules/doc-structure.md` (where each fact goes, and when it leaves), `raptor-port/scripts/docsize.mjs` (the
gate and its tripwires), and the plan, red teams and meaning checks,
`raptor-port/docs/superpowers/specs/2026-09-24-spring-clean-*.md`. **Its two leftovers are their own items:**
`[RULINGS-LF-PIN]` and `[DOC-SUBHEADS]`. D139 (spend freely, for this job) is SPENT.
**THE RULINGS AND THE BACKLOG PASS — DONE 24 Sep 26 (D136 + D137; checked by Fable and Astra).** The rulings are split by
area into `.claude/rules/decisions/` — How we work loads in every session, each other area by itself when its files are
read — with `DECISIONS.md` as the map and replaced/spent rulings in `DECISIONS-ARCHIVE.md`; 14 finished items left this
file (1,479 → ~1,200 lines). **Left here:** `raptor-port/CLAUDE.md` 1,543 → 500 and `HANDOFF.md` 983 → 400 (below);
this file → 600 (the priority list and the plain-terms block rewritten to live items only); and pin the new rulings
files' line endings to LF in `.gitattributes`, like `DECISIONS.md` — held back to ride the next code change, because
a `.gitattributes` change alone starts a full check run on his PC.
**THE SPRING CLEAN — measured and planned 24 Sep 26, NEXT (recommended BEFORE the amendment re-test; his word to start).**
**STATUS 24 Sep 26 (night): BUILT on `claude/spring-clean`, pushed, not merged** — what is left is the `claude/spring-clean`
block under `## Now` in `HANDOFF.md`. The numbers below are the plan as written; D141 (no line targets) replaced them.
His ask: every session loads too much; make the repo clear and directed, cut clutter, and a summary must never change
the meaning (**D138**). **Measured:** a session reads ~120k tokens before it works — always loaded ~18k (the rule files
~5k, the general rulings ~11k, the memory index ~2k), `raptor-port/CLAUDE.md` ~29k (loads with any raptor-port file),
`HANDOFF.md` ~46k and this file ~24k (read at start). **Disk:** the folder is 1.5 GB — 934 MB is four OLD worktrees in
`.claude/worktrees/` (all merged into `main`; the one with "224 changes" holds only deleted copies of `.claude` files),
`node_modules` 151 MB (needed; `npm ci` rebuilds it), the evidence pictures 160 MB (`docs/img/handpass`, 1,256 files, in
git), `.git` 178 MB (48 MB unpacked). GitHub's copy is ~125 MB; only a fresh single-commit repo ([REPO-PRIVATE]) shrinks it.
**The plan, in order — MOVE text whole, never reword it (D138):**
1. **Disk, ~5 min, needs his yes:** `git worktree remove` the four old worktrees + `git worktree prune`, delete the three
   ignored `.log` files, `git gc`. Frees ~0.95 GB on his PC; nothing in git changes.
2. **`raptor-port/CLAUDE.md` ~29k → ~8k:** move §Stable decisions (the pre-21-Sep rulings) verbatim into the area rulings
   files as a dated "before this list" section each (the Leave War roster → `leave-war.md`; board, waves, drag, time, week
   navigation, inputs & admin, the late-input mark, performance → `scheduler.md`), and the long Leave War / Tracker
   architecture paragraphs likewise — they then load only when that area is touched. Cross-cutting ones (pipeline & repo
   invariants) stay always-loaded. Raise those files' ceilings with the reason (D136).
3. **`HANDOFF.md` ~46k → ~10k (400 lines):** current state only; resolved stories MOVED to `HANDOFF-ARCHIVE.md`; the deploy
   traps to a tier-2 doc; `[DEPLOY-DOCS]`'s Pages-era text corrected.
4. **This file ~24k → ~12k (600 lines):** the priority list and plain-terms block rewritten to live items only — the old
   block MOVED to the archive whole.
5. **Root tidy:** the closed handoffs (`HANDOFF-OIL-WALK.md`, `HANDOFF-S4-BUGHUNT.md`) and the retired `BUG-TESTING.md` into
   an archive folder, every pointer updated.
6. **Leave the evidence pictures** (sessions never read them; git keeps them anyway; the [REPO-CLEANUP] keep ruling).
7. **Checks:** `docsize` green; **Fable and Astra each given every before/after pair, asked only whether any rule,
   condition, date or reason changed or vanished** (D138). Target ~120k → ~45–50k per session start. ~3–4 h, 1–2 sessions.
   **D139 (24 Sep 26):** for this job, Opus 5.5 and Fable 5.1 may be spent freely on the work and the reviews, Astra
   reviews (about half its allowance left, fine) — never the model that wrote a thing checking it.
**His words: "theres going to be alot of context for the AI to read ... reading so much context
as an AI it starts to hallucinate."** Measured that day: **1,830 lines loaded every session**
whatever the task, plus **2,228 more** at session start. `HANDOFF.md` states its own 550-line
ceiling inside itself and had reached 961.

- **Policy and tiers: `raptor-port/docs/doc-budget.md`. Gate: `npm run docsize`.** Ceilings keep
  declared headroom and move only in a docs-only commit (corrected 23 Sep 26 — the zero-headroom
  ratchet was withdrawn, D29). This item is the reduction, and it is a DOCS-ONLY pass.
- **The one change worth doing FIRST, and on its own** (~30–45 min, compounding on every later
  session): `CLAUDE.md` is 1,539 lines and is loaded every time. Most of that is §Stable
  decisions — historical rulings, which are tier-2 reference, not tier-0 index. Move them to
  `docs/stable-decisions.md` and leave ONE line per topic pointing in. Target ~500 lines.
  Careful work: that section is the project's memory of what must not be relitigated, so move
  it wholesale, verify nothing is dropped, then lower the ceiling — leaving headroom, never to zero.
- **Then:** `HANDOFF.md` 961 → 400 (current state only; the stories belong in commit messages).
  **Its "Open / deferred / queued" section is NOT a backlog** ([DOCS-GUARD] F7, 23 Sep 26): empty
  it into this file item by item — each open thing becomes an item here or a line in a tier-2 doc —
  so there is ONE backlog to guard, not two;
  `OUTSTANDING.md` 1,210 → 600 (done items out, one short block per live item); `ui-contracts.md`
  is 7,095 lines and needs no budget but does need sub-heads so a session can read one section.
- **The writing rule that stops it recurring** is in `doc-budget.md` §2: record the DECISION,
  not the transcript. Quote him only where the exact words are load-bearing; never quote the
  same words in two files; a reason earns its place only if it would change a future decision.
  This does NOT thin the reasoning — that is the plain-language rule and it still holds. It
  stops saying the same thing three times.
- **Move finished items with `node raptor-port/scripts/backlog-archive.mjs <ID> --homes <file>`**,
  never by hand or by a one-off script. (The old "prune on write" is withdrawn — D29 rule 3.)


*Moved here 2026-09-24 by backlog-archive.mjs ([LW-DESKTOP-ZOOM]). Forward facts: `.claude/rules/decisions/leave-war.md`.*

### [LW-DESKTOP-ZOOM] The desktop Leave War grid opens at zoom 1 — his call, one line if he wants it out (moved from HANDOFF.md, 24 Sep 26)

- **OWNER'S CALL — the desktop Leave War grid opens at zoom 1** (6 Sep 26; the
  phone opens one step out because the ask came from the phone). One line in
  `Matrix.tsx` (`zoom` initial state) if he wants the desktop out too.


*Moved here 2026-09-24 by backlog-archive.mjs ([TRK-TAP-AFTER-DRAG]). Forward facts: `.claude/rules/decisions/tracker.md`.*

### [TRK-TAP-AFTER-DRAG] The first tap on a button after dragging or pinching the chart does nothing (23 Sep 26)
**Place:** ask him first — seen only in the test browser's touch emulation, not yet on a real iPhone. Straight
after a one-finger drag or a pinch on the chart, the first tap on − (or the ✎ menu) is lost; the second works.
The finger's down and up both reach the button, but no press follows. Same on the live code before the pinch
fix; a mouse click is fine (F-D in `raptor-port/docs/handpass/2026-09-23-tracker-pinch.md`). If he has
never noticed it on his phone, close it as an emulation quirk.


*Moved here 2026-09-24 by backlog-archive.mjs ([DEMO-AWARD-DATES-ASK]). Forward facts: `.claude/rules/decisions/oil.md`.*

### [DEMO-AWARD-DATES-ASK] Are the demo's two OIL awards meant to fall after the demo week? — ask him once (filed 24 Sep 26)
Put to him by the OIL credit-tags chat (`HANDOFF-NEXT.md`, 24 Sep 26, archived the same day): the demo's awards
for Dash (15 Aug) and Vector (29 Aug) are dated after the schedule's demo week (13–19 Jul) — intended? Demo data
only, wiped before the database (D54), so not a defect under D56; one answer closes it.


*Moved here 2026-09-24 by backlog-archive.mjs ([POSTOUT-LOST]). Forward facts: `.claude/rules/decisions/oil.md`.*

### [POSTOUT-LOST] A posted-out man walks back into the squadron on a reload — **FIXED 22 Sep 26 on `claude/oil-seats-can-earn`** (not merged)

**FIXED, because it caused TWO of the five defects the OIL walk left open** — the day that reopens
asking for an amendment nobody made, and the count chip that says one more man than the war pays.
Measured side by side they are one fault: the issued day froze 27 men behind the placeholder, the
reload gave the live copy 28, and the difference is the man who left in January. The OIL code was
doing exactly what D44/D45 say. Deferring this last session was right on the evidence then and
wrong once the cause was measured. **The fix:** a posting window arriving ON the projected person
is recorded in the store's own posting record, in the body that already lays that record back on
(`leavewar/state/store.ts` `setPeople`) — so a window with no record behind it is a state the store
cannot be left in. Pinned by `src/leavewar/postout-persist.test.ts` (4 new cases, red first);
re-walked by `scripts/handpass/rw-03-pending-and-count.mjs`, four days, all clean. Full story:
`raptor-port/docs/handpass/2026-09-22-oil-seats.md` §6a.

**STILL OPEN, and still this item's:** the seed flies that man in July while the demo posts him out
in January. He is reliably posted out now, so the contradiction is STABLE rather than intermittent.
Demo data, breaks nothing; the dev-phase ruling says clear it rather than migrate. Decide it when
the demo seed is next touched. *The original entry:* the window was written onto the person by the
demo overlay and never saved, so after any reload he was available again — reaching the crew picker,
ALL AVAIL, the manning counts and every rule that asks who is free.

**Context.** `raptor-port/docs/handpass/2026-09-21-oil.md` §9 · the red team's §3 in
`…/specs/2026-09-21-oil-fixplan-redteam-fable.md` · script `scripts/handpass/settle-d4.mjs`.


*Moved here 2026-09-24 by backlog-archive.mjs ([AMEND-EMPTY-SEAT-MARK]). Forward facts: `.claude/rules/decisions/scheduler.md`, `raptor-port/docs/ui-contracts.md`.*

### [AMEND-EMPTY-SEAT-MARK] A man taken off a desk, a programme row or a sim seat leaves no amendment mark anywhere (found 24 Sep 26)
**CLOSED 24 Sep 26 — RULED D91 ("Dont do the man taken off seat"), after he saw the mock-up: no mark is built; the
seat reads empty, the change is counted and listed.** The rule now lives in `raptor-port/docs/ui-contracts.md`
§Amendment marks on screen and the register's AM19.
Found by the amendment re-test's walker W1 (`raptor-port/docs/handpass/parts/2026-09-24-amendment-w1.md` W1-2; roll-call
R3/R5/R7). Register AM19: a pending change is dotted in its AL's colour, an issued one solid. **What a person sees:** on a
published day, take Outlaw off the OPS DESK, Torch off a Common Programme row, Basher off a sim seat — the head counts
each, the Amendments panel lists them, History records them, the AL's diff carries them — but the row itself looks like
a desk that was always empty: "+ ADD" on the week, an empty box on the board, and after publishing nothing on the view
page's issued face either (13 changes, 10 visible marks). An emptied COCKPIT seat is half covered: the week shows the
"AL1" badge once published, but not while pending, and the board never marks it. **Why not fixed in the re-test:** an
emptied list seat is not drawn at all (`raptor-port/src/ui/html.ts` `lSeat`, `raptor-port/src/ui/board-html.ts` `sbSeat`;
the board's empty cockpit seat `sbSlot`), so there is nothing to carry the mark — it needs a LOOK for "somebody was
taken off here", on three surfaces, one of them (the view week) held byte-identical to the original app by the
reference gate. **Mock-up** (24 Sep 26, his ask): `raptor-port/docs/mock/amend-seat-marks.html`, also a private page
(https://claude.ai/artifact/H3GvtWrSdGM7u6NRLkXAhk); its maker `raptor-port/scripts/handpass/am/mk-seat-marks.mjs` holds
the proposal's CSS. **Waiting for his three picks:** the ghost (recommended) or Option B; how long it stays; the mark on
the seat. **To do:** then build it FULL tier (the issued face is a published record). **Place:** after the re-test merges.


*Moved here 2026-09-25 by backlog-archive.mjs ([AMEND-REISSUE-DOOR]). Forward facts: `.claude/rules/decisions/scheduler.md`.*

### [AMEND-REISSUE-DOOR] An Unpublish made by mistake, with nothing to correct, cannot be put back once Undo is gone — a question for him (24 Sep 26)
**CLOSED 25 Sep 26 — RULED D101: no Reissue button; Publish AL1 is the way back (walked). Nothing to build.**
**25 Sep 26 — WALKED, and the finding does not hold.** His question ("if i unpublish and change something and
republish, will i still see reissue AL1 button?") was first answered wrongly by the agent ("Unpublish puts the
working copy back to the version before") — corrected to him the same hour. In the app (scratch walks, the build on
:4173): Monday at AL1 → Unpublish → ORIG, "2 pending", "Publish AL1" (locked until signed) → sign → "Publish AL1 — 2
changes"; and Fable's own case, a weekend AL1 adding a man who earns OIL (Wisp onto Saturday's OPS DESK) → Unpublish
("Withdraw — confirm") → ORIG, "1 pending", Wisp still on the desk, "Publish AL1" offered. Unpublish keeps the
withdrawn AL's changes on the working copy as pending (`unpublishDay`, AM37c), so the ordinary Publish AL1 is the way
back, after a sign-out too. Recommended to him: drop the Reissue button; waiting on his word to close. Pictured for him
(his ask, 25 Sep 26): `raptor-port/docs/mock/amend-answers.html` §Question 6, maker `raptor-port/scripts/handpass/am/mk-unpublish.mjs`.
Found by the amendment re-test's final code read (Fable #4, `raptor-port/docs/handpass/2026-09-24-amendment-fable-final-read.md`).
Unpublish is one tap on a weekday (two where OIL is bid against) and a standing action — it survives a sign-out; Undo
does not. The engine allows the pulled-back day to go out again under the SAME label even when nothing changed (the
"correcting" flag, GU5-001), but no screen offers it: by AM15 the publish button stays hidden when there is nothing to
publish, so after a sign-out the only way to get AL1 back is to change something and publish that — and on a weekend
the men's OIL stays withdrawn until then (D142). **The question:** should a day pulled back by Unpublish, with
nothing changed, show a "Reissue AL1" button (the week head and the Amendments panel)? **The agent's recommendation:**
yes — it is the undo of an Unpublish that outlives the session, and AM15's reason (no button with nothing to publish)
does not reach a day whose issued version was just withdrawn. Kept as built (AM15) until he answers; the look card's
step 3 describes today's behaviour. **Where:** `raptor-port/src/ui/html.ts` `dayStatHTML`; `raptor-port/src/engine/publish.ts`
`pendingPublishDays`. **Place:** waiting on him.


*Moved here 2026-09-25 by backlog-archive.mjs ([AMEND-D45-FILING]). Forward facts: `.claude/rules/decisions/scheduler.md`.*

### [AMEND-D45-FILING] Does D45 also cover a leave landing on a published day? — a question for him (24 Sep 26)
**CLOSED 25 Sep 26 — RULED D103: any pending change wipes the sign-offs, so a leave landing on a published day keeps
wiping them (as built). The build of D103 lives in `[PENDING-SUMMARY]`.**
**25 Sep 26 — he asked first what breaks a published day's signature and what is live on a published day; answered in
chat from `currentBind`/`signBoundOk`/`signRoleOk` (`raptor-port/src/engine/publish.ts`).** The question stands.
Found by the amendment re-test's rules sweep (`raptor-port/docs/superpowers/specs/2026-09-24-amendment-behaviour-register.md`
§Q3). Two of his rulings overlap and the newer does not clearly cover the case (D90's limit), so it is asked, not
guessed. **D45 (22 Sep 26):** *"a change in who was available never invalidates a signature — the pending mark is
the whole mechanism"* — given about the crowd behind an ALL / ALL AVAIL puck. **PSF-001 (15 Sep 26, his "close it
now"):** an input accepted onto a published day, or filed under Unavailable (a leave, a course), DOES clear the
day's sign-offs, like any content change — so the working copy must be re-signed before its next amendment goes
out. **The question, in his words' terms:** when a man's leave lands on a day already published, should the
sign-offs for the next amendment be wiped (as today), or stay, with only the pending mark showing? **Kept as built
until he answers** (the leave clears the sign-offs). Either answer is small to build: the signature's filing check
(`raptor-port/src/engine/publish.ts` `currentBind` → `filingKey`). **Place:** waiting on him; ask with the
amendment re-test's look card.


*Moved here 2026-09-25 by backlog-archive.mjs ([AMEND-MARK-RING-CLASH]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/engine-rules.md`, `raptor-port/docs/handpass/2026-09-25-amendment-batch.md`.*

### [AMEND-MARK-RING-CLASH] On the edit surfaces an amendment mark on a puck hides its dashed or dotted warning ring (found 24 Sep 26)
Found by the amendment re-test's final code read (Fable #3). The edit week's and the board's AL-coloured mark for a
pending puck (`#eWeek .seat[data-aln] .puck`, `#schedBoard …`, `raptor-port/src/ui/scheduler.css`) is an outline on the
puck, and so are the sanctioned-late (dashed) and crew-rest trace (dotted) rings — the mark out-ranks them, so a
scheduler editing a published day does not see those two rings on a man whose seat has an unpublished change. The same
clash on the VIEW page was fixed in the re-test (its neutral hint moved onto the seat around the puck); the edit
surfaces' mark is an established look (`raptor-port/docs/ui-contracts.md` §Amendment marks), so moving it is a visual
change to show him first. **Examples shown 24 Sep 26, at his ask** — `raptor-port/docs/mock/amend-seat-marks.html`, three
situations the app itself produced (a swap, a late show, an everyday change), its maker
`raptor-port/scripts/handpass/am/mk-seat-marks.mjs` (the CSS as `B_CSS`, in `mk-seat-marks-lib.mjs`), and — at his second
ask — a busy Monday with AL1–AL3 out and AL4 waiting (`mk-seat-marks-busy.mjs`). **The fix is now D92 (his, 24 Sep 26) — design C:** a
changed puck is marked by its ALn tag only, never a ring — solid once out (today's tag), hollow and dotted while waiting
— so a puck's edge carries only warnings; the published ring `.seat[data-alc] .puck` and the waiting outline
`#eWeek/#schedBoard .seat[data-aln] .puck` go, a hollow `.seat[data-aln]::after` tag comes in (`C_CSS`); times, areas and
remarks keep their marks. **Why, measured:** the published ring covers the thin amber (advisory), grey (note) and thin red
`.warn` rings today (Tally at AL3 in the busy day), and the waiting outline's `box-shadow:none` wipes them too. Design B
(the waiting outline kept except where a ring competes) was superseded by D92 the same day. It reaches View-only Sched
(the squadron's published face), so the bug-check order sets the tier at build. **Design A** (the
first mock-up: the mark moved onto the seat) was dropped on measurement — a seat is exactly its puck's 74×15 box and a
crew pair sits 3px apart, so at real size (DPR 1) the mark and a dotted ring sit half a pixel apart and blur into one,
and any larger offset runs into the next puck. The view page's neutral hint, moved onto the seat by the re-test, has
A's geometry: check it where it can meet a ring when B is built. **Design APPROVED 24 Sep 26 (D93, "the fix looks good").** **To do:** build D92 on every surface that
draws a changed puck, with a geometry pin (e2e) that every ring's stroke survives a published and a waiting change. **Place:** next, on
his word (the mock-up's other half, a mark for an emptied seat, was declined — D91).
**CLOSED 25 Sep 26 — BUILT overnight on `claude/amendment-batch` (the batch's item 1, D112), walked on the production build and read blind by Fable and Astra; the record is the evidence sheet `raptor-port/docs/handpass/2026-09-25-amendment-batch.md`, the contracts `raptor-port/docs/ui-contracts.md` and `raptor-port/docs/engine-rules.md`. Live only on his "merge live".**


*Moved here 2026-09-25 by backlog-archive.mjs ([BOARD-RING-STROKES]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/engine-rules.md`, `raptor-port/docs/handpass/2026-09-25-amendment-batch.md`.*

### [BOARD-RING-STROKES] The board draws every warning ring solid: no dashed late show, no dotted crew-rest cause (found 24 Sep 26)
**DECIDED 25 Sep 26 — D94 ("1. yes"): the board draws all three rings as the week does; build it with the D92 batch.**
Found while making the examples for [AMEND-MARK-RING-CLASH] (the mock-up's "Also found"). **What a person sees:** on the edit
week a crew-rest breach sanctioned by a LATE SHOW remark rings DASHED, and the day that causes tomorrow's breach rings
DOTTED — `raptor-port/docs/ui-contracts.md` §Three crew-rest rings, "on every puck of that man on the causing day". On
the scheduler board the same man rings SOLID for the sanctioned breach and carries no ring at all on the causing day.
**Why:** the board's seat builders call `puck()` with `dash=false, trace=null` (`raptor-port/src/ui/board-html.ts`), so
the two strokes never reach it; no comment, contract line or ruling found says that is deliberate. **Recommendation, put
to him on the mock-up page:** make the board match the week (pass the day's dash and trace as the week's builder does;
the geometry gate already measures the rings). LOOK tier. **Place:** after [AMEND-MARK-RING-CLASH]; waiting on his word.
**CLOSED 25 Sep 26 — BUILT overnight on `claude/amendment-batch` (the batch's item 2, D112), walked on the production build and read blind by Fable and Astra; the record is the evidence sheet `raptor-port/docs/handpass/2026-09-25-amendment-batch.md`, the contracts `raptor-port/docs/ui-contracts.md` and `raptor-port/docs/engine-rules.md`. Live only on his "merge live".**


*Moved here 2026-09-25 by backlog-archive.mjs ([AMEND-PHONE-APPROVER]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/engine-rules.md`, `raptor-port/docs/handpass/2026-09-25-amendment-batch.md`.*

### [AMEND-PHONE-APPROVER] On a phone, who approved each amendment is shown nowhere — a question for him (24 Sep 26)
**DECIDED 25 Sep 26 — D102: the slim "Signed ALn" line (A) on View-only Sched, the board AND the edit week; B not taken.
To build with the D92 batch, including keeping the Original's signers.**
**Mock-up (25 Sep 26, his ask):** `raptor-port/docs/mock/amend-answers.html` §Question 3 (maker
`raptor-port/scripts/handpass/am/mk-view-signers.mjs`): A — one slim "Signed ALn" line under the day head on View-only
Sched (roles on desktop, names only on a phone); B — the ⓘ panel lists every version with its four signers. Asked: A+B
(recommended) or B only. **Build gap found:** an AL record keeps its signers (`SCHED.als[].sign`), the Original does
not — `setDayApproved` clears the sign-offs without keeping them (`raptor-port/src/engine/publish.ts`); the build stores
them on `SCHED.orig[di]`.
**ANSWERED 25 Sep 26 — D95, wider than asked:** View-only Sched shows who signed off each published version (the
original and every amendment), for everyone who reads it, compactly; a mock-up first, at his ask. The recommendation
below (the approver alone, in the ⓘ panel) is superseded by it.
Found by the amendment re-test's roll-call (`raptor-port/docs/handpass/2026-09-24-amendment.md` §4, R10; Fable 5-4).
The desktop's Amendments panel lists every issued amendment with its day, its item count and who APPROVED it (the
four signers in its tooltip) and the "N days with changes to publish" summary. On a phone (≤ 820px) that panel is
hidden on purpose (`raptor-port/src/ui/scheduler.css`, `@media (max-width:820px){.alpanel{display:none}}`); the
phone still has each day's own "N pending" and Publish AL button, and the ⓘ day panel lists the day's amendments
("AL1 · 1 item") — but without who approved them. **No ruling covers it either way.** **The question:** should the
phone show who approved each amendment? **The agent's recommendation:** yes, cheaply — add "approved by <callsign>"
to each amendment line in the ⓘ day panel (`dayInfoHTML`, `raptor-port/src/ui/html.ts`), which serves both widths;
keep the full panel desktop-only. One thing for him to weigh: the ⓘ panel is also open to members on View-only
Sched, so they would see the approver's callsign too (the desktop panel is the scheduler's page only). **Place:**
waiting on him; small once answered.
**CLOSED 25 Sep 26 — BUILT overnight on `claude/amendment-batch` (the batch's item 3, D112), walked on the production build and read blind by Fable and Astra; the record is the evidence sheet `raptor-port/docs/handpass/2026-09-25-amendment-batch.md`, the contracts `raptor-port/docs/ui-contracts.md` and `raptor-port/docs/engine-rules.md`. Live only on his "merge live".**


*Moved here 2026-09-25 by backlog-archive.mjs ([AMEND-TEMPLATE-PUBLISHED]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/engine-rules.md`, `raptor-port/docs/handpass/2026-09-25-amendment-batch.md`.*

### [AMEND-TEMPLATE-PUBLISHED] A day template applied to a published day — a question for him (24 Sep 26)
**DECIDED 25 Sep 26 — D96 ("4 refuse"): refused on a published day, with the reason on screen; build it with the D92
batch.**
Found by the amendment re-test's walker W2 (`raptor-port/docs/handpass/parts/2026-09-24-amendment-w2.md` W2-F2). Applying a
day template to a published day rebuilds the day from the template's rows, and a template row is always a NEW row (a
copy strips its identity — `raptor-port/src/engine/daytpl.ts`), so: (1) saving Tuesday as a template and applying it
straight back reads **"31 changes · 15 removals"** for a day identical to what was issued — publishing that AL would
claim every row was removed and re-added (AM20, AM23: a mark means "differs from what was issued"); (2) the day's
ACCEPTED inputs (a Fly-with, a Meeting, an Appointment) are taken off the programme, because the template's rows carry
no link to them — members' accepted requests quietly leave the day. **The question:** on a published day, should
applying a template (a) be refused, (b) keep every row that matches what was issued and every accepted input, counting
only real differences, or (c) stay as it is (the day is rebuilt, and the amendment says so)? **The agent's
recommendation:** (b) — it keeps the amendment true and the members' requests on the programme; (a) is the cheap safe
answer if templates on a published day are rare. Undo puts the day back today, so nothing is lost by waiting.
**Place:** waiting on him.
**CLOSED 25 Sep 26 — BUILT overnight on `claude/amendment-batch` (the batch's item 4, D112), walked on the production build and read blind by Fable and Astra; the record is the evidence sheet `raptor-port/docs/handpass/2026-09-25-amendment-batch.md`, the contracts `raptor-port/docs/ui-contracts.md` and `raptor-port/docs/engine-rules.md`. Live only on his "merge live".**


*Moved here 2026-09-25 by backlog-archive.mjs ([AMEND-NYS-WORDING]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/engine-rules.md`, `raptor-port/docs/handpass/2026-09-25-amendment-batch.md`.*

### [AMEND-NYS-WORDING] "Not yet signed" beside four valid sign-offs — a wording question for him (24 Sep 26)
**DECIDED 25 Sep 26 — D97 ("5 ok"): two states, "Not yet signed" / "Not yet published"; build with the D92 batch.**
**25 Sep 26 — found while answering him:** the marker never looks at the sign-offs (`notYetSigned` = published AND
`dayHasChanges`), so it reads "Not yet signed" in the ORDINARY flow too — change, all four sign, not yet published.
Recommendation put to him: two states — "Not yet signed" while any of the four is missing, "Not yet published" once
all four are valid. Waiting on his word.
Found by the amendment re-test's walker W4 (`raptor-port/docs/handpass/parts/2026-09-24-amendment-w4.md` §3.5, P6). His
D45 (22 Sep 26) keeps the sign-offs valid when only who-is-available changes (a leave for a man behind an ALL AVAIL puck):
the day then shows "1 pending", four green sign-offs, an open "Publish AL1" — and, beside the tag, **"Not yet signed"**
(AM24, 16 Sep 26: the marker shows whenever a published day has unpublished changes). It is the rule working, but it
reads as a contradiction. **The question:** should the marker then read something else ("Not yet published"), or hide
while the sign-offs cover the change? **Kept as built until he answers.** Small either way (`nysMarkHTML`,
`raptor-port/src/ui/html.ts`; `notYetSigned`, `raptor-port/src/engine/publish.ts`). **Place:** waiting on him; ask
with the amendment re-test's look card.
**CLOSED 25 Sep 26 — BUILT overnight on `claude/amendment-batch` (the batch's item 5, D112), walked on the production build and read blind by Fable and Astra; the record is the evidence sheet `raptor-port/docs/handpass/2026-09-25-amendment-batch.md`, the contracts `raptor-port/docs/ui-contracts.md` and `raptor-port/docs/engine-rules.md`. Live only on his "merge live".**


*Moved here 2026-09-25 by backlog-archive.mjs ([AMEND-LOAD-FILING]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/engine-rules.md`, `raptor-port/docs/handpass/2026-09-25-amendment-batch.md`.*

### [AMEND-LOAD-FILING] Should "Load onto working copy" also put back an input the scheduler had taken off? — a question for him (24 Sep 26)
**DECIDED 25 Sep 26 — D98 (his AM20 principle: back to what was published = nothing pending): the load puts the request
back too; build with the D92 batch.**
**Example shown (25 Sep 26, his ask "can u explain with examples or mock ups?"):** `raptor-port/docs/mock/amend-answers.html`
§Question 7 (maker `raptor-port/scripts/handpass/am/mk-load-input.mjs`) — the real flow, three steps; waiting on his word.
Found by the amendment re-test (walker W4, F3: `raptor-port/docs/handpass/parts/2026-09-24-amendment-w4.md`; the final
read, Fable #2). **Today, by design** (`raptor-port/src/engine/publish.ts` `dayDiscardCount`, P2-REREVIEW-08): a load
puts back the version's CONTENT and leaves every input's filing as it is. So: take an input off a published day (its
row goes, the input reads "removed"), then Load AL1 — the row comes back from AL1, but the input still reads
"removed", and the day shows "1 pending · 1 input filing" against the very version just loaded. Its "→ Ground" used
to do nothing at all; since the re-test it says the input is already on the programme. The way back today, read from the code (not walked): delete that ground row, then Accept the input — it should re-land as the issued row, and the day read as issued. **The question:** should a load
also put such an input back on (the day then matches the loaded version exactly), or leave it removed AND leave its
row off? **The agent's recommendation:** put it back on, as the version recorded it — "Load AL1" then means the day
as AL1 was — and count it in the load's confirm ("N edits replaced"). **Careful when building:** the first attempt did
it inside the general filing reconcile and, as Fable's read showed, a plan switched away and back then turned a
deliberate removal into a fresh input that flags; do it in the load alone, from the version's own filing record
(`snap.fil`). **Place:** waiting on him.
**CLOSED 25 Sep 26 — BUILT overnight on `claude/amendment-batch` (the batch's item 6, D112), walked on the production build and read blind by Fable and Astra; the record is the evidence sheet `raptor-port/docs/handpass/2026-09-25-amendment-batch.md`, the contracts `raptor-port/docs/ui-contracts.md` and `raptor-port/docs/engine-rules.md`. Live only on his "merge live".**

*Moved here 2026-09-25 by backlog-archive.mjs ([PENDING-SUMMARY]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/engine-rules.md`, `raptor-port/docs/handpass/2026-09-25-amendment-batch.md`.*

### [PENDING-SUMMARY] Tap "N pending" to see what changed, by whom and when — his idea (25 Sep 26), waiting on his word
**ALL FOUR PARTS DECIDED 25 Sep 26:** (1) D103 any pending change wipes the sign-offs; (2) D99 + D100 the tappable,
scrolling list that jumps to each change (mock-up approved); (3) D104 callsigns wait for the database; (4) D105 the bubble
stays, hover or tap, scrolling when long. To build with the D92 batch — FULL tier (sign-offs, published records).
**Part (2) DECIDED 25 Sep 26 — D99: "N pending" is a button listing the day's waiting changes; tapping one takes the
view to it. Parts (1), (3), (4) still his; mock-up first.**
**APPROVED 25 Sep 26 — D100 ("looks good and function"); a long list scrolls inside the window.** **Mock-up (25 Sep 26):** `raptor-port/docs/mock/pending-list.html` (maker `raptor-port/scripts/handpass/am/mk-pending-list.mjs`)
— "N pending ▾" opens the net list (where, before → after, who, when; "earlier" where the record is gone), a tap jumps.
Part (3), asked 25 Sep 26 whether tracking by "View as" is worth it before the database: the agent recommended not.
His words: *"why dont we just wipe the sign offs for any changes to the schedule? And any type of change to that schedule
will show a pending. And the scheduler can click on pending and see a summary of what changed. by who & time. Would this
be like the edit history function? (except that im thinking of changing to seeing who the member callsign is instead of
just admin or member account, but if we just merge it into pending does it make sense? is it the same thing? And it
should also have the function that if i enable something i can still mouse over the portion of the schedule and see the
bubble popup"* … *"or click"*. **Four parts:** (1) every pending change wipes the sign-offs — this would replace D45's
signature half (today a change in who is behind ALL / ALL AVAIL, an edited request's times, or a Quals/posting change
shows pending but keeps the signatures); D45's freeze half stays; (2) tapping "N pending" opens the day's waiting changes
with who made each and when; (3) the author shown as the person's callsign, not the shared admin/member account; (4) the
History mode's bubble kept — hover on a desktop, tap on a phone. **The agent's answers, given in chat:** yes to all four
as one design; pending (the NET difference from what is published — change a time and back and nothing is pending) and
Edit history (every edit, in order) share one record, so the summary lists the net changes, each with its last author
and time from the history, and Edit history stays the full story. **Two limits to build around:** the edit log is kept
only while the page is open (by design until the database — `raptor-port/CLAUDE.md` §What actually persists), so
who/when is missing for changes made before a reload, except members' requests, which carry who filed them; and one
shared login per role means the app cannot know the person — the "View as" person can stand in until each person has
a login at the database step. **To do:** his word on each part, a mock-up first (the house rule for a visual
direction), then build with the amendment batch; parts (1) and (2) touch published records and sign-offs — FULL tier.
**Place:** before [AMEND-MARK-RING-CLASH]'s build, since both reshape the same day head and marks.
**CLOSED 25 Sep 26 — BUILT overnight on `claude/amendment-batch` (the batch's item 7–10, D112), walked on the production build and read blind by Fable and Astra; the record is the evidence sheet `raptor-port/docs/handpass/2026-09-25-amendment-batch.md`, the contracts `raptor-port/docs/ui-contracts.md` and `raptor-port/docs/engine-rules.md`. Live only on his "merge live".**


*Moved here 2026-09-25 by backlog-archive.mjs ([BOARD-KEYBOARD-GAP]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/engine-rules.md`, `raptor-port/docs/handpass/2026-09-25-amendment-batch.md`.*

### [BOARD-KEYBOARD-GAP] On a phone, typing on the board lets the schedule behind show above the keyboard (found 25 Sep 26)
Reported by him from the live app on his iPhone: *"when I click on the history button and I try to type on a text area as
shown, as the keyboard shows, u can see a small area of the edit or view only schedule behind the scheduler board."*
Picture: `raptor-port/docs/img/bugs/2026-09-25-board-keyboard-gap.png` — a Common Programme item name being typed on the
board; between the board and the keyboard a strip of the week behind shows (a 14:45–15:30 row with Wildcard). **Likely
cause, read from the code, not tried:** the board is `position:fixed; inset:0` (`raptor-port/src/ui/scheduler.css`
`.schedboard`), sized to the page, while the phone keyboard shrinks and pans the VISIBLE area, so the page behind can
scroll into the gap; other panels already follow the visible area (`window.visualViewport` in
`raptor-port/src/leavewar/ui/Sheet.tsx`, `raptor-port/src/ui/histbubble.ts`). **His mention of the History button:**
unclear whether History mode has to be on — reproduce both ways. **To do:** reproduce at phone size with the keyboard up
(or a shrunken visual viewport); make nothing behind the board ever show (hold the page behind still while the board is
open, or size the board to the visible area). LOOK tier, phone only. **Place:** with the board items; small.
**CLOSED 25 Sep 26 — BUILT overnight on `claude/amendment-batch` (the batch's item 11, D112), walked on the production build and read blind by Fable and Astra; the record is the evidence sheet `raptor-port/docs/handpass/2026-09-25-amendment-batch.md`, the contracts `raptor-port/docs/ui-contracts.md` and `raptor-port/docs/engine-rules.md`. Live only on his "merge live".**


*Moved here 2026-09-25 by backlog-archive.mjs ([HIST-JUMP-STAYS]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/engine-rules.md`, `raptor-port/docs/handpass/2026-09-25-amendment-batch.md`.*

### [HIST-JUMP-STAYS] A tap on a change in Edit history keeps him on Edit Schedule (D107, 25 Sep 26)
Found in his five-minute look at PR #434 and reproduced the same night: on Edit Schedule, Edit history → tap a change
opens the scheduler board on that day with the bubble pinned (the list's jump was built for the board on 11 Aug 26; the
Edit history button added to Edit Schedule's top bar on 23 Aug 26 reused it). On `main` too. **His ruling (D107):** stay
on the page you are on — take the view to the change on the week and mark it; on the board, today's jump stays.
**Build with the amendment batch** (item 12 of `raptor-port/docs/superpowers/specs/2026-09-25-amendment-batch.md`),
as ONE "take me to this change" shared with the pending list's tap (item 8). WALK tier inside the batch's FULL.
**CLOSED 25 Sep 26 — BUILT overnight on `claude/amendment-batch` (the batch's item 12, D112), walked on the production build and read blind by Fable and Astra; the record is the evidence sheet `raptor-port/docs/handpass/2026-09-25-amendment-batch.md`, the contracts `raptor-port/docs/ui-contracts.md` and `raptor-port/docs/engine-rules.md`. Live only on his "merge live".**


*Moved here 2026-09-25 by backlog-archive.mjs ([ORIG-TAG-STANDOUT]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/engine-rules.md`, `raptor-port/docs/handpass/2026-09-25-amendment-batch.md`.*

### [ORIG-TAG-STANDOUT] The ORIG tag stands out, so a published day reads as published (D108, 25 Sep 26)
His ask in the same look: the Original's grey tag is too quiet — people should see the day is published. Changes the
register's AM22 "grey ORIG" (15 Sep 26). **Mock-up first** (options on the edit week, the board and View-only Sched,
desktop and phone; not an AL colour, not a warning colour), his pick, then build with the amendment batch (item 13).
**25 Sep 26 (D110):** option A's direction — no colour, a tick — B and C out; refined variants of A drawn for his final pick. **Picked the same night (D111): A1, the seal** — build it (the mock-up's variant `s` in `raptor-port/scripts/handpass/am/mk-orig-tag-refine.mjs`).
The tag is drawn by one routine on every surface — a shared drawer, so WALK tier at least.
**CLOSED 25 Sep 26 — BUILT overnight on `claude/amendment-batch` (the batch's item 13, D112), walked on the production build and read blind by Fable and Astra; the record is the evidence sheet `raptor-port/docs/handpass/2026-09-25-amendment-batch.md`, the contracts `raptor-port/docs/ui-contracts.md` and `raptor-port/docs/engine-rules.md`. Live only on his "merge live".**


*Moved here 2026-09-25 by backlog-archive.mjs ([MOVE-COUNTS-ONE]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/engine-rules.md`, `raptor-port/docs/handpass/2026-09-25-amendment-batch.md`.*

### [MOVE-COUNTS-ONE] A man moved to another place on the same day counts as ONE pending change (D109, 25 Sep 26)
Found in his look at PR #434: moving Warden from MET + NOTAM BRIEF to an empty SODB read "2 pending" (each row it
touched), and Reaper put into the emptied row left it at 2. **His ruling (D109): a move counts as one.** Pair a man (or
a placeholder) taken off one place and put on another place of the same day into one move; swaps are two; times,
areas and remarks one per box. ONE counting body for every count (day head, Amendments panel, ⓘ panel, plan-switch
message, "Discard N edits", the pending list). **Build with the amendment batch** (item 14) — the pending list's
lines (item 8) read a move as one line. FULL tier inside the batch (the published record).
**CLOSED 25 Sep 26 — BUILT overnight on `claude/amendment-batch` (the batch's item 14, D112), walked on the production build and read blind by Fable and Astra; the record is the evidence sheet `raptor-port/docs/handpass/2026-09-25-amendment-batch.md`, the contracts `raptor-port/docs/ui-contracts.md` and `raptor-port/docs/engine-rules.md`. Live only on his "merge live".**


*Moved here 2026-09-25 by backlog-archive.mjs ([MOVE-REPLACE-ONE]). Forward facts: `.claude/rules/decisions/scheduler.md`, `raptor-port/docs/engine-rules.md`.*

### [MOVE-REPLACE-ONE] A replacement in one seat — one pending change or two? A question for him (25 Sep 26)
Found while building D109 ("a move counts as one") overnight under D112. His words settle a man MOVED (one), a SWAP
(two), a man only TAKEN OFF (one) and only ADDED (one); they do not say what a REPLACEMENT in one seat counts — Rune
taken off VIPER 1's front seat and Tally put in it, neither moved anywhere else. Astra's reading (the scenario round,
`raptor-port/docs/handpass/2026-09-25-amendment-batch-astra-scenarios.md` finding 1): literally a man taken off (one)
plus a man added (one) = TWO; Fable's (`…-fable-scenarios.md` F1): one seat, one change = ONE. **Built as ONE** on a
seat (a flying seat, a sim seat, a desk's holder, a ground row's name) — the pending list reads one line "VIPER 1 ·
FCP: Rune → Tally" — and as one per man on a CROWD (a programme row's list, a desk's extras), where his "only taken
off is one" governs. **The agent's recommendation: keep ONE** — a scheduler reads it as one change ("I swapped Rune
out for Tally"), and it is the count the day showed before D109. **To change it:** `canonicalUnits` in
`raptor-port/src/engine/canonical.ts` (the SEAT branch of the left-over events), and its test in
`raptor-port/src/engine/pendunits.test.ts`. **Place:** his morning look at the batch (the look card asks it).
**CLOSED 25 Sep 26 — RULED D113 ("5 yes"): a replacement in one seat is ONE, as built. Nothing to build; the contracts and the register now say so.**


*Moved here 2026-09-25 by backlog-archive.mjs ([REQUEST-OFF-ONE]). Forward facts: `.claude/rules/decisions/scheduler.md`, `raptor-port/docs/handpass/2026-09-25-amendment-batch.md`.*

### [REQUEST-OFF-ONE] Taking an accepted request off a published day counts TWO pending changes — one? A question for him (25 Sep 26)
**CHECKED 25 Sep 26 — FULL tier** (evidence `raptor-port/docs/handpass/2026-09-25-amendment-batch.md` §9: Fable and Astra
blind, the walk desktop + phone, break tests): the two gaps it found — "Discard N edits" read 2, a deleted request's
line named nobody — fixed; the older findings filed as `[REQ-TWO-ROWS]`, `[REQ-DECLINED-PENDING]`, `[REQ-ORPHAN-ROW]`.
**ANSWERED 25 Sep 26 — D114 ("6 yes"): ONE.** BUILT on `claude/amendment-batch` (commit `a95afcbe`, red first; the
neighbouring suites green) — its FULL check is step 1 of D173 (`[LOOK-435]`); close this item after it.
Found by the amendment batch's walk (walker B1, `raptor-port/docs/handpass/parts/2026-09-25-amendment-batch-b1.md`
finding 1, picture `docs/img/handpass/2026-09-25-amendment-batch/b1/b1-d-03-list-week.png`). One tap — ✕ on Gambit's
accepted FLY WITH row on a published Monday — reads "+2" on every surface (they all agree), and the pending list shows
two lines: "Ground · FLY WITH · removed" and "Gambit · Fly with: on the programme → taken off". The published AL then
says "1 removal · 1 input filing". **Not new:** before the batch the count was the record's length, also 2; D109 made a
MOVE one change and says nothing about a request's row and its filing. Accepting a request onto a published day is
the mirror case (a row added + its filing = 2). **The agent's recommendation: count it ONE** — one act by the
scheduler, one line ("Gambit's Fly with taken off the programme"); what goes out (the stored diff) would stay as it
is. **To build:** in `raptor-port/src/engine/publish.ts dayPendingItemsIn`, pair a filing entry for input X with the
ground row add / delete whose `src` is X into one item, and word it in `raptor-port/src/ui/pendlist.ts`. **Place:** his
morning look at the batch (the look card asks it).



*Moved here 2026-09-25 by backlog-archive.mjs ([TRK-SMOKE-ADD-RACE]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/handpass/2026-09-25-trk-add-race.md`.*

### [TRK-SMOKE-ADD-RACE] The smoke suite's "+ Add" step can still lose a typed name (24 Sep 26)
**DONE 25 Sep 26 (D190), on `claude/trk-smoke-add-race-bug-007eed` — waiting for his look and "merge live".** A REAL
bug in the app: the question box's 30ms cursor move landed after typing had begun (the name went into the roster
search, or the typed letters were selected and wiped). Fixed in `raptor-port/src/tracker/components/Modals.jsx`;
contract `raptor-port/docs/ui-contracts.md` §The Tracker tab ("The question box never takes a cursor it already
has"); evidence `raptor-port/docs/handpass/2026-09-25-trk-add-race.md`. Three older findings from Fable's read are
filed as `[TRK-ADD-SEARCH-OK]` and `[TRK-DLG-LEFTOVERS]`. The history below is kept as it was.
**Place:** NOW, on its own branch `claude/trk-smoke-add-race-bug-007eed`, in parallel with the D175 chat (HIS GO, D190,
25 Sep 26 -- it stopped GitHub's checks three times that day at the same step, after "+ Add" on the Tx 2026 syllabus,
each passing on a re-run; the job is whether the APP loses the typed name, and its cause). *(Was: after
`[TRK-PINCH-ASK]`, before the next Tracker change that touches the smoke suite.)* Seen twice on
24 Sep 26: a local smoke run (check 261, an add straight after syllabus switches) and PR #431's first run on his PC
(check 231, an add straight after a roster pick) — both at the step's own `waitForFunction` on `#dlgInput`, whose
comment calls it "the residual behind the intermittent TRK-SMOKE timeout after the reset-on-render fix" (the 17 Sep
fix, `[TRK-SMOKE]`). Not caused by PR #431 — its changes do not run on that desktop mouse path; the whole suite passed
442/442 on the same code, and an isolated probe (a syllabus switch or a roster pick, then at once an add, 24 times)
lost nothing on either PR #431's build or `main`'s. Both stops came while the PC was busy, and both straight after a
save or a load had started — a background notify re-rendering the controlled input. **Do:** instrument the running app
at the failing add under load (as the 17 Sep fix did) and fix the re-render, not the wait; until then, a stop there
is re-run once WITH this item cited, never silently.


*Moved here 2026-09-25 by backlog-archive.mjs ([TRK-ADD-SEARCH-OK]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/handpass/2026-09-25-trk-add-race.md`.*

### [TRK-ADD-SEARCH-OK] A new callsign typed into "+ Add"'s roster SEARCH adds nobody — his call (25 Sep 26)
**DONE 25 Sep 26 — HIS ANSWER A (D191), built on `claude/trk-smoke-add-race-bug-007eed`, waiting for his look and "merge live".**
The line under the search says OK adds the name, and OK (or Enter in the search) does; the box below still wins. Contract
`raptor-port/docs/ui-contracts.md` §The Tracker tab (the + Add entry); evidence `raptor-port/docs/handpass/2026-09-25-trk-add-race.md`
§11. The item as it was filed:
**Place:** his answer first (a product choice), then a small build — WALK tier (the shared question box). Found by
Fable's read of `[TRK-SMOKE-ADD-RACE]` (F1), older than it (since the roster list, 9 Sep 26), reproduced in the real
app: the cursor starts in the search, a callsign NOT on the roster typed there shows "Nobody on the roster matches
“NEWGUY”", and OK closes the box having added nobody, with no message (picture
`raptor-port/docs/img/handpass/2026-09-25-trk-add-race/fable-f1-search-typed.png`). **The question for him:** (A,
recommended) OK adds that name as a new crew member, and the line under the search says so before OK is pressed;
(B) OK refuses and points to "Or type a callsign"; (C) leave it. Build: `Modals.jsx` `ok`, with a test beside the
TRK-SMOKE-ADD-RACE ones in `tracker.test.tsx`. Detail: `raptor-port/docs/handpass/2026-09-25-trk-add-race.md` §8.

*Moved here 2026-09-25 by backlog-archive.mjs ([REQ-TWO-ROWS]). Forward facts: `raptor-port/docs/engine-rules.md`, `raptor-port/docs/handpass/2026-09-25-req-one-row.md`.*

### [REQ-TWO-ROWS] A load or a plan switch can put a request on TWO days' programmes — found by Astra's D114 read (25 Sep 26)
**BUILT 25 Sep 26 on `claude/request-one-row` (D175), FULL check done** — `publish.ts rowsLeftOut`/`leaveRowsOut`, the load and
the switch leave the row out and every door names it (`drafts.ts rowsLeftSaid`); the rule `engine-rules.md` §Publishing
("A REQUEST'S ROW AND ITS FILING ON A PUBLISHED DAY"); evidence `raptor-port/docs/handpass/2026-09-25-req-one-row.md`.
**High, older than D114** (the same on `main`). A two-day request (Mon–Tue) accepted onto Monday; Monday and Tuesday
published; ✕ on Monday's row; Accept onto Tuesday; then Monday's issued version loaded onto the working copy (or a
parked Monday plan that holds the row switched in): the version's row comes back on Monday while Tuesday's stands —
one request, two rows. A later ✕ removes only the first, leaving an orphan row, and Tuesday reads 2 pending.
Reproduced 25 Sep 26 through the production functions (`acceptInput`, `unacceptInput`, `loadVersionToWorkingCopy`).
**Why:** a whole-day replacement (`drafts.ts loadVersionToWorkingCopy`, `draftSelect`) installs the day before
`slots.ts reconcileDayFiling`, which only asks whether a row exists ANYWHERE, never whether there are now two.
**The agent's recommendation:** the load and the switch leave that row out and SAY so — the way the load already leaves
a request's filing that covers another day (LOADLEFT, walker B3) — rather than refusing the whole load (Astra's
suggestion); one day's load never moves another (AM1). Tests: the six steps → exactly one row with that `src`, Tuesday
untouched, the message names it; the same through a plan switch. FULL tier (the load, plans, the published record).
Astra's report: `raptor-port/docs/handpass/2026-09-25-d114-astra-read.md` Finding 2. **Place — SETTLED 25 Sep 26, D175 ("2. Ok"):** its own small branch right after PR #435 merges, before `[ACCOUNTS]`;
the load leaves the row out and says so.


*Moved here 2026-09-25 by backlog-archive.mjs ([REQ-DECLINED-PENDING]). Forward facts: `raptor-port/docs/engine-rules.md`, `raptor-port/docs/handpass/2026-09-25-req-one-row.md`.*

### [REQ-DECLINED-PENDING] A request filed on a published day and then taken off still reads "1 pending" — a question for him (25 Sep 26)
**BUILT 25 Sep 26 on `claude/request-one-row` (D174), FULL check done** — `publish.ts filingSame`, read by the comparison, the
load's put-back and the signature; the rule `engine-rules.md` §Publishing; the register AM20; evidence
`raptor-port/docs/handpass/2026-09-25-req-one-row.md`.
Found by Fable's D114 read (O1), walked 25 Sep 26 (`raptor-port/scripts/handpass/am/d114-walk.mjs` step 9, desktop and
phone): a Meeting filed for Gambit on the published Monday lands on the working copy (16 Sep 26 rule); ✕ on its row →
the schedule reads exactly as published, yet the day says **1 pending — "Gambit · Meeting · not on the programme →
taken off"**, and an AL would go out carrying it. Older than D114 (the same on `main`): ✕ parks a request "taken off"
(dormant, flags nothing — 26 Aug 26), and the comparison treats that as different from "not there when published".
**The agent's recommendation, to put to him:** make it 0 (D98 — back to what was published shows nothing pending): a
request that did not exist when the version was issued and is now taken off is no difference; it stays silenced as
today. To check before building: the four sign-offs must hold on that day too (D103, AM11). Fable's report:
`raptor-port/docs/handpass/2026-09-25-d114-fable-read.md` O1. **ANSWERED 25 Sep 26 — D174 ("1. Yes"): make it 0.** **Place:** with `[REQ-TWO-ROWS]`, on its branch (D175).


*Moved here 2026-09-25 by backlog-archive.mjs ([REQ-DECLINED-DELETED]). Forward facts: `raptor-port/docs/engine-rules.md`, `raptor-port/docs/handpass/2026-09-25-req-one-row.md`.*

### [REQ-DECLINED-DELETED] A request taken off before the day was published, then deleted, reads "1 pending" — a question for him (25 Sep 26)
**ANSWERED — D176 ("Question 1 make it 0"); BUILT 25 Sep 26 on `claude/request-one-row`** — `publish.ts filingSame` (`present`),
read by the comparison and the signature; `engine-rules.md` §Publishing; evidence `raptor-port/docs/handpass/2026-09-25-req-one-row.md` §12.
Fable's G2 in D175's scenario round (`raptor-port/docs/handpass/2026-09-25-req-one-row-fable-scenarios.md`), reproduced in a
unit probe on `8fc6dba2`: a request accepted and ✕'d before the day is published (its record holds it "taken off"), then
deleted on the Inputs page (or re-dated off the day) → 1 pending "taken off → not on the programme", the four sign-offs
wiped, though neither the published face nor the working copy shows anything for it. Older (the same on `main`). **The
mirror of D174** — not what he ruled on, so it is his call. **The agent's recommendation:** 0 (D98), in `publish.ts
filingDelta`: a record "taken off" matches a request no longer covering the day; a dormant request still there and woken
to fresh stays a change. The signature must agree (`filingKey`). **Place:** on the look card of `claude/request-one-row`
(D175's branch); if yes, built there before "merge live".


*Moved here 2026-09-26 by backlog-archive.mjs ([PV-NO-FLAGS]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [PV-NO-FLAGS] The board's 👁 look at a published version shows no warnings at all — a question for him (filed 26 Sep 26)
**ANSWERED AND BUILT 26 Sep 26 — D187 ("Q5 it should"):** a look at a published version wears its warnings (the current
version as View-only Sched draws it, an older one as it went out, a plan none) — `raptor-port/docs/ui-contracts.md`
§Version preview; pinned in `raptor-port/src/ui/latepub.test.tsx` "D187 …".
Found by two walkers of `[LEAVE-LATE-PUBLISHED]`'s check (Quals, Logic — evidence
`raptor-port/docs/handpass/2026-09-26-late-pub.md` §4c): the board's plans menu → the Original (or an AL) draws the day
with no rings, no flags and no warning bar — neither the warnings it went out with nor the ones that stay live (D184,
D185); View-only Sched shows both. As built long before (`html.ts`: a version preview "reads and does not check" — PV;
the same on `main`); a blank B there also prints no suggested time where View-only Sched prints one. **The question:**
should the board's look at a published version show its warnings as View-only Sched does? **Place:** on the look card;
if yes, a small WALK-tier build (the board's PV branch reads the face bundle, `withOfficialWarn`).


*Moved here 2026-09-26 by backlog-archive.mjs ([LATE-PUB-FACE-LIVE]). Forward facts: `raptor-port/docs/engine-rules.md`, `raptor-port/docs/handpass/2026-09-26-late-pub.md`.*

### [LATE-PUB-FACE-LIVE] What still DRAWS live on a published day's face — questions for him on the look card (26 Sep 26)
Found by Astra's and Fable's reads of the `[LEAVE-LATE-PUBLISHED]` plan; each is a place where D179 ("freeze everything
for now") meets another ruling, so each is his call (newest-instruction-wins does not settle a case the newer ruling does
not clearly cover). **Where each stands, 26 Sep 26 (morning):** 1 and 2 are BUILT FROZEN (Astra's code read #2 —
`engine/faceattrs.ts`: the face, the CSV and the print draw the issued CAT / seat / posting and the issued brief lead) and
still read pending when they change — **SETTLED by D186 ("Q1 yes", 26 Sep 26): keep them frozen** (it narrows the
7 Aug 26 "no rule versioning" for the one printed value); 3 and 4 are SETTLED and BUILT live (D183–D185). The look card
(`raptor-port/docs/handpass/2026-09-26-late-pub.md` §10) carries the rest of his questions.
1. **A man's CAT letter / seat colour on a puck** — was read live from the roster (`html.ts puck`); now drawn from
   `snap.pa`. Freezing it keeps a copy of the day's men's attributes per published version.
2. **A printed rule value** — a blank brief's time (`VCONF.briefLead`, in `html.ts`, `board.ts`, `export.ts`); now drawn
   from `snap.rv`. His **7 Aug 26 "no rule versioning"** invariant: D48 held that a marker is not versioning; a stored
   rule value is closer to it — hence his question.
4. **SETTLED 26 Sep 26 — D184: the 7-day run warning (and, by the agent's reading, a crew-rest breach on the day itself) stays LIVE**; **D185: a lapsed qualification live too; a medical downchit stays FROZEN** ("1 frozen still"). **BUILT 26 Sep 26 (morning)** — `validate.ts LIVE_ON_FACE` (`CREW_REST`, `CREW_TIGHT`, `DAYS_RUN`, `QUAL`, `SC_QUAL`, `AAR_QUAL`, `AAR_INSTR`, and every OIL warning — Fable F3), the day loop files each mark by class (`fz` / `lv`), `faceWarn` lays the live ones over the frozen slice. The reading widened at the build (the Qualification-flag family, not `QUAL` alone; the crew-rest tight turn with the breach) is on D185's row and the look card.
3. **SETTLED 26 Sep 26 — D183: the dotted crew-rest mark stays LIVE** (not stored, not compared; built). Was: the
   next-day crew-rest mark (the dotted ring "his day-end breaks tomorrow") on a published day follows the day it
   points at — live while that day is a draft (Fable F4). Frozen, every edit to a draft Tuesday would take a published
   Monday's four down and the mark could point at a warning that is gone. Built that way; show him and ask.
Also outside the question, noted by the sweep: the desktop next-week preview on View-only Sched shows next week's working
copy even for a published day (`peek.ts`) — Astra recommends the issued content there too (its own small item if he wants it).


*Moved here 2026-09-26 by backlog-archive.mjs ([LEAVE-LATE-PUBLISHED]). Forward facts: `raptor-port/docs/engine-rules.md`, `raptor-port/docs/handpass/2026-09-26-late-pub.md`.*

### [LEAVE-LATE-PUBLISHED] A leave filed after a day is published shows on its published face at once, with nothing pending — a question for him (25 Sep 26)
**BUILT 26 Sep 26 (overnight, D181) on `claude/leave-late-published` — its full check and his look next.** A published
version now freezes the day's inputs (`snap.inp`) and its warnings (`snap.w`); the issued face reads only frozen things;
the pending comparison gains the input-details axis and the warnings axis (one item per act). Plan
`raptor-port/docs/superpowers/plans/2026-09-25-late-published-plan.md`; the reviews `raptor-port/docs/handpass/2026-09-25-late-pub-*`.
What still draws live on the issued face, and why: `[LATE-PUB-FACE-LIVE]`.
**WIDENED 25 Sep 26 — D178:** EVERY member input change after publishing (filed, edited, deleted, moved) reads pending for the
admin, and the published face keeps what it was issued with; the admin publishes an AL, or Unpublishes and publishes again
if it affects no one. **What stays live — D179 ("freeze everything for now"): nothing.** Medical downchits and a lapsed
qualification freeze too (the 15 Sep 26 crew-rest plan's §4 "safety facts are never versioned" set aside); only a reader's own
view choices stay. Provisional — show him on the build and ask again.
**ANSWERED 25 Sep 26 — D177 ("Question 2 yes"): it reads "1 pending", the four fall, and the published face keeps what it
was issued with until the next AL — ITS OWN BRANCH.** His follow-up ("is there anything else that does this too?") is
answered by a sweep of the published face's readers of live inputs — **its list is this item's scope: Context
`raptor-port/docs/superpowers/specs/2026-09-25-published-face-live-inputs.md`** (A0–A7 to freeze; B1 medical and B2–B4, B6
live on purpose; B5 — a neighbour day's input moving a published day's warnings — to put to him under D45).
Fable's code read F2 on D175's branch (`raptor-port/docs/handpass/2026-09-25-req-one-row-fable-read.md`), reproduced in a unit
probe on `8fc6dba2`: Monday published and signed; a leave (OL) filed for Hunter on Monday → View-only Sched shows him under
Unavailable at once (the Unavailable block reads the live inputs on every face — `raptor-port/src/ui/html.ts`), while Monday
reads 0 pending, keeps its four and offers no AL. Older (the same on `main`): a leave never takes a filing state, and the
comparison and the signature both read an unfiled request as nothing new. **Against the record:** D44/D45 ("nothing on a
published schedule may change without the scheduler acknowledging it"; a leave taken after publishing is what the scheduler
amends or publishes the EOD version for), and `OUTSTANDING-ARCHIVE.md` `[AMEND-D45-FILING]`'s closing line ("a leave landing on
a published day keeps wiping them (as built)") — the code does not. **The agent's recommendation, to put to him:** a late
leave reads "1 pending" and takes the four down, and the published face keeps what it was issued with until the next AL;
its own branch (the published-face half is the bigger build — every Unavailable reader on the view face). Medical is the
standing exception (a safety fact, never versioned — `raptor-port/src/engine/events.ts`). **Place:** on the look card of
`claude/request-one-row`; then its own branch, in his order.
**PLACE SETTLED 25 Sep 26 — D180:** NEXT, on its own branch `claude/leave-late-published`, BEFORE `[ACCOUNTS]`; built overnight (D181).


*Moved here 2026-09-26 by backlog-archive.mjs ([MED-VISIBILITY]). Forward facts: `.claude/rules/decisions/how-we-work.md`.*

### [MED-VISIBILITY] May other members see a medical input's type, remarks and documents? — a question for him (filed 26 Sep 26)
**ANSWERED the same day — D211, "Keep as today": every member sees a medical input's type, remarks and documents; the
database brief's restriction is set aside (amended in `raptor-port/docs/handover-dataverse.md`). Nothing to build.** The
question as it was put:
Found by Astra's read of the `[ACCOUNTS]` plan (R1-2). **Two of his rules point different ways:** his 27 Aug 26 rule,
"anyone may VIEW any attachment" (`raptor-port/docs/engine-rules.md` §Auth / roles, the Inputs row), and the database's
non-negotiable of 10 Sep 26, "a medical absence and any attached document are readable by the person and admins only"
(`raptor-port/docs/handover-dataverse.md`), which D169's reading repeats for the change history. Today every member sees
a medical input's type and remarks on View-only Sched's Unavailable list and can open its documents. **Put to him:** keep
that, or show other members only "Unavailable" and its times (the person and admins still see everything)? Changes what
every member sees, so it is his, not built silently. `[ACCOUNTS]` gives the new guest view (D204) the strict rule from
the start and lists this as a known gap in its permissions test. **Tier:** FULL (who can see personal details, D202).
**Place:** ask him with `[ACCOUNTS]`'s look card; build it after his answer, with `[DRAFT-PENDING]` (the change history
shares the rule).

