# The member / guest check — the builder-checker's report (the night of 5 Nov 26, job 3)

Saved as it arrived (the overnight guide), condensed only in layout. One fresh Opus helper did the whole job. Branch
`claude/member-guest-checks`, cut from `origin/main` `c7ddf441b`; last pushed commit `4cf7c0c65`. **Status: CHECKED** (FULL,
walked, read twice). PC lock free, no servers left, browsers closed.

## Item outcomes
1. **[MEMBER-EDITPAGE-CHECK] — closed with reason.** Every write on Edit Schedule and the board is a command; the command gate
   refuses a member every `sched.*` type (publish and sign are Amendment C, admin only — `perms.ts` ~440–443), and
   `ownershipViolation` refuses any schedule record a member's command changes, rolled back. Probe round 1: Publish AL1 by mouse
   and keyboard, 0 writes, nothing issued; 28 page controls; 80/87 board controls. Round 2 with an admin as positive control
   (the admin's text-cell presses did save — the probe can see an edit): member, page 102 kinds, board 130 kinds, 0 writes in the
   whole run and at the next sign-out / admin sign-in. Sonnet walk A1–A6 both sizes. No production route reaches the page (tab
   hidden, member view leaves the page, sign-out resets to View-only, the bridge localhost-only). "Discard marks" already gone
   (D488). Visible leftovers: Q3, recommended leave it.
2. **[GUEST-SAVE-WARNING] — a finding, parked (Q1), not built (D1625).** The guest page saves nothing (0 writes: every control,
   every week, a 6 s wait, sign out and in). But the same person's access request (the access screen → `access.request` through
   the saver), when storage fails: the screen says "Your request is with the admins", with no warning there or on the guest page;
   tab closed → request gone (a desktop asks "Leave site?" once; an iPhone never asks — `boot.ts guardUnload`). Left open, the
   saver's retry lands it later (GR6). The same gap: an admin's failed save is hidden after sign-out (the sign-in and access
   screens draw no band — X3).
3. **New, from the walk — Q2:** a member can tick / untick his own "Scheduler" appointment on Quals (saved; Undo "Ranger's
   quals"). Allowed by D1510's "every other column", but the tick decides who may sign SKED CK / PLANNED BY / APPROVED BY
   (`publish.ts signRoleOk`) and D785 says schedulers are admins; unticking blanks his signatures, so the next amendment cannot go
   out until re-signed.

## Findings and fixes
- **F1 (security read) — fixed red-first.** The change-log batch saved with a waiting person's request recorded its actor as
  `principal:<sign-in name>` (his defence mail at the database step), and every member and guest reads the change log (§11).
  Now `batchActor` (`src/state/changebatch.ts`) records the bare role (pending / guest / off) for a session with no account id.
  Test `src/state/changebatch-rollcall.test.ts` "a waiting person's batch names his role…" — red before, green after. Docs:
  `data-model.md` §9 and §11's ChangeBatch note, `data-schema.md`. Re-walked on the fixed build at both sizes (RW-1..3 PASS: the
  request still names him for admins, the batch says "pending", the guest page opens). Invisible on screen.

## Parked questions (pictures `raptor-port/docs/mock/2026-11-05-member-guest/img/`, drawn on the real frozen build by `scripts/handpass/mg1105-mock.mjs`)
- **Q1** — Kite, a new pilot with no account, presses Request access on his iPhone while storage refuses → told "with the
  admins", nothing saved, lost on closing the tab. Recommended: the app's own "Not saved — keep this page open · Retry" band across
  the top of the waiting screen, under the guest bar, and on the sign-in screen while an earlier save still waits. Pictures
  Q1-waiting-today/proposed-desk/phone, Q1-guest-today/proposed-desk/phone. Waits: a small build and walk.
- **Q2** — Ranger (member) unticks his own Scheduler on Quals; it saves; the days he signed lose that sign-off. Recommended: his
  Scheduler cell reads only, as Management does, refused at the Quals write and the commit gate (narrows D1510; D785). Pictures
  Q2-quals-today/proposed-desk/phone. Waits: a small build and a security read (D1411).
