# Live flagging on the published schedule — design plan (for red-team)

**Date:** 15 Sep 2026 · **Model:** Opus 4.8 (plan), red-team Fable + Codex ·
**Status:** PLAN — not built. Agreeing the approach before any code.

This is the plan to red-team. It reverses the settled *"a snapshot is never
validated / the issued face is byte-frozen"* rule (`pubsweep.test.tsx`), on the
owner's ask, in a bounded, clock-free, EOD-free way.

---

## 1. The ask (owner, 15 Sep 26)

A **published** day should show live warnings again — crew rest (including
cross-day / past-midnight), the 7-day run rule, and timing conflicts — the same
flags a draft day shows. Today, publishing a day silences all of them.

Scope decision (owner): **show everything a draft shows** on a published day.

## 2. What the app does today (verified this session)

- `validate()` runs over the live working copy of every loaded day and produces
  `WARN`/`REST`/trace. **It has no publish gating** — it already computes crew
  rest, the 7-day run and midnight-tail conflicts for published days too.
- The silence is purely at **render**: on the view-only week a published day
  draws `dayIssuedHTML(di)` — a byte-frozen snapshot that ignores `WARN`. A
  draft day draws `dayHTML`, which shows the flags. (`pubsweep.test.tsx:94–101`,
  `179–187`.)
- The 7-day rule is **not broken** — its engine tests pass; the seed data simply
  has nobody on 6+ consecutive tasking days, so nothing trips it. On a published
  day it would be hidden anyway (same frozen-face reason).
- Cross-week seeds read `weekctx.ts:bundle()` (session stash → pure seed);
  `SCHED` (publish state) is deliberately never read by the seeds.

**Conclusion:** the engine is right; this is a *render + which-truth-to-flag*
change, not an engine-logic change.

## 3. The agreed model — two flagging worlds

Each **surface** flags against the version of each day that **that surface shows**.

- **View-only / published surface → the published world.** Each day contributes
  its **issued** version if published, else its working copy (a draft day shows
  live, as it does today). Warnings computed against this set.
- **Edit scheduler / scheduler board → the working world.** Every day
  contributes its **working copy** (latest edits), so planning days/weeks ahead
  reacts to an unpublished amendment. This is today's behaviour.

The two worlds **differ only for a day that is published AND amended**
(working ≠ issued). Everywhere else (draft days, un-amended published days) both
surfaces show the same version, so the flags match.

Consequences (all intended):
- Published content stays the **frozen signed record**; warnings are a **live
  overlay** on top. Because each view flags the exact version it displays, there
  is **no frozen-text-vs-warning mismatch**.
- A **fresh draft** day that busts a published day shows on **both** views (the
  official finish really does set up the bust the moment the report is planned).
- The published view **holds back only** an unpublished *amendment to an
  already-published day* — it keeps showing the official problem until the
  amendment is published. So an official bust can **never be silently erased by
  a draft**. Reconciles on publish.

## 4. The danger, and the guardrails

**Danger:** the scheduler amends a published day, doesn't publish, and the
unpublished change silently drives (or clears) flags elsewhere — worst case a
real official bust hidden by an unpublished fix (an absence = silent).

**The split already contains the worst case:** the published view keeps showing
the official bust regardless of any draft. Remaining exposure is only on the
edit surface, where the scheduler could be misled by their own unpublished
edits' ripple. Guardrails (both fall out cheaply, because we compute *both*
worlds — the diff between them IS the divergence):

1. **Standing marker** while any *published* day carries unpublished amendments
   (extends the existing `SCHED.pending` tracker). Keyed by **date**, visible
   while planning other days.
2. **Provisional tag** on any flag that differs *only* because of an unpublished
   amendment — present-in-working-only ("added") or present-in-published-only
   ("cleared"; the dangerous silent-fix case still gets a visible marker even
   though the edit view shows no active flag). **Minimal wording** (owner) — a
   short tag/dot, not a sentence.
3. **Scoped align-reminder** to publish-or-discard — fires ONLY for
   published-and-amended dates (never for normal draft days), quietly always +
   a firmer nudge at wrap-up (leaving the day/week, session end). Minimal words.

## 5. Anchoring — dates, not weekday labels (owner, 15 Sep)

Divergence set, tags and reminders key on the **calendar date** (stable id),
never "Monday". Crew rest crosses week boundaries and weekday names repeat.
Aligns with the stable-id architecture already shipped.

