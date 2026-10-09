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

*Moved here 2026-09-26 by backlog-archive.mjs ([BG-CWD-GUARD]). Forward facts: `.claude/hooks/bg-cwd-guard.mjs`, `raptor-port/CLAUDE.md`.*

### [BG-CWD-GUARD] A backgrounded npm command that starts at the repo root dies at once — guard it, don't re-warn (filed 24 Sep 26)
**DONE 26 Sep 26 (branch `claude/bg-cwd-guard`):** the hook route — `.claude/hooks/bg-cwd-guard.mjs`, wired as a `PreToolUse` hook on the Bash and PowerShell tools in `.claude/settings.json`, refuses a backgrounded `npm`/`npx`/`pnpm` that never moves into `raptor-port/`, with the fix in its message; its test `node --test .claude/hooks/bg-cwd-guard.test.mjs` (5 / 5); proved live in the session that built it (refused bare, both tools; ran with `cd raptor-port &&`). The root `package.json` route was not taken (it would start the full checks and could change what Vercel detects).
**HIS GO (D162, 24 Sep 26): build the hook.**
From the skills notebook, observation #42 (1 Sep 26), which the 23 Sep and 24 Sep reviews both judged a code or
config change, not a guide change (D146). A `run_in_background` shell starts at the REPO ROOT, where there is no
`package.json`, so a bare `npm run …` fails instantly — and the wrapper's exit code can read 0. The bold warning in
`raptor-port/CLAUDE.md` §Build & verify is text, and it has been broken three times. **The fix is structural:** a
`PreToolUse` hook (under `.claude/`, so no full check run) that refuses a backgrounded `npm` command without
`cd raptor-port`, or a root `package.json` whose scripts `cd raptor-port && npm run …` (it would start the full
checks and could change what Vercel detects). **Place:** any time, none blocking — but ask him first: a hook runs in
every chat, and it is standing configuration.


*Moved here 2026-09-26 by backlog-archive.mjs ([SIGNOFF-SELF]). Forward facts: `.claude/rules/decisions/scheduler.md`.*

### [SIGNOFF-SELF] With personal accounts, should each of the four sign-offs sign as himself? — a question for him (filed 26 Sep 26)
**ANSWERED 26 Sep 26 — D212, "admin picks all four names. its more convenient": the boxes stay as they are. Nothing to build.**
Found by the `[ACCOUNTS]` consumer sweep. Today an admin picks all four names on a day (CUR CK, SKED CK, PLANNED BY,
APPROVED BY — `raptor-port/src/engine/publish.ts SIGN_ROLES`); nothing ties a name to who is signed in. With accounts the
app knows who is signed in, so each sign-off could be signed only by that person, signed in. A change to how a day is
approved — his call. `[ACCOUNTS]` leaves the boxes as they are and makes the write admin-only at the command gate.
**Place:** ask him with `[ACCOUNTS]`'s look card.


*Moved here 2026-09-26 by backlog-archive.mjs ([ACCOUNTS]). Forward facts: `raptor-port/docs/handpass/2026-09-26-accounts.md`.*

### [ACCOUNTS] Accounts in the app now, shaped as the defence-mail sign-in will be (owner, D166, 25 Sep 26)
**BUILT 26 Sep 26 on `claude/accounts` — in its FULL check (D210); the plan (red-teamed three rounds by Fable and Astra)
is `raptor-port/docs/superpowers/plans/2026-09-26-accounts-plan.md`; the behaviour register
`raptor-port/docs/superpowers/specs/2026-09-26-accounts-behaviour-register.md`.** To the archive with its merge.
The Admin tab creates accounts (sign-in name, admin or member, the callsign it belongs to); the sign-in screen stands
for the defence mail sign-in; signing in makes you that callsign, so "View as" and any member preview go; the Leave
War follows the signed-in callsign; every "who" (edit record, pending list, hand over) names the callsign. Replaces
the fixed `ad` / `us` logins and merges Admin's "Manage users" list. The real address is tied by IT at the database
step (D165). Permissions → FULL tier. **Place (the agent's recommendation, not yet his word):** after this round's
smaller inputs in `[LOOK-435]` and BEFORE the hand over (D118), which then shows real callsigns and "since YOU last
looked" from the start. **SETTLED by D173:** step 2 of the order, on a NEW branch, after PR #435 merges.
**WIDENED 26 Sep 26 — D200 ("yes"; "so all these 3 things to be done inside the accounts work"): it carries the
permissions work.** (1) D149 built here (`[QUALS-MEMBER-SCOPE]` folds in). (2) `raptor-port/docs/data-model.md` §11 — the
list IT builds the database's security from — matches every ruling: a member's own Person row, every column (D149; the
table still says members only READ `Person`); the change history readable by members (D169; the table gives members no
`EditLog` access), a medical input's details excepted; accounts tied to callsigns (D166); OIL awards written by admins only,
who gave each and when kept (D79, D82). (3) One place in the app answers "may this person do this?", mirroring §11, with a
test that fails when the two disagree. **ANSWERED — D204 (26 Sep 26): both ways; a waiting screen, with an admin switch (off
by default) for a read-only guest view.** The question was: how a new user joins —
(a) the admin adds the defence mail, callsign and role first, so the first sign-in has its access at once (D165's plan);
(b) a new user signs up (callsign, name) and the admin is notified, approves and sets member or admin; either way the
admin can change it later. Also noted: an untagged signed-in person sees the programme as a GUEST (his parked plan of
1 Sep 26, `raptor-port/docs/architecture-direction.md`). Found 26 Sep 26: §11 already covers Leave War bids (own row while open) and the
leave / OIL ledger (admin writes, a member reads his own) — check, do not re-add.


*Moved here 2026-09-26 by backlog-archive.mjs ([QUALS-MEMBER-SCOPE]). Forward facts: `raptor-port/docs/engine-rules.md`.*

### [QUALS-MEMBER-SCOPE] May a member edit ANY row on the Quals page? — a question for him (moved from HANDOFF.md, 24 Sep 26)

**FOLDED INTO `[ACCOUNTS]` 26 Sep 26 (D200) — BUILT there 26 Sep 26 (`raptor-port/src/state/quals-write.ts`,
pinned per column in `quals-write.test.ts`); to the archive with `[ACCOUNTS]`' merge.** **ANSWERED (D149, 24 Sep 26) — now a small build:** a member edits his OWN row only, and every column of it (SXO and
SCHEDULER included); an admin edits any row. The gate goes at the page and the write path, with a test per column;
permissions, so FULL tier. **Place:** any time, none blocking. The question as it was put:
  - **Member Quals-editing scope** — a member in Quals editing mode can tick/edit
    ANY row's table contents (callsign, CAT, SXO, SANS). The 5 Aug decision reads
    that as intended, but it sits oddly beside the Inputs page's own-row-only
    rule; if own-row-only quals is wanted, the gate belongs in the same three
    places the authority-sweep fix touched.

*Moved here 2026-09-26 by backlog-archive.mjs ([PUCK-FLAG-GLOW]). Forward facts: `raptor-port/docs/ui-contracts.md`, `.claude/rules/decisions/scheduler.md`.*

### [PUCK-FLAG-GLOW] A red-flagged "View as" puck glows; no flagged puck should (his ask, D164, 24 Sep 26)
**BUILT 26 Sep 26 on `claude/five-flags-batch-build-ef7d85`** (the five-flags batch): the "this is you" puck's solid and dashed rings lose the red glow (`scheduler.css`), pinned by a test that walks every ring rule. To the archive with the merge.
*(Since `[ACCOUNTS]` (26 Sep 26) the purple "this is you" puck is the SIGNED-IN person's — "View as" is gone; the glow
rule below is unchanged.)*
He sent two pictures: a red-flagged puck with a red glow (Ranger, the person being viewed as) and one without (Saber).
The glow comes from `raptor-port/src/ui/scheduler.css`: `.puck.me.boxred` and `.puck.me.boxdash` add
`0 0 10px 1px rgba(240,85,95,.7)` on top of the red ring when the View-as puck is flagged. **Do:** drop that glow, so
a flagged View-as puck shows the same plain red ring (solid or dashed) as every other flagged puck; keep the purple
"this is you" fill and ring. Read the precedence notes near `.puck.me` first (every puck rule carrying `!important`)
and walk both widths with a flagged View-as puck. LOOK tier on one shared puck rule — check every surface that draws
a puck. **Place:** any time, none blocking; a good one to ride the next scheduler change.


*Moved here 2026-09-26 by backlog-archive.mjs ([LW-RESET-ORDER]). Forward facts: `raptor-port/docs/ui-contracts.md`, `.claude/rules/decisions/leave-war.md`.*

### [LW-RESET-ORDER] A "back to the default order" control for the Leave War roster — his call, build only if he asks (moved from HANDOFF.md, 24 Sep 26)
**BUILT 26 Sep 26 on `claude/five-flags-batch-build-ef7d85`** (the five-flags batch, FULL check — evidence `raptor-port/docs/handpass/2026-09-26-five-flags.md`): ⚙ Settings → "Roster order" → Reset order; it CLEARS the saved order (`resetRosterOrder`), asks once, greyed while the roster as drawn is the default. To the archive with the merge.
**HE ASKED (D160, 24 Sep 26): build it** — a "Reset order" line in ⚙ Settings running the store's `autoSortRoster`;
no button, no strip. WALK tier (a new control). **Place:** any time, none blocking.

- **OWNER'S CALL — no "back to the default order" control since Auto-sort went
  (6 Sep 26).** A hand-arranged Leave War roster stays arranged until dragged
  back; the store's `autoSortRoster` still exists. Offered: a "Reset order" line
  in ⚙ Settings. Build only if he asks.


*Moved here 2026-09-26 by backlog-archive.mjs ([CROWD-SWAP-SAYS-BUSY]). Forward facts: `raptor-port/docs/engine-rules.md`, `raptor-port/docs/feature-impact.md`.*

### [CROWD-SWAP-SAYS-BUSY] Swapping two men inside one crowd warns "already on" that row — found 25 Sep 26
**BUILT 26 Sep 26 on `claude/five-flags-batch-build-ef7d85`** (the five-flags batch): the cause was the busy check's key trim for a Common Programme row (`engine/keys.ts seatRow` now, shared with the validator's leaving-seat tests); a drag also excludes the seat he leaves. To the archive with the merge.
Seen in the amendment batch's re-walk (`raptor-port/scripts/handpass/am/hr-03-batch-reads.mjs`, picture
`docs/img/handpass/2026-09-25-amendment-batch/rewalk-reads/desktop/A-2-pending-list.png`): on the board, dragging
Reaper onto Ranger on the SAME Common Programme row swaps them (correct), and a warning toast says "Reaper — already
on FLIGHT SAFETY STAND-DOWN 08:30–09:00" — the row he is being moved within. **Not new** — the message comes from the
availability check (`raptor-port/src/engine/avail.ts`, the "already on" lines), which the batch did not touch; the
swap itself and the counts are right. **The agent's reading:** a move inside the row a man is already on should not
call him busy there — exclude the row being dropped into from his own busy check. Small, WALK tier. **Place:** with
the board's small items ([PUCK-FLAG-GLOW]); not his call unless the fix changes what a warning says elsewhere.


