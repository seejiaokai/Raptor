# [WARN-HIDE-KEPT] hidden warnings — the FULL bug check (1 Oct 26)

Branch `claude/warn-hide-kept`. Rulings D469, D471, D472, D475. Plan
`docs/superpowers/plans/2026-10-01-warn-hide-kept-plan.md` (v2, both reviewers' round-1 findings folded in —
`docs/superpowers/briefs/2026-10-01-warn-hide-kept-dispositions-r1.md`). Register
`docs/superpowers/specs/2026-10-01-warn-hide-behaviour-register.md` (WH1–WH13). The picture he approved:
`docs/mock/warn-hide.html`. Method `docs/bug-check-order.md`.

## 1. The eight questions — tier FULL
| # | Question | Answer |
|---|---|---|
| 1 | earned leave | no — OIL reads the issued evidence block, never a warning or a puck's flag; nothing of it is touched |
| 2 | the published record | **YES** — each version now keeps the hides it went out with; a hide on a published day is a new pending change; the face draws by the version's own hides |
| 3 | saved data | **YES** — the boot now reads the saved hides back (it used to lose them, and the next edit erased them); the key's shape changed; `w.wo`, `w.shown` |
| 4 | a shared drawer | **YES** — the bundle every puck reads; the two lists; the count |
| 5 | a new gesture | no — the ✕ and ↺ existed; the ↺ moved from the fold onto the line |
| 6 | a new surface | no |
| 7 | roles | **YES**, to be safe — who sees the struck line (everyone), who gets the button (a scheduler, on the working copy) |
| 8 | the warning list | **YES** — its lines, its count, its colour |

## 2. The rulings walked (the rules sweep)
*(filled by the walk — §6)*

## 3. What was built, each with its test (red on the code before it, or proven by a break test — §6.4)
| What | Where | The test that names it |
|---|---|---|
| The boot reads the week's saved hides back; a sign-in no longer clears them | `state/store.ts initStore`, `state/view.ts VIEW_RESET` | `state/warnhide-kept.test.ts` (WH1, WH2 — written first, 7 of 7 red on `main`'s code), `state/view-reset.test.ts`, `state/sched-routing.test.ts` |
| One key, a rename is not a change | `engine/warnhide.ts hideKey` | `engine/warnhide.test.ts` (WH10) |
| Every mark names its warning; the bundle "as shown"; the raw one kept | `engine/validate.ts` (`marks`, `traces`, `shownOf`, `rawWarn`, `validate`) | `engine/warnhide.test.ts` (WH3, WH13); the marks guard after every validate of both suites (`src/testing/marks-guard.ts`); `engine/parity.test.ts` unchanged |
| The lists: the line struck in place, the count, the colour, every issue hidden | `ui/html.ts dayWarnHTML` / `dayInfoHTML`, `ui/board.ts boardWarnHTML`, `scheduler.css` | `ui/warnmute-week.test.ts` (WH4–WH7), `e2e/warnhide.spec.ts` (painted, both widths) |
| The readers past the maps | `html.ts exemptDeskOwn` / the exempt line's `own` / `personWarnMsgs` / `fltNoLenShown`, `state/view.ts selectPerson` / `warnFocusMap`, `state/dropflag.ts`, `engine/insights.ts`, `ui/Modals.tsx`, `ui/peek.ts` | `ui/warnhide-readers.test.tsx` (rows 4, 5, 6, 9, 14, 16, 17), `ui/fltnolen-mark.test.tsx`, `state/warnhide-published.test.ts` (the preview) |
| A published day: the version's hides, the face, the pending axis, the load, the history line | `validate.ts faceWarn` / `versionFaceWarn` / `HOOKS.issuedWarn` / `HOOKS.hideNow`, `publish.ts hidePending`, `drafts.ts loadVersionToWorkingCopy`, `ui/pendlist.ts`, `state/changelines.ts`, `undo/describe.ts` | `state/warnhide-published.test.ts` (WH7–WH9, WH11, WH12), `ui/latepub.test.tsx`, `ui/availwin.test.tsx`, `engine/schema.test.ts` |
| The week's edge | `engine/weekctx.ts dayHidesIn`, `validate.ts shownOf` (`xwk`) | `state/warnhide-published.test.ts` (WH12 — draft and published next Monday) |