- **Q3** — a member put on Edit Schedule by the developer bridge sees Publish AL1 live (a press does nothing and says nothing);
  the board's sign-off pick says "Couldn't save that — try again". Recommended: leave it (unreachable, nothing saved). Pictures
  Q3-amendments-today/proposed-desk. Waits: nothing.
- The design skill was not run for these: each copies an existing look (the failed-save band; Management's read-only cell).

## Question 7 routes (found / not found)
URL hash / query: not found (no hash routing; `?fresh=1` is the empty demo world only). Keyboard shortcuts: not found (no
global Undo key; the guest page mounts no document listeners). Developer bridge: localhost only (`main.tsx`;
`probe-bridge-offhost.test.ts`). A stale window across a role change: writes take the role in force (the actor worked out at
each commit); sign-out closes windows and clears Undo; the member-view switch leaves Edit Schedule. Undo / Redo: an admin's own
step in his member view refused ("Switch back to the admin view to undo that."), 0 writes (X2 PASS). Two tabs: not a route — no
cross-tab sync; each browser its own world until the database step.

## Walk counts
Probe round 1: member 6 PASS / 0 FAIL; guest and cross: 14 PASS, 3 FAIL (GF2, GR2 = the Q1 finding; X2's first run a script
fault, re-run PASS). Round 2: P0, P1, R2-M4n, R2-M9, R2-M10 PASS; R2-M3 / R2-M3n / R2-M4 "FAIL" lines read as not faults (a
week's load re-works input landings in memory for every role, no write; the search box's own filter text read as "typed left";
one view control, the crew panel's "Next day", not pressed — covered). Sonnet walk (`parts/mg1105/walk-report.md`): A, B, C, D
both sizes, all PASS / RECORDED; not walked: a real touch swipe / long-press on the guest page in WebKit (the test browser
refused `new Touch`), D3 on a phone (a desktop-only step). Re-walk: 6 PASS. 0 browser errors in every run.

## Reads
- Scenario design (fresh Opus): `parts/mg1105/scenarios-opus.md` — 23 scenarios; dispositions in the sheet §12.
- Security read (fresh, blind Opus, D1411): `parts/mg1105/read-security-opus.md` — F1 (fixed); its Q1 an already-filed
  database-step item (a member's Leave War period saved as a shared setting); 14 negatives; a note that admin-made accounts take
  any password (the D166 stand-in, held only behind Vercel's sign-in).
- Code read (fresh, blind Opus): `parts/mg1105/read-opus.md` — the fix right; 8 gaps in the probe's evidence, answered by round 2
  (`mg1105-probe2.mjs`); for the database step: Dataverse's own "created by" on the change-log row would still name the waiting
  person (filed by the coordinator as [DB-WAITING-CREATEDBY]).

## Tests on his PC
changebatch-rollcall, changebatch, perms, perms-scan, accounts, accounts-rows: 153 passed (6 files); `npm run build` green
(twice, under the lock); `lint:changed` no new finding; docsize OK. The full set is GitHub's run once the pull request opens
(D1086).

**Walk: docs/handpass/2026-11-05-member-guest.md · 206 pictures (+14 mock-up) · 12 surfaces · 7 orders · MISSING: 1 fixed (the change log naming a waiting person), 2 parked for him (Q1, Q2), 1 recommended leave-it (Q3)**

## Older things met in passing (not this job's)
The changes window closes only by its ✕, not Escape or a click beside it (walk A2 — no ruling found either way); in WebKit a
scripted sideways scroll of Quals on a phone left its pinned headings behind (unconfirmed, a finger scroll not tried); a guest
signing in again lands on the last-viewed week (D1383 allows the demo week). The board's hidden sign-off select keeps the picked
value after a refused pick (developer route only, folded into Q3).

Rulings: none (owner asleep). Q2, if answered yes, narrows D1510.
