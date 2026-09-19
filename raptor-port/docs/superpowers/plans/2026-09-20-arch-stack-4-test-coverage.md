# ARCH-STACK step 4 — what is already tested, what is NOT (20 Sep 26)

Written so the NEXT bug hunt starts from facts instead of re-reading the build. Branch
`claude/db-step4-one-absence`. The rules of record are
`docs/superpowers/specs/2026-09-20-arch-stack-4-clash-check.md` (owner answers A–D, B1–B9, H1–H6) —
the design and the catalogue sit under it. What was built and where:
`docs/superpowers/plans/2026-09-19-arch-stack-4-build-log.md`.

## 1. Bugs already caught and FIXED (do not re-litigate; re-test only as regressions)

Cross-provider inspection, round 1 — **Fable** (9):
1. the war did not repaint after an Inputs-page filing / a tap-list delete / an absence-only move
   (HIGH — the balance column and the boxes went stale until an unrelated write);
2. an OIL credit worked in two stretches was counted twice, showed a false `+1` and listed twice;
3. a tap-list change on a locked (quarantined) week threw instead of reporting;
4. a half-day medical over a leave with its own times crossing noon dropped the whole day;
5. notices: ownership and the actor label (see Codex AS4-004, same fix);
6. answer D's tie-break ran "filed before bid" ahead of "earlier start";
7. approve-and-extend swallowed a run's own carried remark;
8. a member could not BID clearing leave after their own posting-out (owner answer C);
9. leftovers of the deleted two-way copy (comments, `engine/raptor.ts`, unused imports).

Round 1 — **Codex** (7, three the same as Fable's 1/4/9): un-approving could overwrite or sit beside a
stored request (AS4-002); notice groups keyed on `Date.now()` could collide (AS4-003); notice ownership
read the effective role and "View as" instead of the LOGIN (AS4-004); no per-record Move on a
multi-record day (AS4-006); stale data-model / data-schema text (AS4-007).

Round 2 — **Codex**, on the fixes (3 fixed, 1 filed): a refused move reported success and left the
derived index ahead of the Inputs (AS4-R2-001); a door acted on an Input id without checking person /
date / that it is leave (AS4-R2-002/003); `raptorOwns` / `source:'raptor'` still synthesised —
filed as `[LW-LOCKMARK]` in OUTSTANDING.

**Scenario tester (Opus, in the real browser)** — 3 bugs: the balance column stale after a filing (same
root as Fable 1); an overnight leave blocked a next-morning medical instead of being cut; the publish
notice named the replacer twice. All fixed.

Also fixed on the way: the demo world's leave was filed after the schedule's warnings were computed, so
a day under demo leave showed a stale issue count until the first edit (caught by the perf gate).

## 2. Covered by tests today

**e2e, real browser** (`e2e/step4-leavewar.spec.ts`, 18 tests, lw-desktop + a phone subset):
approve a 5-day bid then delete its middle day (the record splits), undo, redo · an admin filing over a
pending bid (bid gone, amber `!`, "OK, seen", undo/redo of both steps) · a member filing over their own
bid (no notice) · LL 14–18 Jul then ATT C 16–17 (cut to 14–15 + 18, +2 back, undo restores) · a morning
ATT C over a full-day LL · two leaves on the same time refused with the blocker named · two leaves in
one morning at non-overlapping times (half charged once, off the longer one) · leave during a course
(`+1`, deducted) · clearing leave after a posting-out (PO tag, charged, manning unchanged) · moving an
approved leave after bidding closes (dotted mark, undo, redo) · publishing a weekend day replacing a
bid, and undo of the publish · tap-list approve / refuse / back-to-bid, each undoable · tap-list
permissions (member vs admin) · a reload keeping everything · phone 390px layout + no console errors ·
the three fixed bugs as regressions.

**e2e** (`e2e/leavewar.spec.ts`, the older suite): the grid, window engine, frozen columns, stages,
bidding box, under-manned list, drag-select, move mode, undo/redo buttons, sheets and scrims.

**Unit** (vitest): `engine/dayview.test.ts` (31 — the ladder, marks, charges, away/duty/OIL, the 15-day
run) · `inputgate.test.ts` (16 — the clash rules at the inputs door) · `publishdoor.test.ts` (4) ·
`ui/daylist.test.tsx` (8 — marks and the tap list) · `review-fixes.test.ts` (15 — one per inspection
finding) · `absences`, `warrecs`, `merge`, `charge`, `counters`, `oiltracker`, `sync`, `store` suites.

## 2b. Opus scenario sweep, 20 Sep 26 (34 more tests — `scenarios-doors`, `scenarios-rules`,
`scenarios-corners`)

Swept most of §3 at the doors, over both wired stores. **One bug found and fixed:** the drag / bulk
DECIDE read a day as "already approved" when a filed leave sat on top of an undecided bid (the ladder
puts an absence above a request), so the bid stayed pending while the count said it was decided; it
now decides the bid. Everything else behaved: reassign and Inputs-page edits obey the rules; leave
before a posting-in shows and is charged; the OIL pass writes no credit on a leave day and is a fixed
point; leave across 31 Dec shows in both wars; a leave filed for a year with no war appears when the
war is created; bulk clear / range-fill / move over mixed days; a long mixed run undone and redone;
half-day charges per counter; an upchit closing a medical early; a medical over a course; leave over
part of a medical refused; the 15-day run (pilots only); manning counts a person away once; "OK, seen"
clears one filing's notices and not another's; member permissions; a save-and-reload round trip;
clearing leave after the archive pass; a bid in the SECOND war; a move into the next war refused; a
medical swallowing a whole leave (and undo); moved marks surviving a cut; a bid placed after a publish
refused; an AL that puts someone new on a weekend replacing their bid; "OK, seen" permissions + undo.

## 3. NOT tested — the next bug hunt's ground

Named by the scenario tester and the inspectors, plus the gaps the build knows about:

- **Doors not yet swept:** the Inputs-page CALENDAR (drag, the add dialog), `mintMedSegments` /
  `applyMedPlan` driven from the medical dialog, the OIL ask flow (OilConfirm).
- **Two medicals of the same type overlapping** (the existing "edit that entry" refusal) beside leave.
- **Hand-typed credits with times vs leave** in the app (unit-covered only).
- **Switching wars with a sheet open**; undo after switching wars; undo across a reload.
- **Bulk gestures IN THE BROWSER** (drag-select fill / decide / delete / move over a mixed rectangle
  — covered at the store, not by a real drag).
- **Storage faults:** a refused save mid-group, the boot journal replay, two tabs (known limitation).
- **Phone touch:** drag-select and move by touch; the tap list at the smallest width with many records.
- **Manning and figures:** that every figure and the manning verdict read the records, not the box, on
  multi-record days (unit-tested; not eyeballed in the app).

## 4. Known and deliberate (not bugs)

- One undecided + one refused request may share a half (the owner's approved comp shows filed leave
  with a refused bid underneath).
- Windows that only touch (10:00 end, 10:00 start) do not clash.
- A notice says "(an admin)", not a name — the app has no login→person map.
- `[LW-LOCKMARK]` (OUTSTANDING): the box-level `source:'raptor'` lock marker is still synthesised.
- A publish → undo → publish → undo → redo refusal exists on `main` too (not step 4's).
