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
