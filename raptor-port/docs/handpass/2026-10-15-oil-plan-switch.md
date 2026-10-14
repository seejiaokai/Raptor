# Bug check — "Switch to this plan" says what it left to answer (`[OIL-PLAN-SWITCH-UNASKED]`, D865)

Branch `claude/checkout-stale-compaction-7ee93a`. Built 15 Oct 26 by Opus; one fresh, blind Opus read of the finished
code, no Fable read — his word for this job (D875). Tier **WALK**.

## 1. The tier — the eight questions (the order's §5)
1. Money (OIL is owed): **NO** — how OIL is worked out, credited or saved is not touched; the change tells what the
   switch already did and opens the existing list where answers are still owed. 2. The published record: **NO** — the
   switch, its rebase and its pending count are unchanged; only their sentence is reworded. 3. Saved data: **NO**.
   4. A shared drawer: **YES** — one reading now shared by two doors (the load and the switch), and four openers of the
   switch. 5. A new gesture or mode: **NO** (a new route into an existing window). 6. A new surface: **NO**. 7. Roles:
   **NO**. 8. The warning list: **NO**. → **WALK.**

## 2. The roll-call — every door that replaces a whole day, and what it now does
| Door | Says the OIL count? | The list opens, and can be reached? | What else is on the same pixels |
|---|---|---|---|
| The plans menu on Edit Schedule's day head (tap a plan) | YES — walked, desktop (P2) | YES — over the week (P2 desk) | the passing note at the foot; the list at the right |
| The plans menu on the Scheduler Board's sign strip | YES — walked, phone (P2) | YES — over the board, at the foot (P2 phone) | the note at the top of the screen |
| The plan editor's "Select" (✎ in the plans menu) | YES — walked both sizes (P3) | **MISSING in the first run** — the list opened UNDER the editor's backdrop, out of reach until "Done" (run 1, P3); **fixed**: the editor closes when the switch opens the list (test red first: `oilwait.test.tsx` "the plan editor's Select"); re-walked YES (v2 P3) | the editor's window (closed now in that case) |
| The preview's "Switch to this plan" (week and board) | the same body (`switchDraft`); NOT WALKED because it cannot be reached where this applies: a saved plan is previewed only from View-only Sched's drafts picker, which is withdrawn once a day is published, and on an unpublished day nothing is brought back (below) | — | — |
| "Load onto working copy" (the model; its reading moved into the shared body) | YES — re-walked both sizes with the last job's own walk (`ou-walk-2.mjs`: 12 of 12) | YES (L1 phone: over the board) | — |
| A day template applied; Undo / Redo of a switch | NO, because no ruling asks it: a template cannot be applied to a published day (D96), and an Undo never asks a question (D793, reading 3) — pinned: "an Undo of the switch … opens nothing more" | — | — |

**Found while building (no fault — the app's own design):** only a PUBLISHED day can be brought to this. On a day not yet
published a filed input lands by itself on whichever plan is live (pinned); on a published day a plan without the input's
row unfiles it and nothing lands it again, so the plan with the row brings it back. A request taken off by hand stays
"taken off" through a switch — the settled design of 28 Sep 26 — and Accept asks its question (pinned).

## 3. Sizing the walk (D607 — `docs/walk-ledger.md`)
1. **Type:** C (a new route into a window) and D (one reading behind several doors). 2. **What only a walk finds:** each
   opener's list actually drawn and reachable — the menu's caller redraws nothing, the editor is a window with a backdrop
   — and the note at a phone's width. The arithmetic is the load's, pinned by ON11 and ON12. 3. **The ledger:** D-type
   walks found something every time; the last OIL job's walk (14 Oct, C/D/G, medium) found the board's cancel sheet and
   the bar's width. 4. **Chosen:** the host alone, one script (`scripts/handpass/ps-walk.mjs`, 5 parts × 2 sizes) on the
   built app, real controls only (the plans menu, the plan editor, the holiday form, publishing, the list's own buttons);
   the load re-walked by its own script; the counting cases (answered, cancelled, on both plans, unpublished, two days,
   Undo, taken off by hand) carried by `oilwait.test.tsx` ON12, which drives the switch's own body. 5. **Its row:** added to
   the ledger.

## 4. The walk
- **Run 1 (desktop):** P0 PASS; P1, P2, P4 FAIL on the walk's own premise — the holiday declared after publication is a
  pending difference of its own (D2), so the counts are one higher than the script expected; the app was right. **P3 FAIL,
  real:** the list under the plan editor (picture `docs/img/handpass/2026-10-15-oil-plan-switch/P3-editor-select-week-desk.png`).
- **The fix**, then **v2 (both sizes): 10 of 10 PASS** — `docs/img/handpass/2026-10-15-oil-plan-switch/v2/`.
- **The load re-walked** (`ou-walk-2.mjs`, both sizes): 12 of 12 PASS — `…/load-rewalk/`.
- Pictures opened: P2 phone (note at the top, the list at the foot over the board), P3 desk v2 (the editor gone, the list
  in front), L1 phone (the load's note and list).

**Walk:** host, 2 sizes, `ps-walk.mjs` 10/10 PASS (v2) after one real fault found and fixed (the list under the plan
editor); `ou-walk-2.mjs` 12/12 PASS; pictures in `docs/img/handpass/2026-10-15-oil-plan-switch/`.

## 5. Gates, the read
(Filled in below as each ends.)
