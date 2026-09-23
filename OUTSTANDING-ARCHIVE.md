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

