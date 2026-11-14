# Code read — job 2 of the night of 14 Nov 26: a code tidy-up that claims to change nothing a person sees or does

You are one of two blind readers of finished code. Read only; change nothing, commit nothing.

**Repo:** C:\Users\User\projects\Raptor. **Branch:** `claude/code-tidy-1114`. The change under review is ONE commit,
`b04870339` (`git show b04870339`), on top of `main` (`6f47f69db`).

**What it claims:**
1. [INP-ROOM-TIDY-2] (its text is in `OUTSTANDING.md`): the input window's "room" rules — the Inputs list and the Medical tab
   narrowing to leave room for the input window while it stands where it opened, `body:has(.floatwin.inpedwin:not([data-placed]))`
   — were written five times across `06-inputs.css` and `16-medical.css`; now they are nested under one block in
   `raptor-port/src/ui/scheduler/25-inputs-calendar.css` beside `--inpwin-room`. The builder says the build flattens the nesting to
   exactly the old selectors and only their place in the file order changes, and that a computed-style capture of 11,760 elements
   in 20 states (1536x864, 1229x600, 402x874) found no difference (`raptor-port/docs/handpass/2026-11-14-inp-room-css-capture.md`).
   Also: one comment sentence moved (`ui/cutdraft.ts` / `ui/CutFields.tsx`), the Medical browser test now reads `--inpwin-room`
   instead of 430 and 16, a comment above `dragging()` in `ui/floatwin.ts` corrected.
2. [LOCATE-ITEM-MARKS]: `locate()` in `raptor-port/src/ui/sheetfocus.ts` is UNCHANGED; the item is closed with a written reason
   above it (every string-drawn control's first `data-` mark names its item, or it is the only one of its kind, or it is never
   searched for; the "→ Ground" / "→ Unavail" / "Reject" family already carries the input's `data-acck`, which `locate()` matches),
   and a new test in `ui/oilkeysback.test.tsx`.
3. [DOC-POINTERS-CODE]: comment re-points in `weekglide.ts`, `SchedBoard.tsx`, `pendlist.ts` (whose comment was corrected against
   D338 — the change history survives a reload: `grep -h '^| D338 |' .claude/decisions-full/*.md`).

**Your questions:**
- Is there any element, in any state a person can reach, whose look changes because the room rules moved? Hunt where the 20
  states could not reach: widths between and beyond the captured ones (the room's own media conditions — 1280, 1340, the phone
  breakpoint), the Medical view's other tabs, a rule in ANOTHER stylesheet that competes with a moved rule and whose winner flips
  because the file order changed (the moved rules now come at `25-…`'s place in the bundle order — check the import order), nested
  CSS the build might not flatten as claimed (check `dist` or build it), `:has()` support.
- Is the reason written above `locate()` true? Find any string-drawn control (week, board, crew panel) that opens a sheet,
  window or menu and whose FIRST `data-` attribute names an action shared by several items without the item — a control
  `locate()` could land on wrongly after a redraw. Name it concretely: which page, which two items, what Enter would then do.
- Is the new test real (would it fail if `locate()` stopped matching on the item's mark)? Was any existing test weakened?
- Is each corrected comment true now (pendlist against D338 and `engine/editlog.ts`; `dragging()` has no reader)?

**A finding counts only with:** a concrete element/control and state, what happens before and after (or what goes wrong), the
cause, and the fix — written so it could become a failing test. No finding about data already stored (the store is demo data,
cleared before the database step — D56).

**Then, separately, a tidiness note** on the changed lines only (filed, not fixed): is anything written twice, is anything left
that no longer applies, is anything harder to read than it needs to be. No size numbers.

**Report:** findings first (or "no finding"), each numbered with severity; then the tidiness note; short.