*Moved here 2026-09-26 by backlog-archive.mjs ([VIEW-ARROW-OVER-LIST]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/feature-impact.md`.*

### [VIEW-ARROW-OVER-LIST] The week's floating "‹" arrow covers the start of an opened warning list on a desktop (filed 26 Sep 26)
**BUILT 26 Sep 26 on `claude/five-flags-batch-build-ef7d85`** (the five-flags batch): the desktop week keeps 54px of room at its sides and every landing puts the day beside the arrow (`state/view.ts weekInset`). To the archive with the merge.
Seen by the Leave War walker of `[LEAVE-LATE-PUBLISHED]`'s check (picture
`raptor-port/docs/img/handpass/2026-09-26-late-pub/leavewar/desktop/desktop-LW1b-1-face-warnings.png`): on View-only
Sched at 1440 px, a day's "⚠ N issues" list opened on the day at the left edge sits under the week's floating "‹"
scroll arrow, which hides the first letters of the list's lines. Not new with that branch (the arrow and the list are
unchanged there). **Do:** give the arrow room (an inset on the scroller, or the arrow above the list only while the
pointer is near it), walk both widths with a list open on the first and last day. **Place:** low, any time.


*Moved here 2026-09-26 by backlog-archive.mjs ([BG-GUARD-FALSE]). Forward facts: `raptor-port/CLAUDE.md`, `raptor-port/docs/file-map.md`.*

### [BG-GUARD-FALSE] The background-command guard refuses two commands that do move into raptor-port (filed 26 Sep 26)
**BUILT 26 Sep 26 on `claude/five-flags-batch-build-ef7d85`** (the five-flags batch): measured — a background shell starts in the chat's STARTING folder, not the foreground's; the guard lets a chat started inside `raptor-port` run a bare `npm`, names the full path in its refusal, and matches only a folder that IS `raptor-port` or lies inside it; the notes corrected. To the archive with the merge.
Found by the accounts chat on its first background run after `[BG-CWD-GUARD]` merged (D162): the hook
(`.claude/hooks/bg-cwd-guard.mjs`) refused `cd /c/Users/User/projects/Raptor/raptor-port && npm …` (a full path), and
the form it asks for, `cd raptor-port && npm …`, then FAILED — this background shell started inside `raptor-port`
already (the session's folder), not at the repo root the hook and `raptor-port/CLAUDE.md` assume. What worked:
`cd /c/Users/User/projects/Raptor && cd raptor-port && npm …`. **Do:** accept a `cd` whose target ends in `raptor-port`
(full or relative path), and correct the "starts at the REPO ROOT" note — a background shell starts in the session's
current folder. **Place:** small, tooling, any time.


*Moved here 2026-09-27 by backlog-archive.mjs ([CROWD-DUP-REFUSE]). Forward facts: `raptor-port/docs/engine-rules.md`, `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/handpass/2026-09-27-five-flags-answers.md`.*

### [CROWD-DUP-REFUSE] A man put on a row he is already on: warn (today) or refuse? — a question for him (filed 26 Sep 26)
From the five-flags batch's walk (W3, F6; evidence `raptor-port/docs/handpass/2026-09-26-five-flags.md` §5): the app now
NAMES it ("already on FLIGHT SAFETY STAND-DOWN 08:30–09:00" — the caption, the toast, the struck name in the crew list)
but still plants the second copy, per his 13 Aug 26 "everything plants, warning after". **The question (the look card,
Q1):** refuse it instead — one man, once per row? If yes: a hard refusal beside D33's in `avail.ts slotBar`'s
one-man-one-place check and the three doors (`drag.ts`, `view.ts placeArmed`, `fillSlot`), with the pending count left
at 0. **Mock-up shown 27 Sep 26** (his ask, *"q1 can u show me a mock upp"*): `raptor-port/docs/mock/five-flags.html` §Question 1 —
today vs refused. **ANSWERED 27 Sep 26 — "Q1 refused" (D271): refuse, at every door, with the reason; a man on two
different rows stays warned; a crew-list drop onto another man's place in a crowd he is already in is refused too.**
**Place:** built next, on `claude/five-flags-batch-continue-2cfa70` before its "merge live" (with D270, D272).
**DONE 27 Sep 26** on that branch, FULL-checked: `raptor-port/docs/handpass/2026-09-27-five-flags-answers.md` (and Fable's F1, the request hand-over, with it).


*Moved here 2026-09-27 by backlog-archive.mjs ([ME-PUCK-SEVERITY-RING]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/handpass/2026-09-27-five-flags-answers.md`.*

### [ME-PUCK-SEVERITY-RING] On his own puck, the purple "this is you" ring hides the amber / thin red / grey rings — a question for him (filed 26 Sep 26)
The five-flags walk (W1, `raptor-port/docs/img/handpass/2026-09-26-five-flags/w1/D1-*`, `D2-*`): `.puck.me`'s purple ring
replaces the severity ring, so only the letter chip shows the flag on his own puck (another man's shows the ring). The
batch took the GLOW off every flagged own puck (D164); whether the severity ring should show INSTEAD of the purple ring
is the look card's Q2 — **ANSWERED 27 Sep 26: "Q2 yes" (D270)** — flagged, his own puck shows the flag's own ring (amber,
thin red, grey, dotted) as another man's does, the purple fill stays; unflagged, the purple ring and glow as today. **To build:**
`scheduler.css` `.puck.me.warn` / `.puck.me.boxdot` (and its comment), `flagglow-css.test.ts`, `ui-contracts.md` (the
"no flag ring glows" paragraph), a mock-up first (his ask, 27 Sep 26); WALK tier (a shared drawer — not LOOK). Still OPEN,
not part of D270: in OIL mode the green OIL ring on his own puck is hidden under the purple ring (`w1/F9-*`) — put to him
27 Sep 26 as Q2b on the mock-up (`raptor-port/docs/mock/five-flags.html` §Question 2, recommended: the same treatment) — **ANSWERED "question 2 yes" (D272): in OIL Earn mode his own puck shows the green
OIL ring, the purple fill stays.** **Place:** built next, on `claude/five-flags-batch-continue-2cfa70` before its "merge
live" (with D270, D271).
**DONE 27 Sep 26** (D270 and D272 together), FULL-checked: `raptor-port/docs/handpass/2026-09-27-five-flags-answers.md`.


*Moved here 2026-09-27 by backlog-archive.mjs ([ARROW-ROOM-OUT]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/feature-impact.md`, `raptor-port/docs/handpass/2026-09-27-five-flags-answers.md`.*

### [ARROW-ROOM-OUT] Take the room beside the ‹ arrow back out of the desktop week — his D275 (filed 27 Sep 26)
**Why:** shown the five-flags batch's item 4 full screen (`raptor-port/docs/mock/five-flags.html`), he chose the BEFORE
pictures — *"I still prefer these"* (D275): the day at the front flush at the left, the ‹ arrow floating over its first few
pixels, as on `main`. **Take out everything `[VIEW-ARROW-OVER-LIST]` added:** `scheduler.css` (`.week` back to
`padding:2px 20px 40px`, no `scroll-padding-left`, the comment), `state/view.ts` (`weekInset` and its use in `weekLeftDay`
and `scrollWeekToDay`), `ui/highlights.ts` (`bringIntoView` back to the box's edges), `state/weekinset.test.ts` (deleted),
`e2e/geometry.spec.ts` (the "sit clear of the ‹ arrow" test out; the five older landing tests back to measuring from the box's
edge — `git show main:raptor-port/e2e/geometry.spec.ts` for their words), the docs marked "TO BE TAKEN OUT — D275"
(`ui-contracts.md`, `feature-impact.md`), `docs/file-map.md` (the test file's row), the walk scripts that assert the room
(`scripts/handpass/ff-w4.mjs`, `ff-probe-arrow.mjs` — note them as retired). `git diff origin/main...HEAD` on those files is the
list; the rest of the batch stays. **Check:** the week's browser tests (the whole `geometry.spec.ts`) and a look at desktop.
**Place:** on `claude/five-flags-batch-continue-2cfa70` with D270–D272, before its "merge live".
**DONE 27 Sep 26** on that branch, FULL-checked: `raptor-port/docs/handpass/2026-09-27-five-flags-answers.md` (W6; `geometry.spec.ts` main's again).


*Moved here 2026-09-27 by backlog-archive.mjs ([LW-MOVE-CI-RED]). Forward facts: `raptor-port/docs/handpass/2026-09-27-five-flags-answers.md`, `raptor-port/e2e/leavewar.spec.ts`.*

### [LW-MOVE-CI-RED] The Leave War desktop "Move" browser tests fail on GitHub's machines, on more than one branch — found 27 Sep 26
**What:** on 26 Sep 26 (UTC) the `geometry (lw-desktop)` job failed on `claude/five-flags-batch-continue-2cfa70` twice
(runs 36256124235 at 16:37Z — passed on its one D84 re-run — and 36257950418 at 17:08Z) and on
`claude/absence-record-d147-af6a50` (run 36257132635 at 16:54Z), which carries none of the five-flags code. The same tests
each time, in `e2e/leavewar.spec.ts`: "a drag-selection offers Move, and the move banner appears on entering it" (959 —
the Move button never appears within 5 s, both tries), "right-click cancels a move on desktop" (1005 — its click on Move
times out at 30 s), and on the absence-record run also "a loose box moves the inputs present…" (984) and "-1.5 subtracts…"
(2180, flaky). All four pass on his PC: the full run (474/0) and the two alone 8/8 with the page slowed 4×
(`E2E_CPU_THROTTLE=4`). `main` (16:09Z and earlier) and `claude/accounts-new-person` (16:40Z) passed. **Not the five-flags
batch** (a branch without it fails the same way; its Leave War change is the ⚙ sheet's Reset order line, drawn only when
the sheet is open, and `displayRoster()` is called bare everywhere). **D84 was used and the group failed again — stop and
report, which this is.** **To do:** the systematic-debugging skill, not another re-run: what those tests share (fill a
block with `sel-LL`, drag-select it again, the sheet must offer Move — `movableCells`); read the job's own failure
pictures (the trace / error-context artifacts); what changed on GitHub's side (the runner image, the browser build);
whether a person at ordinary pace can reach "no Move offered" (then it is the app's bug, D87's reasoning). **Place:** NEXT
among the checks, before the next "merge live" that needs a green GitHub run (the five-flags PR #445's own checks are red
on it).
**INVESTIGATED 27 Sep 26 (the five-flags chat; an Opus investigator's report, its logs under that chat's scratch — the
findings are here whole):** a TIMING RACE IN THE TESTS, not the app. Tallied over 25 GitHub runs of the job: 9 before
26 Sep 06:44Z all passed first time; 16 after, 9 failed first — the onset is `[ACCOUNTS]` (562d96a6), whose `lwRole()` now
also calls `raptorRole()`, so the admin's fill is an admin edit on Raptor's side too and its re-derive and re-render last
longer. The failure is always the SECOND drag, straight after the fill: on a slow runner a drag started inside that
re-render is silently lost and no sheet opens. The same race the undo tests met on 18 Sep ([GLOBAL-UNDO], 519de0b8,
`dragSelectStable` — re-fire the drag until the sheet opens); these three never got it. No runner-image or browser change;
no failure pictures exist (the workflow uploads none); not reproduced on the PC (15/15, 24/24 at 2×, 24/24 at 3×). A
person at ordinary pace would not hit it (the window is well under a second; a lost drag writes nothing and is simply
redone). **FIXED (tests only, D87):** `e2e/leavewar.spec.ts` "offers Move" and "right-click cancels" wait for the fill to
land and its sheet to close, then drag with `dragSelectStable`; "a loose box" drags with `dragSelectStable`. **Left:**
confirm on the next GitHub runs of this branch (the test fix cannot be proven on the PC, where it never failed), then
archive this. **First run after the fix** (36265413334, 869c7197, 27 Sep 26): `geometry (lw-desktop)` green, the three
passed FIRST time, 169 passed, none flaky — one clean run; before the fix a run failed first about half the time, so one
more clean run before archiving. Filed beside it: `[LW-HARNESS-VIEWER-PIN]`, `[CI-FAIL-PICTURES]`.
**Second run** (36267529028, b69767fd): green again, the three first time, 169 passed — **DONE 27 Sep 26**, archived.


*Moved here 2026-09-27 by backlog-archive.mjs ([D271-LOOK-ASKS]). Forward facts: `raptor-port/docs/ui-contracts.md`, `.claude/rules/decisions/scheduler.md`.*

### [D271-LOOK-ASKS] Four small questions the D270–D275 build raised — for his look card (filed 27 Sep 26)
From Fable's scenario read of the build (`raptor-port/docs/superpowers/specs/2026-09-27-five-flags-builds-scenarios-fable.md`
§6 Q-A–Q-C and its look-card observation), put to him on the look card (`raptor-port/docs/handpass/2026-09-27-five-flags-answers.md`
§9); nothing is built for any of them.
1. **A jet line's two seats** — one man put in FCP AND RCP of the same jet is only WARNED (the red "two events at once"),
   because a flying line is not one of the rows D271 names (crowds, extras, sim seats). Refuse it too? *Agent's
   recommendation: yes — it can never be right, and a move between the two seats is still a move.* If yes: a flying
   branch in `avail.ts rowTwice` (the other seat of the same aircraft), the doors already ask it.
2. **His own puck NOT earning in OIL Earn mode** keeps the faded purple ring and glow, where another man's non-earning
   puck is just faded (D272 spoke of the green ring). Keep, or show it faded only? *Recommendation: keep — the fade
   already says "earns nothing", the purple still says "you".*
3. **A placeholder twice on one row** (ALL / ALL AVAIL dropped twice) is allowed, silently (not a man — D33 keeps a
   placeholder silent). *Recommendation: leave it.*
4. **A struck name in the crew list looks the same** whether a tap on it will be REFUSED (already on this row) or only
   warned after planting; only the printed reason differs ("· not added twice"). Want the refusing strike to look
   different? *Recommendation: leave it — the words say it.* Also noted, no question: dragging a man over a row's NAME
   cell shows no caption, though a drop there is refused with the reason (the caption speaks over the people cell).
   And (Fable's read, F-6): with a man SELECTED, the green "where can he go" rings show none on his own crowd's "+ add"
   (he is already there), though dragging his own puck there moves him to its end — the rings answer "add", the drop "move".
**Place:** his answers, with his look at PR #445; low.
**ANSWERED 27 Sep 26** — 1 "Leave it no change" (D276), 2 "Keep" (D277), 3 "Leave" (D278), 4 "Leave" (D279): nothing to
build; each carried in `raptor-port/docs/ui-contracts.md` and the rulings (`.claude/rules/decisions/scheduler.md`).


*Moved here 2026-09-26 by backlog-archive.mjs ([S4-HUNT-REST]). Forward facts: `raptor-port/docs/handpass/2026-09-26-absence.md`, `raptor-port/docs/superpowers/plans/2026-09-26-absence-retest-plan.md`.*

### [S4-HUNT-REST] The bug hunt's untouched ground — about three quarters of it (owner, 21 Sep 26)
The branch turned into a long detour through the rules and the five items, so most of the hunt Fable
and Codex planned (eight batches) has never been run. The owner listed what is still untouched, and
this is his order. **Realistically two or three sessions.** **Place (D147, 24 Sep 26):** walked TOGETHER with the
absence-record re-test of [HUMAN-RETEST], straight after the amendment system — one pass, since this ground IS the
absence record.
1. **The Inputs page calendar, by DRAG.** It has 43 tests of its own behaviour, but the clash rules
   have never been tested through the drag route — dragging leave onto a pending bid, onto other
   leave at overlapping times, onto a day someone is recorded working. A door people use daily.
2. **The medical dialog's cascade** — a medical laid over existing leave and over other medicals:
   how many pieces it mints, whether ONE undo puts it all back, whether cancelling leaves a
   half-edit behind.
3. **Bulk gestures by real drag** — select a block, then fill / approve / delete / move it, and
   whether the "N written, M skipped" message tells the truth.
4. **Switching wars with a sheet open**, and undo after switching.
5. **Storage faults** — a save that fails halfway: does the app say so, and does a retry land the
   WHOLE thing?
6. **Phone, by finger** — drag-select and the two-step move at phone width, and a day carrying
   eight records.
7. **Figures on days with several records** — four records on one day, and whether the manning count
   removes the man ONCE rather than twice.
**DONE 26 Sep 26 — walked with the absence-record re-test** (`raptor-port/docs/handpass/2026-09-26-absence.md`; the
walkers' sheets under `raptor-port/docs/handpass/parts/2026-09-26-absence-w{1..5}.md`): (1) the calendar by drag — W1,
W2 (AB4, W1-F1–F3, fixed); (2) the medical cascade — W2 (AB3, AB4, fixed); (3) bulk gestures by real drag — W3 (AB2 a
question; AB7 and W3-F3's Delete fixed; its Move half is [LW-MOVE-BENEATH]); (4) switching wars with a sheet open, and
undo after — W3, W5 (W3-F7, W5-F3, W3-F8, fixed); (5) storage faults — the host, H3, correct; (6) phone by finger —
W4, W1 (W4-1, W1-F1, W1-F2, fixed); (7) figures on days with several records — W4, correct (a man with four or eight
records falls by exactly one in each head-count row).


*Moved here 2026-09-26 by backlog-archive.mjs ([PUB-UNAVAIL]). Forward facts: `raptor-port/docs/handpass/2026-09-26-absence.md`, `raptor-port/docs/superpowers/specs/2026-09-20-one-absence-behaviour-register.md`.*

### [PUB-UNAVAIL] New absence silently changes a published day's Unavailable list — NEXT AFTER step 4
A new absence covering an already-published day changes that day's issued Unavailable list with no
amendment, no re-sign, no history line (`html.ts:1515` reads live inputs; the filing fingerprint
compares `acc` only). Owner (19 Sep 26): fix as its own item straight after step 4. Context: design §13.2.
**CLOSED 26 Sep 26.** Built by [LEAVE-LATE-PUBLISHED] (D177–D179, D185: a late absence on a published day is a pending
amendment and the issued face stays as issued); walked by the absence-record re-test, H1 — a late leave, a late
medical, a war approval and a medical cutting issued leave each read pending on every count, drop the four sign-offs
and leave the published face as issued; taking the late leave out again gives 0 and the sign-offs back
(`raptor-port/docs/handpass/2026-09-26-absence.md` §3, "Walked and CORRECT"; the register
`raptor-port/docs/superpowers/specs/2026-09-20-one-absence-behaviour-register.md` §11).


*Moved here 2026-09-27 by backlog-archive.mjs ([LW-MOVE-ONE-CHIP]). Forward facts: `.claude/rules/decisions/leave-war.md`, `raptor-port/docs/ui-contracts.md`.*

### [LW-MOVE-ONE-CHIP] One chip, one Move — no date box; edge scroll, months keep it, a click outside cancels (D262, 27 Sep 26)
**His ruling (D262, `.claude/rules/decisions/leave-war.md`):** tap a single chip on the Leave War and its sheet's **Move** is
pressable at once and picks the chip up; the date box ("the calendar") beside it goes. While moving: dragging to the grid's
edges scrolls it; the month buttons still work and the move stays on; a click on an empty area outside the grid cancels.
**Today:** the one-day sheet's Move is greyed until a date is typed in its date box, then moves there
(`raptor-port/src/leavewar/ui/BidPicker.tsx`, the two `decide-shift` rows). **Build (the agent's readings in D262):** both
one-day sheets' Moves start the grid's move mode (the drag-selection's own, `Matrix.tsx` moveSel), landing rules unchanged
(refused whole and said; the dotted "moved" mark once bidding is closed; lands undecided); desktop lands on the click or
release, the phone keeps tap-then-Confirm; the drag-selection's "Move…" gains the same edge scroll, months and outside-click
cancel; a stage or war change and Undo still end it. **Tier:** WALK at least (a new gesture; a walk at both widths, both
orders, a break test) — FULL if the landing rules are touched. **Place:** the NEXT chat, with `[ABSENCE-ASK]`'s answers (his
word, 27 Sep 26), before this branch's "merge live" (the agent's reading). Fix what it leaves behind (D201):
`raptor-port/docs/ui-contracts.md` §Selecting on the Leave War grid, and the tests that type a date into `shift-date`.

*Moved here 2026-09-27 by backlog-archive.mjs ([ABSENCE-ASK]). Forward facts: `.claude/rules/decisions/oil.md`, `.claude/rules/decisions/scheduler.md`.*

### [ABSENCE-ASK] Three questions for him from the absence-record re-test (26 Sep 26)
Put to him with his look at the re-test (its look card, `raptor-port/docs/handpass/2026-09-26-absence.md` §12):
1. **ANSWERED 27 Sep 26 — D260 ("B"): a dragged block's Delete removes everything in it, awards included, and its
   confirm names each award first; the one-day Clear does the same (names it, asks once); Move and drag keep leaving
   awards where they are. TO BUILD in the next chat (his word), with its own red-first tests and check — the agent's
   reading: on this branch, before his "merge live".** The question as it was put: **An OIL award under Clear and bulk Delete (AB1, AB2).** The bid sheet's Clear on a day holding an award removes the
   award, and a dragged block's Delete removes every award in it — no word in either, and the man's OIL drops. An award
   has its own Remove (N11: an award is the admin's). An existing test pins Clear removing the award as MEANT, so which
   is right is his: (a) Clear and Delete leave awards alone (Remove is the one door), or (b) they take them, and say so
   in the confirm ("…and 2 OIL awards").
2. **ANSWERED 27 Sep 26 — D263 ("2 yes"): the change history records every change to an absence (an input edited, cut, moved, deleted; the war's approve, refuse, back-to-bid, move) with who and when — built INTO the one changes window (`[DRAFT-PENDING]`), not before.** The question as it was put: **What the Edit history should record (AB8 (b)).** Today it records the schedule, and of inputs only an add or a
   removal. Should the war's approvals and moves, and an input's edits and cuts, join it? Belongs with the one changes
   window ([DRAFT-PENDING], D169's transparency). (AB8 (a) — the Inputs page's own Add writing no line — is fixed.)
3. **ANSWERED 27 Sep 26 — D261 ("3 yes"): a member opens his own OIL award, read only, at every stage. TO BUILD in the next chat (his word).** The question as it was put: **A member's own award outside the bidding window (W3-F10).** Inside the window his own FO / HO opens read-only
   (reason, given by, days); outside it, nothing opens. The OIL tracker shows the same facts. Should his own award open
   read-only at every stage?
**Place:** his look at the re-test; each answer becomes a ruling (D260–D269 on that branch) and, where it changes the
app, a small build.
**ALL THREE ANSWERED; items 1 and 3 BUILT 27 Sep 26 on that branch** (D260, D261 — evidence
`raptor-port/docs/handpass/2026-09-27-d260-d262.md`); item 2 (D263) is built with the one changes window — its
requirement is written in `[DRAFT-PENDING]`.


*Moved here 2026-09-27 by backlog-archive.mjs ([LW-MOVE-TAPLIST-ASK]). Forward facts: `.claude/rules/decisions/leave-war.md`.*

### [LW-MOVE-TAPLIST-ASK] The tap list's per-record Move… still moves by a date box — a question for him (27 Sep 26)
D262 ("one chip, one Move … The calendar can be removed") was read, and stated to him, as the two ONE-DAY sheets (the
bid sheet's decision row, and the decide sheet it replaced). A day holding several records opens the TAP LIST instead,
where a war-approved leave's own line has "Move…" with a date box and a Move button (`DayList.tsx`, `moveAbsenceById`) —
it has to name WHICH record, which the grid's move mode cannot (it moves the day's top record). **The question:** should
that line's Move… also pick the one record up and land it on a day of the grid (a move mode that carries the record's
id), or keep its date box? **Place:** on the D260–D262 look card (`raptor-port/docs/handpass/2026-09-27-d260-d262.md`
§10); a build only if he says so.
**ANSWERED 27 Sep 26 BY D266** (`.claude/rules/decisions/leave-war.md`): the same move mode, no date box, each record
that can move with its own Move — built by `[LW-MOVE-STANDARD]` (with D264, D265).


*Moved here 2026-09-27 by backlog-archive.mjs ([ACCOUNTS-NEW-PERSON]). Forward facts: `raptor-port/docs/handpass/2026-09-26-accounts-new-person.md`.*

### [ACCOUNTS-NEW-PERSON] Admin → Users makes a brand-new person with his account, in one step (D214, filed 26 Sep 26)
**His ruling (D214):** *"2 can u show me a mock up, also ill need his initials"* — after he found the callsign list offers
only people already on Quals. **Build:** "Add an account" (and Approve, filled from the callsign and name the person typed)
gets a **New person** choice — callsign, **initials**, pilot / WSO / personnel, CAT — which creates his Quals row and his
account together through the SAME add the Quals page uses (one callsign rule), as one command. Flight and quals stay on
Quals. **Mock-up first:** `raptor-port/docs/mock/new-person-account.html` — **APPROVED 26 Sep 26 (D224)**, the design of
record; planned (Opus 5.5), red-teamed (Fable, Astra), built and walked on `claude/accounts-new-person` (26 Sep 26); its
FULL check DONE the same day — three read rounds by Fable and Astra, every finding fixed red first, re-walked 58/58,
break tests 32/32, the full checks green (evidence `raptor-port/docs/handpass/2026-09-26-accounts-new-person.md`); the PR
is open, **waiting for his look (the sheet's §10 card) and his "merge live"**. **Tier:** FULL
(roles and saved data). **With it — D216:** a new access request lights the admins' bell (a tap → Admin → Users; out once
he has opened it). **And the sign-up form asks the same things** (his "signs up for an account", on D214's row).
**And D217 — one door:** a new person is created ONLY on Admin → Users (or his approved sign-up); a blank sign-in makes a
roster-only person (a SANS man); Quals' "+ Add person" becomes a button to Admin → Users (its form and tests retired, D201).
**And D219:** the field reads "Callsign/Name" (some people have no callsign) — the sign-up, Admin → Users and the Quals head. **D220:** the seat choice reads "Pilot", "WSO", "Personnel (ground crew)". **D222:** on the sign-up card only, that field reads "Displayed callsign/name". **D225:** initials asked on both forms, required on neither. **D226:** the callsign/name stays at 14 letters and the form says so — never cut silently. **D227:** each admin's bell is his own (out once HE has had the waiting list on screen). The plan (red-teamed round 1): `raptor-port/docs/superpowers/plans/2026-09-26-accounts-new-person-plan.md`.
**Place:** straight after `[ACCOUNTS]` merges, on its own branch, before `[DRAFT-PENDING]`.


*Moved here 2026-09-27 by backlog-archive.mjs ([OIL-AUTO-REMOVE]). Forward facts: `.claude/rules/decisions/oil.md`, `raptor-port/docs/superpowers/specs/2026-09-21-oil-auto-remove-decisions.md`.*

### [OIL-AUTO-REMOVE] Taking OIL off — **MERGED 22 Sep 26 (D34). CLOSED.**

**Live on `main` as of 22 Sep 26**, every check green, on his "merge live". **His five-minute look
was WAIVED** — the evidence is the walk and the gates, not an owner sighting; do not assume the
walked Saturday was eyeballed. The walk's own evidence sheet is
`raptor-port/docs/handpass/2026-09-22-oil-walk.md`. **Stays live in this file, not archived**, because
it warns a later session off re-doing the four walk defects and off assuming the owner looked.

> **BUG-CHECKED AND FIXED 21 Sep 26. The remaining job is the hands-on scenario pass.**
> Cross-provider check by Fable 5.1 and Astra/Codex, both read-only, neither the model that
> built it. **Ten defects fixed from their reports, plus FOUR the owner found by opening the
> app, plus his O-1 ruling — all built, tested and pushed (commit `b3d8ee8`).**
>
> - **Triage and what was fixed:** `docs/superpowers/specs/2026-09-21-oil-bugcheck-fixplan.md`;
>   both reviews verbatim beside it. Four of their eight were ONE root cause — the freeze
>   boundary had more doors than `creditFrom`.
> - **Owner rulings from it:** R-1 (only the issued schedule pays, BOTH directions) and R-2
>   (the two pre-existing money bugs share that root cause, so they are fixed here). O-1: the
>   green bar shows only on the events that COUNTED — BUILT, superseding OIL21. All in
>   `DECISIONS.md` D1–D3, D15.
> - **What the reviews could NOT find, and the owner did:** the app draws a puck in six places
>   and only some were wired to this feature — the board's cockpit seats and Common Programme,
>   the WEEK's cockpit seats, the mode's own gesture on all three, and a chip painting over the
>   strip. Every call site is now enumerated and decided. **This is what produced the new
>   bug-check standing order** (`docs/bug-check-order.md`).
>
> **NEXT: execute the two scenario lists in the running app** — Fable's 44 and Codex's 24,
> `…/specs/2026-09-21-oil-scenarios-{fable,codex}.md`. **Start from
> `…/specs/2026-09-21-oil-handpass-handoff.md`**, which says what is already walked by hand so
> it is not redone, names the highest-value scenarios left, and carries the one open question
> for the owner (a pending OIL change looks identical to one in force).
>
> **Gates at that commit:** 5350 unit · build · parity 728/0 · rulecheck OK · tracker 425/0 ·
> **e2e 446 pass / 1 fail** — a Leave War grid scrollbar test that passes in isolation and
> fails under full parallel load. Unresolved on purpose: the handoff names the check that
> settles whether it is ours or pre-existing, and forbids waving it through.

**The three shapes were put to him and he rejected the framing** — rightly. Instead of fighting the
derived credit, ask about the EVENT at the source. He then designed the interface himself: an
**"OIL Earn" mode** on the scheduler board that glows every puck earning OIL that day, where the
admin taps a puck to take a man off one event, or taps an item to stop the whole item earning.

- **The design of record is `…/specs/2026-09-21-oil-auto-remove-decisions.md`** — every owner
  ruling of that session verbatim, plus the ground truth behind them. Nothing lives only in chat.
- **Design rulings that must NOT be relitigated** (21 Sep 26, §8/§9 of the decisions doc, which
  carries each in full): the published schedule is the truth — a full freeze, corrected by
  unpublish-and-republish under the same label, never an approved-absence carve-out; the
  development reset ships at its real scope; a sentinel puck goes green when everyone behind
  it earns the same, the count chip carries the mixed case; ALL and ALL AVAIL stay identical
  on purpose; NO Leave War removal door; the exception shows as ONE line on the day and a
  per-person exclusion never appears on the issued schedule.
- **The design red team was capped at two rounds**, so §9's four answers were never
  independently reviewed — which is why the post-build check weighted them highest. Done; see
  the bug-check fix plan.
- **The owner's mockup** (his own artifact canvas) is a revision behind; redraw before use.


*Moved here 2026-09-27 by backlog-archive.mjs ([LOOK-435]). Forward facts: `.claude/rules/decisions/how-we-work.md`.*

### [LOOK-435] His inputs from the look at PR #435 — the order is D173 (25 Sep 26)
**Step 1 DONE 25 Sep 26:** D114's FULL check — evidence `raptor-port/docs/handpass/2026-09-25-amendment-batch.md` §9; two
gaps fixed, three older findings filed (`[REQ-TWO-ROWS]`, `[REQ-DECLINED-PENDING]`, `[REQ-ORPHAN-ROW]`); waiting for his look.
**D173 REPLACES the plan below (D115's one check at the end):** (1) D114's FULL check on PR #435, then his look and
"merge live"; (2) `[ACCOUNTS]` on a NEW branch; (3) `[DRAFT-PENDING]` — the one changes window, which absorbs D116's
list, D117 and D119 (not built separately); (4) one FULL check of 2 and 3 — **AMENDED 26 Sep 26 BY D210: accounts gets its
own FULL check first, the window its own later.** The text below is the plan as it stood.
Built on `claude/amendment-batch` before the full check (D115): **D114** (a request taken off / put on a published day
is one change — built, red first, NOT yet walked or read), **D116** (Edit Schedule's History button a toggle like the
board's), **D117** (the Edit history list: the whole week, a day picker), **D118** (`[DRAFT-PENDING]` — waits on his
answer), **D119** (the pending list newest first). Then ONE FULL-tier check over all of them (the bug-check order: Fable
and Astra's reads — the D114 brief is `raptor-port/docs/superpowers/briefs/2026-09-25-d114-read-brief.md`, widen it to
the rest — the walk on desktop and phone, the full gates, the evidence sheet). Nothing is "ready for merge live" before
that check. **Place:** now, on this branch.


*Moved here 2026-09-27 by backlog-archive.mjs ([TRK-PALETTE-ASK]). Forward facts: `.claude/rules/decisions/tracker.md`, `raptor-port/docs/handpass/2026-09-26-trk-palette.md`.*

### [TRK-PALETTE-ASK] The Tracker's own dark palette, or Raptor's? — ask him once (filed 24 Sep 26)
**ANSWERED (D157, 24 Sep 26): Raptor's, FULLY** — backgrounds, text and the event colours (`tracker.css` variables and
`app/core.js` `TYPE_COLOR` / `GRADE_FILL`). Shown to him first as three versions of the real chart. LOOK tier plus a
phone look that the chart still reads at a glance. **Place:** NOW — being built on `claude/tracker-palette`, in
parallel with `[ACCOUNTS]` (his instruction of 26 Sep 26: port 4180, rulings D230–D239).
From the 7 Sep 26 device pass (`HANDOFF.md` §Open, "OWNER'S DEVICE PASS", archived 24 Sep 26 in
`raptor-port/docs/archive/handoff-2026-09-24.md`): one open question rode the retired bug-testing list's row
#376 — whether the Tracker keeps its own dark palette or takes Raptor's. It was recorded nowhere else. Ask him
once, in his next Tracker session; build nothing until he answers.
*Moved here 2026-09-27 by backlog-archive.mjs ([POST-OUT-OUTCOMES]). Forward facts: `raptor-port/docs/handpass/2026-09-27-post-out-outcomes.md`.*

### [POST-OUT-OUTCOMES] A posting out says WHICH of its outcomes it is; accounts suspended and deleted (D229, D280, D283–D285, filed 26 Sep 26)
**His rulings:** a posting out is (1) overseas to another squadron → archived, account SUSPENDED, back AS HE WAS with a
prompt to update his quals (D284); (2) leaving flying for good → account DELETED; (3) another workplace, still flying
with us → SANS on the date: with Show SANS off the Leave War shows him posted out, untracked, with it on he joins the SANS
group that day, tracked (D283); (4) a transfer — future, `[XFER]`. Buttons: "Suspend" / "Enable", "Delete account"
(D285). **Today:** the post-out sheet's one choice is "Archive on PO date"; an archived man keeps a WORKING account;
Admin → Users has "Switch off / on", no delete. **To build:** the sheet asks which outcome and the app does it on the
date (each also by hand); touches the Leave War (the sheet, `runPoArchive`), Quals, Admin → Users, data-model §11 (`User`
D), `perms.ts` — FULL tier. **Leaving flying for good — D287, his pick "B, truly delete him":** account AND person
deleted; **D297: every day he already flew keeps his puck, published or not; days still to come lose him**;
everything that is his goes too (inputs, Leave War leave and OIL — nothing left stored unseen); a day still to come
takes him off (pending on a published day); asks twice, cannot be undone. **Underneath — D290 "hidden mark":** his
row is kept, marked deleted and invisible everywhere (the data model's tombstone), never erased. **And names — D286:** an archived man's callsign may go to a new person (today it is refused); restoring him while it
is in use needs one of the two renamed first (Restore says so, renames nobody). Update `roster-add.ts` (its PID-01
header and test), `ID_BY_CS` (points at the roster's man). **Mock-up APPROVED 27 Sep 26 (D299) — the design of record:** `raptor-port/docs/mock/post-out.html` (+ its Artifact; §5 holds what stays after a delete; D300 — the date once, the button "Post out", FEWER WORDS: done 27 Sep 26, Artifact Version 6; the BUILD carries the same short words — the sheet's line, the delete's second tap, the suspended sign-in, the back-prompt, the Restore rename line — and the post-in button reads just "Post in"); his first look: D294 (short chips "Overseas Sqn" · "Delete" (D298) · "SANS" · "Transfer to Sqn"), D295 (rename an archived man directly), D296 (guest mark A). **With it — D292:** the admin's member view back (tap the badge: "SABER · ADMIN" ↔ "MEMBER"; perms read the role in
force). **Place — D291:** straight after `[ACCOUNTS-NEW-PERSON]` merges, before `[DRAFT-PENDING]` — **amended by D301
(27 Sep 26): started beside #443 before it merges, on `claude/post-out-outcomes` cut from it; its merge follows #443's.**
**BUILT 27 Sep 26 on `claude/post-out-outcomes`** (Part A: the callsign index, Suspend / Enable / Delete account, the
member view, the delete, Quals' Archived list; Part B, on PR #444's posting code: the four chips on every posting door,
the outcomes on the date, take-back, Restore and Restore-as, the "he's back" prompt, SANS with Show SANS, a deleted man
read by date, Undo passing over a step that would bring him back). Plan: `raptor-port/docs/superpowers/plans/2026-09-27-post-out-outcomes-plan.md`;
register PO1–PO12 (`raptor-port/docs/superpowers/specs/2026-09-26-accounts-behaviour-register.md`). **FULL check DONE
27 Sep 26** (the walk A–D on desktop and phone, Fable and Astra's code reads — every finding fixed red-first — and the
gates): the evidence sheet `raptor-port/docs/handpass/2026-09-27-post-out-outcomes.md`. **Next: his look** (the look card,
its §10 — 11 questions) **and his "merge live", merged LAST** (after #443, #445 and #444, `main` merged in first).
**His answers so far (27 Sep 26):** 1 keep (D303), 3 the real calendar date (D304), 4 — the man himself should be able to
update his own quals (D305; its form put to him), 9 the last admin's posting waits (D306), 11 Enable on a hand-suspended
man shows the note (D307).
**Not built, said so:** the Tracker half of D299 (`[POST-OUT-TRACKER]`).


*Moved here 2026-09-27 by backlog-archive.mjs ([POST-OUT-ASKS]). Forward facts: `raptor-port/docs/handpass/2026-09-27-post-out-outcomes.md`, `.claude/rules/decisions/how-we-work.md`.*

### [POST-OUT-ASKS] The post-out look card's questions he has not answered — each built to its default (filed 27 Sep 26)
From `raptor-port/docs/handpass/2026-09-27-post-out-outcomes.md` §10 (PR #446, merged 27 Sep 26). He answered 1, 3, 4, 9,
11 (D303–D307) and moved 3a / 3b into `[ONE-DOOR]` (D310); these stand as built until he says otherwise — put them to him
once, in plain words, when the posting-out screens are next in front of him (the `[ONE-DOOR]` mock-up is the natural
moment): **2** a Delete on an archived man with no account — covered by `[ONE-DOOR]` (an archived row gets Restore ·
Delete), so likely answered by its approval; **6** SANS on the date moves his WHOLE Leave War row into the SANS group,
earlier months included (the approved picture) — kept; **7** archiving a man makes his published days before the posting
date read "1 pending" — kept; **8** a posting out is not a step of the Undo button — "Undo post out" takes it back —
kept; **10** an admin may still add leave or OIL on a deleted man's past days — allowed.


*Moved here 2026-09-27 by backlog-archive.mjs ([BACKLOG-TIDY]). Forward facts: `.claude/rules/decisions/how-we-work.md`, `raptor-port/scripts/docsize.mjs`.*

### [BACKLOG-TIDY] This file crossed its size tripwire — read each item, archive what is finished (filed 26 Sep 26)
`OUTSTANDING.md` reached 1,242 lines against the 1,150 tripwire (D141: the question is "is a finished item still sitting
here?", never "cut to a number"); the tripwire was raised to 1,260 so the rulings change D200/D201 did not trim under
pressure (D29). **Do:** read the long items first (`[ARCH-STACK]`, `[DRAFT-PENDING]`, `[REPO-PRIVATE]`, `[OIL-AUTO-REMOVE]`,
`[HUMAN-RETEST]`, `[GLOBAL-UNDO]`, `[OIL-READ-LEFTOVERS]`); move what is finished with `backlog-archive.mjs`, its lasting
facts first given a live home; then set the tripwire back near what the file holds. **Place:** docs only, any time. **His go, 27 Sep 26 (D324): now, on its
own branch `claude/backlog-tidy` cut from `main`, merged BEFORE `[ONE-DOOR]` and `[LW-MOVE-STANDARD]` (his "merge live").**


*Moved here 2026-09-27 by backlog-archive.mjs ([LW-MOVE-BENEATH]). Forward facts: `.claude/rules/decisions/leave-war.md`, `raptor-port/docs/handpass/2026-09-27-lw-move-standard.md`.*

### [LW-MOVE-BENEATH] A bulk Move leaves behind a bid that shares its day with leave filed on the Inputs page — low (W3-F3, 26 Sep 26)
Found by the absence-record re-test's war walker: Ghost has a morning of leave filed on the Inputs page and an afternoon
bid beside it; a dragged block over that day, then Move…, says "move 2 entries" and leaves his afternoon bid where it
was. Its Delete half is FIXED on the re-test's branch (the bid beneath goes, the filed leave stays — `store.ts
clearRequestsAt`); Move is not the same fix, because the filed leave STAYS (it is the Inputs page's) while the bid would
travel alone, and where it lands beside another day's records is a design question (the move lands all-or-nothing on
the TOP record today). **Build:** decide whether the bid travels alone (landing only on a day whose same half is free)
or the whole day is refused with a sentence naming the filed leave; then red first. Evidence
`raptor-port/docs/handpass/parts/2026-09-26-absence-w3.md` §W3-F3. **Place:** low; with [LW-LOCKMARK] (the lock by day
vs by record is the same root).
**Its sibling (Fable's D260–D262 scenarios, S3, 27 Sep 26):** a bid that shares its day with an OIL AWARD cannot be moved
by any door — the ladder puts the award above the bid, so the day's top record is not movable: the one-day sheet does not
open (two records open the tap list, whose bid line has no Move), and a dragged block's Move… does not offer it. The same
root — a move reads the day's TOP record — and the same decision (the bid travels alone, landing where its half is free).
Pre-existing; not his ruling. **DECIDED 27 Sep 26 BY D265** (`.claude/rules/decisions/leave-war.md`, his pictures of Vector's
3 Jan): a record that can move always offers Move and travels ALONE — the award, and Inputs-filed leave, stay where they
are; landing rules unchanged. Built by `[LW-MOVE-STANDARD]`.


*Moved here 2026-09-27 by backlog-archive.mjs ([LW-MOVE-STANDARD]). Forward facts: `.claude/rules/decisions/leave-war.md`, `raptor-port/docs/handpass/2026-09-27-lw-move-standard.md`, `raptor-port/docs/ui-contracts.md`.*

### [LW-MOVE-STANDARD] One look for the Leave War's sheets, and a Move on every record that can move — his D264–D266 (27 Sep 26)
**His rulings** (`.claude/rules/decisions/leave-war.md` D264, D265, D266, 27 Sep 26, with four phone pictures from his look
at PR #444): **D264** the one-day sheet and the drag-selection sheet share one format and look (the rows in one order; Move
and Delete / Clear the same buttons, in the same place); **D265** a record that can move always offers Move — a bid beside
an OIL award or beside Inputs-filed leave moves alone (today a move reads only the day's TOP record, so Vector's 3 Jan, an
award above an LL bid, offers no Move in the day's list or in a dragged block); **D266** the day's list (several records)
moves each record by the grid's move mode, no date box — he chooses which. **Build:** (1) a mock-up of the real sheets at
desktop and phone, his approval first (D264 is visual); (2) a move carries the RECORDS it picked, not the day's top one
(`store.ts` `moveCells` / `movableCells` / `shiftBid`, `moveAbsenceById` by record id; `Matrix.tsx` `moveSel`); (3) the
day's list's Move picks its record up into the move mode, its date box goes (`DayList.tsx`); (4) the sheets to the approved
layout (`BidPicker.tsx`, `SelectSheet.tsx`). Red first each. **Tier:** FULL (a record's move — the absence record and what
is saved); walk both widths; both reads. Folds in `[LW-MOVE-BENEATH]` (decided by D265). **Place (D267, his
"1", 27 Sep 26):** NEXT after PR #444 merges — on a NEW branch from `main`, in a fresh chat; the mock-up first.
**Started 27 Sep 26** on `claude/rulings-d264-d266-leave-war-f0f4ab` (beside `[ONE-DOOR]` on `claude/one-door` — no shared
function; rulings D330–D339). **The mock-up is up for his answers:** `raptor-port/docs/mock/lw-move-standard.html` (and its
Artifact), made by `raptor-port/scripts/handpass/am/mk-lw-move-standard.mjs` — four questions: the order (A what's there
first — recommended — or B new leave first), one word "Delete" for the one-day Clear and the block's Delete, a
member's Move on his own bid's one-day sheet while bidding is open, and the Move button's look (D330 — one look on every
sheet, a little apart; four designs in section 7, B the grey chip with a teal arrow recommended). **ANSWERED 27 Sep 26 —
"1 A, 2 yes, 3 yes, 4 B, 5 keep" (D331–D335): the mock-up is the design of record; the build is next.**
Fable's scenario design (bug-check order §4 rank 1): `raptor-port/docs/superpowers/specs/2026-09-27-lw-move-standard-scenarios-fable.md`
(the roll-call, 32 ranked scenarios, six contradictions and how each is taken — stated on the mock-up page).
**BUILT and FULL-checked 27 Sep 26** on this branch — evidence `raptor-port/docs/handpass/2026-09-27-lw-move-standard.md`:
walked 40/40 at both widths, 26 wires broken on purpose (each turns a named test red), Fable's and Astra's blind reads
(six findings, all fixed red first; re-walked). **Next: his look (§10 of the sheet) and "merge live"**; then this item and
`[LW-MOVE-BENEATH]` (built by it) go to the archive.


*Moved here 2026-09-28 by backlog-archive.mjs ([LW-FIGSEL-SLOW]). Forward facts: `raptor-port/src/leavewar/ui/figselect.test.tsx`, `raptor-port/src/leavewar/ui/figdrawer.test.tsx`.*

### [LW-FIGSEL-SLOW] One Leave War unit test times out under a full parallel run (23 Sep 26)

`src/leavewar/ui/figselect.test.tsx` "an undo, a stage change and the drawer toggle all drop it" takes ~4–5s
alone (3.9s on the final tree; the same on the code before the Leave War fixes) but ran past its 20s limit in
2 of 3 full `npm test` runs on the owner's PC on 23 Sep 26 (another chat's worktree active). Pre-existing,
load-only. Fix: split its three drop cases into three tests (each renders the whole year once), or give it its
own longer limit — not a pause. Evidence: `raptor-port/docs/handpass/2026-09-23-lw-monthjump.md` §13/§15.
**Seen again 27 Sep 26** (`claude/one-door`, its first full gate run, two code reads running beside it): this test (23.9s) and
`src/leavewar/ui/figdrawer.test.tsx` "stands down to taps while an admin is rearranging" (24.8s) both past 20s; both pass alone —
the fix above covers the second too (it renders the whole year the same way).


*Moved here 2026-09-28 by backlog-archive.mjs ([ONE-DOOR]). Forward facts: `raptor-port/docs/handpass/2026-09-27-one-door.md`, `raptor-port/docs/ui-contracts.md`.*

### [ONE-DOOR] Admin → Users: one door for a person's whole state — sign-in and roster (D309, filed 27 Sep 26)
**His direction (D309):** *"just do 1 door for everything and see the state of that account all just in admin. Like
green or red dot for status, account and roster for status"* — and he asked how the buttons should read for every case
discussed (the look card's 3a and 3b, the archived list, D308's post-in date). **Today:** Admin → Users lists accounts
(an archived man tagged "archived callsign", a suspended one "suspended"), with Suspend / Enable and Delete account;
Quals has the ✕ archive, the folded Archived list, Restore, Restore as and the rename (D295); Enable on an archived man
lets him sign in while still archived (the half-state he questioned). **The agent's proposal (to his approval, by a
mock-up first):** one row per person — a dot for Sign-in and one for Roster; Active → Suspend · Archive · Delete;
Suspended → Enable · Archive · Delete; no sign-in (a man who does not use the app) → Give sign-in · Archive · Delete;
Archived (the folded group) → Restore · Delete; Waiting → Give access · Refuse; a posting waiting for its date shown on
the row. Archive also suspends; Restore brings both back, asks the post-in date (D308) and tells the man to check his
quals (3a). Quals keeps quals, CAT, flight, initials (narrows D217). **Carries:** 3a, 3b, the archived group,
`[POST-IN-DATE]`. **Place (the agent's recommendation, his call):** after PR #446 merges, its own branch — mock-up, his
approval, then the build, FULL check (permissions, roster, accounts). **APPROVED AS PROPOSED 27 Sep 26 (D310): "one door
as proposed, Quals loses archive"** — narrows D217 and D295; the mock-up shows the look before the build. **MOCK-UP
APPROVED 27 Sep 26 (D322)** — `raptor-port/docs/mock/one-door.html` is the design of record, with the agent's own calls on
it (Archive one tap; Restore turns the sign-in back on even when suspended by hand before; no Enable on archived rows;
renaming a roster man stays on Quals). **D323: Archive is "posted out from today" on the war, his past kept.** **And D320 ("A"): the Leave War keeps every stint** — a man back from overseas reads
"away" between his posting out and his post-in, his months before as they were (today one in/out window per man; the
build changes `inSquadron`, the war's posting record in `store.ts`, `rowInWindow`, Restore). **Next:** plan (Opus 5.5
high) → Fable and Astra red-team → build red first → walk both widths → FULL check → his look → "merge live".
**BUILT 27 Sep 26 on `claude/one-door`** (the plan's round 1 folded in — `docs/superpowers/specs/2026-09-27-one-door-plan-review-log.md`;
unit tests red first, e2e `onedoor.spec.ts` both widths). **The walk's design (Fable 5.1, 27 Sep 26):**
`raptor-port/docs/superpowers/specs/2026-09-27-one-door-scenarios-fable.md` — its §4 gaps fixed red first the same day (the
Post in sheet read-only too and both posting writers locked, a hidden man's own post-in date kept, a never-arrived delete
stores no stint, the message and the rail's words, the Archived group folding during a search, "posting in 19 Oct" on
the row). **FULL-CHECKED 27–28 Sep 26** — the evidence sheet `raptor-port/docs/handpass/2026-09-27-one-door.md` (the walk
254/0 both widths, the break tests, both final reads and every finding's disposition, the gates green). **His look, 28 Sep
26:** the Quals outline fixed (his find); answers D325–D329 recorded, D326, D327, D329 BUILT red first and walked;
questions 2 and 5 kept as built. **His "merge live" is GIVEN (D336) — the next chat merges on green, then starts
`[DRAFT-PENDING]` overnight (up to his look, never merged without his word).**


*Moved here 2026-09-28 by backlog-archive.mjs ([POST-IN-DATE]). Forward facts: `.claude/rules/decisions/how-we-work.md`.*

### [POST-IN-DATE] A man posted in: the admin is asked his post-in date (D308, filed 27 Sep 26)
**His ruling (D308):** *"When someone is posted In the app should also ask the admin when is the post in date so that the
leave war is reflected correctly. Usually a user can get access to the app a few days prior to their actual post in
date."* **Today:** a new person (Admin → Users) and a man restored from the Archived list (Quals) get no post-in date — the
Leave War counts them from always; the date exists only as the Leave War's own "Post in" button (20 Sep 26), set by hand.
**To build:** a post-in date box on every door that puts a man on the roster — New person (added, or approving a request),
Restore and Restore as — opening on today, written through `setPostIn` (the same record the Leave War's Post in writes);
his account works from the day he is added or restored, whatever the date. The new-person form gains a field (D224's
approved mock-up marked, D201); the Leave War's own Post in stays. **Size:** ~1.5–2 h with tests and a walk — permissions
and the Leave War, FULL tier. **Place: his call** — inside PR #446 before its merge, or its own branch right after #446
merges (the agent's recommendation: after, so the fully checked #446 does not grow). **Built with `[ONE-DOOR]`** (D310,
D322: Restore, New person and Give access's New person ask it) — **and D320 (27 Sep 26): Restore opens a NEW stint on the war**
(away between the posting out and the post-in), never moving his old one's start. **BUILT 27 Sep 26 with `[ONE-DOOR]`.**


*Moved here 2026-09-28 by backlog-archive.mjs ([LW-FIGSEL-FLAKE]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [LW-FIGSEL-FLAKE] A Leave War desktop browser test fails on GitHub on the changes-window branch (D342, 28 Sep 26)
`e2e/leavewar.spec.ts:2190` "-1.5 subtracts; 0, abc and 1.25 are refused and the run stays" — after a refused amount, the
figures drawer holds the WRONG number of selected cells (`td[data-figsel]`: expected 3; got 5 on 27 Sep 26 21:11, got 1 on
28 Sep 26 01:31, both tries each time), on GitHub's machines only, on `claude/draft-pending` (2 of 5 runs failed; 3 passed). **Since #451 merged it is in
`main`'s code, so it hits EVERY branch:** it failed again on `claude/pages-off` (PR #452, cut from `main`, 28 Sep 26 — 5, then 1),
while `main`'s own run after the merge passed it — about half of GitHub's runs now. It passes on the PC every time (5/5, and
4/4 with the browser slowed six-fold). **PR #451 merged over it on his
word (D342)** — the test unchanged. **To dig in (its own small branch):** reproduce on GitHub's machines (a workflow run of
that one test, repeated) with a trace; the unconfirmed lead — a redraw mid-selection on a slow machine, e.g. the change
history's save repainting the Sync chip and the drawer with it (`[DRAFT-PENDING]` added a history write to every Leave War
command, `state/changelines.ts`); compare against `main`. If it fails on `main` too, it is D84's slow-runner family.
**Place: FIRST in the next chat, before `[HIST-PHONE-HIDE]` / `[CHG-BY-ITEM]`** — a check that goes red on every other run
hides a real failure behind it, and the next build's checks would carry it. Small: make the test wait on what it needs (D87)
or fix the redraw that loses the selection.
**FIXED 28 Sep 26 on `claude/lw-figsel-flake` — the cause was the APP, not the test (the test is unchanged):** the top
bar's "Saving…" note came and went in the bar's row after every change; on GitHub's wider fonts the Leave War bar at 1440
had ~18px to spare against its ~90, so it wrapped and the page dropped two rows under the mouse mid-drag (5 or 1). The same
jump on this PC at 1366 (five pages) and, on a phone, Undo / Redo / the clock pushed ~46px right. The note now floats
under the bar (`src/ui/SaveStatus.tsx`, `scheduler.css` `.topbar > .savestat`); the contract `raptor-port/docs/ui-contracts.md`
§The top bar carries the bell…; pinned by `e2e/geometry.spec.ts` "the Saving… note never moves the top bar"; evidence
`raptor-port/docs/handpass/2026-09-28-lw-figsel-flake.md` (GitHub: 5 × 170 Leave War desktop tests, no retries, all green).


*Moved here 2026-09-28 by backlog-archive.mjs ([HIST-PHONE-HIDE]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/handpass/2026-09-28-hist-phone-by-item.md`.*

### [HIST-PHONE-HIDE] History on a phone — say it is on, and let the schedule be seen (D339, 28 Sep 26)
**His ask (D339):** on a phone the changes window covers the schedule and nothing says the bubbles are on; "maybe when it hides
on a phone it goes to the bottom of the screen"; built in ANOTHER chat. **The design put to him** (the mock-up, real app, phone
width — `raptor-port/docs/img/handpass/2026-09-28-draft-pending/histphone/histphone-mockup.png`, re-taken by
`raptor-port/scripts/handpass/dp-histphone.mjs`): (1) the panel's header gains a hide button beside ✕, labelled "Hide ▾" — a word, not
the arrow alone (his question: "how does one know that the action is to minimise?") — and a one-line hint, in fewer words at his
word — **"History on: Tap a gold dot on the schedule"** (his own wording, D344); (2) Hide sends the window to the slim bar at the bottom,
"History on · N changes" with a "Show ▴" button — Show brings the list back, ✕ turns History off; (3) while History is on, every detail
with a history wears a small gold dot just outside the puck's bottom-right corner (never a ring — D92; clear of the OG tag at the
top right) — on desktop too; the ▾ on the phone only; (4) a tap on a dotted detail opens its bubble. **APPROVED 28 Sep 26 (D345)** — the mock-up
with the labelled Hide / Show and his hint wording (D344), and the two calls — dots on desktop too, Hide on the phone only. **Place:** a fresh chat on its own branch
from `main` once PR #451 merges (the agent's reading of "another chat"), with `[CHG-BY-ITEM]` on the same branch (both change the
window). **Where it lands:** `src/ui/ChangesWindow.tsx` (Hide, the
bar's words), `src/ui/histbubble.ts` (marking the details with a history while History is on — the same keys the bubble answers),
`src/ui/scheduler.css`, `docs/ui-contracts.md` §The one changes window; WALK tier at least (a shared drawer — every puck surface).
**BUILT 28 Sep 26 on `claude/hist-phone-by-item`** with `[CHG-BY-ITEM]` — planned (Opus 5.5), red-teamed by Fable and Astra
(`raptor-port/docs/superpowers/plans/2026-09-28-hist-phone-by-item-plan.md` §9), built red first, FULL-checked
(`raptor-port/docs/handpass/2026-09-28-hist-phone-by-item.md`). Beyond the mock-up, from the red team: the dot on every
detail the bubble answers (the board's wave title and an input's row now answer too), never on a look; a text detail's
dot outside its corner; the hint where a tap raises a bubble (≤820px); the hidden bar above the ALL AVAIL window. From the
final reads: the window follows a phone turned sideways; no hint and no "History on" over a board look or a week with
nothing to dot. From the walk: a tap in and out of an input's time cell no longer writes a false "times" line.
His look card's three questions ANSWERED 28 Sep 26 — all kept as built (D346). PR #455.
**Next:** his "merge live" (`main`, with PR #454, already taken in).


*Moved here 2026-09-28 by backlog-archive.mjs ([CHG-BY-ITEM]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/handpass/2026-09-28-hist-phone-by-item.md`.*

### [CHG-BY-ITEM] The changes window sorted by item, every line item-first (D340, 28 Sep 26)
**His ask (D340):** "the main category to sort as per item, and the latest changes of that group will be the highest … in that
item can show sub categories of that item, if that item has multiple change"; the line format he prefers is the item first
("Programme · WPNS & TACTICS SYNC", then "Trident → Piston"), never the man first ("Diesel put on Programme · …"). **The design put
to him** (the mock-up, real app, phone width with real changes — `raptor-port/docs/img/handpass/2026-09-28-draft-pending/byitem/byitem-mockup.png`,
re-taken by `raptor-port/scripts/handpass/dp-byitem.mjs`): (1) "Group by: Item / Who" — Item first and the default; the old section
groups (Flying waves, Duties, Common Programme) go, the item's header carrying its section word; (2) one group per item — a
Common Programme event, a duty desk, a formation (its seats as details: "#1 RCP"), a sim, a ground event, an input — the item
whose latest change is newest on top; (3) an item with ONE change is one line (no fold); with more, a header ("Programme · SODB ·
3", its latest time) and a sub-line per change, newest first, each with who · when; a text change names its field ("Start");
(4) in the week view the day leads the header ("Mon · Programme · SODB") — the same event on two days is two items; (5) a man
moved between items shows under both ("Echo moved in from MET + NOTAM BRIEF" / "Echo moved out to SODB"), still ONE change in the
tab's count; (6) Who keeps its sittings, its lines item-first too (a move once, under the item he reached); (7) every group open by
default (a caret folds it). **APPROVED 28 Sep 26 (D345)**, the calls with it. **Narrows D168** ("Where = by the day's own sections"). **Place:** with
`[HIST-PHONE-HIDE]`, the same fresh chat and branch (both change the changes window). **Where it lands:** `src/ui/changesmodel.ts`
(the item of a line — the history row's place without its seat or field, from its row-anchored key, not its label; `byWhere` →
by item; the line's words item-first), `src/ui/ChangesWindow.tsx` (the groups and sub-lines), `src/ui/scheduler.css`,
`docs/ui-contracts.md` §The one changes window; its tests (`changesmodel.test.ts`); the walk's changes-window steps. WALK tier at
least — the window is every user's, members included.
**BUILT 28 Sep 26 on `claude/hist-phone-by-item`** with `[HIST-PHONE-HIDE]` (the same plan, sheet and look). Beyond the mock-up,
from the red team: a move within one item is ONE entry ("moved", its two places); a posting and "added to the roster" now
carry their man (two writers, `state/changelines.ts`) so they file under "Leave War · <him>" / "Quals · <him>"; every group
(Item and Who) opens by default (D345 over D167 (4)); "The day", a remark's dot and a two-day input answered as built
(D346). PR #455. **Next:** his "merge live".


*Moved here 2026-09-28 by backlog-archive.mjs ([DRAFT-PENDING]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/engine-rules.md`, `raptor-port/docs/handpass/2026-09-28-draft-pending.md`.*

### [DRAFT-PENDING] The one CHANGES WINDOW — D118, D167–D172 (25 Sep 26); step 3 of D173, after `[ACCOUNTS]` (its own FULL check — D210)
**BUILT 28 Sep 26 on `claude/draft-pending`** (overnight, D336 (2)): the plan `raptor-port/docs/superpowers/plans/2026-09-28-draft-pending-plan.md`
(§9 after the red team — `…/specs/2026-09-28-draft-pending-plan-review-log.md`); the contract `raptor-port/docs/ui-contracts.md`
§The one changes window; the history `raptor-port/docs/engine-rules.md` §The edit log; D263 built with it; the open question
below built on YES (D336 (b)) and put on his look card. FULL check: `raptor-port/docs/handpass/2026-09-28-draft-pending.md`
— the walk (desktop and phone 33/33), Fable's scenarios (12 defects, all fixed), 12 break tests, two blind final reads and
two narrow rounds on the fixes (every finding red first, then fixed), the gates green on the final code (`1270680e`).
**Next:** his look DONE 28 Sep 26 — every reading kept as built (D337, D338) → "merge live" (never without his word).
**From `[ACCOUNTS]` (26 Sep 26), to settle here:** the edit log is cleared at every sign-in and sign-out (`resetSession`
→ `elogClear`, session-only as today); with personal accounts, should the change history outlive a sign-out? The
window's "new to you" needs it to. **— ANSWERED 28 Sep 26: yes, as built (D338 (1)); the whole look card answered (D337, D338).** A member's history shows a medical change in full (D211, which narrows D169's
reading). The edit log's rows carry the person's id beside the callsign from `[ACCOUNTS]` on.
**WHAT IS SETTLED (read the rulings, not the working notes below):** D168 one changes window (New to you / All changes,
a day picker, Group by Who / Where) replacing the pending list, the hand-over idea and the Edit history list; D167 its
shape (movable, resizable, a tap takes the schedule to the change and the window stays; the phone's panel shrinks to a
bar); D169 members read it too (medical details hidden); D170 NO Hand over button — new to you until "Mark all as
seen", grouped by person and sitting; D171 the ways in — the day's count for everyone, an icon-only top-bar door with
the WEEK's count for admins only; D172 the unpublished-day corner tag reads "OG", the headings unchanged. The
mock-ups: `raptor-port/docs/mock/changes-window.html` (the design of record, option A), `changes-doors.html`,
`tags-ticks.html`; the earlier ones (`checkpoint.html`, `handover.html`, `since.html`, `handoff-accounts.html`,
`handoff-window.html`) show ideas later replaced. The working notes below are the path there.
**His intent:** when another scheduler logs in, they see what changed since the last draft. Today a never-published
day's "N pending" counts every cell touched (a move 2, put back still 2, a new puck in a crowd 0) and is not a button.
**The agent's proposal, put to him — NOT called "Save draft" (his correction: the app already saves live, so that word
misleads); a CHECKPOINT that records who set it last and when:** a button on a never-published day's head (beside
Publish; its word still to be picked — "Set checkpoint" recommended). It stores the day as the checkpoint — not issued: no version, no signatures, no amendment number, nothing for members.
"N pending" then counts the net difference from that point exactly as after a publish (the one counting body: a move 1,
put back 0, a new puck 1), and is the same button opening the same list (newest first, D119). The next scheduler reads
it, then sets a new checkpoint to start from there. A line under the day head names who set the checkpoint and
when (stored with it, so it survives a reload). Before the first checkpoint the day shows no pending; publishing
replaces the checkpoint with the Original. **Limits to tell him:** until the shared database, another scheduler sees
it only on the same device and browser (the app keeps its data per browser); who made each change reads the shared
account (D104), and after a reload older changes read "earlier" (the edit record lasts only while the page is open).
With the database it carries across devices with no change, and "since YOU last looked" per person becomes possible.
**His word: "Hand over"** (after the mock-up `raptor-port/docs/mock/checkpoint.html`). **His catch:** every scheduler
will press Hand over after their OWN changes, so one reset point would wipe the highlights before the next person
sees them. **The agent's proposal for that, put to him:** each hand over is KEPT (who, when, the day as it stood); the
marks and "N pending" show what changed since the hand over BEFORE the latest one — i.e. the last person's work, plus
anything done since — and the list splits it: "Handed over by Admin 16:00 · 3 changes" / "Since then · 1 change". So
A builds and hands over; B changes 3 things and hands over; A opens the day and sees B's 3 highlighted; A changes 1 and
hands over; B sees A's 1. **A guard:** Hand over is refused when nothing changed since the last one ("Nothing new to
hand over"), so a second press can never wipe the last person's highlights. **The cost, stated:** the last person's
highlights stay until someone else changes something and hands over — there is no "I've seen it, clear it" until
personal logins (the database) let each person see "what changed since YOU last looked".
**His next catch (after the storyboard `raptor-port/docs/mock/handover.html`):** with three or more schedulers, one who
has not looked since two hand overs ago would see only the latest person's work. **The highlights are shared** (every
scheduler sees the same ones — the app cannot tell people apart while the login is shared). **The agent's proposal:** a
**"Since" choice** at the top of the pending list — "Since the last hand over (16:30 · Admin) ▾" by default, and every
earlier hand over of the day in the menu ("16:00", "14:05" …), each with who and when. Pick an earlier one and the
count, the tags and the list widen to everything since then, grouped by hand over — so whoever has been away catches
up in one tap. It resets to the default when the list is closed (a look, not a setting). With personal logins (the
database) the default becomes "since YOU last looked". **Other options put to him:** a callsign picker on Hand over (as
the sign-off boxes have) so each person gets "since MY last hand over"; or leave it to Edit history.
**WITH ACCOUNTS (D166) — the mock-up `raptor-port/docs/mock/handoff-accounts.html`, put to him:** each scheduler is
signed in as their callsign, so each sees what changed since THEIR OWN last hand over ("4 new"), grouped by who did
it, with who and when on every line; their own not-yet-handed-over changes sit on top ("Yours · not handed over
yet"); Hand over marks their point and greys when there is nothing new; one who never handed over this day sees what
changed since the last hand over by anyone. This replaces the "Since" menu and the callsign picker, which were
stand-ins for not knowing who is signed in.
**His question: what if a scheduler never presses Hand over? — the agent's answer, put to him:** nothing waits on
it. The schedule is live (everyone sees the change itself at once — across devices from the database step); in the
changes window a scheduler's changes not yet handed over show under "Saber · still working · 2 changes" (the time
of the last one, no hand-over date), and they are NEW to everyone who has not handed over since. Hand over only does
two things: it closes YOUR group with a date, and moves YOUR "new to you" point — it never hides anything from anyone
else. So the greyed "nothing new to hand over" guard is no longer needed: a hand over with no changes of your own just
says you have looked ("Hex · looked, no changes · 25/9 16:50").
**The marks — he asked how they would look now a mark is a corner tag (D92, D93):** on a published day a waiting change
wears a hollow dotted tag at the puck's top right naming the AL it will go out as ("AL1"). An unpublished day has no
AL, so the tag needs another label. **The agent's recommendation:** a hollow dotted **ORIG** tag in the seal's plain
white, with no tick — "this change goes out with the Original" (hollow = not out yet, as for an AL; the ticked seal
means published). Other options: a hollow dotted tag with no word (a small neutral pill), or no mark at all (the
25 Aug 26 rule: an unpublished day shows none — the list does the finding). Whatever it is must not take an AL colour
or a warning colour. **A mock-up first** (the house rule for a visual change): the three side by side on the edit week
and the board, desktop and phone, beside a published day's AL1 tag. **Place:** his answer, then with `[LOOK-435]`.

