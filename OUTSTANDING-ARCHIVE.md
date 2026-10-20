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


*Moved here 2026-10-09 by backlog-archive.mjs ([CAL-NOTE-WITH-PUCKS]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [CAL-NOTE-WITH-PUCKS] A note in an opened day carries its own pucks; the separate "+ Pucks" button goes (his direction, D684 — 9 Oct 26)
**Ruled as a direction ("perhaps"), not built — a picture first.** His words, shown the day window with "+ Note" and "+ Pucks" in its bar (D683): "For the +note, perhaps just have a function to add pucks on the text written, instead of a +pucks button." **Today** a day’s planning sections are two kinds, each its own block and button (his asks of 22–24 Aug 26; `raptor-port/src/state/plan.ts` — a note is `{ id, iso, text }`, a pucks row `{ id, iso, kind: 'pucks', ids }`; drawn in `raptor-port/src/ui/InputsCal.tsx`, the month’s cell shows a note as words and a pucks row as small pucks). **The direction:** one kind — a note with words, people, or both; people are added on the note itself. **Before any build, put to him with the picture (one round):** may a note hold people and no words (so nothing a pucks row does today is lost); how the month’s cell shows a note with people; whether it is built before or after the calendar job’s "merge live". **What it touches:** what is saved for a note (`raptor-port/docs/data-schema.md`, `data-model.md` — so the check is FULL on the saved-data question), the people picker of the day, the three-across pucks grid and its swap / move / drag-off gestures, the drag that reorders sections, the month’s cell, Undo. The demo’s existing pucks rows need no carrying over (D56). **As filed:** medium; its own small job.

**THE PICTURE IS DRAWN AND WITH HIM (9 Oct 26 — his "Draw the note"):** `raptor-port/docs/mock/note-with-pucks.html` (also an Artifact, private: https://claude.ai/artifact/DrpirYQFv9kBTbhoxmAVQq), four pictures in `raptor-port/docs/mock/img/note-with-pucks/`, made from the built app by `raptor-port/scripts/handpass/mk-note-pucks.mjs` — today (a note, and a separate row of pucks), the direction (one "+ Note"; the note’s box holds its words, then its people, then "+ people"), a note with people and no words, and the month’s cell. **A drawing, not an approved design until he says so.** The three questions on it, each with the agent’s recommendation: (1) may a note hold people and no words — yes; (2) how a person is taken off a note — as today, dragged off or onto another to swap; (3) built before or after the calendar job’s "merge live" — after, as its own job. **Waiting on his answers.**

**HE ASKED FOR IT MORE COMPACT (D688, 9 Oct 26):** "Is there a way to make it more compact? Because there will be many inputs too I don’t want people to scroll massively down". The page is redrawn on a day that already holds four inputs, with two compact ways to choose from and how tall each makes a note; the test for any build is how many of the day’s inputs stay on a phone’s first screen.

**HIS ANSWERS, 9 Oct 26 ("1. If yes how would the user interface look like 2 yes 3 after then"):** question 2 — a person is taken off a note as today, dragged off or onto another to swap (**D689**); question 3 — built AFTER the calendar job’s "merge live", as its own small job (**D690**); question 1 (people and no words) — NOT answered: he asked to see it, and it is drawn. **THE PAGE AS REDRAWN (the same link):** a small phone (390 × 667), a day that already holds four inputs, the built app’s own parts — today (the note and its row of pucks are 146px tall), COMPACT (the words on one slim line, the people four across under them, "+" as the last of them: 86px), FOLDED (one line: the words and "5 people", a tap unfolds them: 46px), and compact with people and no words (no words line at all: 50px). The first, roomy drawing (170px — it pushed the fourth input off the first screen) is dropped. **Waiting on him:** compact or folded; and question 1.

**THE DESIGN HE CHOSE (D692, 9 Oct 26 — "A looks good but can u make the text box even shorter in height"):** drawing A — COMPACT: the note’s words on one line no taller than the box a note is typed in (28px drawn, the pencil and the cross small beside it), its people four across straight under, a dashed "+" as the last of them; 77px before the first input on a small phone, against today’s 146. B (folded) is not taken. `raptor-port/docs/mock/img/note-with-pucks/c-compact.png` is the picture of record once he has answered the one question left: **may a note hold people and no words** (`e-people-only.png` — drawn for him, not yet answered). Build after the calendar job’s merge (D690).

**AND EVEN ROOM EITHER SIDE (D694, 9 Oct 26):** the six dots and the box’s left edge moved a little left, the box’s sides padded alike, each puck held inside its quarter — in the drawing the first puck stands 9px from the left border and the fourth 8.5px from the right, a puck 74px wide. `c-compact.png` is redrawn so.

**EVERY QUESTION IS ANSWERED (D695, 9 Oct 26 — "Yes"):** a note may hold people and no words — drawn with no line of words at all (`e-people-only.png`). **THE DESIGN OF RECORD for the build:** `raptor-port/docs/mock/note-with-pucks.html` — `c-compact.png` and `e-people-only.png` (D684, D688, D689, D692, D694, D695). **Ready to be built as its own job after the calendar job’s merge (D690).**
**BUILT 9 Oct 26 (D684, D688, D689, D692, D694, D695; started before the calendar job's merge on its own branch — D708, D690 kept): `claude/day-window-compact`, not merged.** One kind of note; "+ Pucks" gone. Contract: `raptor-port/docs/ui-contracts.md` (the D684 bullet and the three after it); saved data: `raptor-port/docs/data-schema.md`; the check, FULL, both reads: `raptor-port/docs/handpass/2026-10-09-day-window-compact-check.md`.


*Moved here 2026-10-09 by backlog-archive.mjs ([CAL-DAY-LINES-COMPACT]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [CAL-DAY-LINES-COMPACT] Each input in an opened day takes less height (his direction, D696 — 9 Oct 26)
**Ruled as a direction, not built — a drawing first.** His words, with a picture of the day opened: "Is there a way to use less vertical space per input? Or u can compact some words for inputs." **Today** (`raptor-port/src/ui/InputsCal.tsx`, the opened day’s list; the SANS day is laid out the same way, `ui/SansDay.tsx`) a card is up to three lines: who, the kind and when; the remark; "Placed by … · date, time" (D629). **To put to him, with pictures on a small phone and a day of eight or more inputs:** (a) the remark on the first line after the kind where it fits, cut with "…" where it does not; (b) the placed-by line shortened and moved to the end of a line ("Grit · 12 Jul") instead of a line of its own — or shown only where someone ELSE placed it, or it is late — his choice, since D629 has every input show who placed it and when; (c) less padding in a card. Count the inputs whole on the first screen for each. Ask too: the SANS day alike? **Place:** his to say; the agent recommends after the calendar job’s merge, with the note job. **As filed:** small-medium; look and layout only.
**HIS OWN IDEA (D699, 9 Oct 26), the one to draw first:** "put the placed by sentence to the 2nd row if the remarks is short. If the remarks is too long then move the placed by down to a 3rd row but still the same horizontal alignment" — and "Can give me a mock up". Read as: "Placed by …" at the right end of the remark’s row where both fit; under it, still at the right end, where they do not. The mock-up: `raptor-port/docs/mock/day-inputs-compact.html` (a drawing; nothing built).
**HE CHOSE (D701, 9 Oct 26 — "B and sans day should follow"):** drawing B of the mock-up — `c-shorter-words.png`: his D699 layout, the small print as "Grit · 12 Jul, 14:42", a little less padding (a card with a short remark 51 tall where it is 79 today; 7 of 9 inputs whole on a small phone where 5 are) — and the SANS day’s commitments laid out the same way (`ui/SansDay.tsx`). **THE DESIGN OF RECORD; ready to build.** Only WHEN is open — recommended after the calendar job’s merge, with `[CAL-NOTE-WITH-PUCKS]`.
**BUILT 9 Oct 26 (D696, D699, D701): drawing B on the Inputs day and the SANS day, on `claude/day-window-compact`, not merged.** Contract: `raptor-port/docs/ui-contracts.md` (the D701 bullet); the check: `raptor-port/docs/handpass/2026-10-09-day-window-compact-check.md`.


*Moved here 2026-10-10 by backlog-archive.mjs ([HIST-JUMP-EMPTY-SEAT]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/feature-impact.md`, `raptor-port/docs/handpass/2026-10-10-hist-jump-empty-seat.md`.*

### [HIST-JUMP-EMPTY-SEAT] A change whose seat is empty now: Edit Schedule said "shown on the scheduler board", the board said "shown on the week" — HIS FIND, 10 Oct 26; BUILT AND CHECKED 10 Oct 26 — waiting for his look
**LIVE 10 Oct 26 — pull request #489 merged into `main` on his "merge live". Everything below is as it stood before that, unchanged.**
**BUILT AND CHECKED, 10 Oct 26 (D733) — NOT MERGED ("No merge", his word).** On `claude/hist-jump-empty-seat`, cut from `main`; a failing test first (sixteen cases failed exactly as he described). In the changes window a tap on a change whose seat is empty now lands on its ROW — the row's "+ add" box on Edit Schedule and the Scheduler Board, the people of the row on View-only Sched, the row's name where a page draws no people on it — ringed like any other landing, with one sentence, "That seat is empty now". A seat a page draws empty (a flying seat, a sim's seats on the board) is landed on itself and nothing is said. "Shown on the week" / "shown on the scheduler board" are said only of a box the other page alone draws; a row deleted since keeps "no longer on this day". **His one question, asked first (D733 — "Keep it"):** a place another man has since taken — the tap lands there, whoever stands there now, and says nothing. As built, line by line: `raptor-port/docs/ui-contracts.md` ("A CHANGE WHOSE SEAT IS EMPTY NOW LANDS ON ITS ROW"). **Its check — tier WALK:** `raptor-port/docs/handpass/2026-10-10-hist-jump-empty-seat.md`. The host walked 63 steps by script (a desktop at his PC's 125%, a phone by touch, a member, a published day, OIL Earn), 47 pictures; Astra designed the scenarios the first walk had missed and they were walked as its second part; thirteen break tests, all red. **Found on the way and fixed, each red first:** a published day's "To go out" line landing on ANOTHER man of the desk with his History open (Astra); the board, looking at an older version, saying a seat was empty while it still showed the man (Astra); in OIL Earn a man in plain sight called "not shown on this page" (Astra, reproduced by the walk). **For him:** the sheet's §11 (four steps on his phone) and its §0 — six readings to say yes or no to. **Filed, not fixed:** `[HIST-JUMP-SEEN]`. **The checking guide's line for his find (its §11):** the roll-call of any change to "tap a change to go to it" is written into `ui-contracts.md` and is the `KINDS` loop of `raptor-port/src/ui/histjump.test.tsx`. **THIS ITEM IS ALSO ON `claude/day-window-compact` (pull request #488), as it was filed there — whichever of the two branches merges second keeps THIS text and drops that one (the document check fails on a doubled item).** *(The item as it was filed, kept as written:)*
**Status: FOUND BY HIM on his iPhone (10 Oct 26, the preview of `claude/day-window-compact`); the cause read from the code, not yet reproduced by a test; nothing built. Older than this branch — the same code is on `main`.** His words: *"If that change is no longer to be found, for eg the area I clicked on the first picture. It says the detail is shown on the scheduler board. But when I go to the schedule board and click the same thing it says the detail is shown on the week, not on the board."* **What he did:** Edit Schedule, Monday, the changes window (History on) → "All changes" → a line of the Common Programme, "Ranger moved in from FLIGHT SAFETY STAND-DOWN" — after Ranger and Warden had been moved on again, so FLIGHT SAFETY STAND-DOWN and SODB stood empty ("+ ADD"). The week answered "That detail is shown on the scheduler board — open the day there to see it"; on the Scheduler Board the same tap answered "That detail is shown on the week, not on the board". Each page sends him to the other; neither shows anything.
**The cause (`raptor-port/src/ui/interactions.ts` `jumpToChange`).** A "moved in / moved out" line carries ONE address: the seat on its row (`a:<day>.<row>.<n>` — `ChangesWindow.tsx` `jumpOf`). A row that lists its people (a Common Programme row, a ground row, a duty row's extra people, a sim's passengers) draws a seat only while someone is IN it (`ui/html.ts` the programme's `lSeat`, `ui/board-html.ts` the `.seat` span) — an emptied seat is drawn on neither page. The jump then asks only "does the ROW still stand?" (`posKey`): it does, so it concludes the detail must be on the other surface, and says so — a sentence written for the few boxes that truly are on one page only (the area strip, the in-times). Both sentences are untrue here.
**To build (the agent's call on the how; a failing test first — `src/ui/histlist.test.tsx` / `dpfixes.test.tsx` hold the jump's cases, one real-finger case in `e2e/`):** (1) when the seat a change names is not drawn but its row stands, LAND ON THE ROW — its people box (`[data-fill="<row>.+"]`, drawn by both pages) and, failing that, the row's name box — scrolled into view with the same brief mark, and one short sentence saying the seat is empty now (wording to settle with the build; D726 — few words); (2) "shown on the scheduler board" / "shown on the week" are said only where that is TRUE — decided from the kind of box, never from "not found here"; (3) the roll-call is every kind of seat a change line can name, on BOTH pages and on a phone: a flying seat (drawn empty — should already work), a duty row's seats and extras, a sim's seats and passengers, a ground row, a Common Programme row, an input's row; emptied, refilled by someone else, and the row deleted ("no longer on this day" — today's words, kept). **One question that is his, to ask before building:** when the seat has since been taken by ANOTHER man, the tap lands on that man's puck today — keep that, or say whose change it was? (Recommended: keep it; the line itself names who moved.)
**Its check:** WALK — the tap is an existing door whose landing changes on two pages; a short host walk at phone and desktop size on Edit Schedule and the Scheduler Board; no OIL, no published record, nothing saved. **Because he found it (the checking guide's §11 — a find of his costs the method a line):** the roll-call of any change to "tap a change to go to it" gains the row "the place the change names is EMPTY now", walked on both pages. **Place:** his — recommended: the next small job, in a fresh chat, on its own branch cut from `main` (it does not depend on pull request #488 and need not wait for it).


*Moved here 2026-10-10 by backlog-archive.mjs ([INPUT-ALL-AVAIL]). Forward facts: `raptor-port/docs/engine-rules.md`, `raptor-port/docs/ui-contracts.md`.*

### [INPUT-ALL-AVAIL] An input filed for "ALL" or "ALL AVAIL" — duties and other commitments only (his direction, D700 — 9 Oct 26)
**Ruled as a direction, NOT DESIGNED, NOT BUILT.** His words: "Can the inputs have an all avail and all selection too? Only allowed for duty and other commitments". **What exists:** on the schedule the two placeholder pucks may stand on an accepted request’s row and earn OIL by default (D46, D43); who stands behind one is worked out on the day and frozen at publication (D44, D45); the count and the ALL AVAIL window (D37–D41). Filing for several people is one shared input (D654–D660), the picker has headings (D656, D659), a member may file for others only duties and commitments (D655). **To put to him before any design (at most four, each with a recommendation):** (1) is the input the PLACEHOLDER itself — one input reading "ALL AVAIL", who is behind it worked out on the day as on the schedule (recommended: it stays right when leave is filed later) — or the names of whoever is available at the moment of filing, copied in; (2) who may choose it — admins only (recommended to start), or members too; (3) does it show in every man’s own inputs and on his bell, or only on the day and the schedule (recommended: the day and the schedule — it is not his own filing); (4) its OIL answer on a weekend or holiday — the filer answers once for everyone, as D660 (recommended). **Place:** its own job after the calendar job’s merge (the agent’s recommendation). **As filed:** medium; touches the picker, the shared input, the schedule’s request row and OIL — FULL tier when built.
**HIS FOUR ANSWERS (D702, 9 Oct 26):** (1) LIVE — it stands for whoever is free, starting with whoever is free at filing and changing by itself as availability changes (read as: one input carrying the placeholder; frozen at publication like everything on a published day — D44, D45); (2) MEMBERS may choose it too; (3) it shows on the DAY and the SCHEDULE only; (4) OIL — the filer answers once for everyone, as a shared input (D660). **Designable now; still its own job after the calendar job’s merge unless he says otherwise.**
**PLANNED AND READ, NOT BUILT (the night of 9 Oct 26, D708):** the plan `raptor-port/docs/superpowers/plans/2026-10-09-input-all-avail-plan.md` was read by Astra and by Sol, each blind — BOTH said NOT CLEAN, so nothing was built. Their corrections are its §9 (the OIL switches must share the credit’s default; the save checks missed the List’s own Add form and the shared save; reassign must refuse both directions; an all-day "Fly with" would count the placeholder as one absent man; the "Everyone" filter value collides with ALL in three places). **FOUR CHOICES ARE HIS, its §7:** may each man behind it change his own OIL answer (as in a shared input) or is it the filer’s answer and the scheduler’s switches (recommended); OD and CSE (recommended no); several days in one filing (recommended one day); an unanswered OIL question goes to the filer’s bell (recommended yes). **Next:** his four answers → the plan rewritten from §3 and §9 → both read it again → build, FULL check.
**HIS ANSWERS (D711, D712 — 9 Oct 26: "As recommended … Remove the option … fly with and personal"):** the filer answers OIL once and the scheduler switches any one man (no own answer for a man behind it); no OD, no CSE, no Fly with, no Personal — the kinds are Training, Meeting, Appointment, Duty, Other; one day at a time; an unanswered OIL question goes to the filer’s bell only. **EVERY CHOICE IS MADE. Next, in a fresh chat on `claude/day-window-compact`:** rewrite the plan from its §3 and §9 with these, both read it again, build, FULL check.
**THE PLAN REWRITTEN AND READ AGAIN (9 Oct 26): Astra and Sol, each blind — BOTH "CLEAN WITH THESE EXACT CHANGES"** (the List’s pencil editor; the OIL re-ask rule stated exactly; restore tests — the plan’s §11). **BEING BUILT, with `[INPUT-EVENT-KIND]`, as one batch with one FULL check (D485); not merged.** Where it stands and what is left: `HANDOFF.md`, this branch’s block.


*Moved here 2026-10-10 by backlog-archive.mjs ([INPUT-EVENT-KIND]). Forward facts: `raptor-port/docs/engine-rules.md`, `raptor-port/docs/walk-ledger.md`.*

### [INPUT-EVENT-KIND] A new input kind, "Event" — sports, a night out, games — for ALL AVAIL, ALL or several people (his question, 9 Oct 26)
**An idea he asked about, NOT RULED, NOT DESIGNED.** His words: "should I add a new input called event. So like members can add all avail, all, multiple members to attend an event like for eg sports, night out with, games etc". (His earlier ask for "an input called Meeting" is withdrawn — "My bad I didn’t see meeting"; Meeting exists.) **The agent’s advice, given to him:** yes, as its own kind — a social event filed as Meeting / Duty / Other would ask about OIL on a weekend and count as work, and Personal is one man’s and is not offered ALL AVAIL (D712). **Four questions put to him, each with a recommendation:** (1) OIL on a weekend or holiday — recommended never asked, never earned; (2) work hours, crew rest and clashes — recommended it counts as neither, and a clash with flying or a duty is an amber note, never red; (3) where it shows — recommended the Inputs calendar and its day in a colour of its own, and the schedule’s programme as an information row; (4) who is on it — recommended the filer picks ALL AVAIL, ALL or several (members too), with "count me in / out" by each man as a later step. **Depends on `[INPUT-ALL-AVAIL]`; build after it.** Touches the list of kinds and its rules (`raptor-port/src/engine/inputs.ts`), OIL, the validator, the legend and the Logic page’s type table — FULL tier.
**RULED (D713, 9 Oct 26):** add it, as a commitment like the others — it asks OIL ("its work, it can be an official event too"), it clashes "like a ground programme", it shows on the Inputs calendar and lands on the schedule unless an admin takes it off; ALL AVAIL, ALL or several people. So: one more kind in the list with the standard rules (as Training / Appointment / Duty), offered for ALL / ALL AVAIL. "Count me in / out" is not asked for. **Build with or straight after `[INPUT-ALL-AVAIL]`.**
**CONFIRMED (D714, 9 Oct 26):** a red clash like Training / Appointment / Duty, not Meeting’s amber; no "count me in / out". Every choice is made.
**BEING BUILT WITH `[INPUT-ALL-AVAIL]` (9 Oct 26, on `claude/day-window-compact`):** one row of the kinds table with Duty’s flags (`raptor-port/src/engine/inputs.ts`, `eventkind.test.ts`); the plan’s §4 (`raptor-port/docs/superpowers/plans/2026-10-09-input-all-avail-plan.md`). **A reading to tell him:** the word EVENT typed as a ground row’s name now clashes red across an SC MAIN shift, as TRAINING, DUTY, PERSONAL, APPOINTMENT and OTHER already do. Where it stands: `HANDOFF.md`, this branch’s block.


*Moved here 2026-10-10 by backlog-archive.mjs ([INPUT-OWN-TITLE]). Forward facts: `raptor-port/docs/engine-rules.md`, `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/data-schema.md`.*

### [INPUT-OWN-TITLE] An input carries a name of its own — the kind fills in a title the person may change (his direction, D715; his four answers, D716 — 9 Oct 26)
**BUILT, WALKED, READ BY BOTH AND GATED on `claude/day-window-compact` (9 Oct 26) — READY FOR HIS LOOK; NOT MERGED.** The check, FULL: `raptor-port/docs/handpass/2026-10-09-input-title-check.md` (its §8 is his five-step look; its §0 the six readings to tell him). Fifteen faults found and fixed — eight by the walk, seven by Astra's and Sol's reads of the code; older finds filed as `[TITLE-CHECK-SEEN]`. What it does: `raptor-port/docs/engine-rules.md` §An input's own title; the screens: `raptor-port/docs/ui-contracts.md` (search "An input's own title"). **As it went — his four answers, "As recommended" (D716, 9 Oct 26): every one of the four questions below is settled as recommended. THE PICTURE WAS DRAWN FOR HIS YES (9 Oct 26): `raptor-port/docs/mock/input-own-title.html` (pictures `raptor-port/docs/mock/img/input-own-title/`, made from the built app by `raptor-port/scripts/handpass/mk-input-title.mjs`; the Artifact he opens: https://claude.ai/artifact/N7j4uaDBP5cJspLctFCksx). THEN: the plan, read by Astra and Sol; then the build.** **What the drawing showed, told to him:** on a phone the opened day's card has no room for the kind beside the title — with "Sports day · Event", the LATE mark and the hours on one line the title was cut to "Sports …" — so the drawing shows the title alone there (D716's "the kind small beside it where there is room"); a desktop has the room. **His question on the drawing (9 Oct 26): "After the title is changed, how does one know what type of event was selected for that input?" — answered with two more pictures on the same page, ANSWERED — "Kind kept in sight. Yes build" (D717): the drawing is approved with the kind kept in sight, and the build is authorised in this chat, no merge. The plan: `raptor-port/docs/superpowers/plans/2026-10-09-input-own-title-plan.md`. As put to him:** the kind kept in sight, small, wherever the title differs from the kind's own name — under the title on the schedule's row (a phone's row is no taller: measured 57 points both ways) and at the left of the small-print line on the opened day's card (no new line) — recommended; or the title alone. The window's Type box and the Inputs list show the kind either way; the month's bar has no room for it. **For the plan, a technical point, the agent's to settle:** the schedule's row for an input takes its NAME from the kind today, and a typed name on a ground row can switch a rule on (`raptor-port/docs/remarks-vocabulary.md`) — the row of an input with a title must go on being judged by its KIND, never by the words of its title. **As first filed (D715) — a direction, then undesigned.** His words, looking at the new Event row on his phone: "I want to be able to edit the type of input name from the inputs page … select the type of input and it gives the user the option to change the name of the input. Not only to event input, most of the inputs title. So for e.g if event Is selected, event shows as the title which can be edited and remarks show event till \"date\" any suggestions?" **What exists:** an input's name everywhere is its KIND ("Event", "Duty"); only "Other" reads by its remarks instead (`raptor-port/src/engine/inputs.ts inpLabel`), and a scheduler can retype the name of the landed row on the schedule itself. **The agent's suggestion, given to him:** a "Title" box in the input's window and the List's form, filled with the kind's name when a kind is chosen and free to overtype ("Sports day"); the title is what the schedule's row, the month's bar and the day's card show as the name; the kind stays beside it, small, and keeps deciding every rule (OIL, clashes, crew rest). **Four questions put to him, each with a recommendation:** (1) which kinds — recommended the "Duty & other commitments" kinds, never leave or medical (their names are official codes the Leave War and the medical list read); (2) where the title shows — recommended wherever the kind's name stands as a NAME today, with the kind still shown small where there is room ("Sports day · Event"); (3) "Other" — recommended it takes the same Title box and its remarks go back to being remarks; (4) the remarks — recommended left as they are (only "till <date>" for several days), since the title already carries the name and "Event till 12 Jul" would print it twice on the schedule's row. **Then:** a picture first (a visual change — D541), a short plan read by Astra and Sol (saved data: a new field on an input), built tests first with its own check. **As filed:** small to medium; touches what an input stores, the editor, the List's form, the month, the day card, the schedule's request row and the changes window — FULL tier (saved data).


*Moved here 2026-10-10 by backlog-archive.mjs ([INPUT-LIST-AS-DAY-CARD]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [INPUT-LIST-AS-DAY-CARD] The Inputs list's card takes the opened day's layout; its pencil and cross go; ONE look for an input's kind everywhere (his direction, D718 — 9 Oct 26)
**BUILT, WALKED AND GATED on `claude/day-window-compact` (10 Oct 26) — READY FOR HIS LOOK; NOT MERGED.** The check, FULL: `raptor-port/docs/handpass/2026-10-10-input-card-check.md` (its §0: three questions for him and seven readings; its §8: his look). The plan: `raptor-port/docs/superpowers/plans/2026-10-10-input-card-plan.md`. What it does: `raptor-port/docs/ui-contracts.md` ("THE INPUT CARD", "THE INPUTS LIST HAS NO EDIT IN PLACE"). **D724 (10 Oct 26, said as the build began): a card for several people always says who filed it.** Beyond the pictures, so that nothing the pencil, the cross and the paperclip did was lost: the input's window changes a one-person input's dates, says an OIL question nobody answered (and who, in a shared input), opens a document, offers posted-out people to an admin, and keeps its buttons in sight. **As approved — "This Looks good we should build in another chat" (D723, 10 Oct 26).** WHAT WAS TO BE BUILT, in one place: the card of `raptor-port/docs/mock/img/input-card-final/day-final.png` and `list-final.png` (working mock-up: `raptor-port/docs/mock/input-card-a.html` — card "A", Kind "Grey", By "Others only", "All names"; its card's markup and styles are in `raptor-port/scripts/handpass/mk-final-card.mjs`, a drawing, not code to copy blind) — (a) top line: the colour square, who, the KIND in small grey capitals, LATE, the hours; (b) the TITLE at the left on its own row (D722), a remark after it in grey, both wrapping, nothing cut by what stands at its right (D719); a card with neither is ONE line; (c) a shared input: EVERY name, wrapping round the hours, never "+N", no row of pucks on the card (D721); (d) the small print "By Saber" ONLY where someone other than the input's own person placed it — no "for Ranger", no day or time on the card (D720, D723) — **and ALWAYS on an input for several people, even where the filer is one of them (D724, 10 Oct 26: "Seems like multiple inputs it’s better to put who made that input yeah")**; (e) the Inputs list on a phone uses THE SAME card under a slim heading a day ("SAT 18 JUL · 6 inputs"), no pencil, no cross, a tap opens the input's window (D718); the desktop list keeps its columns and sorting and loses its pencil and cross. NOT in the job unless he says: the SANS day's card (pucks with the CAT — D647, D649). Mind: removing the list's edit-in-place takes out an editor many tests drive (`raptor-port/src/ui/inputs.test.tsx` and the title's own `ui/inputtitle.test.tsx` pencil cases) — restate them for the window, never delete the claim; `[TITLE-CHECK-SEEN]` items 6 and 7 go with it; the day card's kind label built for the title (`.sd-kindtag`, on the small-print line) moves to the top line. **As it went — a direction; a mock-up was put to him first.** His words, shown the list's card beside the opened day's card on his phone: "Seems like the agreed layout can be used for the input list view too. And seems like the edit and cross is not needed because just like how it's working now u can click on it to edit it or delete it. And also could u show me a mock up like for e.g the \"event\" tag is with the pill design. How would it look like. I want to standardise how they look actually". **What exists:** the opened day's card (`raptor-port/src/ui/InputsCal.tsx`) — a colour square, the person, the input's name, LATE, the hours, then one small-print line (the kind where the name is a title, the remark, who placed it); a tap opens the input's window. The Inputs list (`raptor-port/src/ui/InputsPage.tsx`) — a table on a desktop, cards on a phone, the kind as a rounded pill, a pencil that edits the row in place and a cross that deletes it. **The mock-up:** `raptor-port/docs/mock/input-list-as-day-card.html` (made from the built app by `raptor-port/scripts/handpass/mk-list-as-day.mjs`). **Then, shown that page, what the card must do (D719, 9 Oct 26): "I'm trying to keep the input vertically shorter … allow remarks that maybe potentially long as well as title that maybe potentially long text be able to not look like it's being blocked by the item on the right and allowed to grow vertically. Can u give me ideas"** — stay short; a long title or remark wraps and the card grows, never cut by what stands at its right. **The second, proper mock-up — three ideas drawn as working cards he can switch between (the kind as small grey capitals or as a pill; the day or the list): `raptor-port/docs/mock/input-card-ideas.html`.** Recommended to him: the idea with one line of facts (who, kind, LATE, hours) and the words below at the card's full width. **And the small print (D720, 9 Oct 26): "Just put By Saber. Since the ranger is already at the title. We can save space there"** — on a card that names its person the small print says "By Saber", never "for Ranger" (today: `raptor-port/src/ui/InputsCal.tsx` `placedShort` / `placedLineOf`, the SANS day's card, the List's "Placed by …" line); whether the day and time stay after the name is on the mock-up for him. Built with this job. **Then his question, "Or do we even need a 'by'" — answered on the same page as a switch (with the day and time / the name only / only where someone ELSE placed it / none), PUT TO HIM, not answered:** recommended "only where someone else placed it" — a man's own input says nothing, the card already begins with his name; who placed it and when stays in the input's window and the change history for every input (D629's "every input shows who placed it" would be narrowed by his yes). Measured on the page's six cards at a phone's width: today 405 points with two of four titles cut; the recommended card with that small print 387 and nothing cut. The page: https://claude.ai/artifact/X7NQjqtRc93qrptmLwgaEA **Then, at his word "Give me a more comprehensive example of A": `raptor-port/docs/mock/input-card-a.html`** (https://claude.ai/artifact/Sqzw1LKGPwuJcuESvGWs7H) — idea A drawn live as a whole busy day of sixteen inputs of every kind in the day's own window, the same cards on the list, and each state of the card one by one (plain, placed by another, titled, long title, long remark, an absence, a shared input with its pucks, LATE tapped, just opened), with a switch to today's card. Measured at a phone's width, sixteen inputs: A with "others only" 888 points and no title cut; today 974 and two cut. WITH HIM; not chosen. **Then he showed a reference (another unit's app: one line an input, "[Name] - 0900-1300 Title [LATE]", several people as "[Torch, Bash]") and asked which is better, and whether several people should be text or pucks — a question, answered, not a ruling.** The agent's answer: keep A; borrow the reference's names-as-text for several people on this card (three names, then "+N"; the pucks stay in the input's window, and on the SANS day, where the CAT matters — D647, D649). Added to the same page as two switches: "A · one line" (the title on the top line when it fits) and "Several people as: Names / Pucks". Measured at a phone's width, sixteen inputs: today 936 points; A with names 851; A one line 930 — the one-line card is not shorter on a busy day, because a remark then needs a line of its own. **Then his direction on the names (D721, 10 Oct 26): "Can u show me a mock up if this grows vertically … Instead of doing a +1 hiding the info … Like wrap text"** — a shared input's people are ALL named on its card, the names wrapping and the card growing downward, never "+N". Drawn on the same page: a section "A shared input, as it grows" — the same meeting for 2, 4, 8 and 14 people, three ways side by side (three names then +N; all names; pucks), each card's height measured. On card A at a phone's width: all names 52 · 75 · 75 · 98 points; pucks 69 · 88 · 107 · 145; "+N" 51 for any number. The page now opens on "All names". **And the title's place (D722, 10 Oct 26): "Why don't flight safety brief, the title always start on the left as a new row"** — the title always begins a row of its own at the left: card A; the "one line" variant is set aside. The page now opens on A. **Then, asked "which is the final design u would prefer and give me screenshot of your choice for the list and calander" (10 Oct 26) — the agent's pick, pictured in the real app and sent to him; NOT his choice yet:** card A (the title at the left on a row of its own — D722; every name of a shared input, wrapping — D721); the kind in SMALL GREY CAPITALS after the name, not a pill (LATE stays the only tag on the line, so a late input stands out; the same word under the title on the schedule's row); the small print "By Saber" ONLY where someone other than the input's own person placed it (D720's wording; the date and time stay in the input's window and the change history); and on the list THE SAME CARD under a slim heading a day ("Sat 18 Jul · 6 inputs") instead of a date on every card, no pencil, no cross, a tap opens the input. Pictures: `raptor-port/docs/mock/img/input-card-final/day-final.png`, `list-final.png` (made by `raptor-port/scripts/handpass/mk-final-card.mjs` — the built app's own records and window, the card's styles injected). The day heading on the list is NEW with this pick and his to confirm; it applies to the phone's list sorted by date — the desktop list keeps its columns and sorting. **Put to him on it:** the kind's one look — the pill, or the small grey capitals; whether the desktop table loses its pencil and cross as well (recommended: yes — one way to edit everywhere). **As filed:** small to medium; it REMOVES the list's edit-in-place (many tests of the list drive it), so it is more than a look — a WALK-tier job with its own check, after `[INPUT-OWN-TITLE]`'s closes, on `claude/day-window-compact`.


*Moved here 2026-10-10 by backlog-archive.mjs ([INPUTS-VET]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [INPUTS-VET] The design vet of the Inputs calendar and list: fewer words, one way to add an input (his ask and D726 — 10 Oct 26)
**Status: BUILT, WALKED, READ BY BOTH AND GATED on `claude/day-window-compact` (10 Oct 26, unattended — D596) — READY FOR HIS LOOK; NOT MERGED. The check, FULL: `raptor-port/docs/handpass/2026-10-10-inputs-vet-check.md` (its §0: twelve readings to tell him, no question; its §8: his five-step look).** Eleven faults found and fixed, each red first (the sheet's §5.3, §6); two of them older faults this build made the main road. *(As approved: "Yes to all" (D729, 10 Oct 26), with A for the desktop list (D727) and "till" once on the card (D728).)* He asked the design guide to vet both screens, "every component including the text", said "I don't like too wordy interface" (D726) and asked for a mock-up of what it would improve. **The whole report** (the scores, eight issues in order, every wording change as built → suggested, what stays): `raptor-port/docs/superpowers/briefs/2026-10-10-inputs-vet.md`. **The mock-up he was sent:** `raptor-port/docs/mock/inputs-vet.html` (today / drawn pictures from the built app — `scripts/handpass/mk-inputs-vet.mjs`).
**His choices, each to be recorded as a ruling BEFORE it is built:** V1 the list's own add form becomes one "+ Input" button opening the calendar's window · V2 the desktop list's small print becomes "By Saber", only where someone else filed it (narrows D629 for the table) · V3 the instructions in the input's window go · V4 the month's shared bars lead with the count ("4 · Meeting"), timed inputs drawn lighter · V5 the shorter settings and the smaller words. With them, still open on `raptor-port/docs/mock/card-questions.html`: the desktop list — **CHOSEN 10 Oct 26: A (D727): every name, the kind keeps its pill there; to build** and the automatic "till …" left out of the remark on the card.
**To check before any fix (found, not confirmed):** hours reading am / pm in the two forms' time boxes (reproduce on his iPhone first); a saved shared input's window opening on the whole people picker; the desktop month re-laying when a day opens.
**Its check when built:** V1 REMOVES a door (the list's form) — FULL, with the door inventory the pencil's removal needed (the OIL question, the medical question, a document, several people, ALL / ALL AVAIL, a placeholder, each found in the window first); the rest are words and one screen each. `[CARD-CHECK-SEEN]`, `[TITLE-CHECK-SEEN]` and `[CAL-CHECK-SEEN]` are this area's small finds and ride with it (D490) where he places them. **PLACED (D730, 10 Oct 26):** those that need no choice from him are fixed as a second batch after this build, with its own tests and check, only if time is left that night; those that need his choice stay in a list for him.
**Place:** the agent's — straight after his choices, on `claude/day-window-compact`, before that branch's pull request.


*Moved here 2026-10-10 by backlog-archive.mjs ([SEEN-BATCH-2]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [SEEN-BATCH-2] The small faults of the last three Inputs checks, SORTED for his second batch (D730 — 10 Oct 26); BUILT AND CHECKED 10 Oct 26 — waiting for his look
**BUILT AND CHECKED, 10 Oct 26 (D731) — NOT MERGED ("No merge", his word).** List A — all ten — and his answers B1–B5 and B8–B11 are built, each a failing test first; B7 and D needed nothing built and are each pinned by a test; B6 was withdrawn. One batch, one check — begun at the WALK tier with Astra's scenarios and Astra's code read on top, RAISED TO FULL after that read (a fix had reached what a delete confirmation removes): Sol 6.1 read it second and blind, every finding of the two was fixed red first and re-walked: `raptor-port/docs/handpass/2026-10-10-batch2-check.md` (the readings to tell him are its §0; his look card its §10). As built, line by line: `raptor-port/docs/ui-contracts.md` "THE SMALL CHOICES OF THE INPUTS PAGES, AS BUILT". **Found on the way and fixed in the batch:** an input filed for ALL AVAIL told its filer "Only Ranger — who filed it" with the switch off; a new group's OIL question led with the man picked first; from Astra's scenarios — Escape on a new note's "+ people" button, a dates calendar left open on a hidden List swallowing Escape, and the day's "Delete this input for all N people?" turning into taking HIM out when the right went while the question stood; from the two code reads — "Take yourself out?" deleting everyone when a right was GAINED while it stood (made by that last fix; both readers), the dates calendar keeping Escape from a pop-up in front of it (both), the new OIL count including a request taken off the programme (Sol), the schedule's one-person dialog naming other men as unanswered (Astra), and Escape dead in a note's people picker while an input's window is up (Sol; older, on `main` too). **Left for him:** `[DAY-TITLE-ESCAPE]`. **Stays filed, unchanged:** list C below. *(The text below is the item as it was sorted and answered — kept as written.)*
**HIS ANSWER, 10 Oct 26 (D731 — "Yes to all"): every choice of list B is answered AS RECOMMENDED below (B1–B5, B7–B11; B6 withdrawn as no fault), list D's question too (kept as built — the window at once); and the batch is his to start NO LONGER — it is started on that word: list A and these answers as ONE batch, tests first, its own WALK-tier check, no merge. NOT BUILT YET.** **Status: SORTED, ANSWERED, NOT BUILT.** D730 placed them as a second batch after `[INPUTS-VET]`, "only if time is left": the first batch closed at about 08:00, the hour he wakes, so none of this was started — a build with no time for its own check is not one to leave him. **Already done by `[INPUTS-VET]`:** "till" twice on a card (`[CARD-CHECK-SEEN]` 1, D728); the List's row lit on Undo and Redo (`[CAL-CHECK-SEEN]`).
**A — READY TO FIX, no choice of his needed (one plainly right behaviour each; tests first, ONE check for the lot — WALK tier, they are windows and controls, no earned leave or saved data):** (A1) the "Unsaved changes" question raised BEHIND the opened day's window on a phone — bring the input's window to the front when it asks (`[TITLE-CHECK-SEEN]` 4; the one a person trips on). (A2) Enter in a new input's Remarks or Title box saves it and a blank "New input" opens again — the same key press must not reach the button behind (`[TITLE-CHECK-SEEN]` 5). (A3) a member reading another man's medical input sees the yellow "You can file a medical entry only for yourself" — not drawn in a window nothing can be picked in (`[CARD-CHECK-SEEN]` 4). (A4) the desktop row's paperclip and OIL chips cannot be reached by Tab — make them buttons, look unchanged (`[CARD-CHECK-SEEN]` 6). (A5) the OIL question of an input in another year names "9 JAN" with no year — add the year, as every other label does (`[CARD-CHECK-SEEN]` 8). (A6) Escape does not close the List's dates picker — it should, as every pop-up does (`[CARD-CHECK-SEEN]` 9, its second half). (A7) a reader's OIL row in the window draws a "Change…" that cannot be pressed — not drawn, as the "?" now is not (`[CAL-CHECK-SEEN]`). (A8) a group's OIL question after a bar's drag is headed with one man's name — "Ranger +1", the words the filing's own question already uses (`[CAL-CHECK-SEEN]`; walker A saw the same heading for two). (A9) the Quals save note reads "Quals saved (prototype — writes to Dataverse in the full build)" — "Quals saved", by his standing rule that screens read production (25 Aug 26). (A10) after a bar's drag is undone the window's "changed while this window was open" note stays, with "theirs" equal to what the window opened on — the note should go (`[CAL-CHECK-SEEN]`).
**B — NEED HIS WORD, each with a recommended answer:** (B1) the passing note lies over the window's Cancel on a phone — *recommend:* on a phone show the note at the top of the screen while a window is open (`[CARD-CHECK-SEEN]` 3; walker B saw it again). (B2) an opened day under a filter says "No inputs on this day. Tap + Input to add one." while the filter hides some — *recommend:* "No inputs match on this day." with the same Clear filters (new words — D726, D541). (B3) the List's dates picker stays open after its end date is tapped — *recommend:* leave it open (he can see the range and press a quick button); only Escape and a press outside close it. (B4) a shared input's OIL line shows the first man's answer after another man's own answer became No — *recommend:* "credited for 3 of 4 — Ranger: no" (new words). (B5) the take-off message says only "Accept undone" — *recommend:* "Ranger's Duty taken off the programme" (new words). (B6) a member filing for "Several people" cannot leave himself out at creation — *recommend:* let him un-pick himself, as an admin can (a change of who may file what — his). *[WITHDRAWN 10 Oct 26: driven on the build of that morning for its picture — as Ranger, with Anvil picked, a tap on his own puck takes him out ("1 picked", Anvil alone); nothing to choose. `raptor-port/docs/mock/img/batch2-choices/06-member-cannot-unpick.png`.]* (B7) an OIL answer for a day the input no longer covers stays on the record — *recommend:* leave it (nothing shows it, nothing is credited, and it stands again if the input moves back). (B8) with the members' switch off, a filer is told "Only <himself> — who filed it — or an admin can change this" and offered "Take me out" — *recommend:* "Filing for other people is switched off — an admin can change this." (B9) Escape while typing a planning note closes the whole day — *recommend:* Escape leaves only the note box. (B10) the two-documents viewer is a little taller than its box on a 1440 × 900 desktop, "Edit input" and "Close" on its lower edge — *recommend:* keep its two buttons pinned in sight, as the input's window does (a layout change — his by D541). (B11 — NEW 10 Oct 26, seen while fixing his find of that morning) on a phone the days of the List's dates calendar are small for a finger (about 28 × 23 points) and the calendar fills half its pop-up's width; D725 made the days of the calendar in an input's WINDOW a finger's size and this one was not part of it — *recommend:* the same finger size, filling the width (a size — his by D487).
**C — RULED OR TOO BIG FOR A SMALL-FAULTS BATCH; stay filed where they are:** "To go out" lists a shared input one line a man (D663 already rules one item — its own job with the changes window, `[TITLE-CHECK-SEEN]` 1); a request taken off, changed and accepted again reads as a change of words (`[TITLE-CHECK-SEEN]` 3 — the amendment count is right); every find of a phone on its SIDE (one more, 10 Oct 26: the List's dates calendar runs past the foot of a 390-tall screen, and for a member whose list is empty its "All dates" could not be reached by a scripted press — `raptor-port/docs/handpass/2026-10-10-list-dates-picker.md` §5), the "Calendar" window on a 568-tall phone, "Calendar…" landing over the SANS day's window, a long item name cut in OIL Earn on a phone (looks — his, with pictures); the two gesture finds one walker saw and the host did not (not reproduced).
**D — STILL HIS TO ANSWER, unchanged:** several days picked on the month opens the window at once, where the drawing had a bar to confirm first (`[CAL-CHECK-SEEN]`).
**Place:** his — recommended: a fresh chat on `claude/day-window-compact`, list A as one batch with its own WALK-tier check, his answers to list B first if he wants any of them in it.
**PUT TO HIM WITH PICTURES (10 Oct 26 — his ask: "show me mock ups of the 10 small choices to state the problem"):** `raptor-port/docs/mock/batch2-choices.html` (pictures `raptor-port/docs/mock/img/batch2-choices/`, taken by `raptor-port/scripts/handpass/b2-pics.mjs` and by the three checks' walkers), sent to him as a page. Numbered for him 1–12: 1–10 are B1–B10, 11 is D, 12 is B11. **His find of that morning is FIXED, not in this list:** on a phone the List's dates button lit and its calendar opened below the foot of the screen — `raptor-port/docs/handpass/2026-10-10-list-dates-picker.md`. A6 (Escape closes that calendar) is still to do.


*Moved here 2026-10-10 by backlog-archive.mjs ([DAY-TITLE-ESCAPE]). Forward facts: `raptor-port/docs/handpass/2026-10-10-batch2-check.md`, `raptor-port/docs/walk-ledger.md`.*

### [DAY-TITLE-ESCAPE] Escape while the day's TITLE is typed closes the whole day — RULED "Yes" (D732, 10 Oct 26); BUILT AND CHECKED 10 Oct 26 — waiting for his look
**BUILT AND CHECKED, 10 Oct 26 (D732) — NOT MERGED ("No merge", his word).** On `claude/day-window-compact`, a failing test first: in a day opened on the Inputs calendar, Escape in the "Day title…" box puts the title back as last saved, takes the keyboard out of the box and writes nothing; the day stays, and the next Escape closes it; Enter and leaving the box save as before. Its check — tier WALK, sized small, the host's own five-step walk (a desktop as admin and as a member, a phone), nine pictures, the whole gate set: `raptor-port/docs/handpass/2026-10-10-batch2-check.md` §11 (the roll-call row of §2.6 is now "has it"; his look card gained step 6). As built: `raptor-port/docs/ui-contracts.md` ("ESCAPE WHILE A NOTE IS TYPED LEAVES THE NOTE BOX ONLY" — the title box's sentences). Found: nothing in the app. *(The item as it was ruled and filed, kept as written:)*
**HIS ANSWER, 10 Oct 26 (D732 — "2. Yes"): Escape in the "Day title…" box puts the title back as it was and leaves the day open; a second Escape closes the day — as a planning note's box does (D731 (9)). RULED, NOT BUILT.** To build: a failing test first (`raptor-port/src/ui/batch2.test.tsx` beside the note's cases, and one real-key case in `raptor-port/e2e/inputs-batch2.spec.ts`), then the key handler on `#icRmkEdit` in `raptor-port/src/ui/InputsCal.tsx` — Escape restores the saved title, leaves the box, writes nothing, and stops the key before the shell; Enter and leaving the box save as now. Its check: small (one more box taking a key the note's box already takes) — the roll-call row of the batch's sheet (§2.6) turns from MISSING to has-it, one walk step, the gates. **Place:** his "what's next" of 10 Oct 26 — the agent's recommendation: the next chat builds it FIRST, on `claude/day-window-compact`, before his "merge live" of pull request #488 (about half an hour with the gates). *(The item as it was asked, kept as written:)*
**Status when asked: A QUESTION FOR HIM; nothing built.** Found by the roll-call of `[SEEN-BATCH-2]`'s check (`raptor-port/docs/handpass/2026-10-10-batch2-check.md` §2.6, §7). D731 (9) made Escape in a planning NOTE box leave the note box only. The "Day title…" box at the top of the same opened day is not a note and was not on his picture: Escape there still closes the day, and a title half typed is lost (Enter, or leaving the box, saves it). **Recommended answer:** the same manners — Escape puts the title back as it was and leaves the day open; a second Escape closes the day. Small: one key handler and its test, in `raptor-port/src/ui/InputsCal.tsx` (`#icRmkEdit`). **Place:** his — it can ride with the next Inputs batch.


*Moved here 2026-10-10 by backlog-archive.mjs ([CARD-CHECK-SEEN]). Forward facts: `raptor-port/docs/handpass/2026-10-10-input-card-check.md`.*

### [CARD-CHECK-SEEN] Older small finds met by the input card's check (10 Oct 26) — none caused by that job; filed, not fixed
**Fixed 10 Oct 26 by `[SEEN-BATCH-2]` (on `claude/day-window-compact`, not merged):** (2) the viewer's buttons pinned (D731 (10)); (3) the passing note at the top on a phone while a window is up (D731 (1)); (4) no yellow box for a reader; (5) the filtered day's line (D731 (2)); (6) the row's chips are buttons; (7) the shared OIL line counts its people (D731 (4)); (8) the year on an OIL day; (9) the dates calendar — it stays open by his answer (D731 (3)) and Escape closes it. (10) is ruled "leave it" (D731 (7)). (1) went with `[INPUTS-VET]`; its cross-year "till 1 Jan" with no year in a remark is `[TILL-FROM-DATES]`'s. **Nothing is left open here.**
**The input card's list, placed by him (D730, 10 Oct 26):** the finds here that need no choice from him are fixed as a second batch after `[INPUTS-VET]`'s build, with its own tests and check; those that need his choice are listed for him.
Met by the walkers of `[INPUT-LIST-AS-DAY-CARD]`'s check (`raptor-port/docs/handpass/2026-10-10-input-card-check.md` §5.3; their reports `raptor-port/docs/handpass/parts/icard-A.md`, `icard-B.md`, `icard-C.md`, pictures under `raptor-port/docs/img/handpass/2026-10-10-input-card-check/`) and placed by the host as OLDER than that change. His to place; low. **(1) "till 22 Jul" twice on a several-day input's card** — at the right and again as its remark, where the remark is only the automatic "till <date>" (the opened day's old card did the same); PUT TO HIM, the sheet's §0 question 3 — recommended: leave such a remark off the card. A cross-year input's remark says "till 1 Jan" with no year while the corner says "till 1 Jan 2027" (walker A, 12 and 17). **(2) The document viewer with two documents** is a little taller than its box on a 1440 × 900 desktop: "Edit input" and "Close" sit on its lower edge until it is scrolled (`raptor-port/src/ui/DocViewer.tsx`; walker B, 46). **(3) On a phone the passing note** ("Input updated", "Zed archived") lies over the window's Cancel button while it shows (walker B). **(4) A member reading another man's medical input** sees the people picker's yellow "You can file a medical entry only for yourself" box inside the read-only window (`raptor-port/src/ui/PeoplePick.tsx pickProblem`, drawn although nothing can be picked; walker C, 60). **(5) An opened day under a filter says "No inputs on this day. Tap + Input to add one."** while inputs the filter hides are on it (`raptor-port/src/ui/InputsCal.tsx`; walker C, 81). **(6) The desktop list's paperclip and OIL chips cannot be reached by Tab** — they are not buttons (`raptor-port/src/ui/InputsPage.tsx`, the row's last cell; the row's Name is one since this job; walker C, 83). **(7) A shared input's OIL line shows the first man's answer** ("credited") after another man's own answer became No (walker C, 61) — beside `[CAL-CHECK-SEEN]`'s "a group's OIL question is titled with one man's name". **(8) The OIL question of a 2027 input names "9 JAN" with no year** (the saved answer is rightly 2027; walker C, 78). **(9) The list's date picker stays open after its end date is tapped, and Escape does not close it** (walker A, 21). **(10) An OIL answer for a day the input no longer covers stays on the record** after its dates are moved away (nothing on screen shows it and nothing is credited for it; it stands again if the input is moved back onto that day — the shared save's own behaviour, the pencil's too; walker B, 38; the host's A10). **As filed:** each small; (1) is the one he will see.


*Moved here 2026-10-10 by backlog-archive.mjs ([SANS-COMMITMENT-CALENDAR]). Forward facts: `raptor-port/docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md`, `raptor-port/docs/walk-ledger.md`.*

### [SANS-COMMITMENT-CALENDAR] Inputs and SANS calendars — CALLED BACK 7 Oct 26 (D614), Opus 5.5 builds from here (D615); was ON HOLD D585; built preview/evidence preserved (5 Oct 26)
**8 Oct 26, night — STEP 4, THE SANS CALENDAR, IS BUILT (seven pieces, each its own commit, pushed for his look):** the SANS
tab is its own screen — the month on the one resolver, the day's window, Highlight, the gear's settings, "How this works"
— and the first build's SANS store, command and controls are gone (the plan's "AS BUILT" note under §3.5; the contract:
`raptor-port/docs/ui-contracts.md` "The SANS calendar"). **Still to build:** step 5 (the Inputs calendar — tabs, bars, the
gear, the editor as a window, who placed it on the other lists, the group input's screens) and step 6; then the job's ONE
bug check, FULL. Where it stands: that branch's block in `HANDOFF.md`.
**7 Oct 26 — where it stands now (the job's own chat, `claude/inputs-sans-calendar`):** the live version is brought into the
calendar work on that branch (the failed-save band, D587, sits under the calendar's bar). **Owed before any "merge live":**
Opus's own read of what Codex built (D615 — its finds fixed, each with a test that fails first); his look at the design, which
he has NOT accepted (D583, D584); his answers to the open product points; the walk of the running app, sized first (D607, D608);
Astra's and Sol 6.1's reads of what Opus adds. The current state and the next step: that branch's block under `## Now` in
`HANDOFF.md`. Everything below is Codex's record of 5 Oct 26, unchanged.
**His picks and new points, 7 Oct 26 afternoon (D626–D629):** lined-up columns in the first set's own colours (D630 — the
deeper tints tried in the second set were too much contrast), three slimmer tabs, bars, the rest as drawn (D626); a day is day flying, night flying or no fly — NF needs nobody and shows "NF" — and
PH and Off days show on both calendars from the Leave War's own record (D627); the late cut-off as days or as a weekday of a
week before, stated in "How this works" (D628); who placed an entry and when, in small print (D629). Three questions are back
with him, drawn in the second mock-ups (D630 settled the colour): where the cut-off is set, one door or three, a SANS-needed row on the Leave War.
**The baseline is set once, not day by day (D631, 7 Oct 26):** a day is day flying unless night is selected; no-fly days can repeat
from a date onward; the year's holidays in one list; drawn as ONE home, "Days" (normal week, holidays, month), the one-day sheet
kept as the quick door. **D632:** a denser desktop Inputs month, drawn for him to pick.
**No normal-week view (D633, 7 Oct 26):** the month carries a select button on every day (Day / Night / No fly), the weekday's
heading sets every such day from a date onward, and the required pilots and WSOs are set on the Leave War's columns (a figure can
run "from this day on"); PH and Off days in the Holidays list, No Leave on the Leave War's Event row — drawn in the fourth mock-ups.
**The Leave War's Event sheet stays as built (D634, 7 Oct 26):** colours, tags, "Edit types", a day or a range — nothing of it is
redrawn or removed in this job.
**The settings icon is a gear, never like the day-flying sun (D635, 7 Oct 26).**
**The required figures are typed straight into the Leave War's cells, several picked by a drag and given one number (D636, 7 Oct 26)** —
drawn on real pictures of the Leave War in the fifth mock-ups (7 Oct 26).
**His answers on the fifth set, 7 Oct 26 (D637–D640) — the design is settled but for two small readings:** the typed rows are Required P
and Required W, the four rows (those two, Available P, Available W) sit under the Leave War's Event rows, a figure can run "from a
date on" skipping weekends, public holidays, Off days and no-fly days, and there is no "SANS needed" row (D637); a phone date carries
one stepping button and a desktop date three, three choices are enough (no "day and night"), a weekday's heading sets repeating days,
a public holiday and an Off day each have two doors onto one record and No Leave is on the Leave War only (D638); the late cut-off is
behind each calendar's own gear, the Logic page lists both, a cut-off is the end of its day, and the desktop Inputs month is compact
with no switch (D639); the two Available rows are ordinary Leave War count rows an admin can rename and re-define — leaving out OCU,
say — and the SANS calendar uses whatever they count (D640). **Every pop-up window drawn for this job drags, and the page behind it still works — a click outside does not close it (D641).** **Weekends start with no flying set; a no-fly day still shows and takes OFT and AMT; the war's panel for picked people's days is
brought into line with D641 in this job (D642). The Event sheet is to be made plainer and a long event name shows as a short form that
opens at a click — a mock-up first (D643); the drawing in fewer words, its first row "Presets", not "Type" (D644). **The group input's three later answers (7 Oct 26, evening): a member never files SANS availability for another man, an admin may for several (D658); the "Several people" picker has a fourth heading, "Personnel", where the roster holds ground crew (D659); whoever files for other people answers the OIL question for all of them at the save (D660). And in the changes window a group filing is ONE item with its people listed, built in this job (D663); on the schedule it is one row holding everyone, built as its own job straight after — `[GROUP-INPUT-ONE-ROW]` (D661, D662).** **"How this works" is cut to five short lines, no worked example (D646).** **On the SANS day each committed person is the schedule's own puck, his CAT chip attached, all one size, in proportion with the row's letters, wearing the SANS purple edge (D647, D649, D650, D651).** **The Holidays list's "Add a day" form carries the short form too (D652).** **On a phone the Inputs month fills the screen's height with thin bars and fits any phone's height (D653).** **HE ACCEPTED THE DESIGN AND GAVE THE GO TO BUILD IN THE NEXT CHAT (D657).** **An input can be filed for a group of people at once, by an admin and for now by a member (D654) — it changes who may file for whom; a member only duties and commitments, one shared group input, the man, the filer and an admin may change it (D655); the picker is a hybrid — one person from a list by default, a "Several people" switch showing compact pucks in three groups, Pilots, WSOs and SANS, each A to Z (D656); NOT in the plan yet — an add-on for both readers first.** **The opened day lists everyone and scrolls, no "+ more"; not full screen, but it pulls up on a phone (D648).** **TAKEN, "yes to all" (D645): built as redrawn, short forms on the grid, each preset with its own (PH, OFF, NL, SC) — the plan's §3.12, to both readers as an add-on first.** **The build plan (7 Oct 26, nothing built):** `raptor-port/docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md` — with Astra and Sol 6.1 for one round of challenge each, blind (D590; the brief: `raptor-port/docs/superpowers/briefs/2026-10-07-inputs-sans-redesign-plan-challenge-brief.md`); its section 8 holds what is still with him. No build before both have read it.
**In this job's bug check (D624, 7 Oct 26):** each approved mock-up is set beside a picture of the built screen at the same size, in
the evidence sheet.
**HIS DIRECTION, 7 Oct 26 (D617–D621) — the design changes; mock-ups first, nothing built before he picks:** each SANS date
shows pilots / WSOs — still needed to fly, and SANS committed to F, O and A; still needed comes from the Leave War's pax
required, less those available, less the SANS committed to fly (D617 — the pax required figure is NEW on the Leave War, kept as
two figures, pilots and WSOs: D622); three
colours, yellow / amber / red, set from a settings icon (D618); a Highlight picker rings one SANS person's days in cyan (D619);
the layout — Medical, the SANS calendar and the Inputs calendar from one place, Inputs keeps its List, SANS availability
leaves the List for the SANS calendar (D620); ideas to draw — Google-style bars, drag a range, an Instructions fold, the
keyboard (D621). The design note: `raptor-port/docs/superpowers/specs/2026-10-07-inputs-sans-redesign.md`.
**D585:** owner puts this task on hold before choosing other outstanding work.
Pause further design, building and Claude vetting until explicit resume. Keep
the existing branch/Ready preview, settled requirements, recommendations and
all evidence/owed reads. No cancellation, main authority or new batch inferred.
**D583 delivery:** show finished desktop and mobile mockups from the actual preview,
then bring to Claude for vetting. No owner design acceptance or main authority inferred.
**D584 handoff:** explain owner intent, original references and settled answers;
separate agent choices and invite fresh independent critique of how to tackle it.
Home: `raptor-port/docs/handpass/2026-10-05-inputs-sans-claude-handoff.md`.
**Current corrections D581/D582:** show F/Fly, O/OFT and A/AMT unique-person
availability counts on every SANS date; flying-only target/shortage remains.
Compact Inputs entry/header delegated addendum and independent challenge:
`raptor-port/docs/superpowers/plans/2026-10-05-inputs-sans-header-counts-addendum.md`
and `raptor-port/docs/superpowers/plans/2026-10-05-inputs-sans-header-counts-sol-challenge.md`.
Simplify the cluttered phone Inputs entry/header through Impeccable, retaining
the existing mode/view/Medical/filter/export doors. Recommended compact layout,
pre-source phone/desktop pictures and independent plan challenge precede these
additions. Original R2 remains frozen on the old build; new code's independent
Claude read after reset is owed before main, no third Astra inspection inferred.
**Build status:** Calendar-first Inputs with Member/SANS modes and secondary List,
shared day/editor and date-range gestures, admin daily Fly demand/manual day/night
intent and global amber1/red3 deficit cutoffs built on `codex/inputs-sans-calendar`.
Independent plan/challenge and private pre-source pictures complete. FULL evidence:
`raptor-port/docs/handpass/2026-10-05-inputs-sans-calendar.md`. A final picture walk
caught a hold-release date change; fixed after failing proof. Corrected-build
gates and31 independent runtime groups PASS on the earlier snapshot. Fresh Astra
R1 found three save/reveal orders; corrected with failing-first tests. The rewalk
also exposed a restore-before-data-replay error; corrected directional metadata
and primary restored-row selection. Final independent runtime50groups PASS with
seven actual showcase states; all42 original pictures personally opened/hashed.
Corrected final gates unit7810/494files, browser570/49existing skips, six adapted
156assertions and performance4/0 PASS on that older snapshot. Final Astra R2
CHANGES REQUIRED (one P2 colour-popup dismissal/Escape defect), immutable2of2.
Corrected capturing outside press/Escape/focus/role cleanup; no third Astra code
read. New D581/D582 header/counts plus popup correction: focused72unit,
11production-browser/build PASS; independent expanded34runtimegroups PASS,
all25 original pictures opened. Two original harness errors preserved/corrected
(native all-date seed rows; hidden phone role badge), no app defect established.
Current Freeze13 has identical18served assets to walked Freeze11/12; one CSS
source CRLF→LF byte normalization only. Final new full gates PASS: unit7819/494,
browser572PASS/49existing skips/0FAIL, adapted156/performance4/reference728/
Tracker445; build/rulecheck/whitespace PASS. Final expanded
code's independent Claude read after reset remains owed before main.
Owner look/Claude reads/explicit
merge remain owed. Existing per-browser backend; no shared database is delivered.
D570–D572 settle flying-only demand, deficit-based admin-editable red/amber baselines and one count/person with hours visible. D573 initially deferred placement; D574 asks for recommendations, D575 requests app-style pictures/Claude review, D576 considers secondary List, D577 sun/day and moon/night flying. D578 held build; D579/D580 supersede that hold and delegate choices/build now. Monthly calendar shows the resulting flying-offer shortage.
Members open a day to see others' commitments and add their own. Form follows the
fourth private reference/current app availability controls, with Custom start/end;
Remarks has no faded placeholder. References1/2 supply month/day direction,3 is
contrast only. Remaining numbers/boundaries/config scope and day-list/navigation choices are delegated by D580; explain them in the plan rather than waiting for another answer. Existing timing/edit/delete/overlap
behaviour retained, not re-asked. One short offer counts once, not full-day coverage.
**Home:** `raptor-port/docs/superpowers/specs/2026-10-05-sans-commitment-calendar.md`.
**Independent initial read:** `raptor-port/docs/superpowers/plans/2026-10-05-sans-calendar-initial-read.md`; first round answered D570–D573 (flying demand, deficit colours, unique people with hours, location deferred). Concrete Astra plan/pictures and Sol challenge completed before source work. No new unseen picture acceptance is inferred; D580 supplies recommendation-based build authority.
**Place:** replacement current build task after D568 cancels caps/ops handoff;
no new chat requested. Other feature batches remain outstanding. Picture/plan and
independent challenge precede source work; calendar request/count/permission and
published consequences retain applicable FULL checks. All old Claude reads owed.


*Moved here 2026-10-10 by backlog-archive.mjs ([SANS-CALENDAR-WIP]). Forward facts: `HANDOFF.md`.*

### [SANS-CALENDAR-WIP] The new layout for the SANS availability calendar, worked on with Codex, is in progress and on hold — nothing of it is deleted (owner, D610, 7 Oct 26)
**CALLED BACK 7 Oct 26 (D614): the NEXT job is the Inputs calendar and the SANS availability calendar.** *(7 Oct 26, the job's own chat: the branch is brought level on `claude/inputs-sans-calendar`; what is built and what is owed: [SANS-COMMITMENT-CALENDAR].)* Start from
`codex/inputs-sans-calendar`'s own `HANDOFF.md` block (read it with `git show origin/codex/inputs-sans-calendar:HANDOFF.md`).
That branch is 124 commits behind the live version: bring it level FIRST — it meets `main` in the rulings files (use
`backlog-archive.mjs --rulings --merge`), `AGENTS.md`, `HANDOFF.md`, `OUTSTANDING.md`, `raptor-port/docs/ui-contracts.md`,
`raptor-port/playwright.config.ts` and `raptor-port/src/ui/InputsCal.tsx` (the failed-save band, D587). **Opus 5.5 builds it, in Claude Code (D615, 7 Oct 26)** — it reads
what Codex built first; Astra and Sol 6.1 review what Opus adds. Nothing of it is deleted (D610). Size the walk first (D607, D608).
His words: *"That's still work in progress and I may call it back to work on it anytime. So don't delete"*. The work is on
the branch `codex/inputs-sans-calendar` (on his PC and on GitHub; checked 7 Oct 26) — its own handoff block, its rulings
D567–D585 and its records are on that branch, not on `main`; Codex recorded his hold there (D585) and D589 kept it outside
the Codex stack. **Until he calls it back: no chat reviews, rebuilds, merges or tidies it, and no tidy-up deletes its branch,
its records, its pictures, its backlog items or its rulings.** When he calls it back: read that branch's `HANDOFF.md` block
first; its ruling numbers D567–D585 are reserved. In D495's order it is the batch "how inputs show on the calendar"
(`[FEATURE-WISHLIST]`). **Place:** his to call.


*Moved here 2026-10-11 by backlog-archive.mjs ([REQ-ROW-OWN-BOXES]). Forward facts: `raptor-port/docs/engine-rules.md`, `raptor-port/docs/ui-contracts.md`.*

### [REQ-ROW-OWN-BOXES] Typing in the programme row of an accepted request changes the row, not the request (both walks of the Codex stack check, 5–6 Oct 26 — a question for him)
**BUILT 11 Oct 26 on `claude/group-input-one-row` (step 2 of `[GROUP-INPUT-ONE-ROW]`): the row's name, its two times and its remark write the request, through one door (`raptor-port/src/ui/reqrow.ts`), with a belt in the engine; the rule is in `raptor-port/docs/engine-rules.md`, "A request's row: its name, its two times and its remark are the request's". Not merged; not yet walked — the job's one FULL check comes after its last step.** **ANSWERED 10 Oct 26 — D739, D740: a time or a remark the scheduler types on a request's row changes the request itself (one record), for a one-man request as for a shared input. NOT BUILT — it is built with `[GROUP-INPUT-ONE-ROW]`, as that job's second step (the design note `raptor-port/docs/superpowers/specs/2026-10-10-group-input-one-row.md`); this item leaves with that job. As filed:**
A timed request (walked: Training, Sat 18 Jul, 11:00–12:00) accepted onto the Ground / Common Programme: typing a new start, end or
remark in the PROGRAMME ROW's own boxes changes that row (10:15–11:45, the new words) while the request — its line under Personal
Inputs, the Inputs page — keeps 11:00–12:00 and its own remark, also after a reload; typing in the request's own boxes changes the
request and the row follows. On the week and on the board, by click and by Tab alike. Older than the Codex stack: nothing in it touched
that code (the row's boxes are the scheduler's own layer over the request — `raptor-port/src/engine/overlay.ts`, unchanged against
`main`); Astra's scenario P4c-03 assumed the row IS the request. Walkers D and P, `raptor-port/docs/handpass/parts/stk-D.md`,
`stk2-P.md`. Not ruled. **Place (the agent's line):** low — ask him: should the row's times be the request's (one record), or may the
scheduler re-time the row on the programme and leave the member's request as filed (as now)? With the next change to requests on the
programme.


*Moved here 2026-10-11 by backlog-archive.mjs ([REQ-ROW-SELF-CLASH]). Forward facts: `raptor-port/docs/engine-rules.md`, `raptor-port/docs/ui-contracts.md`.*

### [REQ-ROW-SELF-CLASH] Times typed on the row of an ALL-DAY request put on the Ground Programme flag the request's own man against it (found 6 Oct 26, the D605 build — OLD; low)
**BUILT 11 Oct 26 on `claude/group-input-one-row`, with `[REQ-ROW-OWN-BOXES]` (step 2 of `[GROUP-INPUT-ONE-ROW]`; D739, D740): times typed on the row make the REQUEST timed, so its man is no longer flagged against his own row — pinned in `raptor-port/src/ui/reqrow.test.tsx`. Not merged; it leaves with that job. As filed:**
File an all-day Training for a man; put it on the Ground Programme (its row has no times, by design); type 09:00–10:00
in that row's own boxes: the list says "Training but tasked — TRAINING" for him — his request against its own row. Run
by the host through the rule on the unchanged timed path; the same on the live app. An all-day request keeps its own
voice beside its row (`raptor-port/src/engine/inputs.ts` `inputFlags` — a time-less row cannot carry a clash), and the
timed absence loop does not know the row IS that request. D605's new look does know (`events.ts` — `src` against the
input's id) and stays silent while the row has no times. Kin of `[REQ-ROW-OWN-BOXES]` (typing in a request's row changes
the row, not the request — a question for him). **Fix:** the timed loop skips an input against the ground row whose
`src` is that input; a red test first. **Place:** low — with `[REQ-ROW-OWN-BOXES]`.


*Moved here 2026-10-11 by backlog-archive.mjs ([CAL-TOGO-ONE-ITEM]). Forward facts: `raptor-port/docs/engine-rules.md`, `raptor-port/docs/ui-contracts.md`.*

### [CAL-TOGO-ONE-ITEM] "To go out" lists a shared input as a line for each man (D663 reading 2 — the calendar job's bug check, 8 Oct 26)
**Found, not fixed.** Walkers G (X-01) and H (X-11): on a published day's "To go out" tab one meeting filed for three is three lines ("Ranger · Meeting", "Drifter · Meeting", "Ace · Meeting"); "All changes" and "New to you" show ONE item with the names under it (fixed in the same check — `ui/changesmodel.ts mergeFiled`). He was told the one item "holds on every tab" (D663 reading 2). The pending list is built by `ui/pendlist.ts`, which finds a line by its man; the count beside it stays per man by his ruling (reading 3). **As filed:** low — the list and its count agree; fold the men of one filing there as `mergeFiled` does. Also seen: after one man left a shared input, "All changes" titled the item "2 people" over three "added" names.


*Moved here 2026-10-11 by backlog-archive.mjs ([GROUP-INPUT-ONE-ROW]). Forward facts: `raptor-port/docs/engine-rules.md`, `raptor-port/docs/ui-contracts.md`.*

### [GROUP-INPUT-ONE-ROW] On the schedule a group input is ONE row holding everyone (D661 — 7 Oct 26)
**WHERE IT STANDS (11 Oct 26, later): ALL SIX STEPS BUILT AND PUSHED ON `claude/group-input-one-row`, WITH THE RECORDS AND THE BEHAVIOUR REGISTER (`raptor-port/docs/superpowers/specs/2026-10-11-group-input-one-row-behaviour-register.md`); D747 (the board row's coloured line) built with it and D748 recorded; THE JOB'S FULL CHECK IS UNDER WAY — its sheet `raptor-port/docs/handpass/2026-10-11-group-input-one-row.md` (read its §12); the two code reads and Astra's scenario design wait for his ChatGPT allowance (D746). NOT MERGED. *As it stood that morning:* WHERE IT STANDS (11 Oct 26): PLANNED (version 3), STEPS 1 TO 4 OF SIX BUILT AND PUSHED ON `claude/group-input-one-row`; STEP 5 (the hands on the one row) worked out and its tests drafted — `raptor-port/docs/superpowers/briefs/2026-10-11-group-input-step5-notes.md` — NOT built; steps 5, 6, the records and the job's FULL check remain; D746: the check's two code reads wait for his ChatGPT allowance. Current state is `HANDOFF.md`, this branch's block. As written on 10 Oct 26:** **IN HAND (10 Oct 26), on `claude/group-input-one-row` — ROUND 1 OF ITS QUESTIONS IS ANSWERED; NOT PLANNED, NOT BUILT.** The design note, kept as his answers come: `raptor-port/docs/superpowers/specs/2026-10-10-group-input-one-row.md`. **His four answers:** (1) on the shared row the pucks ARE the input's people — a puck taken off takes that man out of the input itself, a puck put on adds him (D734; he asked which choice has fewer bugs and leaned this way — the agent's reply: for who is on the row, this one); (2) one row has one time for everyone — for a different time or a cancel for one man the scheduler takes him off and gives him a row of his own; the row never splits by itself (D735); (3) on a published day the whole input filed, taken off or re-timed is ONE change waiting, one man taken off or added is one each (D736 — it ends D663's "four men is four changes" once built, and settles `[CAL-TOGO-ONE-ITEM]` the same way); (4) on the Unavailable list an input for several people stays a row a man (D737). **Told to him as readings, not asked:** a man on leave or grounded that day stays on the row, flagged (D605); the row's dialog is the group's throughout; in OIL Earn each puck is switched alone; a one-man request's row is unchanged (D18, D470); a placeholder puck on the row is the row's own (D46). **Round 2 (10 Oct 26):** a man the scheduler adds by dragging his puck onto the row takes the OIL answer the input already carries — no question on the schedule, OIL Earn still switches him (D738). A time or a remark the scheduler types on the shared row changes the input itself, for everyone in it — the schedule and the Inputs calendar always agree, the original kept in the change history with the scheduler's name (D739: his own words, "The scheduler changes the input entirely from the original on the schedule", then, asked back with one example, "14:30 - the input changes"). **A ONE-man request's row follows the same rule, built inside this job (D740)** — asked twice: he tapped yes, wrote "Sorry explain the 2nd question again", and, explained with Ranger's own Training request, tapped "Yes - same rule"; it answers `[REQ-ROW-OWN-BOXES]`. **THE JOB IS NOW TWO STEPS, ONE MERGE: (1) the shared input's one row (D661, D734–D738); (2) a request's row writes its time and remark through to the request (D739, D740).** **And the LATE mark (D741 — "Yeah I recommend no"):** a change the scheduler makes to an input from the schedule after the cut-off never makes it read LATE; a change in the input's own window still does, as today. **Confirmed for EVERY kind of input (D742, 10 Oct 26 — his own question, answered yes to both):** what the scheduler changes on an input's row on the schedule changes the input, and never makes one that was on time read LATE — on the Unavailable list and under Personal Inputs too, where a typed time or remark already changes the input and TODAY still makes it read LATE (so that half is new work there: leave, an overseas duty, a course). **THE PICTURES ARE APPROVED AS DRAWN — "Yes for all" (D743, 10 Oct 26): the design of record; NEXT IS THE PLAN.** The page: `raptor-port/docs/mock/group-input-one-row.html` (https://claude.ai/artifact/9L5jorxWtevLyMZkHmreDc), ten numbered pictures, drawn by `raptor-port/scripts/handpass/gi-mock.mjs`; what drawing them found is in the design note (the list of what is waiting to go out is a line a man today; four places say the count). **EVERY QUESTION PUT TO HIM IS ANSWERED (D734–D742).** **THE PLAN IS WRITTEN (11 Oct 26):** `raptor-port/docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md` — its bet: the shared input stays one record a man AND one ground row a man, and the ONE row is made where it is drawn, where a hand writes to it and where a published day counts it; its readers' brief `raptor-port/docs/superpowers/briefs/2026-10-10-group-input-one-row-plan-read.md`. **VERSION 1 WAS READ BY ASTRA AND BY SOL 6.1, EACH BLIND — BOTH NOT CLEAN (22 findings, none reopening a ruling or a picture; the plan's §8 lists each and what was done); VERSION 2 was read again by both, its changed parts only (`raptor-port/docs/superpowers/briefs/2026-10-10-group-input-one-row-plan-read2.md`) — Sol CLEAN WITH FOUR EXACT CHANGES, Astra NOT CLEAN (seven, all technical, none for him); VERSION 3 takes every one (its §8) and is the version built — no third read of the plan; the build's tests and the FULL check's two code reads hold the rest.** What changed: the row carries its ENTRY's own identity; the filer's last OIL answer is kept on the input (a new saved field) for a man added on the schedule (D738); a placeholder on the one row is not handed to another man — it leaves with its member, said in words; a man dragged from the row onto another place leaves the input and is put there in one step; belts in the engine hold the rule that a request's boxes and a shared row's name box are the request's. **The point put back to him on 11 Oct 26 (version 1's Q1) is WITHDRAWN — both readers hold that D739's and D740's reading 4 already settle it:** hours typed on the schedule keep a Yes at the new amount, with no question, on every row; this narrows the 28 Aug 26 rule (a changed amount is asked again) to a change made in the input's own window. `[REQ-ROW-SELF-CLASH]` leaves with this job too (the plan §4.4). **RULED 11 Oct 26 — D744** (told of the kept "filer's last answer": "If an input has multiple people and different answers for OIL. Any subsequent addition the OIL earned question will be asked"): a man added takes the input's OIL answer without a question only while everyone in it carries the same one; where their answers differ he is asked at once — so the plan keeps NO answer apart on the input (its `oilAll` is removed, §4.5). **Asked of Fable on his word, 11 Oct 26** ("Why must the all avail puck be tied to someone" / "Is there a better way"): keep it leaving with its man — the only way that never moves OIL unseen — with three corrections taken into the plan (the change history's line names it and anyone switched off on it; the published day's one line; the words); the report `raptor-port/docs/superpowers/briefs/2026-10-10-reads/group-input-placeholder-fable.md`; **the three options were put to him — HE CHOSE THE RECOMMENDED ONE, D745 (11 Oct 26, "Ok go with as recommended"): the puck comes off with its man, said, and is dropped on again.** **BUILT 11 Oct 26 — step 1 of six** (the LATE mark and the OIL amount from the schedule — D741, D742, D739 (4); `leavewar/schedlate.test.ts`, `ui/oilconfirm.test.tsx`; the plan §5). **Next:** step 2 (a request's boxes write the request), then the one row, in the plan's order, then its own FULL check.
**Seen 10 Oct 26 by `[SEEN-BATCH-2]`'s re-walk, to settle with this job (not fixed):** today the schedule's and the board's own dialog, opened on ONE man's row of a shared input, is a mix — titled for the group ("Ace +1 · 18 Jul" over Drifter's row) and its Delete asks about everyone, while its Save and its OIL lines are that one man's (picture `raptor-port/docs/img/handpass/2026-10-10-batch2-check/rewalk/G5b-board-dialog-drifter.png`; the OIL lines were brought to one scope by that batch). When the group is one row, the dialog is the group's throughout.

**Ruled, not built.** He chose picture B of the mock-ups (https://claude.ai/artifact/RU8YNk1gDXj8sddcWvA76b, drawn by `shoot10.cjs` on his PC): a meeting filed for four men shows on the Ground Programme as one row with four pucks, not four rows. **Today** every landed input is its own row with one man (`raptor-port/src/state/holderbase.ts`, `engine/overlay.ts viewOfWeek`), and the group input of the calendar job is kept as one record per man (the build plan `raptor-port/docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md` §3.13) — so until this is built the schedule shows one row per man. **Its place — his ruling, D662 (7 Oct 26): its own job, straight after the calendar job, not inside it** (it reaches into how a published day counts changes waiting to go out: D109, D113, D114, D178). **Before it is planned, put to him with pictures (rounds of at most four):** a scheduler takes ONE man off the shared row, or cancels or re-times it for one man — does he leave the group, or does the whole input change; on a published day is a change to the row one change waiting or one per man; a man on leave that day — is his puck on the row flagged or left off; does the row show on Personal Inputs, on the Ground Programme, or wherever its men's rows would each have landed. **Then:** a plan read by Astra and Sol 6.1 (published records), built tests first, its own bug check or the calendar job's if it rides with it (D485).


*Moved here 2026-10-12 by backlog-archive.mjs ([CX-INPUT-WINDOW-ASK]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/superpowers/plans/2026-10-11-one-rule-plan.md`.*

### [CX-INPUT-WINDOW-ASK] A cancelled input's own window says nothing of the CX; nor does the CSV export (the one-rule build's step 5, 12 Oct 26 — two questions for him)
**ANSWERED AND DONE 12 Oct 26 — D771 (the window says it is cancelled: BUILT the same day on `claude/all-avail-as-member`) and D772 (the CSV export stays as it is). As it was put:**
**NOT BUILT — his to answer; nothing waits on it.** D767 settled how a cancelled input looks on the Inputs calendar's card, the List's row, the month's bar and the schedule's own line. Two places were not in his pictures and are left as they were:
1. **The input's own window.** A member who taps his cancelled card opens a window that looks live — no tag, no reason (`raptor-port/src/ui/inputedit.tsx InputEditor`). *Recommended:* yes, say it — the same red CX tag and reason beside the window's title, read-only (only a scheduler cancels or brings back, D760 reading 2). A small change; a picture first if he wants one (D541).
2. **The CSV export** writes a cancelled input's line like any other (`raptor-port/src/ui/export.ts inputRows`). *Recommended:* leave it until he wants a "Cancelled" column — nobody has asked for the export to carry the schedule's marks.
The record of step 5: `raptor-port/docs/superpowers/plans/2026-10-11-one-rule-plan.md` §10.


*Moved here 2026-10-13 by backlog-archive.mjs ([ALL-AVAIL-AS-MEMBER]). Forward facts: `raptor-port/docs/superpowers/plans/2026-10-11-one-rule-plan.md`, `raptor-port/docs/handpass/2026-10-12-one-rule.md`, `raptor-port/docs/engine-rules.md`, `raptor-port/docs/ui-contracts.md`.*

### [ALL-AVAIL-AS-MEMBER] His idea: let "Several people" take ALL AVAIL / ALL, so the puck on a shared input's row is the input's own and is tied to no man — WIDENED BY HIS RULINGS D755 AND D756 (11 Oct 26) TO ONE RULE FOR EVERY INPUT'S ROW, STORED AS ONE RECORD PER INPUT; to PLAN next, on `claude/all-avail-as-member`
**TO BUILD INSIDE THIS JOB'S FULL CHECK — D773 (12 Oct 26, *"I don't need an export to excel function for inputs. U can remove it."*):** the Inputs List's "Export to Excel" button and the file it writes come out (only the Inputs page's — the Quals export and the schedule's export and print stay); a failing test first; it rides the check's fix round, its gates and its re-walk (`raptor-port/docs/handpass/2026-10-12-one-rule.md`). D772 is replaced by it.
**WHERE THE BUILD STANDS (12 Oct 26): STEP 1 OF EIGHT IS BUILT on `claude/all-avail-as-member` — the per-person view of the inputs, with nothing changed on screen (the plan's §10 says what was built and where it left the plan's letter; its check `raptor-port/docs/handpass/2026-10-12-one-rule-step1.md`; the timings `raptor-port/docs/performance.md` ledger 27). He asked to be shown before step 2; steps 2 to 8 are not built. Nothing merged.**
**THE JOB AS IT NOW STANDS — D755, D756 (11 Oct 26): "Go with one rule." / "Yeah the stores shape should change as well. And see what else should follow."** A row that came from an input IS the input — whoever stands on it is in the input, a named person or ALL AVAIL / ALL, whoever put them there, one person or several (D755, with its four accompaniments); an input is stored as ONE record with the list of its people (D756). The design note has the rule, the first pass of what else follows and the process (HEAVY: a plan read by two, a FULL check): `raptor-port/docs/superpowers/specs/2026-10-11-all-avail-as-member-design-note.md` §5, §6. `[INPUT-CHANGED-TELL]` rides with it. **The behaviour he agreed to, step by step — D757: the note's §7. Who reviews — D758: Fable, on his word, reads the plan before any build and the finished code; one ChatGPT reader when ChatGPT is back — not before 1 Nov 26 (D761; `[NO-ASTRA-LIST]`).** **THE SURVEY IS DONE, AND HIS ANSWERS TO IT (11 Oct 26):** the survey — `raptor-port/docs/superpowers/specs/2026-10-11-all-avail-as-member-survey.md`; **D759** — the stored shape is confirmed now that he has its cost, built in steps, the first changing nothing on screen (its ten "follows by itself" readings are in its full row); **D760** — a CX on a row that came from an input cancels the INPUT (the Inputs calendar shows it, his bell tells him, it moves with the input; the red box and "information only" go with the input too, shown on the schedule only). **D762** — shown three ways on the app's real screens (`raptor-port/docs/mock/one-rule-oil.html`), he chose ONE OIL answer for everyone in an input, given by whoever filed it or an admin: no man gives his own, the filer does not pick people out, only the scheduler leaves one person out, in OIL Earn on the day. **FABLE HAS READ THE PLAN (D758) — "the bet itself is sound", clean with sixteen exact changes, all taken: the plan is VERSION 2** (`raptor-port/docs/superpowers/briefs/2026-10-11-reads/one-rule-plan-fable.md`). **D763** — a person who is in a shared input he did not file does not add anyone to it (the filer or a scheduler does). **D764 — THE BUILD MAY START, on Fable's read alone, in the plan's eight steps on `claude/all-avail-as-member`; at the merge he decides whether to wait for a ChatGPT read of the finished code.** Nothing of the design is waiting on him. The plan: `raptor-port/docs/superpowers/plans/2026-10-11-one-rule-plan.md`. How it got here, in order: **RULED 11 Oct 26 — D750: *"leave it for now, plan idea 1 after the merge"*. D745 stands as built; this is the job to PLAN next for it.** It began as a question of his. Shown the pictures of an ALL AVAIL puck on a shared input's row coming off with the first man filed (D745), he asked why it must be tied to a man at all, then: *"What if the several people allows all avail/all pucks to be selected. Will it solve the problem to become 1 behaviour."* and *"what if u keep the existing different OIL choice selection to be the same?"* **What it would mean:** ALL AVAIL (or ALL) becomes a MEMBER of the shared input with a request of its own — the app already has an input filed for a placeholder (`[INPUT-ALL-AVAIL]`, D700, D702, D711; `raptor-port/src/engine/inputs.ts placeholderProblem`), today only on its own. A puck dropped on the one row would add it to the input and a puck taken off would take it out, exactly as for a named man (D734) — one behaviour from the schedule and from the input's window; its OIL record and the scheduler's switch-offs would be filed with ITS request, so no man's leaving touches them and nothing has to be carried across. **What stands in the way, to settle in a plan (told to him, 11 Oct 26):** (1) the rule "a placeholder is filed on its own — never a group member" (rule (c) of `placeholderProblem`, set by both readers of that plan) would be lifted, with every place that reads a group's members taught that one of them may be nobody (the bells, the clash checks, the Inputs calendar's names, the one row's lead); (2) a placeholder input is ONE day and six kinds (D711 (3), D712, D713) while a shared input may run several days and be of other kinds; (3) OIL's default would change for that puck: a puck dropped on a row earns by default (D43, D46), a placeholder input follows the filer's OIL answer (D711 (1)) — his to choose; (4) it is OIL and the published day: an important plan, two readers, a FULL check. **The smaller alternative he was also told:** when the scheduler takes the first man off ON THE SCHEDULE, the app puts the puck straight back on the row in the same step (Fable's candidate E (ii), sound) — but from the input's window it would still come off, two behaviours. **HIS ANSWERS, 11 Oct 26 — D753 (*"1. Yes. 2. Yes single day only 3 as recommended."*):** the men behind the puck follow the OIL answer given for the input, the scheduler still switching any one man; offered only on a single-day input; ALL or ALL AVAIL, never both. The design note that holds them and what is still open: `raptor-port/docs/superpowers/specs/2026-10-11-all-avail-as-member-design-note.md`. **Still his, not ruled:** whether an ALL AVAIL the scheduler drops on a ONE-person request's row should become part of that input too (today it does not — the note's §3). **Next:** the written plan from that note, on `claude/all-avail-as-member` (cut from `main` after pull request #490); two readers where two are to be had (D590) — ChatGPT is back on 14 Oct 26; its own FULL check. Until it is built: as built (D745).


*Moved here 2026-10-13 by backlog-archive.mjs ([OIL-ASK-LIST-SEVERAL]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/feature-impact.md`.*

### [OIL-ASK-LIST-SEVERAL] The "OIL?" sign for an input nobody has answered for — RULED D777, BUILT 12 Oct 26 on `claude/all-avail-as-member`, not live until its "merge live"
**BUILT 12 Oct 26 as drawn — it leaves for the archive with `[ALL-AVAIL-AS-MEMBER]` at the merge.** The tag on the input's card (the opened day; the List on a phone), the desktop List's button for an input of several too, nothing on the month's bars; shown to whoever the input's window offers "Answer…" to. `--warn`, the colour the List's button named and nothing defined, is written as the white outline he approved. Detail: `raptor-port/docs/ui-contracts.md` (the dated note of 12 Oct 26), `raptor-port/docs/feature-impact.md` (the "OIL?" sign). *As it was filed:*
**ANSWERED 12 Oct 26 — D777 (*"Oil pictures looks good"*): APPROVED AS DRAWN, TO BUILD** — the pictures `raptor-port/docs/mock/2026-10-12-oil-ask/` are the design of record (script `raptor-port/scripts/handpass/onerule-mock-oilask.mjs`): an outlined "OIL?" tag on the card's top line, left of the hours (the opened day; the phone's List), the desktop List's "OIL?" button for an input of several too, nothing on the month's bars; shown to whoever may answer. A failing test first; its own short look at both sizes. (The helper that drew it noted the real button is white only because its style names a colour, `--warn`, that is defined nowhere — settle that at the build.) *As it was put:* After a scheduler puts someone into a member's input and closes the OIL question, the filer may no longer answer (D755 (3)) and nobody's bell asks it — as he was told (D762 reading 3: "the scheduler sees no OIL answer on the day and answers as an admin may"). The Inputs List draws its "OIL?" sign only for an input of ONE person (D762: an input of several gives its answer in its window), so the List says nothing of it; OIL Earn and the input's window do. *Recommended:* the same "OIL?" sign on the List's row of such an input, for whoever may answer it. The walk's rows: A8, H4, H7 (`raptor-port/docs/handpass/2026-10-12-one-rule.md` §8, §11 Q1).


*Moved here 2026-10-13 by backlog-archive.mjs ([INPUT-CHANGED-TELL]). Forward facts: `raptor-port/docs/superpowers/plans/2026-10-11-one-rule-plan.md`, `raptor-port/docs/ui-contracts.md`.*

### [INPUT-CHANGED-TELL] Nobody is told when someone else changes his input (found 11 Oct 26, planning `[GROUP-INPUT-ONE-ROW]` — a question for him)
**BUILT 12 Oct 26 on `claude/all-avail-as-member`, as step 7 of the one-rule job (D755 (3), D760, D769) — not live until that branch's "merge live":** the bell lists a notice for everyone in a changed input and whoever filed it; what was built and where it left the plan's letter: `raptor-port/docs/superpowers/plans/2026-10-11-one-rule-plan.md` §10, Step 7. This item leaves for the archive with `[ALL-AVAIL-AS-MEMBER]`. *As found:*
**Found, NOT BUILT — his to place.** A scheduler who re-times a member's request from the schedule (D739, D740), takes it off the programme, or takes a man out of a shared input (D734) leaves two traces only: the line in the change history, and the card's small print ("changed by …"). The bell has four sources — an access request, a bug report, his own unanswered OIL question, the hand-set light — and none is this (`raptor-port/src/ui/topbits.tsx bellOn`). **To put to him:** should the member's bell tell him when someone else changes or removes an input of his? Recommended: yes, as its own small job after this one — the more so now that a time typed on the schedule changes his request itself. **Place:** his.


*Moved here 2026-10-13 by backlog-archive.mjs ([PERSONAL-SEVERAL]). Forward facts: `raptor-port/docs/handpass/2026-10-12-one-rule.md`, `raptor-port/docs/file-map.md`.*

### [PERSONAL-SEVERAL] A Personal input may hold several people — RULED D776 (12 Oct 26, "A2 B2") and D778; BUILT 12 Oct 26 on `claude/all-avail-as-member`, not live until its "merge live"
**BUILT 12 Oct 26 (the one-rule job's check, its last round) — it leaves for the archive with `[ALL-AVAIL-AS-MEMBER]` at the merge.** A Personal input holds several people and, on a one-day one, ALL AVAIL / ALL; a puck dropped on its row joins, replaces or swaps as on any input's; a member files it for others under the same switch; it asks no OIL question and earns nobody anything — the men behind its ALL AVAIL are counted, listed and frozen at publication (`raptor-port/src/engine/oilev.ts`, the membership-only pass, back). The withdrawn sentence is refused nowhere. Its tests and what was re-expressed: `raptor-port/docs/handpass/2026-10-12-one-rule.md` §10c; the rules: `raptor-port/docs/engine-rules.md` (the dated notes of 12 Oct 26). *As it was filed:*
**RULED 12 Oct 26 — D778 ("Personal is not work" / "all avail all can go on personal. A member can file a personal input for other as well"): the same as an Event for everything about people, and still not work — build it with D776; the picker offers ALL AVAIL / ALL for a one-day Personal input (D712 narrowed), `placeholderProblem` takes Personal among its kinds, a member may file it for others under the switch (`perms.ts filedForOther` kinds), no OIL question. The paragraph below is how it was first put, kept for the record.** **HIS FURTHER WORD, 12 Oct 26, NOT YET RECORDED AS A RULING — the chat that heard it was full; the next chat confirms the one open point with him and then records it (a new D-number, narrowing D712 if ALL AVAIL is included):** asked whether a member may file a Personal input for other people, he wrote *"How about just make personal the same as event etc. like the questions u had just now will be answered"*. Told back to him as the agent's reading and recommendation: the same as Event for everything about PEOPLE — several people, a member may file it for others while the switch is on, a drop joins or swaps, ALL AVAIL / ALL allowed on a one-day one — while it stays what makes it Personal: NOT work (no OIL question, earns nothing, not counted in work hours). **The one point to confirm with him: does it stay "not work", or should it ask the OIL question as an Event does?**
**Until it is built the app refuses a second person on a Personal input** ("A Personal input is one person’s own") at the window’s save, the row’s "+ add" and — since the check — a drop on its one person’s puck. **The build, a failing test first:** `raptor-port/src/engine/inputs.ts shapeProblem` loses its Personal rule (`personalKind`, `PERSONAL_OWN` go if nothing else reads them); `raptor-port/src/ui/reqdoor.ts rowPut` loses the refusal the check added; the picker offers people for a Personal input and still greys ALL AVAIL / ALL with its reason (D712 stands); the tests that pin the refusal are re-expressed to the new ruling, each saying so (`ui/reqdoor.test.tsx`, `engine/phmember.test.ts`, `ui/phmember.test.tsx`, `ui/oilpersonalcrowd.test.tsx`); the documents that state the old rule corrected in the same change (D201 — search "one person’s own" in `raptor-port/docs/engine-rules.md`, `ui-contracts.md`, `data-model.md` §11, the plan’s §4.1 and §4.4). **To put to him at the build:** may a MEMBER file a Personal input for other people, or only an admin / scheduler (today members file for others only duties and commitments — D655)? **Its check:** a short walk — a Personal input for three on every surface, the picker, a drop that joins and one that swaps, a member’s face.


*Moved here 2026-10-13 by backlog-archive.mjs ([OIL-ASK-NOTIFY]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/handpass/2026-10-13-oil-ask-notify.md`.*

### [OIL-ASK-NOTIFY] A day made a holiday afterwards: tell the schedulers which inputs now need an OIL answer; a swap's OIL question cannot be left open — DIRECTED D780, ANSWERED D781 (12 Oct 26), THE PICTURE APPROVED AS RECOMMENDED — D783 (12 Oct 26); BUILT AND FULL-CHECKED 13 Oct 26 on `claude/oil-ask-notify` — HIS "MERGE LIVE" GIVEN 13 Oct 26 (D791): pull request 492 is merged once its checks are green
**BUILT 13 Oct 26 (Opus 5.5), on Fable's read of the plan (D784) — FULL-CHECKED THE SAME DAY:** walked (five walkers, 67 lines — seven faults fixed), break-tested (131 runs — 27 wires given a test), its finished code read by Fable (D784) and by a fresh Opus reader (the one test of D789 — twelve claims, ten fixed, one filed, one a record), the fixes re-walked (22 lines, no fault), the whole gate set in one run. **Owed: his look (the sheet's look card), and at the merge his word on waiting for a ChatGPT read (D764, `[NO-ASTRA-LIST]`).** What was built and what was checked: the evidence sheet `raptor-port/docs/handpass/2026-10-13-oil-ask-notify.md`; the rules it keeps, one line each: `raptor-port/docs/superpowers/specs/2026-10-12-oil-ask-notify-behaviour-register.md` (ON1–ON16); the screens: `raptor-port/docs/ui-contracts.md` §The OIL question comes before the change; what it touches: `raptor-port/docs/feature-impact.md`. Two things the build read for itself, to tell him (the sheet §10): the same rule at the Unavailable row's drag and the Inputs calendar's date drag; "the schedulers" are the people with an admin sign-in.
**THE PLAN (12 Oct 26, Opus 5.5; read by Fable before the build — D784):** `raptor-port/docs/superpowers/plans/2026-10-12-oil-ask-notify-plan.md` — what is built today, the design in three parts (the question first and the write only on an answer; the one list; the holiday's notice and the bell), the build's steps each with a failing test first, and the readings to tell him.
**ANSWERED 12 Oct 26 — D783 (*"Yes to all"*): EVERY RECOMMENDATION TAKEN — THE PICTURES ARE THE DESIGN OF RECORD; AND D784 (*"2 yes"*): FABLE READS THE PLAN BEFORE THE BUILD AND THE FINISHED CODE, the ChatGPT read it goes without on `[NO-ASTRA-LIST]`.** So: a swap or an add that raises the OIL question is NOT MADE until it is answered ("Don't swap" / "Swap"); not answered, nothing moves, both pucks flash and a bar stays ("Not swapped — OIL not answered" · Answer OIL · OK); the ONE list opens by itself when the holiday is saved; one bell line a holiday, counting what is left. *As it was put to him:* the page `raptor-port/docs/mock/oil-notify.html` (published to him as an Artifact page), its pictures `raptor-port/docs/mock/2026-10-12-oil-notify/`, drawn by `raptor-port/scripts/handpass/oilnotify-mock.mjs` on the real screens, a phone and a desktop (the swap a real drag, the holiday really added; the proposed words and marks from the app's own classes; tidied once with the Impeccable guide at his word). **The six points, each answered as recommended (D783):** (1) the swap — A, it WAITS for the answer (nothing moves until Yes or No; "Don't swap" / "Swap") or B, made at once and taken back ("Take the swap back"): *A recommended* — the same end he ruled (D781: no answer, no swap, and the app says so) with no puck moving and moving back, no bell line to a man for a swap that did not stay, no sign-offs dropped on a published day (the agent's reading of D103 and D755 (3), not yet tested); (2) the moment after — 1 a passing note and both pucks flash, 2 the flash and a bar that stays ("Not swapped — OIL not answered" · Answer OIL · OK), 3 a note and both rows outlined: *2 recommended*; (3) a person ADDED with no answer yet is treated the same ("Not added — OIL not answered"); (4) nobody else is told when a swap is not made; (5) the ONE list opens by itself when the holiday is saved, with "<name> is now a public holiday." above it — the agent's reading of "if the admin already answers for everyone"; (6) one bell line a holiday, counting only what is left, a tap opening the list. **Seen while drawing (real, as built):** after a day is made a holiday another scheduler's bell says "Nothing new" — the silence D780 names; the demo's own overseas duty on that day asks the question too, so the example counts four inputs, not three. **The list as drawn:** one line an input on the input's own card, "Yes · FO" / "Yes · HO" and "No" (a chosen No in quiet grey), "Yes to all" / "No to all" on the count's line, "Later" and "Save", "What is left goes to the schedulers' bells"; no "OIL?" tag inside the list.
**ANSWERED 12 Oct 26 — D781:** (1) the admin declaring the holiday is told at once and what he answers there needs no notification to anyone else; only what is left unanswered goes to the schedulers' bells (one line a holiday) and to whoever answers for each input. (2) The OIL question a swap or an add raises cannot be left open: not answered, the swap is taken back, and the app says so plainly — *"it's hard to see a swap back as the pucks looks pretty similar"* (D783: it is not made at all until the question is answered). **AND D782 (the same hour):** the admin answers a day's open OIL questions from ONE list — every input of that day that needs an answer, each with its Yes and No, and a "Yes to all" and a "No to all" — drawn in the same picture. **NEXT STEP — A PICTURE, before any build (D541):** on the app's real screens, phone and desktop: the OIL question a swap raises with its way out worded as taking the swap back; the moment after it is taken back (the note, and whatever makes the put-back visible on the row — draw two or three ways); the holiday form's "these inputs now need an OIL answer" with the answer offered there; the scheduler's bell line. As an Artifact page, sharp, tap to zoom. The two points below are as they were put to him.
**His direction (D780):** *"There should be a notification to the schedulers to award oil on those inputs. And should not be silent."* Today, when an admin makes a day a public holiday (the "Calendar…" window's Holidays list, or the Leave War's Event row) the inputs already on it gain an OIL question nobody has answered: each input's own person, or its filer, is asked by his bell (`raptor-port/src/leavewar/sync.ts oilPendingFor`), the admin sees the "OIL?" tag (D777) — and nothing tells a scheduler it happened. **Two points he asked the agent's view on, NOT RULED — put to him with these recommendations:** *(1) who is told* — the admin at the moment he declares the holiday ("3 inputs on this day now need an OIL answer", with a way to them), and every scheduler's bell with ONE line a holiday, a tap opening the Inputs List on those inputs; the people who answer are already asked; a man merely in a shared input is not (he has no answer to give — D762). *(2) the swap* — his "maybe u shouldn't allow the person to cancel the oil question until answered": recommended YES, as "Cancel takes the swap (or the add) back", so no door leaves an input unanswered — the same rule the save already keeps; it changes D755 (1)'s reading R18 and leaves the holiday as the one way a question opens by itself. **The build, once he answers:** a notice kind of its own (`raptor-port/src/state/notices.ts`), made inside the holiday's own command (`raptor-port/src/leavewar/state/store.ts holidayAdd` / the Event row's writers) so Undo takes it back; the row's door (`raptor-port/src/ui/reqdoor.ts replace`, `join`) for point 2; a failing test first; its own check (OIL — FULL). **Place:** his — the agent's suggestion: the next Inputs / OIL batch, before the look-and-feel pass.


*Moved here 2026-10-13 by backlog-archive.mjs ([OPUS-READ-TRIAL]). Forward facts: `raptor-port/docs/bug-check-order.md`.*

### [OPUS-READ-TRIAL] Can Opus hold up as a code reader alone? — a blind Opus read beside the independent reader, on jobs the agent picks (his word, 13 Oct 26 — D788) — FINISHED, ANSWERED BY D790

**His words:** *"We test more to see if opus can hold up alone. Don’t test on Things that are too token intensive. U make the call. But u can also try to test it when the task are complicated and complex"*. The rule and the agent’s readings: D788’s full row; the method: `raptor-port/docs/bug-check-order.md` §4.

**The running table — one row a job (add a row at each trial’s close):**

| Job | The independent reader found | The blind Opus reader found | Each missed | False alarms | Tokens | Sheet |
|---|---|---|---|---|---|---|
| `[ALL-AVAIL-AS-MEMBER]` (12 Oct 26) | Fable, first read: 4 faults (1 a regression); its third read: 1 more, in one of the fixes made for Opus’s claims | 11 claims: 3 already known, 8 new — all 8 real once each was written as a failing test | Fable missed the 8; Opus missed 5 of the 9 faults already known from Fable and the walk | Opus 0; one of Fable’s negatives was disproved by the walk | Fable 808k + 443k; Opus not measured | `raptor-port/docs/handpass/2026-10-12-one-rule.md` §10, §10b |

| `[OIL-ASK-NOTIFY]` (13 Oct 26) — the ONE test of D789, same brief, blind to each other | Fable: 3 real faults, all low (1 found by it alone) | 11 real faults in eight findings — 1 medium (the screen showing a change that was not made) — and 1 older, filed; 9 found by it alone | Fable missed 9 and called three of them sound; Opus missed 1 (the Unavailable row’s tap dropping its ring) | 0 and 0 | Fable 478,816; Opus 610,259 | `raptor-port/docs/handpass/2026-10-13-oil-ask-notify.md` §12 |

**D789 (13 Oct 26 — "Just test it once and ask me after we get the results to know how we go from here."): ONE test, on `[OIL-ASK-NOTIFY]`; no further trial before his answer. To put to him with that result:** does an Opus read stand as the job’s code read where no ChatGPT reader and no Fable read is available — and on which kinds of change. **Place:** his word — at the close of `[OIL-ASK-NOTIFY]`’s check.

**ANSWERED 13 Oct 26 — D790 (*"Yes option 2"*, of three put to him with the table above: 1 an Opus read only; 2 an Opus read on every job that needs a code read, Fable added only on the riskiest; 3 both every time):** every job that needs a code read gets a FRESH, blind Opus read of its finished code; Fable reads it as well only on the riskiest changes — OIL, published days, who may do what, saved data. The rule and the agent’s readings: D790’s full row; the method: `raptor-port/docs/bug-check-order.md` §4 ("Who reads the finished code now"). D788 and D789 are in `DECISIONS-ARCHIVE.md`. No further trial. **This item is finished:** it leaves for the archive at the next handoff, its two tables with it.


*Moved here 2026-10-13 by backlog-archive.mjs ([WALK-FINGER-NOT-LOCATOR]). Forward facts: `raptor-port/docs/bug-check-order.md`.*

### [WALK-FINGER-NOT-LOCATOR] Two lines for the checking guide, from his find of 10 Oct 26 — a proposal, NOT yet in the guide
**Status: PROPOSED — a change to a working guide is read by Astra and Sol 6.1 before he approves it (D70); nothing in `raptor-port/docs/bug-check-order.md` is changed.** His find (the List's dates calendar drawn below the foot of a phone's screen — `raptor-port/docs/handpass/2026-10-10-list-dates-picker.md` §1) passed a FULL check the night before: four browser tests and every walker pressed that calendar with a scripted press that scrolls its target into view first, so the buttons worked and nobody saw that a person could not find them. **Proposed line 1 (§7.2, beside "the driver moves the view the way a person does"):** on a phone, a pop-up, menu or window that a press opens is proved ON SCREEN before anything in it is pressed — the page not scrolled by the script, the pop-up's box inside the screen, a finger at a point on it meeting it — and its controls are then pressed at a point; a scripted press that scrolls first can hide a pop-up nobody could find. **Proposed line 2 (§6, the roll-call):** a build that REMOVES something from a page lists what moved because of it — everything that stood below it — and every pop-up on that page placed against the screen rather than against its own button. **Until it is read and approved** the two are followed by this branch's own tests (`raptor-port/e2e/inputs-calendar.spec.ts`, "the dates button opens its calendar on screen") and nothing else is claimed. **Place:** the agent's — with the next change to the checking guide, one round each by Astra and Sol 6.1, then his approval.


*Moved here 2026-10-13 by backlog-archive.mjs ([METHOD-LIT-COLOUR]). Forward facts: `raptor-port/docs/bug-check-order.md`.*

### [METHOD-LIT-COLOUR] The checking guide gains a line from his find of 11 Oct 26: a mark's COLOUR is checked per man, on a day that mixes levels (owed — a guide change, read by Astra and Sol first, D70)
**Owed, NOT made.** On 11 Oct 26 he found, on his phone, that a day's open issues list lit every man it named in the day's worst colour — older than any walk (31 Jul 26), fixed on `claude/group-input-one-row` (`raptor-port/docs/handpass/2026-10-11-group-input-one-row.md` §14). Every defect he finds costs the method a line (`raptor-port/docs/bug-check-order.md` §11). **The line proposed, for the two readers:** in §7.1's everything-day, "a day whose issues list mixes all three levels — a red item, an amber one and a note — with a man each names alone"; and under anti-pattern 21 (the picture taken, not looked at), "a mark with more than one colour is asserted per man as PAINTED — its computed colour against that man's own item — never only that the mark is on". **Why not made with the fix:** a change to a working guide is read by Astra and Sol 6.1 before he approves it (D70), and his ChatGPT allowance is out until 14 Oct 26. **As filed:** small; do it with the next guide change after 14 Oct.


*Moved here 2026-10-13 by backlog-archive.mjs ([SKILL-OBS-REVIEW]). Forward facts: `.claude/skills/TASK-OBSERVER-VENDORED.md`.*

### [SKILL-OBS-REVIEW] Review the skill-observation backlog — he asked for it "soon" (8 Oct 26)

Told that the observation backlog had not been reviewed since 24 Sep 26 (about 200 open entries in
`.claude/skill-observations/log.md`), he said: *"Yeah we should review the skill soon too"*. **To do:** run the review as
its own job, in a fresh chat, documents only — the way this repo runs it is `.claude/skills/TASK-OBSERVER-VENDORED.md`
and the skill's `references/weekly-review.md`; a change to a working guide that comes out of it is read by Astra and
Sol 6.1 before his approval (D70), and merges only on his "merge live". **Place:** his "soon" — offer it at the next
handoff; it needs no code and can run beside the calendar job in its own worktree on `main`.

**HIS WORD, 13 Oct 26 — D794 (*"1"*, of three orders put to him): it is run NOW, in its own documents-only chat, beside the
Calendar-on-a-phone job (`[CAL-PHONE-SWIPE-FIT]`, D786) — neither waits for the other.** About 270 notes are open (541 is
the newest). **To put to him before any guide is changed (asked 13 Oct 26, not answered):** who reads the guide changes
that come out of it while Astra and Sol 6.1 are out (D70) — A, Fable on his word, the missing ChatGPT read on the one list
(`[NO-ASTRA-LIST]`) — recommended; or B, every guide change held unmerged until ChatGPT is back.

**ANSWERED 13 Oct 26 — D810 (*"u can use opus to do the review solely"*): neither A nor B — Opus alone.** Opus runs the
review, and the guide changes it drafts are read by ONE fresh, blind Opus reader (an Opus that did not write them) before
he approves them; Fable is not called; the two ChatGPT reads it goes without are on `[NO-ASTRA-LIST]`. **IN HAND on
`claude/skill-observation-review-258b48`** (its block in `HANDOFF.md`): 272 notes open at the start (120 to 541).

**DONE 13 Oct 26 — approved by him (D811, *"Approve all"*) and installed on the branch; live on his "merge live".** All
272 notes dispositioned: 264 closed as carried (a guide, a memory note, a filed job, or already written), 6 closed with
no change on his word, 2 left open on D73 (120, 122). 24 files changed and two guides added —
`raptor-port/docs/walk-scripts.md` and `.claude/skills/brainstorming/mockups-on-the-real-app.md`; what each skill
gained is listed in `.claude/skills/SUPERPOWERS-VENDORED.md` change 5 and `.claude/skills/TASK-OBSERVER-VENDORED.md`
§Local changes. The fresh Opus reader's report (REVISE, 21 items — 20 taken, one answered by him) and the table of all
272 notes are in git history (commit `75d5564d2`, `.claude/skill-updates/2026-10-13/_review/`). Filed from it:
`[SHELL-SCRIPT-GUARD]`, `[CHECK-TOOLS-HARDEN]`, `[HWW-RULINGS-SIZE]`. The resolved notes:
`.claude/skill-observations/archive/log-2026-10-13.md`.


*Moved here 2026-10-13 by backlog-archive.mjs ([OIL-ACCEPT-BACK-UNASKED]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [OIL-ACCEPT-BACK-UNASKED] An input put BACK on the programme after its day became a holiday comes back with no OIL answer and nobody asked (the Opus read of `[OIL-ASK-NOTIFY]`, 13 Oct 26 — OLDER) — OPEN

**Found by reading, NOT FIXED — older than that job, low.** An input is taken off the programme (its card’s ✕); its weekday is then made a public holiday — the one list and the schedulers’ bell line leave it out, rightly (it is off the programme), and if it was the only input on the day nobody is told at all; a scheduler later puts it back (Accept on its card, or Undo of the take-off). It now needs an OIL answer; the scheduler is asked nothing. It is not silent — its card wears "OIL?", it is on the one list the moment it is back if the holiday’s line exists, and the bell of whoever answers for it lights — but the Accept itself puts no question (`raptor-port/src/ui/interactions.ts` Accept → `engine/slots.ts acceptInput`). **Recommended:** at Accept, where the input now needs an answer and the reader is a scheduler, put the question FIRST and put it back only on an answer — the rule of D783, at one more door (a failing test first; its own short look). **ANSWERED 13 Oct 26 — D793 (*"Yes it should wait on it"*): the Accept waits on the question as a swap does — the question first, put back only on an answer; an Undo of the take-off asks nothing (the agent's reading). TO BUILD.** **Place:** the agent’s — with the next Inputs / schedule batch (D490). The read: `raptor-port/docs/superpowers/briefs/2026-10-13-reads/oil-ask-notify-code-opus.md` F7; the check’s record: `raptor-port/docs/handpass/2026-10-13-oil-ask-notify.md` §12 C11.


*Moved here 2026-10-13 by backlog-archive.mjs ([HIST-DOT-INPUT-ROW]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [HIST-DOT-INPUT-ROW] History's gold dot is not drawn on an input's Ground Programme row for a person put in or taken out (the one-rule job's walk, share L — L13, 12 Oct 26)
**Found, NOT FIXED — low; with the next Inputs / History batch.** With History on, a man added to an input by a drop on its row, or taken out by a right-click, leaves no gold dot on that row — not on his puck, the row's name or its boxes. The changes window lists both acts, names him, and a tap lands on his puck (fixed in the check — `raptor-port/docs/handpass/2026-10-12-one-rule.md` §9.6); the Unavailable list's rows and the one line under Personal Inputs do wear the dot. **Why:** those acts are lines of the INPUT (filed by its id), and the dot's painter marks a programme cell only for a line filed by that cell's own key (`raptor-port/src/ui/histbubble.ts refreshHistDots`, `storyOf`). **The build:** a cell of a row that came from an input also answers for the input's lines about the person standing on it — the dot, and the bubble's story; a failing test first (`src/ui/histjump.test.tsx` has the pattern).


*Moved here 2026-10-13 by backlog-archive.mjs ([SCHEDULER-RULINGS-SIZE]). Forward facts: `.claude/rules/decisions/inputs.md`.*

### [SCHEDULER-RULINGS-SIZE] The scheduler's rulings file has reached the size D611 said to look again at — one file, or an area of its own for the Inputs pages? (11 Oct 26 — a question for him)
**ANSWERED 13 Oct 26 — D802 ("All as recommended"): the Inputs pages get a rulings file of their own. DONE the same night** on `claude/inputs-rulings-file`: 104 rulings moved whole by the script to `.claude/rules/decisions/inputs.md` (their full rows beside it), 215 stay in the scheduler's file, which points at the new one; each file's size marker set; read by a fresh, blind Opus reader (`raptor-port/docs/handpass/parts/rulings/read-opus.md`).
**Due, not decided.** On 7 Oct 26 he ruled the scheduler's rulings stay in ONE file, not split by screen (D611): the saving was not worth the risk of a ruling sitting in a part that was not loaded — "look again only if that file grows by about half again". It has: `.claude/rules/decisions/scheduler.md` crossed its marker of 100,000 bytes with D753 (11 Oct 26). What grew it: the Inputs and SANS calendar jobs, the input card, ALL AVAIL inputs and the shared row — about 130 rulings in four days, nearly all about the Inputs pages. **The two ways:** (1) keep one file and raise the marker — every scheduler job goes on loading all of it (about 25 thousand tokens now), and nothing can be missed; (2) give the Inputs pages (the Inputs calendar and list, the SANS calendar, an input's window and card) an area file of their own, loaded by itself with those screens' files and named in the scheduler file's "Also read" for the rulings that reach the schedule (the shared row, ALL AVAIL) — a scheduler-only job loads roughly half as much, at the risk D611 named. **The agent's recommendation:** (2), with the paths chosen generously (D68: a ruling missed costs more than one loaded) and the shared-row and ALL AVAIL rulings KEPT in the scheduler's file. **Until he says:** the marker was raised by 3,000 bytes with its reason (`raptor-port/scripts/docsize.mjs` `RULING_BYTES`) — room for rulings made meanwhile, not an answer. Done by `backlog-archive.mjs --rulings --move-rows`, in a docs-only change read by one reviewer (D138).


*Moved here 2026-10-13 by backlog-archive.mjs ([TRK-DLG-FOCUS-UNSTEADY]). Forward facts: `raptor-port/docs/tracker/known-gaps.md`.*

### [TRK-DLG-FOCUS-UNSTEADY] A Tracker unit test of the question box's keyboard fails now and then in a full run (found 7 Oct 26)

**Found, not fixed** — by the Inputs / SANS calendar chat (`claude/inputs-sans-calendar`), which touched nothing of the Tracker. In a full unit run under the PC lock (7 Oct 26, 506 files, 8,186 tests) ONE test failed: `raptor-port/src/tracker/leftovers.test.tsx`, "[TRK-DLG-LEFTOVERS] B1 — while a question is up, the rest of the Tracker page is inert, and Tab / Shift+Tab stay inside the box" — its last check, "Shift+Tab from the first goes to the last", found the focus still on the text box. Run alone straight afterwards it passed three times out of three (53 of 53), and the full run of that morning passed it. **Seen again 8 Oct 26, night** (the same chat, step 5): the same check failed in ONE of three full runs that evening (9,293 tests), and passed alone twice. So it depends on timing or on what ran before it in the same worker, not on the app's rule. **To do, with the next Tracker batch (D490):** read how the test moves focus (a key event sent before the box has taken focus is the likely cause), make it wait on what it needs rather than on timing (D87's rule for browser tests, applied here), and run the file fifty times in a loaded run to prove it. Until then: a red full run whose only failure is this test is re-run once for that file, and said so in the report.


*Moved here 2026-10-13 by backlog-archive.mjs ([LW-ROWS-SPLIT]). Forward facts: `raptor-port/docs/file-map.md`.*

### [LW-ROWS-SPLIT] The Leave War's row drawing moves out of its grid file — APPROVED D493 (2 Oct 26), to build with the next Leave War batch
**DONE 13 Oct 26** on `claude/lw-rows-split` (his word to start: D799): 507 lines moved by a script to `raptor-port/src/leavewar/ui/MatrixRows.tsx`; proved a move line for line, by a record of every row made before it, and by recording the built app before and after (8 views identical byte for byte); read by Fable and a fresh Opus reader. Its check: `raptor-port/docs/handpass/2026-10-13-lw-rows-split.md`. Filed by it: `[LW-MONTH-MEMO-UNPINNED]`, `[LW-ROWS-STALE-NOTES]`.
**D775 (12 Oct 26) - the Tracker tidy-up: done AFTER the one-rule job is merged, as a job of its own - not with its area’s feature batch (D493 narrowed) - started on his word, in a chat of its own.**
From Astra's tidiness read (its §1 — read it before building: what must stay identical, the tests that pin it, the test to
write FIRST). `PersonRow`, `PersonMonth`, their props and row-only predicates leave `src/leavewar/ui/Matrix.tsx` (about 4,700
lines) for a new `MatrixRows.tsx`; the grid file keeps its state, geometry, selection and sheets. Nothing on screen changes.
New file → `docs/file-map.md` in the same change. Tier by the order's questions at build time (Astra says FULL: permissions
and the OIL display are drawn there). **Place — D493, D485: with the next Leave War feature batch, never alone.**


*Moved here 2026-10-13 by backlog-archive.mjs ([UNAVAIL-FILE-OIL-ASK]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [UNAVAIL-FILE-OIL-ASK] "→ Unavail" puts the OIL question first, as "Accept" does (his ruling D804, 13 Oct 26) — BUILT on the Inputs batch's branch, waiting for his look and "merge live"
**AND, the same afternoon — D814 ("Canceled input doesn’t need to ask OIL"):** a cancelled input, and an information-only one, is never asked — no door prices a question for it and it wears no "OIL?" sign, stands in no list and lights no bell (`oilNeverEarns`, `oilSilent` in `raptor-port/src/engine/inputs.ts`). Built on the same branch; the sheet's §14.

**Answered and built.** Put to him three times in one morning — the first time badly, with no example: (1) "should '→ Unavail' ask too?" → *"Unavail will not earn oil. So why ask oil question?"*, then *"Means that everything in medical and leave inputs will not earn oil"* (D803); (2) with an example, "should an Other filed under Unavailable earn nothing, like leave?" → *"Disregard my unavailable statement on OIL. As long as leave and medical they don’t earn oil. For others just ask the OIL question, it may or may not credit OIL."* — **D804**, which replaces D803: leave and medical never earn and are never asked; every other kind that can earn is asked and its answer decides, wherever it is filed. So an Other filed under Unavailable goes on earning on its Yes and asking while unanswered (as built — nothing changed), and the button "→ Unavail" now puts the question first where the input needs an answer (`raptor-port/src/ui/interactions.ts`, a fifth kind of wait `file` in `raptor-port/src/ui/oilwait.ts`; "Don’t file" / "File" / "Not filed — OIL not answered"). The agent's reading of "just ask the OIL question" — told to him, his to overrule. Its check: `raptor-port/docs/handpass/2026-10-13-inputs-batch.md` §14. Ruling: D804.


*Moved here 2026-10-13 by backlog-archive.mjs ([BELL-UNAVAIL-WORDS]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [BELL-UNAVAIL-WORDS] The member's bell says "Back on the programme" when his input is filed under Unavailable (found 13 Oct 26 by the Opus read of D804's change) — OPEN, low; two new sentences are his to approve
**APPROVED AND BUILT 13 Oct 26 — D815 ("Yes in 497"):** the two sentences as proposed, "Filed under Unavailable" and "Taken out of Unavailable"; fixed on the Inputs batch's branch, test first (`raptor-port/src/state/notices.ts`; the sheet's §14).

**Found, NOT FIXED — older than the Inputs batch.** A scheduler takes Ranger's "Other" off the programme and files it with "→ Unavail": the scheduler's own note says "Ranger's Range brief filed under Unavailable", but Ranger's bell reads **"Back on the programme"** — it is not; and taken out again his bell reads **"Taken off the programme"** — it was never on it. Because an Other lands on the programme by itself, "taken off" is the only state the button is offered from, so EVERY filing sends the wrong line. Cause: `raptor-port/src/state/notices.ts` — the part that names a change of filing knows only "taken off" against everything else (its `common`, and `partWords`). **The fix:** two more parts — "Filed under Unavailable" and "Taken out of Unavailable", the scheduler's note's own words — tested before the two lines that are there; one test beside the notices' own. **His to approve:** the two sentences (the bell's wording is D769's). With `[NOTES-SHORTER]` (D806), where the app's notes are gone over anyway. The read: `raptor-port/docs/handpass/parts/ib/read-d804-opus.md` (F1).


*Moved here 2026-10-13 by backlog-archive.mjs ([TRK-DATE-BOXES]). Forward facts: `raptor-port/docs/tracker/known-gaps.md`.*

### [TRK-DATE-BOXES] The Tracker's date boxes are the app's own date box and calendar (his ruling D801, 13 Oct 26) — BUILT 13 Oct 26 ON `claude/tracker-date-boxes`, WAITING FOR HIS LOOK AND "MERGE LIVE" AFTER STEP ONE'S

**Built (D801 — "All as recommended"):** all EIGHT of the Tracker's date boxes — Last Flown (Syllabus), Last Flown (Currency), Upchit Date, End date A, End date B, each row of the full failures list, and "Done on" and "Failed on" in the marking pop-up — open the app's one date calendar: a tap picks, saves and closes it; no tick; the pop-up and the failures list stay open under it. The branch is CUT FROM `claude/one-date-calendar-step-one-55ba13` (it needs the calendar) and merges AFTER step one, on his word. Its check (tier WALK, sized small — the host's own scripted walk at a phone and a desktop): `raptor-port/docs/handpass/2026-10-13-tracker-date-boxes.md`. The contract: `raptor-port/docs/ui-contracts.md` §The Tracker tab → Marking; the traps: `raptor-port/docs/tracker/known-gaps.md` (its last section).

**Told to him, not asked (the agent's readings of D801 — his to overrule):** a date is saved the moment it is picked (it was saved when the typed box was left); a box that holds a date carries a small "take this date off" (✕) inside its right end — the app's calendar has no Clear, and an emptied box means something in the Tracker; End date A and B show the date without its weekday (three across, there is no room); the Tracker's other dates stay dd/mm/yy; a date can no longer be typed as figures; **on the two Last Flown boxes the ✕ shows only for a day put in by hand, and taking it off shows the latest flight marked done — blank only where no flight is done (the agent's reading of D123; before, emptying the box left both Last Flown days blank with flights on record)**; two days picked one after the other are two Undo steps.

**Not touched:** the lull periods' own calendar (a range picked on a calendar the Tracker draws itself) — step two of `[ONE-DATE-CALENDAR]` does not name it either; put to him with step two.


*Moved here 2026-10-13 by backlog-archive.mjs ([SKILL-FUSION-JAKUB]). Forward facts: `raptor-port/docs/design-practices.md`.*

### [SKILL-FUSION-JAKUB] ONE design guide of our own, used automatically for interface work — the good practices of three outside design skills combined (his rulings D812, 13 Oct 26: "Can u combine all of the good practices together" · "Yes add it") — OPEN, documents only, NEXT with the design page
**DONE 13 Oct 26 — the guide is APPROVED and LIVE (D819, pull request 500) and the design skill's own record of the app is written from his answers (D820 — `raptor-port/docs/PRODUCT.md`).** What is left is not this job's: the skill's record of the look itself (`DESIGN.md`) is step 1 of `[UI-SLEEK-PASS]`.
**DRAFTED AND READ 13 Oct 26 — in pull request 500, waiting for his read and "merge live":** `raptor-port/docs/design-practices.md`, `.claude/rules/ui-design.md` (it loads itself, and says the design skill is used without being asked for on a design job), a map row, a clause in `AGENTS.md`; one fresh, blind Opus read, thirty wording points taken (`raptor-port/docs/superpowers/briefs/2026-10-13-design-guide-read.md`). **STILL TO BUILD:** the design skill's own record of this app (its `init` step — needs one short round of his answers), so every `/impeccable` reads the guide directly.
**FIRST IN THE ORDER (D813, 13 Oct 26 — "Because that also affects the calendar design"):** this guide is drafted and read BEFORE the interface jobs, which are then judged against it — `[DESIGN-LOOK-13OCT]`, the calendar's step two, `[LOGIC-PAGE-LAYOUT]`, `[UI-SLEEK-PASS]`.
**HIS YES (D812):** the five pieces below are taken, and combined with (a) the seven rules from the Apple design skill of 11 Oct 26 — `[UI-SLEEK-PASS]`'s list, D765 — and (b) the look-and-feel checks he approved on 2 Oct 26 and never yet written into a guide (D489; `[SKILL-FUSION]`, `raptor-port/docs/superpowers/specs/2026-10-02-workflow-skills-fusion.md` §4 and §7 — that part of `[SKILL-FUSION]` is done by this job). **Until it is built none of it is automatic** — he was told so. **The build (documents only, a branch of its own):** (1) the guide itself, a reference document under `raptor-port/docs/` — the rules in our own words, each with where it came from (the MIT sources credited in a vendoring note), and beside each rule the ruling of his that limits it: buttons keep their size (D487), the Raptor look and what its colours mean (D765), a dense screen stays dense (D688, D696), speed over motion; its sections: words on screen · keyboard and focus · layout and grouping · colour and emphasis · motion · small polish · how a look is reported (what was and was not inspected); (2) **automatic, two ways:** a short rule file under `.claude/rules/` scoped to the interface's files (the stylesheets, `raptor-port/src/ui/`, the Leave War's and the Tracker's screens), so it loads whenever one is opened, with or without the design guide being asked for; and the design guide's own project record — it has none today, which is why it starts every session blind (`[UI-SLEEK-PASS]`'s step 1: its `init` and `document` steps) — naming our guide, so every `/impeccable` reads it; a row in the project guide's map; (3) the draft read by one fresh, blind Opus reader (D70; D810's precedent), then his approval of the wording with his "merge live". **The Apple design skill, read again at the source 13 Oct 26 on his word ("Also see what u can learn from this"):** `rukkiecodes/claude-apple-design-system` is unchanged since 11 Jul 26 (MIT; a `SKILL.md`, a checklist and five reference documents — all read this time, the long source document by its headings); the seven rules taken on 12 Oct 26 stand, and two more go into the guide: ONE table that says what each status colour means, kept in one place (theirs is a shop's; ours is CAT, the amendment tags, amber and red warnings, the green OIL edge, the purple "this is you"), and its way of reporting a look — the place, the rule broken, the exact fix. Still not taken: its one-accent light look, pills, large titles and airy spacing (the Raptor look is kept, a working screen stays dense), its phone-app parts, and the program its `SKILL.md` tells an agent to download and run (D623). **What he first asked, and the read:**

**He asked (13 Oct 26):** *"Anyway u can look at this skill and see what we can download or learn from it for UI"* — `jakub.kr/skills`, then `github.com/jakubkrehel/make-interfaces-feel-better`. **Read at the source** (both repositories on GitHub, MIT licence — copying with credit is allowed; 13 skills in the first, one in the second, each a guide of plain rules with a review table; pushed the same day): the writing guide and its patterns, the keyboard-and-focus guide, the layout guide's rules, the second repository's nineteen principles, the "break" guide's steps. **Recommended — as D486 and D491 ruled for the last two collections: install NONE of it whole (it would be a second design guide beside Impeccable, saying some things differently), and take five pieces into our own guides:** (1) **words on screen** — a note in three shapes ("Saving…" → "Changes saved" / "Not saved. <what to do>"), no "successfully", no "please", an error says how to fix it beside where it broke, a button starts with its verb, Undo instead of a question where the thing can be undone: the checklist for `[NOTES-SHORTER]` (D806) and the whole-app words pass (D808); (2) **the keyboard table** — what Tab, arrows, Enter, Space, Escape, Home and End must do in a window, a set of tabs, a menu, a fold and a list; Escape closes whatever opened last; the keyboard goes back to the button that opened a thing; nothing that takes the keyboard is hidden under a bar that stays: the checklist for the keyboard sweep of `[DESIGN-LOOK-13OCT]` (D807) and for calendar step two; (3) **every state of one thing on one throwaway page** (their "break" and "state-machine") — the calendar, a note, the clash strip drawn in all their states side by side, looked at once: a technique for our mock-ups and looks, beside `mockups-on-the-real-app.md`; (4) **layout** — group with space rather than lines, one main button a view, show that more is hidden, fold what is rarely needed: for `[LOGIC-PAGE-LAYOUT]` (D809) and the clutter pass; (5) **small polish to check for** — figures that do not shift as they change (times and counts in columns), a touch target a finger can hit WITHOUT the button looking bigger (D487 keeps the buttons' size), never animating "everything". **Not for us:** converting the colours (the Raptor look is kept, and its colours are measured contracts), font choice (the app loads no fonts), its animation recipes for another toolkit, its translation rules (one language), the technical-drawing skill. **If he says yes:** the five pieces are drafted as changes to our own guides and read before he approves them (D70 — a fresh, blind Opus reader while the ChatGPT readers are out, D810's precedent, on his word). Nothing is downloaded or installed until then.


*Moved here 2026-10-14 by backlog-archive.mjs ([OIL-UNCANCEL-UNASKED]). Forward facts: `raptor-port/docs/handpass/2026-10-14-oil-uncancel-load.md`, `raptor-port/docs/ui-contracts.md`.*

### [OIL-UNCANCEL-UNASKED] Taking the cancel (or the information-only mark) off an input that has no OIL answer puts the question first — RULED D816 (13 Oct 26, "Ok go with your recommendation yes") — BUILT 14 Oct 26 (night), branch `claude/oil-uncancel-load-ask`; WAITING FOR HIS LOOK AND "MERGE LIVE"
**BUILT AND CHECKED (14 Oct 26, night — unattended, D856–D858).** As ruled: the board's "Un-cancel" (and the ⓘ pressed off) on an input with no OIL answer for a non-working day opens the OIL question headed "Un-cancelling Ranger's Range brief" — "Don’t un-cancel" / "Un-cancel"; left unanswered it stays cancelled and the bar reads "Not un-cancelled — OIL not answered · Answer OIL · OK" (one line, at 320 wide too); answered, it comes back with its answer in one step and one Undo, and says "Restored". Answered already, a working day, a leave / medical / personal input: at once, as before. The check (tier FULL), its walk, the two reads and what is parked for him: `raptor-port/docs/handpass/2026-10-14-oil-uncancel-load.md`. **For his look:** the ⓘ mark's words (the agent's: "Taking “information only” off …", "Don’t change" / "Change", "Not changed — OIL not answered") — the sheet's §0 item 1; and item 6 (the bar up, then the input stops needing an answer: "Answer OIL" un-cancels it at once). **What it is NOT:** a saved plan switched to that brings back an unanswered input says nothing (D818 names a published version) — the sheet's §0 item 5, his to rule.

**HIS ANSWER — D816: choice (a) below.** Only where the input has NO answer for a non-working day; where it is answered already it is un-cancelled at once and the answer counts again. The three wordings are shown to him on the build. Tier FULL (OIL; a published day): test first, a short look, and ONE fresh Opus read of the finished code — no Fable read, on his word for this job (D858, 14 Oct 26 — "opus is good enough for the oil work and solely opus to review is good enough"; it sets D790's Fable read aside for this job only); Sonnet 5.5 keeps its standing jobs on it (D588). Built on the night of 14 Oct 26 on his yes (D857), on a branch of its own cut from the leftovers' branch.

**A question for him — the other side of D814, not a fault in it.** Now that a cancelled input is never asked (D814), the moment its question comes back is when the scheduler takes the CX off — and that button asks nothing. *"Ranger's Training stands on a public holiday's programme, cancelled (CX), with no OIL answer — rightly, a cancelled input is not asked. The scheduler takes the CX off: the Training is live again and still has no answer. Nothing asks: its card wears 'OIL?' and Ranger's own bell lights, but no question is put to the scheduler who un-cancelled it — where putting the same input back with Accept would ask first (D793). And if the day was MADE a holiday while the Training was cancelled, no scheduler was told then (rightly) and none is told now."* **The choice:** (a) taking the CX off waits on the OIL question, as Accept does — the question first, the un-cancel only on an answer; three short wordings to approve ("Don't un-cancel" / "Un-cancel" / "Not un-cancelled — OIL not answered"); or (b) it stays silent at the button, but the schedulers' bell gets its holiday line then, so it is never missed; or (c) leave it — the "OIL?" sign and the member's bell are enough. **Recommended:** (a) — the same rule at every door that makes an input need an answer (D783, D793, D804). **The build if (a):** `raptor-port/src/ui/reqdoor.ts rowMark` through that file's own gate, the mark and the answer one command; `raptor-port/src/ui/board.ts` treats "asked" as not done; a fifth-and-sixth kind of wait. With `[OIL-LOAD-VERSION-UNASKED]` — the same family (a way of putting things back that asks nothing). The read: `raptor-port/docs/handpass/parts/ib/read-d814-opus.md` (F1).


*Moved here 2026-10-14 by backlog-archive.mjs ([OIL-LOAD-VERSION-UNASKED]). Forward facts: `raptor-port/docs/handpass/2026-10-14-oil-uncancel-load.md`, `raptor-port/docs/ui-contracts.md`.*

### [OIL-LOAD-VERSION-UNASKED] After a published version is loaded back, the app says how many inputs need an OIL answer and opens the day's one list — RULED D818 (13 Oct 26, "B") — BUILT 14 Oct 26 (night) with [OIL-UNCANCEL-UNASKED], branch `claude/oil-uncancel-load-ask`; WAITING FOR HIS LOOK AND "MERGE LIVE"
**BUILT AND CHECKED (14 Oct 26, night).** The load is made as before; its note ends " · 1 input needs an OIL answer" (" · 3 inputs need …") and that day's one list opens — above the full-screen Scheduler Board too. **Four things the build settled, each told to him in the sheet's §0** (`raptor-port/docs/handpass/2026-10-14-oil-uncancel-load.md`): the note keeps its older sentence and adds his tail (item 2); the list is the day's WHOLE open list, so it may hold more than the note counts (item 3); an input of several days whose unanswered day is not the day loaded is counted and the list opens for THAT day — a reading of D818 that differs from the one told to him on 13 Oct ("opened for the day that was loaded"), found by the fresh read and built because otherwise nobody is told (item 4); on a plain weekend the list has no "Public holiday" line, and its foot promises "the schedulers’ bells" only where a bell carries a line (item 7).

**HIS ANSWER — D818: "B".** The load is not held (it may put back several inputs at once; the one-input question does not fit): after it, the note says how many of the inputs it put back have no OIL answer ("<day> loaded · 3 inputs need an OIL answer" — the words shown to him on the build) and that day's one list (D782) opens with them — Yes / No each, "Yes to all", "No to all", "Later". Nothing is added where none needs an answer; an input put back under Unavailable counts (D804), a cancelled one does not (D814). One check with `[OIL-UNCANCEL-UNASKED]` (D485; tier FULL — OIL and a published day).

**A question for him — nothing is silent afterwards.** *"Friday was published with Ranger's Other filed under Unavailable. Friday is then made a public holiday, and a scheduler takes the input out. Pressing '→ Unavail' again would now ask the OIL question first (D804). But 'Load onto working copy' of the published version puts it back under Unavailable at once, and nobody is asked — the same load puts a Training back on the programme unasked, where 'Accept' would ask (D793). Should a version loaded back ask, or is it — like an Undo — a way of putting things back as they were, which never asks?"* **Recommended:** it never asks, like an Undo (D793 reading 3) — a load restores a whole day as it went out, and the input is not lost sight of: its "OIL?" sign, the day's one list and the bell all count it again at once. **If he says it should ask:** after the load, name in its note how many inputs it put back need an answer and open that day's one list (`raptor-port/src/ui/interactions.ts`, the load's door; `raptor-port/src/engine/drafts.ts`). The read: `raptor-port/docs/handpass/parts/ib/read-d804-opus.md` (F2).


*Moved here 2026-10-14 by backlog-archive.mjs ([OVERNIGHT-SKILL]). Forward facts: `.claude/skills/overnight/SKILL.md`.*

### [OVERNIGHT-SKILL] The nightly unattended run as ONE command — a skill he calls before he sleeps (his word, 14 Oct 26 — D859) — DRAFTED AND READ 15 Oct 26, branch `claude/overnight-skill-c02843`; WAITING FOR HIS APPROVAL OF THE WORDING; not installed
**Where it stands (15 Oct 26):** the draft `raptor-port/docs/superpowers/specs/2026-10-15-overnight-skill-draft.md`; one fresh, blind Opus reader ran it against the night of 14 Oct and against that day's backlog and found fifteen faults, all taken — the report and what was taken `raptor-port/docs/superpowers/briefs/2026-10-15-overnight-skill-read-report.md` (its brief beside it). **He then corrected its shape (D867):** the agent recommends the jobs that fit the hours he gives, each with a rough time, HE selects them and answers its questions, and nothing starts before his reply; one chat, compacting smartly by how full it is; a roadblock waits until he wakes. Part 1 was rewritten and read again by a second fresh reader (six points, all taken — the same report, its second section). **One point differs from the reading first told him, and is put to him with the draft:** his selection is NOT recorded as a new ruling each night — the ruling that approves the guide is the standing permission, and only a new decision of his is recorded. A question he leaves unanswered is never a yes. **On his approval:** the file, without its draft comment, becomes `.claude/skills/overnight/SKILL.md`, with a row in `raptor-port/docs/file-map.md`; the approval is recorded as a ruling naming that file; observation 591 is marked ACTIONED.
**His word:** *"it seems like every night I ask u the same questions to run tasks overnight. Can we make this like a skill command to execute?"* **What the command does (the agent's reading, told to him):** what he asked for by hand on 14 Oct 26 (D856, D857) — it reads `HANDOFF.md` and this backlog's order; lists what is ruled and can be built without him, and what cannot and why; puts at most four questions to him, each with a recommended answer, before he sleeps (design questions with a picture — D853); records the night's permission as a ruling; says the check each job gets; writes the state into the repo before the first job and at every commit, so a compaction loses nothing (D667, D766); parks a choice that is truly his in one list and leaves only that piece undone (D596); never merges, never touches `main`; one notification at the end; a morning report with pictures and a numbered "what you do now". **How it is made:** a working guide of our own under `.claude/skills/` — a new guide, so its wording is drafted, read by one fresh, blind Opus reader while the ChatGPT readers are out (D70; D810's way) and approved by him before it is used. The night of 14 Oct 26 is its worked example: this chat's block in `HANDOFF.md` and the rows D856–D859. Not app work.


*Moved here 2026-10-14 by backlog-archive.mjs ([RUN-CHECK-BOTH-RUNS]). Forward facts: `.claude/rules/shipping.md`.*

### [RUN-CHECK-BOTH-RUNS] "Are the checks still running?" is checked by reading ONE run, but every push starts TWO — found 15 Oct 26 by the overnight command's read (F2) — OPEN, a guide and rule change, his approval
**Found, not fixed.** `.claude/rules/shipping.md` (§The loop), `HANDOFF.md`'s header and `.claude/skills/session-handoff/SKILL.md` (Step 1) all say to look with `gh run list --branch <branch> --limit 1` before pushing (D151). A push to a pull request starts two runs at the same second — the documents guard (about two minutes) and the full checks ("Deploy to GitHub Pages", eight to twenty minutes; seen on `claude/oil-uncancel-load-ask`, 14 Oct 26: two runs per pushed commit). `--limit 1` can return the documents guard's row; once it reads "completed" the agent pushes and cancels the full run D151 protects. **The fix (the reader's wording):** `gh run list --branch <branch> --limit 6 --json status,workflowName,headSha` — push only when no run for the branch's last pushed commit is `queued` or `in_progress`. The overnight draft already uses it. A rule file and a working guide change, so read by one fresh reader and put to him (D70). Small; any documents-only job.


*Moved here 2026-10-14 by backlog-archive.mjs ([OIL-PLAN-SWITCH-UNASKED]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [OIL-PLAN-SWITCH-UNASKED] "Switch to this plan" that brings back an unanswered input says so, as a load does — RULED D865 (15 Oct 26), BUILT 15 Oct 26 on `claude/checkout-stale-compaction-7ee93a`, ITS CHECK IN HAND
**BUILT 15 Oct 26** (D875: one fresh Opus read, no Fable): the switch reads what it put back through the load's own body (`raptor-port/src/ui/oilputback.ts`), its note in short sentences, the pins `raptor-port/src/ui/oilwait.test.tsx` ON12; the contract `raptor-port/docs/ui-contracts.md` (the switch bullet under the OIL question). **Found while building:** only a PUBLISHED day can be brought to this — on a day not yet published a filed input lands by itself on whichever plan is live; and a request taken off by hand stays "taken off" through a switch (the settled design of 28 Sep 26), Accept asking its question.
A saved plan switched to can put an input back on a day where it has no OIL answer for a non-working day; today it says nothing (D818 names a published version). His answer: the same as the load (D862, D863) — the plan switch's note ends "N input(s) need(s) an OIL answer." and that day's one list opens for the days that need the answer; its note is shortened to plain sentences the same way (it still uses `rowsLeftSaid`'s older clauses, `raptor-port/src/ui/board.ts`). Built tests first, with its own short check (tier WALK: one door, the shared list).


*Moved here 2026-10-14 by backlog-archive.mjs ([GUIDE-ONE-MARK]). Forward facts: `raptor-port/docs/design-practices.md`.*

### [GUIDE-ONE-MARK] The design guide carries "one mark, one look" — RULED D866 (15 Oct 26) — DONE 15 Oct 26: APPROVED (D876) AND IN THE GUIDE
**15 Oct 26:** drafted (`raptor-port/docs/superpowers/specs/2026-10-15-guide-one-mark-draft.md`), read by one fresh blind Opus reader (`raptor-port/docs/superpowers/briefs/2026-10-15-reads/guide-one-mark-opus.md`: one must, six more — all taken in version 2; five clauses are the agent's readings and are put to him as readings). Waiting on his approval of the wording; `raptor-port/docs/design-practices.md` is unchanged until then.
The rule from his correction of 15 Oct (D860, D852's second step): the just-added mark is the plain blue ring with no glow, everywhere, on the edge of the thing added — a note's own box, not its row; a table row as one box. Draft the lines into `raptor-port/docs/design-practices.md` (§5 colour / §6 motion, beside the mark's feedback rule), have ONE fresh reader read the draft (D70, D790 while the ChatGPT readers are out), then put the wording to him; nothing goes in before his approval.


*Moved here 2026-10-14 by backlog-archive.mjs ([GLOW-PLACES-LOOK]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [GLOW-PLACES-LOOK] The other places that glow, drawn for his look — RULED D866 (15 Oct 26) — DONE 15 Oct 26: DRAWN, PUT TO HIM, ANSWERED (D877)
**15 Oct 26:** drawn on the real Scheduler Board by `raptor-port/scripts/handpass/glow-look.mjs` (pictures `raptor-port/docs/mock/2026-10-15-glow-places/`, the page `index.html` there, an Artifact page to him). Found: the keyboard ring has NO glow (a plain 2px outline) — nothing to decide; four more places glow beside the drag's flash — the crew a tapped warning lights (and a flying line's time boxes), a puck earning OIL, his own puck ("this is you"), a highlighted puck; one more not drawn — the picked person chip of the Inputs calendar's "+ Pucks" picker. Four questions, each recommended "no glow". **Also to check on screen (the guide read's G3, not run):** on the Scheduler Board the just-added ring follows a row's PLACE, so a row dragged into a just-added row's place within six seconds may wear the ring and the landing flash at once — older behaviour; checked with the build if he answers yes to question 1.
His correction of 15 Oct (D860) took the glow off the just-added mark. D852's third step named other places with a glow: the quick cyan landing flash a puck or row wears after a drag or an Undo (`.lift-land`), and the keyboard's focus ring (D842). Draw each as it is beside a no-glow version, the area marked (D853), and put them to him; change nothing before he answers.


*Moved here 2026-10-15 by backlog-archive.mjs ([GLOW-OFF]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [GLOW-OFF] The Scheduler Board's other glows go, each keeping its ring — RULED D877 (15 Oct 26) — BUILT 15 Oct 26, WALK-checked; OPEN until his iPhone look, his answer on the picker chip and his "merge live"
**Built 15 Oct 26** on `claude/glow-off-compact-bands-window-40b514`: the eight places, each keeping its ring (`docs/ui-contracts.md`
§One mark, one look); the walk 36/36 at both sizes (`raptor-port/docs/handpass/2026-10-15-glow-off.md`). **Waiting on him:**
(1) the picker chip (`.ic-pickp.on`) — ANSWERED D879 ("Yes take the glow off"), built; (2) his look on his iPhone; (3) after
it, whether the design guide carries "a ring in this app does not glow" (D852).
**Also named to him (D852's third step), not ruled:** the SANS puck's purple stripe still glows (`.puck.san::after`).
**His answer to the four glow questions (D877 — "all no glow"):** take the glow off the landing flash and picked-up look (`--lift-box`, `raptor-port/src/ui/scheduler/00-foundation-login.css`), the crew and the time boxes a tapped warning lights (`.puck.wfoc` and its `advf` / `notef` / `echo` forms, `raptor-port/src/ui/scheduler/08-windows-tools.css`; `.badtm.wfoc`, `12-schedule-editing.css`), a puck earning OIL (`.puck.oilglow`, `18-oil-board.css`), his own puck (`.puck.me`, `04-pucks-sections.css` — its purple fill and ring kept) and a highlighted puck (`.puck.hl`). The pictures of record: `raptor-port/docs/mock/2026-10-15-glow-places/` — each "no glow" frame is the change, made by the one override `raptor-port/scripts/handpass/glow-look.mjs` prints (`NOGLOW`). **Also in the job:** the picked person chip of the Inputs calendar's "+ Pucks" picker (`.ic-pickp.on`, `07-inputs-calendar.css`) glows too and was not drawn — a picture to him first; the guide read's G3 (a row dragged into a just-added row's place within six seconds may wear the ring and the landing flash at once) checked on screen; and after his look, whether the design guide carries "a ring in this app does not glow" (D852). **Tier:** LOOK at least — but the warning-lit ring is a shared drawer on every page that lights a crew (the order's §5: a cosmetic change to a shared drawer is never LOOK) — WALK; a test reads each rule off the stylesheet as `markring-css.test.ts` does; his look on his iPhone.


*Moved here 2026-10-15 by backlog-archive.mjs ([COMPACT-BANDS-WINDOW]). Forward facts: `raptor-port/docs/superpowers/specs/2026-10-15-compact-when-ready.md`.*

### [COMPACT-BANDS-WINDOW] The compaction set-up's notes count the chat against 1,000,000 while the app now counts it against 880,000 — so the first note comes only about 45,000 before the app compacts (found 15 Oct 26, re-running the set-up's four checks) — APPROVED D878 (15 Oct 26, "4 fix") — BUILT 15 Oct 26, READ; OPEN until his approval ("merge live") and the main folder brought level
**Built 15 Oct 26** on `claude/glow-off-compact-bands-window-40b514` (the design note's last section,
`raptor-port/docs/superpowers/specs/2026-10-15-compact-when-ready.md`): the notes at 75/80/85/90% of the app's own room (the
first at 660,000 of 880,000), the guard holding from 90% of it (792,000) to under 900,000; 16 hook tests. **One fresh, blind
Opus read** (`raptor-port/docs/superpowers/briefs/2026-10-15-reads/compact-bands-window-opus.md`): no must, one should (the
guard held from 75% — moved to 90%, narrowing the reading he was told), four low — all fixed. Switched on only by his
"merge live" and the main folder brought level (the app runs the hooks from there — `[MAIN-CHECKOUT-STALE]`).
**Found, NOT FIXED.** With the main folder on `main`, a new chat reads the app's own figures as: the chat's room 880,000 (the setting `autoCompactWindow`), compaction at 96% of it — about 845,000, which is the intended "about 85%" of the whole 1,000,000. So the compaction point DID move (check (a) passes). But the notes and the guard (`.claude/hooks/compact-lib.mjs`, `WINDOW` = 1,000,000) count against the whole room: the 80% note fires at 800,000 — the app's own 91% — leaving about 45,000 before the compaction, enough to commit and write the handoff block but not to finish a step of any size; the 85% note (850,000) comes after it; and the status line, which shows the app's own figure where the app hands one, reads about 10 points higher than the notes. **Fix (proposed, not made):** count the notes and the guard against the app's own room (read `autoCompactWindow`, else 1,000,000) and set the bands below its compaction point — for example a first note at 75% of 880,000 (660,000, about 185,000 before it), the guard's window from there to the compaction point; re-run the hook tests. It is a change to the hooks (his permission for the set-up, D870) and to what the design says (`raptor-port/docs/superpowers/specs/2026-10-15-compact-when-ready.md`): one fresh reader, then his approval (D70).


*Moved here 2026-10-15 by backlog-archive.mjs ([LW-LANDING-LINE-FIGURES]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [LW-LANDING-LINE-FIGURES] On the Leave War, the blue landing line of a row dragged in Rearrange breaks across the figures columns (found 15 Oct 26, picturing `[GUIDE-NO-GLOW]` place 8) — BUILT AND CHECKED 15 Oct 26 on `claude/backlog-work-session-12d909` (his word, D889), WAITING FOR HIS "MERGE LIVE"; HIS INTENT CONFIRMED (D883)
**BUILT 15 Oct 26 (tier LOOK, walked 39/39):** the cause was the figures drawer — a second table laid over the days, so
the real row's line ran UNDER it; the drawer's row now wears the same landing mark and draws the same line. The contract:
`raptor-port/docs/ui-contracts.md` (D883's paragraph); the check: `raptor-port/docs/handpass/2026-10-15-lw-landing-line.md`.
**And round two, the same branch (D890 — his find on the preview):** one landing line a gap, not two a few pixels apart;
re-walked 41/41. The other places with the same two positions: `[DRAG-ONE-LINE-ELSEWHERE]`.


*Moved here 2026-10-15 by backlog-archive.mjs ([DRAG-ONE-LINE-ELSEWHERE]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [DRAG-ONE-LINE-ELSEWHERE] Three other drag lists draw two landing lines in each gap, a few pixels apart (found 15 Oct 26, his question after D890) — BUILT 15 Oct 26 on his "Yes fix them too" (D891), same branch, waiting for his "merge live"
**BUILT (D891):** the grid-only limit on `Matrix.tsx startRowDrag`'s one-bar step lifted (Groups, Who wins); the same step in
`InputsCal.tsx startSecDrag` (a day's notes). Tests: `settingssheet.test.tsx`, `inputscal.test.tsx` (red undone); walked
14/14 by `scripts/handpass/onegap-lists.mjs` (`raptor-port/docs/handpass/2026-10-15-lw-landing-line.md` §5b).
**Found, NOT CHANGED (D852: other places are named to him, never changed unasked).** D890 made the Leave War grid's
Rearrange draw one line a gap; the same two positions — a row's bottom edge, then the next row's top — remain in: (1) the
Leave War's ⚙ Settings Groups list (`raptor-port/src/leavewar/ui/bidpicker.css` `.set-grow.dragover` / `.after`); (2) its
"Who wins" list (`.gs-row.dragover` / `.after`) — both through `Matrix.tsx startRowDrag`, where D890's step is limited to
the grid; (3) a day opened on the Inputs calendar, a note dragged to reorder (`raptor-port/src/ui/InputsCal.tsx` `secOver`,
`07-inputs-calendar.css` `.ic-sec.dragover`). Not the same: the Scheduler Board / Edit Schedule's line, wave and section
drags (one line on the row under the pointer — `src/ui/rowdrag.ts`) and Quals' heading drag (a ring). **If he says yes:**
(1)–(2) by lifting the grid-only limit; (3) by the same step in its own hover; a picture to him first (D852), tier LOOK.
**D883: the line runs unbroken across the name, the counters and the days.** Check a dragged group heading too (D876).
**Found, NOT FIXED.** Rearrange on, a man's row dragged over another (desktop, a real mouse drag — Cinch over Warden):
the blue line shows on the name column and across the day columns, but not across the figures columns between them
(`raptor-port/docs/mock/2026-10-15-noglow-places/N8-landing-line-today-desk.png`). So the line reads as two pieces, not
one line across the row. Likely cause, not yet checked: a figures-cell rule that sets its own `box-shadow` (the
`.figbox` rules, `src/leavewar/ui/matrix.css`) outranks `.mx tbody tr.dragover td:not(.who)`, as the comment above
`--mrow-ring` warns. Check on a phone too. Tier LOOK; one stylesheet test pinning the line on every cell of the row.


*Moved here 2026-10-15 by backlog-archive.mjs ([LW-REARRANGE-EDGE-SCROLL]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [LW-REARRANGE-EDGE-SCROLL] In the Leave War's Rearrange a row dragged to the screen's edge does not scroll the grid (his find on his iPhone, 15 Oct 26 — D892) — BUILT 15 Oct 26 on `claude/backlog-work-session-12d909`, waiting for his "merge live" (walked 14/14 with the D893 drags, `scripts/handpass/edgescroll-walk.mjs`)
**His words:** *"when I drag the row of the puck down outside the screen, the screen doesn't pan"*. The Rearrange drag
(`raptor-port/src/leavewar/ui/Matrix.tsx startRowDrag` — men's rows, group headings, counters) has no edge scroll; the war's
own drag selection does (`raptor-port/src/leavewar/ui/select.ts` EDGE / edgeScroll), as the Scheduler's drags do
(`raptor-port/src/ui/rowdrag.ts`, `drag.ts`). The contract: `raptor-port/docs/ui-contracts.md` (D892).


*Moved here 2026-10-15 by backlog-archive.mjs ([LW-COUNTER-GRIP-REACH]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [LW-COUNTER-GRIP-REACH] A counter row's Rearrange grip is much harder to take than a man's row's (his find on his iPhone, 15 Oct 26) — BUILT 15 Oct 26: measured (both ⠿ about 7 x 10 px on a phone; a counter's row 19 px, a man's 21), each grip given a larger invisible area inside its row (the guide §6, D487) — a counter's 6 → 16 of 81 points round it, a man's 9 → 20; waiting for his "merge live"
**His words:** *"Idk why it's much hard to activate the rearrange on the manning counter. Compared to the pucks below"*.
Both grips are the same small ⠿ glyph with no wider touch area (`raptor-port/src/leavewar/ui/matrix.css` `.mx .counts .who
  .drag`, `.whorow .drag`); what differs is to be measured on the built app (`scripts/handpass/grip-reach.mjs`).


*Moved here 2026-10-15 by backlog-archive.mjs ([GUIDE-DRAG-RULES]). Forward facts: `raptor-port/docs/design-practices.md`.*

### [GUIDE-DRAG-RULES] The design guide carries two rules for every drag — one landing line a gap; a drag at the edge of what scrolls scrolls it (his word, 15 Oct 26 — D894) — APPROVED 15 Oct 26 (D895) and IN THE GUIDE as §5a "Dragging" (`raptor-port/docs/design-practices.md`); the draft and its read: `raptor-port/docs/superpowers/specs/2026-10-15-guide-drag-rules.md`. Archive once live.
**His words:** *"This is also part of design skill that u should incorporate. The 2 things I flagged out. The rearrange and
drag outside screen. Note it"*. The guide: `raptor-port/docs/design-practices.md`; the two rulings behind them D890/D891 and
D892/D893. A working-guide change: drafted, read by one fresh reader, his approval of the wording (D852, D70) — then in.


*Moved here 2026-10-15 by backlog-archive.mjs ([DRAG-EDGE-SCROLL-ELSEWHERE]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/handpass/2026-10-15-edge-turn.md`.*

### [DRAG-EDGE-SCROLL-ELSEWHERE] Other drags that do not scroll when held at the screen's edge (found 15 Oct 26, his question with D892) — the Inputs calendar's two drags and Quals' heading drag LIVE (D893, pull request 514); BUILT AND CHECKED THE NIGHT OF 15 OCT 26 (/overnight, D898, D899), WAITING FOR HIS LOOK AND "MERGE LIVE": the Inputs month turns at its side under a run of days or a bar (D897) and the Tracker chart's drags pan at its edge (D896, D899)
**BUILT (the night of 15 Oct 26, branch `claude/drag-edge-scroll-elsewhere-51bfc4`):** the contract `raptor-port/docs/ui-contracts.md` ("A drag held at the edge of a view that TURNS or PANS"); the check `raptor-port/docs/handpass/2026-10-15-edge-turn.md` (WALK — 70/70, 15 unit breaks and a browser break, a fresh Opus read and its round two, all findings fixed). **His look:** the sheet's §12 card (his iPhone proves the Safari case). **Named to him, his to say (D852 — no change made):** (1) the SANS calendar's pick across days (it shares the machine; the ruling named the Inputs month); (2) the Tracker's ▣ Select box carried to the canvas's edge (a selection, like the Leave War's, which scrolls); (3) the Tracker's ⇅ Reorder window — its rows in a scrolling box (`components/Modals.jsx`), not draggable at all on a phone; (4) the people picker's drag across faces (`src/ui/PeoplePick.tsx`, D685) in its scrolling list.
**Named to him (D852), not changed.** Scroll at an edge already: the Scheduler Board's and Edit Schedule's puck drags
(`src/ui/drag.ts`) and line / wave / section drags (`src/ui/rowdrag.ts`); the Leave War's day-cell drag selection and its
Move (`src/leavewar/ui/select.ts`). Do NOT (read in the code, 15 Oct 26): the Leave War's ⚙ Settings Groups and Who wins
lists (the same drag as Rearrange — they ride D892's build if the sheet can scroll); a day opened on the Inputs calendar —
a note dragged to reorder and a puck dragged between notes (`src/ui/InputsCal.tsx`); Quals — a column heading dragged
sideways past the screen's edge (`src/ui/QualsPage.tsx`). Not checked: the Tracker chart's ball drag.


*Moved here 2026-10-15 by backlog-archive.mjs ([INPUT-DATES-FOLD]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [INPUT-DATES-FOLD] An input's window: dates already picked fold to one line that opens the calendar — RULED D914 (15 Oct 26, "5B"); WITHDRAWN the same night by D916 ("Disregard the minimising of the calendar") — CLOSED, not built
**And SANS availability (D915, "Likewise for sans availalibility"):** "+ Commitment" opened from a day or a run on the SANS
calendar folds its dates the same way — the same window, one build. **His "5B" (D914)** to his own idea at his look (D913): where the dates were already picked — a day or a dragged run on
the Inputs calendar, a saved input reopened — the window's Dates show as one line ("📅 Oct 15 → Oct 16 ▾") that opens the
calendar on a tap; the List's "+ Input" (no dates yet, D729) opens with the calendar showing. On his phone the window then
needs no scroll and is short enough that the day shows behind it (D909's side effect undone). **The drawing:**
`raptor-port/scripts/handpass/mock-input-order.mjs` (B), pictures `raptor-port/docs/img/handpass/2026-10-15-calendar-step-two/question/order-*.png`.
**To settle in the build (technical):** the line's look is the app's date box or a plain button (the drawing cloned
Cancel's); the calendar opens inside the window (D797, narrowed by D914); the keyboard reaches and opens it; a saved
input's first tap still starts new dates (D901). Its own small job, a fresh chat on `main` after 516 is live; a WALK check.


*Moved here 2026-10-15 by backlog-archive.mjs ([ONE-DATE-CALENDAR]). Forward facts: `raptor-port/docs/handpass/2026-10-15-calendar-step-two.md`, `raptor-port/docs/ui-contracts.md`.*

### [ONE-DATE-CALENDAR] One date calendar of the app's own, wherever a date is picked — on the iPhone calendar's pattern, in the Raptor look (his direction, 13 Oct 26 — D796) — STEP ONE LIVE (pull request 495, 13 Oct 26) AND HIS LOOK GIVEN (D889); STEP TWO BUILT AND CHECKED 15 Oct 26 (D901 — branch `claude/calendar-edge-drag-tasks-115921`), waiting for his look and "merge live"

**STEP TWO BUILT 15 Oct 26 (D901, "as recommended"):** the Leave War's range calendar (a bid, a new period, the bidding dates with their "Clear dates", an event, the OIL tracker's range, the holiday form), an input's own dates, the Inputs list's window and "Jump to a date" draw the one calendar; the OIL credit's date is the date box. Check: `raptor-port/docs/handpass/2026-10-15-calendar-step-two.md` (FULL — the walk both sizes, every place picked and saved; two faults found and fixed; 127 unit tests re-expressed by `raptor-port/docs/superpowers/briefs/2026-10-15-calendar-step-two-test-map.md`; the reads §11). **Left, named:** OilConfirm's own day grid ("only some days") is a near-copy of the old calendar, not on step two's list — his to place.

**STEP TWO'S QUESTIONS DRAWN THE NIGHT OF 15 OCT 26 (/overnight job 4 — nothing built), put to him in the morning:** the page "Calendar Step Two" (`raptor-port/docs/mock/2026-10-15-calendar-step-two/index.html`, published as an Artifact — https://claude.ai/artifact/CdkL11kPRcLEzgfz1vzbHx) — every step-two place pictured as it is today beside the new calendar, phone and desktop (`scripts/handpass/calstep2-pics.mjs`); four questions, each with the agent's pick: (1) no Clear but the bidding dates' "Clear dates"; (2) today shown on the Leave War's calendars; (3) one finger-sized date everywhere; (4) the Inputs list's date filter moves in step two too. What each place does today and what the new calendar still lacks (Clear, a compact size, a Today that picks, the saved input's first-tap rule): `raptor-port/docs/superpowers/specs/2026-10-15-calendar-step-two-survey.md`. **ANSWERED 15 Oct 26 — D901, all four as recommended; his "proceed" is the go: build step two in a fresh chat on `main`, with its own check.**

**STEP ONE, BUILT 13 Oct 26 (D786, D795, D796, D797):** the calendar (`raptor-port/src/ui/DateCal.tsx`), its date box (`DateBox.tsx`), the Calendar window's swipe (`sideswipe.ts`); every date box that was the phone's own — "Every <weekday>" From and Until, a new person's Post in (three doors), Admin → Data's dates (the range is one calendar in the form), the upchit date, the Leave War's FIVE posting dates. Its bug check (WALK): `raptor-port/docs/handpass/2026-10-13-one-date-calendar.md` — three walkers (no failure; two faults, fixed), 69 unit breaks and 12 browser breaks, a fresh blind Opus read (2 medium, 5 low — all fixed). The contract: `raptor-port/docs/ui-contracts.md` §Days — the month. **Left for him:** his look on his own iPhone (the sheet's §13 card) and "merge live". **His four answers of that night (D800, D801, D802):** the new calendar turns its month on a sideways finger too, and the Tracker's three date boxes take the calendar with a tap that picks — both being built on this same branch that night (`HANDOFF.md` says where each stands); step two waits for his look; the scheduler's rulings list is split (`[SCHEDULER-RULINGS-SIZE]`).

**STILL TO BUILD — STEP TWO (after step one's "merge live", with a check of its own):** the places that draw one of the app's three small calendars — the Leave War's range calendar and its users, the holiday form, an input's own window's calendar, "Jump to a date". **THE TRACKER'S DATE BOXES (D801 — a tap picks, no tick):** the design never named the Tracker; he ruled them in on 13 Oct 26 and they were built that night as a job of their own — `[TRK-DATE-BOXES]`, below. No date box of the phone's own is left anywhere in the app (`src/ui/nodatebox.test.ts`). **Noted while building:** `23-days.css`'s rule that lets the phone month fill the window's height looks inert (its parent is not a column) — the month does not grow to the foot; unchanged by this job.

**His words, with two photos of his iPhone's own date calendar:** *"why don’t u design the calendar the app uses something like this? But instead of reset, we have a today’s icon on the right of the year. And there Isint a need for the tick arrow at the bottom right. But the style is raptor app style. And I recommend to design for the entire app and the places u talked about that’s applicable"* · *"Same like Apple where u can scroll to the month and year as well"*.

**THE DESIGN OF RECORD, written for the build:** `raptor-port/docs/superpowers/specs/2026-10-13-one-date-calendar.md` — the calendar's parts and measures, where it sits place by place (D797), the swipe, the two steps, the build's notes, the tests to re-express, what is still to tell him, the tier.

**What it is (D796 — its full row has the readings to tell him):** ONE calendar component — the month and year as a title that opens two scrolled lists (months, years); two arrows at the right; a Today icon right of the year; large round dates; no Reset, no tick — a tap picks. **Where a date is picked today (read 13 Oct 26):** the Leave War's range calendar `src/leavewar/ui/RangePicker.tsx` and its users (`BidPicker.tsx` a leave bid, `WarSheet.tsx` a new period, `Chrome.tsx` the bidding dates, `EventSheet.tsx`, `CreditForm.tsx` an OIL credit, `OilTracker.tsx`) and the holiday form (`src/ui/HolidaysPanel.tsx`); the calendar in an input's own window (`src/ui/RangeCal.tsx`, from `src/ui/inputedit.tsx`); the schedule's week picker (`src/ui/WeekCal.tsx` — it already has a Today icon, the page with today's number); and the phone's own date boxes — "Every <weekday>"'s From and Until (D795), a new person's Post in (`src/ui/UsersPanel.tsx`, three places), Admin → Data's dates (`src/ui/AdminPage.tsx`), a medical input's upchit date (`src/ui/inputedit.tsx`), the Leave War's four posting dates (`BidPicker.tsx` — the phone's own box on purpose since 19 Aug 26, for the reach across years: the scrolled years give that). **Not this:** the months that are pages of their own (the Inputs calendar, the SANS calendar, the Calendar window's month).

**DRAWN 13 Oct 26 AND PUT TO HIM — nothing built.** The page `raptor-port/docs/mock/cal-swipe-fit.html` (the same Artifact page; its part 1), pictures `raptor-port/docs/mock/2026-10-13-cal-swipe-fit/one-*`, drawn by `raptor-port/scripts/handpass/calone-mock.mjs` on the real screens at 390 wide: one date picked (the calendar as a card over the form, today on a soft disc, the picked date the bright disc, the window's weekday standing out), the title tapped (two scrolled lists, months beside years, the chosen pair in a band), a run of dates inside "Add a holiday" (two filled discs joined by a band, the run in words beneath, no "Clear"), the Leave War's post-out date, a new person's Post in; and as built, the Leave War's calendar and the schedule's "Jump to a date" (whose Today icon — the page with today's number — is the one the new calendar carries). **ANSWERED 13 Oct 26 — D797 (*"Ok as recommended. Monday. 2 step"*):** over the form where the date is one box among others, inside the form where the dates are what the form is for (the place-by-place list is D797's full row; Admin's "A date range" becomes one run calendar inside its form); weeks start on Monday; two steps — STEP ONE the Calendar window's swipe and every date box still the phone's own, STEP TWO the places that draw one of the app's three small calendars today, with a bug check of its own. *As they were put to him:* **Three things put to him, each with the agent's pick:** (1) where one date's calendar opens — over the form, as the iPhone's does (*picked*), or inside the form under the box; (2) the first day of the week — Monday, as every month in the app (*picked*), or Sunday as his iPhone; (3) the order — two steps (*picked*: the Calendar window with every date box still the phone's own first; then the app's three small calendars, with a check of their own) or everything in one go. **Readings told on the page:** a run's "Clear" goes (a tap on a new day starts the run over); a tap outside a floating calendar closes it and changes nothing.

**Tier, when built:** the Leave War's range calendar is a shared drawer in seven places and the dates it picks are leave bids, periods and OIL credits — the tier is decided when the steps are planned (a WALK at least; FULL for the steps that touch what is saved through it). **Place:** with `[CAL-PHONE-SWIPE-FIT]`, whose date field is its first user; the order of the other places is put to him with the picture (the agent's pick: the Calendar window and the phone's own date boxes first, then the app's existing small calendars as a second step).


*Moved here 2026-10-15 by backlog-archive.mjs ([DRAG-EDGE-FOUR-MORE]). Forward facts: `raptor-port/docs/handpass/2026-10-15-calendar-step-two.md`, `raptor-port/docs/ui-contracts.md`.*

### [DRAG-EDGE-FOUR-MORE] Four more drags follow the edge (his "Yes they should too", D900, 15 Oct 26) — BUILT AND CHECKED 15 Oct 26 on `claude/calendar-edge-drag-tasks-115921` (with `[ONE-DATE-CALENDAR]` step two, one check), waiting for his look and "merge live"
**BUILT:** the contract `raptor-port/docs/ui-contracts.md` ("Four more drags follow the edge"); the check `raptor-port/docs/handpass/2026-10-15-calendar-step-two.md` (walk E1–E4 at both sizes; a browser break; the Reorder list's scroll carried by `src/tracker/retest.test.tsx`). A fault the walk found and fixed: the people picker's band lay under the window's Save bar and ran past the last face. **Named to him, his to say (D900's reading — not built):** a finger drag for the ⇅ Reorder rows — a phone cannot drag them today (its ▲▼ do it); a picture before any build.
**What:** the SANS calendar's pick across days turns its month at the side (`src/ui/SansCal.tsx` passes `onTurn` to `initCalPick`, as `InputsCal.tsx` does — the machine and the Safari guard are shared); the Tracker's ▣ Select box pans Edit chart layout at its edge (`src/tracker/app/core.js startMarquee` — `followEdge`, with its own cancel and pointer checks as the handles have); the Tracker's ⇅ Reorder list (`src/tracker/components/Modals.jsx`, a 52vh scrolling box; a phone cannot drag its rows at all today — a finger drag only if it fits the guide, said to him first) and the people picker's drag across faces (`src/ui/PeoplePick.tsx`, D685) scroll their list (`edgeAutoScroll`). **Check:** WALK — one walk script per surface pair, mouse and touch, a break test per wire. **Place (his order):** after 515 merges; a fresh chat on `main`.


*Moved here 2026-10-15 by backlog-archive.mjs ([INPUT-NEW-DEFAULTS]). Forward facts: `raptor-port/docs/handpass/2026-10-15-input-new-defaults.md`, `raptor-port/docs/ui-contracts.md`.*

### [INPUT-NEW-DEFAULTS] A new input opens on OL; a pencil beside the title box — RULED D917, D918 (15 Oct 26); after pull request 516 — OPEN
**His words (D917, D918):** the default type OL, "the most common leave taken"; "an edit pencil icon beside the title to
indicate that people can edit it". **Settled with him:** OL for every door that opens a NEW input (the List's "+ Input", a
day or a dragged run on the Inputs calendar) — not for several people (never leave, D655) nor SANS "+ Commitment"; a
saved input keeps its type; OL takes no title (D716), so the title box shows once a commitment kind is picked. **First:**
the pencil drawn on the real app and put to him (D853). **Also put to him with it:** his first idea D913 drawing A
(time and remarks above the calendar) — reopened by D916, unanswered. Its own small job, a fresh chat on `main` after
516 is live; a WALK check (the new input's doors, both sizes).
**DRAWN AND PUT TO HIM 15 Oct 26 (branch `claude/input-new-defaults`) — ANSWERED "All as recommended" (D919 P1, D920 A); BUILDING on that branch:** the page
https://claude.ai/artifact/BQa1WwKjmu62kgNv2FA4op (source `raptor-port/docs/mock/2026-10-15-input-new-defaults/index.html`,
pictures `raptor-port/docs/img/handpass/2026-10-15-input-new-defaults/`, drawn by `scripts/handpass/mock-input-defaults.mjs`).
(1) the pencil: P1 inside the title box at its right end (the agent's pick — no room taken, the box's grey, a line icon in
`ui/icons.tsx`'s style, never the ✏ glyph, which draws as an emoji on an iPhone) or P2, a square button beside the box (the
box ~40 px shorter); (2) D913 A — When and Remarks above the calendar, for every kind and door (the agent's pick). **Measured:**
with OL picked the window fits a 390 × 844 phone either way (no scroll); with Event (title + hours) today's Remarks lies under
the Cancel / Add bar and needs a scroll, and with A all of it is in sight. **The agent's readings, told to him:** the pencil
shows wherever the title box shows, new or saved, never on a read-only input; a tap on it is a tap on the box. **Then:** build
D917 with his two answers as one small job, WALK check.


*Moved here 2026-10-15 by backlog-archive.mjs ([TRK-REORDER-FINGER-DRAG]). Forward facts: `raptor-port/docs/handpass/2026-10-15-trk-reorder-drag.md`, `raptor-port/docs/ui-contracts.md`.*

### [TRK-REORDER-FINGER-DRAG] A finger drag for the Tracker's ⇅ Reorder rows — named to him by D900's reading (15 Oct 26); RULED D922 (build it, a picture first) — OPEN
**RULED 15 Oct 26 — D922: build it** — a finger drags a row on a phone, with the app's own drag look (one landing line a gap, the list following at its edge); the ▲ ▼ stay. A picture on the real app first, then its own small job after [INPUT-NEW-DEFAULTS] (the agent's placing); WALK check.
**Pictured for him 15 Oct 26 (D921):** picture 1, `raptor-port/docs/img/handpass/2026-10-15-two-leftovers/` (`scripts/handpass/pics-two-leftovers.mjs`).
**Today:** on a phone the Reorder list's rows cannot be dragged (its ▲▼ move them); a mouse drag scrolls at the list's
foot since pull request 516 (`src/tracker/components/Modals.jsx`; carried by `src/tracker/retest.test.tsx` "D900 — the
Reorder list…"). **Next:** a picture on the real app first (D853); build only on his word, with the design guide's
§5a dragging rules (D895).
 **Seen in the picture:** the window's own line says "Drag a row, or use ▲/▼" — on a phone a finger cannot drag; if no finger drag is built, that line is wrong on a phone.
**DRAWN AND PUT TO HIM 15 Oct 26 (branch `claude/trk-reorder-finger-drag`) — ANSWERED "All as recommended" (D924); BUILDING on that branch:** the page https://claude.ai/artifact/8mNLc9PU5u2ME2C4BvNosu (source `raptor-port/docs/mock/2026-10-15-trk-reorder-drag/index.html`, pictures `raptor-port/docs/img/handpass/2026-10-15-trk-reorder-drag/`, drawn by `scripts/handpass/mock-trk-reorder-drag.mjs`). The look copied from the Leave War's ⚙ lists (the lift ring, one 2px landing line on the top of the row below) and, after the drop, the app's own landing mark (`ui/lift.ts`). **The agent's readings, told to him:** a finger takes a row by its grip only (elsewhere it scrolls the list); the list follows at its edge as the mouse's does; the ▲ ▼ stay (the keyboard's way); all three windows. **Three questions, each with its pick:** (1) the grip ⠿ in place of ☰ (yes — the app's grip; ☰ means "list" on ☰ Show All); (2) a mouse drag the same look, the landing line in place of today's box round the row (yes — §5a); (3) delete "Drag a row, or use ▲/▼." (yes — D846). **Then:** build on his answers, one small job, WALK check.

*Moved here 2026-10-16 by backlog-archive.mjs ([MEDICAL-ONE-ROW]). Forward facts: `raptor-port/docs/handpass/2026-10-15-logic-medical.md`, `raptor-port/docs/superpowers/specs/2026-10-15-guide-one-row-draft.md`.*

### [MEDICAL-ONE-ROW] The Medical tab's controls in one row under the tabs — RULED D912 (15 Oct 26); BUILT 15 Oct 26 (D927), WALK-checked; OPEN until his look and "merge live"
**BUILT 15 Oct 26 (branch `claude/one-row-guide-medical`, D927):** the heading gone, the as-of button and Today at 36, a finger's 44 on a phone; tests red first (medicalview D927, e2e inputs-calendar D927 at 390 and 1280). Its check, with the Logic page's: `raptor-port/docs/handpass/2026-10-15-logic-medical.md`.
**ANSWERED 15 Oct 26 — "All as recommended" (D927):** build as drawn — with Quals' row (drawn first), one small job, WALK check, a fresh chat on `claude/one-row-guide-medical`.
**DRAWN AND PUT TO HIM, the night of 15 Oct 26 (branch `claude/one-row-guide-medical`):** the heading removed, the as-of button at 36 (the Inputs row's own height, measured) — on a phone the sections start 8 px higher; pictures `raptor-port/docs/img/handpass/2026-10-15-medical-one-row/`, drawn by `scripts/handpass/mock-medical-one-row.mjs`; the page https://claude.ai/artifact/1CFVksBEx3WMSg9t994FU1. Build on his word, WALK check (with the Quals row, once drawn).
**His "All as recommended" (D912):** the "Medical" heading, which repeats the tab's name, goes; the "as of" date button
(about 44 tall) stands in a row under the tabs at that row's button height (36), as on Inputs and SANS. Nothing else on
the tab changes. **Next:** draw it on the real app (`.claude/skills/brainstorming/mockups-on-the-real-app.md`), today
beside the change at phone and desktop sizes, and put it to him (D853); build only on his word. Picture of today and the
detail: `raptor-port/docs/superpowers/specs/2026-10-15-guide-one-row-draft.md` §The places. Its own small job, after the
calendar job (it may ride with [GUIDE-ONE-ROW]).


*Moved here 2026-10-16 by backlog-archive.mjs ([LOGIC-PAGE-LAYOUT]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/handpass/2026-10-15-logic-medical.md`.*

### [LOGIC-PAGE-LAYOUT] The Logic page re-laid: what can be edited at the top, what only explains below, each arranged into its types (his direction D809, 13 Oct 26) — BUILT 15–16 Oct 26, WALK-checked; OPEN until his look and "merge live"
**BUILT 15–16 Oct 26 (branch `claude/one-row-guide-medical`; D928–D933):** one row (Logic, search, Filter, ✎ Edit); Settings then the checks; every line written to the writing guide and read by one fresh reader before the build (all its findings taken — the lines `raptor-port/docs/superpowers/specs/2026-10-15-logic-page-lines.md`); every number read from its setting (D932, a test proves it); four folds of key points; a setting's own Reset; the strip's untrue line corrected. Its check: `raptor-port/docs/handpass/2026-10-15-logic-medical.md` (its questions for him at the head: a passing note to delete, "Reset all" on a phone).
**ANSWERED 15 Oct 26 — "All as recommended" (D928):** build as drawn — two parts, every check with one line, four "How it works" folds, no per-row counts, the two unused settings removed. Next: every line of both parts written to the writing guide and read by one fresh reader, then the build with its own check; the "changed" strip corrected with it.
**DRAWN AND PUT TO HIM, the night of 15 Oct 26 (his D925, branch `claude/one-row-guide-medical`):** the page https://claude.ai/artifact/QaySHx83mqvS9Dcr1Z7gYN (source `raptor-port/docs/mock/2026-10-15-logic-page/index.html`; the inventory `raptor-port/docs/superpowers/specs/2026-10-15-logic-page-inventory.md`; today's pictures `raptor-port/docs/img/handpass/2026-10-15-logic-page/today/`). Two parts — Settings (each with one line of what changing it affects, grouped by the job) and The checks (one line each, four with "How it works"); the code names, engine text, history, per-row counts and two unused settings gone; one row of controls. Four questions to him, each with a pick. The amber "changed" strip's wording is misleading today (published days keep their brief, report, debrief and OIL values) — to be corrected with the build.
**HIS INTENT, 15 Oct 26 (D925):** the page is for the scheduler or admin to understand, not a description of the app's workings — intuitive, less cluttered; the editable settings at the top, each saying what changing it affects (the brief time moves the automatic B); fine detail out, a short "how it works" only where needed (crew rest). A mock-up with the design skill (impeccable) and his best-suggestion answer first: `raptor-port/docs/superpowers/specs/2026-10-15-logic-page-design.md`. Being drawn the night of 15 Oct 26 if time allows.

**His words:** *"I want to reform how the logic page is presented. Like have an editable section all arranged at the top while the rest at the bottom. Arranged into types within them"*. **To do:** (1) list what the page holds today, rule by rule, marked "can be edited" (a number, a switch, words, a list) or "explains only" (`raptor-port/src/ui/logic-html.ts`, `raptor-port/src/ui/LogicPage.tsx`); (2) a mock-up on the real app, a phone and a desktop: the editable settings first, grouped under their types; the explanations below, under the same types; the search and the controls kept in sight (D561, `[LOGIC-STICKY-SEARCH-COMPACT]`) working over both; (3) his choice of the groups' names and order; (4) the build — no rule's value or meaning changes, only where it sits — with its own check (the Logic page's tests pin its sentences; `[LOGIC-REDRAW-DROPS-TYPING]` rides with it, the same page). After the design page of D807. A branch of its own. Ruling: D809.


*Moved here 2026-10-16 by backlog-archive.mjs ([QUALS-ARRIVES-SCROLLED]). Forward facts: `raptor-port/docs/handpass/2026-10-16-quals-one-row.md`.*

### [QUALS-ARRIVES-SCROLLED] On a phone Quals opens scrolled — its row and the Viewing switch above the screen (found 16 Oct 26, older) — FIXED 16 Oct 26 (D937) on `claude/one-row-guide-medical`, leaves with its merge
**ANSWERED 16 Oct 26 — "As recommended" (D937): Quals opens at its top, as Inputs does — built, tests red first, re-walked 30/30 (`raptor-port/docs/handpass/2026-10-16-quals-one-row.md` §9). Logic and the other pages are not part of the ruling.**
**Found walking Quals' one row (D935), 16 Oct 26:** opening Quals from the schedule's menu on a phone (390) lands 120 px
down: the app keeps the window's scroll from page to page, so the row and the Viewing switch sit above the screen until
the page is scrolled up. Not this change's — `main` does the same; the Inputs page was fixed to arrive at its top
(`raptor-port/docs/ui-contracts.md`, "The page arrives at its top"), Quals never was. Picture:
`raptor-port/docs/img/handpass/2026-10-16-quals-one-row/look/q2-arrives-scrolled.png`. **Recommended:** Quals arrives
at its top too, a small fix with its own test (and a look at whether Logic and the other pages do the same). Waits on
his word; the browser test D935 scrolls to the top before measuring, with a pointer here.


*Moved here 2026-10-16 by backlog-archive.mjs ([TRK-TEST-MIDNIGHT]). Forward facts: `raptor-port/src/tracker/tracker.test.tsx`.*

### [TRK-TEST-MIDNIGHT] Two Tracker tests fail when a run crosses midnight — test-only (filed 16 Oct 26) — FIXED 16 Oct 26 on `claude/one-row-guide-medical` (the group's date pinned; 79/79), leaves with its merge

**Not a fault in the app.** `src/tracker/tracker.test.tsx` ("a grade is dated the day it is pressed…", "re-dating one
failure from the full list…") work out today once, then the app stamps the date it reads at the press: a full run that
crossed midnight on 15–16 Oct 26 failed both; the file alone after passed 79/79 (`raptor-port/docs/handpass/2026-10-15-logic-medical.md` §6).
**Fix:** each test reads today at the moment it compares (or the app's clock is pinned for the file). Small, any time.


*Moved here 2026-10-16 by backlog-archive.mjs ([GUIDE-ONE-ROW]). Forward facts: `raptor-port/docs/superpowers/specs/2026-10-15-guide-one-row-draft.md`, `raptor-port/docs/handpass/2026-10-16-quals-one-row.md`.*

### [GUIDE-ONE-ROW] The design guide carries "a page's own buttons share its one row of controls" — RULED D911 (15 Oct 26); the rule IN the guide (D926); Quals BUILT 16 Oct 26 (D935), WALK-checked — OPEN until his look and "merge live"
**QUALS BUILT 16 Oct 26 (D935, branch `claude/one-row-guide-medical`, pull request 519):** one row at 36 (Enable editing — or Save changes and Edit quals — Export, the filter), the date box gone, "Export" on a phone (≤ 480) with its full words kept for a screen reader, the filter giving way first; the paragraph under the row deleted whole. Tests red first (quals.test D935, e2e geometry D935 at 390/600/1280), breaks 6/6, the walk 21/21 — `raptor-port/docs/handpass/2026-10-16-quals-one-row.md`. **Put to him with it, ANSWERED "As recommended" (D937) and BUILT the same day:** "Save" for "Save changes" on a phone, so the filter keeps room at 320 while editing; and `[QUALS-ARRIVES-SCROLLED]`. The contract: `raptor-port/docs/ui-contracts.md` §The Quals page's one row.
**ANSWERED 15 Oct 26 — "All as recommended" (D926):** the wording approved and IN `raptor-port/docs/design-practices.md` §3; the Legend fold stays. Left of this item: Quals' "Export to Excel" drawn for him, then built with the Medical tab (D927).
**QUALS DRAWN AND PUT TO HIM, 15 Oct 26 (D926, D930 — branch `claude/one-row-guide-medical`):** one row (the date box that does nothing removed, every control at 36, "Export" on a phone), and his circled paragraph under it recommended for deletion (two of its three links do nothing) — https://claude.ai/artifact/QZqDmvnF4esm4zaixiNgTA, pictures `raptor-port/docs/img/handpass/2026-10-15-quals-one-row/`. **ANSWERED 16 Oct 26 (D935 — "1-4 as recommended"): build the row as drawn and delete the paragraph whole — NEXT, a fresh chat on this branch, its own WALK check.** Seen while drawing, not changed: on a phone "+ Add person" stands alone on a row under the Viewing switch (put to him on the same page).
**DRAFTED AND PUT TO HIM, the night of 15 Oct 26 (branch `claude/one-row-guide-medical`):** v2 of the wording, after one fresh reader's read of v1 (four over-reaches taken out), with the sweep of every page — `raptor-port/docs/superpowers/specs/2026-10-15-guide-one-row-draft.md`; the page https://claude.ai/artifact/1CFVksBEx3WMSg9t994FU1 (source `raptor-port/docs/mock/2026-10-15-one-row/index.html`). Waiting for his approval of the wording and his answer on the Legend fold. The places: Quals ("Export to Excel" — drawn for him before a build), Logic ("Edit rules" — inside `[LOGIC-PAGE-LAYOUT]`).
**His "All as recommended" (D911)** to D852's question after his correction of the Inputs list (D907, built as D910 in the
calendar job). **Next:** draft the wording in `raptor-port/docs/superpowers/specs/2026-10-15-guide-one-row-draft.md` (its
steps and what the draft must settle are there), one fresh reader (D70), then to him; `raptor-port/docs/design-practices.md`
changes only on his approval. A sweep of the other pages for places that break it is part of the draft. Its own job, a
fresh chat on `main` after the calendar job.


*Moved here 2026-10-16 by backlog-archive.mjs ([ALLAVAIL-COMMON]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [ALLAVAIL-COMMON] An ALL AVAIL / ALL input shows on the Common Programme by default (his direction, D954, 17 Oct 26)

**Status: OPEN — not designed. Drawn and its four questions put to him 17 Oct 26 (page https://claude.ai/artifact/JP1YjFnnYTKoq7BU8DDLva: Q1 move between the programmes — rec. no; Q2 off the Common Programme when ALL AVAIL comes off — rec. yes; Q3 all seven kinds — rec. yes; Q4 everything else unchanged — rec. yes); ANSWERED 17 Oct 26 (D955): Q1–Q4 as recommended — designed; to build as its own job after the till-date build.** His direction (D954): an input filed for ALL AVAIL or ALL — a duty or other commitment — shows on the day's Common Programme by default, not the Ground Programme where every commitment lands today; an overseas duty (OD) stays under Unavailable (ALL / ALL AVAIL is never offered for one — D711 (2)). Drawn on the real app by `raptor-port/scripts/handpass/allavail-common.mjs` (pictures `raptor-port/docs/img/handpass/2026-10-17-allavail-common/`). **Where it reaches (for the design):** every place that finds an input's row looks in the Ground Programme only — the landing worked out on read (`raptor-port/src/engine/overlay.ts`), accept / take off (`raptor-port/src/engine/slots.ts` acceptInput, unacceptInput, reconcileDayFiling), the one-rule sync of people both ways (D755), the clash and crew-rest checks, the published compare and the changes window. **Questions for him:** may a scheduler move it to the Ground Programme and back; where it goes when its ALL AVAIL comes off and named people are left (D745, D750); whether an input already standing on a published day moves (it would read pending there). **Place:** after the build in hand (D949–D953), its own job.
**D958 (17 Oct 26): the three places that said "Ground" for such a row say "Common" — the ✕ note, "→ Common", the phone banner.**
**D957 (17 Oct 26): the Ground Programme's line ("To take an input off, press Reject on it in Personal Inputs below.") stands under the Common Programme's heading too, only on a day where an ALL AVAIL / ALL input stands there — board and Edit Schedule's week, never View-only Sched.**
**D956 (17 Oct 26, his word from the plane): built in the till-date chat straight after that build, unattended, compacting by itself — on its own branch cut from `claude/whole-app-words-pass-1b-6cfe51`'s tip, its own FULL check, nothing merged.**
**For its roll-call (the tick build's scenario designer, 17 Oct 26):** an input's row on the Common Programme (`ap:` keys) must hold its typed words in the remark box with the "till <date>" grey after it, as the Ground Programme's now does (D949 Q3) — `raptor-port/src/ui/html.ts reqRmkParts` / `reqBoxText` / `boxText` answer only `gr:` rows today; widen them, and every place a box is put back, in that build.


*Moved here 2026-10-16 by backlog-archive.mjs ([MEDICAL-CARDS-3]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [MEDICAL-CARDS-3] The Medical tab's cards: three a row on a phone, two rows a card (his direction, D961, 17 Oct 26)

**Status: OPEN — to be drawn for him on the real app, then built.** His words, on pull request 524's preview: three cards in a row on a phone, not two; Upchit Complete's card loses "upchitted" (its kind says Upchit); "2 documents" becomes document icons on the date's row, so the card is two rows. The puck keeps its size (D487). What the cards say now: `raptor-port/docs/ui-contracts.md` (the Medical view, D960, D961). And (D963, replacing D962's title): a "+ Medical" button on the tab opening the same input window with a medical kind set; and (D964) that button's look drawn in a few variations for him to pick. Drawing: `raptor-port/docs/img/handpass/2026-10-17-medical-cards/`.


*Moved here 2026-10-16 by backlog-archive.mjs ([TILL-FROM-DATES]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [TILL-FROM-DATES] The app stops writing "till <date>" into remarks; every screen prints it from the input's own dates (his word, D728 step 2 — 10 Oct 26)
**Status: BUILT 16–17 Oct 26 (the night run, D948 — his answers: a grey date after the box in every window, "till <that day>" for one-day inputs, every screen as before), on `claude/whole-app-words-pass-1b-6cfe51` with round 1b; its FULL check in `raptor-port/docs/handpass/2026-10-17-r1b-till.md`; leaves for the archive at his "merge live".** *(Was: NOT BUILT, NOT DESIGNED — BROUGHT FORWARD by his D946 (16 Oct 26): the Remarks box only his own words, "till <date>" shown by default from the dates already picked, always after the remark; its questions drawn and put to him first, then built.)* He also saw the fault that a window opened from a day already picked shows no "till" until a date is tapped again (D946 reading 1). *(Was: its own job, after `[INPUTS-VET]`; its questions are put to him first.)* Today the Inputs page and the Leave War's link write "till 17 Jul" into an input's remarks when its dates are picked (his rule of August 2026 — "so a reader sees how long it runs without anyone typing it"; `engine/inputs.ts remarksDateTail`, `withRemarksTail`) and rewrite it when the dates change. Step 1 (D728, with `[INPUTS-VET]`) only stops the CARD repeating it. Step 2: remarks hold what a person typed, and the schedule's row, the desktop list and the card each print the end date from the input's dates.
**Why it is its own job:** the schedule's row takes its "till" from the remark, so this changes what a published day prints and what an amendment counts as a change (D189 — a stretched leave reads "1 pending" on the published days it covers because the printed note changed); the Leave War's link reads the remark's date word too (`leavewar/sync.ts`). FULL check.
**To ask him first:** where the date stands on the schedule's row (after the remark, or in the row's own time cell); whether a one-day input still says "till <that day>" (his 18 Aug 26 rule) once it is printed, not typed; what an export prints. **Seen by the leftovers' walk (14 Oct 26), for that question:** on the List's "+ Input", a kind chosen and ONE date picked writes "till 16 Jul" into the Remarks of a one-day, one-hour Appointment — a commitment, not an absence (`raptor-port/docs/img/handpass/2026-10-14-leftovers/A4-list-added-phone.png`); whether that is his 18 Aug rule at work or the form carrying a leave's words over to another kind is to be read before this job starts — not checked.
**Place:** the agent's — after `[INPUTS-VET]` is merged, before the Tracker batch unless he says otherwise.


*Moved here 2026-10-17 by backlog-archive.mjs ([CAPS-SWEEP]). Forward facts: `raptor-port/docs/doc-budget.md`.*

### [CAPS-SWEEP] The other notes and records written in capitals for emphasis, turned into ordinary letters (his direction, D972, 17 Oct 26)

**Status: OPEN — after [CONTEXT-START-SIZE]; a cheaper model does the work, a fresh reader checks it. SCOPE (D973, his "Yes agreeed"): only `OUTSTANDING.md`, `raptor-port/docs/ui-contracts.md` and `raptor-port/docs/engine-rules.md` — about 4,500 tokens in all; the archives (only searched) are left.** The same method as the rulings (D970): a script that keeps every word and changes only the letter case, learning each word's ordinary form from the repo's own prose, every changed line checked equal in lower case. Never the app's own text, button labels, code, his quoted words, bracketed backlog tags or the marks the tools read. Ranked by what each file saves and how often it is read (the survey of 17 Oct 26 is in the start-size job's `HANDOFF.md` block). Sonnet 5.5 runs it (D588); a fresh Opus reader samples it for a lost name or short form. **Place:** after [CONTEXT-START-SIZE], before [PUSH-LOCK-GUARD].


*Moved here 2026-10-17 by backlog-archive.mjs ([PUSH-LOCK-GUARD]). Forward facts: `raptor-port/docs/gates-and-deploy.md`.*

### [PUSH-LOCK-GUARD] An automatic guard that refuses a push while the checks run or a push to main, and takes the PC lock by itself (D969, 17 Oct 26)

**Status: DONE 17 Oct 26 on `claude/sharp-goldberg-6d0656` (his "As recommended for all", D976)** — `.claude/hooks/push-guard.mjs` and `gatelock.mjs exec`, 30 tests, three fresh reads; how it works: `raptor-port/docs/gates-and-deploy.md`; the reads' low-likelihood leftovers: [PUSH-GUARD-LEFTOVERS].

**Status: OPEN — filed, not designed; its own small job, after [CONTEXT-START-SIZE].** Option H of the start-size page: a hook (a "mod", in his word) before `git push` that refuses while a run of the branch's last pushed commit is queued or in progress (D151, [RUN-CHECK-BOTH-RUNS]) and refuses any push to `main` (D60); and one that takes and releases the PC lock around the full checks (D228). Worth it for reliability, not for room (under half a point). Changing `.claude/hooks/` and the settings needs his word for that change and its read (D70, as D878 was). **Place:** after [CONTEXT-START-SIZE].


*Moved here 2026-10-17 by backlog-archive.mjs ([MED-NEWYEAR]). Forward facts: `raptor-port/docs/handpass/2026-10-17-med-newyear.md`, `raptor-port/e2e/medical.spec.ts`.*

### [MED-NEWYEAR] A medical input that runs across New Year never shows on the Medical tab (found 17 Oct 26, not fixed)

**CLOSED 17 Oct 26 — not a fault of the app (`claude/medical-newyear-display-298bb6`).** Filed through the window ("+ Medical"), a downchit for 28 Dec – 3 Jan saves its end as "Jan 3 2027" and the Medical tab shows it under Medically Down on 30 Dec and 2 Jan and under Pending Upchit on 5 Jan — walked at phone and desktop with pictures (`raptor-port/docs/handpass/2026-10-17-med-newyear.md`) and pinned by a browser test (`raptor-port/e2e/medical.spec.ts`, "[MED-NEWYEAR] …"). The fault below happens only to a row stored WITHOUT the end's year, which every door of the app now writes with it (since 12 Aug 26); the row that showed it was planted by a test straight into the data. By D56 not a finding; no app code changed. The calculation was deliberately not made to turn a yearless end into the next year: the schedule's own reading of an input does not, and turning only one would put a man down on the Medical tab while the schedule shows him free.
**Status: OPEN — found by the Medical cards job's fix read (`claude/sharp-goldberg-6d0656`), older than that job; its own fix.**
A downchit filed for 28 Dec – 3 Jan is never in Medically Down or Pending Upchit on any "as of" date: the Medical tab reads
an entry's end in its START's year (`raptor-port/src/engine/medical.ts` `medEndOrd` — `dateOrd(endDate, yr)`), so the end
falls before the start and the entry covers no day. The card's own words already handle it (`MedicalView.tsx` `spanOf`
moves an earlier end into the next year), and so do the Inputs pages; only this calculation does not. **Not a demo-data
case (D56):** a new filing across New Year is hurt the same way. **The fix:** `medEndOrd` (and every reader of it —
`medDownAsOf`, `pendingUpchits`, `medEpisode`) takes an end label earlier than its start as the next year, as `spanOf` does;
an engine change, so the rules-engine doctrine and a test across the year, then a walk of the Medical tab "as of" 30 Dec
and 2 Jan. **Place:** after pull request 524; small; no question for him.


*Moved here 2026-10-17 by backlog-archive.mjs ([PUSH-GUARD-LEFTOVERS]). Forward facts: `raptor-port/docs/handpass/2026-10-17-small-fixes.md`, `raptor-port/docs/gates-and-deploy.md`.*

### [PUSH-GUARD-LEFTOVERS] The push-and-lock guard's low-likelihood gaps, left by its third fresh read (17 Oct 26)

**DONE 17 Oct 26 on `claude/small-fixes-1017`:** all four fixed, each with a test that fails without it; two fresh Opus reads of the fix (round 1: a regression and four gaps, all fixed; round 2: two small gaps, fixed). The record: `raptor-port/docs/handpass/2026-10-17-small-fixes.md`; what the guard reads now: `raptor-port/docs/gates-and-deploy.md`.
**Status: OPEN — small; no question for him.** The guard ([PUSH-LOCK-GUARD], D976, `.claude/hooks/push-guard.mjs`) went on after three fresh reads; the third read's must-fix and quick items were fixed, these were left: (1) a quoted argument that begins with `>` or `<` (`-t ">8h rest"`) is taken for a redirect, so the refusal's suggested command drops it — mark words that held a quote and test the redirect only on the others; (2) PowerShell's doubled quote inside single quotes (`'it''s'`) is read as two quotes, and the suggested command re-quotes with double quotes, so `$x` would expand — read `''` as one literal quote and write the suggestion with single quotes; (3) pushes to main still unread: `B=main; git push origin $B`, `echo main | xargs git push origin`, and bash's `$'…'` quote (its `\'` is escaped) swallowing the rest of a line; (4) in `gatelock.mjs` breakLock, a third waiter making the folder in the instant it is renamed aside leaves the original unrestorable. Each with a test in `push-guard.test.mjs`. **Place:** whenever the guard is next touched.


*Moved here 2026-10-17 by backlog-archive.mjs ([INPUTS-LIST-NEXT-YEAR]). Forward facts: `raptor-port/docs/handpass/2026-10-17-small-fixes.md`, `raptor-port/src/ui/InputsPage.tsx`.*

### [INPUTS-LIST-NEXT-YEAR] The Inputs list reads a next-year input as this year's (found 8 Oct 26) — OPEN, not started

**DONE 17 Oct 26 on `claude/small-fixes-1017`:** reproduced with a leave built by the Leave War's own write (it also stood inside this year's two-week window, as if the man were away now); the desktop list reads every date with the row's own year — test first, walked before and after (`raptor-port/docs/handpass/2026-10-17-small-fixes.md`). The phone list was already right. Left: the remark's "till <date>" without its year — [TILL-NEXT-YEAR].
**What was seen, in the running build (8 Oct 26, while writing the browser test of the Inputs list's Undo landing):** with
the list on "All dates", the demo squadron's OIL input for 15 Feb 2027 (the one the 2027 leave period carries) is shown as
"15 Feb" — no year — and sits between this year's 17 Jan and 2 Mar rows. Saved once through the row's own editor (only
its remarks changed) it then reads "15 Feb 2027" and moves to the foot of the list, where it belongs.

**The cause, read in the code, NOT yet reproduced through the Leave War's own Approve:** an input keeps its date as a
label and an anchor year (`yr`); the Leave War's approval writes the label WITHOUT a year and the anchor year beside it
(`raptor-port/src/leavewar/absences.ts isoToInputDate` / `inputRowFor`), and the list orders its rows by the label alone
(`raptor-port/src/ui/InputsPage.tsx SORTKEY.start` / `.end` — `unfmt(r.date)`, never `r.yr`). So a leave approved on a
NEXT year's period would be listed among this year's dates, without its year, until someone edits it. New data, not only
the demo's — which is why it is filed and not left under D56. The schedule and the Leave War read the anchor year and
are right; whether the list's date window ("Next 2 weeks") also misreads it is to check with it.

**To do:** reproduce it first through the app's own controls (make a 2027 period, approve a leave on it, open Inputs →
List → All dates); then order, print and window the list by the label WITH its anchor year (`dateOrd(r.date, r.yr)` is
the app's one reading of the two); a test first. **Its place:** with step 5 of the calendar job — the Inputs calendar —
which rebuilds the Inputs screens and keeps the List behind one switch (D490: an area's small finds ride the batch that
touches the area). Not a fault that harms a published record or OIL: the input itself is right.


*Moved here 2026-10-17 by backlog-archive.mjs ([TRK-FLIGHT-LABEL-READABILITY]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [TRK-FLIGHT-LABEL-READABILITY] Make the words inside blue flight balls easier to read — D560, 4 Oct 26
Owner's private Photo 1 shows the Tracker Flow chart's blue flight symbols with text hard to read inside the narrow
wing. He asks for a shape redesign, suggests more wing surface for the label and contrast, invokes Impeccable, then
says he has more tasks and to hold on. **Status:** first build checked; D564 rejects its blocky wide-wing design and asks for better numbered options. D565 tapered redraw accepted D566 "Yes, use this tapered wing"; chosen replacement built, current native walk29PASS/18opened/0errors; all normal gates and independent final R1PASS. Completed Logic/Insights fixes retained. Branch preview shipping follows completed fresh read.
Rejected first wing/evidence retained privately. D566 chosen tapered wing implemented; retain historical alternatives privately. No whole-ball size, palette or font-scope extension approved.
**Home:** `raptor-port/docs/ui-contracts.md` The Tracker tab (D560); short/full Tracker ruling.
**Place:** current workflow UI pass, together with Logic/Insights under D563. Preserve authored charts/details (D464), Raptor palette (D157) and existing chart behaviour. Private photo stays
outside the repo; no student names, marks or dates copied into records. Numbered phone/desktop pictures before build.
This is separate from [TRK-KEY-NAME-CLIP] and [TRK-FLEXBAR-INK], and does not start the progress graph or file split.

**Tracker wing design:** `raptor-port/docs/superpowers/specs/2026-10-04-interface-readability-scroll.md`; **build plan:** `raptor-port/docs/superpowers/plans/2026-10-04-interface-readability-scroll-build-plan.md` (Astra plan; independent Sol challenge PASS; runtime/final read in the combined handpass).

**D564 replacement options:** `raptor-port/docs/superpowers/specs/2026-10-04-flight-centre-options.md`; private pictured host variants and independent corrected-font confirmation in `raptor-port/docs/handpass/2026-10-04-flight-centre-options-picture-read.md`. D565 now proposes a tapered leading-edge wing based on an annotated smooth-wing picture; original host recommendation3 is superseded. D566 subsequently accepts the exact final redraw; earlier options remain historical.

**D565 tapered redraw:** `raptor-port/docs/superpowers/specs/2026-10-04-flight-leading-edge-taper.md`; independent Sol challenge/picture read in `raptor-port/docs/handpass/2026-10-04-flight-leading-edge-taper-picture-read.md`. Both-size specific picture shown and accepted D566; chosen replacement implemented; refreshed gates and separate fresh final R1PASS. No further shape-choice question pending.


*Moved here 2026-10-17 by backlog-archive.mjs ([TRK-ATTEMPTS]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [TRK-ATTEMPTS] Keep a student's attempt history — OPEN (small, feature)
Remember a student's *earlier* tries at an event, not just the latest grade. More a
new feature than a cleanup. (Verified open: no attempt-history in `tracker/`.)
- **Model:** build on Opus, default; small, clear spec.


*Moved here 2026-10-17 by backlog-archive.mjs ([TRK-SAVE-FAIL-SAYS-SAVED]). Forward facts: `raptor-port/docs/handpass/2026-10-17-tracker-batch.md`.*

### [TRK-SAVE-FAIL-SAYS-SAVED] Inside Raptor the Tracker says "saved" when the save failed (filed 28 Sep 26)
**BUILT 17 Oct 26 (TRK-SAVE-FAIL-SAYS-SAVED) with the Tracker batch (D495) on `claude/tracker-batch-d495-affb5f`, FULL-checked — `raptor-port/docs/handpass/2026-10-17-tracker-batch.md`; archived once his "merge live" lands.**
**Place:** low — with `[DB-READINESS]` (honest refusals and saves in small pieces are that batch's job). Found by the
Tracker leftovers' walk (walker c, F3; pictures `…/walk/lo-2c-b07-1200.png`, `…-b07-390.png`): with storage refusing
writes, ✓ Save changes turned the Tracker's corner green — "● syllabus “2026” saved …" — beside Raptor's "Not saved —
Retry". Raptor's in-memory store accepts the write and only its background saver fails, so the Tracker never hears of
it; its red error words can only fire for a failed Export. Nothing is lost if Retry is pressed (walked). **Do:** let the
Tracker's save status follow the storage seam's real outcome (the whiteboard's pending / failed state), so a failed save
never reads "saved" anywhere.


*Moved here 2026-10-17 by backlog-archive.mjs ([TRK-KEY-NAME-CLIP]). Forward facts: `raptor-port/docs/handpass/2026-10-17-tracker-batch.md`.*

### [TRK-KEY-NAME-CLIP] A longer student name on the left of the Students card's key is cut off at the card's edge (filed 30 Sep 26)
**BUILT 17 Oct 26 (TRK-KEY-NAME-CLIP) with the Tracker batch (D495) on `claude/tracker-batch-d495-affb5f`, FULL-checked — `raptor-port/docs/handpass/2026-10-17-tracker-batch.md`; archived once his "merge live" lands.**
**Place:** low — with the next Tracker change. Seen by the `[DB-READINESS]` group A phase 5b walk
(`raptor-port/docs/img/handpass/2026-09-30-dbr-phase5b/1-old-tracker-his-work.png` and `2-new-…`): with three students on
a chart the key around the course ball puts the third name on the LEFT, and "HIS STUDENT" reads "IIS STUDENT" — its first
letter under the card's edge. On `main` too (the first picture is main's build), so not the phase's doing; a real
callsign of ten or more letters would lose its first letters the same way. **Do:** keep every name of the key inside the
card (shrink the name, or wrap it under the ball, on the left as the right does), and check at the phone width too.


*Moved here 2026-10-17 by backlog-archive.mjs ([TRK-UNDO-WRITES-DEFAULTS]). Forward facts: `raptor-port/docs/handpass/2026-10-17-tracker-batch.md`.*

### [TRK-UNDO-WRITES-DEFAULTS] The first Tracker Undo of a mark stores a pace, lulls and dates nobody set (filed 30 Sep 26)
**BUILT 17 Oct 26 (TRK-UNDO-WRITES-DEFAULTS) with the Tracker batch (D495) on `claude/tracker-batch-d495-affb5f`, FULL-checked — `raptor-port/docs/handpass/2026-10-17-tracker-batch.md`; archived once his "merge live" lands.**
**Place:** low — with the next Tracker change. Seen by the group-A FULL walk (W5 D2b, F2c; `scripts/handpass/dbrA-W5-probe3.mjs`):
a fresh world, one mark, ↶ — the undo writes `…:pace:<student>` = `{epw:2}`, `…:lulls:<student>` = `[]`, the chart's dates
record for him, and leaves his marks row as `{}` instead of removing it; later undos write only the mark. Nothing changes
on screen (the stored values ARE the defaults), but Export and the database gain records nobody made. Probably on `main`
too (the same undo snapshot, D372). **Do:** the undo's snapshot restores only what the step changed — a record the
student never had is removed, not written as its default.


*Moved here 2026-10-17 by backlog-archive.mjs ([TRK-REMOUNT-LANDING]). Forward facts: `raptor-port/docs/handpass/2026-10-17-tracker-batch.md`.*

### [TRK-REMOUNT-LANDING] Coming back to the Tracker the chart lands at its top corner, or with empty chart above (filed 28 Sep 26)
**BUILT 17 Oct 26 (TRK-REMOUNT-LANDING — the landing after a Log out and in; no empty space above the chart's start — D984, his "As recommended B", narrowing his 9 Sep ask to centre) with the Tracker batch (D495) on `claude/tracker-batch-d495-affb5f`, FULL-checked — `raptor-port/docs/handpass/2026-10-17-tracker-batch.md`; archived once his "merge live" lands.**
**Place:** low — with the next Tracker change. Seen by the Tracker leftovers' walk, both walkers (walker a obs. 3 —
the same person out and in, the chart jumps from the centred first ball to the top corner, scroll 73 → 396, phone
36 → 352, `…/walk/lo-2a-D07b…`, `…-D07c…`; walker c — at 390 a reopened Tracker, centred on the last-marked ball, shows
~240px of empty chart above ST-01, `…/walk/lo-2c-e09…`). The existing remount drawing (App.jsx's ready effect redraws
without landing), not the per-person pick (D376). **Do:** land a remounted chart the way a pick lands it (the last
mark, else the first event), and check the phone's landing leaves no empty band above the first ball.


*Moved here 2026-10-17 by backlog-archive.mjs ([TRK-WIREBOARD-REPEAT]). Forward facts: `raptor-port/docs/handpass/2026-10-17-tracker-batch.md`.*

### [TRK-WIREBOARD-REPEAT] Every ball moved in Edit chart layout re-wires the chart, so a wheel step zooms n+1 times after n moves (found the night of 15 Oct 26 by the fresh Opus read of `[DRAG-EDGE-SCROLL-ELSEWHERE]`; older) — OPEN
**BUILT 17 Oct 26 (TRK-WIREBOARD-REPEAT) with the Tracker batch (D495) on `claude/tracker-batch-d495-affb5f`, FULL-checked — `raptor-port/docs/handpass/2026-10-17-tracker-batch.md`; archived once his "merge live" lands.**
**Seen in the code, not walked:** `endDrag` (`src/tracker/app/core.js`) ends with `wireBoard()`, which adds the canvas's `wheel`, click and pan listeners again each time (named handlers are not doubled; arrow functions are). The bend square had the same fault and was fixed that night (`renderBoard()` on its release, F1). **Fix:** `renderBoard()` there too, or `wireBoard` marking what it has wired. **To do:** a test of the wheel after two moves, red first. **Place (the agent's):** with the next Tracker batch.


*Moved here 2026-10-17 by backlog-archive.mjs ([TRK-BALL-OFF-CHART-LEFT]). Forward facts: `raptor-port/docs/handpass/2026-10-17-tracker-batch.md`.*

### [TRK-BALL-OFF-CHART-LEFT] A ball or line handle dropped left of or above the chart's start is cut off the chart outside Edit chart layout, and ⤢ Fit cannot bring it back (found the night of 15 Oct 26 by the round-two read; older) — OPEN
**BUILT 17 Oct 26 (TRK-BALL-OFF-CHART-LEFT) with the Tracker batch (D495) on `claude/tracker-batch-d495-affb5f`, FULL-checked — `raptor-port/docs/handpass/2026-10-17-tracker-batch.md`; archived once his "merge live" lands.**
**Seen in the code:** the chart is drawn from 0 rightward and down only (`bounds()`); right after ⤢ Fit the view shows room left of and above it, and a thing dropped there gets a negative place. The night's edge pan was made to stop at the chart's start (F2), but a drop into that room needs no pan. **Fix:** clamp a dropped position to the chart's start (a ball's centre at least its radius) in the ball, group and line-handle moves. **To do:** a walk step, red first. **Place (the agent's):** with the next Tracker batch.


*Moved here 2026-10-17 by backlog-archive.mjs ([TRK-FLEXBAR-INK]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [TRK-FLEXBAR-INK] The Tracker's Currency & Flex bars print white words on green and amber — hard to read (filed 26 Sep 26)
**BUILT 17 Oct 26 (TRK-FLEXBAR-INK) with the Tracker batch (D495) on `claude/tracker-batch-d495-affb5f`, FULL-checked — `raptor-port/docs/handpass/2026-10-17-tracker-batch.md`; archived once his "merge live" lands.**
**ANSWERED 17 Oct 26 — D982 ("As recommended", round 1):** dark words on the green, amber and red bars, white on grey; to build with the Tracker batch.
Found by the `[TRK-PALETTE-ASK]` walk (evidence `raptor-port/docs/handpass/2026-09-26-trk-palette.md` §7 F4). The bars
under Currency & Flex ("Current — no flex required", "1 Optional Flex", "Landing Current — No IP Required") are a
coloured fill with WHITE words (`tracker.css .flexbar{color:#fff}`; the fill comes from `app/core.js`'s flex and
currency functions). White on the green reads ~2.1:1 and on the amber ~2.1:1, against a floor of 4.5:1; the red 3.4:1,
the grey 6.2:1. **Not new:** before D157 the same bars read 1.9 / 2.2 / 3.7:1. **Recommended:** dark words (Raptor's
`--bg`) on the green, amber and red bars, white only on the grey — the recipe Raptor's own amber chips use; the functions
return an ink with the colour. A design choice, so his: it is question 4 on that branch's look card. LOOK tier.
**Place:** after his answer; low, none blocking.


*Moved here 2026-10-17 by backlog-archive.mjs ([POST-OUT-TRACKER]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [POST-OUT-TRACKER] A deleted man and the Tracker's courses "still running" (D299 — approved, NOT built; filed 27 Sep 26)
**BUILT 17 Oct 26 (POST-OUT-TRACKER) with the Tracker batch (D495) on `claude/tracker-batch-d495-affb5f`, FULL-checked — `raptor-port/docs/handpass/2026-10-17-tracker-batch.md`; archived once his "merge live" lands.**
**ANSWERED 17 Oct 26 — D981 ("As recommended", round 1):** he leaves every course on which he still has an event neither done nor N.A.; he stays, his record kept, where all of his are; to build with the Tracker batch.
D299 lists "his place on any course still running — goes". The Tracker has no notion of a course "still running", and the
build cannot decide what it means without him, so a deleted man is left on his Tracker courses, unlinked (his name as
text). **Put to him on the `[POST-OUT-OUTCOMES]` look card (question 5):** what makes a course still running — or leave
his name on his courses for now (then D299 is narrowed in his words). **Place:** after `[POST-OUT-OUTCOMES]` merges, on
his answer. Touches `raptor-port/src/tracker/` (its own store) — its own small check.

*Moved here 2026-10-17 by backlog-archive.mjs ([TRK-KBD-CHART]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [TRK-KBD-CHART] The Tracker's chart and its marking pop-up cannot be used by keyboard (filed 13 Oct 26, the design look's K5, K6) — OPEN, a job of its own, his to place; older than the date boxes
**BUILT 17 Oct 26 (TRK-KBD-CHART) with the Tracker batch (D495) on `claude/tracker-batch-d495-affb5f`, FULL-checked — `raptor-port/docs/handpass/2026-10-17-tracker-batch.md`; archived once his "merge live" lands.**
**ANSWERED 17 Oct 26 — D980 ("As recommended", round 1):** one Tab into the chart, the arrows follow its lines, Enter opens marking with the keyboard inside, Escape back to the event; to build with the Tracker batch.
**Found by `[DESIGN-LOOK-13OCT]`, not fixed — older than 13 Oct.** None of the chart's 210 events is a Tab stop, so an event cannot be opened or marked without a mouse or a finger; the marking pop-up, opened by a click, does not take the keyboard (Tab goes to the page behind it) and Escape closes it leaving the keyboard on nothing. The pop-up's two date boxes and the side panel's boxes and their ✕ DO work by keyboard (built 13 Oct). **To design:** how the keyboard walks a chart (by its arrows along the flow, not 210 Tab stops), Enter opening the pop-up with the keyboard inside it, Escape returning to the event. With the Tracker's next batch (D490).


*Moved here 2026-10-18 by backlog-archive.mjs ([TRK-SCROLL-GLIDE]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [TRK-SCROLL-GLIDE] On a phone, a finger scroll of the Tracker's chart and Info half stops dead when the finger lifts — it should glide (his ask, 17 Oct 26 — D985) — BUILT 17 Oct 26 on `claude/trk-scroll-glide` (D986–D989), LIVE 17 Oct 26 (pull request 531, his "merge live")
**Built and checked (17 Oct 26):** evidence `raptor-port/docs/handpass/2026-10-17-trk-glide.md` — the walk 42/42, two blind Opus reads (11 findings, all fixed), breaks 11/15 with readings. Leaves for the archive once live.
**His words (17 Oct 26):** "I want the scroll to have acceleration and deceleration when I scroll on my phone"; then "Yes as
mentioned" to the reading that he meant the Tracker's chart and its Info half, built in a fresh chat after pull request 530 —
which went live the same evening. **Ruled:** D985 (`.claude/rules/decisions/tracker.md`).
**What is there today:** both places are scrolled by the Tracker's own finger-drag (`dragScroll` in
`raptor-port/src/tracker/app/core.js`, wired to the chart's board and to the side panel in `components/SidePanel.jsx`): the view
follows the finger exactly and stops at the lift. The rest of the app is scrolled by the phone itself and already glides.
**Before building — his questions, in one short round with recommendations and pictures (D853):** how a flick should feel
(the phone's own feel is the natural target); what stops a glide (a new touch, reaching the chart's edge, a pinch); whether a
mouse drag on a desktop glides too or only a finger. **Watch:** the pinch and its take-back (D134), the edge pan of Edit chart
layout (D899 — Edit chart layout pans the canvas, not this scroll), the landing (D984), a tap after a drag still swallowed;
his phone is an iPhone (measure the feel there — his look). **Check:** FULL is likely (a new gesture on the most-used
Tracker surface); Opus, high thinking.
**Round 1 put to him (17 Oct 26):** three questions with pictures — a touch during a glide, a bounce at the end, a mouse drag
on a desktop — `raptor-port/docs/mock/2026-10-17-trk-glide-r1/index.html` (https://claude.ai/artifact/DaEXWjGkxuctqtYutzbVbx).
Checked first in the running app at phone size: a flick on the chart and on Info both stop dead at the lift.


*Moved here 2026-10-18 by backlog-archive.mjs ([TRK-CHART-FPS]). Forward facts: `raptor-port/docs/ui-contracts.md`.*

### [TRK-CHART-FPS] The Tracker's chart looks choppy (a low frame rate) when it moves on his iPhone (his report, 17 Oct 26 — D990, replaced by D992) — BUILT 18 Oct 26 on `claude/trk-chart-fps`, waiting for his look and "merge live"
**His words (17 Oct 26):** "The chart is less fps I noticed"; then "We can do • A small, safe step". **Ruled:** D990 (`.claude/rules/decisions/tracker.md`). **His answer, 17 Oct 26:** "Not sure I think b" — he leans to B: the chart was always choppier (than Info, than other apps), not made worse by the glide — so look first at the chart's own drawing as it moves. **Built 18 Oct 26 (D992):** on a phone the chart and the Info half are the phone's own scroll; the pinch is one transform while the fingers move and one layout at the lift — the pinch from about 12 to 30 frames a second with the computer slowed 4× (59 at ½ speed, from 24); walked 21 of 21, three fresh code reads (seven faults fixed red first, one declined, one limit said plainly: a touch-screen laptop). Evidence `raptor-port/docs/handpass/2026-10-18-trk-chart-fps.md`; its look card is the last section. **Answered 17 Oct 26 (the job's first round):** "The chart scrolling" — the finger scroll (the drag and its glide), not the pinch; "iPhone 17 pro" — a 120-frame screen. **Found the same day:** Safari on a 120-frame iPhone draws a page's own animation at about 60 frames a second by default (its "Prefer Page Rendering Updates near 60fps" setting, on unless switched off), while the iPhone's own scrolling runs at 120 — and the chart's scroll is the app's own (the glide), so it is held at 60 whatever the drawing costs. Put to him: a one-minute test on his phone with that setting off, to tell the 60-frame limit from slow drawing before the small step is built. **He uses Chrome on the iPhone (17 Oct 26):** Chrome there is WebKit underneath and holds a page's own motion near 60 frames with no setting to lift it — so the small step cannot pass 60 for him; only the iPhone's own scrolling (the big step) reaches 120. Put to him: the test in Safari to confirm, or straight to the big step, costed first. **His test (17 Oct 26):** "Ok it's smoother now on safari" — the 60-frame limit is the cause; the big step, costed, put to him. **And (18 Oct 26):** "The scroll is smoother than the pinch. The pinch feels like slower FPS" — the pinch is a second fault: it lays the whole chart out again at every step of the fingers; measured, then put to him with the big step. D991 (18 Oct 26): speed is part of how good the app feels. **Measured 18 Oct 26** (390 × 844, a finger through Chromium's touch input, the CPU slowed 4×, the built app): the finger scroll holds 60 frames (no frame over 33 thousandths of a second); the pinch drops to about 12 (82 of 175 frames over 33, the worst 217) — each step of the fingers lays the whole chart out again (the CSS zoom, about 80 thousandths a step against 33 for a scroll step), while scaling the chart as a picture costs what a scroll step does (33). So: the scroll is held by the 60-frame limit only; the pinch by its own drawing. Put to him: the big step for the scroll (both halves) and the pinch scaled as a picture while the fingers move, laid out sharp at the lift.
**The job:** measure the chart's frame time on a phone-sized, slowed-down browser (each motion, before and after); then the small step — the chart's moving content held ready by the browser so a move does not redraw it, and the glide's per-frame work (it reads the scroll range each frame; a stretch reads each child's style) kept as light as it can be; never a change to what the chart shows. The big step (the iPhone scrolling the chart itself, the pinch rebuilt round it) only if he still finds it choppy, put to him with its cost. **Check:** WALK tier at least (the glide's walk `raptor-port/scripts/handpass/trk-glide-walk.mjs` re-run; `raptor-port/docs/performance.md` Part 1's checklist); his look on his iPhone.


*Moved here 2026-10-18 by backlog-archive.mjs ([PHONE-WIDE-BOARD-BLANK]). Forward facts: `raptor-port/docs/handpass/2026-10-18-sched-phone.md`.*

### [PHONE-WIDE-BOARD-BLANK] On a phone, the board's Desktop layout shows nothing below the sign-off (found 29 Sep 26)
Found by the change-recording re-test's picture check (`raptor-port/docs/handpass/2026-09-28-change-recording.md` §4), and
the same on `main` (measured on the live bundle): at 390×844, the board → ⋯ (on `main` the bar's own switch) → Desktop
layout lays the board out 1180px wide, but every section of the day (`.sb-sec`) is drawn 0px wide at x≈830, so below the
sign-off the screen is empty; the bar's buttons sit off to the right (pan sideways, as its bubble says). A scheduler who
picks it on a phone sees a blank day. **To do:** find why the sections collapse in the wide layout under 820px (the
phone's own grid rules probably still apply), then walk it at 390 and 844×390 with both layouts. WALK tier. **Place:**
medium; any time, none blocking.
4 Oct diagnostic on the unchanged workflow bundle confirms the first cause: phone
`display:contents` on the board wrapper survives Desktop layout's horizontal parent.
All ten sections are0px at390/820,832px at821/844 landscape; Phone layout restores346px.
At that diagnostic, candidate only: restore the wide wrapper's flex column, then
verify widths, actual panning and return/Done. No repair built or picture approved
in that investigation. Evidence:
`raptor-port/docs/handpass/2026-10-04-workflow-ui-investigation.md` §Phone Desktop layout.
**D548, 4 Oct:** owner selected this repair only: "Just fix the desktop layout on
a phone. The rest don't fix it it's fine". Retain the existing Desktop layout,
sideways navigation, Phone return and Done. Candidate pictures and independent
plan challenge preceded the source edit. Repair built: only wide wrapper's
`display:flex`; original regression red then green; WALK26 inspected final originals,
10 section headers/8 real-row hits plus Available/SANS grid proof, native toolbar
touch pan, independent crew/schedule scrolling and Phone return/Done. Normal phone
and desktop geometry unchanged. Five repair gates/relevant checks and fresh Astra
read are in `raptor-port/docs/handpass/2026-10-04-phone-desktop-board-repair.md`.
Physical Safari/full-area touch and absent guest/issued fixture remain qualified.
**D549, 4 Oct:** owner accepts the delivered repair preview: "looks good, whats the next task".
Owner-look step passed, without device-specific Safari verification or broader UI approval.
Not main/live; item remains open for Claude's Monday read and authorized merge.
**CLOSED 18 Oct 26 (D994's first batch):** the read it waited for was done in the Codex stack's check of 5 Oct 26
(`raptor-port/docs/handpass/2026-10-05-codex-stack-check.md`, D548's row — PASS; W13 and W18 fixed in that layout), and
the repair went live with the stack on 6 Oct 26. Measured on the build of 18 Oct 26: all ten sections 816px wide at 390 ×
844, the day drawn below the sign-off (`raptor-port/docs/handpass/2026-10-18-sched-phone.md`); pinned by
`raptor-port/e2e/geometry.spec.ts` (D548's test). His iPhone look by finger stays on that check's look card.


*Moved here 2026-10-18 by backlog-archive.mjs ([LOAD-MSG-SHORT]). Forward facts: `raptor-port/docs/superpowers/briefs/2026-10-18-sixteen-questions.md`.*

### [LOAD-MSG-SHORT] The line shown after "Load onto working copy" is long — a shorter two-line version? — a question for him (filed 1 Oct 26)
**His question, 30 Sep 26** (on the group-A branch's look): what the long message after "Load onto working copy" was. It is
the one sentence that load writes to the screen AND to the change history (`raptor-port/src/ui/interactions.ts`, the
`data-restore` branch): "<day>: <version> loaded onto the working copy — viewers still see <version> until you publish ·
N unpublished edits replaced · N requests also cover another day — left as filed · N requests came back onto the programme
with their row — <days> read that too …" — each clause a real fact the load could not otherwise say (D98, D175, D363), so
none can simply be dropped. **Offered to him, unanswered:** a shorter two-line version on screen (the first line what was
loaded and what viewers still see; the second "N things to know ▾" opening the rest), the full sentence kept in the change
history. **Place:** low — his call; its own small job (WALK tier: a message on a shared surface), never inside another change.
Carried here from the merged `claude/db-readiness-table-shaping-4094f6` handoff block when it was removed (1 Oct 26).


*Moved here 2026-10-18 by backlog-archive.mjs ([TRK-DATEBOX-SAFARI-ZOOM]). Forward facts: `raptor-port/docs/superpowers/briefs/2026-10-18-sixteen-questions.md`.*

### [TRK-DATEBOX-SAFARI-ZOOM] In Safari between 621 and 1050px wide, is the calendar placed under its box in the Tracker's side panel? (raised 13 Oct 26 by the read of `[TRK-DATE-BOXES]`) — OPEN, unproved, low
**CLOSED 18 Oct 26 — his look on his iPhone in Safari, sideways: "15 yes it does" — the calendar opens under its box.**
**Not proved in the Tracker batch (17 Oct 26):** there is no Safari on this PC to run it in — on his look card, for his iPad or iPhone.

**Raised by reading, NOT reproduced — no Safari to run it in.** Between 621 and 1050px wide (an iPad upright, a narrow desktop Safari window) the Tracker's side panel is drawn zoomed (`raptor-port/src/tracker/tracker.css`, the panel's `zoom`; its own − / + too), and the app's date box places its calendar from where the box measures itself (`raptor-port/src/ui/DateBox.tsx`). Chromium reports a zoomed box's place rightly; Safari may not, and the calendar would then open away from its box. A phone is not affected (its calendar is centred by the stylesheet), nor a desktop wider than 1050px at the panel's 100%. **To do:** open Upchit in the Tracker on an iPad or in desktop Safari at about 800px wide and see where the calendar sits; if it is off, place the card from the box's place divided by the zoom in force. The read: `raptor-port/docs/handpass/parts/trk-datebox/read-opus.md` (the state table).


*Moved here 2026-10-18 by backlog-archive.mjs ([CAL-PHONE-SWIPE-FIT]). Forward facts: `raptor-port/docs/superpowers/briefs/2026-10-18-sixteen-questions.md`.*

### [CAL-PHONE-SWIPE-FIT] The Calendar window on a phone: swipe between months and years; the From date box that runs off the screen (his find, 13 Oct 26 — D786) — BUILT 13 Oct 26 as step one of `[ONE-DATE-CALENDAR]`, waiting for his look on his iPhone and "MERGE LIVE"

**BUILT 13 Oct 26** on `claude/one-date-calendar-step-one-55ba13` with step one of `[ONE-DATE-CALENDAR]` (now in `OUTSTANDING-ARCHIVE.md` — its check, its pictures, what is left for him): the swipe on the month and the Holidays list, and the From and Until boxes as the app's own. Only his iPhone proves the fit and the feel.

**His words, with two pictures from his iPhone:** *"allow me to swipe as well on the phone to go between months. Likewise for the holidays page to swipe between years. … the from date box is too wide and it doesn’t fit the phone screen width. Can u fix this to fit the phone size which might be variable."* He called the design guide (`/impeccable`) and said to do it after the `[OIL-ASK-NOTIFY]` task is done.

**What to build (D786 — its full row has the readings to tell him):** (1) Inputs ⚙ → Calendar… → Month, on a phone: a sideways swipe on the month goes to the next / the last month — the arrows and "Today" stay (`src/ui/DaysWindow.tsx`). (2) The Holidays list: a sideways swipe goes to the next / the last year (`src/ui/HolidaysPanel.tsx`). (3) The "Every <weekday>" window (`src/ui/EveryWeekday.tsx`): its From date box is wider than the window on his iPhone and is cut at the right edge — it must fit at any phone width (measure 320, 360, 390, 440 and a window narrower than the screen; measure every other box of that window and of the Holidays form the same way). His second picture also shows a sideways scroll bar along the bottom of that window — the same overflow.

**Tier:** WALK (a new gesture; a layout fix) — a phone by real touch, the swipe in both directions, a swipe that starts on a date’s button, a desktop unchanged; his look on his own iPhone (Apple’s font is wider than the PC’s — a fit measured on Windows may not hold for him). Use the design guide (`.claude/skills/impeccable`).

**Place:** his word — after `[OIL-ASK-NOTIFY]`’s check is done. *(Done, and merged 13 Oct 26 — pull request #492: this is the next job, run beside the skills review — D794.)*

**STARTED 13 Oct 26 on `claude/cal-phone-swipe-fit-2affa0` — nothing built; four questions and the picture are with him (D541).** What the reading found: (a) the Inputs calendar and the SANS calendar ALREADY swipe between months, with a short slide (`src/ui/calpick.ts` `SWIPE_MIN`, `src/ui/InputsCal.tsx`, `src/ui/SansCal.tsx`; `raptor-port/docs/ui-contracts.md` §Gestures on the month grid) — the Calendar window copies that recipe, so its feel is not a new choice; (b) the From box (`.every-date`, `src/ui/scheduler/23-days.css`) was ALREADY given "fit" rules on 8 Oct 26 after an earlier picture of his, and his picture of 13 Oct shows it still runs off his iPhone — the fault is the iPhone's own date box, which no Windows browser reproduces (in Chromium at 390 and 320 wide nothing passes the window's edge). **The pictures page:** `raptor-port/docs/mock/cal-swipe-fit.html` (published to him as an Artifact page), its pictures `raptor-port/docs/mock/2026-10-13-cal-swipe-fit/`, drawn by `raptor-port/scripts/handpass/calswipe-mock.mjs` on the real Calendar window at 390 and 320 wide. **The four questions, each with the agent's pick:** (1) the From box — A, the app's own date field ("Thu 5 Nov 2026", a tap opens the small month the holiday form already uses — D671 — under it; the same for Until's "A date") or B, the iPhone's own box forced to fit a second time: *A*; (2) with A, any date may be picked with the window's weekday standing out, or that weekday only: *any date*; (3) the swipe as the Inputs calendar's, anywhere on the month or the Holidays list, a swipe never pressing a date's button: *yes*; (4) the app's other date boxes that are still the phone's own (Admin, the post-in date on Users, the Leave War's bid sheet, a medical input's upchit date) — in this job or not: *not in this job; on his iPhone look list, any that run off filed as a job of their own*. **ANSWERED 13 Oct 26 — D795: (1) A, (2) any date, (3) yes — the pictures are the design of record. (4) not ruled — *"Show me how it looks like first before I decide"*:** drawn the same hour and added to the page as its part 3 (`raptor-port/scripts/handpass/calswipe-mock2.mjs`; pictures `o390-*` in the same folder) — a new person's Post in (Admin → Users; the same box on Restore and on giving access), Admin → Data's "Older than" dates, the Leave War's posting dates ("PO from" / "PI from"); a medical input's upchit date not reached by taps and not pictured. **Found while drawing, to weigh:** the Leave War's posting dates are the phone's own box on purpose (owner, 19 Aug 26 — a posting may be years back or ahead, and the box's own year wheel reaches it; `src/leavewar/ui/BidPicker.tsx`) — the small month moves a month a tap, so it needs a way to jump a year before it can stand there; Admin's "Older than" box is full width, the same shape as the From box that ran off. **Put to him again with the agent's pick:** the simple ones in this job (Post in, Admin's dates, the upchit date), the Leave War's posting dates left until the small month can jump a year. **Next:** his answer to (4) recorded as a ruling, then the build with a failing test first, WALK tier.



*Moved here 2026-10-18 by backlog-archive.mjs ([TRK-PINCH-ASK]). Forward facts: `raptor-port/docs/superpowers/briefs/2026-10-18-sixteen-questions.md`.*

### [TRK-PINCH-ASK] His iPhone look at the pinch fix (24 Sep 26)
**Place:** his next Tracker session — nothing is broken; `[TRK-PINCH-DRAGS-BALL]` merged on D133 without his look.
The two feel questions are ANSWERED — **D134: keep both as built** (a deliberate drag joined by a second finger goes
back; the finger left down after a pinch does nothing). Left: his look card, on his iPhone on the live app:
`raptor-port/docs/handpass/2026-09-23-tracker-pinch-ball.md` §12 — Safari is the one browser no walk here drives, and
one line of the fix (the board holding both fingers) is proven only there.


*Moved here 2026-10-18 by backlog-archive.mjs ([SCHED-INPUT-WINDOW-PHONE]). Forward facts: `raptor-port/docs/handpass/2026-10-18-night-jobs.md`, `raptor-port/docs/ui-contracts.md`.*

### [SCHED-INPUT-WINDOW-PHONE] On a phone the input's window opened from the schedule is short, lets the page scroll behind it, and on a phone on its side "+ Input" runs off the right edge (the one-rule job's walk, share D — D4, D7, 12 Oct 26)
**LIVE 18 Oct 26 (pull request 533, his "merge live"). D996 and D997 BUILT 18 Oct 26 on `claude/window-middle-d996`** — every pop-up window on a phone in the middle (the calendars' day panels and the ALL AVAIL and changes windows at the foot); waiting for his look and "merge live". (1) At 620 wide and under the schedule's own input window is as tall as what is in it up to the visible screen less 24px (D706), in the middle of the screen (his D995, 18 Oct 26 — first built at the foot); (2) a finger on it never scrolls what is behind (D686 — one shared guard, `floatwin.ts holdPageScroll`); (3) the cause of the sideways phone's fault was the Inputs LIST: its 875px table widened the page to 907 between 821 and about 940 wide, so the list now scrolls in its own box at every width. Red first, walked, 4 break tests caught: `raptor-port/docs/handpass/2026-10-18-sched-phone.md`. Only his iPhone proves the top strip under Safari's bars.
**Found, not fixed — for his iPhone look first; then with the look-and-feel pass (`[UI-SLEEK-PASS]`) or the next phone batch.** Three things, all in a test browser's phone (390 × 844 by touch, 390 × 568, 844 × 390): (1) the window a tap on an input's line under Personal Inputs opens on Edit Schedule and the Scheduler Board is 675 px tall of 844 — the same input's window from the Inputs page is 820 — while it holds 1390 px (everyone's pucks since D748); D706 ("as tall as what is in it, up to nearly the whole screen") was built for the Inputs pages' windows and the schedule's own dialog was left as it was. (2) A finger scrolling inside that window on Edit Schedule also scrolls the page behind it (D686 — built and confirmed on his iPhone, D703, for the Inputs pages' windows). (3) At 844 × 390 the app takes its desktop layout and the "+ Input" window sits at x 461–891 on an 844-wide screen: Add and ✕ cannot be reached. None is new in the one-rule job (the dialog and its placement are untouched by it). Pictures: `raptor-port/docs/img/handpass/2026-10-12-one-rule/D/` (`D4-02`, `D4-06`, `D7-844x390-c01`, `D7-390x568-08`).


*Moved here 2026-10-18 by backlog-archive.mjs ([LEDGER-READ-ASK]). Forward facts: `raptor-port/docs/handpass/2026-10-18-night-jobs.md`, `raptor-port/docs/data-model.md`.*

### [LEDGER-READ-ASK] May a member see other men's OIL tracker entries and leave grants? — a question for him (filed 29 Sep 26)
**BUILT 18 Oct 26, the night (branch `claude/window-middle-d996`, pull request 534): the access table (§11) and `state/perms.ts` say every member reads every man's ledger entries; its test `perms.test.ts` "D1008". Leaves for the archive once live.**
**ANSWERED 18 Oct 26 — D1008 ("as recommended"): everyone sees everyone's; widen the access table (§11) and its test.**
Found by both red teams of the `[OIL-AWARD-IS-A-GRANT]` plan (Fable F5, Astra F10): the app has ALWAYS shown every member
every man's OIL tracker (grants and corrections — `OilTracker.tsx` lists every person for both roles) and every man's
figure breakdown with its itemised grants on every pool (owner, 17 Aug 26: "everyone should be able to click on that
person's name and see these logics"), while `raptor-port/docs/data-model.md` §11 — the table IT builds the database's
access rules from — says a member reads only his OWN `LeaveLedger` / `LeaveOpening` rows. The award build settles only the
award (every member reads every man's, D402 — its own row in §11); everything else in the ledger stays as §11 says, with a
note naming this gap. **The question:** should a member see every man's ledger entries (as the app shows today) or only his
own (as §11 says)? If "everyone", §11 and `state/perms.ts` widen; if "own only", the tracker and the breakdown hide other
men's entries from a member. **Also on the grid (the award walk, 29 Sep 26):** a day wearing a "+n" mark opens its day's
list for ANY member, as it always has — so a member can read another man's award reason, "Given by" and "Entered by" there
when that man's day holds two records (two awards, or an award beside his leave); a day holding just his one award opens
nothing (D261's "another man's award stays as today"). Same answer as the ledger's. **Place:** a question for him, before
the tables settle (D354).


*Moved here 2026-10-18 by backlog-archive.mjs ([TRK-IMPORT-REFUSAL-WORDS]). Forward facts: `raptor-port/docs/handpass/2026-10-18-night-jobs.md`.*

### [TRK-IMPORT-REFUSAL-WORDS] A current file's students refused with "saved by an older version" — the wrong reason (found 17 Oct 26 by `[TRK-FILE-TRANSFER-SPLIT]`'s walk; older) — OPEN, his to word
**BUILT 18 Oct 26, the night (branch `claude/window-middle-d996`, pull request 534): wording B for the not-found, deleted-chart and two-onto-one cases (`STUDENT_CHART_MSG`); the older-file words kept for older files. Leaves for the archive once live.**
**ANSWERED 18 Oct 26 — D1015 ("13 B"): wording B — "Student marks not brought in: they belong to a chart this file doesn't carry. Export a fresh backup that includes its charts, and import that." To build.**
File → Import refuses the students of a file of today's version whose students point at a chart the file does not carry with "These student marks were saved by an older version and can’t be brought in safely. Import the charts, then re-enter marks — or export a fresh backup from the current app and import that." — but the file is not older; it does not match. The same words serve the real older-version case, and two collision cases (`normalizeImport`'s refusal and `remapStudentsSyl`'s throw, both in `raptor-port/src/tracker/app/fileTransfer.js`; `reconcileStudentsSyllabi` in `core.js`). Pictures: `raptor-port/docs/img/handpass/2026-10-17-trk-file-transfer/desk/24-s5-q2.png` (the wrong reason), `…/11-s2-q2.png` (the right one). **The fix the agent would recommend:** a second sentence for a file that does not match — what is wrong and what to do — his to word (`raptor-port/docs/design-practices.md` §1b). **Place:** the Tracker batch, put to him with its questions. Unchanged by the move (identical before and after).


*Moved here 2026-10-18 by backlog-archive.mjs ([LW-HEAD-BIG-PHONE]). Forward facts: `raptor-port/docs/handpass/2026-10-18-night-jobs.md`.*

### [LW-HEAD-BIG-PHONE] Between a phone and a tablet the top of the Leave War is at its tallest — his call (found 8 Oct 26)
**BUILT 18 Oct 26, the night (branch `claude/window-middle-d996`, pull request 534) — D1000, D1016: the two-line top up to 700 wide, the 20px edge from 431; the grid card unchanged. Leaves for the archive once live.**
**ANSWERED 18 Oct 26 — D1000 ("Shorter version"): the phone's two-line top up to about 700 wide, the top only; a picture at 440 and 600 wide first, then the build.**

**Found, not changed** — while measuring for `[LW-PHONE-HEADER-SPACE]` (D678, D679). The Leave War calls a screen "a
phone" at 430px wide or less, and only there does the top become two lines. From 431px up to about 700px the page is the
desktop's strip squeezed: "Viewing as" on a line of its own, the Stage line wrapped over three — the grid's first row
354px down at 431 wide, against 182 on a phone and 222 on a desktop. **Who meets it:** the largest iPhones (the newest
Pro Max models are 440 wide — the agent's knowledge of them, not measured on one), a small tablet in a split view. His own phone's
picture showed the phone layout, so his is 430 or less.
**Why it was left:** D679 — "keep the same for desktop"; its reading (1) fixed "a phone" as the width the top changes
at today, and everything wider stays whole. Widening "a phone" is a new choice, and the grid below has
phone rules of its own at other widths (it opens one step out at 700 and under), which this would not touch.
**The question for him:** should a screen up to about 700 wide get the phone's two lines too? **Recommended:** yes, for
the top area only (one width in two places — `leavewar/ui/phone.ts PHONE_QUERY` and `chrome.css`'s phone block — and the
browser test's three sizes), leaving the grid's own widths alone; a picture first, drawn into the running build at 440
and 600 wide (D634). **Place:** his to set — small, the Leave War's own; it does not wait for the calendar job.


*Moved here 2026-10-18 by backlog-archive.mjs ([CREW-REST-MARK-COPIES]). Forward facts: `raptor-port/docs/handpass/2026-10-18-night-jobs.md`.*

### [CREW-REST-MARK-COPIES] The dotted "breaks tomorrow" ring and the dashed late-show ring are drawn on the cockpit and row pucks only — the same man's other pucks show a solid red ring; and an open day list paints over both (found 6 Oct 26, the crew-rest fix's check — OLD; low; a question for him)
**BUILT 18 Oct 26, the night (branch `claude/window-middle-d996`, pull request 534) — D1013, D1017: every copy wears the seat's crew-rest ring and chip; an open list keeps the dotted and dashed rings (option A). Leaves for the archive once live.**
**ANSWERED 18 Oct 26 — D1013 ("as recommended"): every copy wears the seat's ring, the open list leaves it readable — a picture first.**
Seen by all three walkers, none of it this fix's doing (nothing that draws a puck was touched). (1) On the day that CAUSES a
breach (Monday, when Tuesday's rest is broken) the man's cockpit puck and ground-row puck wear the dotted red ring — but his
SANS card, his Unavailable row and his Personal Inputs row wear a SOLID red ring with the R chip, which reads as a breach ON
Monday; the crew list's copy shows neither. (2) A sanctioned late show (the dashed ring) is dashed on the cockpit and the row
and SOLID on the SANS card, the Unavailable and Personal Inputs rows and the crew list (walker C, S01 — pictures
`…/2026-10-06-rest-blank-line/C/dk-06…26-s01-*.png`; the builders pass no dash or trace to those copies: `ui/html.ts`,
`ui/board-html.ts`, `ui/palette-html.ts` — Astra's roll-call). (3) While a day's issue list is OPEN, every puck it names is lit
with a solid ring, which covers the dotted and the dashed ring until the list is shut (walkers A, B and C). **The question for
him:** should every copy of a man's puck wear the same crew-rest ring as his seat does, and should an open list leave the
dotted and dashed rings readable? **Place:** low — with the next change to how pucks are drawn (D94 put all three rings on the
board; these copies were not in its roll-call).


*Moved here 2026-10-18 by backlog-archive.mjs ([PEEK-ISSUED]). Forward facts: `raptor-port/docs/handpass/2026-10-18-night-jobs.md`.*

### [PEEK-ISSUED] The desktop next-week preview on View-only Sched shows next week's working copy, even for a published day — a question for him (filed 26 Sep 26)
**BUILT 18 Oct 26, the night (branch `claude/window-middle-d996`, pull request 534) — D1010: View-only Sched's preview draws a published day as issued. Leaves for the archive once live.**
**ANSWERED 18 Oct 26 — D1010 ("as recommended"): View-only Sched's preview shows the published version of a published day.**
Noted by the sweep behind `[LEAVE-LATE-PUBLISHED]` (Astra, its plan read; carried in `[LATE-PUB-FACE-LIVE]`, archived
26 Sep 26): the peek of next week at the right of the desktop week (`raptor-port/src/ui/peek.ts`) draws next week's live
working copy, so on View-only Sched a published next-week day shows edits not yet issued. Astra recommends the issued
content there too, as the published face does (D178, D179). **The question:** should the peek show the published version
of a published day? **Place:** low; its own small WALK-tier build if yes.


*Moved here 2026-10-18 by backlog-archive.mjs ([BOARD-TIME-ESCAPE]). Forward facts: `raptor-port/docs/handpass/2026-10-18-night-jobs.md`.*

### [BOARD-TIME-ESCAPE] On the Scheduler Board, Escape in a TIME box does not put the old time back (found 5 Oct 26, the Codex stack check)
**BUILT 18 Oct 26, the night (branch `claude/window-middle-d996`, pull request 534) — D1011: Escape restores a board time box and saves nothing. Leaves for the archive once live.**
**ANSWERED 18 Oct 26 — D1011 ("as recommended"): Escape puts the old time back on the board's time boxes.**
The board's take-off, landing, Brief and duty-start boxes keep what was typed after Escape, the caret stays in the box, and leaving the
box then saves it; the week's time boxes and the board's text boxes restore the saved value. The same on `main` (`de470db5`) and on the
stack — the host ran walker D's probe (`raptor-port/scripts/handpass/stk-D-1b.mjs`) on both builds, box for box. D544 kept "the existing
Enter and Escape meanings", so the Tab route did not change it. Not ruled. **Place (the agent's line):** low — a question for him with
the next change to the board's boxes: should Escape restore there as it does on the week?


*Moved here 2026-10-18 by backlog-archive.mjs ([CAL-ESC-LISTS]). Forward facts: `raptor-port/docs/handpass/2026-10-18-night-jobs.md`.*

### [CAL-ESC-LISTS] Escape with a calendar's month-and-year lists open closes the whole form, not the lists — found 17 Oct 26 by [OIL-CONFIRM-DAYGRID]'s code read (F3); older than that job; his to place — OPEN
**ANSWERED 18 Oct 26 — D1020: the floating calendar too; filed as [DATEBOX-ESC-LISTS].**
**BUILT 18 Oct 26, the night (branch `claude/window-middle-d996`, pull request 534) — D1012: in a calendar inside a form Escape shuts only the lists first (the floating calendar over a date box keeps closing whole, as its test pins — a question for him). Leaves for the archive once live.**
**ANSWERED 18 Oct 26 — D1012 ("as recommended"): Escape closes only the month / year list.**
**Seen:** in a calendar drawn inside a form — the OIL question's "Only some days…", an input's own window — the title opens
the month-and-year lists; Escape there closes the whole question or window (in the question before a swap, the swap is
not made and the bar stays), where the design guide's §2 says "Escape closes what opened last". The one calendar's header
leaves Escape to its form (`raptor-port/src/ui/DateCal.tsx`), so it is every inline calendar's, not this job's. A calendar
that floats (the date box) is not affected: its layer takes Escape. **The fix, if he wants it:** in `DateCal`'s list keys,
Escape closes the lists and stops there; the two forms' Escape handlers leave a key that came from the lists alone; one
unit test each (`oilconfirm.test.tsx`, `inputs.test.tsx`). Picture: `raptor-port/docs/img/handpass/2026-10-17-oil-confirm-daygrid/rewalk/18-S7-desk-lists.png`.


*Moved here 2026-10-18 by backlog-archive.mjs ([DELETE-LIST-CAL-NOTES]). Forward facts: `raptor-port/docs/handpass/2026-10-18-night-jobs.md`.*

### [DELETE-LIST-CAL-NOTES] The list a delete shows of what it took away has no line for the notes a man was on (found 9 Oct 26 — Astra, the day-window check)
**BUILT 18 Oct 26, the night (branch `claude/window-middle-d996`, pull request 534) — D710: every change to a note has its line in the change history, so the delete names each note he was taken off. Leaves for the archive once live.**
**ANSWERED 18 Oct 26 — D710 ("as recommended"): confirmed 18 Oct 26 — build it.**
**Found, not fixed — a question for him.** Deleting a person takes him off every planning note from the delete’s date on (a gap where he stood; a note left with neither words nor people is dropped — `raptor-port/src/state/person-delete.ts`), but the readable lines of the change history (`raptor-port/src/state/changelines.ts`) have none for a `plan` record, so the delete’s list (D337 — "lists everything the delete took away, one line each, as built") says nothing of them. It never did for the old rows of pucks either: D337 confirmed the list as built, so this is put to him, not assumed. **To put to him:** should the list carry a line a note ("taken off the note ‘Brief the new guys’ on 14 Oct")? Recommended yes, as its own small job — and with it, readable lines for ordinary note changes in the changes window (they have none today either). Evidence: the day-window check’s sheet `raptor-port/docs/handpass/2026-10-09-day-window-compact-check.md` §0 and §5. **As filed:** small.
**He said yes (D710, 9 Oct 26 — "yes as recommended"): build it, as a small later job** — one line a note in the delete’s list, and readable lines for ordinary note changes in the changes window with it.


*Moved here 2026-10-18 by backlog-archive.mjs ([UPCHIT-MOVE-NO-REGROW]). Forward facts: `raptor-port/docs/handpass/2026-10-18-night-jobs.md`, `raptor-port/docs/engine-rules.md`.*

### [UPCHIT-MOVE-NO-REGROW] An Upchit moved to a LATER date does not give back the medical days it cut (walker B, the D605 walk, 6 Oct 26 — OLD; low; a question for him)
**18 Oct 26 — D1022: a DELETED upchit gives the days back too; filed as [UPCHIT-DELETE-REGROW].**
**BUILT 18 Oct 26, the night (branch `claude/window-middle-d996`, pull request 534) — D999: an upchit moved later gives the downchit it had cut its days back, never past its first end (`firstEnd`, kept at the first cut) and never into another medical filed in the gap; the save sheet and the calendar drag's sheet say so. A downchit the cut had deleted has nothing to give back; an upchit DELETED gives nothing back (not in the ruling — a question for him). Leaves for the archive once live.**
**ANSWERED 18 Oct 26 — D999: TO BUILD.** The downchit grows back to the day before the upchit's new date, never past its first end, said on the upchit's save sheet before saving; a calendar drag the same; a published day given back reads pending (D178). Reproduce walker B's case first (the host did not), test first.
A downchit (ATT C) Monday to Friday; an Upchit effective Wednesday — the downchit is cut to end Tuesday, as it should
be. Then the Upchit's date is changed to Thursday in the Inputs page's row editor: the downchit still ends Tuesday (the
editor's sheet says "no current entry needs shortening"), so Wednesday reads fit although the man was cleared only from
Thursday. Seen by walker B (S26; `raptor-port/docs/handpass/parts/bta-B.md`), NOT reproduced by the host; the Upchit's
write path only ever shortens. **The question for him:** when an Upchit is moved later, should the downchit it cut grow
back to the day before the new date — or is the Upchit deleted and filed again? **Place:** low — with the next change
to the Medical view.


*Moved here 2026-10-18 by backlog-archive.mjs ([TRK-DOWN-DAYS-AUTO]). Forward facts: `raptor-port/docs/handpass/2026-10-18-night-jobs.md`, `raptor-port/docs/ui-contracts.md`.*

### [TRK-DOWN-DAYS-AUTO] The Tracker's down days worked out from the Inputs, a tap shows the breakdown; the Upchit Date box goes (his direction, 18 Oct 26 — D1002)
**BUILT 18 Oct 26, the night (branch `claude/window-middle-d996`, pull request 534) — D1002–D1005, D1018: the down days worked out from the man's medical inputs since his course start (set in "+ Add", changed in Info), ½ for a half day, a running one to today, a window listing each; the typed box and "Upchit Date" gone; the currency bar without down days (D1004). Open for his look: a CANCELLED medical input still counts (the Medical tab's own reading); two new phrasings ("No medical inputs since the course start.", the spoken "none counted yet"). Leaves for the archive once live.**
**Not designed — his questions first.** The design note with his words, today's behaviour and the questions to put to him:
`raptor-port/docs/superpowers/specs/2026-10-18-trk-down-days.md`. **Place:** his direction of 18 Oct 26; the next Tracker
job, after D994's small fixes unless he says otherwise.


*Moved here 2026-10-18 by backlog-archive.mjs ([TRK-FLEX-SETTING]). Forward facts: `raptor-port/docs/handpass/2026-10-18-night-jobs.md`, `raptor-port/docs/superpowers/specs/2026-10-18-trk-down-days.md`.*

### [TRK-FLEX-SETTING] The Tracker's flex figures editable, and one switch that turns flex off everywhere (his direction, 18 Oct 26 — D1006)
**BUILT 18 Oct 26, the night (branch `claude/window-middle-d996`, pull request 534) — D1006, D1014, D1018: the flex settings window from a cog in the top bar — an admin edits the six From days and the on/off switch, a member reads; flex off hides the flex bar, "Days since syllabus", the flex sentence and the legend's flex part; saved as one row, carried in a backup. Leaves for the archive once live.**
**Not designed — his questions first** (which figures, who may change them, where the switch sits; a picture). The note:
`raptor-port/docs/superpowers/specs/2026-10-18-trk-down-days.md`. **Place:** with [TRK-DOWN-DAYS-AUTO], the next Tracker job.


*Moved here 2026-10-18 by backlog-archive.mjs ([TRK-LEGEND]). Forward facts: `raptor-port/docs/handpass/2026-10-18-night-jobs.md`, `raptor-port/docs/superpowers/specs/2026-10-18-trk-down-days.md`.*

### [TRK-LEGEND] A legend on the Tracker — the balls, a flight's currency and the IP requirement, when a flex happens (his direction, 18 Oct 26 — D1007)
**BUILT 18 Oct 26, the night (branch `claude/window-middle-d996`, pull request 534) — D1007, D1018: the Legend button beside Show All and its pop-out (the chart's own balls, currency and IP, the flex bands), the desktop strip moved into it. Leaves for the archive once live.**
**Not designed — a picture first.** Its flex part goes when the flex switch (D1006) is off. The note: as above. **Place:** with
[TRK-DOWN-DAYS-AUTO], the next Tracker job.


*Moved here 2026-10-18 by backlog-archive.mjs ([LW-CARD-SHORT-WORDS-700]). Forward facts: `raptor-port/docs/handpass/2026-10-18-three-small-jobs.md`.*

### [LW-CARD-SHORT-WORDS-700] From 431 to 700 wide the Leave War grid card's buttons take the phone's short words — RULED D1019 (18 Oct 26); to build — OPEN
**BUILT 18 Oct 26 on `claude/three-small-jobs-1018`** — the short words up to 700 (`leavewar/ui/chrome.css`); its check `raptor-port/docs/handpass/2026-10-18-three-small-jobs.md`. Leaves for the archive once live.
**What:** the grid card's "Reorder" and "OIL" buttons read "⇅" and "OIL" (the phone's short-words rule) up to 700 wide, so
"−" and "+" stay on the first line; the grid's columns unchanged. Picture: `raptor-port/docs/img/handpass/2026-10-18-lw-top-700/6-440-proposed-short-words.png`
(at 440: 22 rows of names, 5 more than before the night). **Where:** the card's rules in `raptor-port/src/leavewar/ui/chrome.css`
kept at 430 (the night's job 3) move to 700 for the buttons only. **Place:** one small job with [DATEBOX-ESC-LISTS] and
[UPCHIT-DELETE-REGROW], once pull request 534 is live. Check: WALK (layout at many widths).


*Moved here 2026-10-18 by backlog-archive.mjs ([DATEBOX-ESC-LISTS]). Forward facts: `raptor-port/docs/handpass/2026-10-18-three-small-jobs.md`.*

### [DATEBOX-ESC-LISTS] The calendar floating over a date box: Escape shuts its month and year list first — RULED D1020 (18 Oct 26); to build — OPEN
**BUILT 18 Oct 26 on `claude/three-small-jobs-1018`** — Escape over a date box shuts the lists first (`ui/DateBox.tsx`), its test changed with it; the check `raptor-port/docs/handpass/2026-10-18-three-small-jobs.md`. Leaves for the archive once live.
**What:** as the calendars inside a form now do (D1012, built the night of 18 Oct 26): with the month or year list open,
Escape closes only the list; a second Escape closes the calendar. The test that pins today's behaviour
(`raptor-port/src/ui/datebox.test.tsx`) changes with it. **Place:** with [LW-CARD-SHORT-WORDS-700]. Check: LOOK plus its tests.


*Moved here 2026-10-18 by backlog-archive.mjs ([UPCHIT-DELETE-REGROW]). Forward facts: `raptor-port/docs/handpass/2026-10-18-three-small-jobs.md`.*

### [UPCHIT-DELETE-REGROW] A deleted upchit gives the downchit it cut its days back — RULED D1022 (18 Oct 26); to build — OPEN
**BUILT 18 Oct 26 on `claude/three-small-jobs-1018`** — `engine/medical.ts upchitDeletePlan` (one give-back body with D999), written in `removeInput`'s command; the window's Delete and the opened day's Delete key ask on the upchit sheet first; the check `raptor-port/docs/handpass/2026-10-18-three-small-jobs.md`. Leaves for the archive once live.
**What:** as a moved one does (D999, built the night of 18 Oct 26): the downchit grows back to the end it had before the
cut, never past it and never into another medical of his in the gap; the save sheet says so first. Builds on the kept
first end (`firstEnd`) and the give-back plan in `raptor-port/src/engine/medical.ts`. **Place:** with
[LW-CARD-SHORT-WORDS-700]. Check: FULL (saved data); a fresh blind Opus read.

*Moved here 2026-10-18 by backlog-archive.mjs ([UPCHIT-SHEET-LEAVE-CUT]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/handpass/2026-10-18-upchit-sheet-leave-cut.md`, `.claude/decisions-full/inputs.md`.*

### [UPCHIT-SHEET-LEAVE-CUT] Should the upchit sheet also name a leave or bid its give-back will cut? — a question for him (found 18 Oct 26 by the fresh read of `claude/three-small-jobs-1018`) — OPEN
**ANSWERED 18 Oct 26 — D1023 ("Ok as recommended"): yes — the sheet lists each leave and bid the give-back will cut, one line each, before anything changes. TO BUILD, a small job of its own.**
**BUILT 18 Oct 26 on `claude/upchit-sheet-leave-cut`** — every door that gives days back (the window's Save and Delete, the calendar's drag, the opened day's Delete key, the schedule's reassign) lists the cuts, worked out by trying the save and throwing it away (`ui/inputedit.tsx giveBackCuts`); contract `raptor-port/docs/ui-contracts.md` §The upchit, medical-clash and OIL sheets; its check `raptor-port/docs/handpass/2026-10-18-upchit-sheet-leave-cut.md`. Waiting for his look and "merge live"; then archived.
**Seen:** an upchit moved later (D999) or deleted (D1022) grows the downchit back over days where leave may since have been
filed (he was fit then); the Leave War's rules ("sick cuts leave") cut that leave in the same command. The sheet before it
names only the downchit's new end; the cut is said afterwards, in the passing note beside "Input deleted" / "Moved to …"
(fixed so it is no longer wiped out — the job's check, `raptor-port/docs/handpass/2026-10-18-three-small-jobs.md`).
**The question:** should the sheet also list, before anything changes, each leave or bid the give-back will cut? Recommended
yes (one line each, "Ranger's LL on 8 Oct is cut — it goes back to the balance"), worked from the same rule the save runs.
**Place:** with his questions, when he says (D994); a picture first.


*Moved here 2026-10-18 by backlog-archive.mjs ([LW-LABEL-NO-DOOR]). Forward facts: `raptor-port/docs/superpowers/briefs/2026-10-18-sixteen-questions.md`.*

### [LW-LABEL-NO-DOOR] The Leave War's personnel label has no control on screen (filed 30 Sep 26)
**ANSWERED 18 Oct 26 — D1001: the label is KEPT, for an option to sort the Leave War by flight ([LW-SORT-BY-FLIGHT], below). Nothing to build here; archive this item at the next tidy.**
**Place:** low — a question for him before building. Seen by the group-A FULL walk (W4 observation 4): the war stores a
man's personnel label (`leavewar/profile:<pid>` `label`, `setPersLabel`) and reads it, but no screen calls the setter,
in `main` or this build — a stored field no one can set. **Do:** ask him whether the label is wanted; if yes, give it
its door (the name sheet); if no, retire the field before IT settles `LeavePersonProfile`.


*Moved here 2026-10-18 by backlog-archive.mjs ([LW-REQ-PICK-MONTH-UNSTEADY]). Forward facts: `raptor-port/docs/handpass/2026-10-14-three-builds.md`.*

### [LW-REQ-PICK-MONTH-UNSTEADY] The Required-panel browser test's month-button step failed once inside a full run — test-only (filed 8 Oct 26) — steadied the night of 15 Oct 26 (his "yes spare"), on `claude/drag-edge-scroll-elsewhere-51bfc4`, waiting for the next full runs to confirm
**Steadied (15 Oct 26, night):** the second month press now waits for the grid to come to rest (`settleGrid(page)`, as this item said — D87); 20 of 20 alone on the phone under the lock. It had never failed alone, so 20/20 shows the wait is in place, not that the old failure is gone: watch the next few full runs, then archive it. The second unsteady test below (`[LW-WINDOW-PRUNE-FLAKE-2]`) is NOT touched — it now fails alone too (1 of 3, its own item says) and wants a look of its own.
**A second unsteady Leave War test, the same kind (15 Oct 26):** `e2e/leavewar.spec.ts` "the grid draws a window of months over year-wide placeholders…" (desktop) failed once inside a full run — its five-second wait for December to leave the drawn months ran out — on a change that touches no Leave War file (the just-added ring, D860), and passed 3 of 3 alone straight after. It failed again in the next full run (the same day, the OIL branch) and once in a run of the Leave War desktop group alone, then passed five group runs in a row on the same build — it fails when the PC is busy (both full-run failures came straight after the seven-minute unit run). Steady it with this item: wait on the drawing having settled, not on a fixed five seconds (D87). **Worth doing soon: it now fails about half the full runs.**
`raptor-port/e2e/leavewar.spec.ts` "several Required cells are picked with a drag and given one number, and the panel
leaves the grid behind it working" (lw-phone) failed once in the full gate run on `claude/inputs-sans-calendar`
(`a35fc26b`, 656 of 657): with the Required panel up it presses the second month button, waits for the grid to have
moved, then presses the first one at once — and the grid stayed on February (the 5-second wait for it to come back ran
out). Straight after: 8 of 8 alone, 40 of 40 run eight at a time, and green in a second whole run of the browser set
(657 of 657). The change that run was checking (D674, the Inputs list's landing) does not touch the month buttons or
the phone's window of months. The likely cause, NOT proven (it did not reproduce): the second press lands while the
first jump is still settling the phone's rolling window of months — the family of `[LW-WINDOW-PRUNE-FLAKE-2]`. **Do
(D87):** let the grid come to rest between the two presses (`settleGrid(page)`, the helper the file already has), not
a fixed time — and if it can be reproduced first, check whether a person pressing two month buttons quickly can leave
the grid on the wrong month. **Place:** test-only, low, any time; with `[LW-WINDOW-PRUNE-FLAKE-2]`.

**Seen again 13 Oct 26, in ANOTHER test:** in the Inputs batch's first full run (`claude/inputs-schedule-batch`, which touches nothing of the Leave War) `e2e/leavewar.spec.ts` "Undo and Redo leave the grid where it is when the changed day is on screen…" (the `lw-phone` project) failed at the same kind of step — "the month button no longer lands its month at the left edge" — and passed alone three times of three, and in the next whole run. So the unsteady thing is the month button's landing under load, not one test.


*Moved here 2026-10-18 by backlog-archive.mjs ([QUALS-PROTO-TOAST]). Forward facts: `raptor-port/docs/handpass/2026-09-26-late-pub.md`.*

### [QUALS-PROTO-TOAST] The Quals page's "Save changes" says "prototype — writes to Dataverse in the full build" (filed 26 Sep 26)
Found by the Quals walker of `[LEAVE-LATE-PUBLISHED]`'s check (evidence `raptor-port/docs/handpass/2026-09-26-late-pub.md`
§4c): pressing Save changes toasts "Quals saved (prototype — writes to Dataverse in the full build)."
(`raptor-port/src/ui/QualsPage.tsx`, the Save button). That breaks his 25 Aug 26 rule that UI copy reads production,
never prototype (`raptor-port/CLAUDE.md` §Product bar): the database-era user would read "Qualifications saved". The same
on `main`; out of that branch's scope. **Do:** reword the toast; keep the prototype truth as a code comment beside it;
grep the app for other "prototype" / "full build" / "Dataverse" words on screen. LOOK tier. **Place:** low, with
`[QUALS-MEMBER-SCOPE]` or any time.


*Moved here 2026-10-18 by backlog-archive.mjs ([PO-RESTORE-POSTING]). Forward facts: `raptor-port/docs/handpass/2026-09-26-absence.md`.*

### [PO-RESTORE-POSTING] The Quals Restore clears a posting it did not make — low (Fable's final code read, N7, 26 Sep 26)
Unchanged `main` code, found by Fable's read of the absence-record re-test: `sync.ts restoreArchivedPerson` (the Quals
page's Restore) always clears the man's post-out, because a surviving past-dated posting with "Archive on PO date" on
would archive him again on the next pass. But a man archived by hand on Quals who also carries a posting the admin set
on purpose — a future date, or the custom "Archive on PO date" off — loses that posting on Restore, with nothing said.
Since the re-test the Post out's own archive is marked (`PEOPLE` body `archivedBy: 'po'`). **Build:** clear the posting
only when it made the archive (`archivedBy === 'po'`) or would re-archive him at once (switch on, date come); keep it
otherwise; a test per case. **Place:** low, with the next posting or Quals roster change; not his ruling.


*Moved here 2026-10-18 by backlog-archive.mjs ([HWW-RULINGS-SIZE]). Forward facts: `raptor-port/docs/handpass/parts/rulings/read-opus.md`.*

### [HWW-RULINGS-SIZE] The general rulings file is at its size marker — the one-off permissions of merged jobs to be read and archived (found 13 Oct 26 by the skill-notes review)

`.claude/rules/decisions/how-we-work.md`, the rulings every chat loads, stands at 27,949 of its 28,000 bytes after D810 and
D811. A rulings file is never trimmed (D136); what leaves is a ruling REPLACED or a one-off permission SPENT. Several
one-off permissions of jobs since merged look spent — who read the shared-row job and the one-rule job, and what each
went live on (D746, D749, D752, D758, D764, D779, D784), and D810 and D811 themselves once this review is live — but
each row must be read sentence by sentence first: any "if", "until" or "still" in it that no live ruling carries keeps
it live (`DECISIONS.md` step 2). **To do:** that read, then the marks and `backlog-archive.mjs --rulings`; a documents-only
job. **Place:** the agent's — with the next records tidy, before the next ruling that would cross the marker.


*Moved here 2026-10-18 by backlog-archive.mjs ([OIL-CONFIRM-DAYGRID]). Forward facts: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/handpass/2026-10-17-oil-confirm-daygrid.md`.*

### [OIL-CONFIRM-DAYGRID] The OIL question's own "only some days" grid is a near-copy of the old calendar — named by calendar step two (15 Oct 26); RULED D923 (build it, a picture first); BUILT and FULL-checked 17 Oct 26 on `claude/oil-confirm-daygrid-d05aeb` — OPEN until his look and "merge live"
**BUILT 17 Oct 26:** the question's "Only some days…" is `DateCal` in a several-days mode (`mode="many"`, `only`, `picked`,
`onToggle`); the old small month and its styles are gone; on a phone (under 400 wide) the calendar is drawn without its own
box so its head fits; Home and End stay inside the week. The check: `raptor-port/docs/handpass/2026-10-17-oil-confirm-daygrid.md`
(FULL — a scenario designer and a fresh, blind Opus code read; the walk at eight sizes). **His look, ANSWERED 17 Oct 26 (D978 —
"As recommended merge live"):** the phone's calendar with no box of its own and the count line's new words both stay; LIVE
on that "merge live" (pull request 528).
**RULED 15 Oct 26 — D923: build it** — the one calendar's look, a tap turning each separate non-working day on or off. A picture on the real app first, then its own job after [INPUT-NEW-DEFAULTS] (the agent's placing); FULL check (it touches what earns OIL).
**Pictured for him 15 Oct 26 (D921):** pictures 2a and 2b, `raptor-port/docs/img/handpass/2026-10-15-two-leftovers/` (`scripts/handpass/pics-two-leftovers.mjs`).
**Seen:** step two moved every date pick in its list onto the one calendar (`src/ui/DateCal.tsx`); the OIL question's
"only some days" day grid was not on that list and (`src/ui/OilConfirm.tsx`) still draws its own month. **Next:** put to him with a
picture whether it takes the one calendar (a pick of several separate days, which the calendar does not do today);
nothing built before his word. The step-two check: `raptor-port/docs/handpass/2026-10-15-calendar-step-two.md`.


*Moved here 2026-10-18 by backlog-archive.mjs ([GUIDE-NO-GLOW]). Forward facts: `raptor-port/docs/handpass/2026-10-15-no-glow.md`, `raptor-port/docs/file-map.md`.*

### [GUIDE-NO-GLOW] The design guide carries "a ring in this app never glows" — RULED D880 (15 Oct 26); the wording APPROVED and in the guide (D887); BUILT and WALK-checked 15 Oct 26 (`raptor-port/docs/handpass/2026-10-15-no-glow.md`) — OPEN until his "merge live"
**His "3 yes" (D880)** to D852's question after `[GLOW-OFF]`. Version 2 of the wording, after one fresh reader
(`raptor-port/docs/superpowers/briefs/2026-10-15-reads/guide-no-glow-opus.md` — all ten findings taken), and the NINE places
that still glow: `raptor-port/docs/superpowers/specs/2026-10-15-guide-no-glow-draft.md`. **Next:** the wording and the nine
places — each with a picture (D853) — go to him; `raptor-port/docs/design-practices.md` changes only
on his approval, and none of the nine places changes before he rules on it.
**15 Oct 26 (second chat):** pictures taken (`raptor-port/docs/mock/2026-10-15-noglow-places/`, the Artifact page "Raptor
No-Glow Places"); round 1 RULED — places 1 to 4 lose their glow (D881); round 2 (places 5 to 8) put to him; place 9 is a
leftover style nothing draws (removed with the guide change). Round 3: the wording, set to his answers.


*Moved here 2026-10-18 by backlog-archive.mjs ([HANDOFF-RESET-TRACKS-MAIN]). Forward facts: `.claude/decisions-full/how-we-work.md`.*

### [HANDOFF-RESET-TRACKS-MAIN] The session-handoff guide's reset line leaves the branch tracking `main` — every push after it silently does nothing (found 15 Oct 26, observation 599) — OPEN, a one-line guide fix, his approval
**Found, not fixed.** `.claude/skills/session-handoff/SKILL.md` Step 4's template gives `git fetch origin main && git checkout -B <branch> origin/main` for a branch whose pull request merged. That makes the branch track `origin/main`; a plain `git push` then refuses (the names differ), and a quiet push hides it — on 15 Oct 26 three "pushed" reports were false until the pull request's head was read before the merge (nothing reached `main`). **Fix:** add `--no-track` (or `git branch --unset-upstream`) to that line, push the first time with `git push -u origin HEAD:<branch>`, and after any push read back `git ls-remote origin <branch>` against `HEAD`. A working-guide change: one fresh reader, his approval (D70).


*Moved here 2026-10-18 by backlog-archive.mjs ([INSIGHTS-EMPTY-LINE-COUNT]). Forward facts: `raptor-port/docs/superpowers/briefs/2026-10-18-sixteen-questions.md`.*

### [INSIGHTS-EMPTY-LINE-COUNT] A flying line with nobody on it counts as a sortie and a formation in Insights (the Codex stack check's W17, 5 Oct 26 — a question for him)
**ANSWERED 18 Oct 26 — D1009 ("as recommended"): keep it — nothing to build; archive at the next tidy.**
"+ Line" on a flying wave, no crew: Insights' SORTIES tile goes up by one and FORMATIONS by one; the per-person bars are right. The
same on `main` (`de470db5`) — `raptor-port/src/engine/insights.ts` counts every line and jet that is not cancelled, crewed or not, as
the day's own "4 X 4 X 0" count does (`waves.ts dayCount`, the precedent its comment names). Not ruled. **Place (the agent's line):**
low — ask him whether an uncrewed line is a planned sortie (as now) or should wait for its crew; with the next change to Insights.


*Moved here 2026-10-18 by backlog-archive.mjs ([PALETTE-WRAPPED-HEADER]). Forward facts: `raptor-port/docs/handpass/2026-10-02-rally-workspan.md`.*

### [PALETTE-WRAPPED-HEADER] Wrapped desktop account bar covers the sticky palette's first option (found 2 Oct 26)
At1280×560 with RANGER · ADMIN and a two-row104px top bar, ALL AVAIL's center at y64 is behind the account badge after the page scrolls. Current actual reporting-warning jump reaches it before any target scroll; frozen9cc baseline lacks that new warning door, but native page scroll plus target scroll reaches the identical covered rectangle with the same badge/flight/reporting strings. Both served bundles are verified; no force click or data injection. Initial empty-week geometry did not reproduce the covered state and is retained, not offered as clearance. Required1440×480 and six named-person picker phone/short routes pass, without excusing the1280 defect.
Cause/fix triage: `raptor-port/docs/superpowers/plans/2026-10-02-rally-header-overlap-triage.md`; raw linked results in the Rally main consolidated manifest, preserved in `raptor-port/docs/handpass/2026-10-02-rally-workspan-evidence.zip`. Adapt the palette's sticky clearance to the actual header height, preserving existing control sizes and scroll/paint contracts. No repair or owner acceptance inferred. **Place:** workflow UI batch under D490/D495, after [CSS-SPLIT-BY-SCREEN]; final current-batch inspector judges the declared scope.
4 Oct normal-scroll reproduction on the unchanged workflow bundle with **Saber admin**:
header104px at1280×560, crew list stuck at y8; both placeholders covered. At1600×900
and1440×480 header58px and those hits work; return to1280 covers them again. Candidate
remains actual-header clearance plus available-height update, not raised stacking or
hard-coded104px. Still open, no repair/picture approval. Evidence:
`raptor-port/docs/handpass/2026-10-04-workflow-ui-investigation.md` §Desktop crew list.
**D548, 4 Oct:** owner says leave this behaviour unchanged; only the phone Board's
blank Desktop layout is selected for repair. Retain the finding as history,
outside the current repair scope; no crew-list/header change is authorized here.


*Moved here 2026-10-18 by backlog-archive.mjs ([INSIGHTS-CLOSE-STAYS-VISIBLE]). Forward facts: `raptor-port/docs/superpowers/specs/2026-10-04-interface-readability-scroll.md`.*

### [INSIGHTS-CLOSE-STAYS-VISIBLE] Keep the Insights close cross at the top while scrolling — D562, 4 Oct 26
Owner's two private phone photos show the Week insights title/cross at the top initially, then out of view after
scrolling. He asks for the existing cross to remain at the top. **Status:** built on codex/workflow-ui under D563 after numbered pictures/independent plan challenge; all normal gates and fresh independent Astra R1PASS, owner look and Claude reads pending.
Built on codex/workflow-ui after numbered candidates and independent plan challenge; normal refreshed gates underway; fresh final read and owner look pending. Chosen sticky header placement
was pictured before source and has current phone/desktop native proof. Preserve dismissal, D536/D537 window height/top
strip and all Insights data/permissions. No whole-popup-family redesign. Both reference photos remain private.
**Home:** `raptor-port/docs/ui-contracts.md` Week Insights (D562); short/full Scheduler ruling.
**Place:** current workflow UI batch with the Tracker/Logic requests, authorized together by D563.
Separate from the earlier D536 phone-top clipping repair and [MODAL-DRAG-CLOSE] accidental dismissal fix.

**Insights close design:** `raptor-port/docs/superpowers/specs/2026-10-04-interface-readability-scroll.md`; **build plan:** `raptor-port/docs/superpowers/plans/2026-10-04-interface-readability-scroll-build-plan.md` (Astra plan; independent Sol challenge PASS; runtime/final read in the combined handpass).


*Moved here 2026-10-18 by backlog-archive.mjs ([LOGIC-STICKY-SEARCH-COMPACT]). Forward facts: `raptor-port/docs/superpowers/specs/2026-10-04-interface-readability-scroll.md`.*

### [LOGIC-STICKY-SEARCH-COMPACT] Keep Logic search visible while scrolling and pack its controls closer — D561, 4 Oct 26
Owner's two private phone photos show existing filter/edit controls staying visible after search has left the screen.
He asks to keep search there too and pack the buttons together into fewer vertical rows. **Status:** built on codex/workflow-ui under D563 after numbered pictures/independent plan challenge; all normal gates and fresh independent Astra R1PASS, owner look and Claude reads pending.
Keep All, Warnings, Advisories, Notes, Fired this week, Edit rules and rule count with their existing actions;
preserve filtering, permissions and rule values/calculations. Chosen local layout108px tall at390px keeps
search/controls visible below the actual header; narrow modified actions wrap. No global button resizing. Both photos stay private.
**Home:** `raptor-port/docs/ui-contracts.md` Logic search and controls (D561); short/full Scheduler ruling.
**Place:** current workflow UI batch with Tracker/Insights, authorized together by D563. No change to D495's later feature order.

**Logic controls design:** `raptor-port/docs/superpowers/specs/2026-10-04-interface-readability-scroll.md`; **build plan:** `raptor-port/docs/superpowers/plans/2026-10-04-interface-readability-scroll-build-plan.md` (Astra plan; independent Sol challenge PASS; runtime/final read in the combined handpass).


*Moved here 2026-10-18 by backlog-archive.mjs ([TRK-FILE-TRANSFER-SPLIT]). Forward facts: `raptor-port/docs/file-map.md`, `raptor-port/docs/handpass/2026-10-17-trk-file-transfer.md`.*

### [TRK-FILE-TRANSFER-SPLIT] The Tracker's file save and load move out of its main file — APPROVED D493 (2 Oct 26), to build with the Tracker batch
**BUILT 17 Oct 26 — what was left of it (his word with `/overnight`), on `claude/tracker-feature-batch-6ea3a7`:** the import's store-free steps (`normalizeImport`, given the store's chart catalogue; `sameDef`; `remapStudentsSyl`; the older-version refusal's words) moved word for word to `raptor-port/src/tracker/app/fileTransfer.js` beside `fileFormat.js`, the boundary test `raptor-port/src/tracker/file-transfer-boundary.test.ts` written first. FULL-checked: proved a move by recording File → Import before and after (identical), the whole gate set green, two fresh Opus reads (test-only findings, fixed) — `raptor-port/docs/handpass/2026-10-17-trk-file-transfer.md`. Nothing on screen changes: waiting for his "merge live" only. The rest of export / import stays in `core.js` as the 13 Oct look below decided; the item leaves for the archive once this merges.
**Looked at 13 Oct 26 (the night's run, on his word D799) — stopped at its own stop condition, nothing changed.** Measured on the main file as it stands (the section is lines 5785–6507 of `raptor-port/src/tracker/app/core.js`, 723 lines): it calls **43** of the main file's own functions (the questions it puts, the redraws, the saves, the id conversions, the course loader) and reads **about fifteen** of its own lists and records; it REWRITES three of them outright (the chart catalogue, the chart order, the hidden charts) and writes into the marks and the event details in place. A separate module cannot reassign another module's variables, so the split would need three new setters and some forty-five names handed across — that is the catch-all "core context" Astra's read said to stop at, not a small explicit interface. So it was NOT forced. **The agent's call (a technical one, told to him):** leave the file save and load where they are; nothing a person sees depends on the move. **What is left of this item:** the parts that touch nothing of the store — the file's normalising and comparing (`normalizeImport`, `sameDef`, `remapStudentsSyl`, about 80 lines) — can move beside `fileFormat.js` with the next Tracker feature batch, test first (`tracker/file-transfer-boundary.test.ts`, as Astra named it); the rest waits for the Tracker to write through the one command layer, which is what would give it a real boundary.
**D775 (12 Oct 26) - the Leave War tidy-up: done AFTER the one-rule job is merged, as a job of its own - not with its area’s feature batch (D493 narrowed) - started on his word, in a chat of its own.**
From Astra's tidiness read (its §3 — read it before building). The export / import workflow (about 730 lines) leaves
`src/tracker/app/core.js` for one module beside `fileFormat.js` and `fileStore.js`; the menus keep calling what they call now.
**Astra's stop condition, kept:** if it cannot use the store and the format through a small explicit interface — no
catch-all "core context" — stop and report, do not force it. First the boundary test Astra names (export, fresh store,
import, compare every record and id; cancel; a conflicting syllabus; no partial write on a refusal). FULL tier — saved data.
**Place — D493, D485: with the Tracker batch (`[FEATURE-WISHLIST]` item 4).**


*Moved here 2026-10-18 by backlog-archive.mjs ([DESIGN-LOOK-13OCT]). Forward facts: `raptor-port/docs/handpass/2026-10-13-design-look.md`.*

### [DESIGN-LOOK-13OCT] A look, by the design guide, over the designs just built and the ones coming — keyboard use included — on one page with the clash note and the shorter notes (his direction D807, 13 Oct 26) — DONE: the page was put to him, Fable read it (D826), and he answered all five choices (D827–D831, 13 Oct 26); what is left is the three builds, each its own item
**MADE 13 Oct 26 (branch `claude/design-page-oct-13-review-a35956`, documents and pictures only — nothing under `raptor-port/src`):** the page `raptor-port/docs/mock/design-look-13oct.html` (published as an Artifact — its link is in this job's `HANDOFF.md` block), its 73 pictures `raptor-port/docs/mock/2026-10-13-design-look/`, the scripts that took them `raptor-port/scripts/handpass/dl-*.mjs`, and the record for the next agent — where each finding sits in the code, what was and was not looked at, the independent reader's report — `raptor-port/docs/handpass/2026-10-13-design-look.md`. **What it holds:** the clash note as built and three ways drawn into the running app; the passing notes N1–N33 before and after, and the two he pictured drawn in the app's own note; the look's findings L1–L16 with a picture each (the host's own and a fresh, blind Opus reader's, put together); a keyboard list of every key pressed (K1–K11 are gaps) and the keys calendar step two must carry, written before it is built. **The four choices put to him (the page's §5):** (1) the clash note — A, B or C; (2) a passing note the full width of a phone; (3) the shorter wordings — all, some or the first group; (4) the small fixes as one batch before calendar step two. **Then:** the builds, each with its own check — `[LW-CLASH-NOTE-PHONE]`, `[NOTES-SHORTER]`, `[LOOK-13OCT-SMALL-FIXES]`; then calendar step two (`[ONE-DATE-CALENDAR]`).

**AFTER the combined design guide (D813):** the look is made against `[SKILL-FUSION-JAKUB]`'s guide — its draft is enough to start; the calendar already built (step one) is looked over against it here, and step two is not started before it.

**His words:** *"can u also look at designs u just did and going to do. Also include keyboard functions if anything was missed out."* **The page to make for him (an Artifact page, sharp pictures at his iPhone's size and a desktop's — the memory note on mock-ups):** (1) **built on the night of 13 Oct 26** — the one date calendar (step one: every date box's calendar, its month and year lists, the swipe), the Tracker's date boxes (the ✕ inside the box, the marking pop-up's Done on / Failed on), the OIL question's sheet and the bar that stays ("put back", "file"): the design guide's critique and audit of each, on the built app at both sizes — hierarchy, spacing, words, contrast, focus, and **what a keyboard can and cannot do** (open, move by day / week / month / year, pick, clear, close, Tab order, where focus goes after; the sheet's and the bar's buttons) — each finding with its picture and its fix; (2) **coming** — calendar step two (the fixed calendars in an input's own window, the holiday form, the Leave War's range pickers — `raptor-port/docs/superpowers/specs/2026-10-13-one-date-calendar.md`), with the keyboard set it must carry written down before it is built; `[LW-CLASH-NOTE-PHONE]` (D805 — two or three ways, drawn on the real app); `[NOTES-SHORTER]` (D806 — the before / after list). **Then:** his choices; then the builds, each with its own check. Nothing already built is changed before he has seen the page. A branch of its own, cut from the live app once the night's pull requests are in (or from step one's branch if he wants it sooner — the look needs the new calendar). Ruling: D807.


*Moved here 2026-10-18 by backlog-archive.mjs ([NOTES-SHORTER]). Forward facts: `raptor-port/docs/handpass/2026-10-14-three-builds.md`, `raptor-port/docs/ui-contracts.md`.*

### [NOTES-SHORTER] The passing notes after an action are shortened — publishing and unpublishing a day first (his direction D806, 13 Oct 26) — APPROVED, to build (D828, D829, 13 Oct 26): the page's wordings to the letter, and a note the full width of a phone; in the one batch
**Built and checked 14 Oct 26 (branch `claude/approved-jobs-batch-build-cc42ef`, one batch with the two items beside it — D485); not merged: waits for his look on his iPhone and his "merge live".** Tier WALK: the host's seven scripts (151 lines, all `works` but the 8 that record two filed jobs), three Sonnet walkers (W1 12 of 12, W2 28 of 32, W3 92 of 96 — every FAIL taken to the code, none a fault of the build), 36 break tests, a fresh blind Opus read (four findings, all applied), the full gates. The evidence sheet: `raptor-port/docs/handpass/2026-10-14-three-builds.md`. **What he changed on the way (14 Oct 26):** the refusal under the day's "Nothing today earns" switch reads, in his own words, "Nothing on this day earns. Turn off the switch first." from one source, in all three places it is said (D843, D844, D845) — the walk had found that the wording he approved sat on a puck nobody can tap. **Walked by the host, on the screen's own "Publish day":** the note he pictured — "Saturday 18 Jul published and approved. The Common Programme has no usable times, so nobody on it earns OIL." — two lines on a phone, full width. **Not walked by their gestures, carried by tests:** N4 (the warning before an Unpublish whose OIL is spent) and N24 (a guard no screen gesture reaches today). **To be seen on his iPhone: a note the full width of the phone.**
**The wordings to build changed on 14 Oct 26 — D837, D838, D839 ("All approved as recommended"), which REPLACE D829's:** build the wordings of `raptor-port/docs/superpowers/briefs/2026-10-13-wording-recheck.md` — List 1 (twelve notes; N8 is NOT built, the app can no longer show it; N33 stays removed), List 2 (the notes left whole: only the dash changes, in this build), List 3 (ten wordings a fresh reader tripped on, each replacing its note's wording in the other two lists) — and read its last section first (N1 is two notes the app joins; N7 sits in seven places; the relatives NOT to touch). The design page's §2 and the paragraphs below are history, not the words to build. The full width on a phone (D828) is unchanged.
**His answers — D829 ("All good") and D828 ("Yes"):** build the wordings of `raptor-port/docs/mock/design-look-13oct.html` §2 exactly (N1–N4, N7, N8, N10, N11, N14, N16, N19, N24, N26; N33 removed, its link opening Admin; every other note left whole), re-express the tests that pin each sentence, and make the note take a phone's full width less a small margin (`raptor-port/src/ui/toast.ts` — keep the rise-in movement in step). Seen on his iPhone before it is called done.
**His correction — D825 ("some of them I feel like the key words are gone. Too summarised"):** a shorter wording keeps every key word — what happened, why, what it costs, where to put it right; only filler is cut; a note that cannot lose a word without losing a fact is left whole. **Then checked by Fable against each note's wording in the app (D826): four corrected** — N11's redraft read as its opposite; N2 "until it is republished"; N3 keeps "back"; N24 stays two notes; N28 left whole. **Redone the same evening (the page's §2):** thirteen notes with filler cut, each row saying exactly what went (N1–N4, N7, N8, N10, N11, N14, N16, N19, N24, N26, N28), N33 removed as builder's talk, and the rest listed as left whole. Measured with the redone words: the unpublish note is five lines in today's half-width box and TWO in a full-width one — the box, not the words, does most of the shortening. The paragraph below is the first list, kept for the record; its wordings are NOT the ones to build.
**Put to him 13 Oct 26 (`[DESIGN-LOOK-13OCT]`):** 33 notes with a shorter wording each (N1–N33 on the page; the app has 276 passing notes, 99 of nine words or more — the rest are named there as "leave"), the two he pictured drawn in the app's own note at a phone's size. **Found while drawing them — half of "wordy" is the box:** on a phone the note is only HALF the screen wide (195 of 390; it is centred by `left:50%`, `raptor-port/src/ui/toast.ts`), which is why his two ran five lines; the same words in a full-width box are three lines, the shorter words there two. His choice 2 is whether the note takes the phone's width; the build then keeps the rise-in animation's own centring in step. **N33 is a fault by a standing rule, not a matter of taste:** Quals → "Add qualifications" says "Django-style backend in the full build" (`raptor-port/src/ui/QualsPage.tsx`; "UI copy reads production", 25 Aug 26). **Not in the list:** the Leave War's own notes and the Tracker's — the whole-app words job (D808). The record: `raptor-port/docs/handpass/2026-10-13-design-look.md` §2.


**His words, with two pictures from his iPhone:** *"it’s quite wordy. Anyway we can shorten it and be concise"* — the note after publishing ("Monday published — APPROVED · Monday 13 Jul: the common programme has no usable times, so nobody on it earns OIL") and after unpublishing ("Monday unpublished — it is a draft again; publishing reissues the Original · its OIL credits leave the Leave War until it is published again"), five lines each over the schedule. **To do:** (1) list every passing note the app can show that runs past about eight words — where it is written (`raptor-port/src/engine/publish.ts`, `raptor-port/src/state/sched-commit.ts` for these two; a search of every `toast(` for the rest) — with a shorter wording beside each, the day named once and no warning dropped — and a note that only says what the screen already shows may simply go (D808's addition) (first drafts: "Monday published · Common Programme has no times — no OIL from it"; "Monday unpublished — its OIL is off the Leave War until republished"); (2) put the list to him, together with the phone's clash note `[LW-CLASH-NOTE-PHONE]` (D805) — one page; (3) build what he takes, the tests that pin each sentence re-expressed, with its own check (words on screen only unless a note's place changes too — then a look at both sizes). A branch of its own, cut from the live app. Ruling: D806 (D726 applied to the notes).


*Moved here 2026-10-18 by backlog-archive.mjs ([LW-CLASH-NOTE-PHONE]). Forward facts: `raptor-port/docs/handpass/2026-10-14-three-builds.md`, `raptor-port/docs/leavewar/known-gaps.md`.*

### [LW-CLASH-NOTE-PHONE] On a phone the Leave War's "clashes with the schedule" note is redesigned — its layout and where it sits (his direction D805, 13 Oct 26) — approved as drawn, to build (D827, 13 Oct 26 — "a+ build it"); in the one batch with the notes and the small fixes
**Built and checked 14 Oct 26 (branch `claude/approved-jobs-batch-build-cc42ef`, one batch with the two items beside it — D485); not merged: waits for his look on his iPhone and his "merge live".** Tier WALK: the host's seven scripts (151 lines, all `works` but the 8 that record two filed jobs), three Sonnet walkers (W1 12 of 12, W2 28 of 32, W3 92 of 96 — every FAIL taken to the code, none a fault of the build), 36 break tests, a fresh blind Opus read (four findings, all applied), the full gates. The evidence sheet: `raptor-port/docs/handpass/2026-10-14-three-builds.md`. **As built:** the slim line under the two rows, one clash open and several closed, the list in aligned columns sized by the roster's longest callsign, a tap opening that day FOR that person (or the leave's own window on the Inputs page), the desktop strip in the same words; his Show / Hide is forgotten when the last clash goes (the read's R3). With two clashes open the grid starts 250 down an 844-tall phone (125 with none), with four 344. **To be seen on his iPhone: the clash list.**
**Its words are now the writing-guide page's (D837 — 14 Oct 26):** the weekend clash unchanged; the leave clash "The input is OML, but the bid is LL"; the last instruction "Step the war back to Bidding Closed"; the desktop's line ends its sentence before the instruction — `raptor-port/docs/superpowers/briefs/2026-10-13-wording-recheck.md` (the second table). The drawing and every behaviour below stand.
**HIS "BUILD IT" — D827:** the page's "A+" block and `raptor-port/scripts/handpass/dl-clash.mjs` (modes `N-closed` / `N-open`) are the design of record, every behaviour written there included. To be seen on his iPhone before it is called done.
**His choice — D823 ("this but neater like alignment", of the drawing of option A):** the slim full-width line under the two rows that opens its list in place, the list's parts lined up and every row the same shape. **And Fable read it on HIS WORD (D826) — its fixes are in the drawing:** the name's column a fixed width (the roster's longest callsign), the day never wraps, the instruction is what gives way, one bold a row; and the build must also do what the page now says — a tap OPENS that day for that person (not only jumps to it), one clash starts open, open-or-closed kept for the visit, no inner scroll, the desktop strip takes the same words (layout unchanged). Detail: the look's record, section 6. **Redrawn the same evening** (the page's "A+"; `raptor-port/scripts/handpass/dl-clash.mjs` modes `N-closed` / `N-open`): one grid for the whole list — the name, the day, what to do right-aligned with its arrow in a column of its own; what clashes on a second line across the row, with its key words (D825: "Weekend/PH work earns FO, but the day holds LL"; "Change the leave on Inputs", "Send back or delete", "Step back to Bidding Closed"); every row 48 tall; the line's edges are the buttons' above it (10 and 380 of 390). The card starts 156 down with the line closed, 254 with two clashes open. **Waits on:** his "build it" (D805: a picture before the build). B and C are not taken.
**Put to him 13 Oct 26 (`[DESIGN-LOOK-13OCT]`):** the built note reproduced on a phone (100 wide of 390, 294 tall, the grid's card starting 396 down an 844 screen — the second row does not wrap, so the note's "take a line of its own" cannot happen there), then three ways drawn into the running app by `raptor-port/scripts/handpass/dl-clash.mjs`: **A** a slim full-width line under the two rows that opens the list in place (recommended; the card from 156 closed, 253 open); **B** an amber count on the second row that drops a list as the under-manned days do (no height, but the stage's name is cut to "OPEN FOR BID…"); **C** the same line naming the first clash and counting the rest. In all three each clash reads who · the day · what clashes, then what to do ("Fable · Sat 18 Jul · earns FO, holds LL — Decide the bid ›") and a tap goes to the day. **What the drawing found that this item had not named** (each is a requirement for the build): the lines become buttons (the under-manned list's jump; the Inputs page where the leave was filed there); the four "what to do" sentences need short forms; a long callsign with a long instruction wraps to two lines; past five clashes the list scrolls inside itself; the line is a real button for a keyboard. The desktop is shown unchanged, and once with the shorter words only (D679). The record: `raptor-port/docs/handpass/2026-10-13-design-look.md` §1.


**His words, with a picture from his iPhone:** *"the warning on the phone phone when things clash is ugly can u redesign its layout and placement"*. **What is wrong today:** the amber note is one strip inside the top row's line of buttons (`raptor-port/src/leavewar/ui/Chrome.tsx`, `.syncclash`, admin only); on a phone it gets the width the buttons leave — about a third of the screen — so "Vector: weekend/PH work earns FO but 13 Jul 26 holds OML — change the leave on the Inputs page" wraps three words a line, the row is a third of the screen tall, the stage / dates / Under-manned / Legend buttons are pushed to its middle, and the round menu button lies over its corner. **To do:** a mock-up on the real app, at his iPhone's size and a desktop's, of two or three ways (for instance: one slim full-width line under the top rows — "2 clashes with the schedule ▾" — that opens the list; or a count on a button of the second line that opens a sheet), each with fewer words a clash (D726) — who, the day, the two codes, what to do; then his choice; then the build with its own check (a phone's top of the Leave War is D678's two lines — the note must not break them; the desktop stays as it is unless he says, D679). A branch of its own, cut from the live app. Ruling: D805.


*Moved here 2026-10-18 by backlog-archive.mjs ([LOOK-13OCT-SMALL-FIXES]). Forward facts: `raptor-port/docs/handpass/2026-10-14-three-builds.md`, `raptor-port/docs/ui-contracts.md`.*

### [LOOK-13OCT-SMALL-FIXES] The small fixes the design look of 13 Oct found — the OIL question's layout and words, its bar on a phone and by keyboard, the calendar's four missing keys and two small points, the Tracker's "Failed on" label (filed 13 Oct 26) — APPROVED, to build (D830, D831, 13 Oct 26): all of L1–L17 and K1–K4, K7–K10, K12, one batch before calendar step two; the bar that stays moves to the band under the top bar — a picture to him first
**Built and checked 14 Oct 26 (branch `claude/approved-jobs-batch-build-cc42ef`, one batch with the two items beside it — D485); not merged: waits for his look on his iPhone and his "merge live".** Tier WALK: the host's seven scripts (151 lines, all `works` but the 8 that record two filed jobs), three Sonnet walkers (W1 12 of 12, W2 28 of 32, W3 92 of 96 — every FAIL taken to the code, none a fault of the build), 36 break tests, a fresh blind Opus read (four findings, all applied), the full gates. The evidence sheet: `raptor-port/docs/handpass/2026-10-14-three-builds.md`. **As built:** L1–L17 and K1–K4, K7–K10, K12, none left out; the bar that stays is a band under the top bar, ALWAYS one line (D840 — his "I prefer the one line"), the line under a bar amber and the two bars one height (D841), one ring on a picked answer that has the keyboard (D842 — his "Double blue ring"). **Found and fixed by the check, older than the batch:** in the calendar's month-and-year lists End chose a year sixty years on, Page Down and Space six; a repeat of a held Escape closed the bar with the question (the read's R2); two test files whose dates had come due or were about to (`placeholderlist`, `sharedline`). **To be seen on his iPhone: the bar.** What the walk found that is NOT in this batch: [BATCH-14OCT-LEFTOVERS].
**Its words are now the writing-guide page's (D837, D839 — 14 Oct 26):** the OIL question's title "OIL: Tally, Range brief", its reason and question with commas for the two dashes, "Yes: credit HO", "can raise the credit" — `raptor-port/docs/superpowers/briefs/2026-10-13-wording-recheck.md` (the second table, and List 3 row 10). "Back / Add", "Back / Save" and the bar's own words are unchanged. Every other fix below stands.
**Found by `[DESIGN-LOOK-13OCT]`, not fixed — several are questions for him, not faults (the page marks them "Put to you": they touch a look he approved from a picture or a ruling). Each is put to him with its picture and its exact change (the page's L1–L17 and K1–K4, K7–K10, K12 — L17 and K12 from Fable's read, D826: weekend dates inside a picked run stay dim; Delete on a filled date box does nothing. And one product question inside L6, put to him as the page's choice 5: whether the bar that stays takes the band under the top bar that the "Not saved" warning has — D587 — instead of the foot; recommended to him: the band, drawn first); nothing is built until he says.** Where each sits in the code, and its change: the table in `raptor-port/docs/handpass/2026-10-13-design-look.md` §3. In short: **the OIL question** — its two answers wear a style that belongs to the week strip (a stray patch and a line behind them — older than last night, and on every sheet of that family), its ✕ follows the title instead of sitting in the corner (every sheet of that family), its words are about 70 where about 40 do (a before / after is on the page), at an input's own save it offers "Cancel / Save" over the form's "Cancel / Add", a picked answer is filled as solid as the main button, the keyboard starts on the sheet and reaches ✕ first; **the bar that stays** — half a phone's width for the same cause as the passing note (`[NOTES-SHORTER]`), not reachable by Tab (114 presses) and deaf to Escape; **the date calendar** — Home / End, a year at a time, and the keyboard's way into and out of the month-and-year lists; a date that cannot be picked still looks alive where it is today or the marked weekday; on a phone the card does not say which date it is for; the sentence under a run of dates is in the "press me" colour; the faint dates one step stronger; the lists' keyboard place shown by a ring, not a cyan word; **the Tracker** — a future day looks pickable and is refused only after the pick (D374's four boxes), a date reads as a record before anything is marked ("Fails: 0", "Failed on" today), the side panel's boxes change width when filled; **the ring** — the question's answers, its ✕ and the bar's buttons wear the browser's own ring, not the app's. **The check when built:** words and look on screen, an OIL surface — a short walk at both sizes with the keys pressed again (`raptor-port/scripts/handpass/dl-*.mjs` re-run is the re-check), the tests that pin each sentence re-expressed; a fresh Opus read (D790). A branch of its own.

## Moved 18 Oct 26 — the priority list of 24 Sep to 18 Oct 26 (the backlog tidy, D1024)

**Where this order comes from:** his own orders, each cited; where he has set none, the item's own "Place" line —
said as such, never dressed up as his. One line per item, in plain words; the detail is the item below. The old
list (13–23 Sep 26), its finished entries and the "In plain terms" block are in `OUTSTANDING-ARCHIVE.md`, moved
whole on 24 Sep 26. **Re-order this list whenever an item changes** (§Maintaining).

**RULED 18 Oct 26 — [UPCHIT-SHEET-LEAVE-CUT] (D1023):** the upchit sheet will also list each leave and bid a give-back cuts, before anything changes — BUILT the same day on `claude/upchit-sheet-leave-cut`, waiting for his look and "merge live".

**FILED 18 Oct 26 — [GATELOCK-STALE-PORT]:** the full check set run through the PC lock tested ANOTHER chat's old build, because a preview left running on 4173 was reused — a guard so the lock's run picks a free port by itself. Tooling, low risk, its own small job.

**FILED 18 Oct 26 — his answers after the night (D1019, D1020, D1022):** [LW-CARD-SHORT-WORDS-700] (the Leave War card's short button words up to 700), [DATEBOX-ESC-LISTS] (Escape shuts the floating calendar's lists first), [UPCHIT-DELETE-REGROW] (a deleted upchit gives the downchit its days back) — one small job together, once pull request 534 is live; D1021 keeps the dashed mark as built.

**FILED 18 Oct 26 — [TRK-PINCH-OLD-EDGES]:** two older edges of the Tracker chart's pinch, met by [TRK-CHART-FPS]'s reads — low, with the next Tracker batch.

**FILED 18 Oct 26 — [TRK-FLEX-SETTING], [TRK-LEGEND]:** his directions (D1006, D1007) — the flex editable with a switch that turns it off everywhere; a legend for the Tracker — one Tracker job with the down days (D1002–D1005). **FILED 18 Oct 26 — [TRK-DOWN-DAYS-AUTO]:** his direction (D1002) — the Tracker's down days worked out from the Inputs, ATT B included, a tap shows each input; the Upchit Date box goes — not designed, his questions first. **FILED 18 Oct 26 — [LW-SORT-BY-FLIGHT]:** his intent, an option to sort the Leave War by flight (D1001) — not designed; his to raise. **His answers of 18 Oct 26 to the backlog's questions:** D998 (1 parked), D999 (4), D1000 (11), D1001 (7) — the rest in `raptor-port/docs/superpowers/briefs/2026-10-18-sixteen-questions.md`.

**LIVE 18 Oct 26 (pull request 533, his "merge live") — D994's first batch, the scheduling pages on a phone:** *(D996 follows — the Inputs page's input window, and perhaps every short phone window, in the middle; his scope answer first, `HANDOFF.md`.)* [SCHED-INPUT-WINDOW-PHONE] (the schedule's own input window as tall as it needs, in the middle of a phone's screen — his D995; a finger on it never scrolls the page behind; the Inputs list no longer widens a phone on its side) and [OIL-NOTIFY-SEEN] (5) (the crew drawer put away after an Unavailable hand-over); [PHONE-WIDE-BOARD-BLANK] closed — fixed and live since 6 Oct 26, confirmed on today's build. Its check: `raptor-port/docs/handpass/2026-10-18-sched-phone.md` (WALK). **Next in D994's order:** the next area's small fixes.

**LIVE 18 Oct 26 (pull request 532, his "merge live") — [TRK-CHART-FPS] (D992) with D993:** the Tracker's chart and Info half scrolled by the phone itself, the pinch as a picture; Quals' pinned header row moved by the browser; archived with [TRK-SCROLL-GLIDE]. **NEXT, his word (D994):** the small fixes that need no answer from him, by area, the scheduling pages on a phone first; his questions wait until he says so (`HANDOFF.md` §Next).

**NEXT (his question, 17 Oct 26) — [CONTEXT-START-SIZE]:** why a new chat starts 30–40% full, whether it grows, and options to cut it — MEASURED and put to him 17 Oct 26; his "As recommended" (D969–D971): A, B, C, G done; the capitals sweep (D972) and the push-and-lock guard (D976) done 17 Oct 26 on `claude/sharp-goldberg-6d0656` — LIVE 17 Oct 26 (pull request 525); D, the scheduler split, not done (D976).

**CLOSED 17 Oct 26 — [MED-NEWYEAR]:** not a fault of the app — a medical input filed across New Year through the window saves its end with its year and shows on the Medical tab; the item rested on a row planted without its year (D56). Pinned by a browser test; archived.

**LIVE (merged before 18 Oct 26 — the branch `claude/tracker-feature-batch-6ea3a7` is in `main`) — the Tracker batch's [TRK-FILE-TRANSFER-SPLIT] (D493, D775):** the import's store-free steps beside the file format — its item leaves for the archive at the next documents pass (its homes checked first). Round 1 of the batch's questions answered and built (D980–D984, pull request 530); left of the batch: [TRK-IMPORT-REFUSAL-WORDS] (his to word), [TRK-PINCH-ASK] (his look — his "Yes this feels good" of 18 Oct 26 on the new pinch may close it, to put to him), [TRK-PINCH-OLD-EDGES].

**LIVE 17 Oct 26 (pull request 528) — [OIL-CONFIRM-DAYGRID] (D923):** the OIL question's "Only some days…" is the app's one calendar; FULL-checked; his look answered and "merge live" given (D978) — pull request 528; the item leaves for the archive at the next documents pass (the archive is over its size marker). Found on the way: [CAL-ESC-LISTS] — Escape with a calendar's month list open closes the whole form; his to place.

**DONE 17 Oct 26 on `claude/small-fixes-1017` — his "U can do the small things quick here first":** [PUSH-GUARD-LEFTOVERS] (the guard reads variables, xargs, PowerShell's quotes; two fresh reads) and [INPUTS-LIST-NEXT-YEAR] (the Inputs list reads each input in its own year); both archived. Found on the way: [TILL-NEXT-YEAR] — small, with the next Inputs batch.

**LIVE 15 Oct 26 (pull requests 517 and 518, his "merge live"; their items are in `OUTSTANDING-ARCHIVE.md`):** a new input opens on OL, the title's pencil, When and Remarks above the calendar (D917, D919, D920); the Tracker's ⇅ Reorder rows drag by finger and by mouse, one look (D922, D924). **Next, ruled the same night (D926–D928):** the Medical tab and Quals' one row, then the Logic page as drawn — `claude/one-row-guide-medical`; then [OIL-CONFIRM-DAYGRID] (D923), its own job.

**LIVE 16 Oct 26 (pull request 519, his "merge live"; their items are in `OUTSTANDING-ARCHIVE.md`):** the Medical tab's one row (D927), the Logic page rewritten (D928–D933, D936), Quals' one row and its paragraph deleted (D935), "Save" on a phone and Quals opening at its top (D937); a Tracker test pinned against midnight. Its owed reads are in [NO-ASTRA-LIST].

*(Done — LIVE 16 Oct 26, above.)* **His answers of 15 Oct 26 ("All as recommended" — D911, D912), two small jobs after the calendar job, each its own:** [GUIDE-ONE-ROW] — the design guide's rule that a page's own buttons share its one row of controls: drafted, read by one fresh reader, put to him (D911). [MEDICAL-ONE-ROW] — the Medical tab's heading goes and its date button joins a row under the tabs at 36, drawn for him first (D912).

**His find, 10 Oct 26 (on his iPhone) — LIVE the same day (pull request #489; the item is in `OUTSTANDING-ARCHIVE.md`):** in the changes window, a tap on a change whose seat is empty now lands on its row (`[HIST-JUMP-EMPTY-SEAT]`). Still open — small older finds met on the way, his to place: [HIST-JUMP-SEEN].

**MERGED on his "merge live" of 11 Oct 26 (pull request #490; its four items — `[GROUP-INPUT-ONE-ROW]`, `[REQ-ROW-OWN-BOXES]`, `[REQ-ROW-SELF-CLASH]`, `[CAL-TOGO-ONE-ITEM]` — are in `OUTSTANDING-ARCHIVE.md`):** the schedule's one row for a shared input (D661, D662, D734–D749; the rules: `raptor-port/docs/engine-rules.md` "On a shared input's row the pucks are the input's people", "A shared input is counted once"; `raptor-port/docs/ui-contracts.md` §A shared input is ONE row on the schedule), and with it his find of the wrong ring colours (D751). Its check: `raptor-port/docs/handpass/2026-10-11-group-input-one-row.md`. Found while planning, a question for him: [INPUT-CHANGED-TELL].

**A question for him, found while building the phone's two lines (8 Oct 26):** [LW-HEAD-BIG-PHONE] — between 431 and about 700 wide (the largest iPhones are 440) the top of the Leave War is at its TALLEST; D679 keeps everything wider than a phone as it is. Should those screens get the phone's two lines?

**Filed by the skill-notes review (13 Oct 26) — the agent's placing: after the Calendar job, a small job each:** [SHELL-SCRIPT-GUARD] — a guard that refuses a script typed straight into the command line (his go to build it: D811). [CHECK-TOOLS-HARDEN] — small hardening of the checking tools. [HWW-RULINGS-SIZE] — the general rulings file is at its size marker: the one-off permissions of merged jobs to be read and archived.

**LIVE 15 OCT 26 (pull request 506, his "merge live"):** the small OIL job (D816, D818, with D862, D863, D865) — its check `raptor-port/docs/handpass/2026-10-14-oil-uncancel-load.md`; its items are archived; what remains of it is the three small jobs below.

**LIVE 15 Oct 26 (pull request 514; its five items are in `OUTSTANDING-ARCHIVE.md`):** the Leave War's landing line through the figures, one line a gap, a drag held at the edge scrolls, the grips' reach, the guide's §5a. **LIVE 15 Oct 26 (pull request 515, his "merge live"; the item is in `OUTSTANDING-ARCHIVE.md`):** the Inputs month turns at its side under a run of days or a bar; the Tracker chart pans at its edge (D897–D899); his iPhone find (a run would not turn back) fixed with it — only his iPhone proves it (the sheet's §13). **LIVE 15 Oct 26 (pull request 516, his "merge live"; `[DRAG-EDGE-FOUR-MORE]` and `[ONE-DATE-CALENDAR]` are in `OUTSTANDING-ARCHIVE.md`):** calendar step two (D901), the four more edge drags (D900), the Inputs list's two buttons in the top row on a phone (D910). **Left from it, RULED (D922, D923 — each its own job after [INPUT-NEW-DEFAULTS], a picture first):** [TRK-REORDER-FINGER-DRAG] — a finger drag for the ⇅ Reorder rows (a picture first); [OIL-CONFIRM-DAYGRID] — the OIL question's own "only some days" grid is a near-copy of the old calendar. **Older, filed by its reads:** [TRK-WIREBOARD-REPEAT], [TRK-BALL-OFF-CHART-LEFT].

**His answers of 15 Oct 26 (D877, D878 — "3 all no glow 4 fix"), two jobs — LIVE 15 Oct 26 (pull request 512):** [GLOW-OFF] — the board's other glows go, each keeping its ring; walked 36/36; his iPhone look (the people picker's chip answered and built, D879). [COMPACT-BANDS-WINDOW] — the compaction notes count against the app's own room; read by one fresh reader, its findings fixed; his approval, then the main folder brought level.

**His answers of 15 Oct 26 ("Questions 1-6 as recommend" — D865, D866), three small jobs — 506 is live (15 Oct 26), so each may start:** [OIL-PLAN-SWITCH-UNASKED] — "Switch to this plan" that brings back an input with no OIL answer gets the load's short note and list. [GUIDE-ONE-MARK] — the design guide carries "one mark, one look": draft, one reader, his approval of the wording. [GLOW-PLACES-LOOK] — the other places that glow (the landing flash after a drag or an Undo, the keyboard ring) drawn for his look; nothing changes before he says.

**His word of 14 Oct 26 (D859), both for 15 Oct 26, neither app work:** [OVERNIGHT-SKILL] — approved and installed as `/overnight` (D869, 15 Oct 26 — LIVE, pull request 508; the item is in `OUTSTANDING-ARCHIVE.md`). [COMPACT-WHEN-MOD] — LIVE (D870–D872, pull request 509); the next new chat on `main` runs its four checks in the app. [HANDOFF-RESET-TRACKS-MAIN] — the session-handoff guide's reset line leaves a branch tracking `main`, so pushes silently do nothing (observation 599): a one-line guide fix, his approval. [MAIN-CHECKOUT-STALE] — found running the four checks (14 Oct 26): every desktop chat takes its settings, hooks and skills from the main folder, 208 commits behind `main`, so none of the set-up was in force; bring that folder to `main`, then re-run the checks in a new chat. Re-run 15 Oct 26: the compaction point moved (about 845,000 of 1,000,000), but the notes come late — [COMPACT-BANDS-WINDOW]. Found by its read: [RUN-CHECK-BOTH-RUNS] — the "are the checks still running?" look read one run of two; FIXED with the compaction set-up (D870, D872; in `OUTSTANDING-ARCHIVE.md`).

**A test to steady, any time (found 8 Oct 26):** [LW-REQ-PICK-MONTH-UNSTEADY] — one Leave War browser test (the Required panel, phone size) failed once in a full run at its month-button step and passes alone and in the next whole run.

**Found by `[GROUP-INPUT-ONE-ROW]`'s walk (11 Oct 26) — his to place:** [WEEK-ADD-TAP-PHONE] (older; low), [ONE-ROW-DRAG-FLASH] (cosmetic; to settle with the job's code read).
**MERGED on his "merge live" of 12 Oct 26 (pull request #491, D779; its four items — `[ALL-AVAIL-AS-MEMBER]`, `[PERSONAL-SEVERAL]`, `[OIL-ASK-LIST-SEVERAL]`, `[INPUT-CHANGED-TELL]` — are in `OUTSTANDING-ARCHIVE.md` since 13 Oct 26):** One rule for every input’s row — a row that came from an input IS the input, whoever stands on it is in it (a named person or ALL AVAIL / ALL), and an input is stored as one record with its people (D750, D753, D755–D773, D776–D778); its check `raptor-port/docs/handpass/2026-10-12-one-rule.md`, the rules `raptor-port/docs/engine-rules.md` and `raptor-port/docs/ui-contracts.md` (the dated notes of 12 Oct 26). The ChatGPT read it went live without is on the one list (`[NO-ASTRA-LIST]`).
**Found by the one-rule job's check, not fixed (12 Oct 26 — the agent's placing: with the next Inputs / History batch):** [DISCARD-FILING-NOOP] — "Discard 1 edit & load" for an input filed after the day went out promises a discard and changes nothing; [SCHED-INPUT-WINDOW-PHONE] — on a phone the schedule's own input window is short and lets the page scroll behind it (his iPhone look first). *(BUILT 18 Oct 26 with D994's first batch — waiting for his look and "merge live".)*
**Left from the one-rule job, none of it urgent (filed 13 Oct 26 — the agent’s placing: with the next Inputs / schedule batch):** [ONE-RULE-LEFTOVERS] — two housekeeping jobs that job’s last step did not reach: its 55 behaviour ids are not yet checked by the rule check; four out-of-date notes in the code. (The third — one unused field in the published-day list — was done on 13 Oct 26 with the Inputs batch.)

**BUILT 13 Oct 26, waiting for his look and "MERGE LIVE" (D793 — branch `claude/inputs-schedule-batch`):** the small Inputs / schedule batch — an input put back on the programme waits on its OIL question; History's gold dot on a man put on an input's row; one unused field removed; a stray test-run timer. Its check: `raptor-port/docs/handpass/2026-10-13-inputs-batch.md`. **Its one question, answered 13 Oct 26 (D804 — leave and medical never earn OIL; every other kind is asked and its answer decides):** "→ Unavail" now puts the OIL question first, as "Accept" does — built on the same branch, [UNAVAIL-FILE-OIL-ASK]. **Also built there, D814:** a cancelled or information-only input is never asked the OIL question. **Filed by its reads, older, low:** [BELL-UNAVAIL-WORDS] (the member's bell says "Back on the programme" for a filing under Unavailable — two sentences his to approve); [OIL-LOAD-VERSION-UNASKED] (HIS: should a published version loaded back ask? recommended no, like an Undo). **Found by its reads, older, low:** [OIL-ASK-HEAD-SEVERAL] — at two older doors the OIL question for a shared input is headed with one man. **Seen by it, older, low:** the Leave War browser test's unsteady month-button step failed in a second test ([LW-REQ-PICK-MONTH-UNSTEADY]).

**Seen by `[OIL-ASK-NOTIFY]`’s walk, older, not fixed (13 Oct 26 — the agent’s placing: with the next Inputs / schedule batch):** [OIL-NOTIFY-SEEN] — six small things met in passing: the Undo note after a swap says "a personal input"; a puck dragged off a row gives no note; the crew list’s ALL AVAIL chip scrolls out of reach on the week; an input’s own window deletes with no "are you sure"; on a phone the crew drawer stays open after a hand-over and covers Undo *(BUILT 18 Oct 26 with D994's first batch)*; on a phone on its side a drag near the board’s edge scrolls the board and the puck is let go over nothing.

**The one date calendar — step one LIVE 13 Oct 26 (pull request 495), step two LIVE 15 Oct 26 (pull request 516); `[ONE-DATE-CALENDAR]` is in `OUTSTANDING-ARCHIVE.md`.** Still open beside it: [CAL-PHONE-SWIPE-FIT] (his iPhone look). **BUILT 13 Oct 26, waiting for his look and "MERGE LIVE" after step one's (D801 — branch `claude/tracker-date-boxes`, cut from step one's):** [TRK-DATE-BOXES] — the Tracker's date boxes are the app's own; raised by its read, unproved, low: [TRK-DATEBOX-SAFARI-ZOOM] (Safari on an iPad — where the calendar sits). **Found by its check, older, not fixed (the agent's placing):** [LW-PHONE-AWAY-ROW-MISSING] (a restored man's row missing on a phone — reproduce first), [PO-MOVE-DATE-DELETE-ASK] (a moved post-out date and a Delete's second ask — reproduce first), [IT-GUIDE-DATEBOX-SCRIPT] (a picture script to re-point).

**NEXT, his word (13 Oct 26 — D786; side by side with the skills review — D794), a fresh chat on `main`:** [CAL-PHONE-SWIPE-FIT] — in the Calendar window on a phone, swipe between months and, on the Holidays list, between years; the "Every Thursday" window’s From date box runs off the right edge of his iPhone and must fit any phone width.

**MERGED on his "merge live" of 13 Oct 26 (pull request #492, D791; its item `[OIL-ASK-NOTIFY]` is in `OUTSTANDING-ARCHIVE.md`):** the OIL question comes BEFORE a swap, an add or a move and the change is made only on an answer; a day made a holiday afterwards tells the admin at once and the schedulers what is left unanswered (D780–D785); its check `raptor-port/docs/handpass/2026-10-13-oil-ask-notify.md`, the screens `raptor-port/docs/ui-contracts.md` §The OIL question comes before the change. The ChatGPT read it went live without is on the one list (`[NO-ASTRA-LIST]`).
**Small, from the one-rule job's last round (12 Oct 26 — the agent's placing: with the look-and-feel pass):** [ONE-RULE-SMALL-WORDS] — ten sentences, hints and marks that read oddly (a bell's "You were added" for a piece of a man's own leave; "taken off" for a man given his own part); **when the ChatGPT readers are back:** [OPUS-SECOND-READ-GUIDE] — the checking guide's line on a second, blind Opus read (decided under D595, waits for its two readers — D70).
**For the database step (the agent's placing):** [NOTICE-RETENTION] — the bell's notices are kept for good in this build; how long one is kept is the organisation's rule, with the change history's (D351).
**His question, answered — his to act on or leave (12 Oct 26):** [SIMILAR-APPS-LOOK] — what other apps like ours do, from a search of the public web: eleven products, eight lessons, what ours has that they lack and the reverse; nothing built from it.
**LIVE 15 Oct 26 — the three builds and the leftovers batch, with the one-look blue ring (D860, D861), went out in pull request 506 on his "merge live" (505 closed unmerged, its work inside — D864).** Their items stay open below only for what is still filed under them (the leftovers' small faults); the rest of each is done.  — waiting for his look on his iPhone (the clash list, the full-width note, the bar) and his "MERGE LIVE"; and so are the leftovers he answered — [BATCH-14OCT-LEFTOVERS]'s three answers and three note deletions, built on the same branch on the night of 14 Oct 26 (D849, D851, D854), one "merge live" for the lot; its five small filed faults stay open; THEN, on a branch of its own, the small OIL job (D816, D818 — built that night on his yes, D857, read by Opus alone, D858); calendar step two is next after the merge.** *As first written:* **Before any of the three builds (his word, D833, 13 Oct 26, late): the writing guide is finished first ([SKILL-FUSION-WRITING]) and the approved WORDINGS are rechecked against it and put to him again — the designs themselves stand.** **DONE (14 Oct 26): he approved the guide (D836) and the rechecked wordings (D837–D839 — "All approved as recommended"); the three builds are next, to the wordings of `raptor-port/docs/superpowers/briefs/2026-10-13-wording-recheck.md`.** **He has answered the design page (13 Oct 26, late — D827–D831): three builds are approved, one batch, next in the order, before calendar step two** — [LW-CLASH-NOTE-PHONE] (the "A+" drawing, as drawn), [NOTES-SHORTER] (the page's wordings to the letter; a note the full width of a phone), [LOOK-13OCT-SMALL-FIXES] (L1–L17, K1–K4, K7–K10, K12; the bar that stays moves to the band under the top bar, a picture first). Where to start: `HANDOFF.md`, the `claude/design-page-oct-13-review-a35956` block. **Also filed, his to place:** [SKILL-FUSION-WRITING] (he asked whether a writing skill can be taken from outside). *As first written:* **The design page is made and with him (13 Oct 26) — four choices wait on him, nothing built:** [DESIGN-LOOK-13OCT] — one page: three ways to redo the Leave War's clash note on a phone ([LW-CLASH-NOTE-PHONE]; recommended: the slim line under the two rows), the shorter passing notes before and after ([NOTES-SHORTER]; and the note's box found to be half a phone's width), the look over the night's designs and the keyboard list. **Filed from it:** [LOOK-13OCT-SMALL-FIXES] — the small fixes, one batch, on his word (his choice 4); and two keyboard jobs, each its own, his to place: [KBD-PUCK] (a puck cannot be picked up by keys), [TRK-KBD-CHART] (the Tracker's chart and marking pop-up). Calendar step two follows his choices (D813).

**His direction for AFTER the one-rule build (D765, 12 Oct 26) — his to place:** [UI-SLEEK-PASS] — the interface made more minimal, intuitive and sleek: fewer words, where buttons sit, how things move, what colours mean, icons, the flow; the Raptor look kept, never at a cost of speed. Questions and pictures first (D541).
**Kept for when ChatGPT is back — not before 1 Nov 26 (his word, D761):** [NO-ASTRA-LIST] — the one list of every job that went ahead without Astra or Sol 6.1, to put to him then.
**Found by the calendar job's bug check (8 Oct 26) — after its merge, his to place:** [CAL-UNDO-OTHERS] (reproduce first), [CAL-CHECK-SEEN] — small, none loses data or OIL. ([CAL-TOGO-ONE-ITEM] was built with the one row — archived 11 Oct 26.)
**Found by the title's check (9 Oct 26) — older than that job, his to place:** [TITLE-CHECK-SEEN] — ten small finds; the phone's hidden "Unsaved changes" question is the one a person would trip on.
**LIVE since 10 Oct 26 (pull request #488, on his "merge live"; its eight items are in `OUTSTANDING-ARCHIVE.md`):** the Inputs pages' work — the day window's two jobs, ALL / ALL AVAIL and the kind Event, an input's own title, the input card, the design vet's changes, the second batch of small finds and the day's title box (D684–D732). **What it left open — readings he has not answered, his looks on his iPhone, three unconfirmed observations:** [INPUTS-LIVE-LEFT]. **Its own job, after [GROUP-INPUT-ONE-ROW] (the agent's placing — before the Tracker batch unless he says otherwise):** [TILL-FROM-DATES] — the app stops writing "till <date>" into remarks (D728, step 2); questions to him first.

**Filed 10 Oct 26 by the tidy-up after that merge — documents only, none a fault in the app:** [CAL-JOB-LEFT] — six lines the calendar job's handoff block still owed (a stale line in the Codex guide, two reads never run, an old mock-ups page, three looks nobody recorded); [RULINGS-SPENT-PASS] — the rulings files grew past their size markers: archive the spent rows in a documents-only chat, then the scheduler file's size goes back to him (D611).
**Found by the ALL AVAIL / Event check (9 Oct 26) — older than that job, his to place:** [ALLAVAIL-CHECK-SEEN] — small, none loses data or OIL; rides with the next Inputs or amendment batch.

**With step 5 of the calendar job, the Inputs calendar (found 8 Oct 26):** [INPUTS-LIST-NEXT-YEAR] — the Inputs list shows a next year's input among this year's dates, without its year, until it is edited (seen on the demo's 15 Feb 2027 OIL; the cause read in the code, to reproduce first).

**After the Inputs / SANS calendar job (its place is his to set):** [LW-WINDOWS-NONBLOCKING] — the Leave War's other windows still block the grid behind them and close on a click outside; D641 and D642 changed that for the calendar job's windows and for one war panel only. Its own job, its own check.

**From Claude's check of the Codex stack (5 Oct 26) — its place is his to set:** [OIL-WORK-START] — a flying line's earned leave is to
count from its entered in-time / Rally (D591), and a published weekend must keep the earned leave it went out with when a Logic value
changes (today it moves at once). **BUILT, FULL-checked and MERGED on his "merge live" — live since 7 Oct 26 (PR #484; D591, D592, D606); archived 7 Oct 26.** Low, beside it: [OIL-ZERO-SPAN-SORTIE] (words only); low-medium, older than it: [UNPUB-WARN-AL-RESTORES] (the Unpublish warning over-warns when an amendment is withdrawn); low, older than it, found by its browser test: [LOGIC-REDRAW-DROPS-TYPING] (the Logic page redraws its rules just after it opens, and a value being typed at that instant is dropped); low, words only, from its walks: [OIL-EARN-DAY-SWITCH-WORDS] (OIL Earn's "Nothing today earns" button reads like a status), [SC-B-CHANGE-SAYS-BRIEF] (the changes window calls an SC shift's in-time "brief"). **D606 (7 Oct 26 — an SC shift's typed in-time counts for OIL) was built and checked on the same branch.** **From his D607 (7 Oct 26 — a walk is sized per change by Opus, from a record of past walks), next, with [START-CONTEXT-AUDIT]:** *(both DONE 7 Oct 26 — D607, D608 — and archived:)* [WALK-LEDGER-HISTORY] (compile the past walks into the record and write its figures), [WALK-SIZING-GUIDE] (the checking guide's wording, read by Astra and Sol before he approves it). [INTIME-LINES-DRAG] (D593, his ask of
5 Oct 26 — drag a wave's In-time / Rally lines into order on the Scheduler Board, Auto sort too; proposed in the same batch). Low, from the same
check, each with the next change to its page: [INP-OIL-CHIP-PHONE] (the OIL chip over a phone request card's date), [BOARD-TIME-ESCAPE]
(Escape does not restore a time box on the board — a question for him). [EDIT-SECOND-CLICK] (low — after a
changed text box on Edit Schedule, the first click into another box lands on the page and a second is needed; the same on the live
app; with the next change to the schedule's text boxes). **The same check's three parked questions were answered on 6 Oct 26 (D597–D599) and built on the stack branch** — the items
are in `OUTSTANDING-ARCHIVE.md`; the sheet's §13 has the walk. Low, a question for him: [INSIGHTS-EMPTY-LINE-COUNT] (an uncrewed line counts as a sortie and a formation in Insights). ANSWERED 10 Oct 26 (D739, D740 — a time or remark typed on a request's row changes the request itself; built with [GROUP-INPUT-ONE-ROW]): [REQ-ROW-OWN-BOXES] (as filed: typing in a request's programme row changes the row, not the request — BUILT with the one row and archived, 11 Oct 26). **From the four readers' second pass (6 Oct 26) — older than the stack or low, not fixed in the check:** [REST-BLANK-LINE] (MEDIUM — a man put on a flying line with no take-off loses his crew-rest check; **BUILT and FULL-checked 6 Oct 26 on `claude/rest-blank-line` (D602) — MERGED, live since 6 Oct 26 (PR #482)**; [OIL-WORK-START] (since built and live, 7 Oct 26 — archived) was NOT built with it — his instruction for that chat named the crew-rest fault alone — and stays next, its own job), **found by that check and filed, none of them this fix's doing: [BLANK-TIMES-ABSENCE] (MEDIUM — a man on all-day leave or a downchit seated on a line with no times gets no line in the warning list until a time is typed; answered YES, flag him at once — D605; **BUILT and FULL-checked 6 Oct 26 on `claude/blank-times-absence-picker-2cebae` — MERGED, live since 6 Oct 26 (PR #483)**), [SC-PICKER-INTIME-REST] (low–medium — the crew list does not warn of crew rest before a man is put on an SC seat whose typed in-time is early; from Sol's read of the fix; **BUILT with it, the same branch**), [SC-BLANK-SHIFT-QUAL] (low), [CREW-REST-MARK-COPIES] (low, a question for him), [BLANK-LINE-SANS-WORDS] (low — its absence sentences done with D605), [TAB-LAST-BOX-TEST-GAPS] (low, tests only)**, **found by the D605 check and filed, none of them its doing: [BLANK-STANDBY-STRIKE] (low — the crew list strikes a man on local leave for a standby seat whose shift times are blank), [BLANK-SEAT-ACTIVITY-HINT] (low — the crew list says nothing before a man with a whole-day course is put on a seat with no times; the list flags him after), [SC-SPARE-RING-BORROWS] (low — one man in a MAIN and a SPARE seat of one SC line: the spare puck wears the MAIN's leave ring), [REQ-ROW-SELF-CLASH] (low — times typed on an all-day request's own row flag its own man), [SC-INTIME-REST-WORDS] (low — the crew-rest sentence calls an SC line's in-time its "start"), [UPCHIT-MOVE-NO-REGROW] (low, a question for him — an Upchit moved later does not give back the days it cut), [OFT-ADD-TWICE-SILENT] (low), [LOOK-PENDING-COUNT] (low)**, then [START-CONTEXT-AUDIT] (what a new chat loads at its start, measured and cut to what a job needs, never at the cost of quality — D602; its first step, the tidy-up after the Codex stack went live, is done and archived; **MEASURED and its options written 7 Oct 26; his ruling D609 the same day — options 1 to 4 DONE on `claude/docs-tidy-7-oct` (the merged handoff blocks out, 28 spent rulings and 19 finished items to their archives, his memory notes pruned), 5 and 6 after Astra's and Sol's reads, 7 found nothing to do; option 8 NOT done — the scheduler's rulings stay whole (D611); left open in it: the check that stops it growing back, low**; with it [WALK-LEDGER-HISTORY] (DONE 7 Oct 26) and [WALK-SIZING-GUIDE] (DONE 7 Oct 26 — read by Astra and Sol, approved by him, D608, and in the guide)), [R3-OWED-READS] (both reads done 6 Oct 26 with the crew-rest fix's scenario read — it leaves at the next documents-only pass), (the two small Blue/Red fixes that stood here were built in the check's third round, 6 Oct 26, and archived; `[ROLE-NOT-CHOSEN]` was answered "leave it" — D603), [PEND-INTIME-WORDS], [BOARD-INTIME-JUMP], [WINDOWS-KEEP-KEYS]. Low, tests only: [SAVE-NOTE-TEST-GAPS] (two soft spots in the failed-save warning's browser test, from Astra's read of its last round).

**The database comes at the end (D473, 1 Oct 26 — replaces D354's "starts now", on the IT side's own advice):** the app's features
are built first; group A of `[DB-READINESS]` is built and its last phase (7) waits on his look; group B, the lock's screens and
`[DB-STEP]` wait for the end; the table list is kept up to date as each feature is added, and the table format is written on his
side for the IT side to enter. The paragraph below is as written while the step was "starting now"; its ORDER stands.
**The database step starts now (D354, 29 Sep 26):** — and how it shares and locks, [DB-SYNC-MODEL] (D355, D356 — the mock-up and §9 DONE 29 Sep 26 on `claude/day-lock-mockup-data-model-493d27`, the red team running; his six screen questions open); for the IT team, the flow guide [IT-FLOW-GUIDE] is DONE (42 slides, `raptor-port/docs/it-flow-guide/`, merged on his "merge live" 29 Sep 26; archived). The IT team is taking the app into Dataverse now; the order below
stands, its timing ("about two months away", "about a month before") is overtaken — the readiness batch and the OIL
award fix are due before the tables are settled. What to finish before the hand-over: his answer to be recorded here.
**His order — to the database step (D203, 26 Sep 26; D173, D147 within it):**
1. **Done — [DRAFT-PENDING]**, the one changes window (D210), MERGED 28 Sep 26 (PR #451); its two follow-ups
   [HIST-PHONE-HIDE] and [CHG-BY-ITEM] (D339, D340, D345, D346) MERGED 28 Sep 26 (PR #455), and [LW-FIGSEL-FLAKE] (D342,
   PR #454) — all archived. Before it: **[ONE-DOOR]** (D309, D310, carrying [POST-IN-DATE], D308) MERGED 28 Sep 26 (PR #450;
   archived); `[POST-OUT-OUTCOMES]` (PR #446), `[ACCOUNTS-NEW-PERSON]` (PR #443), `[ACCOUNTS]` (PR #442) and
   **[LW-MOVE-STANDARD]** (D264–D266, PR #447) MERGED 27 Sep 26. Left from them: `[POST-OUT-TRACKER]`, on his answer.
2. **Now, beside the building — [IT-QUESTIONS]:** talk to the IT side (his, not code); their approvals take weeks.
3. **Development as normal — [HUMAN-RETEST]**'s remaining three, in HIS order (D147): the absence record TOGETHER with
   [S4-HUNT-REST] — **WALKED 26 Sep 26** on `claude/absence-record-d147-af6a50`; his answers to its questions (D260–D263)
   recorded, and D260–D262 BUILT and FULL-checked there 27 Sep 26 (D263 goes with [DRAFT-PENDING]); from his look, D264–D266
   (one look for the sheets, a Move on every record that can move) — [LW-MOVE-STANDARD], BUILT and MERGED 27 Sep 26
   (PR #447; archived) — then change-recording (with [UNDO-ROSTER-SETTINGS], D148 and [UNDO-TOPBAR] — MERGED
   29 Sep 26, PR #464; both archived),
   then the Leave War links LAST (with the 7 Sep phone check). Then "after the hunt" (21 Sep 26): [LW-LOCKMARK] →
   [LW-WEEKDAY-WORK] (talk to him before building any of it) — its first, the published day's unavailable list, was
   closed by the same re-test (built by [LEAVE-LATE-PUBLISHED]; archived).
4. **Split in two (D453, 29 Sep 26 — narrows D203's "ONE batch"):** **[DB-READINESS] group A** (what decides the tables'
   shape) before it settles its tables, with the small OIL follow-ups below and [OIL-EARNED-VS-GRANTED] (D147);
   **group B** (tuned against the real database) AFTER the app is connected. First, [DB-SYNC-MODEL]'s design fixed.
   ([OIL-AWARD-IS-A-GRANT] is DONE, merged 29 Sep 26.) Group A: plan v4 final (30 Sep 26); **phases 0–5 and 5b built
   30 Sep 26** on `claude/db-readiness-table-shaping-4094f6` (plan §9); **its FULL check done 30 Sep 26** (the walk and both
   reviewers' code reads, every finding fixed — `raptor-port/docs/handpass/2026-09-30-dbrA-group-walk.md`); **phase 6 (a),
   (b), (d) built and FULL-checked 30 Sep 26** (`raptor-port/docs/handpass/2026-09-30-dbr-phase6-check.md`); **phase 6 (c) v3
   (the holder base) planned, red-teamed (round 3, the last), BUILT and FULL-checked 1 Oct 26 on
   `claude/db-readiness-p6c-holder-base`** (D467 — `raptor-port/docs/handpass/2026-10-01-dbr-phase6c-check.md`; the walk and
   both final reads found twelve defects, all fixed red first, one of them money; his answer on a moved request's extras:
   leave it, D468);
   **phases 0–6 MERGED 1 Oct 26 on his "merge live" (PR #476); phase 7 — the small OIL follow-ups below — BUILT and FULL-checked
   1 Oct 26 on `claude/db-readiness-p7-oil-followups`** (plan and build log
   `raptor-port/docs/superpowers/plans/2026-10-01-db-readiness-phase7-plan.md`; evidence `raptor-port/docs/handpass/2026-10-01-dbr-phase7-check.md`) — **MERGED 1 Oct 26 on his
   "merge live" (PR #477). Group A is closed.**
5. **At the END, once the features are built (D473, 1 Oct 26) — [DB-STEP]:** the table format written on his side (with his AI)
   for the IT side to enter, then the one adapter to those tables; the stack
   ([ARCH-STACK]) resumes there, with its step 6 still to come; the [AMEND] work is queued behind it. Architecture first,
   then the individual bugs (D144).
6. **Before ANY collaborator is added** — an event, not a slot: take the checks runner off this repo (SEC-101, in
   [REPO-PRIVATE]); and make the repo private again once the public period (D106) ends — his. IT's clone is such an event
   ([RESTRICTED-ENV-WORKFLOW]'s go-ahead), and so is [REPO-TIDY]'s screenshot move (the clear of the old worktrees any time).

**The small OIL follow-ups — ONE batch, with the OIL award fix, before the tables are settled (D147, D203, D354): BUILT 1 Oct 26 as
`[DB-READINESS]` phase 7, all six archived** — [OIL-READ-LEFTOVERS] (its items 1, 2, 4), [STORE-READER-SWEEP], [OIL-REQ-NAMEBOX]
(answered D470 — a man in the name box of another man's request earns), [OIL-WORDS], [OIL-PERSONAL-PLACEHOLDER], [CROWD-SIM-BRIEF];
evidence `raptor-port/docs/handpass/2026-10-01-dbr-phase7-check.md`. MERGED 1 Oct 26 (PR #477). ([OIL-RELINK-XWEEK] closed 1 Oct 26 by `[DB-READINESS]` phase 6 (c).)

**BUILT, FULL-checked and MERGED 1 Oct 26 (PR #478; archived):** [WARN-HIDE-KEPT] — a hidden warning stays hidden for everyone until unhidden, flags no puck, is not counted, and its line stays in the list struck out (D469, D471, D472, D475); the evidence: `raptor-port/docs/handpass/2026-10-01-warn-hide-check.md`. Out of the check, all answered the same evening: Insights counts each day's latest published version ([INSIGHTS-WHICH-COPY], D477, D478 — the next build), the drop's amber note stays (D479), and one Sonnet walker goes on trial on the next walk ([SONNET-WALKER-TRIAL], D476).

**Placed by their own lines — not his rulings:** from the `[DB-READINESS]` phase 7 walk (1 Oct 26), none of them this batch's — low, each with the next change there: [COUNT-CHIP-PHONE-TAP] (fixed for Chromium in phase 7; his iPhone look left), [INP-TILL-STALE] (a remark keeps a "till" date its request no longer reaches — new data), [OIL-INERT-TAP-SILENT], [OG-TAG-OVER-COUNT], [MEMBER-EDITPAGE-CHECK] (a check, not a known fault); from the group-A FULL walk (30 Sep 26) — with group B:
[UNDO-PUBLISH-ERASES-ISSUANCE], [TRK-IMPORT-ONE-GROUP], [TRK-FIRST-ORDER-PLACE] (low); low, with the next change there:
[TRK-UNDO-WRITES-DEFAULTS], [SECDEFAULT-OFFER-BEHIND-BOARD], [BLOCK-NO-HISTORY-LINE], [ACCOUNTS-SEED-FIRST-WRITE] (demo
only), [SETTINGS-LIST-ROWS] (a stage-2 split, only if it bites), [LW-OIL-DATECHIP-HIDDEN], [READONLY-WEEK-WORDS];
before the first real deployment: [SHARED-OPENS-DEMO-WEEK]; a question for him: [LW-LABEL-NO-DOOR]; with group B:
[ELOG-LINE-AFTER-COMMAND] (low); the Leave War — [LW-FROZEN-BAR-GAP] (after [HUMAN-RETEST]; show him
first), [LW-SCRUBBER-FLAKY] (test-only),
[PO-RESTORE-POSTING] (low, from its final code read), [LW-OFFER-ONLY-TAKEABLE] (low, with [LW-LOCKMARK]), [LW-HARNESS-VIEWER-PIN] (test-only, low), [CI-FAIL-PICTURES] (his call, low), [IMPECCABLE-UPDATE] (D625 — to v4.1.3, after the calendar job), [STACK-LEFTOVERS] (low — four small loose ends named in the Codex stack's archived items), [WALK-COST] (a proposal, his word starts it — measure where a walker's tokens go on the next fanned-out walk, then a library of ready walk steps), [SANS-CALENDAR-WIP] (DONE — the calendar job it became is live since 9 Oct 26, PR #487; archived 10 Oct 26; nothing of the Codex work is deleted, D610), [LW-DOZE-GUARDS] (low, check first); the shell — [SHELL-SIDEWAYS-BAR] (low, with the next top-bar change), [SAVE-NOTE-COVERS] (BUILT 5 Oct 26 on `codex/save-note-controls` — MERGED with the Codex stack, live since 6 Oct 26, PR #481), [FLOATWIN-TWO-LINE-BAR] (low, with the next change to either movable window), [GUEST-SAVE-WARNING] (low — a check first, with the next change to the guest's pages), [EVIDENCE-RECORD-SIZE] (low, his call — at Claude's review of the Codex branches), [TRK-SAVE-FAIL-SAYS-SAVED] (low, with [DB-READINESS]), [TRK-ASYNC-STALE] (with [DB-READINESS]), [LW-WINDOW-PRUNE-FLAKE-2] (test-only, low); the Tracker — [TRK-REMOUNT-LANDING] (low, with the next Tracker change), [TRK-KEY-NAME-CLIP] (low, with the next Tracker change). The Tracker — [TRK-PINCH-ASK] (his next Tracker session), [TRK-FLEXBAR-INK] (a question for him, on the Tracker-palette
look card — D157, merged PR #441).
The amendment area — PR #434, #435, #437 and #438 MERGED (25–26 Sep 26); left (the small-fixes batch, PR #463, merged 29 Sep 26, filed): [PLAN-BANNER-DOOR] (low, filed by that batch's walk), [ROW-NO-TIME-MARK] (low, a future job, D361), [APP-FONTS-NOT-LOADED] (his call — found 29 Sep 26; every measured width rides on it), [GATELOCK-STALE-LIVE] (low, the check lock's stale rule), [DOCSIZE-MERGE-CEILING] (low, a false alarm of the document check on a merge), [PDF-PRINT-TWICE] (low, found by the IT flow guide research — to confirm in real Chrome), [LW-SEL-HALF-LABELS] (low, the drag sheet's half-day labels — D264), [ITFLOW-OIL-RESHOOT] (low, on his word — D403), [TRK-REFUSALS-UNTESTED] (low, test gaps the guide research found). Left from the amendment batch (D91–D111, merged): [AMEND-SMALL-SEEN] (any time). The docs and the checks — [DEPLOY-DOCS] (its operational half), [DOC-POINTERS-CODE] and
[RULINGS-LF-PIN] (with the next code change), [PEEK-ISSUED] (a question for him, low), [RULING-HOME-HOOK] (low), [GUIDE-MAP-ROWS] (low, a question for him), [DOCS-SIZE-PASS] (DONE 2 Oct 26; archived), [INSIGHTS-WHICH-COPY] (D477, D478 — MERGED 1 Oct 26, PR #479; archived), [WORKSPAN-NEGATIVE] (DONE — live 6 Oct 26 with the Codex stack, archived; as filed: **NEXT — the next chat, D483**; the second Sonnet-walker trial rides on its walk), [SONNET-WALKER-TRIAL] (DONE — both trials ran and were decided under D595, archived; as filed: the first walked 1 Oct 26; **one more, on a build with known defects — D480**, with `[WORKSPAN-NEGATIVE]`'s walk), [INSIGHTS-BOARD-DOOR] (DONE — built, live 6 Oct 26, archived; as filed: RULED D481 — to build: a picture first; after `[WORKSPAN-NEGATIVE]`), [INSIGHTS-RULE-CHANGE] (ANSWERED D482 — closed; archived) — [DOC-SUBHEADS], [RULING-HOMES-AUDIT]
and [HANDOFF-SHAPE-GUARD] done on `claude/docs-tidy-subheads-audit-ec8f87` (28 Sep 26; archived),
Roles — [QUALS-MEMBER-SCOPE] (folded into [ACCOUNTS], D200), and beside it [QUALS-PROTO-TOAST] (low, one line of words).
The five-flags batch (built on `claude/five-flags-batch-build-ef7d85`, 26 Sep 26; FULL-checked and its PR from `claude/five-flags-batch-continue-2cfa70`, 27 Sep 26 — its five items archived) — his answers D270–D275 BUILT and FULL-checked on that branch, 27 Sep 26 (their three items archived); his look card's four questions answered 27 Sep 26 (D276–D279, nothing to build);
[ARROW-GUTTER-STRIP] (its strip moot by D275; one small leftover, low); low: [GHOST-FLAG-SHADOW], [LW-SETTINGS-SMALL],
[ALLAVAIL-OPEN-ROW] (investigate first), [VH-SHEETS-IPHONE] (low — other pop-ups sized by `vh`, his D536 find fixed for the windows), [MODAL-DRAG-CLOSE] (DONE — live 6 Oct 26, archived; his report — a window closes when text is drag-selected and let go outside it; FIXED on the Insights branch, D538, awaiting the reads).
Insights — [INSIGHTS-MISSION-MIX] (DONE — live 6 Oct 26 with the Codex stack, archived; what it left open is [STACK-LEFTOVERS]; as filed: D512–D532 settled; built on the isolated branch, qualified FULL checks complete,
fresh independent Astra R2 PASS; Opus interim code read (D533) found three small findings, fixed by Opus the same day (D534, D535);
Claude's later read owed before main), with [INSIGHTS-BOARD-DOOR].
The changes window — [HIST-PER-PAGE] (an idea, filed D349; a mock-up first, after the change-recording re-test). The
phone — [PHONE-DISCARD-MARKS] (MOOT under D488; archived 2 Oct 26 with the Codex build), [PHONE-WIDE-BOARD-BLANK] (CLOSED 18 Oct 26 — fixed and live since 6 Oct 26; archived). The bubble — [BUBBLE-SMALL-SEEN] (low, from the same walk).

**His word, D488; order narrowed by D495 (2 Oct 26):** [DISCARD-MARKS-REMOVE] — DONE, live 6 Oct 26, archived; as filed: BUILT on `codex/discard-marks-remove`; FULL checks and independent Astra inspection passed. Claude's Monday further reads and owner look remain owed before main.

**From the article he sent — his word, D486 (2 Oct 26):** [CODE-TIDY-AUDIT] (Astra's read can run before the reset, D484; the report to him; before [DB-STEP]) and [SKILL-FUSION] (after the reset, a fresh chat on its own branch; three proposals in it wait on his yes or no). **D491 (3 Oct 26):** Astra's tidiness read and its draft of [WORD-LIST] run BEFORE the reset; three pieces of `mattpocock/skills` ride with [SKILL-FUSION]. **D493 (2 Oct 26):** the tidiness read is answered — three tidy-ups approved, each with its area's batch: [LW-ROWS-SPLIT] (the next Leave War batch), [CSS-SPLIT-BY-SCREEN] (DONE — live 6 Oct 26, archived; it was the first step of the workflow UI pass), [TRK-FILE-TRANSFER-SPLIT] (the Tracker batch); two not now (in [CODE-TIDY-AUDIT]).

**DONE — LIVE since 9 Oct 26 (PR #487); [SANS-COMMITMENT-CALENDAR] and [SANS-CALENDAR-WIP] archived 10 Oct 26.** *As written:* **In hand (7 Oct 26): the Inputs calendar and the SANS availability calendar — called back (D614), Opus 5.5 builds from here (D615), on `claude/inputs-sans-calendar`; where it stands: [SANS-COMMITMENT-CALENDAR] and that branch's block in `HANDOFF.md`.** **Historical build authority — D580, put on hold by D585 (5 Oct 26), the hold ended by D614:** [SANS-COMMITMENT-CALENDAR] is authorized to build from delegated recommendations while the owner sleeps; includes Member Inputs calendar and secondary List. Initial D569 scope: monthly SANS demand/shortage calendar, shared day commitments and existing Custom timing form with no Remarks placeholder. Caps/ops new-chat handoff remains cancelled D568; no new chat created. Caps/ops, other Inputs work and Tracker remain outstanding. Earlier builds/every owed read unchanged; agent settles product choices with reasons and pictures before source work; independent review/required checks and Claude before main remain.
**The feature batches — HIS ORDER, D495 (2 Oct 26); Astra plans/reviews, Sol 6.1 builds in Codex until the reset (D496), Claude reviews after it (D494):** *(7 Oct 26: the first four — Discard marks, the work-hours fix, Insights, the workflow UI pass — are built and live (PR #481) and archived; next in this order is Inputs: the Inputs calendar and the SANS availability calendar, called back on 7 Oct 26 and in hand (D614, D615) — [SANS-CALENDAR-WIP], [SANS-COMMITMENT-CALENDAR].)* *(10 Oct 26: Inputs is built and live too — the calendar job, PR #487, and the Inputs pages' work after it, PR #488; both items archived. Next: [GROUP-INPUT-ONE-ROW] (D662), then the Tracker.)* [DISCARD-MARKS-REMOVE] (the small first job) → [WORKSPAN-NEGATIVE] → Insights ([INSIGHTS-MISSION-MIX], with [INSIGHTS-BOARD-DOOR]) → the workflow UI pass ([CSS-SPLIT-BY-SCREEN] first) → Inputs → the Tracker (with [TRK-FILE-TRANSFER-SPLIT]) → caps and ops limits → one whole-app check — the list: [FEATURE-WISHLIST].
**Timing follow-up:** [REST-FIRST-CREW-HINT] — existing empty-formation predictive-rest gap, filed with caps and ops limits; committed placement still validates. Current Rally evidence declares this limitation; no owner approval inferred.
**Availability follow-up:** [SANS-PREVIOUS-REPORT-OFFER] — previous-date offers are not combined with target-date half-days for a previous-evening report; characterized in this round's actual picker/placement, with caps and ops limits. No new availability policy or owner waiver inferred.
**Workflow UI follow-up:** [PALETTE-WRAPPED-HEADER] — inherited sticky-palette overlap under a wrapped desktop account bar; with the UI pass after [CSS-SPLIT-BY-SCREEN]. Current Rally and baseline reproduce it; not dismissed as a helper-only failure.
**Owner's current workflow UI requests — collection complete, build authorized D563 (4 Oct 26):** [TRK-FLIGHT-LABEL-READABILITY] — clearer words inside blue flight balls, wider wing label area proposed; [LOGIC-STICKY-SEARCH-COMPACT] — keep search visible while scrolling and pack existing controls into fewer rows; [INSIGHTS-CLOSE-STAYS-VISIBLE] — keep the close cross at the top while scrolling Insights. Built on codex/workflow-ui after numbered candidates and independent plan challenge; combined first-build checks passed; D564 rejects the first flight shape, D565 steers to a tapered leading edge via his annotation. Specific tapered redraw with native sizes accepted D566; finish checks and fresh inspection of implemented chosen replacement, affected checks/fresh final read/current preview next. Logic/Insights retained. This does not start the Tracker progress-graph batch or change D495's order.

**Waiting on him — no order exists:**
[LOAD-MSG-SHORT] (CLOSED 18 Oct 26 — answered by D863, built; his look "12 looks fine"; archived),
[OIL-EARNED-VS-GRANTED] (ANSWERED D400 and built with the award fix — merged, PR #469, 29 Sep 26; archived 2 Oct 26),
[LEDGER-READ-ASK] (a question for him, from the OIL award build), [LW-COMMIT-MANNING] (his call), [LEAVE-YEAR] ("we will do this next time", 19 Sep — no slot since),
[REPO-PRIVATE]'s sharing half, [EOD] (design first; no slot
ruled), [CRP-FLAG]'s remainder and then [FLAG-EXPORT], the [AMEND] leftovers, [ADMIN-DISPLAY] ("next time we revisit",
D161), with [USER-GUIDE] (wanted, not urgent) and [PERF-RESIDUALS] (two of them change wording
or feel — his call).

**Future milestones:** [DB-STEP] (item 5 above, with [TRK-DISK] inside it, and [RESTRICTED-ENV-WORKFLOW] — the stand-in database and the pull-request workflow — before the first deploy he approves), [XFER], [RECALL], [TRK-ATTEMPTS] (low urgency).

*Moved here 2026-10-18 by backlog-archive.mjs ([PRIORITY-LIST-REWRITE]). Forward facts: `raptor-port/docs/doc-budget.md`.*

### [PRIORITY-LIST-REWRITE] The backlog's priority list still tells finished stories — a rewrite, read by a reviewer (filed 2 Oct 26)
Left by `[DOCS-SIZE-PASS]`: the list at the head of this file (about 90 lines) carries the merge stories of work long
archived (its items 1, 3 and 4, the small-OIL paragraph, the five-flags paragraph). Moving them needs the list REWORDED, and a
reword is read against the original for meaning (D138) — one reviewer, Astra first (D353). The old text moves whole to
`OUTSTANDING-ARCHIVE.md` by `backlog-archive.mjs --move`. **Place:** low — documents only, any time; it would take the file
about 60 lines further under its tripwire.


*Moved here 2026-10-19 by backlog-archive.mjs ([INTIME-LINES-DRAG]). Forward facts: `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`.*

### [INTIME-LINES-DRAG] Drag a wave's In-time / Rally lines into order on the Scheduler Board; Auto sort orders them too (D593, 5 Oct 26)
**DONE 19 Oct 26** on `claude/schedule-amendments-fixes-fffce0` (D994's Schedule and amendments batch, one FULL check — evidence `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`): built as D593 and D594 rule — the board's drag, Auto sort and Sort all, a published day's pending change; what it does now: `raptor-port/docs/ui-contracts.md` §In-time lines; the register's ITD1–ITD3.
**His ruling (D593):** *"I also want the option to be able to [drag] and rearrange in Time/rally. In the schedule board. And the auto sort
button also helps in rearranging."* Full row: `.claude/decisions-full/scheduler.md` D593.
**Today:** a line is added by "+ In-time / Rally", typed in, and removed with its ✕; the lines stay in the order they were added. Their
order changes nothing the app works out — the earliest applicable clock is used whatever the order (D506).
**Answered — nothing is left to ask before building (D594, 5 Oct 26):** the board ONLY — no drag for these lines on Edit Schedule's week,
which shows them in the order the board left them; Auto sort's order is by time, earliest first, a previous-evening clock first, a line
with no clock last, from the wave's own Auto sort and from Sort all; a new order on a published day reads as a pending change. The
six-dot grip is the app's own (the agent's call).
**Tier (the agent's reading):** WALK at least — a new gesture on a shared drawer; FULL if the reorder is recorded on a published day.
**Place (the agent's proposal, his to set):** one batch with `[OIL-WORK-START]` — both are about the In-time / Rally lines — on its own
branch after the Codex stack goes live, with one check for the two (D485).


*Moved here 2026-10-19 by backlog-archive.mjs ([PEND-INTIME-WORDS]). Forward facts: `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`.*

### [PEND-INTIME-WORDS] "To go out" words an edited reporting line as "2 In-time / Rally lines → 2 In-time / Rally lines" (reader AB's second pass, 6 Oct 26 — OLD)
**DONE 19 Oct 26** on `claude/schedule-amendments-fixes-fffce0` (D994's Schedule and amendments batch, one FULL check — evidence `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`): "To go out" names the lines that differ; a pure reorder reads "order changed" (`ui/pendlist.ts reportingLineWords`).
A line's clock changed on a published day, with the number of lines unchanged: the pending list shows the same words before and
after (the changes window's "All changes" shows the real text). The same on `main` ("2 in-times → 2 in-times"). Fix: word the lines
that differ — `…/stack-read2-AB.md` F3. **Place:** low — with the next change to the changes window.


*Moved here 2026-10-19 by backlog-archive.mjs ([SC-INTIME-REST-WORDS]). Forward facts: `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`.*

### [SC-INTIME-REST-WORDS] The crew-rest sentence calls an SC line's typed in-time its "start" (seen 6 Oct 26, the D605 walk — OLD; low)
**DONE 19 Oct 26** on `claude/schedule-amendments-fixes-fffce0` (D994's Schedule and amendments batch, one FULL check — evidence `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`): the crew-rest sentence calls an SC line's typed B its in-time.
An SC shift 13:00–19:00 with B (its in-time) 05:00, a man clear at 12:30 placed on a MAIN seat: "… crew rest clear at
12:30, but SC AM starts 05:00 — only 4h30 rest." The shift starts 13:00; 05:00 is its in-time. The arithmetic is right
(the in-time is the report); the word is not. `raptor-port/src/engine/validate.ts`, the crew-rest sentence's shift
branch. **Fix:** "… but SC AM's in-time is 05:00 …" when the report is the typed B and "starts" only when it is the
shift's start; the crew list's line is unaffected. **Place:** low — with `[OIL-WORK-START]` or the next change to the
crew-rest sentences.


*Moved here 2026-10-19 by backlog-archive.mjs ([SC-BLANK-SHIFT-QUAL]). Forward facts: `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`.*

### [SC-BLANK-SHIFT-QUAL] An SC line whose shift times were cleared prints "(NaN:NaN–NaN:NaN)" in its currency warning, and asks for NIGHT currency (found 6 Oct 26, the crew-rest fix's check — OLD; low)
**DONE 19 Oct 26** on `claude/schedule-amendments-fixes-fffce0` (D994's Schedule and amendments batch, one FULL check — evidence `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`): a blank-shift SC line prints no broken time and asks for no night currency.
Tuesday "+ Wave" → SC; clear the first shift's start and end boxes; put a man who holds SC DAY currency only in its first MAIN
seat: the list says "SC currency — wrong shift — SC NIGHT currency needed for SC AM (NaN:NaN–NaN:NaN) — Scribe is not current"
(walkers A and C, and the host's unit run; picture `…/2026-10-06-rest-blank-line/C/dk-01-h03-plain-list.png`). With no shift
times there is no day or night to tell (`validate.ts`, the SC currency check). Clearing an SC shift's times is a rare act — the
wave is minted with them. **Fix:** with no usable shift window, say nothing about day or night currency (or say the shift has
no times) — never print a clock that is not there; a red test first. **Place:** low — with the next change to the SC rules, or
with `[BLANK-TIMES-ABSENCE]` (the same family: a rule reading times that are not there).


*Moved here 2026-10-19 by backlog-archive.mjs ([BLANK-LINE-SANS-WORDS]). Forward facts: `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`.*

### [BLANK-LINE-SANS-WORDS] On a line with no times a SANS man's offer is still worded as a clash, and a line with no callsign leaves holes in sentences (found 6 Oct 26, the crew-rest fix's check — OLD; low)
**DONE 19 Oct 26** on `claude/schedule-amendments-fixes-fffce0` (D994's Schedule and amendments batch, one FULL check — evidence `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`): a SANS man's offer on a line with no times no longer reads as a clash; a line with no callsign leaves no hole in a sentence.
(1) A SANS man offering Fly 14:00–16:00, seated on a blank line: the list says "… planned for   — available 14:00–16:00 only"
although there is no time yet to compare with his offer; the crew list does not strike him (it has no window to test) — the two
disagree (walker C, S28c). (2) A line with no callsign or mission prints its blank name into sentences: "cannot fly FCP ( )",
"OCU in   with no IP", "planned for   —". **Place:** low — with `[BLANK-TIMES-ABSENCE]` (what each rule says when a seat has no
times) or the next change to those sentences; "this line" where the name is blank.
**Part done 6 Oct 26 with D605 (`claude/blank-times-absence-picker-2cebae`):** the three ABSENCE sentences ("On leave but
planned to fly …", "… but tasked — …", "… clashes with …") say "this line" / "this row" where the seat has no name, with
times and without. Still open: (1) the SANS offer worded as a clash on a line with no times, and the blank name in every
OTHER sentence ("cannot fly FCP ( )", "OCU in   with no IP", the clash and brief sentences).


*Moved here 2026-10-19 by backlog-archive.mjs ([BLANK-STANDBY-STRIKE]). Forward facts: `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`.*

### [BLANK-STANDBY-STRIKE] On a standby seat whose shift times are blank, the crew list strikes a man on LOCAL leave — whom the rule lets stand it (found 6 Oct 26, the D605 build — OLD; low)
**DONE 19 Oct 26** on `claude/schedule-amendments-fixes-fffce0` (D994's Schedule and amendments batch, one FULL check — evidence `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`): the crew list no longer strikes a man on local leave for a standby seat whose shift times are blank.
"+ Wave" → BB (it comes up with no shift times), or an SC wave with its first shift's start and end cleared; a man on
local leave (LL) all day; arm a BB seat, or the SC SPARE seat: his name is struck "local leave (LL)". Type the shift's
times and the strike goes; seat him either way and the day's list says nothing — a local leave may stand a standby place
(owner, 10–11 Aug 26; D605 keeps each kind's exemptions). **Cause:** the crew list tells a standby place by its HOURS —
`raptor-port/src/engine/avail.ts` `slotRules` sets `avJet` only beside a start time, and `slotBar`'s `spareLike` reads
`r.sc`, the shift's day / night kind, which is null without times — so a blank standby seat is judged like an ordinary
one ("unknown fails closed", pinned in `slotrules.test.ts` with exactly this case). Stricter than the rule, never looser:
no man the list flags is offered clean (pinned in `blankabsence.test.ts`, which names this gap). **Fix:** set the standby
flags whatever the hours (`avJet` for any AVALON / BB line; `spareLike` on `scSpare` alone), keep failing closed for a
type that DOES bar the seat, and change the `slotrules.test.ts` pin to an overseas leave; a red test first. **Place:**
low — with the next change to the crew list.


*Moved here 2026-10-19 by backlog-archive.mjs ([BLANK-SEAT-ACTIVITY-HINT]). Forward facts: `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`.*

### [BLANK-SEAT-ACTIVITY-HINT] Before a man with a whole-day course or meeting is put on a seat with no times, the crew list says nothing — the list flags him the moment he is seated (Astra's code read of D605, F2, 6 Oct 26 — a gap the build left on purpose; low)
**DONE 19 Oct 26** on `claude/schedule-amendments-fixes-fffce0` (D994's Schedule and amendments batch, one FULL check — evidence `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`): the crew list says a man is on a whole-day course before he is put on a seat with no times (D605).
A whole-day Training for a man; "+ Line" (no times); arm its seat: his name is offered with no reason. Place him: "Training
clashes with this line" (the drop's toast says it at once). With hours on the seat the crew list does advise first
("already on Training") — its soft check for a personal commitment needs the seat's hours
(`raptor-port/src/engine/avail.ts` `slotBar`, the "IS HE ALREADY BUSY AT THIS HOUR" block, guarded on `slotStart`). For a
LEAVE, a downchit or an overseas duty there is no such gap: the crew list strikes those on a seat with no hours. D605 was
built with the crew list unchanged (its full row, reading (7)); pinned as it stands in `blankabsence.test.ts`. **Fix:** in
that block, a whole-day personal commitment advises against a seat with no hours too ("already on Training", never a
strike); a red test first. **Place:** low — with `[BLANK-STANDBY-STRIKE]`, the next change to the crew list.


*Moved here 2026-10-19 by backlog-archive.mjs ([SC-SPARE-RING-BORROWS]). Forward facts: `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`.*

### [SC-SPARE-RING-BORROWS] One man in a MAIN and a SPARE seat of one SC line: his SPARE puck wears the MAIN seat's leave ring (Astra's scenario read of D605, F3, 6 Oct 26 — OLD; low)
**DONE 19 Oct 26** on `claude/schedule-amendments-fixes-fffce0` (D994's Schedule and amendments batch, one FULL check — evidence `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`): the SC SPARE puck wears its own ring, never the MAIN seat's (week and board).
An SC line, the same man in a MAIN seat and a SPARE seat of the same shift, a local leave all day: the MAIN seat is
flagged ("On leave but tasked — SC AM"), rightly; the SPARE seat's puck wears the red ring and C too, though local leave
may stand a spare. Reproduced by the host through the rule and the week's own drawer, with the shift's times blank and
typed (typed, the pair is red anyway — "standing SC SPARE and also on SC AM MAIN"). **Cause:** the exempt seat's puck
rings for any warning anchored anywhere in its formation (`raptor-port/src/ui/html.ts` `exemptLineOwn` — the key-prefix
match), and a MAIN seat's absence warning is anchored on the MAIN seat of that formation. It needs one man in two seats
of one shift — already a planning error. **Fix (Astra's steps):** for an SC SPARE's absence ring accept the
formation-level spare warning and not a MAIN seat's key that merely shares the prefix; keep the currency and two-places
matching; pin week and Board, blank and timed, with an overseas leave and ATT C as positive controls. **Place:** low —
with `[CREW-REST-MARK-COPIES]` (the next change to how pucks are drawn).


*Moved here 2026-10-19 by backlog-archive.mjs ([SC-B-CHANGE-SAYS-BRIEF]). Forward facts: `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`.*

### [SC-B-CHANGE-SAYS-BRIEF] The changes window calls an SC shift's in-time "brief" (found 7 Oct 26, the D606 walk — E02, E06, E15; OLD; LOW, words)
**DONE 19 Oct 26** on `claude/schedule-amendments-fixes-fffce0` (D994's Schedule and amendments batch, one FULL check — evidence `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`): an SC line's B is "in-time" in the history, "To go out", the changes window and Undo, on the week and the board.
On an SC line the B box is the crew's in-time, not a brief (owner, 24 Aug 26), and since D606 (7 Oct 26) it moves OIL. A B typed
or changed on a published day is listed under "To go out" as "SC · brief  06:00" (and "06:00 → 08:00") — the box's general name.
**To build:** on an SC line, name the change "in-time" in the changes window, the pending list and the edit history; every other
line keeps "brief". **Tier:** WALK (the changes window's words, a published day, both sizes). **Place (the agent's line):** low —
with the next change to the changes window's wording, or with `[OIL-EARN-DAY-SWITCH-WORDS]`.


*Moved here 2026-10-19 by backlog-archive.mjs ([BOARD-INTIME-JUMP]). Forward facts: `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`.*

### [BOARD-INTIME-JUMP] On the Scheduler Board a reporting-line change in the changes window is not a button (reader AB's second pass, 6 Oct 26 — OLD)
**DONE 19 Oct 26** on `claude/schedule-amendments-fixes-fffce0` (D994's Schedule and amendments batch, one FULL check — evidence `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`): a reporting-line change in the changes window is a button on the board too.
The board draws the In-time / Rally block with its address, but the list of "details the board does not draw" still names it
(`raptor-port/src/ui/histbubble.ts`), so its line cannot be tapped to go there. `…/stack-read2-AB.md` F4. **Place:** low.


*Moved here 2026-10-19 by backlog-archive.mjs ([BLOCK-NO-HISTORY-LINE]). Forward facts: `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`.*

### [BLOCK-NO-HISTORY-LINE] Placing a duty block from + Block, or removing a medical document, writes no history line (filed 30 Sep 26)
**DONE 19 Oct 26** on `claude/schedule-amendments-fixes-fffce0` (D994's Schedule and amendments batch, one FULL check — evidence `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`): + Block, a placed SC / AVALON / BB wave and a document added or taken off each write a history line.
**Place:** low — with the next change-history change. Seen in passing by the group-A FULL walk: a block placed (W1 G2c)
is saved (its day row, one batch) but the changes window has no line for it, unlike + Wave or + Line; a document removed
from a medical request (W2 13g) saves the request with no line. Probably old behaviour (not compared). **Do:** log the
block's addition as + Wave logs a wave's, and a document's removal as its addition is logged.


*Moved here 2026-10-19 by backlog-archive.mjs ([DISCARD-FILING-NOOP]). Forward facts: `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`.*

### [DISCARD-FILING-NOOP] "Discard 1 edit & load" for an input filed after the day went out promises a discard and changes nothing (the one-rule job's walk, share F — F1, F8, 12 Oct 26)
**DONE 19 Oct 26** on `claude/schedule-amendments-fixes-fffce0` (D994's Schedule and amendments batch, one FULL check — evidence `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`): "Discard N edits & load" counts only what it discards (`engine/drafts.ts dayDiscardCount`).
**Found, not fixed — low; NOT yet compared with the live app.** On a published day, file a new input (it lands on the programme: "1 pending"). "Load onto working copy" offers "Discard 1 edit & load — confirm"; confirmed, the note says "1 unpublished edit replaced" — and the input is still on its row and the day still reads 1 pending (the load puts its filing back to "fresh", and a fresh input lands again). For a person added to an input, and for a CX, no discard is offered and the note says the change stays (right). **To check first:** whether the live app does the same (`raptor-port/src/engine/publish.ts dayDiscardCount` counts each filing the load "will put back"; this job did not change that half). **The build, if it is a fault there too:** a filing the load cannot keep off the programme is not counted as discarded.


*Moved here 2026-10-19 by backlog-archive.mjs ([SECDEFAULT-OFFER-BEHIND-BOARD]). Forward facts: `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`.*

### [SECDEFAULT-OFFER-BEHIND-BOARD] The "Set as default order?" offer after a section drag on the board is drawn behind the board (filed 30 Sep 26)
**DONE 19 Oct 26** on `claude/schedule-amendments-fixes-fffce0` (D994's Schedule and amendments batch, one FULL check — evidence `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`): the "Set as default order?" offer is drawn over the board, below a window.
**Place:** low — with the next board change. Seen in passing by the group-A FULL walk (W1 G4,
`docs/img/handpass/2026-09-30-dbrA/W1/W1.G4-offer-hidden-behind-board.png`): the snackbar only shows once ✓ Done closes
the board. Not a storage matter; likely on `main` too (not compared). **Do:** lift the snackbar above the full-screen
board, with the bug-check order's §6 layering test (the element at its centre is the snackbar).


*Moved here 2026-10-19 by backlog-archive.mjs ([TRACE-FOCUS-STAYS]). Forward facts: `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`.*

### [TRACE-FOCUS-STAYS] After a "Breaks <next day>" line is tapped in a day's open issues list and the list is closed, the light stays on — the crew lit, the page dimmed (found 18 Oct 26 by the night's job 4 walk, B3 — OLDER than that job; low) — OPEN
**DONE 19 Oct 26** on `claude/schedule-amendments-fixes-fffce0` (D994's Schedule and amendments batch, one FULL check — evidence `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`): closing the list a "Breaks <day>" line was tapped in lets the focus go — every such line, a run of days' too.
**Found, not fixed.** On the Scheduler Board, Monday's list open, a tap on its "Breaks Tuesday · <man>" line (the crew-rest trace, the day that causes tomorrow's breach), then the list closed: the man's five Monday pucks stay lit (`wfoc`) and the whole page stays dimmed (18 lit, 689 dimmed); the same on Tuesday's own crew-rest line clears as it should, and opening then closing a list with no tap restores everything. Picture: `raptor-port/docs/img/handpass/2026-10-18-night-job4/dk-10*.png`; the walk `raptor-port/scripts/handpass/night1018-job4-walk.mjs` B3. Not the job's doing — its commit touches no highlight or focus code (`ui/highlights.ts`, the focus in `state/view.ts`). **To look at:** what clears the focus a trace line sets when its list is closed (`toggleDayWarn` / `clearWarnFocus`). **Place:** low — with the next change to the issues list.


*Moved here 2026-10-19 by backlog-archive.mjs ([ONE-ROW-DRAG-FLASH]). Forward facts: `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`.*

### [ONE-ROW-DRAG-FLASH] After the one row of a shared input is dragged by its grip, the landing flash is on the wrong row (found 11 Oct 26 by `[GROUP-INPUT-ONE-ROW]`'s walk — to settle with that job's code read)
**DONE 19 Oct 26** on `claude/schedule-amendments-fixes-fffce0` (D994's Schedule and amendments batch, one FULL check — evidence `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`): the landing flash marks the row that landed, a day's first ground-row drag included.
**Found, NOT fixed.** Walker W1, scenario 11 (`raptor-port/docs/handpass/parts/gi-w1.md`; picture `raptor-port/docs/img/handpass/2026-10-11-group-input-one-row/w1/s11-board-move1-flash.png`): the row and all its pucks move correctly, but the flash that says where it landed was painted on the row now standing where it had been. Asked of Fable's read (D749) whether it is that job's block move (`raptor-port/src/engine/reorder.ts moveGroundRow`) or a first hand-move of any single ground row does the same on `main`. Cosmetic: nothing is saved wrongly. Fix it with the job if it is the job's; else it stays here. **Settled by Fable's read (F2, 11 Oct 26 — `raptor-port/docs/superpowers/briefs/2026-10-11-reads/group-input-code-fable.md`): OLDER** — `raptor-port/src/ui/rowdrag.ts` carries a "KNOWN GAP" note of 6 Sep 26: on a day's first hand move of a ground row the list's order is frozen first, so the row lands elsewhere than the address the flash is aimed at; any single row does it on `main`. The one-row job adds one case (a one row dragged DOWN: its first row lands above the aimed address, so no flash). The exact fix is in that report: the engine already names the row that landed; the drag should read it and paint that row.


*Moved here 2026-10-19 by backlog-archive.mjs ([ARROW-GUTTER-STRIP]). Forward facts: `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`.*

### [ARROW-GUTTER-STRIP] The day before the front one shows a 42px strip beside the ‹ arrow — MOOT (D275, the room taken out 27 Sep 26); one small leftover (filed 26 Sep 26)
**DONE 19 Oct 26** on `claude/schedule-amendments-fixes-fffce0` (D994's Schedule and amendments batch, one FULL check — evidence `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`): a real window resize re-lands the desktop week on a day (the app's own band resize does not — the fresh read's F3); "day a–b of 7" counts only days really in view.
The five-flags walk (W4, `raptor-port/docs/img/handpass/2026-09-26-five-flags/w4/GUTTER-prevday-tail-view-1440x900.png`):
the desktop week's 54px room ([VIEW-ARROW-OVER-LIST]) leaves the previous day's last 42px visible around the arrow (8px
on `main`). The look card's Q3: keep (it hints at a day to the left — recommended) or leave that strip empty — **mock-up shown
27 Sep 26** (his ask): `raptor-port/docs/mock/five-flags.html` §Question 3, keep / empty / fade — **ANSWERED "Q3 keep" (D273), then MOOT by D275:
the room comes out (`[ARROW-ROOM-OUT]`), so the strip goes back to 8px.** Still open, low — also from
the same walk, small: straight after a window resize a day can sit partly under the ‹ until the next press (a resize
never re-lands the week); "day a–b of 7" counts a third day that shows only ~212px at 1440. **Place:** his answer; low.


*Moved here 2026-10-19 by backlog-archive.mjs ([EDIT-SECOND-CLICK]). Forward facts: `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`.*

### [EDIT-SECOND-CLICK] After a changed text box on Edit Schedule, the first click into another box does not take the caret (found 5 Oct 26, the Codex stack check)
**DONE 19 Oct 26** on `claude/schedule-amendments-fixes-fffce0` (D994's Schedule and amendments batch, one FULL check — evidence `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`): one click or tap after a changed box takes the caret, on the week and the board, a draft and a published day; the mark it uses never sticks (the fresh read's F1). The same first press on a BUTTON is filed as [EDIT-BUTTON-AFTER-CHANGE].
On Edit Schedule's week: type a new value in a text box (a take-off, a mission), then click ONCE into another text box. The day
redraws as the first box is left, the box that was clicked is replaced, and the caret is nowhere (the page itself has the focus); a
second click takes it. With an UNCHANGED first box one click is enough. The same on `main` (`de470db5`) and on the stack — measured
on both builds with real clicks: `raptor-port/scripts/handpass/stk-host-click-cmp.mjs`; walker K met it in L-10 and L-12
(`raptor-port/docs/handpass/parts/stk-K.md`). Nothing is saved wrongly; it costs him a click each time, and the Tab route (D544) is the
way round it. Not ruled; no fix proposed in the stack check. **Place (the agent's line, not his ruling):** low — with the next change
to the schedule's text boxes; if fixed, restore the caret to the box at the click's position after the redraw.


*Moved here 2026-10-19 by backlog-archive.mjs ([TAB-LAST-BOX-TEST-GAPS]). Forward facts: `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`.*

### [TAB-LAST-BOX-TEST-GAPS] The Tab that keeps the caret in a day's last box (D597): what its test does not cover (Astra's owed read, 6 Oct 26 — no defect found; low, tests only)
**DONE 19 Oct 26** on `claude/schedule-amendments-fixes-fffce0` (D994's Schedule and amendments batch, one FULL check — evidence `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`): the three gaps tested; one fault they found fixed — a Tab onto a control where the save replaced the day keeps the keyboard on that day.
From `[R3-OWED-READS]` (1): the fix in `raptor-port/src/ui/schedule-tab.ts` is sound for the redraw it was written for. Not
covered by `schedule-tab.test.tsx`: the reverse change (the day's LAST warning going away at that Tab, not only its first
appearing); the caret seen in a real browser after the day is replaced (the short phone board, a window open over it); the
fallback when the exact box no longer exists; a day replaced during the box's own blur (the earlier same-scope check exits
first — a coverage boundary, not a shown failure). The read: `raptor-port/docs/superpowers/briefs/2026-10-06-rest-blank-line-scenarios-astra.md` §5(a).
**Place:** low — with the next change to the Tab route.


*Moved here 2026-10-19 by backlog-archive.mjs ([CRP-FLAG]). Forward facts: `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`.*

### [CRP-FLAG] Live flagging on the PUBLISHED schedule — DESIGNED + RED-TEAMED, ready to build (15 Sep 26)
**DONE 19 Oct 26** on `claude/schedule-amendments-fixes-fffce0` (D994's Schedule and amendments batch, one FULL check — evidence `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`): tests only — the three published-day cases the build left untested are pinned (`engine/official-flags.test.ts`), no fault found. The rest of its plan is set aside: what stays live on a published face, and what freezes, is ruled by D179, D185 and D187, and the app does as they say.
**STATUS 24 Sep 26: partly built** — PR #406 (16 Sep 26) merged the plan's "Item 2 + 3(a)" (the two checked
versions; the official-flags overlay). The note of what came next was lost with an old handoff line and the
retired `docs/session-state.md`. **Before touching this, check the code against the plan's §11 test list**
(`raptor-port/docs/superpowers/specs/2026-09-15-crewrest-flagging-plan-v2.md`). "Ready to build" above is history.
Show live warnings (crew rest incl. cross-day/past-midnight, the 7-day work rule, timing
clashes) on the published/signed schedule again — today publishing a day hides them. Model:
two checked versions (signed + working); each screen flags the version it shows; check a day
against each surrounding day's **published version if it has one, else its working copy**; the
day being amended drives the scheduler's own preview. Content byte-frozen; "Not Yet Signed"
marker (everyone). Clock-free; NOT coupled to EOD.
- **Fully scoped + cross-provider red-teamed** (2 rounds + a confirmation, Codex + Fable). On
  branch `claude/crewrest-published-flagging`. **Build spec:**
  `raptor-port/docs/superpowers/specs/2026-09-15-crewrest-flagging-plan-v2.md` (§5 mechanism,
  §11 tests, §14 tricky build spots); review log alongside it.
- **HEAVY**, test-first, Opus; keep `tfin.js` 728/0; fresh Codex+Fable CODE inspection after
  build; no merge without "merge live". Owner decisions are in `DECISIONS.md`.


*Moved here 2026-10-19 by backlog-archive.mjs ([OFT-ADD-TWICE-SILENT]). Forward facts: `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`.*

### [OFT-ADD-TWICE-SILENT] The second press of an OFT row's "+" for a man already on that row is refused with no message (walker A, the D605 walk, 6 Oct 26 — OLD; low)
**DONE 19 Oct 26** on `claude/schedule-amendments-fixes-fffce0` (D994's Schedule and amendments batch, one FULL check — evidence `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`): not reproduced — a second "+" on an OFT row for a man already on it is refused and says why (D271); pinned (`ui/rowtwice-refusal.test.tsx`).
"One man, once per row" (D271) refuses the second place and says why — on a duty row, a ground row, a Common Programme
row and from an OFT row's front seat to its rear. Pressing the OFT row's "+" twice with the same man armed: the row is
unchanged, rightly, and nothing is said. Seen by walker A (S24; `raptor-port/docs/handpass/parts/bta-A.md`), not
reproduced by the host. **Fix:** that door shows the same sentence the others do; a browser test first. **Place:** low —
with the next change to the sim rows.


*Moved here 2026-10-19 by backlog-archive.mjs ([AMEND-SMALL-SEEN]). Forward facts: `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`.*

### [AMEND-SMALL-SEEN] Small things the amendment re-test saw in passing (24 Sep 26)
**DONE 19 Oct 26** on `claude/schedule-amendments-fixes-fffce0` (D994's Schedule and amendments batch, one FULL check — evidence `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`): (6) was the walk's script, not the app — a man's figures on a phone leave the grid where it was (pinned, `e2e/leavewar.spec.ts`); (7) a weekend LL asks nothing (pinned, `leavewar/state/balanceafter.test.ts`); (8) the silent phone drag-off is the same as [OIL-NOTIFY-SEEN] (2) and is carried there.
**BUILT 28 Sep 26 on `claude/small-fixes-batch-d223f6`** (the small-fixes batch; evidence `raptor-port/docs/handpass/2026-09-28-small-fixes.md`; plan `raptor-port/docs/superpowers/plans/2026-09-28-small-fixes-batch-plan.md`) — items 1 (a publish's messages joined; Unpublish says what it did), 3 (six-letter callsigns), 4 (the time's AL tag under the time; the arrow half answered by D275) and 9 (Sort keeps the sign-offs, on a published day too) built; item 5 (AL8's colour) answered: leave it (D362). **MERGED 29 Sep 26 (PR #463).** Items 2 and 6–8 stay with their own chats — this item closes with the last of them.
None breaks an amendment rule; each is a line to fix or ask about, from the walkers' reports
(`raptor-port/docs/handpass/parts/2026-09-24-amendment-w1.md` §5, `-w4.md` §6):
1. **Saturday's "Published AL1 · 14 items" toast** is replaced in the same instant by the OIL warning; the person only
   ever sees the warning. **Unpublish** says nothing at all (only the tag changes) — AM15b's principle would favour a word.
2. **Undo of a take-off time change** says "Undid: a note on the schedule" (AM39b: say what it did) — for the
   change-recording re-test, with [UNDO-ROSTER-SETTINGS]. **BUILT 28 Sep 26** on `claude/change-recording-retest`: a text
   command carries which box it wrote, and Undo says "a take-off time", "a day note" (`undo/describe.ts`).
3. **Five-letter callsigns** (VIPER, COBRA) drawn "…" in the edit week's callsign column; on the phone board they wrap
   ("VIP/R").
4. At 390px the solid **"AL1" tag** beside a time is clipped to "AL"; on the desktop week the **left scroll arrow** sits
   over the first sign-off pill of the leftmost day. **The same arrow also covers the left day's Unavailable type**
   ("ATT C") on the desktop week (the absence-record re-test's re-walk, W2, 26 Sep 26 — pictures
   `raptor-port/docs/img/handpass/2026-09-26-absence/rewalk/w2/rw-w2-05-desktop-P4a-face`, `-P4b-working-copy`); one fix
   with `[VIEW-ARROW-OVER-LIST]`.
5. **AL7 and AL8** are the same orange; the register names no colour past AL7 (ask him if it matters). **ANSWERED 29 Sep 26 — D362: leave it.**
6. **Leave War, phone:** a man's figure sheet sends the grid back to 1 January, and it stays there after the sheet
   closes (desktop keeps its place). **Its sharper form (the absence-record re-test, W4, 26 Sep 26):** for a late joiner
   or a posted-out man, the jump takes his ROW off the screen — in January he is not in the squadron, so the row the
   admin was working on is simply gone (`raptor-port/docs/handpass/parts/2026-09-26-absence-w4.md`, the F3 note).
7. **Leave War bid sheet:** placing an LL bid on a weekend asks "That takes Fable to -1 ANNUAL", though a weekend LL
   charges nothing (his figure stays 0).
8. **A phone drag-off** removes a puck silently; right-click says "Fable removed".
9. **"Sort" on the ground programme** of a published day whose rows are kept out of time order moves them in the
   array without changing what is shown — and blanks the four sign-offs though "no changes to publish" (the final read,
   Fable #1's mirror; the digest keys ground rows by position). A false re-sign, never a false publish.
**Place:** any time; items 6–8 with the Leave War links re-test (D147, last).


*Moved here 2026-10-19 by backlog-archive.mjs ([RALLY-PER-FORMATION]). Forward facts: `raptor-port/docs/handpass/2026-10-19-rally-box.md`, `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/engine-rules.md`.*

### [RALLY-PER-FORMATION] A rally box for each formation: R above B, TO above LD; the button becomes "+ In-time" (D1026, 19 Oct 26)
**His ruling (D1026):** most squadrons give each formation its own rally time; on the week and on Edit Schedule a flying row's second
time column is headed R / B (the rally above the brief) and the third TO / LD (the take-off above the landing); the typed lines above
the wave are for the in-time only, their button "+ In-time" — no rally. Full row: `.claude/decisions-full/scheduler.md` D1026; the
design note `raptor-port/docs/superpowers/specs/2026-10-02-rally-time-design.md`.
**Today:** a rally is only a typed line above the wave ("19:00H: NIGHT WAVE VL RALLY …"), read for its callsign and clock.
**First:** a mock-up on the real app at phone and desktop width, and his questions (in the ruling's full row), each with a recommendation. **Drawn and put to him 19 Oct 26** — the page `raptor-port/docs/mock/rally-box.html` (an Artifact), its pictures and script named in the design note's "The mock-up". While it was drawn he added D1027 (a default rally, take-off less a Logic time, 3 hours to start, selected by the scheduler) and D1028 (a suggested time in its own box's area, never on a line above it — the brief's too). **His answers, 19 Oct 26 (D1029–D1032):** the desktop board keeps R · B · TO · LD in one line, the phone board stacks (picture 11 and 6); a suggestion sits faint inside its box, a tap places it highlighted so typing replaces it; the default rally is the existing 3-hour setting, renamed; the R box counts as a typed rally did, an empty box's default only where no in-time or rally is entered. A typed line still saying RALLY stays a rally, as today (D1034) — the typed lines' reading is unchanged. **Next: the build — FULL tier** (OIL, the published record), from the design note's "His answers" and requirement list; the mock-up script's values are the look. The build's requirements the drawing found: the design note's list.
**Tier (the agent's reading):** FULL — OIL counts from the earliest in-time or rally (D591), and a published day's record changes.
**Place (his "Finish this first", D1026):** its own job, after the D994 Schedule and amendments batch's check is finished; it
touches the same In-time / Rally lines as [INTIME-LINES-DRAG], built in that batch.


*Moved here 2026-10-19 by backlog-archive.mjs ([EDIT-BUTTON-AFTER-CHANGE]). Forward facts: `raptor-port/docs/handpass/2026-10-19-rally-box.md`, `raptor-port/docs/ui-contracts.md`.*

### [EDIT-BUTTON-AFTER-CHANGE] Straight after a changed text box, the first press of a button on Edit Schedule's week or the Scheduler Board does nothing (found 19 Oct 26, the D994 batch's walk, walker D, S4-05 — OLDER than the batch; low)
Change a take-off (the caret left in the box), then press ONE button: the week's "+ In-time / Rally" (In-time lines 2 → 2, three tries) or the board's "+ Line" (formations 2 → 2); the take-off saves and the area time catches up, but the button's own action does not happen; a second press works, and the same button with nothing changed first works at once. Pictures `raptor-port/docs/img/handpass/2026-10-19-sched-fixes/D/S4-05-*.png`; the walker's table `raptor-port/docs/handpass/parts/2026-10-19-sched-fixes-D.md`. **Cause (the host's reading, by the same route as [EDIT-SECOND-CLICK]):** leaving the changed box saves it, and the day (or the board's panel) redraws between the press and its click — the button pressed is replaced, so the click lands on nothing. The batch's fix holds the redraw only for a TEXT BOX being pressed (`ui/textedit.ts textCaret`); a button is not one, and holding a panel for any press would also hold `txtCommit`'s deferred save (it asks `editingText()`), so it wants its own small hold (a pressed button keeps its block until the click, then the redraw). **Place:** low — with the next change to the text boxes or the board's buttons; a browser test first (`e2e/schedule-tab.spec.ts`).


*Moved here 2026-10-19 by backlog-archive.mjs ([RALLY-BOX-CHANGES]). Forward facts: `raptor-port/docs/handpass/2026-10-19-rally-changes.md`, `raptor-port/docs/ui-contracts.md`.*

### [RALLY-BOX-CHANGES] His three changes to the rally box: a taken suggestion plainly marked, SC / AVALON / BB get the rally, the worked-out suggestion hidden (D1035–D1037, 19 Oct 26)
After his look at the live rally box on his iPhone. **D1035:** a taken brief or rally looks plainly different from the suggestion at once (today both blue); he suggests a flash. **D1036:** SC, AVALON and BB lines get a rally time too. **D1037:** the worked-out brief and rally are no longer shown in their empty boxes; a typed one is used in the timing checks. Design and open questions: `raptor-port/docs/superpowers/specs/2026-10-02-rally-time-design.md` §His three changes. **Branch:** `claude/rally-box-changes`. **Tier when built:** FULL (OIL and crew rest read the rally; the published record). **His answers (D1038–D1041):** a short flash of the blue ring, the time white at once; only SC, AVALON and BB hide the worked-out times; their R box above B; on SC MAIN it starts the day, elsewhere shown only. **Place:** being built.

*Moved here 2026-10-19 by backlog-archive.mjs ([STANDBY-FLIES]). Forward facts: `raptor-port/docs/handpass/2026-10-19-standby-flies.md`, `raptor-port/docs/engine-rules.md`, `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/superpowers/specs/2026-10-19-standby-flies-design.md`.*

### [STANDBY-FLIES] An SC, AVALON or BB line that actually flies counts as a real flight (D1042, 19 Oct 26)
His words: a filled brief and rally usually mean the line will fly; AVALON and BB fly almost never, SC MAIN and SPARE more often. Once a line counts as a flight: the day's flying count and Insights' flying load, OIL by default, and every warning an ordinary flying line gets (today SC SPARE, AVALON and BB earn nothing by default — D15, D24 — are not flying load — D516 — and AVALON / BB check only availability, currency, the front seat and overlapping seats). **D1043 (his answer):** a "Flies" tick on each standby row — typing its B or R ticks it by itself; a row activated later is ticked by hand; the tick is what counts. **D1044:** a planned schedule — B or R typed makes every row of the line count as a flight, SPARE included (its crew rest and OIL), on the line's planned START and END; no take-off and landing of its own. **Before the build:** a picture of the Flies tick on a standby row (D853). **Earlier, answered:** how the app knows a line flew — recommended a "Launched" mark with the line's real take-off and landing (a shift's START and END are not flight times; SC's B is its in-time; a rally is typed for lines that never launch), against a typed B or R, or an ordinary flying line added for the sortie. Before the build: a picture and his questions (D853), the rules for the three kinds as laid down to him on 19 Oct 26. **The red team (19 Oct 26):** `raptor-port/docs/superpowers/plans/2026-10-19-standby-flies-redteam.md` — the biggest risk: an R typed only as a report time (an AVALON night) would make a whole line a flight; reading START / END as take-off / landing brings back the padded-shift overlap (SC AM and PM); counting every ticked row as a jet doubles the day's count; D1041's "shown only" on SPARE / AVALON / BB is overturned by D1044 here, and its homes are rewritten in this job (D201). Its four questions were put to him on 19 Oct 26: answered D1045 (every row with B or R typed is a jet — SPARE included; the day ends at END; a line that will not fly is cancelled, never left with R) ; and D1046: a row that does not come in is cancelled (CX) — no untick; the tick only adds a line by hand. **All four answered — the design is ready for its picture.** **His answers to the drawing (D1060–D1065, 19 Oct 26):** the chip as drawn; a hand tick lights one row; an empty row is no jet; members see the lit chip only; the dashed chip on the Scheduler Board only, the lit one on all three screens; a faint dash in a standby line's empty R and B. Design note `raptor-port/docs/superpowers/specs/2026-10-19-standby-flies-design.md`, register SF1–SF10. **Branch:** `claude/sad-herschel-5682e3`. **Tier:** FULL (OIL, the warnings, Insights, saved data). **Place:** built and FULL-checked 19 Oct 26 — pull request 542, waiting for his look and "merge live"; his D1066 (the chip smaller and under the badge on the week) built with it.


*Moved here 2026-10-20 by backlog-archive.mjs ([KEYBOARD-SCROLL]). Forward facts: `raptor-port/docs/handpass/2026-10-19-keyboard-scroll.md`, `raptor-port/docs/ui-contracts.md`.*

### [KEYBOARD-SCROLL] On a phone, the box being typed in shows above the keyboard (D1048, 19 Oct 26)
His words: when he taps anything to type in that sits where the keyboard comes up, the box should show above the keyboard — scrolled to it. Every box in the app, on a phone (his iPhone: Safari's own scroll does not always bring a box inside the board's scrolling panel clear of the keyboard). The how is the agent's: on a press-focused box, once the keyboard has resized the visible screen (`visualViewport`), scroll the box's own scrolling panel so it sits just above it. **Also put to him in this job (D852 — his "not sure where else", 19 Oct 26), each with its picture before anything is built:** D1047's "one tap then typing replaces" on (1) the duty and wave templates' time boxes, (2) the Leave War's typed numbers (required P / W, the flying counts), (3) the SANS settings' and late cut-off's number boxes, (4) the Logic page's settings; not on callsign, mission or remarks, nor an input's start / end (his iPhone's own time wheel). **Tier when built:** WALK (a shared behaviour on every surface; his iPhone is the real test — WebKit is not in the walk). **Place:** its own small job, next (his word), before or beside [STANDBY-FLIES].



*Moved here 2026-10-20 by backlog-archive.mjs ([STANDBY-WEEK-B]). Forward facts: `raptor-port/docs/handpass/2026-10-20-standby-week-b.md`, `raptor-port/docs/ui-contracts.md`.*

### [STANDBY-WEEK-B] The week shows no B on SC, AVALON and BB lines (his question, 20 Oct 26 — "why does SC not have B on edit schedule? Brief. Can u check BB and Avalon as well")
On Edit Schedule's week (and so View-only Sched and the next-week peek, which share the heading), a standby line's time
headings read SHIFT · R over START · END: the rally box built for [RALLY-BOX-CHANGES] sits above START and the week draws no
B at all (`raptor-port/src/ui/html.ts` `SA_TIME_HEAD`, the standby row's builder) — the 24 Aug 26 seam "the SC in-time shows
on the board only … raise mirroring only if he asks", which he now has. The Scheduler Board already draws R over B and the
shift's times in the TO / LD column on all three (pictures: `raptor-port/docs/img/handpass/2026-10-19-keyboard-scroll/walk/sa-week-marked.png`,
the week, the headings ringed; `…/walk/sa-board-bb.png`, the board). D1040's own words: "above B, in the same R-over-B column
as a flying line, so every wave looks the same" — the agent's reading at the time, "on the week and the board", was not built
on the week. **To do:** put to him, with a picture of the real week at his iPhone's width and a desktop's, the week's standby
heading as a flying line's — SHIFT · R over B · START over END (recommended: every wave the same, D1040) — then build it,
the B box writing the line's own `br` as the board's does (SC's in-time, D1041; shown only on SPARE / AVALON / BB), with the
faint dash in an empty R and B (D1065). Search D1040, D1041, D1065, D1026 first.
**Drawn 20 Oct 26 and put to him** (on `claude/standby-week-b`): the real week, today beside proposed, at 402 and 1440 wide —
`raptor-port/docs/img/handpass/2026-10-20-standby-week-b/` (1–6), drawn by `raptor-port/scripts/handpass/mock-standby-week-b.mjs`.
Found in the drawing: on a phone the third column is too narrow for "START" — it runs under "FCP / RCP" (picture 2); a desktop
fits (4). Put to him: the third heading TO over LD everywhere (recommended — a flying wave's, and the board's on these lines;
pictures 5, 6), START over END with smaller letters on a phone, or START / END on a desktop and TO / LD on a phone. Waiting on
his answer; nothing built. **His answer, 20 Oct 26:** "2" (D1083), then "Ok carry on" to the built phone heading (D1084).
**BUILT and FULL-checked the same day** on `claude/standby-week-b` — the sheet `raptor-port/docs/handpass/2026-10-20-standby-week-b.md`; waiting for his look and "merge live".
**Place:** after [KEYBOARD-SCROLL] goes live, as its own small job (own branch from `main`).


*Moved here 2026-10-20 by backlog-archive.mjs ([CI-SPLIT-SLOW-JOBS]). Forward facts: `raptor-port/docs/gates-and-deploy.md`.*

### [CI-SPLIT-SLOW-JOBS] Split GitHub's slowest checks across more machines (put to him 20 Oct 26 — his yes given, D1089: "Proceed as recommended")
His question, 20 Oct 26: *"why the checks take so long? Can It be shortened? I'm thinking the non applicable areas don't need
to check?"* Measured on pull request 544's run (0f8dac430): every job runs side by side, so the run is its slowest job —
Leave War browser desktop 8m53s, the scheduler's browser part 2/2 8m13s, unit parts 2–4 about 7½–8m, the Tracker 7m51s,
Leave War unit 4–6m, build 2m37s. Skipping areas saves almost nothing on GitHub (the scheduler's own jobs take ~8m) and
risks missing a break across areas; told so. **Recommended:** split the slow jobs further (`.github/workflows/deploy.yml` —
the Leave War desktop browser set into two, the scheduler's browser and unit sets into more parts, the Tracker's), free
while the repo is public; measure after. A workflow change — his yes is given (D1089); built as its own job. When the repo is private again (checks back on
his PC, one after another), skipping truly separate areas would save real time — raise it then.
**Also watch (a reader's note):** `raptor-port/docs/gates-and-deploy.md` says a documents-only push on a pull request cancels
its running gate job and starts no new one; `shipping.md` says a notes push on a pull request carrying code re-runs every
gate — see which on the next closing push (D1088 waits on that run). **Place:** Checks and tooling — next, its own job in a fresh chat (D1089).
**BUILT 20 Oct 26** (pull request 546, `claude/ci-split-slow-jobs-standby-9e987d`): every GitHub leg checks out without the four picture folders (D1091, his word: "don't download the photos to save time" — 4.7 GB → 79 MB a machine), the raptor unit set in six, its browser set in four, the Leave War desktop browser set in two; the Tracker smoke stays one leg (its second half uses helpers its first half defines). **Measured:** 5m53s end to end, against 8m53s–10m04s before; every leg green, nineteen side by side; every area still run — the same 676 unit files and 12,004 unit tests, 893 browser tests and 453 Tracker checks as main’s last run. Detail: `raptor-port/docs/gates-and-deploy.md` (20 Oct 26). Waiting for his "merge live".


*Moved here 2026-10-20 by backlog-archive.mjs ([BOARD-TAB-FOLD]). Forward facts: `raptor-port/docs/handpass/2026-10-20-standby-batch.md`, `raptor-port/docs/ui-contracts.md`.*

### [BOARD-TAB-FOLD] A time typed on the Scheduler Board and left by Tab shows as typed until another press (found 19 Oct 26 — the D1080 walk, walker B's B11; low)
On the Scheduler Board, type "1000" into a take-off, landing or R box and press Tab: the box still reads "1000" (a second
Tab, or 2.5s later, the same), while 10:00 is saved — it reads 10:00 at once after a press anywhere else, and after leaving
and coming back. The same with plain typing (a second press, then the whole time chosen and typed over — host probe
`raptor-port/scripts/handpass/kbs-host-b11.mjs`), so it is older than D1047 / D1080: the board folds a box to hh:mm when it is
redrawn, and leaving by Tab does not redraw the box left. Walker B's report: `raptor-port/docs/handpass/parts/keyboard-scroll/B.md`.
**To do:** on a box's `change`, write its folded time back to it (`fmtHM`) even when the focus moved to the next box.
**The week too (met 20 Oct 26, [STANDBY-WEEK-B]'s browser test):** on Edit Schedule's week a time typed and left by Tab
reads as typed ("0610") until a press elsewhere, while 06:10 is saved — a flying line's B and take-off as well as the new
standby B (probe `raptor-port/scripts/handpass/standby-week-b-tabfold.mjs`): the week's commit defers its redraw while the
caret is in another box (`html.ts` TXTQ). The same fix there: fold the box left, not only the model.
**Place:** low — with the next change to the board's time boxes.
**BUILT 20 Oct 26** (the standby batch, pull request 547): the box left reads hh:mm at once on the board and the week, and an input's own start / end too (the blind read's F2); never rewritten while it still holds the caret (F3). Evidence `raptor-port/docs/handpass/2026-10-20-standby-batch.md`.


*Moved here 2026-10-20 by backlog-archive.mjs ([SA-HEAD-CLIP-360]). Forward facts: `raptor-port/docs/handpass/2026-10-20-standby-batch.md`, `raptor-port/docs/ui-contracts.md`.*

### [SA-HEAD-CLIP-360] Under 375 wide, a standby wave's first heading cuts "AVALON" (met 20 Oct 26 — the [STANDBY-WEEK-B] re-walk at 360; older, low)
On Edit Schedule's week and View-only Sched below 375 wide the first column is 36px (`09-week-responsive.css`, the 374px
block — D367's measure for a flying line's callsign), and a standby wave's heading there reads its label over SHIFT: "AVALON"
does not fit and shows as "AVALOI" (picture `raptor-port/docs/img/handpass/2026-10-20-standby-week-b/walk2/08-phone-360-edit-week-sc.png`);
SC and BB fit. The column is untouched by [STANDBY-WEEK-B]. **To do:** let that heading wrap or shrink as the callsign does
(D367 — the name always whole), measured at 320 and 360. **Place:** low — with the next change to the week on a phone.
**BUILT 20 Oct 26** (the standby batch, pull request 547): under 375 the heading takes START / END's 7px, and a longer name wraps whole (RB14 at 360 and 320).


*Moved here 2026-10-20 by backlog-archive.mjs ([STANDBY-UNDO-WORDS]). Forward facts: `raptor-port/docs/handpass/2026-10-20-standby-batch.md`, `raptor-port/docs/ui-contracts.md`.*

### [STANDBY-UNDO-WORDS] A standby line's START and END are named as a take-off and a landing (found 20 Oct 26 — the [STANDBY-WEEK-B] blind code read; older, low)
On an SC, AVALON or BB line, Undo's words ("Undo — a take-off time") and the changes window name the shift's START box "a
take-off time" and its END "a landing time" (`raptor-port/src/undo/describe.ts` `TIME_WORD`, read for every `ff:` key;
`changesmodel.ts` the same idea) — only SC's B has its own word ("an in-time"). Since D1083 the week heads those boxes
START and END, so the words disagree with the screen. **To do:** on a standby line (`isStandalone` of the key's wave, as
`scLineKey` does for SC) say "a start time" / "an end time" for `.to` / `.ld`; AVALON's and BB's B stay "a brief
time" (their B box is a brief, D1065). **Place:** low — with the next Schedule and amendments small fixes.
**BUILT 20 Oct 26** (the standby batch, pull request 547): Undo "a start time" / "an end time"; the change history's label "· start" / "· end"; the changes window and "To go out" Start / End, live and gone.


*Moved here 2026-10-20 by backlog-archive.mjs ([BUBBLE-SMALL-SEEN]). Forward facts: `raptor-port/docs/handpass/2026-10-20-standby-batch.md`, `raptor-port/docs/ui-contracts.md`.*

### [BUBBLE-SMALL-SEEN] Two small things about the message bubble, found by the change-recording walk (29 Sep 26)
**(2) and (3) DONE 19 Oct 26** on `claude/schedule-amendments-fixes-fffce0` (evidence `raptor-port/docs/handpass/2026-10-19-schedule-amendments-fixes.md`): the offer is drawn above the bubble, and a note already up when the changes window opens on a phone goes to the top. **(1)** was done 28 Sep 26 (`[AMEND-SMALL-SEEN]` item 1). **Left: (4)** the empty gold pill.
Both the same on `main` (the Phase A pictures, taken on `main`, show them): (1) **Unpublish says nothing** — pressed on a
day, the day goes back as it should, but the bubble still reads the PUBLISH's words ("Published AL1 · 1 item on Sat only ·
approved by Anvil") for its few seconds, the opposite of what just happened (`a1/<w>/pub-09`). (2) **A bubble covers the
"Use this section order as the default for every day?" offer** — a section dragged within a few seconds of an Undo /
Redo shows the offer under the lingering bubble, hiding "Set as default" and, on a phone, "Not now" (`a1/phone/struct-19`).
(3) **A lingering bubble covers the changes window** — on a phone, an Undo / Redo's bubble still up when the window opens
sits over its first lines (`a2-rewalk/phone/lw-24`). (4) **An empty gold pill in an input's row** on the Inputs list, on a
phone, beside the remarks of a LATE leave the admin filed for himself in the member view (`a2/phone/roles-05`, the same on
the re-walk). **To do:** Unpublish says what it did ("Taken back: <day> — its changes wait on the working copy"); the offer
opening clears the bubble or sits above it; the window likewise; find what the empty pill is meant to hold. LOOK tier.
**Place:** low; any time.
**(4) FOUND ALREADY GONE 20 Oct 26** (the standby batch, pull request 547): the Inputs list was redesigned since (D723's card on a phone); a LATE leave the admin files for himself in the member view shows LATE, "All day", the name, the kind and the remark — no empty pill, on a phone or a desktop (pictures `raptor-port/docs/img/handpass/2026-10-20-standby-batch/before/07`, `08`). The item closes on that "merge live".


*Moved here 2026-10-20 by backlog-archive.mjs ([GATELOCK-STALE-PORT]). Forward facts: `raptor-port/docs/gates-and-deploy.md`.*

### [GATELOCK-STALE-PORT] The lock's full check run tests another chat's old build when a preview is left on 4173 (found 18 Oct 26, `claude/three-small-jobs-1018`) — OPEN
**Seen:** `gatelock.mjs run` runs `npx playwright test` with no port; `playwright.config.ts` reuses a server already on 4173
outside CI (`reuseExistingServer: !process.env.CI`). Three old previews were still up (4173 from `trk-chart-fps-8028f8`,
4174, 4180 from older night chats), so the browser tests ran against an old bundle: seven failed on this branch and the same
seven on `main`'s copy — none of them about the change. The re-run on `E2E_PORT=4191` met a FOURTH old preview there (from `d949-d952-till-date-switch-f9a168`; others on 4174, 4180, 4182): 29 failed, an old build again. A port checked free first (4207) gave the real result. The walk scripts' default (`SPF_URL` 4174) meets the same trap. The trap
is written in `raptor-port/docs/gates-and-deploy.md` ("if a preview is ALREADY running on 4173 …"); nothing enforces it.
**Fix:** in `gatelock.mjs` `run` (and `exec` when the command is `test:e2e` / `playwright test`), set `E2E_PORT` to a port
found free at that moment when none is set (refuse a set one that is already answering), and print it; one unit test of the choice. **Place:** a small tooling job of its
own, read by one fresh reader (a script that runs the checks).


*Moved here 2026-10-20 by backlog-archive.mjs ([TOPBAR-PAIR-TEARDOWN-LOG]). Forward facts: `raptor-port/docs/gates-and-deploy.md`.*

### [TOPBAR-PAIR-TEARDOWN-LOG] A unit share red with every test green — a console line after `topbar-pair.test.tsx` ended (met 20 Oct 26, pull request 546; low)
**Seen:** `unit (raptor 3/6)` on the records push of pull request 546 (run 39354269643 — 86 files, 1,444 of 1,444 passed, then `Errors 1`): `EnvironmentTeardownError: [vitest-worker]: Closing rpc while "onUserConsoleLog" was pending — originated in src/ui/topbar-pair.test.tsx`. The same code had passed on the run before; green on its one re-run (re-run before this item was filed — the order of `raptor-port/docs/gates-and-deploy.md` was not kept, said so to him). The shape `gates-and-deploy.md` §the `unit (raptor)` row names: something in the file, or a production timer it starts, writes to the console after the file has finished. **To do:** find what `topbar-pair.test.tsx` leaves running (a timer, a deferred log — `Shell.tsx`'s poll and `view.ts flashAdded` were the last two), stop it at teardown or make it return with no `window`; run the file 20 times under `--shard` to see it stays quiet. **Place:** Checks and tooling — low, a small job of its own.
**Met again and FIXED for this file, 20 Oct 26** (pull request 547's records run, the same share, 1,445 of 1,445 green): the cause, caught by a probe that watched the console after the file's last test — the two pages the app loads on first visit (`Shell.tsx` `lazy`: the Leave War and the Tracker) finished loading after the test that opened them, and React wrote "a suspended resource finished loading" (14) and "an update … not wrapped in act" (49) after the file had ended. `topbar-pair.test.tsx` now loads both pages in its `beforeAll`: the probe then saw nothing. **The other four (the night of 20 Oct 26):** `trk-nocourse`, `availwin` and `lwkeepalive` load both pages up front too; `boot-walk.test.tsx` cannot (its test is what an empty first boot stores — loading the pages first changes that, 2 red) and is left: if it ever goes red this way, its own fix is a wait for the lazy pages before its last test.