## 6. Explicitly OUT of scope (decoupled — owner, 15 Sep)

- **No wall-clock cutoff.** The app has no clock (`weeknav.ts TODAY` is the fixed
  literal `13/07/2026`). A time-based "by end of day, flip to published" can't be
  built correctly and would reintroduce a silent switch. Not needed — the split
  already makes the official view safe.
- **No EOD coupling.** EOD is its own parked, designed feature with open
  findings rooted in the same no-clock problem. This work must stand alone with
  no clock and no EOD dependency; EOD/any explicit-action cutoff is a later layer.

## 7. Proposed mechanism (for the reviewers to break)

- `validate()` stays one pure function of a day-set. Call it on **two** day-sets:
  - `WARN_work` = over the **working copy** of every day (= today's output).
    Drives the **edit** surface.
  - `WARN_pub` = over **displayed days** (issued-if-published-else-working).
    Drives the **view-only** surface.
- **One computation, two inputs** — the two maps must never be produced by two
  code paths (drift-seam rule). The "issued vs working" choice per day comes from
  ONE source (`dayApproved` + the issued snapshot).
- **Render:** `dayIssuedHTML` overlays `WARN_pub` (rings, chips, trace box,
  warning list) on the frozen content it already draws; view-only draft days read
  `WARN_pub` too; the edit surface + edit board read `WARN_work`.
- **Divergence** = per (date, person, rule) diff of the two maps → drives the
  provisional tags + the standing marker + the align-reminder scope.
- **Perf:** `validate` runs per keystroke. `WARN_pub` only changes when a *draft*
  day's content changes, or a publish / discard / issued-content change happens —
  NOT when a published-and-amended day's working copy is edited (its displayed =
  issued, unchanged). So `WARN_pub` is cache/gated, not recomputed every
  keystroke. (DOM ceilings untouched; this is CPU, on the per-keystroke path.)

## 8. Whole-ecosystem walk (CLAUDE.md standing order)

- **Deletions/edits from another page:** both surfaces must repaint on every
  mutation path (`afterSchedMutate`). Confirm the board (view-only) reads
  `WARN_pub` without itself validating (the "boardTab must not validate" rule =
  don't trigger validate, not "can't read WARN").
- **Drift seam (the main risk):** `WARN_work` vs `WARN_pub` MUST be one
  `validate` over two inputs. A second literal/path is the classic bug here.
- **Amendment marks** already render on published days (`data-alp/aln`); the
  warning overlay is additive — check they don't collide visually.
- **Parity:** the issued **content** stays byte-frozen; the overlay is port-only
  render. `tfin.js` must stay **728/0**. `pubsweep.test.tsx` changes deliberately
  (from "no warnings" to "warnings shown, content still frozen").
- **Leave War / OIL / Tracker:** unaffected (this is scheduler render + a second
  WARN map); confirm no seam reads `WARN` expecting the single old map.

## 9. Test-first plan (tests written before code)

1. Published day on view-only shows crew-rest / run / conflict warnings computed
   against **issued** content; issued **content** still byte-frozen.
2. Two-world divergence: a published-and-amended day shows different flags on the
   edit (working) vs view-only (issued) surface.
3. Hidden-fix case: working clears a bust; view-only still shows it until publish;
   reconciles on publish.
4. Fresh-draft-busts-published (owner's case): both views show it.
5. Provisional tag on a work-only flag; visible marker on a published-only
   ("cleared pending publish") flag.
6. Align-reminder fires only for published-and-amended dates, never draft days.
7. Cross-week + date anchoring holds; `tfin.js` 728/0 unchanged.

## 10. Open questions for the red-team

- Is "each surface flags the version it shows" fully coherent across **mixed
  weeks** (published + draft days adjacent, cross-week forward trace)? Any case
  where the two worlds produce a confusing or wrong result?
- The provisional "cleared pending publish" marker is an *absence* on the edit
  view — is the proposed visible marker enough to kill the silent-fix danger, or
  is there a better affordance?
- Perf: is gating `WARN_pub` recompute sound, or can a published-and-amended
  edit change `WARN_pub` in a way I've missed (e.g., a cross-day effect where the
  amended day is a *neighbour's* truth)? **← suspect this needs care.**
- Any Leave War / OIL / Tracker seam that reads the single `WARN` today and would
  break under two maps?
- Minimal-wording tags: smallest affordance that still reads clearly?