**HIS D263 (27 Sep 26, "2 yes") — FOR THE WINDOW TO CARRY:** every change to an absence is a line in it — an input edited, cut by a medical, moved, deleted; the Leave War's approve, refuse, back-to-bid, move — with who (callsign) and when; today only a filing and a removal leave a line (`.claude/rules/decisions/scheduler.md` D263).
**FROM THE ABSENCE-RECORD RE-TEST (W6's first walk of roll-call row R30, 26 Sep 26 — for the window to carry):** a
late input on a published day is named in today's pending list ("Drifter · LL filed") but its line cannot be tapped —
its hover says "This change has no place of its own on the schedule to go to", though the input's row stands in the
day's Unavailable block. D99 says a tap "brings the view to that pending area"; the list's own rule ("a leave with no
row stays a still line", `raptor-port/docs/engine-rules.md`) was the builder's call, not his. **The window's jump must
reach an input's Unavailable row.** Beside it: a member's "1 pending" on the working draft is a plain label whose hover
says "until you publish an AL" (his list is this window), and the late row carries LATE but no pending mark — both for
the window's design. Pictures `raptor-port/docs/img/handpass/2026-09-26-absence/rewalk/w6/w6-desktop-admin-R30-01-pending-list-week`,
`-R30-02b-the-row-it-could-go-to`, `w6-phone-admin-R30-01-pending-list-week`; sheet
`raptor-port/docs/handpass/parts/2026-09-26-absence-rewalk-w6.md`.


*Moved here 2026-09-28 by backlog-archive.mjs ([HANDOFF-SHAPE-GUARD]). Forward facts: `raptor-port/docs/doc-budget.md`.*

### [HANDOFF-SHAPE-GUARD] The document gate does not notice HANDOFF.md losing a section or a block's end marker (found 25 Sep 26)
One span replace in `119dff45` (D176's check, on `claude/request-one-row`) ate everything from a `## Now` block's Gates
line to the gate counts — the block's last lines, its `<!-- /now -->`, the whole `## Next, in order` and the
`## Gate baseline` heading — and `npm run docsize` passed it, three commits running, into `main` (PR #437). Found and
restored from `d13162dc` by the overnight chat (`claude/leave-late-published`, 25 Sep 26). **The fix:** `docsize.mjs`
checks HANDOFF.md's shape — every `<!-- now:… -->` has its `<!-- /now -->` before the next block or heading, and the
headings `## Now`, `## Next, in order`, `## Gate baseline` are each present once, in that order. Docs/scripts only; its
own small change (a script under the gate, so a docs-only PR).
**DONE 28 Sep 26** on `claude/docs-tidy-subheads-audit-ec8f87`, as described, plus: a block outside `## Now` and a stray
end marker fail too; a break the base already had is only reported. Self-test replays the 25 Sep span replace. Where
it is described: `raptor-port/docs/doc-budget.md` §4, `.claude/rules/doc-structure.md` §The check that keeps it.


*Moved here 2026-09-28 by backlog-archive.mjs ([DOC-SUBHEADS]). Forward facts: `raptor-port/docs/doc-budget.md`.*

### [DOC-SUBHEADS] The long reference docs need sub-headings, so a chat can read one section (filed 24 Sep 26)
A leftover of `[DOC-TRIM]` (archived 24 Sep 26), which named it on 21 Sep 26 — `ui-contracts.md` "needs sub-heads so a
session can read one section" — and the spring clean did not do it. The rule it breaks is tier 2's in
`raptor-port/docs/doc-budget.md` §1: "no section over ~150 lines without sub-heads". Counted 24 Sep 26 (runs of over
150 lines with no heading line), all in `raptor-port/docs/`: `ui-contracts.md` 13 (the longest 469 lines),
`engine-rules.md` 5 (its §Validation runs 927 lines), `feature-impact.md` 1 (550), `performance.md` 1 (313). Adding
headings rewords nothing; anything more is a move (D138, `backlog-archive.mjs --move`). Docs only — no full check
run. **Place:** any time, none blocking; sooner if a chat has to read one of those sections whole.
**DONE 28 Sep 26** on `claude/docs-tidy-subheads-audit-ec8f87`: 81 heading lines, nothing else (counted that day:
ui-contracts 14 runs, engine-rules 7, feature-impact 1, performance 1 — now none over 150); read for meaning by Fable.
The standing instruction: `raptor-port/docs/doc-budget.md` §1 (tier 2).


*Moved here 2026-09-28 by backlog-archive.mjs ([RULING-HOMES-AUDIT]). Forward facts: `raptor-port/docs/superpowers/specs/2026-09-28-ruling-homes-audit.md`.*

### [RULING-HOMES-AUDIT] Check once that each ruling's named home really carries it (filed 24 Sep 26)
Found in the 24 Sep 26 skills review (D146): D16 and D17 named `raptor-port/docs/bug-check-order.md` as their home,
and no commit had ever written them there (the review wrote them in). The document gate checks only that a named
home EXISTS — and, for a new row, that the change touched it — never that it carries the ruling. A read-only audit
the same day found 24 more rows whose named homes never mention their number: D5–D13, D53, D58, D63 (How we work);
D1–D3, D15, D28, D31, D32, D43, D52 (OIL); D39, D51 (Scheduler); D64 (Tracker). Most predate the numbering and carry
the content unnumbered (the 21 Sep bug-check rulings are the order's own text). **The job, docs only:** check each
by CONTENT once; write any that is missing into its home; add the D-number beside content that is there, so a later
audit is mechanical — then consider making the gate require a NEW row's document homes to cite its number.
**Place:** any time, none blocking.
**DONE 28 Sep 26** on `claude/docs-tidy-subheads-audit-ec8f87`: the 24 rows and ten newer ones checked by content;
numbers added, four missing rulings written in (D21's "corrected" sentence never had been), eleven home cells corrected;
and the gate now fails a NEW row whose Markdown home never mentions its number. The record, row by row:
`raptor-port/docs/superpowers/specs/2026-09-28-ruling-homes-audit.md`.


*Moved here 2026-09-28 by backlog-archive.mjs ([RULINGS-SLIM]). Forward facts: `raptor-port/docs/superpowers/plans/2026-09-28-rulings-slim-down-plan.md`.*

### [RULINGS-SLIM] Every ruling loads as one short line; its full row sits beside it — NOW (owner, D390, 28 Sep 26)
**What:** his "Approve" (D390) to the slim-down proposal: each ruling row in the loaded area files becomes a one-to-two-line
short form (number, date, the rule), its full row moved whole to `.claude/decisions-full/<area>.md` (searched, never loaded);
the accounts and posting rulings (about 60 rows) move from How we work to a new People & accounts area; `raptor-port/CLAUDE.md`
gets the same treatment, last. Measured before: ~50k tokens in every chat, ~110k in a scheduler build chat; the draft after:
~12k and ~31k. **Context:** the plan, with the design, the parallel-chat story and the review log —
`raptor-port/docs/superpowers/plans/2026-09-28-rulings-slim-down-plan.md`. **Checks:** Fable and Astra red-team the plan;
Fable reads every short line for meaning (D138); both read the two script changes. **Status (28 Sep 26):** DONE. The rulings
part MERGED (PR #458). The guide step (D391, plan §2.6) built on `claude/rulings-slim-d391-078ad2`: 35 blocks of
`raptor-port/CLAUDE.md` moved whole to `raptor-port/docs/guide-full.md`, each leaving a one-line short form (≤ 350 characters),
paired by the gate (`docsize.mjs guidePairing`); the guide ~16.2k → ~9.5k tokens; Fable's meaning read folded; his "merge live"
given 28 Sep 26. The Leave War row of §Where things live was left to `claude/small-fixes-batch-d223f6`. The proposal's optional
question 4 (the older "settled before" notes) stays unasked (plan §2.1); moving the map's long rows is filed as `[GUIDE-MAP-ROWS]`.

*Moved here 2026-09-28 by backlog-archive.mjs ([TRK-RETEST-NOTES]). Forward facts: `raptor-port/docs/handpass/2026-09-28-trk-leftovers.md`, `raptor-port/docs/ui-contracts.md`, `.claude/decisions-full/tracker.md`.*

### [TRK-RETEST-NOTES] The Tracker walk's smaller notes — filed, not fixed (23 Sep 26)
**Place:** after the Tracker `[HUMAN-RETEST]` merges; none blocks it. Found by the three walkers
(`raptor-port/docs/handpass/parts/tracker/w1.md`, `w2.md`, `w3.md`), each with its picture there.
Marked **his call** where the answer is product direction, not a defect.
**Being built 28 Sep 26** on `claude/tracker-leftovers-f79d36` (plan `raptor-port/docs/superpowers/plans/2026-09-28-tracker-leftovers-plan.md`; re-walked on that day's build first — the first note and O6 were already fixed). **His answers, 28 Sep 26:** the N.A. failures leave the Failures card too (**D370**); failures take their X by DAY, − takes back the latest day (**D371**); a pace, end-date or lull change is an undo step (**D372**). The same day, re-put in plainer words: a future day is refused in Done on, Failed on and both Last Flown boxes (**D374**); a course a students import adds joins at the bottom of the list — keep, not a defect (**D375**).
- **Entering ✎ Edit chart layout moves a scrolled chart** 190–240px (ACG-04 500 → 262; back to 449, not
  500) — the code means to keep the view (`toggleArrange`); the arrange canvas drops the centring slack
  (`padBoard`) without moving the scroll by it. A real defect, small. (w2 off-list)
- **The Failures card still counts failures on an N.A. event** while the ball hides its ticks — his call. (w2 N1)
- **The X labels follow the order failures were RECORDED, not their days**; − takes back the last
  recorded — his call. (w2 N2)
- **Ctrl+Z right after a pace / end-date / lull change takes back an OLDER mark** (those are not in the
  history; the ↶ tooltip is honest, the key is not). (w2 N3)
- **A slowly typed date undoes through half-typed years** (Upchit read 02/11/0202) — the Done-on box
  now ignores half-typed years (W2-F2); the Last Flown, down-days and upchit boxes do not. (w2 N4)
- **A press on another student's red failure tick grades the picked student** instead of picking the
  owner of that slice (a thin target). (w2 N5)
- **+ Set lull period opens on the last month looked at**, not this month. (w2 N6)
- **A future "Done on" day is accepted** (Currency then reads "−1d") — his call; D123 lets it come back
  down. (w2 N7)
- **After a students import a course new to the app is added after the app's own courses** (the
  course-order twin of F6); students are demo data under D120, so low. (w1 O3)
- **On a phone the Crew box reads "STUDEN…" for every student** (88px at every width under 1050). (w3 O1)
- **A + Add dialog left open while the roster changes keeps its old list** (keyboard-only). (w3 O3)
- **At 844×390 Raptor's own top bar is 149px** (the desktop menu in two rows) — a shell matter; the
  Tracker's column now fits under it (w3-F3). (w3 O4)
- **A `scheduler.css` comment says a dozing page's insides read 0×0** — they report full boxes. (w3 O5)
- **At 1200px the status beside ✓ Save changes shortens to "● un…"** (whole on hover) — the price of the
  fixed save corner (w3-F5); the button says what matters.
**DONE 28 Sep 26** on `claude/tracker-leftovers-f79d36`: every note above built (C1, C5–C7, C10, C11, C13, C14), ruled by him (C2–C4, C8, C9 — D370–D372, D374, D375) or filed on its own (C12 → `[SHELL-SIDEWAYS-BAR]`, C13's check → `[LW-DOZE-GUARDS]`); walked, re-walked, read by Fable and Astra — evidence `raptor-port/docs/handpass/2026-09-28-trk-leftovers.md` §9.


*Moved here 2026-09-28 by backlog-archive.mjs ([TRK-EDIT-SIDEWAYS]). Forward facts: `raptor-port/docs/handpass/2026-09-28-trk-leftovers.md`, `raptor-port/docs/ui-contracts.md`, `.claude/decisions-full/tracker.md`.*

### [TRK-EDIT-SIDEWAYS] Edit chart layout on a sideways phone leaves the chart no room (23 Sep 26)
**Place:** after `[TRK-PINCH-DRAGS-BALL]`. At 844×390 the tool strip fills the screen and the chart area is
0px — nothing to see, drag or pinch (picture `docs/img/handpass/2026-09-23-tracker-pinch/after-phone-sideways-edit-no-room.png`).
Upright it keeps 446px. Older than the pinch fix (F-C in its sheet). A layout job: fold or scroll the strip sideways.
**His pick, 28 Sep 26 — D373: FOLD** (the tool in use, ⤢ Fit and "Tools ▾" opening the whole set over the chart; the note, the hint line and the Flow / Info / Show All tabs step aside while editing on a short screen) — from the mock-up `raptor-port/docs/img/handpass/2026-09-28-trk-leftovers/mock/`; being built on `claude/tracker-leftovers-f79d36`.
**DONE 28 Sep 26** on `claude/tracker-leftovers-f79d36`: the fold (D373) built, with the canvas re-fitted on a turn and never taller than its box; evidence `raptor-port/docs/handpass/2026-09-28-trk-leftovers.md` §3.5.


*Moved here 2026-09-28 by backlog-archive.mjs ([TRK-SESSION-PICK]). Forward facts: `raptor-port/docs/handpass/2026-09-28-trk-leftovers.md`, `raptor-port/docs/ui-contracts.md`, `.claude/decisions-full/tracker.md`.*

### [TRK-SESSION-PICK] The Tracker reopens on the previous person's course and student after a sign-in (filed 26 Sep 26)
Astra's read of `[ACCOUNTS]` (finding 3): `tracker/app/core.js endSession` clears undo, dialogs, modes and search, but not
the selected course and student, and the "last course / last crew" it remembers is per browser, not per person — so the
next person on the same browser opens on the last one's pick. Not a leak (the Tracker is everyone's, D121), a wrong
starting point. **Do:** start each sign-in on the default course and no student, or keep the "last pick" per person
(`tracker/role.js` would carry who signed in); extend `retest.test.tsx` F10 across a sign-out. **His pick, 28 Sep 26 — D376: "own place"** — each person reopens on their own last course and student; being built on `claude/tracker-leftovers-f79d36`. **Place:** low — the next
Tracker change; its smoke suite pins the "last pick" behaviour, so it is not a one-liner.
**DONE 28 Sep 26** on `claude/tracker-leftovers-f79d36`: each person's own course, chart and student (D376, reading 5 added from Fable's final read); evidence `raptor-port/docs/handpass/2026-09-28-trk-leftovers.md` §3.1.


*Moved here 2026-09-28 by backlog-archive.mjs ([TRK-DLG-LEFTOVERS]). Forward facts: `raptor-port/docs/handpass/2026-09-28-trk-leftovers.md`, `raptor-port/docs/ui-contracts.md`, `.claude/decisions-full/tracker.md`.*

### [TRK-DLG-LEFTOVERS] Two small gaps in the Tracker's question box (25 Sep 26)
**Place:** low — with the next Tracker change that touches `Modals.jsx` or `core.js` `_dlgShow`. Found by Fable's read
of `[TRK-SMOKE-ADD-RACE]` (F2, F3), both older, read from the code: (1) a second question opened while one is open
(reachable by Tab to a control behind the shade, then Enter) replaces it, and the first one's job waits forever --
fix: `_dlgShow` answers an open question as cancelled before showing the next; test: `uiPrompt('a')` then
`uiPrompt('b')`, the first resolves null. (2) Enter pressed while a phone keyboard is still composing a word
submits the half-typed text — fix: skip Enter when `e.nativeEvent.isComposing` (the text box and the search); test
with `isComposing: true`. Detail: `raptor-port/docs/handpass/2026-09-25-trk-add-race.md` §8.
**DONE 28 Sep 26** on `claude/tracker-leftovers-f79d36`: a second question waits (FIFO) instead of stranding the first, the door behind a question is shut, and a composing Enter is not an answer; evidence `raptor-port/docs/handpass/2026-09-28-trk-leftovers.md` §3.2.


*Moved here 2026-09-28 by backlog-archive.mjs ([TRK-BAKE-STALE]). Forward facts: `raptor-port/docs/handpass/2026-09-28-trk-leftovers.md`, `raptor-port/docs/ui-contracts.md`, `.claude/decisions-full/tracker.md`.*

### [TRK-BAKE-STALE] The chart-baking script no longer runs (found 23 Sep 26)
`raptor-port/scripts/tracker/bake-user-charts.mjs` resolves `src/data/…` from `scripts/` (the folder
does not exist — the data is `src/tracker/data/`), reads name-keyed charts (before the 13 Sep ids) and
the one-table `eventInfo` (before D126). The D120 route (export → wipe → import) does not need it; fix
it only if baking a chart into the shipped data comes back. **Place:** low, after `[TRK-RETEST-NOTES]`.
**DONE 28 Sep 26** on `claude/tracker-leftovers-f79d36`: the bake runs again from a current export (`scripts/tracker/bake-lib.mjs`, pinned by a test on a real export); evidence `raptor-port/docs/handpass/2026-09-28-trk-leftovers.md` §9.


*Moved here 2026-09-29 by backlog-archive.mjs ([UNDO-ROSTER-SETTINGS]). Forward facts: `raptor-port/docs/undo-contract.md`.*

### [UNDO-ROSTER-SETTINGS] The one Undo does not cover roster or settings edits, though his 16 Sep 26 rule says it should (found 24 Sep 26)
Found by the amendment re-test's rule-to-test mapping (register AM39d,
`raptor-port/docs/superpowers/specs/2026-09-24-amendment-behaviour-register.md`). His 16 Sep 26 rule, recorded in the
command-layer design (`raptor-port/docs/superpowers/specs/2026-09-16-arch-stack-2-command-layer-design.md`): roster
and settings edits ARE undoable — ordinary user changes, never amendments. The "never amendments" half holds; the
"undoable" half is not built: the global undo's cutover lists only the schedule, the Leave War, inputs and plans
(`raptor-port/src/state/undo-wire.ts`, `setCutoverModules(['sched', 'lw', 'inputs', 'plan'])`), so adding a person,
renaming a callsign or changing a Logic setting cannot be undone. **Place:** the change-recording re-test (D147,
second after the absence record) — it is the one undo's own subject; build it there with D148 (undo only your own
changes). Walk it first: confirm on screen that Undo stays greyed or skips a roster / settings edit. **WALKED 28 Sep 26 (it skips them —
`scripts/handpass/cr-base.mjs`); STARTED on `claude/change-recording-retest`. Scope narrowed by D350: adding, archiving,
restoring, deleting a person and postings stay out (`[UNDO-POSTING-RECORD]`); everything else on Quals, Admin, the Logic
page and the templates becomes undoable.** **BUILT 28–29 Sep 26 on `claude/change-recording-retest`** (B1–B9 of the
plan; `undo-contract.md` §4, the register AM39d–AM39f) — closes when that branch merges.
**Accounts (26 Sep 26, `[ACCOUNTS]`):** the accounts, the access requests and the guest switch are three more settings
records, so they join this item: when settings are cut over to the one undo, an account restore must re-check the
guards `[ACCOUNTS]` enforces at the write (at least one admin keeps access; an admin never changes his own account),
or an undo could lock the squadron out.


*Moved here 2026-09-29 by backlog-archive.mjs ([UNDO-TOPBAR]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [UNDO-TOPBAR] Every Undo / Redo pair in the top bar, laid out as Edit Schedule's — desktop and phone (D347, 28 Sep 26)
His ruling D347 (`.claude/rules/decisions/how-we-work.md`): *"all undo and redo buttons should be at the top bar …
standardised … Like how the edit schedule is"* · *"Review both desktop and mobile too"*. Today the pair is in the top bar
on Edit Schedule only (`src/ui/Shell.tsx` `.tb-hist`), in the board's own bar (`src/ui/SchedBoard.tsx`), in the Leave
War's Period row (`src/leavewar/ui/Chrome.tsx`) and in the Tracker's header (`src/tracker/components/Header.jsx`, its
own undo); Inputs, Quals, Admin and the Logic page carry none (walked 28 Sep 26 — `scripts/handpass/cr-base.mjs` B5).
**To do:** the readings in D347's row — a mock-up of the real app first (desktop and phone), then the build and a walk at
both widths. **D348 (the same day):** on a phone the order is the desktop's — Undo · Redo (· the clock on Edit Schedule) ·
the sync dot · the bell at the far right; the changes clock stays on Edit Schedule only. **APPROVED 28 Sep 26 (D349)** —
the mock-up `raptor-port/docs/mock/undo-topbar.html` (version 4) is the design of record: the Tracker's own pair moves too;
the board's bar gets Undo · Redo · History · Sync · the bell and ONE exit, ✓ Done (Close goes); on a phone Sort all and
the layout switch sit behind one ⋯ in its second row. **Place:** built with the change-recording re-test, on `claude/change-recording-retest` (its plan:
`raptor-port/docs/superpowers/plans/2026-09-28-change-recording-plan.md`). **BUILT 29 Sep 26 on that branch** (B10 —
`ui/topbits.tsx`, the register AM39g; `ui-contracts.md` §The top bar carries the bell and the Undo / Redo pair) — closes
when it merges.
*Moved here 2026-09-29 by backlog-archive.mjs ([AVAILWIN-PREVIEW-BAR]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/handpass/2026-09-28-small-fixes.md`.*

### [AVAILWIN-PREVIEW-BAR] On the desktop board the ALL AVAIL window, opened from a preview, covers the preview bar (found 24 Sep 26)
**BUILT 28 Sep 26 on `claude/small-fixes-batch-d223f6`** (the small-fixes batch; evidence `raptor-port/docs/handpass/2026-09-28-small-fixes.md`; plan `raptor-port/docs/superpowers/plans/2026-09-28-small-fixes-batch-plan.md`) — both floating windows open below the board's preview bar (`ui/floatwin.ts BOARD_BAR`); to the archive with the merge.
Found by the amendment re-test's walker W2 (W2-F7). Saturday's board → plans selector → Original → tap the ALL AVAIL
count: the window docks top-right (`raptor-port/src/ui/scheduler.css`, its default right/top) exactly over the board's
preview bar — "Load onto working copy" hidden, "← Back to live copy" mostly covered. It can be dragged aside by its
grip; the week and the phone board are fine. **To do:** open it below the bar when the board is previewing (or dock
it clear of the bar always). LOOK tier. **Place:** low; with the next [ALL-AVAIL-WINDOW] or board change.


*Moved here 2026-09-29 by backlog-archive.mjs ([GHOST-FLAG-SHADOW]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/handpass/2026-09-28-small-fixes.md`.*

### [GHOST-FLAG-SHADOW] A dragged flagged puck loses the ghost's dark "lifted" shadow (filed 26 Sep 26)
**BUILT 28 Sep 26 on `claude/small-fixes-batch-d223f6`** (the small-fixes batch; evidence `raptor-port/docs/handpass/2026-09-28-small-fixes.md`; plan `raptor-port/docs/superpowers/plans/2026-09-28-small-fixes-batch-plan.md`) — the ghost keeps its own ring and its depth rides the veil (`scheduler.css .lift`); to the archive with the merge.
The five-flags walk (W1, `…/w1/B2-desktop-mouse-ghost-of-saber.png`): the ghost clones the puck, and a flagged puck's red
ring (`.puck.boxred`, `!important`) replaces the depth shadow `.dragimg.lift` adds, so the carried puck keeps its red ring
and the cyan veil but not the shadow that makes it read as lifted. Anyone's flagged puck; the same on `main`. **Do:** carry
the depth shadow where the ring cannot eat it (the veil is inside a clipped puck, so not there — a wrapper, or the
ring on the veil and the shadow on the clone). LOOK tier. **Place:** low, any time.


*Moved here 2026-09-29 by backlog-archive.mjs ([ALLAVAIL-OPEN-ROW]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/handpass/2026-09-28-small-fixes.md`.*

### [ALLAVAIL-OPEN-ROW] An ALL AVAIL on an open-ended row shows no count chip — not yet looked at (filed 26 Sep 26)
**BUILT 28 Sep 26 on `claude/small-fixes-batch-d223f6`** (the small-fixes batch; evidence `raptor-port/docs/handpass/2026-09-28-small-fixes.md`; plan `raptor-port/docs/superpowers/plans/2026-09-28-small-fixes-batch-plan.md`) — D360 built — the count over the assumed length, no OIL, the admin told why; a row with no start gets its own "?"; to the archive with the merge.
Seen in passing by the five-flags walk (W1): ALL AVAIL placed on DINNER WITH CMD (18:30, no end time) drew no count chip,
so that row has no door into the ALL AVAIL window. Possibly D31's "nothing to measure" refusal, as designed — check
against D31/D41 first. **Place:** low, investigate before building anything.
**Investigated 28 Sep 26 (the small-fixes batch): a gap, not D31 — the count rides the OIL walk, which skips a row
without both times. His answer, D360 ("ok, need to say something like no oil worked out due end time to the admin"):
build the count over the one-hour default, credit nobody, and say so to the admin.** Building on `claude/small-fixes-batch-d223f6`.


*Moved here 2026-09-29 by backlog-archive.mjs ([LW-ISO-DATES]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/handpass/2026-09-28-small-fixes.md`.*

### [LW-ISO-DATES] Three Leave War places print the raw machine date — low (the absence-record re-test, W4-2, 26 Sep 26)
**BUILT 28 Sep 26 on `claude/small-fixes-batch-d223f6`** (the small-fixes batch; evidence `raptor-port/docs/handpass/2026-09-28-small-fixes.md`; plan `raptor-port/docs/superpowers/plans/2026-09-28-small-fixes-batch-plan.md`) — two date voices, every sheet (`leavewar/ui/dates.ts`); to the archive with the merge.
The bid sheet's header and its PI / PO buttons ("Ranger 2026-07-17", "Post in from 2026-08-10"), the selection sheet's
header for ONE day ("Saint 2026-08-06 · 1 day" — a two-day one reads "6 Aug 26 – 7 Aug 26") and the move banner's refusal
("That lands on 2026-08-12 which is already booked") print the stored date; the tap list beside them reads "Sat 18 Jul".
The day-first date voice everywhere else (`raptor-port/docs/ui-contracts.md`). **Added 27 Sep 26:** the member's
read-only "Your OIL award" sheet (D261, `BidPicker.tsx AwardSheet`) prints its date the same way as its siblings, on
purpose, so the batch changes them together. **Build:** one wording batch over every
Leave War sheet together, with their tests (many tests pin these strings). Evidence
`raptor-port/docs/handpass/parts/2026-09-26-absence-w4.md` §W4-2. **Place:** low, any time; not his ruling.


*Moved here 2026-09-29 by backlog-archive.mjs ([LW-SPARE-MOVE-DOORS]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/handpass/2026-09-28-small-fixes.md`.*

### [LW-SPARE-MOVE-DOORS] Two old move doors no screen uses any more — low (Fable's final read, 27 Sep 26)
**BUILT 28 Sep 26 on `claude/small-fixes-batch-d223f6`** (the small-fixes batch; evidence `raptor-port/docs/handpass/2026-09-28-small-fixes.md`; plan `raptor-port/docs/superpowers/plans/2026-09-28-small-fixes-batch-plan.md`) — `shiftBid` / `moveAbsenceById` retired, their tests through the one door; to the archive with the merge.
Since `[LW-MOVE-STANDARD]` every move goes through `store.ts moveRecords` (the records it picked). `shiftBid` (the old
single-bid mover — it reads the day's TOP record) and `moveAbsenceById` (the day's list's old date-box move) now have no
production caller, only their tests; two doors that read differently from the one in use will drift. **Do:** retire both
and move what their tests pin (the dotted mark's original origin on a chain of moves, the locked-week refusal, a wrong id
moving nothing) onto `moveRecords` tests. **Place:** low, with the next Leave War move change; not his ruling.


*Moved here 2026-09-29 by backlog-archive.mjs ([REQ-DOOR-WORDS]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/handpass/2026-09-28-small-fixes.md`.*

### [REQ-DOOR-WORDS] Two small door-wording gaps around a request's row — low (25 Sep 26)
**BUILT 28 Sep 26 on `claude/small-fixes-batch-d223f6`** (the small-fixes batch; evidence `raptor-port/docs/handpass/2026-09-28-small-fixes.md`; plan `raptor-port/docs/superpowers/plans/2026-09-28-small-fixes-batch-plan.md`) — 1 (the banner's switch in the menu's words — its door has no screen route: `[PLAN-BANNER-DOOR]`), 2 (the Undo names its day) and 3 (a deleted request named without a row); to the archive with the merge.
Fable's code read on D175's branch (F4, F5), both older: (1) one act, two sentences — the preview banner's "Switch to this plan"
(`raptor-port/src/ui/interactions.ts`, `data-draftgo`) words the switch differently from the plans menu and the plan
editor (`board.ts switchDraft`) and lacks its "· N differences from ORIG pending" tail; the fix is the banner calling
`switchDraft` behind its own gate. (2) On a day whose copy of a request's row was left out (D175) — or after ✕ here and
Accept on another day — the request's card in Personal Inputs still offers "Undo — removes the ground-programme row this
created", and it removes the OTHER day's row (`html.ts accCtl`); a label such as "On Tuesday's programme" would say so.
(3) The pending list cannot name a DELETED request that had no row (one filed "→ Unavail"): it reads "A request · under
Unavailable → deleted" — Fable's D176 read F2; the name must come from the edit log's own "Input removed — …" line
(`removeInput` writes it) or a frozen name. D175's own sentence is in every door. **Place:** low, with the one changes
window (`[DRAFT-PENDING]`) or any time.


*Moved here 2026-09-29 by backlog-archive.mjs ([REQ-ORPHAN-ROW]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/handpass/2026-09-28-small-fixes.md`.*

### [REQ-ORPHAN-ROW] A request's row outliving the request — low (25 Sep 26)
**BUILT 28 Sep 26 on `claude/small-fixes-batch-d223f6`** (the small-fixes batch; evidence `raptor-port/docs/handpass/2026-09-28-small-fixes.md`; plan `raptor-port/docs/superpowers/plans/2026-09-28-small-fixes-batch-plan.md`) — one request, one row across stored weeks (`engine/weekstash.ts rowElsewhere`); a delete never leaves a dead row; its (2) is a question on the look card; to the archive with the merge.
Two older shapes, the same on `main`: (1) Fable's O2 — a request deleted on the Inputs page while its row stands on a
day of ANOTHER (not loaded) week: `unacceptInput` searches only the loaded days, so that row stays with a dead link and
its day reads 1 pending; (2) seen in the D114 walk, step 8 — a published day's version loaded after one of its
requests was deleted puts that request's row back (the version had it) while the request stays deleted: 1 pending,
"Zenith · Meeting · on the programme → deleted", and the row validates as a real commitment. **The agent's reading:**
(1) is a real fix (sweep the stashed week through its own write path); (2) is what "load this version" means, now
named truthfully — leave it unless he says otherwise. Fable's report O2. **Place:** low, any time after `claude/request-one-row`
merges (the `[REQ-TWO-ROWS]` it was placed with is built there).
**A third reader for (1)'s sweep (Fable's G3, D175's scenario round, 25 Sep 26):** every "one request, one row" check sees
the LOADED week only — `acceptInput`'s guard, `unacceptInput`, `reconcileDayFiling` and now D175's `publish.ts rowsLeftOut` —
so a request spanning a week boundary (Sun wk1 – Mon wk2) can still end with a row on each side after a load. One helper over
the stashed weeks' `ground` by `src`, read by all four, closes both. `engine-rules.md` states the loaded-week bound.
**(3) — Fable's D176 read F3 (read only, not reproduced):** a plan parked WITH a request's row, the request ✕'d since
("taken off"), then the plan switched to: the row is back beside a request reading "taken off" (`reconcileDayFiling`
leaves 'r' alone), its Accept does nothing, and deleting the request leaves the row with a dead link. Fix: re-file 'r' to
'g' when its own row stands on a loaded day, or `dropInputRow` removes any row with the deleted id whatever the filing.


*Moved here 2026-09-29 by backlog-archive.mjs ([ABSENCE-SMALL-SEEN]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/handpass/2026-09-28-small-fixes.md`.*

### [ABSENCE-SMALL-SEEN] Small things the absence-record re-test saw in passing (26 Sep 26)
**BUILT 28 Sep 26 on `claude/small-fixes-batch-d223f6`** (the small-fixes batch; evidence `raptor-port/docs/handpass/2026-09-28-small-fixes.md`; plan `raptor-port/docs/superpowers/plans/2026-09-28-small-fixes-batch-plan.md`) — 1 (each clash line's way out), 2 (the VIEWING AS chip on a phone), 3 (with `[AMEND-SMALL-SEEN]` 3), 4 (the read-only window's look — before/after on the look card) built; 5 watched at 390 (nothing found); to the archive with the merge.
None breaks an absence rule; each is a line to fix or ask about, from the re-walkers' sheets
(`raptor-port/docs/handpass/parts/2026-09-26-absence-rewalk-w{1..6}.md`):
1. **The Leave War's clash strip** says "… — resolve on the sheet", but the day's sheet has no control to resolve it
   with (W6 N2).
2. **The war's "VIEWING AS" chip** is cut off at 390 px (W6 N6).
3. **A six-letter callsign** (W6's test line "W6LINE") shows as "…" on View-only Sched — the same family as
   `[AMEND-SMALL-SEEN]` item 3 (five-letter callsigns).
4. **The read-only edit window** (a member opening another man's input) draws its locked fields as if they were live —
   a look question for him (W1).
5. **A member's leave drawn over the frozen balance column** once, in one phone picture (`rewalk/w4/w4-touch-G1e-member-two-rows`),
   not reproduced by a dedicated probe (4 / 4) — watch for it (W4).
**Place:** any time; items 1–2 with the Leave War links re-test (D147, last).



*Moved here 2026-09-29 by backlog-archive.mjs ([IT-FLOW-GUIDE]). Forward facts: `raptor-port/docs/it-flow-guide/README.md`.*

### [IT-FLOW-GUIDE] A compact, picture-led flowchart of how the app works, screen by screen — for the IT team and the next developer (his ask, 29 Sep 26)
His words: *"My IT wants a comprehensive flowchart with visuals but compact version on how the app works in terms of user
interface, like if I want to do this, how does the app go through each step, what does the user have to click to get
there. He's not asking about how the rules govern things like the functions like if I put all avail, how does the app
calculate the number of people to that detail. It's more big picture for each function so that as this app is handed down
to the next developer, they know what are the tests to test so that the app doesn't break. Like how the app should
function when they read this flow chart. Think of the best way to present this, word/powerpoint etc. pictures arrows etc.
since this chat is long we should do it on another chat."* **What it is:** for each thing a person does (sign in, file an
input, build and publish a day, amend it, bid and decide on the Leave War, mark the Tracker, run Admin → Users …), the
path through the screens — what he clicks, what he sees next — with real screenshots, numbered click marks and arrows,
and for each journey the checks that prove it still works (the walk scripts under `raptor-port/scripts/handpass/` and
the e2e specs are the raw material). NOT the rules engine's arithmetic. **Format — his (D410, 29 Sep 26):** a PowerPoint
deck plus a PDF of it — a map slide of every journey, then one slide per journey (screenshots, numbered click marks,
arrows, a short caption per step, a "What to test" box naming the checks and the automated tests); a two-slide sample to him
first. **State (29 Sep 26, `claude/it-flow-guide-flowchart-da7ca1`):** the sample (the map and journey 3, "Publish a day")
sent; APPROVED as drawn, and the deck also covers the alternate-plan flow and shows the work flow (D411); it goes step by step through making a schedule and shows every alternate way to do a thing (D412); the Leave War gets its own work flow slide in his order (D413); the Tracker is covered in full (D414); what happens by itself after one change, and where it shows (D415); the two editing modes, board and week (D416); the Leave War's customisable manning (D417). **Built 29 Sep 26:** 42 slides, `raptor-port/docs/it-flow-guide/`; sent to him — closes on his OK and "merge live". How it is made and re-made: `raptor-port/docs/it-flow-guide/README.md`.
**Place:** NEXT, in a fresh chat — the IT team is waiting (D354).


*Moved here 2026-09-29 by backlog-archive.mjs ([HISTLIST-SLOW-TEST]). Forward facts: `raptor-port/src/ui/histlist.test.tsx`.*

### [HISTLIST-SLOW-TEST] One changes-window test runs at 8s alone and times out (20s) in a busy full run — test-only (filed 28 Sep 26)
**FIXED 29 Sep 26 on `claude/histlist-slow-test` — closes when it merges:** it timed out twice more on `main`'s own run after PR #468 (22s), so `main` read red for a test fault; the one test of three cases (twelve board redraws) is now three tests, one case each, each on its own seat (2.6–4.9s alone; each passes alone and in the file). Found by the IT flow guide chat.
**Place:** low, test-only — with the next change to the changes window. Found by the Tracker leftovers' gates: `src/ui/histlist.test.tsx`
"the phone expands the bubble by hand › offers a control only where there is more to show, and only on a phone" took
8.3s on its own (the file's other eight 1.5–3.2s) and timed out at 20s twice in full unit runs on 28 Sep 26 while the
PC carried other work (a fanned-out walk; two reviewers reading); alone it passes, 9/9. Not an app fault. **Do:** find
what makes that one test slow (it likely redraws the board at both widths per case) and trim the setup, or give it
its own time limit with the reason beside it — never a bare longer limit for the whole file.

*Moved here 2026-09-29 by backlog-archive.mjs ([LW-DRAG-BELOW-ZERO]). Forward facts: `raptor-port/docs/handpass/2026-09-29-lw-drag-below-zero.md`.*

### [LW-DRAG-BELOW-ZERO] A drag across days on the Leave War goes below zero without asking (his ruling D418, 29 Sep 26)
Found by the IT flow guide's check: a one-day bid that would take someone below zero asks once ("Tap the same leave again to go
ahead"); a drag-selection filled with leave (the select sheet) writes straight through — from a balance of 0 a three-day drag wrote -3
with no word. **His ruling (D418): the drag asks too, as the one-day bid does.** **To do:** the select sheet's leave fill asks once
before going below zero, in the same words; a test beside `bidding.test.tsx`'s "a bid that would go below zero asks once, then
writes", for the drag. **Place:** low; with the next small-fixes batch (the Leave War area).


*Moved here 2026-09-29 by backlog-archive.mjs ([INPUTSCAL-TAP-FLAKY]). Forward facts: `raptor-port/docs/handpass/2026-09-29-lw-drag-below-zero.md`.*

### [INPUTSCAL-TAP-FLAKY] The calendar's chip-tap test fails now and then inside the full unit run, never alone — test-only (filed 26 Sep 26)
`raptor-port/src/ui/inputscal.test.tsx` "a real pointerdown+pointerup on an input chip sets INPEDIT to that EXACT record":
seen twice in full runs on `claude/leave-late-published` — once by Fable's first code read (`document.elementFromPoint is
not a function` ×7), once in the final gate run on `2cfceae2` (INPEDIT stayed null) — and green in the run before it
(5972 / 5972) and alone 3 / 3. That branch does not touch the file or the calendar (no diff against `main`), so it is
order- or load-dependent: some earlier file in the same worker leaves the document without `elementFromPoint`, or a
listener behind. **Do:** find the file that runs before it in the same worker when it fails (vitest `--sequence.seed` /
the shard order), and make the test install its own `elementFromPoint` stub and restore it, or reset what the other file
leaves. **Place:** test-only, any time.
**Seen again 27 Sep 26** on `claude/five-flags-batch-continue-2cfa70` (`869c7197`, the final gate run): the same test, the
same "elementFromPoint is not a function"; that branch does not touch the calendar either; alone 3 / 3, and the whole
unit suite green on its re-run (6256 / 6256). Three branches now — the order- or load-dependence is the lead.
**Seen again 29 Sep 26** on `claude/change-recording-retest` (PR #464, his PC's "all gates" run on `e37aa41c`): a
DIFFERENT test in the same file — "the popover orders sections above the inputs block" — the day's popover never opened
("click target exists: expected null"), after a pointerdown / pointerup pair on a day cell; that branch does not touch
the calendar (no diff against `main`); alone 3 / 3, and the whole suite 6899 / 6899 locally under the lock the same hour.
Four branches; two tests of the file — the file's own pointer handling under load is now the likelier lead.


*Moved here 2026-09-29 by backlog-archive.mjs ([LW-WINDOW-PRUNE-FLAKE]). Forward facts: `raptor-port/docs/handpass/2026-09-29-lw-drag-below-zero.md`.*

### [LW-WINDOW-PRUNE-FLAKE] The month-window browser test timed out once inside the full run, never alone — test-only (filed 29 Sep 26)
`raptor-port/e2e/leavewar.spec.ts` "the grid draws a window of months over year-wide placeholders, keeps every row aligned,
and draws in place" (lw-desktop): after the January button, its 5-second wait for December to leave the drawn months ran
out (still drawn), in the full gate run on `claude/award-earned-vs-granted-2ed66d` (`e7de1f80`, under the PC lock, 507 of
508). Alone 3 / 3 and the whole file green (154 passed) straight after; that branch does not touch the month window. The
desktop off-screen side draws and prunes only while the machine is idle (`state/idle.ts`), so a busy PC can outlast a
fixed 5 seconds. **Do (D87):** wait on what the prune needs — the idle signal or the window's settled state — not a fixed
time. **Place:** test-only, low, any time.


*Moved here 2026-10-01 by backlog-archive.mjs ([OIL-RELINK-XWEEK]). Forward facts: `raptor-port/docs/data-model.md`.*

### [OIL-RELINK-XWEEK] A request landed in a stashed week keeps the OLD man, and can land twice — OPEN, 22 Sep 26

**Closed by `[DB-READINESS]` group A phase 6 (c) v3 (1 Oct 26, branch `claude/db-readiness-p6c-holder-base`):** a request's row on ANY week is worked out from the request whenever that week is read (`raptor-port/src/engine/overlay.ts viewOfWeek` — re-made for the new man, taken away when the request moved; one row per request across weeks through the standing-row finder, `engine/weekstash.ts rowElsewhere`), so a hand-over made from another week draws the new man there and a request moved between weeks never lands twice. Pinned: `raptor-port/src/state/p6c-requestonread.test.ts` ("a request whose row is on a saved week NOT on screen…", "a request moved from week 2 to week 1…"). Home: `raptor-port/docs/data-model.md` §9 rule 9 (built 1 Oct 26).


**Pre-existing, not OIL-caused, and out of scope for this branch** (Fable F8). Two limits that job
2's "one row" premise stands on:

- A person change made while the anchor's week is STASHED cannot reach the row. The relink finds
  nothing to unaccept, toasts "moved outside the programmed week" and drops the landing mark; when
  that week loads, the row is re-found and re-marked — but its `who` is still the OLD man. The money
  goes to the new man through the claim while the programme draws the old one.
- The duplicate-landing guard scans LOADED days only, so a request landed in week B whose start is
  then moved into week A gets a SECOND row when week A loads. The two rows can disagree (one
  cancelled, one live), and the standing reads whichever week is loaded.

The stash-aware read built for `[OIL-XWEEK-ELSEWHERE]` is the same seam a stash-aware relink would
use. **Context.** `…/specs/2026-09-22-oil-jobs12-codereview-fable.md` §3 F8.


*Moved here 2026-10-01 by backlog-archive.mjs ([REQ-MOVE-EXTRAS]). Forward facts: `raptor-port/docs/engine-rules.md`.*

### [REQ-MOVE-EXTRAS] A request moved to another day: should the scheduler's second man go with it? — HIS ANSWER (filed 1 Oct 26)
Found by the FULL check of `[DB-READINESS]` phase 6 (c) (walk X, `raptor-port/docs/handpass/2026-10-01-dbr-phase6c-check.md`
W4; plan §8 item 14): a member re-dates his request from Thursday to Friday — its Friday row comes as filed, and a second
man, a red box or a CX the scheduler put on Thursday's row stay with Thursday's stored row (back if the request returns).
The build before carried them to Friday. Under the day lock (D450) a member's command cannot write Friday, and carrying them
on read from Thursday's row would last only until Thursday's holder next saved Thursday — then they would vanish from
Friday by themselves. **Recommended: leave it** — the scheduler re-adds on the new day what still applies. If he wants them
to follow, it is a design change (a hidden "moved" record on the old day, read by the new day's landing) — for later, with
the lock's build. **Place:** his answer at his look at phase 6 (c); nothing is built meanwhile.
**CLOSED 1 Oct 26 — his answer "1" (D468, `.claude/rules/decisions/scheduler.md`): leave it.** Nothing to build; the rule
lives in `raptor-port/docs/engine-rules.md` (the landing paragraph) and the phase 6 plan §8 item 14.


*Moved here 2026-10-01 by backlog-archive.mjs ([OIL-PERSONAL-PLACEHOLDER]). Forward facts: `raptor-port/docs/handpass/2026-10-01-dbr-phase7-check.md`, `raptor-port/docs/engine-rules.md`, `raptor-port/docs/ui-contracts.md`.*

### [OIL-PERSONAL-PLACEHOLDER] A placeholder on a landed "Personal" request row draws no count (23 Sep 26)
**DONE 1 Oct 26 — `[DB-READINESS]` group A phase 7** (`claude/db-readiness-p7-oil-followups`): the crowd behind a placeholder on a
Personal request's row is written down (the count, the window, frozen at publication) and earns nobody anything — every man reads
"a personal request earns no OIL". Rule: `raptor-port/docs/engine-rules.md` (the Personal placeholder paragraph), `ui-contracts.md`;
pins `src/engine/oilpersonalcrowd.test.ts`, `src/ui/oilpersonalcrowd.test.tsx`; walked and read by both — `raptor-port/docs/handpass/2026-10-01-dbr-phase7-check.md`.

Found by Fable's scenario design, confirmed by reading (not walked). A "Personal" request can land on
the ground programme (`ground:true`) but never asks the OIL question (`oilAsks` excludes it), and the
request half of the evidence only records a placeholder's crowd for ASKING types — so ALL / ALL AVAIL
dropped on such a row gets no membership: no count chip, no window, on any day. D27 says the count
shows wherever the puck lands; D46 lets it land on a request row. **Pre-existing on `main`** (the
membership code is `[OIL-SEATS-CAN-EARN]`'s), rare in practice. The fix touches the OIL evidence
(`engine/oilev.ts` — record the crowd for any landed row standing a placeholder, earning or not), so
it is FULL tier and wants both readers. Evidence: `raptor-port/docs/handpass/2026-09-23-allavail-window.md` §3.


*Moved here 2026-10-01 by backlog-archive.mjs ([CROWD-SIM-BRIEF]). Forward facts: `raptor-port/docs/handpass/2026-10-01-dbr-phase7-check.md`, `raptor-port/docs/ui-contracts.md`.*

### [CROWD-SIM-BRIEF] The D38 flag does not cover a crowd man's SIM brief/debrief (23 Sep 26)
**DONE 1 Oct 26 — `[DB-READINESS]` group A phase 7:** the ALL AVAIL window flags an event inside a crowd man's own sim brief or
debrief, in the warning list's own two sentences (one body); the issued face reads the record's own sim windows. Contract:
`raptor-port/docs/ui-contracts.md`; pins `src/engine/crowdsim.test.ts`, `src/ui/availwin.test.tsx`; walked — `raptor-port/docs/handpass/2026-10-01-dbr-phase7-check.md` §6.

The window flags an event that sits inside a crowd man's own FLIGHT brief or debrief (`crowdClashes`,
`engine/validate.ts`). His SIM brief/debrief windows are built inside the warning pass from its
private sim table and are not reachable from outside it, so a sim man behind an ALL AVAIL is listed
clean. Needs the sim windows lifted into one body, as the flight ones were. WALK tier.


*Moved here 2026-10-01 by backlog-archive.mjs ([OIL-WORDS]). Forward facts: `raptor-port/docs/handpass/2026-10-01-dbr-phase7-check.md`.*

### [OIL-WORDS] Stop calling OIL "money" in the code comments (owner, D25, 22 Sep 26)
**DONE 1 Oct 26 — `[DB-READINESS]` group A phase 7.** The line below was wrong on one count: FOUR on-screen sentences did say pay /
paid (three on the Logic page, the drag message inside OIL Earn) — reworded and pinned (`src/ui/oilscreenwords.test.ts` reads every
sentence the Logic page draws). The comments and test names followed in their own commit (38 files; the production bundle
byte-identical before and after). Test variable names are left — code, not prose. Sheet: `raptor-port/docs/handpass/2026-10-01-dbr-phase7-check.md` §3, §8.

OIL is banked TIME OFF, not pay. **Nothing on screen is wrong** — checked 22 Sep 26, no user-facing
string says paid, pay or money. The shorthand is in CODE COMMENTS (`ui/oilmode.ts` ~117, 211, 294,
455, 542, plus `engine/oil*.ts`) and some test names. **Tier: NONE.** Fold into any later pass that
already touches those files; the definition now heads the OIL behaviour register.


*Moved here 2026-10-01 by backlog-archive.mjs ([OIL-READ-LEFTOVERS]). Forward facts: `raptor-port/docs/handpass/2026-10-01-dbr-phase7-check.md`, `raptor-port/docs/data-schema.md`.*

### [OIL-READ-LEFTOVERS] The four the two final code reads raised and this branch did not act on (22 Sep 26)
**CLOSED 1 Oct 26 — `[DB-READINESS]` group A phase 7.** 1: already fixed by `[ALL-AVAIL-WINDOW]`, walked. 2: fixed — a drop on the
second spare seat pads the saved list (`raptor-port/docs/data-schema.md`; pin `src/ui/simspare.test.tsx`). 3: closed, D54. 4: D56 —
the walk tried every door 45 times and none lets a placeholder into a cockpit, so only data stored before 22 Sep 26 can hold one.
Sheet: `raptor-port/docs/handpass/2026-10-01-dbr-phase7-check.md` §5, §6.2.

Both providers read the finished OIL branch blind to each other and returned the SAME four defects;
three were already fixed and the fourth (a nought-minute SC/AVALON/BB shift saying it still earns)
was fixed in the same session. Reports and the reconciliation:
`raptor-port/docs/superpowers/specs/2026-09-22-oil-seats-final-read-{fable,codex,reconciled}.md`.
These four are what was deliberately left:

1. **The saved-plan preview's chip and its tap disagree about which list it is** (Fable F3, LOW).
   Wording, on a surface `[ALL-AVAIL-WINDOW]` replaces. Do it there or not at all.
2. **The second spare sim seat leaves a hole in the stored crew array** (Fable F4, LOW). Check it
   against `slots.ts`'s trailing-blank trim before changing anything — the array shape is that
   file's contract, not D50's.
3. **An already-issued weekend carrying a placeholder reads "1 pending" the moment this ships**
   (Fable F5, LOW). **PART DONE 22 Sep 26, on his "ok fix this first".** The day used to say "1
   pending" with no cell marked and nothing in History, while the chip beside the puck said "?" —
   something changed, nothing said what, and the one place to look was never written down. The day
   now NAMES it (`OIL_OLD_BLOCK`), so he is not republishing blind. **CLOSED — RULED D54 (23 Sep 26,
   "leave it as it is"): the day raises the mark.** He republishes once per affected day and those
   men get their OIL. Do not re-open it later as a bug (standing order §7.6).
4. **A placeholder that reaches a cockpit by copy draws the jet as crewed** (Fable F8, LOW,
   pre-existing). D47 belts the money on purpose and names this; the screen half is one advisory
   away. A product call, not a defect against the plan.


*Moved here 2026-10-01 by backlog-archive.mjs ([STORE-READER-SWEEP]). Forward facts: `raptor-port/docs/handpass/2026-10-01-dbr-phase7-check.md`, `raptor-port/docs/data-schema.md`.*

### [STORE-READER-SWEEP] A stored record read more narrowly than it is written — sweep for more (22 Sep 26)
**DONE 1 Oct 26 — `[DB-READINESS]` group A phase 7:** every stored record's reader paired with its writers across the three stores.
No reader is narrower than its writer on official dates, earned leave or publish state. Four findings: the Leave War's counter
limit, lists emptied on purpose, the carried remark's length — fixed, red first (`raptor-port/docs/data-schema.md`); hidden
warnings — ruled D469 / D471 / D472, the build is `[WARN-HIDE-KEPT]`. The pairs found matching, and what the sweep did not walk:
`raptor-port/docs/handpass/2026-10-01-dbr-phase7-check.md` §4.

**TWO INSTANCES FOUND IN ONE FILE IN ONE EVENING, both silent, both about official
dates.** `readPostOuts` insisted a posting record carry a LEAVING date, so every
JOINING date `setPostIn` wrote was discarded at the next boot; and `setPeople`'s
keep rule then tested membership of that record rather than the leaving date it
means. Both fixed on `claude/oil-seats-can-earn`. Neither was found by a walk or
a review — they came from re-reading the file around an unrelated fix.

**The shape, so it can be looked for:** a writer grows a new case (a second date,
a new field, a nullable end) and the untrusted-storage reader beside it is not
widened with it. The write succeeds, the reload silently drops it, and nothing on
screen says so. Two spot-checks came back clean (`readPersonEdits` matches
`setPerson`'s type exactly; `readOilPolicy` covers both its fields) — the rest of
`leavewar/state/store.ts`'s readers, and the scheduler's own storage seam, have
not been walked. **Small, mechanical, and worth doing once**: for each reader,
find its writer and diff the shapes. Priority: with the other small follow-ups.


*Moved here 2026-10-01 by backlog-archive.mjs ([OIL-REQ-NAMEBOX]). Forward facts: `raptor-port/docs/handpass/2026-10-01-dbr-phase7-check.md`, `raptor-port/docs/engine-rules.md`.*

### [OIL-REQ-NAMEBOX] A man typed into a REQUEST row's name box in place of the requester earns nothing — OPEN, 22 Sep 26
**DONE 1 Oct 26 — D470, built and walked in `[DB-READINESS]` group A phase 7** (the ANSWERED line at the foot of this item). Fable's
final read added one thing: the name box is KEPT when the member edits his own request (`src/engine/overlay.ts`, rule 6) — before,
his next edit wrote his own name back over the scheduler's man. Sheet: `raptor-port/docs/handpass/2026-10-01-dbr-phase7-check.md` §7.

**Deferred deliberately during `[OIL-SEATS-CAN-EARN]` step 6, not missed.** That step made a
PLACEHOLDER on an accepted request's row count the people it stands for, in the name box and in the
extras line alike. It left one case alone: a real, named person dragged into the name box in place
of the man who filed the request. He does no worse than before — he earned nothing there yesterday
either — but he is plainly doing the work, and D18 ("for 2 he should earn") is the same argument
that got the extras line paid.

**Why it was left.** In every path the app has, that box holds the requester, and the money already
pays him from his own answer. Crediting "whoever is in the box" would move money on a case nobody
has reported, inside a step whose scope the plan fixed. Doing it silently is exactly the shape the
OIL build keeps getting bitten by.

**What to do.** Put it to the owner as a walk question — can the scheduler put someone ELSE in a
request row's name box, and if so should he earn from it? If yes, it is one line in
`landedExtras` (treat the name box like the extras, the requester still excluded) plus a test.
**Priority: with the other small OIL follow-ups, after the walk.**
**ANSWERED — D470 (owner, 1 Oct 26): YES.** A man the scheduler puts in the name box of another man's request row earns from
it as a man added under the row does; the member who filed still earns on his own answer. BUILT 1 Oct 26 in `[DB-READINESS]`
group A phase 7 (`claude/db-readiness-p7-oil-followups`), red first — `raptor-port/src/engine/oilnamebox.test.ts`,
`src/ui/oilclaimcrowd.test.tsx`; the rule `raptor-port/docs/engine-rules.md` (the D470 paragraph).
**Context:** `raptor-port/docs/superpowers/specs/2026-09-22-oil-seats-can-earn-plan.md` §5 step 6;
the body is `raptor-port/src/engine/oilev.ts` `landedExtras`, and its own comment says why.

---


*Moved here 2026-10-01 by backlog-archive.mjs ([WARN-HIDE-DROP-NOTE]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [WARN-HIDE-DROP-NOTE] A drop that recreates a clash already hidden still shows the amber "already on …" note (a question for him; found 1 Oct 26)
Found by the `[WARN-HIDE-KEPT]` walk (walker A, Astra's scenario 26; picture
`raptor-port/docs/img/handpass/2026-10-01-warn-hide/a/dk-07-26b-exact-hidden-clash-recreated-silent.png`). Hide Saint's clash,
move him away, drag him back onto the same seat: the hidden warning itself stays silent — no red message, no pulse, no ring,
not counted, its line back already struck — but the drop shows its own amber note, "Saint — already on APPOINTMENT
14:00–16:00". That note is not the warning: it is the drop's fallback voice (`ui/drag.ts barDrop`, `state/view.ts` — the
reason the crew list prints under a busy name, repeated once at the drop), which speaks when the drop raised no NEW shown
warning. Left as built: the crew list still strikes the man and says the same words before the drop (the plan's roll-call
row 18 — the crew list reads the rules, not the hides). **The question for him:** when a drop recreates a clash he has
already hidden, should that amber note stay, or should the drop say only "Saint planned"? **Place:** low — his answer
first (it is on the look card of `raptor-port/docs/handpass/2026-10-01-warn-hide-check.md`); then a one-line change (WALK tier).


*Moved here 2026-10-01 by backlog-archive.mjs ([WARN-HIDE-KEPT]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/handpass/2026-10-01-warn-hide-check.md`.*

### [WARN-HIDE-KEPT] A hidden warning stays hidden for everyone until unhidden; no flag on the pucks; its line struck out, not gone — BUILT and FULL-checked 1 Oct 26 (D469, D471, D472, D475); his look and "merge live" next
**His ruling (D469, 1 Oct 26 — answering the question the stored-record sweep of `[DB-READINESS]` phase 7 raised):** a hidden
warning stays hidden, for everyone, across a reload and a sign-in, until someone unhides it; while it is hidden the pucks
carry no flag for that item; and its line in the day's warning list stays where it is, struck out and darker, one tap from
being flagged again. Why (his words): the scheduler has acknowledged it, has other considerations, and does not want the
schedule that goes out to alarm. The full row: `.claude/decisions-full/scheduler.md` D469.
**What the app does today (so the build is known):** a hide is saved with its day (`ScheduleDay.wo`), but every sign-in
clears the hidden list (`raptor-port/src/state/view.ts`) and the boot does not read the saved ones back for the week on
screen (`state/store.ts initStore`) while a week opened later does (`loadWeek`); hidden warnings gather under an "N hidden"
line; and a hidden warning still rings and chips its pucks (the Aug 26 rule: "a muted problem is still a problem").
**To build:** (1) the boot and the sign-in read the loaded week's saved hides back, and a sign-in no longer clears them;
(2) a hidden warning marks no puck — no ring, no chip, on the board, the edit week and (see the open reading) the schedule
that goes out; (3) the hidden line is drawn in place, struck out and darker, its ↺ beside it — the "N hidden" fold goes;
(4) `ui-contracts.md` §Mute a specific check rewritten to match (its D469 note marks the three sentences today).
**His answers to the readings (D471, 1 Oct 26):** built as ITS OWN job after phase 7; (b) a hide on a day ALREADY PUBLISHED
WAITS for the next amendment — a pending change (D45, D103); (c) the published and printed schedule DROP the hidden item's
flag too. **(a) ANSWERED — D472 (1 Oct 26):** a hidden warning is NOT COUNTED — 3 issues with one hidden reads "2 issues",
and the count line says nothing about a hidden one; it is noticed only by opening the day's issues list and seeing its line
struck through and darker. **Every reading is now answered — the design is complete.** A picture first (the struck-out line
on the board and the edit week, phone and desktop), then the build. **The picture — SENT 1 Oct 26:** `raptor-port/docs/mock/warn-hide.html`
(pictures `raptor-port/docs/mock/img/warn-hide/`, script `raptor-port/scripts/handpass/wh-mock.mjs`), with three calls of the agent's put to him on
it: View-only Sched shows the struck-out line too, without the ↺; a day with every issue hidden keeps a quiet "✓ No issues" bar
that opens the list; the look of the hidden line. **APPROVED as drawn, 1 Oct 26 (D475 — "The mock up looks good. Proceed").** **Kept, as he was read:** only a scheduler hides and unhides; a hide is an Undo step; a hidden warning
returns by itself when the situation changes (his Aug 26 words). **Tier:** FULL (the warning list, saved data, the published
record). **Place:** the next job after `[DB-READINESS]` phase 7, on its own branch — the tables' shape is settled by the
ruling itself (`wo` stays in the day's row), so IT is not waiting on the build.
**BUILT and FULL-checked, 1 Oct 26, on `claude/warn-hide-kept`.** The plan (v2, both red teams' findings folded in):
`raptor-port/docs/superpowers/plans/2026-10-01-warn-hide-kept-plan.md`. What the app does now: the contract
`raptor-port/docs/ui-contracts.md` §Muting a check, the engine `raptor-port/docs/engine-rules.md` (the hides axis), what is
saved `raptor-port/docs/data-schema.md` / `data-model.md` §9, the rules WH1–WH13
(`raptor-port/docs/superpowers/specs/2026-10-01-warn-hide-behaviour-register.md`). The check: Astra's 44 scenarios walked by
three walkers at both widths; what it found fixed red first (the board's stand-by seat, the load's count, the To go out
line's tap, the changes window's gap); the re-walk; both final reads (Astra REVISE, Fable APPROVE — every finding fixed but
the Insights question, left to him); the gates twice. Evidence and his look card:
`raptor-port/docs/handpass/2026-10-01-warn-hide-check.md`. **Left:** `[INSIGHTS-WHICH-COPY]` (ruled D477, D478 — its own build next); the drop's amber note stays (D479 — its item archived);
the known two-tabs gap (`raptor-port/docs/data-schema.md` known gaps, item 12) — Undo's refusal after another person's hide can
only be SEEN once there is a shared database (it is pinned by a test). **Next:** his look on the preview, his answers to the
two questions, "merge live"; then this item leaves by the script.


*Moved here 2026-10-02 by backlog-archive.mjs ([INSIGHTS-WHICH-COPY]). Forward facts: `raptor-port/docs/handpass/2026-10-01-insights-which-copy-check.md`, `raptor-port/docs/feature-impact.md`.*

### [INSIGHTS-WHICH-COPY] Insights counts each day's latest PUBLISHED version, the working copy only for a day not yet published — RULED D477, D478 (1 Oct 26); BUILT 1 Oct 26 on `claude/insights-which-copy`, his look and "merge live" next
Found by Astra's scenario design for `[WARN-HIDE-KEPT]` (its scenario 1). The Insights window (top bar, every page, every
signed-in person) works every number out from the working copy — sorties, formations, hours, and the issue counts by day
and by type (`ui/Modals.tsx insightsHTML`, `engine/insights.ts`). So on View-only Sched a member's Insights already
includes changes waiting on a published day; since D471 that includes a warning hidden but not yet out — Insights reads
one issue fewer than the published day beside it shows. Not new with the hide (a seat changed and waiting moves the
sorties count the same way) and not this build's to change: it is what the window means. **The question for him:** on
View-only Sched, should Insights count the PUBLISHED schedule (as the page does), or keep counting the working copy?
**Seen in the walk (walker B, scenario 1, 1 Oct 26):** while a hide waits on published Tuesday the member's day reads 4
issues and his Insights reads 3 for Tuesday (week total 32 against 33, "Long work day" 1 against 2) — pictures
`raptor-port/docs/img/handpass/2026-10-01-warn-hide/b/dk-07-s1-b-pending-face.png`, `dk-10-s1-b-pending-insights-byday.png`.
**Astra's final read of `[WARN-HIDE-KEPT]` (1 Oct 26) rates it MEDIUM and would change it:** make Insights count the copy
the page beside it shows — the issued one for a published day on View-only Sched — its exact steps are in
`raptor-port/docs/superpowers/briefs/2026-10-01-warn-hide-kept-final-read-astra.md` (finding 1).
**HIS ANSWERS — D477, then D478 the same evening (1 Oct 26).** D477: *"it should follow the schedule on whats its showing so if
theres 4 issues. and 1 is hidden then 3 issues will show."* D478, correcting the agent's reading of it: *"It should show the
latest copy, so if working copy is the only copy then it will use that, unless its published then use Original, if theres an
AL1 then use AL1 etc."* **The rule as it stands:** day by day, Insights counts that day's LATEST PUBLISHED version (the
Original, or the latest amendment) and the working copy only for a day not yet published; changes waiting on a published day
are not counted until they go out; a hidden warning is not counted, by the hides that version went out with. On EVERY page —
Edit Schedule and the board included (the agent's reading, told to him) — and for every figure of the window. Full rows:
`.claude/decisions-full/scheduler.md` D477, D478; the contract: `raptor-port/docs/ui-contracts.md` §Week Insights; the rule register (IN1): `raptor-port/docs/superpowers/specs/2026-10-01-insights-which-copy-behaviour-register.md`.
**To build:** `engine/insights.ts computeInsights` takes the days and the warning bundle it must count instead of reading the
working globals; `ui/Modals.tsx insightsHTML` hands it, per day, the current issued version's day and its issued face
(`publish.ts dayCurVer` / `daySnapOf`, `validate.ts faceWarn` — the same world View-only Sched draws a published day from),
or the working day where none is published — whatever page is open. Tests first: a published Tuesday with a pending hide, a
pending seat change and a pending leave — every Insights figure equals the published day's, on View-only Sched AND on Edit
Schedule, until the amendment is out, then all move together; a draft Wednesday beside it moves at once.
**Place:** its own small job right after `[WARN-HIDE-KEPT]` merges, in a FRESH chat on its own branch (WALK tier: a shared
window, the published face; one reviewer — Astra, who found it). The Sonnet-walker trial (D476) rides on its walk.
**BUILT and WALK-checked 1 Oct 26** on `claude/insights-which-copy`: every figure of the window reads one world — each day's
current issued version, the working copy only for a day not yet published (`engine/validate.ts issuedWorld`,
`engine/insights.ts`, `ui/Modals.tsx`; tests `ui/insights-published.test.tsx`, rule IN1). Astra's 19 scenarios walked by an
Opus walker and the trial's Sonnet walker, apart: no defect met. Astra's final read then found one — "Not on the flying
programme" followed today's roster — fixed red first and re-walked by the host. Evidence and his look card: `raptor-port/docs/handpass/2026-10-01-insights-which-copy-check.md`.
**Left, all filed:** `[INSIGHTS-BOARD-DOOR]`, `[INSIGHTS-RULE-CHANGE]` (two questions for him), `[WORKSPAN-NEGATIVE]` (older, low).
**His look card answered and "merge live" given 1 Oct 26 (D480–D483; PR #479).** After the merge this item leaves by the script.


*Moved here 2026-10-02 by backlog-archive.mjs ([INSIGHTS-RULE-CHANGE]). Forward facts: `raptor-port/docs/handpass/2026-10-01-insights-which-copy-check.md`.*

### [INSIGHTS-RULE-CHANGE] A rule changed on the Logic page moves Insights' work hours at once, published days included — ANSWERED D482 (1 Oct 26): as built, CLOSED; to archive at the next tidy (found 1 Oct 26)
Found by Astra's scenario design for `[INSIGHTS-WHICH-COPY]` (its scenario 2), walked by both walkers: with Tuesday
published, "Flight debrief after land" 2h → 3h moved every flyer's Work hours +1h at once, the week's issues 33 → 35 and
Tuesday 4 → 5 — and published Tuesday's own bar on View-only Sched read 5 at the same moment; the day went "1 pending";
publishing AL1 moved nothing more. So the window and the published day agree; both follow the rule change at once.
**Left as it is, the agent's call, told to him:** the app keeps no versions of its rules (`raptor-port/CLAUDE.md` §Product
invariants; D186 narrows it for the brief lead only), a published day's live warnings follow today's rules (D183–D185),
and hours are worked out from the published day's content by today's rules. Holding them at the old rule would mean each
version storing its hours — a saved-data change. **The question for him:** leave it, or should a published day's hours wait
for the amendment too? Evidence: `raptor-port/docs/handpass/2026-10-01-insights-which-copy-check.md` §5.2 finding 2. **ANSWERED — D482 (1 Oct 26): "A rule change logic page should
move the mentioned work hours" — as built; closed.**


*Moved here 2026-10-02 by backlog-archive.mjs ([OIL-AWARD-IS-A-GRANT]). Forward facts: `raptor-port/docs/data-model.md`, `raptor-port/docs/data-schema.md`, `raptor-port/docs/engine-rules.md`.*

### [OIL-AWARD-IS-A-GRANT] An award is a ledger grant stored a second way (Fable, 21 Sep 26)
**BUILT 29 Sep 26 on `claude/award-earned-vs-granted-2ed66d`** (with `[OIL-EARNED-VS-GRANTED]`, D400–D402; plan
`raptor-port/docs/superpowers/plans/2026-09-29-oil-award-one-kind-plan.md`, both reviewers' two rounds folded in) — every
hand-given OIL award is one ledger entry drawn on the grid; the ledger recorded per entry for undo; earned / awarded /
corrections apart. Left before "merge live": the walk, both final code reads, his look. The text below is the item as it
stood.
*(Noted 1 Oct 26 by the phase 7 chat: this MERGED — PR #469, 29 Sep 26. Still in the backlog; before it is archived, check its
"who entered it and when" line, below, against what was built.)*
**Raised by the [OIL-AWARD-ADD] design review as the real architectural root cause. NOT built, and
deliberately not bundled — it moves persisted balances again and touches ~28 test files, so it is
its own escalated session. It needs the owner's go before anything is written.** **GO GIVEN (D147, 24 Sep 26):**
after his after-the-hunt items and BEFORE [DB-STEP], so the database stores one kind of award — **timed by D203 (26 Sep 26):
with the `[DB-READINESS]` batch, before the tables are settled — the database step starts now, D354**; [OIL-EARNED-VS-GRANTED]
folds in (its label is still his figure — ask him when it comes — ANSWERED D400, 29 Sep 26: "earned" and "awarded" shown apart); then the small OIL follow-ups as one batch.

After his two rulings an award now: flags nothing, stands nobody down from flying, counts nobody on
the duty manning, is never touched by the published schedule, and adds to the OIL balance. That is
exactly what the OIL tracker's own ledger GRANT already does. The only differences left are where
it is stored and which editor reaches it — so the same fact lives in two stores, which is the drift
seam the house rules name. [OIL-AWARD-ADD] adds a fourth reader of it rather than removing one.

**The shape, if it is ever done:** awards become ledger entries; the Leave War DERIVES the FO/HO
contribution from the ledger on read, exactly the way an absence is derived from the Inputs page;
the three cell editors become one ledger edit; a one-time conversion of stored hand-typed credits
and of the demo seed. **NARROWED 29 Sep 26 BY D401: no stored award is converted (demo data, wiped — D54, D56); only
the demo seed is rewritten; an old-shape record must still not break a load.** **D402 (29 Sep 26): every hand award
shows on the grid on its date, wherever it was given (grid or tracker).** Plan:
`raptor-port/docs/superpowers/plans/2026-09-29-oil-award-one-kind-plan.md`. **Priority: after the bug hunt, and below [PUB-UNAVAIL] (closed 26 Sep 26) — it is tidiness with
a real risk attached, not a hole in the paperwork.**
**ADDED 26 Sep 26 by `[ACCOUNTS]` (D200 (2), Astra's plan read R1-8): a hand-typed award must also keep WHO ENTERED IT
AND WHEN** — the signed-in person (by id, drawn by his live callsign) and the time, stamped by the store from the session,
separate from the typed "Given by" (on whose say-so). Not built in `[ACCOUNTS]`: the award's record changes here, once
(D203). `data-model.md` §11 states the rule.
**WHERE OIL SITS TODAY (read 29 Sep 26, the handoff-review chat — `leavewar/engine/warrecs.ts` `CreditRec`,
`oiltracker.ts` `oilLedgerFor`, `counters.ts` `earnedOil` / `balParts`, `state/store.ts` `grantTo`):** three ways in, two
stores. (1) The AUTOMATIC credit — the published schedule or an accepted duty input — is an FO/HO record on the man's war
day, `oil: 'auto'`. (2) An award typed on the war grid is the SAME record kind on the same day, `oil: 'manual'`, with
"Given by" — it began as "the man worked but the schedule missed it" and became a gift on any day with D79 / D82. (3) A
credit from the OIL tracker sheet is a ledger entry (`lw.ledger`, `counter: 'oil'`), the list every pool's grants use.
The tracker's "earned" and the figure's "earned by weekend/PH work" count (1) AND (2) — grouped by where a record is
stored, not by how it came — and "granted" counts only (3); that is `[OIL-EARNED-VS-GRANTED]`. Every record already says
which it is, so a split needs no guessing. Explained to him 29 Sep 26.
**Related, deferred on purpose from `[ARCH-STACK-4]` (merged; archived 24 Sep 26):** OIL itself as a read-time
derivation — the step-4 design §7 (`specs/2026-09-19-arch-stack-4-one-absence-design.md`). Decide both together.


*Moved here 2026-10-02 by backlog-archive.mjs ([OIL-EARNED-VS-GRANTED]). Forward facts: `raptor-port/docs/superpowers/plans/2026-09-29-oil-award-one-kind-plan.md`.*

### [OIL-EARNED-VS-GRANTED] The tracker calls an award "earned" (Fable, 21 Sep 26)
**BUILT 29 Sep 26 with `[OIL-AWARD-IS-A-GRANT]`** (on its branch — not merged *[merged since: PR #469, 29 Sep 26 — noted 1 Oct 26]*): "earned" is the automatic credits alone,
"awarded" every hand award, "corrections" its own row.
**ANSWERED 29 Sep 26 — D400: "earned" is only what the app credited itself; every hand award, grid or tracker, reads
"awarded". Built with [OIL-AWARD-IS-A-GRANT].** The text below is the question as it stood.
**Small, and it is the OWNER'S FIGURE to change, which is why it was not folded into
[OIL-AWARD-ADD] silently.**

The tracker's summary counts a hand-typed award under **earned**, and the +OIL breakdown labels the
whole lot "earned by weekend/PH work". That has been true since long before the award ruling, and
[OIL-AWARD-ADD] does not change how a single credit is classified — only that a Saturday can now
carry two. But it makes the wording visible: a Saturday he worked one day on and was awarded three
for will read "earned 4".

**If he wants it:** `oiltracker.ts` counts `auto && !manual` as earned and `manual` as granted;
`counters.ts` splits the +OIL part into "earned by weekend/PH work" and "awarded on the war".
One afternoon. **Ask him before doing it** — it changes two numbers he reads.
**Do it as its own small change, in a FRESH chat** (agreed with him 21 Sep 26 — carried here 24 Sep 26 from
`[OIL-NEXT-TWO]`, now archived, whose other half, his look at the award preview, closed when PR #423 merged).


*Moved here 2026-10-02 by backlog-archive.mjs ([DOCS-SIZE-PASS]). Forward facts: `raptor-port/scripts/docsize.mjs`.*

### [DOCS-SIZE-PASS] Two always-read files are over their size tripwires — a documents-only pass is owed (found 1 Oct 26)
**DONE 2 Oct 26 on `claude/ai-workflow-skills-review-87bf52`:** the backlog — five finished items archived, its tripwire raised
1430 → 1650 with the reason (`raptor-port/scripts/docsize.mjs`); the How-we-work rulings — the nine IT-flow-guide rulings moved
to their own area file (`.claude/rules/decisions/it-flow-guide.md`), three spent ones archived (D180, D324, D467), now under
its tripwire unraised. Left: `[PRIORITY-LIST-REWRITE]`. The text below is the item as filed.
`npm run docsize` on `main` (1 Oct 26, after PR #477): `OUTSTANDING.md` is about 150 lines over its ceiling of 1430, and
`.claude/rules/decisions/how-we-work.md` about 400 bytes over its tripwire of 18000. Each code change since has reported it
"OVER, deferred (D29)"; no job carried the pass itself. **To do, in a change that touches no `raptor-port/src`:** move what no
longer belongs in each to its home (finished backlog items by `backlog-archive.mjs`; the rulings file is never trimmed — split
the area or raise its tripwire with the reason, D136, D390), or raise a ceiling with its reason (D141). **Place:** low — its
own small documents-only branch; a documents-only pull request fails the Docs guard on these sizes until it is done.


*Moved here 2026-10-02 by backlog-archive.mjs ([PHONE-DISCARD-MARKS]). Forward facts: `raptor-port/docs/handpass/2026-10-02-discard-marks-remove.md`.*

### [PHONE-DISCARD-MARKS] A phone has no door to "Discard marks" (found 28 Sep 26)
**MOOT once `[DISCARD-MARKS-REMOVE]` is built (D488, 2 Oct 26): the button is being removed — and it never discarded a published
day's pending changes, as the note below believed; it clears only the marks of days not yet published. Archive this with that build.**
Found by the change-recording re-test's walker A1 (O4, `raptor-port/docs/handpass/parts/2026-09-28-cr-a1.md`): the
Amendments panel that carries "Discard marks" is hidden under 820px, so on a phone a published day's pending changes can
be discarded by no control (desktop only). **To do:** give the phone a way in (the day's pending list, or the ⓘ day
panel) — a mock-up first if it adds a control. LOOK / WALK tier. **Place:** low; any time, none blocking.


*Moved here 2026-10-03 by backlog-archive.mjs ([INSIGHTS-WORKING-COPY]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [INSIGHTS-WORKING-COPY] Week Insights shows the working copy's week to everyone, members included — a question for him (filed 26 Sep 26)
**ANSWERED/SUPERSEDED by D478 and the merged [INSIGHTS-WHICH-COPY] build (1 Oct 26, PR #479):** all pages use each day's
latest issued copy, working only for an unpublished day. The historical question below is retained for archive; no new
owner choice or build is owed. Lasting home: `raptor-port/docs/ui-contracts.md` §Week Insights (D478).
Astra's second read of `[LEAVE-LATE-PUBLISHED]` (`raptor-port/docs/handpass/2026-09-26-late-pub-astra-read2.md` #2): the
top bar's Insights (`raptor-port/src/engine/insights.ts computeInsights`, `raptor-port/src/ui/Modals.tsx insightsHTML`)
validates and reads the WORKING week — its warnings, sorties and hours — for every role, while View-only Sched shows each
published day as issued. So a member reading Insights sees the admin's unpublished edits (and, since that branch, a
member's late input) counted in. The same on `main` (it always read the working copy); Fable's second read calls it the
working copy "by design". **The question:** should Insights show the published schedule on View-only Sched / for a member,
and the working copy on Edit Schedule? If yes, Astra's fix steps are in the read (a displayed-world model passed in; the
issued days through `withChipWorld` / `faceWarn`). **Place:** a question for him; with the one changes window
(`[DRAFT-PENDING]`, the next time the working-versus-published split is designed) or any time.


*Moved here 2026-10-06 by backlog-archive.mjs ([TAB-DAY-END]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/handpass/2026-10-05-codex-stack-check.md`.*

### [TAB-DAY-END] After the last text box of a day with no button below it, Tab leaves the caret on nothing (the Codex stack check's W14, 5–6 Oct 26 — a question for him)
Edit Schedule's week: from the day's last open text box (on the demo Monday, the last Unavailable remark) Tab blurs the box and the
caret is nowhere; the next Tab goes to the NEXT day's Templates button. D553 ruled "Tab continues to the next normal button or control
without looping or changing day" and its full row adds "it does not approve moving to the next day" — and here the only next button is
the next day's. Codex's browser test (`raptor-port/e2e/schedule-tab.spec.ts`, "D553 first/last exits remain on the day") pins "no pan,
focus on the page or in the day". **ANSWERED 6 Oct 26 (D597): the caret stays in that last box** — the week, and the phone's board, where no button follows the
last box either. Parked until then under D596 (the check's sheet §12, question 1). On the board the exit lands on the first control after the boxes (walked: the ✕ of a warning line) — as ruled.
**Place (the agent's line):** with the next change to the Tab route, once he answers.


*Moved here 2026-10-06 by backlog-archive.mjs ([ROLE-QUESTION-SECOND]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/handpass/2026-10-05-codex-stack-check.md`.*

### [ROLE-QUESTION-SECOND] A second formation's Blue/Red question replaces the first formation's open one (found 6 Oct 26 by Astra and Sol 6.1, the side-by-side read — a question for him)
Tracking On. Type a DS / RED cue in formation A's Remarks and leave its question unanswered; type one in formation B's Remarks and
leave it: B's question opens and A's is removed without an answer (`raptor-port/src/ui/mission-role-offer.ts` — the automatic question
has one slot, newest wins). D535 lists when an open question goes (Blue, Red, Later, its own wording, the formation gone, another day /
week / version / sign-in) and a second formation's edit is not in the list; D523 says not many questions at once; D529 says ask straight
after his own edit. A's "Choose mission role" button still works when its Remarks is selected (W9, fixed 6 Oct 26), and an unanswered
formation keeps the ordinary total bar. **ANSWERED 6 Oct 26 (D598): show both, each under its own formation; a newer question never removes an older one.** Parked
until then under D596 (the sheet §12, question 2). The reports: `raptor-port/docs/superpowers/briefs/2026-10-06-insights-fixes-read-astra.md`, `-sol.md`.
**Place (the agent's line):** with the next change to Insights' mission mix, once he answers.


*Moved here 2026-10-06 by backlog-archive.mjs ([ROLE-QUESTION-WEEK-DAY]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/handpass/2026-10-05-codex-stack-check.md`.*

### [ROLE-QUESTION-WEEK-DAY] On Edit Schedule's week, going to another day does not end an open Blue/Red question (found 6 Oct 26 by Astra and Sol 6.1 — a question for him)
D535: an open question ends when he "moves to another day". On the Scheduler Board it does. On the week — several days on screen at
once on a desktop, one per swipe on a phone — the question stays on its day until answered or Later; since W9's fix it blocks nothing
(every other formation's button shows). **ANSWERED 6 Oct 26 (D599): leave it — on the week the question waits on its day; the board still ends it on a day change.
Nothing to build.** Parked until then under D596 (the sheet §12, question 3).
**Place (the agent's line):** low; with [ROLE-QUESTION-SECOND].


*Moved here 2026-10-06 by backlog-archive.mjs ([ROLE-BLANK-CALLSIGN]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [ROLE-BLANK-CALLSIGN] A line with no callsign is named by its hidden row code in the Blue/Red question and in Undo (reader C's second pass, 6 Oct 26)
Tracking On; "+ Line" (blank), leave the callsign empty, type `DS-2` in Mission: the question reads "<a code>: Blue or Red?", and after
an answer Undo and its history line name the same code. Should read "Line", as the rest of the app names such a line (D340). Two
lines: `raptor-port/src/state/mission-roles.ts` (the target's `name`) and `raptor-port/src/state/changelines.ts` (the copy's fallback)
— `raptor-port/docs/handpass/parts/stack-read2-C.md` F1, with its test. **Place (the agent's line):** low — with `[ROLE-QUESTION-SECOND]`.


*Moved here 2026-10-06 by backlog-archive.mjs ([ROLE-BUTTON-AFTER-ANSWER]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [ROLE-BUTTON-AFTER-ANSWER] After Blue, Red or Later the Choose / Change button is not put back while the caret is still in that Remarks box (reader C's second pass, 6 Oct 26)
D527: the button shows while a relevant Remarks is being edited. After an answer (or Later) with the caret left in the box nothing is
offered until he clicks out and back in. Fix and test: `…/stack-read2-C.md` F2. **Place:** low — with `[ROLE-QUESTION-SECOND]`.


*Moved here 2026-10-06 by backlog-archive.mjs ([ROLE-NOT-CHOSEN]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [ROLE-NOT-CHOSEN] Once the sign-in ends, a Blue/Red answer cannot be put back to "not chosen" (reader C, both passes — a question for him)
An answer given by mistake can be changed to the other colour, never cleared, once Undo's list has gone (sign-out, reload). The
permissions table allows the admin to delete the record; no control does. D527 offers a correction only. **Place (the agent's
line):** low — a question for him, put with the third round's report (6 Oct 26); recommended: leave as built.


*Moved here 2026-10-07 by backlog-archive.mjs ([WALK-LEDGER-HISTORY]). Forward facts: `raptor-port/docs/walk-ledger.md`.*

### [WALK-LEDGER-HISTORY] The walk ledger holds two rows — compile the past walks into it, then write its figures (owner, D607, 7 Oct 26)
**DONE 7 Oct 26 on `claude/docs-tidy-7-oct`** — 63 rows added from 56 sheets (65 in all), type R added for a re-test
with no change, "The figures" written: `raptor-port/docs/walk-ledger.md`; the helpers' full output with the line each
count came from: `raptor-port/docs/handpass/parts/ledger-g1.md` … `ledger-g4.md`. Its figures were read by Astra and
Sol with the walk-sizing wording (`[WALK-SIZING-GUIDE]`). This item leaves by script at the next documents pass he
approves (`[START-CONTEXT-AUDIT]`, option 3). The text below is the item as filed.
`raptor-port/docs/walk-ledger.md` was started on 7 Oct 26 with the two walks of `[OIL-WORK-START]`. His ask is for the HISTORY:
"statistics of which type of change a walk is useful". **To do:** for every bug check that walked the app — the evidence sheets in
`raptor-port/docs/handpass/` (about sixty; leave out the readers' reports, the scenario lists and the plans) — add one row: the
date, the job, the type of change (the ledger's list A–H), the walk (who walked, how many scenarios and pictures, which sizes),
the tokens where a figure was recorded, and what the walk found, sorted three ways — real faults in the app (fixed or filed),
wording or cosmetic finds, and finds that proved false, already known or as ruled — plus what ELSE found faults on that job (a
test, a code read, his own look). Where a sheet does not say, the cell says "not stated" — never a guess. Then write the ledger's
"The figures": by type of change, how many walks, what they cost and what they found, and one plain paragraph for him on which
types a walk has paid for itself. A documents chore: a Sonnet helper may extract the rows (D588), the host checks a sample
against the sheets and writes the figures. **Place (the agent's line):** next, with `[START-CONTEXT-AUDIT]`'s chat — before the
next walk is sized, since the sizing step reads these figures.


*Moved here 2026-10-07 by backlog-archive.mjs ([WALK-SIZING-GUIDE]). Forward facts: `raptor-port/docs/bug-check-order.md`, `raptor-port/docs/walk-ledger.md`.*

### [WALK-SIZING-GUIDE] The checking guide still says "the full walk" for every FULL check — word it to D607: the walk is sized per change, by Opus, from the record (owner, D607, 7 Oct 26)
**DONE 7 Oct 26 — APPROVED BY HIM (D608, "Approve") and put into the guide the same day on `claude/docs-tidy-7-oct`:** `raptor-port/docs/bug-check-order.md` §7.0 and the sentences around it, `.claude/rules/bug-check.md`, three passages of `raptor-port/docs/guide-full.md`, the ledger's fourth sizing line. It leaves by script at the next documents pass. As it stood before his word: drafted, NOT in the guide. Both readers said CHANGES
REQUIRED on the first draft (a test could stand in for a control that must be pressed; seven sentences still ordered
the unsized walk); every finding was taken — the file is VERSION 2, sixteen edits, which has had no read of its own
(the cap of one round each). The proposed wording, edit by edit: `raptor-port/docs/superpowers/specs/2026-10-07-walk-sizing-guide-wording.md`; the readers' brief and
their two reports (Astra, Sol 6.1 — one round each, apart, D70):
`raptor-port/docs/superpowers/briefs/2026-10-07-walk-sizing-wording-read-brief.md`, `…-read-astra.md`, `…-read-sol.md`;
what each asked for and what was done with it is at the foot of the wording file. The text below is the item as filed.
D607: before any walk the agent says what type of change it is, Opus decides what kind of walk it needs, and every walk is
recorded so the figures show where a walk is useful. The ruling's one line loads in every chat and governs from now; the record
and the five-line sizing step are in `raptor-port/docs/walk-ledger.md`. What still says otherwise: `raptor-port/docs/bug-check-order.md`
§5 (the FULL tier's "the full walk"; the tier table's costs), §7 (the walk) and §4 (where the walkers are spent), and
`.claude/rules/bug-check.md` (step 4's order names "walk" with no sizing step). **To do:** draft the wording — a sizing step
between the roll-call and the walk, pointing at the ledger; the tier table's FULL row reading "a walk sized by the sizing step";
D16 kept for how a long pass is run — have Astra and Sol 6.1 read it, one round each (D70), then put it to him. Nothing else of
the order changes. **Place (the agent's line):** with `[START-CONTEXT-AUDIT]` — the same documents-only pass, the same readers.


*Moved here 2026-10-07 by backlog-archive.mjs ([R3-OWED-READS]). Forward facts: `raptor-port/docs/handpass/2026-10-06-rest-blank-line.md`.*

### [R3-OWED-READS] Two small reads the stack check's third round still owes (filed 6 Oct 26)
(1) The last fix of the round had no independent read of its own — the cap of two reads: `raptor-port/src/ui/schedule-tab.ts`, where
the Tab that keeps the caret in a day's last box looks its day up again when the redraw replaced it (it is the fix both readers
specified; its test is in `raptor-port/src/ui/schedule-tab.test.tsx`, "D597 when the redraw at that Tab replaces the whole day …").
(2) The short lines of D602, D603 and D604 have not been read against their full rows by a reviewer who did not write them (D138).
**Place:** in the brief of the next read Astra is given — the crew-rest fix's (`[REST-BLANK-LINE]`).
**BOTH DONE, 6 Oct 26** (Astra, in the crew-rest fix's scenario read — `raptor-port/docs/superpowers/briefs/2026-10-06-rest-blank-line-scenarios-astra.md` §5):
(1) the Tab fix is sound for the redraw it was written for — no defect; what its test does not cover is filed as
`[TAB-LAST-BOX-TEST-GAPS]`. (2) D603 and D604 pass; D602's short line had lost a condition of its full row ("options first,
nothing trimmed before he rules") and was reworded the same day — the new wording is read again by both readers of the fix
(the sheet `raptor-port/docs/handpass/2026-10-06-rest-blank-line.md`). This item leaves at the next documents-only pass (D29).


*Moved here 2026-10-07 by backlog-archive.mjs ([OIL-WORK-START]). Forward facts: `raptor-port/docs/engine-rules.md`, `raptor-port/docs/walk-ledger.md`.*

### [OIL-WORK-START] A flying line's earned leave counts from its entered in-time / Rally, and a published day keeps what it went out with (D591; found 5 Oct 26 by Claude's check of the Codex stack)
**BUILT 6 Oct 26 on `claude/oil-work-start-build-35a0e3` (D591, D592) — FULL-checked; MERGED on his "merge live" and live since 7 Oct 26 (PR #484). It leaves by script in `[STACK-MERGED-TIDY]`. Still his to overrule, none blocking: the build's readings in D592's and D606's full rows (`.claude/decisions-full/oil.md`) and at the head of the sheet; told to him, his to raise — the desktop week and the published face draw no SC in-time, so a B typed on the board moves OIL with no sign of it there (the OIL tracker's worked times show it).**
What was built, line by line: `raptor-port/docs/superpowers/specs/2026-10-06-oil-work-start-behaviour-register.md` (OWS1–OWS11); the
rules as written: `raptor-port/docs/engine-rules.md` §Weekend/PH work earns OIL; the check, its look card and the readings
put to him: `raptor-port/docs/handpass/2026-10-06-oil-work-start.md`. Beyond the two halves below, from the plan's two
challenges: a published weekend reads pending when anyone's OIL amount OR worked times would change; the four sign-offs
fall when a later Logic change would alter the OIL of the day they signed. Fixed with it, from the scenario read: the OIL
tracker printed only the first worked period of a day; the Logic page said standby lines can never earn. Filed beside it:
`[OIL-ZERO-SPAN-SORTIE]`, `[UNPUB-WARN-AL-RESTORES]`, `[LOGIC-REDRAW-DROPS-TYPING]`, `[OIL-EARN-DAY-SWITCH-WORDS]`,
`[SC-B-CHANGE-SAYS-BRIEF]`. **Added on the same branch, 7 Oct 26 (D606):** an SC shift's typed B — its in-time — where
filled and earlier than the shift's start, starts the MAIN's OIL day (register OWS12; the sheet's §D606).
The text below is the item as filed.
**His ruling (D591, 5 Oct 26):** *"it should take the actual intime/rally time right? not the nominal report timing"* — a flying
line's earned leave (OIL) is worked out from its actual in-time / Rally time. Full row: `.claude/decisions-full/oil.md` D591.
**What the app does today (not his ruling, and not this stack's doing — the same on `main`):** earned leave starts at take-off less
the Logic page's "Nominal report before T/O", never at an entered in-time or Rally; and it is worked out afresh from TODAY's Logic
values every time it is shown, published days included.
**The finding that raised it (W1 of `raptor-port/docs/handpass/2026-10-05-codex-stack-check.md` §5.2 — found separately by Astra, by an
Opus reader and by a walker, and seen by the host in the walker's pictures):** Ranger on a published Saturday, take-off 10:00, landing
11:15, a full day (+1, 07:00–13:15). Changing "Nominal report before T/O" from 3h to 2h30 makes it half a day (+0.5, 07:30–13:15) at
once — "No pending changes", ORIG, the four sign-offs standing; "Flight debrief after land" and the full-day threshold do the same; it
flips back when the value is put back. Against D48 and D142. The Rally work made it likelier: the same box now also sets the time the
"+ In-time / Rally" button fills in (D510).
**To build — two halves, one job:** (1) the start of a flying line's earned-leave day is the report time the work-hours bar already
uses (the one shared reader, `engine/reporting.ts`), with the nominal time only where no in-time or Rally is entered; (2) a published
day keeps the values its earned leave was worked out from, so a later change — to an entered time or to a Logic value — reads as a
pending change and moves the earned leave only when the day is published again. A reader's step-by-step proposal for half (2):
`raptor-port/docs/handpass/parts/stack-read-AB.md` §4 lead 1; Astra's: `raptor-port/docs/superpowers/briefs/2026-10-05-codex-stack-scenarios-astra.md` M1, M2.
**Answered — nothing is left to ask before building (D592, 5 Oct 26: "all 4 as recommended"):** the earliest in-time or Rally that
applies to the formation; the nominal time where none is typed; an evening-before report lengthens the line's own day and credits
nothing to the day before (D42); a published day keeps its OIL until published again; and, his reminder, the day still runs from the
first event's start to the last event's end with the breaks counted (the 29 Aug 26 rule) — so from the earliest of the in-time / Rally
and any earlier event of his.
**Tier:** FULL — earned leave, the published record, saved data. **Place (the agent's proposal, his to set):** its own branch, straight
after the Codex stack goes live; until then, do not change those three Logic values once a weekend is published.


*Moved here 2026-10-07 by backlog-archive.mjs ([REST-BLANK-LINE]). Forward facts: `raptor-port/docs/engine-rules.md`, `raptor-port/docs/walk-ledger.md`.*

### [REST-BLANK-LINE] A man put on a flying line with no take-off loses his crew-rest check (reader AB's second pass, 6 Oct 26 — OLD, the same on `main`; MEDIUM)
Mon: X on a line landing 22:30; Tue: X on a line taking off 07:00 → the red "Crew rest breach", its ring, Monday's dotted mark. Now
"+ Line" on Tuesday (a new line comes up blank) and put X in its seat: by the code the warning, the ring and the dotted mark all go;
a blank crewed line on MONDAY, in a wave drawn before his 22:30 landing, likewise stops Tuesday's breach being raised; the same-day
tight-turn note can miss a turn the same way. Cause: a line with no times carries not-a-number times into the crew-rest arithmetic
(`raptor-port/src/engine/validate.ts` — the earliest-report minimum and yesterday's last end), and every comparison with it is false.
The check's W4 / RF1 fixed only the work-hours reader of that event. By reading, not yet run: it needs its red test first. The fix,
step by step, and the lines: `raptor-port/docs/handpass/parts/stack-read2-AB.md` F1 (skip a leg whose take-off or end is not a number
in the three places; leave the count that includes a timeless leg on purpose). **An engine change: the robustness doctrine's five
families are walked with it.** **Place (the agent's line):** FIRST after the Codex stack goes live, with `[OIL-WORK-START]` — a
missing crew-rest warning is the kind of fault that harms people; it is not the stack's, so it was not fixed under cover of its check.
**His word (D602, 6 Oct 26): fixed first after the stack, in a new chat.** Run through the rule itself that day (not on screen): the
warning goes when he is put on a line with no take-off — on his own day or the day before — and comes back the moment a take-off is
typed on that line, a landing not needed; a landing alone does not bring it back.
**BUILT 6 Oct 26 on `claude/rest-blank-line`, FULL check done — his look and "merge live" left.** Seen on screen on the live
build first (the warning, the ring and Monday's dotted mark go when he is seated on a new blank line), gone on the fixed one.
NOT built the way F1 proposed: skipping every line without a take-off would have lost the breach a typed Brief already raised
and kept ignoring the wave's In-time (Astra's scenario read) — each time is used only when it exists, and a man whose only
line is blank still breaks crew rest on an earlier meeting. The record, with what was walked and what was not:
`raptor-port/docs/handpass/2026-10-06-rest-blank-line.md`; the rule: `raptor-port/docs/engine-rules.md` §Crew rest. This item
leaves when the branch merges (D29).


*Moved here 2026-10-07 by backlog-archive.mjs ([BLANK-TIMES-ABSENCE]). Forward facts: `raptor-port/docs/engine-rules.md`, `raptor-port/docs/walk-ledger.md`.*

### [BLANK-TIMES-ABSENCE] A man on all-day leave or a downchit, seated on a line or row with no times, gets no line in the warning list until a time is typed (found 6 Oct 26, the crew-rest fix's check — OLD, the same on the live app; MEDIUM; a question for him)
Tuesday: file an all-day LL (or OL, or a downchit — ATT C) for a man; "+ Wave" (its line comes up blank); put him in its seat.
The crew list does warn before he is placed — his name is struck with "local leave (LL)" / "medically down — cannot report to
work (ATT C)", and the toast says so — but once he is seated the day's list says nothing and his puck is plain. Type a take-off
or a landing and the red "On leave but planned to fly …" / "Downchit but planned to fly …" line, the ring and the C chip
appear; clear the times and they go again; the same after a reload. Run by the host through the rule and walked on screen
(walker C, S15 — `raptor-port/docs/handpass/parts/rbl-C.md`, pictures `…/2026-10-06-rest-blank-line/C/dk-0{1,3,5}-s15-leave-*.png`).
**Cause:** every absence check asks whether the absence OVERLAPS the event's times (`raptor-port/src/engine/validate.ts` — the
sortie loop "C via input clash", the duty / sim / ground loop under it, the SC SPARE and AVALON / BB looks), and a comparison
with a time that is not there is false. For an absence that covers the whole day the answer does not depend on the missing
time. It is the crew-rest fault's sibling (Astra's scenario read §4), NOT fixed with it: the same silence holds for a duty desk,
a sim seat, a ground row and the standby lines, where it was written down as the rule ("a BB shift with blank times … is
simply not collected", `avalon-rules.test.ts`), and a leave warning on a published day is FROZEN (D177–D179), so changing it
touches the published record. **ANSWERED — D605 (6 Oct 26, "4 yes as recommended"): YES.** A man who is away or grounded for the
whole day is flagged the moment he is seated anywhere that day, times or no times; a part-day absence against a seat with no
times stays silent (nothing to compare). Nothing is left to ask before building. **To build:** in each absence check, an
absence that covers the whole day counts against a seat whose times are missing — the sortie loop, the duty / sim / ground
loop, the SC SPARE and AVALON / BB looks — with each kind's exemptions as they are; the standby lines' "blank times check
nothing" pin (`avalon-rules.test.ts`) changes for whole-day absences only; a published day keeps freezing these warnings
(D177–D179) — walk that it reads pending there and never rewrites the issued face; red tests first, one per kind of seat.
Full row: `grep -h '^| D605 |' .claude/decisions-full/*.md`. **Owed with this job's first read:** D605's short line read against its full row by a reviewer who did not write it (D138). **Tier:** FULL (the warning list, the published record).
**Place (the agent's proposal, his to change):** its own small job, NEXT — before `[OIL-WORK-START]`, with
`[SC-PICKER-INTIME-REST]` — since a missing "grounded but flying" warning is the kind of fault that harms people.
**BUILT 6 Oct 26 on `claude/blank-times-absence-picker-2cebae`, FULL check done — his look and "merge live" left.** Seen on
screen on the live build first (a man on all-day leave seated on a new blank line: plain puck, nothing in the list), flagged
at once on the fixed one — on a flying line, a duty, sim, ground and programme row, an SC MAIN and SPARE with cleared
times, a BB / AVALON seat and desk. Two readings of the agent's were told to him in the report (D605's full row, (6) and
(7)): it reaches every input type that covers the whole day, not only leave and medical; the crew list is unchanged.
Astra's scenario read found three faults that were fixed in the same build, each red-first — an Upchit raising "Upchit
clashes with …" (OLD, on timed seats too); a request typed 00:00–23:59 and put on the programme going silent against a
seat with no times; an unnamed sim or duty row printing "— Sim" / "— duty". The record, with what was walked and what was
not: `raptor-port/docs/handpass/2026-10-06-blank-times-absence.md`; the rule: `raptor-port/docs/engine-rules.md` §Crew
rest ("An absence that covers the whole day"). This item leaves when the branch merges (D29).


*Moved here 2026-10-07 by backlog-archive.mjs ([SC-PICKER-INTIME-REST]). Forward facts: `raptor-port/docs/engine-rules.md`, `raptor-port/docs/walk-ledger.md`.*

### [SC-PICKER-INTIME-REST] Before a man is put on an SC seat, the crew list ignores the shift's typed in-time when it asks about crew rest (Sol's read of the crew-rest fix, 6 Oct 26 — OLD, the same on the live app; low–medium)
Monday: X lands 22:30 (clear 12:30 on Tuesday). Tuesday: an SC wave with someone already in a MAIN seat, B (the in-time) typed
05:00, shift 13:00–19:00 — or its start and end blank. Arm the other MAIN seat: the crew list prints no "crew rest — not clear
until 12:30" beside X, although placing him raises the breach against the 05:00 report (the toast and the list then say so).
By reading, not run on screen. **Cause:** the SC seat's own check compares his clearance with the shift's START and never with
its typed B (`raptor-port/src/engine/avail.ts`, "SC is treated as flying for crew rest" — `cl>r.scStart`), and the shared
pre-drop question cannot answer for an SC seat because it measures from a sibling event of kind `fly` only
(`raptor-port/src/engine/validate.ts` `restIfPlaced`, `sibE`). Not the empty-formation case (`[REST-FIRST-CREW-HINT]`): here a
sibling is seated. **Fix (Sol's steps):** two red tests first — B 05:00 with blank shift times, and B 05:00 with 13:00–19:00,
a MAIN sibling seated: the pre-drop answer is "not clear until 12:30" and matches the placed warning; let `restIfPlaced` take
a `shift` sibling as well as a `fly` one (same formation, another person) — **with an SC SPARE seat as the negative control: a
spare carries no crew rest, and the sibling lookup goes by formation, so a spare seat must not borrow the MAIN's answer**; walk
the armed crew list and the drag bubble for both. **Place (the agent's line):** with `[BLANK-TIMES-ABSENCE]` — the next small
job, both are about what the app says before and after a man is seated where a time is early or missing.
**BUILT 6 Oct 26 on `claude/blank-times-absence-picker-2cebae`, with `[BLANK-TIMES-ABSENCE]`'s FULL check — his look and
"merge live" left.** The crew list's question now counts a shift sibling as it counts a sortie's, backward and forward,
and answers nothing for a seat the conflict engine leaves alone (an SC SPARE, AVALON, BB) — the negative control is
pinned. An EMPTY SC formation still says nothing before the drop (`[REST-FIRST-CREW-HINT]`). The rule:
`raptor-port/docs/engine-rules.md` §Crew rest ("The crew list's crew-rest question answers for an SC MAIN seat"); pins
`raptor-port/src/engine/scpickerrest.test.ts`. This item leaves when the branch merges (D29).


*Moved here 2026-10-07 by backlog-archive.mjs ([MODAL-DRAG-CLOSE]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [MODAL-DRAG-CLOSE] A pop-up window closes when text is selected by dragging and the finger or mouse is let go outside it — found 3 Oct 26; FIXED the same day on the Insights branch (D538), awaiting the reads and main
**FIXED 3 Oct 26 (his "Fix it", D538):** one helper, `src/ui/outside.ts` `clickedOutside` — a window closes on its surround only
when the press began on the surround; all thirteen windows that close that way use it; `outside.test.tsx` was red first and scans
that none keeps its own test; re-tried in the running app. Fable and Astra read it after the reset. What follows is the find.
**His report (3 Oct 26, the Duty templates window, "desktop mode"):** *"it seems like this page closes itself when I tried to type in
a new row role. Something along that line. Seems like a bug."* **Reproduced on a desktop, on the Insights build and on the build
before it:** press inside a box in the window, drag to select its text, let go on the dark surround — the window closes. The press
started inside and the release landed outside, so the browser reports ONE click on the surround, which is the window's "tap
outside to close" test (`src/ui/DutyTplModal.tsx:74` — `e.target.id === 'tplModal'`; the same test on at least six other
windows: Insights, day templates, plans, manage waves, and the rest of `ui/*Modal*.tsx`). Typing, Enter, a suggestion and Tab did
not close it, at desktop or phone size; a real iPhone keyboard was not available to try. **To build:** close on the surround only
when the press BEGAN on the surround too (remember the pointer-down target; one shared helper for every window, with a test that
drags from a box to the surround on each). His standing rule "a click-open popup closes on a click outside it" (4 Sep 26) stays —
a drag that started inside is not a click outside. **Not fixed here:** no ruling asked for it (D534 and D536 name their fixes).
**Place:** small, with the workflow UI pass (D495) — or at once on his word. Evidence and probe:
`raptor-port/docs/handpass/2026-10-03-insights-mission-mix-opus-interim.md` §His second report.


*Moved here 2026-10-07 by backlog-archive.mjs ([SAVE-NOTE-COVERS]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/walk-ledger.md`.*

### [SAVE-NOTE-COVERS] Raptor's "Not saved — Retry" note floats over the page's own controls (filed 28 Sep 26)
**Place:** medium — next, on its own small branch (a shell matter; the change-recording chat is changing the top bar —
tell it first, D302). Found by the Tracker leftovers' walk (walker c, F2; pictures
`raptor-port/docs/img/handpass/2026-09-28-trk-leftovers/walk/lo-2c-b06-1200.png`, `…-b06-390.png`): when a save fails,
the note that floats under the top bar's right end (since `[LW-FIGSEL-FLAKE]`, merged 28 Sep 26) lands exactly over the
Tracker's ✓ Save changes at 1200px — a press on Save's middle hits Retry, a press on the note's words passes through to
Save beneath — and at 390px its Retry sits on the ✎ Syllabus menu button. It reads amber, not red. **Do:** a
roll-call of every page's controls under the note's spot (Edit Schedule, the board, the Leave War, the Tracker, Quals,
Admin) at phone and desktop; give the note a place that covers nothing (or pushes nothing), with a browser test that
the element at each covered control's centre is still that control.
**5 Oct 26 (D586) — in hand on `codex/save-note-controls`:** reproduced on every page at five sizes with real presses
(far wider than filed: the name search box on both schedule pages, Quals' filter, the Leave War's "+ New"), and two
more found — on the full-screen scheduler board the warning cannot be seen at all, and the note keeps a stale place
after a page change (at 1366 it lands on the account button and Logout). Proposed and shown to him before any layout
change: a band of its own along the bottom of the top bar. The record and what is still owed:
`raptor-port/docs/handpass/2026-10-05-save-note-controls.md`.
**BUILT 5 Oct 26 (D587 — his "ok looks good" to the pictures):** the warning has a band of its own along the bottom of
the top bar, and the same band under the bars of the scheduler board, the Inputs calendar and the Medical view; the
contract is `raptor-port/docs/ui-contracts.md` §The failed-save warning has a band of its own; pinned by
`raptor-port/e2e/save-note.spec.ts`. **Left before it can close:** his look on the preview, and his "merge live" — this
branch sits on the unmerged `codex/workflow-ui`, so it reaches `main` only after Claude's owed reads of that work.


*Moved here 2026-10-07 by backlog-archive.mjs ([SONNET-WALKER-TRIAL]). Forward facts: `raptor-port/docs/bug-check-order.md`, `raptor-port/docs/walk-ledger.md`.*

### [SONNET-WALKER-TRIAL] One Sonnet 5.5 walker beside the Opus ones on the next walk, and the comparison reported to him (D476, 1 Oct 26)
**His ruling (D476 — "Trial"):** to save tokens (the three walkers of the `[WARN-HIDE-KEPT]` FULL check cost about 1.9
million), try Sonnet 5.5 as a walker — once, beside the Opus ones, not instead of them. Full row:
`.claude/decisions-full/how-we-work.md` D476; the method: `raptor-port/docs/bug-check-order.md` §4.
**To do, on the next WALK- or FULL-tier check (whichever job it is):** (1) fan the walk out as usual (D16, Opus); (2) spawn ONE
extra walker with `model: "sonnet"`, handed the SAME brief, scenario share and frozen build as one of the Opus walkers,
on its own port and its own picture folder; (3) reproduce every finding of both; (4) report to him, in plain words, a
small table: what each found, what each missed that the other found, false alarms, pictures opened or not, tokens
each cost; (5) record his answer as a new ruling — it decides whether walkers, documents-only chores and gate runs
move to Sonnet 5.5. Until then nothing else goes to a cheaper model.
**Place:** with the next walk — it adds one walker to that walk and nothing else; no build of its own.
**WALKED 1 Oct 26, on `[INSIGHTS-WHICH-COPY]`'s walk** (steps 1–4 done): the two walkers gave the same verdict on all 19
scenarios; no false alarm from either; the Opus walker alone met one older defect off the list; the Sonnet walker skipped
one part (Print / CSV) and owned up to one weak check; about 613,000 tokens against about 620,000. The table: `raptor-port/docs/handpass/2026-10-01-insights-which-copy-check.md`
§11. **Caveat told to him:** the build had no defect in it, so the trial does not show whether Sonnet catches what Opus
catches. **HIS ANSWER — D480 (1 Oct 26): "One more trial".** A second trial on the NEXT walk, on a build with known defects: walk the
build as it stood BEFORE its fix, neither walker told what is wrong, and report what each CAUGHT (`raptor-port/docs/bug-check-order.md`
§4). **Its place:** `[WORKSPAN-NEGATIVE]`'s walk (the next chat, D483) — freeze the build before the fix for the two trial
walkers. Then his answer to the second report is a new ruling. Until then nothing else goes to a cheaper model.
**D588 (5 Oct 26 — "Walk, checks, chores + one trial fix"):** he did not wait for the second report — Sonnet 5.5 now walks
the app, runs the check set and does documents-only chores; it never reads code to find bugs. **The second trial still
runs, its place moved:** the check of the Codex stack (D589, `claude/codex-stack-review`) — one Opus walker and one Sonnet
walker on the same scenarios, on the frozen Rally build as it stood before its review fixes (the baseline
`codex/rally-workspan`'s sheet names), neither told what is wrong; the report adds his weekly allowance read before and
after each walker. **D595 (5 Oct 26, the same night): the trial is kept SMALL and the agent decides from it and tells him — the Sonnet walker's
share was cut from twelve Rally scenarios to seven while it ran; the comparison is `raptor-port/docs/handpass/parts/stk-trial-1.md`.**
**A building trial rides with it:** `[OG-TAG-OVER-COUNT]` built by a Sonnet helper to a precise spec, its
diff and tests read by Opus. His answer to each report is a new ruling (`raptor-port/docs/bug-check-order.md` §4).


*Moved here 2026-10-07 by backlog-archive.mjs ([DISCARD-MARKS-REMOVE]). Forward facts: `raptor-port/docs/walk-ledger.md`.*

### [DISCARD-MARKS-REMOVE] Remove the "Discard marks" button from the Amendments box (D488, 2 Oct 26)
**3 Oct review follow-up completed:** only the unused import and six historical-script retirement heads from Claude's small check, on this same branch. Original bodies/history preserved; no new behaviour. All five gates plus rulecheck/docsize PASS; fresh independent Astra delta inspection PASS, recorded in the existing branch-local evidence sheet. The separate Rally fixes are pushed on `codex/rally-workspan`; this branch contains no Rally changes. Monday's owed reads and owner look remain.
**BUILT 2 Oct 26, not merged:** `codex/discard-marks-remove`; Sol 6.1 built, fresh Astra final inspection PASS, FULL gates/runtime passed (one already-filed browser retry disclosed). Evidence and complete inspection response are on that branch in `raptor-port/docs/handpass/2026-10-02-discard-marks-remove.md` and `…-review.md`. Claude's further code/scenario/working-guide reads after Monday 5 Oct 26, 19:00, and owner look remain owed before main. The phone item is archived as moot. The original build recipe below is retained for review.
His ruling: remove it. It clears only the change marks of days not yet published (the edits stay), a first publish clears them
anyway, and its name misleads. **To build:** take the button out of the Amendments box (`ui/ALPanel.tsx`), with its command, its
count and its "Draft marks cleared (N)" history line (`state/sched-commit.ts commitDiscardPending`, `engine/publish.ts
discardPending` / `discardableCount`) — check first that nothing else calls them; the tests that pin it change with it (five test
files name it), and the old walk scripts under `scripts/handpass/` that press it are history, left alone. Rewrite the sentence in
`raptor-port/docs/engine-rules.md` marked D488; check `ui-contracts.md`, `feature-impact.md` and the IT flow guide for the button
(D201; the guide is re-shot only on his word, D403). Roll-call: the Amendments box on a desktop, the phone (the box is hidden
there), a week with only draft days, a week with a published day carrying pending changes, the change history. LOOK / WALK tier
by the order's questions — it removes a door and a command that writes the saved marks, so answer them honestly at build time.
`[PHONE-DISCARD-MARKS]` is archived with it. **Not ruled, his to raise:** a button that puts a published day back to its last
published version. **Original place — D488:** after the reset (D484), batched with other small Edit Schedule fixes (D485). **Narrowed by D494/D495:** the small first Codex job, now built; review/merge still pending as above.


*Moved here 2026-10-07 by backlog-archive.mjs ([WORKSPAN-NEGATIVE]). Forward facts: `raptor-port/docs/walk-ledger.md`.*

### [WORKSPAN-NEGATIVE] A line timed earlier than its wave's in-time gives a negative work-hours figure (found 1 Oct 26)
**Current build status,2 Oct26:** implemented with [RALLY-TIME] on `codex/rally-workspan`; FULL automated gates and scoped running-app/performance evidence complete; fresh Astra round2 inspection PASS, both first-read findings repaired and two inherited follow-ups explicitly filed/nonblocking under D490. Evidence: `raptor-port/docs/handpass/2026-10-02-rally-workspan.md`. Not live, not merged; OWED Claude's read after the reset before main. The original fault and planning history below are retained.
Found by the Opus walker of `[INSIGHTS-WHICH-COPY]`, off its list; reproduced by the host. Nothing published; on Monday's
board, Go 2's RU line moved from T/O 19:20 / LD 20:45 to 10:00 / 11:25 while its wave's in-time line still reads 1920H:
Insights shows "Wisp -2h-30" with a full-width bar and "Outlaw 10 min", and Monday's issues list says nothing about either.
The cause: `engine/validate.ts workSpan` takes the wave's in-time as the report time even when it is LATER than the
landing, so the day's end falls before its start. Older than that build (the function is untouched; the same on `main`);
it would happen again to new data, so it is real. It is the one measure the long-work-day warning shares, so the fix is a
warning-rule change (FULL tier) — decide there what a report later than the take-off means (ignore the in-time for that
line? flag it?). Pictures: `raptor-port/docs/img/handpass/2026-10-01-insights/host/`. **D494/D495 make this the next Codex job, with related approved Rally changes; D496 supplies Astra planning/review and Sol building. D502/D503/D505–D507 settle feedback, reporting day and selection. Preserve current no-report step fallback; no remaining fallback/advisory question blocks this build.** **Place — D483 (1 Oct 26, "U can fix the older
fault in the next chat"): NEXT, in the next chat, on its own branch, with a FULL check (it changes the measure the
long-work-day warning shares). The second Sonnet-walker trial (D480) rides on its walk — freeze the build BEFORE the fix for
the two trial walkers. The second Sonnet trial itself still waits for Claude's first walk after Monday's reset (AGENTS); do not invoke Claude in the meantime.**


*Moved here 2026-10-07 by backlog-archive.mjs ([RALLY-TIME]). Forward facts: `raptor-port/docs/walk-ledger.md`.*

### [RALLY-TIME] Approved reporting changes with negative-hours fix (D497–D507, 2 Oct 26)
**Effective publication rule,3 Oct26 (D509):** supersedes the historical D502
block described below. Wrong timing remains a red working/issued warning and
never refuses first publication, AL or correcting reissue. D510 corrects the18
demo clocks and uses the nominal lead for the add button; D511 gives its words
an adjacent Logic text setting in the existing rules record. Exact review fixes
and this round's evidence are under [RALLY-REVIEW-FIXES]; prior history is retained.
**Current build status,2 Oct26:** D503–D507 supersede the historical pending choices below; owner-approved in-place In-time/Rally implementation is pushed on `codex/rally-workspan` with [WORKSPAN-NEGATIVE]. FULL gate results and Astra round1 repairs are in `raptor-port/docs/handpass/2026-10-02-rally-workspan.md`; final scoped app walk/performance complete; fresh Astra round2 inspection PASS. Owner requested Claude review handoff; owner look and OWED Claude read precede any live merge. No new product question blocks this batch.
Planning only. Three squadron patterns: rally only, in-time with rally immediately after/no second clock, and separate in-time/rally. Required direction where present: in-time -> rally -> brief -> take-off -> landing. Rally supplies report start when in-time is absent. Preserve notes, e.g. WX/NOTAMs and Rally (Reaper + Saber), in a neat UI. Design home: `raptor-port/docs/superpowers/specs/2026-10-02-rally-time-design.md`.
D500 confirms existing formation recognition and free-text input must be preserved; formation-specific lines retain current wave-wide fallback precedence pending a separate decision. D498 proposes keeping the existing box as In-time / Rally, using the earliest applicable reporting instruction; an earlier qualifying event starts only that person's day sooner. Impact map, mock-up checks and independent Astra response are linked in the design home. Keep existing saved text and separate OIL reporting meaning; dual-stage precedence, clocks in remarks and missing/equal-stage definitions remain pending; D501–D502 settle one operative clock and editing feedback/publication enforcement. D501 approves one operative clock per line with activity wording/remarks and retained free text. D502 approves explaining the incorrect pair during draft editing, draft editing/saving allowed and publication blocked until corrected. D503 settles reporting day: a reporting clock later than applicable take-off means the immediately preceding day, at most one day back; omit the routine interpretation line and Change day controls. This expands the existing bounded heuristic and needs a real build. D504 approves the actual-app in-place label/layout and formation-only or unnamed whole-wave scope; no individual-person targeting or personal-name parser. D505 resolves formation override separately by activity; D506 chooses earliest resolved duplicates in applicable scope; D507 allows rally equal brief without a new gap. Existing omitted-stage/brief/standalone checks remain. Recognition is formation-token matching, not general interpretation of prose. Ask at most four product questions per round, recommendations each.
Existing-behaviour audit after owner challenge: `raptor-port/docs/superpowers/plans/2026-10-02-in-time-behaviour-audit.md` — consumer meanings, current stage/remarks/midnight limits, existing B guard, focused tests and targeted actual-editor evidence; no app change or design approval.
**Place:** build with [WORKSPAN-NEGATIVE], next under D495; final answers are approved, independent plan challenge precedes implementation, FULL check sized by timing/publication consequences. Existing [WORKSPAN-NEGATIVE] fallback/advisory questions are superseded as questions by this broader discussion, not treated as answered.


*Moved here 2026-10-07 by backlog-archive.mjs ([RALLY-REVIEW-FIXES]). Forward facts: `raptor-port/docs/walk-ledger.md`.*

### [RALLY-REVIEW-FIXES] The fixes from Claude's small check of the two Codex builds (3 Oct 26; D508, D509)
**Current round:** independent Astra plan and Sol challenge:
`raptor-port/docs/superpowers/plans/2026-10-03-rally-review-fixes-plan.md`.
Rally A–F/D2 built and checked on `codex/rally-workspan`: failing tests first,
FULL gates and running-app pictures; initial Astra header/downstream findings repaired,
fresh independent inspection2 PASS. Exact frozen proof, limits and owed reads:
`raptor-port/docs/handpass/2026-10-02-rally-workspan.md` (3 Oct snapshot2).
The two Discard leftovers follow on their separate branch; no new product ruling,
Insights work or live merge implied. Claude's Monday full check remains owed.
Claude's small check (Opus planned, Sonnet read, the host confirmed — an early signal, not a bug check) found on
`codex/rally-workspan`: a fresh demo week could not be published Mon–Thu (the new order check blocks on the suggested
brief); the "+ In-time / Rally" button mints a flagged line; a previous-day time prints with no day; the typed-remarks
list never gained Rally. **His answers, 3 Oct 26:** no timing problem blocks publishing — a red warning only, the blank
brief checked as the suggested brief and named so (D509, narrowing D502); the demo week's in-times corrected (3 hours before take-off, D510); the button fills in a time and words both set in Logic (D510, D511); the button
and the previous-day wording as sketched to him. On `codex/discard-marks-remove`: one unused import and six old walk
scripts that still look for the removed button. The finds and the exact fixes:
`raptor-port/docs/superpowers/briefs/2026-10-03-codex-review-fixes.md`. **Place:** NOW, by Codex (D496), before Insights —
nothing is built on top of the Rally build until these are in. **Still owed after the reset, before any "merge live":**
Claude's full check of both builds — the walk, the blind walker trial (D480), the second reads, the working-guide reads.


*Moved here 2026-10-07 by backlog-archive.mjs ([INSIGHTS-BOARD-DOOR]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/walk-ledger.md`.*

### [INSIGHTS-BOARD-DOOR] The Scheduler Board gets a way to open Insights — BUILT on the Insights branch, awaiting reads/main
Built with `[INSIGHTS-MISSION-MIX]` after D532 picture agreement: desktop beside the bell; phone in More only.
Actual callback and phone/desktop hit tests passed; the phone cascade overlap was found in pictures and repaired.
Fresh independent Astra final R2 PASS on freeze5 after both repairs; original phone-toolbar geometry also passes.
FULL evidence: `raptor-port/docs/handpass/2026-10-03-insights-mission-mix.md`. Claude's later read remains owed before main.
Original discovery and recipe below are historical, preserved for review.
Found by Astra's scenario design for `[INSIGHTS-WHICH-COPY]` and recorded by both walkers at both widths: while the
Scheduler Board is up, its own bar carries no Insights button (Calendar, Highlight, Templates, Sort all, Undo, Redo, History,
Sync, the bell, ✓ Done — D349's approved bar) and the shell's button and the phone's ☰ are covered by the board. It has
always been so; not a defect of that build. A window opened on Edit Schedule before the board stays on top of it.
**The question for him:** should the board gain a way in? On a phone its bar is ONE row and full (a control added there
displaces one — `.claude/rules/decisions/scheduler.md` §Week navigation), so the phone's place would be the ⋯ menu.
Evidence: `raptor-port/docs/handpass/2026-10-01-insights-which-copy-check.md` §5.2 finding 1.
**HIS ANSWER — D481 (1 Oct 26):** *"Yes, give me an insights button but where can we put the button? Is it too full for the
phone too?"* **Proposed to him, his to confirm on a picture:** desktop — a button "Insights" in the board's bar beside the
bell; phone — the bar is one row and full, so inside its ⋯ menu beside "Sort all" and "Desktop layout". **To build:** the
door in `ui/SchedBoard.tsx`'s bar and its ⋯ menu (`setInsights`), the window already stacks above the board; a browser test
that the window is topmost at its centre over the board at both widths. **Place:** its own small job (WALK tier), a picture
first; after `[WORKSPAN-NEGATIVE]`. Full row: `.claude/decisions-full/scheduler.md` D481.


*Moved here 2026-10-07 by backlog-archive.mjs ([CSS-SPLIT-BY-SCREEN]). Forward facts: `raptor-port/docs/walk-ledger.md`.*

### [CSS-SPLIT-BY-SCREEN] The scheduler's stylesheet split by screen — APPROVED D493 (2 Oct 26), the first step of the workflow UI pass
From Astra's tidiness read (its §2 — read it before building). `src/ui/scheduler.css` (about 6,700 lines) becomes an ordered
list of per-screen parts, every rule body moved unchanged and the overall order kept. Before any rule moves: a test that
every part loads once and in order, and a recorded measurement of the key computed styles, admin and member, at phone, laptop
and desktop widths — compared again after. No selector clean-up in the same change; no button changes size (D487). New files
→ `docs/file-map.md`; `docs/performance.md` Part 1's checklist applies. **Place — D493: the first step of the workflow UI
pass (`[FEATURE-WISHLIST]` item 5), before that pass moves anything.** **D539 (3 Oct 26):** Codex builds it its normal way (Astra
plans, Sol builds, Astra reads); Opus does not plan it; an interim Opus read of the finished split, if it is done before the reset
and allowance remains. Its new branch is cut from `codex/insights-mission-mix` with the two other built branches merged in first
(`HANDOFF.md`). After the split, every screen is walked at phone and desktop size, not only the measured ones.
**D540–D541 (3 Oct 26):** owner explicitly requires that integrated base before any rule moves, keeps the three earlier builds
separate for Claude's review, and requires no visible change plus opening every phone/desktop screen picture. *(D589, 5 Oct 26:
"separate for Claude's review" no longer holds — Claude checks the whole stack once, on `claude/codex-stack-review`, and it goes
live on one "merge live".)* Next batch branch:
`codex/workflow-ui`; scope: `raptor-port/docs/superpowers/specs/2026-10-03-workflow-ui-scope.md`. D546 defers D542/D543; D544 keyboard work remains. Actual UI design still waits.
**Built/checks, 3 Oct 26:** split22 contiguous runs from the combined base, original bytes and all4 emitted CSS assets exactly equal;
full unit7727,reference728,browser527+49existing skips,Tracker445,all6adapted/perf4/rulecheck/docsize PASS. Every main screen at
phone/desktop walked; all187before+136after original PNGs opened, actual-member/laptop/breakpoint/short-height matrix also checked.
Known `[PHONE-WIDE-BOARD-BLANK]` remains unchanged and is not a wide-body usability PASS. Fresh independent Astra R1 PASS for the bound mechanical split;
evidence: `raptor-port/docs/handpass/2026-10-03-css-split.md`. Claude's full read after Monday19:00 still owed before main;
item stays here until the required reads and owner's live word. Continue from D544–D546 and the filed UI faults;
usability versus file splitting explained, first two priorities deferred. No further UI design or source change inferred.


*Moved here 2026-10-07 by backlog-archive.mjs ([SCHEDULE-TAB-ROW-FLOW]). Forward facts: `raptor-port/docs/walk-ledger.md`.*

### [SCHEDULE-TAB-ROW-FLOW] Tab follows the chosen B flight sequence through the open schedule text boxes — D545/D554, 4 Oct 26
His report/request: while the scheduler types, Tab currently does not go to the next open text box on the right.
At the rightmost open text box, Tab should go to the leftmost open text box in the next row.
**Built/checked and fresh independent R2 PASS, D556, 4 Oct:** owner accepts the complete numbered week/Board pictures, "Ok looks good u can build". Agreed B route implemented on codex/workflow-ui; fresh Astra R1 found week exit stale paint and two proof gaps, now fixed/checked. FULL unit7765/current affected browser168 and21-step corrected frozen app walk PASS with explicit device/role limits. Fresh separate Astra R2 PASS for exact freeze18; branch-only preview shipping, no main/merging PR. Claude Monday read, owner preview/device look and authorized live word remain, so item stays open. Evidence: `raptor-port/docs/handpass/2026-10-04-schedule-tab.md`, immutable full R1/R2 reports and original/correction portable archives/indexes beside it. **Place:** workflow UI pass, after the completed stylesheet split; D544/D546 (first two earlier priorities deferred).
Forward Tab between open text boxes is settled. **D550–D553, 4 Oct, "all four recommended":** both Edit Schedule week and Board; only boxes already available for typing (empty ones included), no closed-editor/section/popup opening; reverse Shift+Tab; last box exits to the next ordinary control without loop/day change. D554 settles the flight sequence after the annotated actual-layout comparison: B on week and Board, even where phone text wraps. D555 accepts open headings/notes and displayed section continuation after the retained recommendation, including symmetric ordinary-control reverse exit. Owner also authorizes using Impeccable to help think through this task, not a broader redesign or skill update.
Keep Enter commits/Escape restores; unchanged Remarks traversal never asks the mission-role question (D529).
Scope/home: `raptor-port/docs/superpowers/specs/2026-10-03-workflow-ui-scope.md` (D545); picture before any visual change.
Concrete route: `raptor-port/docs/superpowers/specs/2026-10-04-schedule-tab-route.md` — D554 chooses B after the comparison: Callsign → Mission → Brief → Take-off → Landing → Remarks/stores; Shift+Tab reverses B. D545/D552's literal spatial reading narrowed. D555 includes open headings/notes through the displayed section order. Product scope complete: Astra implementation/scenario plan, Sol independent challenge then build and FULL checks, fresh Astra code read. No broader redesign or code approval inferred.
Numbered design pictures requested/shown and accepted D556, 4 Oct: `raptor-port/docs/superpowers/specs/2026-10-04-tab-flow-pictures/{week,board}-flow.png`, representative row/formation in every affected section, repeats explicitly labelled; phone flying variants and full live-field capture manifest retained. Plan: `raptor-port/docs/superpowers/plans/2026-10-04-schedule-tab-build-plan.md`; independent challenge/dispositions beside it. Design-picture evidence remains distinct from subsequent frozen working-Tab app proof; no main/merging PR authority.


*Moved here 2026-10-07 by backlog-archive.mjs ([SCHEDULE-INSIGHTS-MENU]). Forward facts: `raptor-port/docs/walk-ledger.md`.*

### [SCHEDULE-INSIGHTS-MENU] Phone schedule Insights moves into ellipsis menus — accepted D558, 4 Oct26
Owner's four photos: Photo1 existing Board menu is the reference; add ellipsis → Insights
in the circled Edit Schedule (Photo2) and View-only Sched (Photo3) toolbar spaces;
remove WEEK/Pick a date/Week insights from the drawer (Photo4). **Place:** workflow
UI pass, after the built D556 Tab route, before the later Inputs batch. New direction
filed D557 for design/picture look, accepted D558 "Looks good" after the corrected picture. Existing calendar
already opens the date picker. Recommend phone-only new menus with Insights alone,
preserving desktop direct entry and Board's existing menu. Other tabs lose the
drawer shortcuts and use the schedule page; no extra replacement inferred.
Design/home: `raptor-port/docs/superpowers/specs/2026-10-04-schedule-insights-menu.md`.
Selected navigation illustration `phone-proposal-v2.png` and4 originals/prompts
retained privately in the task's local visualizations folder, excluded from the
public branch after automatic approval review rejected that image upload;
privacy disposition beside spec. Synthetic unrelated schedule drift
excluded. Independent Astra D557 meaning/target-picture read matches; Astra plan
and Sol technical challenge PASS; D558 authorizes this phone-only/Insights-only build.
Current Insights calculations/versions/roles unchanged. Sol built the shared phone
menus/drawer removal: WALK12orders/15opened pictures/0errors on frozen853files,
19served assets; unit7779, browser553+49existing skips, reference728, Tracker445,
adapted6/perf4/rule/docs PASS; three intentional wire breaks RED then restored14PASS.
Evidence: `raptor-port/docs/handpass/2026-10-04-schedule-insights-menu.md`.
Fresh separate Astra final R1 PASS, complete immutable report beside evidence;
Owner preview look accepted D559,4Oct, Ready https://raptor-irwn04ala-kai-e2f5.vercel.app;
further interface requests continue in a new chat, details not yet specified.
Monday Claude plan/code/scenarios/full app walk remains before authorized live merge.


*Moved here 2026-10-07 by backlog-archive.mjs ([INSIGHTS-MISSION-MIX]). Forward facts: `raptor-port/docs/walk-ledger.md`.*

### [INSIGHTS-MISSION-MIX] Split each person's weekly sortie bar into blue and red (D512, 3 Oct 26)
**BUILT on `codex/insights-mission-mix`, not merged; qualified FULL checks complete, fresh independent Astra R2 PASS, Claude's later read owed:** "Red", "DS" and "Red Air" missions count red automatically (D518).
The revised plan is implemented: guarded context annotations, separate issued/working answers, immediate published
Insights, actor/history/Undo, silent templates/unchanged tabbing, default-Off Logic control and twelve/Show all.
Evidence and all33 qualified real-route results: `raptor-port/docs/handpass/2026-10-03-insights-mission-mix.md`.
Three adapted audit assertions also fail identically on the unchanged planning snapshot (AL-mark relocation/issued
key rewrite and Input Undo table landing); recorded limitations, no unrelated feature repair or false clean gate.
Fresh Astra R1 found the dirty-text/Choose ordering defect, now repaired with twelve failing-first connected editor
tests; repaired freeze4 functional walk and locked freeze5 affected walk passed, exact-freeze5 full unit7642/0,
affected Raptor browser197/0 and perf4/0. Fresh NEW Astra second inspection PASS, zero new concrete defects,804 hashes
matched. Full report: `raptor-port/docs/handpass/2026-10-03-insights-mission-mix-review-r2.md`; physical iPhone unverified.
Nonblocking D489 maintenance note: history and
Undo descriptions separately parse role-command human metadata; a shared description helper may prevent future drift.
No extraction or later CSS-split work is required for this acceptance or started in this batch.
**Opus 5.5 interim code read (D533) DONE 3 Oct 26 — REVISE (small), three findings to fix on the build branch before Claude's
review after the reset; none changes what is saved, signed or counted:** **F1** (regression, confirmed in the running app) — on
the Board's view of the latest published version, tracking On, a cue formation's Remarks box loses its "Changed at AL…" mark
(`src/ui/board.ts:298` drops `alAttr` with the read-only door's attributes); **F2** (plan departure, confirmed) — an open
Blue/Red question disappears after any other edit on the same day (`mission-roles.ts:96`, the day-revision test); **F3**
(wording, confirmed) — the History line for a role copied by a day template prints the row's internal code instead of the
formation (`changelines.ts:449–453`). Two low edges left unverified. A code read with three targeted runs only: the 33
scenarios, the phone-and-desktop walk and the gates were NOT run and stay owed. Report, repro scripts, two pictures:
`raptor-port/docs/handpass/2026-10-03-insights-mission-mix-opus-interim.md`, `raptor-port/docs/img/insights-opus-interim/`.
**F1–F3 FIXED the same day by Opus (D534), F2 as he ruled it (D535 — the open question stays through an unrelated edit):** each
with a failing-first test (`src/ui/mission-role-interim-fixes.test.tsx`), re-walked on the rebuilt app at desktop and phone
size, one full gate run green (unit 7,646/0, browser 520 passed/49 skipped, original 728/0, Tracker 445/0). Opus wrote them,
so Fable and Astra read them in the review after the reset; nothing here is owed to Codex now. Two low edges stay unverified
(a published day's "changes to go out" strip after a dirty-text Choose; the weekly editor's Templates button while a saved
plan is being looked at) — for that review to try.
**His find on the preview, fixed the same day (D536):** on his iPhone the Insights window's title bar and ✕ sat under the
address bar; the pop-up windows' height limit now follows the visible screen. Only his phone can prove it — his look. The
same sizing elsewhere is filed as `[VH-SHEETS-IPHONE]`.
**D532 — final look approved 3 Oct 26 ("ok approved"):** complete 18-picture phone/desktop/short gallery accepted,
including Choose/Change, Working/Published context labels, latest-published read-only Remarks and both Board entry places.
Implementation now authorized in the isolated new build chat under the unchanged revised plan. FULL checks, all33,
fresh Astra inspection and Claude's later code/scenario read before main remain required; no merge/main push/PR.
Other missions remain blue unless DS/RED in Remarks or a non-exact Mission name cues a Blue/Red role question; its answer covers
the whole formation (D517). No extra red indicator appears on schedule lines (D519).
D520 approves the after-edit question below formation AREA, Remarks visible, temporary space removed after either answer.
D521 adds a squadron-wide blue/red tracking on/off setting on Logic; D522 starts Off at first setup. D523 keeps ordinary
total bars for people with unanswered roles until those roles are chosen, without guessing or a burst of questions.
D524 approves the shown Logic switch look/label. D525 remembers until Mission/relevant support wording changes; D526
saves Remarks even unanswered, total bars until roles chosen; D527 offers a temporary correction action while editing
relevant Remarks. The complete chart/Board/incomplete-bar look and missing-role access pictures remain to confirm; no build here.
D528 early Opus5.5 plan review is complete; this narrowly superseded the wait-until-reset instruction, not the later
code review or main/merge limits.
One person who flies both has both coloured segments in their existing total bar. His supplied phone picture names the
target: Flying load · sorties this week. Continue this batch now while Claude's further review waits; no live merge.
**D513:** initial twelve flying people, with Show all. **D514:** DS for another formation is our red air, but DS wording
may describe external support for us instead. D518 uses those words as a cue to ask, never to infer the role.
D515: settle the firm plan and pictures in this chat, then build in a new chat. He asks to see a minimal Blue/Red choice
before deciding and is concerned about disrupting scheduling; D518 subsequently chooses only a conditional question.
D516 excludes SC/AVALON/BB
standby duties from flying load and includes SC main in work hours.
Preserve latest-issued-day counting (D478), cancellation/standalone exclusions, stable person identity and work hours.
Design/picture: `raptor-port/docs/superpowers/specs/2026-10-03-insights-mission-mix.md`; NEW authored revision and independent
read: `raptor-port/docs/superpowers/plans/2026-10-03-insights-mission-mix-build-plan-revised.md` / `2026-10-03-insights-revised-plan-review.md`.
Frozen original plan/reads remain unchanged. **Place:** Insights, item 3 of
`[FEATURE-WISHLIST]`, with `[INSIGHTS-BOARD-DOOR]`; product questions only after checking existing rulings. Claude's further
independent read after the reset remains owed before main.
**Opus 5.5 early plan review (D528) DONE 3 Oct 26 — REVISE, not PASS:** five blocking findings, eight improvements, three
owner choices, in `raptor-port/docs/superpowers/plans/2026-10-03-insights-opus-plan-review.md`. B1–B4 and I1–I8 reconciled in
the NEW Astra plan; B5's original fix withdrawn under D530/§7. Sol's independent final read is PASS for that technical
plan, not owner look/code approval. Astra's D529–D531 short/full meaning read is PASS. Complete responses/dispositions
are in the NEW revised-plan review record. Final picture look includes proposed latest-published read-only Remarks
access with Published/Working context text; original chart/Board/Logic placement remains. Code/scenario read still owed.
**His answers, "1-3 as recommended" (3 Oct 26) — they change the plan:** D529 the question is asked automatically only straight
after the scheduler's own edit (Remarks or Mission) leaves a formation needing an answer, otherwise a temporary "Choose mission
role" button while its Remarks box is edited — never on passing through; D530 a Blue/Red answer counts at once, published days
included, with no amendment and no effect on sign-offs (wording changes still wait) — it replaces "answers on an issued day wait
for the amendment" above and in D478/D523/D526; D531 a Mission box containing DS or RED that is not exactly DS / RED / RED AIR
asks, never guesses. The frozen plan predates all three and stays unchanged. NEW revision and independent read are done;
his complete final picture agreement is now D532. New build chat created isolated `codex/insights-mission-mix` from refreshed
planning baseline `5f9bf978`. At design approval source was untouched; implementation and checks now use that isolated branch.
All 18 final phone/desktop/short-phone design pictures inspected; independent
Astra design read PASS after corrections. Gallery `raptor-port/docs/img/insights-final-look/index.html`; complete evidence
and responses `raptor-port/docs/superpowers/plans/2026-10-03-insights-final-look.md`. D532 recorded before source work; D533 next.


*Moved here 2026-10-07 by backlog-archive.mjs ([STACK-MERGED-TIDY]). Forward facts: `raptor-port/docs/superpowers/specs/2026-10-07-start-context-audit.md`.*

### [STACK-MERGED-TIDY] The Codex stack is live (PR #481, 6 Oct 26) — its finished items still stand in the backlog and its branches' blocks in the handoff (filed 6 Oct 26)
Documents only. (1) The stack's own backlog items are built, checked and merged and still read as open — among them
`[DISCARD-MARKS-REMOVE]`, `[WORKSPAN-NEGATIVE]`, `[RALLY-TIME]`, `[RALLY-REVIEW-FIXES]`, `[INSIGHTS-MISSION-MIX]`, `[INSIGHTS-BOARD-DOOR]`,
`[CSS-SPLIT-BY-SCREEN]`, `[SCHEDULE-TAB-ROW-FLOW]`, `[SCHEDULE-INSIGHTS-MENU]`, `[SAVE-NOTE-COVERS]`, `[SONNET-WALKER-TRIAL]` (Trial 1 is decided —
the check's sheet §11): each leaves by `node raptor-port/scripts/backlog-archive.mjs <ID> --homes <file>` after EVERY deliverable it
ever named is walked — done, filed as its own item, or dropped by a ruling (the handoff guide, Step 3) — and the priority list's
sentences about them are brought up to date. (2) `HANDOFF.md` `## Now` still carries seven blocks of branches that merged with
PR #481 (named in the `claude/rest-blank-line` block): each is removed once its residue is confirmed filed. (3) The D496 banners
("until Monday 5 Oct 26, 19:00 …") at the head of `raptor-port/CLAUDE.md`, in `AGENTS.md` and in `raptor-port/docs/codex-review-workflow.md`
are expired — a working-guide change, so read by Astra and Sol before he approves it (D70). (4) Six files stand over their size markers
(6 Oct 26: `OUTSTANDING.md` by 409 lines, `HANDOFF.md` by 8, `.claude/rules/bug-check.md` by 2; the rulings of How we work by about 4,100
bytes, the scheduler's by 5,700, the Tracker's by 440) — put off while every branch carried code (D29); on a documents-only change the
document check FAILS on them, and this pass is where they are answered: move what does not belong, split an area, or raise a marker
with its reason (D141, D136) — never trim a ruling. **Place:** the first step of
`[START-CONTEXT-AUDIT]` — the same pass, since both are about what a new chat is made to read. **Ordered by him on 7 Oct 26
(D609) and carried out on `claude/docs-tidy-7-oct`: ALL FOUR PARTS DONE — (1) nineteen items archived, (2) the seven blocks
moved to `raptor-port/docs/archive/handoff-merged-blocks-2026-10-07.md`, (3) the banners moved out after Astra's and Sol's
reads (`raptor-port/docs/superpowers/specs/2026-10-07-expired-guide-text.md`), (4) the six markers answered — the
document check is green.**


*Moved here 2026-10-07 by backlog-archive.mjs ([PRIVATE-BRANCH-NEVER-PUSH]). Forward facts: `raptor-port/docs/superpowers/specs/2026-10-04-schedule-insights-menu/privacy-disposition.md`.*

### [PRIVATE-BRANCH-NEVER-PUSH] A branch on his PC holds his four phone photos — it must never be pushed (filed 7 Oct 26)
**DONE 7 Oct 26 — DELETED on his word (D613, "Delete the photos branch").** The branch is gone from his PC; it was never
on GitHub. The record: the privacy note named below. The text below is the item as filed.
`codex/private-insights-menu-materials` exists ONLY on his PC (checked 7 Oct 26: not on GitHub). Its one commit beyond
the shared history (9fcdc555) carries four screenshots from his iPhone of the app's preview (the demo week; the board's ⋯ menu, the phone menu with
"Pick a date…" and "Week insights" ringed in red — what he wanted moved) and the two mock-up pictures made from them,
for `[SCHEDULE-INSIGHTS-MENU]` (D557, D558 — built, live since 6 Oct 26 with PR #481, so the branch has no further use); publishing them was refused on 4 Oct 26 because the photos may show sensitive
information, and the repo is public for the present (D106). **Never push this branch, never `git push --all` or
`--mirror` from this PC, never merge it into a branch that is pushed.** The record: `raptor-port/docs/superpowers/specs/2026-10-04-schedule-insights-menu/privacy-disposition.md`.
Until 7 Oct 26 this caution stood only in the merged `codex/workflow-ui` block of `HANDOFF.md` — found when that block's
removal was prepared (`[START-CONTEXT-AUDIT]`, option 1). **His call (low):** keep the branch as it is, or have it
deleted from the PC once he no longer wants the photos kept in git (a deletion — only on his word). **Place (the
agent's line):** ask him with the start-of-chat options. **7 Oct 26: he said "Delete the photo branch", and a minute later
"So don't delete*" — a correction of his sentence about the SANS calendar work (D610), most likely not of this. The
deletion is HELD until he says which; the branch is untouched.**


*Moved here 2026-10-08 by backlog-archive.mjs ([INPUT-SAVE-SAYS-OK-WHEN-REFUSED]). Forward facts: `raptor-port/docs/feature-impact.md`, `raptor-port/docs/file-map.md`.*

### [INPUT-SAVE-SAYS-OK-WHEN-REFUSED] An input's Save says "added" / "updated" although the save was refused (found 7 Oct 26, not fixed)
**What it is.** Several of the input doors wrap one or more per-record saves in ONE outer save (so the whole is one
Undo step) and then report success from the INNER save's answer alone, never the outer one's. The inner save answers
"yes" before the outer command has been checked (the check on what a member's command really changed, the locked-week
backstop). If the outer command is then refused, everything is rolled back — and the screen still says "Input added" /
"Input updated" / "OIL decision updated" / "Input deleted", and the editor's window closes. Nothing is kept; nothing
says so.
**Where:** `raptor-port/src/ui/inputedit.tsx` — the editor's `doSave` (new and change) and `doMedSave`,
`commitEditMedChoices`, `commitEditUpchit`, `removeInput`; `raptor-port/src/ui/InputsPage.tsx` — the List's edit with
an OIL answer (`saveEdit`'s sheet) and `reviseOil`. Each calls `writeInputsBatch(…)` and drops what it returns.
**How it was seen.** A test of a member's save whose command the ownership check refused (the test's own fault — see
the trap in `HANDOFF.md`): the toast read "Input added", the list held nothing new.
**Why it is filed and not fixed now.** No real gesture reaches it today: every refusal the outer command can make is
also asked for at the door before the save. The group input (the plan
`raptor-port/docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md` §3.13) adds refusals that ARE reachable
— a forged filer, the members' switch turned off under an open window, the one-man-once check — and its own rule is
"his Save is refused with the sentence, the window stays". So it is fixed with that writer, piece (f): each door keeps
the outer save's answer (`ok && done`), says the refusal in a sentence, keeps its window open; a test that fails first
drives a refused save through each door.



*Moved here 2026-10-08 by backlog-archive.mjs ([LW-DEMO-COUNTERS-TRIM]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [LW-DEMO-COUNTERS-TRIM] The Leave War's Manning block comes with no count rows of its own, and a row's eye becomes a delete cross (D669 — 8 Oct 26)

**Ruled, not built.** Owner, 8 Oct 26: first *"In the demo data remove crew sets, IP+IWSO, OPSP, OPSW, FL P, WM P"* (D666, five rows to start — REPLACED the same
evening), then, asked what "the demo data" meant: *"should there be a default counter? I think there shouldn't be and the user can create what they want.
Instead of hide (eye) we should replace it with a delete cross."* (D669). **So:** the starting set of count rows is EMPTY (`raptor-port/src/leavewar/engine/seed.ts`,
the list `seedRequirements` builds — all eleven go: `sets`, `ip`, `iwso`, `instr`, `opsp`, `opsw`, `flp`, `wmp`, `sxo`, `scd`, `scn`), and in Rearrange a count
row's eye is replaced by a cross that deletes it (`ui/CountRows.tsx`; `state/store.ts deleteManningRule`). **D669's seven readings are in its full row and are
told to him — build to them, and where one proves wrong in the code, say so in the closing report rather than quietly choosing another:** no default for the
demo squadron either; the Archive bar and "bring back" go with the eye; the cross asks nothing if Undo brings the counter back (CHECK that it does); "Reset
counters" leaves ⚙ Settings; "under-manned" judges only counters that exist; the two Available rows carry no cross and no grip; nothing stored is converted (D56).
**Weigh before building — this is wider than it looks:** the eleven seeded rows are what MANY tests stand on (every count-row, verdict and "under-manned" test,
the Manning sheet and counter-form tests, `e2e/leavewar.spec.ts` — `grep -rlE "count-(sets|ip|iwso|instr|opsp|opsw|flp|wmp|sxo|scd|scn)\b" raptor-port/src raptor-port/e2e`).
The clean way is the one the app's own rule implies: the APP starts empty, and a test that needs counters MAKES them (one shared test helper that builds the old
eleven through the real "+ Counter" writer) — never a hidden default kept alive for the tests. SC D / SC N lean on the SC slots (`SC_SLOTS`, `SC_TEAM` in the
seed): they become counters a squadron can make like any other, so check the counter form can express them, and if it cannot, PARK that for him rather than
dropping the ability. Stale after the build and corrected in the same change (D201): the Manning sections of `docs/ui-contracts.md`, `docs/data-schema.md`
(the seeded `manningdefs`, `manninghidden`), the Leave War's "Settled before this list" lines on the Archive and "Reset counters"
(`.claude/rules/decisions/leave-war.md` — amended in brackets, never reworded), `docs/leavewar/known-gaps.md`. **Place:** in the overnight run of 8 Oct 26, AFTER
the typing and the picking of step 2 (those are drawn and approved; this has readings he has not yet seen) and before the counter form's mode for the Available
rows, which touches the same form. Tier: FULL in the job's one check (it changes what judges a day).


*Moved here 2026-10-08 by backlog-archive.mjs ([LW-COUNTERS-AMONG-FIXED]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/data-schema.md`, `raptor-port/docs/file-map.md`, `.claude/decisions-full/leave-war.md`.*

### [LW-COUNTERS-AMONG-FIXED] Rearrange: a counter row can go between, and below, the four fixed rows (D674 — 8 Oct 26) — OPEN, not started

**His words, with a phone picture of Rearrange (one counter, SC D, above the four blue-dot rows):** *"Can rearrange allow
newly created counter rows be allowed to moved to anywhere in between the fixed blue dot rows? Even to below the 4 as
well. When I try to drag and drop them"* — the ruling is D674 (`.claude/rules/decisions/leave-war.md`; its four readings
are in its full row). It narrows D665 (the four rows "at the foot of the Manning block").

**Where it stands:** NOT BUILT. Today the Manning block draws the squadron's counters (in their saved order,
`manningRowIds`) and THEN the four rows (`leavewar/ui/CountRows.tsx` with `FlyRows` as its children); the drag machine
accepts a drop only among the counters. **What the build has to settle (the builder's, to explain — none is his):** how
the four rows' places are saved within the one order (four fixed ids in the same list is the obvious shape — a list a
store written before it has without them must still read as "counters, then the four"); the drop lines between two fixed
rows and under the last; that the four keep their own order, carry no grip and no cross (D640, D669 reading 6), and are
still never hidden or judged; that the SANS calendar and Days read the four by id, wherever they sit; that the frozen
header mirror, the figures drawer's rows and the open-bidding outline stay in step when a counter sits among or under
them (the two faults he circled on 8 Oct were exactly this kind). It changes what is SAVED (the rows' order), so its tier
is FULL by the checking order's question 3 — it rides the calendar job's one full check (D485). Tests first; a browser
test at phone and desktop size that DRAGS a counter between two fixed rows and below the fourth.

**Read first:** `raptor-port/docs/ui-contracts.md` "The four rows at the foot of the Manning block" and "Leave War
Rearrange + the counter picker"; D640, D665, D669 in full.

**DONE — BUILT 8 Oct 26, tests first (the chat after the one that filed it; the heading above is as it was filed).** How each thing above was settled: the four
rows' places are four TOKENS in the same saved list (`@req-p`, `@req-w`, `@avail-p`, `@avail-w` — a letter no counter's
id can hold), read by ONE pure rule, `raptor-port/src/leavewar/engine/fixedrows.ts blockOrder`; a list without them
reads "its counters, then the four", and that is also what is still SAVED while no counter stands among or below them
(`orderToSave`); a counter made since appears just above Required P. The drag is the one row drag: in Rearrange each of
the four carries the same hit-test attribute a counter does, so it is a place to drop and shows the landing bar; none
has a grip, and the store refuses to move one. `CountRows` hands its rows to `FlyRows` in five runs. Found by the
browser test and fixed: the desktop typing strip for a Required figure lay over a counter placed under the four — it
sits under the whole block now. The contract: `raptor-port/docs/ui-contracts.md` "A counter may stand among the four";
what is stored: `raptor-port/docs/data-schema.md` (`manningorder`); the files: `raptor-port/docs/file-map.md`; what the
build added, to tell him: D674's full row. **Checked:** its own tests red first (16 + 22 + 16, and one more in
`ui/counts.test.tsx`); 25 rules broken one at a time; the browser test at phone and desktop size (a mouse; a real
finger); looked at in the running build (`raptor-port/scripts/handpass/lw-counters-among-look.mjs`); the whole gate
set. **OWED, with the calendar job's ONE full check (D485):** the roll-call row for the Manning block, the walk, and
Astra's and Sol 6.1's reads — it changed what is saved (the checking order's question 3).


*Moved here 2026-10-08 by backlog-archive.mjs ([LW-PHONE-HEADER-SPACE]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/handpass/2026-10-08-lw-phone-header.md`.*

### [LW-PHONE-HEADER-SPACE] The top of the Leave War on a phone uses too much height — three ideas drawn, his pick awaited (asked 8 Oct 26)

**His words, with a phone picture of the page, everything above the grid circled:** *"how can we optimise the space such
that we don't use so much vertical space? Give me mock ups for ideas to rearrange or minimise"*. Measured in the running
build at phone size: 230px from the app's bar to the grid's first row — the Period line, the "Viewing as" line, the Stage
line, the "Bidding on" / "Under-manned" line, the Legend line, then the grid's own buttons — leaving six names on screen.

**Where it stands:** NOTHING BUILT. Three ideas, each drawn into the running build by
`raptor-port/scripts/handpass/lw-phone-head-mock.mjs` (D634), are on a private page for him —
https://claude.ai/artifact/Q3RwbqjSpEgzt32V2v1VCw (its source and pictures: `C:/Users/User/.raptor-private/lw-phone-header-mock/`;
republish to the same address): **A** two lines — the period, "+", "Viewing as" / the stage (its two moves behind the stage
chip), the bidding dates, under-manned, Legend (95px saved, ten names; the agent's pick); **B** one line that opens
(121px saved, twelve names; Legend, under-manned and "Viewing as" out of sight until it is opened); **C** two lines, the
second one swiped sideways (95px saved, nothing renamed, the bidding dates and under-manned a swipe away).
**A ruling it touches, told to him on the page:** D365 (29 Sep 26 — on a phone the "Viewing as" chip takes a line of its
own, words kept); A and C keep the words and put the chip back on the Period line, which fits once the word "Period" goes.
**Not drawn:** a member's view (no "+ New", no stage moves — only shorter). **When he picks:** record the ruling first
(and D365's mark if the chip moves), then build it tests-first with a browser test at phone size that nothing overlaps
or leaves the screen at 390px and at 360px; a stage move behind a chip is a new control, so its tier is WALK.
**Place:** his to set — a small job of its own on the Leave War; it does not wait for the calendar job.

**HIS PICK, the same afternoon — D678: "A looks good, with this is there anything the desktop can follow too?"** A is
the design for the phone (the ruling's readings are in its full row; D365 is marked). His question on the desktop was
answered in that chat — the two lines can become ONE there, every word and button kept, about 50px saved — and a
picture of it was added to the same page; **HIS WORD, the same afternoon — D679: "keep the same for desktop" (asked
which he meant: "Leave desktop as today") — THE DESKTOP AND THE TABLET ARE NOT TOUCHED; the build is the phone only, and
its browser test also holds the desktop's two lines as they are.** The build is not started: tests
first, a browser test at 390px and 360px (nothing overlapping, nothing off the screen, the stage menu opening inside
the screen and closing on a press outside — the 4 Sep 26 rule), a member's view with no "+" and a stage button that
opens nothing, and a long callsign in "Viewing as" still ending in "…".

**BUILT, 8 Oct 26 (the evening), on `claude/inputs-sans-calendar` — not merged.** On a phone (430px and under) the top
is two lines; a desktop and a tablet measure byte for byte as before (D679). Tests first (`leavewar/ui/phonehead.test.tsx`,
`leavewar/ui/dates.test.ts`, five tests of `e2e/leavewar.spec.ts`); 31 + 12 rules broken one at a time, all caught; its
bug check, tier WALK, with the walk and its pictures: `raptor-port/docs/handpass/2026-10-08-lw-phone-header.md`. The
contract: `raptor-port/docs/ui-contracts.md` ("ON A PHONE THE TOP OF THE LEAVE WAR IS TWO LINES — D678"). The readings
the build added are in D678's full row (7 to 13). Measured: the grid starts 182px down (279 before at 390 wide) — eleven names on screen where six fitted, counted as
the drawing counted them. **Owed:
his look on his own iPhone** — whether "Legend" holds the second line in Apple's font cannot be measured on this PC —
and the branch's one FULL check (D485) reads this code with the rest. Found on the way and filed: `[LW-HEAD-BIG-PHONE]`.


*Moved here 2026-10-09 by backlog-archive.mjs ([CAL-SHARED-DATES]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/handpass/2026-10-08-inputs-sans-calendar-check.md`.*

### [CAL-SHARED-DATES] No door changes the dates of a shared input once it is saved (Astra's read, R3 — 8 Oct 26)
**Found, not built — a missing door, not a wrong line.** One input filed for several people, saved for 12–14 Oct, cannot be made 12–15 Oct: the List's row opens the window (never the row's edit in place — by design, `docs/ui-contracts.md` "One input filed for several people"); the window draws its date picker only for a NEW input (`ui/inputedit.tsx` — the picker is shown for `r._calendar` and the Unavailable add); a bar's drag moves the whole span and keeps its length. Today's ways round: drag it, or delete it and file it again. D655 has a shared input "shown and edited as one thing" — its dates are part of it. **To build:** show the range picker in the window for a saved shared entry its reader may change; save through `commitGroup` (one command, the OIL question asked of every man kept — `35b819e0` — and no medical kind); correct the hint that sends him "to the Inputs page" for the dates, where he already is. **RULED 9 Oct 26 — "2 agree" (D681): built before the calendar job's "merge live", in the input's own window, by whoever may change the input, for everyone in it at once.** As filed: medium. The sheet: `raptor-port/docs/handpass/2026-10-08-inputs-sans-calendar-check.md` §10 (R3).

**BUILT 9 Oct 26** (`cfcd40b7`, and the fixes after the two reads): the two-tap calendar in the window of a saved shared input, for its filer or an admin; walked 19 of 19, read by Astra and Sol 6.1, six findings fixed. What it does: `raptor-port/docs/ui-contracts.md` "One input filed for several people" (Its DATES are changed in its window); the evidence: the sheet's §12.


*Moved here 2026-10-09 by backlog-archive.mjs ([CAL-SANS-KEY-ONE-LINE]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [CAL-SANS-KEY-ONE-LINE] On a phone the SANS calendar’s "How this works" and its colour key share one line, as the Inputs calendar’s do (D697 — 9 Oct 26)
**Ruled, NOT BUILT — small, and wanted before the calendar job’s "merge live" (it is his look at that job).** His words: "Can u match the left sans calander tot he inputs calendar which uses the same amount of vertical space and similar vertical alignment. Compact words if need be". **Today** on a phone the SANS tab draws "How this works" on one line and the key ("Pilots · WSOs still needed: 1–2 3–4 5+", `sc-legend` in `raptor-port/src/ui/SansCal.tsx`, styles `raptor-port/src/ui/scheduler/24-sans-calendar.css`) on the next; the Inputs tab has both on one (`ib` fold line, `25-inputs-calendar.css`). **Build:** shorten the key’s visible words at phone width (keep the full sentence as its `aria-label` / `title`), put it on the fold’s line right-aligned exactly as the Inputs key is, and pin with a real-browser test that the fold line’s top and height, and the month’s top, are the same on the two tabs at 390 wide (and nothing runs off sideways at 360). Tier LOOK/WALK; then the full gate set.
**BUILT 9 Oct 26 (D697):** the SANS line is the Inputs line on a phone — 28 tall, the key at its right end reading "Still needed:"; pinned at 390, 360 and 320 wide. Its contract: `raptor-port/docs/ui-contracts.md` (the D697 bullet); the check: the sheet `raptor-port/docs/handpass/2026-10-08-inputs-sans-calendar-check.md` §21.


*Moved here 2026-10-09 by backlog-archive.mjs ([CAL-WINDOWS-PHONE-HEIGHT]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [CAL-WINDOWS-PHONE-HEIGHT] On a phone three of the calendar job’s windows stop at about three-quarters of the screen and scroll inside (found 9 Oct 26 — his question)
**Found, measured, NOT FIXED — put to him.** His words, with his iPhone’s picture of the SANS calendar settings window: "Why is this not full screen height" and "Can u check what else that opens a window that is not full screen on a phone". **Why:** every floating window is capped on a phone at 72% of the screen (`raptor-port/src/ui/scheduler/22-float-windows.css`, the phone rule on `.floatwin`) so the page behind stays in view and usable (D641) — the builder’s default, not a ruling of his. **Measured** (`raptor-port/scripts/handpass/cal-windows-phone.mjs`, 390 wide, 844 and 660 tall): CAPPED WITH MORE TO SHOW — SANS calendar settings (72%; at 660 its content is 146 taller than the window), Inputs calendar settings (72%; 112 taller), Add / Change a holiday (the same cap; 583 of content). ALREADY TALL — a day opened on the Inputs calendar (D683), New input / New commitment (to the top), the Calendar window (to under the top bar). SHORT BECAUSE ITS CONTENT IS — Every <weekday>. TWO-THIRDS BY HIS RULING — a day opened on the SANS calendar (D648: pulled up by its bar); whether it should open tall as the Inputs day does is still his to say. **Recommended to him:** D537’s rule for these windows too — a window is as tall as what is in it, up to nearly the whole screen; a short one stays short. One line of the stylesheet and its tests; LOOK tier; then the gate set. **Not measured here** (other areas, each ruled): the ALL AVAIL window (62%, D77), the changes window (a bottom panel that folds to a bar, D167, D339), the ordinary pop-up sheets (D537).
**BUILT 9 Oct 26 on his "Yes" (D706, and D707 for the SANS day):** a floating window is as tall as what is in it, up to the screen less 12 above and below; the SANS day opens tall. Contract: `raptor-port/docs/ui-contracts.md` (the D706 / D707 bullet); the check: the sheet `raptor-port/docs/handpass/2026-10-08-inputs-sans-calendar-check.md` §23.

