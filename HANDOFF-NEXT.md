# HANDOFF — 23 Sep 26. `[ALL-AVAIL-WINDOW]` is BUILT, not bug-checked. The fix-and-walk is next.

**Pick the branch `claude/all-avail-window` in the new-chat picker. NOT `main`** — `main` does not
have the window. The branch is pushed; no PR is open yet (D60: pushing a branch needs no permission,
`main` needs his "merge live").

## A second session is running in PARALLEL — read before you merge

A skill-observation review runs at the same time on **`claude/skill-review`**, in its own worktree,
branched from `main`. The two never merge into each other; **each goes to `main` on his "merge live",
ONE AT A TIME**, and whichever goes SECOND brings the first in before its own merge:

1. `git fetch origin && git merge origin/main` on this branch.
2. **`.claude/skill-observations/log.md` will conflict** — the review rewrote statuses, this branch
   appended entries (#179–#182 and any since). Keep the REVIEWED version and re-append this branch's
   new entries at the end with fresh numbers (the task-observer numbering discipline). Never a
   stale-snapshot write-back.
3. `DECISIONS.md`, `HANDOFF-NEXT.md`, `OUTSTANDING.md` may conflict too: keep BOTH sides' rulings (newest
   first); the handoff and backlog must describe what is true AFTER both land.
4. Re-run the full gates on the merged tree, THEN merge. If both are ready together, tell him to say
   "merge live" in one chat, wait for it to land, then the other.

## Read these first, in this order

1. **`DECISIONS.md` — the WHOLE file** (D53). **D57–D67 are new this session**; D65, D66 and D67 change
   what you build and who reviews it.
2. **`raptor-port/docs/handpass/2026-09-23-allavail-window-fable-scenarios.md`** — Fable's scenario
   design, verbatim, with a status table in front. It is the work list.
3. **`raptor-port/docs/bug-check-order.md`** — this is FULL tier (money: the earn half switches men off).
4. `OUTSTANDING.md` `[ALL-AVAIL-WINDOW]` — the brief and the design of record (D38–D41).

## Where it started

The owner asked for `[ALL-AVAIL-WINDOW]` built to the approved mock, FULL tier. Mid-session he had the
then-public repo checked for what a stranger could read: the unit branding came out and he made the
repo private (merged live, D57–D61). He then had Opus 5.5 (released 22 Sep 26) researched against
Fable 5.1 and adopted a new model workflow (D67).

## Shipped

- **Branding removal + the Pages publish switched off** — merged to `main` (fast-forward `6efa6839`),
  on Vercel. His look was waived (D61). Nothing else is merged.

## On the branch, not merged

| Commit | What |
|---|---|
| `7735dc82` | The window + its availability half, wired on the board AND the week; two defects the checks found (the week's tap had no test; a posted-out man crashed it) |
| `7c2953b5` | The earn half — the counter REPLACES the mode's in-row crowd; every seat kind reaches the window (tested); break tests per wire |
| `e8e88702` | `crowdClashes` in `validate.ts` — the owner's D38 debrief flag — **built, NOT wired into the window, no test yet** |
| `9f793b2c`, `62a115c9` | The country-specific aircraft type out, outside the Tracker syllabus (D63, D64) |
| `b2017e6c` | D65/D66 recorded and the window's contract updated — **not built yet** |

## PROGRESS — session of 23 Sep 26 (night), overwrite as it moves

Commits on the branch since the handoff: `32f2e36a` S1 · `735b83dd` S2 + S11 footer · `1c4a8e17`
D65 + D66 (S4 S9 S12 S13) · `e81e1fe0` S3 S5 S6 S7 S10 S14 + plan wording. Every fix red first.
**Still to do:** S8 (phone size — the inline width/height beat the ≤620px rule), S11's POSITION half
and S15 (both: the window's placement — reset on reopen, clamp on browser shrink; ResizeObserver's
first call commits a box), Fable's "next five", then items 6–8 below (walk → Fable + Astra reads →
fix → sheet). Rulings this session: **D68, D69** (read fully; condense notes at the end).
**Owner asleep; worked autonomously. Nothing merged. Branch not pushed yet this session.**

## Unfinished — in this order

1. **S1: the window paints UNDER the board** (`.availwin` z-index 150, `.schedboard` 400). Confirmed
   against the stylesheet. Fix it first: until then the earn half has no visible door and nothing can
   be walked on the board. Aim above the board and below the Sheets/modals (420+).
2. **Wire `crowdClashes` into the window's rows** (S2), with a test that plants the owner's own case:
   a sortie landing ~15:00 and an ALL AVAIL ops brief 15:20–16:20 — the man must appear FLAGGED.
3. **Build D65** (a tap selects the man everywhere with OIL Earn off; selects nothing with it on) and
   **D66** (close on page change, an Edit/View-only switch, a week change, logout).
4. **Reproduce, then fix, the rest of Fable's list** — each through the real app first, each fixed with
   a test that was red first (§7.6). S7 (no History line for a switch made in the window) and S3
   (issued list shown with today's flags) are the next most consequential.
5. **Add a browser test that touches `.availwin`.** No e2e covers the window, so S1, S8 and S15 are
   invisible to every gate today.
6. **The walk** (§7): the scripted driver `raptor-port/scripts/handpass/` (`lib.mjs`, `fixture.mjs`
   `buildSaturday`), both widths, pictures to `raptor-port/docs/img/handpass/2026-09-23-allavail-window/`,
   the sheet at `raptor-port/docs/handpass/2026-09-23-allavail-window.md`.
7. **The two code reads — Fable 5.1 AND Astra, blind to each other**, given the sheet, with the §4
   finder brief and the D56 exclusion verbatim. **Not Opus: Opus built it** (D67).
8. Fix → re-walk what the fixes touched → gates → finish the sheet → his look → his "merge live".

## Gates

- **On `7c2953b5`, all watched:** `npm test` 5727/5727 across 355 files · build OK · `tfin.js` 728/0 ·
  `rulecheck` OK · `test:e2e` 450 passed / 45 skipped / 0 failed.
- **After it, targeted runs only:** parity + validator + window tests 146/146; logic/validate/parity/
  aarinstr 100/100; `tfin.js` 728/0; `smoke:tracker` 425/0. **The full `npm test` has NOT run on
  `b2017e6c` — run it first.**
- `npm run perf` not run this session. `docsize` fails on the same three files it failed on before
  the session (`record-decisions.md`, `HANDOFF.md`, `OUTSTANDING.md`); the last two grew a few lines.
  Owned by `[DOC-TRIM]`.

## Open questions

- None blocking. D67 was recorded as ADOPTION of his confirming question ("opus 5.5 will be used to
  plan then let fable and astra review correct?"); if he says he only meant to ask, revert it.

## Pick up here

Fix S1 (the window's stacking), then wire `crowdClashes` — both before any walking.
